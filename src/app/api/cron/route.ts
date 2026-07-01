import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getTwitterUserClient, postTweet, postThread } from '@/lib/twitter/client'
import { generateEngagementReply } from '@/lib/ai/groq'
import { getRecentMentions, likeTweet, retweetTweet, replyToTweet } from '@/lib/twitter/client'

function verifyAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  return auth === `Bearer ${cronSecret}`
}

export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const job = searchParams.get('job') || 'scheduler'

  const supabase = await createAdminClient()

  if (job === 'scheduler') {
    return runScheduler(supabase)
  } else if (job === 'engagement') {
    return runEngagement(supabase)
  } else if (job === 'analytics') {
    return runAnalyticsSync(supabase)
  }

  return NextResponse.json({ error: 'Unknown job' }, { status: 400 })
}

async function runScheduler(supabase: Awaited<ReturnType<typeof createAdminClient>>) {
  const now = new Date()
  const window = new Date(now.getTime() + 5 * 60 * 1000)

  const { data: duePosts } = await supabase
    .from('posts')
    .select('*, twitter_accounts(*)')
    .eq('status', 'scheduled')
    .lte('scheduled_at', window.toISOString())
    .gte('scheduled_at', new Date(now.getTime() - 60 * 1000).toISOString())
    .limit(20)

  const results = { published: 0, failed: 0 }

  for (const post of duePosts || []) {
    try {
      await supabase.from('posts').update({ status: 'publishing' }).eq('id', post.id)

      const account = post.twitter_accounts as { access_token: string; access_token_secret: string | null }
      const client = getTwitterUserClient(account.access_token, account.access_token_secret || undefined)

      let tweetId: string
      if (post.post_type === 'thread' && post.thread_content?.length) {
        const tweets = [post.content, ...post.thread_content]
        const threadResults = await postThread(client, tweets)
        tweetId = threadResults[0].data.id
      } else {
        const result = await postTweet(client, post.content)
        tweetId = result.data.id
      }

      await supabase.from('posts').update({
        status: 'published',
        twitter_post_id: tweetId,
        published_at: new Date().toISOString(),
      }).eq('id', post.id)

      results.published++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      await supabase.from('posts').update({ status: 'failed', error_message: msg }).eq('id', post.id)
      results.failed++
    }
  }

  return NextResponse.json({ job: 'scheduler', ...results })
}

async function runEngagement(supabase: Awaited<ReturnType<typeof createAdminClient>>) {
  const { data: rules } = await supabase
    .from('engagement_rules')
    .select('*, twitter_accounts(*)')
    .eq('is_active', true)

  let engaged = 0

  for (const rule of rules || []) {
    try {
      const account = rule.twitter_accounts as { access_token: string; access_token_secret: string | null; twitter_user_id: string }
      const client = getTwitterUserClient(account.access_token, account.access_token_secret || undefined)

      const { data: todayActivity } = await supabase
        .from('engagement_activity')
        .select('action_type')
        .eq('user_id', rule.user_id)
        .eq('twitter_account_id', rule.twitter_account_id)
        .gte('performed_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

      const todayLikes = todayActivity?.filter((a) => a.action_type === 'like').length || 0
      const todayRTs = todayActivity?.filter((a) => a.action_type === 'retweet').length || 0
      const todayReplies = todayActivity?.filter((a) => a.action_type === 'reply').length || 0

      if (rule.auto_reply && todayReplies < rule.daily_reply_limit) {
        const mentions = await getRecentMentions(client, account.twitter_user_id, 5)
        for (const mention of mentions?.tweets || []) {
          if (todayReplies >= rule.daily_reply_limit) break
          const reply = await generateEngagementReply(mention.text, mention.author_id || '', 'friendly')
          if (reply) {
            await replyToTweet(client, mention.id, reply)
            await supabase.from('engagement_activity').insert({
              user_id: rule.user_id,
              twitter_account_id: rule.twitter_account_id,
              action_type: 'reply',
              target_tweet_id: mention.id,
              content: reply,
            })
            engaged++
          }
        }
      }
    } catch (err) {
      console.error('[Engagement Cron]', err)
    }
  }

  return NextResponse.json({ job: 'engagement', engaged })
}

async function runAnalyticsSync(supabase: Awaited<ReturnType<typeof createAdminClient>>) {
  const { data: accounts } = await supabase
    .from('twitter_accounts')
    .select('*, profiles(id)')
    .eq('is_active', true)
    .limit(50)

  let synced = 0

  for (const account of accounts || []) {
    try {
      const { error } = await supabase.from('analytics_snapshots').upsert({
        user_id: (account.profiles as { id: string }).id,
        twitter_account_id: account.id,
        snapshot_date: new Date().toISOString().split('T')[0],
        followers_count: account.followers_count,
        following_count: account.following_count,
        tweet_count: account.tweet_count,
      }, { onConflict: 'twitter_account_id,snapshot_date' })

      if (!error) synced++
    } catch (err) {
      console.error('[Analytics Sync]', err)
    }
  }

  return NextResponse.json({ job: 'analytics', synced })
}

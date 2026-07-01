import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getTwitterUserClient, postTweet, postThread } from '@/lib/twitter/client'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { postId } = await req.json()

    const { data: post } = await supabase
      .from('posts')
      .select('*, twitter_accounts(*)')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const account = post.twitter_accounts as { access_token: string; access_token_secret: string | null } | null
    if (!account) return NextResponse.json({ error: 'Twitter account not connected' }, { status: 400 })

    await supabase.from('posts').update({ status: 'publishing' }).eq('id', postId)

    const client = getTwitterUserClient(account.access_token, account.access_token_secret || undefined)

    let tweetId: string

    if (post.post_type === 'thread' && post.thread_content?.length) {
      const tweets = [post.content, ...post.thread_content]
      const results = await postThread(client, tweets)
      tweetId = results[0].data.id
    } else {
      const result = await postTweet(client, post.content)
      tweetId = result.data.id
    }

    await supabase.from('posts').update({
      status: 'published',
      twitter_post_id: tweetId,
      published_at: new Date().toISOString(),
    }).eq('id', postId)

    return NextResponse.json({ success: true, tweetId })
  } catch (error) {
    console.error('[Publish Post]', error)
    const msg = error instanceof Error ? error.message : 'Publishing failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

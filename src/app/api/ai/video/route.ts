import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateVideoScript } from '@/lib/ai/groq'
import { generateViralVideo, generateVideoFromImages, downloadVideoBuffer } from '@/lib/ai/video'
import { getTwitterUserClient, uploadVideoMedia, postTweet } from '@/lib/twitter/client'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_id')
      .eq('id', user.id)
      .single()

    if (profile?.plan_id !== 'agency') {
      return NextResponse.json({ error: 'Agency plan required' }, { status: 403 })
    }

    const { postId, prompt, style = 'dynamic' } = await req.json()

    await supabase.from('viral_video_queue').insert({
      user_id: user.id,
      post_id: postId,
      prompt,
      style,
      status: 'pending',
    })

    const { data: account } = await supabase
      .from('twitter_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!account) {
      return NextResponse.json({ error: 'No Twitter account connected' }, { status: 400 })
    }

    await supabase.from('viral_video_queue').update({ status: 'generating' }).eq('post_id', postId)
    await supabase.from('posts').update({ status: 'publishing' }).eq('id', postId)

    processVideoAsync(supabase, user.id, postId, prompt, style, account).catch(console.error)

    return NextResponse.json({
      status: 'processing',
      message: 'Video is being generated and will post automatically (usually 2-5 min)',
    })
  } catch (error) {
    console.error('[Video Generation]', error)
    return NextResponse.json({ error: 'Failed to start video generation' }, { status: 500 })
  }
}

async function processVideoAsync(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  userId: string,
  postId: string,
  prompt: string,
  style: string,
  account: { access_token: string; access_token_secret: string | null; username: string }
) {
  try {
    const { script, imagePrompts } = await generateVideoScript(prompt)

    let videoBuffer: Buffer
    let mediaType = 'video/mp4'

    try {
      const { videoUrl } = await generateViralVideo({ prompt, style: style as 'cinematic' | 'dynamic' | 'minimal' | 'energetic' })
      videoBuffer = await downloadVideoBuffer(videoUrl)
    } catch {
      const { imageUrls } = await generateVideoFromImages(imagePrompts)
      if (!imageUrls.length) throw new Error('No media generated')
      videoBuffer = await downloadVideoBuffer(imageUrls[0])
      mediaType = 'image/webp'
    }

    const client = getTwitterUserClient(account.access_token, account.access_token_secret || undefined)
    const mediaId = mediaType === 'video/mp4'
      ? await uploadVideoMedia(client, videoBuffer)
      : await (client.v1.uploadMedia(videoBuffer, { mimeType: mediaType }))

    const tweet = await postTweet(client, script.substring(0, 240), [mediaId])

    await supabase.from('posts').update({
      status: 'published',
      twitter_post_id: tweet.data.id,
      published_at: new Date().toISOString(),
    }).eq('id', postId)

    await supabase.from('viral_video_queue').update({
      status: 'posted',
      twitter_media_id: mediaId,
    }).eq('post_id', postId)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    await supabase.from('posts').update({ status: 'failed', error_message: msg }).eq('id', postId)
    await supabase.from('viral_video_queue').update({ status: 'failed', error_message: msg }).eq('post_id', postId)
  }
}

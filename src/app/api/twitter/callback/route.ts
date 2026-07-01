import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { handleOAuthCallback } from '@/lib/twitter/oauth'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const oauth_token = searchParams.get('oauth_token')
    const oauth_verifier = searchParams.get('oauth_verifier')

    if (!oauth_token || !oauth_verifier) {
      return NextResponse.redirect(new URL('/dashboard/accounts?error=missing_params', req.url))
    }

    const cookieStore = await cookies()
    const storedToken = cookieStore.get('twitter_oauth_token')?.value
    const storedSecret = cookieStore.get('twitter_oauth_token_secret')?.value

    if (!storedToken || !storedSecret || storedToken !== oauth_token) {
      return NextResponse.redirect(new URL('/dashboard/accounts?error=token_mismatch', req.url))
    }

    const { accessToken, accessSecret, user: twitterUser } = await handleOAuthCallback(
      oauth_token,
      storedSecret,
      oauth_verifier
    )

    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', req.url))

    await supabase.from('twitter_accounts').upsert({
      user_id: user.id,
      twitter_user_id: twitterUser.id,
      username: twitterUser.username,
      display_name: twitterUser.name,
      profile_image_url: twitterUser.profile_image_url,
      access_token: accessToken,
      access_token_secret: accessSecret,
      followers_count: twitterUser.public_metrics?.followers_count || 0,
      following_count: twitterUser.public_metrics?.following_count || 0,
      tweet_count: twitterUser.public_metrics?.tweet_count || 0,
      verified: twitterUser.verified || false,
      is_active: true,
    }, { onConflict: 'user_id,twitter_user_id' })

    cookieStore.delete('twitter_oauth_token')
    cookieStore.delete('twitter_oauth_token_secret')

    return NextResponse.redirect(new URL('/dashboard/accounts?connected=true', req.url))
  } catch (error) {
    console.error('[Twitter Callback]', error)
    return NextResponse.redirect(new URL('/dashboard/accounts?error=callback_failed', req.url))
  }
}

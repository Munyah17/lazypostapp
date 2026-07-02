import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { handleOAuthCallback } from '@/lib/twitter/oauth'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      const desc = searchParams.get('error_description') || errorParam
      console.error('[Twitter Callback] OAuth error:', desc)
      return NextResponse.redirect(
        new URL(`/dashboard/accounts?error=${encodeURIComponent(desc)}`, req.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=missing_params', req.url)
      )
    }

    const cookieStore = await cookies()
    const storedVerifier = cookieStore.get('twitter_oauth2_code_verifier')?.value
    const storedState   = cookieStore.get('twitter_oauth2_state')?.value

    if (!storedVerifier || !storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=state_mismatch', req.url)
      )
    }

    const { accessToken, refreshToken, expiresIn, user: twitterUser } =
      await handleOAuthCallback(code, storedVerifier)

    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', req.url))

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null

    await supabase.from('twitter_accounts').upsert({
      user_id: user.id,
      twitter_user_id: twitterUser.id,
      username: twitterUser.username,
      display_name: twitterUser.name,
      profile_image_url: twitterUser.profile_image_url ?? null,
      access_token: accessToken,
      access_token_secret: null,          // OAuth 2.0 — no secret
      refresh_token: refreshToken ?? null,
      token_expires_at: tokenExpiresAt,
      followers_count: twitterUser.public_metrics?.followers_count ?? 0,
      following_count: twitterUser.public_metrics?.following_count ?? 0,
      tweet_count: twitterUser.public_metrics?.tweet_count ?? 0,
      verified: twitterUser.verified ?? false,
      is_active: true,
    }, { onConflict: 'twitter_user_id' })

    cookieStore.delete('twitter_oauth2_code_verifier')
    cookieStore.delete('twitter_oauth2_state')

    return NextResponse.redirect(
      new URL('/dashboard/accounts?connected=true', req.url)
    )
  } catch (error) {
    console.error('[Twitter Callback]', error)
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=callback_failed', req.url)
    )
  }
}

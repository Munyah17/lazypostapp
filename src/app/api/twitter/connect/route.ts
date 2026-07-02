import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOAuthLink } from '@/lib/twitter/oauth'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', req.url))

    const { url, oauth_token, oauth_token_secret } = await getOAuthLink(user.id)

    const cookieStore = await cookies()
    cookieStore.set('twitter_oauth_token', oauth_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      path: '/',
    })
    cookieStore.set('twitter_oauth_token_secret', oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      path: '/',
    })

    return NextResponse.redirect(url)
  } catch (error) {
    console.error('[Twitter Connect]', error)

    const msg = error instanceof Error ? error.message : String(error)
    let reason = 'connect_failed'

    if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('invalid')) {
      reason = 'invalid_credentials'
    } else if (msg.includes('403') || msg.includes('Forbidden')) {
      reason = 'oauth1_not_enabled'
    } else if (msg.includes('callback') || msg.includes('callback_url')) {
      reason = 'callback_not_registered'
    } else if (msg.includes('ENOTFOUND') || msg.includes('network') || msg.includes('fetch')) {
      reason = 'network_error'
    }

    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${reason}`, req.url)
    )
  }
}

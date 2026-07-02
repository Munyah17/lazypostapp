import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOAuthLink } from '@/lib/twitter/oauth'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/login', req.url))

    const { url, codeVerifier, state } = await getOAuthLink(user.id)

    const cookieStore = await cookies()
    const opts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      path: '/',
      sameSite: 'lax' as const,
    }
    cookieStore.set('twitter_oauth2_code_verifier', codeVerifier, opts)
    cookieStore.set('twitter_oauth2_state', state, opts)

    return NextResponse.redirect(url)
  } catch (error) {
    console.error('[Twitter Connect]', error)
    const msg = error instanceof Error ? error.message : String(error)
    let reason = 'connect_failed'
    if (msg.includes('401') || msg.includes('Unauthorized')) reason = 'invalid_credentials'
    else if (msg.includes('403')) reason = 'oauth2_not_enabled'
    else if (msg.includes('ENOTFOUND') || msg.includes('network')) reason = 'network_error'
    return NextResponse.redirect(new URL(`/dashboard/accounts?error=${reason}`, req.url))
  }
}

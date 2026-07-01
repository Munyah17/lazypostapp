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
    cookieStore.set('twitter_oauth_token', oauth_token, { httpOnly: true, secure: true, maxAge: 600 })
    cookieStore.set('twitter_oauth_token_secret', oauth_token_secret, { httpOnly: true, secure: true, maxAge: 600 })

    return NextResponse.redirect(url)
  } catch (error) {
    console.error('[Twitter Connect]', error)
    return NextResponse.redirect(new URL('/dashboard/accounts?error=connect_failed', req.url))
  }
}

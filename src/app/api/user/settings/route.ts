import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('[GET /api/user/settings]', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const allowed = [
      'auto_post_enabled', 'auto_post_times', 'timezone',
      'notification_email', 'notification_browser',
      'posting_frequency', 'ai_tone', 'ai_topics',
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('[PATCH /api/user/settings]', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

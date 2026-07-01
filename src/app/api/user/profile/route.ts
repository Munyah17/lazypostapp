import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/user/profile
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, subscriptions(plan_id, status, current_period_end, billing_cycle)')
      .eq('id', user.id)
      .single()

    if (error || !profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('[GET /api/user/profile]', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PATCH /api/user/profile
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const allowed = ['full_name', 'username', 'avatar_url', 'bio', 'timezone', 'onboarding_completed']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error('[PATCH /api/user/profile]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

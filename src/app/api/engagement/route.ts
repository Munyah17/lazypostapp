import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/engagement — list engagement rules for user
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('engagement_rules')
      .select('*, twitter_accounts(id, username, display_name, profile_image_url)')
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ rules: data })
  } catch (error) {
    console.error('[GET /api/engagement]', error)
    return NextResponse.json({ error: 'Failed to fetch engagement rules' }, { status: 500 })
  }
}

// POST /api/engagement — create or update engagement rule for an account
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { twitter_account_id, ...ruleFields } = body

    if (!twitter_account_id) {
      return NextResponse.json({ error: 'twitter_account_id is required' }, { status: 400 })
    }

    // Verify the account belongs to this user
    const { data: account } = await supabase
      .from('twitter_accounts')
      .select('id')
      .eq('id', twitter_account_id)
      .eq('user_id', user.id)
      .single()

    if (!account) return NextResponse.json({ error: 'Twitter account not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('engagement_rules')
      .upsert({
        user_id: user.id,
        twitter_account_id,
        ...ruleFields,
      }, { onConflict: 'user_id,twitter_account_id' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ rule: data })
  } catch (error) {
    console.error('[POST /api/engagement]', error)
    return NextResponse.json({ error: 'Failed to save engagement rule' }, { status: 500 })
  }
}

// PATCH /api/engagement?rule_id=... — toggle active state
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ruleId = new URL(req.url).searchParams.get('rule_id')
    if (!ruleId) return NextResponse.json({ error: 'rule_id is required' }, { status: 400 })

    const body = await req.json()
    const allowed = [
      'is_active', 'auto_like', 'auto_retweet', 'auto_reply',
      'reply_templates', 'target_keywords', 'target_hashtags', 'excluded_keywords',
      'daily_like_limit', 'daily_retweet_limit', 'daily_reply_limit', 'engagement_hours',
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const { data, error } = await supabase
      .from('engagement_rules')
      .update(updates)
      .eq('id', ruleId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ rule: data })
  } catch (error) {
    console.error('[PATCH /api/engagement]', error)
    return NextResponse.json({ error: 'Failed to update engagement rule' }, { status: 500 })
  }
}

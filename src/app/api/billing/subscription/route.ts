import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/billing/subscription — current user's subscription + plan details
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .single()

    if (error || !sub) {
      // Return a synthetic free subscription if none exists
      const { data: freePlan } = await supabase.from('plans').select('*').eq('id', 'free').single()
      return NextResponse.json({
        subscription: {
          plan_id: 'free',
          status: 'active',
          billing_cycle: 'monthly',
          cancel_at_period_end: false,
          plans: freePlan,
        }
      })
    }

    return NextResponse.json({ subscription: sub })
  } catch (error) {
    console.error('[GET /api/billing/subscription]', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

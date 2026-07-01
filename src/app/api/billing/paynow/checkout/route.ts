import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaynowSession } from '@/lib/payments/paynow'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId, billingCycle, phone } = await req.json()

    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single()
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const amount = billingCycle === 'yearly' ? plan.price_yearly_zwg : plan.price_monthly_zwg
    if (!amount) return NextResponse.json({ error: 'Plan has no ZWG pricing' }, { status: 400 })

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL!
    const reference = `LP-${user.id.slice(0, 8)}-${Date.now()}`

    const result = await createPaynowSession({
      reference,
      amount,
      email: user.email!,
      phone,
      info: `LazyPost ${plan.name} Plan (${billingCycle})`,
      returnUrl: `${origin}/dashboard/billing?payment=success`,
      resultUrl: `${process.env.PAYNOW_RESULT_URL || origin + '/api/billing/paynow/callback'}`,
    })

    if (result.status !== 'Ok' || !result.browserurl) {
      return NextResponse.json({ error: result.error || 'PayNow session failed' }, { status: 400 })
    }

    const { data: transaction } = await supabase.from('payment_transactions').insert({
      user_id: user.id,
      plan_id: planId,
      amount,
      currency: 'ZWG',
      payment_provider: 'paynow',
      provider_session_id: reference,
      status: 'pending',
      billing_cycle: billingCycle,
      metadata: { poll_url: result.pollurl },
    }).select().single()

    return NextResponse.json({ url: result.browserurl, pollUrl: result.pollurl })
  } catch (error) {
    console.error('[PayNow Checkout]', error)
    return NextResponse.json({ error: 'Failed to create PayNow session' }, { status: 500 })
  }
}

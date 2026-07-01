import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/payments/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId, billingCycle } = await req.json()

    if (!planId || !billingCycle) {
      return NextResponse.json({ error: 'planId and billingCycle required' }, { status: 400 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL!

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      planId,
      billingCycle,
      successUrl: `${origin}/dashboard/billing?success=true`,
      cancelUrl: `${origin}/dashboard/billing`,
    })

    await supabase.from('payment_transactions').insert({
      user_id: user.id,
      plan_id: planId,
      amount: 0,
      currency: 'usd',
      payment_provider: 'stripe',
      provider_session_id: session.id,
      status: 'pending',
      billing_cycle: billingCycle,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe Checkout]', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

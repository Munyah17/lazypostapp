import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { constructWebhookEvent, stripe } from '@/lib/payments/stripe'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id
        const billingCycle = session.metadata?.billing_cycle

        if (!userId || !planId) break

        const subscription = session.subscription
          ? await stripe.subscriptions.retrieve(session.subscription as string)
          : null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subAny = subscription as any

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          stripe_subscription_id: subscription?.id,
          stripe_customer_id: session.customer as string,
          billing_cycle: billingCycle,
          current_period_start: subAny?.current_period_start ? new Date(subAny.current_period_start * 1000).toISOString() : null,
          current_period_end: subAny?.current_period_end ? new Date(subAny.current_period_end * 1000).toISOString() : null,
        }, { onConflict: 'user_id' })

        await supabase.from('profiles').update({ plan_id: planId }).eq('id', userId)

        await supabase.from('payment_transactions').update({
          status: 'completed',
          provider_session_id: session.id,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
        }).eq('provider_session_id', session.id)

        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id
        if (!userId) break

        const planId = sub.items.data[0]?.price.lookup_key || sub.metadata?.plan_id

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subAny2 = sub as any
        await supabase.from('subscriptions').update({
          status: sub.status as 'active' | 'canceled' | 'past_due',
          current_period_start: subAny2.current_period_start ? new Date(subAny2.current_period_start * 1000).toISOString() : null,
          current_period_end: subAny2.current_period_end ? new Date(subAny2.current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
        }).eq('stripe_subscription_id', sub.id)

        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id)

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', sub.id)
          .single()

        if (subscription) {
          await supabase.from('profiles').update({ plan_id: 'free' }).eq('id', subscription.user_id)
        }
        break
      }

      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        if (invoice.subscription) {
          await supabase.from('subscriptions').update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription as string)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

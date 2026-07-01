import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyPaynowCallback } from '@/lib/payments/paynow'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const fields: Record<string, string> = {}
    for (const pair of body.split('&')) {
      const [k, v] = pair.split('=')
      if (k && v) fields[decodeURIComponent(k)] = decodeURIComponent(v)
    }

    if (!verifyPaynowCallback(fields)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { status, reference, paynowreference, amount } = fields

    if (!reference) return NextResponse.json({ ok: true })

    const supabase = await createAdminClient()

    const { data: transaction } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('provider_session_id', reference)
      .single()

    if (!transaction) return NextResponse.json({ ok: true })

    const isPaid = status === 'Paid' || status === 'Awaiting Delivery'

    await supabase.from('payment_transactions').update({
      status: isPaid ? 'completed' : 'failed',
      provider_transaction_id: paynowreference,
    }).eq('provider_session_id', reference)

    if (isPaid) {
      await supabase.from('profiles').update({ plan_id: transaction.plan_id }).eq('id', transaction.user_id)

      const now = new Date()
      const end = new Date(now)
      if (transaction.billing_cycle === 'yearly') {
        end.setFullYear(end.getFullYear() + 1)
      } else {
        end.setMonth(end.getMonth() + 1)
      }

      await supabase.from('subscriptions').upsert({
        user_id: transaction.user_id,
        plan_id: transaction.plan_id,
        status: 'active',
        billing_cycle: transaction.billing_cycle,
        current_period_start: now.toISOString(),
        current_period_end: end.toISOString(),
      }, { onConflict: 'user_id' })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[PayNow Callback]', error)
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 })
  }
}

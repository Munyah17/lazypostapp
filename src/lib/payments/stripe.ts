import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
  typescript: true,
})

const PRICE_IDS: Record<string, Record<string, string>> = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID!,
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  },
  agency: {
    monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_AGENCY_YEARLY_PRICE_ID!,
  },
}

export interface CreateCheckoutOptions {
  userId: string
  userEmail: string
  planId: string
  billingCycle: 'monthly' | 'yearly'
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(options: CreateCheckoutOptions) {
  const { userId, userEmail, planId, billingCycle, successUrl, cancelUrl } = options

  const priceId = PRICE_IDS[planId]?.[billingCycle]
  if (!priceId) throw new Error(`No Stripe price ID for plan: ${planId} / ${billingCycle}`)

  let customerId: string | undefined

  const customers = await stripe.customers.list({ email: userEmail, limit: 1 })
  if (customers.data.length > 0) {
    customerId = customers.data[0].id
  } else {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { user_id: userId },
    })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { user_id: userId, plan_id: planId, billing_cycle: billingCycle },
    subscription_data: {
      trial_period_days: planId === 'starter' ? 7 : undefined,
      metadata: { user_id: userId, plan_id: planId },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_update: { address: 'auto' },
  })

  return session
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

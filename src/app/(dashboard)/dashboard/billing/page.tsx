'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Plan, Subscription } from '@/types/database'
import { Check, CreditCard, Zap, ArrowRight, ExternalLink } from 'lucide-react'

export default function BillingPage() {
  const supabase = createClient()
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [currentPlanId, setCurrentPlanId] = useState('free')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [currency, setCurrency] = useState<'usd' | 'zwg'>('usd')
  const [loading, setLoading] = useState<string | null>(null)
  const [phone, setPhone] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [plansRes, profileRes, subRes] = await Promise.all([
        supabase.from('plans').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('profiles').select('plan_id').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
      ])

      if (plansRes.data) setPlans(plansRes.data as Plan[])
      if (profileRes.data) setCurrentPlanId(profileRes.data.plan_id)
      if (subRes.data) setSubscription(subRes.data as Subscription)
    }
    load()
  }, [])

  const handleStripeCheckout = async (planId: string) => {
    setLoading(planId + '-stripe')
    try {
      const res = await fetch('/api/billing/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'Checkout failed')
    } catch {
      toast.error('Failed to start checkout.')
    } finally {
      setLoading(null)
    }
  }

  const handlePaynowCheckout = async (planId: string) => {
    setLoading(planId + '-paynow')
    try {
      const res = await fetch('/api/billing/paynow/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle, phone }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'PayNow session failed')
    } catch {
      toast.error('Failed to start PayNow checkout.')
    } finally {
      setLoading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/billing/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      toast.error('Failed to open billing portal.')
    }
  }

  const getPrice = (plan: Plan) => {
    if (currency === 'zwg') {
      return billingCycle === 'yearly' ? plan.price_yearly_zwg : plan.price_monthly_zwg
    }
    return billingCycle === 'yearly' ? plan.price_yearly_usd : plan.price_monthly_usd
  }

  const currencySymbol = currency === 'usd' ? '$' : 'ZWG '
  const isCurrent = (planId: string) => planId === currentPlanId

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">Billing & Plans</h1>
        <p className="text-sm text-[#8a9bb0] mt-1">Manage your subscription and payment methods</p>
      </div>

      {/* Current subscription */}
      {subscription && subscription.status === 'active' && (
        <Card className="border-indigo-500/30 bg-indigo-900/5">
          <CardContent className="pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold font-[family-name:var(--font-display)]">
                    {currentPlanId.charAt(0).toUpperCase() + currentPlanId.slice(1)} Plan · Active
                  </span>
                  <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
                </div>
                <p className="text-sm text-[#8a9bb0]">
                  Renews {new Date(subscription.current_period_end || '').toLocaleDateString()}
                  {subscription.cancel_at_period_end && ' · Cancels at period end'}
                </p>
              </div>
              {subscription.stripe_customer_id && (
                <Button variant="secondary" size="sm" onClick={handleManageBilling}>
                  <ExternalLink className="w-4 h-4" /> Manage Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-[#13181f] text-[#8a9bb0] border border-[#1e2a3a]'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white' : 'bg-[#13181f] text-[#8a9bb0] border border-[#1e2a3a]'}`}
          >
            Yearly <span className="text-green-400 text-xs ml-1">-20%</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrency('usd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-mono)] transition-all ${currency === 'usd' ? 'bg-indigo-600 text-white' : 'bg-[#13181f] text-[#8a9bb0] border border-[#1e2a3a]'}`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency('zwg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-mono)] transition-all ${currency === 'zwg' ? 'bg-green-600 text-white' : 'bg-[#13181f] text-[#8a9bb0] border border-[#1e2a3a]'}`}
          >
            ZWG 🇿🇼
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const price = getPrice(plan)
          return (
            <Card
              key={plan.id}
              className={`flex flex-col card-hover relative ${
                plan.id === 'pro' ? 'border-indigo-500/60 glow-accent' : ''
              } ${isCurrent(plan.id) ? 'border-green-500/40' : ''}`}
            >
              {plan.id === 'pro' && !isCurrent(plan.id) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="text-[10px]">Most Popular</Badge>
                </div>
              )}
              {isCurrent(plan.id) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success" className="text-[10px]">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="pb-2">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <p className="text-xs text-[#8a9bb0]">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex flex-col flex-1">
                <div className="mb-4">
                  <div className="text-2xl font-bold font-[family-name:var(--font-display)]">
                    {price === 0 ? 'Free' : `${currencySymbol}${price}`}
                  </div>
                  {price > 0 && <span className="text-xs text-[#4a5568]">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>}
                </div>

                <ul className="space-y-2 flex-1 mb-4">
                  {(plan.features as string[]).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs">
                      <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-[#8a9bb0]">{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent(plan.id) ? (
                  <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
                ) : plan.id === 'free' ? (
                  <Button variant="outline" className="w-full" disabled>Free Tier</Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => handleStripeCheckout(plan.id)}
                      loading={loading === plan.id + '-stripe'}
                      size="sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay with Card
                    </Button>
                    {currency === 'zwg' && price > 0 && (
                      <Button
                        variant="secondary"
                        className="w-full border-green-500/30 text-green-400 hover:bg-green-900/20"
                        onClick={() => handlePaynowCheckout(plan.id)}
                        loading={loading === plan.id + '-paynow'}
                        size="sm"
                      >
                        🇿🇼 Pay with PayNow
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* PayNow phone field */}
      {currency === 'zwg' && (
        <Card>
          <CardContent className="pt-4">
            <label className="text-xs text-[#8a9bb0] mb-2 block font-[family-name:var(--font-mono)]">
              MOBILE NUMBER (for PayNow Ecocash/InnBucks)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0771234567"
              className="h-10 w-full max-w-xs rounded-xl border border-[#1e2a3a] bg-[#0d1117] px-4 text-sm text-[#f0f4f8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-[#4a5568] mt-2">
              You will be redirected to PayNow&apos;s secure hosted checkout page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Security notice */}
      <div className="p-4 rounded-2xl border border-[#1e2a3a] bg-[#13181f] text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">
        🔒 All payments are handled securely by Stripe (card) or PayNow (mobile money). LazyPost never collects or stores your payment details.
      </div>
    </div>
  )
}

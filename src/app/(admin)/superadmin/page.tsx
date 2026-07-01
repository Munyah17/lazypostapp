import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatNumber } from '@/lib/utils'
import { Users, CreditCard, BarChart3, Zap, Shield } from 'lucide-react'
import { XIcon } from '@/components/ui/x-icon'

export const metadata = { title: 'Super Admin' }

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null }
  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const [usersRes, subsRes, postsRes, accountsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('subscriptions').select('*, profiles(email, full_name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('posts').select('id, status, created_at').order('created_at', { ascending: false }).limit(1000),
    supabase.from('twitter_accounts').select('id').limit(1000),
  ])

  type AnyRecord = Record<string, unknown>
  const users = (usersRes.data || []) as AnyRecord[]
  const subs = (subsRes.data || []) as AnyRecord[]
  const posts = (postsRes.data || []) as AnyRecord[]
  const twitterAccounts = (accountsRes.data || []) as AnyRecord[]

  const planCounts: Record<string, number> = {}
  for (const u of users) {
    const plan = (u.plan_id as string) || 'free'
    planCounts[plan] = (planCounts[plan] || 0) + 1
  }

  const activeSubs = subs.filter((s) => s.status === 'active').length

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Active Subscriptions', value: activeSubs, icon: CreditCard, color: 'text-green-400', bg: 'bg-green-900/20' },
    { label: 'Total Posts', value: posts.length, icon: BarChart3, color: 'text-violet-400', bg: 'bg-violet-900/20' },
    { label: 'X Accounts', value: twitterAccounts.length, icon: XIcon, color: 'text-[#1d9bf0]', bg: 'bg-blue-900/20' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-900/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Super Admin</h1>
          <p className="text-sm text-[#8a9bb0]">Platform-wide oversight and management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold font-[family-name:var(--font-display)]">{formatNumber(stat.value)}</div>
            <div className="text-xs text-[#8a9bb0] font-[family-name:var(--font-mono)]">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Plan Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(planCounts).map(([plan, count]) => (
                <div key={plan} className="flex items-center gap-3">
                  <span className="text-sm capitalize w-16 font-[family-name:var(--font-display)]">{plan}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#1e2a3a] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${(count / users.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-[family-name:var(--font-mono)] text-[#8a9bb0] w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent subscriptions */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Subscriptions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {subs.slice(0, 6).map((sub) => {
              const subId = sub.id as string
              const subPlanId = sub.plan_id as string
              const billingCycle = sub.billing_cycle as string
              const status = sub.status as string
              const prof = sub.profiles as { email: string; full_name: string } | null
              return (
                <div key={subId} className="flex items-center gap-3 p-2 rounded-xl bg-[#13181f]">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{prof?.full_name || prof?.email}</div>
                    <div className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">{subPlanId} · {billingCycle}</div>
                  </div>
                  <Badge variant={status === 'active' ? 'success' : 'secondary'} className="text-[10px]">{status}</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader><CardTitle className="text-base">All Users ({users.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a3a]">
                {['Name', 'Email', 'Role', 'Plan', 'Joined'].map((h) => (
                  <th key={h} className="text-left pb-3 text-xs text-[#4a5568] font-[family-name:var(--font-mono)] font-normal pr-4">{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const uid = u.id as string
                const fullName = u.full_name as string | null
                const email = u.email as string
                const role = u.role as string
                const planId = u.plan_id as string
                const createdAt = u.created_at as string
                return (
                  <tr key={uid} className="border-b border-[#1e2a3a]/50 hover:bg-[#13181f] transition-colors">
                    <td className="py-2.5 pr-4 font-medium">{fullName || '—'}</td>
                    <td className="py-2.5 pr-4 text-[#8a9bb0] font-[family-name:var(--font-mono)] text-xs">{email}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={role === 'super_admin' ? 'warning' : role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">{role}</Badge>
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant="secondary" className="text-[10px]">{planId}</Badge>
                    </td>
                    <td className="py-2.5 text-[#4a5568] font-[family-name:var(--font-mono)] text-xs">{formatDate(createdAt, 'MMM d, yyyy')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

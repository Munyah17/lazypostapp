import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatNumber } from '@/lib/utils'
import { Users, BarChart3, FileText, AlertCircle, Shield } from 'lucide-react'

export const metadata = { title: 'Admin Panel' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) redirect('/dashboard')

  const [usersRes, postsRes, failedPostsRes] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, plan_id, role, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('posts').select('id, status, created_at').limit(500),
    supabase.from('posts').select('id, content, error_message, created_at, user_id').eq('status', 'failed').order('created_at', { ascending: false }).limit(20),
  ])

  type AnyRecord = Record<string, unknown>
  const users = (usersRes.data || []) as AnyRecord[]
  const posts = (postsRes.data || []) as AnyRecord[]
  const failedPosts = (failedPostsRes.data || []) as AnyRecord[]

  const publishedPosts = posts.filter((p) => p.status === 'published').length
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length
  const draftPosts = posts.filter((p) => p.status === 'draft').length

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Published Posts', value: publishedPosts, icon: BarChart3, color: 'text-green-400', bg: 'bg-green-900/20' },
    { label: 'Scheduled', value: scheduledPosts, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
    { label: 'Failed Posts', value: failedPosts.length, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-900/20' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-900/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Admin Panel</h1>
          <p className="text-sm text-[#8a9bb0]">Manage users and platform activity</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent users */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Users ({users.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {users.slice(0, 8).map((u) => {
              const uid = u.id as string
              const fullName = u.full_name as string | null
              const email = u.email as string
              const role = u.role as string
              const planId = u.plan_id as string
              const createdAt = u.created_at as string
              return (
                <div key={uid} className="flex items-center gap-3 p-2 rounded-xl bg-[#13181f]">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{fullName || email}</div>
                    <div className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)] truncate">{email}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={role === 'admin' || role === 'super_admin' ? 'default' : 'secondary'} className="text-[10px]">{role}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{planId}</Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Failed posts */}
        <Card>
          <CardHeader><CardTitle className="text-base">Failed Posts ({failedPosts.length})</CardTitle></CardHeader>
          <CardContent>
            {failedPosts.length === 0 ? (
              <div className="text-center py-8 text-[#4a5568]">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No failed posts. All good!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {failedPosts.slice(0, 6).map((p) => {
                  const pid = p.id as string
                  const content = p.content as string
                  const errorMsg = p.error_message as string | null
                  const createdAt = p.created_at as string
                  return (
                    <div key={pid} className="p-2 rounded-xl bg-red-900/10 border border-red-500/20">
                      <p className="text-xs text-[#f0f4f8] line-clamp-1">{content}</p>
                      {errorMsg && <p className="text-xs text-red-400 mt-0.5">{errorMsg}</p>}
                      <p className="text-[10px] text-[#4a5568] mt-1 font-[family-name:var(--font-mono)]">{formatDate(createdAt)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Post status overview */}
      <Card>
        <CardHeader><CardTitle className="text-base">Post Status Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Published', value: publishedPosts, color: 'bg-green-500' },
              { label: 'Scheduled', value: scheduledPosts, color: 'bg-indigo-500' },
              { label: 'Drafts', value: draftPosts, color: 'bg-[#4a5568]' },
              { label: 'Failed', value: failedPosts.length, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-[#13181f]">
                <div className={`w-2 h-2 rounded-full ${item.color} mx-auto mb-2`} />
                <div className="text-xl font-bold font-[family-name:var(--font-display)]">{formatNumber(item.value)}</div>
                <div className="text-xs text-[#8a9bb0] font-[family-name:var(--font-mono)]">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

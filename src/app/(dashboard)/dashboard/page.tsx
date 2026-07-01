import { createClient } from '@/lib/supabase/server'
import { formatNumber, formatDate, PLAN_BADGES } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  TrendingUp, Calendar, Sparkles, Users, Eye, Heart,
  Repeat2, MessageCircle, Plus, ArrowRight, Zap
} from 'lucide-react'
import { XIcon } from '@/components/ui/x-icon'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, postsResult, accountsResult, analyticsResult] = await Promise.all([
    supabase.from('profiles').select('*, user_settings(*)').eq('id', user!.id).single(),
    supabase.from('posts').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('twitter_accounts').select('*').eq('user_id', user!.id).eq('is_active', true),
    supabase.from('analytics_snapshots').select('*').eq('user_id', user!.id).order('snapshot_date', { ascending: false }).limit(14),
  ])

  const profile = profileResult.data
  const posts = postsResult.data || []
  const accounts = accountsResult.data || []
  const analytics = analyticsResult.data || []

  const latestAnalytics = analytics[0]
  const prevAnalytics = analytics[7]

  const followerGrowth = latestAnalytics && prevAnalytics
    ? latestAnalytics.followers_count - prevAnalytics.followers_count
    : 0

  const totalPosts = posts.filter((p) => p.status === 'published').length
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length

  const planBadge = PLAN_BADGES[profile?.plan_id || 'free']

  const stats = [
    {
      label: 'Followers',
      value: formatNumber(latestAnalytics?.followers_count || 0),
      change: followerGrowth > 0 ? `+${formatNumber(followerGrowth)}` : null,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
    },
    {
      label: 'Impressions (7d)',
      value: formatNumber(analytics.slice(0, 7).reduce((s, a) => s + a.impressions, 0)),
      icon: Eye,
      color: 'text-violet-400',
      bg: 'bg-violet-900/20',
    },
    {
      label: 'Scheduled Posts',
      value: scheduledPosts.toString(),
      icon: Calendar,
      color: 'text-indigo-400',
      bg: 'bg-indigo-900/20',
    },
    {
      label: 'Published (7d)',
      value: totalPosts.toString(),
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-[#8a9bb0] mt-1">Here&apos;s what&apos;s happening with your accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-xs font-[family-name:var(--font-mono)] px-2.5 py-1 rounded-full ${planBadge}`}>
            {(profile?.plan_id || 'free').toUpperCase()} PLAN
          </div>
          <Link href="/dashboard/posts/new">
            <Button size="sm">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* No Twitter account warning */}
      {accounts.length === 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-900/10">
          <div className="w-10 h-10 rounded-xl bg-amber-900/30 flex items-center justify-center shrink-0">
            <XIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-300 font-[family-name:var(--font-display)]">Connect your Twitter/X account</p>
            <p className="text-sm text-[#8a9bb0] mt-0.5">Link your account to start scheduling and auto-posting.</p>
          </div>
          <Link href="/dashboard/accounts">
            <Button variant="amber" size="sm" className="shrink-0">Connect Now</Button>
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 sm:p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              {stat.change && (
                <Badge variant="success" className="text-[10px]">{stat.change} 7d</Badge>
              )}
            </div>
            <div className="text-2xl font-bold font-[family-name:var(--font-display)]">{stat.value}</div>
            <div className="text-xs text-[#8a9bb0] mt-0.5 font-[family-name:var(--font-mono)]">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Recent posts + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent posts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Posts</CardTitle>
              <Link href="/dashboard/posts">
                <Button variant="ghost" size="sm" className="text-xs">View all <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-10 text-[#4a5568]">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No posts yet.</p>
                <Link href="/dashboard/posts/new">
                  <Button size="sm" className="mt-3">Create your first post</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#13181f] hover:bg-[#1a2130] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f0f4f8] line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge
                          variant={
                            post.status === 'published' ? 'success' :
                            post.status === 'scheduled' ? 'default' :
                            post.status === 'failed' ? 'destructive' : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {post.status}
                        </Badge>
                        {post.scheduled_at && (
                          <span className="text-[10px] text-[#4a5568] font-[family-name:var(--font-mono)]">
                            {formatDate(post.scheduled_at, 'MMM d, HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                    {post.status === 'published' && (
                      <div className="flex items-center gap-3 shrink-0 text-[#4a5568]">
                        <div className="flex items-center gap-1 text-xs">
                          <Heart className="w-3 h-3" />
                          <span className="font-[family-name:var(--font-mono)]">{post.engagement_stats?.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Repeat2 className="w-3 h-3" />
                          <span className="font-[family-name:var(--font-mono)]">{post.engagement_stats?.retweets || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: '/dashboard/posts/new', icon: Plus, label: 'Write a post', desc: 'Compose & schedule' },
              { href: '/dashboard/generate', icon: Sparkles, label: 'AI Generate', desc: 'Let AI write for you' },
              { href: '/dashboard/viral', icon: Zap, label: 'Viral Optimizer', desc: 'Maximize reach' },
              { href: '/dashboard/schedule', icon: Calendar, label: 'View Schedule', desc: 'Calendar view' },
              { href: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics', desc: 'See your growth' },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#13181f] transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <action.icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#f0f4f8]">{action.label}</div>
                    <div className="text-xs text-[#4a5568]">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#4a5568] group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Connected accounts */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Connected Accounts</CardTitle>
              <Link href="/dashboard/accounts">
                <Button variant="ghost" size="sm" className="text-xs">Manage <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#13181f]">
                  {account.profile_image_url ? (
                    <img src={account.profile_image_url} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1d9bf0]/20 flex items-center justify-center">
                      <XIcon className="w-5 h-5 text-[#1d9bf0]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">@{account.username}</div>
                    <div className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">
                      {formatNumber(account.followers_count)} followers
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatDate } from '@/lib/utils'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import { TrendingUp, Users, Eye, Heart, Repeat2 } from 'lucide-react'
import type { AnalyticsSnapshot, Post, TwitterAccount } from '@/types/database'

export const metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [snapshotsRes, postsRes, accountsRes] = await Promise.all([
    supabase.from('analytics_snapshots').select('*').eq('user_id', user!.id)
      .order('snapshot_date', { ascending: false }).limit(30),
    supabase.from('posts').select('*').eq('user_id', user!.id)
      .eq('status', 'published').order('published_at', { ascending: false }).limit(20),
    supabase.from('twitter_accounts').select('*').eq('user_id', user!.id).eq('is_active', true),
  ])

  const snapshots = (snapshotsRes.data || []) as AnalyticsSnapshot[]
  const posts = (postsRes.data || []) as Post[]
  const accounts = (accountsRes.data || []) as TwitterAccount[]

  const latest = snapshots[0]
  const week = snapshots.slice(0, 7)
  const prevWeek = snapshots.slice(7, 14)

  const weekMetrics = {
    impressions: week.reduce((s, d) => s + d.impressions, 0),
    followers: (week[0]?.followers_count || 0) - (week[6]?.followers_count || 0),
    likes: posts.reduce((s, p) => s + (p.engagement_stats?.likes || 0), 0),
    retweets: posts.reduce((s, p) => s + (p.engagement_stats?.retweets || 0), 0),
  }

  const topPosts = [...posts]
    .sort((a, b) => (b.engagement_stats?.impressions || 0) - (a.engagement_stats?.impressions || 0))
    .slice(0, 5)

  const avgEngagementRate = posts.length
    ? posts.reduce((s, p) => {
        const likes = p.engagement_stats?.likes || 0
        const rt = p.engagement_stats?.retweets || 0
        const imp = p.engagement_stats?.impressions || 1
        return s + ((likes + rt) / imp) * 100
      }, 0) / posts.length
    : 0

  const statCards = [
    { label: 'Followers', value: formatNumber(latest?.followers_count || 0), change: weekMetrics.followers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Impressions (7d)', value: formatNumber(weekMetrics.impressions), icon: Eye, color: 'text-violet-400', bg: 'bg-violet-900/20' },
    { label: 'Likes (published)', value: formatNumber(weekMetrics.likes), icon: Heart, color: 'text-pink-400', bg: 'bg-pink-900/20' },
    { label: 'Avg Engagement', value: `${avgEngagementRate.toFixed(2)}%`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-900/20' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">Analytics</h1>
        <p className="text-sm text-[#8a9bb0] mt-1">Track your growth and content performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4 sm:p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              {stat.change !== undefined && stat.change !== 0 && (
                <Badge variant={stat.change > 0 ? 'success' : 'destructive'} className="text-[10px]">
                  {stat.change > 0 ? '+' : ''}{formatNumber(stat.change)}
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold font-[family-name:var(--font-display)]">{stat.value}</div>
            <div className="text-xs text-[#8a9bb0] mt-0.5 font-[family-name:var(--font-mono)]">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {snapshots.length > 0 && (
        <AnalyticsCharts snapshots={snapshots.slice().reverse()} />
      )}

      {/* Top posts */}
      {topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPosts.map((post, i) => (
              <div key={post.id} className="flex items-start gap-4 p-3 rounded-xl bg-[#13181f] hover:bg-[#1a2130] transition-colors">
                <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-[#4a5568] shrink-0 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f0f4f8] line-clamp-2">{post.content}</p>
                  <p className="text-xs text-[#4a5568] mt-1 font-[family-name:var(--font-mono)]">
                    {post.published_at ? formatDate(post.published_at, 'MMM d, yyyy') : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-xs text-[#8a9bb0]">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span className="font-[family-name:var(--font-mono)]">{formatNumber(post.engagement_stats?.impressions || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-400" />
                    <span className="font-[family-name:var(--font-mono)]">{formatNumber(post.engagement_stats?.likes || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1 hidden sm:flex">
                    <Repeat2 className="w-3 h-3 text-green-400" />
                    <span className="font-[family-name:var(--font-mono)]">{formatNumber(post.engagement_stats?.retweets || 0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {snapshots.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 text-[#1e2a3a] mx-auto mb-4" />
            <p className="text-[#4a5568]">Analytics data will appear once your account syncs.</p>
            <p className="text-xs text-[#4a5568] mt-1">Connect your Twitter account and data syncs daily.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

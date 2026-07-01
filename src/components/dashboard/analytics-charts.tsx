'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'
import type { AnalyticsSnapshot } from '@/types/database'
import { format } from 'date-fns'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#13181f] border border-[#1e2a3a] rounded-xl p-3 text-xs shadow-xl">
        <p className="text-[#8a9bb0] mb-1 font-[family-name:var(--font-mono)]">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium font-[family-name:var(--font-mono)]">
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AnalyticsCharts({ snapshots }: { snapshots: AnalyticsSnapshot[] }) {
  const chartData = snapshots.map((s) => ({
    date: format(new Date(s.snapshot_date), 'MMM d'),
    followers: s.followers_count,
    impressions: s.impressions,
    likes: s.likes_received,
    retweets: s.retweets_received,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Follower Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="followersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4a5568', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#4a5568', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="followers" name="Followers" stroke="#6366f1" fill="url(#followersGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Impressions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="impressionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4a5568', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#4a5568', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#8b5cf6" fill="url(#impressionsGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

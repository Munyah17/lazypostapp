import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate, truncate } from '@/lib/utils'
import { Calendar, Plus, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday } from 'date-fns'

export const metadata = { title: 'Schedule' }

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const { data: scheduledPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user!.id)
    .in('status', ['scheduled', 'published'])
    .gte('scheduled_at', monthStart.toISOString())
    .lte('scheduled_at', monthEnd.toISOString())
    .order('scheduled_at', { ascending: true })

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfWeek = monthStart.getDay()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">Schedule</h1>
          <p className="text-sm text-[#8a9bb0] mt-1">{format(now, 'MMMM yyyy')} · {scheduledPosts?.length || 0} posts scheduled</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button size="sm"><Plus className="w-4 h-4" /> Schedule Post</Button>
        </Link>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="pt-5 overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs text-[#4a5568] font-[family-name:var(--font-mono)] py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before month start */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-20" />
              ))}

              {days.map((day) => {
                const dayPosts = scheduledPosts?.filter((p) =>
                  p.scheduled_at && isSameDay(parseISO(p.scheduled_at), day)
                ) || []
                const today = isToday(day)

                return (
                  <div
                    key={day.toISOString()}
                    className={`h-16 sm:h-20 rounded-xl border p-1.5 flex flex-col transition-colors ${
                      today ? 'border-indigo-500/60 bg-indigo-900/10' : 'border-[#1e2a3a] hover:border-[#2a3a50]'
                    }`}
                  >
                    <span className={`text-xs font-[family-name:var(--font-mono)] ${today ? 'text-indigo-400 font-bold' : 'text-[#4a5568]'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex-1 overflow-hidden space-y-0.5 mt-0.5">
                      {dayPosts.slice(0, 2).map((post) => (
                        <Link key={post.id} href={`/dashboard/posts`}>
                          <div className={`text-[9px] px-1 py-0.5 rounded truncate cursor-pointer ${
                            post.status === 'published' ? 'bg-green-900/50 text-green-300' : 'bg-indigo-900/50 text-indigo-300'
                          }`}>
                            {format(parseISO(post.scheduled_at!), 'HH:mm')} · {post.content.substring(0, 15)}...
                          </div>
                        </Link>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-[9px] text-[#4a5568] text-center font-[family-name:var(--font-mono)]">+{dayPosts.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming posts list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> Upcoming Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledPosts?.filter((p) => p.status === 'scheduled').length === 0 ? (
            <div className="text-center py-8 text-[#4a5568]">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No posts scheduled for this month.</p>
              <Link href="/dashboard/posts/new">
                <Button size="sm" className="mt-3">Schedule a Post</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledPosts?.filter((p) => p.status === 'scheduled').map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#13181f]">
                  <div className="text-xs font-[family-name:var(--font-mono)] text-indigo-400 shrink-0 mt-0.5 text-right w-14">
                    <div>{post.scheduled_at ? format(parseISO(post.scheduled_at), 'MMM d') : ''}</div>
                    <div className="text-[#4a5568]">{post.scheduled_at ? format(parseISO(post.scheduled_at), 'HH:mm') : ''}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f0f4f8] line-clamp-2">{post.content}</p>
                  </div>
                  <Badge variant="default" className="text-[10px] shrink-0">Scheduled</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, truncate, formatNumber } from '@/lib/utils'
import { Plus, Calendar, Heart, Repeat2, Eye, Edit2, Trash2 } from 'lucide-react'
import { PostActions } from '@/components/dashboard/post-actions'

export const metadata = { title: 'Posts' }

const statusVariant: Record<string, 'success' | 'default' | 'destructive' | 'warning' | 'secondary'> = {
  published: 'success',
  scheduled: 'default',
  failed: 'destructive',
  draft: 'secondary',
  publishing: 'warning',
}

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('posts')
    .select('*, twitter_accounts(username, profile_image_url)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)

  const { data: posts } = await query.limit(50)

  const statuses = ['all', 'draft', 'scheduled', 'published', 'failed']

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">Posts</h1>
          <p className="text-sm text-[#8a9bb0] mt-1">{posts?.length || 0} posts total</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button size="sm"><Plus className="w-4 h-4" /> New Post</Button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statuses.map((s) => (
          <Link key={s} href={s === 'all' ? '/dashboard/posts' : `/dashboard/posts?status=${s}`}>
            <button className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap capitalize transition-all ${
              (s === 'all' && !params.status) || params.status === s
                ? 'bg-indigo-600 text-white'
                : 'bg-[#13181f] text-[#8a9bb0] border border-[#1e2a3a] hover:text-[#f0f4f8]'
            }`}>
              {s}
            </button>
          </Link>
        ))}
      </div>

      {posts?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="w-12 h-12 text-[#1e2a3a] mx-auto mb-4" />
            <p className="text-[#4a5568] mb-4">No posts yet. Create your first one!</p>
            <Link href="/dashboard/posts/new">
              <Button>Create Post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts?.map((post) => {
            const account = post.twitter_accounts as { username: string; profile_image_url: string | null } | null
            return (
              <Card key={post.id} className="card-hover">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {account?.profile_image_url ? (
                      <img src={account.profile_image_url} alt="" className="w-9 h-9 rounded-full shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#1d9bf0]/20 flex items-center justify-center shrink-0 text-[#1d9bf0] text-xs font-bold">
                        X
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {account && <span className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">@{account.username}</span>}
                        <Badge variant={statusVariant[post.status] || 'secondary'} className="text-[10px]">
                          {post.status}
                        </Badge>
                        {post.post_type !== 'regular' && (
                          <Badge variant="secondary" className="text-[10px]">{post.post_type}</Badge>
                        )}
                      </div>

                      <p className="text-sm text-[#f0f4f8] line-clamp-3">{post.content}</p>

                      {post.scheduled_at && post.status === 'scheduled' && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-400">
                          <Calendar className="w-3 h-3" />
                          <span className="font-[family-name:var(--font-mono)]">
                            Scheduled {formatDate(post.scheduled_at, 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                      )}

                      {post.status === 'published' && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#4a5568]">
                          <span className="font-[family-name:var(--font-mono)]">
                            {post.published_at ? formatDate(post.published_at, 'MMM d, HH:mm') : ''}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(post.engagement_stats?.impressions || 0)}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-400" />{formatNumber(post.engagement_stats?.likes || 0)}</span>
                            <span className="flex items-center gap-1"><Repeat2 className="w-3 h-3 text-green-400" />{formatNumber(post.engagement_stats?.retweets || 0)}</span>
                          </div>
                        </div>
                      )}

                      {post.error_message && (
                        <p className="text-xs text-red-400 mt-1">{post.error_message}</p>
                      )}
                    </div>

                    <PostActions postId={post.id} status={post.status} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

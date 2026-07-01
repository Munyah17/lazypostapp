'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { countTweetChars, extractHashtags, formatDate } from '@/lib/utils'
import type { TwitterAccount } from '@/types/database'
import {
  Calendar, Send, Hash, Sparkles,
  Clock, X, Image, BarChart2
} from 'lucide-react'
import { XIcon } from '@/components/ui/x-icon'

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()

  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [accounts, setAccounts] = useState<TwitterAccount[]>([])
  const [postType, setPostType] = useState<'regular' | 'thread' | 'scheduled'>('regular')
  const [threadParts, setThreadParts] = useState<string[]>(['', ''])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [viralScore, setViralScore] = useState<number | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)

  const charCount = countTweetChars(content)
  const isOverLimit = charCount > 280

  useEffect(() => {
    supabase.from('twitter_accounts').select('*').eq('is_active', true)
      .then(({ data }) => {
        if (data?.length) {
          setAccounts(data)
          setSelectedAccount(data[0].id)
        }
      })
  }, [])

  const handleAiEnhance = async () => {
    if (!content.trim()) { toast.error('Write something first so AI can enhance it.'); return }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: content, style: 'single', action: 'enhance' }),
      })
      const data = await res.json()
      if (data.content) setContent(data.content)
      if (data.viralScore) setViralScore(data.viralScore)
      toast.success('AI enhanced your post!')
    } catch {
      toast.error('AI enhancement failed.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!content.trim()) { toast.error('Write something first.'); return }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/viral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      setViralScore(data.score)
      if (data.improvements?.length) {
        toast.info(`Tip: ${data.improvements[0]}`)
      }
    } catch {
      toast.error('Analysis failed.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (isDraft = false) => {
    if (!content.trim()) { toast.error('Post content cannot be empty.'); return }
    if (isOverLimit) { toast.error('Post exceeds 280 characters.'); return }
    if (!selectedAccount) { toast.error('Please connect a Twitter account first.'); return }

    setLoading(true)
    try {
      const status = isDraft ? 'draft' : showScheduler && scheduledAt ? 'scheduled' : 'publishing'
      const { data, error } = await supabase.from('posts').insert({
        content,
        twitter_account_id: selectedAccount,
        status,
        post_type: postType === 'thread' ? 'thread' : 'regular',
        thread_content: postType === 'thread' ? threadParts.filter(Boolean) : null,
        scheduled_at: showScheduler && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        hashtags: extractHashtags(content),
      }).select().single()

      if (error) throw error

      if (status === 'publishing') {
        await fetch('/api/posts/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: data.id }),
        })
        toast.success('Post published to Twitter!')
      } else if (status === 'scheduled') {
        toast.success(`Scheduled for ${formatDate(scheduledAt, 'MMM d, HH:mm')}`)
      } else {
        toast.success('Saved as draft.')
      }

      router.push('/dashboard/posts')
    } catch (err) {
      toast.error('Failed to save post.')
    } finally {
      setLoading(false)
    }
  }

  const charColor = charCount > 260 ? (isOverLimit ? 'text-red-400' : 'text-amber-400') : 'text-[#4a5568]'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">New Post</h1>
          <p className="text-sm text-[#8a9bb0] mt-1">Compose, schedule, or publish instantly</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <X className="w-4 h-4" /> Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Account selector */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <XIcon className="w-4 h-4 text-[#1d9bf0] shrink-0" />
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#f0f4f8] outline-none"
                >
                  {accounts.length === 0 && <option>No accounts connected</option>}
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>@{a.username}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Post type tabs */}
          <div className="flex gap-2">
            {(['regular', 'thread'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  postType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#13181f] text-[#8a9bb0] hover:text-[#f0f4f8]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Content area */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm shrink-0 mt-0.5">
                  {accounts.find((a) => a.id === selectedAccount)?.profile_image_url ? (
                    <img src={accounts.find((a) => a.id === selectedAccount)?.profile_image_url!} className="w-full h-full rounded-full object-cover" alt="" />
                  ) : (
                    <XIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind? Let AI help you make it viral..."
                    className="min-h-[140px] border-none bg-transparent p-0 focus-visible:ring-0 text-base resize-none"
                    autoFocus
                  />

                  {postType === 'thread' && threadParts.map((part, i) => (
                    <div key={i} className="mt-3 pt-3 border-t border-[#1e2a3a]">
                      <Textarea
                        value={part}
                        onChange={(e) => {
                          const newParts = [...threadParts]
                          newParts[i] = e.target.value
                          setThreadParts(newParts)
                        }}
                        placeholder={`Thread part ${i + 2}...`}
                        className="border-none bg-transparent p-0 focus-visible:ring-0 resize-none min-h-[80px]"
                      />
                    </div>
                  ))}

                  {postType === 'thread' && (
                    <button
                      onClick={() => setThreadParts([...threadParts, ''])}
                      className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      + Add thread part
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1e2a3a]">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-[#13181f] text-[#4a5568] hover:text-[#8a9bb0]">
                    <Image className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[#13181f] text-[#4a5568] hover:text-[#8a9bb0]">
                    <Hash className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1e2a3a" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke={isOverLimit ? '#ef4444' : charCount > 260 ? '#f59e0b' : '#6366f1'}
                      strokeWidth="3"
                      strokeDasharray={`${Math.min((charCount / 280) * 88, 88)} 88`}
                    />
                  </svg>
                  <span className={`text-xs font-[family-name:var(--font-mono)] ${charColor}`}>
                    {280 - charCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Viral score */}
          {viralScore !== null && (
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              viralScore >= 75 ? 'border-green-500/30 bg-green-900/10' :
              viralScore >= 50 ? 'border-amber-500/30 bg-amber-900/10' :
              'border-red-500/30 bg-red-900/10'
            }`}>
              <BarChart2 className={`w-5 h-5 shrink-0 ${viralScore >= 75 ? 'text-green-400' : viralScore >= 50 ? 'text-amber-400' : 'text-red-400'}`} />
              <div>
                <span className="text-sm font-medium">Viral Score: </span>
                <span className={`font-bold font-[family-name:var(--font-mono)] ${viralScore >= 75 ? 'text-green-400' : viralScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {viralScore}/100
                </span>
                <span className="text-xs text-[#8a9bb0] ml-2">{viralScore >= 75 ? '🔥 High viral potential' : viralScore >= 50 ? '⚡ Decent reach expected' : '💡 Try AI enhance to improve'}</span>
              </div>
            </div>
          )}

          {/* Scheduler */}
          {showScheduler && (
            <Card>
              <CardContent className="pt-4">
                <label className="text-sm text-[#8a9bb0] mb-2 block">Schedule for</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[#1e2a3a] bg-[#0d1117] px-4 text-sm text-[#f0f4f8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Post Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => handleSubmit(false)}
                loading={loading}
                disabled={!selectedAccount || isOverLimit}
              >
                <Send className="w-4 h-4" /> Publish Now
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowScheduler(!showScheduler)}
              >
                <Clock className="w-4 h-4" />
                {showScheduler ? 'Hide Scheduler' : 'Schedule Post'}
              </Button>

              {showScheduler && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSubmit(false)}
                  loading={loading}
                  disabled={!scheduledAt || !selectedAccount}
                >
                  <Calendar className="w-4 h-4" /> Confirm Schedule
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => handleSubmit(true)}
                loading={loading}
              >
                Save as Draft
              </Button>
            </CardContent>
          </Card>

          {/* AI Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">AI Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleAiEnhance}
                loading={aiLoading}
              >
                <Sparkles className="w-4 h-4 text-violet-400" /> Enhance with AI
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleAnalyze}
                loading={aiLoading}
              >
                <BarChart2 className="w-4 h-4 text-indigo-400" /> Viral Score Check
              </Button>
            </CardContent>
          </Card>

          {/* Hashtags preview */}
          {extractHashtags(content).length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-[#8a9bb0] mb-2 font-[family-name:var(--font-mono)]">HASHTAGS DETECTED</p>
                <div className="flex flex-wrap gap-1.5">
                  {extractHashtags(content).map((tag) => (
                    <Badge key={tag} variant="default" className="text-[10px]">#{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

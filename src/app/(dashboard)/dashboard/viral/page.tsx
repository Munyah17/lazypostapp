'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Flame, Video, BarChart2, Zap, Play, Copy, Send, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ViralAnalysis {
  score: number
  strengths: string[]
  improvements: string[]
  bestPostingTime: string
}

interface VideoResult {
  postId: string
  status: string
  message: string
}

export default function ViralPage() {
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const [videoPrompt, setVideoPrompt] = useState('')
  const [videoStyle, setVideoStyle] = useState('dynamic')
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null)
  const [hasAgencyPlan, setHasAgencyPlan] = useState(false)

  useState(() => {
    supabase.from('profiles').select('plan_id').single().then(({ data }) => {
      setHasAgencyPlan(data?.plan_id === 'agency')
    })
  })

  const handleAnalyze = async () => {
    if (!content.trim()) { toast.error('Enter your tweet content first.'); return }
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/viral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      setAnalysis(data)
    } catch {
      toast.error('Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) { toast.error('Describe your video first.'); return }
    if (!hasAgencyPlan) { toast.error('Viral Video Generation requires the Agency plan.'); return }
    setVideoLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: accounts } = await supabase.from('twitter_accounts').select('id').limit(1)

      const { data: post } = await supabase.from('posts').insert({
        content: videoPrompt,
        post_type: 'viral_video',
        status: 'draft',
        viral_video_prompt: videoPrompt,
        user_id: user?.id,
        twitter_account_id: accounts?.[0]?.id || null,
      }).select().single()

      const res = await fetch('/api/ai/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post?.id, prompt: videoPrompt, style: videoStyle }),
      })
      const data = await res.json()
      setVideoResult(data)
      if (data.status === 'processing') {
        toast.success('Video generation started! It will post automatically when ready.')
      }
    } catch {
      toast.error('Video generation failed.')
    } finally {
      setVideoLoading(false)
    }
  }

  const scoreColor = analysis
    ? analysis.score >= 75 ? 'text-green-400' : analysis.score >= 50 ? 'text-amber-400' : 'text-red-400'
    : ''
  const scoreBg = analysis
    ? analysis.score >= 75 ? 'bg-green-900/20 border-green-500/30' : analysis.score >= 50 ? 'bg-amber-900/20 border-amber-500/30' : 'bg-red-900/20 border-red-500/30'
    : ''

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">Viral Tools</h1>
        <p className="text-sm text-[#8a9bb0] mt-1">Analyze content potential and generate viral videos</p>
      </div>

      {/* Viral Score Analyzer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Viral Post Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your tweet or idea here to analyze its viral potential..."
            className="min-h-[120px]"
          />
          <Button onClick={handleAnalyze} loading={analyzing} className="w-full sm:w-auto">
            <BarChart2 className="w-4 h-4" /> Analyze Viral Potential
          </Button>

          {analysis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Score */}
              <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${scoreBg}`}>
                <div className={`text-6xl font-bold font-[family-name:var(--font-display)] ${scoreColor}`}>
                  {analysis.score}
                </div>
                <div className="text-sm text-[#8a9bb0] mt-1">Viral Score / 100</div>
                <div className={`mt-2 text-sm font-medium ${scoreColor}`}>
                  {analysis.score >= 75 ? '🔥 High Viral Potential' :
                   analysis.score >= 50 ? '⚡ Moderate Reach' : '💡 Needs Work'}
                </div>
                <div className="mt-3 text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">
                  Best time: {analysis.bestPostingTime}
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="space-y-3">
                {analysis.strengths.length > 0 && (
                  <div>
                    <p className="text-xs text-green-400 font-[family-name:var(--font-mono)] mb-2">STRENGTHS</p>
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-[#8a9bb0] mb-1">
                        <span className="text-green-400 shrink-0">✓</span> {s}
                      </div>
                    ))}
                  </div>
                )}
                {analysis.improvements.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-400 font-[family-name:var(--font-mono)] mb-2">IMPROVEMENTS</p>
                    {analysis.improvements.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-[#8a9bb0] mb-1">
                        <span className="text-amber-400 shrink-0">→</span> {imp}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viral Video Generator */}
      <Card className={!hasAgencyPlan ? 'opacity-75' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-pink-400" />
              Viral Video Generator
            </div>
            {!hasAgencyPlan ? (
              <Badge variant="agency" className="text-xs">
                <Lock className="w-3 h-3 mr-1" /> Agency Plan
              </Badge>
            ) : (
              <Badge variant="success" className="text-xs">Active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasAgencyPlan && (
            <div className="p-3 rounded-xl bg-amber-900/10 border border-amber-500/20 text-sm text-amber-300">
              Viral Video Generation is available on the Agency plan. Videos are generated via open-source AI (Wan 2.1) and posted directly to X — never stored on our servers.
            </div>
          )}

          <div>
            <label className="text-xs text-[#8a9bb0] mb-1.5 block font-[family-name:var(--font-mono)]">VIDEO CONCEPT / PROMPT</label>
            <Textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="Describe your viral video idea... e.g. 'A timelapse of a city at golden hour with motivational text overlay'"
              className="min-h-[100px]"
              disabled={!hasAgencyPlan}
            />
          </div>

          <div>
            <label className="text-xs text-[#8a9bb0] mb-2 block font-[family-name:var(--font-mono)]">VIDEO STYLE</label>
            <div className="flex flex-wrap gap-2">
              {['cinematic', 'dynamic', 'minimal', 'energetic'].map((s) => (
                <button
                  key={s}
                  onClick={() => setVideoStyle(s)}
                  disabled={!hasAgencyPlan}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all disabled:cursor-not-allowed ${
                    videoStyle === s ? 'bg-pink-600 text-white' : 'bg-[#13181f] text-[#8a9bb0] border border-[#1e2a3a]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#13181f] border border-[#1e2a3a]">
            <p className="text-xs text-[#8a9bb0]">
              <span className="text-indigo-400">How it works:</span> AI generates the video using open-source Wan 2.1 model via Replicate, uploads it directly to your Twitter/X account via the Media API, then posts it. No video is stored on our servers.
            </p>
          </div>

          <Button
            onClick={handleGenerateVideo}
            loading={videoLoading}
            disabled={!hasAgencyPlan}
            className="w-full bg-pink-600 hover:bg-pink-500"
          >
            <Video className="w-4 h-4" />
            {videoLoading ? 'Generating & Posting...' : 'Generate & Post Viral Video'}
          </Button>

          {videoResult && (
            <div className="p-3 rounded-xl bg-green-900/10 border border-green-500/20">
              <p className="text-sm text-green-300 font-medium">✓ {videoResult.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viral post templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            Proven Viral Formulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Hot Take', template: 'Controversial opinion: [your hot take]. Change my mind. 👇', badge: '🔥' },
              { label: 'List Hook', template: '[Number] things [topic] taught me:\n\n1. [insight]\n2. [insight]\n3. [insight]\n\nThread 🧵', badge: '📋' },
              { label: 'Before/After', template: 'Before [situation]: [negative state]\nAfter [change]: [positive result]\n\nThe difference? [key insight]', badge: '✨' },
              { label: 'Story Hook', template: '[Time period] ago, I [failure/mistake].\n\nToday, [success/result].\n\nHere\'s what changed:', badge: '📖' },
              { label: 'Stat Shock', template: 'Did you know [surprising statistic]?\n\nMost people don\'t realize this means [implication].\n\nHere\'s what to do about it:', badge: '📊' },
              { label: 'Question Hook', template: 'Why do [common belief]?\n\nThe real answer might surprise you:', badge: '❓' },
            ].map((formula) => (
              <div key={formula.label} className="p-3 rounded-xl bg-[#13181f] border border-[#1e2a3a] hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium font-[family-name:var(--font-display)]">
                    {formula.badge} {formula.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setContent(formula.template)
                      navigator.clipboard.writeText(formula.template)
                      toast.success('Formula copied!')
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)] whitespace-pre-wrap leading-relaxed">
                  {formula.template.substring(0, 80)}...
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

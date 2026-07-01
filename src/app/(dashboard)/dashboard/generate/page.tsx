'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Sparkles, Copy, Send, RotateCcw, ChevronDown, Flame, Hash } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const tones = ['professional', 'casual', 'funny', 'inspirational', 'educational', 'bold']
const styles = [
  { id: 'single', label: 'Single Tweet', desc: 'One punchy tweet' },
  { id: 'thread', label: 'Thread', desc: '5-7 connected tweets' },
  { id: 'viral', label: 'Viral Optimized', desc: 'Maximize engagement' },
]

interface GeneratedResult {
  content: string
  hashtags: string[]
  threadParts?: string[]
  viralScore?: number
  tips?: string[]
}

export default function GeneratePage() {
  const supabase = createClient()
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [style, setStyle] = useState('single')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [savedToQueue, setSavedToQueue] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic first.'); return }
    setLoading(true)
    setSavedToQueue(false)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, style }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data)
    } catch {
      toast.error('Generation failed. Check your API keys.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleSaveToDrafts = async () => {
    if (!result) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data: accounts } = await supabase.from('twitter_accounts').select('id').limit(1)

    await supabase.from('posts').insert({
      content: result.content,
      thread_content: result.threadParts,
      hashtags: result.hashtags,
      post_type: style === 'thread' ? 'thread' : 'ai_generated',
      status: 'draft',
      ai_prompt: topic,
      user_id: user?.id,
      twitter_account_id: accounts?.[0]?.id || null,
    })
    toast.success('Saved to drafts!')
    setSavedToQueue(true)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">AI Content Generator</h1>
        <p className="text-sm text-[#8a9bb0] mt-1">Powered by Llama 3.3 · Free open-source AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input panel */}
        <Card>
          <CardHeader><CardTitle className="text-base">What do you want to post about?</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-[#8a9bb0] mb-1.5 block font-[family-name:var(--font-mono)]">TOPIC / IDEA</label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 'Why consistency beats motivation for building habits' or 'Tips for first-time entrepreneurs'"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-xs text-[#8a9bb0] mb-2 block font-[family-name:var(--font-mono)]">TONE</label>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                      tone === t ? 'bg-indigo-600 text-white' : 'bg-[#13181f] text-[#8a9bb0] hover:text-[#f0f4f8] border border-[#1e2a3a]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#8a9bb0] mb-2 block font-[family-name:var(--font-mono)]">FORMAT</label>
              <div className="space-y-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all border ${
                      style === s.id
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-[#f0f4f8]'
                        : 'bg-[#13181f] border-[#1e2a3a] text-[#8a9bb0] hover:border-[#2a3a50]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium">{s.label}</div>
                      <div className="text-xs text-[#4a5568]">{s.desc}</div>
                    </div>
                    {style === s.id && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={handleGenerate} loading={loading}>
              <Sparkles className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate Content'}
            </Button>
          </CardContent>
        </Card>

        {/* Output panel */}
        <div className="space-y-4">
          {!result && !loading && (
            <Card className="flex items-center justify-center min-h-[300px]">
              <div className="text-center p-8">
                <Sparkles className="w-12 h-12 text-[#1e2a3a] mx-auto mb-4" />
                <p className="text-[#4a5568] text-sm">Your generated content will appear here</p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-[#8a9bb0]">Generating with Llama 3.3...</p>
              </div>
            </Card>
          )}

          {result && !loading && (
            <>
              {/* Viral score */}
              {result.viralScore !== undefined && (
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                  result.viralScore >= 75 ? 'border-green-500/30 bg-green-900/10' :
                  result.viralScore >= 50 ? 'border-amber-500/30 bg-amber-900/10' :
                  'border-[#1e2a3a] bg-[#13181f]'
                }`}>
                  <Flame className={`w-5 h-5 ${result.viralScore >= 75 ? 'text-green-400' : result.viralScore >= 50 ? 'text-amber-400' : 'text-[#4a5568]'}`} />
                  <span className="text-sm font-medium">Viral Score: </span>
                  <span className={`font-bold font-[family-name:var(--font-mono)] text-lg ${result.viralScore >= 75 ? 'text-green-400' : result.viralScore >= 50 ? 'text-amber-400' : 'text-[#f0f4f8]'}`}>
                    {result.viralScore}/100
                  </span>
                </div>
              )}

              {/* Main content */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Generated Tweet</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(result.content)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={handleGenerate}>
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-xl bg-[#13181f] text-sm text-[#f0f4f8] leading-relaxed whitespace-pre-wrap">
                    {result.content}
                  </div>
                  <p className="text-xs text-[#4a5568] mt-2 font-[family-name:var(--font-mono)] text-right">
                    {result.content.length}/280 chars
                  </p>
                </CardContent>
              </Card>

              {/* Thread parts */}
              {result.threadParts && result.threadParts.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Thread Parts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.threadParts.map((part, i) => (
                      <div key={i} className="relative">
                        <div className="p-3 rounded-xl bg-[#13181f] text-sm text-[#f0f4f8]">
                          <span className="text-[10px] font-[family-name:var(--font-mono)] text-indigo-400 mr-2">{i + 2}/</span>
                          {part}
                        </div>
                        <button
                          onClick={() => handleCopy(part)}
                          className="absolute top-2 right-2 p-1 rounded text-[#4a5568] hover:text-[#8a9bb0]"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Hashtags */}
              {result.hashtags.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs text-[#8a9bb0] font-[family-name:var(--font-mono)]">SUGGESTED HASHTAGS</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.hashtags.map((tag) => (
                        <Badge key={tag} variant="default" className="text-xs cursor-pointer" onClick={() => handleCopy(`#${tag}`)}>
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-[#8a9bb0] mb-2 font-[family-name:var(--font-mono)]">AI TIPS</p>
                    {result.tips.map((tip, i) => (
                      <p key={i} className="text-xs text-[#8a9bb0] flex gap-2">
                        <span className="text-indigo-400">→</span> {tip}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleSaveToDrafts} disabled={savedToQueue}>
                  {savedToQueue ? '✓ Saved' : 'Save to Drafts'}
                </Button>
                <a href={`/dashboard/posts/new?content=${encodeURIComponent(result.content)}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    <Send className="w-4 h-4" /> Open in Composer
                  </Button>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

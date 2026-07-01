'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { EngagementRule, TwitterAccount } from '@/types/database'
import { MessageCircle, Heart, Repeat2, Plus, X, Lock, Power } from 'lucide-react'

export default function EngagePage() {
  const supabase = createClient()
  const [accounts, setAccounts] = useState<TwitterAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [rule, setRule] = useState<Partial<EngagementRule>>({
    is_active: false,
    auto_like: false,
    auto_retweet: false,
    auto_reply: false,
    reply_templates: [],
    target_keywords: [],
    target_hashtags: [],
    excluded_keywords: [],
    daily_like_limit: 50,
    daily_retweet_limit: 20,
    daily_reply_limit: 10,
    engagement_hours: { start: 8, end: 22 },
  })
  const [newTemplate, setNewTemplate] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [newHashtag, setNewHashtag] = useState('')
  const [newExclude, setNewExclude] = useState('')
  const [saving, setSaving] = useState(false)
  const [hasPro, setHasPro] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: profile } = await supabase.from('profiles').select('plan_id').single()
      setHasPro(profile?.plan_id === 'pro' || profile?.plan_id === 'agency')

      const { data: accs } = await supabase.from('twitter_accounts').select('*').eq('is_active', true)
      if (accs?.length) {
        setAccounts(accs)
        setSelectedAccount(accs[0].id)

        const { data: existing } = await supabase
          .from('engagement_rules')
          .select('*')
          .eq('twitter_account_id', accs[0].id)
          .single()

        if (existing) setRule(existing)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!selectedAccount) { toast.error('Select an account first.'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('engagement_rules').upsert({
        ...rule,
        user_id: user?.id,
        twitter_account_id: selectedAccount,
      }, { onConflict: 'twitter_account_id' })
      toast.success('Engagement rules saved!')
    } catch {
      toast.error('Failed to save rules.')
    } finally {
      setSaving(false)
    }
  }

  const addToList = (field: keyof EngagementRule, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return
    const current = (rule[field] as string[]) || []
    setRule({ ...rule, [field]: [...current, value.trim()] })
    setter('')
  }

  const removeFromList = (field: keyof EngagementRule, index: number) => {
    const current = (rule[field] as string[]) || []
    setRule({ ...rule, [field]: current.filter((_, i) => i !== index) })
  }

  if (!hasPro) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Card className="text-center p-8">
          <Lock className="w-12 h-12 text-[#1e2a3a] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 font-[family-name:var(--font-display)]">Auto-Engagement</h2>
          <p className="text-[#8a9bb0] mb-6">
            Automatically like, retweet, and reply to relevant content to grow your engagement. Available on Pro and Agency plans.
          </p>
          <a href="/dashboard/billing">
            <Button>Upgrade to Pro</Button>
          </a>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">Auto Engagement</h1>
          <p className="text-sm text-[#8a9bb0] mt-1">Set rules for automatic positive interactions with your audience</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={rule.is_active ? 'success' : 'secondary'} className="text-xs">
            <Power className="w-3 h-3 mr-1" />
            {rule.is_active ? 'Active' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* Account selector */}
      <Card>
        <CardContent className="pt-4">
          <label className="text-xs text-[#8a9bb0] mb-2 block font-[family-name:var(--font-mono)]">TWITTER ACCOUNT</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full h-10 rounded-xl border border-[#1e2a3a] bg-[#0d1117] px-4 text-sm text-[#f0f4f8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>@{a.username}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Auto Actions</CardTitle>
            <CardDescription>What should LazyPost do automatically?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'auto_like', icon: Heart, label: 'Auto Like', desc: 'Like relevant tweets', limitKey: 'daily_like_limit', color: 'text-pink-400' },
              { key: 'auto_retweet', icon: Repeat2, label: 'Auto Retweet', desc: 'Retweet quality content', limitKey: 'daily_retweet_limit', color: 'text-green-400' },
              { key: 'auto_reply', icon: MessageCircle, label: 'Auto Reply', desc: 'Reply with AI-generated constructive responses', limitKey: 'daily_reply_limit', color: 'text-blue-400' },
            ].map((action) => (
              <div key={action.key} className="flex items-start gap-3 p-3 rounded-xl bg-[#13181f]">
                <action.icon className={`w-5 h-5 ${action.color} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium">{action.label}</span>
                    <button
                      onClick={() => setRule({ ...rule, [action.key]: !rule[action.key as keyof EngagementRule] })}
                      className={`relative w-9 h-5 rounded-full transition-colors ${rule[action.key as keyof EngagementRule] ? 'bg-indigo-600' : 'bg-[#1e2a3a]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rule[action.key as keyof EngagementRule] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-[#4a5568]">{action.desc}</p>
                  {rule[action.key as keyof EngagementRule] && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-[#8a9bb0]">Daily limit:</span>
                      <input
                        type="number"
                        value={rule[action.limitKey as keyof EngagementRule] as number}
                        onChange={(e) => setRule({ ...rule, [action.limitKey]: parseInt(e.target.value) || 0 })}
                        className="w-16 h-7 rounded-lg border border-[#1e2a3a] bg-[#0d1117] px-2 text-xs text-center text-[#f0f4f8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        min={1} max={200}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#13181f]">
              <div>
                <div className="text-sm font-medium mb-0.5">Master Switch</div>
                <div className="text-xs text-[#4a5568]">Enable/disable all auto-engagement</div>
              </div>
              <button
                onClick={() => setRule({ ...rule, is_active: !rule.is_active })}
                className={`relative w-11 h-6 rounded-full transition-colors ${rule.is_active ? 'bg-green-600' : 'bg-[#1e2a3a]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${rule.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Targeting */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Target Keywords</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="e.g. startup, tech" className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && addToList('target_keywords', newKeyword, setNewKeyword)} />
                <Button size="icon-sm" onClick={() => addToList('target_keywords', newKeyword, setNewKeyword)}><Plus className="w-3.5 h-3.5" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rule.target_keywords?.map((kw, i) => (
                  <Badge key={i} variant="default" className="text-xs cursor-pointer" onClick={() => removeFromList('target_keywords', i)}>
                    {kw} <X className="w-2.5 h-2.5 ml-1" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Target Hashtags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={newHashtag} onChange={(e) => setNewHashtag(e.target.value)} placeholder="e.g. buildinpublic" className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && addToList('target_hashtags', newHashtag, setNewHashtag)} />
                <Button size="icon-sm" onClick={() => addToList('target_hashtags', newHashtag, setNewHashtag)}><Plus className="w-3.5 h-3.5" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rule.target_hashtags?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeFromList('target_hashtags', i)}>
                    #{tag} <X className="w-2.5 h-2.5 ml-1" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Reply Templates</CardTitle>
              <p className="text-xs text-[#8a9bb0]">AI uses these as examples to craft genuine replies</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={newTemplate} onChange={(e) => setNewTemplate(e.target.value)} placeholder="e.g. Great insight! I've been thinking about this too." className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && addToList('reply_templates', newTemplate, setNewTemplate)} />
                <Button size="icon-sm" onClick={() => addToList('reply_templates', newTemplate, setNewTemplate)}><Plus className="w-3.5 h-3.5" /></Button>
              </div>
              <div className="space-y-1.5">
                {rule.reply_templates?.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#13181f] text-xs text-[#8a9bb0]">
                    <span className="flex-1 truncate">{t}</span>
                    <button onClick={() => removeFromList('reply_templates', i)} className="text-[#4a5568] hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} loading={saving} className="flex-1 sm:flex-none sm:px-8">
          Save Engagement Rules
        </Button>
      </div>

      <div className="p-3 rounded-xl bg-[#13181f] border border-[#1e2a3a] text-xs text-[#4a5568]">
        ⚠️ Auto-engagement runs within X&apos;s API rate limits. LazyPost engages constructively and positively — never with spam or harmful content.
      </div>
    </div>
  )
}

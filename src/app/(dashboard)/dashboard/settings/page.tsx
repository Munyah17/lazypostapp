'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserSettings } from '@/types/database'
import { User, Bell, Clock, Brain, Shield } from 'lucide-react'

const TONES = ['professional', 'casual', 'funny', 'inspirational', 'educational', 'bold']
const FREQUENCIES = [
  { id: 'light', label: 'Light', desc: '1-2 posts/day' },
  { id: 'moderate', label: 'Moderate', desc: '3-5 posts/day' },
  { id: 'heavy', label: 'Heavy', desc: '6+ posts/day' },
]
const TIMEZONES = ['UTC', 'Africa/Harare', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Dubai']

export default function SettingsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [settings, setSettings] = useState<Partial<UserSettings>>({})
  const [saving, setSaving] = useState(false)
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [profileRes, settingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      ])
      if (profileRes.data) setProfile(profileRes.data)
      if (settingsRes.data) {
        setSettings(settingsRes.data)
        setTopics(settingsRes.data.ai_topics || [])
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await Promise.all([
        supabase.from('profiles').update({
          full_name: profile.full_name,
          username: profile.username,
          bio: profile.bio,
          timezone: profile.timezone,
        }).eq('id', user!.id),
        supabase.from('user_settings').update({
          ...settings,
          ai_topics: topics,
          timezone: profile.timezone,
        }).eq('user_id', user!.id),
      ])
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">Settings</h1>
        <p className="text-sm text-[#8a9bb0] mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8a9bb0] mb-1.5 block font-[family-name:var(--font-mono)]">FULL NAME</label>
              <Input value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#8a9bb0] mb-1.5 block font-[family-name:var(--font-mono)]">USERNAME</label>
              <Input value={profile.username || ''} onChange={(e) => setProfile({ ...profile, username: e.target.value })} placeholder="lazypost_user" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8a9bb0] mb-1.5 block font-[family-name:var(--font-mono)]">BIO</label>
            <Textarea value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us a bit about yourself..." className="min-h-[80px]" />
          </div>
          <div>
            <label className="text-xs text-[#8a9bb0] mb-1.5 block font-[family-name:var(--font-mono)]">TIMEZONE</label>
            <select
              value={profile.timezone || 'UTC'}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              className="w-full h-10 rounded-xl border border-[#1e2a3a] bg-[#0d1117] px-4 text-sm text-[#f0f4f8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* AI Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" /> AI Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-[#8a9bb0] mb-2 block font-[family-name:var(--font-mono)]">DEFAULT TONE</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button key={t} onClick={() => setSettings({ ...settings, ai_tone: t })}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${settings.ai_tone === t ? 'bg-violet-600 text-white' : 'bg-[#13181f] text-[#8a9bb0] border border-[#1e2a3a]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8a9bb0] mb-2 block font-[family-name:var(--font-mono)]">YOUR NICHE / TOPICS</label>
            <div className="flex gap-2 mb-2">
              <Input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="e.g. tech, startups, AI" className="h-8 text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter' && newTopic.trim()) { setTopics([...topics, newTopic.trim()]); setNewTopic('') } }} />
              <Button size="icon-sm" onClick={() => { if (newTopic.trim()) { setTopics([...topics, newTopic.trim()]); setNewTopic('') } }}>+</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((topic, i) => (
                <button key={i} onClick={() => setTopics(topics.filter((_, j) => j !== i))}
                  className="px-2.5 py-1 rounded-lg bg-[#13181f] border border-[#1e2a3a] text-xs text-[#8a9bb0] hover:border-red-500/30 hover:text-red-400 transition-colors"
                >
                  {topic} ×
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8a9bb0] mb-2 block font-[family-name:var(--font-mono)]">POSTING FREQUENCY GOAL</label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map((f) => (
                <button key={f.id} onClick={() => setSettings({ ...settings, posting_frequency: f.id as 'light' | 'moderate' | 'heavy' })}
                  className={`p-3 rounded-xl text-left transition-all border ${settings.posting_frequency === f.id ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-[#13181f] border-[#1e2a3a]'}`}
                >
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs text-[#4a5568]">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'notification_email', label: 'Email notifications', desc: 'Get notified when posts are published or fail' },
            { key: 'notification_browser', label: 'Browser notifications', desc: 'Real-time browser push notifications' },
          ].map((notif) => (
            <div key={notif.key} className="flex items-center justify-between p-3 rounded-xl bg-[#13181f]">
              <div>
                <div className="text-sm font-medium">{notif.label}</div>
                <div className="text-xs text-[#4a5568]">{notif.desc}</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, [notif.key]: !settings[notif.key as keyof UserSettings] })}
                className={`relative w-9 h-5 rounded-full transition-colors ${settings[notif.key as keyof UserSettings] ? 'bg-indigo-600' : 'bg-[#1e2a3a]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings[notif.key as keyof UserSettings] ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto sm:px-8">
        Save All Settings
      </Button>
    </div>
  )
}

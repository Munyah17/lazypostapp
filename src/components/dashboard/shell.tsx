'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn, getInitials, PLAN_BADGES } from '@/lib/utils'
import type { Profile } from '@/types/database'
import type { User } from '@supabase/supabase-js'
import {
  LayoutDashboard, Calendar, Sparkles, Flame, MessageCircle,
  BarChart3, Settings, CreditCard, Zap, Menu, X,
  LogOut, Video, ChevronDown, Shield, Users
} from 'lucide-react'
import { XIcon } from '@/components/ui/x-icon'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string
  adminOnly?: boolean
  superAdminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/posts', label: 'Posts', icon: Calendar },
  { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
  { href: '/dashboard/generate', label: 'AI Generate', icon: Sparkles },
  { href: '/dashboard/viral', label: 'Viral Tools', icon: Flame },
  { href: '/dashboard/engage', label: 'Engage', icon: MessageCircle },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/accounts', label: 'X Accounts', icon: XIcon },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Admin Panel', icon: Shield, adminOnly: true },
  { href: '/superadmin', label: 'Super Admin', icon: Users, superAdminOnly: true },
]

interface ShellProps {
  profile: (Profile & { user_settings?: unknown }) | null
  user: User
  children: React.ReactNode
}

export function DashboardShell({ profile, user, children }: ShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const supabase = createClient()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const isSuperAdmin = profile?.role === 'super_admin'

  const visibleAdminItems = adminNavItems.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin
    if (item.adminOnly) return isAdmin
    return true
  })

  const planBadge = PLAN_BADGES[profile?.plan_id || 'free']

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-[#1e2a3a]">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg font-[family-name:var(--font-display)] gradient-text">LazyPost</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
              isActive(item.href)
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-[#8a9bb0] hover:text-[#f0f4f8] hover:bg-[#13181f]'
            )}
          >
            <item.icon className={cn('w-4 h-4 shrink-0', isActive(item.href) ? 'text-indigo-400' : 'text-[#4a5568] group-hover:text-[#8a9bb0]')} />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] font-[family-name:var(--font-mono)] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        {visibleAdminItems.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#4a5568] uppercase tracking-widest">Admin</span>
            </div>
            {visibleAdminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
                  pathname.startsWith(item.href)
                    ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20'
                    : 'text-[#8a9bb0] hover:text-[#f0f4f8] hover:bg-[#13181f]'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[#1e2a3a]">
        <div
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#13181f] cursor-pointer transition-colors"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              : getInitials(profile?.full_name || user.email || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-[#f0f4f8]">{profile?.full_name || 'User'}</div>
            <div className={`text-[10px] font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${planBadge}`}>
              {(profile?.plan_id || 'free').toUpperCase()}
            </div>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-[#4a5568] transition-transform shrink-0', userMenuOpen && 'rotate-180')} />
        </div>

        {userMenuOpen && (
          <div className="mt-1 border border-[#1e2a3a] rounded-xl bg-[#13181f] overflow-hidden">
            <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#8a9bb0] hover:text-[#f0f4f8] hover:bg-[#1a2130] transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#080a0f] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 border-r border-[#1e2a3a] bg-[#0d1117]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d1117] border-r border-[#1e2a3a] overflow-hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#13181f] text-[#8a9bb0]"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-[#1e2a3a] bg-[#0d1117] shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[#13181f] text-[#8a9bb0]">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold font-[family-name:var(--font-display)] gradient-text">LazyPost</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(profile?.full_name || 'U')}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex items-center border-t border-[#1e2a3a] bg-[#0d1117] shrink-0">
          {[
            { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
            { href: '/dashboard/posts', label: 'Posts', icon: Calendar },
            { href: '/dashboard/generate', label: 'AI', icon: Sparkles },
            { href: '/dashboard/analytics', label: 'Stats', icon: BarChart3 },
            { href: '/dashboard/settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] transition-colors min-h-[56px]',
                isActive(item.href) ? 'text-indigo-400' : 'text-[#4a5568]'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

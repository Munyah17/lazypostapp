import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: import('@/types/database').Profile | null }

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) redirect('/dashboard')

  return <DashboardShell profile={profile} user={user}>{children}</DashboardShell>
}

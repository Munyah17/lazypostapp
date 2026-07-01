import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatDate } from '@/lib/utils'
import { Plus, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { XIcon } from '@/components/ui/x-icon'
import { AccountActions } from '@/components/dashboard/account-actions'

export const metadata = { title: 'Twitter Accounts' }

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: accounts } = await supabase
    .from('twitter_accounts')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false }) as { data: import('@/types/database').TwitterAccount[] | null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id')
    .eq('id', user!.id)
    .single() as { data: { plan_id: string } | null }

  const plan = profile?.plan_id || 'free'
  const maxAccounts: Record<string, number> = { free: 1, starter: 1, pro: 3, agency: 10 }
  const limit = maxAccounts[plan] || 1
  const canAddMore = (accounts?.length || 0) < limit

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">X Accounts</h1>
          <p className="text-sm text-[#8a9bb0] mt-1">
            {accounts?.length || 0} of {limit} accounts connected
          </p>
        </div>
        {canAddMore ? (
          <Link href="/api/twitter/connect">
            <Button size="sm">
              <Plus className="w-4 h-4" /> Connect Account
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/billing">
            <Button variant="amber" size="sm">Upgrade to add more</Button>
          </Link>
        )}
      </div>

      {params.connected === 'true' && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-green-500/30 bg-green-900/10">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-sm text-green-300">Twitter account connected successfully!</p>
        </div>
      )}

      {params.error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-900/10">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">Failed to connect: {params.error.replace(/_/g, ' ')}</p>
        </div>
      )}

      {accounts?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#13181f] border border-[#1e2a3a] flex items-center justify-center mx-auto mb-4">
              <XIcon className="w-8 h-8 text-[#1d9bf0]" />
            </div>
            <h3 className="font-semibold text-lg mb-2 font-[family-name:var(--font-display)]">No accounts connected</h3>
            <p className="text-sm text-[#8a9bb0] mb-6 max-w-sm mx-auto">
              Connect your Twitter/X account to start scheduling and auto-posting.
            </p>
            <Link href="/api/twitter/connect">
              <Button>
                <XIcon className="w-4 h-4" /> Connect Twitter/X Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {accounts?.map((account) => (
            <Card key={account.id} className="card-hover">
              <CardContent className="pt-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center gap-4">
                    {account.profile_image_url ? (
                      <img
                        src={account.profile_image_url}
                        alt={account.username}
                        className="w-14 h-14 rounded-full border-2 border-[#1e2a3a]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#1d9bf0]/20 flex items-center justify-center border-2 border-[#1e2a3a]">
                        <XIcon className="w-6 h-6 text-[#1d9bf0]" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold font-[family-name:var(--font-display)]">{account.display_name || account.username}</span>
                        {account.verified && <Badge variant="default" className="text-[10px]">Verified</Badge>}
                        <Badge variant={account.is_active ? 'success' : 'secondary'} className="text-[10px]">
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-sm text-[#8a9bb0]">@{account.username}</div>
                    </div>
                  </div>

                  <div className="sm:ml-auto flex flex-wrap gap-4 sm:gap-6 text-center">
                    {[
                      { label: 'Followers', value: formatNumber(account.followers_count) },
                      { label: 'Following', value: formatNumber(account.following_count) },
                      { label: 'Tweets', value: formatNumber(account.tweet_count) },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="text-lg font-bold font-[family-name:var(--font-display)]">{stat.value}</div>
                        <div className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1e2a3a]">
                  <p className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">
                    Connected {formatDate(account.created_at)}
                    {account.last_synced_at && ` · Synced ${formatDate(account.last_synced_at)}`}
                  </p>
                  <AccountActions accountId={account.id} username={account.username} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!canAddMore && (
        <Card className="border-amber-500/20 bg-amber-900/5">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-300">
              You&apos;ve reached the account limit for your <span className="font-semibold">{plan}</span> plan.
              Upgrade to connect more Twitter/X accounts.
            </p>
            <Link href="/dashboard/billing">
              <Button variant="amber" size="sm" className="mt-3">
                Upgrade Plan <RefreshCw className="w-3 h-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

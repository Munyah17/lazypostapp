import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE /api/twitter/disconnect?account_id=...
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const accountId = new URL(req.url).searchParams.get('account_id')
    if (!accountId) return NextResponse.json({ error: 'account_id is required' }, { status: 400 })

    const { error } = await supabase
      .from('twitter_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/twitter/disconnect]', error)
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 })
  }
}

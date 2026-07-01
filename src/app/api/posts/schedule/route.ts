import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/posts/schedule — schedule a post (or reschedule)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { postId, scheduledAt, twitterAccountId } = await req.json()
    if (!postId || !scheduledAt) {
      return NextResponse.json({ error: 'postId and scheduledAt are required' }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledAt)
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      status: 'scheduled',
      scheduled_at: scheduledDate.toISOString(),
    }
    if (twitterAccountId) updates.twitter_account_id = twitterAccountId

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !data) return NextResponse.json({ error: 'Post not found or update failed' }, { status: 404 })
    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('[POST /api/posts/schedule]', error)
    return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 })
  }
}

// DELETE /api/posts/schedule?postId=... — unschedule (revert to draft)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const postId = new URL(req.url).searchParams.get('postId')
    if (!postId) return NextResponse.json({ error: 'postId is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('posts')
      .update({ status: 'draft', scheduled_at: null })
      .eq('id', postId)
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .select()
      .single()

    if (error || !data) return NextResponse.json({ error: 'Post not found or not scheduled' }, { status: 404 })
    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('[DELETE /api/posts/schedule]', error)
    return NextResponse.json({ error: 'Failed to unschedule post' }, { status: 500 })
  }
}

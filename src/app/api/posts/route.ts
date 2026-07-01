import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/posts — list posts for authenticated user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('posts')
      .select('*, twitter_accounts(id, username, display_name, profile_image_url)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ posts: data, total: count })
  } catch (error) {
    console.error('[GET /api/posts]', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/posts — create a new post
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      content,
      thread_content,
      hashtags,
      twitter_account_id,
      status = 'draft',
      post_type = 'regular',
      scheduled_at,
      ai_prompt,
      is_viral_candidate,
    } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    if (status === 'scheduled' && !scheduled_at) {
      return NextResponse.json({ error: 'scheduled_at is required when status is scheduled' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        thread_content: thread_content || null,
        hashtags: hashtags || [],
        twitter_account_id: twitter_account_id || null,
        status,
        post_type,
        scheduled_at: scheduled_at || null,
        ai_prompt: ai_prompt || null,
        is_viral_candidate: is_viral_candidate || false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ post: data }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/posts]', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

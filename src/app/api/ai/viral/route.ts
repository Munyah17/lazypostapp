import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeViralPotential } from '@/lib/ai/groq'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await req.json()
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })

    const result = await analyzeViralPotential(content)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Viral Analysis]', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

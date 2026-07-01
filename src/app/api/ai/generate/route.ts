import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePost, analyzeViralPotential } from '@/lib/ai/groq'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { topic, tone, style, action } = await req.json()

    if (action === 'enhance') {
      const result = await generatePost({ topic, tone, style: 'viral' })
      const viral = await analyzeViralPotential(result.content)
      return NextResponse.json({ ...result, viralScore: viral.score })
    }

    const result = await generatePost({ topic: topic || '', tone, style })

    if (style === 'viral') {
      const viral = await analyzeViralPotential(result.content)
      result.viralScore = viral.score
      result.tips = [...(result.tips || []), ...viral.improvements]
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[AI Generate]', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

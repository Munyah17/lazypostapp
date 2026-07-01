import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface GeneratePostOptions {
  topic: string
  tone?: string
  style?: 'thread' | 'single' | 'viral'
  hashtags?: boolean
  maxLength?: number
  audience?: string
  extraContext?: string
}

export interface GeneratedPost {
  content: string
  hashtags: string[]
  threadParts?: string[]
  viralScore?: number
  tips?: string[]
}

export async function generatePost(options: GeneratePostOptions): Promise<GeneratedPost> {
  const {
    topic,
    tone = 'professional',
    style = 'single',
    hashtags = true,
    maxLength = 280,
    audience = 'general',
    extraContext = '',
  } = options

  const systemPrompt = `You are an expert Twitter/X content strategist. You create highly engaging,
authentic tweets that get real engagement. You understand the Twitter algorithm, viral content patterns,
and how to write for ${audience} audiences. Always write in a ${tone} tone.
${extraContext}
Rules:
- Keep tweets under ${maxLength} characters (excluding hashtags counted separately)
- Use active voice, strong verbs, and punchy language
- Avoid corporate speak and generic phrases
- Create genuine value — inform, entertain, or inspire
- Return ONLY valid JSON, no markdown`

  const userPrompt = style === 'thread'
    ? `Create a Twitter thread (5-7 parts) about: "${topic}".
       Return JSON: { "content": "first_tweet", "threadParts": ["tweet2","tweet3",...], "hashtags": ["tag1","tag2"], "tips": ["improvement_tip"] }`
    : style === 'viral'
    ? `Create a highly viral single tweet about: "${topic}".
       Use emotional hooks, relatable scenarios, or surprising facts.
       Return JSON: { "content": "tweet_text", "hashtags": ["tag1","tag2"], "viralScore": 85, "tips": ["why_this_works"] }`
    : `Create an engaging single tweet about: "${topic}".
       Return JSON: { "content": "tweet_text", "hashtags": ${hashtags ? '["tag1","tag2"]' : '[]'}, "tips": ["improvement_tip"] }`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const text = completion.choices[0]?.message?.content || '{}'
  const result = JSON.parse(text)

  return {
    content: result.content || '',
    hashtags: result.hashtags || [],
    threadParts: result.threadParts,
    viralScore: result.viralScore,
    tips: result.tips || [],
  }
}

export async function analyzeViralPotential(content: string): Promise<{
  score: number
  strengths: string[]
  improvements: string[]
  bestPostingTime: string
}> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a Twitter virality analyst. Analyze tweets and provide actionable insights. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Analyze this tweet for viral potential and return JSON:
{ "score": 0-100, "strengths": ["..."], "improvements": ["..."], "bestPostingTime": "HH:MM timezone" }

Tweet: "${content}"`,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  })

  const text = completion.choices[0]?.message?.content || '{}'
  const result = JSON.parse(text)
  return {
    score: result.score || 50,
    strengths: result.strengths || [],
    improvements: result.improvements || [],
    bestPostingTime: result.bestPostingTime || '09:00 UTC',
  }
}

export async function generateEngagementReply(
  tweetContent: string,
  tweetAuthor: string,
  tone: string = 'friendly'
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a social media manager writing genuine, ${tone} replies to tweets.
Keep replies under 200 characters. Be positive, constructive, and authentic.
Never use generic phrases like "great post!" Always add value. Return just the reply text.`,
      },
      {
        role: 'user',
        content: `Write a ${tone} reply to @${tweetAuthor}'s tweet: "${tweetContent}"`,
      },
    ],
    temperature: 0.9,
    max_tokens: 100,
  })

  return completion.choices[0]?.message?.content?.trim() || ''
}

export async function generateVideoScript(
  topic: string,
  duration: number = 15
): Promise<{ script: string; imagePrompts: string[]; style: string }> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a viral video content creator for Twitter/X.
Create compelling ${duration}-second video concepts with detailed image generation prompts.
Return only valid JSON.`,
      },
      {
        role: 'user',
        content: `Create a viral Twitter video concept about: "${topic}"
Return JSON: {
  "script": "narration/caption text for the video",
  "imagePrompts": ["detailed image prompt 1 for AI generation", "prompt 2", "prompt 3"],
  "style": "cinematic|dynamic|minimal|energetic"
}`,
      },
    ],
    temperature: 0.85,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  })

  const text = completion.choices[0]?.message?.content || '{}'
  const result = JSON.parse(text)
  return {
    script: result.script || '',
    imagePrompts: result.imagePrompts || [],
    style: result.style || 'dynamic',
  }
}

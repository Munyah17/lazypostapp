import Replicate from 'replicate'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export interface VideoGenerationOptions {
  prompt: string
  style?: 'cinematic' | 'dynamic' | 'minimal' | 'energetic'
  duration?: number
}

export interface GeneratedVideo {
  videoUrl: string
  thumbnailUrl?: string
}

export async function generateViralVideo(options: VideoGenerationOptions): Promise<GeneratedVideo> {
  const { prompt, style = 'dynamic', duration = 5 } = options

  const enhancedPrompt = `${prompt}, ${style} style, high quality, viral social media video, trending aesthetic, sharp visuals`

  const output = await replicate.run(
    'wan-ai/wan2.1-t2v-480p:a9f94e6a22a71b00a1038e64f65e59f7dfb5e5b2c7bf23e09c4a5b4e30fc30f9',
    {
      input: {
        prompt: enhancedPrompt,
        num_frames: duration * 8,
        fps: 8,
        width: 848,
        height: 480,
        guidance_scale: 6,
        num_inference_steps: 30,
      },
    }
  ) as string[]

  const videoUrl = Array.isArray(output) ? output[0] : (output as unknown as string)

  return { videoUrl }
}

export async function generateVideoFromImages(
  imagePrompts: string[]
): Promise<{ imageUrls: string[] }> {
  const imageUrls: string[] = []

  for (const prompt of imagePrompts.slice(0, 3)) {
    const output = await replicate.run(
      'black-forest-labs/flux-schnell',
      {
        input: {
          prompt: `${prompt}, viral twitter content, high contrast, visually striking, 16:9 aspect ratio`,
          aspect_ratio: '16:9',
          output_format: 'webp',
          output_quality: 90,
          num_outputs: 1,
        },
      }
    ) as string[]

    if (output?.[0]) imageUrls.push(output[0])
  }

  return { imageUrls }
}

export async function downloadVideoBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

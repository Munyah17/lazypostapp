import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: { default: 'LazyPost — Smart Twitter Automation', template: '%s | LazyPost' },
  description: 'Schedule, generate, and auto-post viral Twitter content. Grow your following while you focus on what matters.',
  keywords: ['twitter automation', 'tweet scheduler', 'AI tweet generator', 'social media tool', 'viral post', 'twitter growth'],
  authors: [{ name: 'LazyPost' }],
  creator: 'LazyPost',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'LazyPost — Smart Twitter Automation',
    description: 'Grow your Twitter following on autopilot with AI-powered scheduling and content generation.',
    siteName: 'LazyPost',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LazyPost — Smart Twitter Automation',
    description: 'Grow your Twitter following on autopilot.',
    creator: '@lazypost',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#080a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-[#080a0f] text-[#f0f4f8] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#13181f',
              border: '1px solid #1e2a3a',
              color: '#f0f4f8',
              fontFamily: 'IBM Plex Sans, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}

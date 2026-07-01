import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`h-full ${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#080a0f] text-[#f0f4f8] antialiased font-body">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#13181f',
              border: '1px solid #1e2a3a',
              color: '#f0f4f8',
              fontFamily: 'var(--font-body)',
            },
          }}
        />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { PostHogProvider } from '@/lib/posthog-provider'
import { PageViewTracker } from '@/components/PageViewTracker'
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.in'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400'],
})

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'InterviewAI — Practice Interviews in Hinglish | AI Mock Interview',
    template: '%s | InterviewAI',
  },
  description: 'The only AI interviewer that understands how Indian engineers actually speak. Practice TCS NQT, Infosys, Wipro, and startup interviews in Hinglish. Get STAR scores, WPM, and filler word analysis.',
  keywords: ['mock interview', 'AI interview India', 'TCS NQT preparation', 'Infosys interview', 'campus placement', 'Hinglish interview', 'STAR method interview', 'mock interview in Hindi', 'placement interview practice'],
  authors: [{ name: 'InterviewAI' }],
  creator: 'InterviewAI',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'InterviewAI — Practice Interviews in Hinglish',
    description: 'AI-powered mock interviews for Indian engineering students. TCS, Infosys, Wipro. Speak naturally, get graded on logic not accent.',
    url: BASE_URL,
    siteName: 'InterviewAI',
    locale: 'en_IN',
    type: 'website',
    images: [{
      url: `${BASE_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: 'InterviewAI — AI Mock Interviews in Hinglish',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterviewAI — Practice Interviews in Hinglish',
    description: 'AI mock interviews for Indian engineering students. TCS, Infosys, Wipro in Hinglish.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'InterviewAI',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'AI-powered mock interview platform for Indian engineering students',
  sameAs: [],
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', availableLanguage: ['English', 'Hindi'] },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="InterviewAI" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <PostHogProvider>
          <PageViewTracker />
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

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
  title: 'InterviewAI — Practice Interviews in Hinglish | AI Mock Interview Platform',
  description: 'The only AI interviewer that understands how Indian engineers actually speak. Practice TCS, Infosys, Wipro, and startup interviews in Hinglish. Get your STAR score, WPM, and filler word analysis.',
  keywords: 'mock interview, AI interview, TCS NQT preparation, Infosys interview, campus placement, Hinglish interview, STAR method',
  openGraph: {
    title: 'InterviewAI — Practice interviews in Hinglish',
    description: 'AI-powered mock interviews for Indian engineering students. Speak naturally, get graded on logic not accent.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}

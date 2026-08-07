'use client'

import { Share2 } from 'lucide-react'
import { track } from '@/lib/posthog'

interface LinkedInShareProps {
  sessionId: string
  score: number
  company: string
  referralCode?: string
  weakAreas?: string[]
}

export function LinkedInShareButton({ sessionId, score, company, referralCode, weakAreas = [] }: LinkedInShareProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.in'
  const link = referralCode ? `${siteUrl}?ref=${referralCode}` : siteUrl

  const text = [
    `Just completed a mock interview session on InterviewAI — scored ${score}/100 for ${company} round.`,
    weakAreas.length > 0 ? `My weak areas: ${weakAreas.slice(0, 2).join(', ')}. Working on it before the actual drive.` : '',
    `If you're also prepping for placements, this tool is genuinely useful → ${link}`,
    `#placement #engineering #India #interviewprep`,
  ].filter(Boolean).join('\n\n')

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(text)}`

  const handleClick = () => {
    track.scorecardLinkedinShared(sessionId)
    track.linkedinShareClicked(sessionId)
    window.open(linkedInUrl, '_blank', 'width=600,height=600')
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-[#0A66C2] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0952a0] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      Share on LinkedIn
    </button>
  )
}

interface WhatsAppShareProps {
  referralCode?: string
  referralUrl?: string
}

export function WhatsAppShareButton({ referralCode, referralUrl }: WhatsAppShareProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.in'
  const link = referralUrl || (referralCode ? `${siteUrl}?ref=${referralCode}` : siteUrl)

  const handleClick = () => {
    const msg = encodeURIComponent(
      `Bhai/behen, placement drive aa raha hai kya? Ye AI mock interviewer try karo — Hinglish mein interview karta hai, TCS/Infosys ke actual questions poochta hai, aur score bhi deta hai.\n\nFirst 60 seconds free hai, no login needed.\n\n→ ${link}\n\nShare karo apne placement group mein bhi 🙏`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#22c55e] transition-colors"
    >
      <Share2 size={16} />
      Share on WhatsApp
    </button>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import type { TranscriptEntry } from '@/lib/interviewSocket'

interface LiveTranscriptFeedProps {
  words: TranscriptEntry[]
  speakerRole?: 'user' | 'ai'
}

/**
 * Phase 13 — LiveTranscriptFeed
 * Real-time transcript display with:
 * - Filler words highlighted in amber (from fillerWords array)
 * - Auto-scroll to bottom
 */
export default function LiveTranscriptFeed({ words }: LiveTranscriptFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll as new entries arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [words])

  if (words.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-400 italic">Your answer will appear here as you speak...</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-2 py-1 space-y-2 leading-relaxed text-sm">
      {words.map((entry, i) => {
        const fillerSet = new Set((entry.fillerWords || []).map(w => w.toLowerCase()))
        const tokens = entry.text.split(/\s+/)
        return (
          <div key={i} className={`flex flex-wrap gap-x-1 gap-y-0.5 ${entry.speaker === 'ai' ? 'text-indigo-700' : 'text-gray-800'}`}>
            {tokens.map((token, j) => {
              const isFiller = fillerSet.has(token.toLowerCase().replace(/[^a-z]/g, ''))
              return (
                <span
                  key={j}
                  className={[
                    isFiller ? 'filler-word bg-amber-100 text-amber-800 rounded px-0.5' : '',
                    'transition-all duration-150',
                  ].join(' ')}
                >
                  {token}
                </span>
              )
            })}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

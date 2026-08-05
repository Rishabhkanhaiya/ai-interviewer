'use client'

import { useEffect, useRef } from 'react'
import type { TranscriptWord } from '@/hooks/useInterviewWebSocket'

interface LiveTranscriptFeedProps {
  words: TranscriptWord[]
  speakerRole?: 'user' | 'ai'
}

/**
 * Phase 13 — LiveTranscriptFeed
 * Real-time transcript display with:
 * - Filler words highlighted in amber
 * - Low-confidence words underlined in red dotted
 * - Auto-scroll to bottom
 */
export default function LiveTranscriptFeed({ words }: LiveTranscriptFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll as new words arrive
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
    <div className="h-full overflow-y-auto px-2 py-1 space-y-1 leading-relaxed text-sm">
      <div className="flex flex-wrap gap-x-1 gap-y-0.5">
        {words.map((word, i) => (
          <span
            key={i}
            className={[
              word.is_filler ? 'filler-word' : '',
              !word.is_filler && word.confidence < 0.6 ? 'low-confidence-word' : '',
              'transition-all duration-150',
            ].join(' ')}
          >
            {word.text}
          </span>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

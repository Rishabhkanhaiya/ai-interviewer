'use client'

import { useState, useEffect } from 'react'

export function VictoryPopup({ score, onDismiss }: { score: number, onDismiss: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Only show if score is >= 80 and we haven't seen it for this session (tracked via local state)
    if (score >= 80) {
      const timer = setTimeout(() => setIsOpen(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [score])

  if (!isOpen) return null

  const handleShare = () => {
    const text = `I just scored ${score}/100 in my mock interview on InterviewAI! Preparing for placements has never been easier. Check it out at https://yourdomain.in`
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    setIsOpen(false)
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-center">
        <button 
          onClick={() => { setIsOpen(false); onDismiss(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Incredible Score!</h2>
        <p className="text-gray-600 mb-6">
          You scored an amazing <strong>{score}/100</strong>. You are absolutely crushing your placement preparation!
        </p>
        
        <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
          <p className="text-sm font-medium text-indigo-900 mb-2">Show off your hard work!</p>
          <p className="text-xs text-indigo-700">Let recruiters know you are interview-ready.</p>
        </div>
        
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 bg-[#0A66C2] text-white font-semibold py-3 rounded-xl hover:bg-[#0952a0] transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          Share Achievement on LinkedIn
        </button>
        
        <button
          onClick={() => { setIsOpen(false); onDismiss(); }}
          className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

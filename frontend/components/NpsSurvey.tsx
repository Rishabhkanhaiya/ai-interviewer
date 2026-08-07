'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { track } from '@/lib/posthog'

interface NpsSurveyProps {
  onDismiss: () => void
}

export default function NpsSurvey({ onDismiss }: NpsSurveyProps) {
  const [step, setStep] = useState<'score' | 'followup' | 'done'>('score')
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScore = async (s: number) => {
    setScore(s)
    setStep('followup')
  }

  const handleSubmit = async () => {
    if (score === null) return
    setLoading(true)
    track.npsSubmitted(score, comment)

    try {
      await fetch('/api/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, comment }),
      })
    } catch {}

    setLoading(false)
    setStep('done')
    setTimeout(onDismiss, 2500)
  }

  const followupQuestion =
    score !== null && score >= 9
      ? 'Glad to hear it! 🎉 What was most useful?'
      : score !== null && score >= 7
      ? 'Thanks! What would make it a 10?'
      : 'Sorry to hear that. What went wrong? (We read every response personally)'

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-black/8 p-6 animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={onDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>

        {step === 'score' && (
          <>
            <p className="text-sm font-semibold text-[#111827] mb-1">Quick question 👋</p>
            <p className="text-sm text-[#6B7280] mb-4">
              How likely are you to recommend InterviewAI to a friend preparing for placements?
            </p>
            <div className="flex gap-1 mb-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  onClick={() => handleScore(n)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                    n >= 9 ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    n >= 7 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#9CA3AF]">
              <span>Not likely</span><span>Very likely</span>
            </div>
          </>
        )}

        {step === 'followup' && (
          <>
            <p className="text-sm font-semibold text-[#111827] mb-3">{followupQuestion}</p>

            {/* Score 9-10: show LinkedIn share prompt + comment */}
            {score !== null && score >= 9 && (
              <a
                href="https://www.linkedin.com/sharing/share-offsite/?url=https://yourdomain.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#0A66C2] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#0952a0] transition mb-3 w-full justify-center"
              >
                Share on LinkedIn
              </a>
            )}

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Your feedback (optional)"
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition mb-3 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#4F46E5] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Submit feedback'}
            </button>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🙏</div>
            <p className="text-sm font-semibold text-[#111827]">Thank you!</p>
            <p className="text-xs text-[#6B7280] mt-1">Your feedback helps us improve.</p>
          </div>
        )}
      </div>
    </div>
  )
}

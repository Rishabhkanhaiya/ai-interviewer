'use client'

import { useEffect, useState } from 'react'

export function SessionTimer({ startTime }: { startTime: Date }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const seconds = (elapsed % 60).toString().padStart(2, '0')

  return (
    <span className="font-mono text-lg font-semibold text-gray-700 tabular-nums">
      {minutes}:{seconds}
    </span>
  )
}

export function QuestionCounter({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-gray-500">Question</span>
      <span className="text-sm font-semibold text-indigo-600">
        {current}
      </span>
      <span className="text-sm text-gray-400">/ {total}</span>
    </div>
  )
}

export function MinutesRemaining({ minutes }: { minutes: number }) {
  const isLow = minutes < 20
  return (
    <div
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
        isLow
          ? 'bg-amber-50 text-amber-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="font-medium">{Math.round(minutes)} min left in pack</span>
    </div>
  )
}

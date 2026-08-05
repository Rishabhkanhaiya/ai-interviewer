'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface InterviewerAvatarProps {
  status: 'listening' | 'thinking' | 'speaking'
  personaName?: string
  roleLabel?: string
}

const statusConfig = {
  listening: {
    label: 'Listening...',
    pulseClass: 'pulse-green',
    bgColor: 'bg-emerald-500',
    ringColor: 'ring-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  thinking: {
    label: 'Thinking...',
    pulseClass: 'pulse-indigo',
    bgColor: 'bg-indigo-500',
    ringColor: 'ring-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  speaking: {
    label: 'Speaking...',
    pulseClass: 'pulse-amber',
    bgColor: 'bg-amber-500',
    ringColor: 'ring-amber-200',
    dotColor: 'bg-amber-500',
  },
}

/**
 * Phase 13 — InterviewerAvatar
 * Animated circle representing the AI interviewer with status indication.
 */
export default function InterviewerAvatar({
  status,
  personaName = 'Priya',
  roleLabel = 'HR Interviewer',
}: InterviewerAvatarProps) {
  const config = statusConfig[status]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle */}
      <div className="relative">
        {/* Outer pulse ring */}
        <motion.div
          className={`absolute inset-0 rounded-full ring-4 ${config.ringColor}`}
          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Avatar main circle */}
        <div
          className={`relative w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center shadow-lg ${config.pulseClass}`}
        >
          {/* AI icon — simple wave/mic SVG */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-white">
            {status === 'speaking' ? (
              // Sound wave icon when speaking
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" opacity="0.9"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            ) : status === 'listening' ? (
              // Mic icon when listening
              <>
                <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor"/>
                <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="9" y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            ) : (
              // Brain/thinking dots icon
              <>
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <circle cx="6" cy="12" r="2" fill="currentColor" opacity="0.6"/>
                <circle cx="18" cy="12" r="2" fill="currentColor" opacity="0.6"/>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Status label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
            <span className="text-sm font-medium text-gray-600">{config.label}</span>
          </div>
          <span className="text-xs text-gray-400">
            {personaName} — {roleLabel}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

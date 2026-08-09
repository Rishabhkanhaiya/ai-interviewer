'use client'

import { Flame, Star, Trophy, History } from 'lucide-react'

/* Static waveform silhouette for empty states */
const WAVE_HEIGHTS = [8, 14, 20, 12, 18, 10, 16]
function WaveformStatic() {
  return (
    <div className="waveform-static" aria-hidden="true">
      {WAVE_HEIGHTS.map((h, i) => (
        <span key={i} style={{ height: h }} />
      ))}
    </div>
  )
}

const ICON_MAP: Record<string, React.ReactNode> = {
  streak:   <Flame   size={13} strokeWidth={1.75} />,
  longest:  <Star    size={13} strokeWidth={1.75} />,
  best:     <Trophy  size={13} strokeWidth={1.75} />,
  sessions: <History size={13} strokeWidth={1.75} />,
}

const DEFAULT_HINTS: Record<string, string> = {
  streak:   'Complete a session to start your streak',
  longest:  'Build your first streak to see your record',
  best:     'Finish an interview to get your first score',
  sessions: '',
}

interface StatTileProps {
  type: 'streak' | 'longest' | 'best' | 'sessions'
  label: string
  /** Pass the numeric value only — units/context rendered separately */
  numericValue: number
  /** Rendered after the number (e.g. " days", "/100") — stays in Inter */
  unit?: string
  hint?: string
}

export function StatTile({ type, label, numericValue, unit, hint }: StatTileProps) {
  const isEmpty = numericValue === 0
  const resolvedHint = hint ?? DEFAULT_HINTS[type]
  const showWave = isEmpty && type !== 'sessions'

  return (
    <div className="stat-tile card-glow">
      {/* Label row */}
      <div className="stat-tile-label">
        <span style={{ color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center' }}>
          {ICON_MAP[type]}
        </span>
        {label}
      </div>

      {/* Value: only the number in mono, unit in Inter */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span
          className="stat-tile-value"
          style={{ color: isEmpty ? 'var(--color-text-tertiary)' : 'var(--color-ink)' }}
        >
          {numericValue}
        </span>
        {unit && (
          <span style={{
            fontSize: 13,
            fontWeight: 400,
            color: isEmpty ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
            fontFamily: 'var(--font-sans)',
          }}>
            {unit}
          </span>
        )}
      </div>

      {/* Zero-state hint */}
      {isEmpty && resolvedHint && (
        <div className="stat-tile-hint">{resolvedHint}</div>
      )}

      {/* Signature waveform — empty state only, voice-themed tiles */}
      {showWave && <WaveformStatic />}
    </div>
  )
}

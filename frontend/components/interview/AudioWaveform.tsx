'use client'

/**
 * Phase 13 — AudioWaveform
 * Animated waveform bars. Active when user is speaking, flat otherwise.
 */
export default function AudioWaveform({ isActive }: { isActive: boolean }) {
  const bars = [4, 7, 5, 9, 6, 8, 4, 7, 5, 9, 6, 8, 4]

  return (
    <div className="flex items-end justify-center gap-[3px] h-10">
      {bars.map((height, i) => (
        <div
          key={i}
          className={[
            'w-1.5 rounded-full transition-all duration-300',
            isActive
              ? 'bg-indigo-500 wave-bar'
              : 'bg-gray-200',
          ].join(' ')}
          style={{
            height: isActive ? `${height * 4}px` : '4px',
            animationDelay: isActive ? `${i * 0.08}s` : '0s',
          }}
        />
      ))}
    </div>
  )
}

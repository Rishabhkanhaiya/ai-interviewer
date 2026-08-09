/**
 * getMonogram — produces a 2-letter initials string from any company id or name.
 * Handles: underscored slugs, single words, names with numbers, never returns "??".
 *
 * Examples:
 *   "all_in_one"    → "AI"
 *   "tcs_nqt"       → "TN"
 *   "faang"         → "FA"
 *   "D2C Startup"   → "DS"
 *   "HR Behavioral" → "HB"
 */
export function getMonogram(input: string): string {
  if (!input) return 'IN' // InterviewAI fallback

  // Normalize: replace underscores and hyphens with spaces, strip numbers for splitting
  const normalized = input
    .replace(/[_-]/g, ' ')
    .replace(/[^a-zA-Z0-9 ]/g, '') // strip emoji/special chars
    .trim()

  const words = normalized.split(/\s+/).filter(Boolean)

  if (words.length === 0) return 'IN'

  if (words.length === 1) {
    // Single word: first two alphabetic characters
    const letters = words[0].replace(/[^a-zA-Z]/g, '')
    return (letters.slice(0, 2) || 'IN').toUpperCase()
  }

  // Multi-word: first alpha char of first two words
  const init1 = words[0].replace(/[^a-zA-Z]/g, '')[0] || 'I'
  const init2 = words[1].replace(/[^a-zA-Z]/g, '')[0] || 'N'
  return (init1 + init2).toUpperCase()
}

/** Deterministic base colors for monograms */
const PALETTE = [
  '#818CF8', // indigo
  '#34D399', // emerald
  '#FBBF24', // amber
  '#A78BFA', // violet
  '#2DD4BF', // teal
  '#FACC15', // yellow
  '#FB7185', // rose
  '#38BDF8', // sky
]

export function getMonogramColor(input: string) {
  if (!input) return PALETTE[0]
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = input.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

interface MonogramBadgeProps {
  name: string
  size?: number
}

export function MonogramBadge({ name, size = 32 }: MonogramBadgeProps) {
  const mono = getMonogram(name)
  const baseColor = getMonogramColor(name)
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 6,
      background: `color-mix(in srgb, ${baseColor} 20%, transparent)`,
      color: baseColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size < 36 ? 11 : 13,
      fontWeight: 700,
      flexShrink: 0,
      letterSpacing: '0.02em',
    }}>
      {mono}
    </div>
  )
}

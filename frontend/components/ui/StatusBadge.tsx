'use client'

interface StatusBadgeProps {
  status: 'completed' | 'active' | 'abandoned' | 'timeout' | string
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Completed',   cls: 'badge badge-success' },
  active:    { label: 'In progress', cls: 'badge badge-warning' },
  abandoned: { label: 'Abandoned',   cls: 'badge badge-neutral' },
  timeout:   { label: 'Timed out',   cls: 'badge badge-neutral' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: 'badge badge-neutral' }
  return <span className={cfg.cls}>{cfg.label}</span>
}

interface ScoreBadgeProps { score: number | null | undefined }

export function ScoreBadge({ score }: ScoreBadgeProps) {
  if (score === null || score === undefined) return <span className="badge badge-neutral">—</span>
  const cls = score >= 80 ? 'badge badge-success' : score >= 60 ? 'badge badge-warning' : 'badge badge-danger'
  return (
    <span className={cls} style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
      {score}/100
    </span>
  )
}

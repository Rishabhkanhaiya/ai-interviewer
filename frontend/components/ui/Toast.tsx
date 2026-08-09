'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  onDismiss?: () => void
  autoDismissMs?: number
}

const TYPE_ICON: Record<string, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}
const TYPE_COLOR: Record<string, string> = {
  success: 'var(--color-success)',
  error:   'var(--color-danger)',
  warning: 'var(--color-warning)',
  info:    'var(--color-info)',
}

export function Toast({ message, type = 'info', onDismiss, autoDismissMs = 4000 }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (autoDismissMs && onDismiss) {
      timerRef.current = setTimeout(onDismiss, autoDismissMs)
      return () => clearTimeout(timerRef.current)
    }
  }, [autoDismissMs, onDismiss])

  return (
    <div className="toast-item" role="alert" aria-live="polite">
      <span style={{ color: TYPE_COLOR[type], fontSize: 14, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>
        {TYPE_ICON[type]}
      </span>
      <span style={{ flex: 1, fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
        {message}
      </span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, flexShrink: 0 }}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

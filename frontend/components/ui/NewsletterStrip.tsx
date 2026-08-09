'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'

export function NewsletterStrip() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    // Simulate API call
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  return (
    <div className="w-full bg-[var(--color-surface-sunken)] p-8 md:p-10 rounded-[var(--radius-md)]">
      <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left flex-1">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            Get placement tips in your inbox
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            One email a week. No spam, unsubscribe anytime.
          </p>
        </div>
        <form onSubmit={handleSubscribe} className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === 'loading' || status === 'success'}
              className="ui-input w-full pl-9"
              style={{ height: 36, background: 'var(--color-surface)', paddingLeft: '36px' }}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={status === 'loading' || status === 'success'}
            className="btn-primary" 
            style={{ height: 36 }}
          >
            {status === 'loading' ? '...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'

interface Metrics {
  total_users: number
  total_sessions: number
  total_revenue_paise: number
  api_cost_estimate_paise: number
  net_margin_paise: number
  active_sessions_now: number
  pending_affiliate_payouts_paise: number
  gaming_flagged_sessions: number
}

interface Payout {
  id: string
  amount_paise: number
  status: string
  created_at: string
}

const ADMIN_EMAILS = ['admin@interviewai.in']

export default function AdminDashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      try {
        const { data } = await apiClient.getAdminMetrics()
        setMetrics(data as Metrics)
      } catch (e: any) {
        if (e?.response?.status === 403) {
          router.push('/dashboard')
        } else {
          setError('Failed to load admin metrics.')
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleApprove = async (payoutId: string) => {
    setApprovingId(payoutId)
    try {
      await apiClient.approvePayout(payoutId)
      setPayouts(p => p.filter(x => x.id !== payoutId))
    } catch { /* silent */ }
    finally { setApprovingId(null) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white/40 text-sm">Loading admin dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  const rev = metrics ? Math.round(metrics.total_revenue_paise / 100) : 0
  const cost = metrics ? Math.round(metrics.api_cost_estimate_paise / 100) : 0
  const net = metrics ? Math.round(metrics.net_margin_paise / 100) : 0
  const marginPct = rev > 0 ? Math.round((net / rev) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Internal metrics — InterviewAI</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>

        {/* Business Metrics */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: metrics.total_users.toLocaleString(), icon: '👥', color: 'text-blue-400' },
              { label: 'Total Sessions', value: metrics.total_sessions.toLocaleString(), icon: '🎤', color: 'text-indigo-400' },
              { label: 'Active Now', value: metrics.active_sessions_now, icon: '⚡', color: 'text-amber-400' },
              { label: 'Flagged Sessions', value: metrics.gaming_flagged_sessions, icon: '🚩', color: 'text-red-400' },
            ].map(m => (
              <div key={m.label} className="bg-gray-900 border border-white/10 rounded-2xl p-5">
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Revenue */}
        {metrics && (
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-5">Revenue & Costs</h2>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'Gross Revenue', value: `₹${rev.toLocaleString()}`, color: 'text-emerald-400' },
                { label: 'API Cost (est.)', value: `₹${cost.toLocaleString()}`, color: 'text-red-400' },
                { label: 'Net Revenue', value: `₹${net.toLocaleString()}`, color: net > 0 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Net Margin', value: `${marginPct}%`, color: marginPct > 50 ? 'text-emerald-400' : 'text-amber-400' },
              ].map(m => (
                <div key={m.label}>
                  <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
              API cost estimated at ₹15.80/session (GPT-4o-mini + Sarvam). Actual costs may vary.
            </div>
          </div>
        )}

        {/* Pending Payouts */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Pending Affiliate Payouts</h2>
            {metrics && (
              <span className="text-sm text-amber-400 font-medium">
                Total: ₹{Math.round(metrics.pending_affiliate_payouts_paise / 100)}
              </span>
            )}
          </div>
          {payouts.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center">
              No pending payouts — fetch from the backend API to load them.
            </div>
          ) : (
            <div className="space-y-2">
              {payouts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">₹{Math.round(p.amount_paise / 100)}</div>
                    <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={approvingId === p.id}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {approvingId === p.id ? 'Processing...' : 'Mark as Paid'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Supabase Dashboard', url: 'https://app.supabase.com', icon: '🗄️' },
            { label: 'Razorpay Dashboard', url: 'https://dashboard.razorpay.com', icon: '💳' },
            { label: 'Sentry Errors', url: 'https://sentry.io', icon: '🐛' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-900 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-sm font-medium text-gray-300">{link.label}</span>
              <span className="ml-auto text-gray-600">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

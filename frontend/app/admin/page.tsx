'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

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
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [toggling, setToggling] = useState(false)

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

  const handleToggleMaintenance = async () => {
    setToggling(true)
    try {
      await apiClient.toggleMaintenance(!maintenanceMode)
      setMaintenanceMode(!maintenanceMode)
    } catch {
      alert('Failed to toggle maintenance mode. Check server connection.')
    } finally {
      setToggling(false)
    }
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
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">Internal metrics — InterviewAI</p>
            </div>
            
            {/* Nav Links */}
            <div className="hidden sm:flex items-center gap-2 pl-6 border-l border-white/10">
              <Link 
                href="/admin/posts"
                className="px-4 py-2 bg-gray-900 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <span>✍️</span>
                Blog CMS
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>

        {/* Kill Switch (Maintenance Mode) */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span className="text-xl">🚨</span> System Kill Switch
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enable maintenance mode to instantly block all new interview sessions. Use during API outages.
            </p>
          </div>
          <button
            onClick={handleToggleMaintenance}
            disabled={toggling}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg ${
              maintenanceMode 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                : 'bg-gray-700 hover:bg-gray-600 text-white shadow-black/20'
            } disabled:opacity-50`}
          >
            {toggling ? 'Updating...' : maintenanceMode ? 'Maintenance Mode: ON' : 'Maintenance Mode: OFF'}
          </button>
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
              API cost estimated dynamically at ₹1.00/minute based on total session duration (GPT-4o-mini + Sarvam). Actual costs may vary.
            </div>
          </div>
        )}

        {/* Pending Payouts */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
        {/* Affiliates & Toggles Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Left Column: Payouts & Toggles */}
          <div className="space-y-8">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Pending Payouts</h2>
              {payouts.length === 0 ? (
                <p className="text-gray-500">No pending payouts.</p>
              ) : (
                <div className="space-y-4">
                  {payouts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-white/5">
                      <div>
                        <div className="font-semibold text-lg">₹{(p.amount_paise / 100).toFixed(2)}</div>
                        <div className="text-sm text-gray-400">{new Date(p.created_at).toLocaleDateString()}</div>
                      </div>
                      <button
                        disabled={approvingId === p.id}
                        onClick={() => handleApprove(p.id)}
                        className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {approvingId === p.id ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">System Controls</h2>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-white/5">
                <div>
                  <div className="font-semibold">Maintenance Mode</div>
                  <div className="text-sm text-gray-400">Disables all new sessions</div>
                </div>
                <button
                  disabled={toggling}
                  onClick={toggleMaintenance}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${maintenanceMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-700 text-white hover:bg-gray-600'} disabled:opacity-50`}
                >
                  {toggling ? 'Updating...' : maintenanceMode ? 'Turn Off' : 'Turn On'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: In-App Notifications */}
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">🔔</span> Send In-App Notification
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const title = fd.get('title') as string
              const message = fd.get('message') as string
              const link = fd.get('link') as string
              const target = fd.get('target') as string
              
              if (!title || !message) return alert("Title and Message are required.")
              
              const payload = {
                title, message, 
                link: link || undefined,
                user_id: target || undefined
              }
              
              try {
                await apiClient.sendAdminNotification(payload)
                alert("Notification sent successfully!")
                e.currentTarget.reset()
              } catch (err: any) {
                alert("Failed to send: " + err.message)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input required name="title" type="text" placeholder="e.g. Mega Sale! 50% Off" className="w-full p-3 bg-gray-950 border border-white/10 rounded-xl focus:border-indigo-500 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                <textarea required name="message" placeholder="Type the notification body here..." rows={3} className="w-full p-3 bg-gray-950 border border-white/10 rounded-xl focus:border-indigo-500 outline-none transition-all resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Link (Optional)</label>
                <input name="link" type="text" placeholder="e.g. /buy or https://..." className="w-full p-3 bg-gray-950 border border-white/10 rounded-xl focus:border-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Target User ID (Optional)</label>
                <input name="target" type="text" placeholder="Leave empty to broadcast to EVERYONE" className="w-full p-3 bg-gray-950 border border-white/10 rounded-xl focus:border-indigo-500 outline-none transition-all" />
                <p className="text-xs text-gray-500 mt-1">If left empty, this will be sent as a global notification to all users.</p>
              </div>
              
              <button type="submit" className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors">
                Send Notification Now
              </button>
            </form>
          </div>

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

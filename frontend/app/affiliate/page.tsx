'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'

interface AffiliateDashboard {
  code: string
  referral_url: string
  total_referrals: number
  total_earned_paise: number
  pending_payout_paise: number
  upi_id: string | null
  payouts: { id: string; amount_paise: number; status: string; created_at: string }[]
}

export default function AffiliatePage() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [notRegistered, setNotRegistered] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [savingUpi, setSavingUpi] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      try {
        const { data } = await apiClient.getAffiliateDashboard()
        setDashboard(data as AffiliateDashboard)
        setUpiId(data.upi_id || '')
      } catch (e: any) {
        if (e?.response?.status === 404) setNotRegistered(true)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleRegister = async () => {
    setRegistering(true)
    setError(null)
    try {
      await apiClient.registerAffiliate()
      const { data } = await apiClient.getAffiliateDashboard()
      setDashboard(data as AffiliateDashboard)
      setNotRegistered(false)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Registration failed. Make sure your profile is complete.')
    } finally {
      setRegistering(false)
    }
  }

  const handleSaveUpi = async () => {
    if (!upiId.trim()) return
    setSavingUpi(true)
    try {
      await apiClient.updateUpi(upiId.trim())
      if (dashboard) setDashboard({ ...dashboard, upi_id: upiId.trim() })
    } catch { /* silent */ }
    finally { setSavingUpi(false) }
  }

  const handleCopyCode = () => {
    if (dashboard) {
      navigator.clipboard.writeText(dashboard.referral_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-black/8 flex flex-col py-6 px-4 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-3 mb-6">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">InterviewAI</span>
        </div>
        {[
          { href: '/dashboard',         label: 'Dashboard',      icon: '🏠' },
          { href: '/interview/setup',   label: 'Start Interview', icon: '🎤' },
          { href: '/dashboard/history', label: 'My Sessions',    icon: '📋' },
          { href: '/buy',               label: 'Buy Pack',        icon: '💳' },
          { href: '/affiliate',         label: 'Refer & Earn',   icon: '🔗', active: true },
          { href: '/settings',          label: 'Settings',        icon: '⚙️' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
              item.active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Refer & Earn</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Share your code. Every friend who buys earns you <strong>₹100</strong>. Paid every Sunday via UPI.
            </p>
          </div>

          {/* Not registered yet */}
          {notRegistered && (
            <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h2 className="font-semibold text-gray-900 mb-1">Join the affiliate program</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Get your unique referral code and start earning ₹100 for every friend who buys a pack using your link.
              </p>
              {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
              <button
                onClick={handleRegister}
                disabled={registering}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {registering ? 'Generating your code...' : 'Get my referral code →'}
              </button>
              <p className="text-xs text-gray-400 mt-3">Free to join. No minimum payout threshold.</p>
            </div>
          )}

          {/* Registered — Dashboard */}
          {dashboard && (
            <>
              {/* Earnings cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total referrals', value: dashboard.total_referrals, icon: '👥' },
                  { label: 'Total earned', value: `₹${Math.round(dashboard.total_earned_paise / 100)}`, icon: '💰' },
                  { label: 'Pending payout', value: `₹${Math.round(dashboard.pending_payout_paise / 100)}`, icon: '⏳' },
                ].map(m => (
                  <div key={m.label} className="bg-white rounded-2xl border border-black/8 shadow-sm p-5 text-center">
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="text-2xl font-bold text-gray-900">{m.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Referral link */}
              <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-1">Your referral link</h2>
                <p className="text-sm text-gray-500 mb-4">Share this link on WhatsApp, Instagram, or LinkedIn</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 truncate">
                    {dashboard.referral_url}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors shrink-0 ${
                      copied
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {copied ? '✓ Copied!' : 'Copy link'}
                  </button>
                </div>

                {/* Quick share buttons */}
                <div className="flex gap-3 mt-4">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Bhai ye AI mock interview platform try kar. Hinglish mein interview practice hota hai! Use my code ${dashboard.code}: ${dashboard.referral_url}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(dashboard.referral_url)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white text-sm font-medium rounded-lg hover:bg-[#006399] transition-colors"
                  >
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Practice placement interviews in Hinglish 🇮🇳 Use my code ${dashboard.code}: ${dashboard.referral_url}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span>X / Twitter</span>
                  </a>
                </div>
              </div>

              {/* UPI ID for payout */}
              <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-1">Payout UPI ID</h2>
                <p className="text-sm text-gray-500 mb-4">
                  We pay out every Sunday. You need at least 1 referral to receive payment.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi or 9999999999@paytm"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    onClick={handleSaveUpi}
                    disabled={savingUpi || !upiId.trim()}
                    className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {savingUpi ? 'Saving...' : 'Save'}
                  </button>
                </div>
                {dashboard.upi_id && (
                  <p className="mt-2 text-xs text-emerald-600">✓ Currently set to: {dashboard.upi_id}</p>
                )}
              </div>

              {/* Recent payouts */}
              {dashboard.payouts.length > 0 && (
                <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Recent payouts</h2>
                  <div className="space-y-2">
                    {dashboard.payouts.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-black/5 last:border-0">
                        <span className="text-gray-600">
                          {new Date(p.created_at).toLocaleDateString('en-IN')}
                        </span>
                        <span className="font-medium text-gray-900">₹{Math.round(p.amount_paise / 100)}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          p.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.status === 'paid' ? 'Paid ✓' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

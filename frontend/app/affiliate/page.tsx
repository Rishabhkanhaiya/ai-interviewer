'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopBar } from '@/components/ui/TopBar'
import { StatTile } from '@/components/ui/StatTile'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AffiliateDashboard {
  code: string
  referral_url: string
  total_referrals: number
  total_earned_paise: number
  pending_payout_paise: number
  upi_id: string | null
  tier: string
  affiliate_type: string
  monthly_sales: number
  payouts: { id: string; amount_paise: number; status: string; created_at: string }[]
}

export default function AffiliatePage() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null)
  const [userName, setUserName] = useState<string>('')
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
        const profileRes = await apiClient.getProfile()
        setUserName(profileRes.data.name || '')
      } catch (e) {
        console.warn("Profile fetch error:", e)
      }
      try {
        const { data } = await apiClient.getAffiliateDashboard()
        setDashboard(data as AffiliateDashboard)
        setUpiId(data.upi_id || '')
      } catch (e: any) {
        console.warn("Affiliate dashboard fetch error:", e)
        if (e?.response?.status === 404) {
          setNotRegistered(true)
        } else {
          setNotRegistered(true)
          setError(e?.response?.data?.detail || e.message || 'Error fetching dashboard')
        }
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



  return (
    <div style={{display:'flex', minHeight:'100vh', background:'var(--color-bg)'}}>
      <Sidebar userName={userName} onSignOut={async () => { const { supabase } = await import('@/lib/supabase'); await supabase.auth.signOut(); window.location.href = '/' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar breadcrumb="Refer & Earn" />
        <main style={{flex:1, padding:32, overflowY:'auto'}}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="text-sm text-[var(--color-text-tertiary)]">Loading...</div>
            </div>
          ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Refer & Earn</h1>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-0.5">
                Share your code. Earn money for every friend who buys a pack. Paid every Sunday via UPI.
              </p>
            </div>

            {/* Not registered yet */}
            {notRegistered && (
              <div className="ui-card text-center" style={{padding:24, marginBottom:16}}>
                <div className="text-4xl mb-3">🔗</div>
                <h2 style={{fontSize:16, fontWeight:600, color:'var(--color-text-primary)', marginBottom:16}}>Join the affiliate program</h2>
                <p className="text-sm text-[var(--color-text-tertiary)] mb-6 max-w-sm mx-auto">
                  Get your unique referral code and start earning ₹<span className="num">100</span> for every friend who buys a pack using your link.
                </p>
                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="btn-primary"
                >
                  {registering ? 'Generating your code...' : 'Get my referral code →'}
                </button>
                <p className="text-xs text-gray-400 mt-3">Free to join. No minimum payout threshold.</p>
              </div>
            )}

            {/* Registered — Dashboard */}
            {dashboard && (
              <>
                {/* Referral link - Moved to top for visibility */}
                <div className="ui-card" style={{padding:24, marginBottom:16}}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 style={{fontSize:16, fontWeight:600, color:'var(--color-text-primary)', marginBottom:16}}>Your referral link</h2>
                      <p className="text-sm text-[var(--color-text-tertiary)]">Share this link on WhatsApp, Instagram, or LinkedIn</p>
                    </div>
                    {/* Quick share buttons */}
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Hi! I highly recommend checking out InterviewAI, an advanced mock interview platform designed to help you prepare for technical and HR rounds. You can practice seamlessly in English or Hinglish with real-time feedback.\n\nSign up using my referral code *${dashboard.code}* to get started:\n${dashboard.referral_url}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="Share on WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(dashboard.referral_url)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Share on LinkedIn"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="ui-input flex-1 truncate select-all" style={{fontFamily:'var(--font-mono)', fontSize:13}}>
                      {dashboard.referral_url}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="btn-primary shrink-0"
                      style={copied ? { background: 'var(--color-success)' } : {}}
                    >
                      {copied ? '✓ Copied!' : 'Copy link'}
                    </button>
                  </div>
                </div>

                {dashboard.total_referrals > 0 ? (
                  <>
                    {/* Tier Progress */}
                    <div className="ui-card" style={{padding:24, marginBottom:16}}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h2 style={{fontSize:16, fontWeight:600, color:'var(--color-text-primary)', marginBottom:16}}>
                            Current Tier: <span style={{fontSize:14, fontWeight:600, color:'var(--color-text-primary)'}}>{dashboard.tier}</span>
                          </h2>
                          <p className="text-sm text-[var(--color-text-tertiary)]">
                            {dashboard.affiliate_type === 'campus' ? 'Campus Ambassador' : 'Freelancer'}
                          </p>
                        </div>
                        <div className="text-sm text-indigo-600 font-medium">
                          <span className="num">{dashboard.monthly_sales}</span> sales this month
                        </div>
                      </div>
                      <div className='progress-track'><div className='progress-fill' style={{width:`${Math.min(100, (dashboard.monthly_sales / 50) * 100)}%`}} /></div>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-2 text-right">{50 - dashboard.monthly_sales > 0 ? <><span className="num">{50 - dashboard.monthly_sales}</span> more sales to reach next tier</> : 'Top tier reached!'}</p>
                    </div>

                    {/* Earnings cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <StatTile type='sessions' label='Total Referrals' numericValue={dashboard.total_referrals} />
                      <StatTile type='best' label='Total Earned' numericValue={Math.round(dashboard.total_earned_paise / 100)} unit="₹" />
                      <StatTile type='longest' label='Pending Payout' numericValue={Math.round(dashboard.pending_payout_paise / 100)} unit="₹" />
                      <StatTile type='streak' label='Conv. Rate' numericValue={dashboard.total_referrals > 0 ? 4.2 : 0} unit="%" />
                    </div>

                    {/* Weekly Chart */}
                    <div className="ui-card" style={{padding:24, marginBottom:16}}>
                      <h2 style={{fontSize:16, fontWeight:600, color:'var(--color-text-primary)', marginBottom:16}}>Earnings by Week</h2>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={(dashboard as any).weekly_earnings || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} tickFormatter={(val) => `₹${val}`} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: 'none', background: 'var(--color-surface)' }}
                              itemStyle={{ color: 'var(--color-ink)' }}
                              formatter={(value: any) => [`₹${value}`, 'Earnings']}
                            />
                            <Line type="monotone" dataKey="earnings" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="ui-card p-8 text-center" style={{ background: 'var(--color-surface-sunken)', marginBottom: 16 }}>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">Start earning today 🚀</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto mb-4">
                      Share your referral code on WhatsApp or campus groups. You earn ₹<span className="num">100</span> for every friend who signs up and buys a pack using your link.
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] max-w-md mx-auto">
                      Your stats, tier progress, and earnings charts will appear here as soon as you get your first referral!
                    </p>
                  </div>
                )}

                {dashboard.total_referrals > 0 && (
                  <>
                    {/* UPI ID for payout */}
                    <div className="ui-card" style={{padding:24, marginBottom:16}}>
                      <h2 style={{fontSize:16, fontWeight:600, color:'var(--color-text-primary)', marginBottom:16}}>Payout UPI ID</h2>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                    We pay out every Sunday. You need at least <span className="num">1</span> referral to receive payment.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi or 9999999999@paytm"
                      className="ui-input flex-1"
                    />
                    <button
                      onClick={handleSaveUpi}
                      disabled={savingUpi || !upiId.trim()}
                      className="btn-primary shrink-0"
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
                  <div className="ui-card" style={{padding:24, marginBottom:16}}>
                    <h2 style={{fontSize:16, fontWeight:600, color:'var(--color-text-primary)', marginBottom:16}}>Recent payouts</h2>
                    <div className="space-y-2">
                      {dashboard.payouts.map(p => (
                        <div key={p.id} className="ui-card-row items-center justify-between">
                          <span className="text-[var(--color-text-secondary)]">
                            {new Date(p.created_at).toLocaleDateString('en-IN')}
                          </span>
                          <span className="font-medium text-[var(--color-text-primary)]">₹<span className="num">{Math.round(p.amount_paise / 100)}</span></span>
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
              </>
            )}
          </div>
          )}
        </main>
      </div>
    </div>
  )
}

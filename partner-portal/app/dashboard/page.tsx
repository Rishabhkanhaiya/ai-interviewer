'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import { Copy, CheckCheck, Share2, Download, TrendingUp, Users, BarChart2, IndianRupee, AlertCircle } from 'lucide-react'
import QRCode from 'qrcode'

interface AffiliateData {
  code: string
  tier: string
  commission_paise: number
  monthly_sales: number
  total_earned_paise: number
  total_paid_paise: number
  pending_payout_paise: number
  referral_url: string
}

interface Stats {
  this_month_earnings_paise: number
  this_month_referrals: number
  conversion_rate: number
  all_time_earnings_paise: number
  all_time_paid_paise: number
  pending_payout_paise: number
}

function paise(p: number) { return `₹${(p / 100).toLocaleString('en-IN')}` }

function StatCard({ label, value, sub, subColor, icon }: {
  label: string; value: string; sub?: string; subColor?: string; icon: React.ReactNode
}) {
  return (
    <div className="bg-white border border-black/8 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#6B7280]">{label}</span>
        <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center text-[#4F46E5]">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-[#111827] mb-1">{value}</div>
      {sub && <div className={`text-xs ${subColor || 'text-[#6B7280]'}`}>{sub}</div>}
    </div>
  )
}

const TIER_ORDER = ['Campus Partner', 'Freelancer Standard', 'Freelancer Pro', 'Freelancer Elite']
const TIER_TARGETS = { 'Freelancer Standard': 1, 'Freelancer Pro': 25, 'Freelancer Elite': 50 }
const TIER_COMMISSIONS = { 'Campus Partner': '20% = ₹100/sale', 'Freelancer Standard': '25% = ₹125/sale', 'Freelancer Pro': '28% = ₹140/sale', 'Freelancer Elite': '30% = ₹150/sale' }

export default function DashboardPage() {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [referrals, setReferrals] = useState<Array<Record<string, unknown>>>([])
  const [drives, setDrives] = useState<Array<Record<string, unknown>>>([])
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMe().then(async (me) => {
      if (me.has_affiliate) {
        setAffiliate(me)
        const [statsData, refs, drivesData] = await Promise.all([
          api.getStats(),
          api.getReferrals(),
          api.getUpcomingDrives(),
        ])
        setStats(statsData)
        setReferrals(refs.referrals || [])
        setDrives(drivesData.drives || [])
      } else {
        api.getUpcomingDrives().then(d => setDrives(d.drives || []))
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const copy = async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const shareWhatsApp = () => {
    if (!affiliate) return
    const msg = encodeURIComponent(`Bhai/behen, placement drive aa raha hai kya? Ye AI mock interviewer try karo — Hinglish mein interview karta hai, TCS/Infosys ke actual questions poochta hai, aur score bhi deta hai.\n\nFirst 60 seconds free hai, no login needed.\n\n→ ${affiliate.referral_url}\n\nShare karo apne placement group mein bhi 🙏`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const downloadQR = async () => {
    if (!affiliate) return
    const dataUrl = await QRCode.toDataURL(affiliate.referral_url, { width: 400, margin: 2, color: { dark: '#111827', light: '#FFFFFF' } })
    const a = document.createElement('a'); a.download = `${affiliate.code}-qr.png`; a.href = dataUrl; a.click()
  }

  // Tier progress calculation
  const tierIndex = affiliate ? TIER_ORDER.indexOf(affiliate.tier) : -1
  const nextTierName = tierIndex >= 0 && tierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[tierIndex + 1] : null
  const nextTierTarget = nextTierName ? TIER_TARGETS[nextTierName as keyof typeof TIER_TARGETS] ?? null : null
  const salesNeeded = nextTierTarget ? Math.max(0, nextTierTarget - (affiliate?.monthly_sales || 0)) : 0
  const progressPct = affiliate?.tier === 'Freelancer Elite' ? 100 :
    nextTierTarget ? Math.min(100, ((affiliate?.monthly_sales || 0) / nextTierTarget) * 100) : 0

  // Payout progress toward ₹500 minimum
  const payoutMinPaise = 50000
  const payoutPct = Math.min(100, ((stats?.pending_payout_paise || 0) / payoutMinPaise) * 100)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#4F46E5] border-t-transparent" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar tier={affiliate?.tier} />
      <main className="ml-[220px] p-8">

        {/* Topbar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#111827]">Welcome back! 👋</h1>
            <p className="text-sm text-[#6B7280]">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <button onClick={shareWhatsApp} className="flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#22c55e] transition-colors">
            <Share2 size={15} /> Share your code
          </button>
        </div>

        {/* Section 1 — Stats grid */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <StatCard
            label="This month's earnings"
            value={stats ? paise(stats.this_month_earnings_paise) : '₹0'}
            sub={payoutPct >= 100 ? '✅ Eligible for payout' : `₹${(stats?.pending_payout_paise || 0) / 100} of ₹500 min`}
            subColor={payoutPct >= 100 ? 'text-[#10B981]' : 'text-[#6B7280]'}
            icon={<IndianRupee size={16} />}
          />
          <StatCard
            label="Referrals this month"
            value={String(stats?.this_month_referrals ?? 0)}
            sub={`${referrals.filter(r => r.status === 'pending').length} pending clearance`}
            icon={<Users size={16} />}
          />
          <StatCard
            label="Conversion rate"
            value={stats ? `${stats.conversion_rate}%` : '—'}
            sub="Industry avg 2–5%. Above 10% is excellent."
            icon={<BarChart2 size={16} />}
          />
          <StatCard
            label="All-time earnings"
            value={stats ? paise(stats.all_time_earnings_paise) : '₹0'}
            sub={stats ? `Total paid out: ${paise(stats.all_time_paid_paise)}` : ''}
            icon={<TrendingUp size={16} />}
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Section 2 — Referral code card */}
          <div className="col-span-2 bg-white border border-black/8 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wide mb-5">Your Referral Code</h2>
            {affiliate ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono font-bold text-xl text-[#111827]">{affiliate.code}</div>
                  <button onClick={() => copy(affiliate.code, 'code')} className="flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-semibold px-4 py-3 rounded-lg hover:bg-[#4338CA] transition whitespace-nowrap">
                    {copied === 'code' ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy code</>}
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#374151] truncate">{affiliate.referral_url}</div>
                  <button onClick={() => copy(affiliate.referral_url, 'link')} className="flex items-center gap-2 border border-gray-200 text-[#374151] text-sm font-semibold px-4 py-3 rounded-lg hover:bg-gray-50 transition whitespace-nowrap">
                    {copied === 'link' ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
                  </button>
                </div>
                <div className="flex gap-3 mb-4">
                  <button onClick={shareWhatsApp} className="flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#22c55e] transition">
                    <Share2 size={14} /> Share on WhatsApp
                  </button>
                  <button onClick={downloadQR} className="flex items-center gap-2 border border-gray-200 text-[#374151] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition">
                    <Download size={14} /> Download QR Code
                  </button>
                </div>
                <div className="pt-4 border-t border-black/8 text-sm text-[#6B7280]">
                  Commission rate: <strong className="text-[#111827]">{TIER_COMMISSIONS[affiliate.tier as keyof typeof TIER_COMMISSIONS]}</strong>
                  {nextTierName && salesNeeded > 0 && (
                    <span className="ml-2 text-[#4F46E5]">— {salesNeeded} more sales to reach {nextTierName}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-[#6B7280] mb-4">No partner account linked to this email yet.</p>
                <a href="/apply" className="bg-[#4F46E5] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#4338CA] transition inline-block">Apply as freelancer →</a>
              </div>
            )}
          </div>

          {/* Drive alerts */}
          <div className="bg-white border border-black/8 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wide mb-4">📢 Drive Alerts</h2>
            {drives.length > 0 ? drives.map((d: Record<string, unknown>, i) => (
              <div key={i} className="mb-4 pb-4 border-b border-black/8 last:border-0 last:mb-0 last:pb-0">
                <div className="font-medium text-[#111827] text-sm">{String(d.company)}</div>
                <div className="text-xs text-[#6B7280] mb-1">{String(d.drive_date)}</div>
                <div className="text-xs text-[#374151]">{String(d.description)}</div>
                <button onClick={shareWhatsApp} className="mt-2 text-xs text-[#4F46E5] hover:underline">Share now →</button>
              </div>
            )) : (
              <div className="flex items-center gap-2 text-sm text-[#9CA3AF]"><AlertCircle size={14} /> No upcoming drives</div>
            )}
          </div>
        </div>

        {/* Section 3 — Tier progress */}
        {affiliate && (
          <div className="bg-white border border-black/8 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#111827]">Your tier: <span className="text-[#4F46E5]">{affiliate.tier}</span></h2>
              <span className="text-xs bg-[#EEF2FF] text-[#4F46E5] px-3 py-1 rounded-full font-medium">
                {affiliate.monthly_sales} sales this month
              </span>
            </div>
            {/* Progress bar */}
            <div className="relative mb-2">
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-[#4F46E5] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            {/* Tier labels */}
            <div className="flex justify-between text-xs text-[#6B7280] mb-4">
              <span className={affiliate.tier === 'Campus Partner' ? 'text-[#4F46E5] font-semibold' : ''}>Campus/Standard</span>
              <span className={affiliate.tier === 'Freelancer Pro' ? 'text-[#4F46E5] font-semibold' : ''}>Pro (28%) — 25 sales</span>
              <span className={affiliate.tier === 'Freelancer Elite' ? 'text-[#4F46E5] font-semibold' : ''}>Elite (30%) — 50 sales</span>
            </div>
            {nextTierName && salesNeeded > 0 ? (
              <p className="text-sm text-[#374151]">
                You need <strong>{salesNeeded} more sales</strong> this month to reach <strong>{nextTierName}</strong>.
                {nextTierName === 'Freelancer Pro' && ' Earn ₹15 more per sale at Pro tier.'}
                {nextTierName === 'Freelancer Elite' && ' Earn ₹10 more per sale at Elite tier.'}
              </p>
            ) : (
              <p className="text-sm text-[#10B981] font-medium">🏆 You&apos;re at the top tier! Maximum commission unlocked.</p>
            )}
          </div>
        )}

        {/* Section 4 — Recent referrals */}
        <div className="bg-white border border-black/8 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wide">Recent Referrals</h2>
            <a href="/earnings" className="text-sm text-[#4F46E5] hover:underline">View all earnings →</a>
          </div>
          {referrals.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8">
                  <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Date</th>
                  <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Pack</th>
                  <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Earning</th>
                  <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.slice(0, 10).map((r: Record<string, unknown>, i) => (
                  <tr key={i} className="border-b border-black/8 last:border-0 hover:bg-gray-50">
                    <td className="py-3 text-[#374151]">{new Date(String(r.created_at)).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 text-[#374151]">{String(r.pack_type || '—')}</td>
                    <td className="py-3 font-semibold text-[#111827]">{paise(Number(r.amount_paise) || 0)}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === 'paid' ? 'bg-green-100 text-green-800' : r.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                        {String(r.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center">
              <div className="text-3xl mb-3">🚀</div>
              <p className="text-sm text-[#6B7280]">No referrals yet. Share your code to start earning!</p>
              {affiliate && (
                <button onClick={shareWhatsApp} className="mt-4 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#22c55e] transition">
                  Share on WhatsApp
                </button>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

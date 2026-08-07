'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Save } from 'lucide-react'

function paise(p: number) { return `₹${(p / 100).toLocaleString('en-IN')}` }

export default function EarningsPage() {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [referrals, setReferrals] = useState<Array<Record<string, unknown>>>([])
  const [payouts, setPayouts] = useState<Array<Record<string, unknown>>>([])
  const [me, setMe] = useState<Record<string, unknown>>({})
  const [weeklyData, setWeeklyData] = useState<{ week: string; earnings: number }[]>(
    Array.from({ length: 12 }, (_, i) => ({ week: `W${i + 1}`, earnings: 0 }))
  )
  const [upiId, setUpiId] = useState('')
  const [upiSaved, setUpiSaved] = useState(false)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.getMe().then(async (meData) => {
      setMe(meData)
      if (!meData.has_affiliate) return
      if (meData.upi_id) setUpiId(String(meData.upi_id))
      const [statsData, refs, payoutsData] = await Promise.all([
        api.getStats(),
        api.getReferrals(page, filter),
        api.getPayouts(),
      ])
      setStats(statsData)
      setReferrals(refs.referrals || [])
      setPayouts(payoutsData.payouts || [])
      // Build weekly chart from real referral data
      const byWeek: Record<string, number> = {}
      ;(refs.referrals || []).forEach((r: Record<string, unknown>) => {
        const d = new Date(String(r.created_at))
        const w = `W${Math.ceil(d.getDate() / 7)}`
        byWeek[w] = (byWeek[w] || 0) + (Number(r.amount_paise) || 0) / 100
      })
      setWeeklyData(Array.from({ length: 12 }, (_, i) => ({ week: `W${i + 1}`, earnings: byWeek[`W${i + 1}`] || 0 })))
    }).catch(console.error)
  }, [page, filter])

  const saveUpi = async () => {
    await api.updatePayoutDetails(upiId)
    setUpiSaved(true); setTimeout(() => setUpiSaved(false), 2000)
  }



  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar tier={String(me.tier || '')} />
      <main className="ml-[220px] p-8">
        <h1 className="text-2xl font-semibold text-[#111827] mb-8">Earnings & Payouts</h1>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'This month', value: paise(stats.this_month_earnings_paise || 0) },
            { label: 'All-time', value: paise(stats.all_time_earnings_paise || 0) },
            { label: 'Total paid', value: paise(stats.all_time_paid_paise || 0) },
            { label: 'Pending payout', value: paise(stats.pending_payout_paise || 0) },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-black/8 rounded-xl p-5">
              <div className="text-xs text-[#6B7280] mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-[#111827]">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Payout settings */}
        <div className="bg-white border border-black/8 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-[#111827] mb-4">Payout Settings</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm text-[#374151] mb-1">UPI ID for payouts</label>
              <input
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition"
              />
            </div>
            <button onClick={saveUpi} className="flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-[#4338CA] transition mt-5">
              <Save size={14} />{upiSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-2">Next payout: Sunday. Minimum payout: ₹500. You have {paise(stats.pending_payout_paise || 0)} pending.</p>
        </div>

        {/* Earnings chart */}
        <div className="bg-white border border-black/8 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-[#111827] mb-5">Weekly Earnings (Last 12 weeks)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: number) => [`₹${v}`, 'Earnings']} />
              <Bar dataKey="earnings" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Referrals table */}
        <div className="bg-white border border-black/8 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#111827]">All Referrals</h2>
            <div className="flex gap-2">
              {['all', 'paid', 'pending'].map(f => (
                <button key={f} onClick={() => { setFilter(f); setPage(1) }} className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${filter === f ? 'bg-[#4F46E5] text-white' : 'bg-gray-100 text-[#374151] hover:bg-gray-200'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/8">
                {['Date', 'Pack', 'Earning', 'Status', 'Payout Date'].map(h => (
                  <th key={h} className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referrals.map((r, i) => (
                <tr key={i} className="border-b border-black/8 last:border-0">
                  <td className="py-3 text-[#374151]">{new Date(String(r.created_at)).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 text-[#374151]">{String(r.pack_type || '—')}</td>
                  <td className="py-3 font-semibold text-[#111827]">{`₹${((Number(r.amount_paise) || 0) / 100)}`}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === 'paid' ? 'bg-green-100 text-green-800' : r.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{String(r.status)}</span>
                  </td>
                  <td className="py-3 text-[#374151]">{r.payout_date ? new Date(String(r.payout_date)).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
              {referrals.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-[#9CA3AF]">No referrals found</td></tr>}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-sm text-[#4F46E5] disabled:opacity-40 hover:underline">← Previous</button>
            <span className="text-sm text-[#6B7280]">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={referrals.length < 20} className="text-sm text-[#4F46E5] disabled:opacity-40 hover:underline">Next →</button>
          </div>
        </div>

        {/* Payout history */}
        <div className="bg-white border border-black/8 rounded-xl p-6">
          <h2 className="font-semibold text-[#111827] mb-4">Payout History</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/8">
                {['Date', 'Amount', 'UPI ID', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={i} className="border-b border-black/8 last:border-0">
                  <td className="py-3 text-[#374151]">{new Date(String(p.created_at)).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 font-semibold text-[#111827]">{`₹${((Number(p.amount_paise) || 0) / 100)}`}</td>
                  <td className="py-3 text-[#374151]">{String(p.upi_id || '—')}</td>
                  <td className="py-3"><span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-800">{String(p.status)}</span></td>
                </tr>
              ))}
              {payouts.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-sm text-[#9CA3AF]">No payouts yet</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

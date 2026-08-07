'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'

export default function SettingsPage() {
  const [upiId, setUpiId] = useState('')
  const [leaderboardOptin, setLeaderboardOptin] = useState(false)
  const [tier, setTier] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMe().then(me => {
      setUpiId(String(me.upi_id || ''))
      setLeaderboardOptin(Boolean(me.leaderboard_optin))
      setTier(String(me.tier || ''))
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    await Promise.all([
      api.updatePayoutDetails(upiId),
    ])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleLeaderboard = async () => {
    const next = !leaderboardOptin
    setLeaderboardOptin(next)
    await api.toggleLeaderboard(next)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#4F46E5] border-t-transparent" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar tier={tier} />
      <main className="ml-[220px] p-8 max-w-2xl">
        <h1 className="text-2xl font-semibold text-[#111827] mb-8">Settings</h1>

        {/* Payout settings */}
        <div className="bg-white border border-black/8 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-[#111827] mb-1">Payout Settings</h2>
          <p className="text-sm text-[#6B7280] mb-5">Earnings are sent every Sunday. Minimum payout is ₹500.</p>
          <label className="block text-sm font-medium text-[#374151] mb-2">UPI ID</label>
          <input
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition mb-4"
          />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#4338CA] transition"
          >
            <Save size={14} /> {saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>

        {/* Leaderboard opt-in */}
        <div className="bg-white border border-black/8 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#111827] mb-1">Leaderboard visibility</h2>
              <p className="text-sm text-[#6B7280]">Show your name and rank on the public leaderboard</p>
            </div>
            <button onClick={toggleLeaderboard} className="text-[#4F46E5]">
              {leaderboardOptin ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-gray-300" />}
            </button>
          </div>
          {leaderboardOptin && <p className="text-xs text-[#10B981] mt-3">✅ You appear on the leaderboard. Your name shows as &quot;First L.&quot; format.</p>}
        </div>

        {/* Account info */}
        <div className="bg-white border border-black/8 rounded-xl p-6">
          <h2 className="font-semibold text-[#111827] mb-4">Account</h2>
          <div className="text-sm text-[#374151] space-y-3">
            <div className="flex justify-between py-2 border-b border-black/8">
              <span className="text-[#6B7280]">Partner tier</span>
              <span className="font-medium text-[#4F46E5]">{tier || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/8">
              <span className="text-[#6B7280]">Payout day</span>
              <span>Every Sunday</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B7280]">Support</span>
              <a href="https://wa.me/+91" className="text-[#4F46E5] hover:underline">WhatsApp us</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

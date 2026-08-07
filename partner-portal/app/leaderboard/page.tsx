'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Sidebar from '@/components/Sidebar'

interface LeaderboardEntry {
  rank: number
  name: string
  monthly_sales: number
  monthly_earnings_paise: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [mySales, setMySales] = useState(0)
  const [optedIn, setOptedIn] = useState(false)

  useEffect(() => {
    Promise.all([api.getLeaderboard(), api.getMe()]).then(([lb, me]) => {
      setLeaderboard(lb.leaderboard || [])
      setMyRank(lb.my_rank)
      setMySales(lb.my_monthly_sales || 0)
      setOptedIn(me.leaderboard_optin || false)
    })
  }, [])

  const toggle = async () => {
    const next = !optedIn
    setOptedIn(next)
    await api.toggleLeaderboard(next)
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="ml-[220px] p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#111827]">Leaderboard 🏆</h1>
            <p className="text-sm text-[#6B7280]">Top partners this month (opted-in only)</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm text-[#374151]">Show me on leaderboard</span>
            <div className={`w-10 h-6 rounded-full transition-colors ${optedIn ? 'bg-[#4F46E5]' : 'bg-gray-200'} relative`} onClick={toggle}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${optedIn ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </label>
        </div>

        {/* My rank card */}
        {myRank && (
          <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-xl p-5 mb-6">
            <div className="text-sm text-[#4F46E5] font-semibold">You are ranked #{myRank} this month</div>
            <div className="text-xs text-[#6B7280] mt-1">{mySales} sales · Keep going!</div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-black/8">
                {['Rank', 'Partner', 'Sales this month', 'Earnings this month'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={i} className="border-b border-black/8 last:border-0 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="text-lg">{i < 3 ? medals[i] : `#${entry.rank}`}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#111827]">{entry.name}</td>
                  <td className="px-6 py-4 text-[#374151]">{entry.monthly_sales} sales</td>
                  <td className="px-6 py-4 font-semibold text-[#10B981]">₹{(entry.monthly_earnings_paise / 100).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-[#9CA3AF]">No partners on the leaderboard yet. Be the first to opt in!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { apiClient, type PackStatus, type Session } from '@/lib/api'
import { PushNotificationManager } from '@/components/PushNotificationManager'

const COMPANY_LABELS: Record<string, string> = {
  tcs_nqt: 'TCS NQT', infosys: 'Infosys', wipro: 'Wipro',
  accenture: 'Accenture', capgemini: 'Capgemini', startup_react: 'Startup',
  faang: 'FAANG', hr_behavioral: 'HR Round', custom: 'Custom',
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-400">In progress</span>
  const cls = score >= 80 ? 'score-excellent' : score >= 60 ? 'score-good' : 'score-poor'
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{score}/100</span>
}

export default function DashboardPage() {
  const router = useRouter()
  const [packStatus, setPackStatus] = useState<PackStatus | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [totalSessions, setTotalSessions] = useState(0)
  const [userName, setUserName] = useState<string>('')
  const [profile, setProfile] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }

      try {
        const [packRes, sessionsRes, profileRes, leaderboardRes] = await Promise.all([
          apiClient.getPackStatus(),
          apiClient.listSessions(3),
          apiClient.getProfile(),
          apiClient.getLeaderboard(),
        ])
        setPackStatus(packRes.data)
        setSessions(sessionsRes.data.sessions)
        setTotalSessions(sessionsRes.data.total || 0)
        setUserName(profileRes.data.name || '')
        setProfile(profileRes.data)
        setLeaderboard(leaderboardRes.data.leaderboard || [])
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          router.push('/auth?onboarding=true')
          return
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
      <PushNotificationManager />
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
          { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
          { href: '/interview/setup', label: 'Start Interview', icon: '🎤' },
          { href: '/dashboard/history', label: 'My Sessions', icon: '📋' },
          { href: '/buy', label: 'Buy Pack', icon: '💳' },
          { href: '/affiliate', label: 'Refer & Earn', icon: '🔗' },
          { href: '/blog', label: 'Blog & Resources', icon: '📝' },
          { href: '/help', label: 'Help & FAQ', icon: '❓' },
          { href: '/settings', label: 'Settings', icon: '⚙️' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors">
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="mt-auto">
          <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {userName ? `Hey ${userName.split(' ')[0]} 👋` : 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Ready for your next mock interview?</p>
          </div>

          {/* Stats Row */}
          {profile && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-black/8 p-4 shadow-sm flex flex-col justify-center" title="Continuous days of practice">
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <span>🔥</span> Current Streak
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{profile.current_streak || 0} days</div>
              </div>
              <div className="bg-white rounded-xl border border-black/8 p-4 shadow-sm flex flex-col justify-center" title="Your all-time longest practice streak">
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <span>⭐</span> Longest Streak
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{profile.longest_streak || 0} days</div>
              </div>
              <div className="bg-white rounded-xl border border-black/8 p-4 shadow-sm flex flex-col justify-center" title="Your highest score across all completed sessions">
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <span>🏆</span> Personal Best
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{profile.best_score || 0}/100</div>
              </div>
              <div className="bg-white rounded-xl border border-black/8 p-4 shadow-sm flex flex-col justify-center">
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <span>🎤</span> Sessions Taken
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{totalSessions}</div>
              </div>
            </div>
          )}

          {/* Pack Status Banner */}
          {packStatus?.has_active_pack && packStatus.pack ? (
            <div className="bg-indigo-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-lg">
                    {packStatus.pack.rounds_remaining} rounds remaining
                  </div>
                  <div className="text-indigo-200 text-sm">
                    {Math.round(packStatus.pack.minutes_remaining)} minutes left in pack
                  </div>
                </div>
                <Link href="/interview/setup"
                  className="px-4 py-2 bg-white text-indigo-600 font-semibold text-sm rounded-lg hover:bg-indigo-50 transition-colors">
                  Start now →
                </Link>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-indigo-500 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${(packStatus.pack.minutes_used / packStatus.pack.minutes_total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-indigo-200 mt-1">
                <span>{Math.round(packStatus.pack.minutes_used)} min used</span>
                <span>{packStatus.pack.minutes_total} min total</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">No active pack</div>
                <div className="text-sm text-gray-500">Get 10 full interview rounds for ₹499</div>
              </div>
              <Link href="/buy"
                className="px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                Buy ₹499 pack →
              </Link>
            </div>
          )}

          {/* Quick Start */}
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick start</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                🎤
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Start a new mock interview</div>
                <div className="text-xs text-gray-500 mt-0.5">Choose company, round type, and paste your resume</div>
              </div>
              <Link href="/interview/setup"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shrink-0">
                Begin →
              </Link>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent sessions</h2>
              <Link href="/dashboard/history" className="text-sm text-indigo-600 hover:text-indigo-700">
                View all →
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                No sessions yet. Start your first interview above.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center gap-4 p-3 rounded-xl border border-black/5 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                      {COMPANY_LABELS[session.company]?.slice(0, 2) || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {COMPANY_LABELS[session.company] || session.company}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {session.round_type} · {new Date(session.started_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ScoreBadge score={session.overall_score ?? null} />
                      <Link href={`/interview/scorecard/${session.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700">
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top 10 Leaderboard */}
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <span>🏆</span> Top 10 Leaderboard
              </h2>
            </div>
            
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                No scores yet. Be the first to get on the board!
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, idx) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl border border-black/5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0 text-sm">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.name || 'Anonymous User'}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {user.college || 'No college specified'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="text-sm font-bold text-gray-900">{user.best_score}/100</div>
                      {user.current_streak > 0 && (
                        <div className="text-xs font-medium text-orange-500">
                          🔥 {user.current_streak} streak
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Drive Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div>
              <div className="text-sm font-semibold text-amber-800">TCS NQT season is live</div>
              <div className="text-xs text-amber-600">Practice the TCS NQT pack to be fully prepared</div>
            </div>
            <Link href="/interview/setup?company=tcs_nqt"
              className="ml-auto text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors shrink-0">
              Practice TCS →
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}

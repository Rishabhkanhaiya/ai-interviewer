'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { apiClient, type Session } from '@/lib/api'

const COMPANY_LABELS: Record<string, string> = {
  tcs_nqt: 'TCS NQT', infosys: 'Infosys InfyTQ', wipro: 'Wipro NLTH',
  accenture: 'Accenture', capgemini: 'Capgemini', startup_react: 'D2C Startup',
  faang: 'FAANG-Style', hr_behavioral: 'HR Behavioral', custom: 'Custom',
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  completed:  { label: 'Completed',  cls: 'bg-emerald-50 text-emerald-700' },
  active:     { label: 'In progress', cls: 'bg-indigo-50  text-indigo-700'  },
  abandoned:  { label: 'Abandoned',  cls: 'bg-gray-100   text-gray-500'    },
  timeout:    { label: 'Timed out',  cls: 'bg-amber-50   text-amber-700'   },
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return <span className="text-xs text-gray-300">—</span>
  const cls = score >= 80 ? 'score-excellent' : score >= 60 ? 'score-good' : 'score-poor'
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{score}/100</span>
}

export default function SessionHistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [companyFilter, setCompanyFilter] = useState('')
  const [roundFilter, setRoundFilter] = useState('')
  const PAGE_SIZE = 10

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
    }
    check()
  }, [router])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await apiClient.listSessions(PAGE_SIZE, page * PAGE_SIZE)
        const all = data.sessions || []
        setSessions(all)
        setHasMore(all.length === PAGE_SIZE)
      } catch {
        setSessions([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page])

  const filtered = sessions.filter(s => {
    if (companyFilter && s.company !== companyFilter) return false
    if (roundFilter && s.round_type !== roundFilter) return false
    return true
  })

  const totalDuration = filtered.reduce((s, sess) => s + (sess.duration_seconds || 0), 0)
  const completedCount = filtered.filter(s => s.status === 'completed').length
  const avgScore = completedCount > 0
    ? Math.round(filtered.filter(s => s.overall_score).reduce((s, sess) => s + (sess.overall_score || 0), 0) / completedCount)
    : null

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
          { href: '/dashboard',          label: 'Dashboard',      icon: '🏠' },
          { href: '/interview/setup',    label: 'Start Interview', icon: '🎤' },
          { href: '/dashboard/history',  label: 'My Sessions',    icon: '📋', active: true },
          { href: '/buy',                label: 'Buy Pack',        icon: '💳' },
          { href: '/affiliate',          label: 'Refer & Earn',   icon: '🔗' },
          { href: '/settings',           label: 'Settings',        icon: '⚙️' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
              item.active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
            }`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Sessions</h1>
              <p className="text-sm text-gray-500 mt-0.5">All your practice interview history</p>
            </div>
            <Link href="/interview/setup"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              + New interview
            </Link>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total sessions', value: filtered.length },
              { label: 'Practice time', value: `${Math.round(totalDuration / 60)} min` },
              { label: 'Avg score', value: avgScore !== null ? `${avgScore}/100` : '—' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl border border-black/8 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{m.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
            >
              <option value="">All companies</option>
              {Object.entries(COMPANY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={roundFilter}
              onChange={e => setRoundFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
            >
              <option value="">All round types</option>
              <option value="hr">HR Round</option>
              <option value="technical">Technical Round</option>
              <option value="managerial">Managerial Round</option>
            </select>
            {(companyFilter || roundFilter) && (
              <button
                onClick={() => { setCompanyFilter(''); setRoundFilter('') }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Sessions table */}
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Loading sessions...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl mb-3">🎤</div>
                <p className="text-sm text-gray-500">No sessions yet. Start your first interview!</p>
                <Link href="/interview/setup" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
                  Start now →
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-black/8">
                  <tr>
                    {['Company', 'Round', 'Date', 'Duration', 'Score', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filtered.map(session => {
                    const badge = STATUS_BADGE[session.status] || STATUS_BADGE.completed
                    return (
                      <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            {COMPANY_LABELS[session.company] || session.company}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 capitalize">{session.round_type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(session.started_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {session.duration_seconds ? `${Math.round(session.duration_seconds / 60)}m` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <ScoreBadge score={session.overall_score ?? null} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {session.status === 'completed' && (
                            <Link href={`/interview/scorecard/${session.id}`}
                              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                              View →
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

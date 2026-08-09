'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { apiClient, type Session } from '@/lib/api'
import { Sidebar } from '@/components/ui/Sidebar'
import { Search } from 'lucide-react'
import { StatusBadge, ScoreBadge } from '@/components/ui/StatusBadge'
import { TopBar } from '@/components/ui/TopBar'
import { MonogramBadge } from '@/components/ui/Monogram'
import { StatTile } from '@/components/ui/StatTile'

const COMPANY_LABELS: Record<string, string> = {
  tcs_nqt: 'TCS NQT', infosys: 'Infosys InfyTQ', wipro: 'Wipro NLTH',
  accenture: 'Accenture', capgemini: 'Capgemini', startup_react: 'D2C Startup',
  faang: 'FAANG-Style', hr_behavioral: 'HR Behavioral', custom: 'Custom',
}

export default function SessionHistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [companyFilter, setCompanyFilter] = useState('')
  const [roundFilter, setRoundFilter] = useState('')
  const [userName, setUserName] = useState<string>('')
  const PAGE_SIZE = 10

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      
      try {
        const prof = await apiClient.getProfile()
        setUserName(prof.data.name || '')
      } catch (err) {
        // ignore
      }
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const filtered = sessions.filter(s => {
    if (companyFilter) {
      const filterLower = companyFilter.toLowerCase();
      const compRaw = s.company?.toLowerCase() || '';
      const compLabel = (COMPANY_LABELS[s.company || ''] || s.company || '').toLowerCase();
      if (!compRaw.includes(filterLower) && !compLabel.includes(filterLower)) {
        return false;
      }
    }
    if (roundFilter && s.round_type !== roundFilter) return false
    return true
  })

  const totalDuration = filtered.reduce((s, sess) => s + (sess.duration_seconds || 0), 0)
  const completedCount = filtered.filter(s => s.status === 'completed').length
  const avgScore = completedCount > 0
    ? Math.round(filtered.filter(s => s.overall_score).reduce((s, sess) => s + (sess.overall_score || 0), 0) / completedCount)
    : null

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar onSignOut={handleSignOut} userName={userName} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar breadcrumb={['Dashboard', 'My Sessions']} />

        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 }}>
                  My Sessions
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">All your practice interview history</p>
              </div>
              <Link href="/interview/setup"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                + New interview
              </Link>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatTile
                type="sessions"
                label="Total sessions"
                numericValue={filtered.length}
              />
              <StatTile
                type="sessions"
                label="Practice time"
                numericValue={Math.round(totalDuration / 60)}
                unit=" min"
              />
              <StatTile
                type="best"
                label="Avg score"
                numericValue={avgScore !== null ? avgScore : 0}
                unit={avgScore !== null ? "/100" : undefined}
                hint={avgScore === null ? "Finish a session to get a score" : undefined}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="pill-control">
                <button
                  onClick={() => setRoundFilter('')}
                  className={`pill-tab ${roundFilter === '' ? 'active' : ''}`}
                >
                  All
                </button>
                <button
                  onClick={() => setRoundFilter('technical')}
                  className={`pill-tab ${roundFilter === 'technical' ? 'active' : ''}`}
                >
                  Technical
                </button>
                <button
                  onClick={() => setRoundFilter('hr')}
                  className={`pill-tab ${roundFilter === 'hr' ? 'active' : ''}`}
                >
                  HR
                </button>
                <button
                  onClick={() => setRoundFilter('managerial')}
                  className={`pill-tab ${roundFilter === 'managerial' ? 'active' : ''}`}
                >
                  Managerial
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={companyFilter}
                    onChange={e => setCompanyFilter(e.target.value)}
                    placeholder="Search company..."
                    className="ui-input"
                    style={{ height: 36, width: 220, paddingLeft: 36 }}
                  />
                </div>
                {(companyFilter || roundFilter) && (
                  <button
                    onClick={() => { setCompanyFilter(''); setRoundFilter('') }}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Sessions List */}
            <div className="ui-card" style={{ overflow: 'hidden' }}>
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
                <div>
                  {filtered.map(session => {
                    const companyName = COMPANY_LABELS[session.company] || session.company || 'Unknown'
                    return (
                      <div
                        key={session.id}
                        className="hover:bg-[var(--color-surface-sunken)] transition-colors"
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16
                        }}
                      >
                        <MonogramBadge name={companyName} />
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {companyName}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            <span className="capitalize">{session.round_type}</span> • {new Date(session.started_at).toLocaleDateString('en-IN')}
                            {session.duration_seconds ? (
                              <>
                                {' • '}
                                <span className="num">{Math.round(session.duration_seconds / 60)}</span>m
                              </>
                            ) : ''}
                          </div>
                        </div>

                        <div>
                          {(session.overall_score === null || session.overall_score === undefined) ? (
                            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Pending</span>
                          ) : (
                            <ScoreBadge score={session.overall_score} />
                          )}
                        </div>
                        
                        <div style={{ width: 100 }}>
                          <StatusBadge status={session.status} />
                        </div>

                        <div style={{ width: 60, textAlign: 'right' }}>
                          {session.status === 'completed' && (
                            <Link href={`/interview/scorecard/${session.id}`}
                              style={{ fontSize: 14, color: 'var(--color-accent-text)', textDecoration: 'none' }}>
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">Page <span className="num">{page + 1}</span></span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { apiClient, type PackStatus, type Session } from '@/lib/api'
import { PushNotificationManager } from '@/components/PushNotificationManager'
import { Sidebar } from '@/components/ui/Sidebar'
import { StatTile } from '@/components/ui/StatTile'
import { TopBar } from '@/components/ui/TopBar'
import { ScoreBadge } from '@/components/ui/StatusBadge'
import { MonogramBadge } from '@/components/ui/Monogram'
import { Trophy, Heart } from 'lucide-react'

const COMPANY_LABELS: Record<string, string> = {
  tcs_nqt: 'TCS NQT', infosys: 'Infosys', wipro: 'Wipro',
  accenture: 'Accenture', capgemini: 'Capgemini', startup_react: 'D2C Startup',
  faang: 'FAANG', hr_behavioral: 'HR Round', custom: 'Custom',
  all_in_one: 'All-In-One',
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
        if (status === 404) { router.push('/auth?onboarding=true'); return }
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



  const packPct = packStatus?.pack
    ? (packStatus.pack.minutes_used / packStatus.pack.minutes_total) * 100
    : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex' }}>
      <PushNotificationManager />

      {/* Sidebar — passes userName for real avatar */}
      <Sidebar onSignOut={handleSignOut} userName={userName} />

      {/* Right column: topbar + content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          breadcrumb="Dashboard"
          action={
            <Link 
              href="/help"
              style={{ 
                height: 32, padding: '0 12px', fontSize: 13, fontWeight: 500, 
                color: 'var(--color-text-secondary)', background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--color-ink)'
                e.currentTarget.style.borderColor = 'var(--color-border-strong)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--color-text-secondary)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
              }}
            >
              Need help?
            </Link>
          }
        />

        <main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>Loading dashboard...</div>
            </div>
          ) : (
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Greeting */}
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.01em' }}>
                {userName ? `Hey ${userName.split(' ')[0]} 👋` : 'Dashboard'}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Ready for your next mock interview?
              </p>
            </div>

            {/* Stat tiles */}
            {profile && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <StatTile
                  type="streak"
                  label="Current Streak"
                  numericValue={profile.current_streak || 0}
                  unit=" days"
                />
                <StatTile
                  type="longest"
                  label="Longest Streak"
                  numericValue={profile.longest_streak || 0}
                  unit=" days"
                />
                <StatTile
                  type="best"
                  label="Personal Best"
                  numericValue={profile.best_score || 0}
                  unit="/100"
                />
                <StatTile
                  type="sessions"
                  label="Sessions Taken"
                  numericValue={totalSessions}
                />
              </div>
            )}

            {/* Pack status banner */}
            {packStatus?.has_active_pack && packStatus.pack ? (
              <div className="ui-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    {/* Number in mono, words in Inter */}
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div>
                        <span className="num">{packStatus.pack.rounds_remaining}</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--color-text-secondary)', marginLeft: 4 }}>
                          rounds remaining
                        </span>
                      </div>
                      {packStatus.pack.rounds_remaining === 1 && (
                        <span style={{ fontSize: 11, background: 'var(--color-warning-subtle)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                          Last Round Remaining!
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                      <span className="num">{Math.round(packStatus.pack.minutes_remaining)}</span>
                      <span style={{ fontFamily: 'var(--font-sans)' }}> min left in pack</span>
                    </div>
                  </div>
                  {/* CTA with waveform signature */}
                  {packStatus.pack.rounds_remaining === 0 ? (
                    <Link
                      href="/buy?topup=true"
                      className="btn-primary"
                    >
                      Top Up for ₹199
                    </Link>
                  ) : (
                    <Link
                      href="/interview/setup"
                      className="btn-primary"
                    >
                      Start now
                    </Link>
                  )}
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${packPct}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  <span><span className="num">{Math.round(packStatus.pack.minutes_used)}</span> min used</span>
                  <span><span className="num">{packStatus.pack.minutes_total}</span> min total</span>
                </div>
              </div>
            ) : (
              <div className="ui-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>No active pack</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    Get <span className="num">10</span> full interview rounds for <span className="num">₹499</span>
                  </div>
                </div>
                <Link href="/buy" className="btn-primary">Buy ₹499 pack →</Link>
              </div>
            )}

            {/* Recent sessions */}
            <div className="ui-card" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Recent sessions</h2>
                <Link href="/dashboard/history" style={{ fontSize: 13, color: 'var(--color-accent-text)', textDecoration: 'none', fontWeight: 500 }}>
                  View all →
                </Link>
              </div>

              {sessions.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
                  No sessions yet. Start your first interview above.
                </div>
              ) : (
                <div>
                  {sessions.map((session, idx) => (
                    <div
                      key={session.id}
                      className="ui-card-row"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 20px',
                        borderBottom: idx < sessions.length - 1 ? '1px solid var(--color-border)' : 'none',
                        cursor: 'default',
                      }}
                    >
                      <MonogramBadge name={COMPANY_LABELS[session.company] || session.company} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {COMPANY_LABELS[session.company] || session.company}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'capitalize', marginTop: 1 }}>
                          {session.round_type} · {new Date(session.started_at).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        {/* "Pending" for missing scores — not a badge, just text */}
                        {(session.overall_score === null || session.overall_score === undefined)
                          ? <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Pending</span>
                          : <ScoreBadge score={session.overall_score} />
                        }
                        <Link href={`/interview/scorecard/${session.id}`}
                          style={{ fontSize: 13, color: 'var(--color-accent-text)', textDecoration: 'none', fontWeight: 500 }}>
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="ui-card" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <Trophy size={15} strokeWidth={1.75} style={{ color: 'var(--color-text-tertiary)' }} />
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Top 10 Leaderboard</h2>
              </div>
              {leaderboard.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 14, color: 'var(--color-text-tertiary)' }}>
                  No scores yet. Be the first to get on the board!
                </div>
              ) : (
                <div>
                  {leaderboard.map((user, idx) => (
                    <div key={user.id} className="ui-card-row" style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '10px 20px',
                      borderBottom: idx < leaderboard.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: idx < 3 ? 'var(--color-warning-subtle)' : 'var(--color-surface-sunken)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                        color: idx < 3 ? 'var(--color-warning)' : 'var(--color-text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.name || 'Anonymous'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.college || '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14, color: 'var(--color-ink)' }}>
                          {user.best_score}<span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 12, color: 'var(--color-text-secondary)' }}>/100</span>
                        </span>
                        {user.current_streak > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--color-warning)', fontWeight: 500 }}>
                            {user.current_streak} day streak
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referral banner */}
            <div style={{
              background: 'linear-gradient(to right, var(--color-surface-sunken), var(--color-surface))',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 24px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Love InterviewAI? <Heart size={18} className="text-rose-500 fill-rose-500" />
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>Refer your friends and earn rewards for every successful referral!</div>
              </div>
              <Link href="/affiliate"
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-surface)', background: 'var(--color-ink)', border: 'none', padding: '10px 18px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', flexShrink: 0, transition: 'opacity var(--transition-fast)' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Get Invite Link →
              </Link>
            </div>

          </div>
          )}
        </main>
      </div>
    </div>
  )
}

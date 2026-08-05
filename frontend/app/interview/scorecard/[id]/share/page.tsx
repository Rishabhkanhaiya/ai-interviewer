'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

/**
 * Phase 25 — LinkedIn Share Card
 * A visually rich shareable card for the scorecard.
 * Opens in a new tab, user screenshots + shares it.
 */
export default function ShareCardPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [scorecard, setScorecard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.getScorecard(sessionId)
        setScorecard(data)
      } catch {
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    if (sessionId) load()
  }, [sessionId, router])

  if (loading || !scorecard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white/50 text-sm">Generating share card...</div>
      </div>
    )
  }

  const { session, answers } = scorecard
  const COMPANY_LABELS: Record<string, string> = {
    tcs_nqt: 'TCS NQT', infosys: 'Infosys', wipro: 'Wipro',
    startup_react: 'Startup', faang: 'FAANG-Style', hr_behavioral: 'HR Round',
    accenture: 'Accenture', custom: 'Custom',
  }

  const avgStarS = answers.length ? +(answers.reduce((s: number, a: any) => s + (a.star_s || 0), 0) / answers.length).toFixed(1) : 0
  const avgStarT = answers.length ? +(answers.reduce((s: number, a: any) => s + (a.star_t || 0), 0) / answers.length).toFixed(1) : 0
  const avgStarA = answers.length ? +(answers.reduce((s: number, a: any) => s + (a.star_a || 0), 0) / answers.length).toFixed(1) : 0
  const avgStarR = answers.length ? +(answers.reduce((s: number, a: any) => s + (a.star_r || 0), 0) / answers.length).toFixed(1) : 0
  const overall = session.overall_score || Math.round(((avgStarS + avgStarT + avgStarA + avgStarR) / 20) * 100)
  const avgWpm = answers.length ? Math.round(answers.reduce((s: number, a: any) => s + (a.wpm || 0), 0) / answers.length) : 0
  const totalFillers = answers.reduce((acc: number, a: any) => acc + Object.values(a.filler_words || {}).reduce((s: number, c: any) => s + Number(c || 0), 0), 0)
  const date = new Date(session.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const scoreColor = overall >= 80 ? '#10B981' : overall >= 60 ? '#F59E0B' : '#EF4444'
  const medal = overall >= 80 ? '🏆' : overall >= 60 ? '🥈' : '💪'

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6 p-6">
      {/* Instructions */}
      <div className="text-white/60 text-sm text-center max-w-md">
        📸 Screenshot this card and share it on LinkedIn to showcase your interview readiness
      </div>

      {/* Share Card — 1200×627 (LinkedIn OG dimensions) */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          width: '600px',
          height: '314px',
          background: 'linear-gradient(135deg, #0F0F0F 0%, #1E1B4B 60%, #312E81 100%)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(139,92,246,0.1)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'rgba(165,180,252,0.8)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                AI Mock Interview · InterviewAI
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, lineHeight: 1.2 }}>
                {medal} I scored {overall}/100
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: 4 }}>
                {COMPANY_LABELS[session.company] || session.company} · {session.round_type?.charAt(0).toUpperCase() + session.round_type?.slice(1)} Round · {date}
              </div>
            </div>
            {/* Score circle */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: `3px solid ${scoreColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
            }}>
              <div style={{ color: scoreColor, fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>{overall}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>/100</div>
            </div>
          </div>

          {/* STAR scores row */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Situation', value: avgStarS },
              { label: 'Task', value: avgStarT },
              { label: 'Action', value: avgStarA },
              { label: 'Result', value: avgStarR },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 12,
                padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ color: '#A5B4FC', fontSize: '18px', fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'WPM', value: avgWpm || '—' },
                { label: 'Fillers', value: totalFillers },
                { label: 'Questions', value: answers.length },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700 }}>{m.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{
              background: '#4F46E5', borderRadius: 8, padding: '6px 14px',
              color: '#FFFFFF', fontSize: '11px', fontWeight: 600,
            }}>
              interviewai.in
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/interview/scorecard/${sessionId}`)}
          className="px-5 py-2.5 text-sm font-medium text-white/70 border border-white/20 rounded-lg hover:border-white/40 transition-colors"
        >
          ← Back to scorecard
        </button>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://interviewai.in/scorecard/${sessionId}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0077B5] rounded-lg hover:bg-[#006399] transition-colors"
        >
          Share on LinkedIn →
        </a>
      </div>
    </div>
  )
}

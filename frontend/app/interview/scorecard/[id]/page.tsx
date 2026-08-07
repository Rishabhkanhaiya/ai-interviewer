'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import NpsSurvey from '@/components/NpsSurvey'
import { VictoryPopup } from '@/components/VictoryPopup'

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnswerRecord {
  id: string
  question_number: number
  question_text: string
  answer_transcript: string
  answer_duration_seconds: number
  wpm: number
  filler_words: Record<string, number>
  pause_timestamps: { start_ms: number; duration_ms: number }[]
  confidence_avg: number
  language_mix: Record<string, number>
  star_s: number
  star_t: number
  star_a: number
  star_r: number
  technical_score: number
  ai_feedback: string
}

interface SessionRecord {
  id: string
  company: string
  round_type: string
  language_pref: string
  started_at: string
  ended_at: string
  duration_seconds: number
  overall_score: number
  wpm_avg: number
  filler_total: number
  error_analysis?: {
    quote: string
    mistake: string
    fix: string
    better_example?: string
  }[]
  comprehensive_summary?: string
  status: string
}

interface Scorecard {
  session: SessionRecord
  answers: AnswerRecord[]
}

// ── Score helpers ─────────────────────────────────────────────────────────────
function starLabel(score: number): string {
  if (score >= 4) return 'Excellent'
  if (score >= 3) return 'Good'
  if (score >= 2) return 'Fair'
  return 'Weak'
}
function starColor(score: number): string {
  if (score >= 4) return 'text-emerald-600 bg-emerald-50'
  if (score >= 3) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}
function overallColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

function StarBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-500 w-8">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{value}/5</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${starColor(value)}`}>
        {starLabel(value)}
      </span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ScorecardPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const printRef = useRef<HTMLDivElement>(null)

  const [scorecard, setScorecard] = useState<Scorecard | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeAnswer, setActiveAnswer] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [showNps, setShowNps] = useState(false)
  const [showVictory, setShowVictory] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.getScorecard(sessionId)
        setScorecard(data as Scorecard)

        // NPS Logic
        if (typeof window !== 'undefined') {
          const visits = parseInt(localStorage.getItem('scorecard_visits') || '0')
          const newVisits = visits + 1
          localStorage.setItem('scorecard_visits', newVisits.toString())
          const hasSeenNps = localStorage.getItem('hasSeenNps') === 'true'
          
          if (newVisits === 3 && !hasSeenNps) {
            setTimeout(() => setShowNps(true), 3000)
            localStorage.setItem('hasSeenNps', 'true')
          }
        }
      } catch {
        setError('Scorecard not found or you do not have access.')
      } finally {
        setLoading(false)
      }
    }
    if (sessionId) load()
  }, [sessionId])

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading your scorecard...</div>
      </div>
    )
  }

  if (error || !scorecard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Scorecard unavailable'}</p>
          <Link href="/dashboard" className="text-indigo-600 text-sm hover:underline">← Back to dashboard</Link>
        </div>
      </div>
    )
  }

  const { session, answers } = scorecard
  const totalFillers = answers.reduce((acc, a) => acc + Object.values(a.filler_words).reduce((s, c) => s + c, 0), 0)
  const avgWpm = answers.length ? Math.round(answers.reduce((s, a) => s + a.wpm, 0) / answers.length) : 0
  const avgConfidence = answers.length
    ? Math.round((answers.reduce((s, a) => s + a.confidence_avg, 0) / answers.length) * 100)
    : 0
  const avgStarS = answers.length ? +(answers.reduce((s, a) => s + (a.star_s || 0), 0) / answers.length).toFixed(1) : 0
  const avgStarT = answers.length ? +(answers.reduce((s, a) => s + (a.star_t || 0), 0) / answers.length).toFixed(1) : 0
  const avgStarA = answers.length ? +(answers.reduce((s, a) => s + (a.star_a || 0), 0) / answers.length).toFixed(1) : 0
  const avgStarR = answers.length ? +(answers.reduce((s, a) => s + (a.star_r || 0), 0) / answers.length).toFixed(1) : 0
  const overallScore = session.overall_score || Math.round(((avgStarS + avgStarT + avgStarA + avgStarR) / 20) * 100)
  const durationMins = session.duration_seconds ? Math.round(session.duration_seconds / 60) : 0

  const COMPANY_LABELS: Record<string, string> = {
    tcs_nqt: 'TCS NQT', infosys: 'Infosys InfyTQ', wipro: 'Wipro NLTH',
    accenture: 'Accenture', startup_react: 'D2C Startup', faang: 'FAANG-Style',
    hr_behavioral: 'HR Behavioral', custom: 'Custom',
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>
      
      {showNps && <NpsSurvey onDismiss={() => setShowNps(false)} />}
      {showVictory && !showNps && overallScore >= 80 && (
        <VictoryPopup score={overallScore} onDismiss={() => setShowVictory(false)} />
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-black/8 px-6 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-700">Interview Scorecard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download PDF
          </button>
          <Link
            href={`/interview/scorecard/${sessionId}/share`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Share on LinkedIn
          </Link>
        </div>
      </div>

      <div ref={printRef} className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Hero Score Card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-indigo-200 text-sm font-medium mb-1">
                  {COMPANY_LABELS[session.company] || session.company} · {session.round_type.charAt(0).toUpperCase() + session.round_type.slice(1)} Round
                </div>
                <div className="text-3xl font-bold mb-1">Interview Scorecard</div>
                <div className="text-indigo-200 text-sm">
                  {new Date(session.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {durationMins > 0 && ` · ${durationMins} minutes`}
                  {' · '}{answers.length} questions answered
                </div>
              </div>
              {/* Overall Score Circle */}
              <div className="text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full flex flex-col items-center justify-center border-2 border-white/30">
                  <div className={`text-4xl font-bold ${overallScore >= 80 ? 'text-emerald-300' : overallScore >= 60 ? 'text-amber-300' : 'text-red-300'}`}>
                    {overallScore}
                  </div>
                  <div className="text-white/60 text-xs">/100</div>
                </div>
                <div className="mt-2 text-xs text-indigo-200">Overall Score</div>
              </div>
            </div>
          </div>

          {/* Quick metrics strip */}
          <div className="grid grid-cols-4 divide-x divide-black/8">
            {[
              { label: 'Avg WPM', value: avgWpm, sub: 'words/min', good: avgWpm >= 120 && avgWpm <= 150 },
              { label: 'Filler Words', value: totalFillers, sub: 'total', good: totalFillers <= 5 },
              { label: 'Confidence', value: `${avgConfidence}%`, sub: 'avg speech clarity', good: avgConfidence >= 80 },
              { label: 'Questions', value: answers.length, sub: 'answered', good: true },
            ].map(m => (
              <div key={m.label} className="px-6 py-4 text-center">
                <div className={`text-2xl font-bold ${m.good ? 'text-emerald-600' : 'text-amber-600'}`}>{m.value}</div>
                <div className="text-xs font-medium text-gray-700 mt-0.5">{m.label}</div>
                <div className="text-xs text-gray-400">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STAR Analysis ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">STAR Analysis</h2>
              <p className="text-xs text-gray-500 mt-0.5">Average scores across all your answers</p>
            </div>

          </div>
          <div className="space-y-3">
            <StarBar label="S" value={avgStarS} />
            <StarBar label="T" value={avgStarT} />
            <StarBar label="A" value={avgStarA} />
            <StarBar label="R" value={avgStarR} />
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <strong>S</strong> = Technical Depth &nbsp;·&nbsp; <strong>T</strong> = Comm Clarity &nbsp;·&nbsp; <strong>A</strong> = Structure &nbsp;·&nbsp; <strong>R</strong> = Specificity
          </div>
        </div>

        {/* ── Comprehensive Summary ─────────────────────────────────────────────── */}
        {session.comprehensive_summary && (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Overall Performance Summary</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{session.comprehensive_summary}</p>
          </div>
        )}

        {/* ── Error Analysis ─────────────────────────────────────────────── */}
        {session.error_analysis && session.error_analysis.length > 0 && (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Critical Mistakes & Fixes</h2>
            <div className="space-y-4">
              {session.error_analysis.map((err, i) => (
                <div key={i} className="border border-red-100 bg-red-50/50 rounded-xl p-4">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Mistake {i + 1}</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-3 text-sm text-gray-600 italic mb-3">
                    "{err.quote}"
                  </div>
                  <p className="text-sm text-gray-800 font-medium mb-1">Why it failed:</p>
                  <p className="text-sm text-gray-600 mb-3">{err.mistake}</p>
                  
                  <p className="text-sm text-emerald-700 font-medium mb-1">How to fix it:</p>
                  <p className="text-sm text-emerald-600 mb-3">{err.fix}</p>
                  
                  {err.better_example && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-800">
                      <strong>Better Example:</strong> "{err.better_example}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Per-Question Breakdown ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Question-by-question breakdown</h2>
          {answers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No answers recorded for this session.</p>
          ) : (
            <div className="flex gap-4">
              {/* Question selector */}
              <div className="w-36 shrink-0 space-y-1.5">
                {answers.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveAnswer(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeAnswer === i
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Q{a.question_number}
                    {a.star_a < 2 && <span className="ml-1 text-xs opacity-60">⚠</span>}
                  </button>
                ))}
              </div>

              {/* Answer details */}
              {answers[activeAnswer] && (
                <div className="flex-1 border border-black/8 rounded-xl p-5 space-y-4">
                  <div>
                    <div className="text-xs text-indigo-600 font-medium mb-1">Question {answers[activeAnswer].question_number}</div>
                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                      {answers[activeAnswer].question_text || 'Question text not recorded'}
                    </p>
                  </div>

                  {/* Transcript */}
                  {answers[activeAnswer].answer_transcript && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-400 mb-1.5">Your answer</div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {answers[activeAnswer].answer_transcript}
                      </p>
                    </div>
                  )}

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'WPM', value: answers[activeAnswer].wpm || '—' },
                      { label: 'Duration', value: `${answers[activeAnswer].answer_duration_seconds || 0}s` },
                      {
                        label: 'Fillers',
                        value: Object.values(answers[activeAnswer].filler_words || {}).reduce((s, c) => s + c, 0),
                      },
                    ].map(m => (
                      <div key={m.label} className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="font-semibold text-gray-900">{m.value}</div>
                        <div className="text-xs text-gray-500">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* STAR scores */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500">STAR Scores</div>
                    <div className="grid grid-cols-4 gap-2">
                      {(['star_s', 'star_t', 'star_a', 'star_r'] as const).map((key, idx) => {
                        const labels = ['Technical', 'Clarity', 'Structure', 'Examples']
                        const val = answers[activeAnswer][key] || 0
                        return (
                          <div key={key} className={`p-2 rounded-lg text-center ${starColor(val)}`}>
                            <div className="font-bold text-lg">{val}</div>
                            <div className="text-xs opacity-80">{labels[idx]}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* AI Feedback */}
                  {answers[activeAnswer].ai_feedback && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                      <div className="text-xs font-medium text-indigo-600 mb-1.5">AI Feedback</div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {answers[activeAnswer].ai_feedback}
                      </p>
                    </div>
                  )}

                  {/* Filler words breakdown */}
                  {Object.keys(answers[activeAnswer].filler_words || {}).length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Filler words used</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(answers[activeAnswer].filler_words).map(([word, count]) => (
                          <span key={word} className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-full font-medium">
                            "{word}" × {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Practice Again CTA ────────────────────────────────────────────── */}
        <div className="bg-indigo-600 rounded-2xl p-6 text-center text-white no-print">
          <h3 className="font-semibold text-lg mb-1">Ready to improve on your weak areas?</h3>
          <p className="text-indigo-200 text-sm mb-4">
            Practice another round to improve your score.
          </p>
          <Link
            href="/interview/setup"
            className="inline-block px-6 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Practice again →
          </Link>
        </div>

      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/lib/api'

const COMPANIES = [
  { id: 'tcs_nqt',       label: 'TCS NQT',          sub: 'Java, SQL, Verbal', icon: '🏢' },
  { id: 'infosys',       label: 'Infosys InfyTQ',   sub: 'Python, DSA, HR',   icon: '💼' },
  { id: 'wipro',         label: 'Wipro NLTH',        sub: 'Communication, OOP', icon: '🌐' },
  { id: 'accenture',     label: 'Accenture',         sub: 'Behavioral, Verbal', icon: '🔷' },
  { id: 'startup_react', label: 'D2C Startup',       sub: 'React, Node, APIs',  icon: '🚀' },
  { id: 'all_in_one',    label: 'All-In-One General',sub: 'Aptitude, Tech, HR',    icon: '🎯' },
  { id: 'faang',         label: 'FAANG-Style',       sub: 'DSA, System Design', icon: '⚡' },
  { id: 'hr_behavioral', label: 'HR Behavioral',     sub: 'STAR, Soft Skills',  icon: '🤝' },
  { id: 'custom',        label: 'Custom Interview',  sub: 'Describe your target', icon: '✏️' },
]

const ROUND_TYPES = [
  { id: 'hr',         label: 'HR Round',         desc: 'Behavioral, STAR answers, communication' },
  { id: 'technical',  label: 'Technical Round',  desc: 'DSA, System Design, role-specific tech' },
  { id: 'managerial', label: 'Managerial Round', desc: 'Leadership, conflict resolution, ownership' },
]

const LANGUAGES = [
  { id: 'english',  label: 'English only',        icon: '🇬🇧' },
  { id: 'hinglish', label: 'Hinglish (recommended)', icon: '🇮🇳', recommended: true },
  { id: 'hindi',    label: 'Hindi primary',        icon: '🔵' },
]

const ROLES = ['sde', 'backend', 'frontend', 'full_stack', 'data_science']

export default function InterviewSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [company, setCompany] = useState('')
  const [roundType, setRoundType] = useState('')
  const [role, setRole] = useState('sde')
  const [language, setLanguage] = useState('hinglish')
  const [resumeText, setResumeText] = useState('')

  const totalSteps = 5

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.startSession({
        company,
        role,
        round_type: roundType,
        language_pref: language,
        resume_text: resumeText || undefined,
      })
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession())
      
      // Redirect to session page with params
      const params = new URLSearchParams({
        session_id: data.session_id,
        company: data.company_display_name,
        round_type: roundType,
        persona: data.voice_persona,
        token: session?.access_token || '',
      })
      router.push(`/interview/session?${params}`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e?.response?.data?.detail || 'Failed to start session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-black/8 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Dashboard
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">{step}/{totalSteps}</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">

            {/* Step 1: Company */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Select your target company</h2>
                <p className="text-sm text-gray-500 mb-6">Each mode has different questions and evaluation criteria.</p>
                <div className="grid grid-cols-2 gap-3">
                  {COMPANIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setCompany(c.id); setStep(2) }}
                      className={`p-4 text-left rounded-xl border-2 transition-all card-hover ${
                        company === c.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-black/8 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{c.icon}</div>
                      <div className="font-semibold text-sm text-gray-900">{c.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.sub}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Round type */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Select round type</h2>
                <p className="text-sm text-gray-500 mb-6">Different rounds test different skills.</p>
                <div className="space-y-3">
                  {ROUND_TYPES.map(r => (
                    <button
                      key={r.id}
                      onClick={() => { setRoundType(r.id); setStep(3) }}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                        roundType === r.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-black/8 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{r.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">← Back</button>
              </motion.div>
            )}

            {/* Step 3: Language */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Language preference</h2>
                <p className="text-sm text-gray-500 mb-6">The AI adapts to how you speak naturally.</p>
                <div className="space-y-3">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.id}
                      onClick={() => { setLanguage(l.id); setStep(4) }}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-3 ${
                        language === l.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-black/8 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <span className="text-2xl">{l.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-900">{l.label}</span>
                        {l.recommended && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Recommended</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(2)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">← Back</button>
              </motion.div>
            )}

            {/* Step 4: Resume paste */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Paste your resume summary</h2>
                <p className="text-sm text-gray-500 mb-2">The AI will ask questions about your specific projects. Optional but highly recommended.</p>
                <div className="relative">
                  <textarea
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value.slice(0, 800))}
                    placeholder="e.g. Built a React + Node.js e-commerce platform handling 500+ daily orders. Worked on PostgreSQL database optimization. Technologies: React, Node.js, Express, PostgreSQL, AWS S3..."
                    rows={6}
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {resumeText.length}/800
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Include project names, technologies, and your role. Be specific.</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(3)} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
                  <button
                    onClick={() => setStep(5)}
                    className="ml-auto px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {resumeText ? 'Continue →' : 'Skip for now →'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Ready to start?</h2>
                <p className="text-sm text-gray-500 mb-6">Review your interview configuration.</p>

                <div className="bg-white rounded-xl border border-black/8 shadow-sm p-5 space-y-3 mb-6">
                  {[
                    ['Company', COMPANIES.find(c => c.id === company)?.label],
                    ['Round Type', ROUND_TYPES.find(r => r.id === roundType)?.label],
                    ['Language', LANGUAGES.find(l => l.id === language)?.label],
                    ['Resume', resumeText ? `${resumeText.length} chars provided` : 'Not provided (generic questions)'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-black/5 text-sm text-gray-400 flex items-center justify-between">
                    <span>Pack usage</span>
                    <span>~20 min · 1 round</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(4)} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
                  <button
                    onClick={handleStart}
                    disabled={loading || !company || !roundType}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Starting...' : 'Start interview →'}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

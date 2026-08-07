'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'

const INDIAN_COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'NIT Trichy', 'NIT Warangal', 'NIT Surathkal', 'BITS Pilani', 'COEP Pune',
  'PICT Pune', 'VIT Vellore', 'VIT Pune', 'MIT Pune', 'Symbiosis Pune',
  'VJTI Mumbai', 'SPIT Mumbai', 'DJ Sanghvi Mumbai', 'KJ Somaiya Mumbai',
  'NSIT Delhi', 'DTU Delhi', 'PEC Chandigarh', 'Thapar Patiala',
  'Anna University', 'PSG Tech Coimbatore', 'RVCE Bangalore', 'BMSCE Bangalore',
]

const TARGET_COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini',
  'Startup', 'FAANG', 'Banking (HDFC/Axis)', 'Cognizant',
]

export default function AuthPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'email' | 'otp' | 'onboarding'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [collegeSlug, setCollegeSlug] = useState<string | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  // Check URL params on load; sign out any lingering session so user must verify via OTP
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('onboarding') === 'true') {
        setStage('onboarding')
      } else {
        const slug = urlParams.get('college')
        if (slug) setCollegeSlug(slug)
        // Check if we have a saved email from a previous OTP send
        const savedEmail = sessionStorage.getItem('auth_pending_email')
        if (savedEmail) {
          setEmail(savedEmail)
          setStage('otp')
          setResendTimer(0)
        }
        // Always sign out so user MUST go through OTP verification
        supabase.auth.signOut().catch(() => {})
      }
    }
  }, [])

  // Onboarding state
  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [gradYear, setGradYear] = useState(2026)
  const [targets, setTargets] = useState<string[]>([])
  const [collegeSuggestions, setCollegeSuggestions] = useState<string[]>([])

function getErrorMessage(e: unknown, defaultMsg: string): string {
  if (!e) return defaultMsg
  if (typeof e === 'string') return e
  if (e instanceof Error) {
    const msg = e.message
    if (msg && msg !== '{}' && msg !== '[object Object]') {
      if (msg.includes('rate limit') || msg.includes('Error sending')) {
        return 'Supabase email limit reached (4 emails/hour on Free tier). Please wait a few minutes or check Supabase Email settings.'
      }
      return msg
    }
  }
  if (typeof e === 'object' && e !== null) {
    const obj = e as Record<string, unknown>
    if (typeof obj.message === 'string' && obj.message !== '{}') return obj.message
    if (typeof obj.msg === 'string') return obj.msg
  }
  return defaultMsg
}

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) throw error
      // Save email so user doesn't need to re-enter if they refresh
      sessionStorage.setItem('auth_pending_email', email.trim())
      setStage('otp')
      setResendTimer(60)
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to send email code. Supabase free tier allows 4 emails/hour — please wait a few minutes.'))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpInput = (index: number, value: string) => {
    const cleanValue = value.trim().toUpperCase()
    if (!/^[A-Z0-9]*$/.test(cleanValue)) return
    if (cleanValue.length > 1) {
      // Handle paste of full OTP
      const chars = cleanValue.slice(0, 6).split('')
      const newOtp = [...otp]
      chars.forEach((c, i) => { if (index + i < 6) newOtp[index + i] = c })
      setOtp(newOtp)
      const nextIndex = Math.min(index + chars.length, 5)
      otpRefs.current[nextIndex]?.focus()
      return
    }
    const newOtp = [...otp]
    newOtp[index] = cleanValue
    setOtp(newOtp)
    if (cleanValue && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('').trim()
    if (code.length < 6) { setError('Enter the complete 6-character verification code'); return }
    setLoading(true)
    setError(null)
    try {
      const cleanEmail = email.trim().toLowerCase()
      const codeVariants = [code.toUpperCase(), code.toLowerCase()]
      const tokenTypes: ('email' | 'signup' | 'magiclink' | 'recovery')[] = ['email', 'signup', 'magiclink', 'recovery']
      
      let data = null
      let lastError = null

      for (const variant of codeVariants) {
        for (const type of tokenTypes) {
          const res = await supabase.auth.verifyOtp({ email: cleanEmail, token: variant, type })
          if (!res.error && res.data?.user) {
            data = res.data
            lastError = null
            break
          }
          lastError = res.error
        }
        if (data) break
      }

      if (lastError || !data) throw lastError || new Error('Invalid code')
      
      // Clear the pending email from storage
      sessionStorage.removeItem('auth_pending_email')
      
      const user = data.user
      if (user) {
        try {
          await apiClient.getProfile()
          router.push('/dashboard')
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status
          if (status === 404) {
            setStage('onboarding')
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Invalid or expired 6-character verification code. Please check and try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleOnboarding = async () => {
    if (!name.trim()) { setError('Enter your name'); return }
    setLoading(true)
    setError(null)
    try {
      await apiClient.completeOnboarding({ name, college, graduation_year: gradYear, target_companies: targets })
      router.push('/dashboard')
    } catch {
      setError('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            InterviewAI
          </div>
          {collegeSlug && (
            <div className="mt-2 text-sm font-medium text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">
              Welcome, {collegeSlug.toUpperCase()} Student!
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-black/8 shadow-lg p-8">
          {/* Email Stage */}
          {stage === 'email' && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Sign in to continue</h1>
              <p className="text-sm text-gray-500 mb-6">We'll send a 6-character verification code to your email</p>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send code →'}
                </button>
              </div>
            </>
          )}

          {/* OTP Stage */}
          {stage === 'otp' && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Enter your verification code</h1>
              <p className="text-sm text-gray-500 mb-6">
                Sent to {email} &nbsp;
                <button
                  onClick={() => { sessionStorage.removeItem('auth_pending_email'); setStage('email'); setOtp(['','','','','','']); setError(null) }}
                  className="text-indigo-500 hover:underline text-xs"
                >Change email</button>
              </p>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
              <div className="flex gap-1.5 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i-1]?.focus()
                    }}
                    className="w-full h-12 text-center text-lg font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 uppercase"
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors mb-3"
              >
                {loading ? 'Verifying...' : 'Verify & continue →'}
              </button>
              <button
                onClick={() => { setResendTimer(30); handleSendOtp() }}
                disabled={resendTimer > 0}
                className="w-full text-sm text-gray-500 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
              </button>
            </>
          )}

          {/* Onboarding Stage */}
          {stage === 'onboarding' && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Tell us about yourself</h1>
              <p className="text-sm text-gray-500 mb-6">Helps us personalise your interview experience</p>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <div className="relative">
                  <input
                    type="text"
                    value={college}
                    onChange={e => {
                      setCollege(e.target.value)
                      setCollegeSuggestions(
                        INDIAN_COLLEGES.filter(c => c.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 5)
                      )
                    }}
                    placeholder="College name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  {collegeSuggestions.length > 0 && college && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {collegeSuggestions.map(s => (
                        <button key={s} onClick={() => { setCollege(s); setCollegeSuggestions([]) }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  value={gradYear}
                  onChange={e => setGradYear(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Target companies</p>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_COMPANIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setTargets(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          targets.includes(c)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleOnboarding}
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : "Let's go →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

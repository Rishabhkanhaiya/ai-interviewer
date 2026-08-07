'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

export default function AuthPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'email' | 'otp' | 'no_account'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let t: NodeJS.Timeout
    if (resendTimer > 0) t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleSendOtp = async () => {
    if (!email.trim()) return setError('Please enter your email')
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (error) return setError(error.message)
    setStage('otp')
    setResendTimer(30)
  }

  const handleOtpInput = (index: number, value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('')
      const next = [...otp]
      chars.forEach((c, i) => { if (index + i < 6) next[index + i] = c })
      setOtp(next)
      otpRefs.current[Math.min(index + chars.length, 5)]?.focus()
      return
    }
    const next = [...otp]; next[index] = clean; setOtp(next)
    if (clean && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('').trim()
    if (code.length < 6) return setError('Please enter the full 6-digit code')
    setLoading(true); setError(null)
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: 'email',
    })
    setLoading(false)
    if (error) return setError('Invalid code. Please try again.')
    if (data.session) {
      // Check if user has an affiliate record
      try {
        const me = await api.getMe()
        if (me.has_affiliate) {
          router.push('/dashboard')
        } else {
          setStage('no_account')
        }
      } catch {
        router.push('/dashboard')
      }
    }
  }

  if (stage === 'no_account') return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="bg-white border border-black/8 rounded-2xl p-8 w-full max-w-md shadow-sm text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">⚠️</div>
        <h2 className="text-xl font-semibold text-[#111827] mb-2">Account not set up yet</h2>
        <p className="text-sm text-[#6B7280] mb-6">
          Your partner account isn&apos;t set up yet. Apply as a freelancer or sign in as a student to get your referral code instantly.
        </p>
        <div className="flex flex-col gap-3">
          <a href="/apply" className="bg-[#4F46E5] text-white font-semibold py-3 rounded-lg hover:bg-[#4338CA] transition text-sm">
            Apply as a freelancer →
          </a>
          <button
            onClick={async () => { await api.registerAffiliate(); router.push('/dashboard') }}
            className="border border-gray-200 text-[#374151] font-semibold py-3 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            I&apos;m a student — create my referral code
          </button>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => setStage('email'))} className="mt-4 text-xs text-[#9CA3AF] hover:underline">
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="bg-white border border-black/8 rounded-2xl p-8 w-full max-w-md shadow-sm">
        <div className="mb-8">
          <div className="font-semibold text-[#4F46E5] mb-6">InterviewAI Partners</div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-2">Sign in to your partner account</h1>
          <p className="text-sm text-[#6B7280]">Enter the email you used when applying</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {stage === 'email' ? (
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition mb-4"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-[#4F46E5] text-white font-semibold py-3 rounded-lg hover:bg-[#4338CA] transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send verification code →'}
            </button>
            <p className="text-xs text-[#9CA3AF] text-center mt-4">
              Not a partner yet?{' '}
              <a href="/apply" className="text-[#4F46E5] hover:underline">Apply here</a>
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-[#6B7280] mb-6">
              We sent a 6-digit code to <strong>{email}</strong>{' '}
              <button onClick={() => { setStage('email'); setOtp(['','','','','','']); setError(null) }} className="text-[#4F46E5] hover:underline text-xs">Change</button>
            </p>
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpInput(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i-1]?.focus() }}
                  className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-[#4F46E5] text-white font-semibold py-3 rounded-lg hover:bg-[#4338CA] transition disabled:opacity-50 mb-4"
            >
              {loading ? 'Verifying...' : 'Verify & Sign in →'}
            </button>
            <div className="text-center text-sm text-[#6B7280]">
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <button onClick={() => { setResendTimer(30); handleSendOtp() }} className="text-[#4F46E5] hover:underline">
                  Resend code
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { supabase } from '@/lib/supabase'

declare global {
  interface Window {
    Razorpay: new (options: object) => { open: () => void }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-script')) { resolve(true); return }
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function BuyPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultPack = searchParams.get('pack') || 'placement_499'

  const [selectedPack, setSelectedPack] = useState(defaultPack)
  const [affiliateCode, setAffiliateCode] = useState(searchParams.get('ref') || '')
  const [affiliateValid, setAffiliateValid] = useState<{valid: boolean, msg: string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate affiliate code on input
  useEffect(() => {
    const check = async () => {
      if (affiliateCode.length >= 6) {
        try {
          const res = await apiClient.validateAffiliate(affiliateCode)
          if (res.data.valid) {
            setAffiliateValid({ valid: true, msg: `Applied! Referred by ${res.data.referrer_name}` })
          } else {
            setAffiliateValid({ valid: false, msg: 'Invalid referral code' })
          }
        } catch { setAffiliateValid({ valid: false, msg: 'Invalid referral code' }) }
      } else {
        setAffiliateValid(null)
      }
    }
    const t = setTimeout(check, 500)
    return () => clearTimeout(t)
  }, [affiliateCode])

  const handlePayment = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }

    setLoading(true)
    setError(null)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) { setError('Razorpay failed to load. Try refreshing.'); return }

      const { data: order } = await apiClient.createOrder(selectedPack, affiliateCode || undefined)
      const { data: profile } = await apiClient.getProfile()

      const rzp = new window.Razorpay({
        key: order.razorpay_key_id,
        amount: order.amount_paise,
        currency: 'INR',
        name: 'InterviewAI',
        description: selectedPack === 'placement_499' ? 'Placement Pack — 10 rounds' : 'Top-Up Pack — 5 rounds',
        order_id: order.order_id,
        prefill: {
          email: session.user.email,
          name: profile.data?.name || '',
        },
        theme: { color: '#4F46E5' },
        handler: () => {
          // Webhook will create the pack on the backend
          router.push('/dashboard?payment=success')
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })
      rzp.open()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      setError(err?.response?.data?.detail || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const price = selectedPack === 'placement_499' ? 499 : 199
  const rounds = selectedPack === 'placement_499' ? 10 : 5
  const minutes = selectedPack === 'placement_499' ? 200 : 100

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-black/8 px-6 py-4">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Complete your purchase</h1>
            <p className="text-sm text-gray-500 mt-1">Secure payment via Razorpay · UPI, card, net banking</p>
          </div>

          {/* Pack Selection */}
          <div className="space-y-3">
            {[
              { id: 'placement_499', price: '₹499', label: 'Placement Pack', sub: '10 rounds · 200 minutes', badge: 'Best value' },
              { id: 'topup_199',     price: '₹199', label: 'Top-Up Pack',    sub: '5 rounds · 100 minutes', badge: null },
            ].map(pack => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedPack === pack.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-black/8 bg-white hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xl text-gray-900">{pack.price}</span>
                      {pack.badge && (
                        <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">{pack.badge}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mt-0.5">{pack.label}</div>
                    <div className="text-xs text-gray-500">{pack.sub}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPack === pack.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                  }`}>
                    {selectedPack === pack.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Affiliate Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Referral code <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={affiliateCode}
              onChange={e => setAffiliateCode(e.target.value.toUpperCase())}
              placeholder="e.g. RAHUL2025"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 uppercase transition-colors ${
                affiliateValid ? (affiliateValid.valid ? 'border-emerald-500 bg-emerald-50' : 'border-red-400 bg-red-50') : 'border-gray-200'
              }`}
            />
            {affiliateValid && (
              <p className={`mt-1.5 text-xs font-medium ${affiliateValid.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                {affiliateValid.valid ? `✓ ${affiliateValid.msg}` : `✕ ${affiliateValid.msg}`}
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-black/8 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">{rounds} rounds · {minutes} min</span>
              <span className="font-medium">₹{price}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-black/5 pt-2 mt-2">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-xl text-indigo-600">₹{price}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Opening payment...' : `Pay ₹${price} →`}
          </button>

          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Secure Payment via Razorpay
            </div>
            
            <p className="text-xs text-gray-400 text-center">
              No subscription, no renewal. One-time charge only.<br />
              All purchases include a GST invoice.
            </p>
            
            <div className="flex items-center gap-4 text-xs mt-2">
              <Link href="/help#refunds" className="text-gray-400 hover:text-gray-700 transition-colors">Refund Policy</Link>
              <span className="text-gray-300">•</span>
              <Link href="/help#terms" className="text-gray-400 hover:text-gray-700 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BuyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <BuyPageInner />
    </Suspense>
  )
}

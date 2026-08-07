'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { CheckCircle } from 'lucide-react'

const marketerTypes = [
  'Content creator (YouTube/Instagram)',
  'LinkedIn educator',
  'Digital marketing freelancer',
  'Placement consultant / coaching institute',
  'Other',
]

const audienceSizes = ['Under 1K', '1K–10K', '10K–50K', '50K–100K', 'Above 100K']
const salesTargets = ['1–10', '10–25', '25–50', '50+']

export default function ApplyPage() {
  const [form, setForm] = useState({
    name: '', email: '', city: '', state: '', marketer_type: '',
    platform_links: '', audience_size: '', promotion_plan: '',
    expected_monthly_sales: '', previous_experience: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.name || !form.email || !form.marketer_type || !form.promotion_plan)
      return setError('Please fill in all required fields')
    if (form.promotion_plan.length < 100)
      return setError('Promotion plan must be at least 100 characters')
    setLoading(true)
    try {
      await api.submitApplication({
        ...form,
        platform_links: form.platform_links.split('\n').filter(Boolean),
        expected_monthly_sales: parseInt(form.expected_monthly_sales) || 0,
      })
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="bg-white border border-black/8 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <CheckCircle size={48} className="text-[#10B981] mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-[#111827] mb-2">Application submitted!</h2>
        <p className="text-[#6B7280]">We review within 48 hours. Check your email for updates.</p>
        <a href="/" className="mt-6 inline-block text-[#4F46E5] hover:underline text-sm">← Back to home</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-[#4F46E5] text-sm hover:underline">← InterviewAI Partners</a>
          <h1 className="text-[32px] font-semibold text-[#111827] mt-4 mb-2">Apply as a freelancer</h1>
          <p className="text-[#6B7280]">Reviewed within 48 hours. Students don&apos;t need to apply — <a href="/auth" className="text-[#4F46E5] hover:underline">sign in directly</a>.</p>
        </div>

        <div className="bg-white border border-black/8 rounded-2xl p-8 shadow-sm space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Full name *</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Email address *</label>
              <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">City *</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition" value={form.city} onChange={e => update('city', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">State</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition" value={form.state} onChange={e => update('state', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-3">I am a *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {marketerTypes.map(type => (
                <label key={type} className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition ${form.marketer_type === type ? 'border-[#4F46E5] bg-[#EEF2FF]' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="type" value={type} checked={form.marketer_type === type} onChange={() => update('marketer_type', type)} className="accent-[#4F46E5]" />
                  <span className="text-sm text-[#374151]">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Your platform links *</label>
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition resize-none" rows={3} placeholder="Paste your Instagram, YouTube, LinkedIn URLs — at least one" value={form.platform_links} onChange={e => update('platform_links', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Audience size</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition" value={form.audience_size} onChange={e => update('audience_size', e.target.value)}>
                <option value="">Select...</option>
                {audienceSizes.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Expected monthly sales</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition" value={form.expected_monthly_sales} onChange={e => update('expected_monthly_sales', e.target.value)}>
                <option value="">Select...</option>
                {salesTargets.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">How you plan to promote *</label>
            <p className="text-xs text-[#9CA3AF] mb-2">Tell us specifically how you will promote. This is what we evaluate. (min 100 characters)</p>
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition resize-none" rows={5} value={form.promotion_plan} onChange={e => update('promotion_plan', e.target.value)} />
            <span className="text-xs text-[#9CA3AF]">{form.promotion_plan.length}/100 minimum</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Previous affiliate experience (optional)</label>
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition resize-none" rows={3} value={form.previous_experience} onChange={e => update('previous_experience', e.target.value)} />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#4F46E5] text-white font-semibold py-3.5 rounded-lg hover:bg-[#4338CA] transition disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit application →'}
          </button>
        </div>
      </div>
    </div>
  )
}

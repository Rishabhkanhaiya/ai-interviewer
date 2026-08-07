'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export default function BecomeAffiliatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    state: '',
    marketer_type: 'Campus Ambassador',
    platform_links: '',
    audience_size: '0',
    promotion_plan: '',
    previous_experience: '',
    expected_monthly_sales: '10'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // If not logged in, they need an account first
        router.push('/auth?redirect=/become-affiliate')
        return
      }
      
      const payload = {
        ...formData,
        platform_links: formData.platform_links.split(',').map(l => l.trim()).filter(Boolean),
        audience_size: parseInt(formData.audience_size),
        expected_monthly_sales: parseInt(formData.expected_monthly_sales)
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/affiliates/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        throw new Error('Failed to submit application')
      }
      
      router.push('/dashboard')
      
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">← Back to home</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Become an Affiliate Partner</h1>
          <p className="text-gray-500 mt-2">Earn ₹100 per sale for campus ambassadors, up to ₹150 for professional marketers.</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type</label>
              <select name="marketer_type" value={formData.marketer_type} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600 bg-white">
                <option value="Campus Ambassador">Student Campus Ambassador</option>
                <option value="Freelance Marketer">Freelance Marketer / Creator</option>
                <option value="Agency">Marketing Agency</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Social Links / Profiles (comma separated)</label>
              <input required type="text" name="platform_links" placeholder="https://instagram.com/..., https://linkedin.com/..." value={formData.platform_links} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Audience Size</label>
                <input required type="number" min="0" name="audience_size" value={formData.audience_size} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Monthly Sales</label>
                <input required type="number" min="1" name="expected_monthly_sales" value={formData.expected_monthly_sales} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Plan (Min 100 chars)</label>
              <textarea required minLength={100} name="promotion_plan" rows={4} placeholder="How do you plan to promote InterviewAI?" value={formData.promotion_plan} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Previous Experience (Optional)</label>
              <textarea name="previous_experience" rows={2} placeholder="Any relevant past experience?" value={formData.previous_experience} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-indigo-600" />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

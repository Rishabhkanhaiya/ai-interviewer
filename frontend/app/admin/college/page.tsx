'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function CollegeAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [college, setCollege] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth?redirect=/admin/college')
        return
      }
      
      try {
        const [collegeRes, analyticsRes] = await Promise.all([
          api.get('/api/b2b/colleges/me'),
          api.get('/api/b2b/colleges/analytics')
        ])
        
        setCollege(collegeRes.data.college)
        setAnalytics(analyticsRes.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'You do not have access to this dashboard')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleInvite = async () => {
    const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean)
    if (emails.length === 0) return
    
    setInviting(true)
    try {
      await api.post('/api/b2b/colleges/bulk-invite', { emails })
      setInviteSuccess(true)
      setInviteEmails('')
      setTimeout(() => setInviteSuccess(false), 3000)
    } catch (err) {
      alert('Failed to send invites')
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/dashboard" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Return to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{college?.name} Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your students and view placement analytics</p>
          </div>
          <div className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
            {college?.package_tier.toUpperCase()} PLAN
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Enrolled</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{analytics?.total_students} <span className="text-sm text-gray-400 font-normal">/ {college?.max_students}</span></div>
          </div>
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Active Students</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{analytics?.active_students}</div>
          </div>
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{analytics?.average_score}/100</div>
          </div>
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Interviews Conducted</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{analytics?.total_sessions_conducted}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Invite Students</h2>
          <p className="text-sm text-gray-500 mb-4">Enter a comma-separated list of student email addresses to invite them to the portal.</p>
          
          <textarea
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
            className="w-full h-32 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 resize-none mb-4"
            placeholder="student1@college.edu, student2@college.edu..."
          />
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmails}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {inviting ? 'Sending...' : 'Send Invites'}
            </button>
            {inviteSuccess && <span className="text-green-600 text-sm font-medium flex items-center gap-1">✓ Invites sent successfully!</span>}
          </div>
        </div>
        
      </div>
    </div>
  )
}

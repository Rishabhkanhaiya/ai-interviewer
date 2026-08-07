'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'

interface Profile {
  name: string
  email: string
  college: string
  graduation_year: number
  target_companies: string[]
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', college: '', graduation_year: 2026, target_companies: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      try {
        const { data } = await apiClient.getProfile()
        setProfile({
          name: data.name || '',
          email: session.user.email || '',
          college: data.college || '',
          graduation_year: data.graduation_year || 2026,
          target_companies: data.target_companies || [],
        })
      } catch { /* keep defaults */ }
      finally { setLoading(false) }
    }
    init()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await apiClient.updateProfile({
        name: profile.name,
        college: profile.college,
        graduation_year: profile.graduation_year,
        target_companies: profile.target_companies,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { setError('Type DELETE to confirm'); return }
    setDeleting(true)
    try {
      await apiClient.deleteAccount()
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      setError('Failed to delete account. Contact support.')
    } finally {
      setDeleting(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-black/8 flex flex-col py-6 px-4 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-3 mb-6">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">InterviewAI</span>
        </div>
        {[
          { href: '/dashboard',         label: 'Dashboard',      icon: '🏠' },
          { href: '/interview/setup',   label: 'Start Interview', icon: '🎤' },
          { href: '/dashboard/history', label: 'My Sessions',    icon: '📋' },
          { href: '/buy',                label: 'Buy Pack',        icon: '💳' },
          { href: '/affiliate',          label: 'Refer & Earn',   icon: '🔗' },
          { href: '/blog',               label: 'Blog & Resources', icon: '📝' },
          { href: '/help',               label: 'Help & FAQ',      icon: '❓' },
          { href: '/settings',           label: 'Settings',        icon: '⚙️', active: true },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
              item.active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
        <div className="mt-auto">
          <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your profile and account preferences</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
          )}

          {/* Profile */}
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-400">Email cannot be changed (used for OTP login)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">College</label>
                <input
                  value={profile.college}
                  onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
                  placeholder="e.g. PICT Pune"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Graduation year</label>
                <select
                  value={profile.graduation_year}
                  onChange={e => setProfile(p => ({ ...p, graduation_year: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                >
                  {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target companies or roles <span className="font-normal text-gray-400">(comma separated)</span></label>
                <input
                  value={profile.target_companies.join(', ')}
                  onChange={e => setProfile(p => ({ ...p, target_companies: e.target.value.split(',').map(s => s.trim()) }))}
                  placeholder="e.g. Google, Frontend Engineer, SDE"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                  saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:opacity-50`}
              >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Sign out</h2>
            <p className="text-sm text-gray-500 mb-4">Signs you out from this device only.</p>
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
            <h2 className="font-semibold text-red-600 mb-1">Danger zone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Deleting your account permanently removes all your sessions, scores, and pack data. This cannot be undone.
            </p>
            {!deleteMode ? (
              <button
                onClick={() => setDeleteMode(true)}
                className="px-5 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-600">Type <strong>DELETE</strong> to confirm:</p>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDeleteMode(false); setDeleteConfirm('') }}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirm !== 'DELETE'}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Permanently delete account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

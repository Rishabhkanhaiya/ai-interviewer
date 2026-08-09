'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopBar } from '@/components/ui/TopBar'

interface Profile {
  name: string
  email: string
  college: string
  graduation_year: number
  target_companies: string[]
  resume_text?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', college: '', graduation_year: 2026, target_companies: [], resume_text: '' })
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
          resume_text: data.resume_text || '',
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
        resume_text: profile.resume_text,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setSaving(true)
    try {
      const data = await apiClient.uploadResume(file)
      setProfile(p => ({ ...p, resume_text: data.text }))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload/parse resume.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }



  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar onSignOut={handleSignOut} userName={profile?.name} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar breadcrumb="Settings" />
        
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-sm text-[var(--color-text-secondary)]">Loading...</div>
            </div>
          ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 24 }}>Settings</h1>
            </div>

            {error && (
              <div style={{ padding: '10px 16px', background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 14 }}>{error}</div>
            )}

            {/* Profile */}
            <div className="ui-card" style={{ padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>Profile</h2>
              <div className="space-y-4">
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Full name</label>
                  <input
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="ui-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Email</label>
                  <input
                    value={profile.email}
                    disabled
                    className="ui-input"
                  />
                  <p className="mt-1 text-xs text-gray-400">Email cannot be changed (used for OTP login)</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>College</label>
                  <input
                    value={profile.college}
                    onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
                    placeholder="e.g. PICT Pune"
                    className="ui-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Graduation year</label>
                  <select
                    value={profile.graduation_year}
                    onChange={e => setProfile(p => ({ ...p, graduation_year: Number(e.target.value) }))}
                    className="ui-input num"
                  >
                    {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Target companies or roles <span className="font-normal text-gray-400">(comma separated)</span></label>
                  <input
                    value={profile.target_companies.join(', ')}
                    onChange={e => setProfile(p => ({ ...p, target_companies: e.target.value.split(',').map(s => s.trim()) }))}
                    placeholder="e.g. Google, Frontend Engineer, SDE"
                    className="ui-input"
                  />
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  {saved && <span style={{ fontSize: 14, color: 'var(--color-success)', fontWeight: 500 }}>✓ Saved!</span>}
                </div>
              </div>
            </div>

            {/* Resume Context */}
            <div className="ui-card" style={{ padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Saved Resume / Context</h2>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                Save your resume or job description here. It will be automatically suggested in your next interview setup.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--color-text-secondary)]">Upload PDF/DOCX</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-[var(--color-text-tertiary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:bg-indigo-500/10 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--color-text-secondary)] mt-4">Or paste your text</label>
                  <textarea
                    value={profile.resume_text || ''}
                    onChange={e => setProfile(p => ({ ...p, resume_text: e.target.value }))}
                    placeholder="Paste your resume or context here..."
                    className="w-full h-40 p-3 border border-[var(--color-border-strong)] rounded-lg text-sm text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 focus:border-indigo-500 bg-[var(--color-surface-sunken)]"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{profile.resume_text?.length || 0} / 3000 chars</div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  {saved && <span style={{ fontSize: 14, color: 'var(--color-success)', fontWeight: 500 }}>✓ Saved!</span>}
                </div>
              </div>
            </div>

            {/* Sign out */}
            <div className="ui-card" style={{ padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>Sign out</h2>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">Signs you out from this device only.</p>
              <button
                onClick={handleSignOut}
                className="btn-ghost"
              >
                Sign out
              </button>
            </div>

            {/* Danger zone */}
            <div className="ui-card" style={{ border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: 24, background: 'var(--color-danger-subtle)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-danger)', marginBottom: 16 }}>Danger zone</h2>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                Deleting your account permanently removes all your sessions, scores, and pack data. This cannot be undone.
              </p>
              {!deleteMode ? (
                <button
                  onClick={() => setDeleteMode(true)}
                  className="btn-primary"
                  style={{ background: 'var(--color-danger)', border: 'none' }}
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
                    className="ui-input"
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => { setDeleteMode(false); setDeleteConfirm('') }}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteConfirm !== 'DELETE'}
                      className="btn-primary"
                      style={{ background: 'var(--color-danger)', border: 'none' }}
                    >
                      {deleting ? 'Deleting...' : 'Permanently delete account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  )
}


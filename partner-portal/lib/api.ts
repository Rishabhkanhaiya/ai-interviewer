import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || 'API error')
  }
  return res.json()
}

export const api = {
  // Affiliate profile
  getMe: () => apiFetch('/api/affiliates/me'),
  getStats: (period = 'this_month') => apiFetch(`/api/affiliates/stats?period=${period}`),
  getReferrals: (page = 1, status = 'all') => apiFetch(`/api/affiliates/referrals?page=${page}&status=${status}`),
  getPayouts: () => apiFetch('/api/affiliates/payouts'),
  updatePayoutDetails: (upiId: string) => apiFetch('/api/affiliates/payout-details', {
    method: 'PUT',
    body: JSON.stringify({ upi_id: upiId }),
  }),

  // Sub-links
  getLinks: () => apiFetch('/api/affiliates/links'),
  createLink: (sourceName: string) => apiFetch('/api/affiliates/links', {
    method: 'POST',
    body: JSON.stringify({ source_name: sourceName }),
  }),

  // Leaderboard
  getLeaderboard: () => apiFetch('/api/affiliates/leaderboard'),
  toggleLeaderboard: (optedIn: boolean) => apiFetch('/api/affiliates/leaderboard-optin', {
    method: 'PUT',
    body: JSON.stringify({ opted_in: optedIn }),
  }),

  // Drives
  getUpcomingDrives: () => apiFetch('/api/drives/upcoming'),

  // Application (no auth)
  submitApplication: (data: Record<string, unknown>) =>
    fetch(`${API_URL}/api/affiliates/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Register as campus affiliate
  registerAffiliate: () => apiFetch('/api/affiliates/register', { method: 'POST' }),
}

export default api

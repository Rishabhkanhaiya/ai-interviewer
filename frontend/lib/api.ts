import axios from 'axios'
import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
})

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export default api

// ── Typed API helpers ─────────────────────────────────────────────────────────

export interface PackStatus {
  has_active_pack: boolean
  pack?: {
    pack_id: string
    pack_type: string
    rounds_total: number
    rounds_used: number
    rounds_remaining: number
    minutes_total: number
    minutes_used: number
    minutes_remaining: number
  }
}

export interface StartSessionRequest {
  company: string
  role: string
  round_type: string
  language_pref: string
  resume_text?: string
}

export interface StartSessionResponse {
  session_id: string
  voice_persona: string
  company_display_name: string
  stage: string
}

export interface Session {
  id: string
  company: string
  role: string
  round_type: string
  started_at: string
  ended_at?: string
  duration_seconds?: number
  overall_score?: number
  wpm_avg?: number
  status: string
}

export const apiClient = {
  // Users
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data: object) => api.put('/api/users/profile', data),
  completeOnboarding: (data: object) => api.post('/api/users/onboarding', data),
  uploadResume: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/api/users/profile/parse-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },
  getPackStatus: (): Promise<{ data: PackStatus }> => api.get('/api/users/pack-status'),
  deleteAccount: () => api.delete('/api/users/me'),
  getLeaderboard: () => api.get('/api/users/leaderboard'),

  // Sessions
  startSession: (data: StartSessionRequest): Promise<{ data: StartSessionResponse }> =>
    api.post('/api/sessions/start', data),
  listSessions: (limit = 10, offset = 0): Promise<{ data: { sessions: Session[], total: number } }> =>
    api.get(`/api/sessions?limit=${limit}&offset=${offset}`),
  getScorecard: (sessionId: string) => api.get(`/api/sessions/${sessionId}/scorecard`),

  // Payments
  createOrder: (packType: string, affiliateCode?: string) =>
    api.post('/api/payments/create-order', { pack_type: packType, affiliate_code: affiliateCode }),
  validateAffiliate: (code: string) => api.get(`/api/payments/validate-affiliate/${code}`),

  // Affiliates
  registerAffiliate: () => api.post('/api/affiliates/register'),
  getAffiliateDashboard: () => api.get('/api/affiliates/dashboard'),
  getAffiliateSubLinks: () => api.get('/api/affiliates/links'),
  createAffiliateSubLink: (source_name: string) => api.post('/api/affiliates/links', { source_name }),
  updateUpi: (upi_id: string) => api.put('/api/affiliates/upi', { upi_id }),

  // Admin
  getAdminMetrics: () => api.get('/api/admin/metrics'),
  approvePayout: (id: string) => api.post(`/api/admin/payouts/${id}/approve`),
  toggleMaintenance: (enabled: boolean) => api.post('/api/admin/maintenance', { enabled }),

  // Admin Posts
  getAdminPosts: () => api.get('/api/admin/posts'),
  getAdminPost: (id: string) => api.get(`/api/admin/posts/${id}`),
  createAdminPost: (data: any) => api.post('/api/admin/posts', data),
  updateAdminPost: (id: string, data: any) => api.put(`/api/admin/posts/${id}`, data),
  deleteAdminPost: (id: string) => api.delete(`/api/admin/posts/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Public Posts
  getPosts: (category?: string) => api.get(`/api/posts${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getPostBySlug: (slug: string) => api.get(`/api/posts/${slug}`),

  // Notifications
  getInAppNotifications: () => api.get('/api/notifications/in-app'),
  markNotificationRead: (id: string) => api.post(`/api/notifications/in-app/${id}/read`),
  sendAdminNotification: (data: { title: string, message: string, link?: string, user_id?: string, type?: string }) => 
    api.post('/api/notifications/in-app/admin-send', data),
}

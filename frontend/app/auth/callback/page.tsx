'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase client automatically processes location.hash or PKCE parameters
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      try {
        await apiClient.getProfile()
        // User exists in backend database
        router.push('/dashboard')
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          // New user needs onboarding
          router.push('/auth?onboarding=true')
        } else {
          router.push('/dashboard')
        }
      }
    }
    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-sm text-gray-500 font-medium">Verifying your login...</div>
    </div>
  )
}

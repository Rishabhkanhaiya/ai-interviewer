'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

/**
 * Drop this inside any layout to track page views automatically.
 * Uses pathname changes — works with Next.js App Router.
 */
export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      posthog.capture('$pageview', { $current_url: window.location.href })
    }
  }, [pathname])

  return null
}

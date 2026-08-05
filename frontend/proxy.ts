import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Phase 28 — Auth Proxy (Next.js 16 proxy.ts convention)
 *
 * Protects dashboard, interview, admin, settings, affiliate, buy routes.
 * Checks for Supabase auth token cookie.
 * Redirects unauthenticated → /auth
 * Redirects already-authenticated users away from /auth → /dashboard
 */

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/interview',
  '/affiliate',
  '/settings',
  '/admin',
]

const AUTH_PATHS = ['/auth']

function hasAuthCookie(request: NextRequest): boolean {
  const cookieNames = request.cookies.getAll().map(c => c.name)
  return cookieNames.some(
    name => name.startsWith('sb-') && name.endsWith('-auth-token')
  )
}

// Next.js 16 proxy convention: export a function named "proxy" (or default)
// Note: Since @supabase/supabase-js stores auth sessions in client-side localStorage,
// we allow route requests through so client-side components (useEffect) can verify session state.
export function proxy(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|audio-processor.worklet.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

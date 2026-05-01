'use client'

import { useAuth } from '@/hooks/useAuth'

/**
 * Returns `true` once the auth store has hydrated from localStorage.
 * Use this in every dashboard page instead of manually destructuring
 * `hasHydrated` and rendering a skeleton guard.
 *
 * The dashboard layout already waits for hydration before rendering
 * any children, so this is a secondary safety net for page-level queries
 * that should not fire before the token is available.
 */
export function usePageGuard(): boolean {
  const { hasHydrated } = useAuth()
  return hasHydrated
}

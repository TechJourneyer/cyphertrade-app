'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useAuthStore, selectUser, selectToken, selectIsAuthed, selectHasHydrated } from '@/store/auth'
import { logout as apiLogout } from '@/api/auth'

export function useAuth() {
  const router  = useRouter()
  const user    = useAuthStore(selectUser)
  const token   = useAuthStore(selectToken)
  const isAuthed = useAuthStore(selectIsAuthed)
  const hasHydrated = useAuthStore(selectHasHydrated)
  const storeLogout = useAuthStore((s) => s.logout)

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore errors — clear session regardless
    } finally {
      storeLogout()
      router.replace('/login')
    }
  }, [storeLogout, router])

  const hasRole = useCallback(
    (role: string) => user?.roles.includes(role) ?? false,
    [user],
  )

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user],
  )

  return {
    user,
    token,
    isAuthed,
    hasHydrated,
    logout,
    hasRole,
    hasPermission,
  }
}

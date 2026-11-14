'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getMe } from '@/api/auth'
import { useAuthStore, selectHasHydrated, selectIsAuthed } from '@/store/auth'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router       = useRouter()
  const hasHydrated  = useAuthStore(selectHasHydrated)
  const isAuthed     = useAuthStore(selectIsAuthed)
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => {
    setMobileNav(false)
  }, [pathname])

  useEffect(() => {
    if (hasHydrated && !isAuthed) {
      router.replace('/login')
    }
  }, [hasHydrated, isAuthed, router])

  useEffect(() => {
    if (!hasHydrated || !isAuthed) return
    let cancelled = false
    getMe()
      .then((user) => {
        if (!cancelled) useAuthStore.getState().setUser(user)
      })
      .catch(() => {
        // A 401 is handled by the API client. Keep the saved session for other errors.
      })
    return () => {
      cancelled = true
    }
  }, [hasHydrated, isAuthed])

  // While Zustand rehydrates from localStorage, show a minimal loading state
  if (!hasHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    )
  }

  // Auth guard — will redirect; return null to avoid flash
  if (!isAuthed) return null

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {mobileNav && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      )}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileNav}
        onMobileClose={() => setMobileNav(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onOpenMenu={() => setMobileNav(true)} />
        <NoAccountBanner />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

/** Shows a dismissible warning strip when the user has no trading accounts registered. */
function NoAccountBanner() {
  const { hasAccounts, isLoading } = useTradingAccount()

  if (isLoading || hasAccounts) return null

  return (
    <div className="flex items-center gap-3 border-b border-warning/20 bg-warning/10 px-4 py-2.5">
      <p className="text-xs font-medium text-warning">No trading account registered.</p>
      <p className="hidden text-xs text-muted-foreground sm:block">
        Bots, orders and trades require a linked account.
      </p>
      <Link
        href="/trading-accounts"
        className="ml-auto shrink-0 rounded-md bg-warning/20 px-3 py-1 text-xs font-medium text-warning hover:bg-warning/30 transition-colors"
      >
        Register account →
      </Link>
    </div>
  )
}

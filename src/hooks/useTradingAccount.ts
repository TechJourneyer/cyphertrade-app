'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTradingAccountStore } from '@/store/trading-account'
import * as tradingAccountsApi from '@/api/trading-accounts'
import { useAuth } from '@/hooks/useAuth'
import type { TradingAccount } from '@/types/api'

export function useTradingAccount() {
  const { hasHydrated } = useAuth()
  const { activeAccountId, setActiveAccountId } = useTradingAccountStore()

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['trading-accounts', 'all'],
    queryFn: () => tradingAccountsApi.list(1, 100),
    enabled: hasHydrated,
    staleTime: 60_000,
  })

  // API returns { success, message, data: TradingAccount[], meta } (flat envelope)
  const accounts: TradingAccount[] = (rawData as any)?.data ?? []

  useEffect(() => {
    if (accounts.length === 0) return
    // Auto-select first account if persisted id no longer exists in the list
    const exists = accounts.some((a) => a.id === activeAccountId)
    if (!exists) {
      setActiveAccountId(accounts[0].id)
    }
  }, [accounts, activeAccountId, setActiveAccountId])

  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) ?? accounts[0] ?? null

  return {
    accounts,
    activeAccount,
    activeAccountId: activeAccount?.id ?? null,
    setActiveAccountId,
    hasAccounts: accounts.length > 0,
    isLoading,
  }
}

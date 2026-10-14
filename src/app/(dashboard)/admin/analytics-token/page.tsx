'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageShell } from '@/components/layout/PageShell'
import { SELECT_CLASS } from '@/components/forms/trading-account-fields'
import { useAuth } from '@/hooks/useAuth'
import * as marketAdminApi from '@/api/market-admin'

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

export default function AnalyticsTokenPage() {
  const { hasHydrated, hasRole } = useAuth()
  const queryClient = useQueryClient()
  const [broker, setBroker] = useState('upstox')
  const [token, setToken] = useState('')

  const status = useQuery({
    queryKey: ['broker-credential', broker],
    queryFn: () => marketAdminApi.getBrokerCredential(broker),
    enabled: hasHydrated && hasRole('admin'),
  })

  const save = useMutation({
    mutationFn: () => marketAdminApi.saveBrokerCredential(token.trim(), broker),
    onSuccess: () => {
      setToken('')
      queryClient.invalidateQueries({ queryKey: ['broker-credential', broker] })
    },
  })

  const verify = useMutation({
    mutationFn: () => marketAdminApi.verifyBrokerCredential(broker),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-credential', broker] })
    },
  })

  if (!hasHydrated) return <PageShell title="Analytics token" isLoading />

  if (!hasRole('admin')) {
    return (
      <PageShell title="Analytics token">
        <p className="text-sm text-muted-foreground">Only an admin can manage the shared market-data token.</p>
      </PageShell>
    )
  }

  const current = verify.data ?? status.data
  const check = verify.data?.check

  return (
    <PageShell
      title="Analytics token"
      description="Shared broker token for market data, backtests, and other calls that are not a user's order session."
      breadcrumbs={[{ label: 'Admin' }, { label: 'Analytics token' }]}
    >
      <div className="max-w-lg rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Broker</label>
          <select className={SELECT_CLASS} value={broker} onChange={(event) => setBroker(event.target.value)}>
            <option value="upstox">Upstox</option>
            <option value="zerodha">Zerodha</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Upstox is checked against the market quote API. Another broker can be added later without using a user login token.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {current?.has_token ? 'A token is saved.' : 'No token is saved.'}
          {current?.last_verified_at ? ` Last check ${new Date(current.last_verified_at).toLocaleString('en-IN')}.` : ''}
          {current?.verification_message ? ` ${current.verification_message}` : ''}
        </p>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Analytics token</label>
          <Input
            type="password"
            autoComplete="off"
            value={token}
            placeholder="Paste the token from the broker developer portal"
            onChange={(event) => setToken(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={token.trim().length < 10 || save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : 'Save token'}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={!current?.has_token || verify.isPending} onClick={() => verify.mutate()}>
            {verify.isPending ? 'Checking…' : 'Check token'}
          </Button>
        </div>

        {save.isError && <p className="text-xs text-destructive">{apiErrorMessage(save.error, 'Could not save the token.')}</p>}
        {save.isSuccess && <p className="text-xs text-emerald-700">Token saved. The previous value was replaced.</p>}
        {verify.isError && <p className="text-xs text-destructive">{apiErrorMessage(verify.error, 'Token check failed.')}</p>}
        {check && (
          <p className={`text-xs ${check.ok ? 'text-emerald-700' : 'text-destructive'}`}>{check.message}</p>
        )}
      </div>
    </PageShell>
  )
}

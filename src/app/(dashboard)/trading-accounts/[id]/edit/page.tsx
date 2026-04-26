'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Wifi, WifiOff, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import * as tradingAccountsApi from '@/api/trading-accounts';
import type { CredentialField } from '@/api/trading-accounts';
import type { TradingAccount } from '@/types/api';

// ─── Inline toggle switch ─────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  label,
  onLabel = 'Active',
  offLabel = 'Inactive',
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  onLabel?: string
  offLabel?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{checked ? onLabel : offLabel}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

// ─── Credential field renderer ────────────────────────────────────────────────

function CredentialInput({
  field,
  value,
  onChange,
}: {
  field: CredentialField
  value: string
  onChange: (value: string) => void
}) {
  const baseClass =
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

  if ((field.type === 'select' || field.type === 'select2') && field.options) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={baseClass}>
        <option value="">Select…</option>
        {Object.entries(field.options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    )
  }

  return (
    <Input
      type={field.type === 'password' ? 'password' : 'text'}
      placeholder={field.has_value ? '••••••••  (leave blank to keep existing)' : `Enter ${field.label}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ─── Terminal section ─────────────────────────────────────────────────────────

function TerminalSection({ account }: { account?: TradingAccount | undefined }) {
  const queryClient = useQueryClient()
  const isOn = !!account?.is_terminal_on
  const [isConnecting, setIsConnecting] = useState(false)

  const canAct = Boolean(account?.id)

  const disconnectMutation = useMutation({
    mutationFn: () => {
      if (!canAct) return Promise.reject(new Error('Missing account id'))
      return tradingAccountsApi.disconnect(account!.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading-accounts'] })
    },
  })

  const handleConnect = async () => {
    if (!canAct) {
      // defensive: avoid calling API with undefined id
      // caller may click too early while data hydrates
      // silently ignore the click
      // eslint-disable-next-line no-console
      console.warn('Connect requested but account id is missing')
      return
    }

    setIsConnecting(true)
    try {
      const loginUrl = await tradingAccountsApi.getRedirectUrl(account!.id)
      if (loginUrl) {
        window.open(loginUrl, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Terminal Connection</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isOn
              ? 'Your trading terminal is active. You can place orders.'
              : 'Connect your broker account to activate the terminal.'}
          </p>
        </div>
        <StatusBadge status={isOn ? 'active' : 'inactive'} />
      </div>

      <div className="flex gap-2">
        {isOn ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
            disabled={disconnectMutation.isPending || !canAct}
            onClick={() => disconnectMutation.mutate()}
          >
            {disconnectMutation.isPending
              ? <Loader2 size={13} className="animate-spin" />
              : <WifiOff size={13} />}
            Disconnect Terminal
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-1.5 text-xs"
            disabled={isConnecting || !canAct}
            onClick={handleConnect}
          >
            {isConnecting
              ? <Loader2 size={13} className="animate-spin" />
              : <Wifi size={13} />}
            Connect Terminal
            <ExternalLink size={11} className="ml-0.5 opacity-70" />
          </Button>
        )}
      </div>

      {!canAct && (
        <p className="text-xs text-muted-foreground">Account information is still loading.</p>
      )}

      {disconnectMutation.isError && (
        <p className="text-xs text-destructive">
          {(disconnectMutation.error as Error)?.message || 'Failed to disconnect'}
        </p>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EditTradingAccountPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const accountId = parseInt(params.id, 10)
  const { hasHydrated } = useAuth()
  const queryClient = useQueryClient()

  const oauthStatus = searchParams.get('oauth')
  const oauthMessage = searchParams.get('oauth_message')

  const [accountName, setAccountName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [initialised, setInitialised] = useState(false)

  const { data: accountResponse, isLoading: accountLoading } = useQuery({
    queryKey: ['trading-accounts', accountId],
    queryFn: () => tradingAccountsApi.get(accountId),
    enabled: hasHydrated && !isNaN(accountId),
  })

  const { data: credsResponse, isLoading: credsLoading } = useQuery({
    queryKey: ['trading-accounts', accountId, 'credentials'],
    queryFn: () => tradingAccountsApi.getCredentialsSchema(accountId),
    enabled: hasHydrated && !isNaN(accountId),
  })

  const account: TradingAccount | undefined = (accountResponse as any)?.data
  const credentialFields: CredentialField[] = (credsResponse as any)?.data?.fields ?? []

  // Prefill form once account data arrives (run only once)
  useEffect(() => {
    if (!account || initialised) return
    const normalizedStatus = String(account.status).toLowerCase()
    setAccountName(account.account_name ?? '')
    setIsActive(normalizedStatus !== '0' && normalizedStatus !== 'inactive')
    setInitialised(true)
  }, [account, initialised])

  const mutation = useMutation({
    mutationFn: (payload: tradingAccountsApi.UpdateTradingAccountPayload) =>
      tradingAccountsApi.update(accountId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading-accounts'] })
      router.push('/trading-accounts')
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update account')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const filteredCreds = Object.fromEntries(
      Object.entries(credentials).filter(([, v]) => v.trim() !== '')
    )
    mutation.mutate({
      account_name: accountName,
      status: isActive ? 1 : 0,
      ...(Object.keys(filteredCreds).length > 0 ? { credentials: filteredCreds } : {}),
    })
  }

  const isLoading = !hasHydrated || accountLoading

  if (isLoading) return <Skeleton className="h-64 w-full" />

  if (!account) {
    return (
      <div>
        <PageHeader title="Edit Account" description="Account not found" />
        <p className="text-sm text-muted-foreground">
          The account you are looking for does not exist.{' '}
          <Link href="/trading-accounts" className="text-primary underline underline-offset-2">
            Back to Trading Accounts
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Trading Account"
        description={`Editing "${account.account_name}"`}
        breadcrumbs={[
          { label: 'Trading Accounts', href: '/trading-accounts' },
          { label: account.account_name },
        ]}
      />

      {oauthStatus === 'success' && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {oauthMessage ?? 'Terminal connected successfully.'}
        </div>
      )}

      {oauthStatus === 'error' && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {oauthMessage ?? 'Failed to connect terminal. Please try again.'}
        </div>
      )}

      {/* Terminal section */}
      <TerminalSection account={account} />

      {/* Account form */}
      <div className="max-w-lg rounded-lg border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Account Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Account Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. My Upstox Account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          {/* Broker (read-only) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Broker</label>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/30 px-3 text-sm text-muted-foreground capitalize">
              {account.app_name}
            </div>
          </div>

          {/* Account status toggle */}
          <ToggleSwitch
            label="Account Status"
            checked={isActive}
            onChange={setIsActive}
            onLabel="Active — account is enabled"
            offLabel="Inactive — account is disabled"
          />

          {/* Dynamic credential fields */}
          {credsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : credentialFields.length > 0 ? (
            <>
              <div className="h-px bg-border" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Broker Credentials
                <span className="ml-2 font-normal normal-case">
                  — leave blank to keep saved values
                </span>
              </p>
              {credentialFields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                    {field.has_value && (
                      <span className="ml-2 text-xs font-normal text-emerald-600">✓ saved</span>
                    )}
                  </label>
                  <CredentialInput
                    field={field}
                    value={credentials[field.name] ?? ''}
                    onChange={(v) => setCredentials((prev) => ({ ...prev, [field.name]: v }))}
                  />
                </div>
              ))}
            </>
          ) : null}

          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
            <Link href="/trading-accounts">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

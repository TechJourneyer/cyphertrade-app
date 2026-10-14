'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Wifi, WifiOff, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageShell } from '@/components/layout/PageShell';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import * as tradingAccountsApi from '@/api/trading-accounts';
import type { CredentialField } from '@/api/trading-accounts';
import type { TradingAccount } from '@/types/api';
import { ToggleSwitch, CredentialInput } from '@/components/forms/trading-account-fields';

// ─── Terminal section ─────────────────────────────────────────────────────────

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

function TerminalSection({
  account,
  sandboxEnabled,
}: {
  account?: TradingAccount | undefined
  sandboxEnabled: boolean
}) {
  const queryClient = useQueryClient()
  const isOn = !!account?.is_terminal_on
  const hasToken = !!account?.has_sandbox_token
  const [isConnecting, setIsConnecting] = useState(false)
  const [sandboxToken, setSandboxToken] = useState('')
  const [pendingAction, setPendingAction] = useState<'save' | 'clear' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canAct = Boolean(account?.id)

  const invalidateAccount = () => {
    if (!account?.id) return
    queryClient.invalidateQueries({ queryKey: ['trading-accounts', 'all'] })
    queryClient.invalidateQueries({ queryKey: ['trading-accounts', 'detail', account.id] })
    queryClient.invalidateQueries({ queryKey: ['trading-accounts', 'detail', account.id, 'credentials'] })
  }

  const disconnectMutation = useMutation({
    mutationFn: () => {
      if (!canAct) return Promise.reject(new Error('Missing account id'))
      return tradingAccountsApi.disconnect(account!.id)
    },
    onSuccess: () => {
      setSandboxToken('')
      setNotice('Terminal disconnected.')
      invalidateAccount()
    },
  })

  const sandboxTokenMutation = useMutation({
    mutationFn: (token: string) => {
      if (!canAct) return Promise.reject(new Error('Missing account id'))
      const credentials: Record<string, string> = { sandboxToken: token }
      if (token.trim() !== '') credentials.sandboxEnabled = '1'
      return tradingAccountsApi.update(account!.id, { credentials })
    },
    onSuccess: (updated) => {
      setSandboxToken('')
      setNotice(
        updated.is_terminal_on
          ? 'Sandbox token saved. Terminal is on.'
          : 'Sandbox token cleared. Terminal is off.',
      )
      invalidateAccount()
    },
    onSettled: () => setPendingAction(null),
  })

  const verifyMutation = useMutation({
    mutationFn: () => {
      if (!canAct) return Promise.reject(new Error('Missing account id'))
      const typed = sandboxToken.trim()
      return tradingAccountsApi.verifyToken(account!.id, typed !== '' ? { sandbox_token: typed } : {})
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
        window.location.assign(loginUrl)
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
            {sandboxEnabled
              ? 'Sandbox has no broker redirect. Paste the portal token to turn the terminal on, or clear it to turn the terminal off.'
              : isOn
                ? 'Your trading terminal is active. You can place orders.'
                : 'Connect your broker account to activate the terminal.'}
          </p>
        </div>
        <StatusBadge status={isOn ? 'active' : 'inactive'} />
      </div>

      {sandboxEnabled ? (
        <div className="space-y-3">
          <Input
            type="password"
            autoComplete="off"
            value={sandboxToken}
            placeholder={hasToken ? 'Leave blank to clear the saved token' : 'Paste sandbox token'}
            onChange={(e) => setSandboxToken(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              disabled={!canAct || sandboxTokenMutation.isPending || sandboxToken.trim() === ''}
              onClick={() => {
                setPendingAction('save')
                sandboxTokenMutation.mutate(sandboxToken.trim())
              }}
            >
              {pendingAction === 'save'
                ? <Loader2 size={13} className="animate-spin" />
                : <Wifi size={13} />}
              {isOn ? 'Update token' : 'Turn on terminal'}
            </Button>
            {hasToken && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                disabled={!canAct || sandboxTokenMutation.isPending}
                onClick={() => {
                  setPendingAction('clear')
                  sandboxTokenMutation.mutate('')
                }}
              >
                {pendingAction === 'clear'
                  ? <Loader2 size={13} className="animate-spin" />
                  : <WifiOff size={13} />}
                Clear token
              </Button>
            )}
          </div>
          {hasToken && sandboxToken.trim() === '' && (
            <p className="text-xs text-muted-foreground">
              A token is already saved. Clear token removes it and turns the sandbox terminal off.
            </p>
          )}
        </div>
      ) : (
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
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={!canAct || verifyMutation.isPending}
          onClick={() => verifyMutation.mutate()}
        >
          {verifyMutation.isPending ? 'Checking token…' : 'Check token'}
        </Button>
        <p className="text-xs text-muted-foreground">
          {sandboxEnabled
            ? 'Checks the sandbox token. A value in the box is tested before it is saved. A saved live token is checked too.'
            : 'Checks the live broker token from the last login.'}
        </p>
      </div>

      {verifyMutation.data?.checks.map((check) => (
        <p key={check.kind} className={`text-xs ${check.ok ? 'text-emerald-700' : 'text-destructive'}`}>
          {check.kind}: {check.message}
        </p>
      ))}
      {verifyMutation.isError && (
        <p className="text-xs text-destructive">
          {apiErrorMessage(verifyMutation.error, 'Token check failed')}
        </p>
      )}

      {!canAct && (
        <p className="text-xs text-muted-foreground">Account information is still loading.</p>
      )}

      {notice && !sandboxTokenMutation.isError && !disconnectMutation.isError && (
        <p className="text-xs text-emerald-700">{notice}</p>
      )}

      {sandboxTokenMutation.isError && (
        <p className="text-xs text-destructive">
          {apiErrorMessage(sandboxTokenMutation.error, 'Failed to save sandbox token')}
        </p>
      )}

      {disconnectMutation.isError && (
        <p className="text-xs text-destructive">
          {apiErrorMessage(disconnectMutation.error, 'Failed to disconnect')}
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
  const saveStatus = searchParams.get('save')
  const saveMessage = searchParams.get('save_message')

  const [accountName, setAccountName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [clearSandboxToken, setClearSandboxToken] = useState(false)
  const [sandboxChoice, setSandboxChoice] = useState<'0' | '1' | null>(null)
  const [initialised, setInitialised] = useState(false)
  const [credsReady, setCredsReady] = useState(false)

  const { data: accountResponse, isLoading: accountLoading } = useQuery({
    queryKey: ['trading-accounts', 'detail', accountId],
    queryFn: () => tradingAccountsApi.get(accountId),
    enabled: hasHydrated && !isNaN(accountId),
  })

  const { data: credsResponse, isLoading: credsLoading } = useQuery({
    queryKey: ['trading-accounts', 'detail', accountId, 'credentials'],
    queryFn: () => tradingAccountsApi.getCredentialsSchema(accountId),
    enabled: hasHydrated && !isNaN(accountId),
  })

  const account: TradingAccount | undefined = accountResponse
  const credentialFields: CredentialField[] = credsResponse?.fields ?? []

  // Prefill form once account data arrives (run only once)
  useEffect(() => {
    if (!account || initialised) return
    const normalizedStatus = String(account.status).toLowerCase()
    setAccountName(account.account_name ?? '')
    setIsActive(normalizedStatus !== '0' && normalizedStatus !== 'inactive')
    setSandboxChoice(account.sandbox_enabled ? '1' : '0')
    setInitialised(true)
  }, [account, initialised])

  useEffect(() => {
    if (!credsResponse || credsReady) return
    const prefill: Record<string, string> = {}
    for (const field of credsResponse.fields ?? []) {
      if ((field.type === 'select' || field.type === 'select2') && field.value) {
        prefill[field.name] = field.value
      }
    }
    if (Object.keys(prefill).length > 0) {
      setCredentials((prev) => ({ ...prefill, ...prev }))
    }
    if (prefill.sandboxEnabled === '0' || prefill.sandboxEnabled === '1') {
      setSandboxChoice(prefill.sandboxEnabled)
    }
    setCredsReady(true)
  }, [credsResponse, credsReady])

  const mutation = useMutation({
    mutationFn: (payload: tradingAccountsApi.UpdateTradingAccountPayload) =>
      tradingAccountsApi.update(accountId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading-accounts', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['trading-accounts', 'detail', accountId] })
      queryClient.invalidateQueries({ queryKey: ['trading-accounts', 'detail', accountId, 'credentials'] })
      const params = new URLSearchParams({
        save: 'success',
        save_message: 'Account details updated successfully.',
      })
      router.replace(`/trading-accounts/${accountId}/edit?${params.toString()}`)
    },
    onError: (err: Error) => {
      const params = new URLSearchParams({
        save: 'error',
        save_message: err.message || 'Failed to update account details.',
      })
      router.replace(`/trading-accounts/${accountId}/edit?${params.toString()}`)
    },
  })

  const sandboxEnabled = (sandboxChoice ?? (account?.sandbox_enabled ? '1' : '0')) === '1'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payloadCreds: Record<string, string> = {}
    for (const field of credentialFields) {
      // Sandbox mode edits this token in Terminal Connection, including a blank clear.
      if (field.name === 'sandboxToken' && sandboxEnabled) continue

      const value = (credentials[field.name] ?? '').trim()
      if (value !== '') {
        payloadCreds[field.name] = value
        continue
      }

      // Optional secrets accept an explicit blank and drop the stored value.
      if (field.name === 'sandboxToken' && clearSandboxToken) {
        payloadCreds[field.name] = ''
      }
    }
    mutation.mutate({
      account_name: accountName,
      status: isActive ? 1 : 0,
      ...(Object.keys(payloadCreds).length > 0 ? { credentials: payloadCreds } : {}),
    })
  }

  const isLoading = !hasHydrated || accountLoading

  if (isLoading) return <PageShell title="Edit Trading Account" isLoading />

  if (!account) {
    return (
      <PageShell title="Edit Account" description="Account not found">
        <p className="text-sm text-muted-foreground">
          The account you are looking for does not exist.{' '}
          <Link href="/trading-accounts" className="text-primary underline underline-offset-2">
            Back to Trading Accounts
          </Link>
        </p>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Edit Trading Account"
      description={`Editing "${account.account_name}"`}
      breadcrumbs={[
        { label: 'Trading Accounts', href: '/trading-accounts' },
        { label: account.account_name },
      ]}
    >

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

      {saveStatus === 'success' && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {saveMessage ?? 'Account details updated successfully.'}
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {saveMessage ?? 'Failed to update account details.'}
        </div>
      )}

      {/* Terminal section */}
      <TerminalSection account={account} sandboxEnabled={sandboxEnabled} />

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
              {sandboxEnabled && (
                <p className="text-xs text-muted-foreground">
                  Sandbox token is set in Terminal Connection. Clear token there to remove a saved token.
                </p>
              )}
              {credentialFields.map((field) => {
                if (field.name === 'sandboxToken' && sandboxEnabled) return null
                const sandboxTokenEmpty = field.name === 'sandboxToken' && (credentials[field.name] ?? '').trim() === ''
                return (
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
                      onChange={(v) => {
                        setCredentials((prev) => ({ ...prev, [field.name]: v }))
                        if (field.name === 'sandboxEnabled') {
                          setSandboxChoice(v === '1' ? '1' : '0')
                        }
                        if (field.name === 'sandboxToken' && v.trim() !== '') {
                          setClearSandboxToken(false)
                        }
                      }}
                      hasSaved={field.has_value}
                    />
                    {field.name === 'sandboxToken' && field.has_value && sandboxTokenEmpty && (
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={clearSandboxToken}
                          onChange={(e) => setClearSandboxToken(e.target.checked)}
                        />
                        Clear saved sandbox token
                      </label>
                    )}
                  </div>
                )
              })}
            </>
          ) : null}

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
    </PageShell>
  )
}

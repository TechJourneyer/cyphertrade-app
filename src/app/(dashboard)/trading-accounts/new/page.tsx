'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import * as tradingAccountsApi from '@/api/trading-accounts';
import type { CredentialField } from '@/api/trading-accounts';

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

// ─── Client-side credential schemas (mirrors config/trading-apps.php) ────────

const CREDENTIAL_FIELDS: Record<string, CredentialField[]> = {
  upstox: [
    { name: 'accessKeyId',     label: 'Access Key ID',     type: 'text',     required: true  },
    { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true  },
    { name: 'userId',          label: 'Broker User ID',    type: 'text',     required: true  },
    {
      name: 'sandboxEnabled',
      label: 'Sandbox Mode',
      type: 'select',
      required: true,
      options: { '1': 'Yes', '0': 'No' },
    },
    { name: 'sandboxToken',    label: 'Sandbox Token',     type: 'password', required: false },
  ],
  zerodha: [
    { name: 'accessKeyId',     label: 'Access Key ID',     type: 'text',     required: true },
    { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
    { name: 'userId',          label: 'Broker User ID',    type: 'text',     required: true },
  ],
}

const BROKER_OPTIONS = [
  { value: 'upstox',  label: 'Upstox'  },
  { value: 'zerodha', label: 'Zerodha' },
]

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
      <select value={value} onChange={(e) => onChange(e.target.value)} className={baseClass} required={field.required}>
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
      required={field.required}
      placeholder={`Enter ${field.label}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateTradingAccountPage() {
  const router = useRouter()
  const { hasHydrated } = useAuth()
  const queryClient = useQueryClient()

  const [accountName, setAccountName] = useState('')
  const [appName, setAppName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!hasHydrated) return <Skeleton className="h-64 w-full" />

  const credentialFields = CREDENTIAL_FIELDS[appName] ?? []

  const handleBrokerChange = (broker: string) => {
    setAppName(broker)
    setCredentials({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await tradingAccountsApi.create({
        account_name: accountName,
        app_name: appName,
        status: isActive ? 1 : 0,
        ...(Object.keys(credentials).length > 0 ? { credentials } : {}),
      })
      queryClient.invalidateQueries({ queryKey: ['trading-accounts'] })
      router.push('/trading-accounts')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="New Trading Account"
        description="Register a new broker trading account"
        breadcrumbs={[
          { label: 'Trading Accounts', href: '/trading-accounts' },
          { label: 'New Account' },
        ]}
      />

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

          {/* Broker dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Broker <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={appName}
              onChange={(e) => handleBrokerChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a broker…</option>
              {BROKER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
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
          {credentialFields.length > 0 && (
            <>
              <div className="h-px bg-border" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Broker Credentials
              </p>
              {credentialFields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </label>
                  <CredentialInput
                    field={field}
                    value={credentials[field.name] ?? ''}
                    onChange={(v) => setCredentials((prev) => ({ ...prev, [field.name]: v }))}
                  />
                </div>
              ))}
            </>
          )}

          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Account'}
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

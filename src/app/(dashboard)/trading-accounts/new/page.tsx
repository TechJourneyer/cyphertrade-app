'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import * as tradingAccountsApi from '@/api/trading-accounts';
import {
  ToggleSwitch,
  CredentialInput,
  CREDENTIAL_FIELDS,
  BROKER_OPTIONS,
  SELECT_CLASS,
} from '@/components/forms/trading-account-fields';

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

  if (!hasHydrated) return <PageShell title="New Trading Account" isLoading />

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
    <PageShell
      title="New Trading Account"
      description="Register a new broker trading account"
      breadcrumbs={[
        { label: 'Trading Accounts', href: '/trading-accounts' },
        { label: 'New Account' },
      ]}
    >

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
              className={SELECT_CLASS}
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
    </PageShell>
  )
}

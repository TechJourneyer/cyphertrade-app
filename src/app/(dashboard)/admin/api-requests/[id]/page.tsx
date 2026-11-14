'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/hooks/useAuth'
import * as apiRequestsApi from '@/api/tradingApiRequests'
import { formatWhen } from '@/lib/utils'

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5 break-words text-sm text-foreground">{children}</div>
    </div>
  )
}

function JsonBlock({ value }: { value: unknown }) {
  const text = value == null ? '—' : JSON.stringify(value, null, 2)
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-foreground">
      {text}
    </pre>
  )
}

export default function ApiRequestDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { hasHydrated, hasRole } = useAuth()
  const enabled = hasHydrated && hasRole('admin') && Number.isFinite(id)

  const query = useQuery({
    queryKey: ['trading-api-request', id],
    queryFn: () => apiRequestsApi.get(id),
    enabled,
  })

  if (!hasHydrated || query.isLoading) {
    return <PageShell title="API request" isLoading />
  }

  if (!hasRole('admin')) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
        You do not have permission to view this page.
      </div>
    )
  }

  const row = query.data
  if (query.isError || !row) {
    return (
      <PageShell
        title="API request"
        breadcrumbs={[{ label: 'API requests', href: '/admin/api-requests' }, { label: 'Missing' }]}
      >
        <p className="text-sm text-destructive">This request could not be loaded.</p>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={row.endpoint}
      description={row.account?.account_name ?? 'Broker request'}
      breadcrumbs={[{ label: 'API requests', href: '/admin/api-requests' }, { label: `#${row.id}` }]}
    >
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Fact label="Time">{formatWhen(row.created_at)}</Fact>
          <Fact label="Account">{row.account?.account_name ?? '—'}</Fact>
          <Fact label="Status">
            <StatusBadge status={(row.status_label ?? '').toLowerCase()} />
          </Fact>
          <Fact label="HTTP">{row.status_code ?? '—'}</Fact>
          <Fact label="Group">{row.rate_limit_group ?? '—'}</Fact>
          <Fact label="Message">{row.message || '—'}</Fact>
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Request</h2>
        <JsonBlock value={row.request_params ?? null} />
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Response</h2>
        <JsonBlock value={row.response ?? null} />
      </section>
    </PageShell>
  )
}

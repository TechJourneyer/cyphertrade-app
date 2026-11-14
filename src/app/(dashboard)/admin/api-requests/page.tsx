'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Input } from '@/components/ui/input'
import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/hooks/useAuth'
import * as apiRequestsApi from '@/api/tradingApiRequests'
import { formatWhen } from '@/lib/utils'
import type { TradingApiRequestLog } from '@/types/api'

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Success', value: '1' },
  { label: 'Failure', value: '2' },
  { label: 'Throttled', value: '3' },
  { label: 'Pending', value: '0' },
]

function statusKey(label: string | null): string {
  return (label ?? '').toLowerCase()
}

const columns: DataTableColumn<TradingApiRequestLog>[] = [
  { key: 'created_at', label: 'Time', render: (value) => formatWhen(value) },
  {
    key: 'account',
    label: 'Account',
    render: (_value, row) => row.account?.account_name ?? '—',
  },
  { key: 'endpoint', label: 'Endpoint' },
  {
    key: 'status_label',
    label: 'Status',
    render: (_value, row) => <StatusBadge status={statusKey(row.status_label)} />,
  },
  {
    key: 'status_code',
    label: 'HTTP',
    render: (value) => (value == null || value === '' ? '—' : String(value)),
  },
  {
    key: 'message',
    label: 'Message',
    render: (value) => (typeof value === 'string' && value !== '' ? value : '—'),
  },
  {
    key: 'id',
    label: 'Details',
    render: (_value, row) => (
      <Link href={`/admin/api-requests/${row.id}`} className="font-medium text-primary hover:underline">
        View
      </Link>
    ),
  },
]

export default function ApiRequestsPage() {
  const { hasHydrated, hasRole } = useAuth()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [endpoint, setEndpoint] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['trading-api-requests', page, status, date, endpoint],
    queryFn: () => apiRequestsApi.list(page, 20, { status, date, endpoint }),
    enabled: hasHydrated && hasRole('admin'),
  })

  if (!hasHydrated) {
    return <PageShell title="API requests" isLoading />
  }

  if (!hasRole('admin')) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
        You do not have permission to view this page.
      </div>
    )
  }

  return (
    <PageShell
      title="API requests"
      description="Broker calls that change an order or sign in. Quotes and other frequent calls are not stored."
    >
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <select
          value={status}
          aria-label="Status"
          onChange={(event) => {
            setPage(1)
            setStatus(event.target.value)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Input
          type="date"
          aria-label="Date"
          value={date}
          onChange={(event) => {
            setPage(1)
            setDate(event.target.value)
          }}
        />
        <Input
          type="search"
          aria-label="Endpoint"
          placeholder="Search endpoint"
          value={endpoint}
          onChange={(event) => {
            setPage(1)
            setEndpoint(event.target.value)
          }}
        />
      </div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isEmpty={!isLoading && (data?.data.length ?? 0) === 0}
        emptyText="No API requests match these filters"
        pagination={
          data?.meta
            ? {
                currentPage: data.meta.current_page,
                totalPages: data.meta.last_page,
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </PageShell>
  )
}

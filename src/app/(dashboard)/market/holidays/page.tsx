'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/hooks/useAuth'
import { SELECT_CLASS } from '@/components/forms/trading-account-fields'
import * as marketAdminApi from '@/api/market-admin'
import type { MarketHoliday } from '@/api/market-admin'

function formatDate(value: string | null): string {
  if (!value) return '—'
  const dt = new Date(`${value}T00:00:00`)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' })
}

export default function MarketHolidaysPage() {
  const { hasHydrated } = useAuth()
  const [page, setPage] = useState(1)
  const [exchange, setExchange] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))

  const { data, isLoading } = useQuery({
    queryKey: ['market-holidays', page, exchange, year],
    queryFn: () => marketAdminApi.listHolidays(page, { exchange, year }),
    enabled: hasHydrated,
  })

  const columns: DataTableColumn<MarketHoliday>[] = [
    { key: 'date', label: 'Date', render: (value) => formatDate(typeof value === 'string' ? value : null) },
    { key: 'exchange', label: 'Exchange' },
    { key: 'description', label: 'Description', render: (value) => (typeof value === 'string' && value ? value : '—') },
    { key: 'holiday_type', label: 'Type', render: (value) => (typeof value === 'string' && value ? value : '—') },
    { key: 'market_status_label', label: 'Market' },
    {
      key: 'start_time',
      label: 'Session',
      render: (_value, row) => (row.start_time || row.end_time ? `${row.start_time ?? '—'} – ${row.end_time ?? '—'}` : 'Closed'),
    },
  ]

  return (
    <PageShell
      title="Market holidays"
      description="Exchange holidays stored for NSE and BSE."
      breadcrumbs={[{ label: 'Market' }, { label: 'Holidays' }]}
      isLoading={!hasHydrated}
    >
      <div className="flex flex-wrap gap-3">
        <select
          className={SELECT_CLASS + ' max-w-[160px]'}
          value={exchange}
          onChange={(event) => {
            setPage(1)
            setExchange(event.target.value)
          }}
        >
          <option value="">All exchanges</option>
          <option value="NSE">NSE</option>
          <option value="BSE">BSE</option>
        </select>
        <select
          className={SELECT_CLASS + ' max-w-[140px]'}
          value={year}
          onChange={(event) => {
            setPage(1)
            setYear(event.target.value)
          }}
        >
          {[0, 1, 2].map((offset) => {
            const value = String(new Date().getFullYear() - offset)
            return <option key={value} value={value}>{value}</option>
          })}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isEmpty={!isLoading && (data?.data.length ?? 0) === 0}
        emptyText="No holidays are stored for this filter. Seed exchange days to load the holiday calendar."
        pagination={data ? {
          currentPage: data.meta.current_page,
          totalPages: data.meta.last_page,
          onPageChange: setPage,
        } : undefined}
      />
    </PageShell>
  )
}

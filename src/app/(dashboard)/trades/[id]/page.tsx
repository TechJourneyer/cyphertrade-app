'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ActivityList } from '@/components/data-display/ActivityList'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import { PageShell } from '@/components/layout/PageShell'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import * as tradesApi from '@/api/trades'
import { formatCurrency, formatWhen } from '@/lib/utils'
import type { Order } from '@/types/api'

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5 break-words text-sm text-foreground">{children}</div>
    </div>
  )
}

const orderColumns: DataTableColumn<Order>[] = [
  { key: 'order_stage_label', label: 'Stage', render: (_value, row) => row.order_stage_label ?? '—' },
  { key: 'order_type_label', label: 'Type', render: (_value, row) => row.order_type_label ?? '—' },
  {
    key: 'transaction_type',
    label: 'Side',
    render: (_value, row) => row.transaction_type_label ?? row.transaction_type ?? '—',
  },
  { key: 'quantity', label: 'Qty' },
  { key: 'price', label: 'Price', render: (value) => formatCurrency(Number(value)) },
  {
    key: 'status',
    label: 'Status',
    render: (_value, row) => (
      <StatusBadge status={(row.status_label ?? String(row.status ?? '')).toLowerCase()} />
    ),
  },
  { key: 'created_at', label: 'Time', render: (value) => formatWhen(value) },
  {
    key: 'id',
    label: 'Details',
    render: (_value, row) => (
      <Link href={`/orders/${row.id}`} className="font-medium text-primary hover:underline">
        View
      </Link>
    ),
  },
]

export default function TradeDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { hasHydrated } = useAuth()
  const enabled = hasHydrated && Number.isFinite(id)

  const tradeQuery = useQuery({
    queryKey: ['trade', id],
    queryFn: () => tradesApi.get(id),
    enabled,
  })
  const logsQuery = useQuery({
    queryKey: ['trade-logs', id],
    queryFn: () => tradesApi.logs(id),
    enabled,
  })

  const trade = tradeQuery.data

  if (!hasHydrated || tradeQuery.isLoading) {
    return <PageShell title="Trade" isLoading />
  }

  if (tradeQuery.isError || !trade) {
    return (
      <PageShell title="Trade" breadcrumbs={[{ label: 'Trades', href: '/trades' }, { label: 'Missing' }]}>
        <p className="text-sm text-destructive">This trade could not be loaded.</p>
      </PageShell>
    )
  }

  const symbol = trade.instrument?.trading_symbol ?? 'Trade'
  const orders = trade.orders ?? []

  return (
    <PageShell
      title={`${symbol} trade`}
      description={[trade.signal, trade.strategy_name, trade.bot?.name].filter(Boolean).join(' · ')}
      breadcrumbs={[{ label: 'Trades', href: '/trades' }, { label: `#${trade.trade_id}` }]}
    >
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Fact label="Symbol">{symbol}</Fact>
          <Fact label="Signal">{trade.signal ? trade.signal.toUpperCase() : '—'}</Fact>
          <Fact label="Status">
            <span>{trade.status_label ?? trade.status ?? '—'}</span>
            {trade.attention && <p className="text-xs font-medium text-warning">{trade.attention}</p>}
          </Fact>
          <Fact label="Strategy">{trade.strategy_name ?? '—'}</Fact>
          <Fact label="Bot">{trade.bot?.name ?? '—'}</Fact>
          <Fact label="Quantity">{trade.quantity}</Fact>
          <Fact label="Entry target">{formatCurrency(trade.entry_target)}</Fact>
          <Fact label="Stop loss">{formatCurrency(trade.stop_loss)}</Fact>
          <Fact label="Current price">{formatCurrency(trade.current_price)}</Fact>
          <Fact label="P&L">
            <span className={trade.pnl != null && trade.pnl < 0 ? 'text-loss' : 'text-gain'}>
              {formatCurrency(trade.pnl)}
            </span>
          </Fact>
          <Fact label="Risk / reward">{trade.rr_ratio ?? '—'}</Fact>
          <Fact label="Opened">{formatWhen(trade.created_at)}</Fact>
          <Fact label="Started">{formatWhen(trade.trade_start_time)}</Fact>
          <Fact label="Expires">{formatWhen(trade.trade_expiry_time)}</Fact>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Orders</h2>
        <DataTable
          columns={orderColumns}
          data={orders}
          isEmpty={orders.length === 0}
          emptyText="No orders for this trade yet"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Activity</h2>
        <ActivityList logs={logsQuery.data} isLoading={logsQuery.isLoading} />
      </section>
    </PageShell>
  )
}

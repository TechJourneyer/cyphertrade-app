'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ActivityList } from '@/components/data-display/ActivityList'
import { PageShell } from '@/components/layout/PageShell'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import * as ordersApi from '@/api/orders'
import { formatWhen } from '@/lib/utils'

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5 break-words text-sm text-foreground">{children}</div>
    </div>
  )
}

function money(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `₹${Number(value).toFixed(2)}`
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { hasHydrated } = useAuth()
  const enabled = hasHydrated && Number.isFinite(id)

  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    enabled,
  })
  const logsQuery = useQuery({
    queryKey: ['order-logs', id],
    queryFn: () => ordersApi.logs(id),
    enabled,
  })

  const order = orderQuery.data

  if (!hasHydrated || orderQuery.isLoading) {
    return <PageShell title="Order" isLoading />
  }

  if (orderQuery.isError || !order) {
    return (
      <PageShell title="Order" breadcrumbs={[{ label: 'Orders', href: '/orders' }, { label: 'Missing' }]}>
        <p className="text-sm text-destructive">This order could not be loaded.</p>
      </PageShell>
    )
  }

  const symbol = order.instrument?.trading_symbol ?? 'Order'

  return (
    <PageShell
      title={`${symbol} order`}
      description={`${order.order_stage_label ?? 'Order'} · ${order.order_type_label ?? 'Type unknown'}`}
      breadcrumbs={[{ label: 'Orders', href: '/orders' }, { label: `#${order.id}` }]}
    >
      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Fact label="Symbol">{symbol}</Fact>
          <Fact label="Stage">{order.order_stage_label ?? '—'}</Fact>
          <Fact label="Type">{order.order_type_label ?? '—'}</Fact>
          <Fact label="Side">{order.transaction_type_label ?? order.transaction_type ?? '—'}</Fact>
          <Fact label="Status">
            <StatusBadge status={(order.status_label ?? String(order.status ?? '')).toLowerCase()} />
          </Fact>
          <Fact label="Quantity">{order.quantity}</Fact>
          <Fact label="Price">{money(order.price)}</Fact>
          <Fact label="Trigger">{money(order.trigger_price)}</Fact>
          <Fact label="Executed">{money(order.executed_price)}</Fact>
          <Fact label="Fees">{money(order.fees)}</Fact>
          <Fact label="Product">{order.order_product_label ?? order.order_product ?? '—'}</Fact>
          <Fact label="Validity">{order.validity_label ?? order.validity ?? '—'}</Fact>
          <Fact label="Exit reason">{order.exit_reason_label ?? order.exit_reason ?? '—'}</Fact>
          <Fact label="Broker order">{order.broker_order_id ?? '—'}</Fact>
          <Fact label="Order date">{order.order_date ?? '—'}</Fact>
          <Fact label="Executed at">{formatWhen(order.executed_timestamp)}</Fact>
          <Fact label="Trade">
            {order.trade_id != null ? (
              <Link href={`/trades/${order.trade_id}`} className="font-medium text-primary hover:underline">
                Trade {order.trade_id}
                {order.trade?.signal ? ` · ${order.trade.signal.toUpperCase()}` : ''}
              </Link>
            ) : '—'}
          </Fact>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Activity</h2>
        <ActivityList logs={logsQuery.data} isLoading={logsQuery.isLoading} />
      </section>
    </PageShell>
  )
}

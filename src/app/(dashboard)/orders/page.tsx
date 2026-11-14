'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { PageShell } from '@/components/layout/PageShell';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useTradingAccount } from '@/hooks/useTradingAccount';
import * as ordersApi from '@/api/orders';
import { formatWhen } from '@/lib/utils';
import type { Order } from '@/types/api';

interface OrderGroup {
  key: string
  tradeId: number | null
  orders: Order[]
}

function groupOrders(orders: Order[]): OrderGroup[] {
  const groups: OrderGroup[] = []
  const index = new Map<string, OrderGroup>()

  for (const order of orders) {
    const key = order.trade_id == null ? 'none' : String(order.trade_id)
    let group = index.get(key)
    if (!group) {
      group = { key, tradeId: order.trade_id, orders: [] }
      index.set(key, group)
      groups.push(group)
    }
    group.orders.push(order)
  }

  return groups
}

function money(value: unknown): string {
  const n = Number(value)
  if (value === null || value === undefined || Number.isNaN(n)) return '—'
  return `₹${n.toFixed(2)}`
}

const columns: DataTableColumn<Order>[] = [
  {
    key: 'order_stage_label',
    label: 'Stage',
    render: (_value, row) => row.order_stage_label ?? '—',
  },
  {
    key: 'order_type_label',
    label: 'Type',
    render: (_value, row) => row.order_type_label ?? '—',
  },
  {
    key: 'transaction_type',
    label: 'Side',
    render: (_value, row) => row.transaction_type_label ?? row.transaction_type ?? '—',
  },
  { key: 'quantity', label: 'Qty' },
  { key: 'price', label: 'Price', render: (value) => money(value) },
  {
    key: 'status',
    label: 'Status',
    render: (_value, row) => (
      <StatusBadge status={(row.status_label ?? String(row.status ?? '')).toLowerCase()} />
    ),
  },
  {
    key: 'created_at',
    label: 'Time',
    render: (value) => formatWhen(value),
  },
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

export default function OrdersPage() {
  const { hasHydrated } = useAuth();
  const { activeAccountId, isAllAccounts, activeAccount } = useTradingAccount();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeAccountId]);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, activeAccountId],
    queryFn: () => ordersApi.list(page, 20, { account_id: activeAccountId ?? undefined }),
    enabled: hasHydrated,
  });

  const groups = groupOrders(data?.data ?? [])

  if (!hasHydrated) {
    return <PageShell title="Orders" isLoading />;
  }

  return (
    <PageShell
      title="Orders"
      description={
        isAllAccounts
          ? 'Orders grouped by trade. Each block is one trade, with its entry and exit orders together.'
          : `Orders for ${activeAccount?.account_name ?? 'selected account'}, grouped by trade`
      }
    >
      {isLoading && (
        <DataTable columns={columns} data={[]} isLoading />
      )}
      {!isLoading && groups.length === 0 && (
        <DataTable columns={columns} data={[]} isEmpty emptyText="No orders yet" />
      )}
      {!isLoading && groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group) => {
            const sample = group.orders[0]
            const symbol = sample?.instrument?.trading_symbol ?? 'Unknown symbol'
            const trade = sample?.trade
            return (
              <section key={group.key} className="overflow-hidden rounded-lg border border-border">
                <header className="flex flex-col gap-2 border-b border-border bg-secondary/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {symbol}
                      {group.tradeId != null && (
                        <span className="ml-2 font-normal text-muted-foreground">Trade {group.tradeId}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[
                        trade?.signal ? trade.signal.toUpperCase() : null,
                        trade?.strategy_name,
                        trade?.status_label ?? trade?.status,
                      ]
                        .filter(Boolean)
                        .join(' · ') || (group.tradeId == null ? 'Not attached to a trade' : 'Trade')}
                      {' · '}
                      {`${group.orders.length} ${group.orders.length === 1 ? 'order' : 'orders'}`}
                    </p>
                  </div>
                  {group.tradeId != null && (
                    <Link
                      href={`/trades/${group.tradeId}`}
                      className="shrink-0 text-sm font-medium text-primary hover:underline"
                    >
                      Open trade
                    </Link>
                  )}
                </header>
                <DataTable columns={columns} data={group.orders} bare />
              </section>
            )
          })}
          <DataTable
            columns={columns}
            data={[]}
            pagerOnly
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
        </div>
      )}
    </PageShell>
  );
}

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { PageShell } from '@/components/layout/PageShell';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useTradingAccount } from '@/hooks/useTradingAccount';
import * as ordersApi from '@/api/orders';
import { formatWhen } from '@/lib/utils';
import type { Order } from '@/types/api';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: '0' },
  { label: 'Open', value: '1' },
  { label: 'Filled', value: '2' },
  { label: 'Partially filled', value: '3' },
  { label: 'Rejected', value: '4' },
  { label: 'Cancelled', value: '5' },
]

function money(value: unknown): string {
  const n = Number(value)
  if (value === null || value === undefined || Number.isNaN(n)) return '—'
  return `₹${n.toFixed(2)}`
}

function tradeKey(order: Order): string {
  return order.trade_id == null ? 'none' : String(order.trade_id)
}

const columns: DataTableColumn<Order>[] = [
  {
    key: 'instrument',
    label: 'Symbol',
    render: (_value, row) => row.instrument?.trading_symbol ?? '—',
  },
  {
    key: 'trade_id',
    label: 'Trade',
    render: (_value, row) => row.trade_id == null ? '—' : (
      <Link href={`/trades/${row.trade_id}`} className="font-medium text-primary hover:underline">
        #{row.trade_id}
      </Link>
    ),
  },
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
  const [symbolInput, setSymbolInput] = useState('');
  const [symbol, setSymbol] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSymbol(symbolInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [symbolInput]);

  useEffect(() => {
    setPage(1);
  }, [activeAccountId, symbol, date, status]);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, activeAccountId, symbol, date, status],
    queryFn: () => ordersApi.list(page, 20, {
      account_id: activeAccountId ?? undefined,
      symbol: symbol || undefined,
      date: date || undefined,
      status: status || undefined,
    }),
    enabled: hasHydrated,
  });

  const rows = data?.data ?? []
  const tradeStarts = new Set<number>()
  let previous = ''
  for (const order of rows) {
    const key = tradeKey(order)
    if (key !== previous) {
      tradeStarts.add(order.id)
      previous = key
    }
  }

  if (!hasHydrated) {
    return <PageShell title="Orders" isLoading />;
  }

  return (
    <PageShell
      title="Orders"
      description={
        isAllAccounts
          ? 'One grid, grouped by trade. A dark line starts each trade.'
          : `Orders for ${activeAccount?.account_name ?? 'selected account'}. A dark line starts each trade.`
      }
    >
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="order-symbol" className="text-xs text-muted-foreground">Symbol</label>
          <Input
            id="order-symbol"
            type="search"
            placeholder="Search by symbol"
            value={symbolInput}
            onChange={(event) => setSymbolInput(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="order-date" className="text-xs text-muted-foreground">Date</label>
          <Input
            id="order-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="order-status" className="text-xs text-muted-foreground">Status</label>
          <select
            id="order-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyText="No orders match these filters"
        rowClassName={(row) => (
          tradeStarts.has(row.id)
            ? 'border-t-[3px] border-foreground [&>td]:border-t-[3px] [&>td]:border-foreground'
            : undefined
        )}
        pagination={
          data?.meta
            ? {
                currentPage: data.meta.current_page,
                totalPages: Math.max(1, data.meta.last_page),
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </PageShell>
  );
}

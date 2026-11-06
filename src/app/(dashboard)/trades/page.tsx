'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { PageShell } from '@/components/layout/PageShell';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useTradingAccount } from '@/hooks/useTradingAccount';
import * as tradesApi from '@/api/trades';
import { formatCurrency } from '@/lib/utils'
import type { Trade } from '@/types/api';

function formatPrice(value: unknown): string {
  const n = Number(value);
  if (value === null || value === undefined || Number.isNaN(n)) return '—';
  return `₹${n.toFixed(2)}`;
}

function formatWhen(value: unknown): string {
  if (typeof value !== 'string' || value === '') return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TradesPage() {
  const { hasHydrated } = useAuth();
  const { activeAccountId, isAllAccounts, activeAccount } = useTradingAccount();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [symbolInput, setSymbolInput] = useState('');
  const [symbol, setSymbol] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setPage(1);
  }, [activeAccountId, symbol, date]);

  useEffect(() => {
    const timer = setTimeout(() => setSymbol(symbolInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [symbolInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['trades', page, sortBy, sortOrder, activeAccountId, symbol, date],
    queryFn: () => tradesApi.list(page, 20, {
      account_id: activeAccountId ?? undefined,
      symbol: symbol || undefined,
      date: date || undefined,
    }),
    enabled: hasHydrated,
  });

  const columns: DataTableColumn<Trade>[] = [
    { key: 'created_at', label: 'Time', sortable: false, render: (value: unknown) => formatWhen(value) },
    { key: 'instrument', label: 'Symbol', sortable: false, render: (_: unknown, row: Trade) => row.instrument?.trading_symbol ?? '—' },
    { key: 'signal', label: 'Signal', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: false },
    { key: 'entry_target', label: 'Entry Target', sortable: false, render: (value: unknown) => formatPrice(value) },
    { key: 'current_price', label: 'Current Price', sortable: false, render: (value: unknown) => formatPrice(value) },
    { key: 'stop_loss', label: 'Stop Loss', sortable: false, render: (value: unknown) => formatPrice(value) },
    { key: 'pnl', label: 'P&L', sortable: true, render: (value: unknown) => {
      const n = Number(value);
      if (value === null || value === undefined || isNaN(n)) return '—';
      return <span className={`font-semibold font-mono ${n >= 0 ? 'text-gain' : 'text-loss'}`}>₹{n.toFixed(2)}</span>;
    } },
    { key: 'status', label: 'Status', sortable: true, render: (_: unknown, row: Trade) => (
      <div className="flex flex-col gap-0.5">
        <span>{row.status_label ?? row.status ?? '—'}</span>
        {row.attention && (
          <span className="text-xs font-medium text-warning">{row.attention}</span>
        )}
      </div>
    ) },
  ];

  if (!hasHydrated) {
    return <PageShell title="Trades" isLoading />;
  }

  return (
    <PageShell
      title="Trades"
      description={
        isAllAccounts
          ? 'View your trading history and performance across all accounts'
          : `View trading history for ${activeAccount?.account_name ?? 'selected account'}`
      }
    >
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="trade-symbol" className="text-xs text-muted-foreground">Symbol</label>
          <Input
            id="trade-symbol"
            type="search"
            placeholder="Search by symbol"
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="trade-date" className="text-xs text-muted-foreground">Date</label>
          <Input
            id="trade-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      {(data?.meta?.today_trades !== undefined || (data?.meta?.attention_count ?? 0) > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-1 px-4 py-3 text-sm">
          <span>
            Today P&amp;L{' '}
            <span className={`font-mono font-semibold ${(data?.meta?.today_pnl ?? 0) >= 0 ? 'text-gain' : 'text-loss'}`}>
              {formatCurrency(data?.meta?.today_pnl ?? 0)}
            </span>
            <span className="text-muted-foreground"> · {data?.meta?.today_trades ?? 0} trades</span>
          </span>
          {(data?.meta?.attention_count ?? 0) > 0 && (
            <span className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
              {data?.meta?.attention_count} need attention
            </span>
          )}
        </div>
      )}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isEmpty={!data?.data?.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => setSortBy(key)}
        rowClassName={(row) => (row.attention ? 'bg-warning/10' : undefined)}
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
  );
}

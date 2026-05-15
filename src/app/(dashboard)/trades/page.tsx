'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';
import { useTradingAccount } from '@/hooks/useTradingAccount';
import * as tradesApi from '@/api/trades';
import type { Trade } from '@/types/api';

export default function TradesPage() {
  const { hasHydrated } = useAuth();
  const { activeAccountId, isAllAccounts, activeAccount } = useTradingAccount();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setPage(1);
  }, [activeAccountId]);

  const { data, isLoading } = useQuery({
    queryKey: ['trades', page, sortBy, sortOrder, activeAccountId],
    queryFn: () => tradesApi.list(page, 20, { account_id: activeAccountId ?? undefined }),
    enabled: hasHydrated,
  });

  const columns: DataTableColumn<Trade>[] = [
    { key: 'instrument', label: 'Symbol', sortable: false, render: (_: unknown, row: any) => row.instrument?.trading_symbol ?? '—' },
    { key: 'signal', label: 'Signal', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: false },
    { key: 'entry_target', label: 'Entry Target', sortable: false, render: (value: unknown) => `₹${Number(value).toFixed(2)}` },
    { key: 'stop_loss', label: 'Stop Loss', sortable: false, render: (value: unknown) => `₹${Number(value).toFixed(2)}` },
    { key: 'pnl', label: 'P&L', sortable: true, render: (value: unknown) => {
      const n = Number(value);
      if (value === null || value === undefined || isNaN(n)) return '—';
      return <span className={`font-semibold font-mono ${n >= 0 ? 'text-gain' : 'text-loss'}`}>₹{n.toFixed(2)}</span>;
    } },
    { key: 'status', label: 'Status', sortable: true },
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
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isEmpty={!data?.data?.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => setSortBy(key)}
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

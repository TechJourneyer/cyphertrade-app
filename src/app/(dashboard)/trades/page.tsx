'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import * as tradesApi from '@/api/trades';

export default function TradesPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['trades', page, sortBy, sortOrder],
    queryFn: () => tradesApi.list(page, 20),
    enabled: hasHydrated,
  });
  const data = responseData as any;

  const columns: any[] = [
    { key: 'instrument', label: 'Symbol', sortable: false, render: (_: unknown, row: any) => row.instrument?.trading_symbol ?? '—' },
    { key: 'signal', label: 'Signal', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: false },
    { key: 'entry_target', label: 'Entry Target', sortable: false, render: (value: unknown) => `₹${Number(value).toFixed(2)}` },
    { key: 'stop_loss', label: 'Stop Loss', sortable: false, render: (value: unknown) => `₹${Number(value).toFixed(2)}` },
    { key: 'pnl', label: 'P&L', sortable: true, render: (value: unknown) => {
      const n = Number(value);
      if (value === null || value === undefined || isNaN(n)) return '—';
      return <span className={n >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>₹{n.toFixed(2)}</span>;
    } },
    { key: 'status', label: 'Status', sortable: true },
  ];

  if (!hasHydrated) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader title="Trades" description="View your trading history and performance" />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isEmpty={!data?.data?.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => setSortBy(key)}
      />
    </div>
  );
}

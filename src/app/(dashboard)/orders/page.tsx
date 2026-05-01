'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { PageShell } from '@/components/layout/PageShell';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import * as ordersApi from '@/api/orders';
import type { Order } from '@/types/api';

export default function OrdersPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, sortBy, sortOrder],
    queryFn: () => ordersApi.list(page, 20),
    enabled: hasHydrated,
  });

  const columns: DataTableColumn<Order>[] = [
    { key: 'instrument', label: 'Symbol', sortable: false, render: (_: unknown, row: any) => row.instrument?.trading_symbol ?? '—' },
    { key: 'transaction_type', label: 'Side', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: false },
    { key: 'price', label: 'Price', sortable: true, render: (value: unknown) => `₹${Number(value).toFixed(2)}` },
    { key: 'status', label: 'Status', sortable: true, render: (value: unknown) => (
      <StatusBadge status={String(value)} />
    ) },
    { key: 'order_date', label: 'Date', sortable: true },
  ];

  if (!hasHydrated) {
    return <PageShell title="Orders" isLoading />;
  }

  return (
    <PageShell title="Orders" description="View and manage your trading orders">
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isEmpty={!data?.data?.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(key) => setSortBy(key)}
      />
    </PageShell>
  );
}

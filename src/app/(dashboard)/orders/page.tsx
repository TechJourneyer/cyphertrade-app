'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import * as ordersApi from '@/api/orders';

export default function OrdersPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['orders', page, sortBy, sortOrder],
    queryFn: () => ordersApi.list(page, 20),
    enabled: hasHydrated,
  });
  const data = responseData as any;

  const columns: any[] = [
    { key: 'instrument', label: 'Symbol', sortable: false, render: (_: unknown, row: any) => row.instrument?.trading_symbol ?? '—' },
    { key: 'transaction_type', label: 'Side', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: false },
    { key: 'price', label: 'Price', sortable: true, render: (value: unknown) => `₹${Number(value).toFixed(2)}` },
    { key: 'status', label: 'Status', sortable: true, render: (value: unknown) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        {String(value)}
      </span>
    ) },
    { key: 'order_date', label: 'Date', sortable: true },
  ];

  if (!hasHydrated) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader title="Orders" description="View and manage your trading orders" />
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

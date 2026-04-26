'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-display/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import * as instrumentsApi from '@/api/instruments';

export default function InstrumentsPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('trading_symbol');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['instruments', page, search, sortBy, sortOrder],
    queryFn: () => instrumentsApi.list(page, 20, { search }),
    enabled: hasHydrated,
  });
  const data = responseData as any;

  const columns: any[] = [
    { key: 'trading_symbol', label: 'Symbol', sortable: true },
    { key: 'name', label: 'Company Name', sortable: true },
    { key: 'exchange', label: 'Exchange', sortable: false },
    { key: 'market_data', label: 'LTP', sortable: false, render: (_: unknown, row: any) =>
      row.market_data ? `₹${Number(row.market_data.last_price).toFixed(2)}` : '—'
    },
    { key: 'lot_size', label: 'Lot Size', sortable: false },
    { key: 'tick_size', label: 'Tick Size', sortable: false },
  ];

  if (!hasHydrated) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader title="Instruments" description="Browse all available trading instruments" />
      
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search by symbol or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

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
    </div>
  );
}

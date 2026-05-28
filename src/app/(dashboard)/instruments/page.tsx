'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';
import * as instrumentsApi from '@/api/instruments';
import type { Instrument } from '@/types/api';

const INDEX_OPTIONS = [
  'NIFTY 50',
  'NIFTY 100',
  'NIFTY 200',
  'NIFTY BANK',
  'NIFTY AUTO',
  'NIFTY MIDCAP 50',
];

const STATUS_OPTIONS = [
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' },
  { label: 'Sync in Progress', value: '2' },
];

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';

  return dt.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InstrumentsPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [indexFilter, setIndexFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('trading_symbol');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useQuery({
    queryKey: ['instruments', page, search, indexFilter, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      instrumentsApi.list(page, 20, {
        search,
        index_name: indexFilter !== 'ALL' ? indexFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
    enabled: hasHydrated,
  });

  const columns: DataTableColumn<Instrument>[] = [
    { key: 'trading_symbol', label: 'Symbol', sortable: true },
    { key: 'name', label: 'Company Name', sortable: true },
    { key: 'instrument_key', label: 'Instrument Key', sortable: true },
    { key: 'exchange', label: 'Exchange', sortable: false },
    {
      key: 'market_data',
      label: 'LTP',
      sortable: false,
      render: (_: unknown, row: any) =>
        row.market_data ? `₹${Number(row.market_data.last_price).toFixed(2)}` : '—',
    },
    {
      key: 'market_data',
      label: 'Margin Rate',
      sortable: false,
      render: (_: unknown, row: any) =>
        row.market_data ? `₹${Number(row.market_data.margin_rate).toFixed(2)}` : '—',
    },
    {
      key: 'market_data',
      label: 'Volume',
      sortable: false,
      render: (_: unknown, row: any) =>
        row.market_data?.volume !== undefined ? Number(row.market_data.volume).toLocaleString('en-IN') : '—',
    },
    {
      key: 'market_data',
      label: 'Last Sync On1',
      sortable: false,
      render: (_: unknown, row: any) =>
        formatDateTime(row.market_data?.updated_at ?? row.market_data?.tick_at),
    },
    {
      key: 'market_data',
      label: 'Last Traded On',
      sortable: false,
      render: (_: unknown, row: any) => formatDateTime(row.market_data?.last_trade_time),
    },
    {
      key: 'updated_at',
      label: 'Updated At',
      sortable: false,
      render: (value: unknown) => formatDateTime(typeof value === 'string' ? value : null),
    },
    { key: 'lot_size', label: 'Lot Size', sortable: false },
    { key: 'tick_size', label: 'Tick Size', sortable: false },
  ];

  if (!hasHydrated) {
    return <PageShell title="Instruments" isLoading />;
  }

  return (
    <PageShell title="Instruments" description="Browse all available trading instruments">
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Input
          type="search"
          placeholder="Search by symbol or name..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <select
          value={indexFilter}
          onChange={(e) => {
            setPage(1);
            setIndexFilter(e.target.value);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All Indexes</option>
          {INDEX_OPTIONS.map((indexName) => (
            <option key={indexName} value={indexName}>
              {indexName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All Status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
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

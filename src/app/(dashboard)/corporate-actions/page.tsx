'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';
import * as corporateActionsApi from '@/api/corporate-actions';
import type { CorporateAction, CorporateActionType } from '@/types/api';

const TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'All types', value: 'ALL' },
  { label: 'Structural (split / bonus / rights)', value: 'structural' },
  { label: 'Split', value: 'split' },
  { label: 'Bonus', value: 'bonus' },
  { label: 'Rights', value: 'rights' },
  { label: 'Dividend', value: 'dividend' },
  { label: 'Other', value: 'other' },
];

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;

  return dt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export default function CorporateActionsPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['corporate-actions', page, search, typeFilter, fromDate, toDate],
    queryFn: () =>
      corporateActionsApi.list(page, 25, {
        search: search || undefined,
        type:
          typeFilter !== 'ALL'
            ? (typeFilter as CorporateActionType | 'structural')
            : undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      }),
    enabled: hasHydrated,
  });

  const columns: DataTableColumn<CorporateAction>[] = [
    {
      key: 'trading_symbol',
      label: 'Symbol',
      render: (value) => (typeof value === 'string' && value !== '' ? value : '—'),
    },
    {
      key: 'instrument_name',
      label: 'Name',
      render: (value) => (typeof value === 'string' && value !== '' ? value : '—'),
    },
    { key: 'isin', label: 'ISIN' },
    {
      key: 'type_label',
      label: 'Type',
      render: (_value, row) => (
        <Badge variant={row.is_structural ? 'destructive' : 'secondary'}>
          {row.type_label}
        </Badge>
      ),
    },
    {
      key: 'ex_date',
      label: 'Ex-date',
      render: (value) => formatDate(typeof value === 'string' ? value : null),
    },
    {
      key: 'ratio',
      label: 'Ratio',
      render: (value) => (typeof value === 'string' && value !== '' ? value : '—'),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) =>
        typeof value === 'number' ? value.toLocaleString('en-IN') : '—',
    },
    {
      key: 'is_structural',
      label: 'SMA exclusion',
      render: (_value, row) => (row.is_structural ? 'Lookback skip' : 'Allowed'),
    },
  ];

  if (!hasHydrated) {
    return <PageShell title="Corporate actions" isLoading />;
  }

  return (
    <PageShell
      title="Corporate actions"
      description="Search stored Split, Bonus, Rights and Dividend events. Structural events skip SMA44 while they sit inside the strategy lookback."
    >
      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          type="search"
          placeholder="Search symbol, name, or ISIN..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select
          value={typeFilter}
          onChange={(e) => {
            setPage(1);
            setTypeFilter(e.target.value);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setPage(1);
            setFromDate(e.target.value);
          }}
          aria-label="From ex-date"
        />

        <Input
          type="date"
          value={toDate}
          onChange={(e) => {
            setPage(1);
            setToDate(e.target.value);
          }}
          aria-label="To ex-date"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isEmpty={!data?.data?.length}
        emptyText="No corporate actions match these filters. Sync runs weekdays at 07:00 IST."
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

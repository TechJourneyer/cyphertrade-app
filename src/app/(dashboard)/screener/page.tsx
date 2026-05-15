'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageShell } from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';
import * as instrumentsApi from '@/api/instruments';

const SCANNERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Price Gap Up', value: 'PRICE_GAP_UP' },
  { label: 'Price Gap Down', value: 'PRICE_GAP_DOWN' },
  { label: '44 SMA', value: '44sma' },
];

function getTodayDateInput(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ScreenerPage() {
  const { hasHydrated } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const [scanDate, setScanDate] = useState(getTodayDateInput());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['screener', page, activeTab, scanDate, search],
    queryFn: () =>
      instrumentsApi.screener.results(page, 30, {
        scanner: activeTab !== 'ALL' ? activeTab : '',
        scan_date: scanDate,
        search,
      }),
    enabled: hasHydrated,
  });

  if (!hasHydrated) {
    return <PageShell title="Screener" isLoading />;
  }

  return (
    <PageShell title="Screener" description="Find stocks matching your scan criteria">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input
          type="search"
          placeholder="Search by symbol or name..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Input
          type="date"
          value={scanDate}
          onChange={(e) => {
            setPage(1);
            setScanDate(e.target.value);
          }}
          aria-label="Scan date"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SCANNERS.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'outline'}
            onClick={() => {
              setPage(1);
              setActiveTab(tab.value);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ))
        ) : data?.data.length ? (
          data.data.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{item.instrument?.trading_symbol ?? '—'}</p>
                <span className="text-xs text-muted-foreground">P{item.priority}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.instrument?.name ?? 'No instrument linked'}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="rounded border border-border px-2 py-0.5">{item.scanner}</span>
                <span className="text-muted-foreground">{item.scan_date}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Trend: <span className="font-medium">{item.trend_direction}</span></span>
                <span>Signal: <span className="font-medium">{item.trade_indicator}</span></span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 md:col-span-2 lg:col-span-3">
            <p className="text-muted-foreground text-sm text-center py-8">No screener results found for selected filters.</p>
          </div>
        )}
      </div>

      {data?.meta && data.meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {data.meta.current_page} of {data.meta.last_page}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.meta.current_page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.meta.current_page >= data.meta.last_page}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

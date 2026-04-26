'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/data-display/EmptyState';
import { TradingAccountCard, TradingAccountCardSkeleton } from '@/components/data-display/TradingAccountCard';
import { useAuth } from '@/hooks/useAuth';
import * as tradingAccountsApi from '@/api/trading-accounts';
import type { TradingAccount, PaginationMeta } from '@/types/api';

const PAGE_SIZE = 10;

function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.last_page <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={meta.current_page <= 1}
        onClick={() => onPageChange(meta.current_page - 1)}
      >
        Previous
      </Button>
      <span className="text-xs text-muted-foreground px-2">
        Page {meta.current_page} of {meta.last_page}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={meta.current_page >= meta.last_page}
        onClick={() => onPageChange(meta.current_page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

export default function TradingAccountsPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['trading-accounts', page],
    queryFn: () => tradingAccountsApi.list(page, PAGE_SIZE),
    enabled: hasHydrated,
  });

  const accounts: TradingAccount[] = (responseData as any)?.data ?? [];
  const meta: PaginationMeta | undefined = (responseData as any)?.meta;

  if (!hasHydrated) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader
        title="Trading Accounts"
        description="Manage your trading accounts and credentials"
        actions={
          <Link href="/trading-accounts/new">
            <Button size="sm">New Account</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TradingAccountCardSkeleton key={i} />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No trading accounts yet"
          description="Register your first trading account to start using bots."
          action={
            <Link href="/trading-accounts/new">
              <Button size="sm">New Account</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => (
              <TradingAccountCard key={account.id} account={account} />
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}

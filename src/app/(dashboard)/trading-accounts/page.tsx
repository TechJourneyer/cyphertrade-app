'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/PageShell';
import { EmptyState } from '@/components/data-display/EmptyState';
import { TradingAccountCard, TradingAccountCardSkeleton } from '@/components/data-display/TradingAccountCard';
import { Pagination } from '@/components/data-display/Pagination';
import { useAuth } from '@/hooks/useAuth';
import * as tradingAccountsApi from '@/api/trading-accounts';
import type { TradingAccount, PaginationMeta } from '@/types/api';

const PAGE_SIZE = 10;

export default function TradingAccountsPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['trading-accounts', 'list', page],
    queryFn: () => tradingAccountsApi.list(page, PAGE_SIZE),
    enabled: hasHydrated,
  });

  const accounts: TradingAccount[] = responseData?.data ?? [];
  const meta: PaginationMeta | undefined = responseData?.meta;

  if (!hasHydrated) {
    return <PageShell title="Trading Accounts" isLoading />;
  }

  return (
    <PageShell
      title="Trading Accounts"
      description="Manage your trading accounts and credentials"
      actions={
        <Link href="/trading-accounts/new">
          <Button size="sm">New Account</Button>
        </Link>
      }
    >

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
    </PageShell>
  );
}

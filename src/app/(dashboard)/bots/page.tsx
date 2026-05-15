'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/PageShell';
import { EmptyState } from '@/components/data-display/EmptyState';
import { BotCard, BotCardSkeleton } from '@/components/data-display/BotCard';
import { Pagination } from '@/components/data-display/Pagination';
import { useAuth } from '@/hooks/useAuth';
import { useTradingAccount } from '@/hooks/useTradingAccount';
import * as botsApi from '@/api/bots';
import type { Bot as BotType, PaginationMeta } from '@/types/api';

const PAGE_SIZE = 10;

export default function BotsPage() {
  const { hasHydrated } = useAuth();
  const { activeAccountId, isAllAccounts, activeAccount } = useTradingAccount();
  const [page, setPage] = useState(1);
  const [sortBy] = useState('name');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setPage(1);
  }, [activeAccountId]);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['bots', page, sortBy, sortOrder, activeAccountId],
    queryFn: () => botsApi.list(page, PAGE_SIZE, {
      sort_by: sortBy,
      sort_order: sortOrder,
      account_id: activeAccountId ?? undefined,
    }),
    enabled: hasHydrated,
  });

  const bots: BotType[] = responseData?.data ?? [];
  const meta: PaginationMeta | undefined = responseData?.meta;

  return (
    <PageShell
      title="Bots"
      description={
        isAllAccounts
          ? 'Manage your trading bots across all accounts'
          : `Manage your trading bots for ${activeAccount?.account_name ?? 'selected account'}`
      }
      isLoading={!hasHydrated}
      actions={
        <Link href="/bots/new">
          <Button size="sm">New Bot</Button>
        </Link>
      }
    >

      {/* Card grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BotCardSkeleton key={i} />
          ))}
        </div>
      ) : bots.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No bots yet"
          description="Create your first trading bot to get started."
          action={
            <Link href="/bots/new">
              <Button size="sm">New Bot</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </PageShell>
  );
}

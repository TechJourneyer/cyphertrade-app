'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/data-display/EmptyState';
import { BotCard, BotCardSkeleton } from '@/components/data-display/BotCard';
import { useAuth } from '@/hooks/useAuth';
import * as botsApi from '@/api/bots';
import type { Bot as BotType, PaginationMeta } from '@/types/api';

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

export default function BotsPage() {
  const { hasHydrated } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy] = useState('name');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['bots', page, sortBy, sortOrder],
    queryFn: () => botsApi.list(page, PAGE_SIZE, { sort_by: sortBy, sort_order: sortOrder }),
    enabled: hasHydrated,
  });

  const bots: BotType[] = (responseData as any)?.data ?? [];
  const meta: PaginationMeta | undefined = (responseData as any)?.meta;

  if (!hasHydrated) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader
        title="Bots"
        description="Manage your trading bots"
        actions={
          <Link href="/bots/new">
            <Button size="sm">New Bot</Button>
          </Link>
        }
      />

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
    </div>
  );
}

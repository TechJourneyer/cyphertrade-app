'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Bot,
  CreditCard,
  TrendingUp,
  ClipboardList,
  Activity,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { getDashboard } from '@/api/dashboard'
import { useLiveMarketPolling } from '@/hooks/useLiveMarketPolling'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/data-display/StatCard'
import { StaleIndicator } from '@/components/data-display/StaleIndicator'
import { ErrorState } from '@/components/data-display/ErrorState'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export default function DashboardPage() {
  const {
    data,
    isPending,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  getDashboard,
    staleTime: 30_000,
  })

  const { ticks, isStale, isPending: liveMarketPending } = useLiveMarketPolling()

  const lastSyncLabel = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  if (isError) {
    return (
      <ErrorState
        title="Could not load dashboard"
        message="Check your connection or try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Overview of your trading operations"
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-3">
            {/* Market status */}
            {isPending ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <StatusBadge status={data?.market_status ?? 'closed'} />
                <span className="text-xs text-muted-foreground">{data?.market_status_label}</span>
              </div>
            )}

            {/* Last sync */}
            {lastSyncLabel && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {lastSyncLabel}
              </div>
            )}

            <button
              onClick={() => refetch()}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-ring"
              aria-label="Refresh dashboard"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isPending && 'animate-spin')} />
              Refresh
            </button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Active Bots"
          value={data?.active_bots}
          icon={Bot}
          loading={isPending}
        />
        <StatCard
          label="Active Accounts"
          value={data?.active_terminals}
          icon={CreditCard}
          loading={isPending}
        />
        <StatCard
          label="Today's Trades"
          value={data?.today_trades}
          icon={TrendingUp}
          loading={isPending}
        />
        <StatCard
          label="Today's P&L"
          value={data?.today_pnl}
          icon={Activity}
          currency
          loading={isPending}
          mono
        />
        <StatCard
          label="Filled Orders"
          value={data?.filled_orders}
          icon={ClipboardList}
          loading={isPending}
        />
      </div>

      {/* Second row — live market + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live market snapshot with polling */}
        <div className="bg-surface-1 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Market (3s polling)
            </p>
            {isStale && <StaleIndicator isStale={isStale} />}
          </div>
          {liveMarketPending ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : ticks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active instrument data yet. Live prices will appear once you start trading.
            </p>
          ) : (
            <div className="space-y-2">
              {ticks.slice(0, 5).map((tick) => (
                <div key={tick.instrument_key} className="flex items-center justify-between p-2 bg-surface-2 rounded text-sm">
                  <div>
                    <p className="font-medium">{tick.trading_symbol}</p>
                    <p className="text-xs text-muted-foreground">{tick.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">₹{tick.last_price.toFixed(2)}</p>
                    <p className={`text-xs font-mono ${tick.change_percent > 0 ? 'text-gain' : 'text-loss'}`}>
                      {tick.change_percent > 0 ? '+' : ''}{tick.change_percent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity placeholder */}
        <div className="bg-surface-1 rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Recent Activity
          </p>
          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Recent orders and trade activity will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

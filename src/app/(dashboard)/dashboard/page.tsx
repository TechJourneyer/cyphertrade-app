'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bot,
  TrendingUp,
  ClipboardList,
  Activity,
  RefreshCw,
  Clock,
  Pause,
  Play,
} from 'lucide-react'
import { getDashboard } from '@/api/dashboard'
import * as botsApi from '@/api/bots'
import { useLiveMarketPolling } from '@/hooks/useLiveMarketPolling'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { useToast } from '@/hooks/useToast'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/data-display/StatCard'
import { StaleIndicator } from '@/components/data-display/StaleIndicator'
import { ErrorState } from '@/components/data-display/ErrorState'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Bot as BotType } from '@/types/api'

export default function DashboardPage() {
  const { activeAccount, activeAccountId, hasAccounts, isAllAccounts } = useTradingAccount()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    data,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', activeAccountId],
    queryFn: () => getDashboard(activeAccountId),
    enabled: hasAccounts || isAllAccounts,
    staleTime: 30_000,
  })

  const { data: botsResponse } = useQuery({
    queryKey: ['bots', 'kill-switch', activeAccountId],
    queryFn: () => botsApi.list(1, 50, { account_id: activeAccountId ?? undefined }),
    enabled: hasAccounts || isAllAccounts,
    staleTime: 15_000,
  })

  const bots: BotType[] = botsResponse?.data ?? []

  const toggleBot = useMutation({
    mutationFn: (bot: BotType) => (bot.status === 1 ? botsApi.pause(bot.id) : botsApi.resume(bot.id)),
    onSuccess: (_data, bot) => {
      queryClient.invalidateQueries({ queryKey: ['bots'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast({
        title: bot.status === 1 ? 'Bot paused' : 'Bot resumed',
        description: bot.status === 1
          ? 'New entries and initiate trades are stopped.'
          : 'Bot is active again.',
      })
    },
    onError: (err: Error) => {
      toast({
        variant: 'destructive',
        title: 'Kill switch failed',
        description: err.message || 'Could not update bot status.',
      })
    },
  })

  const { ticks, isStale, isPending: liveMarketPending } = useLiveMarketPolling()

  const lastSyncLabel = data?.last_sync_at
    ? new Date(data.last_sync_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
    <PageShell
      title="Dashboard"
      description={
        isAllAccounts
          ? 'Portfolio-wide overview across all trading accounts'
          : hasAccounts
          ? `Overview for selected account: ${activeAccount?.account_name ?? '—'}`
          : 'Add a trading account from top bar to view account-specific dashboard metrics'
      }
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
      >

      {data?.oauth_required && (
        <div
          role="alert"
          className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
        >
          <p className="font-medium text-warning">
            {data.morning_oauth_alert ? 'Morning alert: broker terminal is off' : 'Broker terminal is off'}
          </p>
          <p className="mt-1 text-muted-foreground">
            {data.morning_oauth_alert
              ? 'Connect Upstox before 09:15 IST. Order jobs will skip until OAuth is complete.'
              : 'Order jobs skip until OAuth is complete. The token normally expires at 03:30 IST the next morning.'}
          </p>
          <Link
            href={activeAccount ? `/trading-accounts/${activeAccount.id}/edit` : '/trading-accounts'}
            className="mt-2 inline-flex text-xs font-medium text-warning underline-offset-2 hover:underline"
          >
            Connect terminal
          </Link>
        </div>
      )}

      {(data?.pending_after_cutoff ?? 0) > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
        >
          <p className="font-medium text-warning">
            {data?.pending_after_cutoff} entry still not filled after 10:45
          </p>
          <p className="mt-1 text-muted-foreground">
            SMA44 does not open new entries after 10:45. Check these trades before leaving the screen.
          </p>
          <Link href="/trades" className="mt-2 inline-flex text-xs font-medium text-warning underline-offset-2 hover:underline">
            Open trades
          </Link>
        </div>
      )}

      {(data?.failed_jobs_today ?? 0) > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
        >
          <p className="font-medium text-destructive">
            {data?.failed_jobs_today} failed job{data?.failed_jobs_today === 1 ? '' : 's'} today
          </p>
          <p className="mt-1 text-muted-foreground">
            Latest: {data?.last_failed_job ?? 'unknown'}
            {data?.last_failed_at ? ` at ${new Date(data.last_failed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </p>
        </div>
      )}

      {data?.square_off && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            data.square_off.status === 'failed'
              ? 'border-destructive/40 bg-destructive/10'
              : 'border-border bg-surface-1'
          }`}
        >
          <p className="font-medium">
            {data.square_off.status === 'pending' && 'Square-off has not reported yet'}
            {data.square_off.status === 'clear' && 'Square-off finished: nothing was open'}
            {data.square_off.status === 'ok' && `Square-off finished: ${data.square_off.closed_success} closed`}
            {data.square_off.status === 'failed' && `Square-off: ${data.square_off.closed_failed} of ${data.square_off.total} failed`}
          </p>
          {data.square_off.status === 'failed' && (
            <p className="mt-1 text-muted-foreground">Close the leftover positions in Upstox.</p>
          )}
        </div>
      )}

      {data?.entries_blocked && (
        <div role="alert" className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <p className="font-medium text-warning">New buys are being skipped</p>
          <p className="mt-1 text-muted-foreground">
            {data.entries_blocked_reason ?? 'The live quote was missing or too old.'}
          </p>
        </div>
      )}

      {bots.length > 0 && (
        <div className="rounded-lg border border-border bg-surface-1 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kill switch
            </p>
            <Link href="/bots" className="text-xs text-muted-foreground hover:text-foreground">
              Manage bots
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {bots.map((bot) => {
              const isActive = bot.status === 1
              return (
                <div key={bot.id} className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{bot.name}</p>
                    <StatusBadge status={isActive ? 'active' : 'paused'} />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isActive ? 'destructive' : 'default'}
                    loading={toggleBot.isPending && toggleBot.variables?.id === bot.id}
                    onClick={() => toggleBot.mutate(bot)}
                  >
                    {isActive ? <Pause size={13} /> : <Play size={13} />}
                    {isActive ? 'Pause' : 'Resume'}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Active Bots"
          value={data?.active_bots}
          icon={Bot}
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
            {isStale && (
              <StaleIndicator
                isStale={isStale}
                note="Buys are skipped only when the REST quote at place time is missing or the last trade is older than 60 seconds."
              />
            )}
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
    </PageShell>
  )
}

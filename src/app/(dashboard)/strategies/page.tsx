'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/PageShell';
import { Select } from '@/components/forms/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import * as strategiesApi from '@/api/strategies';
import type { BacktestResult, BacktestOrder } from '@/api/strategies';

// ─── Constants (mirror old BacktestConstants) ─────────────────────────────────
const INVESTMENT_MIN  = 10_000
const INVESTMENT_MAX  = 500_000
const INVESTMENT_STEP = 1_000
const INVESTMENT_DEFAULT = 100_000

function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

function formatInrDecimal(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value)
}

function formatDateTime(ts: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(ts))
  } catch {
    return ts
  }
}

function formatDate(ts: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(ts))
  } catch {
    return ts
  }
}

// ─── Trigger badge colour ─────────────────────────────────────────────────────
function TriggerBadge({ trigger }: { trigger: BacktestOrder['trigger'] }) {
  const map = {
    targetReached:  { label: 'Target',    className: 'bg-success/20 text-success border-success/30' },
    stopLossReached:{ label: 'Stop Loss', className: 'bg-destructive/20 text-destructive border-destructive/30' },
    exitTimeEnds:   { label: 'Time Exit', className: 'bg-muted text-muted-foreground border-border' },
  } as const
  const { label, className } = map[trigger] ?? { label: trigger, className: '' }
  return <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${className}`}>{label}</span>
}

// ─── Summary Stats Card ───────────────────────────────────────────────────────
function BacktestSummary({ report }: { report: BacktestResult }) {
  const pnlPositive = report.total_pnl >= 0
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Backtest Summary</CardTitle>
          <span className="text-xs text-muted-foreground">
            {formatDate(report.start_date)} — {formatDate(report.end_date)}
            {report.candles_from_date && (
              <> &nbsp;·&nbsp; Data from {formatDate(report.candles_from_date)}</>
            )}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Total Trades</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{report.total_trades}</p>
          </div>
          <div className="rounded border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Total P&amp;L</p>
            <p className={`mt-1 text-2xl font-bold ${pnlPositive ? 'text-success' : 'text-destructive'}`}>
              {formatInrDecimal(report.total_pnl)}
            </p>
          </div>
          <div className="rounded border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Profit Trades</p>
            <p className="mt-1 text-2xl font-bold text-success">{report.total_profit_trades}</p>
          </div>
          <div className="rounded border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Loss Trades</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{report.total_loss_trades}</p>
          </div>
          <div className="rounded border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className={`mt-1 text-2xl font-bold ${report.profit_trade_percent >= 50 ? 'text-success' : 'text-destructive'}`}>
              {report.profit_trade_percent}%
            </p>
          </div>
          <div className="rounded border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Avg P&amp;L / Trade</p>
            <p className={`mt-1 text-2xl font-bold ${report.average_pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatInrDecimal(report.average_pnl)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Orders Table ─────────────────────────────────────────────────────────────
function BacktestOrdersTable({ orders }: { orders: BacktestOrder[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trades ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left">
                <th className="px-3 py-2.5 font-medium text-muted-foreground">#</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">Instrument</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">Entry Time</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">Type</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">Entry Price</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">Qty</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">Entry Total</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">Exit Time</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">Exit Price</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">Exit Total</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">Fees</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">P&amp;L</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">P&amp;L%</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-right">Cumulative</th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                const pnlPos = order.pnl >= 0
                const cumPos = order.pnl_till_now >= 0
                return (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground">{order.id}</td>
                    <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{order.instrument}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDateTime(order.entry_time)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${order.order_type === 'buy' ? 'bg-success/15 text-success border-success/30' : 'bg-destructive/15 text-destructive border-destructive/30'}`}>
                        {order.order_type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{formatInrDecimal(order.order_price)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{order.quantity}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{formatInrDecimal(order.entry_total_price)}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDateTime(order.exit_time)}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{formatInrDecimal(order.exit_price)}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{formatInrDecimal(order.exit_total_price)}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">{formatInrDecimal(order.fees)}</td>
                    <td className={`px-3 py-2 text-right font-mono font-semibold ${pnlPos ? 'text-success' : 'text-destructive'}`}>
                      {formatInrDecimal(order.pnl)}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${pnlPos ? 'text-success' : 'text-destructive'}`}>
                      {order['pnl_%']}%
                    </td>
                    <td className={`px-3 py-2 text-right font-mono font-semibold ${cumPos ? 'text-success' : 'text-destructive'}`}>
                      {formatInrDecimal(order.pnl_till_now)}
                    </td>
                    <td className="px-3 py-2"><TriggerBadge trigger={order.trigger} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StrategiesPage() {
  const { hasHydrated } = useAuth();
  const [investmentAmount, setInvestmentAmount] = useState(INVESTMENT_DEFAULT)
  const [selectedStrategy, setSelectedStrategy] = useState('')
  const [backtestResult, setBacktestResult]     = useState<BacktestResult | null>(null)
  const [isRunning, setIsRunning]               = useState(false)
  const [error, setError]                       = useState('')

  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn:  () => strategiesApi.list(),
    enabled:  hasHydrated,
  })

  const strategyOptions = strategies?.map((s) => ({ label: s.name, value: s.code })) ?? []

  const handleRunBacktest = async () => {
    setError('')
    if (!selectedStrategy) {
      setError('Please select a strategy.')
      return
    }
    setIsRunning(true)
    setBacktestResult(null)
    try {
      const res = await strategiesApi.runBacktest({
        strategy: selectedStrategy,
        investment_amount: investmentAmount,
      })
      setBacktestResult(res?.report ?? null)
      if (!res?.report) setError('Backtest completed but no report was generated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backtest failed. Please try again.')
    } finally {
      setIsRunning(false)
    }
  }

  if (!hasHydrated || strategiesLoading) {
    return <PageShell title="Strategies" isLoading />
  }

  return (
    <PageShell title="Strategies" description="Backtest and analyse trading strategies">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Strategy List ────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {strategies?.map((s) => (
                <li key={s.id} className="rounded border border-border bg-secondary/30 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground text-sm">{s.name}</p>
                    {s.status && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {s.status}
                      </Badge>
                    )}
                  </div>
                  {s.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    {s.timeframe   && <span>Timeframe: <span className="text-foreground">{s.timeframe}</span></span>}
                    {s.rr_ratio    && <span>R:R <span className="text-foreground">{s.rr_ratio}</span></span>}
                    {s.stop_loss_percent != null && (
                      <span>SL <span className="text-foreground">{s.stop_loss_percent}%</span></span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Backtest Form ────────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Run Backtest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">

              <Select
                label="Strategy"
                options={strategyOptions}
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                placeholder="Select a strategy"
              />

              {/* Investment Amount Range Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Max. Investment Amount
                  </label>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {formatInr(investmentAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={INVESTMENT_MIN}
                  max={INVESTMENT_MAX}
                  step={INVESTMENT_STEP}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-primary cursor-pointer bg-secondary"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{formatInr(INVESTMENT_MIN)}</span>
                  <span>{formatInr(INVESTMENT_MAX)}</span>
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <Button
                  onClick={handleRunBacktest}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? 'Running Backtest…' : 'Run Backtest'}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Backtests can take several minutes while fetching historical data.
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      {backtestResult && (
        <div className="space-y-4 mt-2">
          <BacktestSummary report={backtestResult} />
          {backtestResult.orders?.length > 0 && (
            <BacktestOrdersTable orders={backtestResult.orders} />
          )}
        </div>
      )}

    </PageShell>
  )
}

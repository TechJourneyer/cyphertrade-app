'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from '@/components/forms/FormField';
import { Select } from '@/components/forms/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as strategiesApi from '@/api/strategies';
import * as accountsApi from '@/api/trading-accounts';

export default function StrategiesPage() {
  const { hasHydrated } = useAuth();
  const [formData, setFormData] = useState({
    strategy: '',
    investment_amount: '100000',
    trading_account_id: '',
  });
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  const { data: strategiesData, isLoading: strategiesLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesApi.list(),
    enabled: hasHydrated,
  });

  const { data: accountsData } = useQuery({
    queryKey: ['trading-accounts', 'list'],
    queryFn: () => accountsApi.list(1, 100),
    enabled: hasHydrated,
  });
  const accountOptions = (accountsData as any)?.data?.data?.map((a: any) => ({
    label: a.account_name,
    value: String(a.id),
  })) || [];
  const strategies = strategiesData as any;
  const strategyOptions = strategies?.data?.map((s: any) => ({
    label: s.name,
    value: s.code,
  })) || [];

  const handleRunBacktest = async () => {
    setError('');
    if (!formData.strategy) {
      setError('Please select a strategy to continue.');
      return;
    }

    const investmentAmount = Number(formData.investment_amount);
    if (!Number.isFinite(investmentAmount) || investmentAmount <= 0) {
      setError('Investment amount must be greater than 0.');
      return;
    }

    setIsRunning(true);
    try {
      const results = await strategiesApi.runBacktest({
        strategy: formData.strategy,
        investment_amount: investmentAmount,
        ...(formData.trading_account_id ? { trading_account_id: Number(formData.trading_account_id) } : {}),
      });
      setBacktestResults(results.data?.report ?? null);
    } catch (err) {
      console.error('Backtest failed:', err);
      setError(err instanceof Error ? err.message : 'Backtest failed. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  if (!hasHydrated || strategiesLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Strategies" description="Backtest and analyze trading strategies" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
            {strategies?.data?.map((strategy: any) => (
              <li
                key={strategy.id}
                className="rounded border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground"
              >
                <p className="font-medium">{strategy.name}</p>
                {strategy.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{strategy.description}</p>
                )}
              </li>
            ))}
          </ul>
          </CardContent>
        </Card>

        {/* Backtest Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Run Backtest</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            <Select
              label="Strategy"
              options={strategyOptions}
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              placeholder="Select a strategy"
            />
            <Select
              label="Trading Account"
              options={accountOptions}
              value={formData.trading_account_id}
              onChange={(e) => setFormData({ ...formData, trading_account_id: e.target.value })}
              placeholder="Auto-select active account"
            />
            <FormField
              label="Max. Investment Amount"
              type="number"
              min={1}
              value={formData.investment_amount}
              onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
              placeholder="e.g., 100000"
            />
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            <Button onClick={handleRunBacktest} disabled={isRunning} className="w-full">
              {isRunning ? 'Running...' : 'Run Backtest'}
            </Button>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {backtestResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backtest Results</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded border border-border bg-secondary/30 p-4">
              <p className="text-xs text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold text-foreground">{backtestResults?.total_trades || 0}</p>
            </div>
            <div className="rounded border border-border bg-secondary/30 p-4">
              <p className="text-xs text-muted-foreground">Profit Trades</p>
              <p className="text-2xl font-bold text-success">{backtestResults?.total_profit_trades || 0}</p>
            </div>
            <div className="rounded border border-border bg-secondary/30 p-4">
              <p className="text-xs text-muted-foreground">Loss Trades</p>
              <p className="text-2xl font-bold text-destructive">{backtestResults?.total_loss_trades || 0}</p>
            </div>
            <div className="rounded border border-border bg-secondary/30 p-4">
              <p className="text-xs text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold ${(backtestResults?.total_pnl || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{backtestResults?.total_pnl || 0}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded border border-border bg-secondary/20 p-4">
              <p className="text-xs text-muted-foreground">Profit Trade %</p>
              <p className="text-lg font-semibold text-foreground">{backtestResults?.profit_trade_percent || 0}%</p>
            </div>
            <div className="rounded border border-border bg-secondary/20 p-4">
              <p className="text-xs text-muted-foreground">Average P&L</p>
              <p className="text-lg font-semibold text-foreground">₹{backtestResults?.average_pnl || 0}</p>
            </div>
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

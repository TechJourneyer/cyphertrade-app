'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useTradingAccount } from '@/hooks/useTradingAccount';
import Link from 'next/link';
import * as botsApi from '@/api/bots';
import * as strategiesApi from '@/api/strategies';
import type { Strategy } from '@/types/api';

export default function CreateBotPage() {
  const router = useRouter();
  const { hasHydrated } = useAuth();
  const { accounts, activeAccount, hasAccounts, isLoading: accountsLoading } = useTradingAccount();

  const [formData, setFormData] = useState({ name: '', strategy_id: '', account_id: '', per_trade_limit: '', max_investment_limit: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: strategiesData, isLoading: strategiesLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesApi.list(),
    enabled: hasHydrated,
  });

  const strategies: Strategy[] = (strategiesData as any)?.data ?? [];

  // Pre-select the globally active trading account
  useEffect(() => {
    if (activeAccount && !formData.account_id) {
      setFormData((prev) => ({ ...prev, account_id: String(activeAccount.id) }));
    }
  }, [activeAccount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await botsApi.create({
        name: formData.name,
        strategy_id: parseInt(formData.strategy_id, 10),
        account_id: parseInt(formData.account_id, 10),
        per_trade_limit: parseFloat(formData.per_trade_limit),
        max_investment_limit: parseFloat(formData.max_investment_limit),
      });
      router.push('/bots');
    } catch (err: any) {
      setError(err.message || 'Failed to create bot');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasHydrated || strategiesLoading || accountsLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Gate: no trading account registered
  if (!hasAccounts) {
    return (
      <div>
        <PageHeader title="Create Bot" description="Set up a new trading bot" />
        <div className="max-w-lg rounded-lg border border-border bg-card p-8 text-center">
          <div className="mb-3 text-4xl">🏦</div>
          <h3 className="mb-1 text-sm font-semibold text-foreground">No Trading Account Found</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            A bot requires a linked trading account. Please register one first.
          </p>
          <Link href="/trading-accounts">
            <Button size="sm">Register Trading Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Create Bot" description="Set up a new trading bot" />

      <div className="max-w-lg rounded-lg border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Bot Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Bot Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. NIFTY SMA Bot"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Strategy */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Strategy <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={formData.strategy_id}
              onChange={(e) => setFormData({ ...formData, strategy_id: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a strategy</option>
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {strategies.length === 0 && (
              <p className="text-xs text-muted-foreground">No strategies available.</p>
            )}
          </div>

          {/* Trading Account */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Trading Account <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.account_name}</option>
              ))}
            </select>
            {activeAccount && formData.account_id === String(activeAccount.id) && (
              <p className="text-xs text-muted-foreground">
                Pre-selected: active account ({activeAccount.account_name})
              </p>
            )}
          </div>

          {/* Per Trade Limit */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Per Trade Limit (₹) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="e.g. 5000"
              value={formData.per_trade_limit}
              onChange={(e) => setFormData({ ...formData, per_trade_limit: e.target.value })}
            />
          </div>

          {/* Max Investment Limit */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Max Investment Limit (₹) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="e.g. 50000"
              value={formData.max_investment_limit}
              onChange={(e) => setFormData({ ...formData, max_investment_limit: e.target.value })}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Bot'}
            </Button>
            <Link href="/bots">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

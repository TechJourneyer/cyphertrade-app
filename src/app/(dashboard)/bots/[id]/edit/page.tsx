'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useTradingAccount } from '@/hooks/useTradingAccount';
import * as botsApi from '@/api/bots';
import * as strategiesApi from '@/api/strategies';
import type { Strategy } from '@/types/api';

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export default function EditBotPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const botId = parseInt(params.id, 10);
  const { hasHydrated } = useAuth();
  const { accounts, isLoading: accountsLoading } = useTradingAccount();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    strategy_id: '',
    account_id: '',
    per_trade_limit: '',
    max_investment_limit: '',
    status: 0 as 0 | 1,
  });
  const [error, setError] = useState('');

  const { data: botResponse, isLoading: botLoading } = useQuery({
    queryKey: ['bots', botId],
    queryFn: () => botsApi.get(botId),
    enabled: hasHydrated && !isNaN(botId),
  });

  const { data: strategiesData, isLoading: strategiesLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesApi.list(),
    enabled: hasHydrated,
  });

  const bot = (botResponse as any)?.data;
  const strategies: Strategy[] = (strategiesData as any)?.data ?? [];

  // Prefill form once bot data is available
  useEffect(() => {
    if (!bot) return;
    setFormData({
      name: bot.name ?? '',
      strategy_id: bot.strategy_id ? String(bot.strategy_id) : '',
      account_id: bot.account_id ? String(bot.account_id) : '',
      per_trade_limit: bot.per_trade_limit ? String(bot.per_trade_limit) : '',
      max_investment_limit: bot.max_investment_limit ? String(bot.max_investment_limit) : '',
      status: bot.status === 1 ? 1 : 0,
    });
  }, [bot]);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof botsApi.update>[1]) =>
      botsApi.update(botId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      router.push('/bots');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update bot');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({
      name: formData.name,
      strategy_id: parseInt(formData.strategy_id, 10),
      account_id: parseInt(formData.account_id, 10),
      per_trade_limit: parseFloat(formData.per_trade_limit),
      max_investment_limit: parseFloat(formData.max_investment_limit),
      status: formData.status,
    } as Parameters<typeof botsApi.update>[1]);
  };

  const isLoading = !hasHydrated || botLoading || strategiesLoading || accountsLoading;

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!bot) {
    return (
      <div>
        <PageHeader title="Edit Bot" description="Bot not found" />
        <p className="text-sm text-muted-foreground">
          The bot you are looking for does not exist.{' '}
          <Link href="/bots" className="text-primary underline underline-offset-2">
            Back to Bots
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Bot"
        description={`Editing "${bot.name}"`}
        breadcrumbs={[
          { label: 'Bots', href: '/bots' },
          { label: bot.name },
        ]}
      />

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

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: parseInt(e.target.value, 10) as 0 | 1 })
              }
              className={SELECT_CLASS}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
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
              className={SELECT_CLASS}
            >
              <option value="">Select a strategy</option>
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
              className={SELECT_CLASS}
            >
              <option value="">Select an account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.account_name}</option>
              ))}
            </select>
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
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

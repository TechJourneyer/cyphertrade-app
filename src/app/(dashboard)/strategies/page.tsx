'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from '@/components/forms/FormField';
import { Select } from '@/components/forms/Select';
import * as strategiesApi from '@/api/strategies';

export default function StrategiesPage() {
  const { hasHydrated } = useAuth();
  const [formData, setFormData] = useState({
    strategy_id: '',
    instrument_key: '',
    timeframe: '5min',
    from_date: '',
    to_date: '',
  });
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const { data: strategiesData, isLoading: strategiesLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategiesApi.list(),
    enabled: hasHydrated,
  });
  const strategies = strategiesData as any;

  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      const results = await strategiesApi.runBacktest({
        strategy_id: parseInt(formData.strategy_id, 10),
        instrument_key: formData.instrument_key,
        timeframe: formData.timeframe,
        start_date: formData.from_date,
        end_date: formData.to_date,
      });
      setBacktestResults(results.data);
    } catch (err) {
      console.error('Backtest failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  if (!hasHydrated || strategiesLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader title="Strategies" description="Backtest and analyze trading strategies" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Available Strategies</h3>
          <ul className="space-y-2">
            {strategies?.data?.map((strategy: any) => (
              <li key={strategy.id} className="p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                {strategy.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Backtest Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Run Backtest</h3>
          <div className="space-y-4">
            <Select
              label="Strategy"
              options={strategies?.data?.map((s: any) => ({ label: s.name, value: String(s.id) })) || []}
              value={formData.strategy_id}
              onChange={(e) => setFormData({ ...formData, strategy_id: e.target.value })}
            />
            <FormField
              label="Instrument Key"
              type="text"
              value={formData.instrument_key}
              onChange={(e) => setFormData({ ...formData, instrument_key: e.target.value })}
              placeholder="e.g., NSE_EQ|INE664A01016"
            />
            <Select
              label="Timeframe"
              options={[
                { label: '1 Minute', value: '1min' },
                { label: '5 Minutes', value: '5min' },
                { label: '15 Minutes', value: '15min' },
                { label: '1 Hour', value: '1h' },
              ]}
              value={formData.timeframe}
              onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
            />
            <FormField
              label="From Date"
              type="date"
              value={formData.from_date}
              onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
            />
            <FormField
              label="To Date"
              type="date"
              value={formData.to_date}
              onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
            />
            <Button onClick={handleRunBacktest} disabled={isRunning} className="w-full">
              {isRunning ? 'Running...' : 'Run Backtest'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {backtestResults && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Backtest Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-xs text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold">{backtestResults?.total_trades || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-xs text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold">{backtestResults?.win_rate || 0}%</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded">
              <p className="text-xs text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-green-600">₹{backtestResults?.total_profit || 0}</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-xs text-gray-600">Max Drawdown</p>
              <p className="text-2xl font-bold text-red-600">{backtestResults?.max_drawdown || 0}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

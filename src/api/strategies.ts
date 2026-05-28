import { apiGet, apiPost } from './client'
import type { Strategy } from '@/types/api'

export interface BacktestPayload {
  strategy: string
  investment_amount: number
}

export interface BacktestOrder {
  id:                number
  instrument:        string
  entry_time:        string
  order_type:        'buy' | 'sell'
  order_price:       number
  quantity:          number
  entry_total_price: number
  exit_time:         string
  exit_price:        number
  exit_total_price:  number
  fees:              number
  pnl:               number
  'pnl_%':           number
  pnl_till_now:      number
  trigger:           'targetReached' | 'stopLossReached' | 'exitTimeEnds'
}

export interface BacktestResult {
  start_date:         string
  end_date:           string
  candles_from_date?: string
  total_trades:       number
  total_pnl:          number
  total_profit_trades:number
  total_loss_trades:  number
  profit_trade_percent: number
  average_pnl:        number
  orders:             BacktestOrder[]
}

/**
 * List active strategies
 */
export async function list(): Promise<Strategy[]> {
  return apiGet<Strategy[]>('/strategies')
}

/**
 * Get strategy detail
 */
export async function get(id: number): Promise<Strategy> {
  return apiGet<Strategy>(`/strategies/${id}`)
}

/**
 * Get today's signals
 */
export async function signals(id: number): Promise<unknown> {
  return apiGet(`/strategies/${id}/signals`)
}

/**
 * Run backtest — uses a longer timeout (5 min) as the strategy iterates
 * many instruments and makes broker API calls.
 */
export async function runBacktest(payload: BacktestPayload): Promise<{ report: BacktestResult | null }> {
  const { apiClient } = await import('./client')
  const res = await apiClient.post<{ data: { report: BacktestResult | null } }>('/backtest', payload, { timeout: 300_000 })
  return res.data.data
}

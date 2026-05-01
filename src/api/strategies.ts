import { apiGet, apiPost } from './client'
import type { Strategy } from '@/types/api'

export interface BacktestPayload {
  strategy: string
  investment_amount: number
  trading_account_id?: number
}

export interface BacktestResult {
  start_date?: string
  end_date?: string
  total_trades: number
  total_pnl: number
  total_profit_trades: number
  total_loss_trades: number
  profit_trade_percent: number
  average_pnl: number
  trades: Array<{
    entry_time: string
    order_price: number
    exit_time: string
    exit_price: number
    pnl: number
  }>
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
 * Run backtest
 */
export async function runBacktest(payload: BacktestPayload): Promise<{ report: BacktestResult | null }> {
  return apiPost<{ report: BacktestResult | null }>('/backtest', payload)
}

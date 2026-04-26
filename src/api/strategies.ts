import { apiClient } from './client'
import type { ApiResponse, Strategy } from '@/types/api'

export interface BacktestPayload {
  strategy_id: number
  instrument_key: string
  timeframe: string
  start_date: string
  end_date: string
}

export interface BacktestResult {
  total_trades: number
  winning_trades: number
  losing_trades: number
  win_rate: number
  total_profit: number
  profit_factor: number
  max_drawdown: number
  sharpe_ratio: number
  trades: Array<{
    entry_date: string
    entry_price: number
    exit_date: string
    exit_price: number
    pnl: number
  }>
}

/**
 * List active strategies
 */
export async function list() {
  const response = await apiClient.get<ApiResponse<Strategy[]>>('/strategies')
  return response.data
}

/**
 * Get strategy detail
 */
export async function get(id: number) {
  const response = await apiClient.get<ApiResponse<Strategy>>(`/strategies/${id}`)
  return response.data
}

/**
 * Get today's signals
 */
export async function signals(id: number) {
  const response = await apiClient.get<ApiResponse>(`/strategies/${id}/signals`)
  return response.data
}

/**
 * Run backtest
 */
export async function runBacktest(payload: BacktestPayload) {
  const response = await apiClient.post<ApiResponse<BacktestResult>>('/backtest', payload)
  return response.data
}

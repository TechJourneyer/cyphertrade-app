import { apiClient } from './client'
import type { ApiResponse, Strategy } from '@/types/api'

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

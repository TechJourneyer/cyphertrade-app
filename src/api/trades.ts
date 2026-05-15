import { apiGet, apiList } from './client'
import type { Trade, PaginationMeta } from '@/types/api'

export interface TradesListResponse {
  data: Trade[]
  meta: PaginationMeta
}

export interface TradeFilters {
  status?: string
  bot_id?: number
  account_id?: number
  signal?: string
  date_from?: string
  date_to?: string
}

/**
 * List trades with filters
 */
export async function list(page = 1, perPage = 20, filters?: TradeFilters): Promise<TradesListResponse> {
  return apiList<Trade>('/trades', { page, per_page: perPage, ...filters })
}

/**
 * Get trade detail with orders
 */
export async function get(id: number): Promise<Trade> {
  return apiGet<Trade>(`/trades/${id}`)
}

/**
 * Get trade logs
 */
export async function logs(id: number): Promise<unknown> {
  return apiGet(`/trades/${id}/logs`)
}

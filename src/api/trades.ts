import { apiClient } from './client'
import type { ApiResponse, Trade, PaginationMeta } from '@/types/api'

export interface TradesListResponse {
  data: Trade[]
  meta: PaginationMeta
}

export interface TradeFilters {
  status?: string
  bot_id?: number
  signal?: string
  date_from?: string
  date_to?: string
}

/**
 * List trades with filters
 */
export async function list(page = 1, perPage = 20, filters?: TradeFilters) {
  const response = await apiClient.get<ApiResponse<TradesListResponse>>('/trades', {
    params: { page, per_page: perPage, ...filters },
  })
  return response.data
}

/**
 * Get trade detail with orders
 */
export async function get(id: number) {
  const response = await apiClient.get<ApiResponse<Trade>>(`/trades/${id}`)
  return response.data
}

/**
 * Get trade logs
 */
export async function logs(id: number) {
  const response = await apiClient.get<ApiResponse>(`/trades/${id}/logs`)
  return response.data
}

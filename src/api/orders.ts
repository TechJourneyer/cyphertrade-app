import { apiClient } from './client'
import type { ApiResponse, Order, PaginationMeta } from '@/types/api'

export interface OrdersListResponse {
  data: Order[]
  meta: PaginationMeta
}

export interface OrderFilters {
  status?: string
  bot_id?: number
  date_from?: string
  date_to?: string
}

/**
 * List orders with filters
 */
export async function list(page = 1, perPage = 20, filters?: OrderFilters) {
  const response = await apiClient.get<ApiResponse<OrdersListResponse>>('/orders', {
    params: { page, per_page: perPage, ...filters },
  })
  return response.data
}

/**
 * Get order detail
 */
export async function get(id: number) {
  const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
  return response.data
}

/**
 * Get order logs
 */
export async function logs(id: number) {
  const response = await apiClient.get<ApiResponse>(`/orders/${id}/logs`)
  return response.data
}

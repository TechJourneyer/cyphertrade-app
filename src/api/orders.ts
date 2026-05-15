import { apiGet, apiList } from './client'
import type { Order, PaginationMeta } from '@/types/api'

export interface OrdersListResponse {
  data: Order[]
  meta: PaginationMeta
}

export interface OrderFilters {
  status?: string
  bot_id?: number
  account_id?: number
  date_from?: string
  date_to?: string
}

/**
 * List orders with filters
 */
export async function list(page = 1, perPage = 20, filters?: OrderFilters): Promise<OrdersListResponse> {
  return apiList<Order>('/orders', { page, per_page: perPage, ...filters })
}

/**
 * Get order detail
 */
export async function get(id: number): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`)
}

/**
 * Get order logs
 */
export async function logs(id: number): Promise<unknown> {
  return apiGet(`/orders/${id}/logs`)
}

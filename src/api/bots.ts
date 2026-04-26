import { apiClient } from './client'
import type { ApiResponse, Bot, PaginationMeta } from '@/types/api'

export interface CreateBotPayload {
  name: string
  strategy_id: number
  account_id: number
  per_trade_limit: number
  max_investment_limit: number
}

export interface UpdateBotPayload extends Partial<CreateBotPayload> {
  status?: 0 | 1   // 1 = active, 0 = inactive
}

export interface BotsListResponse {
  data: Bot[]
  meta: PaginationMeta
}

/**
 * List all bots for current user (paginated)
 */
export async function list(page = 1, perPage = 20, filters?: Record<string, unknown>) {
  const response = await apiClient.get<ApiResponse<Bot[]>>(
    '/bots',
    { params: { page, per_page: perPage, ...filters } }
  )
  return response.data
}

/**
 * Get single bot by ID
 */
export async function get(id: number) {
  const response = await apiClient.get<ApiResponse<Bot>>(`/bots/${id}`)
  return response.data
}

/**
 * Create new bot
 */
export async function create(payload: CreateBotPayload) {
  const response = await apiClient.post<ApiResponse<Bot>>('/bots', payload)
  return response.data
}

/**
 * Update bot
 */
export async function update(id: number, payload: UpdateBotPayload) {
  const response = await apiClient.patch<ApiResponse<Bot>>(`/bots/${id}`, payload)
  return response.data
}

/**
 * Delete bot
 */
export async function destroy(id: number) {
  await apiClient.delete(`/bots/${id}`)
}

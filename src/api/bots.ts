import { apiGet, apiList, apiPost, apiPatch, apiDelete } from './client'
import type { Bot, PaginationMeta } from '@/types/api'

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
export async function list(page = 1, perPage = 20, filters?: Record<string, unknown>): Promise<BotsListResponse> {
  return apiList<Bot>('/bots', { page, per_page: perPage, ...filters })
}

/**
 * Get single bot by ID
 */
export async function get(id: number): Promise<Bot> {
  return apiGet<Bot>(`/bots/${id}`)
}

/**
 * Create new bot
 */
export async function create(payload: CreateBotPayload): Promise<Bot> {
  return apiPost<Bot>('/bots', payload)
}

/**
 * Update bot
 */
export async function update(id: number, payload: UpdateBotPayload): Promise<Bot> {
  return apiPatch<Bot>(`/bots/${id}`, payload)
}

/**
 * Delete bot
 */
export async function destroy(id: number): Promise<void> {
  return apiDelete(`/bots/${id}`)
}

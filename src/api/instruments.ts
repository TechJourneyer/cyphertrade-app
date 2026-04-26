import { apiClient } from './client'
import type { ApiResponse, Instrument, LiveMarketTick, PaginationMeta } from '@/types/api'

export interface InstrumentsListResponse {
  data: (Instrument & { market_data?: LiveMarketTick })[]
  meta: PaginationMeta
}

export interface ScreenerResult {
  id: number
  instrument_key: string
  trading_symbol: string
  name: string
  scanner_type: string
  trend: string
  priority: number
  price: number
  change_percent: number
  scanned_at: string
}

export interface ScreenerListResponse {
  data: ScreenerResult[]
  meta: PaginationMeta
}

/**
 * List all instruments (paginated, searchable)
 */
export async function list(page = 1, perPage = 50, filters?: { search?: string }) {
  const response = await apiClient.get<ApiResponse<InstrumentsListResponse>>(
    '/instruments',
    { params: { page, per_page: perPage, ...filters } }
  )
  return response.data
}

/**
 * Get instrument with live market data
 */
export async function get(id: number) {
  const response = await apiClient.get<ApiResponse<Instrument>>(`/instruments/${id}/details`)
  return response.data
}

export const screener = {
  /**
   * Get screener results with filters
   */
  results: async (page = 1, perPage = 30, filters?: Record<string, string>) => {
    const response = await apiClient.get<ApiResponse<ScreenerListResponse>>('/screener', {
      params: { page, per_page: perPage, ...filters },
    })
    return response.data
  },
}

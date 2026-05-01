import { apiGet, apiList } from './client'
import type { Instrument, LiveMarketTick, PaginationMeta } from '@/types/api'

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
export async function list(page = 1, perPage = 50, filters?: { search?: string }): Promise<InstrumentsListResponse> {
  return apiList<Instrument & { market_data?: LiveMarketTick }>('/instruments', { page, per_page: perPage, ...filters })
}

/**
 * Get instrument with live market data
 */
export async function get(id: number): Promise<Instrument> {
  return apiGet<Instrument>(`/instruments/${id}/details`)
}

export const screener = {
  /**
   * Get screener results with filters
   */
  results: async (page = 1, perPage = 30, filters?: Record<string, string>): Promise<ScreenerListResponse> => {
    return apiList<ScreenerResult>('/screener', { page, per_page: perPage, ...filters })
  },
}

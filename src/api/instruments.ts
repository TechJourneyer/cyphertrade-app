import { apiGet, apiList } from './client'
import type { Instrument, LiveMarketTick, PaginationMeta } from '@/types/api'

export interface InstrumentsListResponse {
  data: (Instrument & { market_data?: LiveMarketTick })[]
  meta: PaginationMeta
}

export interface ScreenerResult {
  id: number
  scanner: string
  scanner_value?: string
  scan_date: string
  trend_direction: string
  trend_direction_value?: number
  trade_indicator: string
  trade_indicator_value?: number
  priority: number
  instrument: {
    id: number
    name: string
    trading_symbol: string
    exchange: string
  } | null
}

export interface ScreenerListResponse {
  data: ScreenerResult[]
  meta: PaginationMeta
}

/**
 * List all instruments (paginated, searchable)
 */
export async function list(
  page = 1,
  perPage = 50,
  filters?: { search?: string; status?: string; index_name?: string },
): Promise<InstrumentsListResponse> {
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
  results: async (page = 1, perPage = 30, filters?: Record<string, string | undefined>): Promise<ScreenerListResponse> => {
    return apiList<ScreenerResult>('/screener', { page, per_page: perPage, ...filters })
  },
}

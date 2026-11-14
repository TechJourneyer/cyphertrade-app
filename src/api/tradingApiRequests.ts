import { apiGet, apiList } from './client'
import type { TradingApiRequestLog } from '@/types/api'

export interface TradingApiRequestFilters {
  status?: string
  date?: string
  endpoint?: string
}

export function list(page = 1, perPage = 20, filters: TradingApiRequestFilters = {}) {
  return apiList<TradingApiRequestLog>('/trading-api-requests', {
    page,
    per_page: perPage,
    status: filters.status || undefined,
    date: filters.date || undefined,
    endpoint: filters.endpoint || undefined,
  })
}

export function get(id: number): Promise<TradingApiRequestLog> {
  return apiGet<TradingApiRequestLog>(`/trading-api-requests/${id}`)
}

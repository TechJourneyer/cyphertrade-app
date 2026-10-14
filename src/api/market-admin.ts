import { apiClient, apiGet, apiList, apiPost, apiPut } from './client'
import type { PaginationMeta } from '@/types/api'
import type { TokenCheckResult } from './trading-accounts'

export interface MarketHoliday {
  id: number
  date: string
  exchange: string
  description: string | null
  holiday_type: string | null
  market_status: number
  market_status_label: string
  start_time: string | null
  end_time: string | null
}

export interface IndexSummary {
  id: number
  name: string
  exchange: string
  active_constituents: number
  updated_at: string | null
}

export interface IndexImportResult {
  rows: number
  indexes: Array<{
    name: string
    matched: number
    deactivated: number
    missing_symbols: string[]
  }>
  errors: string[]
}

export interface BrokerCredentialStatus {
  broker: string
  purpose: string
  has_token: boolean
  last_verified_at: string | null
  verification_ok: boolean | null
  verification_message: string | null
  check?: TokenCheckResult
}

export function listHolidays(page = 1, filters?: { exchange?: string; year?: string }): Promise<{ data: MarketHoliday[]; meta: PaginationMeta }> {
  return apiList<MarketHoliday>('/market/holidays', {
    page,
    per_page: 50,
    exchange: filters?.exchange || undefined,
    year: filters?.year || undefined,
  })
}

export function listIndexes(): Promise<IndexSummary[]> {
  return apiGet<IndexSummary[]>('/market/indices')
}

export async function downloadIndexTemplate(): Promise<void> {
  const response = await apiClient.get('/market/indices/template', { responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = 'index-constituents.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export async function importIndexes(file: File, indexId: number): Promise<IndexImportResult> {
  const body = new FormData()
  body.append('index_id', String(indexId))
  body.append('file', file)
  const response = await apiClient.post<{ data: IndexImportResult }>('/market/indices/import', body, {
    headers: { 'Content-Type': undefined },
  })
  return response.data.data
}

export function getBrokerCredential(broker = 'upstox'): Promise<BrokerCredentialStatus> {
  return apiGet<BrokerCredentialStatus>('/market/broker-credentials', { broker, purpose: 'analytics' })
}

export function saveBrokerCredential(token: string, broker = 'upstox'): Promise<BrokerCredentialStatus> {
  return apiPut<BrokerCredentialStatus>('/market/broker-credentials', {
    broker,
    purpose: 'analytics',
    token,
  })
}

export function verifyBrokerCredential(broker = 'upstox'): Promise<BrokerCredentialStatus> {
  return apiPost<BrokerCredentialStatus>('/market/broker-credentials/verify', {
    broker,
    purpose: 'analytics',
  })
}

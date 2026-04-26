import { apiClient } from './client'
import type { ApiResponse, TradingAccount, PaginationMeta } from '@/types/api'

export interface CredentialField {
  name:             string
  label:            string
  type:             'text' | 'password' | 'select' | 'select2' | 'string'
  required:         boolean
  validation_rule?: string
  options?:         Record<string, string>
  has_value?:       boolean
}

export interface CreateTradingAccountPayload {
  account_name: string
  app_name: string
  status?: number        // 1 = active, 0 = inactive
  credentials?: Record<string, string>
}

export interface UpdateTradingAccountPayload {
  account_name?: string
  status?: number        // 1 = active, 0 = inactive
  credentials?: Record<string, string>
}

export interface TradingAccountsListResponse {
  data: TradingAccount[]
  meta: PaginationMeta
}

/**
 * List all trading accounts for current user
 */
export async function list(page = 1, perPage = 20) {
  const response = await apiClient.get<ApiResponse<TradingAccountsListResponse>>(
    '/trading-accounts',
    { params: { page, per_page: perPage } }
  )
  return response.data
}

/**
 * Get single trading account
 */
export async function get(id: number) {
  const response = await apiClient.get<ApiResponse<TradingAccount>>(`/trading-accounts/${id}`)
  return response.data
}

/**
 * Create trading account
 */
export async function create(payload: CreateTradingAccountPayload) {
  const response = await apiClient.post<ApiResponse<TradingAccount>>(
    '/trading-accounts',
    payload
  )
  return response.data
}

/**
 * Update trading account
 */
export async function update(id: number, payload: UpdateTradingAccountPayload) {
  const response = await apiClient.patch<ApiResponse<TradingAccount>>(
    `/trading-accounts/${id}`,
    payload
  )
  return response.data
}

/**
 * Get credential field definitions (not values) for a given account
 */
export async function getCredentialsSchema(id: number) {
  const response = await apiClient.get<ApiResponse<{ fields: CredentialField[] }>>(`/trading-accounts/${id}/credentials`)
  return response.data
}

/**
 * Exchange OAuth code for access token and persist it
 */
export async function saveAccessToken(id: number, code: string) {
  const response = await apiClient.post<ApiResponse>(
    `/trading-accounts/${id}/access-token`,
    { code }
  )
  return response.data
}

/**
 * Get OAuth redirect/login URL so SPA can navigate there to start terminal
 */
export async function getRedirectUrl(id: number): Promise<string | undefined> {
  if (typeof id !== 'number' || Number.isNaN(id)) {
    throw new Error('Invalid trading account id')
  }

  const response = await apiClient.get<ApiResponse<{ login_url: string }>>(
    `/trading-accounts/${id}/redirect`
  )
  return response.data.data?.login_url
}

/**
 * Disconnect (stop) the terminal — clears auth_code, resets auth_status to inactive
 */
export async function disconnect(id: number) {
  const response = await apiClient.post<ApiResponse<TradingAccount>>(
    `/trading-accounts/${id}/disconnect`
  )
  return response.data
}

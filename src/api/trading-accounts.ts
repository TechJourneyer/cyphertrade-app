import { apiGet, apiList, apiPost, apiPatch } from './client'
import type { TradingAccount, PaginationMeta } from '@/types/api'

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
export async function list(page = 1, perPage = 20): Promise<TradingAccountsListResponse> {
  return apiList<TradingAccount>('/trading-accounts', { page, per_page: perPage })
}

/**
 * Get single trading account
 */
export async function get(id: number): Promise<TradingAccount> {
  return apiGet<TradingAccount>(`/trading-accounts/${id}`)
}

/**
 * Create trading account
 */
export async function create(payload: CreateTradingAccountPayload): Promise<TradingAccount> {
  return apiPost<TradingAccount>('/trading-accounts', payload)
}

/**
 * Update trading account
 */
export async function update(id: number, payload: UpdateTradingAccountPayload): Promise<TradingAccount> {
  return apiPatch<TradingAccount>(`/trading-accounts/${id}`, payload)
}

/**
 * Get credential field definitions (not values) for a given account
 */
export async function getCredentialsSchema(id: number): Promise<{ fields: CredentialField[] }> {
  return apiGet<{ fields: CredentialField[] }>(`/trading-accounts/${id}/credentials`)
}

/**
 * Exchange OAuth code for access token and persist it
 */
export async function saveAccessToken(id: number, code: string): Promise<unknown> {
  return apiPost(`/trading-accounts/${id}/access-token`, { code })
}

/**
 * Get OAuth redirect/login URL so SPA can navigate there to start terminal
 */
export async function getRedirectUrl(id: number): Promise<string | undefined> {
  if (typeof id !== 'number' || Number.isNaN(id)) {
    throw new Error('Invalid trading account id')
  }
  const result = await apiGet<{ login_url: string }>(`/trading-accounts/${id}/redirect`)
  return result.login_url
}

/**
 * Disconnect (stop) the terminal — clears auth_code, resets auth_status to inactive
 */
export async function disconnect(id: number): Promise<TradingAccount> {
  return apiPost<TradingAccount>(`/trading-accounts/${id}/disconnect`)
}

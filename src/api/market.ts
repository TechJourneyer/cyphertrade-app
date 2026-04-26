import { apiGet } from './client'
import type { LiveMarketTick } from '@/types/api'

export async function getLiveMarket(): Promise<LiveMarketTick[]> {
  return apiGet<LiveMarketTick[]>('/market/live')
}

export async function getLiveMarketTick(instrumentKey: string): Promise<LiveMarketTick> {
  return apiGet<LiveMarketTick>(`/market/live/${encodeURIComponent(instrumentKey)}`)
}

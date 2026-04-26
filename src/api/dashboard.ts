import { apiGet } from './client'
import type { DashboardData } from '@/types/api'

export async function getDashboard(): Promise<DashboardData> {
  return apiGet<DashboardData>('/dashboard')
}

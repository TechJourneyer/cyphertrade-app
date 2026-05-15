import { apiGet } from './client'
import type { DashboardData } from '@/types/api'

interface RawDashboardResponse {
  bots?: {
    active?: number
    total?: number
  }
  trading_accounts?: {
    active_terminals?: number
    total?: number
  }
  today_summary?: {
    total_trades?: number
    total_profit?: number
    filled_orders?: number
  }
  market?: {
    is_open?: boolean
    last_sync?: string | null
  }
  active_bots?: number
  active_terminals?: number
  today_trades?: number
  today_pnl?: number
  filled_orders?: number
  market_status?: 'open' | 'closed' | 'holiday'
  market_status_label?: string
  last_sync_at?: string | null
}

export async function getDashboard(accountId?: number | null): Promise<DashboardData> {
  const raw = await apiGet<RawDashboardResponse>('/dashboard', accountId ? { account_id: accountId } : undefined)

  const marketStatus = raw.market_status ?? (raw.market?.is_open ? 'open' : 'closed')

  return {
    active_bots: raw.active_bots ?? raw.bots?.active ?? 0,
    active_terminals: raw.active_terminals ?? raw.trading_accounts?.active_terminals ?? 0,
    today_trades: raw.today_trades ?? raw.today_summary?.total_trades ?? 0,
    today_pnl: raw.today_pnl ?? raw.today_summary?.total_profit ?? 0,
    filled_orders: raw.filled_orders ?? raw.today_summary?.filled_orders ?? 0,
    market_status: marketStatus,
    market_status_label: raw.market_status_label ?? marketStatus.charAt(0).toUpperCase() + marketStatus.slice(1),
    last_sync_at: raw.last_sync_at ?? raw.market?.last_sync ?? null,
  }
}

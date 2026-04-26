/** Standard API response envelope from cyphertrade-api */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data:    T
  meta?:   PaginationMeta
}

export interface PaginationMeta {
  current_page:  number
  last_page:     number
  per_page:      number
  total:         number
  from:          number | null
  to:            number | null
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email:    string
  password: string
}

export interface AuthUser {
  id:         number
  name:       string
  email:      string
  roles:      string[]
  permissions: string[]
  created_at: string
}

export interface LoginResponse {
  token: string
  user:  AuthUser
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  active_bots:        number
  active_terminals:   number
  today_trades:       number
  today_pnl:          number
  filled_orders:      number
  market_status:      'open' | 'closed' | 'holiday'
  market_status_label: string
  last_sync_at:       string | null
}

// ─── Bots ────────────────────────────────────────────────────────────────────

export type BotStatus = 0 | 1

export interface Bot {
  id:                  number
  name:                string
  status:              BotStatus
  strategy_id:         number | null
  account_id:          number | null
  per_trade_limit:     number
  max_investment_limit: number
  strategy: {
    id:   number
    name: string
    code: string
  } | null
  account: {
    id:           number
    account_name: string
    app_name:     string
  } | null
  created_at: string
  updated_at: string
}

// ─── Trading Accounts ─────────────────────────────────────────────────────────

export type AccountStatus = 'active' | 'inactive' | 'token_expired'

export interface TradingAccount {
  id:               number
  account_name:     string
  app_name:         string
  asset_class:      string | null
  status:           string
  auth_status:      string
  is_terminal_on:   boolean
  expiry_time:      string | null
  last_verified_at: string | null
  created_at:       string
  updated_at:       string
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'open' | 'filled' | 'cancelled' | 'rejected' | 'expired'
export type OrderSide   = 'BUY' | 'SELL'
export type OrderType   = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M'

export interface Order {
  id:                 number
  trade_id:           number | null
  instrument_id:      number | null
  order_stage:        string | null
  transaction_type:   string | null
  order_type:         string | null
  order_product:      string | null
  validity:           string | null
  status:             string | null
  exit_reason:        string | null
  quantity:           number
  price:              number
  trigger_price:      number
  executed_price:     number | null
  fees:               number | null
  broker_order_id:    string | null
  order_date:         string | null
  executed_timestamp: string | null
  instrument: {
    id:             number
    name:           string
    trading_symbol: string
  } | null
  created_at: string
  updated_at: string
}

// ─── Trades ──────────────────────────────────────────────────────────────────

export type TradeStatus   = 'active' | 'completed' | 'cancelled' | 'failed'
export type TradeSignal   = 'BUY' | 'SELL'
export type TradeExitType = 'target' | 'stoploss' | 'manual' | 'eod' | 'expired'

export interface Trade {
  trade_id:          number
  signal:            string | null
  strategy_name:     string | null
  status:            string | null
  quantity:          number
  entry_target:      number
  stop_loss:         number
  rr_ratio:          number | null
  pnl:               number | null
  trade_start_time:  string | null
  trade_expiry_time: string | null
  bot_id:            number | null
  account_id:        number | null
  instrument_id:     number | null
  bot: {
    id:   number
    name: string
  } | null
  instrument: {
    id:             number
    name:           string
    trading_symbol: string
  } | null
}

// ─── Instruments ─────────────────────────────────────────────────────────────

export interface Instrument {
  id:              number
  name:            string
  trading_symbol:  string
  instrument_key:  string
  exchange:        string
  isin:            string | null
  instrument_type: string
  lot_size:        number
  tick_size:       number
  status:          number
  market_data?: {
    open:               number
    high:               number
    low:                number
    close:              number
    last_price:         number
    volume:             number
    net_change:         number
    equity_margin_rate: number
    last_trade_time:    string | null
  } | null
  updated_at: string
}

// ─── Live Market Data ─────────────────────────────────────────────────────────

export interface LiveMarketTick {
  instrument_key:      string
  trading_symbol:      string
  name:                string
  exchange:            string
  last_price:          number
  open:                number
  high:                number
  low:                 number
  close:               number
  average_price:       number
  net_change:          number
  change_percent:      number
  market_trend:        'bullish' | 'bearish' | 'neutral'
  lower_circuit_limit: number
  upper_circuit_limit: number
  volume:              number
  last_trade_time:     string | null
  tick_at:             string | null
  updated_at:          string
}

// ─── Strategies ──────────────────────────────────────────────────────────────

export interface Strategy {
  id:          number
  name:        string
  description: string | null
  is_active:   boolean
  params:      Record<string, unknown>
  created_at:  string
  updated_at:  string
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id:         number
  name:       string
  email:      string
  roles:      string[]
  is_active:  boolean
  created_at: string
}

// ─── Roles & Permissions ──────────────────────────────────────────────────────

export interface Role {
  id:          number
  name:        string
  guard_name:  string
  permissions: string[]
  users_count: number
  created_at:  string
}

export interface Permission {
  id:         number
  name:       string
  guard_name: string
  group:      string
}

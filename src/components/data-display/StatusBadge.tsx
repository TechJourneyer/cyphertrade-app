import { cn } from '@/lib/utils'
import type {
  BotStatus,
  AccountStatus,
  OrderStatus,
  TradeStatus,
  TradeSignal,
  OrderSide,
} from '@/types/api'

type StatusValue =
  | BotStatus
  | AccountStatus
  | OrderStatus
  | TradeStatus
  | TradeSignal
  | OrderSide
  | 'open'
  | 'closed'
  | 'holiday'

const statusConfig: Record<string, { label: string; className: string }> = {
  // Bot
  active:        { label: 'Active',        className: 'bg-success/15 text-success border-success/30' },
  inactive:      { label: 'Inactive',      className: 'bg-muted text-muted-foreground border-border' },
  paused:        { label: 'Paused',        className: 'bg-warning/15 text-warning border-warning/30' },
  error:         { label: 'Error',         className: 'bg-destructive/15 text-destructive border-destructive/30' },
  // Account
  token_expired: { label: 'Token Expired', className: 'bg-warning/15 text-warning border-warning/30' },
  // Orders
  pending:       { label: 'Pending',       className: 'bg-primary/15 text-primary border-primary/30' },
  open:          { label: 'Open',          className: 'bg-primary/15 text-primary border-primary/30' },
  filled:        { label: 'Filled',        className: 'bg-success/15 text-success border-success/30' },
  cancelled:     { label: 'Cancelled',     className: 'bg-muted text-muted-foreground border-border' },
  rejected:      { label: 'Rejected',      className: 'bg-destructive/15 text-destructive border-destructive/30' },
  expired:       { label: 'Expired',       className: 'bg-muted text-muted-foreground border-border' },
  // Trades
  completed:     { label: 'Completed',     className: 'bg-success/15 text-success border-success/30' },
  failed:        { label: 'Failed',        className: 'bg-destructive/15 text-destructive border-destructive/30' },
  // Signal / Side
  BUY:           { label: 'BUY',           className: 'bg-success/15 text-success border-success/30 font-semibold' },
  SELL:          { label: 'SELL',          className: 'bg-destructive/15 text-destructive border-destructive/30 font-semibold' },
  // Market
  closed:        { label: 'Closed',        className: 'bg-muted text-muted-foreground border-border' },
  holiday:       { label: 'Holiday',       className: 'bg-warning/15 text-warning border-warning/30' },
}

interface StatusBadgeProps {
  status:     StatusValue | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label:     status,
    className: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

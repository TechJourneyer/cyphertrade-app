import { cn, formatCurrency, formatChange, changeClass } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label:      string
  value:      string | number | null | undefined
  icon?:      LucideIcon
  change?:    number
  currency?:  boolean
  loading?:   boolean
  className?: string
  /** Render the value in monospace (for prices, quantities) */
  mono?:      boolean
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  currency = false,
  loading = false,
  className,
  mono = false,
}: StatCardProps) {
  const formattedValue = loading
    ? null
    : currency
    ? formatCurrency(value as number)
    : value ?? '—'

  return (
    <div
      className={cn(
        'surface-1 rounded-lg p-5 flex flex-col gap-3 animate-fade-in',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span className="rounded-md bg-primary/10 p-1.5 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <span
          className={cn(
            'text-2xl font-bold tracking-tight',
            mono && 'font-mono tabular-nums',
          )}
        >
          {formattedValue}
        </span>
      )}

      {change !== undefined && !loading && (
        <span className={cn('text-xs font-medium', changeClass(change))}>
          {formatChange(change, true)} vs yesterday
        </span>
      )}
    </div>
  )
}

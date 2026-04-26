import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title?:       string
  description?: string
  icon?:        LucideIcon
  action?:      React.ReactNode
  className?:   string
}

export function EmptyState({
  title       = 'No results',
  description = 'Nothing to show here yet.',
  icon: Icon  = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-4 text-center',
        className,
      )}
    >
      <div className="rounded-full bg-muted/50 p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground max-w-[280px]">{description}</p>
      </div>
      {action}
    </div>
  )
}

import { cn } from '@/lib/utils'
import { Breadcrumb } from './Breadcrumb'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title:         string
  description?:  string
  breadcrumbs?:  BreadcrumbItem[]
  actions?:      React.ReactNode
  className?:    string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-0.5" />
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}

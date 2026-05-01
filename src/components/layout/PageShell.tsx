import { cn } from '@/lib/utils'
import { PageHeader } from './PageHeader'
import { Skeleton } from '@/components/ui/skeleton'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageShellProps {
  /** Page title shown in the header */
  title: string
  /** Optional subtitle shown below the title */
  description?: string
  /** Breadcrumb trail — last item is always the current page (no href needed) */
  breadcrumbs?: BreadcrumbItem[]
  /** Right-side header actions (buttons, dropdowns, etc.) */
  actions?: React.ReactNode
  /** Page content */
  children?: React.ReactNode
  /** When true the page renders a loading skeleton instead of children */
  isLoading?: boolean
  /** Additional class names on the root wrapper */
  className?: string
}

/**
 * Standard wrapper for every dashboard page.
 *
 * Usage:
 * ```tsx
 * <PageShell
 *   title="My Page"
 *   description="Subtitle text"
 *   breadcrumbs={[{ label: 'Parent', href: '/parent' }, { label: 'My Page' }]}
 *   actions={<Button>Action</Button>}
 * >
 *   {content}
 * </PageShell>
 * ```
 *
 * Guarantees:
 * - Consistent `space-y-6 animate-fade-in` root wrapper on every page
 * - PageHeader with breadcrumbs rendered from one place
 * - Hydration skeleton rendered when `isLoading` is true
 */
export function PageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  isLoading = false,
  className,
}: PageShellProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <div className={cn('space-y-6 animate-fade-in', className)}>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      {children}
    </div>
  )
}

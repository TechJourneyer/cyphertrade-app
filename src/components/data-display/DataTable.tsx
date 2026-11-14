import React, { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, LayoutList, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  /** A row field, or a display-only id when `render` supplies the cell. */
  key: keyof T | (string & {})
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
}

export interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  isEmpty?: boolean
  emptyText?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: string) => void
  skeletonRows?: number
  pagination?: DataTablePaginationProps
  rowClassName?: (row: T) => string | undefined
  /** Render only the page controls, for a list that is already grouped above. */
  pagerOnly?: boolean
  /** Drop the outer card so a parent group frame can wrap the rows. */
  bare?: boolean
}

export function DataTable<T extends object>({
  columns,
  data,
  isLoading = false,
  isEmpty = false,
  emptyText = 'No data available',
  sortBy,
  sortOrder = 'asc',
  onSort,
  skeletonRows = 10,
  pagination,
  rowClassName,
  pagerOnly = false,
  bare = false,
}: DataTableProps<T>) {
  const [mobileView, setMobileView] = useState<'cards' | 'table'>('cards')

  const cell = (col: DataTableColumn<T>, row: T): React.ReactNode => {
    const value = (row as Record<string | symbol, unknown>)[col.key as string | symbol]
    if (col.render) return col.render(value, row)
    if (value === null || value === undefined || value === '') return '—'
    return String(value)
  }

  const pager = pagination ? (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-3 sm:px-4">
      <p className="text-xs text-muted-foreground">
        Page {pagination.currentPage} of {pagination.totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-3 w-3" />
          Prev
        </button>
        <button
          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  ) : null

  const viewToggle = (
    <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 md:hidden">
      <p className="text-xs text-muted-foreground">
        {mobileView === 'cards' ? 'Stacked rows' : 'Full grid'}
      </p>
      <button
        type="button"
        onClick={() => setMobileView((view) => (view === 'cards' ? 'table' : 'cards'))}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2.5 text-xs font-medium text-foreground"
      >
        {mobileView === 'cards' ? <Table2 className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
        {mobileView === 'cards' ? 'View table' : 'View cards'}
      </button>
    </div>
  )

  if (pagerOnly) {
    if (!pagination || pagination.totalPages <= 1) return null
    return <div className="rounded-lg border border-border bg-card">{pager}</div>
  }

  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-border bg-secondary/30">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className={`px-4 py-3 text-left font-semibold text-foreground ${col.className ?? ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, idx) => (
              <tr key={idx} className="border-b border-border">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (isEmpty || data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className={bare ? 'bg-card' : 'overflow-hidden rounded-lg border border-border bg-card'}>
      {viewToggle}
      <div className={cn('divide-y divide-border md:hidden', mobileView === 'table' && 'hidden')}>
        {data.map((row, idx) => (
          <article key={idx} className={cn('space-y-2 p-3', rowClassName?.(row))}>
            {columns.map((col) => (
              <div key={String(col.key)} className="flex items-start justify-between gap-3 text-sm">
                <span className="shrink-0 text-xs text-muted-foreground">{col.label}</span>
                <span className={cn('min-w-0 text-right text-foreground', col.className)}>{cell(col, row)}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
      <div className={cn('overflow-x-auto', mobileView === 'cards' && 'hidden md:block')}>
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="border-b border-border bg-secondary/30">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-left font-semibold text-foreground ${col.className ?? ''}`}
              >
                {col.sortable ? (
                  <button
                    onClick={() => onSort?.(String(col.key))}
                    className="flex items-center gap-1 hover:text-muted-foreground cursor-pointer"
                  >
                    {col.label}
                    {sortBy === String(col.key) && (
                      sortOrder === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={`border-b border-border hover:bg-secondary/50 transition-colors ${rowClassName?.(row) ?? ''}`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-4 py-3 text-foreground ${col.className ?? ''}`}>
                  {cell(col, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {pager}
    </div>
  )
}

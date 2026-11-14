import type { ActivityLog } from '@/types/api'
import { formatWhen } from '@/lib/utils'

export function ActivityList({
  logs,
  isLoading,
}: {
  logs: ActivityLog[] | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading activity…</p>
  }

  if (!logs || logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
  }

  return (
    <ol className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="rounded-lg border border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {log.activity ?? 'Activity'}
            </span>
            <time className="text-xs text-muted-foreground">{formatWhen(log.created_at)}</time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{log.message || '—'}</p>
        </li>
      ))}
    </ol>
  )
}

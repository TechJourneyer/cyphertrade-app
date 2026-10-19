'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Circle, Clock3, ListChecks } from 'lucide-react'
import { getSetupChecklist, type SetupStatus } from '@/api/setup'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<SetupStatus, string> = {
  done: 'Ready',
  todo: 'Missing',
  attention: 'Needs attention',
  waiting: 'Waiting',
}

function StatusIcon({ status }: { status: SetupStatus }) {
  if (status === 'done') return <CheckCircle2 className="h-4 w-4 shrink-0 text-gain" />
  if (status === 'attention') return <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
  if (status === 'waiting') return <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
  return <Circle className="h-4 w-4 shrink-0 text-warning" />
}

function useSetupChecklist() {
  return useQuery({
    queryKey: ['setup-checklist'],
    queryFn: getSetupChecklist,
    staleTime: 60_000,
  })
}

export function SetupStatusButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { data, isPending, isError } = useSetupChecklist()

  const incomplete = Boolean(data && !data.complete)
  const label = open
    ? 'Hide setup'
    : isError
      ? 'Setup status unavailable'
      : isPending
        ? 'Setup'
        : incomplete
          ? 'Setup incomplete'
          : 'Setup complete'

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={onToggle}
      className={cn(incomplete && !open && 'border-warning/40 text-warning hover:text-warning')}
    >
      <ListChecks className="h-3.5 w-3.5" />
      {label}
      {incomplete && !open && data && (
        <span className="rounded-full bg-warning/15 px-1.5 text-[10px]">{data.remaining}</span>
      )}
    </Button>
  )
}

export function SetupChecklistPanel({ onClose }: { onClose: () => void }) {
  const { data, isPending, isError, refetch } = useSetupChecklist()

  let step = 0

  return (
    <section id="setup" className="rounded-lg border border-border bg-surface-1">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Setup</p>
          <p className="mt-1 text-sm font-medium">
            {isPending && 'Checking setup…'}
            {isError && 'Setup checklist did not load'}
            {data?.complete && 'Setup is complete'}
            {data && !data.complete && `${data.remaining} step${data.remaining === 1 ? '' : 's'} still open`}
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          Hide
        </Button>
      </div>

      {isError && (
        <div className="px-4 pb-3">
          <button type="button" onClick={() => refetch()} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
            Try again
          </button>
        </div>
      )}

      {data && !data.complete && data.next && (
        <div className="mx-4 mb-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-warning">Next step</p>
          <p className="mt-1 font-medium">{data.next.title}</p>
          <p className="mt-1 text-muted-foreground">{data.next.action}</p>
          {data.next.href && (
            <Link href={data.next.href} className="mt-2 inline-flex text-xs font-medium text-warning underline-offset-2 hover:underline">
              Open this step
            </Link>
          )}
        </div>
      )}

      {data && (
        <div className="space-y-4 border-t border-border px-4 py-3">
          {data.groups.map((group) => (
            <div key={group.id}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{group.title}</p>
              <ol className="mt-2 space-y-2">
                {group.items.map((item) => {
                  step += 1
                  const openStep = item.status === 'todo' || item.status === 'attention'
                  return (
                    <li key={item.id} className="flex gap-3 rounded-md bg-surface-2 px-3 py-2">
                      <span className="mt-0.5 w-5 font-mono text-xs text-muted-foreground">{step}</span>
                      <StatusIcon status={item.status} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{item.title}</p>
                          <span className={cn(
                            'text-[10px] uppercase tracking-wide',
                            item.status === 'done' && 'text-gain',
                            (item.status === 'todo' || item.status === 'attention') && 'text-warning',
                            item.status === 'waiting' && 'text-muted-foreground',
                          )}>
                            {STATUS_LABEL[item.status]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                        {openStep && item.action && (
                          <p className="mt-1 text-xs">{item.action}</p>
                        )}
                        {openStep && item.href && (
                          <Link href={item.href} className="mt-1 inline-flex text-xs font-medium underline-offset-2 hover:underline">
                            Go to {item.title.toLowerCase()}
                          </Link>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

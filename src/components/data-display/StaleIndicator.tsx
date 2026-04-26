'use client'

import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StaleIndicatorProps {
  isStale: boolean
  lastUpdated?: Date | string | null
}

export function StaleIndicator({ isStale, lastUpdated }: StaleIndicatorProps) {
  if (!isStale) return null

  const getTimeSince = () => {
    if (!lastUpdated) return 'Unknown time'
    const date = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)

    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
    return `${Math.floor(diffSecs / 3600)}h ago`
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
      'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30',
    )}>
      <AlertCircle className="h-3.5 w-3.5" />
      <span>Data may be stale — last updated {getTimeSince()}</span>
    </div>
  )
}

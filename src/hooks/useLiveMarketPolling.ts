import { useQuery } from '@tanstack/react-query'
import { getLiveMarket } from '@/api/market'
import { secondsAgo } from '@/lib/utils'
import type { LiveMarketTick } from '@/types/api'

const POLL_INTERVAL_MS  = 3_000
const STALE_THRESHOLD_S = 10

export interface LiveMarketState {
  ticks:   LiveMarketTick[]
  isStale: boolean
  isPending: boolean
  isError: boolean
}

export function useLiveMarketPolling(): LiveMarketState {
  const { data, isPending, isError } = useQuery({
    queryKey:                    ['market', 'live'],
    queryFn:                     getLiveMarket,
    refetchInterval:             POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,   // pause when tab is hidden
    staleTime:                   2_000,
  })

  // Consider data stale if the oldest tick hasn't updated in >10 s
  const isStale = !isPending && !isError && !!data && (
    data.length === 0 ||
    data.every((t) => secondsAgo(t.updated_at) > STALE_THRESHOLD_S)
  )

  return {
    ticks:     data ?? [],
    isStale,
    isPending,
    isError,
  }
}

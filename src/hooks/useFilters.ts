import { useState, useCallback, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export interface FilterState {
  [key: string]: string | string[] | undefined
}

/**
 * Sync filter state with URL search params.
 * Usage:
 *   const { filters, setFilter, clearFilters } = useFilters({ status: '', page: '1' })
 */
export function useFilters<T extends FilterState>(defaults: T) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // Build current filter state from URL, falling back to defaults
  const filters = Object.fromEntries(
    Object.entries(defaults).map(([key, def]) => [
      key,
      searchParams.get(key) ?? def,
    ]),
  ) as T

  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === '' || value === String(defaults[key])) {
        params.delete(key as string)
      } else {
        params.set(key as string, value)
      }
      // Reset to page 1 when any non-page filter changes
      if (key !== 'page') params.set('page', '1')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [searchParams, pathname, router, defaults],
  )

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname)
    })
  }, [pathname, router])

  return { filters, setFilter, clearFilters }
}

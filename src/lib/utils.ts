import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian locale currency string, e.g. ₹1,23,456.78 */
export function formatCurrency(
  value: number | string | null | undefined,
  decimals = 2,
): string {
  if (value == null || value === '') return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/** Format a number with fixed decimal places, e.g. 1234.56 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals = 2,
): string {
  if (value == null || value === '') return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/** Format a price change as "+1.23%" or "-0.45%" */
export function formatChange(
  value: number | string | null | undefined,
  asPercent = false,
): string {
  if (value == null || value === '') return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'
  const sign = num > 0 ? '+' : ''
  return asPercent
    ? `${sign}${num.toFixed(2)}%`
    : `${sign}${formatNumber(num)}`
}

/** Determine gain/loss/flat class from a numeric value */
export function changeClass(value: number | string | null | undefined): string {
  if (value == null || value === '') return 'text-flat'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num) || num === 0) return 'text-flat'
  return num > 0 ? 'text-gain' : 'text-loss'
}

/** Return how many seconds ago a date was */
export function secondsAgo(date: string | Date | null | undefined): number {
  if (!date) return Infinity
  return Math.floor((Date.now() - new Date(date).getTime()) / 1000)
}

/** Truncate a string with ellipsis */
export function truncate(str: string, length: number): string {
  return str.length <= length ? str : `${str.slice(0, length)}…`
}

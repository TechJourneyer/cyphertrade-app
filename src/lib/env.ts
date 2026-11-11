/**
 * Typed, validated access to environment variables.
 * NEXT_PUBLIC_* vars must be accessed via direct dot notation so Next.js
 * webpack DefinePlugin can statically inline them into the browser bundle.
 */

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL')
}

/** Local database viewer. Hidden in production unless explicitly set. */
const adminerUrl = process.env.NEXT_PUBLIC_ADMINER_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8088' : '')

export const env = {
  apiUrl,
  adminerUrl,
} as const

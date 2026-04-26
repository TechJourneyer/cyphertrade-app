/**
 * Typed, validated access to environment variables.
 * NEXT_PUBLIC_* vars must be accessed via direct dot notation so Next.js
 * webpack DefinePlugin can statically inline them into the browser bundle.
 */

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL')
}

export const env = {
  apiUrl,
} as const

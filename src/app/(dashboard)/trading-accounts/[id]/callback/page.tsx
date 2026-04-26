'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import * as tradingAccountsApi from '@/api/trading-accounts'

export default function TradingAccountCallbackPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [statusText, setStatusText] = useState('Processing broker callback...')

  const accountId = useMemo(() => {
    const rawId = params?.id
    const parsed = Number(rawId)
    return Number.isInteger(parsed) ? parsed : NaN
  }, [params])

  useEffect(() => {
    let isCancelled = false

    const finish = (status: 'success' | 'error', message: string) => {
      const qp = new URLSearchParams({ oauth: status, oauth_message: message })
      router.replace(`/trading-accounts/${params.id}/edit?${qp.toString()}`)
    }

    const run = async () => {
      if (Number.isNaN(accountId)) {
        finish('error', 'Invalid trading account id in callback URL.')
        return
      }

      const providerError = searchParams.get('error')
      if (providerError) {
        const providerErrorDescription =
          searchParams.get('error_description') ??
          searchParams.get('error_message') ??
          providerError

        finish('error', providerErrorDescription)
        return
      }

      const code = searchParams.get('code')
      if (!code) {
        finish('error', 'Authorization code missing in callback URL.')
        return
      }

      try {
        setStatusText('Saving access token for your account...')
        const response = await tradingAccountsApi.saveAccessToken(accountId, code)

        if (isCancelled) {
          return
        }

        finish('success', response.message || 'Terminal connected successfully.')
      } catch (error) {
        if (isCancelled) {
          return
        }

        const message =
          error instanceof Error ? error.message : 'Failed to complete broker authentication.'

        finish('error', message)
      }
    }

    run()

    return () => {
      isCancelled = true
    }
  }, [accountId, params.id, router, searchParams])

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center">
      <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">{statusText}</p>
        <p className="mt-1 text-xs text-muted-foreground">You will be redirected shortly.</p>
      </div>
    </div>
  )
}

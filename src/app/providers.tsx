'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { makeQueryClient } from '@/lib/query-client'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // useState so the client is stable and not recreated on every render
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast:       'bg-card border-border text-foreground',
            title:       'text-foreground font-medium text-sm',
            description: 'text-muted-foreground text-sm',
            success:     'border-success/30 text-success',
            error:       'border-destructive/30 text-destructive',
            warning:     'border-warning/30 text-warning',
          },
        }}
        richColors
      />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}

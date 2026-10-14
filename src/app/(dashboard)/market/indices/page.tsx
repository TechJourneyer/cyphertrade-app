'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/hooks/useAuth'
import * as marketAdminApi from '@/api/market-admin'
import type { IndexImportResult, IndexSummary } from '@/api/market-admin'

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

export default function MarketIndicesPage() {
  const { hasHydrated, hasRole } = useAuth()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<IndexImportResult | null>(null)

  const indexes = useQuery({
    queryKey: ['market-indices'],
    queryFn: () => marketAdminApi.listIndexes(),
    enabled: hasHydrated && hasRole('admin'),
  })

  const upload = useMutation({
    mutationFn: (next: File) => marketAdminApi.importIndexes(next),
    onSuccess: (payload) => {
      setResult(payload)
      setFile(null)
      queryClient.invalidateQueries({ queryKey: ['market-indices'] })
    },
  })

  const columns: DataTableColumn<IndexSummary>[] = [
    { key: 'name', label: 'Index' },
    { key: 'exchange', label: 'Exchange' },
    { key: 'active_constituents', label: 'Mapped symbols' },
    {
      key: 'updated_at',
      label: 'Updated',
      render: (value) => (typeof value === 'string' && value ? new Date(value).toLocaleString('en-IN') : '—'),
    },
  ]

  if (!hasHydrated) return <PageShell title="Index constituents" isLoading />

  if (!hasRole('admin')) {
    return (
      <PageShell title="Index constituents">
        <p className="text-sm text-muted-foreground">Only an admin can upload index files.</p>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Index constituents"
      description="Upload a CSV to replace Nifty index membership. Symbols must already exist as instruments."
      breadcrumbs={[{ label: 'Market' }, { label: 'Index constituents' }]}
    >
      <div className="max-w-2xl rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">CSV format</p>
          <p className="text-xs text-muted-foreground">
            Required columns are <span className="font-medium text-foreground">index_name</span> and <span className="font-medium text-foreground">symbol</span>.
            <span className="font-medium text-foreground"> exchange</span> is optional and defaults to NSE.
            index_name must be one of NIFTY 50, NIFTY 100, NIFTY 200, NIFTY BANK, NIFTY AUTO, or NIFTY MIDCAP 50.
            symbol must match the instrument trading symbol.
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted/40 px-3 py-2 text-xs text-foreground">{`index_name,symbol,exchange
NIFTY 50,RELIANCE,NSE
NIFTY BANK,HDFCBANK,NSE`}</pre>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => marketAdminApi.downloadIndexTemplate()}>
            Download template
          </Button>
          <input
            type="file"
            accept=".csv,text/csv"
            className="text-xs text-muted-foreground"
            onChange={(event) => {
              setResult(null)
              setFile(event.target.files?.[0] ?? null)
            }}
          />
          <Button
            type="button"
            size="sm"
            disabled={!file || upload.isPending}
            onClick={() => file && upload.mutate(file)}
          >
            {upload.isPending ? 'Uploading…' : 'Upload CSV'}
          </Button>
        </div>

        {upload.isError && (
          <p className="text-xs text-destructive">{apiErrorMessage(upload.error, 'Upload failed.')}</p>
        )}

        {result && (
          <div className="space-y-2 text-xs">
            <p className="text-foreground">{result.rows} symbols read.</p>
            {result.indexes.map((index) => (
              <p key={index.name} className="text-muted-foreground">
                {index.name}: {index.matched} mapped, {index.deactivated} removed
                {index.missing_symbols.length > 0 ? `. Not in instruments: ${index.missing_symbols.join(', ')}` : ''}
              </p>
            ))}
            {result.errors.map((error) => (
              <p key={error} className="text-destructive">{error}</p>
            ))}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={indexes.data ?? []}
        isLoading={indexes.isLoading}
        isEmpty={!indexes.isLoading && (indexes.data?.length ?? 0) === 0}
        emptyText="No indexes have been uploaded yet."
      />
    </PageShell>
  )
}

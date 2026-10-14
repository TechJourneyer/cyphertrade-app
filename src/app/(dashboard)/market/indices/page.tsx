'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import { SELECT_CLASS } from '@/components/forms/trading-account-fields'
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
  const [indexId, setIndexId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [result, setResult] = useState<IndexImportResult | null>(null)

  const indexes = useQuery({
    queryKey: ['market-indices'],
    queryFn: () => marketAdminApi.listIndexes(),
    enabled: hasHydrated && hasRole('admin'),
  })

  const upload = useMutation({
    mutationFn: (next: { file: File; indexId: number }) => marketAdminApi.importIndexes(next.file, next.indexId),
    onSuccess: (payload) => {
      setResult(payload)
      setFile(null)
      setFileKey((key) => key + 1)
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
      description="Choose an index, then upload its symbols. Matching uses the exchange already stored on that index."
      breadcrumbs={[{ label: 'Admin' }, { label: 'Index files' }]}
    >
      <div className="max-w-2xl rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="index-id" className="text-sm font-medium text-foreground">Index</label>
          <select
            id="index-id"
            className={SELECT_CLASS}
            value={indexId}
            onChange={(event) => {
              setIndexId(event.target.value)
              setResult(null)
            }}
          >
            <option value="">Select an index</option>
            {(indexes.data ?? []).map((index) => (
              <option key={index.id} value={index.id}>
                {index.name} ({index.exchange})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">CSV format</p>
          <p className="text-xs text-muted-foreground">
            The file needs a <span className="font-medium text-foreground">symbol</span> column.
            Each symbol is matched to an instrument on the selected index exchange and saved on that index.
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted/40 px-3 py-2 text-xs text-foreground">{`symbol
RELIANCE
TCS`}</pre>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => marketAdminApi.downloadIndexTemplate()}>
            Download template
          </Button>
          <input
            key={fileKey}
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
            disabled={!indexId || !file || upload.isPending}
            onClick={() => file && indexId && upload.mutate({ file, indexId: Number(indexId) })}
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
        emptyText="No indexes are stored yet."
      />
    </PageShell>
  )
}

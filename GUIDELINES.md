# CypherTrade App — Frontend Development Guidelines

> These guidelines are derived from the actual patterns in this codebase.
> Every rule points to an existing example you can copy from.

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Adding a New Page](#2-adding-a-new-page)
3. [API Module Rules](#3-api-module-rules)
4. [State Management](#4-state-management)
5. [Styling Rules](#5-styling-rules)
6. [Component Catalogue](#6-component-catalogue)
7. [TypeScript Rules](#7-typescript-rules)
8. [Forms and Mutations](#8-forms-and-mutations)
9. [Access Control](#9-access-control)
10. [Do Not Do](#10-do-not-do)

---

## 1. Project Architecture

```
src/
  api/           # One file per domain (bots.ts, orders.ts, …)
  app/
    (auth)/      # Login, register — no sidebar
    (dashboard)/ # All protected pages — Sidebar + Topbar layout
  components/
    data-display/  # Read-only presentational components
    forms/         # Reusable form building blocks
    layout/        # Shell, Sidebar, Topbar, PageHeader
    ui/            # shadcn primitives (Button, Input, Card, …)
  hooks/         # Custom React hooks (useAuth, useTradingAccount, …)
  lib/           # Utilities (cn, env)
  store/         # Zustand stores (auth.ts, trading-account.ts)
  types/         # API type definitions (api.ts)
```

**Framework:** Next.js App Router. Every page file is a Server Component boundary
with `'use client'` added only when hooks or browser APIs are required.

---

## 2. Adding a New Page

### Step 1 — Create the file

```
src/app/(dashboard)/<feature>/page.tsx
```

For nested routes: `src/app/(dashboard)/<feature>/new/page.tsx`,
`src/app/(dashboard)/<feature>/[id]/edit/page.tsx`.

### Step 2 — Use the standard page template

Copy this skeleton and fill in the blanks.

**List page (grid of cards):**

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import { SomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/layout/PageShell'
import { EmptyState } from '@/components/data-display/EmptyState'
import { Pagination } from '@/components/data-display/Pagination'
import { useAuth } from '@/hooks/useAuth'
import * as featureApi from '@/api/feature'
import type { Feature, PaginationMeta } from '@/types/api'

const PAGE_SIZE = 10

export default function FeaturePage() {
  const { hasHydrated } = useAuth()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['feature', page],
    queryFn: () => featureApi.list(page, PAGE_SIZE),
    enabled: hasHydrated,
  })

  const items: Feature[] = data?.data ?? []
  const meta: PaginationMeta | undefined = data?.meta

  return (
    <PageShell
      title="Feature"
      description="Manage your features"
      isLoading={!hasHydrated}
      actions={
        <Link href="/feature/new">
          <Button size="sm">New Feature</Button>
        </Link>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FeatureCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={SomeIcon}
          title="No features yet"
          description="Create your first feature to get started."
          action={
            <Link href="/feature/new">
              <Button size="sm">New Feature</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <FeatureCard key={item.id} item={item} />
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </PageShell>
  )
}
```

**Table page (data grid with sorting):**

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable'
import { Pagination } from '@/components/data-display/Pagination'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import * as featureApi from '@/api/feature'
import type { Feature, PaginationMeta } from '@/types/api'

export default function FeatureTablePage() {
  const { hasHydrated } = useAuth()
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading } = useQuery({
    queryKey: ['feature', page, sortBy, sortOrder],
    queryFn: () => featureApi.list(page, 20),
    enabled: hasHydrated,
  })

  const columns: DataTableColumn<Feature>[] = [
    { key: 'id',     label: 'ID',     sortable: true },
    { key: 'name',   label: 'Name',   sortable: true },
    { key: 'status', label: 'Status', render: (value) => (
      <StatusBadge status={String(value)} />
    )},
  ]

  const handleSort = (key: string) => {
    if (key === sortBy) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const items: Feature[] = data?.data ?? []
  const meta: PaginationMeta | undefined = data?.meta

  return (
    <PageShell
      title="Feature"
      description="Browse all features"
      isLoading={!hasHydrated}
    >
      <DataTable<Feature>
        columns={columns}
        data={items}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      {meta && <Pagination meta={meta} onPageChange={setPage} />}
    </PageShell>
  )
}
```

**Create / Edit form page:**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/hooks/useAuth'
import * as featureApi from '@/api/feature'
import Link from 'next/link'

export default function CreateFeaturePage() {
  const router = useRouter()
  const { hasHydrated } = useAuth()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (payload: featureApi.CreateFeaturePayload) =>
      featureApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature'] })
      router.push('/feature')
    },
    onError: (err: Error) => setError(err.message),
  })

  if (!hasHydrated) return <PageShell title="New Feature" isLoading />

  return (
    <PageShell
      title="New Feature"
      description="Create a new feature"
      breadcrumbs={[{ label: 'Features', href: '/feature' }, { label: 'New' }]}
    >
      <div className="max-w-lg rounded-lg border border-border bg-card p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name }) }}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Feature name"
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create'}
            </Button>
            <Link href="/feature">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </PageShell>
  )
}
```

### Step 3 — Add the route to the sidebar

Open `src/components/layout/Sidebar.tsx` and add the nav item.

### Step 4 — Add the API type

Open `src/types/api.ts` and add the interface in the correct section.

### Step 5 — Add the API module

Create `src/api/feature.ts` (see [API Module Rules](#3-api-module-rules)).

---

## 3. API Module Rules

### File per domain

One file per domain: `src/api/bots.ts`, `src/api/orders.ts`, etc.  
Import only from `./client`, never use `axios` directly in a module file.

### Use the correct wrapper

| Operation | Function | Returns |
|---|---|---|
| Paginated list | `apiList<T>` | `{ data: T[], meta: PaginationMeta }` |
| Single resource GET | `apiGet<T>` | `T` |
| Create | `apiPost<T>` | `T` |
| Full replace | `apiPut<T>` | `T` |
| Partial update | `apiPatch<T>` | `T` |
| Delete | `apiDelete` | `void` |

### Standard module structure

```ts
import { apiGet, apiList, apiPost, apiPatch, apiDelete } from './client'
import type { Feature, PaginationMeta } from '@/types/api'

// ── Payload interfaces ────────────────────────────────────────────────────────

export interface CreateFeaturePayload {
  name: string
}

export interface UpdateFeaturePayload extends Partial<CreateFeaturePayload> {}

export interface FeaturesListResponse {
  data: Feature[]
  meta: PaginationMeta
}

// ── Functions ─────────────────────────────────────────────────────────────────

/** List all features (paginated) */
export async function list(page = 1, perPage = 20): Promise<FeaturesListResponse> {
  return apiList<Feature>('/features', { page, per_page: perPage })
}

/** Get feature by ID */
export async function get(id: number): Promise<Feature> {
  return apiGet<Feature>(`/features/${id}`)
}

/** Create feature */
export async function create(payload: CreateFeaturePayload): Promise<Feature> {
  return apiPost<Feature>('/features', payload)
}

/** Update feature */
export async function update(id: number, payload: UpdateFeaturePayload): Promise<Feature> {
  return apiPatch<Feature>(`/features/${id}`, payload)
}

/** Delete feature */
export async function destroy(id: number): Promise<void> {
  return apiDelete(`/features/${id}`)
}
```

### How the API envelope works

The backend returns: `{ success, message, data: T, meta }`.

- `apiGet` / `apiPost` / `apiPatch` / `apiPut` / `apiDelete` extract `res.data.data → T`
- `apiList` extracts both `res.data.data → T[]` and `res.data.meta → PaginationMeta`

**Never** read `response.data.data` manually in a page. Call the wrapper and consume
the typed return value directly.

---

## 4. State Management

### Two stores — use neither for server data

| Store | File | Purpose |
|---|---|---|
| Auth | `src/store/auth.ts` | Token, user profile, hydration flag |
| Trading account | `src/store/trading-account.ts` | Which account is "active" in the UI |

Server data (bots, orders, trades, etc.) lives in **TanStack Query**, not in Zustand.

### Reading auth state

```tsx
// In a page or component
import { useAuth } from '@/hooks/useAuth'

const { hasHydrated, user, hasRole, hasPermission, logout } = useAuth()
```

Never import `useAuthStore` directly in a page. Use the `useAuth` hook.

### Hydration guard

Every page query must be gated on `hasHydrated`:

```tsx
const { data } = useQuery({
  queryKey: ['bots'],
  queryFn: () => botsApi.list(),
  enabled: hasHydrated,   // ← required
})
```

And the page loading state must cover it:

```tsx
<PageShell title="Bots" isLoading={!hasHydrated}>
  {/* or: isLoading={!hasHydrated || queryIsLoading} */}
</PageShell>
```

### Query key conventions

```ts
['resource']                          // all records, no filters
['resource', page]                    // paginated
['resource', page, sortBy, sortOrder] // paginated + sorted
['resource', 'detail', id]            // single record
['resource', 'detail', id, 'sub']     // sub-resource
```

Match the query key when calling `queryClient.invalidateQueries` after mutations.

---

## 5. Styling Rules

### Always use semantic tokens — never hard-coded colours

Tailwind design tokens are defined as CSS custom properties in `src/app/globals.css`
and referenced via the Tailwind config. They work in both light and dark mode.

| Colour | Token | Example |
|---|---|---|
| Page background | `bg-background` | `<div className="bg-background">` |
| Card / panel | `bg-card` | `<div className="rounded-lg border border-border bg-card p-6">` |
| Secondary surface | `bg-secondary/40` | subtle rows, chips |
| Muted text | `text-muted-foreground` | captions, labels |
| Body text | `text-foreground` | all readable content |
| Primary accent | `text-primary`, `bg-primary/15` | links, selected states |
| Success | `text-success`, `bg-success/15` | positive values |
| Warning | `text-warning`, `bg-warning/15` | caution states |
| Error | `text-destructive`, `bg-destructive/15` | errors |
| Profit (P&L) | `text-gain` | green P&L numbers |
| Loss (P&L) | `text-loss` | red P&L numbers |
| Borders | `border-border` | all container borders |

**Do not use**: `text-green-600`, `bg-yellow-100`, `text-red-500`, or any Tailwind
colour that is not a semantic token. These break the dark theme.

### Custom utility classes

These are defined in `@layer utilities` in `globals.css`:

```
.surface-1        — first-level card background
.surface-2        — second-level (nested) card background
.focus-ring       — accessible keyboard focus ring
.shimmer          — loading animation
.animate-fade-in  — page entry animation
.animate-slide-up — element entry animation
```

### Common layout patterns

**Standard content card:**
```tsx
<div className="rounded-lg border border-border bg-card p-6">
```

**Form field:**
```tsx
<div className="space-y-1.5">
  <label className="text-sm font-medium text-foreground">
    Label <span className="text-destructive">*</span>
  </label>
  <Input ... />
</div>
```

**Error banner inside a form:**
```tsx
<div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
  {error}
</div>
```

**Warning banner (e.g. missing prerequisite):**
```tsx
<div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
  Message
</div>
```

**Permission denied state:**
```tsx
<div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
  You do not have permission to view this page.
</div>
```

### Native `<select>` elements

shadcn/ui does not style native `<select>`. Use `SELECT_CLASS` from the shared file:

```tsx
import { SELECT_CLASS } from '@/components/forms/trading-account-fields'

<select className={SELECT_CLASS}>
```

---

## 6. Component Catalogue

Use existing components before writing new ones.

### `<PageShell>` — required on every page

```tsx
import { PageShell } from '@/components/layout/PageShell'

<PageShell
  title="Page Title"
  description="Optional subtitle"
  breadcrumbs={[{ label: 'Parent', href: '/parent' }, { label: 'Current' }]}
  actions={<Button>Action</Button>}
  isLoading={!hasHydrated}
>
  {content}
</PageShell>
```

Props:
- `title` (required) — shown in `<h1>`
- `description` — shown below the title
- `breadcrumbs` — array of `{ label, href? }`, last item has no `href`
- `actions` — ReactNode placed in the top-right of the header
- `isLoading` — renders a `<Skeleton>` instead of children when true
- `children` — optional (omit when using `isLoading` only)

### `<DataTable<T>>` — for tabular data

```tsx
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable'

const columns: DataTableColumn<Order>[] = [
  { key: 'id',     label: 'ID',     sortable: true },
  { key: 'status', label: 'Status', render: (value) => (
    <StatusBadge status={String(value)} />
  )},
]

<DataTable<Order>
  columns={columns}
  data={orders}
  isLoading={isLoading}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSort={handleSort}
/>
```

Always type the generic: `DataTableColumn<YourType>[]`, `DataTable<YourType>`.  
The `render` callback receives `(value: unknown, row: T)` — cast `value` explicitly.

### `<Pagination>` — below any paginated list

```tsx
import { Pagination } from '@/components/data-display/Pagination'

{meta && <Pagination meta={meta} onPageChange={setPage} />}
```

Renders nothing when `meta.last_page <= 1`. Always guard with `{meta && …}`.

### `<StatusBadge>` — for status/signal/side columns

```tsx
import { StatusBadge } from '@/components/data-display/StatusBadge'

<StatusBadge status="active" />
<StatusBadge status={String(order.status)} />
```

Supported values: `active`, `inactive`, `paused`, `error`, `pending`, `open`,
`filled`, `cancelled`, `rejected`, `expired`, `completed`, `failed`, `BUY`, `SELL`,
`open`, `closed`, `holiday`, `token_expired`. Unknown values render as-is.

### `<EmptyState>` — zero records state

```tsx
import { EmptyState } from '@/components/data-display/EmptyState'
import { Bot } from 'lucide-react'

<EmptyState
  icon={Bot}
  title="No bots yet"
  description="Create your first trading bot to get started."
  action={<Link href="/bots/new"><Button size="sm">New Bot</Button></Link>}
/>
```

### Form field components (`trading-account-fields.tsx`)

```tsx
import {
  ToggleSwitch,
  CredentialInput,
  CREDENTIAL_FIELDS,
  BROKER_OPTIONS,
  SELECT_CLASS,
} from '@/components/forms/trading-account-fields'
```

Use when building broker credential forms. Do not redeclare these inline.

---

## 7. TypeScript Rules

### No `any`

`as any` is banned. If a type is not known:
- Add the missing field to the interface in `src/types/api.ts`
- Use `unknown` and narrow with a type guard or explicit cast with a comment

### Centralized types

All API model types live in `src/types/api.ts`.
All API payload/response types live in the relevant `src/api/*.ts` file.
Never declare a type locally in a page file if it belongs to the shared layer.

### Required type annotations

- Every `useQuery` data variable must be explicitly typed:
  ```ts
  const items: Feature[] = data?.data ?? []
  const meta: PaginationMeta | undefined = data?.meta
  ```
- Every `DataTableColumn` array must be typed:
  ```ts
  const columns: DataTableColumn<Feature>[] = [...]
  ```
- Every mutation payload must use the declared payload interface:
  ```ts
  mutation.mutate(payload satisfies featureApi.CreateFeaturePayload)
  ```

### Prop interfaces

Every component prop interface must be declared at the top of the file.
No anonymous inline types in function signatures.

---

## 8. Forms and Mutations

### Always use `useMutation` for writes

```tsx
const mutation = useMutation({
  mutationFn: (payload: featureApi.CreateFeaturePayload) =>
    featureApi.create(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['feature'] })
    router.push('/feature')
  },
  onError: (err: Error) => setError(err.message),
})
```

- Use `mutation.isPending` for the button disabled / loading state
- Invalidate relevant query keys in `onSuccess`
- Show errors via a local `error` state string, not a `console.log`

### Form state

Use `useState` for simple forms (2–5 fields). Use a single state object:

```tsx
const [formData, setFormData] = useState({
  name: '',
  strategy_id: '',
  account_id: '',
})

// Update one field:
setFormData((prev) => ({ ...prev, name: e.target.value }))
```

### Required field indicator

```tsx
<label className="text-sm font-medium text-foreground">
  Name <span className="text-destructive">*</span>
</label>
```

---

## 9. Access Control

### Role check

```tsx
const { hasRole } = useAuth()

if (!hasRole('admin')) {
  return (
    <PageShell title="Users">
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
        You do not have permission to view this page.
      </div>
    </PageShell>
  )
}
```

### Gate queries on role

```tsx
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => usersApi.list(),
  enabled: hasHydrated && hasRole('admin'),
})
```

### Gate page content on trading account

When a feature requires a linked trading account:

```tsx
const { hasAccounts, isLoading: accountsLoading } = useTradingAccount()

if (!hasHydrated || accountsLoading) return <PageShell title="..." isLoading />

if (!hasAccounts) {
  return (
    <PageShell title="...">
      <div className="max-w-lg rounded-lg border border-border bg-card p-8 text-center">
        <h3 className="mb-1 text-sm font-semibold text-foreground">No Trading Account Found</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          This feature requires a linked trading account.
        </p>
        <Link href="/trading-accounts">
          <Button size="sm">Register Trading Account</Button>
        </Link>
      </div>
    </PageShell>
  )
}
```

---

## 10. Do Not Do

| ❌ Forbidden | ✅ Correct |
|---|---|
| `(data as any)?.field` | `data?.field` with typed query |
| `const columns: any[] = [...]` | `const columns: DataTableColumn<T>[] = [...]` |
| `return <div>` as page root | `return <PageShell title="...">` |
| `if (!hasHydrated) return <Skeleton ...>` inline in page | `<PageShell isLoading={!hasHydrated}>` |
| Define `Pagination` inline in a page | `import { Pagination } from '@/components/data-display/Pagination'` |
| `import axios from 'axios'` in a page or API module | Use `apiGet`, `apiList`, `apiPost`, etc. from `./client` |
| `response.data.data` in page code | Call typed API wrapper; it unwraps automatically |
| `text-green-600`, `bg-yellow-100`, etc. | `text-gain`, `bg-warning/15`, etc. |
| Local duplicate of `ToggleSwitch`, `CredentialInput` | Import from `@/components/forms/trading-account-fields` |
| Zustand store for server data | TanStack Query |
| `useAuthStore` directly in a page | `useAuth()` hook |
| Breadcrumbs implemented per-page with custom markup | `breadcrumbs` prop on `PageShell` |
| Status badges as `<span className="bg-yellow-100 ...">` | `<StatusBadge status={value} />` |
| P&L numbers as `text-green-600` / `text-red-600` | `text-gain` / `text-loss` |
| Form `onSubmit` calling API directly | `useMutation` |

---

## Quick Reference: Component Imports

```ts
// Page wrapper (required on every page)
import { PageShell } from '@/components/layout/PageShell'

// Data display
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable'
import { Pagination } from '@/components/data-display/Pagination'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { EmptyState } from '@/components/data-display/EmptyState'

// Shared form parts
import { ToggleSwitch, CredentialInput, SELECT_CLASS } from '@/components/forms/trading-account-fields'

// shadcn primitives
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Hooks
import { useAuth } from '@/hooks/useAuth'
import { useTradingAccount } from '@/hooks/useTradingAccount'

// TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { PaginationMeta } from '@/types/api'
```

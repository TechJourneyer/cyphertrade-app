import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/lib/env'
import type { PaginationMeta } from '@/types/api'

export const apiClient = axios.create({
  baseURL:        env.apiUrl,
  timeout:        15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
})

// ─── Request interceptor — attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token from localStorage directly to avoid Zustand SSR complexity
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('ct-auth')
        if (raw) {
          const parsed = JSON.parse(raw) as { state?: { token?: string } }
          const token  = parsed?.state?.token
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
      } catch {
        // Malformed storage — ignore
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response interceptor — handle 401 globally ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear persisted auth and redirect
      localStorage.removeItem('ct-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/** Convenience wrappers that unwrap the `data` field from ApiResponse */
export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<{ data: T }>(path, { params })
  return res.data.data
}

/**
 * For paginated list endpoints: returns both `data` array and top-level `meta`.
 * The API envelope is { data: T[], meta: PaginationMeta } — apiGet only extracts
 * res.data.data (the array), discarding meta. This helper reads both fields.
 */
export async function apiList<T>(path: string, params?: Record<string, unknown>): Promise<{ data: T[]; meta: import('@/types/api').PaginationMeta }> {
  const res = await apiClient.get<{ data: T[] | { data?: T[]; meta?: PaginationMeta }; meta?: PaginationMeta }>(path, { params })
  const payload = res.data.data

  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: res.data.meta ?? { current_page: 1, last_page: 1, per_page: payload.length, total: payload.length },
    }
  }

  if (payload && Array.isArray(payload.data)) {
    return {
      data: payload.data,
      meta: res.data.meta ?? payload.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: payload.data.length,
        total: payload.data.length,
      },
    }
  }

  return {
    data: [],
    meta: res.data.meta ?? { current_page: 1, last_page: 1, per_page: 0, total: 0 },
  }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<{ data: T }>(path, body)
  return res.data.data
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiClient.put<{ data: T }>(path, body)
  return res.data.data
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiClient.patch<{ data: T }>(path, body)
  return res.data.data
}

export async function apiDelete<T = void>(path: string): Promise<T> {
  const res = await apiClient.delete<{ data: T }>(path)
  return res.data.data
}

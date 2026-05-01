import { apiGet, apiList, apiPost, apiPatch } from './client'
import type { User, PaginationMeta } from '@/types/api'

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  roles: string[]
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {}

export interface UsersListResponse {
  data: User[]
  meta: PaginationMeta
}

/**
 * List all users (admin only)
 */
export async function list(page = 1, perPage = 20, search?: string): Promise<UsersListResponse> {
  return apiList<User>('/users', { page, per_page: perPage, search })
}

/**
 * Get user detail
 */
export async function get(id: number): Promise<User> {
  return apiGet<User>(`/users/${id}`)
}

/**
 * Create user
 */
export async function create(payload: CreateUserPayload): Promise<User> {
  return apiPost<User>('/users', payload)
}

/**
 * Update user
 */
export async function update(id: number, payload: UpdateUserPayload): Promise<User> {
  return apiPatch<User>(`/users/${id}`, payload)
}

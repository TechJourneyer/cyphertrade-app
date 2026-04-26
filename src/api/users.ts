import { apiClient } from './client'
import type { ApiResponse, User, PaginationMeta } from '@/types/api'

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
export async function list(page = 1, perPage = 20, search?: string) {
  const response = await apiClient.get<ApiResponse<UsersListResponse>>('/users', {
    params: { page, per_page: perPage, search },
  })
  return response.data
}

/**
 * Get user detail
 */
export async function get(id: number) {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
  return response.data
}

/**
 * Create user
 */
export async function create(payload: CreateUserPayload) {
  const response = await apiClient.post<ApiResponse<User>>('/users', payload)
  return response.data
}

/**
 * Update user
 */
export async function update(id: number, payload: UpdateUserPayload) {
  const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload)
  return response.data
}

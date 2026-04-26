import { apiClient } from './client'
import type { ApiResponse, LoginPayload, LoginResponse, AuthUser } from '@/types/api'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  return res.data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiClient.get<ApiResponse<AuthUser>>('/auth/me')
  return res.data.data
}

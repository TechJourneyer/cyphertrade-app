import { apiList } from './client'
import type { PaginationMeta } from '@/types/api'

export interface RoleRecord {
  id: number
  name: string
  permissions?: string[]
  created_at: string | null
}

export interface PermissionRecord {
  id: number
  name: string
  created_at: string | null
}

export function listRoles(): Promise<{ data: RoleRecord[]; meta: PaginationMeta }> {
  return apiList<RoleRecord>('/roles', { per_page: 50 })
}

export function listPermissions(): Promise<{ data: PermissionRecord[]; meta: PaginationMeta }> {
  return apiList<PermissionRecord>('/permissions', { per_page: 50 })
}

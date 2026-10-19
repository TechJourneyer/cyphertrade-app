import { apiPost } from './client'

export interface OpsLinks {
  horizon: string
  log_viewer: string
}

export function createOpsLinks(): Promise<OpsLinks> {
  return apiPost<OpsLinks>('/ops/links')
}

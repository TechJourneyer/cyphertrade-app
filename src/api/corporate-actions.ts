import { apiList } from './client'
import type { CorporateAction, CorporateActionType, PaginationMeta } from '@/types/api'

export interface CorporateActionsListResponse {
  data: CorporateAction[]
  meta: PaginationMeta
}

export interface CorporateActionListFilters {
  search?: string
  type?: CorporateActionType | 'structural'
  from_date?: string
  to_date?: string
}

export async function list(
  page = 1,
  perPage = 25,
  filters?: CorporateActionListFilters,
): Promise<CorporateActionsListResponse> {
  return apiList<CorporateAction>('/corporate-actions', {
    page,
    per_page: perPage,
    ...filters,
  })
}

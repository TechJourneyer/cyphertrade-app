import { apiGet } from './client'

export type SetupStatus = 'done' | 'todo' | 'attention' | 'waiting'

export interface SetupItem {
  id: string
  title: string
  status: SetupStatus
  detail: string
  action: string | null
  href: string | null
}

export interface SetupGroup {
  id: string
  title: string
  items: SetupItem[]
}

export interface SetupChecklist {
  complete: boolean
  remaining: number
  next: {
    id: string
    title: string
    action: string
    href: string | null
  } | null
  groups: SetupGroup[]
}

export function getSetupChecklist(): Promise<SetupChecklist> {
  return apiGet<SetupChecklist>('/setup')
}

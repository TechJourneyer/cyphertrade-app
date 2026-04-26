import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '@/types/api'

interface AuthState {
  token:       string | null
  user:        AuthUser | null
  _hasHydrated: boolean
}

interface AuthActions {
  setToken:       (token: string) => void
  setUser:        (user: AuthUser) => void
  login:          (token: string, user: AuthUser) => void
  logout:         () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      token:        null,
      user:         null,
      _hasHydrated: false,

      setToken: (token) => set({ token }),
      setUser:  (user)  => set({ user }),
      login:    (token, user) => set({ token, user }),
      logout:   () => set({ token: null, user: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name:    'ct-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

// Selector helpers — avoid inline arrow fns in components
export const selectToken        = (s: AuthState & AuthActions) => s.token
export const selectUser         = (s: AuthState & AuthActions) => s.user
export const selectHasHydrated  = (s: AuthState & AuthActions) => s._hasHydrated
export const selectIsAuthed     = (s: AuthState & AuthActions) => !!s.token

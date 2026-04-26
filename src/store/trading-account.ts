import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TradingAccountState {
  activeAccountId: number | null
}

interface TradingAccountActions {
  setActiveAccountId: (id: number | null) => void
}

export const useTradingAccountStore = create<TradingAccountState & TradingAccountActions>()(
  persist(
    (set) => ({
      activeAccountId: null,
      setActiveAccountId: (id) => set({ activeAccountId: id }),
    }),
    {
      name: 'ct-trading-account',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

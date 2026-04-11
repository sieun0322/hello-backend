import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrderItem, PackingResult, PackingSession } from '../types'

const MAX_SESSIONS = 365

interface HistoryStore {
  sessions: PackingSession[]
  addSession: (items: OrderItem[], result: PackingResult) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (items, result) =>
        set((s) => {
          const next: PackingSession = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            items,
            result,
          }
          const sessions = [next, ...s.sessions].slice(0, MAX_SESSIONS)
          return { sessions }
        }),
      clearHistory: () => set({ sessions: [] }),
    }),
    { name: 'box-packer:history' }
  )
)

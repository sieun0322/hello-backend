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
    {
      name: 'box-packer:history',
      version: 1,
      migrate: (raw, version) => {
        const state = raw as { sessions: PackingSession[] }
        if (version < 1) {
          state.sessions = (state.sessions ?? []).map((s) => ({
            ...s,
            result: {
              ...s.result,
              avgStability: s.result.avgStability ?? 0,
              boxes: s.result.boxes.map((b) => ({
                ...b,
                stability: b.stability ?? 0,
                weightBalance: b.weightBalance ?? 1,
              })),
            },
          }))
        }
        return state
      },
    }
  )
)

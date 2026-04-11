import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Box } from '../types'

interface BoxStore {
  boxes: Box[]
  addBox: (box: Omit<Box, 'id'>) => void
  updateBox: (id: string, data: Omit<Box, 'id'>) => void
  removeBox: (id: string) => void
}

export const useBoxStore = create<BoxStore>()(
  persist(
    (set) => ({
      boxes: [],
      addBox: (data) =>
        set((s) => ({
          boxes: [...s.boxes, { ...data, id: crypto.randomUUID() }],
        })),
      updateBox: (id, data) =>
        set((s) => ({
          boxes: s.boxes.map((b) => (b.id === id ? { ...data, id } : b)),
        })),
      removeBox: (id) =>
        set((s) => ({ boxes: s.boxes.filter((b) => b.id !== id) })),
    }),
    {
      name: 'box-packer:boxes',
      migrate: (state: unknown) => {
        const s = state as { boxes: Box[] }
        return { boxes: s.boxes.map((b) => ({ stock: 0, ...b })) }
      },
    }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order, OrderItem, PackingResult } from '../types'

interface OrderStore {
  orders: Order[]
  addOrder: () => string  // 새 주문 id 반환
  updateItems: (id: string, items: OrderItem[]) => void
  setResult: (id: string, result: PackingResult) => void
  renameOrder: (id: string, name: string) => void
  removeOrder: (id: string) => void
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: () => {
        const id = crypto.randomUUID()
        const count = get().orders.length + 1
        const newOrder: Order = {
          id,
          name: `주문 #${count}`,
          items: [],
          result: null,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ orders: [...s.orders, newOrder] }))
        return id
      },
      updateItems: (id, items) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, items, result: null } : o
          ),
        })),
      setResult: (id, result) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, result } : o
          ),
        })),
      renameOrder: (id, name) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, name } : o
          ),
        })),
      removeOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    { name: 'box-packer:orders' }
  )
)

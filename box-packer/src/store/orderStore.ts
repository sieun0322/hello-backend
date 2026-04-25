import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyMoveItem } from '../algorithm/binPacking'
import type { MoveInstruction, Order, OrderItem, PackingResult } from '../types'

interface OrderStore {
  orders: Order[]
  addOrder: () => string  // 새 주문 id 반환
  updateItems: (id: string, items: OrderItem[]) => void
  setResult: (id: string, result: PackingResult) => void
  applyMove: (id: string, moves: MoveInstruction[]) => string[]  // 실패한 상품명 반환
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
      applyMove: (id, moves) => {
        const order = get().orders.find((o) => o.id === id)
        if (!order?.result) return moves.map((m) => m.productName)

        const { result: updated, failed } = applyMoveItem(order.result, moves)
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, result: updated } : o
          ),
        }))
        return failed
      },
      renameOrder: (id, name) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, name } : o
          ),
        })),
      removeOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    {
      name: 'box-packer:orders',
      version: 2,
      migrate: (raw, version) => {
        const state = raw as { orders: Order[] }
        if (version < 1) {
          state.orders = (state.orders ?? []).map((o) => ({
            ...o,
            result: o.result ? {
              ...o.result,
              avgStability: o.result.avgStability ?? 0,
              boxes: o.result.boxes.map((b) => ({
                ...b,
                stability: b.stability ?? 0,
                weightBalance: b.weightBalance ?? 1,
              })),
            } : null,
          }))
        }
        if (version < 2) {
          state.orders = (state.orders ?? []).map((o) => ({
            ...o,
            result: o.result ? { ...o.result, riskItems: o.result.riskItems ?? [] } : null,
          }))
        }
        return state
      },
    }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../types'

interface ProductStore {
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, data: Omit<Product, 'id'>) => void
  removeProduct: (id: string) => void
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (data) =>
        set((s) => ({
          products: [...s.products, { ...data, id: crypto.randomUUID() }],
        })),
      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...data, id } : p)),
        })),
      removeProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
    }),
    { name: 'box-packer:products' }
  )
)

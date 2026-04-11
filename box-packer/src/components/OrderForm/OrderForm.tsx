import { useState } from 'react'
import { useProductStore } from '../../store/productStore'
import { useBoxStore } from '../../store/boxStore'
import type { OrderItem } from '../../types'

interface Props {
  initialItems?: OrderItem[]
  onCalculate: (items: OrderItem[]) => void
  onSave?: (items: OrderItem[]) => void
}

export function OrderForm({ initialItems, onCalculate, onSave }: Props) {
  const { products } = useProductStore()
  const { boxes } = useBoxStore()

  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries((initialItems ?? []).map((i) => [i.product.id, i.quantity]))
  )

  const orderItems: OrderItem[] = products
    .filter((p) => (quantities[p.id] ?? 0) > 0)
    .map((p) => ({ product: p, quantity: quantities[p.id] }))

  function setQty(id: string, delta: number) {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta)
      return { ...prev, [id]: next }
    })
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-3">🛍️</p>
        <p className="text-sm">먼저 상품을 등록하세요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {boxes.length === 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-3 text-xs text-yellow-400">
          ⚠️ 박스가 등록되지 않았습니다. 박스 관리 탭에서 먼저 추가하세요.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {products.map((product) => {
          const qty = quantities[product.id] ?? 0
          return (
            <div
              key={product.id}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: product.color ?? '#6366f1' }}
                />
                <div>
                  <p className="text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {product.width} × {product.depth} × {product.height} cm · {product.weight} kg
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(product.id, -1)}
                  disabled={qty === 0}
                  className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm disabled:opacity-30 transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm text-white font-medium">{qty}</span>
                <button
                  onClick={() => setQty(product.id, 1)}
                  className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <p className="text-sm text-gray-400">
          {orderItems.length > 0
            ? `${orderItems.reduce((s, i) => s + i.quantity, 0)}개 상품 선택됨`
            : '상품 수량을 선택하세요'}
        </p>
        <div className="flex gap-2">
          {onSave && (
            <button
              onClick={() => onSave(orderItems)}
              disabled={orderItems.length === 0}
              className="px-4 py-2 text-sm border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              저장
            </button>
          )}
          <button
            onClick={() => onCalculate(orderItems)}
            disabled={orderItems.length === 0 || boxes.length === 0}
            className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            포장 계산
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useOrderStore } from '../../store/orderStore'
import { useBoxStore } from '../../store/boxStore'
import { useProductStore } from '../../store/productStore'
import { pack } from '../../algorithm/binPacking'
import { OrderForm } from './OrderForm'
import type { OrderItem, PackingResult } from '../../types'

interface Props {
  onViewResult: (result: PackingResult, items: OrderItem[], orderId?: string) => void
}

export function OrderList({ onViewResult }: Props) {
  const { orders, addOrder, updateItems, setResult, renameOrder, removeOrder } = useOrderStore()
  const { boxes } = useBoxStore()
  const { products } = useProductStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  function handleAddOrder() {
    const id = addOrder()
    setEditingId(id)
  }

  function handleCalculate(id: string) {
    const order = orders.find((o) => o.id === id)
    if (!order || order.items.length === 0) return
    const result = pack(order.items, boxes)
    setResult(id, result)
    onViewResult(result, order.items, id)
  }

  function startRename(id: string, currentName: string) {
    setRenamingId(id)
    setRenameValue(currentName)
  }

  function commitRename(id: string) {
    if (renameValue.trim()) renameOrder(id, renameValue.trim())
    setRenamingId(null)
  }

  if (editingId) {
    const order = orders.find((o) => o.id === editingId)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingId(null)}
            className="text-gray-500 hover:text-white transition-colors text-sm"
          >
            ← 목록으로
          </button>
          <h2 className="text-base font-semibold text-white">{order?.name}</h2>
        </div>
        <OrderForm
          initialItems={order?.items ?? []}
          onCalculate={(items) => {
            updateItems(editingId, items)
            const result = pack(items, boxes)
            setResult(editingId, result)
            setEditingId(null)
            onViewResult(result, items, editingId)
          }}
          onSave={(items) => {
            updateItems(editingId, items)
            setEditingId(null)
          }}
        />
      </div>
    )
  }

  const productNames = (ids: { product: { id: string; name: string }; quantity: number }[]) =>
    ids.map((i) => `${i.product.name} ×${i.quantity}`).join(', ')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">주문 목록</h2>
        <button
          onClick={handleAddOrder}
          disabled={products.length === 0}
          className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          + 주문 추가
        </button>
      </div>

      {products.length === 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-3 text-xs text-yellow-400">
          ⚠️ 먼저 상품을 등록하세요.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🧾</p>
          <p className="text-sm">등록된 주문이 없습니다</p>
          <p className="text-xs mt-1">위 버튼으로 주문을 추가하세요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                {renamingId === order.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(order.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(order.id)
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    className="text-sm font-medium bg-gray-800 border border-indigo-500 rounded px-2 py-0.5 text-white focus:outline-none w-40"
                  />
                ) : (
                  <button
                    onClick={() => startRename(order.id, order.name)}
                    className="text-sm font-medium text-white hover:text-indigo-400 transition-colors text-left"
                  >
                    {order.name}
                  </button>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  order.result
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {order.result ? `계산완료 · ${order.result.totalBoxes}박스` : '미계산'}
                </span>
              </div>

              {order.items.length > 0 && (
                <p className="text-xs text-gray-500 truncate">
                  {productNames(order.items)}
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingId(order.id)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 transition-colors"
                >
                  수정
                </button>
                {order.items.length > 0 && boxes.length > 0 && (
                  <button
                    onClick={() => order.result ? onViewResult(order.result, order.items, order.id) : handleCalculate(order.id)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition-colors"
                  >
                    {order.result ? '결과 보기' : '포장 계산'}
                  </button>
                )}
                <button
                  onClick={() => removeOrder(order.id)}
                  className="text-xs text-red-600 hover:text-red-400 px-2 py-1 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

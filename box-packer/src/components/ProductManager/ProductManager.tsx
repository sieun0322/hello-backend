import { useState } from 'react'
import { useProductStore } from '../../store/productStore'
import type { Product } from '../../types'
import { ProductForm } from './ProductForm'

export function ProductManager() {
  const { products, addProduct, updateProduct, removeProduct } = useProductStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  function handleAdd(data: Omit<Product, 'id'>) {
    addProduct(data)
    setShowForm(false)
  }

  function handleUpdate(data: Omit<Product, 'id'>) {
    if (!editing) return
    updateProduct(editing.id, data)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">상품 관리</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
        >
          + 상품 추가
        </button>
      </div>

      {(showForm || editing) && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-3">
            {editing ? '상품 수정' : '새 상품 추가'}
          </p>
          <ProductForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleAdd}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
          />
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="text-sm">등록된 상품이 없습니다</p>
          <p className="text-xs mt-1">위 버튼으로 상품을 추가하세요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
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
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-white">{product.name}</p>
                    {product.fragile && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">파손주의</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {product.width} × {product.depth} × {product.height} cm &nbsp;·&nbsp; {product.weight} kg
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(product)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-xs text-red-500 hover:text-red-400 px-2 py-1 transition-colors"
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

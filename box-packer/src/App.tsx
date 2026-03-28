import { useState } from 'react'
import { BoxManager } from './components/BoxManager/BoxManager'
import { ProductManager } from './components/ProductManager/ProductManager'
import { OrderForm } from './components/OrderForm/OrderForm'
import { Viewer3D } from './components/Viewer3D/Viewer3D'
import { pack } from './algorithm/binPacking'
import { useBoxStore } from './store/boxStore'
import type { OrderItem, PackingResult } from './types'

type Tab = 'boxes' | 'products' | 'order' | 'result'

const TABS: { id: Tab; label: string }[] = [
  { id: 'boxes', label: '📦 박스 관리' },
  { id: 'products', label: '🛍️ 상품 관리' },
  { id: 'order', label: '🧾 주문 구성' },
  { id: 'result', label: '🔍 포장 결과' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('boxes')
  const [result, setResult] = useState<PackingResult | null>(null)
  const { boxes } = useBoxStore()

  function handleCalculate(items: OrderItem[]) {
    const r = pack(items, boxes)
    setResult(r)
    setTab('result')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">Box Packer</h1>
        <p className="text-xs text-gray-500 mt-0.5">판매자를 위한 포장 최적화 도구</p>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="flex border-b border-gray-800 px-6">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
              tab === id
                ? 'border-indigo-500 text-white font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* 콘텐츠 */}
      <main className="flex-1 px-6 py-6 max-w-2xl w-full mx-auto">
        {tab === 'boxes' && <BoxManager />}
        {tab === 'products' && <ProductManager />}
        {tab === 'order' && <OrderForm onCalculate={handleCalculate} />}
        {tab === 'result' && (
          result ? (
            <Viewer3D result={result} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">📐</p>
              <p className="text-sm">주문 구성 탭에서 포장 계산을 실행하세요</p>
            </div>
          )
        )}
      </main>
    </div>
  )
}

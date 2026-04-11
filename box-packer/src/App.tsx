import { useRef, useState } from 'react'
import { BoxManager } from './components/BoxManager/BoxManager'
import { ProductManager } from './components/ProductManager/ProductManager'
import { OrderList } from './components/OrderForm/OrderList'
import { Viewer3D } from './components/Viewer3D/Viewer3D'
import { Statistics } from './components/Statistics/Statistics'
import { useBoxStore } from './store/boxStore'
import { useProductStore } from './store/productStore'
import { useHistoryStore } from './store/historyStore'
import { exportData, parseImportFile } from './utils/dataIO'
import type { PackingResult } from './types'

type Tab = 'boxes' | 'products' | 'order' | 'result' | 'statistics'

const TABS: { id: Tab; label: string }[] = [
  { id: 'boxes',      label: '📦 박스 관리' },
  { id: 'products',   label: '🛍️ 상품 관리' },
  { id: 'order',      label: '🧾 주문 구성' },
  { id: 'result',     label: '🔍 포장 결과' },
  { id: 'statistics', label: '📊 통계' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('boxes')
  const [result, setResult] = useState<PackingResult | null>(null)
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { boxes } = useBoxStore()
  const { products } = useProductStore()
  const { addBox } = useBoxStore()
  const { addProduct } = useProductStore()
  const { addSession } = useHistoryStore()

  function handleViewResult(r: PackingResult) {
    setResult(r)
    addSession([], r)
    setTab('result')
  }

  function handleExport() {
    exportData(boxes, products)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const { boxes: importedBoxes, products: importedProducts } = parseImportFile(ev.target?.result as string)
        importedBoxes.forEach(({ id: _, ...data }) => addBox(data))
        importedProducts.forEach(({ id: _, ...data }) => addProduct(data))
        setImportError('')
        alert(`가져오기 완료: 박스 ${importedBoxes.length}개, 상품 ${importedProducts.length}개`)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : '가져오기 실패')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Box Packer</h1>
          <p className="text-xs text-gray-500 mt-0.5">판매자를 위한 포장 최적화 도구</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={boxes.length === 0 && products.length === 0}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            내보내기
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            가져오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </header>

      {importError && (
        <div className="bg-red-900/30 border-b border-red-800 px-6 py-2 text-xs text-red-400 flex items-center justify-between">
          <span>⚠️ {importError}</span>
          <button onClick={() => setImportError('')} className="text-red-500 hover:text-red-300 ml-4">✕</button>
        </div>
      )}

      {/* 탭 네비게이션 — 데스크톱 (상단) */}
      <nav className="hidden sm:flex border-b border-gray-800 px-6">
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
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-2xl w-full mx-auto pb-20 sm:pb-6">
        {tab === 'boxes'      && <BoxManager />}
        {tab === 'products'   && <ProductManager />}
        {tab === 'order'      && <OrderList onViewResult={handleViewResult} />}
        {tab === 'statistics' && <Statistics />}
        {tab === 'result'     && (
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

      {/* 탭 네비게이션 — 모바일 (하단 고정) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 flex border-t border-gray-800 bg-gray-950 z-50">
        {TABS.map(({ id, label }) => {
          const [icon, text] = label.split(' ')
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors ${
                tab === id ? 'text-indigo-400' : 'text-gray-600'
              }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span>{text}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

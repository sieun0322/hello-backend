import { useState } from 'react'
import type { Product } from '../../types'

interface Props {
  initial?: Product
  onSubmit: (data: Omit<Product, 'id'>) => void
  onCancel: () => void
}

const PRESET_COLORS = [
  '#ef4444', // 빨강
  '#f97316', // 주황
  '#eab308', // 노랑
  '#22c55e', // 초록
  '#14b8a6', // 청록
  '#3b82f6', // 파랑
  '#8b5cf6', // 보라
  '#ec4899', // 분홍
  '#f59e0b', // 황금
  '#06b6d4', // 하늘
  '#84cc16', // 연두
  '#a855f7', // 자주
]

const EMPTY = { name: '', width: '', depth: '', height: '', weight: '' }

export function ProductForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          width: String(initial.width),
          depth: String(initial.depth),
          height: String(initial.height),
          weight: String(initial.weight),
        }
      : EMPTY
  )
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0])
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const width = parseFloat(form.width)
    const depth = parseFloat(form.depth)
    const height = parseFloat(form.height)
    const weight = parseFloat(form.weight)

    if (!form.name.trim()) return setError('이름을 입력하세요')
    if ([width, depth, height, weight].some((v) => isNaN(v) || v <= 0))
      return setError('모든 치수/무게는 0보다 큰 숫자여야 합니다')

    setError('')
    onSubmit({ name: form.name.trim(), width, depth, height, weight, color })
  }

  const field = (label: string, key: keyof typeof EMPTY, unit: string) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
        <span className="text-xs text-gray-500 w-6">{unit}</span>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">상품 이름</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="예: 블루투스 이어폰"
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {field('가로', 'width', 'cm')}
        {field('세로', 'depth', 'cm')}
        {field('높이', 'height', 'cm')}
      </div>
      {field('무게', 'weight', 'kg')}

      {/* 색상 선택 */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-400">3D 표시 색상</label>
        <div className="flex flex-wrap gap-2 items-center">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: color === c ? `3px solid white` : '3px solid transparent',
                outlineOffset: '2px',
              }}
            />
          ))}
          {/* 직접 입력 */}
          <div className="relative w-7 h-7">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded-full cursor-pointer opacity-0 absolute inset-0"
              title="직접 선택"
            />
            <div
              className="w-7 h-7 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center text-gray-400 text-xs pointer-events-none"
              style={!PRESET_COLORS.includes(color) ? { backgroundColor: color, borderColor: 'white' } : {}}
            >
              {PRESET_COLORS.includes(color) ? '+' : ''}
            </div>
          </div>
        </div>
        {/* 미리보기 */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
          <span className="text-xs text-gray-500">{color}</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
        >
          {initial ? '수정' : '추가'}
        </button>
      </div>
    </form>
  )
}

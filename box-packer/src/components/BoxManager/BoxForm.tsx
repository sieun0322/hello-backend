import { useState } from 'react'
import type { Box } from '../../types'

interface Props {
  initial?: Box
  onSubmit: (data: Omit<Box, 'id'>) => void
  onCancel: () => void
}

const EMPTY = { name: '', width: '', depth: '', height: '', maxWeight: '', stock: '' }

export function BoxForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          width: String(initial.width),
          depth: String(initial.depth),
          height: String(initial.height),
          maxWeight: String(initial.maxWeight),
          stock: String(initial.stock),
        }
      : EMPTY
  )
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const width = parseFloat(form.width)
    const depth = parseFloat(form.depth)
    const height = parseFloat(form.height)
    const maxWeight = parseFloat(form.maxWeight)
    const stock = form.stock === '' ? 0 : parseInt(form.stock, 10)

    if (!form.name.trim()) return setError('이름을 입력하세요')
    if ([width, depth, height, maxWeight].some((v) => isNaN(v) || v <= 0))
      return setError('모든 치수/무게는 0보다 큰 숫자여야 합니다')
    if (isNaN(stock) || stock < 0) return setError('보유 수량은 0 이상 정수여야 합니다')

    setError('')
    onSubmit({ name: form.name.trim(), width, depth, height, maxWeight, stock })
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
        <label className="text-xs text-gray-400">박스 이름</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="예: CJ 5호 박스"
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {field('가로', 'width', 'cm')}
        {field('세로', 'depth', 'cm')}
        {field('높이', 'height', 'cm')}
      </div>
      {field('최대 무게', 'maxWeight', 'kg')}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">보유 수량 <span className="text-gray-600">(0 = 무제한)</span></label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            placeholder="0"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <span className="text-xs text-gray-500 w-6">개</span>
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

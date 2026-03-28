import { useState } from 'react'
import { useBoxStore } from '../../store/boxStore'
import type { Box } from '../../types'
import { BoxForm } from './BoxForm'

export function BoxManager() {
  const { boxes, addBox, updateBox, removeBox } = useBoxStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Box | null>(null)

  function handleAdd(data: Omit<Box, 'id'>) {
    addBox(data)
    setShowForm(false)
  }

  function handleUpdate(data: Omit<Box, 'id'>) {
    if (!editing) return
    updateBox(editing.id, data)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">박스 관리</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
        >
          + 박스 추가
        </button>
      </div>

      {(showForm || editing) && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-3">
            {editing ? '박스 수정' : '새 박스 추가'}
          </p>
          <BoxForm
            initial={editing ?? undefined}
            onSubmit={editing ? handleUpdate : handleAdd}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
          />
        </div>
      )}

      {boxes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-sm">등록된 박스가 없습니다</p>
          <p className="text-xs mt-1">위 버튼으로 박스를 추가하세요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {boxes.map((box) => (
            <div
              key={box.id}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-white">{box.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {box.width} × {box.depth} × {box.height} cm &nbsp;·&nbsp; 최대 {box.maxWeight} kg
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(box)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => removeBox(box.id)}
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

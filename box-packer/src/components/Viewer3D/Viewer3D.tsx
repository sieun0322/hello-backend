import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'
import ReactMarkdown from 'react-markdown'
import type { PackingResult, PackedBox, PlacedItem, Product } from '../../types'
import { PackedBoxMesh } from './PackedBoxMesh'
import { InfoOverlay } from './InfoOverlay'
import { AnimationControls } from './AnimationControls'

interface Props {
  result: PackingResult
}

const BOX_GAP = 20

function CameraController({
  selectedBoxIndex, boxes, offsets, totalWidth, maxH, maxD, camDist,
}: {
  selectedBoxIndex: number | null
  boxes: PackedBox[]
  offsets: number[]
  totalWidth: number
  maxH: number
  maxD: number
  camDist: number
}) {
  const controlsRef = useRef<CameraControls>(null)

  useEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return
    if (selectedBoxIndex !== null) {
      const pb = boxes[selectedBoxIndex]
      const ox = offsets[selectedBoxIndex]
      const { width: w, depth: d, height: h } = pb.box
      const tx = ox + w / 2
      const ty = h / 2
      const tz = d / 2
      const dist = Math.max(w, d, h) * 2.2
      ctrl.setLookAt(tx + dist * 0.6, ty + dist * 0.5, tz + dist, tx, ty, tz, true)
    } else {
      ctrl.setLookAt(totalWidth / 2, camDist * 0.7, camDist, totalWidth / 2, maxH / 2, maxD / 2, true)
    }
  }, [selectedBoxIndex])

  return <CameraControls ref={controlsRef} makeDefault />
}

export function Viewer3D({ result }: Props) {
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<PlacedItem | null>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [showPanel, setShowPanel] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number | null>(null) // null = 전체 표시
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const handleAnalyze = useCallback(async () => {
    setAiLoading(true)
    setAiError(null)
    setAiAnalysis(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'instant', data: result }),
      })
      if (!res.ok) throw new Error(`${res.status}`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const { text } = JSON.parse(data) as { text: string }
            setAiAnalysis((prev) => (prev ?? '') + text)
          } catch { /* 무시 */ }
        }
      }
    } catch {
      setAiError('분석 요청에 실패했습니다. 잠시 후 다시 시도하세요.')
    } finally {
      setAiLoading(false)
    }
  }, [result])

  if (result.boxes.length === 0) return null

  // 박스 X축 오프셋
  const offsets: number[] = []
  let cursor = 0
  for (const pb of result.boxes) {
    offsets.push(cursor)
    cursor += pb.box.width + BOX_GAP
  }
  const totalWidth = cursor - BOX_GAP
  const maxH = Math.max(...result.boxes.map((pb) => pb.box.height))
  const maxD = Math.max(...result.boxes.map((pb) => pb.box.depth))
  const camDist = Math.max(totalWidth, maxH, maxD) * 1.6

  // 전체 고유 상품 목록 (패널용)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allProducts: Product[] = useMemo(() => {
    const seen = new Set<string>()
    const list: Product[] = []
    for (const pb of result.boxes) {
      for (const item of pb.items) {
        if (!seen.has(item.product.id)) {
          seen.add(item.product.id)
          list.push(item.product)
        }
      }
    }
    return list
  }, [result])

  function toggleHidden(id: string) {
    setHiddenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (hiddenIds.size === allProducts.length) {
      setHiddenIds(new Set())
    } else {
      setHiddenIds(new Set(allProducts.map((p) => p.id)))
    }
  }

  function handleSelectBox(idx: number) {
    setSelectedBoxIndex((prev) => {
      const next = prev === idx ? null : idx
      setVisibleCount(null) // 박스 전환 시 애니메이션 초기화
      return next
    })
    setSelectedItem(null)
  }

  function handleSelectItem(item: PlacedItem) {
    setSelectedItem((prev) => (prev === item ? null : item))
  }

  const allHidden = hiddenIds.size === allProducts.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">포장 결과</h2>
        <p className="text-sm text-gray-400">총 {result.totalBoxes}개 박스</p>
      </div>

      {result.stockLimitReached && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-3 text-xs text-yellow-400">
          ⚠️ 일부 박스 재고가 부족하여 더 큰 박스 또는 추가 박스를 사용했습니다.
        </div>
      )}

      {result.unpackable.length > 0 && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-xs text-red-400">
          ⚠️ 포장 불가 상품 {result.unpackable.length}개:{' '}
          {result.unpackable.map((p) => p.name).join(', ')}
          <br />
          <span className="text-red-500">이 상품들보다 큰 박스가 필요합니다.</span>
        </div>
      )}

      {/* 사용 박스 조합 요약 */}
      {(() => {
        const countMap: Record<string, number> = {}
        for (const pb of result.boxes) {
          countMap[pb.box.name] = (countMap[pb.box.name] ?? 0) + 1
        }
        const parts = Object.entries(countMap).map(([name, cnt]) => `${name} ${cnt}개`)
        if (parts.length <= 1) return null
        return (
          <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-lg px-4 py-2 text-xs text-indigo-300">
            최적 조합: {parts.join(' + ')} → 총 {result.totalBoxes}박스
          </div>
        )
      })()}

      {/* 3D 씬 */}
      <div className="relative w-full h-[320px] sm:h-[520px] bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
        <Canvas
          camera={{ position: [totalWidth / 2, camDist * 0.7, camDist], fov: 45 }}
          onPointerMissed={() => {
            if (selectedItem) setSelectedItem(null)
            else setSelectedBoxIndex(null)
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={1} />
          <directionalLight position={[-10, -5, -10]} intensity={0.3} />

          {result.boxes.map((pb, i) => (
            <PackedBoxMesh
              key={i}
              packedBox={pb}
              offsetX={offsets[i]}
              selected={selectedBoxIndex === i}
              dimmed={selectedBoxIndex !== null && selectedBoxIndex !== i}
              hiddenIds={hiddenIds}
              visibleCount={selectedBoxIndex === i && visibleCount !== null ? visibleCount : null}
              selectedItem={selectedBoxIndex === i ? selectedItem : null}
              onSelectBox={() => handleSelectBox(i)}
              onSelectItem={handleSelectItem}
            />
          ))}

          <Grid
            position={[totalWidth / 2, -0.05, maxD / 2]}
            args={[totalWidth * 3, maxD * 4]}
            cellSize={10} cellThickness={0.3} cellColor="#374151"
            sectionSize={50} sectionThickness={0.5} sectionColor="#4b5563"
            fadeDistance={camDist * 2} fadeStrength={1} infiniteGrid
          />

          <CameraController
            selectedBoxIndex={selectedBoxIndex}
            boxes={result.boxes} offsets={offsets}
            totalWidth={totalWidth} maxH={maxH} maxD={maxD} camDist={camDist}
          />

          <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
            <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
          </GizmoHelper>
        </Canvas>

        {selectedItem && (
          <InfoOverlay item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}

        {/* 상단 좌측 버튼들 */}
        <div className="absolute top-3 left-3 flex gap-2">
          {selectedBoxIndex !== null && (
            <button
              onClick={() => { setSelectedBoxIndex(null); setSelectedItem(null) }}
              className="text-xs text-gray-400 bg-gray-900/80 hover:text-white px-3 py-1 rounded-full transition-colors"
            >
              전체 보기
            </button>
          )}
          {selectedBoxIndex === null && result.totalBoxes > 1 && (
            <p className="text-xs text-gray-500 bg-gray-900/70 px-3 py-1 rounded-full pointer-events-none">
              박스를 클릭하면 확대됩니다
            </p>
          )}
        </div>

        {/* 상품 목록 토글 버튼 */}
        <button
          onClick={() => setShowPanel((v) => !v)}
          className="absolute top-3 right-3 text-xs bg-gray-900/80 hover:bg-gray-800 text-gray-300 px-3 py-1 rounded-full transition-colors flex items-center gap-1.5"
        >
          <span>{showPanel ? '목록 닫기' : '상품 목록'}</span>
          {hiddenIds.size > 0 && (
            <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.5 text-[10px]">
              {hiddenIds.size}개 숨김
            </span>
          )}
        </button>

        {/* 상품 목록 패널 */}
        {showPanel && (
          <div className="absolute top-10 right-3 w-52 bg-gray-900/95 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
              <span className="text-xs font-medium text-gray-300">상품 목록</span>
              <button
                onClick={toggleAll}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {allHidden ? '전체 보이기' : '전체 숨기기'}
              </button>
            </div>
            <div className="flex flex-col max-h-64 overflow-y-auto">
              {allProducts.map((product) => {
                const hidden = hiddenIds.has(product.id)
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleHidden(product.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-800 transition-colors ${hidden ? 'opacity-40' : ''}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: product.color ?? '#6366f1' }}
                    />
                    <span className="text-xs text-gray-300 truncate flex-1">{product.name}</span>
                    <span className="text-gray-600 text-sm shrink-0">{hidden ? '○' : '●'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 단계별 애니메이션 컨트롤 (박스 선택 시 표시) */}
      {selectedBoxIndex !== null && (
        <AnimationControls
          total={result.boxes[selectedBoxIndex].items.length}
          visibleCount={visibleCount ?? result.boxes[selectedBoxIndex].items.length}
          onVisibleCountChange={setVisibleCount}
        />
      )}

      {/* 박스 요약 카드 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {result.boxes.map((pb, i) => {
          const utilization =
            pb.items.reduce((s, item) => s + item.dims.w * item.dims.d * item.dims.h, 0) /
            (pb.box.width * pb.box.depth * pb.box.height)
          const isSelected = selectedBoxIndex === i
          return (
            <button
              key={i}
              onClick={() => handleSelectBox(i)}
              className={`shrink-0 text-left rounded-lg border px-3 py-2 transition-colors min-w-36 ${
                isSelected ? 'border-indigo-500 bg-indigo-950' : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <p className="text-xs font-medium text-white truncate">박스 {i + 1} — {pb.box.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{pb.totalWeight.toFixed(1)} / {pb.box.maxWeight} kg</p>
              <p className={`text-xs mt-0.5 ${utilization < 0.5 ? 'text-yellow-500' : 'text-gray-500'}`}>
                공간 {(utilization * 100).toFixed(0)}%
                {utilization < 0.5 && ' ⚠ 더 작은 박스 권장'}
              </p>
            </button>
          )
        })}
      </div>

      {/* AI 분석 */}
      <div className="border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-300">AI 포장 분석</p>
          <button
            onClick={handleAnalyze}
            disabled={aiLoading}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {aiLoading ? '분석 중...' : 'AI 분석'}
          </button>
        </div>
        {aiError && (
          <p className="text-xs text-red-400">{aiError}</p>
        )}
        {aiAnalysis && (
          <div className="text-xs text-gray-300 leading-relaxed prose prose-invert prose-xs max-w-none">
            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
          </div>
        )}
        {!aiAnalysis && !aiError && !aiLoading && (
          <p className="text-xs text-gray-600">AI 분석 버튼을 눌러 포장 효율 개선 제안을 받아보세요.</p>
        )}
      </div>
    </div>
  )
}

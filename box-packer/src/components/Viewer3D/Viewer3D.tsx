import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'
import ReactMarkdown from 'react-markdown'
import { pack } from '../../algorithm/binPacking'
import { useBoxStore } from '../../store/boxStore'
import type { ChatMessage, OrderItem, PackingResult, PackedBox, PlacedItem, Product, SimAction } from '../../types'
import { PackedBoxMesh } from './PackedBoxMesh'
import { InfoOverlay } from './InfoOverlay'
import { AnimationControls } from './AnimationControls'

interface Props {
  result: PackingResult
  items: OrderItem[]
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

async function streamChat(
  displayResult: PackingResult,
  availableBoxNames: string[],
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onAction: (action: SimAction | null) => void,
) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'chat',
      data: { result: displayResult, availableBoxNames, messages },
    }),
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
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') continue
      try {
        const parsed = JSON.parse(raw) as { text?: string; action?: SimAction | null }
        if (parsed.text !== undefined) onChunk(parsed.text)
        if ('action' in parsed) onAction(parsed.action ?? null)
      } catch { /* 무시 */ }
    }
  }
}

export function Viewer3D({ result, items }: Props) {
  const { boxes: allBoxes } = useBoxStore()
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<PlacedItem | null>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [showPanel, setShowPanel] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number | null>(null)

  // 채팅 & 시뮬레이션 상태
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [displayResult, setDisplayResult] = useState<PackingResult>(result)
  const [isSimulated, setIsSimulated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isOriginalResult = displayResult === result && !isSimulated

  const activeResult = displayResult

  // 박스 X축 오프셋
  const offsets: number[] = []
  let cursor = 0
  for (const pb of activeResult.boxes) {
    offsets.push(cursor)
    cursor += pb.box.width + BOX_GAP
  }
  const totalWidth = cursor > 0 ? cursor - BOX_GAP : 1
  const maxH = activeResult.boxes.length > 0 ? Math.max(...activeResult.boxes.map((pb) => pb.box.height)) : 10
  const maxD = activeResult.boxes.length > 0 ? Math.max(...activeResult.boxes.map((pb) => pb.box.depth)) : 10
  const camDist = Math.max(totalWidth, maxH, maxD) * 1.6

  const allProducts: Product[] = useMemo(() => {
    const seen = new Set<string>()
    const list: Product[] = []
    for (const pb of activeResult.boxes) {
      for (const item of pb.items) {
        if (!seen.has(item.product.id)) {
          seen.add(item.product.id)
          list.push(item.product)
        }
      }
    }
    return list
  }, [activeResult])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      setVisibleCount(null)
      return next
    })
    setSelectedItem(null)
  }

  function handleSelectItem(item: PlacedItem) {
    setSelectedItem((prev) => (prev === item ? null : item))
  }

  function handleRunSimulation(action: SimAction) {
    if (action.type === 'filter_boxes') {
      const filtered = allBoxes.filter((b) => action.names.includes(b.name))
      if (filtered.length === 0) return
      const newResult = pack(items, filtered)
      setDisplayResult(newResult)
      setIsSimulated(true)
      setSelectedBoxIndex(null)
      setSelectedItem(null)
    }
  }

  function handleResetResult() {
    setDisplayResult(result)
    setIsSimulated(false)
    setSelectedBoxIndex(null)
    setSelectedItem(null)
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || chatLoading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
    const newMessages = [...messages, userMsg, assistantMsg]
    setMessages(newMessages)
    setInput('')
    setChatLoading(true)
    setChatError(null)

    let pendingAction: SimAction | null = null

    try {
      await streamChat(
        displayResult,
        allBoxes.map((b) => b.name),
        [...messages, userMsg],
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + chunk,
            }
            return updated
          })
        },
        (action) => { pendingAction = action },
      )
      if (pendingAction) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...updated[updated.length - 1], action: pendingAction }
          return updated
        })
      }
    } catch {
      setChatError('요청에 실패했습니다. 잠시 후 다시 시도하세요.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setChatLoading(false)
    }
  }

  const allHidden = hiddenIds.size === allProducts.length

  if (result.boxes.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          포장 결과
          {isSimulated && (
            <span className="ml-2 text-xs text-indigo-400 font-normal">(시뮬레이션)</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {isSimulated && (
            <button
              onClick={handleResetResult}
              className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2 py-1 rounded transition-colors"
            >
              원래 결과로
            </button>
          )}
          <p className="text-sm text-gray-400">총 {activeResult.totalBoxes}개 박스</p>
        </div>
      </div>

      {activeResult.stockLimitReached && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-3 text-xs text-yellow-400">
          ⚠️ 일부 박스 재고가 부족하여 더 큰 박스 또는 추가 박스를 사용했습니다.
        </div>
      )}

      {activeResult.unpackable.length > 0 && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-xs text-red-400">
          ⚠️ 포장 불가 상품 {activeResult.unpackable.length}개:{' '}
          {activeResult.unpackable.map((p) => p.name).join(', ')}
          <br />
          <span className="text-red-500">이 상품들보다 큰 박스가 필요합니다.</span>
        </div>
      )}

      {/* 사용 박스 조합 요약 */}
      {(() => {
        const countMap: Record<string, number> = {}
        for (const pb of activeResult.boxes) {
          countMap[pb.box.name] = (countMap[pb.box.name] ?? 0) + 1
        }
        const parts = Object.entries(countMap).map(([name, cnt]) => `${name} ${cnt}개`)
        if (parts.length <= 1) return null
        return (
          <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-lg px-4 py-2 text-xs text-indigo-300">
            최적 조합: {parts.join(' + ')} → 총 {activeResult.totalBoxes}박스
          </div>
        )
      })()}

      {/* 3D 씬 + 채팅 (lg: 가로 배치) */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-3">
        <div className="flex flex-col gap-3 lg:flex-1 min-w-0">
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

              {activeResult.boxes.map((pb, i) => (
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
                boxes={activeResult.boxes} offsets={offsets}
                totalWidth={totalWidth} maxH={maxH} maxD={maxD} camDist={camDist}
              />

              <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
                <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
              </GizmoHelper>
            </Canvas>

            {selectedItem && (
              <InfoOverlay item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}

            <div className="absolute top-3 left-3 flex gap-2">
              {selectedBoxIndex !== null && (
                <button
                  onClick={() => { setSelectedBoxIndex(null); setSelectedItem(null) }}
                  className="text-xs text-gray-400 bg-gray-900/80 hover:text-white px-3 py-1 rounded-full transition-colors"
                >
                  전체 보기
                </button>
              )}
              {selectedBoxIndex === null && activeResult.totalBoxes > 1 && (
                <p className="text-xs text-gray-500 bg-gray-900/70 px-3 py-1 rounded-full pointer-events-none">
                  박스를 클릭하면 확대됩니다
                </p>
              )}
            </div>

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

            {showPanel && (
              <div className="absolute top-10 right-3 w-52 bg-gray-900/95 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
                  <span className="text-xs font-medium text-gray-300">상품 목록</span>
                  <button onClick={toggleAll} className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
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
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: product.color ?? '#6366f1' }} />
                        <span className="text-xs text-gray-300 truncate flex-1">{product.name}</span>
                        <span className="text-gray-600 text-sm shrink-0">{hidden ? '○' : '●'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 단계별 애니메이션 컨트롤 */}
          {selectedBoxIndex !== null && (
            <AnimationControls
              total={activeResult.boxes[selectedBoxIndex].items.length}
              visibleCount={visibleCount ?? activeResult.boxes[selectedBoxIndex].items.length}
              onVisibleCountChange={setVisibleCount}
            />
          )}

          {/* 박스 요약 카드 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeResult.boxes.map((pb, i) => {
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
        </div>

        {/* AI 채팅 패널 */}
        <div className="border border-gray-800 rounded-xl flex flex-col lg:w-72 lg:shrink-0 h-[420px] lg:h-[600px]">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300">AI 포장 어시스턴트</p>
            {!isOriginalResult && (
              <span className="text-[10px] text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full">시뮬레이션 중</span>
            )}
          </div>

          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-xs text-gray-600 text-center mt-4">
                포장 방식에 대해 질문하거나 다른 방식을 요청해보세요.<br />
                <span className="text-gray-700">예: "5호 박스만 써봐", "공간 활용률 높이려면?"</span>
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown>{msg.content || '…'}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
                {msg.role === 'assistant' && msg.action && msg.action.type === 'filter_boxes' && (
                  <button
                    onClick={() => handleRunSimulation(msg.action!)}
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    시뮬레이션 실행 — {msg.action.names.join(', ')}
                  </button>
                )}
              </div>
            ))}
            {chatLoading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
              <div className="flex items-start">
                <div className="bg-gray-800 rounded-xl px-3 py-2 text-xs text-gray-500">생각 중...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 오류 */}
          {chatError && (
            <p className="px-3 pb-1 text-[11px] text-red-400">{chatError}</p>
          )}

          {/* 입력창 */}
          <div className="px-3 py-3 border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="포장 방식을 물어보세요..."
              disabled={chatLoading}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatLoading}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

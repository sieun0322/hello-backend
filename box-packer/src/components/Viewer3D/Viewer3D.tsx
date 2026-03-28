import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'
import type { PackingResult, PackedBox, PlacedItem } from '../../types'
import { PackedBoxMesh } from './PackedBoxMesh'
import { InfoOverlay } from './InfoOverlay'

interface Props {
  result: PackingResult
}

const BOX_GAP = 20

// 전체 씬 / 선택 박스로 카메라 이동을 담당하는 내부 컴포넌트
function CameraController({
  selectedBoxIndex,
  boxes,
  offsets,
  totalWidth,
  maxH,
  maxD,
  camDist,
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
      const tx = totalWidth / 2
      const ty = maxH / 2
      const tz = maxD / 2
      ctrl.setLookAt(tx, camDist * 0.7, camDist, tx, ty, tz, true)
    }
  }, [selectedBoxIndex])

  return <CameraControls ref={controlsRef} makeDefault />
}

export function Viewer3D({ result }: Props) {
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<PlacedItem | null>(null)

  if (result.boxes.length === 0) return null

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

  function handleSelectBox(idx: number) {
    setSelectedBoxIndex((prev) => (prev === idx ? null : idx))
    setSelectedItem(null)
  }

  function handleSelectItem(item: PlacedItem) {
    setSelectedItem((prev) => (prev === item ? null : item))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">포장 결과</h2>
        <p className="text-sm text-gray-400">총 {result.totalBoxes}개 박스</p>
      </div>

      {result.unpackable.length > 0 && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-xs text-red-400">
          ⚠️ 포장 불가 상품 {result.unpackable.length}개:{' '}
          {result.unpackable.map((p) => p.name).join(', ')}
          <br />
          <span className="text-red-500">이 상품들보다 큰 박스가 필요합니다.</span>
        </div>
      )}

      {/* 3D 씬 */}
      <div className="relative w-full h-[520px] bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
        <Canvas
          camera={{ position: [totalWidth / 2, camDist * 0.7, camDist], fov: 45 }}
          onPointerMissed={() => {
            if (selectedItem) {
              setSelectedItem(null)
            } else {
              setSelectedBoxIndex(null)
            }
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
              selectedItem={selectedBoxIndex === i ? selectedItem : null}
              onSelectBox={() => handleSelectBox(i)}
              onSelectItem={handleSelectItem}
            />
          ))}

          <Grid
            position={[totalWidth / 2, -0.05, maxD / 2]}
            args={[totalWidth * 3, maxD * 4]}
            cellSize={10}
            cellThickness={0.3}
            cellColor="#374151"
            sectionSize={50}
            sectionThickness={0.5}
            sectionColor="#4b5563"
            fadeDistance={camDist * 2}
            fadeStrength={1}
            infiniteGrid
          />

          <CameraController
            selectedBoxIndex={selectedBoxIndex}
            boxes={result.boxes}
            offsets={offsets}
            totalWidth={totalWidth}
            maxH={maxH}
            maxD={maxD}
            camDist={camDist}
          />

          <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
            <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
          </GizmoHelper>
        </Canvas>

        {selectedItem && (
          <InfoOverlay item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}

        {selectedBoxIndex === null && result.totalBoxes > 1 && (
          <p className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-gray-500 bg-gray-900/70 px-3 py-1 rounded-full pointer-events-none">
            박스를 클릭하면 확대됩니다
          </p>
        )}

        {selectedBoxIndex !== null && (
          <button
            onClick={() => { setSelectedBoxIndex(null); setSelectedItem(null) }}
            className="absolute top-3 right-3 text-xs text-gray-400 bg-gray-900/80 hover:text-white px-3 py-1 rounded-full transition-colors"
          >
            전체 보기
          </button>
        )}
      </div>

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
                isSelected
                  ? 'border-indigo-500 bg-indigo-950'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <p className="text-xs font-medium text-white truncate">
                박스 {i + 1} — {pb.box.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {pb.totalWeight.toFixed(1)} / {pb.box.maxWeight} kg
              </p>
              <p className="text-xs text-gray-500">
                공간 {(utilization * 100).toFixed(0)}%
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

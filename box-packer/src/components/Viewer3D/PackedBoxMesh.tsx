import * as THREE from 'three'
import type { PackedBox, PlacedItem } from '../../types'
import { ItemMesh } from './ItemMesh'

interface Props {
  packedBox: PackedBox
  offsetX: number
  selected: boolean
  dimmed: boolean
  hiddenIds: Set<string>
  visibleCount: number | null  // null = 전체, 숫자 = 해당 인덱스까지만 표시
  selectedItem: PlacedItem | null
  riskProductNames: Set<string>
  onSelectBox: () => void
  onSelectItem: (item: PlacedItem) => void
}

export function PackedBoxMesh({
  packedBox,
  offsetX,
  selected,
  dimmed,
  hiddenIds,
  visibleCount,
  selectedItem,
  riskProductNames,
  onSelectBox,
  onSelectItem,
}: Props) {
  const { box, items } = packedBox
  const { width: w, depth: d, height: h } = box
  const cx = w / 2
  const cy = h / 2
  const cz = d / 2

  const wireColor = selected ? '#a5b4fc' : '#6b7280'
  const faceOpacity = dimmed ? 0.04 : selected ? 0.18 : 0.12

  return (
    <group position={[offsetX, 0, 0]}>
      {/* 박스 외형 클릭 영역 */}
      <mesh position={[cx, cy, cz]} onClick={(e) => { e.stopPropagation(); onSelectBox() }}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={selected ? '#818cf8' : '#4b5563'}
          transparent
          opacity={faceOpacity}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 박스 엣지 */}
      <lineSegments position={[cx, cy, cz]}>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color={wireColor} />
      </lineSegments>

      {/* 상품들 */}
      {items.map((item, i) => {
        if (visibleCount !== null && i >= visibleCount) return null
        if (hiddenIds.has(item.product.id)) return null
        const isAnimating = visibleCount !== null && i === visibleCount - 1
        return (
          <ItemMesh
            key={i}
            item={item}
            dimmed={dimmed}
            selected={selectedItem === item}
            highlight={isAnimating}
            risk={riskProductNames.has(item.product.name)}
            onSelect={onSelectItem}
          />
        )
      })}
    </group>
  )
}

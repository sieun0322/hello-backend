import * as THREE from 'three'
import type { PackedBox, PlacedItem } from '../../types'
import { ItemMesh } from './ItemMesh'

interface Props {
  packedBox: PackedBox
  offsetX: number           // 씬 내 X축 오프셋 (박스 나란히 배치용)
  selected: boolean         // 이 박스가 선택됐는지
  dimmed: boolean           // 다른 박스가 선택됐을 때 흐리게
  selectedItem: PlacedItem | null
  onSelectBox: () => void
  onSelectItem: (item: PlacedItem) => void
}

export function PackedBoxMesh({
  packedBox,
  offsetX,
  selected,
  dimmed,
  selectedItem,
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
      {items.map((item, i) => (
        <ItemMesh
          key={i}
          item={item}
          dimmed={dimmed}
          selected={selectedItem === item}
          onSelect={onSelectItem}
        />
      ))}
    </group>
  )
}

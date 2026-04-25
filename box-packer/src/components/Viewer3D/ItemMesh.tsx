import { useRef, useState } from 'react'
import * as THREE from 'three'
import type { PlacedItem } from '../../types'

interface Props {
  item: PlacedItem
  selected: boolean
  dimmed: boolean
  highlight?: boolean   // 애니메이션 중 방금 배치된 상품
  risk?: boolean        // 파손 위험 아이템
  onSelect: (item: PlacedItem) => void
}

export function ItemMesh({ item, selected, dimmed, highlight, risk, onSelect }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const { position: pos, dims } = item
  const color = item.product.color ?? '#6366f1'

  const cx = pos.x + dims.w / 2
  const cy = pos.y + dims.h / 2
  const cz = pos.z + dims.d / 2

  const margin = 0.3
  const w = dims.w - margin
  const h = dims.h - margin
  const d = dims.d - margin

  return (
    <mesh
      ref={meshRef}
      position={[cx, cy, cz]}
      onClick={(e) => { e.stopPropagation(); if (!dimmed) onSelect(item) }}
      onPointerEnter={() => { if (!dimmed) setHovered(true) }}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial
        color={color}
        opacity={dimmed ? 0.25 : hovered || selected ? 1 : 0.82}
        transparent
        emissive={highlight ? '#ffffff' : selected ? color : hovered ? color : '#000000'}
        emissiveIntensity={highlight ? 0.5 : selected ? 0.35 : hovered ? 0.15 : 0}
      />
      {risk && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(w + 0.6, h + 0.6, d + 0.6)]} />
          <lineBasicMaterial color="#ef4444" />
        </lineSegments>
      )}
    </mesh>
  )
}

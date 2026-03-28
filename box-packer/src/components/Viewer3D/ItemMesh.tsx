import { useRef, useState } from 'react'
import * as THREE from 'three'
import type { PlacedItem } from '../../types'

interface Props {
  item: PlacedItem
  selected: boolean
  dimmed: boolean
  onSelect: (item: PlacedItem) => void
}

export function ItemMesh({ item, selected, dimmed, onSelect }: Props) {
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
        emissive={selected ? color : hovered ? color : '#000000'}
        emissiveIntensity={selected ? 0.35 : hovered ? 0.15 : 0}
      />
    </mesh>
  )
}

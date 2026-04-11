import type { Box, OrderItem, PackConstraint, PackedBox, PackingResult, PlacedItem, Product } from '../types'

interface Dims {
  w: number
  d: number
  h: number
}

interface Point {
  x: number
  y: number
  z: number
}

// 상품을 6방향으로 회전한 치수 목록
function rotations(p: Product): Dims[] {
  const { width: w, depth: d, height: h } = p
  return [
    { w, d, h },
    { w, d: h, h: d },
    { w: d, d: w, h },
    { w: d, d: h, h: w },
    { w: h, d: w, h: d },
    { w: h, d, h: w },
  ]
}

function applyRotationConstraint(dims: Dims[], constraint: PackConstraint['rotation']): Dims[] {
  if (constraint === 'natural') return [dims[0]]
  if (constraint === 'flat') {
    // h 최소 (넓은 면이 바닥)
    const minH = Math.min(...dims.map((d) => d.h))
    const filtered = dims.filter((d) => d.h === minH)
    return filtered.length > 0 ? filtered : dims
  }
  if (constraint === 'tall') {
    // h 최대 (좁은 면이 바닥)
    const maxH = Math.max(...dims.map((d) => d.h))
    const filtered = dims.filter((d) => d.h === maxH)
    return filtered.length > 0 ? filtered : dims
  }
  return dims
}

function overlaps(
  ax: number, ay: number, az: number, aw: number, ad: number, ah: number,
  bx: number, by: number, bz: number, bw: number, bd: number, bh: number
): boolean {
  return (
    ax < bx + bw && ax + aw > bx &&
    ay < by + bh && ay + ah > by &&
    az < bz + bd && az + ad > bz
  )
}

function canPlace(
  dims: Dims,
  pos: Point,
  box: Box,
  placed: PlacedItem[],
  currentWeight: number,
  itemWeight: number
): boolean {
  if (pos.x + dims.w > box.width + 1e-6) return false
  if (pos.y + dims.h > box.height + 1e-6) return false
  if (pos.z + dims.d > box.depth + 1e-6) return false
  if (currentWeight + itemWeight > box.maxWeight + 1e-6) return false

  for (const p of placed) {
    if (
      overlaps(
        pos.x, pos.y, pos.z, dims.w, dims.d, dims.h,
        p.position.x, p.position.y, p.position.z, p.dims.w, p.dims.d, p.dims.h
      )
    ) {
      return false
    }
  }
  return true
}

function addExtremePoints(
  points: Point[],
  pos: Point,
  dims: Dims
): Point[] {
  const newPoints = [
    { x: pos.x + dims.w, y: pos.y, z: pos.z },
    { x: pos.x, y: pos.y + dims.h, z: pos.z },
    { x: pos.x, y: pos.y, z: pos.z + dims.d },
  ]
  const all = [...points, ...newPoints]
  // 중복 제거 (소수점 오차 허용)
  const seen = new Set<string>()
  return all.filter((p) => {
    const key = `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function tryPlaceInBox(
  product: Product,
  packedBox: PackedBox & { extremePoints: Point[] },
  rotationConstraint?: PackConstraint['rotation']
): PlacedItem | null {
  const currentWeight = packedBox.totalWeight

  const sortedPoints = [...packedBox.extremePoints].sort(
    (a, b) => a.y - b.y || a.x - b.x || a.z - b.z
  )

  let candidateRotations = rotations(product)
  if (rotationConstraint) {
    candidateRotations = applyRotationConstraint(candidateRotations, rotationConstraint)
  }

  for (const pos of sortedPoints) {
    for (const dims of candidateRotations) {
      if (canPlace(dims, pos, packedBox.box, packedBox.items, currentWeight, product.weight)) {
        return { product, position: pos, dims }
      }
    }
  }
  return null
}

function fits(product: Product, box: Box): boolean {
  return rotations(product).some(
    (dims) =>
      dims.w <= box.width && dims.d <= box.depth && dims.h <= box.height
  )
}

type ActiveBox = PackedBox & { extremePoints: Point[] }

export function pack(
  orderItems: OrderItem[],
  boxes: Box[],
  constraints: PackConstraint[] = []
): PackingResult {
  if (boxes.length === 0 || orderItems.length === 0) {
    return { boxes: [], totalBoxes: 0, unpackable: [], stockLimitReached: false }
  }

  // 상품 펼치기 (수량 적용)
  const products: Product[] = []
  for (const { product, quantity } of orderItems) {
    for (let i = 0; i < quantity; i++) {
      products.push(product)
    }
  }

  // 부피 내림차순 정렬
  products.sort(
    (a, b) => b.width * b.depth * b.height - a.width * a.depth * a.height
  )

  // 박스 부피 오름차순 정렬
  const sortedBoxes = [...boxes].sort(
    (a, b) => a.width * a.depth * a.height - b.width * b.depth * b.height
  )

  const activeBoxes: ActiveBox[] = []
  const unpackable: Product[] = []
  // 박스 타입별 사용 횟수 추적 (재고 제약용)
  const usedCount: Record<string, number> = {}
  let stockLimitReached = false

  for (const product of products) {
    let placed = false
    const rotationConstraint = constraints.find((c) => c.productName === product.name)?.rotation

    // 열린 박스에 먼저 시도
    for (const active of activeBoxes) {
      const item = tryPlaceInBox(product, active, rotationConstraint)
      if (item) {
        active.items.push(item)
        active.totalWeight += product.weight
        active.extremePoints = addExtremePoints(active.extremePoints, item.position, item.dims)
        placed = true
        break
      }
    }

    if (!placed) {
      // 새 박스 시도 (작은 것부터, 재고 확인)
      for (const boxType of sortedBoxes) {
        if (!fits(product, boxType)) continue
        // 재고 제약: stock > 0이면 사용 횟수 초과 불가
        if (boxType.stock > 0 && (usedCount[boxType.id] ?? 0) >= boxType.stock) {
          stockLimitReached = true
          continue
        }

        const newActive: ActiveBox = {
          box: boxType,
          items: [],
          totalWeight: 0,
          extremePoints: [{ x: 0, y: 0, z: 0 }],
        }
        const item = tryPlaceInBox(product, newActive, rotationConstraint)
        if (item) {
          newActive.items.push(item)
          newActive.totalWeight += product.weight
          newActive.extremePoints = addExtremePoints(newActive.extremePoints, item.position, item.dims)
          activeBoxes.push(newActive)
          usedCount[boxType.id] = (usedCount[boxType.id] ?? 0) + 1
          placed = true
          break
        }
      }
    }

    if (!placed) {
      unpackable.push(product)
    }
  }

  const resultBoxes: PackedBox[] = activeBoxes.map(({ box, items, totalWeight }) => ({
    box,
    items,
    totalWeight,
  }))

  return {
    boxes: resultBoxes,
    totalBoxes: resultBoxes.length,
    unpackable,
    stockLimitReached,
  }
}

import type { Box, ItemAnchor, MoveInstruction, OrderItem, PackConstraint, PackedBox, PackingResult, PlacedItem, Product, RiskItem } from '../types'

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

function calcStability(items: PlacedItem[], box: Box): number {
  const boxArea = box.width * box.depth
  if (boxArea === 0 || items.length === 0) return 0

  // 높이 경계값 수집
  const ySet = new Set<number>([0, box.height])
  for (const item of items) {
    ySet.add(item.position.y)
    ySet.add(item.position.y + item.dims.h)
  }
  const ys = [...ySet].sort((a, b) => a - b)

  let weightedSum = 0
  let totalH = 0

  for (let i = 0; i < ys.length - 1; i++) {
    const y0 = ys[i]
    const y1 = ys[i + 1]
    const sliceH = y1 - y0
    if (sliceH <= 0) continue

    // 이 슬라이스와 교차하는 아이템의 바닥 면적 합산
    const filledArea = items
      .filter((item) => item.position.y < y1 && item.position.y + item.dims.h > y0)
      .reduce((s, item) => s + item.dims.w * item.dims.d, 0)

    weightedSum += Math.min(filledArea / boxArea, 1) * sliceH
    totalH += sliceH
  }

  return totalH > 0 ? weightedSum / totalH : 0
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

function safeWeight(w: number | undefined): number {
  return Number.isFinite(w) ? (w as number) : 0
}

// 아이템을 추가했을 때 무게 중심이 박스 중앙에서 벗어난 정도 (낮을수록 좋음)
function calcCenterOfMassOffset(
  existingItems: PlacedItem[],
  newProduct: Product,
  pos: Point,
  dims: Dims,
  box: Box
): number {
  const boxCX = box.width / 2
  const boxCZ = box.depth / 2

  let totalWeight = 0
  let weightedX = 0
  let weightedZ = 0

  for (const item of existingItems) {
    const w = safeWeight(item.product.weight)
    const cx = item.position.x + item.dims.w / 2
    const cz = item.position.z + item.dims.d / 2
    weightedX += cx * w
    weightedZ += cz * w
    totalWeight += w
  }

  const nw = safeWeight(newProduct.weight)
  weightedX += (pos.x + dims.w / 2) * nw
  weightedZ += (pos.z + dims.d / 2) * nw
  totalWeight += nw

  if (totalWeight === 0) return 0

  const comX = weightedX / totalWeight
  const comZ = weightedZ / totalWeight
  return Math.sqrt((comX - boxCX) ** 2 + (comZ - boxCZ) ** 2)
}

function calcWeightBalance(items: PlacedItem[], box: Box): number {
  if (items.length === 0) return 1

  const boxCX = box.width / 2
  const boxCZ = box.depth / 2
  const maxOffset = Math.sqrt(boxCX * boxCX + boxCZ * boxCZ)
  if (maxOffset === 0) return 1

  let totalWeight = 0
  let weightedX = 0
  let weightedZ = 0

  for (const item of items) {
    const w = safeWeight(item.product.weight)
    const cx = item.position.x + item.dims.w / 2
    const cz = item.position.z + item.dims.d / 2
    weightedX += cx * w
    weightedZ += cz * w
    totalWeight += w
  }

  if (totalWeight === 0) return 1

  const comX = weightedX / totalWeight
  const comZ = weightedZ / totalWeight
  const offset = Math.sqrt((comX - boxCX) ** 2 + (comZ - boxCZ) ** 2)
  return Math.max(0, 1 - offset / maxOffset)
}

// 빈 박스 첫 아이템 배치용 초기 위치 — 코너 우선(0,0,0)으로 공간 낭비 방지
// 중앙 격자점에 무거운 아이템을 배치하면 이후 아이템이 들어갈 극점을 막을 수 있음
function generateInitialPoints(_box: Box): Point[] {
  return [{ x: 0, y: 0, z: 0 }]
}

function tryPlaceInBox(
  product: Product,
  packedBox: PackedBox & { extremePoints: Point[] },
  rotationConstraint?: PackConstraint['rotation']
): PlacedItem | null {
  const currentWeight = packedBox.totalWeight

  let candidateRotations = rotations(product)
  if (rotationConstraint) {
    candidateRotations = applyRotationConstraint(candidateRotations, rotationConstraint)
  }

  // 빈 박스에 첫 아이템을 배치할 때는 격자 위치를 후보로 사용해 무게 중심 최적화
  const candidatePoints = packedBox.items.length === 0
    ? generateInitialPoints(packedBox.box)
    : packedBox.extremePoints

  const candidates: Array<{ pos: Point; dims: Dims; offset: number }> = []

  for (const pos of candidatePoints) {
    for (const dims of candidateRotations) {
      if (canPlace(dims, pos, packedBox.box, packedBox.items, currentWeight, product.weight)) {
        const offset = calcCenterOfMassOffset(packedBox.items, product, pos, dims, packedBox.box)
        candidates.push({ pos, dims, offset })
      }
    }
  }

  if (candidates.length === 0) return null

  // y(높이) 우선, 같은 층에서는 무게 균형이 좋은 위치 선택
  candidates.sort((a, b) => {
    const yDiff = a.pos.y - b.pos.y
    if (Math.abs(yDiff) > 1e-6) return yDiff
    return a.offset - b.offset
  })

  const best = candidates[0]
  return { product, position: best.pos, dims: best.dims }
}

function fits(product: Product, box: Box): boolean {
  return rotations(product).some(
    (dims) =>
      dims.w <= box.width && dims.d <= box.depth && dims.h <= box.height
  )
}

// ---- 파손 위험 감지 ----

function xzOverlaps(a: PlacedItem, b: PlacedItem): boolean {
  return (
    a.position.x < b.position.x + b.dims.w &&
    a.position.x + a.dims.w > b.position.x &&
    a.position.z < b.position.z + b.dims.d &&
    a.position.z + a.dims.d > b.position.z
  )
}

function detectRiskItems(boxes: PackedBox[]): RiskItem[] {
  const risks: RiskItem[] = []
  boxes.forEach((pb, boxIndex) => {
    const seen = new Set<string>()
    for (const above of pb.items) {
      for (const below of pb.items) {
        if (above === below) continue
        const aboveBottom = above.position.y
        const belowTop = below.position.y + below.dims.h
        if (Math.abs(aboveBottom - belowTop) > 1e-6) continue
        if (!xzOverlaps(above, below)) continue

        const key = `${boxIndex}-${below.product.name}`
        if (seen.has(key)) continue

        if (above.product.weight > below.product.weight * 0.5) {
          risks.push({ boxIndex, productName: below.product.name, reason: 'heavy_above' })
          seen.add(key)
        } else if (below.product.fragile) {
          risks.push({ boxIndex, productName: below.product.name, reason: 'fragile' })
          seen.add(key)
        }
      }
    }
  })
  return risks
}

// ---- move_item 실행 ----

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

function anchorToTarget(anchor: ItemAnchor, dims: Dims, box: Box): Point {
  const x = anchor.includes('right') ? Math.max(0, box.width - dims.w)
           : anchor.includes('left')  ? 0
           : Math.max(0, (box.width - dims.w) / 2)
  const z = anchor.includes('back')  ? Math.max(0, box.depth - dims.d)
           : anchor.includes('front') ? 0
           : Math.max(0, (box.depth - dims.d) / 2)
  const y = anchor.startsWith('top') ? Math.max(0, box.height - dims.h) : 0
  return { x, y, z }
}

function buildExtremePoints(items: PlacedItem[]): Point[] {
  const points: Point[] = [{ x: 0, y: 0, z: 0 }]
  for (const item of items) {
    const { x, y, z } = item.position
    const { w, h, d } = item.dims
    points.push(
      { x: x + w, y, z },
      { x, y: y + h, z },
      { x, y, z: z + d },
    )
  }
  const seen = new Set<string>()
  return points.filter((p) => {
    const key = `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function applyMoveItem(
  result: PackingResult,
  moves: MoveInstruction[]
): { result: PackingResult; failed: string[] } {
  let boxes: PackedBox[] = result.boxes.map((pb) => ({ ...pb, items: [...pb.items] }))
  const failed: string[] = []

  for (const { productName, fromBoxIndex, toBoxIndex, anchor, rotation } of moves) {
    if (fromBoxIndex < 0 || fromBoxIndex >= boxes.length ||
        toBoxIndex < 0 || toBoxIndex >= boxes.length) {
      failed.push(productName)
      continue
    }

    const fromPb = boxes[fromBoxIndex]
    const itemIdx = fromPb.items.findIndex((i) => i.product.name === productName)
    if (itemIdx === -1) { failed.push(productName); continue }

    const movingItem = fromPb.items[itemIdx]
    const toPb = boxes[toBoxIndex]

    // 회전 후보: rotation 지정 시 해당 방향, 아니면 현재 dims 유지 우선
    let candidateDims = rotations(movingItem.product)
    if (rotation) {
      candidateDims = applyRotationConstraint(candidateDims, rotation)
    } else {
      const cur = movingItem.dims
      candidateDims = [cur, ...candidateDims.filter((d) => !(d.w === cur.w && d.d === cur.d && d.h === cur.h))]
    }

    const sameBox = fromBoxIndex === toBoxIndex
    // 같은 박스 내 이동 시: 이동할 아이템을 제외한 나머지 아이템 기준으로 배치 탐색
    const baseItems = sameBox
      ? toPb.items.filter((_, i) => i !== itemIdx)
      : toPb.items
    const baseWeight = sameBox
      ? toPb.totalWeight - movingItem.product.weight
      : toPb.totalWeight

    const extremePoints = buildExtremePoints(baseItems)
    let placed: PlacedItem | null = null

    for (const dims of candidateDims) {
      const target = anchor ? anchorToTarget(anchor, dims, toPb.box) : null

      // anchor target 좌표 자체를 후보에 포함 (극점만으로는 도달 불가한 경우 대응)
      const candidates = target
        ? [...extremePoints, target]
        : extremePoints

      const sorted = target
        ? [...candidates].sort((a, b) => dist(a, target) - dist(b, target))
        : candidates

      for (const pos of sorted) {
        if (canPlace(dims, pos, toPb.box, baseItems, baseWeight, movingItem.product.weight)) {
          placed = { product: movingItem.product, position: pos, dims }
          break
        }
      }
      if (placed) break
    }

    if (!placed) { failed.push(productName); continue }

    if (sameBox) {
      boxes[fromBoxIndex] = {
        ...fromPb,
        items: [...baseItems, placed],
        // totalWeight 불변 (같은 박스 내 이동)
      }
    } else {
      boxes[fromBoxIndex] = {
        ...fromPb,
        items: fromPb.items.filter((_, i) => i !== itemIdx),
        totalWeight: fromPb.totalWeight - movingItem.product.weight,
      }
      boxes[toBoxIndex] = {
        ...toPb,
        items: [...toPb.items, placed],
        totalWeight: toPb.totalWeight + movingItem.product.weight,
      }
    }
  }

  // 빈 박스 제거 + stability/weightBalance 재계산
  boxes = boxes
    .filter((pb) => pb.items.length > 0)
    .map((pb) => ({
      ...pb,
      stability: calcStability(pb.items, pb.box),
      weightBalance: calcWeightBalance(pb.items, pb.box),
    }))

  const avgStability = boxes.length > 0
    ? boxes.reduce((s, pb) => s + pb.stability, 0) / boxes.length
    : 0

  return {
    result: {
      ...result,
      boxes,
      totalBoxes: boxes.length,
      avgStability,
      riskItems: detectRiskItems(boxes),
    },
    failed,
  }
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

  // 무게 내림차순 → 부피 내림차순 (무거운 상품이 먼저 중앙에 배치됨)
  products.sort(
    (a, b) => safeWeight(b.weight) - safeWeight(a.weight) ||
              b.width * b.depth * b.height - a.width * a.depth * a.height
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
    stability: calcStability(items, box),
    weightBalance: calcWeightBalance(items, box),
  }))

  const avgStability = resultBoxes.length > 0
    ? resultBoxes.reduce((s, pb) => s + pb.stability, 0) / resultBoxes.length
    : 0

  return {
    boxes: resultBoxes,
    totalBoxes: resultBoxes.length,
    unpackable,
    stockLimitReached,
    avgStability,
    riskItems: detectRiskItems(resultBoxes),
  }
}

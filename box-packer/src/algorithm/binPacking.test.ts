import { describe, it, expect } from 'vitest'
import { pack } from './binPacking'
import type { Box, Product } from '../types'

const box5: Box = { id: 'b1', name: '5호 박스', width: 40, depth: 30, height: 30, maxWeight: 10, stock: 0 }
const box3: Box = { id: 'b2', name: '3호 박스', width: 25, depth: 20, height: 20, maxWeight: 5, stock: 0 }

const small: Product  = { id: 'p1', name: '소형',   width: 10, depth: 10, height: 10, weight: 0.5, color: '#ef4444' }
const medium: Product = { id: 'p2', name: '중형',   width: 20, depth: 15, height: 10, weight: 1,   color: '#3b82f6' }
const giant: Product  = { id: 'p3', name: '초대형', width: 50, depth: 50, height: 50, weight: 2,   color: '#22c55e' }
const heavy: Product  = { id: 'p4', name: '무거운', width: 10, depth: 10, height: 10, weight: 8,   color: '#f97316' }

describe('pack — 기본', () => {
  it('상품 1개 - 정상 배치', () => {
    const r = pack([{ product: small, quantity: 1 }], [box5])
    expect(r.totalBoxes).toBe(1)
    expect(r.boxes[0].items).toHaveLength(1)
    expect(r.unpackable).toHaveLength(0)
  })

  it('상품이 박스보다 큰 경우 - unpackable', () => {
    const r = pack([{ product: giant, quantity: 1 }], [box5])
    expect(r.totalBoxes).toBe(0)
    expect(r.unpackable[0].id).toBe('p3')
  })

  it('무게 초과 - 박스 2개로 분리', () => {
    const r = pack([{ product: heavy, quantity: 2 }], [box5])
    expect(r.totalBoxes).toBe(2)
    expect(r.unpackable).toHaveLength(0)
  })

  it('여러 상품이 한 박스에', () => {
    const r = pack([{ product: small, quantity: 4 }], [box5])
    expect(r.totalBoxes).toBe(1)
    expect(r.boxes[0].items).toHaveLength(4)
  })

  it('배치된 상품이 서로 겹치지 않음', () => {
    const r = pack([{ product: medium, quantity: 3 }], [box5])
    expect(r.unpackable).toHaveLength(0)
    const items = r.boxes.flatMap((b) => b.items)
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j]
        const overlap =
          a.position.x < b.position.x + b.dims.w && a.position.x + a.dims.w > b.position.x &&
          a.position.y < b.position.y + b.dims.h && a.position.y + a.dims.h > b.position.y &&
          a.position.z < b.position.z + b.dims.d && a.position.z + a.dims.d > b.position.z
        expect(overlap).toBe(false)
      }
    }
  })

  it('박스 없으면 빈 결과', () => {
    const r = pack([{ product: small, quantity: 1 }], [])
    expect(r.totalBoxes).toBe(0)
  })

  it('작은 박스 우선 선택', () => {
    const r = pack([{ product: small, quantity: 1 }], [box5, box3])
    expect(r.boxes[0].box.id).toBe('b2')
  })
})

describe('pack — 엣지 케이스', () => {
  it('상품 100개 이상 - 전부 배치됨', () => {
    const r = pack([{ product: small, quantity: 100 }], [box5])
    const total = r.boxes.reduce((s, b) => s + b.items.length, 0)
    expect(total + r.unpackable.length).toBe(100)
    expect(r.unpackable).toHaveLength(0)
  })

  it('박스 1가지만 있는 경우 - 정상 동작', () => {
    const r = pack([{ product: small, quantity: 3 }, { product: medium, quantity: 2 }], [box5])
    expect(r.unpackable).toHaveLength(0)
  })

  it('모든 상품이 동일한 크기', () => {
    const same: Product = { id: 'ps', name: '동일', width: 15, depth: 15, height: 15, weight: 1, color: '#fff' }
    const r = pack([{ product: same, quantity: 5 }], [box5])
    expect(r.unpackable).toHaveLength(0)
    // 겹침 없음 검증
    const items = r.boxes.flatMap((b) => b.items)
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j]
        // 같은 박스에 있는 경우만 겹침 체크
        const sameBox = r.boxes.some(
          (box) => box.items.includes(a) && box.items.includes(b)
        )
        if (!sameBox) continue
        const overlap =
          a.position.x < b.position.x + b.dims.w && a.position.x + a.dims.w > b.position.x &&
          a.position.y < b.position.y + b.dims.h && a.position.y + a.dims.h > b.position.y &&
          a.position.z < b.position.z + b.dims.d && a.position.z + a.dims.d > b.position.z
        expect(overlap).toBe(false)
      }
    }
  })

  it('부피 가득 찼지만 무게 미초과 - 새 박스 사용', () => {
    // box3(25x20x20=10000cm³), small(10x10x10=1000cm³) × 10 = 10000cm³ → 꽉 참
    const r = pack([{ product: small, quantity: 11 }], [box3])
    // 11번째는 새 박스에 들어가야 함
    expect(r.totalBoxes).toBeGreaterThanOrEqual(2)
    expect(r.unpackable).toHaveLength(0)
  })

  it('상품 없으면 빈 결과', () => {
    const r = pack([], [box5])
    expect(r.totalBoxes).toBe(0)
    expect(r.boxes).toHaveLength(0)
  })
})

describe('pack — 성능', () => {
  it('상품 50개 계산이 200ms 이하', () => {
    const products: Product[] = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i}`, name: `상품${i}`,
      width: 8 + i, depth: 8 + i, height: 8 + i,
      weight: 0.5, color: '#fff',
    }))
    const items = products.map((p) => ({ product: p, quantity: 10 }))

    const start = performance.now()
    const r = pack(items, [box5, box3])
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(200)
    expect(r.unpackable).toHaveLength(0)
  })
})

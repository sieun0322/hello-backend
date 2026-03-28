import { describe, it, expect } from 'vitest'
import { pack } from './binPacking'
import type { Box, Product } from '../types'

const box5: Box = { id: 'b1', name: '5호 박스', width: 40, depth: 30, height: 30, maxWeight: 10 }
const box3: Box = { id: 'b2', name: '3호 박스', width: 25, depth: 20, height: 20, maxWeight: 5 }

const small: Product = { id: 'p1', name: '소형 상품', width: 10, depth: 10, height: 10, weight: 0.5 }
const medium: Product = { id: 'p2', name: '중형 상품', width: 20, depth: 15, height: 10, weight: 1 }
const giant: Product = { id: 'p3', name: '초대형 상품', width: 50, depth: 50, height: 50, weight: 2 }
const heavy: Product = { id: 'p4', name: '무거운 상품', width: 10, depth: 10, height: 10, weight: 8 }

describe('pack', () => {
  it('상품 1개 - 정상 배치', () => {
    const result = pack([{ product: small, quantity: 1 }], [box5])
    expect(result.totalBoxes).toBe(1)
    expect(result.boxes[0].items).toHaveLength(1)
    expect(result.unpackable).toHaveLength(0)
  })

  it('상품이 박스보다 큰 경우 - unpackable', () => {
    const result = pack([{ product: giant, quantity: 1 }], [box5])
    expect(result.totalBoxes).toBe(0)
    expect(result.unpackable).toHaveLength(1)
    expect(result.unpackable[0].id).toBe('p3')
  })

  it('무게 초과 - 박스 2개로 분리', () => {
    // heavy(8kg) 2개 → 5호 박스(maxWeight:10)에 1개씩
    const result = pack([{ product: heavy, quantity: 2 }], [box5])
    expect(result.totalBoxes).toBe(2)
    expect(result.unpackable).toHaveLength(0)
  })

  it('여러 상품이 한 박스에 들어가는 경우', () => {
    // small(10x10x10) 4개 → 5호 박스(40x30x30)에 전부
    const result = pack([{ product: small, quantity: 4 }], [box5])
    expect(result.totalBoxes).toBe(1)
    expect(result.boxes[0].items).toHaveLength(4)
    expect(result.unpackable).toHaveLength(0)
  })

  it('배치된 상품이 서로 겹치지 않음', () => {
    const result = pack([{ product: medium, quantity: 3 }], [box5])
    expect(result.unpackable).toHaveLength(0)

    const items = result.boxes.flatMap((b) => b.items)
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].product.id !== items[j].product.id || result.boxes.length > 1) continue
        const a = items[i]
        const b = items[j]
        const overlap =
          a.position.x < b.position.x + b.dims.w && a.position.x + a.dims.w > b.position.x &&
          a.position.y < b.position.y + b.dims.h && a.position.y + a.dims.h > b.position.y &&
          a.position.z < b.position.z + b.dims.d && a.position.z + a.dims.d > b.position.z
        expect(overlap).toBe(false)
      }
    }
  })

  it('박스 없으면 빈 결과 반환', () => {
    const result = pack([{ product: small, quantity: 1 }], [])
    expect(result.totalBoxes).toBe(0)
    expect(result.boxes).toHaveLength(0)
  })

  it('작은 박스 우선 배치 - 남은 공간 있으면 더 작은 박스 선택', () => {
    // small(10x10x10) 1개 → 3호(25x20x20)에 들어가야 함, 5호 아님
    const result = pack([{ product: small, quantity: 1 }], [box5, box3])
    expect(result.boxes[0].box.id).toBe('b2') // 3호 박스
  })
})

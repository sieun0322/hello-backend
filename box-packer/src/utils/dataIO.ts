import type { Box, Product } from '../types'

interface ExportData {
  version: 1
  boxes: Box[]
  products: Product[]
}

export function exportData(boxes: Box[], products: Product[]) {
  const data: ExportData = { version: 1, boxes, products }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `box-packer-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function isBox(v: unknown): v is Box {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.width === 'number' &&
    typeof o.depth === 'number' &&
    typeof o.height === 'number' &&
    typeof o.maxWeight === 'number'
  )
}

function isProduct(v: unknown): v is Product {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.width === 'number' &&
    typeof o.depth === 'number' &&
    typeof o.height === 'number' &&
    typeof o.weight === 'number'
  )
}

export function parseImportFile(text: string): { boxes: Box[]; products: Product[] } {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('올바른 JSON 파일이 아닙니다.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('파일 형식이 올바르지 않습니다.')
  }

  const obj = parsed as Record<string, unknown>

  if (obj.version !== 1) {
    throw new Error('지원하지 않는 버전입니다.')
  }

  const boxes = Array.isArray(obj.boxes) ? obj.boxes : []
  const products = Array.isArray(obj.products) ? obj.products : []

  const validBoxes = boxes.filter(isBox)
  const validProducts = products.filter(isProduct).map((p) => ({
    ...p,
    color: typeof p.color === 'string' ? p.color : '#6366f1',
  }))

  if (validBoxes.length === 0 && validProducts.length === 0) {
    throw new Error('가져올 박스 또는 상품 데이터가 없습니다.')
  }

  return { boxes: validBoxes, products: validProducts }
}

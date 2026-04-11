export interface Box {
  id: string
  name: string
  width: number   // cm
  depth: number   // cm
  height: number  // cm
  maxWeight: number // kg
}

export interface Product {
  id: string
  name: string
  width: number   // cm
  depth: number   // cm
  height: number  // cm
  weight: number  // kg
  color: string   // hex
}

export interface OrderItem {
  product: Product
  quantity: number
}

export interface PlacedItem {
  product: Product
  position: { x: number; y: number; z: number }
  // 회전 적용 후 실제 치수
  dims: { w: number; d: number; h: number }
}

export interface PackedBox {
  box: Box
  items: PlacedItem[]
  totalWeight: number
}

export interface PackingResult {
  boxes: PackedBox[]
  totalBoxes: number
  unpackable: Product[]
}

export interface PackingSession {
  id: string
  createdAt: string   // ISO 8601
  items: OrderItem[]
  result: PackingResult
}

export interface AggregatedStats {
  period: 'daily' | 'monthly' | 'yearly'
  label: string
  totalSessions: number
  totalBoxes: number
  avgUtilization: number   // 0~1
  mostUsedBox: string
  sessions: PackingSession[]
}

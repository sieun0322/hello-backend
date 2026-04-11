export interface Box {
  id: string
  name: string
  width: number   // cm
  depth: number   // cm
  height: number  // cm
  maxWeight: number // kg
  stock: number   // 보유 수량 (0 = 무제한)
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
  stockLimitReached: boolean  // 재고 제약으로 최적화 불가 여부
}

export interface PackConstraint {
  productName: string
  rotation: 'flat' | 'tall' | 'natural'
  // flat: 넓은 면이 바닥 (h 최소), tall: 좁은 면이 바닥 (h 최대), natural: 원래 방향
}

export type SimAction =
  | { type: 'filter_boxes'; names: string[] }
  | { type: 'constrain_pack'; constraints: PackConstraint[] }
  | { type: 'combined'; names?: string[]; constraints?: PackConstraint[] }

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  action?: SimAction | null  // assistant 메시지에만
}

export interface Order {
  id: string
  name: string
  items: OrderItem[]
  result: PackingResult | null
  createdAt: string
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

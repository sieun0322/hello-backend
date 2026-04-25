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
  fragile: boolean
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
  stability: number      // 0~1: 높이 슬라이스별 가로 채움률 가중 평균
  weightBalance: number  // 0~1: 1 = 무게 중심이 박스 정중앙, 0 = 최악의 편심
}

export interface RiskItem {
  boxIndex: number
  productName: string
  reason: 'heavy_above' | 'fragile'
}

export interface PackingResult {
  boxes: PackedBox[]
  totalBoxes: number
  unpackable: Product[]
  stockLimitReached: boolean
  avgStability: number  // 0~1: 전체 박스 평균 안정성
  riskItems: RiskItem[]
}

export interface PackConstraint {
  productName: string
  rotation: 'flat' | 'tall' | 'natural'
  // flat: 넓은 면이 바닥 (h 최소), tall: 좁은 면이 바닥 (h 최대), natural: 원래 방향
}

export type ItemAnchor =
  | 'bottom-front-left' | 'bottom-front-right'
  | 'bottom-back-left'  | 'bottom-back-right' | 'bottom-center'
  | 'top-front-left'    | 'top-front-right'
  | 'top-back-left'     | 'top-back-right'    | 'top-center'

export interface MoveInstruction {
  productName: string
  fromBoxIndex: number
  toBoxIndex: number
  anchor?: ItemAnchor
  rotation?: 'flat' | 'tall' | 'natural'
}

export type SimAction =
  | { type: 'filter_boxes'; names: string[] }
  | { type: 'constrain_pack'; constraints: PackConstraint[] }
  | { type: 'combined'; names?: string[]; constraints?: PackConstraint[] }
  | { type: 'move_item'; moves: MoveInstruction[] }

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
  avgUtilization: number      // 0~1
  avgStability: number        // 0~1
  avgWeightBalance: number    // 0~1
  mostUsedBox: string
  sessions: PackingSession[]
}

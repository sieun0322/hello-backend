# 데이터 모델

> [← 명세 인덱스](../SPEC.md)

## 엔티티 관계

```
Box (프리셋)          Product (프리셋)
  └── 저장: localStorage   └── 저장: localStorage
        ↓                          ↓
        └──────── OrderItem ────────┘
                      ↓
                PackingResult
                  ├── PackedBox[]
                  │     └── PlacedItem[]
                  └── unpackable: Product[]
```

---

## 타입 정의

### Box — 박스 프리셋

```typescript
interface Box {
  id: string          // crypto.randomUUID()
  name: string        // 사용자 지정 이름. 예: "CJ 5호 박스"
  width: number       // cm, 가로
  depth: number       // cm, 세로
  height: number      // cm, 높이
  maxWeight: number   // kg, 택배사 무게 제한 포함
}
```

> **주의:** width/depth/height는 박스 내부 치수(inner dimension)를 입력한다.
> 골판지 두께(보통 0.5~1cm)는 사용자가 직접 감안해서 입력.

### Product — 상품 프리셋

```typescript
interface Product {
  id: string
  name: string        // 예: "블루투스 이어폰"
  width: number       // cm
  depth: number       // cm
  height: number      // cm
  weight: number      // kg
}
```

### OrderItem — 주문 구성 (임시, 저장 안 함)

```typescript
interface OrderItem {
  product: Product
  quantity: number    // 1 이상 정수
}
```

주문은 localStorage에 저장하지 않는다. 계산 후 결과만 메모리에 유지.

### PlacedItem — 배치된 상품

```typescript
interface PlacedItem {
  product: Product
  position: {
    x: number   // cm, 박스 내부 기준 좌하단 꼭짓점
    y: number
    z: number
  }
  rotation: {
    // 상품의 실제 치수 (회전 적용 후)
    w: number
    d: number
    h: number
  }
}
```

### PackedBox — 포장된 박스 1개

```typescript
interface PackedBox {
  box: Box
  items: PlacedItem[]
  totalWeight: number   // kg, items의 무게 합계
  usedVolume: number    // cm³, 공간 활용률 계산용
}
```

### PackingResult — 전체 포장 결과

```typescript
interface PackingResult {
  boxes: PackedBox[]
  totalBoxes: number
  unpackable: Product[]   // 어떤 박스에도 들어가지 않는 상품
  summary: {
    totalWeight: number   // 전체 무게
    avgUtilization: number  // 평균 공간 활용률 (0~1)
  }
}
```

---

## localStorage 스키마

```
key: "box-packer:boxes"     value: Box[]    (JSON)
key: "box-packer:products"  value: Product[]  (JSON)
```

Zustand `persist` 미들웨어가 자동으로 직렬화/역직렬화한다.
버전 관리가 필요한 경우 `version` 필드와 `migrate` 함수를 추가한다.

```ts
persist(..., {
  name: 'box-packer:boxes',
  version: 1,
  migrate: (persisted, version) => {
    // 스키마 변경 시 마이그레이션 로직
    return persisted
  }
})
```

---

## 입력 유효성 검사

| 필드 | 규칙 |
|------|------|
| 치수 (width/depth/height) | 0 초과 실수, 최대 200cm |
| 무게 (weight/maxWeight) | 0 초과 실수, 최대 30kg |
| 이름 | 1자 이상, 50자 이하 |
| 수량 (quantity) | 1 이상 100 이하 정수 |

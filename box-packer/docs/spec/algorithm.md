# 알고리즘 — 3D Bin Packing

> [← 명세 인덱스](../SPEC.md)

## 문제 정의

3D Bin Packing Problem:
- **입력:** 상품 목록 (크기, 무게), 사용 가능한 박스 목록 (크기, 최대 무게)
- **목표:** 상품을 최소 개수의 박스에 겹치지 않게 배치
- **제약:** 박스 크기 초과 불가, 무게 제한 초과 불가

> NP-hard 문제이므로 완벽한 최적해 대신 **휴리스틱 근사해**를 사용한다.

---

## 알고리즘: Extreme Point + BFD

### 전체 흐름

```
1. 상품 목록을 부피 내림차순 정렬 (BFD: Best Fit Decreasing)
2. 사용 가능한 박스를 부피 오름차순 정렬 (작은 박스부터 시도)
3. 각 상품에 대해:
   a. 현재 열린 박스 중 배치 가능한 위치 탐색
   b. 없으면 새 박스(가장 작은 것부터) 시도
   c. 어떤 박스에도 못 들어가면 unpackable 처리
4. 모든 상품 처리 완료 → PackingResult 반환
```

### 핵심: Extreme Point 탐색

상품이 놓일 수 있는 "후보 위치"를 **Extreme Point**로 관리한다.

초기 Extreme Point: `(0, 0, 0)` (박스 바닥 좌하단 모서리)

상품을 배치할 때마다 새로운 Extreme Point 3개를 추가한다:
```
배치된 상품의 각 면에서 뻗어나가는 모서리 좌표
- (item.x + item.w, item.y, item.z)   ← 오른쪽
- (item.x, item.y + item.h, item.z)   ← 위쪽
- (item.x, item.y, item.z + item.d)   ← 뒤쪽
```

각 Extreme Point에서 상품이 들어가는지 검사:
- 박스 경계 내에 있는가
- 기존 배치된 상품과 겹치지 않는가
- 무게 제한을 초과하지 않는가

### 회전 (6방향)

상품은 6방향으로 회전 시도:
```
(W, D, H), (W, H, D)
(D, W, H), (D, H, W)
(H, W, D), (H, D, W)
```

각 Extreme Point × 6방향 조합 중 조건을 만족하는 첫 번째 위치에 배치.

---

## 의사코드

```
function pack(orderItems: OrderItem[], boxes: Box[]): PackingResult
  // 1. 상품 펼치기 (수량 적용)
  products = flatten(orderItems)  // [{product, qty:3}] → [product, product, product]

  // 2. 부피 내림차순 정렬
  products.sort((a, b) => volume(b) - volume(a))

  // 3. 박스 부피 오름차순 정렬
  sortedBoxes = boxes.sort((a, b) => volume(a) - volume(b))

  packedBoxes = []
  unpackable = []

  for each product in products:
    placed = false

    // 열린 박스에 먼저 시도
    for each openBox in packedBoxes:
      position = findPosition(product, openBox)
      if position != null:
        openBox.items.push(PlacedItem(product, position))
        placed = true
        break

    // 새 박스 시도
    if not placed:
      for each boxType in sortedBoxes:
        if fits(product, boxType):
          newBox = PackedBox(boxType)
          newBox.items.push(PlacedItem(product, (0,0,0)))
          packedBoxes.push(newBox)
          placed = true
          break

    if not placed:
      unpackable.push(product)

  return PackingResult(packedBoxes, unpackable)


function findPosition(product, packedBox): Position | null
  for each extremePoint in packedBox.extremePoints:
    for each rotation in 6_rotations(product):
      if canPlace(rotation, extremePoint, packedBox):
        updateExtremePoints(packedBox, extremePoint, rotation)
        return extremePoint
  return null


function canPlace(item, pos, packedBox): boolean
  // 박스 경계 초과 검사
  if pos.x + item.w > box.width: return false
  if pos.y + item.h > box.height: return false
  if pos.z + item.d > box.depth: return false

  // 무게 초과 검사
  if packedBox.totalWeight + item.weight > box.maxWeight: return false

  // 충돌 검사 (AABB)
  for each placed in packedBox.items:
    if overlaps(item at pos, placed): return false

  return true
```

---

## 엣지 케이스

| 상황 | 감지 조건 | 처리 |
|------|-----------|------|
| 상품이 모든 박스보다 큰 경우 | `fits(product, boxType)` 모두 false | `unpackable`에 추가, UI에 경고 |
| 무게만 초과 | `totalWeight + item.weight > maxWeight` | 새 박스 시작 |
| 박스 프리셋 없음 | `boxes.length === 0` | 계산 버튼 비활성화 |
| 상품 프리셋/수량 없음 | `orderItems.length === 0` | 계산 버튼 비활성화 |
| 매우 많은 상품 (>200개) | 실행 전 카운트 체크 | 경고 표시 후 계속 진행 |

---

## 성능 고려사항

- 일반적인 주문 (10~50개 상품)에서는 충분히 빠름
- 상품 100개 초과 시 체감 지연 가능 → Web Worker로 메인 스레드 분리 고려 (Phase 3)
- Extreme Point 수가 배치 상품 수에 비례해 증가 → 중복 제거 필요

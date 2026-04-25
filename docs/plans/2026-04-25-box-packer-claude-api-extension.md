# box-packer Claude API 확장 설계

## 개요

기존 AI 채팅 + 시뮬레이션 기반 위에 세 가지 기능을 추가한다.

| 기능 | 방식 | 진입점 |
|------|------|--------|
| move_item (위치 수정 채팅) | 채팅 액션 (Claude) | 결과 탭 채팅 |
| 파손 위험 감지 | 규칙 기반 (자동) | 포장 계산 직후 |
| 패턴 분석 + 박스 추천 | Claude (버튼 클릭) | 통계 탭 |

---

## 1. move_item — 위치 수정 채팅

### 타입 변경 (types/index.ts)

```ts
export type ItemAnchor =
  | 'bottom-front-left' | 'bottom-front-right'
  | 'bottom-back-left'  | 'bottom-back-right' | 'bottom-center'
  | 'top-front-left'    | 'top-front-right'
  | 'top-back-left'     | 'top-back-right'    | 'top-center'

export interface MoveInstruction {
  productName: string
  fromBoxIndex: number  // 0-based
  toBoxIndex: number    // 0-based
  anchor?: ItemAnchor   // 생략 시 알고리즘이 최적 위치 선택
  rotation?: 'flat' | 'tall' | 'natural'
}

// SimAction에 추가
| { type: 'move_item'; moves: MoveInstruction[] }
```

### 시스템 프롬프트 변경 (api/analyze.ts)

`resultSummary()`에 각 아이템의 현재 위치를 anchor 명칭으로 변환해서 포함:

```
박스 1 (S박스 30×20×15cm):
  - 맥북: bottom-front-left, 크기 30×20×2cm
  - 아이폰: bottom-front-left 위(맥북 위), 크기 15×7×1cm
```

액션 형식 추가:
```
4. 아이템 이동: <action>{"type":"move_item","moves":[
   {"productName":"맥북","fromBoxIndex":0,"toBoxIndex":1,"anchor":"bottom-center","rotation":"flat"}
]}</action>
```

- `anchor` 생략 가능 — 생략 시 알고리즘이 최적 위치 선택
- `rotation` 생략 가능 — 생략 시 현재 회전 유지
- 복수 아이템 동시 이동 가능

### 프론트엔드 처리 흐름

```
move_item 액션 수신
  → 해당 아이템을 fromBoxIndex 박스에서 제거
  → toBoxIndex 박스에서 anchor 기준으로 배치 시도
      anchor 있음: 해당 위치 근처에서 유효한 좌표 탐색
      anchor 없음: 알고리즘이 최적 위치 자동 선택
  → 성공: PackingResult 업데이트 → 3D 뷰어 리렌더
  → 실패 (공간 부족): 채팅 메시지로 안내 ("공간이 부족합니다")
```

### constrain_pack과의 차이

| | constrain_pack | move_item |
|---|---|---|
| 범위 | 전체 재포장 | 특정 아이템만 이동 |
| 용도 | "항상 이렇게 배치해" 규칙 | "지금 이 아이템 여기로" 수동 이동 |
| 결과 | 나머지 아이템 위치도 변경될 수 있음 | 이동한 아이템만 변경 |

---

## 2. 파손 위험 감지

### 타입 변경 (types/index.ts)

```ts
export interface Product {
  // 기존 필드 유지
  fragile: boolean  // 추가
}
```

### 감지 로직 (algorithm/binPacking.ts)

포장 계산 완료 후 각 박스에서 실행:

```
아이템 A가 아이템 B 위에 쌓였을 때
(A.position.y >= B.position.y + B.dims.h - ε, x/z 범위 겹침):
  위험 조건 (OR):
    1. A.weight > B.weight * 0.5  → 무거운 상품이 가벼운 상품 위
    2. B.fragile === true          → 파손 주의 상품 위에 다른 상품이 쌓임
```

`PackingResult`에 위험 아이템 목록 추가:

```ts
export interface RiskItem {
  boxIndex: number
  productName: string       // 위험에 처한 아이템 (아래에 있는 것)
  reason: 'heavy_above' | 'fragile'
}

export interface PackingResult {
  // 기존 필드 유지
  riskItems: RiskItem[]
}
```

### UI

- 3D 뷰어: 위험 아이템 빨간 테두리 하이라이트
- 결과 요약: 위험 건수 경고 배지 표시 (예: "⚠ 파손 위험 2건")
- 자동 감지 — 버튼 없이 포장 계산 직후 표시

---

## 3. 패턴 분석 + 박스 추천

### 새 API 타입 (api/analyze.ts)

기존 `instant` | `report` | `chat`에 추가:

```ts
type: 'pattern'
data: {
  sessions: PackingSession[]      // 전체 히스토리
  availableBoxes: Box[]           // 현재 보유 박스
}
```

### 프롬프트 구조

```
아래는 포장 히스토리 데이터입니다. 마크다운으로 분석 리포트를 작성하세요.

[세션 목록: 상품 조합, 사용 박스, 활용률, 안정성]
[현재 보유 박스 종류]

다음을 포함하세요:
1. 비효율 패턴 (자주 나타나는 낮은 활용률 조합)
2. 박스 추천 (현재 없는 사이즈 중 효율 향상에 도움될 것)
3. 개선 우선순위 (임팩트 큰 순서로)
```

### UI

통계 탭 AI 리포트 패널 하단에 "패턴 분석" 섹션 추가.  
버튼 클릭 시 생성 (자동 실행 X) — 히스토리 데이터가 쌓인 후에만 유의미하기 때문.

---

## 변경 파일 요약

| 파일 | 변경 내용 |
|------|-----------|
| `src/types/index.ts` | `Product.fragile`, `MoveInstruction`, `ItemAnchor`, `RiskItem`, `SimAction` 확장, `PackingResult.riskItems` |
| `api/analyze.ts` | `pattern` 타입 추가, `resultSummary()`에 위치 정보 포함, `move_item` 액션 형식 추가 |
| `src/algorithm/binPacking.ts` | `move_item` 실행 로직, 파손 위험 감지 로직 |
| `src/components/Viewer3D/` | 위험 아이템 하이라이트 |
| `src/components/Statistics/` | 패턴 분석 패널 추가 |
| `src/store/productStore.ts` | `fragile` 필드 반영 |
| `src/components/ProductManager/` | 상품 등록 폼에 `fragile` 토글 추가 |

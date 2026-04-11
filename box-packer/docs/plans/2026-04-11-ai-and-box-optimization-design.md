# AI 개선 + 박스 재고 기반 최적 조합 추천 설계

## 개요

두 가지 기능을 구현한다.

1. **AI 분석 개선** — 스트리밍 응답 + Markdown 렌더링
2. **박스 재고 기반 최적 조합 추천** — 보유 수량 제약 하에서 최소 박스 수 조합 자동 선택

---

## 1. AI 분석 개선

### 문제

- 응답 전체를 기다린 후 한 번에 표시 → 느리게 느껴짐
- plain text로만 표시 (마크다운 미적용)

### 해결

**스트리밍 (api/analyze.ts)**

- Anthropic API 호출 시 `stream: true` 추가
- 청크 수신 즉시 SSE(Server-Sent Events)로 클라이언트에 relay
- `Transfer-Encoding: chunked` 응답

**프론트엔드 (Viewer3D.tsx, Statistics.tsx)**

- `fetch` + `ReadableStream`으로 청크 읽어 점진적으로 상태 업데이트
- 글자가 타이핑되듯 표시

**Markdown 렌더링**

- `react-markdown` 패키지 설치
- AI 결과 영역에서 `<p>` 대신 `<ReactMarkdown>` 사용
- 스트리밍 중에도 실시간 렌더링

---

## 2. 박스 재고 기반 최적 조합 추천

### 개념

각 박스 타입에 보유 수량(stock)을 설정하면, 알고리즘이 재고 제약 안에서 총 박스 수를 최소화하는 조합을 자동으로 선택한다.

### 최적화 조합 예시

#### 예시 1 — 재고가 작은 박스에 몰려있을 때

| 박스 | 크기 | 보유 |
|------|------|------|
| 3호  | 25×20×20 | 3개 |
| 5호  | 40×30×30 | 1개 |
| 7호  | 50×40×40 | 1개 |

주문: 소형 상품 6개

- 3호만 사용: 소형 2개씩 → **3박스** (재고 3개로 가능)
- 5호 1개 + 7호 1개: 5호에 3개, 7호에 3개 → **2박스** ✅ 추천

→ **5호 1개 + 7호 1개 (총 2박스)** 추천

#### 예시 2 — 큰 박스 재고가 없을 때

| 박스 | 크기 | 보유 |
|------|------|------|
| 3호  | 25×20×20 | 5개 |
| 5호  | 40×30×30 | 0개 |

주문: 중형 상품 4개

- 5호 재고 없음 → 3호만 사용 가능
- 3호에 1개씩 → **4박스**
- (5호가 있었다면 2박스였겠지만 재고 없음)

→ **3호 4개 (총 4박스)**, 재고 부족으로 최적화 불가 표시

#### 예시 3 — 혼합 조합이 최적일 때

| 박스 | 크기 | 보유 |
|------|------|------|
| 3호  | 25×20×20 | 2개 |
| 5호  | 40×30×30 | 2개 |

주문: 소형 2개 + 대형 2개

- 5호에 소형 2개 + 대형 1개, 5호에 대형 1개 → **2박스** ✅ 추천
- 3호에 소형 1개씩, 5호에 대형 1개씩 → **4박스** (비효율)

→ **5호 2개 (총 2박스)** 추천

### 변경 사항

#### `Box` 타입

```typescript
export interface Box {
  id: string
  name: string
  width: number
  depth: number
  height: number
  maxWeight: number
  stock: number  // 추가: 보유 수량 (0 = 무제한)
}
```

#### `pack()` 알고리즘

- 각 박스 타입별 사용 횟수 추적
- 새 박스를 열 때 `usedCount[boxType.id] < boxType.stock` (stock=0이면 무제한) 확인
- 재고 소진 시 다음 크기 박스로 넘어감

#### `PackingResult` 타입

```typescript
export interface PackingResult {
  boxes: PackedBox[]
  totalBoxes: number
  unpackable: Product[]
  stockLimitReached?: boolean  // 재고 부족으로 최적화 불가 여부
}
```

#### UI

- `BoxManager`: 보유 수량 입력 필드 추가
- `Viewer3D` 결과 헤더: 사용된 박스 조합 요약 표시
  - 예: "5호 1개 + 7호 1개 → 총 2박스 (최적 조합)"
- 재고 부족 경고: "⚠️ 재고 제약으로 최적 조합 불가 — 5호 재고 부족"

---

## 구현 순서

1. `Box` 타입에 `stock` 필드 추가 + BoxManager UI
2. `binPacking.ts` 재고 제약 로직
3. `PackingResult` 타입 변경 + Viewer3D 조합 표시
4. `api/analyze.ts` 스트리밍 변환
5. 프론트엔드 스트리밍 수신 + `react-markdown` 적용

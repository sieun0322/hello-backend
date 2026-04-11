# Claude API 리포트 기능 설계

> 작성일: 2026-04-11

## 개요

포장 결과 즉시 분석 + 기간별 배송 통계 리포트를 Claude API로 제공.
이력 데이터는 localStorage에 저장, 엑셀 export 지원.

---

## 아키텍처

```
[React App]
    │
    ├── 포장 계산 완료
    │       └── localStorage에 PackingSession 저장 (타임스탬프 포함)
    │
    ├── 결과 탭 "AI 분석" 버튼
    │       └── POST /api/analyze  ──→  [Vercel Edge Function]
    │                                         └── Claude API
    │
    └── 통계 탭
            ├── 기간 선택 (일/월/연) → localStorage에서 집계
            ├── "AI 리포트 생성" 버튼 → POST /api/analyze
            └── "엑셀 내보내기" 버튼 → xlsx 라이브러리로 클라이언트 생성
```

---

## 데이터 모델

### 새 타입 `PackingSession`

```typescript
interface PackingSession {
  id: string           // crypto.randomUUID()
  createdAt: string    // ISO 8601
  items: OrderItem[]   // 주문 구성
  result: PackingResult
}
```

### localStorage 추가

```
key: "box-packer:history"  value: PackingSession[]  (최대 365개, 초과 시 오래된 것 삭제)
```

### 집계 항목

- 총 포장 횟수
- 총 박스 수
- 평균 공간 활용률
- 가장 많이 쓴 박스

---

## Vercel Edge Function

**파일:** `box-packer/api/analyze.ts`

### 환경변수

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
ANTHROPIC_API_VERSION=2023-06-01
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
ALLOWED_ORIGIN=https://your-app.vercel.app
```

### 보안 (무료 플랜)

```typescript
export default async function handler(req: Request) {
  // 1. Origin 검증
  const origin = req.headers.get('origin')
  if (origin !== process.env.ALLOWED_ORIGIN) {
    return new Response('Forbidden', { status: 403 })
  }

  // 2. Payload 크기 제한
  const body = await req.text()
  if (body.length > 10_000) {
    return new Response('Payload Too Large', { status: 413 })
  }

  // Claude API 호출
}
```

### 요청 타입

```typescript
// body
{ type: 'instant', data: PackingResult }   // 즉시 분석
{ type: 'report',  data: AggregatedStats } // 기간별 리포트
```

### 프롬프트 전략

- `instant`: 단일 포장 결과 → 활용률 분석 + 개선 제안 (3~5줄)
- `report`: 기간 집계 데이터 → 트렌드 분석 + 인사이트 (마크다운)

---

## UI

### 탭 구성 (4개 → 5개)

```
📦 박스 관리 | 🛍️ 상품 관리 | 🧾 주문 구성 | 🔍 포장 결과 | 📊 통계
```

### 결과 탭 변경

```
[기존 3D 뷰어]
──────────────────────────────
[AI 분석] 버튼 → 로딩 스피너 → 마크다운으로 분석 결과 표시
```

### 통계 탭

```
[일간 | 월간 | 연간] 토글

[집계 카드]
총 포장 횟수 | 총 박스 수 | 평균 활용률 | 최다 사용 박스

[AI 리포트 생성] 버튼 → 마크다운 리포트 표시

[엑셀 내보내기] 버튼 → .xlsx 다운로드
  시트 1: 세션별 상세 (날짜, 박스수, 상품목록, 활용률)
  시트 2: 기간 집계 요약
```

---

## 추가 패키지

| 패키지 | 용도 |
|--------|------|
| `xlsx` | 클라이언트 사이드 엑셀 생성 |
| `react-markdown` | AI 응답 마크다운 렌더링 |

---

## 구현 순서

1. `PackingSession` 타입 + `useHistoryStore` 추가
2. 포장 계산 시 이력 자동 저장
3. Vercel Edge Function (`api/analyze.ts`)
4. 결과 탭 AI 분석 버튼
5. 통계 탭 (집계 + AI 리포트 + 엑셀 export)

# Phase 1 — MVP 태스크

> [← 프로젝트 계획](../PLAN.md)

## 목표

포장 계산 결과를 3D로 볼 수 있는 최소 동작 버전.

---

## 1. 프로젝트 셋업

- [ ] Vite + React + TypeScript 프로젝트 생성
  ```bash
  npm create vite@latest box-packer -- --template react-ts
  ```
- [ ] 의존성 설치
  ```bash
  npm install three @react-three/fiber @react-three/drei
  npm install zustand
  npm install tailwindcss @tailwindcss/vite
  npm install -D @types/three
  ```
- [ ] Tailwind CSS 설정 (`vite.config.ts`, `index.css`)
- [ ] 공통 타입 정의 파일 생성 (`src/types/index.ts`)
  - `Box`, `Product`, `OrderItem`, `PlacedItem`, `PackedBox`, `PackingResult`
- [ ] 폴더 구조 생성 (`store/`, `algorithm/`, `components/`)

**검증:** `npm run dev` 실행 시 기본 페이지 뜸

---

## 2. 상태 관리 (Store)

- [ ] `store/boxStore.ts` 구현
  - `boxes: Box[]`
  - `addBox`, `updateBox`, `removeBox`
  - Zustand `persist` 미들웨어로 localStorage 연동
- [ ] `store/productStore.ts` 구현 (boxStore와 동일 구조)

**검증:** 브라우저 콘솔에서 `useBoxStore.getState().boxes` 확인, 새로고침 후 데이터 유지

---

## 3. 박스/상품 관리 UI

- [ ] `BoxManager/BoxList.tsx` — 등록된 박스 카드 목록 (이름, 크기, 무게 표시)
- [ ] `BoxManager/BoxForm.tsx` — 추가/수정 폼 (모달)
  - 필드: 이름, 가로/세로/높이(cm), 최대 무게(kg)
  - 입력 유효성 검사 (0 초과, 비어있지 않음)
- [ ] `BoxManager/BoxManager.tsx` — List + Form 조합
- [ ] `ProductManager/` — BoxManager와 동일하게 구현
  - 필드: 이름, 가로/세로/높이(cm), 무게(kg)

**검증:** 박스/상품 추가 → 새로고침 → 목록에 유지됨

---

## 4. 주문 구성 UI

- [ ] `OrderForm/OrderItem.tsx` — 상품 행 (이름, 수량 +/- 버튼)
- [ ] `OrderForm/OrderForm.tsx`
  - 좌측: 상품 프리셋 목록 (체크박스)
  - 우측: 선택된 상품 + 수량
  - "포장 계산" 버튼 (상품 없으면 비활성화)
- [ ] 계산 버튼 클릭 시 `binPacking()` 호출 후 결과 Viewer3D로 전달

**검증:** 상품 2~3개 선택 + 수량 입력 → 계산 버튼 활성화

---

## 5. 포장 알고리즘

> 참고: [algorithm.md](../spec/algorithm.md)

- [ ] `algorithm/binPacking.ts` 구현
  - `pack(orderItems, boxes): PackingResult` 함수
  - 상품 부피 내림차순 정렬
  - Extreme Point 탐색
  - 6방향 회전 시도
  - 무게 제한 체크
  - `unpackable` 처리
- [ ] 단위 테스트 작성 (`algorithm/binPacking.test.ts`)
  - 케이스 1: 상품 1개, 박스 1개 → 정상 배치
  - 케이스 2: 상품이 박스보다 큰 경우 → unpackable
  - 케이스 3: 무게 초과 → 박스 2개로 분리
  - 케이스 4: 여러 상품이 한 박스에 들어가는 경우

**검증:** `npm test` 모든 케이스 통과

---

## 6. 기본 3D 뷰어

> 참고: [viewer3d.md](../spec/viewer3d.md)

- [ ] `Viewer3D/Scene.tsx` — 카메라, 조명, OrbitControls, Grid
- [ ] `Viewer3D/ItemMesh.tsx` — 상품 박스 mesh (색상, 크기, 위치)
- [ ] `Viewer3D/PackedBoxMesh.tsx` — 박스 외형(wireframe) + ItemMesh 배열
- [ ] `Viewer3D/Viewer3D.tsx` — R3F Canvas + PackedBoxMesh 렌더링
- [ ] 박스 여러 개일 때 탭으로 전환 (`BoxSelector.tsx`)

**검증:** 포장 계산 후 3D 씬에서 박스와 상품이 보임, 마우스로 회전 가능

---

## 7. 앱 연결

- [ ] `App.tsx` 탭 네비게이션 구성
  ```
  [ 박스 관리 | 상품 관리 | 주문 구성 | 포장 결과 ]
  ```
- [ ] 포장 결과 상태를 App 레벨에서 관리, Viewer3D에 전달
- [ ] `unpackable` 상품 있을 경우 경고 배너 표시

**검증:** 전체 흐름 (박스 등록 → 상품 등록 → 주문 구성 → 3D 결과) 수동 테스트 통과

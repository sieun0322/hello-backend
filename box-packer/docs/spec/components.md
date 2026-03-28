# 컴포넌트 구조

> [← 명세 인덱스](../SPEC.md)

## 폴더 구조

```
src/
├── store/
│   ├── boxStore.ts          # 박스 프리셋 상태 (Zustand + localStorage)
│   └── productStore.ts      # 상품 프리셋 상태 (Zustand + localStorage)
│
├── algorithm/
│   └── binPacking.ts        # 3D BLF 알고리즘 (순수 함수)
│
├── components/
│   ├── BoxManager/          # 박스 프리셋 관리 탭
│   │   ├── BoxManager.tsx   # 탭 루트
│   │   ├── BoxList.tsx      # 등록된 박스 목록
│   │   └── BoxForm.tsx      # 추가/수정 폼 (모달)
│   │
│   ├── ProductManager/      # 상품 프리셋 관리 탭
│   │   ├── ProductManager.tsx
│   │   ├── ProductList.tsx
│   │   └── ProductForm.tsx
│   │
│   ├── OrderForm/           # 주문 구성 탭
│   │   ├── OrderForm.tsx    # 상품 선택 + 수량 입력
│   │   └── OrderItem.tsx    # 개별 상품 행 (수량 조절)
│   │
│   └── Viewer3D/            # 결과 3D 뷰어 탭
│       ├── Viewer3D.tsx     # R3F Canvas + 레이아웃
│       ├── Scene.tsx        # 조명, 카메라, OrbitControls
│       ├── PackedBoxMesh.tsx # 박스 외형 + 내부 상품
│       ├── ItemMesh.tsx     # 개별 상품 mesh
│       ├── InfoOverlay.tsx  # 클릭된 상품 정보 패널
│       └── BoxSelector.tsx  # 여러 박스 전환 UI
│
├── types/
│   └── index.ts             # Box, Product, PackingResult 등 공통 타입
│
├── App.tsx                  # 탭 네비게이션 + 전역 레이아웃
└── main.tsx
```

---

## 컴포넌트별 역할

### `store/boxStore.ts`

```ts
interface BoxStore {
  boxes: Box[]
  addBox: (box: Omit<Box, 'id'>) => void
  updateBox: (id: string, box: Partial<Box>) => void
  removeBox: (id: string) => void
}
```

Zustand `persist` 미들웨어로 localStorage 자동 동기화.

---

### `App.tsx` — 탭 라우팅

```
[ 박스 관리 | 상품 관리 | 주문 구성 | 포장 결과 ]
```

상태 흐름:
- `BoxManager`, `ProductManager` → 각자의 store에 독립적으로 저장
- `OrderForm` → 로컬 state (`orderItems`)
- "포장 계산" 버튼 클릭 → `binPacking(orderItems, boxes)` 호출 → 결과를 `Viewer3D`에 전달

---

### `OrderForm/OrderForm.tsx`

- 좌측: 상품 프리셋 목록 (체크박스로 선택)
- 우측: 선택된 상품 + 수량 스피너
- 하단: "포장 계산" 버튼

```
┌─────────────────────────────────────────────┐
│  상품 선택                  주문 목록         │
│  ☑ 블루투스 이어폰   →    이어폰    [−] 2 [+] │
│  ☐ 충전기                 마우스    [−] 1 [+] │
│  ☑ 마우스                                    │
│                          [ 포장 계산 ]        │
└─────────────────────────────────────────────┘
```

---

### `Viewer3D/Viewer3D.tsx`

```
┌──────────────────────────────────────────────────┐
│  박스 1/3  [←] [→]          [전체 보기]           │
│                                                  │
│              [3D 씬]                             │
│         (회전/줌/패닝 가능)                       │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ 상품명: 블루투스 이어폰                  │    │
│  │ 크기: 10×5×3 cm  무게: 0.2kg            │    │
│  │ 위치: x:2 y:0 z:5                       │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  공간 활용률: 73%  총 무게: 4.2kg                │
└──────────────────────────────────────────────────┘
```

---

### `Viewer3D/ItemMesh.tsx`

- 각 상품을 반투명 색상 박스로 렌더링
- 같은 상품은 같은 색상 (id 기반 색상 매핑)
- `onPointerDown` → 클릭된 상품 정보를 `InfoOverlay`에 전달
- `visible` prop으로 숨기기/보이기 토글

---

### `Viewer3D/BoxSelector.tsx`

여러 박스가 나왔을 때 (예: 박스 3개) 좌우 화살표 또는 탭으로 전환.
현재 박스 번호 + 박스 이름 + 총 무게 표시.

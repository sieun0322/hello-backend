# 3D 뷰어 명세

> [← 명세 인덱스](../SPEC.md)

## 개요

React Three Fiber(R3F) 기반 인터랙티브 3D 뷰어.
포장 결과를 3차원으로 시각화하고, 상품별 정보 확인 및 토글 기능을 제공한다.

---

## 씬 구성

```
Canvas (R3F)
├── PerspectiveCamera  - 기본 시점: 박스 전면 45° 위쪽
├── OrbitControls      - 마우스 회전/줌/패닝
├── Environment        - 조명 환경 프리셋 (studio)
├── GizmoHelper        - 우하단 X/Y/Z 축 기즈모
├── Grid               - 바닥 격자 (참조용)
└── PackedBoxMesh      - 박스 + 내부 상품들
    ├── BoxOutline     - 박스 외형 (wireframe + 반투명 면)
    └── ItemMesh[]     - 배치된 상품들
```

---

## 렌더링 전략

### 박스 외형 (BoxOutline)

- 반투명 회색 면 (`opacity: 0.15`) + 실선 wireframe
- 박스 내부가 보이도록 낮은 불투명도 유지
- 앞면(front face)만 culling 제거하여 내부 가시성 확보

```tsx
<mesh>
  <boxGeometry args={[box.width, box.height, box.depth]} />
  <meshStandardMaterial
    color="#888888"
    transparent
    opacity={0.12}
    side={THREE.BackSide}  // 내부에서도 면이 보이도록
  />
</mesh>
<lineSegments>
  <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
  <lineBasicMaterial color="#333333" />
</lineSegments>
```

### 상품 (ItemMesh)

- 각 상품 종류마다 고유 색상 (product.id → HSL 색상 매핑)
- 클릭 가능한 상태에서는 약간 밝게, hover 시 outline 표시
- 상품 간 구분을 위해 실제 크기보다 0.5cm 작게 렌더링 (시각적 여백)

```tsx
// product.id로 결정론적 색상 생성
function productColor(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return `hsl(${hash % 360}, 65%, 55%)`
}
```

---

## 인터랙션 명세

### 1. 회전 / 줌 / 패닝

| 입력 | 동작 |
|------|------|
| 마우스 드래그 | 씬 회전 |
| 스크롤 | 줌 인/아웃 |
| 우클릭 드래그 | 패닝 |
| 더블클릭 (빈 공간) | 기본 시점으로 리셋 |

### 2. 상품 클릭 → 정보 표시

`ItemMesh`의 `onPointerDown` 이벤트로 선택된 상품 추적.

표시 정보:
- 상품명
- 크기 (W×D×H cm)
- 무게 (kg)
- 박스 내 위치 (x, y, z)
- 회전 방향

`@react-three/drei`의 `Html` 컴포넌트로 3D 씬 위에 HTML 패널을 오버레이.
클릭된 상품 위치에 고정되어 카메라 회전 시에도 따라다님.

### 3. 상품 숨기기/보이기

뷰어 우측 패널에 상품 목록을 나열.
각 항목의 눈 아이콘(👁)으로 토글.
숨겨진 상품은 `visible={false}` + 목록에서 반투명 처리.

```tsx
<ItemMesh
  key={item.product.id + index}
  item={item}
  visible={visibleIds.has(item.product.id)}
  selected={selectedId === item.product.id}
  onSelect={setSelectedId}
/>
```

### 4. 단계별 포장 애니메이션

"재생" 버튼 클릭 시 상품이 배치 순서대로 하나씩 나타남.

구현:
- `visibleCount` 상태값 (0 → items.length)
- `useFrame` 또는 `setInterval`로 0.4초마다 +1
- 재생/일시정지/초기화 컨트롤 제공

```
[ ▶ 재생 ] [ ⏸ 일시정지 ] [ ↺ 처음으로 ]  속도: [느리게] [보통] [빠르게]
```

### 5. 여러 박스 전환

포장 결과가 박스 여러 개인 경우:

```
◀  박스 2 / 3  ▶
   CJ 5호 박스
   무게: 3.2 / 5.0 kg
   활용률: 68%
```

전환 시 이전 박스 fade-out → 다음 박스 fade-in 애니메이션 (opacity transition).

---

## 카메라 초기 시점

박스 크기에 따라 동적으로 카메라 거리 계산:

```ts
const maxDim = Math.max(box.width, box.depth, box.height)
camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5)
camera.lookAt(box.width / 2, box.height / 2, box.depth / 2)
```

---

## 접근성 / UX 보조

- 색맹 대응: 상품 위에 번호 레이블 표시 옵션 (숫자로도 구분 가능)
- 모바일: 터치 제스처로 OrbitControls 동작 (R3F 기본 지원)
- 씬 로딩 중 스피너 표시 (`Suspense` + `Html` fallback)

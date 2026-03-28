# 기술 스택

> [← 명세 인덱스](../SPEC.md)

## 선택 스택

| 역할 | 기술 | 버전 |
|------|------|------|
| 번들러/개발환경 | Vite | 5.x |
| UI 프레임워크 | React | 18.x |
| 언어 | TypeScript | 5.x |
| 3D 렌더링 | React Three Fiber (R3F) | 8.x |
| 3D 헬퍼 | @react-three/drei | 9.x |
| 상태 관리 | Zustand | 4.x |
| 스타일 | Tailwind CSS | 3.x |
| 배포 | Vercel | — |

---

## 핵심 선택 이유

### React Three Fiber (R3F) — Three.js 대신

Three.js를 직접 쓰면 `useEffect` 안에서 명령형(imperative)으로 씬을 구성해야 한다.
R3F는 Three.js 객체를 JSX 컴포넌트로 선언적으로 작성할 수 있어
React 상태(`useState`, `useStore`)와 자연스럽게 통합된다.

```tsx
// Three.js 직접 사용 (명령형)
useEffect(() => {
  const geometry = new THREE.BoxGeometry(w, h, d)
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  return () => scene.remove(mesh)
}, [w, h, d])

// R3F (선언적)
<mesh position={[x, y, z]}>
  <boxGeometry args={[w, h, d]} />
  <meshStandardMaterial color={color} />
</mesh>
```

### Zustand — Redux/Context 대신

- 보일러플레이트 없이 localStorage 미들웨어(`persist`)로 영속화 한 줄 처리
- 컴포넌트 외부에서도 `getState()`로 스토어 접근 가능 (알고리즘 모듈에서 유용)

```ts
const useBoxStore = create(
  persist(
    (set) => ({
      boxes: [],
      addBox: (box) => set((s) => ({ boxes: [...s.boxes, box] })),
    }),
    { name: 'box-packer:boxes' }  // localStorage key
  )
)
```

### Vite — CRA 대신

- 개발 서버 HMR이 CRA보다 10배 이상 빠름
- Three.js 같은 heavy 라이브러리를 `optimizeDeps`로 사전 번들링 지원

---

## @react-three/drei 주요 사용 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `OrbitControls` | 마우스로 씬 회전/줌/패닝 |
| `Box` | 박스 지오메트리 단축 컴포넌트 |
| `Html` | 3D 씬 내 HTML 오버레이 (상품 정보 툴팁) |
| `Environment` | 조명 환경 프리셋 |
| `GizmoHelper` | 방향 기즈모 (X/Y/Z 축 표시) |

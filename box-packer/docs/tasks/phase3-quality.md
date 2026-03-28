# Phase 3 — 품질 태스크

> [← 프로젝트 계획](../PLAN.md)
> 선행 조건: Phase 1, 2 완료

## 목표

실제 사용 환경에서 안정적으로 동작하도록 품질을 높이고 배포한다.

---

## 1. 알고리즘 안정화

- [ ] 엣지 케이스 추가 테스트
  - 상품 수량 합계 100개 이상
  - 박스가 1가지 종류만 있는 경우
  - 모든 상품이 동일한 크기인 경우
  - 무게는 초과하지 않지만 부피가 가득 찬 경우
- [ ] 성능 테스트: 상품 50개 기준 계산 시간 측정 (목표: 200ms 이하)
- [ ] 상품 50개 초과 시 Web Worker로 메인 스레드 분리
  ```ts
  const worker = new Worker(new URL('../algorithm/binPacking.worker.ts', import.meta.url))
  ```
- [ ] 공간 활용률 낮을 때(< 50%) 사용자에게 "더 작은 박스 사용을 권장합니다" 힌트 표시

**검증:** 상품 100개 입력 시 UI 버벅임 없음, 계산 완료 후 결과 정상 표시

---

## 2. 모바일 반응형

- [ ] 뷰포트 768px 이하 레이아웃 조정
  - 탭 네비게이션 → 하단 탭 바
  - OrderForm 좌/우 분할 → 상/하 분할
  - Viewer3D 우측 패널 → 하단 드로어
- [ ] 터치 제스처 확인 (OrbitControls 기본 지원이지만 실기기 테스트)
- [ ] InfoOverlay 모바일 크기 최적화 (화면 밖으로 나가지 않도록)

**검증:** Chrome DevTools 모바일 뷰 + 실제 스마트폰에서 전체 흐름 테스트

---

## 3. 접근성

- [ ] 색맹 대응: 상품 위에 번호 레이블 표시 토글 옵션 추가
- [ ] 키보드 네비게이션: 폼 필드 Tab 순서 확인
- [ ] 버튼/입력 필드 aria-label 추가
- [ ] 에러 메시지 스크린 리더 접근 가능 (`role="alert"`)

---

## 4. 데이터 관리

- [ ] 박스/상품 프리셋 내보내기 (JSON 파일 다운로드)
- [ ] 박스/상품 프리셋 가져오기 (JSON 파일 업로드)
  - 유효성 검사 포함 (잘못된 형식 시 에러 메시지)
- [ ] localStorage 용량 초과 시 경고 및 오래된 데이터 정리 안내

**검증:** JSON 내보내기 → 다른 브라우저에서 가져오기 → 동일한 데이터 복원

---

## 5. 배포

- [ ] `vite.config.ts` 프로덕션 빌드 최적화
  - Three.js 코드 스플리팅 (`manualChunks`)
  - 번들 크기 분석 (`rollup-plugin-visualizer`)
- [ ] `vercel.json` 설정 (SPA 라우팅 fallback)
- [ ] GitHub Actions CI 설정 (`.github/workflows/box-packer.yml`)
  - `push` to `main` + path filter `box-packer/**`
  - 빌드 → Vercel 자동 배포
- [ ] 환경별 빌드 확인 (로컬 빌드 → 프리뷰 → 프로덕션)

**검증:** Vercel URL에서 전체 기능 동작 확인

---

## 6. 문서 정리

- [ ] `box-packer/README.md` 작성
  - 서비스 소개, 스크린샷, 로컬 실행 방법
- [ ] 알고리즘 한계 및 향후 개선 방향 문서화
  - 현재 휴리스틱의 최적 보장 수준
  - 더 나은 알고리즘(guillotine, genetic algorithm) 참고 자료

# Box Packer — 프로젝트 계획

> 작성일: 2026-03-28

## 목적

상품을 택배 발송할 때,
보유 박스와 상품 크기/무게를 기반으로 최적 포장 방식을 3D로 시각화해주는 웹 서비스.

## 핵심 문제

- 어떤 박스를 몇 개 써야 하는가?
- 상품을 어떻게 쌓아야 하는가?
- 무게 제한을 초과하지 않는가?

## 사용자 흐름

```
1. 박스 프리셋 등록/관리
      ↓
2. 상품 프리셋 등록/관리
      ↓
3. 주문 구성 (상품 선택 + 수량 입력)
      ↓
4. 포장 계산 실행
      ↓
5. 3D 결과 뷰 확인 (인터랙티브)
```

## 개발 단계

### Phase 1 — MVP → [tasks/phase1-mvp.md](tasks/phase1-mvp.md)
- [ ] 프로젝트 셋업 (Vite + React + TypeScript)
- [ ] 박스/상품 CRUD (localStorage)
- [ ] 3D Bin Packing 알고리즘 구현
- [ ] 기본 3D 뷰어 (React Three Fiber)

### Phase 2 — 인터랙션 → [tasks/phase2-interaction.md](tasks/phase2-interaction.md)
- [ ] 상품 클릭 시 정보 표시
- [ ] 상품 숨기기/보이기 토글
- [ ] 단계별 포장 애니메이션

### Phase 3 — 품질 → [tasks/phase3-quality.md](tasks/phase3-quality.md)
- [ ] 알고리즘 엣지 케이스 처리
- [ ] 모바일 반응형
- [ ] Vercel 배포

## 배포

- **플랫폼:** Vercel 또는 GitHub Pages (정적 SPA)
- **데이터:** 모두 localStorage (서버 불필요)

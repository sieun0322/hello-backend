---
tags: #networking #elb #alb #nlb #load-balancer
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 2 & 3
keywords: ALB, NLB, GLB, target group, listener, sticky session, connection draining, cross-zone, Global Accelerator
---
# 로드 밸런서 (ALB, NLB, GLB)

## ALB (Application Load Balancer)

### 라우팅 기능
```
리스너 (443/HTTPS)
├── 규칙 1: /api/* → Target Group A (EC2)
├── 규칙 2: /image/* → Target Group B (Lambda)
└── 규칙 3: Host: api.example.com → Target Group C
```

### ALB 대상 유형
- EC2 인스턴스
- Lambda 함수
- IP 주소 (온프레미스 서버 포함)
- 다른 ALB

### 스티키 세션
- 동일 클라이언트를 항상 동일 대상으로
- **ALB 쿠키** (AWSALB) 또는 **앱 쿠키** 사용
- 주의: 스티키 세션은 부하 불균형 초래 가능

## NLB (Network Load Balancer)

### 특징
- L4 (TCP/UDP/TLS)
- **초저지연**, 초당 수백만 요청 처리
- **정적 IP** (또는 Elastic IP) 지원 → IP 화이트리스트 고객에게 유용
- 헬스 체크: TCP, HTTP, HTTPS

> [!important] NLB 선택 시나리오
> "고정 IP 필요" → NLB
> "초고성능, 게임 서버" → NLB
> "WebSocket, gRPC" → NLB (또는 ALB)

## GLB (Gateway Load Balancer)

```
클라이언트
   ↓
GLB → 방화벽/IDS/IPS 어플라이언스 (검사)
   ↓
목적지 서버
```

- L3 (IP 수준) 트래픽 분산
- **서드파티 네트워크 어플라이언스** 인라인 배치
- GENEVE 프로토콜 사용

## 공통 기능

### Cross-Zone 로드 밸런싱
| ELB 유형 | 기본값 | 변경 가능 |
|----------|--------|-----------|
| ALB | 활성화 | ✅ |
| NLB | 비활성화 | ✅ |
| GLB | 비활성화 | ✅ |

> [!tip] Cross-Zone 비활성 시
> AZ-a (2 인스턴스) vs AZ-b (8 인스턴스)
> 비활성: AZ별 50%씩 → AZ-a 인스턴스 과부하
> 활성: 전체 10 인스턴스에 균등 분배

### Connection Draining (등록 취소 지연)
- 기존 연결 완료 대기 (기본 300초, 0=즉시 해제)
- 배포 또는 스케일 인 시 요청 손실 방지

## 시험 함정

> [!warning]- 로드밸런서 함정
> - ALB: 동적 IP → 고정 IP 필요 시 NLB 사용
> - NLB: 보안 그룹 없음 (소스 IP 보존)
> - ALB: X-Forwarded-For 헤더로 클라이언트 IP 확인
> - Global Accelerator: Anycast IP → 엣지에서 AWS 백본으로 라우팅

## Related Notes
- [[VPC-완전가이드]]
- [[고가용성-패턴]]
- [[CloudFront-CDN]]
- [[Practice-네트워킹]]

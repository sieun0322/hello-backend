---
tags: #cost #ec2 #pricing #spot #reserved
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 4 - Design Cost-Optimized Architectures
keywords: On-Demand, Reserved, Savings Plan, Spot, Dedicated Host, Instance Store
---
# EC2 구매 옵션 & 비용 최적화

## 구매 옵션 비교

| 옵션 | 할인율 | 중단 가능 | 적합 사용 사례 |
|------|--------|-----------|----------------|
| On-Demand | 기준 (0%) | 불가 | 예측 불가 단기 워크로드 |
| Reserved (1년) | ~40% | 불가 | 예측 가능 **24/7** 워크로드 |
| Reserved (3년) | ~60% | 불가 | 장기 안정 워크로드 |
| Savings Plan | ~66% | 불가 | EC2 + Lambda + Fargate 유연 |
| Spot | ~90% | **가능** | 배치, 빅데이터, 내결함성 필요 |
| Dedicated Host | 높음 | 불가 | 라이선스(BYOL), 규정 준수 |
| Dedicated Instance | 높음 | 불가 | 물리 서버 격리 (공유 없음) |

> [!important] Spot 인스턴스 핵심
> - **2분 알림** 후 중단
> - 중단 시 데이터 손실 위험 → **체크포인트** 사용
> - 중단되어도 괜찮은 워크로드: 배치처리, CI/CD, 빅데이터

## Reserved Instance 유형

| 유형 | 특징 |
|------|------|
| Standard RI | 특정 인스턴스 패밀리/리전 고정, 할인율 최대 |
| Convertible RI | 인스턴스 유형 변경 가능, 할인율 낮음 |

> [!tip] RI 구매 전략
> "인스턴스 유형 변경 가능성 있음" → Convertible RI
> "최대 할인" → Standard RI

## Savings Plan

| 유형 | 유연성 | 할인율 |
|------|--------|--------|
| Compute Savings Plan | EC2 + Lambda + Fargate, 리전/OS/크기 자유 | 최대 66% |
| EC2 Instance Savings Plan | 특정 패밀리/리전 고정 | 최대 72% |

## 비용 최적화 아키텍처 패턴

### On-Demand + Spot 혼합
```
Auto Scaling Group
├── On-Demand: 최소 기본 용량 (안정성 보장)
└── Spot: 추가 용량 (비용 절감)
```

### 절약 우선순위
```
1. 사용하지 않는 인스턴스 종료
2. 인스턴스 크기 최적화 (Right-sizing)
3. Savings Plan / Reserved 구매
4. Spot으로 전환 가능한 워크로드 이전
```

## 시험 함정

> [!warning]- EC2 비용 함정
> - **24/7 워크로드** → Reserved (Spot 아님, 중단 위험)
> - **단기 예측 불가** → On-Demand (Reserved 약정 불필요)
> - **배치/내결함성** → Spot
> - Dedicated Host: 소켓/코어 당 라이선스 (Oracle, SQL Server BYOL)
> - Dedicated Instance ≠ Dedicated Host (후자만 물리 서버 제어 가능)

## Related Notes
- [[스토리지-비용최적화]]
- [[컴퓨팅-스케일링]]
- [[Practice-비용최적화]]

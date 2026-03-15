---
tags: #resilience #database #rds #aurora #dynamodb #ha
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 2 - Design Resilient Architectures
keywords: RDS Multi-AZ, Aurora, read replica, DynamoDB Global Table, ElastiCache cluster, RDS Proxy
---
# 데이터베이스 고가용성

## RDS Multi-AZ

```
AZ-a: Primary DB (읽기/쓰기)
  ↕ 동기 복제
AZ-b: Standby DB (읽기 불가)
```

- **동기 복제**: 데이터 손실 없음 (RPO ≈ 0)
- **자동 장애 조치**: 60-120초 (DNS 전환)
- Standby: **읽기 트래픽 처리 불가** (대기 전용)

> [!warning] Multi-AZ ≠ 읽기 스케일링
> Standby는 장애 조치 전용 → 읽기 스케일링은 **읽기 전용 복제본** 사용

## RDS 읽기 전용 복제본 (Read Replica)

```
Primary ──비동기 복제──> 읽기 복제본 1 (읽기 전용)
                     ──> 읽기 복제본 2 (읽기 전용)
                     ──> 교차 리전 복제본 (DR용)
```

- **비동기 복제**: 약간의 복제 지연 가능 (eventual consistency)
- 최대 **5개** (MySQL/MariaDB), **15개** (Aurora)
- 별도 엔드포인트 사용 (앱이 직접 지정)

> [!tip] 복제본 → Primary 승격
> 장애 시 수동 승격 가능 (독립 DB로 전환)

## Aurora 고가용성

### Aurora 아키텍처
```
Writer 인스턴스 (1개)
  │
  └──공유 스토리지 (3 AZ × 2 = 6개 사본)
  │
Reader 인스턴스 (최대 15개)
```

> [!important] Aurora 특징
> - 스토리지 자동 확장: 10GB ~ 128TB
> - 장애 조치: **30초 이내** (Multi-AZ RDS보다 빠름)
> - 6개 사본: **4개** 쓰기, **3개** 읽기 정족수

### Aurora Serverless v2
- **자동 스케일링**: 0.5 ACU ~ 128 ACU
- 사용량에 따라 즉시 조정
- **예측 불가한 워크로드**에 적합

### Aurora Global Database
```
Primary 리전 ──< 1초 복제 ──> Secondary 리전 (최대 5개)
```
- 리전 간 재해 복구 (RTO < 1분)
- 낮은 읽기 지연시간 (로컬 읽기)

## DynamoDB 가용성

### DynamoDB 글로벌 테이블
```
리전 A ←──양방향 복제 (< 1초)──→ 리전 B
(읽기/쓰기)                       (읽기/쓰기)
```

> [!important] 글로벌 테이블 = Active-Active
> 모든 리전에서 읽기/쓰기 가능 (충돌 해결: last-writer-wins)

### Point-in-Time Recovery (PITR)
- 35일 이내 임의 시점으로 복원
- 실수로 삭제/변경 시 복구

## RDS Proxy

```
앱 → RDS Proxy (연결 풀링) → RDS/Aurora
```

> [!tip] RDS Proxy 사용 시나리오
> - Lambda → RDS: Lambda의 높은 동시성 → DB 연결 폭발 방지
> - 연결 풀링으로 DB 부하 감소
> - 장애 조치 시간 단축 (66%)

## ElastiCache HA

| 모드 | 구성 | 특징 |
|------|------|------|
| Redis Single | 노드 1개 | 단순, 저렴 |
| Redis Multi-AZ | Primary + Replica | 자동 장애 조치 |
| Redis Cluster | 샤딩 + 복제 | 수평 확장 + HA |
| Memcached | 멀티 노드 | 자동 장애 조치 없음 |

## Related Notes
- [[고가용성-패턴]]
- [[재해복구-DR]]
- [[RDS-Aurora]]
- [[DynamoDB]]
- [[Practice-회복탄력성]]

---
tags: #resilience #disaster-recovery #rto #rpo #backup
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 2 - Design Resilient Architectures
keywords: RTO, RPO, backup-restore, pilot light, warm standby, multi-site, S3 replication, Route53 failover
---
# 재해 복구 (DR) 전략

## RTO vs RPO

```
사고 발생  ←── RPO ───→ 마지막 백업  ←── RTO ───→ 복구 완료
   ↓                        ↓                          ↓
 장애                    데이터 손실                서비스 재개
```

- **RPO (Recovery Point Objective)**: 허용 가능한 **데이터 손실** 시간
- **RTO (Recovery Time Objective)**: 허용 가능한 **복구 시간**

## DR 전략 4가지

| 전략 | RTO | RPO | 비용 | 설명 |
|------|-----|-----|------|------|
| Backup & Restore | 시간 단위 | 시간 단위 | 최저 | S3 백업 → 장애 시 복원 |
| Pilot Light | 분~시간 | 분 단위 | 낮음 | 핵심 컴포넌트만 실행 중 (DB 복제) |
| Warm Standby | 분 단위 | 초~분 | 중간 | 축소된 버전 항상 실행 |
| Multi-Site Active-Active | 거의 0 | 거의 0 | 최고 | 두 리전 동시 운영 |

### Pilot Light
```
Primary 리전: EC2(실행 중) + RDS(복제 중)
DR 리전:      EC2(중지)    + RDS Replica(실행 중)
→ 장애 시: EC2 시작 + RDS 승격 + DNS 전환
```

### Warm Standby
```
Primary: Full-size 인프라
DR:      소규모 인프라 (축소 버전, 항상 실행)
→ 장애 시: DR 인프라 Scale-out + DNS 전환
```

## Route 53 장애 조치 (Failover)

```
Route 53 헬스 체크 → Primary 비정상 감지
                   → Secondary(DR)로 자동 DNS 전환
```

> [!tip] 장애 조치 레코드
> - Failover 레코드: Primary/Secondary 지정
> - 헬스 체크 연결 필수

## S3 복제

| 유형 | 설명 |
|------|------|
| 교차 리전 복제 (CRR) | 다른 리전 버킷으로 자동 복제 (DR, 지연시간 감소) |
| 동일 리전 복제 (SRR) | 같은 리전 내 복제 (로그 집계, 테스트 환경) |

> [!important] 복제 전제 조건
> 소스와 대상 모두 **버전 관리** 활성화 필수

## AWS Backup

- 중앙화된 백업 관리 서비스
- 지원: EC2, EBS, RDS, DynamoDB, EFS, FSx, Storage Gateway
- **백업 볼트 잠금**: 불변 백업 (삭제/변경 방지, 규정 준수)
- 교차 계정/교차 리전 백업 지원

## 시험 함정

> [!warning]- DR 함정 모음
> - **Pilot Light ≠ Warm Standby**: Pilot은 최소 실행, Warm은 축소 실행
> - **RDS 읽기 전용 복제본**: 장애 조치용 아님 (성능용) → 수동 승격 필요
> - **Aurora Global DB**: 리전 간 복제 지연 < 1초, 보조 리전 승격 < 1분
> - **CRR**: 기존 객체 자동 복제 안 됨 → S3 Batch Replication으로 기존 객체 복제

## Related Notes
- [[고가용성-패턴]]
- [[데이터베이스-HA]]
- [[S3-완전가이드]]
- [[Route53-DNS]]
- [[Practice-회복탄력성]]

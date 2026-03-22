---
tags: #database #rds #aurora #mysql #postgresql
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 3 & 2
keywords: RDS, Aurora, Multi-AZ, read replica, Proxy, Serverless, PostgreSQL, MySQL, Oracle
---
# RDS & Aurora

## RDS 기본

### 지원 엔진
MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2

### RDS vs EC2 직접 설치

| 항목 | RDS (관리형) | EC2 + DB |
|------|-------------|----------|
| OS 접근 | ❌ | ✅ |
| 백업 자동화 | ✅ | 직접 구현 |
| 패치 | AWS 담당 | 직접 |
| HA (Multi-AZ) | 클릭 한번 | 직접 구현 |
| 비용 | 높음 | 낮음 (관리비 제외) |

> [!tip] "OS 레벨 제어 필요" → EC2 + DB 직접 설치

### 백업 유형
| 유형 | 보관 기간 | 복원 |
|------|-----------|------|
| 자동 백업 | 1-35일 | 특정 시점 복원 (PITR) |
| 수동 스냅샷 | 무기한 | 새 DB 인스턴스 생성 |

### RDS 암호화
- 생성 시에만 설정 가능 (나중에 변경 불가)
- 암호화 추가: 스냅샷 → 암호화 복사 → 새 DB 복원

## Aurora 심화

### 비용 vs RDS
- Aurora: MySQL/PostgreSQL 대비 5배 성능
- 비용: RDS보다 20% 정도 비쌈

### Aurora Endpoints 유형
```
클러스터 엔드포인트 (Writer): 쓰기 전용
읽기 엔드포인트:             모든 Reader에 분산
사용자 지정 엔드포인트:      특정 인스턴스 그룹
인스턴스 엔드포인트:         특정 인스턴스 직접
```

### Aurora Serverless v2 vs v1
| 항목 | v1 | v2 |
|------|----|----|
| 최소 ACU | 0 (일시 중지 가능) | 0.5 |
| 스케일링 속도 | 느림 (수 분) | 빠름 (수 초) |
| Aurora 기능 | 제한적 | 전체 지원 |
| 글로벌 DB | ❌ | ✅ |

## RDS Proxy 심화

```
                     ┌─ RDS Primary (쓰기)
앱 → RDS Proxy ──────┤
                     └─ RDS Replica (읽기)
```

- IAM 인증 지원
- Secrets Manager와 통합 (비밀번호 자동 로테이션)
- Lambda에서 특히 유용 (연결 재사용)

## 시험 함정

> [!warning]- RDS 함정
> - Multi-AZ Standby: 읽기 불가, 쓰기 불가 → 순수 대기
> - 읽기 복제본: **비동기** 복제 (약간 지연)
> - RDS 암호화: 미암호화 DB → 스냅샷 → 암호화 복사 → 복원
> - Aurora 장애 조치: 30초 (RDS Multi-AZ: 60-120초)
> - RDS Proxy: VPC 내부에서만 접근 가능 (퍼블릭 액세스 없음)

## Related Notes
- [[DynamoDB]]
- [[분석DB-Redshift]]
- [[데이터베이스-HA]]
- [[Practice-데이터베이스]]

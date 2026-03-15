---
tags: #database #redshift #analytics #data-warehouse #elasticache
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 3 - High-Performing Architectures
keywords: Redshift, column store, MPP, Spectrum, Serverless, ElastiCache, Redis, Memcached, MemoryDB
---
# 분석 DB & 인메모리 DB

## Amazon Redshift

### 특징
- **열 지향 스토리지 (Columnar)**: 집계 쿼리 최적화
- **MPP (대규모 병렬 처리)**: 여러 노드에서 병렬 쿼리
- OLAP 워크로드 (데이터 웨어하우스)

### 아키텍처
```
리더 노드 (SQL 수신/계획)
    ↓
컴퓨팅 노드들 (병렬 실행)
    ↓
S3 (Redshift Spectrum으로 직접 쿼리)
```

### Redshift Spectrum
- **S3 데이터를 Redshift에 로드 없이 직접 쿼리**
- 외부 테이블로 S3 데이터 참조
- 데이터 레이크 쿼리에 활용

### Redshift Serverless
- 클러스터 관리 없이 사용
- 자동 스케일링
- 간헐적 쿼리 워크로드에 비용 효율적

> [!tip] Redshift vs Athena
> Redshift: 데이터 사전 로드, 복잡한 JOIN, 반복 쿼리
> Athena: S3 직접 쿼리, 임시 분석, 서버리스

## ElastiCache

### Redis vs Memcached

| 항목 | Redis | Memcached |
|------|-------|-----------|
| 데이터 구조 | 풍부 (String/Hash/List/Set/Sorted Set) | String만 |
| 영속성 | ✅ (AOF, RDB) | ❌ |
| 복제 | ✅ (Multi-AZ) | ❌ |
| 샤딩 | ✅ (Cluster Mode) | ✅ |
| Pub/Sub | ✅ | ❌ |
| 용도 | 세션, 순위표, 캐시, Pub/Sub | 단순 캐시 |

> [!important] 시험 핵심
> "영속성/복제/복잡한 구조" → **Redis**
> "단순 캐싱, 멀티스레드 스케일" → **Memcached**

### ElastiCache 패턴

**Lazy Loading (지연 로딩)**
```
1. 앱 → 캐시 조회
2. 캐시 미스 → DB 조회
3. DB 결과 → 캐시 저장 + 반환
단점: 캐시 미스 시 3번 왕복
```

**Write Through (즉시 쓰기)**
```
1. DB 쓰기
2. 동시에 캐시 업데이트
단점: 쓰기 지연, 쓰지 않는 데이터도 캐시됨
```

## MemoryDB for Redis

- Redis 호환, **지속성 있는 인메모리 DB**
- 데이터 손실 없음 (트랜잭션 로그)
- ElastiCache보다 고가 (DB 역할)

> [!tip] ElastiCache vs MemoryDB
> ElastiCache: 캐시 계층 (일시적 데이터)
> MemoryDB: Primary DB로 사용 가능 (영구 데이터)

## Related Notes
- [[RDS-Aurora]]
- [[DynamoDB]]
- [[Kinesis-실시간분석]]
- [[Practice-데이터베이스]]

---
tags: #analytics #kinesis #streaming #real-time
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 3 - High-Performing Architectures
keywords: Kinesis, Data Streams, Firehose, Data Analytics, shard, partition key, real-time processing
---
# Kinesis 실시간 분석

## Kinesis 서비스 전체 흐름

```
데이터 생성
    ↓
Kinesis Data Streams (실시간 수집)
    ├── Lambda (실시간 처리)
    ├── Kinesis Data Analytics (SQL/Flink 분석)
    └── Kinesis Firehose (배치 저장)
                ↓
        S3 / Redshift / OpenSearch / Splunk
```

## Kinesis Data Streams 심화

### 샤드 (Shard) 개념
```
스트림 = 여러 샤드의 집합

샤드당 처리량:
  - 입력: 1MB/s 또는 1,000 레코드/s
  - 출력: 2MB/s (Enhanced Fan-Out: 샤드당 2MB/s × 소비자)
```

### 파티션 키 설계
- 동일 파티션 키 → 동일 샤드 (순서 보장)
- 파티션 키 분산 → 샤드 균등 분배 (핫 샤드 방지)

> [!tip] 순서 보장
> 동일 파티션 키 내에서만 순서 보장
> 전체 스트림 순서 보장 아님

### 데이터 보관
| 설정 | 보관 기간 |
|------|-----------|
| 기본 | 24시간 |
| 최대 | 365일 |

### Enhanced Fan-Out
- 일반: 샤드 전체 2MB/s를 소비자들이 공유
- Enhanced Fan-Out: 소비자당 2MB/s 독립 처리량 (추가 비용)

## Kinesis Firehose

### 목적지
- Amazon S3
- Amazon Redshift (S3 경유)
- Amazon OpenSearch Service
- Splunk
- HTTP 엔드포인트

### 데이터 변환
```
소스 → Firehose → Lambda (변환: 필터링, 포맷 변환) → 목적지
```

> [!important] Firehose 지연 시간
> 최소 60초 또는 1MB 버퍼 → **Near-real-time** (실시간 아님)

## Kinesis Data Analytics

- SQL 또는 Apache Flink로 실시간 스트림 분석
- 입력: Kinesis Data Streams 또는 Firehose
- 출력: Kinesis Data Streams, Firehose, Lambda

### 사용 사례
- 실시간 집계 (초당 평균 클릭 수)
- 이상 탐지 (비정상 패턴 감지)
- 시간 윈도우 분석 (최근 5분 매출)

## Related Notes
- [[데이터분석-서비스]]
- [[메시징-이벤트처리]]
- [[Practice-분석-마이그레이션]]

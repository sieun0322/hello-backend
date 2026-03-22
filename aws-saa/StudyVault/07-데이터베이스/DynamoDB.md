---
tags: #database #dynamodb #nosql #serverless
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 3 & 2
keywords: DynamoDB, partition key, sort key, GSI, LSI, DAX, streams, TTL, global table, WCU, RCU
---
# DynamoDB

## 기본 개념

### 키 구조
| 키 유형 | 구성 | 특징 |
|---------|------|------|
| 파티션 키만 | 단순 기본 키 | 파티션 키가 고유해야 함 |
| 파티션 키 + 정렬 키 | 복합 기본 키 | 같은 파티션에 여러 항목 가능 |

> [!important] 파티션 키 설계
> **카디널리티(고유값)가 높은** 속성을 파티션 키로 → 핫 파티션 방지
> 예: userId (좋음) vs status (나쁨)

### 인덱스
| 인덱스 | 파티션 키 | 정렬 키 | 생성 시점 | 수 |
|--------|-----------|---------|-----------|-----|
| LSI (Local) | 테이블과 동일 | 다른 속성 | 테이블 생성 시만 | 5개 |
| GSI (Global) | 다른 속성 | 다른 속성 | 언제든 | 20개 |

> [!tip] LSI vs GSI
> LSI: 같은 파티션 키, 다른 정렬 키 → **강한 일관성** 가능
> GSI: 완전 다른 키 → 항상 **최종 일관성**

## 용량 모드

| 모드 | 과금 방식 | 적합 사용 사례 |
|------|-----------|----------------|
| 프로비저닝 (기본) | WCU/RCU 사전 설정 | 예측 가능한 트래픽 |
| 온디맨드 | 요청당 과금 | 예측 불가, 스파이크 트래픽 |

### WCU / RCU 계산
```
WCU: 초당 1KB 쓰기 = 1 WCU
     2KB 쓰기/초 → 2 WCU 필요

RCU (강한 일관성): 초당 4KB 읽기 = 1 RCU
RCU (최종 일관성): 초당 8KB 읽기 = 1 RCU (절반 비용)
```

## DAX (DynamoDB Accelerator)

```
앱 → DAX 클러스터 (인메모리 캐시) → DynamoDB
         ↑
    마이크로초 응답 (vs 밀리초)
```

- 읽기 집약적 워크로드 최적화
- DAX는 **강한 일관성 읽기 불지원** (캐시 특성)
- 쓰기는 캐시에 저장 후 DynamoDB 전파

> [!tip] DAX vs ElastiCache
> DAX: DynamoDB 전용, API 변경 없음
> ElastiCache: 범용 캐시, 애플리케이션 코드 변경 필요

## DynamoDB Streams

```
DynamoDB 변경 → Stream (24시간 보관)
                    ↓
              Lambda 트리거 → 집계/알림/복제
```

- 항목 수준 변경 사항 스트림
- 교차 리전 복제에 활용 (글로벌 테이블 기반)

## TTL (Time To Live)

- 항목에 만료 시간 설정 → 자동 삭제
- 비용 없음 (삭제 오버헤드 없음)
- 만료 후 **48시간 이내** 삭제 (즉시 아님)

> [!tip] 세션 데이터 관리
> 사용자 세션을 DynamoDB에 저장 + TTL로 자동 정리

## 시험 함정

> [!warning]- DynamoDB 함정
> - **GSI**: 쓰기 시 추가 WCU 소비 (인덱스 업데이트)
> - **강한 일관성**: 추가 RCU 소비 (2배)
> - **ProvisionedThroughputExceededException**: WCU/RCU 초과 → Auto Scaling 또는 온디맨드 전환
> - **핫 파티션**: 특정 파티션에 집중 → 파티션 키 분산 설계
> - **DAX**: 쓰기 성능 향상 아님 → 읽기 전용

## Related Notes
- [[RDS-Aurora]]
- [[데이터베이스-HA]]
- [[캐싱전략]]
- [[Practice-데이터베이스]]

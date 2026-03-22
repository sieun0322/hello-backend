---
tags: #dashboard #quick-reference #cheatsheet
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
---
# Quick Reference — SAA-C03 핵심 요약

## 스토리지 선택 가이드 → [[S3-완전가이드]] [[EBS-EFS-FSx]]

```
블록 스토리지 (DB, OS)
├── 단일 EC2 연결 → EBS (gp3 권장)
├── 고성능 DB → io2 Block Express
├── 최고 IOPS (임시) → 인스턴스 스토어
└── 다중 EC2 공유 (Linux) → EFS
                   (Windows) → FSx for Windows
                   (HPC/ML) → FSx for Lustre

객체 스토리지 → S3
아카이브 → Glacier
```

## S3 스토리지 클래스 선택 → [[스토리지-비용최적화]]

```
자주 접근 → Standard
가끔 접근 (빠른 검색) → Standard-IA
접근 패턴 불예측 → Intelligent-Tiering
재생성 가능, 저비용 → One Zone-IA
아카이브, 즉시 검색 필요 → Glacier Instant Retrieval
아카이브, 분~시간 OK → Glacier Flexible
7~10년 보관 → Glacier Deep Archive
```

## 데이터베이스 선택 가이드 → [[RDS-Aurora]] [[DynamoDB]]

```
관계형 DB (OLTP) → RDS / Aurora
  ├── MySQL/PostgreSQL 호환, 고성능 → Aurora
  ├── 오픈소스 → RDS MySQL/PostgreSQL
  └── 라이선스 DB → RDS Oracle/SQL Server

NoSQL (키-값, 문서) → DynamoDB
시계열 → Timestream
그래프 → Neptune
문서 DB (MongoDB 호환) → DocumentDB

분석 (OLAP) → Redshift
인메모리 캐시 → ElastiCache Redis/Memcached
인메모리 DB (영구) → MemoryDB for Redis
```

## EC2 구매 옵션 → [[EC2-구매옵션]]

```
단기/예측 불가 → On-Demand
24/7 장기 → Reserved (1년/3년)
유연한 할인 → Savings Plan
내결함성 배치 → Spot (90% 할인)
BYOL 라이선스 → Dedicated Host
```

## 로드밸런서 선택 → [[로드밸런서-ALB-NLB]]

```
HTTP/HTTPS, 경로/호스트 라우팅 → ALB
TCP/UDP, 정적 IP, 고성능 → NLB
방화벽 어플라이언스 인라인 → GLB
```

## 메시징 선택 → [[메시징-이벤트처리]]

```
비동기 작업 큐 → SQS
  └── 순서 보장 → SQS FIFO
알림/Pub-Sub → SNS
실시간 스트리밍 → Kinesis Data Streams
스트림 → S3/Redshift 로드 → Kinesis Firehose
워크플로우 오케스트레이션 → Step Functions
이벤트 기반 아키텍처 → EventBridge
```

## VPC 연결 → [[VPC-완전가이드]]

```
온프레미스 연결
├── 빠른 설정, 임시 → Site-to-Site VPN
├── 안정적 전용선 → Direct Connect
└── DX 백업 → VPN 동시 사용

VPC 간 연결
├── 소수 VPC (1:1) → VPC Peering
└── 다수 VPC (Hub&Spoke) → Transit Gateway

프라이빗 → AWS 서비스
├── S3, DynamoDB → Gateway Endpoint (무료)
└── 기타 서비스 → Interface Endpoint (PrivateLink)
```

## DR 전략 선택 → [[재해복구-DR]]

```
비용 최우선, RTO/RPO 유연 → Backup & Restore
저비용, 분 단위 RTO → Pilot Light
분 단위 RTO, 항상 준비 → Warm Standby
RPO≈0, RTO≈0 → Multi-Site Active-Active
```

## 보안 서비스 역할 → [[보안모니터링]]

```
API 감사 로그 → CloudTrail
설정 준수 평가 → Config
위협 탐지 → GuardDuty
취약점 스캔 → Inspector
PII 탐지 → Macie
L7 방화벽 → WAF
DDoS 보호 → Shield
암호화 키 → KMS
비밀번호 로테이션 → Secrets Manager
중앙 보안 대시보드 → Security Hub
```

## 데이터 이전 → [[데이터이전-서비스]]

```
파일 이전 (온프레미스↔AWS) → DataSync
물리 대용량 이전 → Snowball
하이브리드 스토리지 통합 → Storage Gateway
DB 마이그레이션 → DMS
서버 이전 (리프트앤시프트) → MGN
```

## 분석 서비스 → [[데이터분석-서비스]]

```
서버리스 SQL on S3 → Athena
ETL + 메타데이터 카탈로그 → Glue
대규모 Spark/Hadoop → EMR
데이터 레이크 거버넌스 → Lake Formation
DW 쿼리 → Redshift
실시간 스트림 분석 → Kinesis Analytics
검색 & 로그 분석 → OpenSearch
BI 대시보드 → QuickSight
```

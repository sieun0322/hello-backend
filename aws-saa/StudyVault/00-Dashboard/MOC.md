---
tags: #moc #dashboard #saa-c03
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
---
# SAA-C03 StudyVault — 학습 지도 (MOC)

> **소스**: SAA-C03 Examtopics V18.35 (한국어) — 725문제 기반
> **목표**: AWS Certified Solutions Architect – Associate 합격

---

## 시험 도메인 구조

| 도메인 | 출제 비중 | 주요 폴더 |
|--------|-----------|-----------|
| Domain 1: 보안 설계 | **30%** | [[01-보안-설계]] |
| Domain 2: 회복탄력성 설계 | **26%** | [[02-회복탄력성]] |
| Domain 3: 고성능 설계 | **24%** | [[03-고성능]] |
| Domain 4: 비용 최적화 설계 | **20%** | [[04-비용최적화]] |

---

## 개념 노트 맵

### 🔒 Domain 1 — 보안 설계 (30%)
- [[IAM-권한관리]] — IAM 역할/정책/SCP/Cognito/SAML
- [[암호화-KMS-SecretsManager]] — KMS, 봉투암호화, SSE, Secrets Manager
- [[네트워크보안-VPC]] — 보안그룹, NACL, WAF, Shield, VPC Endpoint
- [[보안모니터링]] — CloudTrail, Config, GuardDuty, Inspector, Security Hub

### 🔄 Domain 2 — 회복탄력성 (26%)
- [[고가용성-패턴]] — ASG, ALB/NLB, Multi-AZ, 스케일링 정책
- [[재해복구-DR]] — RTO/RPO, Pilot Light, Warm Standby, S3 복제
- [[데이터베이스-HA]] — RDS Multi-AZ, Aurora, DynamoDB 글로벌 테이블

### ⚡ Domain 3 — 고성능 (24%)
- [[컴퓨팅-스케일링]] — EC2 패밀리, 배치 그룹, Lambda, ECS/EKS
- [[캐싱전략]] — ElastiCache, DAX, CloudFront, Lazy Loading
- [[서버리스-아키텍처]] — API Gateway, Step Functions, EventBridge, Fargate
- [[메시징-이벤트처리]] — SQS, SNS, Kinesis, MSK, EventBridge

### 💰 Domain 4 — 비용 최적화 (20%)
- [[EC2-구매옵션]] — On-Demand, Reserved, Spot, Savings Plan, Dedicated
- [[스토리지-비용최적화]] — S3 스토리지 클래스, Lifecycle, EBS gp3

### 💾 스토리지
- [[S3-완전가이드]] — 버킷, 버전관리, 암호화, Transfer Acceleration, Select
- [[EBS-EFS-FSx]] — gp3/io2, 인스턴스 스토어, EFS(NFS), FSx(Windows/Lustre)
- [[데이터이전-서비스]] — DataSync, Snowball, Storage Gateway, DMS, MGN

### 🌐 네트워킹
- [[VPC-완전가이드]] — 서브넷, NAT, VPC 피어링, Transit Gateway, DX
- [[로드밸런서-ALB-NLB]] — ALB(L7), NLB(L4), GLB, Cross-Zone, Draining
- [[Route53-DNS]] — 라우팅 정책, Alias, 헬스체크, TTL
- [[CloudFront-CDN]] — OAC, Lambda@Edge, Functions, 서명된 URL

### 🗄️ 데이터베이스
- [[RDS-Aurora]] — Multi-AZ, 읽기복제본, Aurora Serverless, RDS Proxy
- [[DynamoDB]] — 파티션 키, GSI/LSI, DAX, Streams, TTL, 글로벌 테이블
- [[분석DB-Redshift]] — Redshift, Spectrum, ElastiCache Redis/Memcached, MemoryDB

### 📊 분석 & 마이그레이션
- [[Kinesis-실시간분석]] — Data Streams, Firehose, Data Analytics, Enhanced Fan-Out
- [[데이터분석-서비스]] — Glue, Athena, EMR, Lake Formation, OpenSearch, QuickSight
- [[마이그레이션-서비스]] — 7R, DMS, MGN, Application Discovery, Migration Hub

---

## 연습 문제 파일

| 도메인 | 문제 수 | 링크 |
|--------|---------|------|
| 보안 설계 | 60문제 | [[Practice-보안]] |
| 회복탄력성 | 60문제 | [[Practice-회복탄력성]] |
| 고성능 | 60문제 | [[Practice-고성능]] |
| 비용 최적화 | 60문제 | [[Practice-비용최적화]] |
| 스토리지 | 60문제 | [[Practice-스토리지]] |
| 네트워킹 | 60문제 | [[Practice-네트워킹]] |
| 데이터베이스 | 60문제 | [[Practice-데이터베이스]] |
| 분석/마이그레이션 | 60문제 | [[Practice-분석-마이그레이션]] |

**총 480문제 (전체 725문제 중 중복 포함 분류)**

---

## 학습 도구
- [[Quick-Reference]] — 핵심 서비스 비교 요약
- [[Exam-Traps]] — 시험 함정 모음

---

## 취약 영역 추적

| 영역 | 상태 | 마지막 학습 |
|------|------|-------------|
| VPC 네트워킹 | 🔴 미학습 | - |
| 재해 복구 전략 | 🔴 미학습 | - |
| 스토리지 클래스 선택 | 🔴 미학습 | - |
| 서버리스 패턴 | 🔴 미학습 | - |
| 데이터베이스 선택 | 🔴 미학습 | - |

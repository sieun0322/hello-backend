---
tags: #dashboard #exam-traps #pitfalls
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
---
# Exam Traps — 시험 함정 모음

> 실제 시험 문제에서 자주 틀리는 포인트들. 각 함정은 개념 노트와 연결됨.

---

## 🔒 IAM & 보안 → [[IAM-권한관리]] [[암호화-KMS-SecretsManager]]

> [!warning]- IAM 핵심 함정
> - **Permission Boundary**: 권한 **추가**가 아니라 최대 권한 **제한**
> - **SCP**: IAM Allow + SCP Allow 둘 다 있어야 허용 (교집합)
> - **SCP**: 관리 계정(루트)에는 적용 안 됨
> - **EC2/Lambda**: 액세스 키 하드코딩 금지 → IAM 역할 사용
> - **Cognito User Pool**: 인증 (JWT) / Identity Pool: AWS 리소스 권한 부여

> [!warning]- 암호화 핵심 함정
> - **KMS 4KB 한도**: 큰 데이터는 봉투 암호화 (DEK)
> - **SSE-C**: AWS에 키 저장 안 함, 요청마다 키 전달, HTTPS 필수
> - **RDS 암호화**: 생성 시에만, 이후 변경 불가 → 스냅샷 복사로 우회
> - **Secrets Manager**: 자동 로테이션 O / Parameter Store: 직접 구현

---

## 🌐 VPC & 네트워킹 → [[VPC-완전가이드]] [[네트워크보안-VPC]]

> [!warning]- VPC 핵심 함정
> - **NACL**: Stateless → 인바운드 허용 + 아웃바운드 허용 **둘 다** 필요
> - **보안 그룹**: Deny 규칙 없음 → IP 차단은 NACL로
> - **NAT GW**: AZ당 1개, 교차 AZ 트래픽 비용 발생
> - **VPC Peering**: 전이적 라우팅 불가 (A↔B, B↔C ≠ A↔C)
> - **게이트웨이 엔드포인트**: S3/DynamoDB 전용, 무료
> - **Direct Connect**: 암호화 없음 → IPsec VPN 오버레이 추가

> [!warning]- Route 53 함정
> - **Zone Apex**: CNAME 불가 → Alias 레코드 사용
> - **Geolocation vs Latency**: 위치 기반 vs 실제 지연시간 기반
> - **Failover**: 헬스 체크 없으면 작동 안 함
> - **TTL**: 변경 후 TTL 시간만큼 캐시 지속

---

## 💾 스토리지 → [[S3-완전가이드]] [[EBS-EFS-FSx]]

> [!warning]- S3 함정
> - **버킷 이름**: 전역 고유 (리전과 무관)
> - **CRR/SRR**: 버전관리 필수, 기존 객체 미복제 (신규만)
> - **멀티파트**: 완료 API 호출 안 하면 불완전 파트 과금
> - **One Zone-IA**: AZ 장애 시 데이터 소멸 → 재생성 가능 데이터만
> - **Glacier Instant vs Flexible**: Instant는 즉시 검색, Flexible은 분~시간

> [!warning]- EBS/EFS 함정
> - **EBS**: 단일 AZ 제약, 다른 AZ → 스냅샷 필요
> - **EFS**: Linux/NFS 전용 → Windows는 FSx for Windows
> - **인스턴스 스토어**: 중지/종료 시 데이터 소멸
> - **gp2 vs gp3**: gp2는 크기에 IOPS 종속, gp3는 독립 설정

---

## 🗄️ 데이터베이스 → [[RDS-Aurora]] [[DynamoDB]]

> [!warning]- RDS 함정
> - **Multi-AZ Standby**: 읽기/쓰기 불가, 순수 대기 전용
> - **읽기 복제본**: 비동기 복제 → 약간의 지연 (eventual consistency)
> - **RDS 암호화 변경**: 불가 → 스냅샷 암호화 복사 → 새 DB 복원
> - **Aurora 장애 조치**: 30초 (RDS Multi-AZ: 60-120초)

> [!warning]- DynamoDB 함정
> - **GSI**: 추가 WCU 소비
> - **강한 일관성**: RCU 2배 소비
> - **DAX**: 읽기만 가속, 쓰기 성능 향상 아님
> - **LSI**: 테이블 생성 시에만 설정 가능

---

## ⚡ 컴퓨팅 & 서버리스 → [[컴퓨팅-스케일링]] [[서버리스-아키텍처]]

> [!warning]- Lambda 함정
> - **15분 제한**: 장기 작업 → ECS, Step Functions
> - **API Gateway 타임아웃**: 29초 (Lambda 15분과 다름)
> - **콜드 스타트**: 프로비저닝된 동시성으로 해결 (추가 비용)
> - **Lambda → RDS**: RDS Proxy로 연결 풀링 (연결 폭발 방지)

> [!warning]- EC2 구매 옵션 함정
> - **24/7 워크로드**: Reserved (Spot은 중단 가능)
> - **Dedicated Host vs Instance**: Host만 물리 서버 제어 (BYOL)

---

## 📨 메시징 → [[메시징-이벤트처리]]

> [!warning]- SQS/SNS 함정
> - **SQS 가시성 타임아웃**: 처리 시간보다 길게 설정 필수
> - **SQS 메시지 크기**: 256KB 제한 → 큰 데이터는 S3 + SQS 포인터
> - **SNS → Lambda 직접**: 동시성 폭발 → SNS → SQS → Lambda 패턴 권장
> - **Kinesis Firehose**: 최소 60초 버퍼 → Near-real-time (실시간 아님)

---

## 💰 비용 최적화 → [[EC2-구매옵션]] [[스토리지-비용최적화]]

> [!warning]- 비용 함정
> - **Intelligent-Tiering**: 128KB 미만 객체엔 비효율 (모니터링 비용)
> - **Glacier 최소 보관**: 90일 미만 삭제 시 잔여 기간 요금
> - **Standard → Standard-IA**: 최소 30일 유지 후 이동 가능
> - **EBS**: 인스턴스 종료 후에도 과금 → 스냅샷 후 삭제

---

## 🔄 DR & HA → [[재해복구-DR]] [[고가용성-패턴]]

> [!warning]- DR 함정
> - **Pilot Light ≠ Warm Standby**: Pilot은 최소 실행, Warm은 축소 실행
> - **CRR 기존 객체**: 복제 안 됨 → S3 Batch Replication 별도 설정
> - **Aurora Global**: < 1초 복제, 보조 리전 승격 < 1분
> - **ALB**: 최소 2개 AZ 필요

## Related Notes
- [[MOC]]
- [[Quick-Reference]]

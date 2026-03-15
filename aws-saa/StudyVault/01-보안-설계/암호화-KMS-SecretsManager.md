---
tags: #security #encryption #kms #secrets-manager
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 1 - Design Secure Architectures
keywords: KMS, CMK, envelope encryption, SSE-S3, SSE-KMS, SSE-C, Secrets Manager, Parameter Store, ACM, CloudHSM
---
# 암호화: KMS & Secrets Manager

## AWS KMS 핵심

### 키 유형 비교
| 유형 | 관리자 | 비용 | 용도 |
|------|--------|------|------|
| AWS 관리형 키 | AWS | 무료 | S3, RDS 기본 암호화 |
| 고객 관리형 키(CMK) | 고객 | $1/월 | 세밀한 제어, 키 로테이션 |
| 고객 제공 키 | 고객 | 무료 | 직접 키 가져와 사용 |

### 봉투 암호화 (Envelope Encryption)
```
평문 데이터 → 데이터 키(DEK)로 암호화 → 암호화된 데이터
데이터 키 → CMK로 암호화 → 암호화된 데이터 키 (저장)
```

> [!important] KMS 한도
> KMS 직접 암호화: 최대 **4KB**
> 4KB 초과 → 봉투 암호화 사용

## S3 암호화 옵션

### 서버 측 암호화 (SSE)
| 방식 | 키 관리 | 특징 |
|------|---------|------|
| SSE-S3 | AWS (자동) | 헤더: `x-amz-server-side-encryption: AES256` |
| SSE-KMS | KMS CMK | 감사 추적, 키 제어 가능, CloudTrail 기록 |
| SSE-C | 고객 | 키를 직접 전달, HTTPS 필수 |
| DSSE-KMS | KMS (이중) | 규정 준수용 이중 암호화 |

> [!tip] 시험 패턴
> "감사 추적이 필요한 암호화" → SSE-KMS
> "키를 완전히 고객이 관리" → SSE-C
> "간단한 암호화, 관리 불필요" → SSE-S3

### 클라이언트 측 암호화
- 데이터를 S3 업로드 **전에** 클라이언트에서 암호화
- AWS SDK + KMS 사용

## Secrets Manager vs Parameter Store

| 항목 | Secrets Manager | Parameter Store |
|------|-----------------|-----------------|
| 비용 | 유료 ($0.40/시크릿/월) | 기본 무료, 고급 유료 |
| 자동 로테이션 | ✅ 기본 지원 (Lambda) | ❌ 직접 구현 |
| 크기 | 최대 64KB | 최대 8KB (표준) |
| 주요 용도 | DB 비밀번호, API 키 자동 로테이션 | 설정값, 환경변수 |
| 교차 계정 | 지원 | 제한적 |

> [!important] 시험 핵심
> "자동으로 DB 비밀번호 로테이션" → **Secrets Manager**
> "환경 설정값, 비용 최소화" → **Parameter Store**

## ACM (AWS Certificate Manager)

- SSL/TLS 인증서 무료 발급 및 자동 갱신
- **ALB, CloudFront, API Gateway**에서 사용
- EC2에 직접 설치 불가 (ALB를 통해 우회)

> [!tip] EC2에 SSL 적용
> EC2 → ALB → ACM 인증서 (ALB에서 SSL 종료)

## CloudHSM vs KMS

| 항목 | KMS | CloudHSM |
|------|-----|----------|
| 관리 | AWS 관리 | 고객 전용 HSM |
| 표준 | FIPS 140-2 Level 2 | FIPS 140-2 Level 3 |
| 멀티 테넌트 | 예 | 아니오 (전용) |
| 비용 | 저렴 | 고가 ($1.45/시간) |
| 용도 | 일반 암호화 | 엄격한 규정 준수 |

## 시험 함정

> [!warning]- 암호화 함정 모음
> - **KMS 4KB 제한**: 큰 데이터는 봉투 암호화
> - **SSE-C**: 키를 AWS에 저장 안 함, 매 요청마다 전달
> - **RDS 암호화**: 생성 시에만 설정 가능 (스냅샷 복사로 변환)
> - **EBS 암호화**: 암호화된 스냅샷 복호화 불가
> - **Secrets Manager 로테이션**: Lambda 사용 (자동 내장)

## Related Notes
- [[IAM-권한관리]]
- [[보안모니터링]]
- [[S3-완전가이드]]
- [[Practice-보안]]

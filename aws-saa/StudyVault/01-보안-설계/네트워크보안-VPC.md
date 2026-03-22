---
tags: #security #network-security #vpc #waf #shield
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 1 - Design Secure Architectures
keywords: WAF, Shield, security group, NACL, VPC endpoint, PrivateLink, GuardDuty, Macie
---
# 네트워크 보안

## 보안 그룹 vs NACL

| 항목 | 보안 그룹 | NACL |
|------|-----------|------|
| 적용 레벨 | 인스턴스 수준 | 서브넷 수준 |
| 상태 | Stateful (응답 자동 허용) | Stateless (인바운드/아웃바운드 별도) |
| 규칙 | 허용만 | 허용 + 거부 |
| 평가 | 모든 규칙 평가 | 번호 순서대로 (첫 매치) |
| 기본값 | 모든 아웃바운드 허용 | 모든 트래픽 허용 |

> [!tip] NACL 사용 시나리오
> "특정 IP를 **차단(Block)**" → NACL (Deny 규칙 지원)
> 보안 그룹은 Deny 불가, NACL만 가능

## WAF (Web Application Firewall)

- **L7 레벨** 보호: SQL Injection, XSS, 악성 봇 차단
- 적용 대상: **ALB, CloudFront, API Gateway, Cognito**
- Web ACL + 규칙 그룹 (AWS 관리형 / 커스텀)
- Rate-based 규칙: IP별 요청 속도 제한

> [!important] WAF ≠ Shield
> WAF: L7 애플리케이션 공격 방어
> Shield: DDoS 공격 방어

## AWS Shield

| 티어 | 비용 | 보호 범위 |
|------|------|-----------|
| Shield Standard | 무료 (자동) | L3/L4 DDoS 기본 보호 |
| Shield Advanced | $3,000/월 | L7 포함, DRT 팀 지원, 비용 보상 |

> [!tip] Shield Advanced 대상
> EC2, ELB, CloudFront, Route 53, Global Accelerator

## VPC 엔드포인트

### 유형 비교
| 유형 | 서비스 | 특징 |
|------|--------|------|
| 게이트웨이 엔드포인트 | S3, DynamoDB | 라우팅 테이블 기반, 무료 |
| 인터페이스 엔드포인트 | 대부분의 AWS 서비스 | ENI 기반, 유료 |

> [!important] 시험 핵심
> "프라이빗 서브넷 EC2 → S3/DynamoDB (NAT 없이)" → **게이트웨이 엔드포인트**
> "온프레미스 → AWS 서비스 (VPN/Direct Connect 통해)" → **인터페이스 엔드포인트**

### PrivateLink
- 자체 서비스를 다른 VPC에 비공개로 노출
- NLB → PrivateLink → 소비자 VPC

## GuardDuty
- **지능형 위협 탐지** (머신러닝)
- 입력 소스: CloudTrail, VPC Flow Logs, DNS 쿼리
- 활성화만 하면 됨 (에이전트 불필요)

> [!warning] GuardDuty ≠ CloudTrail
> GuardDuty: 위협 **탐지** (악의적 활동)
> CloudTrail: API 호출 **감사**

## Macie
- S3 데이터에서 **민감 정보(PII) 자동 탐지**
- 신용카드, 주민번호, 개인정보 감지
- 머신러닝 기반

## Related Notes
- [[IAM-권한관리]]
- [[VPC-완전가이드]]
- [[보안모니터링]]
- [[Practice-보안]]

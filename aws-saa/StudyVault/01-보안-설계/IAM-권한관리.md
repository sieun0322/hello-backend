---
tags: #security #iam #identity #access-management
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 1 - Design Secure Architectures
keywords: IAM, role, policy, SCP, Organizations, Cognito, SAML, OIDC, permission boundary
---
# IAM 권한 관리

## IAM 기본 개념

### 자격 증명 유형 비교
| 유형 | 용도 | 특징 |
|------|------|------|
| IAM 사용자 | 개인 장기 자격 증명 | 액세스 키 발급 가능 |
| IAM 역할(Role) | 임시 자격 증명, EC2/Lambda/교차계정 | STS 토큰 발급 |
| IAM 그룹 | 사용자 집합 정책 관리 | 역할 할당 불가 |
| 루트 계정 | 최고 권한 | MFA 필수, 일상 사용 금지 |

### 정책 유형
```
신뢰 정책 (Trust Policy)       → 역할을 맡을 수 있는 주체 정의
권한 정책 (Permission Policy)  → 허용/거부 액션 정의
경계 정책 (Permission Boundary)→ 최대 권한 제한 (상한선)
SCPs (Service Control Policies)→ Organizations 단위 제어
```

> [!important] 평가 순서
> **명시적 거부(Deny) > 허용(Allow) > 기본 거부**
> SCP는 IAM 정책을 덮어쓰지 않고 교집합 적용

## IAM 역할 패턴

### EC2 인스턴스 역할
```
EC2 → 인스턴스 프로파일 → IAM 역할 → 임시 자격 증명 자동 갱신
```
> [!tip] 액세스 키를 EC2에 하드코딩하지 말 것 → 역할 사용

### 교차 계정 역할 (Cross-Account)
```
계정A(신뢰자) ──sts:AssumeRole──> 계정B의 역할
                                    ↓
                              계정B 리소스 접근
```

### Lambda 실행 역할
- Lambda 함수마다 실행 역할(Execution Role) 지정
- 최소 권한 원칙 적용

## AWS Organizations & SCP

```
Root
 └── Management Account
      ├── OU: Production
      │    └── 계정들 (SCP 적용됨)
      └── OU: Development
           └── 계정들 (다른 SCP)
```

> [!warning] SCP 주의사항
> - SCP는 루트/관리 계정에는 적용 안 됨
> - **FullAWSAccess SCP 제거** → 모든 액세스 차단
> - IAM Allow + SCP Allow 둘 다 있어야 허용

## Cognito

### 사용자 풀 (User Pool)
- 애플리케이션 사용자 인증 (회원가입/로그인)
- JWT 토큰 발급

### 자격 증명 풀 (Identity Pool)
- 인증된 사용자에게 **임시 AWS 자격 증명** 부여
- S3, DynamoDB 등 AWS 리소스 직접 접근

> [!tip] 패턴
> User Pool(인증) → Identity Pool(AWS 권한 부여)

## SAML 2.0 / OIDC 페더레이션

```
기업 IdP (ADFS, Okta) ──SAML Assertion──> STS AssumeRoleWithSAML
                                             ↓
                                        임시 AWS 자격 증명
```

> [!important] 시험 포인트
> - 기업 AD 연동: SAML 2.0
> - 웹/모바일 앱: OIDC (Google, Facebook)
> - Custom IdP: Identity Pool

## 시험 함정

> [!warning]- IAM 함정 모음
> - **역할 vs 사용자**: EC2/Lambda엔 역할, 사람엔 사용자
> - **Permission Boundary**: 권한 부여가 아니라 상한 제한
> - **SCP ≠ 권한 부여**: SCP는 허용 범위만 제한
> - **루트 계정**: MFA, 액세스 키 생성 금지
> - **인스턴스 프로파일**: EC2에 역할 연결하는 컨테이너

## Related Notes
- [[암호화-KMS-SecretsManager]]
- [[네트워크보안-VPC]]
- [[보안모니터링]]
- [[Practice-보안]]

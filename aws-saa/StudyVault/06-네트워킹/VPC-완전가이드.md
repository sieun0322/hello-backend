---
tags: #networking #vpc #subnet #nat #transit-gateway
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 1 & 2
keywords: VPC, subnet, CIDR, internet gateway, NAT gateway, VPC peering, Transit Gateway, Direct Connect, VPN, VPC endpoint, PrivateLink, Flow Logs
---
# VPC 완전 가이드

## VPC 기본 구조

```
VPC (리전 범위, CIDR: 예 10.0.0.0/16)
├── 퍼블릭 서브넷 (AZ-a, 10.0.1.0/24)
│   ├── EC2 (퍼블릭 IP)
│   └── NAT 게이트웨이
├── 프라이빗 서브넷 (AZ-a, 10.0.2.0/24)
│   └── EC2 (프라이빗 IP만)
└── 인터넷 게이트웨이 (VPC에 연결)
```

### 서브넷 종류
| 유형 | 라우팅 | 인터넷 접근 |
|------|--------|-------------|
| 퍼블릭 | IGW → 0.0.0.0/0 | 직접 가능 |
| 프라이빗 | NAT GW → 0.0.0.0/0 | NAT 통해 아웃바운드만 |
| 격리(Isolated) | 로컬 라우팅만 | 없음 |

## NAT 게이트웨이 vs NAT 인스턴스

| 항목 | NAT 게이트웨이 | NAT 인스턴스 |
|------|----------------|--------------|
| 관리 | AWS 관리 | 직접 관리 |
| HA | 자동 (AZ 내) | 직접 구성 |
| 대역폭 | 45 Gbps까지 자동 확장 | 인스턴스 유형 제한 |
| 비용 | 높음 | 낮음 |
| 보안 그룹 | 연결 불가 | 연결 가능 |
| Bastion 역할 | ❌ | ✅ |

> [!important] NAT GW 고가용성
> NAT GW는 AZ당 1개 → 각 AZ에 별도 NAT GW + 별도 라우팅 테이블

## VPC 피어링 vs Transit Gateway

| 항목 | VPC 피어링 | Transit Gateway |
|------|------------|-----------------|
| 연결 구조 | 1:1 | Hub & Spoke (스타형) |
| 전이적 라우팅 | ❌ (A↔B, B↔C ≠ A↔C) | ✅ |
| 관리 복잡성 | N*(N-1)/2 연결 | 단일 TGW |
| 교차 계정 | ✅ | ✅ |
| 교차 리전 | ✅ | ✅ (TGW 피어링) |

> [!important] 전이적 라우팅
> VPC Peering: A-B, B-C 있어도 A→C 불가
> Transit Gateway: 모든 VPC 상호 통신 가능

## 온프레미스 연결

### Site-to-Site VPN
```
온프레미스 ──IPsec VPN 터널──> Virtual Private Gateway (VGW) → VPC
```
- 인터넷을 통한 암호화 연결
- 대역폭: 최대 1.25 Gbps
- 빠른 설정 (분~시간)

### AWS Direct Connect (DX)
```
온프레미스 ──전용 전용선──> DX 위치 ──> VPC
```
- 전용 물리 연결 (인터넷 미사용)
- 일관된 대역폭, 낮은 지연시간
- 설정 시간: 수 주~수 개월
- **암호화 없음** (추가 시 VPN 오버레이)

> [!tip] VPN vs Direct Connect
> "즉시 연결, 임시" → VPN
> "고대역폭, 낮은 지연, 안정적" → Direct Connect
> "DR용 백업 연결" → VPN을 DX 백업으로

### Direct Connect Gateway
- 단일 DX로 **여러 리전**의 VPC 연결
- 글로벌 네트워크 구성에 사용

## VPC 엔드포인트

| 유형 | 서비스 | 특징 |
|------|--------|------|
| 게이트웨이 엔드포인트 | S3, DynamoDB | 라우팅 테이블 기반, 무료 |
| 인터페이스 엔드포인트 | 대부분의 AWS 서비스 | ENI 기반, 유료 |

## VPC Flow Logs

- VPC/서브넷/ENI 수준 트래픽 로그
- 허용/거부 모두 기록
- 목적지: CloudWatch Logs, S3, Kinesis Firehose
- 실시간 아님 (약간 지연)

## Related Notes
- [[로드밸런서-ALB-NLB]]
- [[Route53-DNS]]
- [[네트워크보안-VPC]]
- [[Practice-네트워킹]]

---
tags: #networking #route53 #dns #failover #latency
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 2 & 3
keywords: Route53, DNS, routing policy, health check, failover, latency, geolocation, weighted, alias
---
# Route 53 & DNS

## 라우팅 정책 비교

| 정책 | 동작 | 사용 사례 |
|------|------|-----------|
| 단순(Simple) | 단일 레코드 | 단일 리소스 |
| 가중치(Weighted) | 비율에 따라 분산 | A/B 테스트, 점진적 배포 |
| 지연 시간(Latency) | 가장 낮은 지연시간 리전 | 글로벌 성능 최적화 |
| 장애 조치(Failover) | Primary 장애 시 Secondary | DR 구성 |
| 지리적 위치(Geolocation) | 사용자 **위치** 기반 | 지역별 콘텐츠, 규정 준수 |
| 지리적 근접(Geoproximity) | 리소스 **위치** + 바이어스 | 트래픽 이동 세밀 제어 |
| 다중값 응답(Multivalue) | 여러 정상 IP 반환 | 간단한 로드밸런싱 |
| IP 기반(IP-based) | 클라이언트 IP 범위 | ISP 기반 라우팅 |

> [!important] Geolocation vs Latency
> Geolocation: 사용자의 **지리적 위치** (한국 사용자 → 한국 서버)
> Latency: 실제 **네트워크 지연시간** (한국 사용자가 일본 서버가 더 빠를 수 있음)

## Alias 레코드

- AWS 리소스(ALB, CloudFront, S3, Elastic IP 등)에 대한 CNAME 대안
- **Zone Apex (루트 도메인)**에서 사용 가능 (CNAME 불가)
- 무료 (표준 CNAME은 추가 DNS 쿼리 비용)

```
example.com → ALB (Alias 레코드로만 가능, CNAME 불가)
www.example.com → ALB (CNAME 또는 Alias 둘 다 가능)
```

## 헬스 체크

- HTTP/HTTPS/TCP 엔드포인트 모니터링
- 프라이빗 리소스: CloudWatch 알람 → Route 53 헬스 체크
- **계산된 헬스 체크**: 여러 헬스 체크를 AND/OR 조합

## TTL (Time To Live)

- DNS 레코드 캐시 시간
- **낮은 TTL**: DNS 변경이 빠르게 전파 (마이그레이션, 장애 조치 전 준비)
- **높은 TTL**: DNS 쿼리 수 감소, 비용 절감

> [!tip] 마이그레이션 전 TTL 낮추기
> 마이그레이션 전: TTL 낮춤 → 변경 후 빠른 전파 → 완료 후 TTL 높임

## 시험 함정

> [!warning]- Route 53 함정
> - **Alias vs CNAME**: Zone Apex(루트도메인)엔 Alias만
> - **장애 조치**: 헬스 체크 필수 (없으면 장애 조치 안 됨)
> - **TTL**: 레코드 변경 후 TTL 시간만큼 캐시 유지
> - **지리적 위치**: 기본 레코드 필요 (위치 미매핑 사용자 대비)
> - **Private Hosted Zone**: VPC에 연결해야 작동

## Related Notes
- [[CloudFront-CDN]]
- [[로드밸런서-ALB-NLB]]
- [[재해복구-DR]]
- [[Practice-네트워킹]]

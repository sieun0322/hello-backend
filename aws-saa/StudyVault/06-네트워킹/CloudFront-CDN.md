---
tags: #networking #cloudfront #cdn #edge #caching
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 2 & 3
keywords: CloudFront, CDN, distribution, origin, OAC, edge location, cache, TTL, Lambda@Edge, Functions, WAF, signed URL
---
# CloudFront (CDN)

## 기본 개념

```
사용자 → 가장 가까운 엣지 로케이션
    → (캐시 히트) → 즉시 응답
    → (캐시 미스) → 오리진 요청 → 캐시 저장
```

### 오리진 유형
| 오리진 | 특징 |
|--------|------|
| S3 버킷 | OAC로 프라이빗 접근, 업로드도 가능 |
| Custom Origin | ALB, EC2, API Gateway, HTTP 서버 |
| MediaStore, MediaPackage | 미디어 스트리밍 |

## S3 + CloudFront 보안

### OAC (Origin Access Control) - 권장
```
사용자 → CloudFront → OAC → S3 (퍼블릭 접근 차단)
```
- S3 버킷 정책에 CloudFront 서비스 주체 허용
- OAI (Origin Access Identity)의 후속 버전

> [!important] S3 퍼블릭 차단 + CloudFront
> S3를 비공개로 유지하면서 CloudFront를 통해서만 접근

## 캐싱 동작

### CloudFront TTL
- 기본 TTL: 24시간
- 최대 TTL: 1년
- 캐시 무효화: `/path/*` 패턴으로 특정 경로 무효화 (요금 발생)

> [!tip] 동적 vs 정적 콘텐츠
> 정적 (이미지, CSS): 높은 TTL
> 동적 (API 응답): TTL 0 또는 낮게

## 엣지 컴퓨팅

### Lambda@Edge
- CloudFront 이벤트에서 Lambda 실행
- 뷰어 요청/응답, 오리진 요청/응답 처리
- Node.js, Python 지원

### CloudFront Functions
- 경량, 밀리초 미만 응답
- Viewer Request/Response만 처리 (오리진 접근 불가)
- JavaScript만 지원
- Lambda@Edge보다 비용 저렴

> [!tip] Lambda@Edge vs CloudFront Functions
> 복잡한 로직, DB/외부 API 접근 → Lambda@Edge
> 간단한 헤더 조작, URL 리다이렉트 → CloudFront Functions

## 지리적 제한 (Geo Restriction)

- 국가 기준으로 접근 허용/차단
- Allowlist: 특정 국가만 허용
- Blocklist: 특정 국가 차단

## 서명된 URL vs 서명된 쿠키

| 항목 | 서명된 URL | 서명된 쿠키 |
|------|-----------|-------------|
| 적용 범위 | 단일 파일 | 여러 파일 |
| 사용 사례 | 특정 파일 임시 접근 | 구독자 콘텐츠 접근 |

## Global Accelerator vs CloudFront

| 항목 | Global Accelerator | CloudFront |
|------|-------------------|------------|
| 캐싱 | ❌ | ✅ |
| 대상 | EC2, ALB, NLB, Elastic IP | 정적/동적 HTTP 콘텐츠 |
| 프로토콜 | TCP, UDP | HTTP/HTTPS |
| 정적 IP | ✅ (Anycast) | ❌ |
| 용도 | 글로벌 앱 성능, 게임, IoT | 웹 CDN |

## 시험 함정

> [!warning]- CloudFront 함정
> - **S3 정적 웹사이트 URL**: OAC 사용 불가 → Custom Origin으로 설정
> - **실시간 데이터**: CloudFront 우회 (캐시 건너뜀)
> - **캐시 무효화**: /path/* 형태, 건당 과금
> - **WAF + CloudFront**: L7 보호를 엣지에서 (ALB WAF보다 빠름)

## Related Notes
- [[Route53-DNS]]
- [[S3-완전가이드]]
- [[로드밸런서-ALB-NLB]]
- [[Practice-네트워킹]]

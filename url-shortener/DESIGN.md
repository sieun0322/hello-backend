# URL Shortener 설계서

## 1. 프로젝트 개요

긴 URL을 짧은 코드로 변환하고, 해당 코드로 접근 시 원본 URL로 리다이렉트하는 서비스.
클릭 통계 기능을 제공한다.

### 1.1 핵심 기능

| 기능 | 설명 | 엔드포인트 |
|------|------|-----------|
| URL 단축 | 원본 URL → Snowflake ID 기반 코드 생성 | `POST /shorten` |
| 리다이렉트 | 짧은 코드 → 원본 URL 301 리다이렉트 | `GET /:code` |
| 클릭 통계 | 단축 URL별 클릭 수 조회 | `GET /stats/:code` |
| 헬스체크 | 서버 상태 확인 | `GET /health` |

### 1.2 기술 스택

- **언어:** Go 1.21
- **웹 프레임워크:** Gin v1.9.1
- **DB:** PostgreSQL (예정)
- **캐시:** Redis (예정)
- **컨테이너:** Docker (멀티스테이지 빌드)

---

## 2. 아키텍처

### 2.1 레이어 구조

```
Request → Handler → Service → Repository → DB
```

클린 아키텍처 기반 3계층 구조를 따른다.

| 레이어 | 역할 | 파일 |
|--------|------|------|
| **Handler** | HTTP 요청/응답 처리, 입력 검증 | `internal/handler/url_handler.go` |
| **Service** | 비즈니스 로직, 코드 생성 | `internal/service/url_service.go` |
| **Repository** | 데이터 접근 추상화 (인터페이스) | `internal/repository/url_repository.go` |
| **Model** | 도메인 모델, DTO 정의 | `internal/model/url.go` |

### 2.2 디렉토리 구조

```
url-shortener/
├── cmd/
│   └── main.go                  # 엔트리포인트, 라우터 설정
├── internal/
│   ├── handler/
│   │   └── url_handler.go       # HTTP 핸들러
│   ├── service/
│   │   └── url_service.go       # 비즈니스 로직
│   ├── repository/
│   │   └── url_repository.go    # 저장소 인터페이스 + 인메모리 구현
│   ├── idgen/
│   │   ├── snowflake.go         # Snowflake 분산 ID 생성기
│   │   ├── snowflake_test.go    # ID 생성기 테스트
│   │   └── base62.go            # Base62 인코딩
│   └── model/
│       └── url.go               # 도메인 모델
├── .env.example
├── Dockerfile
├── go.mod
└── go.sum
```

### 2.3 의존성 흐름

```
main.go
  └─ handler.NewURLHandler(workerID)
       ├─ repository.NewMemoryURLRepository()   ← URLRepository 인터페이스 구현
       ├─ idgen.NewSnowflake(workerID)          ← 분산 ID 생성기
       └─ service.NewURLService(repo, snowflake) ← 인터페이스 주입
```

Handler가 Service를 가지고, Service가 Repository와 Snowflake를 가진다.
Repository 구현체 교체(Memory → PostgreSQL)가 Service 코드 수정 없이 가능하다.

---

## 3. 데이터 모델

### 3.1 도메인 모델

```go
type URL struct {
    ID        int64      // PK, auto increment
    Code      string     // 단축 코드 (Snowflake Base62, ~10자리, unique)
    Original  string     // 원본 URL
    Clicks    int64      // 클릭 카운터
    CreatedAt time.Time  // 생성 시각
    ExpiresAt *time.Time // 만료 시각 (nullable, 미구현)
}
```

### 3.2 API 요청/응답

**POST /shorten**
```json
// Request
{ "url": "https://example.com/very/long/path" }

// Response (201 Created)
{
  "short_url": "http://localhost:8080/aRdGDeb09G",
  "code": "aRdGDeb09G"
}
```

**GET /:code**
```
HTTP 301 Moved Permanently
Location: https://example.com/very/long/path
```

**GET /stats/:code**
```json
// Response (200 OK)
{
  "code": "aRdGDeb09G",
  "original": "https://example.com/very/long/path",
  "clicks": 42,
  "created_at": "2025-02-05T12:00:00Z"
}
```

### 3.3 DB 스키마 (PostgreSQL, 예정)

```sql
CREATE TABLE urls (
    id         BIGSERIAL    PRIMARY KEY,
    code       VARCHAR(12)  UNIQUE NOT NULL,
    original   TEXT         NOT NULL,
    clicks     BIGINT       DEFAULT 0,
    created_at TIMESTAMPTZ  DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_urls_code ON urls(code);
```

---

## 4. 핵심 로직

### 4.1 코드 생성 알고리즘 - Snowflake + Base62

Twitter Snowflake 방식의 분산 ID 생성기를 사용한다.

#### 4.1.1 Snowflake ID 구조 (64비트)

```
 [1bit]     [41bit 타임스탬프]     [10bit 워커ID]   [12bit 시퀀스]
   0    | ms since 2025-01-01 |   0 ~ 1023     |   0 ~ 4095
```

| 필드 | 비트 | 범위 | 설명 |
|------|------|------|------|
| 부호 | 1 | 0 | 항상 양수 |
| 타임스탬프 | 41 | ~69년 | 커스텀 에포크(2025-01-01) 기준 밀리초 |
| 워커 ID | 10 | 0~1023 | 서버 인스턴스 식별자 |
| 시퀀스 | 12 | 0~4095 | 같은 밀리초 내 순번 |

#### 4.1.2 ID → 코드 변환

```
Snowflake (int64) → Base62 인코딩 → ~10자리 문자열
예: 146991093597081600 → "aRdGDeb09G"
```

- **문자셋:** `0-9`, `a-z`, `A-Z` (62종)
- **충돌:** 구조적으로 불가능 (타임스탬프 + 워커ID + 시퀀스 조합)
- **정렬:** 시간 순서 보장 (ID가 단조 증가)
- **처리량:** 워커당 ms당 4,096개 (초당 약 400만 개)
- **다중 인스턴스:** 최대 1,024대 동시 운영 가능

#### 4.1.3 동시성 제어

- `sync.Mutex`로 같은 인스턴스 내 스레드 안전 보장
- 같은 밀리초에 시퀀스 소진 시 다음 밀리초까지 spin-wait
- 시스템 시계 역행 시 `ErrClockMovedBack` 에러 반환

#### 4.1.4 테스트 커버리지

| 테스트 | 검증 항목 |
|--------|----------|
| `TestGenerate_Unique` | 10만 건 유일성 |
| `TestGenerate_Monotonic` | 1만 건 단조 증가 |
| `TestGenerate_ConcurrentUnique` | 10 goroutine × 1만 건 동시 유일성 |
| `TestDifferentWorkers_DifferentIDs` | 워커 간 ID 분리 |
| `TestBase62Encode` | 인코딩 정확성 |

### 4.2 리다이렉트 흐름

```
Client → GET /:code
           ↓
      Handler.Redirect()
           ↓
      Service.GetByCode(code)
           ↓
      Repository.FindByCode(code) → 없으면 404
           ↓
      go Service.RecordClick(code)  ← 비동기 (goroutine)
           ↓
      HTTP 301 → 원본 URL
```

클릭 카운트 증가는 goroutine으로 비동기 처리하여 리다이렉트 응답 속도에 영향을 주지 않는다.

### 4.3 Repository 인터페이스

```go
type URLRepository interface {
    Save(url *model.URL) error
    FindByCode(code string) (*model.URL, error)
    IncrementClicks(code string) error
}
```

현재 `MemoryURLRepository`로 구현. `sync.RWMutex`로 동시성 제어.

---

## 5. 현재 구현 상태

### 5.1 완료

- [x] 3계층 아키텍처 (Handler / Service / Repository)
- [x] Gin 라우터 + 4개 엔드포인트
- [x] 인메모리 Repository (개발용, mutex 동시성 제어)
- [x] Snowflake 분산 ID 생성기 + Base62 인코딩
- [x] ID 생성기 테스트 (유일성, 단조증가, 동시성, 워커 분리)
- [x] 비동기 클릭 카운트
- [x] 도메인 모델 + DTO
- [x] 멀티스테이지 Dockerfile
- [x] 환경변수 설정 (.env)

### 5.2 미구현 (TODO)

- [ ] PostgreSQL Repository 구현
- [ ] Redis 캐시 레이어 (코드 → URL 매핑 캐싱)
- [ ] URL 만료 기능 (ExpiresAt 필드 활용)
- [ ] 입력 URL 중복 검사 (같은 URL → 같은 코드)
- [ ] 단위 테스트 / 통합 테스트
- [ ] Rate Limiting
- [ ] Graceful Shutdown
- [ ] docker-compose.yml (PostgreSQL + Redis)
- [ ] GitHub Actions CI/CD

---

## 6. 확장 계획

### 6.1 Phase 1 - DB 연동

```
Repository 인터페이스 유지, PostgreSQL 구현체 추가
├── internal/repository/postgres_repository.go  (신규)
├── internal/config/database.go                 (신규)
└── shared/docker-compose.yml                   (신규)
```

### 6.2 Phase 2 - 캐시 레이어

```
Redis를 Service와 Repository 사이에 삽입
요청 흐름: Service → Redis 캐시 확인 → 미스 시 PostgreSQL 조회 → 캐시 저장
```

### 6.3 Phase 3 - 운영 안정화

- Graceful Shutdown (`signal.NotifyContext`)
- Rate Limiting (IP 기반, `golang.org/x/time/rate`)
- 구조화된 로깅 (`slog` 또는 `zap`)
- URL 유효성 검증 강화 (HEAD 요청으로 접근 가능 여부 확인)

### 6.4 Phase 4 - 배포

- GitHub Actions CI/CD (path 필터: `url-shortener/**`)
- Kubernetes 매니페스트 (Deployment, Service, Ingress)
- 홈서버 배포

---

## 7. 설정

### 7.1 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `8080` | 서버 포트 |
| `BASE_URL` | `http://localhost:8080` | 단축 URL 기본 도메인 |
| `DATABASE_URL` | - | PostgreSQL 연결 문자열 (예정) |
| `REDIS_URL` | - | Redis 연결 문자열 (예정) |
| `WORKER_ID` | `1` | Snowflake 워커 ID (0~1023, 인스턴스별 고유) |

### 7.2 Docker

멀티스테이지 빌드: `golang:1.21-alpine` (빌드) → `alpine:latest` (실행)
- CGO 비활성화, 정적 바이너리 생성
- 포트 8080 노출

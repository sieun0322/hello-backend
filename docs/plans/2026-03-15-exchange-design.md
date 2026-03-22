# Mini Exchange 설계 문서

**작성일:** 2026-03-15
**목표:** 증권 거래소 핵심 개념 학습 + 시스템 설계 면접 준비
**언어:** Rust
**학습 키워드:** gRPC, 공유 메모리, Event Sourcing

---

## 진화 로드맵

```
Phase 1: Mini Exchange (Rust + gRPC)
         → tonic으로 컴포넌트 연결, 전체 파이프라인 완성

Phase 2: 공유 메모리 최적화
         → gRPC vs 공유 메모리 레이턴시 직접 비교

Phase 3: Event Sourcing
         → 이벤트 로그 기반 재설계
```

---

## Phase 1 아키텍처

```
Client
  │ HTTP/REST (외부 진입점)
  ▼
┌─────────────────┐
│  Order Gateway  │  Rust — axum (REST) + tonic (gRPC client)
└────────┬────────┘
         │ gRPC (Protobuf)
         ▼
┌─────────────────┐
│ Matching Engine │  Rust — BTreeMap 기반 오더북 + tonic (gRPC server)
└────────┬────────┘
         │ gRPC server streaming
         ▼
┌─────────────────┐
│Market Data Feed │  Rust — WebSocket 브로드캐스트
└─────────────────┘
         │ WebSocket
         ▼
      Client
```

### 기술 스택

| 역할 | 크레이트 |
|------|----------|
| gRPC 서버/클라이언트 | `tonic` |
| Protobuf 코드 생성 | `prost` |
| 비동기 런타임 | `tokio` |
| REST API (외부) | `axum` |
| WebSocket | `tokio-tungstenite` |

---

## 컴포넌트 설계

### 1. Matching Engine

오더북의 자료구조가 성능을 결정한다.

```rust
struct OrderBook {
    bids: BTreeMap<Price, VecDeque<Order>>,  // 매수: 높은 가격 우선
    asks: BTreeMap<Price, VecDeque<Order>>,  // 매도: 낮은 가격 우선
}

struct Order {
    id: u64,
    side: Side,
    price: u64,       // 정수 사용 (부동소수점 금지)
    quantity: u64,
    timestamp: u64,   // 시간 우선순위
}
```

**체결 로직 (Price-Time Priority):**
```
매수 주문 (price=100, qty=10) 진입
  → asks에서 price <= 100 인 주문 탐색
  → 가장 낮은 가격 → 같은 가격이면 timestamp 오래된 순
  → 체결 후 남은 수량은 bids에 대기
```

**gRPC 인터페이스:**
```protobuf
service MatchingEngine {
  rpc SubmitOrder(OrderRequest) returns (OrderResponse);
  rpc CancelOrder(CancelRequest) returns (CancelResponse);
  rpc GetOrderBook(Symbol) returns (OrderBookSnapshot);
}
```

---

### 2. Order Gateway

외부 클라이언트 진입점. 검증 후 Matching Engine으로 전달.

```protobuf
message OrderRequest {
  string symbol = 1;
  Side side = 2;       // BUY / SELL
  uint64 price = 3;
  uint64 quantity = 4;
  OrderType type = 5;  // LIMIT / MARKET
}
```

---

### 3. Market Data Feed

체결 결과를 실시간으로 클라이언트에 전송. gRPC 서버 스트리밍 활용.

```protobuf
service MarketData {
  rpc Subscribe(SubscribeRequest) returns (stream TradeEvent);
}

message TradeEvent {
  string symbol = 1;
  uint64 price = 2;
  uint64 quantity = 3;
  uint64 timestamp = 4;
}
```

---

## 프로젝트 폴더 구조

```
hello-backend/
└── exchange/
    ├── proto/                  # 공유 .proto 스키마
    │   ├── matching.proto
    │   └── market_data.proto
    ├── order-gateway/          # axum REST + tonic gRPC client
    │   ├── src/
    │   └── Cargo.toml
    ├── matching-engine/        # 오더북 로직 + tonic gRPC server
    │   ├── src/
    │   └── Cargo.toml
    ├── market-data-feed/       # WebSocket 브로드캐스트
    │   ├── src/
    │   └── Cargo.toml
    └── Cargo.toml              # workspace
```

---

## 학습 포인트

### gRPC (Phase 1)
- Protobuf 스키마 정의 → 코드 자동 생성
- Unary RPC vs Server Streaming RPC 차이
- REST와 비교: 왜 거래소 내부 통신에 REST가 안 맞는가 (직접 체감)

### 공유 메모리 (Phase 2)
- gRPC 레이턴시 측정 후 공유 메모리와 비교
- `mmap`, `Arc<Mutex<>>` vs lock-free 자료구조
- HFT에서 커널 바이패스를 쓰는 이유 이해

### Event Sourcing (Phase 3)
- 모든 주문/체결을 불변 이벤트 로그로 저장
- 특정 시점으로 상태 재현(replay)
- 금융 시스템에서 이 패턴이 필수인 이유 (감사 추적, 장애 복구)

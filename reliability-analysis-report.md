# 분산 ID 생성기 신뢰성/일관성 분석 보고서

## Task #2: 장애 내성 및 유일성 보장 전략

---

## 1. 시계 동기화 문제 (Clock Synchronization Issues)

### 1.1 Clock Drift (시계 드리프트)

**원인:**
- 수정 발진기(crystal oscillator)의 물리적 특성: 온도, 전압, 노화에 따라 주파수 변동
- 일반적 드리프트율: 10~200 ppm (parts per million)
  - 10 ppm = 하루 약 0.86초 편차
  - 200 ppm = 하루 약 17.28초 편차
- 가상화 환경에서 더 심각: VM의 CPU 스케줄링으로 인한 타이머 불안정
- 클라우드 환경 편차: AWS에서 측정된 인스턴스 간 최대 수백 ms 편차 사례

**ID 생성에 미치는 영향:**
- Snowflake 구조 `[timestamp 41bit | datacenter 5bit | worker 5bit | sequence 12bit]`
- 타임스탬프가 다른 노드보다 앞서면: 미래 시간의 ID가 생성됨 → 정렬 순서 왜곡
- 타임스탬프가 뒤처지면: 과거 시간의 ID가 생성 → 다른 노드의 같은 ms에 이미 발급된 ID와 충돌 가능 (worker ID가 다르므로 유일성은 보장되지만 순서가 왜곡)

**대응 전략:**
```
┌─────────────────────────────────────────────────┐
│              Clock Drift 대응 계층               │
├─────────────────────────────────────────────────┤
│ L1: NTP 정기 동기화 (ntpd/chronyd)              │
│ L2: 드리프트 모니터링 및 알림                    │
│ L3: 허용 범위 초과 시 ID 생성 중단 (fail-fast)   │
│ L4: Hybrid Logical Clock 전환                   │
└─────────────────────────────────────────────────┘
```

### 1.2 NTP 실패 시나리오

| 시나리오 | 영향 | 대응 |
|---------|------|------|
| NTP 서버 다운 | 로컬 시계의 드리프트가 누적 | 여러 NTP 서버 풀 구성 (최소 4개) |
| NTP 네트워크 파티션 | 일부 노드만 동기화 실패 | 마지막 동기화 시간 추적, 임계값 초과 시 경고 |
| NTP step correction | 시계가 갑자기 점프 (수 초~분) | ntpd의 `-x` 옵션으로 step 방지, slew mode 사용 |
| 잘못된 NTP 응답 (Falseticker) | 시계가 완전히 잘못된 시간으로 설정 | 다수결 기반 NTP 소스 선택 (manycast) |
| Stratum 계층 실패 | 연쇄적 정확도 저하 | 로컬 GPS/PTP 레퍼런스 클럭 운영 |

**권장 NTP 구성:**
```
# chronyd 설정 예시
server ntp1.internal iburst prefer
server ntp2.internal iburst
server ntp3.internal iburst
server ntp4.internal iburst

# 최대 허용 드리프트: 초과 시 step 대신 slew
makestep 0.1 3    # 처음 3번만 0.1초 이상 차이 시 step 허용
maxdrift 100      # 최대 100 ppm 드리프트 허용
```

### 1.3 윤초(Leap Second) 처리

**문제:**
- 2012년 6월 30일 윤초 사건: Linux 커널의 hrtimer 버그로 MySQL, Java, Hadoop 등 대규모 장애
- 윤초 시 23:59:59 → 23:59:60 → 00:00:00 (양의 윤초)
- 타임스탬프 기반 ID에서 같은 초가 2번 나타남 → 중복 가능

**대응 방식:**

| 방식 | 설명 | 장단점 |
|------|------|--------|
| **Leap Smearing** | 윤초를 수 시간에 걸쳐 분산 적용 (Google: 24시간, AWS: 12시간) | 시스템 안정적, 외부 시스템과 최대 0.5초 편차 |
| **Stepping** | 윤초를 즉시 적용 | 단순하지만 순간적 타임스탬프 역행 또는 정지 발생 |
| **커널 레벨 처리** | `STA_INS`/`STA_DEL` 커널 플래그 | 커널 버전에 따라 불안정 |
| **UTC → TAI 전환** | 윤초 없는 TAI 사용 | 기존 시스템과의 호환성 문제 |

**권장:** Google/AWS 스타일 Leap Smearing + Snowflake epoch에 TAI 기반 단조증가 시계 사용

---

## 2. 시계 역행(Clock Backward) 시나리오

### 2.1 발생 원인
1. **NTP step correction**: 시계가 앞서 있을 때 NTP가 뒤로 조정
2. **VM 마이그레이션**: 소스/대상 호스트 간 시계 차이
3. **수동 시간 변경**: 관리자의 `date -s` 명령
4. **하드웨어 결함**: 배터리 방전, RTC 오류
5. **윤초 stepping**: 양의 윤초 삽입 시 시계 반복

### 2.2 탐지 방법
```python
class ClockBackwardDetector:
    def __init__(self):
        self.last_timestamp = 0

    def get_timestamp(self):
        current = system_time_millis()
        if current < self.last_timestamp:
            # 시계 역행 탐지!
            backward_ms = self.last_timestamp - current
            raise ClockBackwardException(backward_ms)
        self.last_timestamp = current
        return current
```

### 2.3 대응 전략 비교

#### 전략 1: 대기(Wait/Spin) - Twitter Snowflake 방식
```python
def til_next_millis(last_timestamp):
    timestamp = system_time_millis()
    while timestamp <= last_timestamp:
        timestamp = system_time_millis()
    return timestamp
```
- **장점**: 구현 간단, 유일성 완벽 보장
- **단점**: 역행 시간이 길면 서비스 중단 (수 초 이상은 위험)
- **적용**: 역행이 수 ms 이내일 때만 적합

#### 전략 2: 시퀀스 확장
```python
def generate_id_with_extended_seq(self):
    current = system_time_millis()
    if current < self.last_timestamp:
        # 시계 역행 시: 이전 타임스탬프 유지 + 시퀀스 계속 증가
        self.sequence += 1
        if self.sequence >= MAX_SEQUENCE:
            # 시퀀스도 소진 → 다음 ms까지 대기
            current = self.til_next_millis(self.last_timestamp)
            self.sequence = 0
    elif current == self.last_timestamp:
        self.sequence += 1
    else:
        self.sequence = 0
    self.last_timestamp = max(current, self.last_timestamp)
    return make_id(self.last_timestamp, self.worker_id, self.sequence)
```
- **장점**: 서비스 중단 없음, 역행 동안에도 ID 생성 가능
- **단점**: 시퀀스 공간 빠르게 소진 가능, 타임스탬프 정확도 저하

#### 전략 3: 논리적 시계(HLC) 전환
```python
class HybridLogicalClock:
    def __init__(self):
        self.l = 0  # logical component (physical time)
        self.c = 0  # counter component

    def now(self):
        pt = physical_time()
        if pt > self.l:
            self.l = pt
            self.c = 0
        else:
            # 물리적 시간이 역행하거나 동일 → 논리적 시계만 증가
            self.c += 1
        return (self.l, self.c)
```
- **장점**: 물리적 시계와 논리적 시계의 장점 결합, 역행에 자연스럽게 대응
- **단점**: ID 크기 증가 필요 (counter 비트), 구현 복잡도 증가
- **적용**: CockroachDB에서 실제 사용 중

#### 전략 4: Fail-Fast (즉시 거부)
```python
def generate_id_fail_fast(self):
    current = system_time_millis()
    if current < self.last_timestamp:
        backward_ms = self.last_timestamp - current
        if backward_ms > TOLERANCE_MS:  # e.g., 5ms
            raise ClockBackwardException(
                f"Clock moved backwards by {backward_ms}ms"
            )
    # ... normal generation
```
- **장점**: 유일성 100% 보장, 문제를 즉시 드러냄
- **단점**: 가용성 저하 (호출자가 재시도 로직 필요)
- **적용**: Twitter Snowflake 원본 구현 (역행 시 예외 발생)

#### 전략 5: Epoch Bumping
```python
def generate_id_epoch_bump(self):
    current = system_time_millis()
    if current < self.last_timestamp:
        # 새로운 epoch으로 전환 → worker ID 공간 내에서 구분
        self.epoch_version += 1
        self.sequence = 0
        # epoch_version을 ID의 일부에 포함
    self.last_timestamp = current
    return make_id(current, self.worker_id, self.epoch_version, self.sequence)
```
- **장점**: 즉시 복구, 이전 epoch의 ID와 충돌 없음
- **단점**: ID 공간 소비, epoch 비트 필요

### 2.4 전략 선택 가이드

```
역행 크기에 따른 전략:
┌────────────────┬───────────────────────────────────┐
│  < 5ms         │ Wait/Spin (전략 1)                │
│  5ms ~ 100ms   │ 시퀀스 확장 (전략 2)               │
│  100ms ~ 1s    │ HLC 전환 (전략 3)                  │
│  > 1s          │ Fail-Fast + 알림 (전략 4)          │
│  재시작 후 역행  │ Epoch Bumping (전략 5)             │
└────────────────┴───────────────────────────────────┘
```

---

## 3. 네트워크 파티션 (Network Partition)

### 3.1 Split-Brain 시나리오

```
정상 상태:                    파티션 발생:
┌─────────────┐              ┌─── Partition A ───┐  ┌─── Partition B ───┐
│ Coordinator │              │ Node1 (worker=1)   │  │ Node3 (worker=3)  │
│             │              │ Node2 (worker=2)   │  │ Node4 (worker=4)  │
│ Node1 (w=1) │              │ [Coordinator 접근X] │  │ [Coordinator 접근O]│
│ Node2 (w=2) │              └────────────────────┘  └────────────────────┘
│ Node3 (w=3) │
│ Node4 (w=4) │              위험: Partition A의 Node가 Coordinator 없이
└─────────────┘              Worker ID를 재할당하면 충돌 가능!
```

### 3.2 ID 충돌 방지 전략

#### 전략 A: 사전 할당된 Worker ID (Pre-assigned, Static)
- 각 노드에 고유 Worker ID를 정적으로 할당 (설정 파일, 환경 변수)
- **장점**: 네트워크 파티션에 완전 내성, 코디네이터 불필요
- **단점**: 노드 추가/제거 시 수동 관리 필요, ID 공간 낭비

#### 전략 B: 범위 사전 할당 (Range Pre-allocation)
```
┌──────────────────────────────────────────────────────┐
│ Coordinator가 미리 ID 범위를 할당:                     │
│                                                       │
│ Node1: [1-10000], Node2: [10001-20000], ...           │
│                                                       │
│ 파티션 발생 시:                                        │
│ - 각 노드는 할당받은 범위 내에서 계속 생성 가능          │
│ - 범위 소진 시에만 Coordinator 접근 필요                │
│ - 범위가 충분히 크면 파티션 동안 서비스 지속 가능         │
└──────────────────────────────────────────────────────┘
```

#### 전략 C: 충돌 불가능한 구조 (Structurally Collision-Free)
```
UUID v4:  128-bit 랜덤 → 충돌 확률 ~2^-61 (10억개 생성 시)
ULID:     48-bit timestamp + 80-bit random
MongoDB:  4-byte timestamp + 5-byte random + 3-byte counter
```
- 랜덤/유니크 컴포넌트가 충분히 크면 코디네이션 없이 유일성 확보
- **트레이드오프**: ID 크기 증가 (128-bit), 정렬 가능성은 timestamp prefix로 유지

#### 전략 D: Fencing Token 기반
```python
class FencedIdGenerator:
    def __init__(self, coordinator):
        self.lease = coordinator.acquire_lease()
        self.fencing_token = self.lease.fencing_token

    def generate(self):
        if self.lease.is_expired():
            raise LeaseExpiredException()
        # fencing_token이 ID에 포함되어 old lease의 ID는 거부됨
        return make_id(timestamp, self.fencing_token, sequence)
```

### 3.3 네트워크 파티션 내성 등급

| 등급 | 설명 | 예시 |
|------|------|------|
| **P0 - 완전 내성** | 파티션 중에도 100% 정상 동작 | UUID v4, ULID (랜덤 기반) |
| **P1 - 제한적 내성** | 사전 할당 범위 내에서 동작 | Range-based, Static Worker ID |
| **P2 - 감지/대응** | 파티션 감지 후 안전 모드 전환 | Lease 기반 + fallback |
| **P3 - 비내성** | 파티션 시 서비스 중단 | 중앙 집중식 시퀀스 |

---

## 4. 노드 장애/재시작 시 Worker ID 재할당

### 4.1 Worker ID 할당 전략 비교

#### 방식 1: ZooKeeper 기반

```
ZooKeeper Ensemble
├── /snowflake
│   ├── /workers
│   │   ├── /worker-0000000001  → Node-A (ephemeral sequential)
│   │   ├── /worker-0000000002  → Node-B (ephemeral sequential)
│   │   └── /worker-0000000003  → Node-C (ephemeral sequential)
```

```python
class ZkWorkerIdAllocator:
    def allocate(self):
        # ephemeral sequential 노드 생성
        path = zk.create("/snowflake/workers/worker-",
                         value=hostname,
                         flags=EPHEMERAL | SEQUENTIAL)
        # sequential 번호에서 worker_id 추출
        worker_id = int(path.split("-")[-1]) % MAX_WORKER_ID
        return worker_id

    # 노드 다운 → ephemeral 노드 자동 삭제 → worker_id 해제
```

- **장점**: 자동 장애 감지 (세션 타임아웃), 순차적 할당
- **단점**: ZooKeeper 의존성 (ZK 자체가 SPOF 가능), 세션 타임아웃 기간 동안 worker ID 재사용 불가
- **주의**: Worker ID 재사용 시 시계 역행과 결합되면 충돌 위험 → **재사용 대기 시간** 필요

#### 방식 2: etcd 리스(Lease) 기반

```python
class EtcdWorkerIdAllocator:
    def allocate(self):
        lease = etcd.lease(ttl=30)  # 30초 TTL

        for worker_id in range(MAX_WORKER_ID):
            key = f"/snowflake/workers/{worker_id}"
            # 트랜잭션: 키가 없을 때만 생성
            success = etcd.txn(
                compare=[etcd.key(key).version == 0],
                success=[etcd.put(key, hostname, lease=lease)],
                failure=[]
            )
            if success:
                # 주기적 lease 갱신 (keepalive)
                self.start_keepalive(lease)
                return worker_id

        raise NoAvailableWorkerIdException()
```

- **장점**: 강력한 일관성 (Raft 합의), TTL 기반 자동 해제
- **단점**: 네트워크 지연으로 lease 갱신 실패 시 worker ID 빼앗김 위험

#### 방식 3: DB 시퀀스 기반

```sql
-- Worker ID 등록 테이블
CREATE TABLE worker_registry (
    worker_id    INT PRIMARY KEY,
    node_host    VARCHAR(255),
    heartbeat_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker ID 획득 (비관적 잠금)
BEGIN;
SELECT worker_id FROM worker_registry
WHERE heartbeat_at < NOW() - INTERVAL '60 seconds'
ORDER BY worker_id LIMIT 1 FOR UPDATE SKIP LOCKED;

UPDATE worker_registry
SET node_host = 'new-node', heartbeat_at = NOW()
WHERE worker_id = ?;
COMMIT;
```

- **장점**: 기존 인프라 활용, 트랜잭션 보장
- **단점**: DB가 SPOF, 성능 병목 가능

#### 방식 4: MAC 주소 / IP 기반

```python
class MacBasedWorkerIdAllocator:
    def allocate(self):
        mac = get_mac_address()  # e.g., "AA:BB:CC:DD:EE:FF"
        # 하위 10비트 사용 (1024개 worker 구분)
        worker_id = int(mac.replace(":", ""), 16) % MAX_WORKER_ID
        return worker_id
```

- **장점**: 외부 의존성 없음, 재시작 시 동일 ID 보장
- **단점**: 충돌 가능 (해시 충돌), 컨테이너/VM에서 MAC 변경 가능, 클라우드 환경 부적합

### 4.2 재시작 안전성 매트릭스

| 방식 | 재시작 후 동일 ID | 자동 해제 | 외부 의존성 | 충돌 가능성 |
|------|------------------|----------|------------|------------|
| ZooKeeper | X (새 sequential) | O (ephemeral) | ZK 클러스터 | 낮음 |
| etcd Lease | X (새 할당) | O (TTL) | etcd 클러스터 | 낮음 |
| DB Sequence | △ (heartbeat 기반) | △ (수동/cron) | RDBMS | 낮음 |
| MAC/IP | O (동일) | N/A | 없음 | 중간 |
| Static Config | O (동일) | N/A | 없음 | 없음 (관리 필요) |

### 4.3 재시작 시 시간 안전성

```
문제: Node A가 worker_id=5로 t=1000ms에 seq=100까지 발급 후 다운
      Node A가 재시작 후 같은 worker_id=5로 t=999ms에 seq=0부터 발급
      → 충돌 발생!

해결: "Last Timestamp" 영속화
┌─────────────────────────────────────────────┐
│ 1. ID 생성 시 주기적으로 last_timestamp를      │
│    로컬 파일/DB에 저장                         │
│ 2. 재시작 시 저장된 last_timestamp 로드         │
│ 3. 현재 시간이 last_timestamp보다 작으면        │
│    → 시계 역행 대응 전략 적용                   │
│ 4. 안전 마진: last_timestamp + 3초 이후부터     │
│    ID 생성 시작 (보수적 접근)                    │
└─────────────────────────────────────────────┘
```

---

## 5. Sequence Number 오버플로우

### 5.1 문제 정의

```
Snowflake 12-bit sequence = 4096 IDs per millisecond per worker
= 약 4,096,000 IDs/sec/worker

초과 시나리오:
- 단일 노드에 대량 요청 집중 (hot-spot)
- 밀리초 내 burst traffic
- 시계 역행으로 같은 밀리초에 머무는 시간 증가
```

### 5.2 대응 전략

#### 전략 1: 다음 밀리초 대기 (Wait for Next Millisecond)
```python
def next_id(self):
    timestamp = current_millis()
    if timestamp == self.last_timestamp:
        self.sequence = (self.sequence + 1) & SEQUENCE_MASK  # 0xFFF
        if self.sequence == 0:
            # 시퀀스 소진 → 다음 밀리초까지 spin-wait
            timestamp = self.wait_next_millis(self.last_timestamp)
    else:
        self.sequence = 0
    self.last_timestamp = timestamp
    return self.compose_id(timestamp, self.worker_id, self.sequence)

def wait_next_millis(self, last):
    ts = current_millis()
    while ts <= last:
        ts = current_millis()  # busy-wait
    return ts
```
- **최대 지연**: 1ms (다음 밀리초 경계까지)
- **장점**: 구현 간단, 유일성 보장
- **단점**: 지속적 초과 시 throughput 저하, CPU spin-wait

#### 전략 2: 비트 차용/확장

```
기본 Snowflake (64-bit):
┌──────────┬───────┬────────┬──────────┐
│ sign(1)  │ ts(41)│wkr(10) │ seq(12)  │
└──────────┴───────┴────────┴──────────┘
                              4096/ms

변형 1 - timestamp 해상도 낮춤 (10ms 단위):
┌──────────┬───────┬────────┬──────────┐
│ sign(1)  │ ts(38)│wkr(10) │ seq(15)  │
└──────────┴───────┴────────┴──────────┘
                              32768/10ms = ~3.2M/s

변형 2 - worker 비트 축소:
┌──────────┬───────┬────────┬──────────┐
│ sign(1)  │ ts(41)│wkr(5)  │ seq(17)  │
└──────────┴───────┴────────┴──────────┘
                              131072/ms (32 workers)

변형 3 - 128-bit 확장:
┌──────────┬───────┬────────┬──────────┐
│ sign(1)  │ ts(48)│wkr(16) │ seq(63)  │
└──────────┴───────┴────────┴──────────┘
                              사실상 무제한
```

#### 전략 3: 사전 할당 버퍼 (Baidu UidGenerator 방식)

```
RingBuffer 기반 사전 생성:
┌───────────────────────────────────────────┐
│ 생산자 스레드: 미리 ID를 생성하여 RingBuffer에 │
│ 소비자 스레드: RingBuffer에서 ID를 꺼내 반환   │
│                                            │
│ ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐           │
│ │ID│ID│ID│ID│  │  │  │  │ID│ID│ RingBuffer │
│ └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘           │
│   ↑ tail (read)        ↑ cursor (write)    │
│                                            │
│ 장점: 시간 역행 영향 최소화                   │
│       순간 burst 흡수 가능                   │
│ 단점: 메모리 사용, 미사용 ID 낭비 가능         │
└───────────────────────────────────────────┘
```

#### 전략 4: 다중 노드 분산

```python
class ShardedIdGenerator:
    """요청을 여러 worker로 분산하여 per-worker 부하 감소"""
    def __init__(self, num_workers):
        self.workers = [SnowflakeWorker(i) for i in range(num_workers)]
        self.counter = AtomicInteger(0)

    def next_id(self):
        # Round-robin으로 worker 선택
        idx = self.counter.increment_and_get() % len(self.workers)
        return self.workers[idx].next_id()
```

### 5.3 처리량 설계 가이드

```
요구 처리량 계산:
┌─────────────────────────────────────────────────────┐
│ 목표: 초당 100만 ID                                   │
│                                                      │
│ 방법 1: 단일 노드 + 12-bit seq                        │
│   4096/ms × 1000ms = 4,096,000/s ✓ (여유 있음)       │
│                                                      │
│ 방법 2: 목표 1000만 ID/s                              │
│   Option A: 3개 노드 × 4,096,000/s = 12.3M/s ✓      │
│   Option B: 1개 노드 + 15-bit seq = 32,768/ms        │
│            = 32,768,000/s ✓                          │
│                                                      │
│ 방법 3: 목표 1억 ID/s                                 │
│   25개 노드 × 4,096,000/s = 102.4M/s ✓              │
└─────────────────────────────────────────────────────┘
```

---

## 6. 단일 장애점(SPOF) 제거

### 6.1 아키텍처 비교

#### 아키텍처 A: 완전 분산 (Coordinator 없음)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Service  │  │ Service  │  │ Service  │
│ Instance │  │ Instance │  │ Instance │
│          │  │          │  │          │
│ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │
│ │ID Gen│ │  │ │ID Gen│ │  │ │ID Gen│ │
│ │(w=1) │ │  │ │(w=2) │ │  │ │(w=3) │ │
│ └──────┘ │  │ └──────┘ │  │ └──────┘ │
└──────────┘  └──────────┘  └──────────┘

SPOF: 없음 (각 인스턴스 독립)
Worker ID: 정적 설정 또는 MAC/IP 기반
```

- **장점**: SPOF 없음, 네트워크 파티션 내성, 최소 지연
- **단점**: Worker ID 관리 수동, 스케일링 시 충돌 주의
- **적합**: UUID v4, ULID, 정적 Snowflake

#### 아키텍처 B: 코디네이터 기반 (HA 구성)

```
┌─────────────────────────────────┐
│       ZooKeeper / etcd          │
│   (3-node or 5-node quorum)     │
│                                 │
│   ┌──┐  ┌──┐  ┌──┐  [┌──┐ ┌──┐]│
│   │ZK│  │ZK│  │ZK│   │ZK│ │ZK│ │
│   │1 │  │2 │  │3 │   │4 │ │5 │ │
│   └──┘  └──┘  └──┘   └──┘ └──┘ │
└────────────┬────────────────────┘
             │ Worker ID 할당
    ┌────────┼────────┐
    ▼        ▼        ▼
┌──────┐ ┌──────┐ ┌──────┐
│ID Gen│ │ID Gen│ │ID Gen│
│(w=1) │ │(w=2) │ │(w=3) │
└──────┘ └──────┘ └──────┘

SPOF: 코디네이터 자체는 HA, 하지만...
- ZK 전체 다운 시 새 Worker ID 할당 불가
- 기존 Worker는 계속 동작 (graceful degradation)
```

#### 아키텍처 C: 하이브리드

```
┌─────────────────────────────────────────────┐
│ 정상 모드: 코디네이터에서 Worker ID 할당       │
│ 장애 모드: UUID v4 폴백으로 전환               │
│                                              │
│ if coordinator.is_available():                │
│     return snowflake_id()     # 64-bit, 정렬 │
│ else:                                         │
│     return uuid_v4()          # 128-bit, 랜덤│
│     log.warn("Fallback to UUID mode")         │
└─────────────────────────────────────────────┘
```

### 6.2 SPOF 제거 체크리스트

```
□ ID 생성기 자체에 외부 네트워크 호출이 필요한가?
  → 런타임에 네트워크 호출 제거 (초기화 시에만 사용)
□ 코디네이터 장애 시 기존 노드가 계속 동작하는가?
  → Lease 갱신 실패해도 안전 마진 내 동작 허용
□ 코디네이터 없이 새 노드를 추가할 수 있는가?
  → 폴백 전략 (MAC 기반, UUID 모드) 준비
□ 단일 노드 장애가 다른 노드에 영향을 주는가?
  → 각 노드 독립적 ID 생성 공간 보장
```

---

## 7. CAP 정리 관점 분석

### 7.1 ID 생성에서의 CAP

```
         Consistency (유일성)
              ╱╲
             ╱  ╲
            ╱    ╲
           ╱  CP  ╲
          ╱        ╲
         ╱──────────╲
        ╱     CA      ╲
       ╱                ╲
      ╱                  ╲
     ╱────────────────────╲
    Availability          Partition
    (가용성)              Tolerance
                          (파티션 내성)
```

### 7.2 각 조합의 의미

#### CP (Consistency + Partition Tolerance) - 유일성 우선
```
전략: 네트워크 파티션 시 ID 생성 중단
예시: 중앙 시퀀스 DB (파티션 발생 시 minority 파티션 거부)
     ZooKeeper 기반 (quorum 없는 파티션에서 서비스 중단)

사용 사례: 금융 거래 ID, 법적 문서 번호
- 중복 ID는 절대 허용 불가
- 가용성 저하 감수
```

#### AP (Availability + Partition Tolerance) - 가용성 우선
```
전략: 파티션 중에도 ID 생성 계속, 충돌은 통계적으로 방지
예시: UUID v4 (128-bit random)
     ULID (timestamp + 80-bit random)

사용 사례: 로그 ID, 이벤트 추적, 비핵심 엔티티
- 극히 낮은 충돌 확률 (UUID v4: ~2^-61)
- 항상 사용 가능
```

#### CA (Consistency + Availability) - 파티션 미고려
```
전략: 네트워크 파티션이 없다고 가정 (단일 DC, 단일 노드)
예시: 단일 노드 auto-increment
     단일 DC 내 Snowflake (DC 간 파티션 무시)

사용 사례: 단일 서비스 인스턴스, 모놀리식 아키텍처
- 현실적으로 네트워크 파티션은 발생함 → 분산 환경에서는 비현실적
```

### 7.3 실용적 설계 결정 프레임워크

```
┌────────────────────────────────────────────────────────────────┐
│                    ID 유일성 요구 수준                           │
│                                                                │
│  절대적 유일성 (금융)         통계적 유일성 (일반)                  │
│        │                          │                             │
│        ▼                          ▼                             │
│  ┌──────────────┐          ┌──────────────┐                    │
│  │ CP 전략 선택   │          │ AP 전략 선택   │                    │
│  │              │          │              │                    │
│  │ - Snowflake  │          │ - UUID v4    │                    │
│  │   + ZK/etcd  │          │ - ULID       │                    │
│  │ - DB Sequence│          │ - KSUID      │                    │
│  │ - TrueTime   │          │ - ObjectId   │                    │
│  └──────────────┘          └──────────────┘                    │
│        │                          │                             │
│        ▼                          ▼                             │
│  파티션 시 서비스 중단     파티션 시 계속 동작                      │
│  but 유일성 100%         but 충돌 확률 존재 (~0%)                 │
└────────────────────────────────────────────────────────────────┘
```

### 7.4 Snowflake의 실용적 위치

```
Snowflake는 "실용적 CP"에 위치:
- Worker ID를 통해 구조적으로 유일성 보장 (C)
- 정적 Worker ID 할당 시 파티션에도 동작 (P)
- 코디네이터 기반 Worker ID 할당 시 AP 트레이드오프

핵심 통찰: Snowflake의 유일성은 "동일 Worker ID가 동시에 2개 존재하지 않음"에 의존
→ 이 불변 조건만 유지하면 나머지는 독립적으로 동작 가능
→ 따라서 Worker ID 할당만 CP, ID 생성 자체는 완전 독립(AP 가능)
```

---

## 8. 멱등성과 순서 보장

### 8.1 멱등성 (Idempotency)

#### 문제: ID 생성의 Exactly-Once Semantics

```
시나리오: 클라이언트 → ID 생성기 → 응답
        타임아웃 발생 → 클라이언트 재시도
        → 같은 요청에 다른 ID 2개 생성됨!

┌─────────┐       ┌──────────┐
│ Client  │──①──▶│ ID Gen   │ ①: ID=1001 생성
│         │  ✕    │          │ 응답 유실
│         │──②──▶│          │ ②: ID=1002 생성 (중복!)
│         │◀─────│          │
└─────────┘       └──────────┘
```

#### 대응 전략

**전략 1: 클라이언트 측 Idempotency Key**
```python
class IdempotentIdGenerator:
    def __init__(self):
        self.cache = TTLCache(maxsize=10000, ttl=60)  # 60초 TTL

    def generate(self, idempotency_key: str) -> int:
        # 이미 같은 키로 생성된 ID가 있으면 반환
        if idempotency_key in self.cache:
            return self.cache[idempotency_key]

        new_id = self.snowflake.next_id()
        self.cache[idempotency_key] = new_id
        return new_id
```

**전략 2: Token 사전 할당**
```python
class TokenBasedIdGenerator:
    """2-phase: 먼저 토큰 발급, 그 다음 토큰으로 ID 확정"""

    def allocate_token(self) -> str:
        """Phase 1: 토큰 발급 (멱등)"""
        return uuid4()

    def confirm_id(self, token: str) -> int:
        """Phase 2: 토큰으로 ID 확정 (멱등)"""
        if token in self.confirmed:
            return self.confirmed[token]
        new_id = self.snowflake.next_id()
        self.confirmed[token] = new_id
        return new_id
```

**전략 3: 배치 사전 할당**
```python
class BatchIdAllocator:
    """ID를 배치로 미리 할당하여 네트워크 호출 최소화"""

    def __init__(self, batch_size=1000):
        self.batch_size = batch_size
        self.local_ids = deque()

    def next_id(self) -> int:
        if not self.local_ids:
            # 배치 할당 (네트워크 호출 1회)
            batch = self.remote_allocator.allocate_batch(self.batch_size)
            self.local_ids.extend(batch)
        return self.local_ids.popleft()

    # 멱등성: 로컬에서 소비하므로 네트워크 재시도 문제 없음
```

### 8.2 순서 보장 (Ordering Guarantees)

#### 순서 유형 비교

| 순서 유형 | 정의 | 보장 수준 | 비용 |
|-----------|------|-----------|------|
| **전체 순서 (Total Order)** | 모든 이벤트에 대해 단일 전역 순서 | 강함 | 매우 높음 (합의 필요) |
| **인과적 순서 (Causal Order)** | 인과 관계가 있는 이벤트만 순서 보장 | 중간 | 중간 (벡터 시계) |
| **부분 순서 (Partial Order)** | 같은 소스의 이벤트만 순서 보장 | 약함 | 낮음 |
| **정렬 가능 (Sortable)** | 대략적 시간 순서, 완벽하지 않음 | 최약 | 최저 |

#### Lamport Timestamp

```python
class LamportClock:
    """논리적 시계 - 인과적 순서의 필요 조건 제공"""
    def __init__(self):
        self.counter = 0

    def tick(self) -> int:
        """로컬 이벤트 시"""
        self.counter += 1
        return self.counter

    def send(self) -> int:
        """메시지 전송 시"""
        self.counter += 1
        return self.counter

    def receive(self, received_counter: int) -> int:
        """메시지 수신 시"""
        self.counter = max(self.counter, received_counter) + 1
        return self.counter

# 한계: a < b이면 반드시 a→b인 것은 아님 (역은 성립)
```

#### Vector Clock

```python
class VectorClock:
    """완전한 인과적 순서 판별 가능"""
    def __init__(self, node_id, num_nodes):
        self.node_id = node_id
        self.clock = [0] * num_nodes

    def tick(self):
        self.clock[self.node_id] += 1
        return tuple(self.clock)

    def send(self):
        self.clock[self.node_id] += 1
        return tuple(self.clock)

    def receive(self, received_clock):
        for i in range(len(self.clock)):
            self.clock[i] = max(self.clock[i], received_clock[i])
        self.clock[self.node_id] += 1
        return tuple(self.clock)

    def happens_before(self, vc1, vc2):
        """vc1 → vc2 (인과적 선행) 여부"""
        return all(a <= b for a, b in zip(vc1, vc2)) and vc1 != vc2

# 한계: ID에 포함시키기에 크기가 너무 큼 (O(n) where n=노드 수)
```

#### Hybrid Logical Clock (HLC)

```python
class HLC:
    """물리적 시계 + 논리적 카운터 = 실용적 인과적 순서"""
    def __init__(self):
        self.l = 0   # 마지막으로 알려진 물리적 시간
        self.c = 0   # 논리적 카운터

    def now(self) -> tuple:
        """로컬 이벤트/ID 생성"""
        pt = physical_time()
        if pt > self.l:
            self.l = pt
            self.c = 0
        else:
            self.c += 1
        return (self.l, self.c)

    def receive_event(self, msg_l, msg_c) -> tuple:
        """메시지 수신 시"""
        pt = physical_time()
        if pt > self.l and pt > msg_l:
            self.l = pt
            self.c = 0
        elif msg_l > self.l:
            self.l = msg_l
            self.c = msg_c + 1
        elif self.l == msg_l:
            self.c = max(self.c, msg_c) + 1
        else:
            self.c += 1
        return (self.l, self.c)

# 장점: 64-bit에 수용 가능 (48-bit physical + 16-bit logical)
# CockroachDB, MongoDB 등에서 사용
```

#### Google TrueTime

```
TrueTime API:
  TT.now() → TTinterval [earliest, latest]
  TT.after(t) → bool
  TT.before(t) → bool

핵심: 불확실성 구간을 명시적으로 반환
  - GPS 수신기 + 원자 시계로 오차 범위 ε 최소화
  - ε는 보통 1~7ms (평균 4ms)

  Commit protocol:
  1. timestamp = TT.now().latest
  2. wait until TT.after(timestamp) is true
     (commit-wait: 최대 2ε ≈ 14ms 대기)
  3. ID/트랜잭션 확정

장점: 전역적 전체 순서 보장 (물리적 시계 기반)
단점: 특수 하드웨어 필요 (GPS, 원자 시계)
      일반 데이터센터에서 구현 불가
```

### 8.3 각 ID 시스템의 순서 보장 수준

| 시스템 | 순서 보장 | 메커니즘 | 제한사항 |
|--------|----------|----------|---------|
| **Snowflake** | 부분 순서 (같은 worker 내) | 밀리초 타임스탬프 + 시퀀스 | 다른 worker 간 시계 드리프트만큼 순서 왜곡 |
| **ULID** | 정렬 가능 (밀리초 정밀도) | 밀리초 타임스탬프 prefix | 같은 밀리초 내 랜덤 순서, 크로스 노드 순서 없음 |
| **UUIDv7** | 정렬 가능 (밀리초 정밀도) | Unix timestamp prefix | ULID와 유사 |
| **Spanner** | 전체 순서 | TrueTime commit-wait | 특수 하드웨어 필요, 지연 비용 |
| **CockroachDB** | 인과적 순서 | HLC | 클럭 스큐 범위 내 불확실성 존재 |
| **Cassandra TimeUUID** | 부분 순서 | 마이크로초 타임스탬프 | 클럭 동기화 의존 |

### 8.4 순서와 유일성의 관계

```
┌────────────────────────────────────────────────────────┐
│ 핵심 통찰:                                              │
│                                                         │
│ 유일성(Uniqueness)은 순서(Ordering)의 필요조건이 아님      │
│ 순서(Ordering)는 유일성(Uniqueness)의 충분조건이 아님      │
│                                                         │
│ UUID v4: 유일하지만 순서 없음                             │
│ Auto-increment: 순서 있고 유일하지만 분산 불가             │
│ Snowflake: 유일하고 대략적 순서 있고 분산 가능             │
│ TrueTime: 유일하고 완전한 순서 있고 분산 가능 (비싸게)      │
│                                                         │
│ 설계 시 유일성과 순서를 독립적으로 평가하라                  │
└────────────────────────────────────────────────────────┘
```

---

## 종합 장애 시나리오 대응 매트릭스

| 장애 시나리오 | 심각도 | 탐지 방법 | 1차 대응 | 2차 대응 (폴백) |
|--------------|--------|----------|---------|----------------|
| Clock Drift < 100ms | 낮음 | NTP 모니터링 | NTP 재동기화 | HLC 전환 |
| Clock Drift > 1s | 높음 | 타임스탬프 비교 | Fail-fast + 알림 | 노드 격리 |
| Clock Backward < 5ms | 낮음 | `last_timestamp` 비교 | Spin-wait | 시퀀스 확장 |
| Clock Backward > 1s | 심각 | `last_timestamp` 비교 | Fail-fast | Epoch bumping + 알림 |
| NTP 서버 장애 | 중간 | NTP 상태 체크 | 백업 NTP 서버 | 로컬 드리프트 모니터링 |
| 윤초 | 낮음 | 사전 예정됨 | Leap smearing | 커널 레벨 처리 |
| 네트워크 파티션 | 높음 | 하트비트/리스 실패 | 사전 할당 범위 사용 | UUID 폴백 |
| Split-brain | 심각 | Fencing token 검증 | Lease 만료 대기 | Worker ID 충돌 감지 |
| 노드 다운 | 중간 | 하트비트 실패 | Worker ID 해제/재할당 | 타임스탬프 영속화 확인 |
| 노드 재시작 | 중간 | 시작 시 검증 | `last_timestamp` 로드 | 안전 마진 대기 |
| Sequence 오버플로우 | 중간 | `seq == 0` 검사 | 다음 ms 대기 | 다중 worker 분산 |
| 코디네이터 장애 | 높음 | 연결 상태 모니터링 | 기존 Worker ID 유지 | UUID 폴백 모드 |

---

## 권장 설계 원칙

1. **방어적 프로그래밍**: 시계를 신뢰하지 말라. 항상 `last_timestamp`와 비교하라.
2. **단조 증가 보장**: `max(current_time, last_timestamp)`를 사용하여 절대 역행하지 않게 하라.
3. **실패를 명시적으로**: 시계 역행 > 임계값이면 ID 생성을 중단하고 알림을 발생시켜라.
4. **독립성 최대화**: 런타임에 네트워크 호출 없이 ID를 생성할 수 있게 설계하라.
5. **영속성 확보**: `last_timestamp`와 `worker_id`를 영속적으로 저장하여 재시작에 안전하게 하라.
6. **단계적 폴백**: Snowflake → HLC → UUID 순으로 가용성을 우선하라.
7. **모니터링**: 시계 드리프트, 시퀀스 사용률, Worker ID 충돌을 실시간 모니터링하라.
8. **테스트**: 시계 역행, 네트워크 파티션, 노드 재시작 시나리오를 카오스 테스트로 검증하라.

---

*작성: 신뢰성/일관성 엔지니어*
*Task #2 - 분산 ID 생성기 장애 내성 및 유일성 보장 전략 분석*

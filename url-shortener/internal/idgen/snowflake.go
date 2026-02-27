package idgen

import (
	"errors"
	"sync"
	"time"
)

const (
	// 커스텀 에포크: 2025-01-01 00:00:00 UTC
	epoch int64 = 1735689600000

	// 비트 할당
	workerIDBits  = 10
	sequenceBits  = 12
	timestampBits = 41

	// 최대값
	maxWorkerID = (1 << workerIDBits) - 1  // 1023
	maxSequence = (1 << sequenceBits) - 1   // 4095

	// 시프트
	workerIDShift  = sequenceBits
	timestampShift = sequenceBits + workerIDBits
)

var (
	ErrInvalidWorkerID = errors.New("worker ID must be between 0 and 1023")
	ErrClockMovedBack  = errors.New("clock moved backwards")
)

// Snowflake 분산 ID 생성기
//
// 64비트 구조:
//   [1bit 부호] [41bit 타임스탬프] [10bit 워커ID] [12bit 시퀀스]
//
// - 타임스탬프: 커스텀 에포크(2025-01-01) 기준 밀리초, ~69년 사용 가능
// - 워커ID: 0~1023, 인스턴스별 고유 값
// - 시퀀스: 같은 밀리초 내 순번, 0~4095
type Snowflake struct {
	mu        sync.Mutex
	workerID  int64
	sequence  int64
	lastTime  int64
}

// NewSnowflake 생성자. workerID는 0~1023 범위.
func NewSnowflake(workerID int64) (*Snowflake, error) {
	if workerID < 0 || workerID > maxWorkerID {
		return nil, ErrInvalidWorkerID
	}
	return &Snowflake{workerID: workerID}, nil
}

// Generate 유일한 int64 ID를 생성한다.
func (s *Snowflake) Generate() (int64, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now().UnixMilli() - epoch

	if now < s.lastTime {
		return 0, ErrClockMovedBack
	}

	if now == s.lastTime {
		s.sequence = (s.sequence + 1) & maxSequence
		if s.sequence == 0 {
			// 이번 밀리초의 시퀀스 소진, 다음 밀리초까지 대기
			for now <= s.lastTime {
				now = time.Now().UnixMilli() - epoch
			}
		}
	} else {
		s.sequence = 0
	}

	s.lastTime = now

	id := (now << timestampShift) |
		(s.workerID << workerIDShift) |
		s.sequence

	return id, nil
}

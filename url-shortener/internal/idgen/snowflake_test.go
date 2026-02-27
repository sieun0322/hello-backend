package idgen

import (
	"sync"
	"testing"
)

func TestNewSnowflake_ValidWorkerID(t *testing.T) {
	sf, err := NewSnowflake(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if sf == nil {
		t.Fatal("expected snowflake instance")
	}
}

func TestNewSnowflake_InvalidWorkerID(t *testing.T) {
	_, err := NewSnowflake(1024)
	if err != ErrInvalidWorkerID {
		t.Fatalf("expected ErrInvalidWorkerID, got %v", err)
	}

	_, err = NewSnowflake(-1)
	if err != ErrInvalidWorkerID {
		t.Fatalf("expected ErrInvalidWorkerID, got %v", err)
	}
}

func TestGenerate_Unique(t *testing.T) {
	sf, _ := NewSnowflake(1)
	seen := make(map[int64]bool)
	count := 100_000

	for i := 0; i < count; i++ {
		id, err := sf.Generate()
		if err != nil {
			t.Fatalf("generate error: %v", err)
		}
		if seen[id] {
			t.Fatalf("duplicate ID: %d at iteration %d", id, i)
		}
		seen[id] = true
	}
}

func TestGenerate_Monotonic(t *testing.T) {
	sf, _ := NewSnowflake(1)
	var prev int64

	for i := 0; i < 10_000; i++ {
		id, err := sf.Generate()
		if err != nil {
			t.Fatalf("generate error: %v", err)
		}
		if id <= prev {
			t.Fatalf("ID not monotonically increasing: prev=%d, cur=%d", prev, id)
		}
		prev = id
	}
}

func TestGenerate_ConcurrentUnique(t *testing.T) {
	sf, _ := NewSnowflake(1)
	var mu sync.Mutex
	seen := make(map[int64]bool)
	goroutines := 10
	perGoroutine := 10_000

	var wg sync.WaitGroup
	wg.Add(goroutines)

	for g := 0; g < goroutines; g++ {
		go func() {
			defer wg.Done()
			local := make([]int64, 0, perGoroutine)
			for i := 0; i < perGoroutine; i++ {
				id, err := sf.Generate()
				if err != nil {
					t.Errorf("generate error: %v", err)
					return
				}
				local = append(local, id)
			}
			mu.Lock()
			for _, id := range local {
				if seen[id] {
					t.Errorf("concurrent duplicate ID: %d", id)
				}
				seen[id] = true
			}
			mu.Unlock()
		}()
	}

	wg.Wait()
}

func TestDifferentWorkers_DifferentIDs(t *testing.T) {
	sf1, _ := NewSnowflake(1)
	sf2, _ := NewSnowflake(2)

	id1, _ := sf1.Generate()
	id2, _ := sf2.Generate()

	if id1 == id2 {
		t.Fatalf("different workers generated same ID: %d", id1)
	}
}

func TestBase62Encode(t *testing.T) {
	tests := []struct {
		input    int64
		expected string
	}{
		{0, "0"},
		{1, "1"},
		{61, "Z"},
		{62, "10"},
	}

	for _, tt := range tests {
		result := Base62Encode(tt.input)
		if result != tt.expected {
			t.Errorf("Base62Encode(%d) = %s, want %s", tt.input, result, tt.expected)
		}
	}
}

func TestBase62Encode_SnowflakeID(t *testing.T) {
	sf, _ := NewSnowflake(1)
	id, _ := sf.Generate()
	code := Base62Encode(id)

	if len(code) == 0 {
		t.Fatal("expected non-empty code")
	}
	if len(code) > 11 {
		t.Fatalf("code too long: %s (%d chars)", code, len(code))
	}
	t.Logf("Snowflake ID=%d → Base62=%s (%d chars)", id, code, len(code))
}

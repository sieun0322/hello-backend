package repository

import (
	"errors"
	"sync"

	"github.com/zion/url-shortener/internal/model"
)

var (
	ErrNotFound = errors.New("url not found")
)

// URLRepository URL 저장소 인터페이스
type URLRepository interface {
	Save(url *model.URL) error
	FindByCode(code string) (*model.URL, error)
	IncrementClicks(code string) error
}

// MemoryURLRepository 인메모리 구현 (개발용)
type MemoryURLRepository struct {
	mu    sync.RWMutex
	urls  map[string]*model.URL
	idSeq int64
}

// NewMemoryURLRepository 생성자
func NewMemoryURLRepository() *MemoryURLRepository {
	return &MemoryURLRepository{
		urls: make(map[string]*model.URL),
	}
}

func (r *MemoryURLRepository) Save(url *model.URL) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.idSeq++
	url.ID = r.idSeq
	r.urls[url.Code] = url
	return nil
}

func (r *MemoryURLRepository) FindByCode(code string) (*model.URL, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	url, exists := r.urls[code]
	if !exists {
		return nil, ErrNotFound
	}
	return url, nil
}

func (r *MemoryURLRepository) IncrementClicks(code string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	url, exists := r.urls[code]
	if !exists {
		return ErrNotFound
	}
	url.Clicks++
	return nil
}

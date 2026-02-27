package service

import (
	"time"

	"github.com/zion/url-shortener/internal/idgen"
	"github.com/zion/url-shortener/internal/model"
	"github.com/zion/url-shortener/internal/repository"
)

// URLService URL 단축 서비스
type URLService struct {
	repo      repository.URLRepository
	snowflake *idgen.Snowflake
}

// NewURLService 생성자
func NewURLService(repo repository.URLRepository, snowflake *idgen.Snowflake) *URLService {
	return &URLService{repo: repo, snowflake: snowflake}
}

// Shorten URL 단축
func (s *URLService) Shorten(originalURL string) (*model.URL, error) {
	id, err := s.snowflake.Generate()
	if err != nil {
		return nil, err
	}
	code := idgen.Base62Encode(id)

	url := &model.URL{
		Code:      code,
		Original:  originalURL,
		Clicks:    0,
		CreatedAt: time.Now(),
	}

	if err := s.repo.Save(url); err != nil {
		return nil, err
	}

	return url, nil
}

// GetByCode 코드로 URL 조회
func (s *URLService) GetByCode(code string) (*model.URL, error) {
	return s.repo.FindByCode(code)
}

// RecordClick 클릭 기록
func (s *URLService) RecordClick(code string) error {
	return s.repo.IncrementClicks(code)
}

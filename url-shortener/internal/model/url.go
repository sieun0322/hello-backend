package model

import "time"

// URL 단축 URL 모델
type URL struct {
	ID        int64     `json:"id"`
	Code      string    `json:"code"`       // 단축 코드 (예: abc123)
	Original  string    `json:"original"`   // 원본 URL
	Clicks    int64     `json:"clicks"`     // 클릭 수
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

// ShortenRequest 단축 요청
type ShortenRequest struct {
	URL string `json:"url" binding:"required,url"`
}

// ShortenResponse 단축 응답
type ShortenResponse struct {
	ShortURL string `json:"short_url"`
	Code     string `json:"code"`
}

// StatsResponse 통계 응답
type StatsResponse struct {
	Code      string    `json:"code"`
	Original  string    `json:"original"`
	Clicks    int64     `json:"clicks"`
	CreatedAt time.Time `json:"created_at"`
}

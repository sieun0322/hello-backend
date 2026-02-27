package handler

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/zion/url-shortener/internal/idgen"
	"github.com/zion/url-shortener/internal/model"
	"github.com/zion/url-shortener/internal/repository"
	"github.com/zion/url-shortener/internal/service"
)

// URLHandler HTTP 핸들러
type URLHandler struct {
	service *service.URLService
}

// NewURLHandler 생성자
func NewURLHandler(workerID int64) (*URLHandler, error) {
	repo := repository.NewMemoryURLRepository()
	sf, err := idgen.NewSnowflake(workerID)
	if err != nil {
		return nil, err
	}
	svc := service.NewURLService(repo, sf)
	return &URLHandler{service: svc}, nil
}

// Shorten POST /shorten - URL 단축
func (h *URLHandler) Shorten(c *gin.Context) {
	var req model.ShortenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL"})
		return
	}

	url, err := h.service.Shorten(req.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to shorten URL"})
		return
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	c.JSON(http.StatusCreated, model.ShortenResponse{
		ShortURL: baseURL + "/" + url.Code,
		Code:     url.Code,
	})
}

// Redirect GET /:code - 리다이렉트
func (h *URLHandler) Redirect(c *gin.Context) {
	code := c.Param("code")

	url, err := h.service.GetByCode(code)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	// 클릭 수 증가 (비동기로 처리해도 됨)
	go h.service.RecordClick(code)

	c.Redirect(http.StatusMovedPermanently, url.Original)
}

// Stats GET /stats/:code - 통계 조회
func (h *URLHandler) Stats(c *gin.Context) {
	code := c.Param("code")

	url, err := h.service.GetByCode(code)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	c.JSON(http.StatusOK, model.StatsResponse{
		Code:      url.Code,
		Original:  url.Original,
		Clicks:    url.Clicks,
		CreatedAt: url.CreatedAt,
	})
}

package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/zion/url-shortener/internal/handler"
)

func main() {
	// .env 파일 로드
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Gin 라우터 생성
	r := gin.Default()

	// 헬스체크
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// URL Shortener 라우트
	urlHandler, err := handler.NewURLHandler(1) // workerID=1
	if err != nil {
		log.Fatal("Failed to create handler:", err)
	}
	r.POST("/shorten", urlHandler.Shorten)
	r.GET("/:code", urlHandler.Redirect)
	r.GET("/stats/:code", urlHandler.Stats)

	// 서버 시작
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

# CLAUDE.md

이 파일은 Claude Code가 프로젝트 컨텍스트를 파악하는 데 사용됩니다.

## 프로젝트 개요

Go/Spring 백엔드 학습용 모노레포. 여러 백엔드 프로젝트를 하나의 레포에서 관리.

## 진행 중인 프로젝트

### 1. url-shortener (Go) - 첫 번째 프로젝트
- **상태:** 설계 완료, 구현 시작 전
- **기능:** 긴 URL → 짧은 코드 변환, 리다이렉트, 클릭 통계
- **기술 스택:** Go + Gin/Echo + PostgreSQL + Redis

## 레포 구조 (계획)

```
hello-backend/
├── url-shortener/          # Go
│   ├── cmd/
│   ├── internal/
│   ├── Dockerfile
│   └── go.mod
│
├── (future) payment-service/  # Spring (나중에)
│
├── shared/                 # 공용 설정
│   ├── docker-compose.yml  # Redis, PostgreSQL 등
│   └── k8s/
│
├── .github/workflows/      # 폴더별 배포
└── README.md
```

## 배포

- GitHub Actions로 폴더별 배포 (path 필터 사용)
- 홈서버 (Docker + Kubernetes)

## 기술 스택

- **Go:** Gin 또는 Echo 프레임워크
- **DB:** PostgreSQL
- **Cache:** Redis
- **Container:** Docker
- **Orchestration:** Kubernetes (Minikube)

## 개발 명령어

```bash
# Go 프로젝트 (url-shortener/)
cd url-shortener
go run cmd/main.go      # 개발 서버
go build -o bin/app cmd/main.go  # 빌드
go test ./...           # 테스트

# Docker
docker-compose -f shared/docker-compose.yml up -d  # 인프라 실행
```

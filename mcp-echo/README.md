# MCP Echo - Wikipedia MCP 서버 프로젝트

## 프로젝트 개요

MCP(Model Context Protocol) 학습을 위한 실습 프로젝트.
Wikipedia API를 외부 데이터 소스로 활용해 MCP의 핵심 개념을 실습한다.

- **언어:** TypeScript
- **Transport:** Stdio (→ SSE 전환 예정)
- **외부 API:** Wikipedia REST API (인증 불필요)

---

## 구현 현황

### ✅ 완료

#### Tools

| Tool            | 설명                                                 |
| --------------- | ---------------------------------------------------- |
| `search`        | 키워드로 Wikipedia 문서 검색                         |
| `summary`       | 문서 요약(첫 단락) 반환                              |
| `extract`       | 문서 전체 본문 반환                                  |
| `smart_summary` | Wikipedia fetch 후 Claude에게 Sampling으로 요약 요청 |

#### Resources

- `wiki://{lang}/{title}` URI 형식으로 Wikipedia 문서를 리소스로 노출

#### Prompts

| Prompt           | 설명                |
| ---------------- | ------------------- |
| `explain-simple` | 주제를 쉽게 설명    |
| `compare`        | 두 주제를 표로 비교 |

#### 개발 환경

- MCP Inspector 연동 완료
- Claude Desktop 연동 완료 (Node 절대경로 설정)

---

### 🔲 예정

- [ ] SSE Transport 전환 (서버 재시작 없이 반영)
- [ ] 에러 핸들링 개선
- [ ] 한국어/영어 자동 감지

---

## 트러블슈팅

### Claude Desktop - Node 버전 문제

**원인:** Claude Desktop은 터미널 환경변수(nvm)를 읽지 않아 Node v14로 실행됨. Top-level `await` 미지원.

**해결:** `claude_desktop_config.json`에 Node 절대경로 지정

```json
{
  "mcpServers": {
    "wikipedia": {
      "command": "$(which node)",
      "args": ["/절대경로/mcp-echo/dist/index.js"]
    }
  }
}
```

---

## 개발 명령어

```bash
npm run build                                          # 빌드
npx @modelcontextprotocol/inspector node dist/index.js # Inspector 실행
```

Claude Desktop 서버 반영: 설정 → Developer → 서버 토글 OFF → ON

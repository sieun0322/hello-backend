import http from "node:http";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createWikipediaServer } from "./wikipedia.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// 세션별 transport 관리
const transports = new Map<string, StreamableHTTPServerTransport>();

const httpServer = http.createServer(async (req, res) => {
  if (req.url !== "/mcp") {
    res.writeHead(404).end("Not Found");
    return;
  }

  // GET: SSE 스트림 연결
  if (req.method === "GET") {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    const transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport) {
      res.writeHead(400).end("Invalid or missing session ID");
      return;
    }

    await transport.handleRequest(req, res);
    return;
  }

  // DELETE: 세션 종료
  if (req.method === "DELETE") {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId) {
      const transport = transports.get(sessionId);
      await transport?.close();
      transports.delete(sessionId);
    }
    res.writeHead(200).end();
    return;
  }

  // POST: MCP 메시지 처리
  if (req.method === "POST") {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport = sessionId ? transports.get(sessionId) : undefined;

    // 새 세션 생성 (initialize 요청)
    if (!transport) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });

      const mcpServer = createWikipediaServer();
      await mcpServer.connect(transport);

      transport.onclose = () => {
        if (transport!.sessionId) {
          transports.delete(transport!.sessionId);
        }
      };
    }

    // body 파싱 후 처리
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());

    await transport.handleRequest(req, res, body);

    // handleRequest 완료 후 sessionId가 설정됨 → 맵에 저장
    if (transport.sessionId && !transports.has(transport.sessionId)) {
      transports.set(transport.sessionId, transport);
    }

    return;
  }

  res.writeHead(405).end("Method Not Allowed");
});

httpServer.listen(PORT, () => {
  console.error(`Wikipedia MCP Server (SSE) running on http://localhost:${PORT}/mcp`);
});

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function createWikipediaServer(): McpServer {
  const server = new McpServer({
    name: "wikipedia-server",
    version: "1.0.0",
  });

  // Tool 1: 키워드로 문서 검색
  server.registerTool(
    "search",
    {
      description: "Wikipedia에서 키워드로 문서를 검색합니다",
      inputSchema: {
        keyword: z.string().describe("검색할 키워드"),
        lang: z.enum(["ko", "en"]).default("ko").describe("언어 (ko 또는 en)"),
      },
    },
    async ({ keyword, lang }) => {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}&format=json&origin=*&srlimit=5`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        query: { search: { title: string }[] };
      };
      const results = data.query.search.map((item, i) => `${i + 1}. ${item.title}`);
      return { content: [{ type: "text", text: results.join("\n") }] };
    }
  );

  // Tool 2: 문서 요약 가져오기
  server.registerTool(
    "summary",
    {
      description: "Wikipedia 문서의 요약(첫 단락)을 가져옵니다",
      inputSchema: {
        title: z.string().describe("Wikipedia 문서 제목"),
        lang: z.enum(["ko", "en"]).default("ko").describe("언어 (ko 또는 en)"),
      },
    },
    async ({ title, lang }) => {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.trim())}`;
      const res = await fetch(url);
      if (!res.ok) {
        return { content: [{ type: "text", text: `문서를 찾을 수 없습니다: ${title}` }] };
      }
      const data = (await res.json()) as {
        title: string;
        extract: string;
        content_urls: { desktop: { page: string } };
      };
      return {
        content: [{ type: "text", text: `# ${data.title}\n\n${data.extract}\n\n출처: ${data.content_urls.desktop.page}` }],
      };
    }
  );

  // Tool 3: 문서 본문 추출
  server.registerTool(
    "extract",
    {
      description: "Wikipedia 문서의 전체 본문을 가져옵니다",
      inputSchema: {
        title: z.string().describe("Wikipedia 문서 제목"),
        lang: z.enum(["ko", "en"]).default("ko").describe("언어 (ko 또는 en)"),
      },
    },
    async ({ title, lang }) => {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=false&titles=${encodeURIComponent(title.trim())}&format=json&origin=*&explaintext=true`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        query: { pages: Record<string, { title: string; extract: string }> };
      };
      const page = Object.values(data.query.pages)[0];
      if (!page.extract) {
        return { content: [{ type: "text", text: `본문을 찾을 수 없습니다: ${title}` }] };
      }
      const extract = page.extract.length > 3000
        ? page.extract.slice(0, 3000) + "\n\n...(이하 생략)"
        : page.extract;
      return { content: [{ type: "text", text: `# ${page.title}\n\n${extract}` }] };
    }
  );

  // Tool 4: Sampling - MCP 서버가 Claude에게 역으로 요약 요청
  server.registerTool(
    "smart_summary",
    {
      description: "Wikipedia 문서를 가져온 후, MCP 서버가 Claude에게 한 줄 요약을 역으로 요청합니다 (Sampling 데모)",
      inputSchema: {
        title: z.string().describe("Wikipedia 문서 제목"),
        lang: z.enum(["ko", "en"]).default("ko").describe("언어 (ko 또는 en)"),
      },
    },
    async ({ title, lang }) => {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.trim())}`;
      const res = await fetch(url);
      if (!res.ok) {
        return { content: [{ type: "text", text: `문서를 찾을 수 없습니다: ${title}` }] };
      }
      const data = (await res.json()) as { title: string; extract: string };

      const samplingResult = await server.server.createMessage({
        messages: [
          {
            role: "user",
            content: { type: "text", text: `다음 내용을 한 문장으로 요약해줘:\n\n${data.extract}` },
          },
        ],
        maxTokens: 200,
      });

      const claudeSummary = samplingResult.content.type === "text"
        ? samplingResult.content.text
        : "요약 실패";

      return {
        content: [{ type: "text", text: `## Claude의 한 줄 요약 (Sampling)\n${claudeSummary}\n\n## Wikipedia 원문\n${data.extract}` }],
      };
    }
  );

  // Resource: wiki://{lang}/{title}
  server.registerResource(
    "wikipedia-page",
    new ResourceTemplate("wiki://{lang}/{title}", { list: undefined }),
    {
      description: "wiki://ko/인공지능 형식으로 Wikipedia 문서에 접근합니다",
      mimeType: "text/plain",
    },
    async (uri: URL, variables: Record<string, string | string[]>) => {
      const lang = String(variables.lang ?? "ko");
      const title = String(variables.title ?? "");
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(url);
      if (!res.ok) {
        return { contents: [{ uri: uri.href, text: `문서를 찾을 수 없습니다: ${title}`, mimeType: "text/plain" }] };
      }
      const data = (await res.json()) as { title: string; extract: string };
      return { contents: [{ uri: uri.href, text: `# ${data.title}\n\n${data.extract}`, mimeType: "text/plain" }] };
    }
  );

  // Prompt 1: 쉽게 설명하기
  server.registerPrompt(
    "explain-simple",
    {
      description: "Wikipedia 문서를 찾아서 초등학생도 이해할 수 있게 설명하는 프롬프트",
      argsSchema: { topic: z.string().describe("설명할 주제") },
    },
    ({ topic }) => ({
      messages: [{
        role: "user",
        content: { type: "text", text: `Wikipedia에서 "${topic}"을 찾아서 초등학생도 이해할 수 있게 쉽게 설명해줘. 어려운 용어는 풀어서 설명하고, 실생활 예시를 들어줘.` },
      }],
    })
  );

  // Prompt 2: 두 주제 비교
  server.registerPrompt(
    "compare",
    {
      description: "두 주제를 Wikipedia에서 찾아서 비교하는 프롬프트",
      argsSchema: {
        topic1: z.string().describe("첫 번째 주제"),
        topic2: z.string().describe("두 번째 주제"),
      },
    },
    ({ topic1, topic2 }) => ({
      messages: [{
        role: "user",
        content: { type: "text", text: `Wikipedia에서 "${topic1}"과 "${topic2}"를 각각 찾아서 공통점과 차이점을 표로 정리해줘.` },
      }],
    })
  );

  // Tool 5: 오늘의 역사적 사건
  server.registerTool(
    "on_this_day",
    {
      description: "오늘 날짜에 일어난 역사적 사건들을 Wikipedia에서 가져옵니다",
      inputSchema: {
        lang: z.enum(["ko", "en"]).default("en").describe("언어 (ko 또는 en, 영어가 더 풍부함)"),
      },
    },
    async ({ lang }) => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();

      const url = `https://${lang}.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
      const res = await fetch(url);

      if (!res.ok) {
        return { content: [{ type: "text", text: "오늘의 사건을 가져오지 못했습니다." }] };
      }

      const data = (await res.json()) as {
        events: { year: number; text: string }[];
      };

      const events = data.events
        .slice(0, 5)
        .map((e) => `- **${e.year}년**: ${e.text}`)
        .join("\n");

      return {
        content: [{ type: "text", text: `## ${month}월 ${day}일의 역사적 사건\n\n${events}` }],
      };
    }
  );

  return server;
}

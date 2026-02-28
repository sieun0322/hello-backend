import type { Message } from "./types.js";
import { PREFIX } from "./types.js";

// 실제 Claude API 없이 agentic loop 흐름 시뮬레이션
// turn 0 → search 호출
// turn 1 → summary 호출 (search 결과 기반)
// turn 2 → 최종 답변

export type MockResponse =
  | { stop_reason: "tool_use"; tool_name: string; tool_id: string; tool_input: Record<string, string> }
  | { stop_reason: "end_turn"; text: string };

function lastToolResult(messages: Message[]): string {
  return messages.findLast(
    (m) => m.role === "user" && m.content.startsWith(PREFIX.toolResult)
  )?.content?.replace(PREFIX.toolResult, "").trim() ?? "";
}

export function mockClaude(messages: Message[]): MockResponse {
  const toolTurns = messages.filter((m) => m.content.startsWith(PREFIX.toolUse)).length;

  const lastQuestion = [...messages]
    .reverse()
    .find((m) => m.role === "user" && !m.content.startsWith(PREFIX.toolResult))
    ?.content ?? "";

  const keyword = lastQuestion
    .replace(/[이가을를은는]?\s*(뭐야|뭐임|무엇|알려줘|설명해줘).*/, "")
    .trim();

  if (toolTurns === 0) {
    return {
      stop_reason: "tool_use",
      tool_name: "search",
      tool_id: `mock-${Date.now()}-1`,
      tool_input: { keyword, lang: "ko" },
    };
  }

  if (toolTurns === 1) {
    const firstTitle = lastToolResult(messages)
      .split("\n")[0]
      ?.replace(/^\d+\.\s*/, "")
      .trim() ?? keyword;

    return {
      stop_reason: "tool_use",
      tool_name: "summary",
      tool_id: `mock-${Date.now()}-2`,
      tool_input: { title: firstTitle, lang: "ko" },
    };
  }

  const summaryResult = lastToolResult(messages);

  return {
    stop_reason: "end_turn",
    text: `${summaryResult.slice(0, 400)}${summaryResult.length > 400 ? "..." : ""}\n\n(Mock 응답 - 실제 API 연결 시 자연스러운 답변 생성)`,
  };
}

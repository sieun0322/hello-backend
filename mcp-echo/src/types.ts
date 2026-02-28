export type Role = "user" | "assistant";
export type Message = { role: Role; content: string };

export const PREFIX = {
  toolUse: "tool_use:",
  toolResult: "tool_result:",
} as const;

export function extractToolResult(content: unknown): string {
  const items = content as { type: string; text?: string }[];
  return items
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("\n");
}

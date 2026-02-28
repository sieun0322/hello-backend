import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as readline from "node:readline";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { mockClaude } from "./mock.js";
import { PREFIX, extractToolResult } from "./types.js";
import type { Message } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.resolve(__dirname, "../dist/index.js");

const DEBUG = process.env.DEBUG === "1";
const log = (...args: unknown[]) => { if (DEBUG) console.log(...args); };

// ── 명령어 ───────────────────────────────────────────────────
const COMMANDS = {
  exit: "/exit",
  reset: "/reset",
  tools: "/tools",
  history: "/history",
  window: "/window",
} as const;

// ── Conversation ─────────────────────────────────────────────
class Conversation {
  private messages: Message[] = [];
  private windowSize = 10;

  constructor(private mcpClient: Client) {}

  setWindow(n: number): void {
    this.windowSize = n;
    console.log(`window 크기: ${this.windowSize}\n`);
  }

  getWindowSize(): number {
    return this.windowSize;
  }

  reset(): void {
    this.messages = [];
    console.log("\n[새 대화 시작]\n");
  }

  private window(): Message[] {
    return this.messages.slice(-this.windowSize);
  }

  history(): void {
    if (this.messages.length === 0) {
      console.log("(대화 없음)\n");
      return;
    }
    console.log(`\n맥락 ${this.messages.length}개 메시지 (window: ${this.window().length}개):`);
    this.messages.forEach((m, i) => {
      const preview = m.content.slice(0, 80).replace(/\n/g, " ");
      console.log(`  [${i + 1}] ${m.role.padEnd(9)} │ ${preview}${m.content.length > 80 ? "..." : ""}`);
    });
    console.log();
  }

  async ask(question: string): Promise<void> {
    this.messages.push({ role: "user", content: question });

    let step = 0;
    log("─".repeat(50));

    while (true) {
      step++;
      log(`\n[Step ${step}] Claude 호출 (맥락 ${this.window().length}개 메시지)`);

      const response = mockClaude(this.window());

      if (response.stop_reason === "end_turn") {
        log(`[Step ${step}] end_turn → 답변 출력\n`);
        console.log("\n" + response.text);
        this.messages.push({ role: "assistant", content: response.text });
        break;
      }

      if (response.stop_reason === "tool_use") {
        log(`[Step ${step}] tool_use → ${response.tool_name}(${JSON.stringify(response.tool_input)})`);

        this.messages.push({ role: "assistant", content: `${PREFIX.toolUse}${response.tool_name}` });

        const result = await this.mcpClient.callTool({
          name: response.tool_name,
          arguments: response.tool_input as Record<string, unknown>,
        });

        const text = extractToolResult(result.content);
        log(`[Tool Result] ${text.slice(0, 120)}${text.length > 120 ? "..." : ""}`);

        this.messages.push({ role: "user", content: `${PREFIX.toolResult}${text}` });
      }
    }

    log("─".repeat(50));
  }
}

// ── MCP 연결 ─────────────────────────────────────────────────
const transport = new StdioClientTransport({ command: "node", args: [serverPath] });
const mcpClient = new Client({ name: "wikipedia-client", version: "1.0.0" });
await mcpClient.connect(transport);

const { tools } = await mcpClient.listTools();
console.log(`연결됨. Tool ${tools.length}개: ${tools.map((t) => t.name).join(", ")}`);
console.log(`명령어: ${COMMANDS.tools} (툴 목록), ${COMMANDS.history} (대화 맥락), ${COMMANDS.window} N (window 크기), ${COMMANDS.reset} (새 대화), ${COMMANDS.exit} (종료)\n`);

// ── CLI ──────────────────────────────────────────────────────
const conv = new Conversation(mcpClient);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let isClosed = false;

rl.on("close", async () => {
  isClosed = true;
  await mcpClient.close();
  process.exit(0);
});

function prompt(): void {
  if (isClosed) return;
  rl.question("> ", async (input) => {
    const q = input.trim();
    if (q === COMMANDS.exit) {
      rl.close();
      return;
    }
    if (q.startsWith(COMMANDS.window)) {
      const n = parseInt(q.slice(COMMANDS.window.length).trim());
      if (!isNaN(n) && n > 0) {
        conv.setWindow(n);
      } else {
        console.log(`현재 window 크기: ${conv.getWindowSize()} (변경: /window N)\n`);
      }
    } else if (q === COMMANDS.history) {
      conv.history();
    } else if (q === COMMANDS.tools) {
      tools.forEach((t) => console.log(`  ${t.name}: ${t.description}`));
      console.log();
    } else if (q === COMMANDS.reset) {
      conv.reset();
    } else if (q) {
      await conv.ask(q);
    }
    prompt();
  });
}

prompt();

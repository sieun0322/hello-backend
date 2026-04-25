# Claude API를 서비스에 붙이면서 — 스트리밍, 시뮬레이션 제어, 토큰 절약

## TL;DR

[이전 글](https://velog.io/@be_zion/Claude-API)에서 Claude API의 구조를 정리했다. 모델이 토큰을 순차적으로 생성하기 때문에 SSE가 자연스러운 선택이라는 것, REST + SSE가 gRPC보다 단순한 이유, Transformer의 Attention이 입력 전체를 한 번에 참조해 어느 위치의 토큰이든 관계를 계산할 수 있다는 것.

이번엔 그 이해를 실제 서비스에 직접 붙이면서 생긴 일들이다. AI로 알고리즘을 제어하는 패턴, SSE 파싱 구현, 토큰 절약까지.

---

## 1️⃣ AI로 알고리즘을 제어하는 패턴

이 서비스에 Claude API를 붙인 이유는 하나다. 사용자마다 요구사항이 다르기 때문이다.

"이 항목은 우선순위를 높여주세요", "특정 조건은 제외해주세요", "균형을 맞춰주세요" — 알고리즘은 이런 자연어 요청을 처리할 수 없다. 스트리밍 채팅 화면을 넣은 이유가 여기 있다. 사용자가 채팅으로 원하는 배치 방식을 전달하면, AI가 그 의도를 해석해 알고리즘에 전달하는 구조다.

전체 요청 흐름은 이렇다:

```
[사용자 채팅 입력]
    ↓
[프론트엔드]  POST /api/analyze  { type: "chat", messages, result }
    ↓
[서버]        system 블록 구성, 히스토리 트리밍
    ↓
[Anthropic]   POST /v1/messages  → SSE stream
    ↓
[서버]        청크 버퍼링 → <action> 태그 감지 전까지 실시간 포워딩 → 태그 추출
    ↓
[프론트엔드]  텍스트 실시간 렌더링 + 액션 버튼 노출
    ↓
[버튼 클릭]   제약 조건 → 알고리즘 재계산
```

여기서 AI와 알고리즘의 역할을 명확히 나눌 필요가 있었다.

**초기 배치는 알고리즘이 담당한다.** 여러 물리적 제약 조건을 동시에 만족해야 하는 최적화 문제는 NP-hard다. 처음부터 LLM에게 좌표를 계산하게 하면 모든 제약 조건을 동시에 만족하는 결과를 보장할 수 없다.

**수정 단계에서는 AI가 제약 조건을 생성하고, 알고리즘이 재계산한다.** 사용자 요청을 AI가 해석해 구조화된 액션으로 변환하면, 알고리즘이 그 조건을 반영해 다시 배치를 계산한다. 다음 단계로는 알고리즘이 계산한 실제 좌표를 AI에게 전달해, AI가 특정 요소의 위치 조정을 직접 제안하는 방식도 고려하고 있다.

```
[초기 배치]  알고리즘 → 유효한 좌표
[수정 단계]  사용자 요청 → LLM 해석 → 제약 조건 생성 → 알고리즘 재계산
[다음 단계]  기존 좌표 → LLM 분석 → 위치 조정 제안 → 적용
```

LLM이 생성할 수 있는 액션의 범위를 정의한다:

```typescript
type SimAction =
  | { type: "filter_options"; names: string[] }
  | { type: "apply_constraints"; constraints: ItemConstraint[] }
  | { type: "combined"; names?: string[]; constraints?: ItemConstraint[] };

interface ItemConstraint {
  itemName: string;
  mode: "prioritize" | "restrict" | "default";
}
```

**LLM이 선택할 수 있는 범위를 좁힐수록 엉뚱한 출력이 줄어든다.** 선택지는 처리 방식의 핵심 파라미터뿐이다. 현재 좌표 계산은 알고리즘이 담당하고, AI는 제약 조건 생성에만 관여한다.

### `<action>` 태그로 텍스트와 액션을 동시에

구조화된 출력 방식에는 선택지가 있다.

| 방식        | 장점                            | 단점                           |
| ----------- | ------------------------------- | ------------------------------ |
| JSON mode   | 스키마 강제                     | 스트리밍과 궁합 나쁨           |
| Tool use    | 명확한 구조                     | 텍스트+툴 블록 분리 처리 필요  |
| 커스텀 태그 | 스트리밍 유지, 텍스트+액션 동시 | 파싱 직접 구현                 |

커스텀 태그를 선택했다. `<action>` 태그가 응답 맨 끝에만 등장하기 때문에, 태그가 감지되기 전까지는 텍스트를 실시간으로 스트리밍하고 태그가 나타나는 순간부터만 누적한다. 스트리밍이 끝나면 파싱한 액션을 별도 이벤트로 전송한다. 텍스트 실시간 노출과 액션 버튼을 하나의 SSE 스트림에서 처리할 수 있다는 점이 이 방식의 핵심이다.

시스템 프롬프트에 형식을 명시한다:

```
응답 맨 끝에 반드시 아래 형식을 추가하세요.

<action>{"type":"apply_constraints","constraints":[{"itemName":"항목A","mode":"prioritize"}]}</action>

액션이 없으면: <action>null</action>
항목 이름은 최적화 결과에 나온 이름 그대로 사용하세요.
```

스트리밍이 완료된 후 전체 텍스트에서 태그를 추출한다:

```typescript
function parseAction(fullText: string): { text: string; action: unknown } {
  const match = fullText.match(/<action>([\s\S]*?)<\/action>/);
  if (!match) return { text: fullText, action: null };

  const text = fullText.replace(/<action>[\s\S]*?<\/action>/, "").trimEnd();
  try {
    return { text, action: JSON.parse(match[1].trim()) };
  } catch {
    return { text, action: null }; // 파싱 실패해도 텍스트는 정상 노출
  }
}
```

버튼을 누르면 제약 조건을 알고리즘에 전달해 재계산한다. AI가 판단하고 알고리즘이 실행한다.

---

## 2️⃣ SSE 파싱 구현

이전 글에서 SSE는 "토큰이 생성되는 즉시 전달되는 방식"이라고 정리했다. 이를 받으려면 요청에 `stream: true`를 포함해야 한다. Anthropic API 호출 코드다:

```typescript
const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-opus-4-6",
    max_tokens: 512,
    stream: true,
    cache_control: { type: "ephemeral" },
    system: [...],
    messages: [...],
  }),
});
```

API 키는 서버 환경변수로만 관리한다. 클라이언트에 노출되면 키가 탈취될 수 있기 때문에, 브라우저에서 Anthropic API를 직접 호출하는 구조는 피해야 한다.

응답은 SSE 스트림으로 온다. 실제로 파싱하면 이렇게 된다:

```typescript
const reader = aiRes.body!.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? ""; // 불완전한 마지막 줄은 다음 청크와 합침

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const raw = line.slice(6).trim();
    if (raw === "[DONE]") continue;

    const event = JSON.parse(raw);
    if (
      event.type === "content_block_delta" &&
      event.delta?.type === "text_delta"
    ) {
      res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
    }
  }
}
```

`lines.pop()`으로 마지막 줄을 다시 buffer에 보존하는 것이 핵심이다. 네트워크 청크는 줄 경계와 무관하게 도착한다. 불완전한 마지막 줄을 버퍼에 남겨 다음 청크와 합쳐야 파싱 오류가 없다. 이전 글에서 SSE를 이론으로 이해했다면, 이 버퍼 처리가 그 이론의 실전 구현이다.

---

## 3️⃣ 토큰 절약

동작은 됐는데 비용이 문제였다. 채팅마다 시스템 프롬프트가 통째로 전송되고, 대화가 길어질수록 히스토리가 누적된다.

### 프롬프트 캐싱

시스템 프롬프트란 AI의 역할과 출력 형식을 지정하는 고정된 지시문이다. 사용자 메시지와 달리 매 요청마다 동일하게 전송된다. 기존엔 이것을 첫 번째 `user` 메시지에 임베딩했다.

```typescript
// 기존 — 캐싱 불가. 메시지 배열이 매 요청마다 달라짐
messages: [
  { role: "user", content: `${systemPrompt}\n\n사용자: ${firstMessage}` },
  ...history,
];
```

Anthropic Messages API의 `role`은 `user`(사람)와 `assistant`(모델) 두 가지뿐이다. `system`은 별도 파라미터로 분리되어 있어 messages 배열에 들어갈 수 없다. 그래서 시스템 프롬프트를 messages에 넣으려면 첫 번째 `user` 메시지에 임베딩하는 수밖에 없었다.

이 방식은 캐싱이 불가능하다. Anthropic의 프롬프트 캐싱은 prefix가 고정되어야 작동하는데, 메시지 배열이 매 요청마다 달라지기 때문이다.

시스템 프롬프트를 `system` 파라미터로 분리하고, 변경 빈도가 다른 내용은 블록을 나눠 각각 breakpoint를 건다:

```typescript
body.system = [
  // breakpoint 1: 역할 정의 + 액션 형식 — 서비스 내내 고정
  { type: "text", text: staticInstructions, cache_control: { type: "ephemeral" } },
  // breakpoint 2: 최적화 결과 컨텍스트 — 세션 내에서 고정
  { type: "text", text: resultContext, cache_control: { type: "ephemeral" } },
];
```

두 블록은 독립적으로 캐싱된다. 결과 컨텍스트가 바뀌어도 정적 지시문 캐시는 유지된다.

캐시 히트 시 해당 토큰 요금이 약 10%로 줄어든다. 모델마다 캐싱 가능한 최소 토큰이 다르고(Opus 4.6 기준 4096 토큰), 최솟값 미만이면 오류 없이 조용히 스킵된다. system 블록의 총 토큰이 기준 미만이면 캐싱 자체가 작동하지 않으므로, 적용 후 `cache_read_input_tokens` 값으로 실제 히트 여부를 확인해야 한다.

### 대화 히스토리 자동 캐싱

요청 최상위에 `cache_control`을 추가하면 대화가 길어질수록 히스토리도 자동으로 캐싱된다:

```typescript
const body = {
  model, max_tokens: maxTokens, stream: true,
  cache_control: { type: "ephemeral" }, // 마지막 캐시 가능 블록에 자동 적용
  system: [...],
  messages: trimmedMessages,
};
```

매 턴마다 breakpoint가 자동으로 앞으로 이동한다. 대화가 쌓일수록 캐시에서 읽히는 비율이 높아진다.

### 히스토리 트리밍과 max_tokens 조정

```typescript
// 최근 4턴(8개 메시지)만 유지
const trimmed = messages.slice(-8);

// 응답 유형별 상한 분리
const maxTokens = type === "report" ? 1024 : 512;
```

대화 맥락은 대부분 최근 몇 턴에 있다. context window는 유한하고, 누적될수록 토큰 비용도 선형으로 늘어난다. 히스토리 트리밍은 오래된 맥락을 버리는 대신 비용을 줄이는 가장 단순한 방법이다.

---

## 마무리

이전 글에서 정리한 개념 — SSE가 토큰 생성 구조와 맞는 이유 — 이 실제 구현에서 그대로 나타났다. 이 글에서 새로 다룬 프롬프트 캐싱도 마찬가지다. prefix가 고정되어야 캐시가 작동한다는 원칙은, 구조를 이해하지 못하면 왜 안 되는지조차 알기 어렵다.

> 구조를 이해하면 디버깅이 빨라진다. "왜 이렇게 설계됐는가"를 알면 "왜 이렇게 동작하는가"가 예측 가능해진다.

다음엔 AI가 제안한 조건을 알고리즘이 실제로 반영하지 못하는 문제 — AI의 판단과 알고리즘의 제약이 충돌할 때 어떻게 조율하는지에 대한 이야기를 써볼 것 같다.

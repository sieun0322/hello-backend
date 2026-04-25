/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'http'

interface PackedBox {
  box: { name: string; width: number; depth: number; height: number; maxWeight: number }
  items: {
    product: { name: string; weight: number; fragile: boolean }
    position: { x: number; y: number; z: number }
    dims: { w: number; d: number; h: number }
  }[]
  totalWeight: number
  weightBalance: number  // 0~1: 1 = 완벽한 균형
}

interface PackingResult {
  boxes: PackedBox[]
  totalBoxes: number
  unpackable: { name: string }[]
}

interface AggregatedStats {
  period: string
  label: string
  totalSessions: number
  totalBoxes: number
  avgUtilization: number
  mostUsedBox: string
}

interface PatternData {
  sessions: {
    items: { product: { name: string }; quantity: number }[]
    result: {
      boxes: { box: { name: string }; items: { product: { name: string } }[] }[]
      avgUtilization: number
    }
  }[]
  availableBoxes: { name: string; width: number; depth: number; height: number; maxWeight: number }[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatData {
  result: PackingResult
  availableBoxNames: string[]
  messages: ChatMessage[]
}

// 채팅 히스토리 최대 메시지 수
const CHAT_HISTORY_LIMIT_FULL = 8   // 이동/시뮬레이션 관련 대화
const CHAT_HISTORY_LIMIT_SHORT = 4  // 단순 질문 대화

function calcUtilization(pb: PackedBox): number {
  const boxVol = pb.box.width * pb.box.depth * pb.box.height
  if (boxVol === 0) return 0
  const usedVol = pb.items.reduce((s, i) => s + i.dims.w * i.dims.d * i.dims.h, 0)
  return usedVol / boxVol
}

const ANCHORS = ['bottom-front-left','bottom-front-right','bottom-back-left','bottom-back-right','bottom-center',
  'top-front-left','top-front-right','top-back-left','top-back-right','top-center'] as const
type ItemAnchor = typeof ANCHORS[number]

function posToAnchor(pos: { x: number; y: number; z: number }, dims: { w: number; d: number; h: number }, box: { width: number; depth: number; height: number }): ItemAnchor {
  const xRatio = (pos.x + dims.w / 2) / box.width
  const zRatio = (pos.z + dims.d / 2) / box.depth
  const yRatio = (pos.y + dims.h / 2) / box.height

  const xLabel = xRatio < 0.4 ? 'left' : xRatio > 0.6 ? 'right' : 'center'
  const zLabel = zRatio < 0.4 ? 'front' : 'back'
  const yLabel = yRatio < 0.5 ? 'bottom' : 'top'

  if (xLabel === 'center' && zLabel === 'front') return `${yLabel}-center` as ItemAnchor
  return `${yLabel}-${zLabel}-${xLabel}` as ItemAnchor
}

// move_item 관련 키워드 — 위치 정보 포함 여부 판단
const MOVE_KEYWORDS = ['이동', '옮겨', '옮겨줘', '위치', '배치', '모서리', 'move', 'bottom-', 'top-']

function needsPositionInfo(lastUserMsg: string): boolean {
  return MOVE_KEYWORDS.some((k) => lastUserMsg.includes(k))
}

function resultSummary(result: PackingResult, includePosInfo = false): string {
  const lines: string[] = [`총 박스 수: ${result.totalBoxes}개`]
  result.boxes.forEach((pb, i) => {
    const util = calcUtilization(pb)
    const productCounts: Record<string, number> = {}
    for (const item of pb.items) {
      productCounts[item.product.name] = (productCounts[item.product.name] ?? 0) + 1
    }
    const productList = Object.entries(productCounts).map(([name, cnt]) => `${name}×${cnt}`).join(', ')
    lines.push(
      `박스 ${i + 1} (${pb.box.name}): [${productList}], ` +
      `무게 ${pb.totalWeight.toFixed(1)}/${pb.box.maxWeight}kg, ` +
      `공간 활용률 ${(util * 100).toFixed(0)}%, ` +
      `무게 균형 ${(pb.weightBalance * 100).toFixed(0)}%`
    )
    // 아이템별 위치 정보: move_item 관련 요청일 때만 포함
    if (includePosInfo) {
      for (const item of pb.items) {
        const anchor = posToAnchor(item.position, item.dims, pb.box)
        const fragileTag = item.product.fragile ? ' [파손주의]' : ''
        lines.push(`  - ${item.product.name}${fragileTag}: ${anchor}, 크기 ${item.dims.w}×${item.dims.d}×${item.dims.h}cm, 무게 ${item.product.weight}kg`)
      }
    }
  })
  if (result.unpackable.length > 0) {
    lines.push(`포장 불가 상품: ${result.unpackable.map((p) => p.name).join(', ')}`)
  }
  return lines.join('\n')
}

// instant/report/pattern: 정적 지시사항은 system(cached), 동적 데이터만 user message로 전송
const INSTANT_SYSTEM: SystemBlock[] = [{
  type: 'text',
  text: '당신은 3D 박스 포장 최적화 분석가입니다. 포장 결과를 분석하고 개선 제안을 3~5줄로 한국어로 작성하세요. 활용률이 낮은 박스, 더 적합한 박스 제안, 전체적인 효율 개선 방안을 중심으로 분석하세요.',
  cache_control: { type: 'ephemeral' },
}]

const REPORT_SYSTEM: SystemBlock[] = [{
  type: 'text',
  text: '당신은 포장 배송 통계 분석가입니다. 아래 통계 데이터를 마크다운 형식으로 분석 리포트를 작성하세요. 트렌드 분석, 효율성 평가, 개선 제안을 포함하세요.',
  cache_control: { type: 'ephemeral' },
}]

const PATTERN_SYSTEM: SystemBlock[] = [{
  type: 'text',
  text: '당신은 포장 최적화 컨설턴트입니다. 포장 히스토리를 분석하여 마크다운 리포트를 작성하세요. 비효율 패턴, 박스 추천, 개선 우선순위(임팩트 큰 순 3개)를 포함하세요.',
  cache_control: { type: 'ephemeral' },
}]

function buildInstantPrompt(result: PackingResult): string {
  return resultSummary(result)
}

function buildPatternPrompt(data: PatternData): string {
  const sessionLines = data.sessions.map((s, i) => {
    const items = s.items.map((oi) => `${oi.product.name}×${oi.quantity}`).join(', ')
    const boxes = s.result.boxes.map((pb) => pb.box.name).join(', ')
    const util = (s.result.avgUtilization * 100).toFixed(0)
    return `  세션 ${i + 1}: [${items}] → ${boxes}, 활용률 ${util}%`
  })
  const boxList = data.availableBoxes.map(
    (b) => `${b.name}(${b.width}×${b.depth}×${b.height}cm, 최대 ${b.maxWeight}kg)`
  ).join(', ')

  return [
    `## 포장 히스토리 (총 ${data.sessions.length}건)`,
    ...sessionLines,
    '',
    `## 현재 보유 박스: ${boxList}`,
  ].join('\n')
}

function buildReportPrompt(stats: AggregatedStats): string {
  return [
    `기간: ${stats.label}`,
    `총 포장 횟수: ${stats.totalSessions}회`,
    `총 사용 박스: ${stats.totalBoxes}개`,
    `평균 공간 활용률: ${(stats.avgUtilization * 100).toFixed(1)}%`,
    `최다 사용 박스: ${stats.mostUsedBox}`,
  ].join('\n')
}

type SystemBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }
type MsgContent = string | { type: 'text'; text: string; cache_control: { type: 'ephemeral' } }[]

// system을 세 블록으로 분리:
//   block 1 (cached): 정적 지시사항 — 절대 안 바뀜
//   block 2 (cached): 박스 종류 목록 — 재고 변경 시만 무효화
//   block 3 (uncached): 포장 결과 — 시뮬레이션마다 바뀌므로 캐싱 효용 낮음
function buildChatPayload(data: ChatData): { system: SystemBlock[]; messages: { role: string; content: MsgContent }[] } {
  // block 1: 역할 정의 + 액션 형식
  const staticInstructions = [
    '당신은 3D 박스 포장 최적화 어시스턴트입니다. 한국어로 응답하세요.',
    '',
    '사용자 요청에 텍스트로 답변한 뒤, 시뮬레이션 가능하면 응답 맨 끝에 반드시 아래 형식 중 하나를 추가하세요.',
    '',
    '1. 박스 종류 변경: <action>{"type":"filter_boxes","names":["박스이름"]}</action>',
    '2. 상품 배치 방향 제약: <action>{"type":"constrain_pack","constraints":[{"productName":"상품이름","rotation":"flat"}]}</action>',
    '   rotation: "flat"(넓은 면이 바닥),"tall"(좁은 면이 바닥),"natural"(원래 방향)',
    '3. 박스+방향 동시: <action>{"type":"combined","names":["박스이름"],"constraints":[{"productName":"상품이름","rotation":"flat"}]}</action>',
    '4. 아이템 이동: <action>{"type":"move_item","moves":[{"productName":"상품이름","fromBoxIndex":0,"toBoxIndex":0,"anchor":"bottom-front-left","rotation":"flat"}]}</action>',
    '   anchor(선택): bottom/top + front/back + left/right/center 조합. 생략 시 알고리즘 자동 선택.',
    '   fromBoxIndex/toBoxIndex는 0-based. 같은 박스 내 이동 가능. 복수 이동 가능.',
    '액션 없으면: <action>null</action>',
    '박스·상품 이름은 컨텍스트에 나온 이름 그대로 사용.',
  ].join('\n')

  // block 2: 박스 종류 목록 (자주 안 바뀜)
  const boxList = `사용 가능한 박스 종류: ${data.availableBoxNames.join(', ')}`

  // block 3: 포장 결과 (시뮬레이션마다 바뀌므로 캐싱 안 함)
  const lastUserMsg = data.messages.findLast((m) => m.role === 'user')?.content ?? ''
  const posInfo = needsPositionInfo(lastUserMsg)
  const resultBlock = `현재 포장 결과:\n${resultSummary(data.result, posInfo)}`

  // 이동/시뮬레이션 요청이면 히스토리 8개, 단순 질문이면 4개
  const historyLimit = posInfo ? CHAT_HISTORY_LIMIT_FULL : CHAT_HISTORY_LIMIT_SHORT
  const trimmed = data.messages.length > historyLimit
    ? data.messages.slice(-historyLimit)
    : data.messages

  // [개선 3] assistant 메시지에서 <action> 태그 제거 (이미 실행된 것은 히스토리에 불필요)
  // [개선 1] 마지막 assistant turn에 cache_control 적용 (히스토리 캐싱)
  const messages = trimmed.map(({ role, content }, i) => {
    const cleaned = role === 'assistant'
      ? content.replace(/<action>[\s\S]*?<\/action>/g, '').trimEnd()
      : content
    // 마지막 user 메시지 직전(= 마지막 assistant turn)에 캐시 브레이크포인트
    const isLastAssistant = role === 'assistant' && i === trimmed.length - 2
    if (isLastAssistant && trimmed.length >= 2) {
      return { role, content: [{ type: 'text' as const, text: cleaned, cache_control: { type: 'ephemeral' as const } }] }
    }
    return { role, content: cleaned }
  })

  return {
    system: [
      { type: 'text', text: staticInstructions, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: boxList, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: resultBlock },  // 캐싱 안 함
    ],
    messages,
  }
}

function parseAction(fullText: string): { text: string; action: unknown } {
  const match = fullText.match(/<action>([\s\S]*?)<\/action>/)
  if (!match) return { text: fullText, action: null }

  const text = fullText.replace(/<action>[\s\S]*?<\/action>/, '').trimEnd()
  try {
    const action = JSON.parse(match[1].trim())
    return { text, action }
  } catch {
    return { text, action: null }
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => { data += chunk.toString() })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

async function streamFromAnthropic(
  messages: ChatMessage[],
  apiUrl: string, apiKey: string, apiVersion: string, model: string,
  res: ServerResponse,
  withAction: boolean,
  system?: SystemBlock[],
  maxTokens = 512
) {
  const body: Record<string, unknown> = {
    model, max_tokens: maxTokens, stream: true, messages,
  }

  if (system) {
    body.system = system
  }

  const aiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': apiVersion,
      'anthropic-beta': 'prompt-caching-2024-07-31',
    },
    body: JSON.stringify(body),
  })

  if (!aiRes.ok) {
    const errBody = await aiRes.text()
    res.writeHead(502, { 'Content-Type': 'text/plain' })
    res.end(`AI API error ${aiRes.status}: ${errBody}`)
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const reader = aiRes.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''
  let sentUpTo = 0      // 프론트로 전송한 텍스트 길이
  let actionStarted = false  // <action> 태그 감지 여부

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') continue
        try {
          const event = JSON.parse(raw)
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            fullText += event.delta.text

            if (!withAction) {
              res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            } else if (!actionStarted) {
              const actionIdx = fullText.indexOf('<action>')
              if (actionIdx === -1) {
                // <action> 태그 미감지 — 실시간 전송
                res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                sentUpTo = fullText.length
              } else {
                // <action> 태그 감지 — 태그 이전 텍스트만 전송 후 누적 모드로 전환
                actionStarted = true
                const toSend = fullText.slice(sentUpTo, actionIdx)
                if (toSend) res.write(`data: ${JSON.stringify({ text: toSend })}\n\n`)
              }
            }
          }
        } catch { /* 무시 */ }
      }
    }
  } finally {
    reader.releaseLock()
  }

  if (withAction) {
    const { action } = parseAction(fullText)
    res.write(`data: ${JSON.stringify({ action })}\n\n`)
  }

  res.write('data: [DONE]\n\n')
  res.end()
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain' })
    return res.end('Method Not Allowed')
  }

  const allowedOrigin = process.env.ALLOWED_ORIGIN
  const origin = req.headers['origin'] as string | undefined
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    return res.end('Forbidden')
  }

  const bodyText = await readBody(req)
  if (bodyText.length > 20_000) {
    res.writeHead(413, { 'Content-Type': 'text/plain' })
    return res.end('Payload Too Large')
  }

  let type: string
  let data: PackingResult | AggregatedStats | ChatData | PatternData
  try {
    const parsed = JSON.parse(bodyText)
    type = parsed.type
    data = parsed.data
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    return res.end('Bad Request')
  }

  const apiUrl = process.env.ANTHROPIC_API_URL
  const apiKey = process.env.ANTHROPIC_API_KEY
  const apiVersion = process.env.ANTHROPIC_API_VERSION
  const modelMain = process.env.ANTHROPIC_MODEL
  // 분석 전용(action 불필요) 타입에 사용할 빠른 모델 (미설정 시 main 모델로 fallback)
  const modelFast = process.env.ANTHROPIC_MODEL_FAST ?? modelMain

  if (!apiUrl || !apiKey || !apiVersion || !modelMain) {
    const missing = [
      !apiUrl && 'ANTHROPIC_API_URL',
      !apiKey && 'ANTHROPIC_API_KEY',
      !apiVersion && 'ANTHROPIC_API_VERSION',
      !modelMain && 'ANTHROPIC_MODEL',
    ].filter(Boolean).join(', ')
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    return res.end(`Missing env vars: ${missing}`)
  }

  if (type === 'chat') {
    // 채팅은 action JSON을 정확히 생성해야 하므로 항상 main 모델 사용
    const { system, messages } = buildChatPayload(data as ChatData)
    await streamFromAnthropic(messages, apiUrl, apiKey, apiVersion, modelMain, res, true, system, 512)
    return
  }

  // instant/report/pattern: 순수 텍스트 분석 → fast 모델 + cached system block
  const { prompt, system, maxTokens } =
    type === 'instant' ? {
      prompt: buildInstantPrompt(data as PackingResult),
      system: INSTANT_SYSTEM,
      maxTokens: 512,
    } :
    type === 'pattern' ? {
      prompt: buildPatternPrompt(data as PatternData),
      system: PATTERN_SYSTEM,
      maxTokens: 1024,
    } : {
      prompt: buildReportPrompt(data as AggregatedStats),
      system: REPORT_SYSTEM,
      maxTokens: 1024,
    }

  await streamFromAnthropic(
    [{ role: 'user', content: prompt }],
    apiUrl, apiKey, apiVersion, modelFast!, res, false, system, maxTokens
  )
}

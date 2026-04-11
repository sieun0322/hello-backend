/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'http'

interface PackedBox {
  box: { name: string; width: number; depth: number; height: number; maxWeight: number }
  items: { dims: { w: number; d: number; h: number } }[]
  totalWeight: number
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

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatData {
  result: PackingResult
  availableBoxNames: string[]
  messages: ChatMessage[]
}

function calcUtilization(pb: PackedBox): number {
  const boxVol = pb.box.width * pb.box.depth * pb.box.height
  if (boxVol === 0) return 0
  const usedVol = pb.items.reduce((s, i) => s + i.dims.w * i.dims.d * i.dims.h, 0)
  return usedVol / boxVol
}

function resultSummary(result: PackingResult): string {
  const lines: string[] = [`총 박스 수: ${result.totalBoxes}개`]
  result.boxes.forEach((pb, i) => {
    const util = calcUtilization(pb)
    lines.push(
      `박스 ${i + 1} (${pb.box.name}): 상품 ${pb.items.length}개, ` +
      `무게 ${pb.totalWeight.toFixed(1)}/${pb.box.maxWeight}kg, ` +
      `공간 활용률 ${(util * 100).toFixed(0)}%`
    )
  })
  if (result.unpackable.length > 0) {
    lines.push(`포장 불가 상품: ${result.unpackable.map((p) => p.name).join(', ')}`)
  }
  return lines.join('\n')
}

function buildInstantPrompt(result: PackingResult): string {
  return [
    '아래는 3D 박스 포장 최적화 결과입니다. 이 결과를 분석하고 개선 제안을 3~5줄로 한국어로 작성하세요.',
    '',
    resultSummary(result),
    '',
    '활용률이 낮은 박스, 더 적합한 박스 제안, 전체적인 효율 개선 방안을 중심으로 분석하세요.',
  ].join('\n')
}

function buildReportPrompt(stats: AggregatedStats): string {
  return [
    `아래는 ${stats.label} 기간의 포장 배송 통계입니다. 마크다운 형식으로 분석 리포트를 작성하세요.`,
    '',
    `- 기간: ${stats.label}`,
    `- 총 포장 횟수: ${stats.totalSessions}회`,
    `- 총 사용 박스: ${stats.totalBoxes}개`,
    `- 평균 공간 활용률: ${(stats.avgUtilization * 100).toFixed(1)}%`,
    `- 최다 사용 박스: ${stats.mostUsedBox}`,
    '',
    '트렌드 분석, 효율성 평가, 개선 제안을 포함하여 작성하세요.',
  ].join('\n')
}

function buildChatMessages(data: ChatData): ChatMessage[] {
  const system = [
    '당신은 3D 박스 포장 최적화 어시스턴트입니다. 한국어로 응답하세요.',
    '',
    '현재 포장 결과:',
    resultSummary(data.result),
    '',
    `사용 가능한 박스 종류: ${data.availableBoxNames.join(', ')}`,
    '',
    '사용자 요청에 텍스트로 답변한 뒤, 시뮬레이션 가능하면 응답 맨 끝에 반드시 아래 형식 중 하나를 추가하세요.',
    '',
    '1. 박스 종류 변경: <action>{"type":"filter_boxes","names":["박스이름"]}</action>',
    '2. 상품 배치 방향 제약: <action>{"type":"constrain_pack","constraints":[{"productName":"상품이름","rotation":"flat"}]}</action>',
    '   rotation 값: "flat"(넓은 면이 바닥), "tall"(좁은 면이 바닥/세우기), "natural"(원래 치수 방향 유지)',
    '3. 박스 + 방향 동시 변경: <action>{"type":"combined","names":["박스이름"],"constraints":[{"productName":"상품이름","rotation":"flat"}]}</action>',
    '시뮬레이션 액션이 없으면: <action>null</action>',
    '박스 이름은 사용 가능한 박스 종류 목록에 있는 이름만 사용하세요.',
    '상품 이름은 포장 결과에 나온 이름 그대로 사용하세요.',
  ].join('\n')

  // system 메시지를 첫 번째 user 메시지 앞에 prepend
  const first = data.messages[0]
  const rest = data.messages.slice(1)

  return [
    { role: 'user', content: `${system}\n\n사용자: ${first.content}` },
    ...rest,
  ]
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
  withAction: boolean
) {
  const aiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': apiVersion,
    },
    body: JSON.stringify({ model, max_tokens: 1024, stream: true, messages }),
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
            }
          }
        } catch { /* 무시 */ }
      }
    }
  } finally {
    reader.releaseLock()
  }

  if (withAction) {
    const { text, action } = parseAction(fullText)
    res.write(`data: ${JSON.stringify({ text })}\n\n`)
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
  let data: PackingResult | AggregatedStats | ChatData
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
  const model = process.env.ANTHROPIC_MODEL

  if (!apiUrl || !apiKey || !apiVersion || !model) {
    const missing = [
      !apiUrl && 'ANTHROPIC_API_URL',
      !apiKey && 'ANTHROPIC_API_KEY',
      !apiVersion && 'ANTHROPIC_API_VERSION',
      !model && 'ANTHROPIC_MODEL',
    ].filter(Boolean).join(', ')
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    return res.end(`Missing env vars: ${missing}`)
  }

  if (type === 'chat') {
    const messages = buildChatMessages(data as ChatData)
    await streamFromAnthropic(messages, apiUrl, apiKey, apiVersion, model, res, true)
    return
  }

  const prompt =
    type === 'instant'
      ? buildInstantPrompt(data as PackingResult)
      : buildReportPrompt(data as AggregatedStats)

  await streamFromAnthropic(
    [{ role: 'user', content: prompt }],
    apiUrl, apiKey, apiVersion, model, res, false
  )
}

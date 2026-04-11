export const config = { runtime: 'edge' }

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

function calcUtilization(pb: PackedBox): number {
  const boxVol = pb.box.width * pb.box.depth * pb.box.height
  if (boxVol === 0) return 0
  const usedVol = pb.items.reduce((s, i) => s + i.dims.w * i.dims.d * i.dims.h, 0)
  return usedVol / boxVol
}

function buildInstantPrompt(result: PackingResult): string {
  const lines: string[] = [
    '아래는 3D 박스 포장 최적화 결과입니다. 이 결과를 분석하고 개선 제안을 3~5줄로 한국어로 작성하세요.',
    '',
    `총 박스 수: ${result.totalBoxes}개`,
  ]
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
  lines.push('', '활용률이 낮은 박스, 더 적합한 박스 제안, 전체적인 효율 개선 방안을 중심으로 분석하세요.')
  return lines.join('\n')
}

function buildReportPrompt(stats: AggregatedStats): string {
  const lines: string[] = [
    `아래는 ${stats.label} 기간의 포장 배송 통계입니다. 마크다운 형식으로 분석 리포트를 작성하세요.`,
    '',
    `- 기간: ${stats.label}`,
    `- 총 포장 횟수: ${stats.totalSessions}회`,
    `- 총 사용 박스: ${stats.totalBoxes}개`,
    `- 평균 공간 활용률: ${(stats.avgUtilization * 100).toFixed(1)}%`,
    `- 최다 사용 박스: ${stats.mostUsedBox}`,
    '',
    '트렌드 분석, 효율성 평가, 개선 제안을 포함하여 작성하세요.',
  ]
  return lines.join('\n')
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const allowedOrigin = process.env.ALLOWED_ORIGIN
  const origin = req.headers.get('origin')
  if (allowedOrigin && origin !== allowedOrigin) {
    return new Response('Forbidden', { status: 403 })
  }

  const bodyText = await req.text()
  if (bodyText.length > 10_000) {
    return new Response('Payload Too Large', { status: 413 })
  }

  let type: string
  let data: PackingResult | AggregatedStats
  try {
    const parsed = JSON.parse(bodyText)
    type = parsed.type
    data = parsed.data
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const prompt =
    type === 'instant'
      ? buildInstantPrompt(data as PackingResult)
      : buildReportPrompt(data as AggregatedStats)

  const apiUrl = process.env.ANTHROPIC_API_URL
  const apiKey = process.env.ANTHROPIC_API_KEY
  const apiVersion = process.env.ANTHROPIC_API_VERSION
  const model = process.env.ANTHROPIC_MODEL

  if (!apiUrl || !apiKey || !apiVersion || !model) {
    return new Response('Server configuration error', { status: 500 })
  }

  const aiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': apiVersion,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!aiRes.ok) {
    return new Response('AI API error', { status: 502 })
  }

  const aiJson = await aiRes.json() as { content?: { type: string; text: string }[] }
  const text = aiJson.content?.find((b) => b.type === 'text')?.text ?? '분석 결과를 가져올 수 없습니다.'

  return new Response(JSON.stringify({ analysis: text }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

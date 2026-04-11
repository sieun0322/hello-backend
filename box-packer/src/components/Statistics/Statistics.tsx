import { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { useHistoryStore } from '../../store/historyStore'
import type { PackingSession, AggregatedStats } from '../../types'

type Period = 'daily' | 'monthly' | 'yearly'

function calcUtilization(session: PackingSession): number {
  if (session.result.boxes.length === 0) return 0
  const utils = session.result.boxes.map((pb) => {
    const boxVol = pb.box.width * pb.box.depth * pb.box.height
    if (boxVol === 0) return 0
    const usedVol = pb.items.reduce((s, i) => s + i.dims.w * i.dims.d * i.dims.h, 0)
    return usedVol / boxVol
  })
  return utils.reduce((a, b) => a + b, 0) / utils.length
}

function periodLabel(session: PackingSession, period: Period): string {
  const d = new Date(session.createdAt)
  if (period === 'daily') return d.toISOString().slice(0, 10)
  if (period === 'monthly') return d.toISOString().slice(0, 7)
  return String(d.getFullYear())
}

function aggregate(sessions: PackingSession[], period: Period): AggregatedStats | null {
  if (sessions.length === 0) return null

  const totalBoxes = sessions.reduce((s, ss) => s + ss.result.totalBoxes, 0)
  const avgUtilization =
    sessions.reduce((s, ss) => s + calcUtilization(ss), 0) / sessions.length

  // 가장 많이 쓴 박스
  const boxCount: Record<string, number> = {}
  for (const ss of sessions) {
    for (const pb of ss.result.boxes) {
      boxCount[pb.box.name] = (boxCount[pb.box.name] ?? 0) + 1
    }
  }
  const mostUsedBox =
    Object.entries(boxCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

  // 기간 라벨
  const labels = sessions.map((s) => periodLabel(s, period))
  const minLabel = labels.reduce((a, b) => (a < b ? a : b))
  const maxLabel = labels.reduce((a, b) => (a > b ? a : b))
  const label = minLabel === maxLabel ? minLabel : `${minLabel} ~ ${maxLabel}`

  return { period, label, totalSessions: sessions.length, totalBoxes, avgUtilization, mostUsedBox, sessions }
}

function filterByPeriod(sessions: PackingSession[], period: Period): PackingSession[] {
  const now = new Date()
  return sessions.filter((s) => {
    const d = new Date(s.createdAt)
    if (period === 'daily') {
      return d.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
    }
    if (period === 'monthly') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }
    return d.getFullYear() === now.getFullYear()
  })
}

function exportToExcel(stats: AggregatedStats) {
  const wb = XLSX.utils.book_new()

  // 시트 1: 세션 상세
  const detail = stats.sessions.map((s) => ({
    날짜: new Date(s.createdAt).toLocaleString('ko-KR'),
    박스수: s.result.totalBoxes,
    상품종류수: s.items.length,
    총상품수: s.items.reduce((a, i) => a + i.quantity, 0),
    평균활용률: `${(calcUtilization(s) * 100).toFixed(1)}%`,
    총무게: s.result.boxes.reduce((a, pb) => a + pb.totalWeight, 0).toFixed(1) + 'kg',
    포장불가: s.result.unpackable.map((p) => p.name).join(', ') || '없음',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detail), '세션 상세')

  // 시트 2: 기간 집계
  const summary = [{
    기간: stats.label,
    총세션수: stats.totalSessions,
    총박스수: stats.totalBoxes,
    평균활용률: `${(stats.avgUtilization * 100).toFixed(1)}%`,
    최다사용박스: stats.mostUsedBox,
  }]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), '기간 집계')

  const filename = `box-packer-${stats.period}-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}

export function Statistics() {
  const { sessions, clearHistory } = useHistoryStore()
  const [period, setPeriod] = useState<Period>('monthly')
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const filtered = useMemo(() => filterByPeriod(sessions, period), [sessions, period])
  const stats = useMemo(() => aggregate(filtered, period), [filtered, period])

  async function handleGenerateReport() {
    if (!stats) return
    setAiLoading(true)
    setAiError(null)
    setAiReport(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report',
          data: {
            period: stats.period,
            label: stats.label,
            totalSessions: stats.totalSessions,
            totalBoxes: stats.totalBoxes,
            avgUtilization: stats.avgUtilization,
            mostUsedBox: stats.mostUsedBox,
          },
        }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const json = await res.json() as { analysis: string }
      setAiReport(json.analysis)
    } catch {
      setAiError('리포트 생성에 실패했습니다. 잠시 후 다시 시도하세요.')
    } finally {
      setAiLoading(false)
    }
  }

  const PERIOD_LABELS: Record<Period, string> = { daily: '일간', monthly: '월간', yearly: '연간' }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm">포장 계산을 실행하면 여기에 통계가 쌓입니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">배송 통계</h2>
        <button
          onClick={clearHistory}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors"
        >
          기록 초기화
        </button>
      </div>

      {/* 기간 선택 */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
        {(['daily', 'monthly', 'yearly'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => { setPeriod(p); setAiReport(null) }}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              period === p ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          이번 {PERIOD_LABELS[period]} 포장 기록이 없습니다.
        </p>
      ) : (
        <>
          {/* 집계 카드 */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '총 포장 횟수', value: `${stats!.totalSessions}회` },
              { label: '총 박스 수', value: `${stats!.totalBoxes}개` },
              { label: '평균 공간 활용률', value: `${(stats!.avgUtilization * 100).toFixed(1)}%` },
              { label: '최다 사용 박스', value: stats!.mostUsedBox },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-base font-semibold text-white mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* 세션 목록 */}
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-400">포장 기록 ({filtered.length}건)</p>
            </div>
            <div className="divide-y divide-gray-800 max-h-48 overflow-y-auto">
              {filtered.map((s) => (
                <div key={s.id} className="px-4 py-2 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>박스 {s.result.totalBoxes}개</span>
                    <span>{(calcUtilization(s) * 100).toFixed(0)}% 활용</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={aiLoading}
              className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
            >
              {aiLoading ? 'AI 리포트 생성 중...' : 'AI 리포트 생성'}
            </button>
            <button
              onClick={() => stats && exportToExcel(stats)}
              className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg transition-colors"
            >
              엑셀 내보내기
            </button>
          </div>

          {/* AI 리포트 */}
          {aiError && (
            <p className="text-xs text-red-400">{aiError}</p>
          )}
          {aiReport && (
            <div className="border border-indigo-900 bg-indigo-950/30 rounded-xl p-4">
              <p className="text-xs font-medium text-indigo-400 mb-2">AI 분석 리포트</p>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{aiReport}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

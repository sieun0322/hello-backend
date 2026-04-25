import { useEffect, useRef, useState } from 'react'

interface Props {
  total: number                        // 전체 상품 수
  visibleCount: number
  onVisibleCountChange: (n: number) => void
}

const SPEEDS = [
  { label: '0.5×', ms: 800 },
  { label: '1×',   ms: 400 },
  { label: '2×',   ms: 200 },
]

export function AnimationControls({ total, visibleCount, onVisibleCountChange }: Props) {
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 재생 중 자동 진행
  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    // 끝에 도달하면 자동 정지
    if (visibleCount >= total) {
      setPlaying(false)
      return
    }
    intervalRef.current = setInterval(() => {
      onVisibleCountChange(Math.min(visibleCount + 1, total))
    }, SPEEDS[speedIdx].ms)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, visibleCount, speedIdx, total])

  function handlePlay() {
    if (visibleCount >= total) onVisibleCountChange(0)
    setPlaying(true)
  }

  function handleReset() {
    setPlaying(false)
    onVisibleCountChange(0)
  }

  return (
    <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-800 rounded-lg px-3 py-2">
      {/* 재생/일시정지 */}
      {playing ? (
        <button
          onClick={() => setPlaying(false)}
          className="w-7 h-7 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
          title="일시정지"
        >
          ⏸
        </button>
      ) : (
        <button
          onClick={handlePlay}
          className="w-7 h-7 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors"
          title="재생"
        >
          ▶
        </button>
      )}

      {/* 처음으로 */}
      <button
        onClick={handleReset}
        className="w-7 h-7 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
        title="처음으로"
      >
        ↺
      </button>

      {/* 진행 슬라이더 */}
      <input
        type="range"
        min={0}
        max={total}
        value={visibleCount}
        onChange={(e) => { setPlaying(false); onVisibleCountChange(Number(e.target.value)) }}
        className="flex-1 accent-indigo-500 h-1"
      />

      {/* 카운터 */}
      <span className="text-xs text-gray-400 w-10 text-right shrink-0">
        {visibleCount}/{total}
      </span>

      {/* 속도 */}
      <div className="flex gap-1">
        {SPEEDS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSpeedIdx(i)}
            className={`text-[11px] px-1.5 py-0.5 rounded transition-colors ${
              speedIdx === i ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

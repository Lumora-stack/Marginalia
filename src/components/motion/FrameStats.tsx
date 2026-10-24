import { useEffect, useState } from 'react'

type FrameStats = { fps: number; frameMs: number; p95: number }

function debugIsEnabled() {
  return new URLSearchParams(window.location.search).get('debug') === '1'
}

export default function FrameStats() {
  const [enabled, setEnabled] = useState(() => import.meta.env.DEV && debugIsEnabled())
  const [stats, setStats] = useState<FrameStats>({ fps: 0, frameMs: 0, p95: 0 })

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const updateEnabled = () => setEnabled(debugIsEnabled())
    window.addEventListener('popstate', updateEnabled)
    return () => window.removeEventListener('popstate', updateEnabled)
  }, [])

  useEffect(() => {
    if (!enabled) return
    let frameId = 0
    let previous = performance.now()
    let reportAt = previous
    const samples: number[] = []
    let active = false

    const sample = (now: number) => {
      if (!active) return
      const frameMs = now - previous
      previous = now
      if (frameMs > 0 && frameMs < 1000) samples.push(frameMs)
      if (now - reportAt >= 500 && samples.length) {
        const ordered = [...samples].sort((a, b) => a - b)
        const average = samples.reduce((sum, value) => sum + value, 0) / samples.length
        setStats({
          fps: Math.round(1000 / average),
          frameMs: Math.round(average * 10) / 10,
          p95: Math.round(ordered[Math.floor((ordered.length - 1) * 0.95)] * 10) / 10,
        })
        samples.length = 0
        reportAt = now
      }
      frameId = requestAnimationFrame(sample)
    }

    const start = () => {
      if (document.hidden || active) return
      active = true
      previous = performance.now()
      reportAt = previous
      samples.length = 0
      frameId = requestAnimationFrame(sample)
    }
    const stop = () => {
      active = false
      cancelAnimationFrame(frameId)
    }
    const handleVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', handleVisibility)
    start()
    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <output
      aria-label="Development frame-time monitor"
      className="fixed bottom-3 left-3 z-[10001] rounded-md border border-emerald-300/50 bg-black/85 px-2.5 py-1.5 font-mono text-[10px] leading-relaxed text-emerald-200 shadow-lg"
    >
      FPS {stats.fps} · {stats.frameMs} ms · p95 {stats.p95} ms
    </output>
  )
}

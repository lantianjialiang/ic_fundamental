import { useCallback, useEffect, useRef, useState } from 'react'

const DURATION_MS = 1000

function easeOutQuad(t: number): number {
  return t * (2 - t)
}

/** progress: 0 = 装配，1 = 爆炸。约 1 秒平滑过渡，禁止瞬跳。 */
export function useAssembly(durationMs = DURATION_MS) {
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const animateTo = useCallback(
    (target: number) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      const startedAt = performance.now()
      const from = progressRef.current

      const tick = (now: number) => {
        const t = Math.min(1, (now - startedAt) / durationMs)
        const next = from + (target - from) * easeOutQuad(t)
        progressRef.current = next
        setProgress(next)
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          rafRef.current = null
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    },
    [durationMs],
  )

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return {
    progress,
    explode: () => animateTo(1),
    assemble: () => animateTo(0),
  }
}

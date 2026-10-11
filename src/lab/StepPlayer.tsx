import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/LocaleContext'
import { loc, type LText } from '../i18n/locale'

const L = {
  next: loc('下一步', 'Next'),
  play: loc('自动播放', 'Play'),
  pause: loc('暂停', 'Pause'),
  reset: loc('重来', 'Reset'),
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * 分步动画的状态：step 从 0 到 count - 1。
 * 自动播放到最后一步停下；系统开了「减少动态效果」时自动播放间隔加倍。
 */
export function useStepPlayer(count: number, intervalMs = 900) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const last = count - 1
  const atEnd = step >= last

  useEffect(() => {
    if (!playing) return
    if (atEnd) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => Math.min(s + 1, last)), reducedMotion() ? intervalMs * 2 : intervalMs)
    return () => window.clearTimeout(id)
  }, [playing, atEnd, step, last, intervalMs])

  return {
    step,
    count,
    atEnd,
    playing,
    goTo: (index: number) => {
      setPlaying(false)
      setStep(Math.max(0, Math.min(index, last)))
    },
    next: () => setStep((s) => Math.min(s + 1, last)),
    toggle: () => {
      if (atEnd) setStep(0)
      setPlaying((p) => (atEnd ? true : !p))
    },
    reset: () => {
      setPlaying(false)
      setStep(0)
    },
  }
}

export type StepPlayerState = ReturnType<typeof useStepPlayer>

/** 下一步 / 自动播放 / 重来 + 进度点。labels 用来改按钮文字，例如「打一拍时钟」。 */
export function StepControls({
  player,
  nextLabel,
  stepLabels,
}: {
  player: StepPlayerState
  nextLabel?: LText
  stepLabels?: LText[]
}) {
  const { t } = useLocale()
  return (
    <div className="step-player">
      <div className="row-actions">
        <button type="button" className="lab__btn lab__btn--primary" disabled={player.atEnd} onClick={player.next}>
          {t(nextLabel ?? L.next)}
        </button>
        <button type="button" className="lab__btn" onClick={player.toggle}>
          {t(player.playing ? L.pause : L.play)}
        </button>
        <button type="button" className="lab__btn" onClick={player.reset}>
          {t(L.reset)}
        </button>
      </div>
      <ol className="step-player__dots">
        {Array.from({ length: player.count }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              className={`${i === player.step ? 'is-active' : ''}${i < player.step ? ' is-done' : ''}`}
              title={stepLabels?.[i] ? t(stepLabels[i]) : String(i + 1)}
              aria-label={stepLabels?.[i] ? t(stepLabels[i]) : String(i + 1)}
              onClick={() => player.goTo(i)}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

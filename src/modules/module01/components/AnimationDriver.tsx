import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { activeChannel, useScene } from '../context/SceneContext'
import { applyFade } from '../data/dim'
import { PHASES, PHASE_SECONDS, computePose, type ContactPhase } from '../data/layout'
import { SECTION_OFF, SECTION_PLANE } from '../data/materials'

type AnimationDriverProps = {
  onPhase: (phase: ContactPhase) => void
}

const smooth = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

function approach(current: number, target: number, step: number) {
  if (current < target) return Math.min(target, current + step)
  return Math.max(target, current - step)
}

/**
 * 每帧最先运行（priority -1）：推进分解 / 剖开 / 接触动画，并算出本帧各层姿态 store.pose。
 * prefers-reduced-motion 时所有过渡直接跳到终点。
 */
export function AnimationDriver({ onPhase }: AnimationDriverProps) {
  const { store, cfg } = useScene()
  const lastPhase = useRef<ContactPhase>(store.phase)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = store

    // 分解 / 组装：约 1 秒
    s.explodeLin = cfg.reduced ? s.explodeTarget : approach(s.explodeLin, s.explodeTarget, dt)
    s.explode = smooth(s.explodeLin)

    // 剖开：裁切面从前方扫到 z=0
    s.section = cfg.reduced ? s.sectionTarget : approach(s.section, s.sectionTarget, dt * 1.6)
    SECTION_PLANE.constant = s.section < 0.001 ? SECTION_OFF : 2.6 * (1 - smooth(s.section))

    // 接触动画
    if (s.phase !== 'idle' && s.phase !== 'done') {
      const phases = PHASES[cfg.flow]
      s.phaseT += dt
      const k = clamp01(s.phaseT / PHASE_SECONDS[s.phase])
      const e = smooth(k)
      switch (s.phase) {
        case 'load':
          s.shuttle = 1 - e
          s.lift = 1
          s.press = 0
          break
        case 'press':
          s.shuttle = 0
          s.lift = 1 - e
          s.press = 0
          break
        case 'compress':
          s.lift = 0
          s.press = e
          break
        case 'align':
          s.waferShift = 1 - e
          s.drop = 1
          s.od = 0
          break
        case 'rise':
          s.waferShift = 0
          s.drop = 1 - e
          s.od = 0
          break
        case 'overdrive':
          s.drop = 0
          s.od = e
          break
        case 'signal':
          s.press = 1
          s.od = 1
          break
      }
      if (k >= 1) {
        const next = phases[phases.indexOf(s.phase) + 1] ?? 'done'
        s.phase = next
        s.phaseT = 0
        if (next === 'signal') s.pulseT = 0
      }
    }

    computePose(cfg.flow, s, s.pose)
    s.scrubMax = Math.max(s.scrubMax, s.pose.needleDefl)

    const wantFade = s.explode > 0.3 || s.sectionTarget > 0 || cfg.selected !== null ? 1 : 0
    s.boardFade = cfg.reduced ? wantFade : approach(s.boardFade, wantFade, dt * 2.5)
    // 只看路径：有高亮通道（选中或信号阶段）且开关打开时，其它部件淡到几乎透明
    const wantDim = cfg.pathOnly && activeChannel(s, cfg) !== null ? 1 : 0
    s.dim = cfg.reduced ? wantDim : approach(s.dim, wantDim, dt * 3.5)
    applyFade(s.boardFade, s.dim)

    if (s.phase !== lastPhase.current) {
      lastPhase.current = s.phase
      onPhase(s.phase)
    }
  }, -1)

  return null
}

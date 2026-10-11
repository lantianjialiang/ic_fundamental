import { createContext, useContext } from 'react'
import {
  STATIC_ANIM,
  computePose,
  type AnimValues,
  type ContactPhase,
  type LayerId,
  type Pkg,
  type Pose,
  type ProbeType,
  type TestFlow,
} from '../data/layout'

/**
 * 每帧都会变的动画量放在一个可变对象里（不走 React state），
 * 由 AnimationDriver 在 useFrame 里推进，其它组件在自己的 useFrame 里读取。
 */
export type SceneStore = AnimValues & {
  explodeLin: number
  explodeTarget: number
  section: number
  sectionTarget: number
  boardFade: number
  /** 「只看路径」淡化进度 0..1：其它部件的不透明度从 1 降到 DIM_OPACITY */
  dim: number
  phase: ContactPhase
  phaseT: number
  pulseT: number
  scrubMax: number
  pose: Pose
}

export function createStore(flow: TestFlow): SceneStore {
  return {
    ...STATIC_ANIM,
    explodeLin: 0,
    explodeTarget: 0,
    section: 0,
    sectionTarget: 0,
    boardFade: 0,
    dim: 0,
    phase: 'idle',
    phaseT: 0,
    pulseT: 0,
    scrubMax: 0,
    pose: computePose(flow, STATIC_ANIM),
  }
}

/** 停掉接触动画，回到静态装配姿态（保留分解 / 剖开状态） */
export function resetContact(store: SceneStore) {
  store.lift = STATIC_ANIM.lift
  store.press = STATIC_ANIM.press
  store.shuttle = STATIC_ANIM.shuttle
  store.drop = STATIC_ANIM.drop
  store.od = STATIC_ANIM.od
  store.waferShift = STATIC_ANIM.waferShift
  store.phase = 'idle'
  store.phaseT = 0
}

export type SceneConfig = {
  flow: TestFlow
  pkg: Pkg
  probe: ProbeType
  selected: number | null
  /** 有高亮路径时，是否把其它部件淡化成几乎透明 */
  pathOnly: boolean
  focus: LayerId | null
  showLabels: boolean
  reduced: boolean
  onSelect: (channel: number | null) => void
}

type SceneContextValue = { store: SceneStore; cfg: SceneConfig }

/** 当前要高亮的通道：选中的通道；没选时接触动画「信号」阶段默认走 CH1 */
export function activeChannel(store: SceneStore, cfg: SceneConfig): number | null {
  if (cfg.selected !== null) return cfg.selected
  // 减少动态效果时，接触动画直接跳到「完成」，用静态路径代替流动脉冲
  const signalPhase = store.phase === 'signal' || (cfg.reduced && store.phase === 'done')
  return signalPhase ? 0 : null
}

export const SceneContext = createContext<SceneContextValue | null>(null)

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used inside SceneContext')
  return ctx
}

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
  focus: LayerId | null
  showLabels: boolean
  reduced: boolean
  onSelect: (channel: number | null) => void
}

type SceneContextValue = { store: SceneStore; cfg: SceneConfig }

export const SceneContext = createContext<SceneContextValue | null>(null)

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used inside SceneContext')
  return ctx
}

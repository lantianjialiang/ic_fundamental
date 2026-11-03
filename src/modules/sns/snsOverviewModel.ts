/**
 * SNS-01 通用传感器模型（VDUT-CIS1 之前的传递函数课）。
 * 公式一律调用 core/sensor.ts，不在这里重写两点法、回归或采样。
 */
import { linReg, mulberry32, sensorSample, twoPoint } from './core/sensor'

export const STIMULUS_IDS = ['flat', 'shaker', 'pressure', 'chamber', 'cont', 'idd', 'reg', 'bist'] as const
export type StimulusId = (typeof STIMULUS_IDS)[number]

/** 平场光、振动台、压力、温箱要物理激励；其余只用电激励 */
export const STIMULUS_PHYSICAL: Record<StimulusId, boolean> = {
  flat: true,
  shaker: true,
  pressure: true,
  chamber: true,
  cont: false,
  idd: false,
  reg: false,
  bist: false,
}

export const MARK_IDS = ['physical', 'electrical'] as const
export type MarkId = (typeof MARK_IDS)[number]

export const COMP_IDS = ['off', 'on'] as const
export type CompId = (typeof COMP_IDS)[number]

/** 满量程输入记为 1，扫描五个点做两点法与最小二乘 */
export const SCAN_X = [0, 0.25, 0.5, 0.75, 1]

export type OverviewState = {
  s: number
  b: number
  nl: number
  noise: number
  tco: number
  nAvg: number
  tempA: number
  tempB: number
  comp: CompId
  picked: StimulusId
  marks: Record<StimulusId, MarkId>
}

function initialMarks(): Record<StimulusId, MarkId> {
  const marks = {} as Record<StimulusId, MarkId>
  for (const id of STIMULUS_IDS) marks[id] = MARK_IDS[0]
  return marks
}

export const DEFAULT_OVERVIEW: OverviewState = {
  s: 2,
  b: 0.2,
  nl: 0,
  noise: 0.1,
  tco: 0.005,
  nAvg: 1,
  tempA: 25,
  tempB: 85,
  comp: COMP_IDS[0],
  picked: STIMULUS_IDS[0],
  marks: initialMarks(),
}

export type OverviewAnalysis = {
  tp: { s: number; b: number }
  ls: { slope: number; intercept: number }
  maxNlPct: number
  tcoEst: number
  stdS: number
  tighten: number
  ys: number[]
  marksCorrect: number
}

function averageAt(
  state: OverviewState,
  x: number,
  tempC: number,
  rand: () => number,
): number {
  let acc = 0
  const n = Math.max(1, Math.round(state.nAvg))
  for (let i = 0; i < n; i += 1) {
    acc += sensorSample({
      s: state.s,
      b: state.b,
      nl: state.nl,
      noise: state.noise,
      tco: state.tco,
      x,
      tempC,
      rand,
    })
  }
  return acc / n
}

export function analyseOverview(state: OverviewState): OverviewAnalysis {
  const rand = mulberry32(0x51a701)
  const raw = SCAN_X.map((x) => averageAt(state, x, state.tempA, rand))
  const randT = mulberry32(0x51a702)
  const yA = averageAt(state, 0, state.tempA, randT)
  const yB = averageAt(state, 0, state.tempB, randT)
  const tcoEst = state.tempB === state.tempA ? 0 : (yB - yA) / (state.tempB - state.tempA)
  const shift = state.comp === 'on' ? tcoEst * (state.tempA - 25) : 0
  const ys = raw.map((y) => y - shift)
  const tp = twoPoint(SCAN_X[0], ys[0], SCAN_X[SCAN_X.length - 1], ys[ys.length - 1])
  const ls = linReg(SCAN_X, ys)
  const span = Math.max(Math.abs(ys[ys.length - 1] - ys[0]), 1e-9)
  let maxNlPct = 0
  SCAN_X.forEach((x, index) => {
    const fit = ls.slope * x + ls.intercept
    const dev = (Math.abs(ys[index] - fit) / span) * 100
    if (dev > maxNlPct) maxNlPct = dev
  })
  const n = Math.max(1, state.nAvg)
  const stdS = (state.noise * Math.SQRT2) / Math.sqrt(n)
  const tighten = 1 / Math.sqrt(n)
  const marksCorrect = STIMULUS_IDS.filter(
    (id) => state.marks[id] === (STIMULUS_PHYSICAL[id] ? 'physical' : 'electrical'),
  ).length
  return { tp, ls, maxNlPct, tcoEst, stdS, tighten, ys, marksCorrect }
}

export function overviewFlags(state: OverviewState, a: OverviewAnalysis) {
  const match = state.noise === 0 && Math.abs(a.tp.s - state.s) < 1e-6 && Math.abs(a.tp.b - state.b) < 1e-6
  return {
    t1: match,
    t2: state.noise > 0 && state.nAvg >= 16,
    t3: state.comp === 'on' && state.tempA !== state.tempB,
    t4: a.marksCorrect === STIMULUS_IDS.length,
  }
}

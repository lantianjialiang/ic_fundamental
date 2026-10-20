/**
 * 时钟与数据时序的教学模型（HS-03）。
 * 数据沿：第 k 个沿的位置 = k·UI + e_k，e_k 为高斯抖动（rms = σ，固定种子，同样的设置每次结果一样）。
 * 接收端采样器有两个要求，都针对采样沿所在的那一位：
 *   φ ≥ 前沿位置 + tSU   （Setup：新数据要先稳定 tSU）
 *   φ ≤ 后沿位置 − tH    （Hold：采样之后数据还要保持 tH）
 * 每个沿的位置都是随机的，所以按最坏情况取边界（对所有沿取极值）：
 *   Setup 边界 S = tSU + max(e)        采样沿必须晚于它
 *   Hold 边界  H = UI − tH + min(e)    采样沿必须早于它
 *   有效窗口 W = H − S = UI − tSU − tH − (max(e) − min(e))
 * 时序裕量 = min(φ − S, H − φ)；≥ 0 为 PASS。W < 0 时窗口已经关闭，任何采样沿都会违例。
 */
import { gaussian, seededRandom } from '../ana/core/rng'

export type TimingState = {
  /** 数据速率，Gb/s */
  rate: number
  /** 建立时间 tSU，ps */
  tsu: number
  /** 保持时间 tH，ps */
  th: number
  /** 数据沿抖动 rms，ps */
  jitter: number
  /** 采样沿位置，占 UI 的百分比（0–100） */
  phase: number
}

/** 速率选项，显示顺序即数组顺序；默认取 [0] */
export const RATES: number[] = [10, 16, 25]

export const DEFAULT_TIMING: TimingState = { rate: RATES[0], tsu: 12, th: 8, jitter: 1, phase: 50 }

/** 参与最坏情况计算的数据沿个数 */
export const EDGE_COUNT = 128
/** 图上画出抖动散布的沿个数 */
export const GHOST_COUNT = 24
const SEED = 0x3c1d

export type TimingViolation = 'setup' | 'hold' | 'closed'

export type TimingAnalysis = {
  /** 单位间隔 UI，ps */
  ui: number
  /** 采样沿的位置，ps（相对本位的前沿） */
  sample: number
  /** Setup 边界 S，ps：采样沿必须晚于它 */
  setupBoundary: number
  /** Hold 边界 H，ps：采样沿必须早于它 */
  holdBoundary: number
  /** 有效窗口宽度 H − S，ps；负值表示窗口已关闭 */
  window: number
  /** 采样沿离 Setup 边界的距离，ps（负值为违例） */
  setupMargin: number
  /** 采样沿离 Hold 边界的距离，ps（负值为违例） */
  holdMargin: number
  /** 时序裕量 = min(setupMargin, holdMargin)，ps */
  margin: number
  /** 数据沿抖动的峰峰值 max(e) − min(e)，ps */
  jitterPp: number
  maxEdge: number
  minEdge: number
  violation: TimingViolation | null
  pass: boolean
  /** 前 GHOST_COUNT 个沿的偏移，ps */
  offsets: number[]
}

export function analyseTiming(state: TimingState): TimingAnalysis {
  const ui = 1000 / state.rate
  const random = seededRandom(SEED)
  const offsets: number[] = []
  for (let k = 0; k < EDGE_COUNT; k += 1) {
    offsets.push(state.jitter * gaussian(random))
  }

  let maxEdge = offsets[0]
  let minEdge = offsets[0]
  for (const e of offsets) {
    if (e > maxEdge) {
      maxEdge = e
    }
    if (e < minEdge) {
      minEdge = e
    }
  }

  const setupBoundary = state.tsu + maxEdge
  const holdBoundary = ui - state.th + minEdge
  const window = holdBoundary - setupBoundary
  const sample = (state.phase / 100) * ui
  const setupMargin = sample - setupBoundary
  const holdMargin = holdBoundary - sample

  let violation: TimingViolation | null = null
  if (window < 0) {
    violation = 'closed'
  } else if (setupMargin < 0) {
    violation = 'setup'
  } else if (holdMargin < 0) {
    violation = 'hold'
  }

  return {
    ui,
    sample,
    setupBoundary,
    holdBoundary,
    window,
    setupMargin,
    holdMargin,
    margin: Math.min(setupMargin, holdMargin),
    jitterPp: maxEdge - minEdge,
    maxEdge,
    minEdge,
    violation,
    pass: violation === null,
    offsets: offsets.slice(0, GHOST_COUNT),
  }
}

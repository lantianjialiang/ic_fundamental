/**
 * DDR / LPDDR 读写训练的教学模型（MEM-08，纯函数，简化版）。
 * 一个字节通道（byte lane）：8 根 DQ 数据线共用一根选通 DQS。
 * 一个 UI 内，DQS 的采样时刻 d（ps）从 0 扫到 UI。每一位 DQ 的有效数据窗口是以 c_i 为中心、
 * 宽 W（= eyeFrac · UI）的一段；c_i = UI / 2 + 偏斜，偏斜由固定种子的高斯随机数生成（同一设置每次结果一样）。
 * 判定：d 落在第 i 位的窗口内（|d − c_i| ≤ W / 2）该位 PASS，否则 FAIL。
 * 裕量曲线 m_i(d) = W / 2 − |d − c_i| 是一个三角形，m ≥ 0 即 PASS。
 * 因为 DQS 是整组共用的，所有位都 PASS 的 d 必须落在所有窗口的交集 [max(c_i − W/2), min(c_i + W/2)] 里。
 * 训练结果：交集的中点，它到左、右边界的距离就是裕量。
 * 这是简化模型：没有抖动、没有电压（Vref）扫描，也不做逐位 deskew 补偿。
 */

import { gaussian, seededRandom } from '../ana/core/rng'

/** 一个字节通道的数据线数 */
export const DQ_COUNT = 8

/** 数据速率选项（Gb/s），显示顺序即数组顺序；默认取 [0]。教学取值，不对应任何真实器件 */
export const RATES: number[] = [3.2, 4.8, 6.4]

/** 有效窗口宽 W 占 UI 的比例 */
export const EYE_MIN = 0.2
export const EYE_MAX = 0.6
export const EYE_STEP = 0.02

/** DQ 偏斜的标准差（占 UI） */
export const SKEW_MIN = 0
export const SKEW_MAX = 0.15
export const SKEW_STEP = 0.01
/** 单位偏斜截断到 ±SKEW_CLAMP（占 UI），保证所有窗口都落在 [0, UI] 内 */
export const SKEW_CLAMP = 0.2

/** 扫描与曲线的采样点数 */
export const SAMPLES = 120

const SKEW_SEED = 0x2d3

export type DdrState = {
  /** 数据速率，Gb/s */
  rate: number
  /** 有效窗口宽 W，占 UI */
  eyeFrac: number
  /** DQ 偏斜标准差，占 UI */
  skew: number
  /** DQS 延迟 d，ps */
  delay: number
}

export const DEFAULT_DDR: DdrState = { rate: RATES[0], eyeFrac: 0.5, skew: 0.06, delay: 0 }

export function uiOf(rate: number): number {
  return 1000 / rate
}

function clampTo(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi)
}

/** 单个位是否在 d 处通过 */
export function bitPass(d: number, centre: number, half: number): boolean {
  return Math.abs(d - centre) <= half
}

/** 第 i 位在 d 处的裕量（ps）：W/2 − |d − c_i|，大于等于 0 即 PASS */
export function bitMargin(d: number, centre: number, half: number): number {
  return half - Math.abs(d - centre)
}

export type DdrAnalysis = {
  ui: number
  /** 半窗口宽 W / 2，ps */
  half: number
  /** 每位窗口中心 c_i，ps */
  centres: Float64Array
  /** 当前 d（已夹到 [0, UI]），ps */
  delay: number
  /** 所有位窗口的交集 [lo, hi]；open = false 表示交集为空（窗口闭合） */
  lo: number
  hi: number
  open: boolean
  /** 训练中心（交集中点），ps；窗口闭合时为 NaN */
  trained: number
  /** 当前 d 在所有位上是否都 PASS */
  allPass: boolean
  /** 当前 d 下失效的位数 */
  failBits: number
  /** 只用 DQ0 训练时，DQ0 的窗口中心，ps */
  dq0Centre: number
  /** 按 DQ0 中心设 d 时失效的位数 */
  dq0FailBits: number
  /** 偏斜最大的位（窗口中心离 UI / 2 最远） */
  worstBit: number
}

export function analyseDdr(state: DdrState): DdrAnalysis {
  const ui = uiOf(state.rate)
  const half = (state.eyeFrac * ui) / 2
  const random = seededRandom(SKEW_SEED)
  const centres = new Float64Array(DQ_COUNT)
  for (let i = 0; i < DQ_COUNT; i += 1) {
    const z = gaussian(random)
    const offset = clampTo(state.skew * z, -SKEW_CLAMP, SKEW_CLAMP) * ui
    centres[i] = ui / 2 + offset
  }

  let lo = -Infinity
  let hi = Infinity
  let worstBit = 0
  for (let i = 0; i < DQ_COUNT; i += 1) {
    lo = Math.max(lo, centres[i] - half)
    hi = Math.min(hi, centres[i] + half)
    if (Math.abs(centres[i] - ui / 2) > Math.abs(centres[worstBit] - ui / 2)) {
      worstBit = i
    }
  }
  const open = lo <= hi
  const trained = open ? (lo + hi) / 2 : Number.NaN

  const delay = clampTo(state.delay, 0, ui)
  const failBits = failingBits(delay, centres, half)
  const dq0Centre = centres[0]
  const dq0FailBits = failingBits(dq0Centre, centres, half)

  return {
    ui,
    half,
    centres,
    delay,
    lo,
    hi,
    open,
    trained,
    allPass: failBits === 0,
    failBits,
    dq0Centre,
    dq0FailBits,
    worstBit,
  }
}

/** d 处失效的位数 */
export function failingBits(d: number, centres: Float64Array, half: number): number {
  let count = 0
  for (let i = 0; i < centres.length; i += 1) {
    if (!bitPass(d, centres[i], half)) {
      count += 1
    }
  }
  return count
}

/** 所有位中最小的裕量（ps）：曲线 min_i m_i(d)，大于等于 0 即所有位都 PASS */
export function commonMargin(d: number, centres: Float64Array, half: number): number {
  let worst = Infinity
  for (let i = 0; i < centres.length; i += 1) {
    const m = bitMargin(d, centres[i], half)
    if (m < worst) {
      worst = m
    }
  }
  return worst
}

/** 在 [0, UI] 上均匀取 SAMPLES 段的采样点（ps） */
export function sampleDelays(ui: number): number[] {
  const out: number[] = []
  for (let k = 0; k <= SAMPLES; k += 1) {
    out.push((k / SAMPLES) * ui)
  }
  return out
}

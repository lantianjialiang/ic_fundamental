/**
 * 「Trim 与 OTP」的修调模型（教学示意，虚拟基准源 VDUT-REF1，不对应任何真实型号）。
 * 目标输出 1.200 V。工艺偏差 ΔV 让未修调的输出偏离目标；5 位修调码（写入 OTP）每码 2 mV，用来抵消偏差：
 *   V(码) = 1200 mV + ΔV + (码 − 16) × 2 mV，码 16 对应未修调的输出。
 * 搜索与判定都是纯函数；复测读数的噪声用 core/rng.ts 的 seededRandom(RETEST_SEED)，同一种子结果可复现。
 */

import { gaussian, seededRandom } from './core/rng'

export const V_NOM_MV = 1200
export const N_BITS = 5
export const CODE_MAX = (1 << N_BITS) - 1
export const CODE_CENTER = 16
export const LSB_MV = 2
/** 限值：目标的 ±0.1% */
export const LIMIT_PCT = 0.1
export const LIMIT_MV = (V_NOM_MV * LIMIT_PCT) / 100
/** 复测读数的噪声 σ，mV（比限值小一个数量级，所以复测结论主要由修调误差决定） */
export const NOISE_MV = 0.05
export const RETEST_SEED = 13

export type TrimMethod = 'binary' | 'linear'
/** 搜索方法的显示顺序；默认取第 0 项 */
export const METHODS: TrimMethod[] = ['binary', 'linear']

export type Die = { id: string; offsetMv: number }

/** 四颗 die 的工艺偏差 ΔV（未修调时的输出减 1200 mV）；第 0 项是默认 die */
export const DIES: Die[] = [
  { id: 'die1', offsetMv: 13.4 },
  { id: 'die2', offsetMv: -8.7 },
  { id: 'die3', offsetMv: 26.9 },
  { id: 'die4', offsetMv: -34.4 },
]

export function dieOf(id: string): Die {
  return DIES.find((die) => die.id === id) ?? DIES[0]
}

/** 码 → 输出（mV）：线性关系，每码 LSB_MV */
export function transferMv(offsetMv: number, code: number): number {
  return V_NOM_MV + offsetMv + (code - CODE_CENTER) * LSB_MV
}

/** 理想修调码（可以是小数）：使输出恰好等于 1200 mV 的码。小于 0 或大于 CODE_MAX 就修不回来 */
export function idealCode(offsetMv: number): number {
  return CODE_CENTER - offsetMv / LSB_MV
}

/** 修调范围（mV）：偏差在此区间内，某个码的输出能落进限值带 */
export function trimRangeMv(): { lo: number; hi: number } {
  return {
    lo: -(CODE_MAX - CODE_CENTER) * LSB_MV - LIMIT_MV,
    hi: CODE_CENTER * LSB_MV + LIMIT_MV,
  }
}

export function inLimit(mv: number): boolean {
  return Math.abs(mv - V_NOM_MV) <= LIMIT_MV
}

export type SearchStep = { code: number; mv: number }
export type SearchResult = { code: number; steps: SearchStep[]; measurements: number }

/** 两个相邻码中，输出更接近目标的那个；平手取较小的码 */
function nearestOf(offsetMv: number, a: number, b: number): number {
  const errA = Math.abs(transferMv(offsetMv, a) - V_NOM_MV)
  const errB = Math.abs(transferMv(offsetMv, b) - V_NOM_MV)
  return errB < errA ? b : a
}

/** 二分（逐位逼近）：从最高位开始，每位试置 1，输出不超过目标就保留；最后比对相邻码，取更接近目标的一个 */
export function binarySearch(offsetMv: number): SearchResult {
  const steps: SearchStep[] = []
  let code = 0
  for (let bit = N_BITS - 1; bit >= 0; bit -= 1) {
    const trial = code | (1 << bit)
    const mv = transferMv(offsetMv, trial)
    steps.push({ code: trial, mv })
    if (mv <= V_NOM_MV) {
      code = trial
    }
  }
  if (code < CODE_MAX) {
    steps.push({ code: code + 1, mv: transferMv(offsetMv, code + 1) })
    code = nearestOf(offsetMv, code, code + 1)
  }
  return { code, steps, measurements: steps.length }
}

/** 线性搜索：从码 0 逐码上升，到第一个输出不低于目标的码停下，再与前一个码比较取更近的 */
export function linearSearch(offsetMv: number): SearchResult {
  const steps: SearchStep[] = []
  let hit = -1
  for (let c = 0; c <= CODE_MAX; c += 1) {
    const mv = transferMv(offsetMv, c)
    steps.push({ code: c, mv })
    if (mv >= V_NOM_MV) {
      hit = c
      break
    }
  }
  let code = CODE_MAX
  if (hit === 0) {
    code = 0
  } else if (hit > 0) {
    code = nearestOf(offsetMv, hit - 1, hit)
  }
  return { code, steps, measurements: steps.length }
}

export function runSearch(method: TrimMethod, offsetMv: number): SearchResult {
  return method === 'binary' ? binarySearch(offsetMv) : linearSearch(offsetMv)
}

/** 复测读数：修调后的输出加上一点随机噪声（种子固定，结果可复现） */
export function retestMv(code: number, offsetMv: number): number {
  const random = seededRandom(RETEST_SEED)
  return transferMv(offsetMv, code) + NOISE_MV * gaussian(random)
}

export function fmtMv(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)} mV`
}

/** 码的 5 位二进制写法，例如 9 → 01001 */
export function toBits(code: number): string {
  return code.toString(2).padStart(N_BITS, '0')
}

export type TrimState = {
  dieId: string
  method: TrimMethod
  /** 写入 OTP 的码；null 表示 OTP 还是空白。写入后 die 与方法都锁定，OTP 不能改写，只能重置换一颗 die */
  otpCode: number | null
  readback: boolean
  retested: boolean
}

export const DEFAULT_TRIM: TrimState = {
  dieId: DIES[0].id,
  method: METHODS[0],
  otpCode: null,
  readback: false,
  retested: false,
}

export type TrimView = {
  die: Die
  method: TrimMethod
  /** 当前码：写入 OTP 后固定为写入的码，否则是搜索结果 */
  code: number
  mv: number
  /** 修调后误差（mV），相对 1200 mV */
  err: number
  ok: boolean
  inRange: boolean
  ideal: number
  steps: SearchStep[]
  measurements: number
  programmed: boolean
  readback: boolean
  retested: boolean
  reading: number | null
  retestOk: boolean
}

/** 由状态算出所有显示量与判定；纯函数，同一状态结果相同 */
export function evaluate(state: TrimState): TrimView {
  const die = dieOf(state.dieId)
  const search = runSearch(state.method, die.offsetMv)
  const code = state.otpCode ?? search.code
  const mv = transferMv(die.offsetMv, code)
  const range = trimRangeMv()
  const reading = state.otpCode !== null && state.retested ? retestMv(state.otpCode, die.offsetMv) : null
  return {
    die,
    method: state.method,
    code,
    mv,
    err: mv - V_NOM_MV,
    ok: inLimit(mv),
    inRange: die.offsetMv >= range.lo && die.offsetMv <= range.hi,
    ideal: idealCode(die.offsetMv),
    steps: search.steps,
    measurements: search.measurements,
    programmed: state.otpCode !== null,
    readback: state.readback,
    retested: state.retested,
    reading,
    retestOk: reading !== null && inLimit(reading),
  }
}

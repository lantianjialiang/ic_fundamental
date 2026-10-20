/**
 * DRAM 保持时间的教学模型（MEM-07，纯函数）。
 * 每个单元是一个电容：写入后电荷随时间指数衰减，V(t) = V0 · exp(−t / τ)。
 * 读出时感应放大器的判决门限是 V0 / 2：电荷低于它就读错。由此反算保持时间 t_ret（V(t_ret) = V0 / 2）：
 *   τ = t_ret / ln 2
 * 同一阵列里每个单元的 t_ret 不同：ln(t_ret) 服从正态分布（对数正态），
 * 中位数 RET_MEDIAN_MS 与对数标准差 RET_LOG_SIGMA 是教学取值，不对应任何真实器件。
 * 刷新间隔 tREF 大于某单元的 t_ret 时，该单元在下一次刷新前已经低于门限 → 失效。
 * 教学模型按最坏情况计算：所有单元都存 1（存 0 的单元电荷本来就接近 0，漏电不会让它读错）。
 */

import { gaussian, seededRandom } from '../ana/core/rng'

/** 教学用的小阵列：行 × 列 */
export const ROWS = 32
export const COLS = 64
export const CELLS = ROWS * COLS

/** 保持时间的中位数（ms）与对数标准差：教学取值 */
export const RET_MEDIAN_MS = 1000
export const RET_LOG_SIGMA = 1

/** 感应放大器判决门限，相对写入电平 V0 的比例 */
export const V_MIN_RATIO = 0.5

/** tREF 的调节范围与步长（ms） */
export const TREF_MIN = 8
export const TREF_MAX = 512
export const TREF_STEP = 8

/** 柱状图扫描的 tREF 点（ms），显示顺序即数组顺序 */
export const SWEEP_MS: number[] = [8, 16, 32, 64, 128, 256, 512]

/** 衰减曲线的横轴上限（ms） */
export const DECAY_MAX_MS = 512

const BASE_SEED = 0x51

export type DramState = {
  /** 刷新间隔 tREF，ms */
  tRef: number
  /** 第几批单元：换一批就换一个种子，结果可复现 */
  batch: number
}

export const DEFAULT_DRAM: DramState = { tRef: 16, batch: 0 }

/** 每个单元的保持时间（ms）；同一批次、同一种子，每次算出的结果一样 */
export function retentionTimes(batch: number): Float64Array {
  const random = seededRandom(BASE_SEED + batch)
  const out = new Float64Array(CELLS)
  for (let i = 0; i < CELLS; i += 1) {
    out[i] = RET_MEDIAN_MS * Math.exp(RET_LOG_SIGMA * gaussian(random))
  }
  return out
}

/** 相对电荷 V(t) / V0，单元的时间常数由保持时间反算 */
export function chargeRatio(tMs: number, retMs: number): number {
  const tau = retMs / Math.LN2
  return Math.exp(-tMs / tau)
}

/** 保持时间 retMs 的单元，在刷新间隔 tRef 时是否已经低于门限 */
export function isFailing(retMs: number, tRef: number): boolean {
  return chargeRatio(tRef, retMs) < V_MIN_RATIO
}

export type DramAnalysis = {
  retention: Float64Array
  /** 1 = 失效，0 = 正常 */
  failMask: Uint8Array
  fails: number
  weakestMs: number
  weakestIndex: number
  pass: boolean
}

export function analyseDram(state: DramState): DramAnalysis {
  const retention = retentionTimes(state.batch)
  const failMask = new Uint8Array(CELLS)
  let fails = 0
  let weakestMs = Infinity
  let weakestIndex = 0
  for (let i = 0; i < CELLS; i += 1) {
    if (isFailing(retention[i], state.tRef)) {
      failMask[i] = 1
      fails += 1
    }
    if (retention[i] < weakestMs) {
      weakestMs = retention[i]
      weakestIndex = i
    }
  }
  return { retention, failMask, fails, weakestMs, weakestIndex, pass: fails === 0 }
}

/** 同一批单元在每个 tRef 下的失效数（柱状图用） */
export function failSweep(retention: Float64Array, tRefs: number[]): number[] {
  return tRefs.map((tRef) => {
    let count = 0
    for (let i = 0; i < retention.length; i += 1) {
      if (isFailing(retention[i], tRef)) {
        count += 1
      }
    }
    return count
  })
}

/** 样本中位数：画“典型单元”的衰减曲线用 */
export function medianRetention(retention: Float64Array): number {
  const sorted = Float64Array.from(retention).sort()
  return sorted[Math.floor(sorted.length / 2)]
}

/** 单个单元的衰减曲线，t 从 0 到 tMaxMs 均匀取 points 段 */
export function decayCurve(retMs: number, tMaxMs: number, points: number): Array<{ t: number; v: number }> {
  const out: Array<{ t: number; v: number }> = []
  for (let k = 0; k <= points; k += 1) {
    const t = (k / points) * tMaxMs
    out.push({ t, v: chargeRatio(t, retMs) })
  }
  return out
}

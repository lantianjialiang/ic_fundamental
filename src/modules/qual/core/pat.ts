/**
 * 零件平均测试（PAT）与邻近规则的教学模型（REL-07 / REL-08 共用）。
 * 动态限值只用中位数与 MAD，不被少数离群值拉偏；σ_rob = 1.4826 × MAD 是正态分布下的稳健估计。
 */
import { type WaferMap } from './wafer'

/** 中位数（偶数个取中间两数的平均） */
export function median(x: number[]): number {
  if (x.length === 0) {
    return NaN
  }
  const s = [...x].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** 中位数绝对偏差 MAD = median(|x − median(x)|) */
export function mad(x: number[]): number {
  const m = median(x)
  return median(x.map((v) => Math.abs(v - m)))
}

/** 稳健 σ = 1.4826 × MAD */
export function robustSigma(x: number[]): number {
  return 1.4826 * mad(x)
}

/** 动态 PAT 限值：median ± k · σ_rob。k 常取 3–8（示例值，以各公司规程为准） */
export function dynamicPatLimits(x: number[], k: number): { lo: number; hi: number } {
  const m = median(x)
  const s = robustSigma(x)
  return { lo: m - k * s, hi: m + k * s }
}

/**
 * 邻近规则（good die in bad neighborhood）：对每颗未失效的 die，统计半径 radius（单位：die 间距）内的失效数，
 * 若 ≥ minFails，则把它额外剔除。返回被额外剔除的 die id 集合（不含已经失效的）。
 */
export function neighborRule(map: WaferMap, failed: Set<number>, radius: number, minFails: number): Set<number> {
  const extra = new Set<number>()
  for (const die of map.dies) {
    if (failed.has(die.id)) {
      continue
    }
    let count = 0
    for (const other of map.dies) {
      if (other.id === die.id || !failed.has(other.id)) {
        continue
      }
      const dist = Math.hypot(other.col - die.col, other.row - die.row)
      if (dist <= radius) {
        count += 1
      }
    }
    if (count >= minFails) {
      extra.add(die.id)
    }
  }
  return extra
}

/** 把 PAT 限值之外的 die 标为失效，返回 id 集合（教学用，只看一个参数） */
export function patFailSet(map: WaferMap, lo: number, hi: number): Set<number> {
  const fail = new Set<number>()
  for (const die of map.dies) {
    if (die.param < lo || die.param > hi || die.hardFail) {
      fail.add(die.id)
    }
  }
  return fail
}

/**
 * 统计小工具：均值、样本标准差、正态分布的 CDF、区间概率、Cpk。
 * 所有公式都在注释里写明，便于和课程里的公式对照。
 */

export function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0
  }
  let sum = 0
  for (const value of values) {
    sum += value
  }
  return sum / values.length
}

/** 样本标准差，分母 n − 1；少于 2 个点时返回 0 */
export function stdev(values: readonly number[]): number {
  if (values.length < 2) {
    return 0
  }
  const m = mean(values)
  let acc = 0
  for (const value of values) {
    acc += (value - m) ** 2
  }
  return Math.sqrt(acc / (values.length - 1))
}

/** 误差函数，Abramowitz & Stegun 7.1.26，绝对误差约 1.5e-7 */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  return sign * (1 - poly * Math.exp(-ax * ax))
}

/** 标准正态分布的累积分布函数 Φ(z) */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

/** N(mu, sigma²) 落在 [lo, hi] 内的概率；sigma ≤ 0 时返回 NaN */
export function probBetween(lo: number, hi: number, mu: number, sigma: number): number {
  if (sigma <= 0) {
    return Number.NaN
  }
  return normalCdf((hi - mu) / sigma) - normalCdf((lo - mu) / sigma)
}

/**
 * Cpk = min(USL − μ, μ − LSL) / (3σ)。
 * 单边限值时只用存在的那一边；两边都没有、或 sigma ≤ 0 时返回 NaN。
 */
export function cpk(usl: number | null, lsl: number | null, mu: number, sigma: number): number {
  const parts: number[] = []
  if (usl !== null) {
    parts.push(usl - mu)
  }
  if (lsl !== null) {
    parts.push(mu - lsl)
  }
  if (parts.length === 0 || sigma <= 0) {
    return Number.NaN
  }
  return Math.min(...parts) / (3 * sigma)
}

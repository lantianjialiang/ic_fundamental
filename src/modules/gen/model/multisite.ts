// Multi-site 与测试成本的教学模型：纯函数、无 DOM、不含界面文字。
// 公式见 ATE 学习计划 §6.2（Multi-site 与测试成本）：
//   T_td(N) = T_idx + T_par + N·T_ser
//   UPH(N)  = 3600·N / (T_td(N)·(1 + r))      r = 重测率
//   η(N)    = UPH(N) / (N·UPH(1))             并行效率
//   C_hour(N) = C_base + N·C_site
//   COT(N)  = C_hour(N) / UPH(N)              单颗测试成本（这里换算成美分）
//   N ≤ floor(通道总数 / 每颗 DUT 通道数)       Site 数上限

export type MsParams = {
  indexS: number
  parS: number
  serS: number
  /** 重测率，0–1 之间的小数 */
  retest: number
  cBase: number
  cPerSite: number
  chTotal: number
  chPerDut: number
}

export const MAX_SITES_SHOWN = 16

export function maxSites(p: MsParams): number {
  if (!(p.chPerDut > 0)) {
    return 0
  }
  return Math.max(0, Math.floor(p.chTotal / p.chPerDut))
}

export function touchdownS(p: MsParams, n: number): number {
  return p.indexS + p.parS + n * p.serS
}

export function uph(p: MsParams, n: number): number {
  const t = touchdownS(p, n)
  if (!(t > 0) || n <= 0) {
    return 0
  }
  return (3600 * n) / (t * (1 + p.retest))
}

export function efficiency(p: MsParams, n: number): number {
  const u1 = uph(p, 1)
  if (!(u1 > 0) || n <= 0) {
    return 0
  }
  return uph(p, n) / (n * u1)
}

export function hourlyCost(p: MsParams, n: number): number {
  return p.cBase + p.cPerSite * n
}

/** 单颗测试成本，单位美分 / 颗 */
export function cotCents(p: MsParams, n: number): number {
  const u = uph(p, n)
  if (!(u > 0)) {
    return Infinity
  }
  return (100 * hourlyCost(p, n)) / u
}

export type SitePoint = { n: number; feasible: boolean; uph: number; eff: number; cot: number }

/** N = 1…maxN 的全部点；超过通道上限的 N 仍计算，但标记为不可行 */
export function sweep(p: MsParams, maxN = MAX_SITES_SHOWN): SitePoint[] {
  const limit = maxSites(p)
  const points: SitePoint[] = []
  for (let n = 1; n <= maxN; n++) {
    points.push({ n, feasible: n <= limit, uph: uph(p, n), eff: efficiency(p, n), cot: cotCents(p, n) })
  }
  return points
}

/** 可行 N 中 COT 最低的那一个；没有可行点时返回 1 */
export function bestSites(p: MsParams): number {
  let best = 1
  let bestCot = Infinity
  for (const point of sweep(p)) {
    if (point.feasible && point.cot < bestCot) {
      best = point.n
      bestCot = point.cot
    }
  }
  return best
}

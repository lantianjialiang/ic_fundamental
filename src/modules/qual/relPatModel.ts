/**
 * PAT 与邻近规则的数值模型（REL-07）。
 * 一个 Lot 由 LOT_WAFERS 片晶圆组成，每片约 300 颗 die。流程：
 *   1. 规格判定：硬失效，或参数超出规格限（教学示意：±SPEC_SIGMA·σ，远在潜在缺陷之外）→ 直接 Fail；
 *   2. PAT：只用规格内的 die 算动态限值 median ± k·σ_rob，按窗口分别算（整 Lot / 单晶圆 / 每 Site）；
 *   3. 邻近规则（可选）：对还没失效的 die，统计半径 r 内的失效数，≥ m 则额外剔除；
 *   4. 统计：潜在缺陷捕获率、良率损失（好 die 被误剔的比例）、漏检数。
 * 潜在缺陷的真值只用来打分；PAT 与邻近规则的判定本身不读取 latent 标记。
 */
import { makeWafer, type Die, type WaferMap } from './core/wafer'
import { dynamicPatLimits, mad, median, neighborRule, patFailSet, robustSigma } from './core/pat'

/** 一个 Lot 的晶圆片数 */
export const LOT_WAFERS = 8
/** 晶圆直径方向的 die 数（约 300 颗） */
export const WAFER_DIAMETER = 20
/** 固定随机种子：同样的参数每次结果一样 */
export const LOT_SEED = 2026
/** 测试座数（每 Site 窗口用） */
export const SITE_COUNT = 4
/** 规格限，以 σ 计（教学示意）：远在潜在缺陷之外，所以潜在缺陷都在规格内 */
export const SPEC_SIGMA = 10
/** 硬失效比例（功能或开短路，规格外） */
export const HARD_RATE = 0.01
/** 各片晶圆的均值偏移，以 σ 计（教学示意：同一 Lot 内片与片之间的偏移，即批内偏移） */
export const WAFER_OFFSET_SIGMA: number[] = [0, 0.5, -0.4, 0.8, -0.2, 0.3, -0.7, 0.6]
/** 手算练习的示例数据（REL-07 单测用例） */
export const SAMPLE_DATA: number[] = [10, 11, 9, 10, 10, 12, 8, 10, 11, 9, 50]
/** 达标线：潜在缺陷捕获率 ≥ 80%，良率损失 ≤ 0.5% */
export const TARGET_CAPTURE = 0.8
export const TARGET_YIELD_LOSS = 0.005

/** 计算窗口：显示顺序即数组顺序，默认取 [0] */
export const WINDOW_IDS = ['lot', 'wafer', 'site'] as const
export type WindowId = (typeof WINDOW_IDS)[number]
/** 邻近规则开关，默认取 [0]（关） */
export const NBR_IDS = ['off', 'on'] as const
export type NbrId = (typeof NBR_IDS)[number]
/** 晶圆图的着色方式，默认取 [0]（判定） */
export const COLOR_IDS = ['outcome', 'param'] as const
export type ColorId = (typeof COLOR_IDS)[number]
/** 晶圆编号（字符串，供 Seg 使用），默认取 [0] */
export const WAFER_IDS: string[] = WAFER_OFFSET_SIGMA.map((_, i) => String(i + 1))
export const SITE_IDS: number[] = Array.from({ length: SITE_COUNT }, (_, i) => i)

export type PatState = {
  /** 正常参数均值，µA（教学用） */
  mean: number
  /** 正常参数标准差，µA（教学用） */
  sigma: number
  /** 潜在缺陷占全部 die 的比例，% */
  latentPct: number
  /** 落在空间簇内的潜在缺陷比例，% */
  clusterPct: number
  /** 潜在缺陷的参数偏移，以 σ 计 */
  latentShift: number
  /** PAT 系数 k（限值 = median ± k·σ_rob） */
  k: number
  window: WindowId
  /** 当前显示的晶圆编号（WAFER_IDS 之一） */
  wafer: string
  nbr: NbrId
  /** 邻近半径 r，单位为 die 间距 */
  radius: number
  /** 邻近失效数阈值 m */
  minFails: number
  colorBy: ColorId
  /** 手算练习：学生输入的中位数与 MAD（字符串，空串表示未填） */
  handMedian: string
  handMad: string
}

export const DEFAULT_PAT: PatState = {
  mean: 50,
  sigma: 2,
  latentPct: 0.5,
  clusterPct: 60,
  latentShift: 5,
  k: 6,
  window: WINDOW_IDS[0],
  wafer: WAFER_IDS[0],
  nbr: NBR_IDS[0],
  radius: 1.5,
  minFails: 2,
  colorBy: COLOR_IDS[0],
  handMedian: '',
  handMad: '',
}

/** 每颗 die 的判定结果：规格失效 / PAT 剔除 / 邻近规则剔除 / 漏检 / 通过 */
export type Outcome = 'spec' | 'pat-latent' | 'pat-good' | 'nbr-latent' | 'nbr-good' | 'escape' | 'pass'

export type Limits = { lo: number; hi: number }

/** 显示在直方图上的限值线；site 为 null 表示整片（非按 Site 分开） */
export type LimitLine = Limits & { site: number | null }

export type PatStats = {
  dies: number
  latent: number
  good: number
  specFail: number
  /** PAT 剔除的 die（潜在缺陷 + 好 die） */
  patRemoved: number
  /** 邻近规则额外剔除的 die（潜在缺陷 + 好 die） */
  nbrExtra: number
  /** 潜在缺陷中被剔除的数量（规格失效、PAT、邻近规则任一） */
  latentCaught: number
  /** 好 die 被 PAT 或邻近规则误剔的数量 */
  goodRemoved: number
  /** 漏检：潜在缺陷没有被任何一步剔除 */
  escapes: number
  /** 捕获率 0–1 */
  capture: number
  /** 良率损失 0–1 */
  yieldLoss: number
}

export type PatRun = {
  waferIdx: number
  map: WaferMap
  /** 显示晶圆每颗 die 的判定，下标即 die id */
  outcome: Outcome[]
  /** 整 Lot 的限值（所有规格内的 die 一起算） */
  lotLimits: Limits
  /** 显示晶圆单独算的限值（单晶圆窗口用） */
  waferLimits: Limits
  /** 当前窗口实际套用到显示晶圆上的限值线 */
  applied: LimitLine[]
  /** 显示晶圆规格内 die 的参数与真值（直方图用） */
  values: Array<{ v: number; latent: boolean }>
  /** 整 Lot 规格内 die 的中位数与 σ_rob */
  lotMedian: number
  sigmaRob: number
  /** 显示晶圆规格内 die 的中位数 */
  waferMedian: number
  stats: PatStats
}

/** 显示晶圆上各类判定的数量（读数摘要用） */
export function waferCounts(run: PatRun): { dies: number; pat: number; nbr: number; latent: number; escapes: number } {
  const counts = { dies: 0, pat: 0, nbr: 0, latent: 0, escapes: 0 }
  for (const die of run.map.dies) {
    const o = run.outcome[die.id]
    counts.dies += 1
    if (die.latent) {
      counts.latent += 1
    }
    if (o === 'pat-latent' || o === 'pat-good') {
      counts.pat += 1
    }
    if (o === 'nbr-latent' || o === 'nbr-good') {
      counts.nbr += 1
    }
    if (o === 'escape') {
      counts.escapes += 1
    }
  }
  return counts
}

function limitsOf(values: number[], k: number): Limits {
  if (values.length === 0) {
    return { lo: -Infinity, hi: Infinity }
  }
  return dynamicPatLimits(values, k)
}

/** 每颗 die 属于哪一个测试座（2×2 交错分配，教学示意） */
export function siteOf(die: Die): number {
  return (die.col % 2) + 2 * (die.row % 2)
}

function isSpecFail(die: Die, s: PatState): boolean {
  return die.hardFail || Math.abs(die.param - s.mean) > SPEC_SIGMA * s.sigma
}

/** 手算练习：示例数据的中位数、MAD、σ_rob 与 k 下的限值（纯函数，供页面与单测共用） */
export function samplePat(k: number) {
  return {
    median: median(SAMPLE_DATA),
    mad: mad(SAMPLE_DATA),
    sigmaRob: robustSigma(SAMPLE_DATA),
    limits: dynamicPatLimits(SAMPLE_DATA, k),
  }
}

/** 跑一个 Lot：返回显示晶圆的判定与整 Lot 的统计。全部由参数决定，不写死任何读数。 */
export function runPat(s: PatState): PatRun {
  const sigma = s.sigma
  const wafers = WAFER_OFFSET_SIGMA.map((offset, i) =>
    makeWafer({
      diameterDie: WAFER_DIAMETER,
      seed: LOT_SEED + i,
      clusterProb: s.clusterPct / 100,
      latentRate: s.latentPct / 100,
      hardRate: HARD_RATE,
      paramMean: s.mean + offset * sigma,
      paramSigma: sigma,
      latentShiftSigma: s.latentShift,
    }),
  )

  const specFail = wafers.map((map) => new Set<number>(map.dies.filter((d) => isSpecFail(d, s)).map((d) => d.id)))
  const passing: Die[][] = wafers.map((map, i) => map.dies.filter((d) => !specFail[i].has(d.id)))
  const allPass = passing.flat()

  const lotLimits = limitsOf(
    allPass.map((d) => d.param),
    s.k,
  )
  const siteLimits = SITE_IDS.map((site) =>
    limitsOf(
      allPass.filter((d) => siteOf(d) === site).map((d) => d.param),
      s.k,
    ),
  )
  const waferLimits = passing.map((dies) => limitsOf(dies.map((d) => d.param), s.k))

  const limitFor = (i: number, site: number): Limits => {
    if (s.window === 'wafer') {
      return waferLimits[i]
    }
    if (s.window === 'site') {
      return siteLimits[site]
    }
    return lotLimits
  }

  const patFail = wafers.map((map, i) => {
    const fail = new Set<number>()
    const groups: Array<number | null> = s.window === 'site' ? SITE_IDS : [null]
    for (const site of groups) {
      const dies = passing[i].filter((d) => site === null || siteOf(d) === site)
      const lim = limitFor(i, site ?? -1)
      for (const id of patFailSet({ diameterDie: map.diameterDie, dies }, lim.lo, lim.hi)) {
        fail.add(id)
      }
    }
    return fail
  })

  const failedAll = wafers.map((_, i) => new Set<number>([...specFail[i], ...patFail[i]]))
  const nbrExtra = wafers.map((map, i) => {
    if (s.nbr === 'on') {
      return neighborRule(map, failedAll[i], s.radius, s.minFails)
    }
    return new Set<number>()
  })

  const outcome: Outcome[][] = wafers.map((map, i) =>
    map.dies.map((d): Outcome => {
      if (specFail[i].has(d.id)) {
        return 'spec'
      }
      if (patFail[i].has(d.id)) {
        return d.latent ? 'pat-latent' : 'pat-good'
      }
      if (nbrExtra[i].has(d.id)) {
        return d.latent ? 'nbr-latent' : 'nbr-good'
      }
      return d.latent ? 'escape' : 'pass'
    }),
  )

  const stats: PatStats = {
    dies: 0,
    latent: 0,
    good: 0,
    specFail: 0,
    patRemoved: 0,
    nbrExtra: 0,
    latentCaught: 0,
    goodRemoved: 0,
    escapes: 0,
    capture: 0,
    yieldLoss: 0,
  }
  wafers.forEach((map, i) => {
    map.dies.forEach((d) => {
      const o = outcome[i][d.id]
      stats.dies += 1
      if (d.latent) {
        stats.latent += 1
      }
      if (!d.latent && !d.hardFail) {
        stats.good += 1
      }
      if (o === 'spec') {
        stats.specFail += 1
      }
      if (o === 'pat-latent' || o === 'pat-good') {
        stats.patRemoved += 1
      }
      if (o === 'nbr-latent' || o === 'nbr-good') {
        stats.nbrExtra += 1
      }
      if (o === 'pat-good' || o === 'nbr-good') {
        stats.goodRemoved += 1
      }
      if (o === 'escape') {
        stats.escapes += 1
      }
    })
  })
  stats.latentCaught = stats.latent - stats.escapes
  stats.capture = stats.latent > 0 ? stats.latentCaught / stats.latent : 0
  stats.yieldLoss = stats.good > 0 ? stats.goodRemoved / stats.good : 0

  const waferIdx = Math.max(0, WAFER_IDS.indexOf(s.wafer))
  const applied: LimitLine[] =
    s.window === 'site'
      ? SITE_IDS.map((site) => ({ ...siteLimits[site], site }))
      : [{ ...limitFor(waferIdx, -1), site: null }]

  return {
    waferIdx,
    map: wafers[waferIdx],
    outcome: outcome[waferIdx],
    lotLimits,
    waferLimits: waferLimits[waferIdx],
    applied,
    values: passing[waferIdx].map((d) => ({ v: d.param, latent: d.latent })),
    lotMedian: median(allPass.map((d) => d.param)),
    sigmaRob: robustSigma(allPass.map((d) => d.param)),
    waferMedian: median(passing[waferIdx].map((d) => d.param)),
    stats,
  }
}

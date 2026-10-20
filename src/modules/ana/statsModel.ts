/**
 * 「测试限值与统计」的模型（教学示意，虚拟电压参数，不对应任何真实型号）。
 * 规格：LSL 1150 mV、USL 1250 mV，标称 1200 mV。
 * 工艺分布 N(1200 + μ, σ²)，测量误差 N(0, σm²)，测试机还可能有固定偏置 bias。
 * 测试只看测得值 y = x + bias + e，判定为 y 落在 [LSL + GB, USL − GB] 之内；GB 是保护带（guardband）。
 * 解析结果用 core/stats.ts 的正态公式（积分用中点法，JOINT_STEPS 步）；批次抽样用 core/rng.ts 的种子，纯函数、可复现。
 */

import { gaussian, seededRandom } from './core/rng'
import { cpk, mean, normalCdf, probBetween, stdev } from './core/stats'

export const LSL_MV = 1150
export const USL_MV = 1250
export const CENTER_MV = 1200
export const N_BATCH = 2000
const JOINT_STEPS = 4000
/** 扩展不确定度的覆盖因子 k（±2σm，约 95%） */
export const K_UNC = 2
/** 目标：过杀率不超过 0.5%（占全部器件） */
export const TARGET_OVERKILL_PCT = 0.5
/** 目标：漏检率不超过 0.05%（占全部器件） */
export const TARGET_ESCAPE_PCT = 0.05
export const TARGET_CPK = 1.33
export const TARGET_YIELD_PCT = 99.9
export const HIST_LO = 1100
export const HIST_HI = 1300
export const HIST_BINS = 100
export const GUARD_GRID: number[] = Array.from({ length: 21 }, (_, index) => index * 0.5)

export type StatsState = {
  /** 工艺均值相对标称值的偏移，mV */
  mu: number
  /** 工艺标准差，mV */
  sigma: number
  /** 保护带，mV：测试限值向规格内收缩的量 */
  guard: number
  /** 测量标准差（重复性），mV */
  sigmaM: number
  /** 测试机的固定偏置，mV */
  bias: number
  /** 批次抽样的随机种子 */
  seed: number
}

export const DEFAULT_STATS: StatsState = {
  mu: 0,
  sigma: 20,
  guard: 0,
  sigmaM: 2,
  bias: 0,
  seed: 1,
}

export type StatsResult = {
  /** 测试限值（mV）= 规格 ± 保护带 */
  testLo: number
  testHi: number
  /** 真实合格率（占全部器件） */
  yieldTrue: number
  /** 测试通过率（占全部器件） */
  yieldTest: number
  /** 过杀：真实合格但测试判废，占全部器件 */
  overkill: number
  /** 漏检：真实不合格但测试判合格，占全部器件 */
  escape: number
  /** Cp = (USL − LSL) / (6σ)，只看工艺分布 */
  cp: number
  /** 工艺 Cpk，只看工艺分布（不含测量误差） */
  cpkProcess: number
  /** 测得值的 Cpk，把 σm 与 bias 合进去 */
  cpkMeasured: number
  /** 扩展不确定度 U = k · σm（mV） */
  uncertainty: number
}

function stdNormalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)
}

/**
 * P(x ∈ [lo, hi] 且 x + bias + e ∈ [tLo, tHi])，x ~ N(m, sigma²)，e ~ N(0, sigmaM²)。
 * 对 x 做中点法积分：P = ∫ f(x) · [Φ((tHi − x − bias)/σm) − Φ((tLo − x − bias)/σm)] dx
 */
function jointPass(lo: number, hi: number, m: number, sigma: number, tLo: number, tHi: number, bias: number, sigmaM: number): number {
  if (tLo >= tHi || hi <= lo) {
    return 0
  }
  const h = (hi - lo) / JOINT_STEPS
  let acc = 0
  for (let i = 0; i < JOINT_STEPS; i += 1) {
    const x = lo + (i + 0.5) * h
    const pdf = stdNormalPdf((x - m) / sigma) / sigma
    const passGivenX = normalCdf((tHi - x - bias) / sigmaM) - normalCdf((tLo - x - bias) / sigmaM)
    acc += pdf * passGivenX * h
  }
  return acc
}

/** 由状态算出所有解析结果；纯函数 */
export function analyze(s: StatsState): StatsResult {
  const m = CENTER_MV + s.mu
  const testLo = LSL_MV + s.guard
  const testHi = USL_MV - s.guard
  const measSigma = Math.sqrt(s.sigma ** 2 + s.sigmaM ** 2)
  const yieldTrue = probBetween(LSL_MV, USL_MV, m, s.sigma)
  const yieldTest = testLo >= testHi ? 0 : probBetween(testLo, testHi, m + s.bias, measSigma)
  const goodPass = jointPass(LSL_MV, USL_MV, m, s.sigma, testLo, testHi, s.bias, s.sigmaM)
  return {
    testLo,
    testHi,
    yieldTrue,
    yieldTest,
    overkill: yieldTrue - goodPass,
    escape: yieldTest - goodPass,
    cp: (USL_MV - LSL_MV) / (6 * s.sigma),
    cpkProcess: cpk(USL_MV, LSL_MV, m, s.sigma),
    cpkMeasured: cpk(USL_MV, LSL_MV, m + s.bias, measSigma),
    uncertainty: K_UNC * s.sigmaM,
  }
}

export type BatchPoint = { x: number; y: number }

/** 抽样一批器件：x 是真实值，y 是测得值；同一种子结果相同 */
export function sampleBatch(s: StatsState): BatchPoint[] {
  const random = seededRandom(s.seed)
  const m = CENTER_MV + s.mu
  const points: BatchPoint[] = []
  for (let i = 0; i < N_BATCH; i += 1) {
    const x = m + s.sigma * gaussian(random)
    const y = x + s.bias + s.sigmaM * gaussian(random)
    points.push({ x, y })
  }
  return points
}

export type BatchSummary = {
  passN: number
  overkillN: number
  escapeN: number
  meanX: number
  sdX: number
}

/** 批次统计：按测得值判定，与真实值比较得到过杀和漏检的个数 */
export function summarize(points: readonly BatchPoint[], s: StatsState): BatchSummary {
  const testLo = LSL_MV + s.guard
  const testHi = USL_MV - s.guard
  let passN = 0
  let overkillN = 0
  let escapeN = 0
  for (const p of points) {
    const good = p.x >= LSL_MV && p.x <= USL_MV
    const pass = p.y >= testLo && p.y <= testHi
    if (pass) {
      passN += 1
    }
    if (good && !pass) {
      overkillN += 1
    }
    if (!good && pass) {
      escapeN += 1
    }
  }
  const xs = points.map((p) => p.x)
  return { passN, overkillN, escapeN, meanX: mean(xs), sdX: stdev(xs) }
}

/** 直方图：落在 [lo, hi) 内的值计入对应的 bins 格 */
export function histogram(values: readonly number[], lo: number, hi: number, bins: number): number[] {
  const counts = new Array<number>(bins).fill(0)
  const width = (hi - lo) / bins
  for (const v of values) {
    if (v >= lo && v < hi) {
      const index = Math.floor((v - lo) / width)
      counts[index] += 1
    }
  }
  return counts
}

export type GuardPoint = { guard: number; overkillPct: number; escapePct: number }

/** 保护带扫描：每个保护带值下的过杀率与漏检率（百分数） */
export function guardCurve(s: StatsState, guards: readonly number[]): GuardPoint[] {
  return guards.map((guard) => {
    const r = analyze({ ...s, guard })
    return { guard, overkillPct: r.overkill * 100, escapePct: r.escape * 100 }
  })
}

/** 分数转百分数字符串，digits 为小数位数 */
export function pct(fraction: number, digits: number): string {
  return `${(fraction * 100).toFixed(digits)}%`
}

/**
 * REL-01 浴盆曲线的群体模型（纯函数，不依赖 React）。
 *
 * 群体分两类（教学示意）：
 *  - 早期缺陷群体（比例 p）：寿命为 Weibull，β < 1，失效率随时间下降；
 *  - 正常群体（比例 1 − p）：随机失效（恒定 λ）与磨损失效（Weibull，β > 1）两种机理竞争，先发生者决定寿命。
 *
 * 于是 R(t) = p·R_早(t) + (1 − p)·exp(−λt)·R_磨(t)，h(t) = [Σ w·h] / [Σ w]（w 为各类的生存函数）。
 * 三段的分界不是写死的：由 h(t) 的形状数值算出（见 segmentBounds）。
 * 单位：时间 h；失效率 λ 与 h(t) 为 /h，界面用 FIT（×1e9）显示。
 */
import { weibullCdf, weibullHazard } from './core/reliability'
import { mulberry32 } from './core/wafer'

/** 蒙特卡洛群体大小（界面用，约 5000 颗） */
export const N_UNITS = 5000
export const HOURS_PER_YEAR = 8760
/** 时间轴范围，h（对数） */
export const T_MIN_H = 0.1
export const T_MAX_H = 1e6
/** 曲线采样点数（对数均匀） */
export const GRID_POINTS = 241
/** 直方图每十倍时间的分箱数 */
export const HIST_PER_DECADE = 4
/** 出货残余早期缺陷的教学目标，ppm（教学目标，不是标准值） */
export const PPM_TARGET = 1000

/** ELFR 覆盖哪一段：选项数组的顺序即显示顺序，默认取 [0] */
export const SEG_IDS = ['random', 'early', 'wear'] as const
export type SegId = (typeof SEG_IDS)[number]

export type BathState = {
  /** 早期缺陷群体比例，0–1 */
  earlyFrac: number
  /** 早期群体 Weibull 形状参数 β（< 1） */
  betaEarly: number
  /** 早期群体特征寿命 η，h */
  etaEarly: number
  /** 随机段失效率 λ，FIT */
  randomFit: number
  /** 磨损段 Weibull 形状参数 β（> 1） */
  betaWear: number
  /** 磨损段特征寿命 η，h */
  etaWear: number
  /** 筛选（老化）时间，h */
  screenH: number
  /** ELFR 覆盖的段 */
  seg: SegId
  /** 蒙特卡洛随机种子 */
  seed: number
}

export const DEFAULT_BATH: BathState = {
  earlyFrac: 0.02,
  betaEarly: 0.5,
  etaEarly: 50,
  randomFit: 300,
  betaWear: 4,
  etaWear: 100000,
  screenH: 0,
  seg: SEG_IDS[0],
  seed: 2026,
}

export type HistBins = {
  /** 分箱边界（h），长度 = 箱数 + 1 */
  edges: number[]
  /** 每箱蒙特卡洛失效计数 */
  counts: number[]
  /** 每箱解析期望计数 N·[F(右) − F(左)] */
  expected: number[]
}

export type BathAnalysis = {
  /** 对数均匀时间网格，h */
  grid: number[]
  /** 网格上的 h(t)，FIT */
  hazardFit: number[]
  /** 网格上的 R(t)（全群体） */
  rel: number[]
  /** 网格上的随机段 exp(−λt) */
  relRandom: number[]
  /** 段界：早期段结束 t1、磨损段开始 t2，h */
  t1: number
  t2: number
  /** 浴盆底（网格上的最低 h），FIT */
  bottomFit: number
  /** R(t) = 0.9 对应的时间，h */
  r90: number
  /** 5 年（43800 h）全群体可靠度 */
  r5Full: number
  /** 5 年随机段可靠度 exp(−λ·43800) */
  r5Random: number
  /** 随机段 MTTF = 1/λ，h（λ = 0 时为 Infinity） */
  mttfRandomH: number
  /** 出货残余早期缺陷，ppm */
  shipPpm: number
  /** 5 年内蒙特卡洛失效计数与解析期望（N·F(43800 h)） */
  fail5Count: number
  fail5Expected: number
  /** 蒙特卡洛样本（失效时间，h） */
  times: number[]
  hist: HistBins
}

/** 5 年的小时数，与教学文案一致（5 × 8760） */
export const FIVE_YEARS_H = 5 * HOURS_PER_YEAR

export function lambdaOf(s: BathState): number {
  return s.randomFit * 1e-9
}

/** 早期群体与正常群体的对数生存函数（用对数避免大 t 时下溢） */
function logRelEarly(s: BathState, t: number): number {
  return -Math.pow(t / s.etaEarly, s.betaEarly)
}

function logRelNormal(s: BathState, t: number): number {
  return -lambdaOf(s) * t - Math.pow(t / s.etaWear, s.betaWear)
}

/**
 * 全群体的 R(t) 与 h(t)（/h）。
 * 两类的权重 w = p·R_早、(1−p)·R_正常，用 log-sum-exp 归一化；
 * h = Σ w·h_i / Σ w，其中 h_正常 = λ + h_磨（竞争风险的风险函数相加）。
 */
export function mixAt(s: BathState, t: number): { r: number; h: number } {
  const pE = s.earlyFrac
  const logA = pE > 0 ? Math.log(pE) + logRelEarly(s, t) : -Infinity
  const logB = pE < 1 ? Math.log(1 - pE) + logRelNormal(s, t) : -Infinity
  const m = Math.max(logA, logB)
  const wE = Math.exp(logA - m)
  const wN = Math.exp(logB - m)
  const sum = wE + wN
  const r = Math.exp(m) * sum
  const he = pE > 0 ? weibullHazard(s.betaEarly, s.etaEarly, t) : 0
  const hn = lambdaOf(s) + weibullHazard(s.betaWear, s.etaWear, t)
  return { r, h: (wE * he + wN * hn) / sum }
}

export function reliabilityAt(s: BathState, t: number): number {
  return mixAt(s, t).r
}

export function hazardAt(s: BathState, t: number): number {
  return mixAt(s, t).h
}

/** 对数均匀网格 */
export function logGrid(tMin: number, tMax: number, n: number): number[] {
  const a = Math.log10(tMin)
  const b = Math.log10(tMax)
  const out: number[] = []
  for (let i = 0; i < n; i += 1) {
    out.push(Math.pow(10, a + ((b - a) * i) / (n - 1)))
  }
  return out
}

/** 与段界有关的两个点：t1 = h 首次降到 2λ 以下（早期段结束），t2 = 最低点之后 h 首次升到 2λ 以上（磨损段开始） */
export function segmentBounds(s: BathState, grid: number[], hazards: number[]): { t1: number; t2: number } {
  const threshold = 2 * lambdaOf(s)
  let i1 = hazards.findIndex((h) => h <= threshold)
  if (i1 < 0) {
    i1 = grid.length - 1
  }
  let iMin = 0
  for (let i = 1; i < hazards.length; i += 1) {
    if (hazards[i] < hazards[iMin]) {
      iMin = i
    }
  }
  let i2 = -1
  for (let i = iMin + 1; i < hazards.length; i += 1) {
    if (hazards[i] >= threshold) {
      i2 = i
      break
    }
  }
  if (i2 < 0) {
    i2 = grid.length - 1
  }
  return { t1: grid[i1], t2: grid[i2] }
}

/** 蒙特卡洛抽样：同一 seed 同一结果（mulberry32） */
export function sampleLifetimes(s: BathState, n: number = N_UNITS): number[] {
  const rand = mulberry32(s.seed)
  const lam = lambdaOf(s)
  const out: number[] = []
  for (let i = 0; i < n; i += 1) {
    if (rand() < s.earlyFrac) {
      out.push(s.etaEarly * Math.pow(-Math.log(1 - rand()), 1 / s.betaEarly))
    } else {
      const uRand = rand()
      const tRand = lam > 0 ? -Math.log(1 - uRand) / lam : Infinity
      const tWear = s.etaWear * Math.pow(-Math.log(1 - rand()), 1 / s.betaWear)
      out.push(Math.min(tRand, tWear))
    }
  }
  return out
}

/** 按对数分箱统计蒙特卡洛失效数，并算每箱的解析期望 */
export function histogramOf(s: BathState, times: number[]): HistBins {
  const decades = Math.round(Math.log10(T_MAX_H / T_MIN_H))
  const nBins = decades * HIST_PER_DECADE
  const logMin = Math.log10(T_MIN_H)
  const edges: number[] = []
  for (let i = 0; i <= nBins; i += 1) {
    edges.push(Math.pow(10, logMin + i / HIST_PER_DECADE))
  }
  const counts: number[] = new Array(nBins).fill(0)
  for (const t of times) {
    if (t < T_MIN_H || t >= T_MAX_H) {
      continue
    }
    const idx = Math.min(nBins - 1, Math.floor((Math.log10(t) - logMin) * HIST_PER_DECADE))
    counts[idx] += 1
  }
  const expected = edges.slice(0, nBins).map((lo, i) => {
    const hi = edges[i + 1]
    return times.length * (reliabilityAt(s, lo) - reliabilityAt(s, hi))
  })
  return { edges, counts, expected }
}

/** R(t) = target 对应的时间（对数二分）。R 单调下降；超出时间范围时返回边界值 */
export function timeAtReliability(s: BathState, target: number): number {
  if (reliabilityAt(s, T_MIN_H) <= target) {
    return T_MIN_H
  }
  if (reliabilityAt(s, T_MAX_H) >= target) {
    return T_MAX_H
  }
  let lo = Math.log10(T_MIN_H)
  let hi = Math.log10(T_MAX_H)
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2
    if (reliabilityAt(s, Math.pow(10, mid)) > target) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return Math.pow(10, (lo + hi) / 2)
}

/**
 * 筛选（老化）后出货群体中残余的早期缺陷比例，ppm。
 * 筛选时间内失效的早期缺陷品被剔除：残余 = p·(1 − F_早(h_s)) / (1 − p·F_早(h_s))。
 */
export function shippedPpm(s: BathState): number {
  const fe = s.screenH > 0 ? weibullCdf(s.betaEarly, s.etaEarly, s.screenH) : 0
  const removed = s.earlyFrac * fe
  const residual = s.earlyFrac * (1 - fe)
  const denom = 1 - removed
  return denom > 0 ? (residual / denom) * 1e6 : 0
}

/** 整个页面需要的分析结果：纯计算，供页面与单元测试共用 */
export function analyseBath(s: BathState): BathAnalysis {
  const grid = logGrid(T_MIN_H, T_MAX_H, GRID_POINTS)
  const mix = grid.map((t) => mixAt(s, t))
  const hazards = mix.map((m) => m.h)
  const lam = lambdaOf(s)
  const { t1, t2 } = segmentBounds(s, grid, hazards)
  const times = sampleLifetimes(s)
  return {
    grid,
    hazardFit: hazards.map((h) => h * 1e9),
    rel: mix.map((m) => m.r),
    relRandom: grid.map((t) => Math.exp(-lam * t)),
    t1,
    t2,
    bottomFit: Math.min(...hazards) * 1e9,
    r90: timeAtReliability(s, 0.9),
    r5Full: reliabilityAt(s, FIVE_YEARS_H),
    r5Random: Math.exp(-lam * FIVE_YEARS_H),
    mttfRandomH: lam > 0 ? 1 / lam : Infinity,
    shipPpm: shippedPpm(s),
    fail5Count: times.filter((x) => x <= FIVE_YEARS_H).length,
    fail5Expected: times.length * (1 - reliabilityAt(s, FIVE_YEARS_H)),
    times,
    hist: histogramOf(s, times),
  }
}

/** 时间的可读写法：1234 h、1.2×10^6 h（尾数保留一位） */
export function fmtHours(h: number): string {
  if (!Number.isFinite(h)) {
    return '∞'
  }
  if (h < 1e4) {
    return `${h.toFixed(h < 10 ? 1 : 0)} h`
  }
  const e = Math.floor(Math.log10(h))
  const mant = h / Math.pow(10, e)
  return `${mant.toFixed(1)}×10^${e} h`
}

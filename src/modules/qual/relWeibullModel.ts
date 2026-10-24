/**
 * REL-04 寿命数据分析：Weibull 与 FIT 的教学模型。
 *
 * 抽样：u ~ U(0,1)（mulberry32 可复现），t = η · (−ln(1 − u))^(1/β)，即 Weibull 的逆 CDF。
 * 截尾（右删失）：t > censorAt 的器件在 censorAt 时仍未失效，记为 censored，不计入失效数。
 * 拟合：fitWeibull（中位秩回归，Bernard 近似，删失点用 Johnson 调整秩占位）。
 * 外推：应力条件下的 Weibull 尺度 η_stress 乘以 AF 得到使用条件的 η_use = η_stress × AF。
 * B10：F(t) = 0.1 的时间，t = η · (−ln 0.9)^(1/β)。
 */
import { arrheniusAF, fitWeibull, weibullCdf } from './core/reliability'
import { mulberry32 } from './core/wafer'

/** 默认加速因子：Ea 0.7 eV、55 → 125 °C（与 REL-02、REL-03 一致），取一位小数 */
export const DEFAULT_AF = Math.round(arrheniusAF(0.7, 55, 125) * 10) / 10
/** 10 年的小时数（教学用，8760 h / 年） */
export const TEN_YEAR_H = 10 * 8760
/** B 寿命的失效比例：B10 = 10% 失效时的时间 */
export const B10_F = 0.1

export type WeibullState = {
  /** 真值 β（形状参数） */
  beta: number
  /** 真值 η（尺度参数），应力条件下的小时数 */
  eta: number
  /** 样本数 */
  n: number
  /** 截尾时间，h；超过它仍未失效的器件记为截尾 */
  censorAt: number
  /** 随机种子，相同种子得到相同样本 */
  seed: number
  /** 外推用的加速因子 AF */
  af: number
}

export const DEFAULT_WEIBULL: WeibullState = {
  beta: 2,
  eta: 1000,
  n: 30,
  censorAt: 1500,
  seed: 42,
  af: DEFAULT_AF,
}

export type Sample = { t: number; censored: boolean }

export type FailureMode = 'early' | 'random' | 'wearout'

/** 由均匀随机数 u 得到 Weibull 寿命（逆 CDF） */
export function lifeFromUniform(beta: number, eta: number, u: number): number {
  const life = eta * Math.pow(-Math.log(1 - u), 1 / beta)
  return Math.max(life, 1e-6)
}

/** 抽取 n 个寿命，超过 censorAt 的记为截尾（时间记为 censorAt） */
export function sampleLifetimes(beta: number, eta: number, n: number, seed: number, censorAt: number): Sample[] {
  const rand = mulberry32(seed)
  const out: Sample[] = []
  for (let i = 0; i < n; i += 1) {
    const life = lifeFromUniform(beta, eta, rand())
    if (life > censorAt) {
      out.push({ t: censorAt, censored: true })
    } else {
      out.push({ t: life, censored: false })
    }
  }
  return out
}

/**
 * 失效点的中位秩 F_i，与 fitWeibull 使用同一套 Johnson 调整：
 * 删失点不画点，但占据顺序位置，所以它之后的失效秩会被抬高。
 */
export function medianRankPoints(samples: Sample[]): Array<{ t: number; f: number }> {
  const items = samples
    .map((s) => ({ t: s.t, censored: s.censored }))
    .sort((a, b) => a.t - b.t || Number(a.censored) - Number(b.censored))
  const n = items.length
  const out: Array<{ t: number; f: number }> = []
  let prevRank = 0
  for (let i = 0; i < n; i += 1) {
    const item = items[i]
    if (item.censored) {
      continue
    }
    const reverse = n - i
    const adjusted = prevRank + (n + 1 - prevRank) / (1 + reverse)
    prevRank = adjusted
    out.push({ t: item.t, f: (adjusted - 0.3) / (n + 0.4) })
  }
  return out
}

/** 形状参数判断失效模式：β < 1 早期，β ≈ 1 随机，β > 1 磨损（±0.1 内算 ≈ 1） */
export function failureMode(beta: number): FailureMode {
  if (Math.abs(beta - 1) < 0.1) {
    return 'random'
  }
  return beta < 1 ? 'early' : 'wearout'
}

export type WeibullAnalysis = {
  samples: Sample[]
  failures: number
  censored: number
  fit: { beta: number; eta: number; r2: number }
  finite: boolean
  /** |β̂ − β| / β，无法拟合时为 NaN */
  errBeta: number
  /** |η̂ − η| / η，无法拟合时为 NaN */
  errEta: number
  /** 外推后使用条件的 B10（h）：用估计值 */
  b10Use: number
  /** 外推后使用条件的 B10（h）：用真值 */
  b10True: number
  /** 使用条件下 10 年的可靠度 R = 1 − F，用估计值 */
  rUse10: number
  /** 使用条件下 10 年的可靠度，用真值 */
  rTrue10: number
  /** 用于画图的失效点 */
  points: Array<{ t: number; f: number }>
}

export function analyseWeibull(state: WeibullState): WeibullAnalysis {
  const samples = sampleLifetimes(state.beta, state.eta, state.n, state.seed, state.censorAt)
  const times = samples.map((s) => s.t)
  const cens = samples.map((s) => s.censored)
  const fit = fitWeibull(times, cens)
  const finite = Number.isFinite(fit.beta) && Number.isFinite(fit.eta)
  const b10Fraction = Math.pow(-Math.log(1 - B10_F), 1 / (finite ? fit.beta : 1))
  const failures = samples.filter((s) => !s.censored).length
  return {
    samples,
    failures,
    censored: samples.length - failures,
    fit,
    finite,
    errBeta: finite ? Math.abs(fit.beta - state.beta) / state.beta : NaN,
    errEta: finite ? Math.abs(fit.eta - state.eta) / state.eta : NaN,
    b10Use: finite ? fit.eta * b10Fraction * state.af : NaN,
    b10True: state.eta * state.af * Math.pow(-Math.log(1 - B10_F), 1 / state.beta),
    rUse10: finite ? 1 - weibullCdf(fit.beta, fit.eta * state.af, TEN_YEAR_H) : NaN,
    rTrue10: 1 - weibullCdf(state.beta, state.eta * state.af, TEN_YEAR_H),
    points: medianRankPoints(samples),
  }
}

/**
 * 重复 seeds 个随机种子，返回平均的 |β̂−β|/β。用于比较不同样本量的估计误差。
 */
export function meanBetaError(beta: number, eta: number, n: number, seeds: number): number {
  let total = 0
  for (let s = 1; s <= seeds; s += 1) {
    const samples = sampleLifetimes(beta, eta, n, s, Infinity)
    const fit = fitWeibull(
      samples.map((x) => x.t),
      samples.map((x) => x.censored),
    )
    total += Math.abs(fit.beta - beta) / beta
  }
  return total / seeds
}

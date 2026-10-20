/**
 * 抖动与噪声的教学模型（HS-04）。
 * 每个数据沿相对理想位置的偏移 = DJ + RJ：
 *   DJ（确定性抖动，有界）：双峰。每个沿以 1/2 的概率落在 −DJ_pp/2 或 +DJ_pp/2 上，不会超出 ±DJ_pp/2。
 *   RJ（随机抖动，高斯）：σ = RJ rms，每个沿独立叠加一个 N(0, σ²)。
 * 直方图：用固定种子抽 SAMPLES 个沿，统计它们的偏移；模型曲线是同样两个高斯峰的理论值。
 * 浴盆曲线（双狄拉克模型）：采样点离左沿的距离为 x 时，左沿的误码率 Q((x − DJ_pp/2)/σ)，
 *   右沿同理 Q((UI − x − DJ_pp/2)/σ)。目标 BER 下的开口边界为 DJ_pp/2 + Q⁻¹(BER)·σ，
 *   所以开口 = UI − (DJ_pp + 2·Q⁻¹(BER)·σ) = UI − tjAtBer(DJ_pp, σ, BER)。
 */
import { gaussian, seededRandom } from '../ana/core/rng'
import { qFunction, qOfBer, tjAtBer } from './core/jitter'

export type JitterState = {
  /** 数据速率，Gb/s */
  rate: number
  /** 随机抖动 RJ 的 rms，ps */
  rj: number
  /** 确定性抖动 DJ 的峰峰值，ps */
  dj: number
  /** 目标误码率 */
  ber: number
}

/** 速率选项，显示顺序即数组顺序；默认取 [0] */
export const RATES: number[] = [10, 16, 25]
/** 目标 BER 选项，显示顺序即数组顺序；默认取 [0] */
export const BER_TARGETS: number[] = [1e-12, 1e-9, 1e-15]
/** 参考 BER：TJ@1e-12 的读数始终显示它 */
export const TJ_REF_BER = 1e-12

export const DEFAULT_JITTER: JitterState = { rate: RATES[0], rj: 1.5, dj: 20, ber: BER_TARGETS[0] }

/** 直方图的样本数（固定种子） */
export const SAMPLES = 4000
export const BINS = 60
const SEED = 0x7a1f
/** 浴盆曲线的纵轴下限：log10(BER) */
export const LOG_FLOOR = -16
const BATH_STEPS = 200

export type HistBin = { centre: number; count: number; model: number }
export type BathPoint = { x: number; log: number }

export type JitterAnalysis = {
  /** 单位间隔 UI，ps */
  ui: number
  /** 直方图横轴范围 [−range, +range]，ps */
  range: number
  /** 直方图每个 bin 的宽度，ps */
  binWidth: number
  bins: HistBin[]
  /** 浴盆曲线：横轴为采样点位置（ps），纵轴为 log10(BER) */
  bath: BathPoint[]
  /** Q⁻¹(目标 BER) */
  q: number
  /** 目标 BER 下的总抖动，ps */
  tjTarget: number
  /** 1e-12 下的总抖动，ps */
  tjRef: number
  /** 目标 BER 下的眼开口 = UI − TJ，ps；为负表示闭合 */
  opening: number
  /** 目标 BER 下开口的左右边界，ps */
  openLeft: number
  openRight: number
  pass: boolean
}

/** 双狄拉克模型下，采样点在 x（ps，离左沿）时的误码率；两侧误码率相加 */
export function berAt(x: number, ui: number, dj: number, rj: number): number {
  const half = dj / 2
  if (rj <= 0) {
    return x < half || ui - x < half ? 1 : 0
  }
  return Math.min(1, qFunction((x - half) / rj) + qFunction((ui - x - half) / rj))
}

function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)
}

/** 直方图中一个 bin 的理论计数：两个高斯峰各占一半 */
function expectedCount(centre: number, half: number, rj: number, binWidth: number): number {
  if (rj <= 0) {
    return 0
  }
  const density = (0.5 * (normalPdf((centre - half) / rj) + normalPdf((centre + half) / rj))) / rj
  return SAMPLES * binWidth * density
}

export function analyseJitter(state: JitterState): JitterAnalysis {
  const ui = 1000 / state.rate
  const half = state.dj / 2
  const range = Math.max(half + 4 * state.rj, 1)
  const binWidth = (2 * range) / BINS

  const random = seededRandom(SEED)
  const counts = new Array<number>(BINS).fill(0)
  for (let i = 0; i < SAMPLES; i += 1) {
    const centre = random() < 0.5 ? -half : half
    const offset = centre + state.rj * gaussian(random)
    const bin = Math.floor((offset + range) / binWidth)
    if (bin >= 0 && bin < BINS) {
      counts[bin] += 1
    }
  }

  const bins: HistBin[] = []
  for (let b = 0; b < BINS; b += 1) {
    const centre = -range + (b + 0.5) * binWidth
    bins.push({ centre, count: counts[b], model: expectedCount(centre, half, state.rj, binWidth) })
  }

  const bath: BathPoint[] = []
  for (let i = 0; i <= BATH_STEPS; i += 1) {
    const x = (i / BATH_STEPS) * ui
    const ber = berAt(x, ui, state.dj, state.rj)
    bath.push({ x, log: ber > 0 ? Math.max(LOG_FLOOR, Math.log10(ber)) : LOG_FLOOR })
  }

  const q = qOfBer(state.ber)
  const tjTarget = tjAtBer(state.dj, state.rj, state.ber)
  const opening = ui - tjTarget

  return {
    ui,
    range,
    binWidth,
    bins,
    bath,
    q,
    tjTarget,
    tjRef: tjAtBer(state.dj, state.rj, TJ_REF_BER),
    opening,
    openLeft: half + q * state.rj,
    openRight: ui - half - q * state.rj,
    pass: opening > 0,
  }
}

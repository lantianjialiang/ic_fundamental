/**
 * 调制与 I/Q 失衡的教学模型（RF-11，RF-12 复用）。
 * 星座：QPSK 4 点 (±1 ±j)/√2；16QAM 为 4×4 点，每轴电平 {−3, −1, 1, 3}/√10。两者平均功率都归一化为 1。
 * I/Q 失衡（以 I 路为基准）：I' = I，Q' = (1+ε)·(Q·cosφ + I·sinφ)。
 *   ε 是 Q 路相对 I 路的增益误差，φ 是 Q 路相对 I 路的相位误差；ε = φ = 0 时没有失衡。
 *   只看相对增益：两路同时乘同一个增益只会让星座整体缩放，所以这里把 I 路固定为基准。
 * 接收：失衡之后，每个符号再加一个很小的高斯噪声（σ = NOISE_SIGMA）。种子固定，同样的设置每次算出的结果一样。
 * 判决：最近点判决（离哪个理想点最近就判哪个）；判错的符号数 = 发送点与判决点不同的符号数。
 */

import { gaussian, seededRandom } from '../ana/core/rng'
import { type Complex } from './core/units'

export type Scheme = 'qpsk' | 'qam16'

/** 调制选项，显示顺序即数组顺序；默认取 [0] */
export const SCHEMES: Scheme[] = ['qpsk', 'qam16']

export const BITS_PER_SYMBOL: Record<Scheme, number> = { qpsk: 2, qam16: 4 }

/** 每次分析的符号数，同时也是星座图上的散点数 */
export const NSYM = 256
/** 接收噪声的标准差（相对平均功率 1 的星座） */
export const NOISE_SIGMA = 0.03
const SEED_SYMBOLS = 0x1f2e
const SEED_NOISE = 0x3c4d

/** 理想星座点，平均功率 = 1 */
export function constellation(scheme: Scheme): Complex[] {
  if (scheme === 'qpsk') {
    const a = Math.SQRT1_2
    return [
      { re: a, im: a },
      { re: -a, im: a },
      { re: -a, im: -a },
      { re: a, im: -a },
    ]
  }
  const levels = [-3, -1, 1, 3]
  const norm = Math.sqrt(10)
  const points: Complex[] = []
  for (const q of levels) {
    for (const i of levels) {
      points.push({ re: i / norm, im: q / norm })
    }
  }
  return points
}

/** 星座里任意两点的最小欧氏距离（归一化单位） */
export function minDistance(points: Complex[]): number {
  let best = Infinity
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const d = Math.hypot(points[i].re - points[j].re, points[i].im - points[j].im)
      if (d < best) {
        best = d
      }
    }
  }
  return best
}

/** 确定性的符号序列：返回每个符号在星座数组里的下标 */
export function symbolIndices(scheme: Scheme, count: number, seed: number): number[] {
  const size = constellation(scheme).length
  const random = seededRandom(seed)
  const out: number[] = []
  for (let i = 0; i < count; i += 1) {
    out.push(Math.floor(random() * size))
  }
  return out
}

/** I/Q 失衡：I' = I，Q' = (1+ε)(Q·cosφ + I·sinφ)。epsPct 单位为 %，phiDeg 单位为度 */
export function iqImpair(z: Complex, epsPct: number, phiDeg: number): Complex {
  const gain = 1 + epsPct / 100
  const phi = (phiDeg * Math.PI) / 180
  return { re: z.re, im: gain * (z.im * Math.cos(phi) + z.re * Math.sin(phi)) }
}

/** 最近点判决：返回离 z 最近的理想点下标 */
export function nearestIndex(z: Complex, points: Complex[]): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < points.length; i += 1) {
    const d = (z.re - points[i].re) ** 2 + (z.im - points[i].im) ** 2
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

export type ModState = {
  scheme: Scheme
  /** Q 路相对 I 路的增益误差，%（正数表示 Q 路偏大） */
  epsPct: number
  /** Q 路相对 I 路的相位误差，度 */
  phiDeg: number
}

export const DEFAULT_MOD: ModState = { scheme: SCHEMES[0], epsPct: 0, phiDeg: 0 }

export type ModAnalysis = {
  /** 理想星座点 */
  points: Complex[]
  /** 每个符号的理想位置（NSYM 个） */
  ideal: Complex[]
  /** 每个符号的接收位置：先失衡，再加噪声 */
  rx: Complex[]
  /** 判错的符号数 */
  errors: number
  /** 每个符号是否判错（与 rx 一一对应） */
  bad: boolean[]
  /** 理想星座的最小点间距 */
  dMin: number
  /** 增益误差换算成 dB：20·log10(1+ε) */
  gainErrDb: number
}

export function analyseModulation(state: ModState): ModAnalysis {
  const points = constellation(state.scheme)
  const idx = symbolIndices(state.scheme, NSYM, SEED_SYMBOLS)
  const random = seededRandom(SEED_NOISE)
  const ideal: Complex[] = []
  const rx: Complex[] = []
  const bad: boolean[] = []
  let errors = 0
  for (let i = 0; i < NSYM; i += 1) {
    const sym = points[idx[i]]
    const impaired = iqImpair(sym, state.epsPct, state.phiDeg)
    const noisy: Complex = {
      re: impaired.re + NOISE_SIGMA * gaussian(random),
      im: impaired.im + NOISE_SIGMA * gaussian(random),
    }
    const wrong = nearestIndex(noisy, points) !== idx[i]
    ideal.push(sym)
    rx.push(noisy)
    bad.push(wrong)
    if (wrong) {
      errors += 1
    }
  }
  return {
    points,
    ideal,
    rx,
    errors,
    bad,
    dMin: minDistance(points),
    gainErrDb: 20 * Math.log10(1 + state.epsPct / 100),
  }
}

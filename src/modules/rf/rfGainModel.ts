/**
 * RF-05 增益与插入损耗的教学模型（不对应任何具体器件）。
 * 频率响应用二阶带通（教学模型）：
 *   |H(f)| = G0 / √(1 + Q²·(f/f0 − f0/f)²)，以 dB 表示为 G0 − 10·log10(1 + Q²·(f/f0 − f0/f)²)。
 *   G0 是中心频率 f0 处的增益：有源放大器 G0 > 0；无源器件（滤波器）G0 < 0，插入损耗 IL = −G0。
 *   该模型的 3 dB 带宽解析式是 f0 / Q，本课用数值扫描求出，并可以用 f0 / Q 来检查。
 * 数值方法（对数频率轴 0.1–20 GHz，801 个点）：
 *   - 峰值：扫描点中的最大增益（dB）。
 *   - 3 dB 带宽：峰值以下 3 dB 处的两个交点，在相邻两点之间按 log f 线性插值。
 *   - 平坦度：工作带宽 [f0 − W/2, f0 + W/2]（截在扫描范围内）内增益的最大值减最小值，即峰峰 dB。
 * 只用 dB 相对量（增益、插损、相对峰值的 3 dB），不涉及绝对功率，所以不需要参考阻抗。
 */

import { ratioToDb } from './core/units'

export type DeviceKind = 'amp' | 'passive'

/** 器件选项，显示顺序即数组顺序；默认取 [0] */
export const DEVICE_IDS: DeviceKind[] = ['amp', 'passive']

/** 中心增益 G0（dB）：放大器 +12 dB；无源器件 −2.5 dB，即插损 2.5 dB。教学设定值，不代表任何真实器件。 */
export const CENTRE_DB: Record<DeviceKind, number> = { amp: 12, passive: -2.5 }

export const F_MIN_GHZ = 0.1
export const F_MAX_GHZ = 20
/** 对数频率轴上的扫描点数 */
export const SWEEP_POINTS = 801
/** 平坦度限值（dB）：教学设定，工作带宽内峰峰值不超过它才 PASS */
export const FLAT_LIMIT_DB = 1

export const F0_MIN = 1
export const F0_MAX = 8
export const Q_MIN = 1
export const Q_MAX = 5
export const BAND_MIN = 0.2
export const BAND_MAX = 2

export type GainState = {
  device: DeviceKind
  /** 中心频率，GHz */
  f0: number
  /** 品质因数 Q（二阶带通） */
  q: number
  /** 工作带宽 W，GHz：平坦度在 f0 ± W/2 内计算 */
  band: number
}

export const DEFAULT_GAIN: GainState = { device: DEVICE_IDS[0], f0: 4, q: 1.5, band: 1 }

export type SweepPoint = { f: number; db: number }

/** 单点频率响应（dB）：G0 − 10·log10(1 + Q²·(f/f0 − f0/f)²) */
export function responseDb(f: number, f0: number, q: number, g0Db: number): number {
  const detune = f / f0 - f0 / f
  return g0Db + ratioToDb(1 / (1 + q * q * detune * detune))
}

/** 对数频率轴上的扫频，返回 SWEEP_POINTS 个点 */
export function sweepResponse(state: GainState): SweepPoint[] {
  const g0 = CENTRE_DB[state.device]
  const logSpan = Math.log(F_MAX_GHZ / F_MIN_GHZ)
  const points: SweepPoint[] = []
  for (let i = 0; i < SWEEP_POINTS; i += 1) {
    const f = F_MIN_GHZ * Math.exp((logSpan * i) / (SWEEP_POINTS - 1))
    points.push({ f, db: responseDb(f, state.f0, state.q, g0) })
  }
  return points
}

/**
 * 从峰值点向一侧搜索第一个 ≤ level 的点，在它与前一点之间按 log f 线性插值。
 * 找不到（超出扫描范围）时返回 null。
 */
function findCrossing(points: SweepPoint[], peakIdx: number, step: 1 | -1, level: number): number | null {
  for (let i = peakIdx + step; i >= 0 && i < points.length; i += step) {
    if (points[i].db <= level) {
      const above = points[i - step]
      const below = points[i]
      const t = (above.db - level) / (above.db - below.db)
      const logF = Math.log(above.f) + t * (Math.log(below.f) - Math.log(above.f))
      return Math.exp(logF)
    }
  }
  return null
}

export type GainAnalysis = {
  points: SweepPoint[]
  f0: number
  g0: number
  /** 扫描得到的峰值（dB）与峰值频率（GHz） */
  peakDb: number
  peakF: number
  /** 3 dB 带宽的两端（GHz），超出扫描范围时为 null */
  fLow: number | null
  fHigh: number | null
  bw3: number | null
  /** 工作带宽的范围（GHz，已截在扫描范围内） */
  bandLow: number
  bandHigh: number
  /** 工作带宽内的平坦度（峰峰 dB） */
  flatPp: number
  pass: boolean
}

export function analyseGain(state: GainState): GainAnalysis {
  const points = sweepResponse(state)
  let peakIdx = 0
  for (let i = 1; i < points.length; i += 1) {
    if (points[i].db > points[peakIdx].db) {
      peakIdx = i
    }
  }
  const peakDb = points[peakIdx].db
  const level = peakDb - 3
  const fLow = findCrossing(points, peakIdx, -1, level)
  const fHigh = findCrossing(points, peakIdx, 1, level)
  const bandLow = Math.max(state.f0 - state.band / 2, F_MIN_GHZ)
  const bandHigh = Math.min(state.f0 + state.band / 2, F_MAX_GHZ)
  let maxDb = Number.NEGATIVE_INFINITY
  let minDb = Number.POSITIVE_INFINITY
  for (const p of points) {
    if (p.f >= bandLow && p.f <= bandHigh) {
      if (p.db > maxDb) {
        maxDb = p.db
      }
      if (p.db < minDb) {
        minDb = p.db
      }
    }
  }
  const flatPp = maxDb >= minDb ? maxDb - minDb : 0
  return {
    points,
    f0: state.f0,
    g0: CENTRE_DB[state.device],
    peakDb,
    peakF: points[peakIdx].f,
    fLow,
    fHigh,
    bw3: fLow !== null && fHigh !== null ? fHigh - fLow : null,
    bandLow,
    bandHigh,
    flatPp,
    pass: flatPp <= FLAT_LIMIT_DB,
  }
}

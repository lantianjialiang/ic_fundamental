import { gaussian, seededRandom } from '../ana/core/rng'

/**
 * RF-13 校准与误差的教学模型（纯函数，无 DOM）。
 * 测得值 = 真值 × 误差因子；换成 dB 后两者相加：测得 dB = 真值 dB + 误差 dB。
 * 线缆与夹具的响应（dB，负数为损耗）= −k·f + r·sin(2πf / P)：
 *   k·f：平滑损耗，教学近似为随频率线性增加，k 单位 dB/GHz；
 *   r·sin(…)：夹具失配在频率轴上形成的纹波，周期 P，幅度 r dB。
 * 测量噪声与直通标准件的偏差都是固定种子的高斯序列：改设置时形状不变，只是幅度随之缩放。
 */

export type CalMethod = 'none' | 'deembed' | 'dut'

/** 校准方式，显示顺序即数组顺序；默认取 [0]（不校准） */
export const CAL_METHODS: CalMethod[] = ['none', 'deembed', 'dut']

export type CalState = {
  method: CalMethod
  /** 线缆与夹具的平滑损耗系数，dB/GHz */
  lossPerGhz: number
  /** 失配纹波幅度，dB */
  ripple: number
  /** 直通标准件的不确定度（1σ），dB */
  stdUnc: number
}

export const DEFAULT_CAL: CalState = { method: CAL_METHODS[0], lossPerGhz: 0.3, ripple: 0.2, stdUnc: 0.05 }

/** 规格：补偿后的绝对误差不超过 ±SPEC_DB（教学取值） */
export const SPEC_DB = 0.3
/** 纹波周期（GHz）：夹具端反射在频率轴上形成的驻波周期 */
export const RIPPLE_PERIOD_GHZ = 0.7
export const F_START_GHZ = 0.5
export const F_STOP_GHZ = 6
export const F_STEP_GHZ = 0.1
/** 测量噪声的 1σ（dB） */
export const MEAS_SIGMA_DB = 0.02

const SEED_MEAS = 1301
const SEED_STD = 1302

function buildFreqs(): number[] {
  const count = Math.round((F_STOP_GHZ - F_START_GHZ) / F_STEP_GHZ) + 1
  const out: number[] = []
  for (let i = 0; i < count; i += 1) {
    out.push(Number((F_START_GHZ + i * F_STEP_GHZ).toFixed(1)))
  }
  return out
}

function normalSeries(seed: number, count: number): number[] {
  const random = seededRandom(seed)
  const out: number[] = []
  for (let i = 0; i < count; i += 1) {
    out.push(gaussian(random))
  }
  return out
}

/** 扫频点：0.5–6.0 GHz，步长 0.1 GHz */
export const FREQS_GHZ: number[] = buildFreqs()
const Z_MEAS = normalSeries(SEED_MEAS, FREQS_GHZ.length)
const Z_STD = normalSeries(SEED_STD, FREQS_GHZ.length)

/** 平滑损耗（dB，正数表示损耗） */
export function smoothLossDb(fGhz: number, lossPerGhz: number): number {
  return lossPerGhz * fGhz
}

/** 失配纹波（dB） */
export function rippleDb(fGhz: number, ripple: number): number {
  return ripple * Math.sin((2 * Math.PI * fGhz) / RIPPLE_PERIOD_GHZ)
}

/** 线缆 + 夹具的响应（dB，负数表示信号变小）= −平滑损耗 + 纹波 */
export function fixtureDb(fGhz: number, state: CalState): number {
  return -smoothLossDb(fGhz, state.lossPerGhz) + rippleDb(fGhz, state.ripple)
}

export type ErrPoint = {
  f: number
  /** 校准前：测得 dB − 真值 dB */
  before: number
  /** 按当前方式补偿后的误差，dB */
  after: number
}

export type CalResult = {
  points: ErrPoint[]
  /** 最高频率处的平滑损耗，dB（正数） */
  lossAtStop: number
  maxBefore: number
  maxBeforeF: number
  maxAfter: number
  maxAfterF: number
  pass: boolean
}

/**
 * 扫频计算校准前后的误差。
 * - none：不补偿，after = before；
 * - deembed：仪器端口直通校准（仪器本身为理想，不修线缆），再用夹具模型扣掉平滑损耗 −k·f；
 *   模型里没有纹波，纹波留在残差中；
 * - dut：在 DUT 接口做直通校准，误差因子 E = 夹具响应 + 标准件偏差；补偿后 = 测得 − E。
 */
export function calibrate(state: CalState): CalResult {
  const points: ErrPoint[] = []
  for (let i = 0; i < FREQS_GHZ.length; i += 1) {
    const f = FREQS_GHZ[i]
    const before = fixtureDb(f, state) + MEAS_SIGMA_DB * Z_MEAS[i]
    let after = before
    if (state.method === 'deembed') {
      after = before + smoothLossDb(f, state.lossPerGhz)
    }
    if (state.method === 'dut') {
      const factor = fixtureDb(f, state) + state.stdUnc * Z_STD[i]
      after = before - factor
    }
    points.push({ f, before, after })
  }

  let maxBefore = -1
  let maxBeforeF = F_START_GHZ
  let maxAfter = -1
  let maxAfterF = F_START_GHZ
  for (const p of points) {
    if (Math.abs(p.before) > maxBefore) {
      maxBefore = Math.abs(p.before)
      maxBeforeF = p.f
    }
    if (Math.abs(p.after) > maxAfter) {
      maxAfter = Math.abs(p.after)
      maxAfterF = p.f
    }
  }

  return {
    points,
    lossAtStop: smoothLossDb(F_STOP_GHZ, state.lossPerGhz),
    maxBefore,
    maxBeforeF,
    maxAfter,
    maxAfterF,
    pass: maxAfter <= SPEC_DB,
  }
}

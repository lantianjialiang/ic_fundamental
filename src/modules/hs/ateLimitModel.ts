/**
 * ATE 高速测试限制（HS-07）的教学模型。
 *
 * 信号路径（全部是一阶 RC 低通，τ = 1000 / (2π·BW) ps，BW 单位 GHz）：
 *   真实眼   = 器件输出（DEVICE_BW）
 *   测得眼   = 真实眼 → ATE 通道（ateBw）→ 夹具 / DIB（由 −5 GHz 处的损耗 dB 换算出的带宽）
 *
 * 去嵌入（de-embed）：用「已知的夹具模型」做逆补偿。离散一阶低通 y[n] = (1−a)·y[n−1] + a·x[n] 的逆是
 *   x[n] = (y[n] − (1−a)·y[n−1]) / a，
 * 只有模型带宽与真实带宽一致（a 一致）时才能精确还原；模型带宽偏了 modelErr，残留误差就会留在眼图里。
 *
 * 眼图的画法与分析和 HS-05（hs/eyeModel.ts）相同：PRBS7 码型、每个 UI 32 个采样点、中心 0.5 UI 处的眼高、
 * 眼宽 = 眼开口为正的相位占比、六边形 mask 禁区。mask 的数值在这里重新写一份，不从 HS-05 引入。
 *
 * 全部是纯函数，码型来自 hs/core/prbs.ts，没有随机数，没有 Date.now，同样的设置每次结果一样。
 */

import { prbsBits } from './core/prbs'

/** 教学用的数据速率、UI 与奈奎斯特频率（半速率） */
export const RATE_GBPS = 10
export const UI_PS = 1000 / RATE_GBPS
export const NYQUIST_GHZ = RATE_GBPS / 2

/** 被测器件自身的 −3 dB 带宽（固定，不随测试系统改变） */
export const DEVICE_BW_GHZ = 12

/** 差分电平 ±LEVEL_MV；mask 中心半高 MASK_MV，平顶半宽与尖端半宽单位 UI（与 HS-05 同一套示意值） */
export const LEVEL_MV = 400
export const MASK_MV = 200
export const MASK_FLAT_UI = 0.15
export const MASK_HALF_UI = 0.35

/** 每个 UI 的采样点数 */
export const SPU = 32
const PERIOD = 127
const SKIP_BITS = PERIOD
const TOTAL_BITS = 3 * PERIOD
/** 波形中第一个用于分析的采样点（前 SKIP_BITS 个 UI 是滤波器的建立过程） */
export const EYE_START = SKIP_BITS * SPU
/** 叠加图的迹线数：一个码型周期内的每个 UI 起点各画一条，共 PERIOD 条（从 EYE_START 起） */
export const EYE_TRACES = PERIOD

/** 去嵌入的三种做法，显示顺序即数组顺序；默认取 [0]（不去嵌入） */
export const DEEMBED_MODES = ['none', 'fixture', 'fixtureAte'] as const
export type DeembedMode = (typeof DEEMBED_MODES)[number]

export type AteState = {
  /** ATE 通道 −3 dB 带宽，GHz */
  ateBw: number
  /** 夹具 / DIB 在奈奎斯特频率（5 GHz）处的插入损耗，dB */
  fixLossDb: number
  /** 去嵌入方式 */
  deembed: DeembedMode
  /** 去嵌入用的模型带宽相对真实值的偏差，例如 0.2 表示模型比真实值大 20% */
  modelErr: number
}

export const DEFAULT_ATE: AteState = {
  ateBw: 8,
  fixLossDb: 3,
  deembed: DEEMBED_MODES[0],
  modelErr: 0,
}

/** 一阶低通的 −3 dB 带宽（GHz）→ 时间常数（ps） */
export function tauPs(bwGhz: number): number {
  return 1000 / (2 * Math.PI * bwGhz)
}

/** 频率 f（GHz）处，一阶低通的幅度损耗（dB，正数表示衰减） */
export function lossDbAt(bwGhz: number, fGhz: number): number {
  return 10 * Math.log10(1 + (fGhz / bwGhz) ** 2)
}

/** 由奈奎斯特频率处的损耗 dB 反算一阶低通的 −3 dB 带宽：BW = f / √(10^(L/10) − 1) */
export function bwFromLoss(lossDb: number, fGhz: number = NYQUIST_GHZ): number {
  return fGhz / Math.sqrt(10 ** (lossDb / 10) - 1)
}

/** 一阶低通的上升时间（10%–90%）≈ 350 / BW，ps */
export function riseTimePs(bwGhz: number): number {
  return 350 / bwGhz
}

/** 夹具的真实带宽与去嵌入用的模型带宽 */
export function fixtureBw(state: AteState): number {
  return bwFromLoss(state.fixLossDb)
}

/** 去嵌入模型的带宽：真实值 × (1 + modelErr) */
export function modelBw(bw: number, state: AteState): number {
  return bw * (1 + state.modelErr)
}

/** 测得路径（器件 → ATE → 夹具）的合成上升时间：各段上升时间按平方和开方（RSS）合成，ps */
export function chainRisePs(state: AteState): number {
  const tDevice = riseTimePs(DEVICE_BW_GHZ)
  const tAte = riseTimePs(state.ateBw)
  const tFix = riseTimePs(fixtureBw(state))
  return Math.sqrt(tDevice ** 2 + tAte ** 2 + tFix ** 2)
}

/** 一阶低通（前向）：y[n] = y[n−1] + a·(x[n] − y[n−1])，a = 1 − e^(−dt/τ) */
function lowpass(x: Float64Array, bwGhz: number, dtPs: number): Float64Array {
  const a = 1 - Math.exp(-dtPs / tauPs(bwGhz))
  const y = new Float64Array(x.length)
  y[0] = x[0]
  for (let i = 1; i < x.length; i += 1) {
    y[i] = y[i - 1] + a * (x[i] - y[i - 1])
  }
  return y
}

/** 去嵌入：用模型带宽做一阶低通的精确逆，x[n] = (y[n] − (1−a)·y[n−1]) / a */
function deembedLowpass(y: Float64Array, bwModelGhz: number, dtPs: number): Float64Array {
  const a = 1 - Math.exp(-dtPs / tauPs(bwModelGhz))
  const x = new Float64Array(y.length)
  x[0] = y[0]
  for (let i = 1; i < y.length; i += 1) {
    x[i] = (y[i] - (1 - a) * y[i - 1]) / a
  }
  return x
}

/** 理想的 PRBS7 NRZ 波形（±LEVEL_MV），返回波形与每个 UI 的比特值 */
function idealPrbs(): { wave: Float64Array; bits: Uint8Array } {
  const bits = prbsBits(7, TOTAL_BITS, 1)
  const wave = new Float64Array(TOTAL_BITS * SPU)
  for (let i = 0; i < wave.length; i += 1) {
    wave[i] = bits[Math.floor(i / SPU)] ? LEVEL_MV : -LEVEL_MV
  }
  return { wave, bits }
}

export type EyeMetrics = {
  /** 中心（0.5 UI）处的眼高，mV；负数表示闭合 */
  height: number
  /** 眼宽，UI：眼开口为正的相位占比 */
  width: number
  /** 落进 mask 的采样点数 */
  hits: number
  pass: boolean
}

/** 从一段波形分析眼图（跳过前 SKIP_BITS 个 UI 的建立过程） */
export function analyseWave(wave: Float64Array, bits: Uint8Array): EyeMetrics {
  const from = SKIP_BITS * SPU
  const minHigh = new Array<number>(SPU).fill(Infinity)
  const maxLow = new Array<number>(SPU).fill(-Infinity)
  let hits = 0
  for (let i = from; i < wave.length; i += 1) {
    const q = i % SPU
    const v = wave[i]
    if (bits[Math.floor(i / SPU)]) {
      if (v < minHigh[q]) {
        minHigh[q] = v
      }
    } else if (v > maxLow[q]) {
      maxLow[q] = v
    }
    const x = (i % (2 * SPU)) / SPU
    const u = Math.min(Math.abs(x - 0.5), Math.abs(x - 1.5))
    if (inMask(u, v)) {
      hits += 1
    }
  }
  const openings = minHigh.map((high, q) => high - maxLow[q])
  const height = openings[SPU / 2]
  const width = openings.filter((h) => h > 0).length / SPU
  return { height, width, hits, pass: hits === 0 }
}

/** 六边形 mask 内判定：u 为到眼中心的水平距离（UI），v 为电压（mV） */
export function inMask(u: number, v: number): boolean {
  if (u > MASK_HALF_UI) {
    return false
  }
  if (u <= MASK_FLAT_UI) {
    return Math.abs(v) <= MASK_MV
  }
  return Math.abs(v) <= (MASK_MV * (MASK_HALF_UI - u)) / (MASK_HALF_UI - MASK_FLAT_UI)
}

/** 按速率与状态，把理想码型依次过器件、ATE、夹具；去嵌入时再做逆补偿 */
export function measureWave(rateGbps: number, state: AteState): { real: Float64Array; measured: Float64Array; bits: Uint8Array } {
  const { wave, bits } = idealPrbs()
  const dtPs = 1000 / rateGbps / SPU
  const device = lowpass(wave, DEVICE_BW_GHZ, dtPs)
  const fixBw = fixtureBw(state)
  const afterAte = lowpass(device, state.ateBw, dtPs)
  const measuredRaw = lowpass(afterAte, fixBw, dtPs)

  let measured = measuredRaw
  if (state.deembed !== 'none') {
    measured = deembedLowpass(measured, modelBw(fixBw, state), dtPs)
  }
  if (state.deembed === 'fixtureAte') {
    measured = deembedLowpass(measured, modelBw(state.ateBw, state), dtPs)
  }
  return { real: device, measured, bits }
}

/** 在给定速率下同时分析真实眼与测得眼；波形一并返回，供画图用 */
export function analyseAt(rateGbps: number, state: AteState): {
  real: EyeMetrics
  measured: EyeMetrics
  realWave: Float64Array
  wave: Float64Array
  bits: Uint8Array
} {
  const { real, measured, bits } = measureWave(rateGbps, state)
  return {
    real: analyseWave(real, bits),
    measured: analyseWave(measured, bits),
    realWave: real,
    wave: measured,
    bits,
  }
}

/** 候选速率（Gb/s），显示与判定都按这个顺序 */
export const RATE_CANDIDATES: number[] = [4, 6, 8, 10, 12, 16]

/** 在候选速率中，眼图能过 mask 的最高速率；一个都过不了时返回 null */
export function maxPassRate(state: AteState, which: 'real' | 'measured'): number | null {
  let best: number | null = null
  for (const rate of RATE_CANDIDATES) {
    const result = analyseAt(rate, state)
    const eye = which === 'real' ? result.real : result.measured
    if (eye.pass && (best === null || rate > best)) {
      best = rate
    }
  }
  return best
}

/** 频响：一阶低通各段的损耗（dB，正数），f 单位 GHz */
export function responseDb(f: number, state: AteState): { device: number; ate: number; fixture: number; cascade: number } {
  const device = lossDbAt(DEVICE_BW_GHZ, f)
  const ate = lossDbAt(state.ateBw, f)
  const fixture = lossDbAt(fixtureBw(state), f)
  return { device, ate, fixture, cascade: device + ate + fixture }
}

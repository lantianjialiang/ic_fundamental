/**
 * ANA-07「波形采集与 FFT」的仿真模型（教学示意，不对应某个具体型号）。
 * 数据流：发生器输出「基波 + HD2 + HD3」的失真正弦 → 数字化仪采 N 点 → core/fft.ts 的
 * amplitudeSpectrum 得到单边幅度谱 → 在谱线上读出基波、HD2、HD3。
 * 单位：频率 kHz，时间 ms，幅度 V（峰值）。kHz × ms 恰好是周期数，与 samplingModel.ts 的约定一致。
 */

import { amplitudeSpectrum, toDb, windowCoefficients, type WindowKind } from './core/fft'

/** 采样率 fs，kHz（示意） */
export const FS_KHZ = 100
/** 记录点数 N，必须是 2 的幂（fftInPlace 的要求） */
export const N_POINTS = 1024
/** 谱线间隔 Δf = fs / N，kHz */
export const BIN_KHZ = FS_KHZ / N_POINTS
/** 一条记录的时长 N / fs，ms */
export const RECORD_MS = N_POINTS / FS_KHZ

/** 发生器设定的真值（示意）：基波峰值 1 V，HD2 为基波的 1.0%，HD3 为基波的 0.3% */
export const TRUE_FUND_V = 1
export const TRUE_HD2_PCT = 1
export const TRUE_HD3_PCT = 0.3
const HD2_V = TRUE_FUND_V * (TRUE_HD2_PCT / 100)
const HD3_V = TRUE_FUND_V * (TRUE_HD3_PCT / 100)

/** 读数误差限值（%）：三项读数的误差都在它以内才 PASS */
export const READ_LIMIT_PCT = 3
/** 任务卡：基波读数误差的限值（%） */
export const FUND_TASK_PCT = 1
/** 任务卡：相干采样时谐波读数误差的限值（%） */
export const COH_TASK_PCT = 0.5

/** f_in 的可调范围与默认值，kHz；上限 15 kHz 保证 3 次谐波低于 fs/2 = 50 kHz，不会折叠 */
export const F_MIN_KHZ = 1
export const F_MAX_KHZ = 15
export const F_DEFAULT_KHZ = 7.5

export type SampleMode = 'nonCoherent' | 'coherent'
/** 显示顺序就是数组顺序；默认值一律取 [0] */
export const MODE_IDS: SampleMode[] = ['nonCoherent', 'coherent']
export const WINDOW_IDS: WindowKind[] = ['rect', 'hann', 'blackman-harris']

export type FftState = {
  mode: SampleMode
  win: WindowKind
  /** 请求的基波频率 f_in，kHz；相干模式下实际频率会换成最近的 M·fs/N */
  fin: number
}

export const DEFAULT_FFT: FftState = {
  mode: MODE_IDS[0],
  win: WINDOW_IDS[0],
  fin: F_DEFAULT_KHZ,
}

/** 最大公约数（欧几里得算法） */
function gcd(a: number, b: number): number {
  let x = a
  let y = b
  while (y !== 0) {
    const r = x % y
    x = y
    y = r
  }
  return x
}

/**
 * 相干采样：在所有与 M 互质的整数里，找离 f_in·N/fs 最近的那个 M。
 * N 是 2 的幂时，与 N 互质就等于 M 为奇数。
 */
export function coherentBins(fin: number): number {
  const exact = (fin * N_POINTS) / FS_KHZ
  let best = 1
  let bestDist = Number.POSITIVE_INFINITY
  for (let m = 1; m < N_POINTS / 2; m += 1) {
    const dist = Math.abs(m - exact)
    if (dist < bestDist && gcd(m, N_POINTS) === 1) {
      best = m
      bestDist = dist
    }
  }
  return best
}

/** 实际用于采样的基波频率，kHz */
export function actualFin(state: FftState): number {
  if (state.mode === 'coherent') {
    return coherentBins(state.fin) * BIN_KHZ
  }
  return state.fin
}

/** 一段记录：x[n] = A1·sin θ + A2·sin 2θ + A3·sin 3θ，θ = 2π·f0·n/fs */
export function recordSamples(f0: number): Float64Array {
  const x = new Float64Array(N_POINTS)
  for (let n = 0; n < N_POINTS; n += 1) {
    const theta = (2 * Math.PI * f0 * n) / FS_KHZ
    x[n] = TRUE_FUND_V * Math.sin(theta) + HD2_V * Math.sin(2 * theta) + HD3_V * Math.sin(3 * theta)
  }
  return x
}

/** 谱线读数：中心谱线附近 ±2 根里取最大值，与仪器 marker 的读法一致 */
export function peakNear(amp: Float64Array, center: number): { bin: number; value: number } {
  const c = Math.round(center)
  let bin = c
  let value = 0
  for (let k = c - 2; k <= c + 2; k += 1) {
    if (k >= 0 && k < amp.length && amp[k] > value) {
      bin = k
      value = amp[k]
    }
  }
  return { bin, value }
}

/** 读数相对真值的误差，% */
function relErrPct(reading: number, truth: number): number {
  return ((reading - truth) / truth) * 100
}

export type FftResult = {
  /** 实际采样的基波频率，kHz */
  f0: number
  /** 相干采样用的 M（非相干时也算出来，只在相干模式下显示） */
  m: number
  /** 基波中心谱线到最近整数谱线的距离，单位：谱线间隔；0 表示正好在中心 */
  offsetBins: number
  /** 基波、HD2、HD3 的读数所在谱线编号 */
  readBins: [number, number, number]
  fund: number
  hd2: number
  hd3: number
  /** HD2、HD3 相对读数基波的百分比 */
  hd2Pct: number
  hd3Pct: number
  errFund: number
  errHd2: number
  errHd3: number
  pass: boolean
  /** 单边幅度谱，长度 N/2 */
  amp: Float64Array
  /** 时域记录，长度 N */
  wave: Float64Array
  /** 所选窗的系数，长度 N，用来画包络 */
  win: Float64Array
}

export function analyze(state: FftState): FftResult {
  const f0 = actualFin(state)
  const wave = recordSamples(f0)
  const win = windowCoefficients(state.win, N_POINTS)
  const amp = amplitudeSpectrum(wave, state.win)
  const centre = f0 / BIN_KHZ
  const fundPeak = peakNear(amp, centre)
  const hd2Peak = peakNear(amp, 2 * centre)
  const hd3Peak = peakNear(amp, 3 * centre)
  const fund = fundPeak.value
  const hd2 = hd2Peak.value
  const hd3 = hd3Peak.value
  const hd2Pct = fund > 0 ? (hd2 / fund) * 100 : 0
  const hd3Pct = fund > 0 ? (hd3 / fund) * 100 : 0
  const errFund = relErrPct(fund, TRUE_FUND_V)
  const errHd2 = relErrPct(hd2Pct, TRUE_HD2_PCT)
  const errHd3 = relErrPct(hd3Pct, TRUE_HD3_PCT)
  const pass = [errFund, errHd2, errHd3].every((e) => Math.abs(e) <= READ_LIMIT_PCT)
  return {
    f0,
    m: coherentBins(state.fin),
    offsetBins: Math.abs(centre - Math.round(centre)),
    readBins: [fundPeak.bin, hd2Peak.bin, hd3Peak.bin],
    fund,
    hd2,
    hd3,
    hd2Pct,
    hd3Pct,
    errFund,
    errHd2,
    errHd3,
    pass,
    amp,
    wave,
    win,
  }
}

/** 谱线幅度（V 峰值）换成 dBV：1 V 峰值为 0 dBV */
export function spectrumDb(amp: number): number {
  return toDb(amp, TRUE_FUND_V)
}

/** 百分比显示，正负号都写出来，便于看出偏高还是偏低 */
export function fmtPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

/** 矩形窗在 f_in 恰好位于两根谱线正中间时，峰值谱线的相对幅度 = sin(π/2)/(π/2) = 2/π */
export const RECT_MIDWAY_GAIN = 2 / Math.PI
export const RECT_MIDWAY_DB = toDb(RECT_MIDWAY_GAIN, 1)

/**
 * EVM 与 ACPR 的教学模型（RF-12）。
 *
 * 发送：NSYM 个符号（QPSK 或 16QAM）经过根升余弦（RRC，滚降 α = 0.5，截断 ±SPAN 个符号）成形，
 *   每个符号 OS 个采样点。成形后的波形归一化为平均功率 1，再乘以输入幅度 A_in 送入功放。
 * 功放：AM/AM 用 Rapp 模型（p = 2，饱和幅度 SAT = 1）：
 *   输出幅度 = 输入幅度 / (1 + (输入幅度 / SAT)^(2p))^(1/(2p))，只压缩幅度，不做 AM/PM。
 *   输入回退 IBO（dB）：A_in = 10^(−IBO/20)，即平均输入幅度比饱和幅度低 IBO dB。IBO 越小越容易压缩。
 * 接收：用同一个 RRC 做匹配滤波，再在符号时刻采样。RRC 与 RRC 的级联是升余弦，所以线性时没有码间干扰，
 *   符号采样点正好回到原来的符号（按增益换算）。功放的压缩会改变波形在符号之间的包络，经匹配滤波后
 *   就表现为符号误差和码间干扰。
 *
 * EVM：参考值取“线性输出经过同样的接收滤波后的符号”，去掉滤波本身的残余。失真值与参考值之间先用最小二乘
 *   求一个复数增益 c（Σ rec·conj(ref) / Σ|ref|²）做增益和相位对齐，再算 err = rec/c − ref，
 *   EVM(%) = sqrt(Σ|err|² / Σ|ref|²) · 100。对齐是为了去掉固定的增益和相位偏差，只剩“形状误差”。
 *   只统计两端各 2·SPAN 个符号之外的部分，避免波形截断处的不完整符号。
 * ACPR：对发送波形（功放输出）加 Blackman–Harris 窗后做复数 FFT，点数 N = NSYM·OS = 2048（2 的幂）。
 *   主信道 |f| ≤ W/2，相邻信道为 W/2 < |f| ≤ 3W/2，W = 1.5（按符号率归一化）。
 *   ACPR（dBc）= 10·log10(P_相邻 / P_主)，取两侧中较大的一个。数值为负，越负泄漏越少。
 */

import { fftInPlace, windowCoefficients } from '../ana/core/fft'
import { type Complex, ratioToDb } from './core/units'
import { constellation, NSYM, SCHEMES, type Scheme, symbolIndices } from './modulationModel'

/** 每个符号的采样点数，fs = OS × 符号率 */
export const OS = 8
/** RRC 脉冲截断半宽（符号数） */
const SPAN = 6
const ALPHA = 0.5
const RAPP_P = 2
const SAT = 1
/** 统计 EVM 时两端去掉的符号数：接收滤波要看到 ±2·SPAN 个符号 */
const EDGE = 2 * SPAN
/** 主信道带宽 W（按符号率归一化） */
export const CHANNEL_BW = 1.5
const SEED_TX = 0x2468
const TOTAL = NSYM * OS

/** 根升余弦脉冲，t 以符号周期为单位，滚降 alpha */
export function rrcPulse(t: number, alpha: number): number {
  const x = Math.abs(t)
  if (x < 1e-9) {
    return 1 - alpha + (4 * alpha) / Math.PI
  }
  const special = 1 / (4 * alpha)
  if (Math.abs(x - special) < 1e-9) {
    const u = Math.PI / (4 * alpha)
    return (alpha / Math.SQRT2) * ((1 + 2 / Math.PI) * Math.sin(u) + (1 - 2 / Math.PI) * Math.cos(u))
  }
  const num = Math.sin(Math.PI * x * (1 - alpha)) + 4 * alpha * x * Math.cos(Math.PI * x * (1 + alpha))
  const den = Math.PI * x * (1 - (4 * alpha * x) ** 2)
  return num / den
}

/** Rapp AM/AM：输入幅度 → 输出幅度（sat 为饱和幅度，p 为平滑因子） */
export function rappAm(a: number, sat = SAT, p = RAPP_P): number {
  return a / (1 + (a / sat) ** (2 * p)) ** (1 / (2 * p))
}

export type EvmState = {
  scheme: Scheme
  /** 输入回退 IBO，dB；0 表示平均输入幅度等于饱和幅度 */
  ibo: number
}

export const DEFAULT_EVM: EvmState = { scheme: SCHEMES[0], ibo: 6 }

/** 教学示意门限（不是任何标准的规定）：EVM ≤ 5 %、ACPR ≤ −35 dBc 视为合格 */
export const EVM_OK_PCT = 5
export const ACPR_OK_DB = -35

export type EvmAnalysis = {
  /** 平均输入幅度 A_in（饱和幅度为 1） */
  rmsIn: number
  /** 峰值输入幅度 */
  peakIn: number
  /** 峰均比，dB */
  papr: number
  /** 符号采样点上的 EVM，% */
  evmPct: number
  /** 失真输出的 ACPR，dBc（两侧取较大者） */
  acprDb: number
  /** 线性（理想）输出的 ACPR，dBc，作为对照 */
  acprIdealDb: number
  /** 理想星座点（归一化） */
  refPts: Complex[]
  /** 对齐后的接收符号（与理想星座同一单位） */
  rxPts: Complex[]
  /** 频谱横轴（符号率归一化），与 specIdeal、specDist 对应 */
  specFreq: Float64Array
  /** 线性输出的功率谱，dB（相对线性输出的峰值） */
  specIdeal: Float64Array
  /** 失真输出的功率谱，dB（同一参考） */
  specDist: Float64Array
}

type Cx = Complex

function cdiv(a: Cx, b: Cx): Cx {
  const d = b.re * b.re + b.im * b.im
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }
}

/** 最小二乘复增益：c = Σ a·conj(b) / Σ|b|²，使 a ≈ c·b */
function lsGain(a: Cx[], b: Cx[]): Cx {
  let re = 0
  let im = 0
  let den = 0
  for (let k = 0; k < a.length; k += 1) {
    re += a[k].re * b[k].re + a[k].im * b[k].im
    im += a[k].im * b[k].re - a[k].re * b[k].im
    den += b[k].re * b[k].re + b[k].im * b[k].im
  }
  return { re: re / den, im: im / den }
}

/** 成形后的复基带波形（RRC），归一化为平均功率 1；g 为归一化系数，理想符号在采样点上的值为 g·s_k */
function shapedWaveform(points: Complex[], idx: number[]): { re: Float64Array; im: Float64Array; g: number } {
  const re = new Float64Array(TOTAL)
  const im = new Float64Array(TOTAL)
  for (let n = 0; n < TOTAL; n += 1) {
    const t = n / OS
    const kLo = Math.max(0, Math.ceil(t - SPAN))
    const kHi = Math.min(NSYM - 1, Math.floor(t + SPAN))
    let sr = 0
    let si = 0
    for (let k = kLo; k <= kHi; k += 1) {
      const p = rrcPulse(t - k, ALPHA)
      sr += points[idx[k]].re * p
      si += points[idx[k]].im * p
    }
    re[n] = sr
    im[n] = si
  }
  let power = 0
  for (let n = 0; n < TOTAL; n += 1) {
    power += re[n] * re[n] + im[n] * im[n]
  }
  const g = 1 / Math.sqrt(power / TOTAL)
  for (let n = 0; n < TOTAL; n += 1) {
    re[n] *= g
    im[n] *= g
  }
  return { re, im, g }
}

/** 接收端：RRC 匹配滤波后在每个符号时刻取样（卷积和，两端越界按 0 处理） */
function matchedSamples(re: Float64Array, im: Float64Array): { re: Float64Array; im: Float64Array } {
  const span = SPAN * OS
  const taps = new Float64Array(2 * span + 1)
  for (let j = -span; j <= span; j += 1) {
    taps[j + span] = rrcPulse(j / OS, ALPHA)
  }
  const outRe = new Float64Array(NSYM)
  const outIm = new Float64Array(NSYM)
  for (let m = 0; m < NSYM; m += 1) {
    const centre = m * OS
    let sr = 0
    let si = 0
    for (let j = -span; j <= span; j += 1) {
      const n = centre + j
      if (n >= 0 && n < TOTAL) {
        sr += re[n] * taps[j + span]
        si += im[n] * taps[j + span]
      }
    }
    outRe[m] = sr
    outIm[m] = si
  }
  return { re: outRe, im: outIm }
}

/** 复数 FFT 后的双边功率谱，频率已按 fftshift 排列：第 j 个点对应 freq[j] */
function powerSpectrum(re: Float64Array, im: Float64Array): { freq: Float64Array; power: Float64Array } {
  const n = re.length
  const w = windowCoefficients('blackman-harris', n)
  const fr = new Float64Array(n)
  const fi = new Float64Array(n)
  for (let k = 0; k < n; k += 1) {
    fr[k] = re[k] * w[k]
    fi[k] = im[k] * w[k]
  }
  fftInPlace(fr, fi)
  const freq = new Float64Array(n)
  const power = new Float64Array(n)
  for (let j = 0; j < n; j += 1) {
    const k = (j + n / 2) % n
    freq[j] = (k < n / 2 ? k : k - n) * (OS / n)
    power[j] = fr[k] * fr[k] + fi[k] * fi[k]
  }
  return { freq, power }
}

/** 主信道与两侧相邻信道的功率比，返回 ACPR（dBc，两侧取较大者） */
function acprOf(freq: Float64Array, power: Float64Array): number {
  let main = 0
  let lower = 0
  let upper = 0
  const half = CHANNEL_BW / 2
  const outer = (3 * CHANNEL_BW) / 2
  for (let j = 0; j < freq.length; j += 1) {
    const f = freq[j]
    if (Math.abs(f) <= half) {
      main += power[j]
    } else if (f < -half && f >= -outer) {
      lower += power[j]
    } else if (f > half && f <= outer) {
      upper += power[j]
    }
  }
  return ratioToDb(Math.max(lower, upper) / main)
}

export function analyseEvm(state: EvmState): EvmAnalysis {
  const points = constellation(state.scheme)
  const idx = symbolIndices(state.scheme, NSYM, SEED_TX)
  const tx = shapedWaveform(points, idx)
  const aIn = 10 ** (-state.ibo / 20)

  let peakSq = 0
  const linRe = new Float64Array(TOTAL)
  const linIm = new Float64Array(TOTAL)
  const outRe = new Float64Array(TOTAL)
  const outIm = new Float64Array(TOTAL)
  for (let n = 0; n < TOTAL; n += 1) {
    const lr = aIn * tx.re[n]
    const li = aIn * tx.im[n]
    const amp = Math.hypot(lr, li)
    const gain = amp > 0 ? rappAm(amp) / amp : 1
    linRe[n] = lr
    linIm[n] = li
    outRe[n] = lr * gain
    outIm[n] = li * gain
    const sq = tx.re[n] * tx.re[n] + tx.im[n] * tx.im[n]
    if (sq > peakSq) {
      peakSq = sq
    }
  }

  // 接收：匹配滤波后取符号时刻样本；参考是线性输出经过同样的接收滤波
  const lin = matchedSamples(linRe, linIm)
  const dist = matchedSamples(outRe, outIm)
  const refs: Cx[] = []
  const recs: Cx[] = []
  const symbols: Cx[] = []
  for (let m = EDGE; m < NSYM - EDGE; m += 1) {
    refs.push({ re: lin.re[m], im: lin.im[m] })
    recs.push({ re: dist.re[m], im: dist.im[m] })
    symbols.push(points[idx[m]])
  }
  // 线性接收值相对发送符号的增益，用来把接收符号换算回星座的单位
  const cLin = lsGain(refs, symbols)
  const cDist = lsGain(recs, refs)

  let errPow = 0
  let refPow = 0
  const rxPts: Cx[] = []
  for (let k = 0; k < refs.length; k += 1) {
    const aligned = cdiv(recs[k], cDist)
    const err = { re: aligned.re - refs[k].re, im: aligned.im - refs[k].im }
    errPow += err.re * err.re + err.im * err.im
    refPow += refs[k].re * refs[k].re + refs[k].im * refs[k].im
    rxPts.push(cdiv(aligned, cLin))
  }
  const evmPct = Math.sqrt(errPow / refPow) * 100

  const idealSpec = powerSpectrum(linRe, linIm)
  const distSpec = powerSpectrum(outRe, outIm)
  let peakIdeal = 0
  for (let j = 0; j < TOTAL; j += 1) {
    if (idealSpec.power[j] > peakIdeal) {
      peakIdeal = idealSpec.power[j]
    }
  }
  const specIdeal = new Float64Array(TOTAL)
  const specDist = new Float64Array(TOTAL)
  for (let j = 0; j < TOTAL; j += 1) {
    specIdeal[j] = ratioToDb(Math.max(idealSpec.power[j], 1e-30) / peakIdeal)
    specDist[j] = ratioToDb(Math.max(distSpec.power[j], 1e-30) / peakIdeal)
  }

  return {
    rmsIn: aIn,
    peakIn: aIn * Math.sqrt(peakSq),
    papr: ratioToDb(peakSq),
    evmPct,
    acprDb: acprOf(distSpec.freq, distSpec.power),
    acprIdealDb: acprOf(idealSpec.freq, idealSpec.power),
    refPts: points,
    rxPts,
    specFreq: distSpec.freq,
    specIdeal,
    specDist,
  }
}

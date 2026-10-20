/**
 * 「ATE 模拟资源与负载板」的模型（教学示意，资源参数均为虚构的示意值）。
 *
 * 一个 DUT 引脚由一个资源驱动或测量，经负载板上的 Relay 接到引脚。
 * - 建立误差：Relay 闭合后，误差按 E0 · e^(−t/τ) 收敛，t 为等待（建立）时间；
 * - 读数噪声：σ = √(σ_资源² + σ_接地²)，接地屏蔽只压低 σ_接地 这一项；
 * - 读数 σ 用 200 个带种子的高斯样本算出（seededRandom + gaussian），同一种子结果可复现。
 */

import { gaussian, seededRandom } from './core/rng'
import { stdev } from './core/stats'

export type PinId = 'vdd' | 'vref' | 'ain'
/** off 表示没有接资源；其余是可以接到引脚上的资源 */
export type ResId = 'off' | 'dps' | 'smu' | 'awg' | 'digitizer' | 'dmm'
export type Source = Exclude<ResId, 'off'>

/** 引脚顺序就是显示顺序；第一个引脚（VDD）是侧栏初始说明对应的那一项 */
export const PINS: PinId[] = ['vdd', 'vref', 'ain']
/** 资源下拉的显示顺序；[0] 是 off，也是默认值 */
export const RESOURCES: ResId[] = ['off', 'dps', 'smu', 'awg', 'digitizer', 'dmm']

export type Assign = Record<PinId, ResId>
export const DEFAULT_ASSIGN: Assign = { vdd: RESOURCES[0], vref: RESOURCES[0], ain: RESOURCES[0] }

/** 每种资源的示意参数：τ（µs）、接入时的初始误差 E0（mV）、资源自身噪声 σ（mV） */
export const RES_SPEC: Record<Source, { tauUs: number; e0Mv: number; sigmaMv: number }> = {
  dps: { tauUs: 20, e0Mv: 40, sigmaMv: 0.3 },
  smu: { tauUs: 8, e0Mv: 15, sigmaMv: 0.2 },
  awg: { tauUs: 12, e0Mv: 20, sigmaMv: 0.5 },
  digitizer: { tauUs: 6, e0Mv: 10, sigmaMv: 1.0 },
  dmm: { tauUs: 60, e0Mv: 6, sigmaMv: 0.2 },
}

/** 各引脚能胜任的资源：VDD 要能加压（DPS、SMU）；VREF 要能测电压（DMM、Digitizer、SMU）；AIN 要能给激励（AWG、SMU） */
const COMPAT: Record<PinId, Source[]> = {
  vdd: ['dps', 'smu'],
  vref: ['dmm', 'digitizer', 'smu'],
  ain: ['awg', 'smu'],
}

/** 接地噪声的示意值（mV）：没有屏蔽 / 有接地屏蔽 */
export const GND_OPEN_MV = 1.2
export const GND_SHIELD_MV = 0.25
/** 建立误差限值（mV）与读数 σ 限值（mV） */
export const ERR_LIMIT_MV = 1
export const SIGMA_LIMIT_MV = 0.5
/** 建立时间滑杆的范围（µs）与「接近最短」的余量（µs） */
export const SETTLE_MAX_US = 200
export const SETTLE_DEFAULT_US = 10
export const SETTLE_SLACK_US = 5
/** 读数样本数与默认种子 */
export const N_SAMPLES = 200
export const DEFAULT_SEED = 7

export function compatible(pin: PinId, res: ResId): boolean {
  return res !== 'off' && COMPAT[pin].includes(res)
}

/** 建立误差（mV）：E0 · e^(−t/τ)。t 为建立时间（µs），越长越接近 0 */
export function settleErrMv(src: Source, settleUs: number): number {
  const spec = RES_SPEC[src]
  return spec.e0Mv * Math.exp(-settleUs / spec.tauUs)
}

/** 误差刚好降到限值以内所需的建立时间：τ · ln(E0 / 限值)；E0 本来就在限值内则为 0 */
export function requiredSettleUs(src: Source, limitMv: number = ERR_LIMIT_MV): number {
  const spec = RES_SPEC[src]
  if (spec.e0Mv <= limitMv) {
    return 0
  }
  return spec.tauUs * Math.log(spec.e0Mv / limitMv)
}

/** 读数噪声 σ（mV）：资源噪声与接地噪声的和方根 */
export function sigmaMv(src: Source, shield: boolean): number {
  const gnd = shield ? GND_SHIELD_MV : GND_OPEN_MV
  return Math.sqrt(RES_SPEC[src].sigmaMv ** 2 + gnd ** 2)
}

/** n 个标准正态样本，同一种子结果相同 */
export function gaussianSamples(seed: number, n: number = N_SAMPLES): number[] {
  const random = seededRandom(seed)
  const out: number[] = []
  for (let i = 0; i < n; i += 1) {
    out.push(gaussian(random))
  }
  return out
}

/** 去掉建立误差后的读数噪声样本（mV，均值为 0） */
export function noiseSamples(src: Source, shield: boolean, seed: number): number[] {
  const sigma = sigmaMv(src, shield)
  return gaussianSamples(seed).map((g) => g * sigma)
}

/** 读数相对目标值的偏差（mV）：建立误差 + 噪声，用来画分布 */
export function readingDev(src: Source, settleUs: number, shield: boolean, seed: number): number[] {
  const err = settleErrMv(src, settleUs)
  return noiseSamples(src, shield, seed).map((x) => x + err)
}

/** 样本标准差（mV）：页面上显示的 σ，由 200 个样本算出 */
export function sampleSigmaMv(src: Source, shield: boolean, seed: number): number {
  return stdev(noiseSamples(src, shield, seed))
}

/** VREF 读数的 σ；VREF 没接可测量的资源时返回 null */
export function vrefSigmaMv(res: ResId, shield: boolean, seed: number): number | null {
  if (res === 'off' || !compatible('vref', res)) {
    return null
  }
  return sampleSigmaMv(res, shield, seed)
}

export type PinStatus = 'off' | 'incompatible' | 'error' | 'ok'

export type PinResult = {
  pin: PinId
  res: ResId
  status: PinStatus
  /** 当前建立时间下的建立误差（mV）；off 时无意义 */
  errMv: number
  /** 这颗资源把误差降到限值以内所需的最短建立时间（µs） */
  reqUs: number
}

export function pinResult(pin: PinId, res: ResId, settleUs: number): PinResult {
  if (res === 'off') {
    return { pin, res, status: 'off', errMv: 0, reqUs: 0 }
  }
  const errMv = settleErrMv(res, settleUs)
  const reqUs = requiredSettleUs(res)
  if (!compatible(pin, res)) {
    return { pin, res, status: 'incompatible', errMv, reqUs }
  }
  return { pin, res, status: errMv <= ERR_LIMIT_MV ? 'ok' : 'error', errMv, reqUs }
}

export function evaluate(assign: Assign, settleUs: number): Record<PinId, PinResult> {
  return {
    vdd: pinResult('vdd', assign.vdd, settleUs),
    vref: pinResult('vref', assign.vref, settleUs),
    ain: pinResult('ain', assign.ain, settleUs),
  }
}

/** 已接入（不是 off）的引脚结果 */
export function connectedOf(results: Record<PinId, PinResult>): PinResult[] {
  return PINS.map((pin) => results[pin]).filter((result) => result.status !== 'off')
}

/** 所有已接入引脚各自需要的建立时间里最大的一个（没有接入时为 0） */
export function minSettleUs(results: Record<PinId, PinResult>): number {
  return connectedOf(results).reduce((acc, result) => Math.max(acc, result.reqUs), 0)
}

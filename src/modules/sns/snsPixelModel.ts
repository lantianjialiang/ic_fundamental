/**
 * SNS-03 4T 像素到 DN。转换增益、kTC、K 与量化噪声调用 core，不重写公式。
 */
import { conversionGainV, kTcNoiseE, Q_ELECTRON } from './core/optics'
import { kElectronsPerDn, quantNoiseE } from './core/sensor'

/** 量化是否主导时，拿来比较的固定读出噪声（e-） */
export const READ_E = 5
export const TEMP_K = 300
/** 任务：行时间 × 行数 = 10 ms */
export const SKEW_TARGET_US = 10_000

export const CDS_IDS = ['off', 'on'] as const
export type CdsId = (typeof CDS_IDS)[number]

export const QUANT_IDS = ['yes', 'no'] as const
export type QuantId = (typeof QUANT_IDS)[number]

export type PixelState = {
  cFdFf: number
  sf: number
  col: number
  bits: number
  vref: number
  cds: CdsId
  photoE: number
  rowTimeUs: number
  rows: number
  quantCall: QuantId
}

export const DEFAULT_PIXEL: PixelState = {
  cFdFf: 2,
  sf: 0.9,
  col: 1,
  bits: 12,
  vref: 1,
  cds: CDS_IDS[0],
  photoE: 1000,
  rowTimeUs: 4,
  rows: 240,
  quantCall: QUANT_IDS[0],
}

export type PixelAnalysis = {
  cgUv: number
  totalUv: number
  ktc: number
  k: number
  quant: number
  residual: number
  dn: number
  full: number
  shot: number
  skewUs: number
  quantDominates: boolean
  quantAnswer: QuantId
  chargeC: number
}

export function analysePixel(state: PixelState): PixelAnalysis {
  const cF = state.cFdFf * 1e-15
  const cgV = conversionGainV(cF)
  const totalV = cgV * state.sf * state.col
  const k = kElectronsPerDn(state.vref, state.bits, totalV)
  const quant = quantNoiseE(k)
  const ktc = kTcNoiseE(cF, TEMP_K)
  const ktcIn = state.cds === 'on' ? 0 : ktc
  const residual = Math.sqrt(ktcIn * ktcIn + quant * quant)
  const full = 2 ** state.bits - 1
  const dn = k > 0 ? Math.min(full, Math.max(0, state.photoE / k)) : 0
  const quantDominates = quant >= READ_E
  return {
    cgUv: cgV * 1e6,
    totalUv: totalV * 1e6,
    ktc,
    k,
    quant,
    residual,
    dn,
    full,
    shot: Math.sqrt(Math.max(state.photoE, 0)),
    skewUs: state.rowTimeUs * state.rows,
    quantDominates,
    quantAnswer: quantDominates ? 'yes' : 'no',
    chargeC: Q_ELECTRON,
  }
}

export function pixelFlags(state: PixelState, a: PixelAnalysis) {
  const kRef = kElectronsPerDn(1, 10, 100e-6)
  const qRef = quantNoiseE(kRef)
  const gainOk = Math.abs(a.totalUv - 100) / 100 < 0.02
  const t3nums =
    state.bits === 10 &&
    Math.abs(state.vref - 1) < 1e-9 &&
    gainOk &&
    Math.abs(a.k - kRef) / kRef < 0.025 &&
    Math.abs(a.quant - qRef) / qRef < 0.03
  return {
    t1: Math.abs(state.cFdFf - 1) < 1e-9 && Math.abs(a.cgUv - 160.2) / 160.2 < 0.01,
    t2: state.cds === 'on' && Math.abs(a.residual - a.quant) < 1e-9,
    t3: t3nums && state.quantCall === a.quantAnswer,
    t4: Math.abs(a.skewUs - SKEW_TARGET_US) < 0.5,
  }
}

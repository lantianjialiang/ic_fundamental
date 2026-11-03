/**
 * SNS-05 暗场。64×64，照度为 0，帧由 genFrame 生成。
 * 翻倍温度间隔是教学示意，不是某一款真实传感器的常数。
 */
import { VDUT_CIS1 } from '../../data/virtual-duts/vdut-sns'
import { average, frameMean, frameVar } from './core/frames'
import { darkElectronsPerS } from './core/optics'
import { defectMask, genFrame, type CisParams } from './core/sensor'

export const DARK_W = 64
export const DARK_H = 64
/** 对照曝光，任务卡把它和 1 s 放在一起看 */
export const COMPARE_S = 0.1
export const FOCUS_IDS = ['dsnu', 'temp', 'hot'] as const
export type FocusId = (typeof FOCUS_IDS)[number]

export type DarkState = {
  darkE25: number
  doubleC: number
  tempC: number
  exposureS: number
  readNoiseE: number
  nAvg: number
  hotTh: number
  focus: FocusId
}

export const DEFAULT_DARK: DarkState = {
  darkE25: VDUT_CIS1.darkE25PerS,
  doubleC: VDUT_CIS1.darkDoubleC,
  tempC: 25,
  exposureS: COMPARE_S,
  readNoiseE: VDUT_CIS1.readNoiseE,
  nAvg: 4,
  hotTh: 1800,
  focus: FOCUS_IDS[0],
}

export type HistBin = { x0: number; x1: number; count: number; hot: boolean }

export type DarkAnalysis = {
  frame: Float32Array
  hist: HistBin[]
  hotIdx: number[]
  meanDn: number
  /** 去掉热像素后的单帧空间标准差 */
  singleNorm: number
  /** 去掉热像素后、N 帧平均的空间标准差，当作 DSNU */
  dsnuNorm: number
  /** 含热像素的整帧空间标准差（平均后） */
  fullStd: number
  factor: number
  rate: number
  ratio: number
  eNow: number
  eRef: number
  injected: number
  caught: number
  falseRate: number
  recall: number
}

export function darkParams(s: DarkState): CisParams {
  return {
    w: DARK_W,
    h: DARK_H,
    kEperDn: VDUT_CIS1.kEperDn,
    readNoiseE: s.readNoiseE,
    fwcE: VDUT_CIS1.fwcE,
    darkE25PerS: s.darkE25,
    darkDoubleC: s.doubleC,
    prnu: 0,
    shadingPct: 0,
    defects: VDUT_CIS1.defects,
    blackLevelDn: VDUT_CIS1.blackLevelDn,
    adcBits: VDUT_CIS1.adcBits,
  }
}

function maskedStd(frame: Float32Array, hot: Uint8Array): number {
  let n = 0
  let sum = 0
  for (let i = 0; i < frame.length; i += 1) {
    if (hot[i] === 2) continue
    sum += frame[i]
    n += 1
  }
  if (n < 2) return 0
  const mean = sum / n
  let acc = 0
  for (let i = 0; i < frame.length; i += 1) {
    if (hot[i] === 2) continue
    const d = frame[i] - mean
    acc += d * d
  }
  return Math.sqrt(acc / (n - 1))
}

function histogram(frame: Float32Array, threshold: number): HistBin[] {
  const bins = 24
  let hi = Math.max(threshold, 1)
  for (let i = 0; i < frame.length; i += 1) if (frame[i] > hi) hi = frame[i]
  const span = hi
  const out: HistBin[] = []
  for (let k = 0; k < bins; k += 1) {
    const x0 = (span * k) / bins
    const x1 = (span * (k + 1)) / bins
    out.push({ x0, x1, count: 0, hot: (x0 + x1) / 2 >= threshold })
  }
  for (let i = 0; i < frame.length; i += 1) {
    const t = Math.min(bins - 1, Math.floor((frame[i] / span) * bins))
    out[t].count += 1
  }
  return out
}

/** 同一组参数得到同一组暗帧（种子固定，不用 Math.random） */
export function analyseDark(s: DarkState): DarkAnalysis {
  const p = darkParams(s)
  const frames: Float32Array[] = []
  for (let i = 0; i < s.nAvg; i += 1) {
    frames.push(genFrame(p, { exposureS: s.exposureS, illumE: 0, tempC: s.tempC, seed: 7000 + i }))
  }
  const avg = average(frames)
  const mask = defectMask(p, 1)
  const rate = darkElectronsPerS(s.darkE25, s.tempC, s.doubleC)
  const rate25 = darkElectronsPerS(s.darkE25, 25, s.doubleC)
  let injected = 0
  let caught = 0
  let normal = 0
  let falseHot = 0
  const hotIdx: number[] = []
  for (let i = 0; i < avg.length; i += 1) {
    const isHot = mask[i] === 2
    const over = avg[i] > s.hotTh
    if (isHot) {
      injected += 1
      if (over) caught += 1
    } else {
      normal += 1
      if (over) falseHot += 1
    }
    if (over) hotIdx.push(i)
  }
  return {
    frame: avg,
    hist: histogram(avg, s.hotTh),
    hotIdx,
    meanDn: frameMean(avg, DARK_W),
    singleNorm: maskedStd(frames[0], mask),
    dsnuNorm: maskedStd(avg, mask),
    fullStd: Math.sqrt(frameVar(avg, DARK_W)),
    factor: 1 / Math.sqrt(s.nAvg),
    rate,
    ratio: rate25 === 0 ? 0 : rate / rate25,
    eNow: rate * s.exposureS,
    eRef: rate * COMPARE_S,
    injected,
    caught,
    falseRate: normal === 0 ? 0 : falseHot / normal,
    recall: injected === 0 ? 0 : caught / injected,
  }
}

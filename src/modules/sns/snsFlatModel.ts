/**
 * SNS-06 亮场。64×64：共享的缺陷图例在这个尺寸下不会被裁掉。
 * 调用 prnu / prnuMeasured / classifyDefects / linearity / genFrame，不另写一套像素模型。
 */
import { VDUT_CIS1 } from '../../data/virtual-duts/vdut-sns'
import { average, diffVar, frameMean } from './core/frames'
import {
  classifyDefects,
  defectMask,
  genFrame,
  linearity,
  linReg,
  prnu,
  prnuMeasured,
  type CisParams,
  type DefectKind,
} from './core/sensor'

/** 64 而不是 96：DefectMapView 的图例按 90px 排布，更密的格子会把第三项裁出画布 */
export const FLAT_W = 64
export const FLAT_H = 64
const ILLUM_E = 8e5
const EXP_S = 0.02
export const LIN_EXPOSURES = [0.008, 0.012, 0.016, 0.02, 0.024, 0.028]
const CLEAN_DEFECTS = { dead: 0, hot: 0, low: 0, clusterProb: 0 }

export const FLAT_FOCUS = ['prnu', 'shading', 'defect', 'linear'] as const
export type FlatFocus = (typeof FLAT_FOCUS)[number]

export type FlatState = {
  prnuPct: number
  shadingPct: number
  nAvg: number
  darkCorrect: boolean
  removeShading: boolean
  thDead: number
  thHot: number
  thLow: number
  nonlin: number
  focus: FlatFocus
}

export const DEFAULT_FLAT: FlatState = {
  prnuPct: VDUT_CIS1.prnu * 100,
  shadingPct: VDUT_CIS1.shadingPct * 100,
  nAvg: 2,
  darkCorrect: false,
  removeShading: false,
  thDead: 0.02,
  thHot: 2200,
  thLow: 0.1,
  nonlin: 0,
  focus: FLAT_FOCUS[0],
}

export type FlatAnalysis = {
  frame: Float32Array
  kind: DefectKind[]
  counts: { dead: number; hot: number; low: number }
  clusters: number
  mask: { dead: number; hot: number; low: number }
  prnuOn: number
  prnuOff: number
  prnuShown: number
  sigmaOverMu: number
  prnuFormula: number
  /** (σt/μ)²/N 与真 PRNU² 的比。小于 0.1 表示时间项不到真值的 10% */
  temporalShare: number
  means: number[]
  exposures: number[]
  maxDevPct: number
  atIndex: number
  slope: number
  intercept: number
}

export function flatParams(s: FlatState, defects: CisParams['defects']): CisParams {
  return {
    w: FLAT_W,
    h: FLAT_H,
    kEperDn: VDUT_CIS1.kEperDn,
    readNoiseE: VDUT_CIS1.readNoiseE,
    fwcE: VDUT_CIS1.fwcE,
    darkE25PerS: VDUT_CIS1.darkE25PerS,
    darkDoubleC: VDUT_CIS1.darkDoubleC,
    prnu: s.prnuPct / 100,
    shadingPct: s.shadingPct / 100,
    defects,
    blackLevelDn: VDUT_CIS1.blackLevelDn,
    adcBits: VDUT_CIS1.adcBits,
    nonlin: s.nonlin,
  }
}

function maskCounts(mask: Uint8Array): { dead: number; hot: number; low: number } {
  const counts = { dead: 0, hot: 0, low: 0 }
  for (let i = 0; i < mask.length; i += 1) {
    if (mask[i] === 1) counts.dead += 1
    else if (mask[i] === 2) counts.hot += 1
    else if (mask[i] === 3) counts.low += 1
  }
  return counts
}

function grab(p: CisParams, n: number, illumE: number, seed0: number): Float32Array[] {
  const frames: Float32Array[] = []
  for (let i = 0; i < n; i += 1) {
    frames.push(genFrame(p, { exposureS: EXP_S, illumE, tempC: 25, seed: seed0 + i }))
  }
  return frames
}

export function analyseFlat(s: FlatState): FlatAnalysis {
  const clean = flatParams(s, CLEAN_DEFECTS)
  const dirty = flatParams(s, VDUT_CIS1.defects)
  const nGen = Math.max(s.nAvg, 2)
  const bright = grab(clean, nGen, ILLUM_E, 1100)
  const used = bright.slice(0, s.nAvg)
  const dark = grab(clean, s.nAvg, 0, 3100)
  const darkArg = s.darkCorrect ? dark : []
  const prnuOn = prnu(used, darkArg, FLAT_W, true)
  const prnuOff = prnu(used, darkArg, FLAT_W, false)
  const avgClean = average(used)
  const avgCleanDark = average(dark)
  const mu = frameMean(avgClean, FLAT_W) - frameMean(avgCleanDark, FLAT_W)
  const sigma = Math.sqrt(diffVar(bright[0], bright[1], FLAT_W))
  const sigmaOverMu = mu > 1 ? sigma / mu : 0
  const prnuTrue = s.prnuPct / 100
  const temporalShare = prnuTrue > 0 ? (sigmaOverMu * sigmaOverMu) / Math.max(s.nAvg, 1) / (prnuTrue * prnuTrue) : Number.POSITIVE_INFINITY
  const dirtyBright = average(grab(dirty, s.nAvg, ILLUM_E, 2100))
  const dirtyDark = average(grab(dirty, s.nAvg, 0, 4100))
  const classified = classifyDefects(dirtyBright, dirtyDark, FLAT_W, {
    dead: s.thDead,
    hot: s.thHot,
    low: s.thLow,
  })
  const means = LIN_EXPOSURES.map((exposureS, index) =>
    frameMean(genFrame(clean, { exposureS, illumE: ILLUM_E, tempC: 25, seed: 5100 + index }), FLAT_W),
  )
  const lin = linearity(means, LIN_EXPOSURES, [0.1, 0.9])
  const peak = Math.max(...means, 0)
  const fitPts = LIN_EXPOSURES.map((exposure, index) => ({ exposure, mean: means[index] })).filter(
    (point) => point.mean >= 0.1 * peak && point.mean <= 0.9 * peak,
  )
  const fit = linReg(
    fitPts.map((point) => point.exposure),
    fitPts.map((point) => point.mean),
  )
  return {
    frame: dirtyBright,
    kind: classified.kind,
    counts: classified.counts,
    clusters: classified.clusters,
    mask: maskCounts(defectMask(dirty, 1)),
    prnuOn,
    prnuOff,
    prnuShown: s.removeShading ? prnuOn : prnuOff,
    sigmaOverMu,
    prnuFormula: prnuMeasured(prnuTrue, sigmaOverMu, s.nAvg),
    temporalShare,
    means,
    exposures: LIN_EXPOSURES,
    maxDevPct: lin.maxDevPct,
    atIndex: lin.atIndex,
    slope: fit.slope,
    intercept: fit.intercept,
  }
}

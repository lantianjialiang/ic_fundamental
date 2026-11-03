/**
 * SNS-04 PTC。差帧走 core 的 ptc()；单帧方差走 frameVar，让 PRNU 留在方差里。
 * 帧不超过 128×128，曝光点不超过 12。
 */
import { frameMean, frameVar, varRelError, type Rect } from './core/frames'
import { genFrame, linReg, ptc, type CisParams, type PtcPoint, type PtcResult } from './core/sensor'

export const FRAME = 128
export const EXPOSURE_S = 0.01
export const MAX_POINTS = 12

export const MODE_IDS = ['diff', 'single'] as const
export type ModeId = (typeof MODE_IDS)[number]

export type PtcState = {
  kTrue: number
  readNoiseE: number
  fwcE: number
  prnu: number
  points: number
  roiSide: number
  mode: ModeId
}

export const DEFAULT_PTC: PtcState = {
  kTrue: 8,
  readNoiseE: 3,
  fwcE: 40000,
  prnu: 0,
  points: 8,
  roiSide: 32,
  mode: MODE_IDS[0],
}

export type PtcBuilt = {
  w: number
  roiMax: number
  dark: Float32Array
  pairs: Array<{ f1: Float32Array; f2: Float32Array; electrons: number }>
  saturated: boolean
  preview: Float32Array
}

export type PtcAnalysis = PtcResult & {
  slope: number
  intercept: number
  relK: number
  varRel: number
  saturated: boolean
  preview: Float32Array
  previewMean: number
  w: number
  roi: Rect
}

function electronTargets(n: number, fwc: number): number[] {
  const count = Math.max(4, Math.min(MAX_POINTS, Math.round(n)))
  const satN = count >= 5 ? 2 : 1
  const linN = count - satN
  const lo = 200
  const hi = Math.max(lo * 2, fwc * 0.2)
  const out: number[] = []
  for (let i = 0; i < linN; i += 1) {
    const t = linN === 1 ? 0 : i / (linN - 1)
    out.push(lo * hi ** t / lo ** t)
  }
  out.push(fwc * 1.5)
  if (satN === 2) out.push(fwc * 2.2)
  return out
}

function fitSingle(points: PtcPoint[]): PtcResult {
  const ordered = [...points].sort((a, b) => a.mean - b.mean)
  let peakVar = 0
  let cut = ordered.length
  for (let i = 0; i < ordered.length; i += 1) {
    if (ordered[i].variance >= peakVar) peakVar = ordered[i].variance
    else if (ordered[i].mean > 10 && ordered[i].variance < peakVar * 0.65) {
      cut = i
      break
    }
  }
  const fitOn = ordered.slice(0, cut).filter((p) => p.mean > 1)
  const used = fitOn.length >= 3 ? fitOn : ordered.filter((p) => p.mean > 1)
  const { slope, intercept } = linReg(
    used.map((p) => p.mean),
    used.map((p) => p.variance),
  )
  const k = slope > 1e-9 ? 1 / slope : Number.POSITIVE_INFINITY
  const readDn = Math.sqrt(Math.max(intercept, 0))
  const readNoiseE = readDn * k
  const sat = points.reduce((m, p) => Math.max(m, p.mean), 0)
  const fwcE = sat * k
  const dr = readNoiseE > 0 ? fwcE / readNoiseE : 0
  return { k, readNoiseE, fwcE, dr, snrMax: Math.sqrt(Math.max(fwcE, 0)), points }
}

export function buildPtcFrames(state: Pick<PtcState, 'kTrue' | 'readNoiseE' | 'fwcE' | 'prnu' | 'points'>): PtcBuilt {
  const w = FRAME
  const params: CisParams = {
    w,
    h: w,
    kEperDn: state.kTrue,
    readNoiseE: state.readNoiseE,
    fwcE: state.fwcE,
    darkE25PerS: 0,
    darkDoubleC: 7,
    prnu: state.prnu,
    shadingPct: 0,
    defects: { dead: 0, hot: 0, low: 0, clusterProb: 0 },
    blackLevelDn: 0,
    adcBits: 14,
    nonlin: 0,
  }
  const electrons = electronTargets(state.points, state.fwcE)
  const dark = genFrame(params, { exposureS: EXPOSURE_S, illumE: 0, tempC: 25, seed: 7 })
  const pairs = electrons.map((e, index) => ({
    electrons: e,
    f1: genFrame(params, { exposureS: EXPOSURE_S, illumE: e / EXPOSURE_S, tempC: 25, seed: 100 + index * 2 }),
    f2: genFrame(params, { exposureS: EXPOSURE_S, illumE: e / EXPOSURE_S, tempC: 25, seed: 101 + index * 2 }),
  }))
  const previewIndex = Math.min(2, pairs.length - 1)
  return {
    w,
    roiMax: w,
    dark,
    pairs,
    saturated: electrons.some((e) => e >= state.fwcE * 0.98),
    preview: pairs[previewIndex].f1,
  }
}

export function analysePtc(state: PtcState, built: PtcBuilt): PtcAnalysis {
  const side = Math.max(8, Math.min(built.roiMax, Math.round(state.roiSide)))
  const roi: Rect = { x: 0, y: 0, w: side, h: side }
  const frames = built.pairs.map((item) => ({ f1: item.f1, f2: item.f2, roi }))
  let result: PtcResult
  if (state.mode === 'diff') {
    result = ptc(frames, built.dark, built.w)
  } else {
    const darkMean = frameMean(built.dark, built.w, roi)
    const points = frames.map((item) => ({
      mean: frameMean(item.f1, built.w, roi) - darkMean,
      variance: frameVar(item.f1, built.w, roi),
    }))
    result = fitSingle(points)
  }
  const slope = Number.isFinite(result.k) && result.k > 1e-9 ? 1 / result.k : 0
  const readDn = Number.isFinite(result.k) && result.k > 1e-9 ? result.readNoiseE / result.k : 0
  const relK = Number.isFinite(result.k) && state.kTrue > 0 ? result.k / state.kTrue - 1 : Number.POSITIVE_INFINITY
  return {
    ...result,
    slope,
    intercept: readDn * readDn,
    relK,
    varRel: varRelError(side * side),
    saturated: built.saturated,
    preview: built.preview,
    previewMean: frameMean(built.preview, built.w, roi),
    w: built.w,
    roi,
  }
}

export function ptcFlags(state: PtcState, a: PtcAnalysis) {
  const kOk = Number.isFinite(a.k) && Math.abs(a.relK) < 0.03
  const fwcOk = Number.isFinite(a.fwcE) && state.fwcE > 0 && Math.abs(a.fwcE / state.fwcE - 1) < 0.2
  return {
    t1: state.mode === 'diff' && state.roiSide >= 96 && kOk,
    t2: state.mode === 'single' && state.prnu >= 0.02,
    t3: a.saturated && fwcOk && state.fwcE === 20000,
    t4: state.roiSide >= 100 && a.varRel < 0.02,
  }
}

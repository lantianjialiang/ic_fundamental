import { cutbackFit, type CutbackFit } from './core/link'
import { makeWafer, type WaferMap } from '../qual/core/wafer'

/** Cut-back 与晶圆图（PIC-07）。噪声来自下标和种子的哈希，不用 Math.random。 */

export const LENGTHS_CM = [0.1, 0.5, 1, 2] as const
export const RADIAL_IDS = ['off', 'on'] as const
export type RadialId = (typeof RADIAL_IDS)[number]
export const CUT_SEED = 11
export const DARK_THRESHOLD_NA = 20
export const WAFER_DIAMETER = 11

export type CutState = {
  trueLoss: number
  gcDb: number
  noiseDb: number
  repeats: number
  /** 与 LENGTHS_CM 对齐；默认去掉最长的 2 cm */
  use: boolean[]
  radial: RadialId
  edgeDb: number
  darkNa: number
}

export const DEFAULT_CUT: CutState = {
  trueLoss: 2.5,
  gcDb: 3,
  noiseDb: 0.3,
  repeats: 1,
  use: [true, true, true, false],
  radial: RADIAL_IDS[0],
  edgeDb: 0.8,
  darkNa: 8,
}

export type CutPoint = { lengthCm: number; lossDb: number }

export type CutAnalysis = {
  points: CutPoint[]
  fit: CutbackFit | null
  gcFromFit: number | null
  slopeErr: number | null
  wafer: WaferMap
  center: number
}

/** 0–1 的确定性哈希 */
function hash01(index: number, seed: number): number {
  let h = Math.imul(seed ^ index, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function measNoise(index: number, noiseDb: number): number {
  if (noiseDb === 0) return 0
  return noiseDb * (hash01(index + 1, CUT_SEED) * 2 - 1)
}

export function analyseCut(state: CutState): CutAnalysis {
  const points: CutPoint[] = []
  LENGTHS_CM.forEach((lengthCm, lengthIndex) => {
    if (!state.use[lengthIndex]) return
    for (let rep = 0; rep < state.repeats; rep += 1) {
      const noise = measNoise(lengthIndex * 17 + rep, state.noiseDb)
      points.push({ lengthCm, lossDb: state.trueLoss * lengthCm + 2 * state.gcDb + noise })
    }
  })
  const fit = points.length >= 2 ? cutbackFit(points.map((p) => p.lengthCm), points.map((p) => p.lossDb)) : null
  const wafer = makeWafer({
    diameterDie: WAFER_DIAMETER,
    seed: CUT_SEED,
    latentRate: 0,
    clusterProb: 0.2,
    paramMean: state.trueLoss,
    paramSigma: 0.02,
    latentShiftSigma: 0,
  })
  const center = (wafer.diameterDie - 1) / 2
  const rMax = wafer.diameterDie / 2
  for (const die of wafer.dies) {
    const dist = Math.hypot(die.col - center, die.row - center)
    const radial = state.radial === 'on' ? (dist / rMax) * state.edgeDb : 0
    die.param = state.trueLoss + radial + measNoise(1000 + die.id, state.noiseDb) * 0.25
  }
  return {
    points,
    fit,
    gcFromFit: fit ? fit.interceptDb / 2 : null,
    slopeErr: fit ? fit.slopeDbPerCm - state.trueLoss : null,
    wafer,
    center,
  }
}

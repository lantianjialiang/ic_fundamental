/**
 * SNS-07 光学系统。不渲染帧。测得 PRNU 用 prnuWithSource。
 */
import { prnuWithSource } from './core/sensor'

export const SOURCE_IDS = ['broadband', 'rgb', 'ir'] as const
export type SourceId = (typeof SOURCE_IDS)[number]

export type OpticalState = {
  source: SourceId
  nonuniformPct: number
  stabilityPct: number
  calErrPct: number
  prnuPct: number
  frames: number
  megapixels: number
  bits: number
  gbps: number
  limitGeometry: boolean
  limitUniform: boolean
}

export const DEFAULT_OPTICAL: OpticalState = {
  source: SOURCE_IDS[0],
  nonuniformPct: 1,
  stabilityPct: 0.5,
  calErrPct: 1,
  prnuPct: 1,
  frames: 10,
  megapixels: 2,
  bits: 10,
  gbps: 5,
  limitGeometry: false,
  limitUniform: false,
}

export type OpticalAnalysis = {
  measuredPct: number
  bytesPerFrame: number
  mbPerFrame: number
  transferS: number
  spectralPct: number
}

export function analyseOptical(s: OpticalState): OpticalAnalysis {
  const measured = prnuWithSource(s.prnuPct / 100, s.nonuniformPct / 100) * 100
  const pixels = s.megapixels * 1e6
  const bytesPerFrame = (pixels * s.bits) / 8
  const gbps = Math.max(s.gbps, 0.01)
  const transferS = (bytesPerFrame * s.frames * 8) / (gbps * 1e9)
  const spectralPct = Math.sqrt(s.stabilityPct * s.stabilityPct + s.calErrPct * s.calErrPct)
  return { measuredPct: measured, bytesPerFrame, mbPerFrame: bytesPerFrame / 1e6, transferS, spectralPct }
}

/**
 * SNS-08 加速度计。初值取 VDUT-ACC1。六位置（含 0 g）的种子按格子固定。
 */
import { VDUT_ACC1 } from '../../data/virtual-duts/vdut-sns'
import { accelModel, flipCal, noiseInBand, tiltSensitivityError, type AccelParams } from './core/sensor'

export const MODE_IDS = ['live', 'example'] as const
export type ModeId = (typeof MODE_IDS)[number]
export const PLAN_IDS = ['flip', 'spinner', 'selftest'] as const
export type PlanId = (typeof PLAN_IDS)[number]

export const EXAMPLE_PLUS = 1.95
export const EXAMPLE_MINUS = 1.35

export const AXES = ['X', 'Y', 'Z'] as const
export const LEVELS = [-1, 0, 1] as const

export type AccelState = {
  sVg: number
  offsetV: number
  ndUg: number
  bwHz: number
  nonlin: number
  tempC: number
  tiltDeg: number
  noiseOff: boolean
  mode: ModeId
  plan: PlanId
}

export const DEFAULT_ACCEL: AccelState = {
  sVg: VDUT_ACC1.sVg,
  offsetV: VDUT_ACC1.offsetV,
  ndUg: 400,
  bwHz: 200,
  nonlin: VDUT_ACC1.nonlin,
  tempC: 25,
  tiltDeg: 0,
  noiseOff: false,
  mode: MODE_IDS[0],
  plan: PLAN_IDS[0],
}

export type AxisRead = { axis: (typeof AXES)[number]; g: number; volt: number }

export type AccelAnalysis = {
  reads: AxisRead[]
  vPlus: number
  vMinus: number
  offsetV: number
  sVg: number
  example: { offsetV: number; sVg: number }
  tiltPct: number
  noiseMg: number
}

function params(s: AccelState): AccelParams {
  return {
    sVg: s.sVg,
    offsetV: s.offsetV,
    nd: s.noiseOff ? 0 : s.ndUg * 1e-6,
    bwHz: s.bwHz,
    nonlin: s.nonlin,
    tco: VDUT_ACC1.tcoVPerC,
  }
}

export function analyseAccel(s: AccelState): AccelAnalysis {
  const p = params(s)
  const reads: AxisRead[] = []
  AXES.forEach((axis, axisIndex) => {
    LEVELS.forEach((g, levelIndex) => {
      const volt = accelModel(p, {
        aG: g,
        tiltDeg: s.tiltDeg,
        tempC: s.tempC,
        seed: 100 + axisIndex * 10 + levelIndex,
      })
      reads.push({ axis, g, volt })
    })
  })
  const xPlus = reads.find((row) => row.axis === 'X' && row.g === 1) as AxisRead
  const xMinus = reads.find((row) => row.axis === 'X' && row.g === -1) as AxisRead
  const flip = flipCal(xPlus.volt, xMinus.volt)
  return {
    reads,
    vPlus: xPlus.volt,
    vMinus: xMinus.volt,
    offsetV: flip.offsetV,
    sVg: flip.sVg,
    example: flipCal(EXAMPLE_PLUS, EXAMPLE_MINUS),
    tiltPct: tiltSensitivityError(s.tiltDeg) * 100,
    noiseMg: noiseInBand(s.ndUg * 1e-6, s.bwHz) * 1e3,
  }
}

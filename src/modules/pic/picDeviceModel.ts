import {
  PIC_TEACH,
  dipMetrics,
  fsrNm,
  linspace,
  mziTransmission,
  resonantLambdaNm,
  ringAllPass,
  ringLengthUm,
  thermalShiftPmPerK,
} from './core/photonics'

export const TAB_IDS = ['mzi', 'ring'] as const
export type DeviceTab = (typeof TAB_IDS)[number]

export const LAMBDA_NM = linspace(1530, 1570, 1601)

export type DeviceState = {
  tab: DeviceTab
  dlUm: number
  neff: number
  ng: number
  radiusUm: number
  a: number
  r: number
  dT: number
  cursor: number
}

export const DEFAULT_DEVICE: DeviceState = {
  tab: TAB_IDS[0],
  dlUm: 200,
  neff: PIC_TEACH.neff,
  ng: PIC_TEACH.ng,
  radiusUm: 8,
  a: 0.9,
  r: 0.7,
  dT: 0,
  cursor: 0,
}

export type DeviceAnalysis = {
  lambdaNm: number[]
  db: number[]
  mziFsr: number
  ringFsr: number
  resonanceNm: number
  fwhmNm: number
  q: number
  erDb: number
  pmPerK: number
  shiftNm: number
  tRes: number
  lengthUm: number
  task1: boolean
  task2: boolean
  task3: boolean
  task4: boolean
}

function toDb(value: number): number {
  return Math.max(-40, 10 * Math.log10(Math.max(value, 1e-12)))
}

export function fmtT(value: number): string {
  if (value < 0.0001) return value.toExponential(2)
  return value.toFixed(4)
}

export function analyseDevice(state: DeviceState): DeviceAnalysis {
  const mziLin = mziTransmission({
    lambdaNm: LAMBDA_NM,
    neff: state.neff,
    ng: state.ng,
    lambda0Nm: PIC_TEACH.lambdaNm,
    dlUm: state.dlUm,
  })
  const lengthUm = ringLengthUm(state.radiusUm)
  const pmPerK = thermalShiftPmPerK(PIC_TEACH.lambdaNm, state.ng, PIC_TEACH.dneffDt)
  const shiftNm = (pmPerK * state.dT) / 1000
  const neffHot = state.neff + PIC_TEACH.dneffDt * state.dT
  const resonanceNm = resonantLambdaNm(neffHot, lengthUm, PIC_TEACH.lambdaNm, state.ng, PIC_TEACH.lambdaNm)
  const ringLin = ringAllPass({
    lambdaNm: LAMBDA_NM,
    neff: neffHot,
    ng: state.ng,
    lambda0Nm: PIC_TEACH.lambdaNm,
    lengthUm,
    a: state.a,
    r: state.r,
  })
  const tRes = ringAllPass({
    lambdaNm: [resonanceNm],
    neff: neffHot,
    ng: state.ng,
    lambda0Nm: PIC_TEACH.lambdaNm,
    lengthUm,
    a: state.a,
    r: state.r,
  })[0]
  const dip = dipMetrics(LAMBDA_NM, ringLin)
  const linear = state.tab === 'mzi' ? mziLin : ringLin
  const mziFsr = fsrNm(PIC_TEACH.lambdaNm, state.ng, state.dlUm)
  const ringFsr = fsrNm(PIC_TEACH.lambdaNm, state.ng, lengthUm)
  const ngOk = Math.abs(state.ng - PIC_TEACH.ng) < 0.001
  return {
    lambdaNm: LAMBDA_NM,
    db: linear.map(toDb),
    mziFsr,
    ringFsr,
    resonanceNm,
    fwhmNm: dip.fwhmNm,
    q: dip.q,
    erDb: dip.erDb,
    pmPerK,
    shiftNm,
    tRes,
    lengthUm,
    task1: Math.abs(state.dlUm - 100) < 0.1 && ngOk && Math.abs(mziFsr - 5.72) < 0.015,
    task2: Math.abs(state.radiusUm - 10) < 0.01 && ngOk && Math.abs(ringFsr - 9.1) < 0.015,
    task3: Math.abs(state.a - state.r) < 0.02 && tRes < 0.05,
    task4: Math.abs(state.dT - 10) < 0.01 && Math.abs(shiftNm - 0.66) < 0.02,
  }
}

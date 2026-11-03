import {
  dipMetrics,
  fsrNm,
  linspace,
  mziTransmission,
  resonantLambdaNm,
  ringAllPass,
  ringLengthUm,
  PIC_TEACH,
} from './core/photonics'

/** 可调谐激光扫描（PIC-05）。数值属于虚拟器件 VDUT-PIC1。 */

export const DUT_IDS = ['ring', 'mzi'] as const
export type DutId = (typeof DUT_IDS)[number]

export const NORM_IDS = ['off', 'on'] as const
export type NormId = (typeof NORM_IDS)[number]

export const RING_RADIUS_UM = 10
export const RING_A = 0.85
export const RING_R = 0.9
export const MZI_DL_UM = 250
/** 细参考栅格，用来读真实线宽，不随学生的步长变 */
export const FINE_STEP_NM = 0.005
/** 教学假设：每个波长点的稳定时间 */
export const SETTLE_S = 0.02

export type SweepState = {
  dut: DutId
  spanNm: number
  stepNm: number
  laserDbm: number
  floorDbm: number
  norm: NormId
  wanderDb: number
}

export const DEFAULT_SWEEP: SweepState = {
  dut: DUT_IDS[0],
  spanNm: 8,
  stepNm: 0.5,
  laserDbm: 0,
  floorDbm: -50,
  norm: NORM_IDS[0],
  wanderDb: 0,
}

export type SweepCurve = {
  lambdaNm: number[]
  linear: number[]
  trueDb: number[]
  rawDb: number[]
  normDb: number[]
}

export type SweepAnalysis = {
  centerNm: number
  lengthUm: number
  fsr: number
  fine: SweepCurve
  scan: SweepCurve
  fineDip: ReturnType<typeof dipMetrics>
  scanDip: ReturnType<typeof dipMetrics>
  /** 细栅格上、噪声底截断之后的峰谷差 */
  measuredErDb: number
  meanErrDb: number
  points: number
  timeS: number
}

function deviceCenter(dut: DutId, lengthUm: number): number {
  if (dut === 'ring') {
    return resonantLambdaNm(PIC_TEACH.neff, lengthUm, PIC_TEACH.lambdaNm, PIC_TEACH.ng, PIC_TEACH.lambdaNm)
  }
  const approx = (2 * PIC_TEACH.neff * lengthUm) / (PIC_TEACH.lambdaNm / 1000)
  let m = Math.round(approx)
  if (m % 2 === 0) m += m >= approx ? -1 : 1
  const inv = m / (2 * lengthUm * 1000) - (PIC_TEACH.neff - PIC_TEACH.ng) / PIC_TEACH.lambdaNm
  if (inv <= 0) return (2 * PIC_TEACH.neff * lengthUm * 1000) / m
  return PIC_TEACH.ng / inv
}

function transmission(dut: DutId, lambdaNm: number[], lengthUm: number): number[] {
  if (dut === 'ring') {
    return ringAllPass({
      lambdaNm,
      neff: PIC_TEACH.neff,
      ng: PIC_TEACH.ng,
      lambda0Nm: PIC_TEACH.lambdaNm,
      lengthUm,
      a: RING_A,
      r: RING_R,
    })
  }
  return mziTransmission({
    lambdaNm,
    neff: PIC_TEACH.neff,
    ng: PIC_TEACH.ng,
    lambda0Nm: PIC_TEACH.lambdaNm,
    dlUm: lengthUm,
  })
}

function gridCount(spanNm: number, stepNm: number): number {
  const step = Math.max(stepNm, 1e-4)
  return Math.max(2, Math.min(4001, Math.round(spanNm / step) + 1))
}

/** 原始读数 = max(信号 − 耦合偏移, 噪声底)。归一化减去平坦的光栅回环（只含耦合偏移）。 */
function applyMeter(trueDb: number[], laserDbm: number, floorDbm: number, wanderDb: number) {
  const ref = laserDbm - wanderDb
  const rawDb = trueDb.map((db) => Math.max(laserDbm + db - wanderDb, floorDbm))
  const normDb = rawDb.map((db) => db - ref)
  return { rawDb, normDb }
}

function buildCurve(dut: DutId, lengthUm: number, centerNm: number, spanNm: number, stepNm: number, laserDbm: number, floorDbm: number, wanderDb: number): SweepCurve {
  const lambdaNm = linspace(centerNm - spanNm / 2, centerNm + spanNm / 2, gridCount(spanNm, stepNm))
  const linear = transmission(dut, lambdaNm, lengthUm)
  const trueDb = linear.map((t) => 10 * Math.log10(Math.max(t, 1e-15)))
  const { rawDb, normDb } = applyMeter(trueDb, laserDbm, floorDbm, wanderDb)
  return { lambdaNm, linear, trueDb, rawDb, normDb }
}

function meanAbs(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i])
  return a.length === 0 ? 0 : sum / a.length
}

export function analyseSweep(state: SweepState): SweepAnalysis {
  const lengthUm = state.dut === 'ring' ? ringLengthUm(RING_RADIUS_UM) : MZI_DL_UM
  const centerNm = deviceCenter(state.dut, lengthUm)
  const fine = buildCurve(state.dut, lengthUm, centerNm, state.spanNm, FINE_STEP_NM, state.laserDbm, state.floorDbm, state.wanderDb)
  const scan = buildCurve(state.dut, lengthUm, centerNm, state.spanNm, state.stepNm, state.laserDbm, state.floorDbm, state.wanderDb)
  const fineDip = dipMetrics(fine.lambdaNm, fine.linear)
  const scanDip = dipMetrics(scan.lambdaNm, scan.linear)
  const measuredErDb = Math.max(...fine.rawDb) - Math.min(...fine.rawDb)
  return {
    centerNm,
    lengthUm,
    fsr: fsrNm(centerNm, PIC_TEACH.ng, lengthUm),
    fine,
    scan,
    fineDip,
    scanDip,
    measuredErDb,
    meanErrDb: meanAbs(fine.normDb, fine.trueDb),
    points: scan.lambdaNm.length,
    timeS: scan.lambdaNm.length * SETTLE_S,
  }
}

export function erGapDb(analysis: SweepAnalysis): number {
  return analysis.fineDip.erDb - analysis.measuredErDb
}

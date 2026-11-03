import { PIC_TEACH, QUADRATURE_PHI, dbmToW, mzmLevels, mzmPower, pdCurrent } from './core/photonics'

export const TAB_IDS = ['mzm', 'pd'] as const
export type ModTab = (typeof TAB_IDS)[number]

export const DRIFT_IDS = ['raises', 'lowers', 'same'] as const
export type DriftId = (typeof DRIFT_IDS)[number]
export const DRIFT_ANSWER: DriftId = 'lowers'

export type ModState = {
  tab: ModTab
  p0: number
  vpi: number
  phiDeg: number
  vpp: number
  pdDbm: number
  resp: number
  darkNa: number
  drift: DriftId
}

export const DEFAULT_MOD: ModState = {
  tab: TAB_IDS[0],
  p0: 1,
  vpi: PIC_TEACH.mzmVpi,
  phiDeg: 0,
  vpp: 2,
  pdDbm: 0,
  resp: PIC_TEACH.pdRespAW,
  darkNa: PIC_TEACH.pdDarkA * 1e9,
  drift: DRIFT_IDS[0],
}

export type ModAnalysis = {
  phi0: number
  at0: number
  pHigh: number
  pLow: number
  erDb: number
  oma: number
  ilDb: number
  quad: boolean
  photoA: number
  totalA: number
  task1: boolean
  task2: boolean
  task3: boolean
  task4: boolean
}

export function fmtEr(db: number): string {
  return Number.isFinite(db) ? `${db.toFixed(2)} dB` : '∞'
}

export function analyseMod(state: ModState): ModAnalysis {
  const phi0 = (state.phiDeg * Math.PI) / 180
  const at0 = mzmPower({ p0: state.p0, v: 0, vpi: state.vpi, phi0 })
  const levels = mzmLevels(state.p0, state.vpi, phi0, state.vpp)
  const quad = Math.abs(phi0 - QUADRATURE_PHI) < 1e-9
  const photoA = state.resp * dbmToW(state.pdDbm)
  const totalA = pdCurrent(dbmToW(state.pdDbm), state.resp, state.darkNa * 1e-9)
  const fullSwing = Math.abs(state.vpi - 4) < 0.01 && Math.abs(state.vpp - 4) < 0.01
  return {
    phi0,
    at0,
    pHigh: levels.pHigh,
    pLow: levels.pLow,
    erDb: levels.erDb,
    oma: levels.oma,
    ilDb: levels.ilDb,
    quad,
    photoA,
    totalA,
    task1: quad && Math.abs(at0 - state.p0 / 2) < 1e-6,
    task2: quad && fullSwing,
    task3: Math.abs(state.pdDbm - -10) < 0.01 && Math.abs(state.resp - 0.8) < 0.001 && Math.abs(photoA * 1e6 - 80) < 0.5,
    task4: state.drift === DRIFT_ANSWER,
  }
}

/**
 * SNS-02 光电换算。光子数、响应度、SNR 都调用 core/optics.ts。
 */
import {
  photonEnergyJ,
  photonFlux,
  Q_ELECTRON,
  responsivity,
  shotEqualsReadE,
  snrDb,
  snrLinear,
} from './core/optics'

export const DOM_IDS = ['read', 'shot', 'dark'] as const
export type DomId = (typeof DOM_IDS)[number]

export type PhotonState = {
  lambdaNm: number
  powerPw: number
  areaUm2: number
  exposureMs: number
  qe: number
  darkPerS: number
  read: number
  signal: number
  dom: DomId
}

export const DEFAULT_PHOTON: PhotonState = {
  lambdaNm: 400,
  powerPw: 1,
  areaUm2: 4,
  exposureMs: 10,
  qe: 0.2,
  darkPerS: 200,
  read: 10,
  signal: 500,
  dom: DOM_IDS[0],
}

export type PhotonAnalysis = {
  energyEv: number
  photonsPerS: number
  photons: number
  opticalE: number
  resp: number
  darkE: number
  shotRms: number
  darkRms: number
  readRms: number
  snr: number
  snrLin: number
  crossE: number
  dominant: DomId
  irradiance: number
}

export type SnrPoint = { signal: number; snr: number; shot: number }

function snrAt(signal: number, darkE: number, read: number): number {
  if (signal <= 0 && darkE <= 0 && read <= 0) return 0
  return snrDb(Math.max(signal, 0), Math.max(darkE, 0), Math.max(read, 0))
}

export function analysePhoton(state: PhotonState): PhotonAnalysis {
  const powerW = state.powerPw * 1e-12
  const exposureS = state.exposureMs / 1000
  const energyJ = photonEnergyJ(state.lambdaNm)
  const energyEv = energyJ / Q_ELECTRON
  const photonsPerS = photonFlux(powerW, state.lambdaNm)
  const photons = photonsPerS * exposureS
  const opticalE = photons * state.qe
  const resp = responsivity(state.qe, state.lambdaNm)
  const darkE = Math.max(0, state.darkPerS) * exposureS
  const signal = Math.max(0, state.signal)
  const read = Math.max(0, state.read)
  const shotRms = Math.sqrt(signal)
  const darkRms = Math.sqrt(darkE)
  const readVar = read * read
  const dominant: DomId = readVar > signal + darkE ? 'read' : signal >= darkE ? 'shot' : 'dark'
  const areaM2 = Math.max(state.areaUm2, 1e-6) * 1e-12
  return {
    energyEv,
    photonsPerS,
    photons,
    opticalE,
    resp,
    darkE,
    shotRms,
    darkRms,
    readRms: read,
    snr: snrAt(signal, darkE, read),
    snrLin: signal <= 0 && darkE <= 0 && read <= 0 ? 0 : snrLinear(signal, darkE, read),
    crossE: shotEqualsReadE(read),
    dominant,
    irradiance: powerW / areaM2,
  }
}

/** 对数轴上的 SNR 曲线：蓝线用当前暗电子和读噪，金线是散粒噪声极限 */
export function snrCurve(darkE: number, read: number): SnrPoint[] {
  const n = 41
  const out: SnrPoint[] = []
  for (let i = 0; i < n; i += 1) {
    const signal = 10 ** ((5 * i) / (n - 1))
    out.push({
      signal,
      snr: snrAt(signal, darkE, read),
      shot: snrAt(signal, 0, 0),
    })
  }
  return out
}

export function photonFlags(state: PhotonState, a: PhotonAnalysis) {
  const respOk = Math.abs(state.lambdaNm - 550) < 0.1 && Math.abs(state.qe - 0.6) < 0.001
  const snrOk =
    state.signal === 10000 &&
    state.darkPerS === 0 &&
    state.read === 0 &&
    Math.abs(a.snr - 40) < 0.05
  const crossOk = state.read > 0 && a.crossE > 0 && Math.abs(state.signal / a.crossE - 1) < 0.05
  return {
    t1: respOk && Math.abs(a.resp - 0.266) / 0.266 < 0.005,
    t2: snrOk,
    t3: crossOk,
    t4: state.dom === a.dominant,
  }
}

import { linspace } from './core/photonics'
import { Q_BER_1E12, omaDbm, optLinkBer, qfunc, rxSensitivityOmaMw } from './core/link'

/** 光链路（PIC-08）。抖动只是把 σ 加宽的占位，不单独建抖动谱。 */

export const CLAIM_IDS = ['avg', 'er'] as const
export type ClaimId = (typeof CLAIM_IDS)[number]

export const BER_TARGET = 1e-12
export const TARGET_SIGMA_A = 10e-6
export const TARGET_R = 0.8
export const BER_POINTS = 48

export type LinkState = {
  txOmaMw: number
  erDb: number
  lossDb: number
  rAw: number
  sigmaUa: number
  jitter: number
  claim: ClaimId
  cursor: number
}

export const DEFAULT_LINK: LinkState = {
  txOmaMw: 1.5,
  erDb: 8,
  lossDb: 2,
  rAw: 0.5,
  sigmaUa: 20,
  jitter: 0,
  claim: CLAIM_IDS[0],
  cursor: 0,
}

export type BerPoint = { omaMw: number; ber: number }

export type LinkAnalysis = {
  sigmaEffA: number
  erLin: number
  pAvgMw: number
  pHighMw: number
  pLowMw: number
  pRxMw: number
  q: number
  ber: number
  sensMw: number
  sensDbm: number
  marginMw: number
  refSensMw: number
  refSensDbm: number
  curve: BerPoint[]
  cursor: number
  closest: number
}

function levels(omaMw: number, erDb: number) {
  const erLin = 10 ** (erDb / 10)
  if (erLin <= 1.001) return { erLin, pLowMw: omaMw, pHighMw: omaMw * 2, pAvgMw: omaMw * 1.5 }
  const pLowMw = omaMw / (erLin - 1)
  const pHighMw = pLowMw * erLin
  return { erLin, pLowMw, pHighMw, pAvgMw: (pHighMw + pLowMw) / 2 }
}

export function analyseLink(state: LinkState): LinkAnalysis {
  const sigmaEffA = state.sigmaUa * 1e-6 * (1 + state.jitter)
  const { erLin, pLowMw, pHighMw, pAvgMw } = levels(state.txOmaMw, state.erDb)
  const pRxMw = state.txOmaMw * 10 ** (-state.lossDb / 10)
  const q = (state.rAw * (pRxMw * 1e-3)) / (2 * sigmaEffA)
  const ber = optLinkBer({ pRxOmaMw: pRxMw, rAW: state.rAw, sigmaA: sigmaEffA })
  const sensMw = rxSensitivityOmaMw(Q_BER_1E12, sigmaEffA, state.rAw)
  const sensDbm = omaDbm(sensMw)
  const refSensMw = rxSensitivityOmaMw(Q_BER_1E12, TARGET_SIGMA_A, TARGET_R)
  const refSensDbm = omaDbm(refSensMw)
  const omaAxis = linspace(Math.log10(0.02), Math.log10(3), BER_POINTS).map((v) => 10 ** v)
  const curve = omaAxis.map((omaMw) => ({
    omaMw,
    ber: Math.max(qfunc((state.rAw * (omaMw * 1e-3)) / (2 * sigmaEffA)), 1e-18),
  }))
  let closest = 0
  let best = Infinity
  curve.forEach((point, index) => {
    const dist = Math.abs(Math.log10(point.ber) + 12)
    if (dist < best) {
      best = dist
      closest = index
    }
  })
  const cursor = Math.min(Math.max(0, state.cursor), curve.length - 1)
  return {
    sigmaEffA,
    erLin,
    pAvgMw,
    pHighMw,
    pLowMw,
    pRxMw,
    q,
    ber,
    sensMw,
    sensDbm,
    marginMw: pRxMw - sensMw,
    refSensMw,
    refSensDbm,
    curve,
    cursor,
    closest,
  }
}

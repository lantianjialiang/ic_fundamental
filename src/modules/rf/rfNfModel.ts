/**
 * 噪声系数的教学模型（RF-08）。
 * 链路：低噪声放大器（LNA）→ 混频器 → 中频放大器。三级的增益与噪声系数都是教学示意值，不对应任何具体器件。
 * 混频器增益固定为 −7 dB（变频损耗），中频放大器增益固定为 20 dB。
 *
 * 级联：总 NF 用 cascadeNfDb（Friis）算。各级对“超出信源噪声的部分”（F − 1）的贡献单独算：
 *   e1 = F1 − 1，e2 = (F2 − 1)/G1，e3 = (F3 − 1)/(G1·G2)，且 e1 + e2 + e3 = F − 1。
 * 后级的 e 要除以前面的增益，是因为后级噪声要折算到输入端才能和信号比较。
 *
 * Y 因子：信源的 ENR（已知，dB）换成线性后，热态与冷态的噪声功率之比满足 Y = 1 + ENR/F。
 * 这里用同一条链路的 F 合成两次“仪器读数”（kT0 = −174 dBm/Hz，带宽 1 MHz），
 * 所以 Y 法算出的 NF 必须与 Friis 算出的一致。
 */
import { cascadeNfDb, dbToRatio, ratioToDb } from './core/units'

/** 混频器增益（变频损耗），dB，教学示意值 */
export const MIXER_GAIN_DB = -7
/** 中频放大器增益，dB，教学示意值 */
export const IF_GAIN_DB = 20
/** 测量带宽，MHz */
export const NOISE_BW_MHZ = 1
/** 室温 T0 = 290 K 时 kT0 的噪声功率谱密度，dBm/Hz */
export const KT0_DBM_PER_HZ = -174
/** 噪声源 ENR 的选项，显示顺序即数组顺序；默认取 [0] */
export const ENR_OPTIONS: number[] = [15, 5]

export type NfState = {
  /** LNA 增益，dB */
  g1: number
  /** LNA 噪声系数，dB */
  nf1: number
  /** 混频器噪声系数，dB */
  nf2: number
  /** 中频放大器噪声系数，dB */
  nf3: number
  /** 噪声源的超噪比 ENR，dB（已知量） */
  enr: number
}

export const DEFAULT_NF: NfState = { g1: 20, nf1: 1.5, nf2: 7, nf3: 4, enr: ENR_OPTIONS[0] }

export type StageKey = 'lna' | 'mixer' | 'if'

export type StageReport = {
  key: StageKey
  nfDb: number
  gainDb: number
  /** 本级对 F − 1 的贡献（线性） */
  excess: number
  /** 占 F − 1 的份额，0–1，三级相加为 1 */
  share: number
}

export type NfAnalysis = {
  stages: StageReport[]
  /** 链路总增益，dB */
  chainGainDb: number
  /** 链路总 NF（Friis），dB */
  totalNfDb: number
  /** 链路总噪声因子（线性） */
  totalF: number
  /** 冷态（噪声源关）的输出噪声功率，dBm */
  nColdDbm: number
  /** 热态（噪声源开）的输出噪声功率，dBm */
  nHotDbm: number
  /** Y = N_hot / N_cold（线性），由两次读数算出 */
  y: number
  /** 用 Y 因子法反算的 NF，dB；应与 totalNfDb 一致 */
  nfFromYDb: number
}

export function analyseNf(state: NfState): NfAnalysis {
  const stages = [
    { key: 'lna' as const, nfDb: state.nf1, gainDb: state.g1 },
    { key: 'mixer' as const, nfDb: state.nf2, gainDb: MIXER_GAIN_DB },
    { key: 'if' as const, nfDb: state.nf3, gainDb: IF_GAIN_DB },
  ]
  const totalNfDb = cascadeNfDb(stages.map((stage) => ({ nfDb: stage.nfDb, gainDb: stage.gainDb })))
  const totalF = dbToRatio(totalNfDb)
  const excessTotal = totalF - 1

  const reports: StageReport[] = []
  let gainBefore = 1
  for (let i = 0; i < stages.length; i += 1) {
    const stage = stages[i]
    const excess = (dbToRatio(stage.nfDb) - 1) / gainBefore
    reports.push({
      key: stage.key,
      nfDb: stage.nfDb,
      gainDb: stage.gainDb,
      excess,
      share: excess / excessTotal,
    })
    gainBefore *= dbToRatio(stage.gainDb)
  }

  const chainGainDb = ratioToDb(gainBefore)
  const nColdDbm = KT0_DBM_PER_HZ + ratioToDb(NOISE_BW_MHZ * 1e6) + chainGainDb + totalNfDb
  const enrLin = dbToRatio(state.enr)
  const nHotDbm = nColdDbm + ratioToDb(1 + enrLin / totalF)
  const y = dbToRatio(nHotDbm - nColdDbm)
  const nfFromYDb = ratioToDb(enrLin / (y - 1))

  return { stages: reports, chainGainDb, totalNfDb, totalF, nColdDbm, nHotDbm, y, nfFromYDb }
}

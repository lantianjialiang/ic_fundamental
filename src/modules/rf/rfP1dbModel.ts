/**
 * RF-06 输出功率与 P1dB 的教学模型（不对应任何具体器件）。
 * 放大器用 Rapp 型压缩模型，在线性（电压）域计算：
 *   Vout = G·Vin / (1 + (G·Vin / Vsat)^(2p))^(1/(2p))
 *   - G 为小信号电压增益，由增益 dB 换算：G = 10^(Gdb/20)（电压量用 20·log10，不是功率的 10）。
 *   - Vsat 为输出饱和电压；由饱和输出功率 Psat（dBm）换算得到，所以 Vout 逼近 Vsat 时，输出功率逼近 Psat。
 *   - p 为平滑系数，取 2–3。假设：p 越大，拐点越尖，曲线越接近理想限幅。
 * 功率：Vin、Vout 为有效值（rms），50 Ω 负载下 P = V²/50（W），dBm 用 mwToDbm 换算（1 mW 为参考）。
 * P1dB：在 −60 到 +30 dBm 之间按 0.1 dB 步进扫描输入功率。以扫描起点的增益作为小信号增益 G_ss，
 *   找到增益首次降到 G_ss − 1 dB 的点，在相邻两点之间线性插值，得到 P1dB 的输入功率与输出功率。
 */

import { dbmToMw, mwToDbm } from './core/units'

export const R_LOAD = 50
export const SWEEP_MIN_DBM = -60
export const SWEEP_MAX_DBM = 30
export const SWEEP_STEP_DB = 0.1
/** P1dB 的定义：增益比小信号增益低的分贝数 */
export const P1DB_DROP_DB = 1

export const GAIN_MIN = 5
export const GAIN_MAX = 30
export const PSAT_MIN = 10
export const PSAT_MAX = 30
export const P_SMOOTH_MIN = 2
export const P_SMOOTH_MAX = 3
export const PIN_MIN = -30
export const PIN_MAX = 25

export type P1dbState = {
  /** 小信号增益，dB */
  gain: number
  /** 饱和输出功率，dBm */
  psat: number
  /** Rapp 平滑系数 p */
  p: number
  /** 工作点的输入功率，dBm */
  pin: number
}

export const DEFAULT_P1DB: P1dbState = { gain: 15, psat: 20, p: 2, pin: -5 }

/** dBm（50 Ω）→ 有效值电压 */
export function dbmToVrms(dbm: number): number {
  return Math.sqrt((dbmToMw(dbm) / 1000) * R_LOAD)
}

/** 有效值电压（50 Ω）→ dBm */
export function vrmsToDbm(vrms: number): number {
  return mwToDbm(((vrms * vrms) / R_LOAD) * 1000)
}

/** 电压增益：G = 10^(Gdb/20) */
export function voltageGain(gainDb: number): number {
  return 10 ** (gainDb / 20)
}

/** 饱和输出功率对应的输出饱和电压（有效值） */
export function vsatOf(psatDbm: number): number {
  return dbmToVrms(psatDbm)
}

/** Rapp 型压缩：Vout = G·Vin / (1 + (G·Vin/Vsat)^(2p))^(1/(2p))（线性域） */
export function rappVout(vin: number, gLin: number, vsat: number, p: number): number {
  const k = 2 * p
  const x = (gLin * vin) / vsat
  return (gLin * vin) / (1 + x ** k) ** (1 / k)
}

export type SweepRow = { pin: number; pout: number; gainDb: number }

/** 扫描输入功率，返回每个点的输出功率（dBm）与实际增益（dB） */
export function sweepRapp(state: P1dbState): SweepRow[] {
  const g = voltageGain(state.gain)
  const vsat = vsatOf(state.psat)
  const count = Math.round((SWEEP_MAX_DBM - SWEEP_MIN_DBM) / SWEEP_STEP_DB) + 1
  const rows: SweepRow[] = []
  for (let i = 0; i < count; i += 1) {
    const pin = SWEEP_MIN_DBM + i * SWEEP_STEP_DB
    const vin = dbmToVrms(pin)
    const vout = rappVout(vin, g, vsat, state.p)
    rows.push({ pin, pout: vrmsToDbm(vout), gainDb: 20 * Math.log10(vout / vin) })
  }
  return rows
}

export type P1dbAnalysis = {
  rows: SweepRow[]
  /** 扫描起点的增益，作为小信号增益（dB） */
  smallGainDb: number
  /** P1dB 的输入、输出功率（dBm）；扫描范围内找不到时为 null */
  p1in: number | null
  p1out: number | null
  psat: number
  /** 工作点：输入 pin 时的输出功率（dBm）与增益（dB） */
  pin: number
  opPout: number
  opGainDb: number
  /** 工作点的增益压缩量 = 小信号增益 − 工作点增益（dB） */
  compressDb: number
}

export function analyseP1db(state: P1dbState): P1dbAnalysis {
  const rows = sweepRapp(state)
  const smallGainDb = rows[0].gainDb
  const target = smallGainDb - P1DB_DROP_DB
  let p1in: number | null = null
  let p1out: number | null = null
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i].gainDb <= target) {
      const above = rows[i - 1]
      const below = rows[i]
      const t = (above.gainDb - target) / (above.gainDb - below.gainDb)
      p1in = above.pin + t * (below.pin - above.pin)
      p1out = above.pout + t * (below.pout - above.pout)
      break
    }
  }
  const vin = dbmToVrms(state.pin)
  const vout = rappVout(vin, voltageGain(state.gain), vsatOf(state.psat), state.p)
  const opPout = vrmsToDbm(vout)
  const opGainDb = 20 * Math.log10(vout / vin)
  return {
    rows,
    smallGainDb,
    p1in,
    p1out,
    psat: state.psat,
    pin: state.pin,
    opPout,
    opGainDb,
    compressDb: smallGainDb - opGainDb,
  }
}

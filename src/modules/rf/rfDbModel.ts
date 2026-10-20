/**
 * RF-02 dB / dBm / dBc 的教学模型（纯函数，换算全部走 core/units.ts）。
 * - 功率输入：W、mW、dBm 三选一；dBm = 10·log10(P / 1 mW)，W 与 mW 必须大于 0。
 * - 级联：输出 dBm = 信号源 dBm + Σ 各段 dB（增益为正、损耗为负）；线性验算用 10^(Σ dB / 10)。
 * - dBc：杂散的绝对功率 dBm = 载波 dBm + 杂散 dBc。
 */
import { dbmToMw, dbmToWatt, dbToRatio, mwToDbm, wattToDbm } from './core/units'

export type PowerUnit = 'mW' | 'W' | 'dBm'

/** 输入单位的显示顺序，默认取 [0] */
export const UNIT_OPTIONS: PowerUnit[] = ['mW', 'W', 'dBm']

/** 示例上限：VDUT-RFT1 的输入功率上限（教学值，不是真实器件的规格） */
export const DUT_INPUT_MAX_DBM = 10

export type DbState = {
  unit: PowerUnit
  /** 输入框里的文字；允许中间态（例如只打了一个负号） */
  text: string
  /** dBc 区：载波功率，dBm */
  carrierDbm: number
  /** dBc 区：杂散相对载波，dBc */
  spurDbc: number
  /** 级联区：信号源输出，dBm */
  srcDbm: number
  /** 级联区：线缆，dB（损耗为负） */
  cableDb: number
  /** 级联区：放大器增益，dB */
  ampDb: number
  /** 级联区：衰减器或夹具，dB（损耗为负） */
  attDb: number
}

export const DEFAULT_DB: DbState = {
  unit: UNIT_OPTIONS[0],
  text: '1',
  carrierDbm: 0,
  spurDbc: -40,
  srcDbm: 0,
  cableDb: -2,
  ampDb: 15,
  attDb: -10,
}

/** 把输入文字解析成数；无效（空、非数字、W / mW 不大于 0）时返回 null */
export function parsePower(unit: PowerUnit, text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '') {
    return null
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    return null
  }
  if (unit !== 'dBm' && value <= 0) {
    return null
  }
  return value
}

export type PowerValues = { dbm: number; mw: number; watt: number }

/** 同一个功率在 dBm、mW、W 三种写法下的值 */
export function powerInAllUnits(unit: PowerUnit, value: number): PowerValues {
  if (unit === 'dBm') {
    const mw = dbmToMw(value)
    return { dbm: value, mw, watt: mw / 1000 }
  }
  if (unit === 'W') {
    return { dbm: wattToDbm(value), mw: value * 1000, watt: value }
  }
  return { dbm: mwToDbm(value), mw: value, watt: value / 1000 }
}

/** 切换输入单位：保持同一个功率，把文字换算成新单位 */
export function switchUnit(state: DbState, next: PowerUnit): DbState {
  const value = parsePower(state.unit, state.text)
  if (value === null) {
    return { ...state, unit: next }
  }
  const all = powerInAllUnits(state.unit, value)
  if (next === 'dBm') {
    return { ...state, unit: next, text: String(Number(all.dbm.toFixed(2))) }
  }
  if (next === 'W') {
    return { ...state, unit: next, text: String(Number(all.watt.toPrecision(4))) }
  }
  return { ...state, unit: next, text: String(Number(all.mw.toPrecision(4))) }
}

export type Level = { key: 'src' | 'cable' | 'amp' | 'att'; dbm: number }

export type DbAnalysis = {
  /** 输入是否有效；无效时只有级联和 dBc 区可用 */
  input: PowerValues | null
  /** 级联总增益 Σ dB */
  totalDb: number
  /** 线性验算：10^(Σ dB / 10) */
  linearGain: number
  /** 级联各节点的功率，dBm（信号源、线缆后、放大器后、衰减器后即输出） */
  levels: Level[]
  outDbm: number
  /** 输出功率的线性值，mW：源功率 mW × 线性增益 */
  outMw: number
  spurDbm: number
  spurWatt: number
  overLimit: boolean
}

export function analyseDb(state: DbState): DbAnalysis {
  const value = parsePower(state.unit, state.text)
  const input = value === null ? null : powerInAllUnits(state.unit, value)
  const totalDb = state.cableDb + state.ampDb + state.attDb
  const afterCable = state.srcDbm + state.cableDb
  const afterAmp = afterCable + state.ampDb
  const outDbm = afterAmp + state.attDb
  const linearGain = dbToRatio(totalDb)
  const spurDbm = state.carrierDbm + state.spurDbc
  return {
    input,
    totalDb,
    linearGain,
    levels: [
      { key: 'src', dbm: state.srcDbm },
      { key: 'cable', dbm: afterCable },
      { key: 'amp', dbm: afterAmp },
      { key: 'att', dbm: outDbm },
    ],
    outDbm,
    outMw: dbmToMw(state.srcDbm) * linearGain,
    spurDbm,
    spurWatt: dbmToWatt(spurDbm),
    overLimit: outDbm > DUT_INPUT_MAX_DBM,
  }
}

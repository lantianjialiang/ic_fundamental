/**
 * 「模拟芯片测试概述」的模型（虚构器件 VDUT-MIX1，教学示意，数值均为虚构）。
 * 规格书的每一行是一个测试项：参数、min / typ / max、单位、测试条件。
 * 判定只看 min 与 max；typ 只是典型值，不是限值。
 */

export type SpecId = 'vos' | 'ib' | 'iq' | 'avol' | 'voh' | 'vref' | 'tcvref' | 'thetaja'

/**
 * must：关键项，必须在 ATE 上逐颗测；
 * char：表征项，要在多个温度 / 条件下扫描得到，不逐颗测；
 * info：信息项，不是电性测试项，不放进 ATE 的逐颗判定。
 */
export type ItemRole = 'must' | 'char' | 'info'

export type SpecItem = {
  id: SpecId
  symbol: string
  min: number | null
  typ: number | null
  max: number | null
  unit: string
  /** 显示时保留的小数位数 */
  digits: number
  role: ItemRole
}

export const VREF_MIN = 2.475
export const VREF_TYP = 2.5
export const VREF_MAX = 2.525
export const IQ_MAX = 1.4
export const VOH_MIN = 4.85
/** 测得值离 typ 至少这么多 mV，才算「明显偏离 typ」 */
export const VREF_TYP_GAP_MV = 20
/** 旋钮与数轴的范围：V */
export const VREF_AXIS_LO = 2.4
export const VREF_AXIS_HI = 2.6
export const VREF_DEFAULT = VREF_TYP

export const VOS: SpecItem = { id: 'vos', symbol: 'Vos', min: null, typ: 0.3, max: 1.0, unit: 'mV', digits: 1, role: 'must' }
export const IB: SpecItem = { id: 'ib', symbol: 'Ib', min: null, typ: 2, max: 10, unit: 'nA', digits: 0, role: 'must' }
export const IQ: SpecItem = { id: 'iq', symbol: 'Iq', min: null, typ: 0.9, max: IQ_MAX, unit: 'mA', digits: 1, role: 'must' }
export const AVOL: SpecItem = { id: 'avol', symbol: 'AVOL', min: 96, typ: 110, max: null, unit: 'dB', digits: 0, role: 'must' }
export const VOH: SpecItem = { id: 'voh', symbol: 'VOH', min: VOH_MIN, typ: 4.92, max: null, unit: 'V', digits: 2, role: 'must' }
export const VREF: SpecItem = { id: 'vref', symbol: 'Vref', min: VREF_MIN, typ: VREF_TYP, max: VREF_MAX, unit: 'V', digits: 3, role: 'must' }
export const TCVREF: SpecItem = { id: 'tcvref', symbol: 'TCVref', min: null, typ: 10, max: 25, unit: 'ppm/°C', digits: 0, role: 'char' }
export const THETA_JA: SpecItem = { id: 'thetaja', symbol: 'θJA', min: null, typ: 85, max: null, unit: '°C/W', digits: 0, role: 'info' }

/** 规格书的行序就是显示顺序；第一行（Vos）是侧栏初始说明对应的那一项 */
export const SPEC_ITEMS: SpecItem[] = [VOS, IB, IQ, AVOL, VOH, VREF, TCVREF, THETA_JA]

/** 测得值是否落在 min–max 之内；min 或 max 为 null 时该侧不判 */
export function inLimits(value: number, item: SpecItem): boolean {
  if (item.min !== null && value < item.min) {
    return false
  }
  if (item.max !== null && value > item.max) {
    return false
  }
  return true
}

/** 限值显示：null 写成破折号 */
export function fmtLimit(value: number | null, digits: number): string {
  return value === null ? '—' : value.toFixed(digits)
}

export type Coverage = {
  /** 关键项（must）没有勾选：该测没测 */
  missing: SpecItem[]
  /** 勾选了不必在 ATE 上逐颗测的项（char / info）：多余 */
  extra: SpecItem[]
}

/** 比对勾选结果与规格书角色：must 必须勾，char / info 不该勾 */
export function coverage(selected: readonly SpecId[]): Coverage {
  return {
    missing: SPEC_ITEMS.filter((item) => item.role === 'must' && !selected.includes(item.id)),
    extra: SPEC_ITEMS.filter((item) => item.role !== 'must' && selected.includes(item.id)),
  }
}

/** 测得值相对 typ 的偏差，取整到 mV（正负号保留） */
export function gapMv(value: number, typ: number): number {
  return Math.round((value - typ) * 1000)
}

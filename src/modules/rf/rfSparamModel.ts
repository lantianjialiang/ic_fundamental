/**
 * RF-04 阻抗匹配与 S 参数的教学模型（纯函数）。
 * 负载阻抗 ZL = R + jX（Ω），参考阻抗 Z0 = 50 Ω。
 *   Γ = (ZL − Z0) / (ZL + Z0)           反射系数（复数）
 *   RL = −20·log10|Γ|                    回波损耗（dB）
 *   VSWR = (1 + |Γ|) / (1 − |Γ|)         电压驻波比
 *   失配损耗 = −10·log10(1 − |Γ|²)        反射掉的功率换算成的损耗（dB）
 * 只用 core/units.ts 的函数，不在这里重写公式。
 */
import { loc, type LText } from '../../i18n/locale'
import { type Complex, magnitude, mismatchLossDb, reflectionCoeff, returnLossDb, vswr } from './core/units'

export const Z0 = 50

/** 合格线：VSWR ≤ 2（教学约定）。对应 |Γ| ≤ 1/3，即 RL ≥ 9.5 dB */
export const VSWR_LIMIT = 2

/** 比较时的容差，避免 2.0000000000000004 这类浮点误差把合格判成不合格 */
const EPS = 1e-9

export type LoadId = 'match' | 'low' | 'high' | 'reactive' | 'custom'

/** 负载预设，显示顺序即数组顺序；默认取 [0]（50 Ω 匹配） */
export const LOAD_OPTIONS: Array<{ id: LoadId; label: LText }> = [
  { id: 'match', label: loc('50 Ω 匹配', '50 Ω matched') },
  { id: 'low', label: loc('25 Ω', '25 Ω') },
  { id: 'high', label: loc('100 Ω', '100 Ω') },
  { id: 'reactive', label: loc('50 + j50 Ω', '50 + j50 Ω') },
  { id: 'custom', label: loc('自定义', 'Custom') },
]

/** 预设对应的 R、X（Ω）；custom 没有预设值，由滑杆决定 */
const LOAD_VALUES: Record<Exclude<LoadId, 'custom'>, { rOhm: number; xOhm: number }> = {
  match: { rOhm: 50, xOhm: 0 },
  low: { rOhm: 25, xOhm: 0 },
  high: { rOhm: 100, xOhm: 0 },
  reactive: { rOhm: 50, xOhm: 50 },
}

export type SparamState = {
  preset: LoadId
  /** 负载电阻 R，Ω，0–200 */
  rOhm: number
  /** 负载电抗 X，Ω，−200–200（正为感性，负为容性） */
  xOhm: number
}

/** 选预设：R、X 跟着变；选自定义：保留当前值 */
export function applyPreset(prev: SparamState, id: LoadId): SparamState {
  if (id === 'custom') {
    return { ...prev, preset: 'custom' }
  }
  const values = LOAD_VALUES[id]
  return { preset: id, rOhm: values.rOhm, xOhm: values.xOhm }
}

/** 默认值取第一个预设，与 LOAD_OPTIONS[0] 保持一致 */
export const DEFAULT_SPARAM: SparamState = applyPreset({ preset: 'custom', rOhm: 0, xOhm: 0 }, LOAD_OPTIONS[0].id)

/** 拖动 R 或 X 时，预设失效，改为自定义 */
export function setLoadValue(prev: SparamState, patch: { rOhm?: number; xOhm?: number }): SparamState {
  return { ...prev, ...patch, preset: 'custom' }
}

export type SparamAnalysis = {
  zl: Complex
  /** 反射系数 Γ（复数） */
  gamma: Complex
  gammaMag: number
  /** 回波损耗，dB；|Γ| = 0 时为 Infinity */
  rlDb: number
  /** 电压驻波比；|Γ| = 1 时为 Infinity */
  vswr: number
  /** 失配损耗，dB；|Γ| = 1 时为 Infinity */
  mismatchDb: number
  /** 反射功率占入射功率的百分比 = |Γ|² × 100 */
  reflectedPct: number
  /** VSWR ≤ 2 即合格 */
  pass: boolean
}

export function analyseSparam(state: SparamState): SparamAnalysis {
  const zl: Complex = { re: state.rOhm, im: state.xOhm }
  const gamma = reflectionCoeff(zl, Z0)
  const gammaMag = magnitude(gamma)
  const standingWave = vswr(gammaMag)
  return {
    zl,
    gamma,
    gammaMag,
    rlDb: returnLossDb(gammaMag),
    vswr: standingWave,
    mismatchDb: mismatchLossDb(gammaMag),
    reflectedPct: gammaMag * gammaMag * 100,
    pass: standingWave <= VSWR_LIMIT + EPS,
  }
}

/** 给定 R、X 时 |Γ| 随 R 的曲线上一点（图里的曲线用它，X 固定为当前值） */
export function gammaMagAt(rOhm: number, xOhm: number): number {
  return magnitude(reflectionCoeff({ re: rOhm, im: xOhm }, Z0))
}

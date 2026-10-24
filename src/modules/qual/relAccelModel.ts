/**
 * REL-02 失效机理与加速模型（纯函数，不依赖 React）。
 * 四个基础公式全部来自 core/reliability.ts：arrheniusAF、voltageAF、coffinMansonAF、blackMTTF。
 *
 * 每种机理只计入它真正依赖的应力分项（MECH_FACTORS），总 AF = 计入分项相乘。
 *  - 温度项 AF_T = exp[(Ea/k)(1/Tu − 1/Ts)]（Arrhenius）
 *  - 电压项 AF_V = exp[γ(Vs − Vu)]
 *  - 温度循环项 AF_CM = (ΔTs/ΔTu)^n（Coffin-Manson）
 *  - 电流密度项 AF_J = J^n，J = J_stress / J_use（Black 方程中 MTTF ∝ J^(−n)）
 * 其中 EM 同时由 Black 方程给出：MTTF_use / MTTF_stress = AF_T · AF_J，analyseAccel 会用 blackMTTF 交叉核对。
 */
import { arrheniusAF, blackMTTF, coffinMansonAF, toKelvin, voltageAF } from './core/reliability'

/** 机理选项：数组顺序即显示顺序，默认取 [0] */
export const MECH_IDS = ['em', 'tddb', 'hci', 'nbti', 'tmf', 'corr', 'esd'] as const
export type MechId = (typeof MECH_IDS)[number]

export type FactorFlags = { temp: boolean; volt: boolean; cycle: boolean; current: boolean }

/** 每种机理计入哪些分项（教学简化，见 relAccelData 中的机理说明） */
export const MECH_FACTORS: Record<MechId, FactorFlags> = {
  em: { temp: true, volt: false, cycle: false, current: true },
  tddb: { temp: true, volt: true, cycle: false, current: false },
  hci: { temp: true, volt: true, cycle: false, current: false },
  nbti: { temp: true, volt: true, cycle: false, current: false },
  tmf: { temp: false, volt: false, cycle: true, current: false },
  corr: { temp: true, volt: false, cycle: false, current: false },
  esd: { temp: false, volt: false, cycle: false, current: false },
}

export type AccelState = {
  mech: MechId
  /** 使用温度，°C */
  tUse: number
  /** 试验温度，°C */
  tStress: number
  /** 激活能 Ea，eV */
  ea: number
  /** 电压系数 γ，1/V */
  gamma: number
  /** 使用电压，V */
  vUse: number
  /** 试验电压，V */
  vStress: number
  /** 使用时的温度循环幅度 ΔT，°C */
  dtUse: number
  /** 试验时的温度循环幅度 ΔT，°C */
  dtStress: number
  /** 指数 n（Coffin-Manson 与 Black 共用） */
  n: number
  /** 电流密度比 J = J_stress / J_use */
  j: number
  /** 试验小时数 */
  hours: number
}

export const DEFAULT_ACCEL: AccelState = {
  mech: MECH_IDS[0],
  tUse: 55,
  tStress: 110,
  ea: 0.7,
  gamma: 3,
  vUse: 1.0,
  vStress: 1.0,
  dtUse: 65,
  dtStress: 100,
  n: 1,
  j: 1,
  hours: 1000,
}

/** 小时 → 年（每年 8760 h） */
export const HOURS_PER_YEAR = 8760
/** Ea 不确定性的示意范围，eV */
export const EA_SPREAD = 0.1

export type AccelAnalysis = {
  afT: number
  afV: number
  afCm: number
  afJ: number
  /** 由 Black 方程直接算的 MTTF 比（使用/试验），只对 EM 有意义，用来核对 AF_T·AF_J */
  blackRatio: number
  /** 各分项在本机理中实际计入的值（未计入的为 1） */
  counted: { temp: number; volt: number; cycle: number; current: number }
  flags: FactorFlags
  total: number
  useHours: number
  useYears: number
  /** Ea ± EA_SPREAD 时的 AF_T 范围 */
  eaLow: number
  eaHigh: number
}

export function analyseAccel(s: AccelState): AccelAnalysis {
  const flags = MECH_FACTORS[s.mech]
  const afT = arrheniusAF(s.ea, s.tUse, s.tStress)
  const afV = voltageAF(s.gamma, s.vUse, s.vStress)
  const afCm = coffinMansonAF(s.dtUse, s.dtStress, s.n)
  const afJ = Math.pow(s.j, s.n)
  const blackRatio = blackMTTF(1, 1, s.n, s.ea, toKelvin(s.tUse)) / blackMTTF(1, s.j, s.n, s.ea, toKelvin(s.tStress))
  const counted = {
    temp: flags.temp ? afT : 1,
    volt: flags.volt ? afV : 1,
    cycle: flags.cycle ? afCm : 1,
    current: flags.current ? afJ : 1,
  }
  const total = counted.temp * counted.volt * counted.cycle * counted.current
  return {
    afT,
    afV,
    afCm,
    afJ,
    blackRatio,
    counted,
    flags,
    total,
    useHours: s.hours * total,
    useYears: (s.hours * total) / HOURS_PER_YEAR,
    eaLow: arrheniusAF(s.ea - EA_SPREAD, s.tUse, s.tStress),
    eaHigh: arrheniusAF(s.ea + EA_SPREAD, s.tUse, s.tStress),
  }
}

/** 温度曲线：Arrhenius AF_T 随试验温度变化（用于图），Ea 取 ea 的值 */
export function arrheniusCurve(ea: number, tUse: number, tStresses: number[]): number[] {
  return tStresses.map((tStress) => arrheniusAF(ea, tUse, tStress))
}

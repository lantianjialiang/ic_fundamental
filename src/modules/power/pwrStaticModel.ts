/**
 * PWR-02 静态参数测试（StaticParamLab）的教学模型。
 * DUT 是虚构的 VDUT-MOS1（demoMos：100 V、Rds25 = 5 mΩ、Vth = 3 V、kp = 5 A/V²），数值只用于教学。
 * - BVdss：真值 100 V，读数受电压 compliance 截断。
 * - Idss / Igss：25 °C 下的教学漏电，每升高 10 °C 翻倍；compliance 是电流限，限值判 PASS / FAIL。
 * - Vth：饱和区平方律反推 Vgs = Vth + √(2·Id / kp)，所以 Vth 依赖测试电流 Id（教学简化公式）。
 * - Rds(on)：脉冲下的结温升用单级 Foster 热模型（core/thermal）算，再按线性温度系数（core/power）换算读数。
 */
import { conductionLoss, demoMos, rdsOn, type MosModel } from './core/power'
import { pulseHeating, rdsErrorFromRise, singleStagePulseFor, type ZthModel } from './core/thermal'

export type StaticParam = 'bvdss' | 'idss' | 'igss' | 'vth' | 'rdson'

/** 参数顺序即 Seg 的显示顺序；默认取 [0]（BVdss） */
export const PARAM_ORDER: StaticParam[] = ['bvdss', 'idss', 'igss', 'vth', 'rdson']

export type SampleId = 'good' | 'leaky' | 'gate'

/** 样品顺序即显示顺序；默认取 [0]（良品） */
export const SAMPLE_ORDER: SampleId[] = ['good', 'leaky', 'gate']

/** 教学热模型：单级 Foster，Rth = 1 K/W，τ = 10 ms */
export const THERMAL: ZthModel = { stages: [{ rth: 1, tau: 10e-3 }] }

export const MOS: MosModel = demoMos()
/** 击穿电压真值（V） */
export const BV_TRUE = MOS.bv
/** Vth 的参考测试电流（mA）：误差与差值都相对它算 */
export const VTH_REF_MA = 1
/** 25 °C 下良品的 Idss、Igss（nA，教学示意） */
export const IDSS_25_NA = 10
export const IGSS_25_NA = 1
/** 漏电每升高这么多度翻倍（教学简化） */
export const LEAK_DOUBLING_K = 10

/** 各样品相对良品的漏电倍数（教学示意：漏电偏大、栅漏偏大两种故障） */
const FACTOR: Record<SampleId, { idss: number; igss: number }> = {
  good: { idss: 1, igss: 1 },
  leaky: { idss: 20, igss: 1 },
  gate: { idss: 1, igss: 200 },
}

export type Range = { def: number; min: number; max: number; step: number }

/** 每个参数的强制值（force）范围；单位见 Data 中的 FORCE_UNIT */
export const FORCE: Record<StaticParam, Range> = {
  bvdss: { def: 250, min: 50, max: 1000, step: 10 },
  idss: { def: 80, min: 10, max: 100, step: 1 },
  igss: { def: 20, min: 5, max: 20, step: 1 },
  vth: { def: 0.25, min: 0.1, max: 10, step: 0.05 },
  rdson: { def: 50, min: 1, max: 100, step: 1 },
}

/** 每个参数的 compliance 范围；单位见 Data 中的 COMPLIANCE_UNIT */
export const COMPLIANCE: Record<StaticParam, Range> = {
  bvdss: { def: 110, min: 80, max: 130, step: 1 },
  idss: { def: 1000, min: 10, max: 1000, step: 10 },
  igss: { def: 1000, min: 10, max: 1000, step: 10 },
  vth: { def: 5, min: 1, max: 10, step: 0.5 },
  rdson: { def: 1, min: 0.1, max: 2, step: 0.1 },
}

export const PULSE_US: Range = { def: 10000, min: 10, max: 10000, step: 10 }
export const DUTY_PCT: Range = { def: 1, min: 1, max: 50, step: 1 }
export const TA_C: Range = { def: 25, min: 25, max: 125, step: 5 }
/** 漏电限值（nA），只用于 Idss / Igss */
export const LIMIT_NA: Range = { def: 100, min: 10, max: 1000, step: 10 }

export type StaticState = {
  param: StaticParam
  /** 强制值，单位见 FORCE_UNIT */
  force: number
  /** compliance，单位见 COMPLIANCE_UNIT */
  compliance: number
  /** 脉宽（µs），只用于 Rds(on) */
  pulseUs: number
  /** 占空比（%），只用于 Rds(on) */
  dutyPct: number
  /** 环境温度（°C） */
  ta: number
  sample: SampleId
  /** 限值（nA），只用于 Idss / Igss */
  limitNa: number
}

export function controlsOf(param: StaticParam): { force: number; compliance: number } {
  return { force: FORCE[param].def, compliance: COMPLIANCE[param].def }
}

export function initialStatic(): StaticState {
  const param = PARAM_ORDER[0]
  return {
    param,
    ...controlsOf(param),
    pulseUs: PULSE_US.def,
    dutyPct: DUTY_PCT.def,
    ta: TA_C.def,
    sample: SAMPLE_ORDER[0],
    limitNa: LIMIT_NA.def,
  }
}

/** 25 °C 时的 Idss 与 Igss（nA），随环境温度按 2^((T−25)/10) 变化 */
export function idssAt(ta: number, sample: SampleId): number {
  return IDSS_25_NA * FACTOR[sample].idss * Math.pow(2, (ta - 25) / LEAK_DOUBLING_K)
}

export function igssAt(ta: number, sample: SampleId): number {
  return IGSS_25_NA * FACTOR[sample].igss * Math.pow(2, (ta - 25) / LEAK_DOUBLING_K)
}

/** 饱和区平方律下，强制电流 Id（mA）对应的栅源电压（V）：Vgs = Vth + √(2·Id / kp) */
export function vthAt(idMa: number): number {
  return MOS.vth + Math.sqrt((2 * (idMa / 1000)) / MOS.kp)
}

/** 耗散功率 P = I²·Rds(on)，Rds 取环境温度下的值（教学简化） */
export function dissipation(current: number, ta: number): number {
  return conductionLoss(current, rdsOn(MOS, ta))
}

/**
 * 周期脉冲的峰值结温升（教学简化公式）：单脉冲 ΔT = P·Zth(t_on)，
 * 周期性加热时乘以 1 / (1 − e^(−T/τ))，T = t_on / D。D → 0 时退化为单脉冲。
 */
export function peakRise(pW: number, tOnS: number, dutyFrac: number): number {
  const tau = THERMAL.stages[0].tau
  const period = tOnS / dutyFrac
  return pulseHeating(pW, tOnS, THERMAL) / (1 - Math.exp(-period / tau))
}

/** 误差限 1%（ΔTj 对应 2 K）时，单脉冲的最大脉宽（s）：t = −τ·ln(1 − ΔTmax/(P·Rth)) */
export function maxPulseS(pW: number): number {
  const dTmax = 0.01 / MOS.rdsTempco
  return singleStagePulseFor(pW, THERMAL.stages[0].rth, THERMAL.stages[0].tau, dTmax)
}

/** 一次脉冲测量的结温升（K）与相对 25 °C 真值的误差（%）：误差 = 自热项 + 环境项 */
export function rdsErrorAt(force: number, ta: number, dutyFrac: number, tOnS: number): { dT: number; errPct: number } {
  const dT = peakRise(dissipation(force, ta), tOnS, dutyFrac)
  const heating = rdsErrorFromRise(MOS.rdsTempco, dT)
  const ambient = MOS.rdsTempco * (ta - 25)
  return { dT, errPct: (heating + ambient) * 100 }
}

export type Measure = {
  /** 读数（基本单位：V、nA 或 Ω） */
  value: number
  /** compliance 是否命中（读数被截断在 compliance 上） */
  clipped: boolean
  /** Idss / Igss 的判定；无法判定时为 null，只对 Idss / Igss 有值 */
  pass: boolean | null
  /** Rds(on) 的结温升（K）与误差（%），其它参数为 null */
  dTj: number | null
  errPct: number | null
  /** Rds(on) 在 1% 误差下的最大单脉冲宽（s） */
  maxPulse: number | null
  /** Vth 相对 1 mA 参考条件的差（mV） */
  vthDiffMv: number | null
}

/** 按当前控件算出读数、判定与误差 */
export function measureOf(s: StaticState): Measure {
  const base: Measure = {
    value: 0,
    clipped: false,
    pass: null,
    dTj: null,
    errPct: null,
    maxPulse: null,
    vthDiffMv: null,
  }
  if (s.param === 'bvdss') {
    const clipped = s.compliance < BV_TRUE
    const value = clipped ? s.compliance : BV_TRUE
    return { ...base, value, clipped, errPct: ((value - BV_TRUE) / BV_TRUE) * 100 }
  }
  if (s.param === 'idss' || s.param === 'igss') {
    const trueNa = s.param === 'idss' ? idssAt(s.ta, s.sample) : igssAt(s.ta, s.sample)
    const clipped = trueNa > s.compliance
    const value = clipped ? s.compliance : trueNa
    let pass: boolean | null = value <= s.limitNa
    if (clipped) {
      // 真值 ≥ compliance：compliance 已超过限值则必定 FAIL；否则无法判定
      pass = s.compliance > s.limitNa ? false : null
    }
    return { ...base, value, clipped, pass }
  }
  if (s.param === 'vth') {
    const v = vthAt(s.force)
    const clipped = v > s.compliance
    const value = clipped ? s.compliance : v
    return { ...base, value, clipped, vthDiffMv: (value - vthAt(VTH_REF_MA)) * 1000 }
  }
  // Rds(on)：强制电流 Id，测 Vds，R = Vds / Id
  const tOnS = s.pulseUs * 1e-6
  const { dT, errPct } = rdsErrorAt(s.force, s.ta, s.dutyPct / 100, tOnS)
  const rMeas = rdsOn(MOS, s.ta + dT)
  const clipped = s.force * rMeas > s.compliance
  const value = clipped ? s.compliance / s.force : rMeas
  const errFromValue = (value / rdsOn(MOS, 25) - 1) * 100
  return {
    ...base,
    value,
    clipped,
    dTj: dT,
    errPct: clipped ? errFromValue : errPct,
    maxPulse: maxPulseS(dissipation(s.force, s.ta)),
  }
}

/** 某参数在指定样品下的判定，用于任务卡 T4（只对 Idss / Igss 有意义） */
export function passWith(s: StaticState, sample: SampleId): boolean | null {
  return measureOf({ ...s, sample }).pass
}

/** 误差随脉宽变化的曲线（对数等距采样），用于图中画 1% 误差线 */
export function errorCurve(s: StaticState, points = 60): Array<{ tUs: number; errPct: number }> {
  const out: Array<{ tUs: number; errPct: number }> = []
  const lo = Math.log10(10)
  const hi = Math.log10(10000)
  for (let i = 0; i <= points; i += 1) {
    const tUs = Math.pow(10, lo + ((hi - lo) * i) / points)
    const { errPct } = rdsErrorAt(s.force, s.ta, s.dutyPct / 100, tUs * 1e-6)
    out.push({ tUs, errPct })
  }
  return out
}

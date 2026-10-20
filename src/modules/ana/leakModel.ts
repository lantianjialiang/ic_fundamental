/**
 * ANA-08「模拟引脚漏电与静态电流判定」的仿真模型（教学示意，器件型号为虚构）。
 * 电路：PMU 工作在 FVMI 模式，经线缆与源内阻 R_S 把电压 V_force 加到 DUT 引脚，
 * 引脚旁有去耦电容 C 到地。PMU 量到的电流 = DUT 稳态电流 + 给 C 充电的瞬态电流。
 *   瞬态：I_tr(t) = (V / R_S) · e^(−t / τ)，τ = R_S · C
 *   读数：I_read(t) = I_steady + I_tr(t)
 * 单位：电压 V，电流 µA，时间 ms，电阻 kΩ，电容 nF（kΩ·nF = µs，所以 τ 要乘 1e−3 换算成 ms）。
 * 稳态电流随电压按线性缩放，这是为了讲清“条件不符”的道理而做的简化，不代表真实器件。
 */

export type MeasureKind = 'leak' | 'iq'
/** 显示顺序就是数组顺序；默认值一律取 [0] */
export const KIND_IDS: MeasureKind[] = ['leak', 'iq']

export type DutId = 'healthy' | 'edge' | 'fault'
export const DUT_IDS: DutId[] = ['healthy', 'edge', 'fault']

/** 规格条件：5.0 V Force。条件不同，结果不能用来判这条规格 */
export const V_SPEC = 5.0
/** 允许的电压偏差，V */
export const V_TOL = 0.05
/** 规格限值，µA（5.0 V 下） */
export const SPEC_UA: Record<MeasureKind, number> = { leak: 10, iq: 50 }
/** 仪器不确定度，µA（示意） */
export const U_INST_UA = 1
/** 残余瞬态小于它才算“稳定”，µA */
export const SETTLE_TOL_UA = 1

/** 线缆与源内阻，kΩ（示意） */
export const R_S_KOHM = 100
/** 引脚去耦电容，nF（示意） */
export const C_DEC_NF = 10
/** 时间常数 τ = R_S · C，ms；100 kΩ × 10 nF = 1 ms */
export const TAU_MS = (R_S_KOHM * C_DEC_NF) / 1000

/** 三颗虚构的 DUT 在 5.0 V 下的稳态电流，µA：健康件、边缘件、故障件 */
export const DUTS: Record<DutId, Record<MeasureKind, number>> = {
  healthy: { leak: 2.0, iq: 6.0 },
  edge: { leak: 7.5, iq: 47.0 },
  fault: { leak: 33.0, iq: 130.0 },
}

export type LeakState = {
  mode: MeasureKind
  dut: DutId
  /** Force 电压，V */
  vForce: number
  /** 加压后等待的时间，ms */
  settleMs: number
  /** 保护带，µA：测试限值 = 规格 − 保护带 */
  guard: number
}

export const DEFAULT_LEAK: LeakState = {
  mode: KIND_IDS[0],
  dut: DUT_IDS[0],
  vForce: V_SPEC,
  settleMs: 0,
  guard: 0,
}

/** 稳态电流，µA：DUT 自身的漏电或静态电流，按电压线性缩放（示意） */
export function steadyUa(mode: MeasureKind, dut: DutId, vForce: number): number {
  return DUTS[dut][mode] * (vForce / V_SPEC)
}

/** 充电瞬态，µA：初值 V / R_S（V/kΩ = mA，乘 1000 得 µA），按 e^(−t/τ) 衰减 */
export function transientUa(vForce: number, tMs: number): number {
  const i0 = (vForce / R_S_KOHM) * 1000
  return i0 * Math.exp(-tMs / TAU_MS)
}

/** 仪器在 tMs 时刻读到的电流，µA */
export function readingUa(mode: MeasureKind, dut: DutId, vForce: number, tMs: number): number {
  return steadyUa(mode, dut, vForce) + transientUa(vForce, tMs)
}

/** 残余瞬态降到 SETTLE_TOL_UA 所需的时间，ms：t = τ · ln(I0 / tol) */
export function settleNeededMs(vForce: number): number {
  const i0 = (vForce / R_S_KOHM) * 1000
  if (i0 <= SETTLE_TOL_UA) {
    return 0
  }
  return TAU_MS * Math.log(i0 / SETTLE_TOL_UA)
}

/** 测试限值，µA = 规格 − 保护带 */
export function limitUa(mode: MeasureKind, guard: number): number {
  return SPEC_UA[mode] - guard
}

export type LeakResult = {
  spec: number
  limit: number
  /** 稳态电流（真值），µA */
  steady: number
  /** 当前时刻的瞬态残余，µA */
  transient: number
  /** 仪器读数，µA */
  reading: number
  /** 残余降到容差所需时间，ms */
  needMs: number
  settled: boolean
  vOk: boolean
  pass: boolean
}

export function judge(state: LeakState): LeakResult {
  const spec = SPEC_UA[state.mode]
  const limit = limitUa(state.mode, state.guard)
  const steady = steadyUa(state.mode, state.dut, state.vForce)
  const transient = transientUa(state.vForce, state.settleMs)
  const reading = steady + transient
  return {
    spec,
    limit,
    steady,
    transient,
    reading,
    needMs: settleNeededMs(state.vForce),
    settled: transient <= SETTLE_TOL_UA,
    vOk: Math.abs(state.vForce - V_SPEC) <= V_TOL,
    pass: reading <= limit,
  }
}

/**
 * PMU / SMU 的仪器模型（教学示意，不对应某一颗具体型号）。
 * 一个通道二选一：FVMI（加压测流）或 FIMV（加流测压）。没有被强制的那个量由限值（Compliance）钳住。
 * DUT 管脚用三个元件示意：对地的等效电阻、到 VSS 的保护二极管，以及“开路”（没有任何通路）。
 * 所有数值都是示意，不是某颗芯片的规格。
 */

export type SmuMode = 'fvmi' | 'fimv'
export type DutKind = 'good' | 'overcurrent' | 'open' | 'short'

/** 开短路判据的结论：pass 连通，open 开路，short 短路，limit 限值太低导致撞限，sign 电流方向不对，other 其它 */
export type ContinuityJudge = 'pass' | 'open' | 'short' | 'limit' | 'sign' | 'other'

/** 选项数组的顺序就是显示顺序；默认值一律取 [0] */
export const MODES: SmuMode[] = ['fvmi', 'fimv']
export const DUT_KINDS: DutKind[] = ['good', 'overcurrent', 'open', 'short']
/** FVMI 的电流限值选项，A */
export const I_LIMIT_PRESETS: number[] = [1e-3, 1e-2, 1e-1]
/** FIMV 的电压限值选项，V */
export const V_LIMIT_PRESETS: number[] = [3, 1, 0.5]
/** FIMV 的强制电流选项，A；负值表示电流从管脚灌出，开短路测试用 −100 µA */
export const I_FORCE_PRESETS: number[] = [-1e-4, 1e-4, -1e-3]

export type SmuState = {
  mode: SmuMode
  /** FVMI 时强制的电压，V */
  vForce: number
  /** FIMV 时强制的电流，A */
  iForce: number
  /** FVMI 的电流限值，A（取正值） */
  iLimit: number
  /** FIMV 的电压限值，V（取正值） */
  vLimit: number
  dut: DutKind
}

export const DEFAULT_SMU: SmuState = {
  mode: MODES[0],
  vForce: 1,
  iForce: I_FORCE_PRESETS[0],
  iLimit: I_LIMIT_PRESETS[0],
  vLimit: V_LIMIT_PRESETS[0],
  dut: DUT_KINDS[0],
}

/** 好脚对地的等效电阻（示意）：加压时只有极小的漏电 */
export const R_GOOD = 1e6
/** 过流器件对地的等效电阻（示意）：加 1 V 时约 50 mA */
export const R_OVERCURRENT = 20
/** 短路对地的等效电阻（示意） */
export const R_SHORT = 2
/** 保护二极管的正向压降，V（示意） */
export const VD_FWD = 0.65
/** 二极管导通后的串联电阻，Ω（示意）：只决定导通后压降随电流增加多少 */
export const R_ON = 1

/** 开短路判据：好脚在 −100 µA 下的压降应落在 [CONT_LOW, CONT_HIGH] 之内，V */
export const CONT_CURRENT = -1e-4
export const CONT_LOW = -0.9
export const CONT_HIGH = -0.3
/** 电压限值至少要比好脚的压降高出余量，V：低于它，好脚也会撞限 */
export const SAFE_VLIMIT = 1

export type SmuResult = {
  /** 理想读数：不设限值时仪器本该读到的量（FVMI 为电流 A，FIMV 为电压 V）；FIMV 开路时没有有限值，为 null */
  ideal: number | null
  /** 仪器显示的读数：撞限时就是限值 */
  reading: number
  /** 管脚实际电压，V */
  pinVoltage: number
  /** 管脚实际电流，A（流进 DUT 为正） */
  pinCurrent: number
  /** 是否撞限 */
  compliance: boolean
}

/** DUT 对地的等效电阻；开路时没有通路，返回 null */
export function dutResistance(dut: DutKind): number | null {
  if (dut === 'open') {
    return null
  }
  if (dut === 'overcurrent') {
    return R_OVERCURRENT
  }
  if (dut === 'short') {
    return R_SHORT
  }
  return R_GOOD
}

/** 保护二极管从 VSS 流进管脚的电流（A）：只在管脚电压低于 −VD_FWD 时导通 */
function diodeInflow(voltage: number): number {
  return Math.max(0, -VD_FWD - voltage) / R_ON
}

/** 管脚电压为 V 时，PMU 需要灌入管脚的电流（A，流进 DUT 为正）：电阻支路 V/R，减去二极管补进来的电流 */
export function pinCurrentAt(voltage: number, r: number): number {
  return voltage / r - diodeInflow(voltage)
}

/**
 * PMU 灌入电流为 I 时的管脚电压（V）。
 * 二极管不导通时 V = I·R；导通后解 I = V/R + (V + VD)/R_ON，得 V = (I − VD/R_ON) / (1/R + 1/R_ON)。
 * 两段在 V = −VD 处连续。
 */
export function pinVoltageAt(current: number, r: number): number {
  const linear = current * r
  if (linear >= -VD_FWD) {
    return linear
  }
  return (current - VD_FWD / R_ON) / (1 / r + 1 / R_ON)
}

function measureFvmi(state: SmuState, r: number | null): SmuResult {
  if (r === null) {
    return { ideal: 0, reading: 0, pinVoltage: state.vForce, pinCurrent: 0, compliance: false }
  }
  const ideal = pinCurrentAt(state.vForce, r)
  if (Math.abs(ideal) > state.iLimit) {
    const reading = Math.sign(ideal) * state.iLimit
    return { ideal, reading, pinVoltage: pinVoltageAt(reading, r), pinCurrent: reading, compliance: true }
  }
  return { ideal, reading: ideal, pinVoltage: state.vForce, pinCurrent: ideal, compliance: false }
}

function measureFimv(state: SmuState, r: number | null): SmuResult {
  const sign = Math.sign(state.iForce)
  if (r === null) {
    const clamp = sign * state.vLimit
    return { ideal: null, reading: clamp, pinVoltage: clamp, pinCurrent: 0, compliance: true }
  }
  const ideal = pinVoltageAt(state.iForce, r)
  if (Math.abs(ideal) > state.vLimit) {
    const reading = Math.sign(ideal) * state.vLimit
    return { ideal, reading, pinVoltage: reading, pinCurrent: pinCurrentAt(reading, r), compliance: true }
  }
  return { ideal, reading: ideal, pinVoltage: ideal, pinCurrent: state.iForce, compliance: false }
}

/** 一次测量：理想值、限值钳位后的读数，以及管脚上真实的电压和电流 */
export function smuMeasure(state: SmuState): SmuResult {
  const r = dutResistance(state.dut)
  return state.mode === 'fvmi' ? measureFvmi(state, r) : measureFimv(state, r)
}

/**
 * FIMV 灌入 −100 µA 时的开短路判据。
 * 撞限时：电压限值 ≥ SAFE_VLIMIT 才判开路，否则是限值太低造成的误判。
 * 未撞限时：读数落在 [CONT_LOW, CONT_HIGH] 判连通；比 CONT_HIGH 更接近 0 V 判短路。
 */
export function continuityJudge(state: SmuState, result: SmuResult): ContinuityJudge {
  if (state.mode === 'fvmi') {
    return 'other'
  }
  if (state.iForce > 0) {
    return 'sign'
  }
  if (result.compliance) {
    return state.vLimit >= SAFE_VLIMIT ? 'open' : 'limit'
  }
  if (result.reading > CONT_HIGH) {
    return 'short'
  }
  if (result.reading >= CONT_LOW) {
    return 'pass'
  }
  return 'other'
}

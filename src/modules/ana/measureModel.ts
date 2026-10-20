/**
 * 「电压、电流与测量基础」的仪器模型（教学示意，不对应某个具体型号）。
 * 只抓三件事：Force 哪个量、Measure 哪个量、接法（2 线 / 4 线）引入的导线电阻。
 * 再加一条示意规格：误差带 = ±(0.1% × 读数 + 0.05% × 量程)。
 */

export type MeasureMode = 'forceV' | 'forceI'
export type WireMode = 'two' | 'four'

export type MeasureState = {
  mode: MeasureMode
  /** Force V 模式下施加的电压，V */
  vForce: number
  /** Force I 模式下施加的电流，A */
  iForce: number
  /** DUT 电阻，Ω */
  rDut: number
  /** Force V 模式下测电流用的量程（满量程，A） */
  iRange: number
  /** Force I 模式下测电压用的量程（满量程，V） */
  vRange: number
  wires: WireMode
}

/** 各选项的显示顺序就是数组顺序；默认值一律取 [0]，与界面约定「初始选中排在最前面的一个」一致 */
export const I_RANGES: number[] = [1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1]
export const V_RANGES: number[] = [0.2, 2, 20]
export const R_PRESETS: number[] = [100, 1e3, 1e4, 1e5, 1e6]
export const I_FORCE_PRESETS: number[] = [1e-4, 1e-3, 1e-2]

export const DEFAULT_STATE: MeasureState = {
  mode: 'forceV',
  vForce: 1,
  iForce: I_FORCE_PRESETS[0],
  rDut: R_PRESETS[0],
  iRange: I_RANGES[0],
  vRange: V_RANGES[0],
  wires: 'two',
}

/** 误差带的读数项（相对读数） */
export const ACC_REL = 0.001
/** 误差带的量程项（相对满量程） */
export const ACC_RNG = 0.0005
/** 每根导线的电阻，Ω（示意值） */
export const LEAD_OHM = 0.5
/** 测试限值，单位 %：误差带和接法误差都要在它以内 */
export const LIMIT_PCT = 0.3

export type MeasureResult = {
  /** 理想值：没有导线、没有仪器误差时的量（Force V 时是电流，Force I 时是电压） */
  ideal: number
  /** 仪器显示的读数（含导线电阻的影响） */
  reading: number
  /** 所选量程的满量程 */
  range: number
  /** 读数超出满量程，仪器显示 OVR */
  overrange: boolean
  /** 仪器误差带（±），与 reading 同单位 */
  band: number
  /** 误差带占读数的百分比 */
  bandPct: number
  /** 导线引起的误差，相对理想值，单位 % */
  setupPct: number
  /** 三项都在限值内才 PASS */
  pass: boolean
}

/** 回路总电阻：2 线时两根导线都串进回路；4 线 Kelvin 时感测线不通过电流，导线不计入 */
export function loopResistance(rDut: number, wires: WireMode): number {
  return wires === 'two' ? rDut + 2 * LEAD_OHM : rDut
}

export function instrumentBand(reading: number, range: number): number {
  return ACC_REL * Math.abs(reading) + ACC_RNG * range
}

export function measure(state: MeasureState): MeasureResult {
  const isV = state.mode === 'forceV'
  const rLoop = loopResistance(state.rDut, state.wires)
  const ideal = isV ? state.vForce / state.rDut : state.iForce * state.rDut
  const reading = isV ? state.vForce / rLoop : state.iForce * rLoop
  const range = isV ? state.iRange : state.vRange
  const band = instrumentBand(reading, range)
  const overrange = Math.abs(reading) > range
  const bandPct = reading === 0 ? 0 : (band / Math.abs(reading)) * 100
  const setupPct = ideal === 0 ? 0 : ((reading - ideal) / Math.abs(ideal)) * 100
  const pass = !overrange && bandPct <= LIMIT_PCT && Math.abs(setupPct) <= LIMIT_PCT
  return { ideal, reading, range, overrange, band, bandPct, setupPct, pass }
}

/** 同一套设置，只换这一次测量用的量程 */
export function measureOnRange(state: MeasureState, range: number): MeasureResult {
  return measure(state.mode === 'forceV' ? { ...state, iRange: range } : { ...state, vRange: range })
}

const PREFIXES: Array<[number, string]> = [
  [1, ''],
  [1e-3, 'm'],
  [1e-6, 'µ'],
  [1e-9, 'n'],
]

/** 带 SI 前缀的显示，三位有效数字，例如 99.99 µA → "100 µA" */
export function fmtSI(value: number, unit: string): string {
  const abs = Math.abs(value)
  if (abs === 0) {
    return `0 ${unit}`
  }
  for (const [scale, prefix] of PREFIXES) {
    if (abs >= scale) {
      return `${(value / scale).toPrecision(3)} ${prefix}${unit}`
    }
  }
  return `${value.toExponential(2)} ${unit}`
}

/** 百分比显示，正负号都写出来，便于看出偏高还是偏低 */
export function fmtPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

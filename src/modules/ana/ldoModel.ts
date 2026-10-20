/**
 * 「LDO 测试」的器件模型：虚构器件 VDUT-LDO1，数值为教学示意，不对应任何真实芯片。
 * 标称输出 3.3 V，四个指标各由一个参数决定：
 * - 线性调整率：Vout 对 Vin 的斜率 K_LINE，与负载无关；
 * - 负载调整率：Vout 对 Iload 的割线斜率。小电流段斜率为 R0，大电流段多一个二次项 C2·I²，
 *   所以负载越大割线斜率越陡（输出级的等效电阻随电流增大）；
 * - 静态电流 Iq：空载时 LDO 自身的耗电，固定为 IQ_UA；
 * - PSRR：低频为 PSRR_P0，超过拐点 PSRR_FP 后按 −20 dB/十倍频下降。
 * 单位：电压用 V，电流内部用 A。1 mV/mA = 1 Ω，所以割线斜率的数值直接就是 mV/mA。
 */

export const V_NOM = 3.3
export const VIN_NOM = 5.0
export const VIN_LO = 4.0
export const VIN_MIN = 4.5
export const VIN_MAX = 5.5
/** 参考负载 1 mA，A */
export const I_REF = 0.001
/** 本颗器件在 5.0 V、1 mA 下的实际输出，V（相对标称约 +0.9%） */
export const V_SET_ACT = 3.33
/** 线性调整率 1.2 mV/V，即 K_LINE = 0.0012 V/V */
export const K_LINE = 0.0012
/** 小电流段的等效输出电阻，Ω */
export const R0 = 0.04
/** 大电流段二次项系数，V/A² */
export const C2 = 0.35
/** 静态电流，µA（示意） */
export const IQ_UA = 45
/** Vin 上叠加的纹波峰值，V */
export const RIPPLE_VPK = 0.05
/** 低频 PSRR，dB */
export const PSRR_P0 = 70
/** PSRR 开始下降的拐点频率，Hz */
export const PSRR_FP = 1e3

/** 限值（示意） */
export const ACC_LIMIT_PCT = 2
export const LINE_LIMIT = 2
export const LOAD_LIMIT = 0.1
export const IQ_LIMIT_UA = 60

/** 负载点，mA：数组顺序就是显示顺序 */
export const LOAD_PRESETS_MA: number[] = [50, 100, 150, 200]

export type PsrrPoint = { hz: number; limitDb: number }
/** 纹波频率与各自的 PSRR 限值：顺序即显示顺序 */
export const PSRR_POINTS: PsrrPoint[] = [
  { hz: 1e3, limitDb: 60 },
  { hz: 1e4, limitDb: 45 },
  { hz: 1e5, limitDb: 35 },
]

export type LdoState = {
  /** Vin，V，测试范围 VIN_MIN ~ VIN_MAX */
  vin: number
  /** 负载电流，mA */
  iloadMa: number
  /** 纹波频率，Hz */
  freqHz: number
}

export const DEFAULT_LDO: LdoState = {
  vin: VIN_NOM,
  iloadMa: LOAD_PRESETS_MA[0],
  freqHz: PSRR_POINTS[0].hz,
}

/** 输出电压，V。iloadA 为负载电流，A */
export function voutOf(vin: number, iloadA: number): number {
  return V_SET_ACT + K_LINE * (vin - VIN_NOM) - R0 * iloadA - C2 * iloadA * iloadA
}

/** 线性调整率，mV/V：负载固定 1 mA，Vin 从 VIN_LO 变到 vin（vin 必须大于 VIN_LO） */
export function lineRegMvPerV(vin: number): number {
  return ((voutOf(vin, I_REF) - voutOf(VIN_LO, I_REF)) / (vin - VIN_LO)) * 1000
}

/** 负载调整率，mV/mA：Vin 固定，负载从 1 mA 变到 iloadMa 的割线斜率 */
export function loadRegMvPerMa(vin: number, iloadMa: number): number {
  const iA = iloadMa / 1000
  return (voutOf(vin, I_REF) - voutOf(vin, iA)) / (iA - I_REF)
}

/** 输出精度，%：相对标称 V_NOM，条件为当前 Vin、1 mA */
export function accuracyPct(vin: number): number {
  return ((voutOf(vin, I_REF) - V_NOM) / V_NOM) * 100
}

/** PSRR，dB：PSRR_P0 − 10·log10(1 + (f/fp)²) */
export function psrrDb(freqHz: number): number {
  return PSRR_P0 - 10 * Math.log10(1 + (freqHz / PSRR_FP) ** 2)
}

/** 由 PSRR 反算出的 Vout 纹波峰值，V：Vin 纹波 × 10^(−PSRR/20) */
export function voutRippleV(freqHz: number): number {
  return RIPPLE_VPK * 10 ** (-psrrDb(freqHz) / 20)
}

/** 某个纹波频率的 PSRR 限值，dB；频率不在 PSRR_POINTS 里时返回 NaN */
export function psrrLimitDb(freqHz: number): number {
  const point = PSRR_POINTS.find((p) => p.hz === freqHz)
  return point ? point.limitDb : Number.NaN
}

export type LdoResult = {
  /** Vout @ VIN_LO、1 mA，V */
  voutLo: number
  /** Vout @ 当前 Vin、1 mA，V */
  voutVin: number
  lineMvPerV: number
  accPct: number
  loadMvPerMa: number
  psrrDb: number
  psrrLimitDb: number
  accPass: boolean
  linePass: boolean
  loadPass: boolean
  iqPass: boolean
  psrrPass: boolean
  /** 五项都在限值内才 PASS */
  pass: boolean
}

export function ldoResult(state: LdoState): LdoResult {
  const lineMvPerV = lineRegMvPerV(state.vin)
  const accPct = accuracyPct(state.vin)
  const loadMvPerMa = loadRegMvPerMa(state.vin, state.iloadMa)
  const psrr = psrrDb(state.freqHz)
  const limit = psrrLimitDb(state.freqHz)
  const accPass = Math.abs(accPct) <= ACC_LIMIT_PCT
  const linePass = Math.abs(lineMvPerV) <= LINE_LIMIT
  const loadPass = Math.abs(loadMvPerMa) <= LOAD_LIMIT
  const iqPass = IQ_UA <= IQ_LIMIT_UA
  const psrrPass = psrr >= limit
  return {
    voutLo: voutOf(VIN_LO, I_REF),
    voutVin: voutOf(state.vin, I_REF),
    lineMvPerV,
    accPct,
    loadMvPerMa,
    psrrDb: psrr,
    psrrLimitDb: limit,
    accPass,
    linePass,
    loadPass,
    iqPass,
    psrrPass,
    pass: accPass && linePass && loadPass && iqPass && psrrPass,
  }
}

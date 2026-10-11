/**
 * IDDQ 教学模型（纯函数，无 React、无文案）。
 * 数值仅为教学示例，不代表任何具体芯片的真实规格。
 *
 * 读数 = 量程量化( 正常漏电(VDD, 向量) + 缺陷电流(DUT, VDD, 向量) + 充电瞬态(VDD, 等待时间) )
 * 判定顺序：超 Abs Max → 中止；未上电 / VDD 过低 → 无效；DPS 限流 → 无效；超量程 → 无效；否则和上限比。
 */

export const IDDQ_SPEC = {
  /** 规格条件：VDD = 1.8 V（±10%） */
  vddNom: 1.8,
  vddMin: 1.62,
  vddMax: 1.98,
  /** 绝对最大额定值：测试机拒绝施加更高的电压 */
  absMax: 2.0,
  /** 低于这个电压，内部逻辑保持不住向量给的状态 */
  vddLogicMin: 0.9,
  /** 低于这个电压视为没上电 */
  vddOff: 0.05,
  /** 默认上限 */
  limitUa: 100,
}

/** 正常芯片在 1.8 V、Vector 1 下的静态漏电（µA） */
export const LEAK_NOM_UA = 24
/** 漏电随 VDD 的指数斜率（V）：I ∝ (VDD/1.8)·exp((VDD−1.8)/0.6) */
export const LEAK_SLOPE_V = 0.6
/** 栅氧漏电：VDD 到 GND 之间的等效电阻（Ω），每个向量都在 */
export const R_GOX = 11.9e3
/** 桥接缺陷：节点 A、B 之间的桥接电阻和两侧驱动管的导通电阻（Ω） */
export const R_BRIDGE = 10e3
export const R_ON_P = 1e3
export const R_ON_N = 1e3
/** 施加向量后电源去耦电容和内部节点的充电电流：初值（1.8 V 时，µA）和时间常数（ms） */
export const TRANSIENT_UA = 2000
export const TAU_MS = 0.5
/** 显示分辨率 = 量程 / 1000（教学取值） */
export const RES_DIV = 1000

export type DutId = 'good' | 'gox' | 'bridge'
export type VectorId = 'v1' | 'v2' | 'v3' | 'v4'
export type RangeId = 'auto' | 'r10u' | 'r100u' | 'r1m' | 'r10m'

/** 每个静态向量把内部节点 A、B 置成的逻辑值，以及这个状态下正常漏电的相对大小 */
export const VECTOR_STATE: Record<VectorId, { a: 0 | 1; b: 0 | 1; leakFactor: number }> = {
  v1: { a: 0, b: 0, leakFactor: 1.0 },
  v2: { a: 1, b: 0, leakFactor: 1.04 },
  v3: { a: 0, b: 1, leakFactor: 0.96 },
  v4: { a: 1, b: 1, leakFactor: 1.02 },
}
export const VECTOR_IDS: VectorId[] = ['v1', 'v2', 'v3', 'v4']

/** 固定量程的满量程值（µA） */
export const RANGE_UA: Record<Exclude<RangeId, 'auto'>, number> = {
  r10u: 10,
  r100u: 100,
  r1m: 1000,
  r10m: 10000,
}
const FIXED_RANGES = (Object.keys(RANGE_UA) as Array<Exclude<RangeId, 'auto'>>).sort((a, b) => RANGE_UA[a] - RANGE_UA[b])

export type IddqConfig = {
  dut: DutId
  vdd: number
  vector: VectorId
  settleMs: number
  range: RangeId
  /** DPS 电流钳位（µA） */
  clampUa: number
  limitUa: number
}

export type IddqStatus = 'pass' | 'fail' | 'invalid' | 'abort'
export type IddqReason = 'ok' | 'absmax' | 'nopower' | 'lowvdd' | 'clamp' | 'overrange'

export type IddqResult = {
  status: IddqStatus
  reason: IddqReason
  /** 模型拆解（µA） */
  normalUa: number
  defectUa: number
  transientUa: number
  /** 测量时刻流过 VDD 的真实电流 */
  trueUa: number
  /** 实际使用的量程（µA）；中止时为 0 */
  rangeUa: number
  resolutionUa: number
  /** 显示读数；无效或中止时为 null */
  readingUa: number | null
  /** 缺陷在这个向量下是否被激活 */
  defectActive: boolean
  /** VDD 不在规格条件 1.62–1.98 V */
  offSpec: boolean
  /** 瞬态残余大到读数看得出来 */
  unsettled: boolean
  /** 量程太大：分辨率超过上限的 1/20 */
  coarse: boolean
}

export function normalLeakUa(vdd: number, vector: VectorId): number {
  if (vdd <= 0) return 0
  const { vddNom } = IDDQ_SPEC
  return LEAK_NOM_UA * VECTOR_STATE[vector].leakFactor * (vdd / vddNom) * Math.exp((vdd - vddNom) / LEAK_SLOPE_V)
}

export function defectActive(dut: DutId, vector: VectorId): boolean {
  if (dut === 'gox') return true
  if (dut === 'bridge') return VECTOR_STATE[vector].a !== VECTOR_STATE[vector].b
  return false
}

/** 缺陷电流（µA）：栅氧漏电 = VDD / R_GOX；桥接 = VDD / (R_ON_P + R_BRIDGE + R_ON_N)，只在 A ≠ B 时有压差 */
export function defectUa(dut: DutId, vdd: number, vector: VectorId): number {
  if (vdd <= 0 || !defectActive(dut, vector)) return 0
  if (dut === 'gox') return (vdd / R_GOX) * 1e6
  return (vdd / (R_ON_P + R_BRIDGE + R_ON_N)) * 1e6
}

/** 测量时刻还没衰减完的充电电流（µA）：I0·(VDD/1.8)·exp(−t/τ) */
export function transientUa(vdd: number, settleMs: number): number {
  if (vdd <= 0) return 0
  return TRANSIENT_UA * (vdd / IDDQ_SPEC.vddNom) * Math.exp(-Math.max(settleMs, 0) / TAU_MS)
}

/** 自动量程：选能装下读数的最小量程；装不下返回最大量程 */
export function autoRange(ua: number): number {
  for (const id of FIXED_RANGES) if (ua <= RANGE_UA[id]) return RANGE_UA[id]
  return RANGE_UA[FIXED_RANGES[FIXED_RANGES.length - 1]]
}

export function quantize(ua: number, resolutionUa: number): number {
  return Math.round(ua / resolutionUa) * resolutionUa
}

export function runIddq(cfg: IddqConfig): IddqResult {
  const { absMax, vddOff, vddLogicMin, vddMin, vddMax } = IDDQ_SPEC
  const normal = normalLeakUa(cfg.vdd, cfg.vector)
  const defect = defectUa(cfg.dut, cfg.vdd, cfg.vector)
  const transient = transientUa(cfg.vdd, cfg.settleMs)
  const trueUa = normal + defect + transient
  const rangeUa = cfg.range === 'auto' ? autoRange(trueUa) : RANGE_UA[cfg.range]
  const resolutionUa = rangeUa / RES_DIV
  const base = {
    normalUa: normal,
    defectUa: defect,
    transientUa: transient,
    trueUa,
    rangeUa,
    resolutionUa,
    defectActive: defectActive(cfg.dut, cfg.vector),
    offSpec: cfg.vdd < vddMin - 1e-9 || cfg.vdd > vddMax + 1e-9,
    unsettled: transient >= resolutionUa / 2 && transient >= 0.01 * (normal + defect),
    coarse: resolutionUa > cfg.limitUa / 20,
  }
  const invalid = (status: IddqStatus, reason: IddqReason): IddqResult => ({ ...base, status, reason, readingUa: null })

  if (cfg.vdd > absMax + 1e-9) return { ...invalid('abort', 'absmax'), rangeUa: 0, resolutionUa: 0 }
  if (cfg.vdd < vddOff) return invalid('invalid', 'nopower')
  if (cfg.vdd < vddLogicMin) return invalid('invalid', 'lowvdd')
  if (trueUa > cfg.clampUa) return invalid('invalid', 'clamp')
  if (trueUa > rangeUa) return invalid('invalid', 'overrange')

  const readingUa = quantize(trueUa, resolutionUa)
  return { ...base, status: readingUa <= cfg.limitUa ? 'pass' : 'fail', reason: 'ok', readingUa }
}

/** 按分辨率决定读数显示几位小数 */
export function decimalsFor(resolutionUa: number): number {
  if (resolutionUa <= 0) return 1
  return Math.max(0, Math.min(3, Math.ceil(-Math.log10(resolutionUa) - 1e-9)))
}

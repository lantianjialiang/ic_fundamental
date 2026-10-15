// 本课所有数值都从这里的公式算出来，页面和图只读结果

export const OZ_MIL = 1.378
export const MM_PER_MIL = 0.0254
export const CU_RHO = 1.72e-8 // 铜电阻率 Ω·m（20 °C）

export type LayerKind = 'ext' | 'int'
export const K_LAYER: Record<LayerKind, number> = { ext: 0.048, int: 0.024 }

export const milToMm = (mil: number) => mil * MM_PER_MIL
export const mmToMil = (mm: number) => mm / MM_PER_MIL

/** IPC-2221：I = k·ΔT^0.44·A^0.725（A 单位 mil²）→ 所需截面积 */
export function areaMil2ForCurrent(amp: number, dT: number, layer: LayerKind) {
  return Math.pow(amp / (K_LAYER[layer] * Math.pow(dT, 0.44)), 1 / 0.725)
}

export function widthMilForCurrent(amp: number, dT: number, oz: number, layer: LayerKind) {
  return areaMil2ForCurrent(amp, dT, layer) / (oz * OZ_MIL)
}

export function currentForWidthMil(widthMil: number, dT: number, oz: number, layer: LayerKind) {
  const area = widthMil * oz * OZ_MIL
  return K_LAYER[layer] * Math.pow(dT, 0.44) * Math.pow(area, 0.725)
}

/** 一段铜线的直流电阻（Ω） */
export function traceResistance(widthMm: number, oz: number, lengthMm: number) {
  const thick = oz * OZ_MIL * 25.4e-6
  return (CU_RHO * lengthMm * 1e-3) / (widthMm * 1e-3 * thick)
}

/* ---------- 间距 ---------- */

// IPC-2221 表 6-1，B2 列（外层、无涂覆、海拔 ≤ 3050 m），按电压段取下限
const SPACING_BANDS: Array<{ upTo: number; mm: number }> = [
  { upTo: 30, mm: 0.1 },
  { upTo: 150, mm: 0.6 },
  { upTo: 300, mm: 1.25 },
  { upTo: 500, mm: 2.5 },
]

export function ipcSpacingMm(volt: number) {
  for (const band of SPACING_BANDS) {
    if (volt <= band.upTo) {
      return band.mm
    }
  }
  return 2.5 + 0.005 * (volt - 500)
}

export const GROOVE_MIN_MM = 1.0 // 污染等级 2 下，槽宽至少 1 mm 才算数
export const GROOVE_DEPTH_MM = 1.0

export function clearanceCreepage(gap: number, grooved: boolean, grooveWidth: number) {
  const effective = grooved && grooveWidth >= GROOVE_MIN_MM
  return { clearance: gap, creepage: effective ? gap + 2 * GROOVE_DEPTH_MM : gap, effective }
}

/* ---------- 热焊盘 ---------- */

/** 每根辐条按外层 1 oz、ΔT = 20 °C 估算载流，再乘根数 */
export function spokeCurrent(spokeMm: number, count: number) {
  return count * currentForWidthMil(mmToMil(spokeMm), 20, 1, 'ext')
}

/* ---------- 微带线阻抗（IPC-2141） ---------- */

export const T_1OZ_MM = 0.035

export function microstripZ0(er: number, h: number, w: number, t = T_1OZ_MM) {
  const z = (87 / Math.sqrt(er + 1.41)) * Math.log((5.98 * h) / (0.8 * w + t))
  return Math.max(0, z)
}

/** IPC-2141 公式常引用的适用范围：0.1 < w/h < 2.0，1 < Er < 15 */
export function microstripValid(er: number, h: number, w: number) {
  const r = w / h
  return r > 0.1 && r < 2 && er > 1 && er < 15
}

export type ZVar = 'h' | 'w' | 'er'

/** 某个量放大 20 % 时 Z0 的变化百分比 */
export function zSensitivity(er: number, h: number, w: number, v: ZVar) {
  const base = microstripZ0(er, h, w)
  const next = microstripZ0(v === 'er' ? er * 1.2 : er, v === 'h' ? h * 1.2 : h, v === 'w' ? w * 1.2 : w)
  return ((next - base) / base) * 100
}

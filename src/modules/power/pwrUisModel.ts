/**
 * PWR-06 雪崩（UIS）、SOA 与热阻的教学模型。
 * UIS 的能量、雪崩时间与波形直接用 core/power.ts；热阻直接用 core/thermal.ts，这里不重复实现。
 * 本文件只新增：SOA 的四条边界（soaLimit）与 SOA 用的热阻网络。
 * 虚构器件 VDUT-MOS1（教学示意）：BV = 100 V，Rds(on) 25 °C = 5 mΩ，Rth = 0.5 K/W，τ = 5 ms。
 */
import { avalancheTime, demoMos, easJ, ipkForEnergy, rdsOn, uisWaveform } from './core/power'
import { pulseHeating, zth, type ZthModel } from './core/thermal'

export type UisState = {
  /** 负载电感 L（mH） */
  lMh: number
  /** 雪崩前的峰值电流 Ipk（A） */
  ipk: number
  /** 母线电压 Vdd（V） */
  vdd: number
  /** 器件击穿电压 BVdss（V） */
  bv: number
  /** 器件额定雪崩能量 E_AS（J） */
  ratedE: number
}

/** 默认：Ipk = 5 A、额定 0.2 J，便于拨到 T1 与 T2 的目标值 */
export const UIS_DEFAULT: UisState = { lMh: 1, ipk: 5, vdd: 50, bv: 100, ratedE: 0.2 }

export type UisResult = {
  valid: boolean
  eas: number
  tav: number
  ipkMax: number
  pass: boolean
  wave: { t: number[]; id: number[]; vds: number[] }
  /** 雪崩时间内 Vds 被钳位在 BV；这段的结束时刻（s） */
  clampEnd: number
}

/** UIS 仿真：先检查 Vdd < BV（否则雪崩能量无定义），再算 E_AS、t_av、额定下的最大 Ipk 与 Pass / Fail */
export function simulateUis(s: UisState): UisResult {
  const l = s.lMh * 1e-3
  const valid = s.vdd < s.bv
  if (!valid) {
    return { valid, eas: NaN, tav: NaN, ipkMax: NaN, pass: false, wave: { t: [], id: [], vds: [] }, clampEnd: 0 }
  }
  const eas = easJ(l, s.ipk, s.vdd, s.bv)
  const tav = avalancheTime(l, s.ipk, s.vdd, s.bv)
  const ipkMax = ipkForEnergy(s.ratedE, l, s.vdd, s.bv)
  const wave = uisWaveform({ l, ipk: s.ipk, vdd: s.vdd, bv: s.bv })
  return { valid, eas, tav, ipkMax, pass: eas <= s.ratedE, wave, clampEnd: tav }
}

/* ---------- SOA ---------- */

/** 器件数据（教学示意）：击穿电压取 demoMos 的 BV；热网络为单级 Foster */
const DEV = demoMos()
export const SOA_BV = DEV.bv
export const SOA_ZTH: ZthModel = { stages: [{ rth: 0.5, tau: 5e-3 }] }
/** 最高结温 Tj,max（°C），教学取值 */
export const SOA_TJ_MAX = 150
/** 封装 / 键合线允许的最大电流（A），教学取值 */
export const SOA_IDMAX = 150
/** 短脉冲区的分界：低于它时 Zth 按 √t 近似（教学示意），高于它用 zth() */
export const SOA_TS = 1e-3

/** 脉宽 t 下的热阻抗：t ≥ TS 用 core 的 zth；t < TS 用 Zth ∝ √t，使 P ∝ 1/√t（教学示意） */
export function zthSoa(t: number): number {
  if (t < SOA_TS) {
    return zth(SOA_ZTH, SOA_TS) * Math.sqrt(t / SOA_TS)
  }
  return zth(SOA_ZTH, t)
}

/** 四条边界在某一脉宽、某一 Vds、某一壳温下的允许电流（A） */
export type SoaBounds = { rds: number; max: number; thermal: number; bv: number }

/** Rds(on) 限制：Id = Vds / Rds(on)，Rds(on) 按壳温取值 */
export function rdsLimitId(vds: number, tcase: number): number {
  return vds / rdsOn(DEV, tcase)
}

/** 热限制：dT = Tj,max − Tcase = P·Zth(t)，故 Id = P / Vds = dT / (Zth(t)·Vds) */
export function thermalLimitId(tPulse: number, vds: number, tcase: number): number {
  const dT = SOA_TJ_MAX - tcase
  const p = dT / zthSoa(tPulse)
  return p / vds
}

export function soaBounds(p: { tPulse: number; vds: number; tcase: number }): SoaBounds {
  return {
    rds: rdsLimitId(p.vds, p.tcase),
    max: SOA_IDMAX,
    thermal: thermalLimitId(p.tPulse, p.vds, p.tcase),
    bv: SOA_BV,
  }
}

/** 允许电流：超过击穿电压为 0，否则取 Rds 限、最大电流、热限的最小值 */
export function soaLimit(p: { tPulse: number; vds: number; tcase: number }): number {
  if (p.vds > SOA_BV) {
    return 0
  }
  const b = soaBounds(p)
  return Math.min(b.rds, b.max, b.thermal)
}

/* ---------- SOA 曲线（对数坐标） ---------- */

export const X_MIN = 0.1
export const X_MAX = 200
export const Y_MIN = 0.1
export const Y_MAX = 1000

/** 对数等距采样 */
function logSpace(a: number, b: number, n: number): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i += 1) {
    out.push(a * Math.pow(b / a, i / (n - 1)))
  }
  return out
}

/** 四条边界的采样点 [Vds, Id]；超出坐标范围的点由绘图端断开 */
export function soaCurves(tPulse: number, tcase: number, n = 80): {
  rds: Array<[number, number]>
  max: Array<[number, number]>
  thermal: Array<[number, number]>
  bv: Array<[number, number]>
} {
  const xs = logSpace(X_MIN, SOA_BV, n)
  return {
    rds: xs.map((x) => [x, rdsLimitId(x, tcase)]),
    max: [
      [X_MIN, SOA_IDMAX],
      [SOA_BV, SOA_IDMAX],
    ],
    thermal: xs.map((x) => [x, thermalLimitId(tPulse, x, tcase)]),
    bv: [
      [SOA_BV, Y_MIN],
      [SOA_BV, Y_MAX],
    ],
  }
}

/* ---------- 热阻读数 ---------- */

/** 单级热网络下的 Zth(t) 与脉冲温升：直接用 core/thermal.ts */
export function thermalReadout(pW: number, tPulse: number): { zth: number; dT: number; steadyDT: number } {
  return {
    zth: zth(SOA_ZTH, tPulse),
    dT: pulseHeating(pW, tPulse, SOA_ZTH),
    steadyDT: pW * SOA_ZTH.stages[0].rth,
  }
}

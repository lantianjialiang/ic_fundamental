/**
 * PWR-07 宽禁带器件的教学模型：材料对比、SiC 的 Vth 滞回、GaN 的动态 Rds(on)。
 * 数值全部是教学示意，不对应任何真实器件；界面上用“教学示意 / 教学简化公式”标注。
 */

export type Material = 'si' | 'sic' | 'gan'
export type AppId = 'dcdc' | 'pfc' | 'inverter'
export type WbgTab = 'material' | 'vth' | 'gan'

/** 显示顺序即数组顺序；初始值取 [0] */
export const MATERIAL_ORDER: Material[] = ['si', 'sic', 'gan']
export const APP_ORDER: AppId[] = ['dcdc', 'pfc', 'inverter']
export const WBG_TAB_ORDER: WbgTab[] = ['material', 'vth', 'gan']

/** 每个应用对应的耐压等级（V），教学取值 */
export const APP_BV: Record<AppId, number> = { dcdc: 100, pfc: 650, inverter: 1200 }

/** 禁带宽度 Eg（eV），教学参考值 */
export const EG_EV: Record<Material, number> = { si: 1.12, sic: 3.3, gan: 3.4 }

/** 教学简化：临界击穿场强 Ec 随禁带增大，取 Ec ∝ Eg，以 Si 为 1 */
export function relCritField(m: Material): number {
  return EG_EV[m] / EG_EV.si
}

/** 教学简化公式：R_on,sp ∝ BV^2.5 / Ec^3，以 Si 在 100 V 时为 1 */
export function relSpecificRon(m: Material, bv: number): number {
  return Math.pow(bv / 100, 2.5) / Math.pow(relCritField(m), 3)
}

/* ---------------- SiC 的 Vth 滞回 ---------------- */

/** Vth 中心值（V）、扫描无限慢时的滞回上限 D0（V）、参考扫描速度（V/s） */
export const VTH_V0 = 3
export const VTH_D0 = 0.5
export const VTH_RATE_REF = 1
/** 预置电压上限（V）与预置衰减速率上限（1/ms） */
export const VPRE_MAX = 20
export const VTH_K_MAX = 0.6
/** 教学简化：Id = K·(Vgs − Vth)²，K 单位 mA/V² */
export const K_SQ_MA = 2
/** 恒流读数点（mA）：Id = 1 mA 时的 Vgs 即为读数 Vth */
export const ID_CRIT_MA = 1
/** 单向扫描的电压跨度（V） */
export const SWEEP_SPAN_V = 6

export type VthState = { rate: number; vpre: number; tpre: number }

export type VthResult = {
  /** 正扫与反扫的 Vth 差（V） */
  diff: number
  shiftFwd: number
  shiftRev: number
  /** 1 mA 恒流点读到的正扫、反扫 Vth（V） */
  readFwd: number
  readRev: number
  /** 单向扫描时间（s） */
  sweepS: number
}

/** 扫描造成的滞回量：扫得越慢，陷阱充放电越充分，滞回越大 */
export function sweepDrift(rate: number): number {
  return VTH_D0 / (1 + rate / VTH_RATE_REF)
}

/** 预置衰减速率（1/ms）：预置电压绝对值越高，陷阱被越快地充放 */
export function preDecayPerMs(vpre: number): number {
  return (VTH_K_MAX * Math.max(0, vpre)) / VPRE_MAX
}

/** 教学简化公式：Δ = D(rate) · exp(−k(Vpre) · tpre)，tpre 单位 ms */
export function vthDiff(s: VthState): number {
  const tpre = Math.max(0, s.tpre)
  return sweepDrift(s.rate) * Math.exp(-preDecayPerMs(s.vpre) * tpre)
}

/** 正扫 Vth 偏移 +Δ/2，反扫 −Δ/2；读数取 1 mA 恒流点 */
export function vthAnalysis(s: VthState): VthResult {
  const diff = vthDiff(s)
  const shiftFwd = diff / 2
  const shiftRev = -diff / 2
  const offset = Math.sqrt(ID_CRIT_MA / K_SQ_MA)
  return {
    diff,
    shiftFwd,
    shiftRev,
    readFwd: VTH_V0 + shiftFwd + offset,
    readRev: VTH_V0 + shiftRev + offset,
    sweepS: SWEEP_SPAN_V / s.rate,
  }
}

/** 某个 Vth 偏移下的 Id（mA）：Id = K · max(0, Vgs − Vth_shifted)² */
export function idOfVgs(vgs: number, shift: number): number {
  const vov = vgs - (VTH_V0 + shift)
  return vov > 0 ? K_SQ_MA * vov * vov : 0
}

/* ---------------- GaN 的动态 Rds(on) ---------------- */

/** 静态导通电阻 R0（mΩ）、恢复时间常数 τ（µs）、应力电压参考值（V）、应力时间常数（ms） */
export const GAN_R0_MOHM = 50
export const GAN_TAU_US = 10
export const GAN_VREF = 650
export const GAN_TS_TAU_MS = 0.3

/** 教学简化：应力幅值 k = (Vstress / 650 V) · (1 − e^(−tstress / 0.3 ms))，饱和时 k = 1 */
export function ganK(vs: number, tsMs: number): number {
  const v = Math.min(1, Math.max(0, vs) / GAN_VREF)
  const s = 1 - Math.exp(-Math.max(0, tsMs) / GAN_TS_TAU_MS)
  return v * s
}

/** 教学简化公式：R(t) = R0 · (1 + k · e^(−t/τ))，t 单位 µs */
export function ganRds(k: number, tUs: number): number {
  return GAN_R0_MOHM * (1 + k * Math.exp(-Math.max(0, tUs) / GAN_TAU_US))
}

/** 相对增幅（小数）：R(t)/R0 − 1 = k · e^(−t/τ) */
export function ganIncrease(k: number, tUs: number): number {
  return k * Math.exp(-Math.max(0, tUs) / GAN_TAU_US)
}

/* ---------------- 页面状态与分析 ---------------- */

export type WbgState = {
  tab: WbgTab
  app: AppId
  material: Material
  rate: number
  vpre: number
  tpre: number
  vs: number
  ts: number
  delay: number
}

/** 初始值全部取“第一个选项”或教学默认值；选择组不写死 id */
export const DEFAULT_WBG: WbgState = {
  tab: WBG_TAB_ORDER[0],
  app: APP_ORDER[0],
  material: MATERIAL_ORDER[0],
  rate: 1,
  vpre: 15,
  tpre: 1,
  vs: 300,
  ts: 0.5,
  delay: 10,
}

export type WbgAnalysis = {
  bv: number
  ron: Record<Material, number>
  vth: VthResult
  k: number
  r1: number
  r100: number
  rDelay: number
  inc1: number
  inc100: number
  incDelay: number
}

export function analyseWbg(s: WbgState): WbgAnalysis {
  const bv = APP_BV[s.app]
  const ron: Record<Material, number> = {
    si: relSpecificRon('si', bv),
    sic: relSpecificRon('sic', bv),
    gan: relSpecificRon('gan', bv),
  }
  const vth = vthAnalysis({ rate: s.rate, vpre: s.vpre, tpre: s.tpre })
  const k = ganK(s.vs, s.ts)
  return {
    bv,
    ron,
    vth,
    k,
    r1: ganRds(k, 1),
    r100: ganRds(k, 100),
    rDelay: ganRds(k, s.delay),
    inc1: ganIncrease(k, 1),
    inc100: ganIncrease(k, 100),
    incDelay: ganIncrease(k, s.delay),
  }
}

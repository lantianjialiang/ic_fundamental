import { KN, LAMBDA, VDD, VTN, VTP, nId, pId, rOn } from '../model'

/* ---------- 传输管：片上示意管，全部用 ../model 的共用参数 ---------- */

export type PassDev = 'n' | 'p'
export type PassInput = 'high' | 'low'

/** 时间轴满量程：每 pF 对应的 ns。弱 1 末段按 1/t 贴近，30 ns/pF 时离极限不到 50 mV */
export const PASS_NS_PER_PF = 30
/** 判定「到位」的容差 V */
export const SETTLE_TOL = 0.05

/** 输出节点充放电时流进电容的电流 A（充电为正）。体效应忽略：Vth 固定不变 */
function passCurrent(dev: PassDev, input: PassInput, v: number): number {
  if (dev === 'n') {
    // 栅极接 VDD；NMOS 的源极是电位较低的那一端
    return input === 'high' ? nId(VDD - v, VDD - v) : -nId(VDD, v)
  }
  // 栅极接地；PMOS 的源极是电位较高的那一端
  return input === 'high' ? pId(VDD, VDD - v) : -pId(v, v)
}

/** 输出最终停在哪里 V */
export function passTarget(dev: PassDev, input: PassInput): number {
  if (dev === 'n') {
    return input === 'high' ? VDD - VTN : 0
  }
  return input === 'high' ? VDD : -VTP
}

/** 输入端电平 V */
export function passInputLevel(input: PassInput): number {
  return input === 'high' ? VDD : 0
}

/** 输出起始电平 V：先放到和输入相反的电平，再看它怎么变 */
export function passStart(input: PassInput): number {
  return input === 'high' ? 0 : VDD
}

/** 传完之后栅源电压的绝对值 V（PMOS 为 Vsg） */
export function passVgsEnd(dev: PassDev, input: PassInput): number {
  const out = passTarget(dev, input)
  if (dev === 'n') {
    return VDD - (input === 'high' ? out : 0)
  }
  return input === 'high' ? VDD : out
}

export type PassCurve = {
  /** ns */
  t: number[]
  v: number[]
  tMax: number
  /** 进入目标 ±SETTLE_TOL 的时刻 ns；axis 内没到则为 null */
  tSettle: number | null
}

/** 中点法积分 C·dV/dt = I(V) */
export function passCurve(dev: PassDev, input: PassInput, cPf: number, points = 200): PassCurve {
  const c = cPf * 1e-12
  const tMax = PASS_NS_PER_PF * cPf * 1e-9
  const sub = 20
  const dt = tMax / (points * sub)
  const target = passTarget(dev, input)
  let v = passStart(input)
  const t = [0]
  const vs = [v]
  let tSettle: number | null = Math.abs(v - target) <= SETTLE_TOL ? 0 : null
  for (let i = 1; i <= points * sub; i += 1) {
    const k1 = passCurrent(dev, input, v) / c
    const k2 = passCurrent(dev, input, v + (k1 * dt) / 2) / c
    v = Math.min(Math.max(v + k2 * dt, 0), VDD)
    if (tSettle === null && Math.abs(v - target) <= SETTLE_TOL) {
      tSettle = i * dt * 1e9
    }
    if (i % sub === 0) {
      t.push(i * dt * 1e9)
      vs.push(v)
    }
  }
  return { t, v: vs, tMax: tMax * 1e9, tSettle }
}

/* ---------- 板级示意管：逻辑电平功率 MOSFET（示意参数，不对应具体型号） ---------- */

export const BOARD = { vth: 2, k: 12.5 }

/** 线性区导通电阻 Ω：Rds(on) = 1 / (k·(Vgs − Vth)) */
export function rdsOn(vgs: number): number {
  return rOn(vgs, BOARD.k, BOARD.vth)
}

/** 导通损耗 W */
export function condLoss(i: number, rds: number): number {
  return i * i * rds
}

/** 片上示意管在 VDD 驱动下的导通电阻 Ω，来自共用模型 */
export const CHIP_RON = rOn(VDD, KN, VTN)

/* ---------- LED 开关电路 ---------- */

export type SwitchCase = 'nLow' | 'pHigh' | 'nHigh'

/** 红色 LED，Vf 取常数 2 V（一阶近似） */
export const LED_VF = 2
/** 亮灭判据：电流大于 1 mA 才算看得见 */
export const LED_LIT_MIN = 1e-3

export const CASES: Record<SwitchCase, { vdd: number; rSeries: number; vHigh: number }> = {
  nLow: { vdd: 5, rSeries: 330, vHigh: 5 },
  pHigh: { vdd: 5, rSeries: 330, vHigh: 5 },
  // 12 V 负载：LED + 1 kΩ，GPIO 只有 3.3 V
  nHigh: { vdd: 12, rSeries: 1000, vHigh: 3.3 },
}

export type SwitchState = {
  /** 栅极对地电压 V */
  vg: number
  /** Vgs，PMOS 为负 */
  vgs: number
  on: boolean
  /** 回路电流 A */
  i: number
  /** 管子和负载之间那个节点对地电压 V */
  vNode: number
  /** 管子两端压降 V */
  vds: number
  lit: boolean
  /** 控制为「开」的电平却没点亮 */
  fail: boolean
}

function seriesCurrent(vdd: number, r: number, rds: number): number {
  return Math.max(vdd - LED_VF, 0) / (r + rds)
}

export function switchState(id: SwitchCase, gpioHigh: boolean): SwitchState {
  const { vdd, rSeries, vHigh } = CASES[id]
  const vg = gpioHigh ? vHigh : 0
  if (id === 'nLow') {
    const on = vg > BOARD.vth
    const rds = on ? rdsOn(vg) : Infinity
    const i = on ? seriesCurrent(vdd, rSeries, rds) : 0
    return { vg, vgs: vg, on, i, vNode: on ? i * rds : vdd, vds: on ? i * rds : vdd, lit: i >= LED_LIT_MIN, fail: false }
  }
  if (id === 'pHigh') {
    const vsg = vdd - vg
    const on = vsg > BOARD.vth
    const rds = on ? rdsOn(vsg) : Infinity
    const i = on ? seriesCurrent(vdd, rSeries, rds) : 0
    return { vg, vgs: vg - vdd, on, i, vNode: vdd - (on ? i * rds : vdd), vds: on ? i * rds : vdd, lit: i >= LED_LIT_MIN, fail: false }
  }
  // NMOS 高边：源极跟随，二分法解管子电流 = 负载电流
  const loadI = (vs: number) => Math.max(vs - LED_VF, 0) / rSeries
  const devI = (vs: number) => nId(vg - vs, vdd - vs, BOARD.k, BOARD.vth, LAMBDA)
  let lo = 0
  let hi = vdd
  for (let n = 0; n < 60; n += 1) {
    const mid = (lo + hi) / 2
    if (devI(mid) - loadI(mid) > 0) {
      lo = mid
    } else {
      hi = mid
    }
  }
  const vs = (lo + hi) / 2
  const i = loadI(vs)
  const lit = i >= LED_LIT_MIN
  return { vg, vgs: vg - vs, on: lit, i, vNode: vs, vds: vdd - vs, lit, fail: gpioHigh && !lit }
}

/* ---------- NMOS 高边的栅压需求与自举 ---------- */

/** NMOS 高边至少要的栅压：Vload + Vth 才刚开始导通；完全导通要 Vload + Vgs */
export function nHighGateNeed(vload: number, vgsFull: number): number {
  return vload + vgsFull
}

/** 栅极电压 vg 最多能把源极（负载）推到多高 V */
export function nHighMaxLoad(vg: number): number {
  return Math.max(vg - BOARD.vth, 0)
}

/** 24 V 母线、12 V 驱动电源、自举二极管压降 0.7 V（示意） */
export const BOOT = { vbus: 24, vcc: 12, vf: 0.7 }

export function bootCapVoltage(): number {
  return BOOT.vcc - BOOT.vf
}

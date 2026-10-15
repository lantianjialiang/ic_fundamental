import { KN, nId, VDD, VTN } from './model'

/* 非理想特性一课用的物理量：温度、亚阈值、体二极管。长沟道平方律部分一律走 ./model。 */

const Q = 1.602176634e-19
const KB = 1.380649e-23

export const T_REF = 25
/** Vth 温度系数，V/°C */
export const VTH_TC = -0.002
/** 亚阈值电流在 Vgs = Vth 处取的参考值，A（示意） */
export const I_TH = 1e-7

export const kelvin = (c: number) => c + 273.15
/** 热电压 kT/q，V */
export const thermalV = (c: number) => (KB * kelvin(c)) / Q

export type DevParams = { n: number; vth0: number; dibl: number; k0: number }

/** 本轨教学器件：Vth 0.7 V，n = 1.4，无 DIBL */
export const TEACH: DevParams = { n: 1.4, vth0: VTN, dibl: 0, k0: KN }

export const vthAt = (c: number, vth0 = VTN) => vth0 + VTH_TC * (c - T_REF)
/** 迁移率随温度 ∝ T^-1.5，相对 25 °C */
export const mobilityScale = (c: number) => (kelvin(c) / kelvin(T_REF)) ** -1.5
/** 亚阈值摆幅 S，V / decade */
export const swing = (c: number, n: number) => n * thermalV(c) * Math.LN10

/** 漏极电流 A：Vgs ≤ Vth 走指数，之上叠加平方律 */
export function idTotal(vgs: number, vds: number, c: number, p: DevParams = TEACH): number {
  const vth = vthAt(c, p.vth0) - p.dibl * vds
  const drain = 1 - Math.exp(-vds / thermalV(c))
  if (vgs <= vth) {
    return I_TH * 10 ** ((vgs - vth) / swing(c, p.n)) * drain
  }
  return I_TH * drain + nId(vgs, vds, p.k0 * mobilityScale(c), vth)
}

/** 25 °C 曲线与 c 曲线（饱和区、Vds = VDD）的交点，即温度补偿点；c 太接近 25 °C 时用 125 °C 代替 */
export function ztc(c: number): number {
  const target = Math.abs(c - T_REF) < 5 ? 125 : c
  const diff = (v: number) => idTotal(v, VDD, target) - idTotal(v, VDD, T_REF)
  let lo = vthAt(T_REF) + 0.05
  let hi = VDD
  const sign = Math.sign(diff(lo))
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2
    if (Math.sign(diff(mid)) === sign) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

/* ---------- 功率管示例（示意参数） ---------- */

/** 功率 MOSFET 示例：25 °C、Vgs 足够高时 Rds(on)，Ω */
export const RDS25 = 0.01
/** 并联示例总电流，A */
export const PAR_TOTAL = 20

/** 栅压足够高时 Rds(on) 只随迁移率变化 */
export const rdsAt = (c: number, r25 = RDS25) => r25 / mobilityScale(c)

/** 体二极管：10 A 时 0.75 V，每个 e 倍 50 mV */
export const bodyVf = (i: number) => 0.75 + 0.05 * Math.log(Math.max(i, 0.01) / 10)

/** A 在温度 c、B 在 25 °C，总电流 PAR_TOTAL 的分流：返回 A 的电流 */
export function shareHot(c: number): number {
  const ra = rdsAt(c)
  const rb = rdsAt(T_REF)
  return (PAR_TOTAL * rb) / (ra + rb)
}

/* ---------- 工艺节点（示意） ---------- */

export type NodeId = 'n500' | 'n350' | 'n180' | 'n65' | 'n28'

export type ScaleNode = { id: NodeId; name: string; l: number; vdd: number; dev: DevParams }

export const NODES: ScaleNode[] = [
  { id: 'n500', name: '500 nm', l: 500, vdd: 5, dev: { n: 1.3, vth0: 0.8, dibl: 0.01, k0: KN } },
  { id: 'n350', name: '350 nm', l: 350, vdd: VDD, dev: { n: 1.35, vth0: VTN, dibl: 0.02, k0: KN } },
  { id: 'n180', name: '180 nm', l: 180, vdd: 1.8, dev: { n: 1.4, vth0: 0.5, dibl: 0.05, k0: KN } },
  { id: 'n65', name: '65 nm', l: 65, vdd: 1.2, dev: { n: 1.5, vth0: 0.4, dibl: 0.1, k0: KN } },
  { id: 'n28', name: '28 nm', l: 28, vdd: 0.9, dev: { n: 1.6, vth0: 0.35, dibl: 0.13, k0: KN } },
]

/** 相对第一个节点：电容 ∝ L，动态能量 ∝ C·V² */
export function energyRel(node: ScaleNode): number {
  const first = NODES[0]
  return (node.l / first.l) * (node.vdd / first.vdd) ** 2
}

/** Vgs = 0、Vds = VDD、25 °C 的关断电流 */
export const ioffOf = (node: ScaleNode) => idTotal(0, node.vdd, T_REF, node.dev)

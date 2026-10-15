/**
 * 全轨共用的教学用 MOS 模型（长沟道平方律）。各课的曲线、读数都从这里算，保证数字前后一致。
 * 参数是示意值，不对应某个具体工艺。
 */

/** NMOS 阈值电压 V */
export const VTN = 0.7
/** PMOS 阈值电压 V（负值） */
export const VTP = -0.7
/** NMOS 跨导参数 k = µn·Cox·W/L，单位 A/V² */
export const KN = 2e-3
/** PMOS 跨导参数（已把 W 做宽，和 NMOS 相等，所以反相器阈值在 VDD/2） */
export const KP = 2e-3
/** 沟道长度调制系数 1/V */
export const LAMBDA = 0.04
/** 数字部分的电源电压 V */
export const VDD = 3.3

export type Region = 'cutoff' | 'linear' | 'sat'

/** NMOS 工作区：Vgs ≤ Vth 截止；Vds < Vgs − Vth 线性；否则饱和 */
export function nRegion(vgs: number, vds: number, vth = VTN): Region {
  if (vgs <= vth) {
    return 'cutoff'
  }
  return vds < vgs - vth ? 'linear' : 'sat'
}

/** NMOS 漏极电流 A（vds ≥ 0） */
export function nId(vgs: number, vds: number, k = KN, vth = VTN, lambda = LAMBDA): number {
  const vov = vgs - vth
  if (vov <= 0 || vds <= 0) {
    return 0
  }
  if (vds < vov) {
    return k * (vov * vds - (vds * vds) / 2) * (1 + lambda * vds)
  }
  return (k / 2) * vov * vov * (1 + lambda * vds)
}

/** PMOS 源漏电流 A（从源流向漏为正）。vsg、vsd 都取正值 */
export function pId(vsg: number, vsd: number, k = KP, vth = -VTP, lambda = LAMBDA): number {
  return nId(vsg, vsd, k, vth, lambda)
}

/** 线性区小 Vds 下的等效电阻 Ω：1 / (k·Vov) */
export function rOn(vgs: number, k = KN, vth = VTN): number {
  const vov = vgs - vth
  return vov > 0 ? 1 / (k * vov) : Infinity
}

/** CMOS 反相器静态输出：二分法解 In = Ip */
export function inverterOut(vin: number, vdd = VDD): number {
  let lo = 0
  let hi = vdd
  for (let i = 0; i < 60; i += 1) {
    const vout = (lo + hi) / 2
    const iN = nId(vin, vout)
    const iP = pId(vdd - vin, vdd - vout)
    if (iN > iP) {
      hi = vout
    } else {
      lo = vout
    }
  }
  return (lo + hi) / 2
}

/** 反相器从电源到地的直通电流 A */
export function inverterCurrent(vin: number, vdd = VDD): number {
  return nId(vin, inverterOut(vin, vdd))
}

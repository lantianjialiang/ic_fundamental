import { VTN, VTP } from '../model'

/**
 * 本课的 MOS 电容教学模型（Vds ≈ 0，Vsb = 0，平带电压取 0）。
 * 所有量都用「归一化栅压」vn 计算：NMOS 时 vn = Vgs，PMOS 时 vn = −Vgs，所以两种管子共用一套公式。
 */

export type Dev = 'n' | 'p'

export type ChState = 'acc' | 'flat' | 'dep' | 'th' | 'inv'

/** 归一化阈值（正数）：NMOS 取 VTN，PMOS 取 −VTP */
export const VT_ABS = { n: VTN, p: -VTP }

/** 滑块范围：NMOS −2…+3 V，PMOS 镜像为 −3…+2 V */
export const VGS_RANGE = {
  n: { min: -2, max: 3 },
  p: { min: -3, max: 2 },
}

/** 归一化栅压的最大值（两种管子都是 3 V），用来把沟道电荷换算成百分比 */
export const VN_MAX = 3

/** 平带、阈值判定的容差 V */
const EPS = 0.025

export function vnOf(dev: Dev, vgs: number) {
  return dev === 'n' ? vgs : -vgs
}

export function vthOf(dev: Dev) {
  return dev === 'n' ? VTN : VTP
}

export function chState(dev: Dev, vgs: number): ChState {
  const vn = vnOf(dev, vgs)
  const vt = VT_ABS[dev]
  if (Math.abs(vn) < EPS) {
    return 'flat'
  }
  if (vn < 0) {
    return 'acc'
  }
  if (Math.abs(vn - vt) < EPS) {
    return 'th'
  }
  return vn < vt ? 'dep' : 'inv'
}

/**
 * 表面电势 ψs 除以 2φF（u = 1 就是阈值）。
 * 积累和强反型时载流子层把电场挡住，ψs 几乎钉住不动；只有耗尽区里 ψs 随栅压明显变化。
 */
export function surfaceU(vn: number, vt: number) {
  if (vn <= 0) {
    return -0.12 * (1 - Math.exp(vn / 0.4))
  }
  if (vn <= vt) {
    return vn / vt
  }
  return 1 + 0.04 * Math.log(1 + (vn - vt) / 0.1)
}

/** 耗尽深度 / 阈值时的最大耗尽深度：xd ∝ √ψs，过了阈值几乎不再变 */
export function depletionRatio(vn: number, vt: number) {
  const u = surfaceU(vn, vt)
  return u <= 0 ? 0 : Math.sqrt(u)
}

/** 反型层（沟道）电荷，相对满量程：Qinv ∝ Cox·(vn − Vth) */
export function channelRatio(vn: number, vt: number) {
  return Math.max(0, vn - vt) / (VN_MAX - vt)
}

/** 积累层电荷，相对满量程：Qacc ∝ Cox·(VFB − vn)，VFB 取 0 */
export function accRatio(vn: number) {
  return Math.max(0, -vn) / 2
}

/** 栅极上的电荷 ∝ Cox·vn（符号与栅压同号），相对满量程 */
export function gateRatio(vn: number) {
  return Math.min(1, Math.abs(vn) / VN_MAX)
}

/** 示意掺杂：NA = 1e17 cm⁻³，ni = 1e10 cm⁻³，阈值时表面电子浓度等于 NA */
export const NA_LOG = 17
export const NI_LOG = 10

/** 表面少子 / 多子浓度的 log10（cm⁻³）。u = 1 时 ns = NA、ps = ni²/NA */
export function surfaceLogs(vn: number, vt: number) {
  const u = surfaceU(vn, vt)
  const span = 2 * (NA_LOG - NI_LOG)
  return {
    minority: 2 * NI_LOG - NA_LOG + span * u,
    majority: NA_LOG - span * u,
  }
}

/** 确定性伪随机数，保证每次渲染粒子位置一样 */
export function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let r = Math.imul(s ^ (s >>> 15), 1 | s)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

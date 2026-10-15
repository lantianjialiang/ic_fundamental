/**
 * 动态特性一课的分段模型（示意）：由 Qgs、Qgd、Rg 和负载电容算出开通 / 关断波形。
 * 板级功率 MOS 示意参数，和 ./model 里的片上教学模型无关。
 * 时间单位：秒；电压 V；电流 A；电容 F；电荷 C。
 */

export const QGS = 2e-9
export const QGD = 3e-9
export const VPL = 2.5
export const VTH = 1.5
export const VDRIVE0 = 10
export const VDD_P = 12
export const ILOAD = 5
/** 导通电阻 Ω，示意 */
export const RDS_ON = 0.01
/** 漏源电容 F，示意 */
export const CDS = 300e-12

/** 平台前等效 Cgs：把 0 → Vpl 的电荷 Qgs 折成电容 */
export const CGS = QGS / VPL
/** Vds 摆幅 VDD 内等效 Cgd */
export const CGD = QGD / VDD_P
/** 平台后输入电容 ≈ Cgs + Cgd */
export const C_HI = CGS + CGD
/** 转移特性斜率的倒数：Id = ILOAD 时 Vgs = Vpl，Id = 0 时 Vgs = Vth */
export const KGM = (VPL - VTH) / ILOAD
/** 导通后 Vds */
export const VON = ILOAD * RDS_ON

export type DynParams = { rg: number; cx: number; vdrive: number }
export type Edge = 'on' | 'off'
export type Wave = { vgs: number; vds: number; id: number }

export type EdgeCalc = {
  edge: Edge
  /** 区间分界时刻，开通 t1..t4，关断 t1..t3 */
  marks: number[]
  /** 平台时长 */
  tPlat: number
  /** Vds 变化率 V/s（绝对值） */
  slew: number
  /** 平台处的 Vgs */
  vgsPlat: number
  /** 电流和电压交叠时间：开通 t1→t3，关断 t1→t3 */
  tCross: number
  /** 栅极指令 50% 到 Vds 50% */
  tpd: number
  tEnd: number
  tau1: number
  tau3: number
  vdrive: number
}

/** 栅极总电荷 C：Qgs + Qgd + 平台后继续充到驱动电压 */
export function qgTotal(vdrive: number) {
  return QGS + QGD + C_HI * (vdrive - VPL)
}

const transfer = (vgs: number) => Math.max(0, (ILOAD * (vgs - VTH)) / (VPL - VTH))

/** 漏极侧总电容（器件 Cds + 外加负载电容） */
const drainC = (p: DynParams) => CDS + p.cx

export function calcEdge(p: DynParams, edge: Edge): EdgeCalc {
  const tau1 = p.rg * CGS
  const tau3 = p.rg * C_HI
  const rm = p.rg * CGD
  const cx = drainC(p)
  const swing = VDD_P - VON
  if (edge === 'on') {
    const t1 = -tau1 * Math.log(1 - VTH / p.vdrive)
    const t2 = -tau1 * Math.log(1 - VPL / p.vdrive)
    const slew = (p.vdrive - VPL) / (rm + KGM * cx)
    const vgsPlat = VPL + KGM * cx * slew
    const tPlat = swing / slew
    const t3 = t2 + tPlat
    const vg3 = vgsPlat - (vgsPlat - VPL) * Math.exp(-tPlat / tau1)
    const t4 = t3 + tau3 * Math.log((p.vdrive - vg3) / (0.1 * p.vdrive))
    return { edge, marks: [t1, t2, t3, t4], tPlat, slew, vgsPlat, tCross: t3 - t1, tpd: t2 + (0.5 * swing) / slew, tEnd: t4, tau1, tau3, vdrive: p.vdrive }
  }
  const vgsPlat = Math.max(VTH + 0.05, VPL / (1 + (KGM * cx) / rm))
  const slew = vgsPlat / rm
  const tPlat = swing / slew
  const tA = tau3 * Math.log(p.vdrive / VPL)
  const t2 = tA + tPlat
  const vg3 = vgsPlat + (VPL - vgsPlat) * Math.exp(-tPlat / tau1)
  const t3 = t2 + tau1 * Math.log(vg3 / VTH)
  return { edge, marks: [tA, t2, t3], tPlat, slew, vgsPlat, tCross: t3 - tA, tpd: tA + (0.5 * swing) / slew, tEnd: t3 + 0.6 * tau1, tau1, tau3, vdrive: p.vdrive }
}

export function waveAt(c: EdgeCalc, t: number): Wave {
  const vd = c.vdrive
  if (c.edge === 'on') {
    const [t1, t2, t3] = c.marks
    if (t <= 0) {
      return { vgs: 0, vds: VDD_P, id: 0 }
    }
    if (t < t2) {
      const vgs = vd * (1 - Math.exp(-t / c.tau1))
      return { vgs, vds: VDD_P, id: t < t1 ? 0 : transfer(vgs) }
    }
    if (t < t3) {
      const vgs = c.vgsPlat - (c.vgsPlat - VPL) * Math.exp(-(t - t2) / c.tau1)
      return { vgs, vds: VDD_P - c.slew * (t - t2), id: transfer(vgs) }
    }
    const vg3 = c.vgsPlat - (c.vgsPlat - VPL) * Math.exp(-c.tPlat / c.tau1)
    return { vgs: vd - (vd - vg3) * Math.exp(-(t - t3) / c.tau3), vds: VON, id: ILOAD }
  }
  const [tA, t2] = c.marks
  if (t <= 0) {
    return { vgs: vd, vds: VON, id: ILOAD }
  }
  if (t < tA) {
    return { vgs: vd * Math.exp(-t / c.tau3), vds: VON, id: ILOAD }
  }
  if (t < t2) {
    const vgs = c.vgsPlat + (VPL - c.vgsPlat) * Math.exp(-(t - tA) / c.tau1)
    return { vgs, vds: VON + c.slew * (t - tA), id: Math.min(ILOAD, transfer(vgs)) }
  }
  const vg3 = c.vgsPlat + (VPL - c.vgsPlat) * Math.exp(-c.tPlat / c.tau1)
  const vgs = vg3 * Math.exp(-(t - t2) / c.tau1)
  return { vgs, vds: VDD_P, id: Math.min(ILOAD, transfer(vgs)) }
}

/** 开关交叠区的 ∫Vds·Id dt，单位 J（梯形积分） */
export function edgeEnergy(c: EdgeCalc) {
  // 开通从 t1（电流开始上升）到 t3；关断从 Vds 开始上升到电流归零
  const from = c.marks[0]
  const to = c.marks[2]
  const n = 600
  let sum = 0
  let prev = waveAt(c, from)
  for (let i = 1; i <= n; i += 1) {
    const t = from + ((to - from) * i) / n
    const w = waveAt(c, t)
    sum += ((prev.vds * prev.id + w.vds * w.id) / 2) * ((to - from) / n)
    prev = w
  }
  return sum
}

/** 经验公式：½·V·I·(tr + tf)·f，单位 W */
export function lossEstimate(on: EdgeCalc, off: EdgeCalc, freq: number) {
  return 0.5 * VDD_P * ILOAD * (on.tCross + off.tCross) * freq
}

/** 栅极峰值驱动电流 A：Ig = Vdrive / Rg，受驱动器上限约束 */
export function gateCurrent(vdrive: number, rg: number, limit = Infinity) {
  return Math.min(vdrive / rg, limit)
}

/** Vgs 随累计栅电荷 Q 的曲线（顺序：Qgs 段、平台、后段） */
export function vgsOfCharge(q: number, vdrive: number) {
  if (q <= QGS) {
    return (VPL * q) / QGS
  }
  if (q <= QGS + QGD) {
    return VPL
  }
  return Math.min(vdrive, VPL + (q - QGS - QGD) / C_HI)
}

/** 粗略取整到 1-2-5 序列的每格值 */
export function niceDiv(span: number, divs: number) {
  const raw = span / divs
  const mag = 10 ** Math.floor(Math.log10(raw))
  const m = raw / mag
  const pick = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10
  return pick * mag
}

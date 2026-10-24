/**
 * PWR-04 栅极电荷的教学模型（纯函数，不含界面文字）。虚构器件，数值只用于教学。
 *
 * 恒定 Ig 充电：每一步注入的电荷 dQ = Ig·dt，所以 Q = Ig·t。三阶段：
 *  1) Vds = Vdd，充 Cgs 与 Cgd(Vdd) 直到平台电压 Vplat；
 *  2) 米勒平台：Vgs 保持 Vplat，电流全部用来充 Cgd，Vds 从 Vdd 降到 VDS_ON；
 *  3) Vds = VDS_ON，充 Cgs + Cgd(VDS_ON) 直到驱动电压 Vdrive。
 *
 * Cgd(Vds) = cgd0 / sqrt(1 + Vds / CGD_VK)：Vds 低时 Cgd 大，高压时小（非线性，教学示意）。
 * 平台电压 Vplat = Vth + DELTA_V_PLAT（教学简化：Id/gfs 取固定值）。
 * 驱动损耗 P = Qg · Vdrive · fsw（教学简化公式，忽略其它损耗）。
 */

/** Cgd 非线性的特征电压，V */
export const CGD_VK = 5
/** 平台阶段末的 Vds（导通压降的教学值），V */
export const VDS_ON = 0.5
/** 平台电压相对 Vth 的抬高量（教学简化），V */
export const DELTA_V_PLAT = 1
/** 平台短于此时间，示波器难以分辨（教学取值），µs */
export const FLAT_MIN_US = 0.5
/** 恒流低于此值，平台受漏电与漂移拖累（教学取值），mA */
export const LOW_IG_MA = 2
/** 单步注入电荷，C（0.01 nC） */
const DQ_C = 1e-11
/** 绘图采样点数上限 */
const PLOT_POINTS = 400

export type GateState = {
  /** 测试恒流 Ig，mA */
  igMa: number
  /** 漏源电压 Vdd，V */
  vdd: number
  /** 栅源电容 Cgs，nF */
  cgsNf: number
  /** Cgd 在 Vds = 0 时的值，nF */
  cgd0Nf: number
  /** 阈值电压 Vth，V */
  vth: number
  /** 驱动电压 Vdrive，V */
  vdrive: number
  /** 开关频率 fsw，kHz */
  fswKhz: number
}

export const DEFAULT_GATE: GateState = {
  igMa: 10,
  vdd: 50,
  cgsNf: 2,
  cgd0Nf: 0.8,
  vth: 3,
  vdrive: 10,
  fswKhz: 500,
}

/** Cgd(Vds)，F */
export function cgdAt(cgd0F: number, vds: number): number {
  return cgd0F / Math.sqrt(1 + Math.max(vds, 0) / CGD_VK)
}

/** 解析式：Qgd = ∫ Cgd(v) dv（v 从 VDS_ON 到 Vdd），nC；与数值积分对照用 */
export function qgdAnalyticNc(cgd0Nf: number, vdd: number): number {
  return 2 * cgd0Nf * CGD_VK * (Math.sqrt(1 + vdd / CGD_VK) - Math.sqrt(1 + VDS_ON / CGD_VK))
}

export type GateCurve = {
  /** 时间，µs */
  t: number[]
  /** 栅源电压，V */
  vgs: number[]
  /** 漏源电压，V */
  vds: number[]
  /** 累计栅极电荷，nC */
  q: number[]
}

export type GateCurveParams = {
  igA: number
  vdd: number
  cgsF: number
  cgd0F: number
  vth: number
  vdrive: number
}

export type GateCurveResult = {
  curve: GateCurve
  /** 平台电压，V */
  vplat: number
  /** Q：平台开始前累计的电荷（Qgs），nC */
  qgs: number
  /** 平台期间的电荷（Qgd），nC */
  qgd: number
  /** 总栅极电荷 Qg，nC */
  qg: number
  /** 平台开始、结束时刻，µs */
  tPlStartUs: number
  tPlEndUs: number
}

/**
 * 按单步电荷积分得到曲线。每一步：q += dQ，t += dQ / Ig，再按当前阶段更新 Vgs 或 Vds。
 * 为了绘图，只保留不超过 PLOT_POINTS 个采样点（等间隔抽样，末点必保留）。
 */
export function gateChargeCurve(p: GateCurveParams): GateCurveResult {
  const vplat = p.vth + DELTA_V_PLAT
  const cgdOff = cgdAt(p.cgd0F, p.vdd)
  const cgdOn = cgdAt(p.cgd0F, VDS_ON)
  const allT: number[] = []
  const allVgs: number[] = []
  const allVds: number[] = []
  const allQ: number[] = []
  let q = 0
  let t = 0
  let vgs = 0
  let vds = p.vdd
  let phase = 1
  let qgs = 0
  let qgd = 0
  let tPlStart = 0
  let tPlEnd = 0
  const maxSteps = 200000
  let steps = 0
  while (vgs < p.vdrive && steps < maxSteps) {
    steps += 1
    q += DQ_C
    t += DQ_C / p.igA
    if (phase === 1) {
      vgs += DQ_C / (p.cgsF + cgdOff)
      if (vgs >= vplat) {
        vgs = vplat
        phase = 2
        qgs = q
        tPlStart = t
      }
    } else if (phase === 2) {
      vds -= DQ_C / cgdAt(p.cgd0F, vds)
      if (vds <= VDS_ON) {
        vds = VDS_ON
        phase = 3
        qgd = q - qgs
        tPlEnd = t
      }
    } else {
      vgs += DQ_C / (p.cgsF + cgdOn)
    }
    allT.push(t * 1e6)
    allVgs.push(vgs)
    allVds.push(vds)
    allQ.push(q * 1e9)
  }
  if (phase === 1) {
    qgs = q
    tPlStart = t
    tPlEnd = t
  }
  if (phase === 2) {
    qgd = q - qgs
    tPlEnd = t
  }

  const stride = Math.max(1, Math.floor(allT.length / PLOT_POINTS))
  const curve: GateCurve = { t: [], vgs: [], vds: [], q: [] }
  for (let i = 0; i < allT.length; i += stride) {
    curve.t.push(allT[i])
    curve.vgs.push(allVgs[i])
    curve.vds.push(allVds[i])
    curve.q.push(allQ[i])
  }
  const last = allT.length - 1
  if (last >= 0 && (last % stride) !== 0) {
    curve.t.push(allT[last])
    curve.vgs.push(allVgs[last])
    curve.vds.push(allVds[last])
    curve.q.push(allQ[last])
  }

  return {
    curve,
    vplat,
    qgs: qgs * 1e9,
    qgd: qgd * 1e9,
    qg: q * 1e9,
    tPlStartUs: tPlStart * 1e6,
    tPlEndUs: tPlEnd * 1e6,
  }
}

export type GateAnalysis = GateCurveResult & {
  /** 平台持续时间 = Qgd / Ig，µs */
  tPlUs: number
  /** 驱动损耗 P = Qg · Vdrive · fsw，W */
  pDriveW: number
  /** 解析式 Qgd，nC（只用于核对） */
  qgdAnalyticNc: number
}

export function analyseGate(s: GateState): GateAnalysis {
  const res = gateChargeCurve({
    igA: s.igMa * 1e-3,
    vdd: s.vdd,
    cgsF: s.cgsNf * 1e-9,
    cgd0F: s.cgd0Nf * 1e-9,
    vth: s.vth,
    vdrive: s.vdrive,
  })
  return {
    ...res,
    tPlUs: res.tPlEndUs - res.tPlStartUs,
    pDriveW: res.qg * 1e-9 * s.vdrive * s.fswKhz * 1e3,
    qgdAnalyticNc: qgdAnalyticNc(s.cgd0Nf, s.vdd),
  }
}

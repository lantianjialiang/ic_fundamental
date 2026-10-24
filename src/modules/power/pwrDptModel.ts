/**
 * PWR-05 双脉冲测试（DPT）的教学模型。
 * 电路：母线 Vdc 经负载电感 L 给下管 DUT 供电；续流二极管 D 在关断后导通；回路有杂散电感 Lstray；DUT 由栅极电阻 Rg 驱动。
 * 波形是分段线性的教学示意，所有斜率都是教学近似（界面上标注）：
 *   di/dt ≈ gfs·(Vdrive − Vgp)/(Rg·Ciss)，dv/dt ≈ (Vdrive − Vgp)/(Rg·Cgd)，关断过冲 ΔV = Lstray·di/dt。
 * 能量 E = ∫Vds·Id dt 在波形上做数值积分；教学简化公式只作对照。
 * 探头：电流探头相对电压探头延后 deskew；两路各过一个一阶低通（τ = 0.35 / BW）。
 */

/** 跨导 gfs（S），教学取值 */
export const GFS = 20
/** 驱动电压 Vdrive（V） */
export const VDRIVE = 10
/** 米勒平台电压 Vgp（V） */
export const VGP = 6
/** 输入电容 Ciss（F），教学取值 */
export const CISS = 4e-9
/** 米勒电容 Cgd（F），教学取值 */
export const CGD = 100e-12
/** 关断与开通之间的续流段；真实续流很长，这里压缩为 300 ns 作示意 */
export const GAP_S = 300e-9
/** 采样点数 */
const N_POINTS = 1600
/** 一阶低通：τ = RISE_K / BW */
const RISE_K = 0.35

export type DptState = {
  /** 母线电压 Vdc（V） */
  vdc: number
  /** 负载电感 L（µH） */
  lUh: number
  /** 第一脉冲宽度 t1（µs） */
  t1Us: number
  /** 栅极电阻 Rg（Ω） */
  rg: number
  /** 回路杂散电感 Lstray（nH） */
  lstrayNh: number
  /** 续流二极管反向恢复电荷 Qrr（nC） */
  qrrNc: number
  /** 探头带宽（MHz） */
  bwMhz: number
  /** 电流探头相对电压探头的延后（ns），正值表示电流晚到 */
  deskewNs: number
}

/** 默认值：电流 20 A（t1 = 5 µs），Rg = 5 Ω 使 di/dt 偏大，便于拨到目标值 */
export const DPT_DEFAULT: DptState = {
  vdc: 400,
  lUh: 100,
  t1Us: 5,
  rg: 5,
  lstrayNh: 20,
  qrrNc: 100,
  bwMhz: 500,
  deskewNs: 0,
}

export type WinKey = 'off' | 'on'

export type DptTiming = {
  /** 负载电流 I（A） */
  current: number
  /** di/dt（A/s） */
  diDt: number
  /** dv/dt（V/s） */
  dvDt: number
  /** 关断过冲 ΔV（V） */
  overshoot: number
  /** 关断电压上升时间 t_rv（s） */
  tRv: number
  /** 关断电流下降时间 t_fi（s） */
  tFi: number
  /** 开通电流上升时间 t_ri（s） */
  tRi: number
  /** 反向恢复电流峰值 Irr（A） */
  irr: number
  /** 反向恢复时间 t_rr（s），由 Qrr = ½·Irr·t_rr 得出 */
  tRr: number
  /** 开通电压下降时间 t_fv（s） */
  tFv: number
  /** 反向恢复电荷 Qrr（C） */
  qrr: number
}

/** 一条波形：时间（s）与三路值；vds、id、vgs 的单位分别为 V、A、V */
export type Wave = { t: number[]; vds: number[]; id: number[]; vgs: number[] }

export type DptWindows = { off: [number, number]; on: [number, number] }

/** 负载电流 I = Vdc·t1 / L（t1 µs、L µH 换算到 SI） */
export function loadCurrent(s: DptState): number {
  return (s.vdc * s.t1Us * 1e-6) / (s.lUh * 1e-6)
}

/** 反推第一脉冲宽度：t1 = I·L / Vdc（SI 单位，返回秒） */
export function t1ForCurrent(current: number, lH: number, vdc: number): number {
  return (current * lH) / vdc
}

/** 教学近似的 di/dt（A/s） */
export function diDtOf(rg: number): number {
  return (GFS * (VDRIVE - VGP)) / (rg * CISS)
}

/** 教学近似的 dv/dt（V/s） */
export function dvDtOf(rg: number): number {
  return (VDRIVE - VGP) / (rg * CGD)
}

/** 由参数算出各段时间与幅值；反向恢复峰值由 Irr = √(2·Qrr·di/dt) 得出 */
export function dptTiming(s: DptState): DptTiming {
  const current = loadCurrent(s)
  const diDt = diDtOf(s.rg)
  const dvDt = dvDtOf(s.rg)
  const qrr = s.qrrNc * 1e-9
  const irr = Math.sqrt(2 * qrr * diDt)
  const tRr = irr > 0 ? (2 * qrr) / irr : 0
  return {
    current,
    diDt,
    dvDt,
    overshoot: s.lstrayNh * 1e-9 * diDt,
    tRv: s.vdc / dvDt,
    tFi: current / diDt,
    tRi: current / diDt,
    irr,
    tRr,
    tFv: s.vdc / dvDt,
    qrr,
  }
}

/** 理想波形上某一时刻的三路值（t 从关断开始计） */
function pointAt(vdc: number, k: DptTiming, onStart: number, t: number): { vds: number; id: number; vgs: number } {
  const current = k.current
  if (t < k.tRv) {
    return { vds: (vdc * t) / k.tRv, id: current, vgs: VGP }
  }
  if (t < k.tRv + k.tFi) {
    const f = 1 - (t - k.tRv) / k.tFi
    return { vds: vdc + k.overshoot * f, id: current * f, vgs: VGP * f }
  }
  if (t < onStart) {
    return { vds: vdc, id: 0, vgs: 0 }
  }
  const s = t - onStart
  if (s < k.tRi) {
    return { vds: vdc, id: (current * s) / k.tRi, vgs: (VGP * s) / k.tRi }
  }
  const r = s - k.tRi
  const half = k.tRr / 2
  if (r < half) {
    return { vds: vdc, id: current + (k.irr * r) / half, vgs: VGP }
  }
  if (r < k.tRr) {
    return { vds: vdc, id: current + k.irr * (1 - (r - half) / half), vgs: VGP }
  }
  const f = r - k.tRr
  if (f < k.tFv) {
    return { vds: vdc * (1 - f / k.tFv), id: current, vgs: VGP }
  }
  return { vds: 0, id: current, vgs: VDRIVE }
}

/** 理想波形（无探头偏斜、无带宽限制）与两个积分区间 */
export function idealWave(s: DptState): { wave: Wave; windows: DptWindows; timing: DptTiming } {
  const k = dptTiming(s)
  const offEnd = k.tRv + k.tFi
  const onStart = offEnd + GAP_S
  const onEnd = onStart + k.tRi + k.tRr + k.tFv
  const h = (onEnd * 1.08) / (N_POINTS - 1)
  const wave: Wave = { t: [], vds: [], id: [], vgs: [] }
  for (let i = 0; i < N_POINTS; i += 1) {
    const t = i * h
    const p = pointAt(s.vdc, k, onStart, t)
    wave.t.push(t)
    wave.vds.push(p.vds)
    wave.id.push(p.id)
    wave.vgs.push(p.vgs)
  }
  return { wave, windows: { off: [0, offEnd], on: [onStart, onEnd] }, timing: k }
}

/** 均匀采样上的线性插值；越界时取端点值（关断前电流为 I，开通前为 0） */
export function interp(t: number[], y: number[], x: number): number {
  if (x <= t[0]) {
    return y[0]
  }
  const last = t.length - 1
  if (x >= t[last]) {
    return y[last]
  }
  const h = t[1] - t[0]
  const f = (x - t[0]) / h
  const i = Math.floor(f)
  const w = f - i
  return y[i] * (1 - w) + y[i + 1] * w
}

/** 一阶低通（指数平滑），alpha = 1 − e^(−h/τ) */
function lowPass(x: number[], alpha: number): number[] {
  const y: number[] = [x[0]]
  for (let i = 1; i < x.length; i += 1) {
    y.push(y[i - 1] + alpha * (x[i] - y[i - 1]))
  }
  return y
}

/** 测量链：电流探头延后 deskewS，两路各过一阶低通；bwHz 为 Infinity 时不滤波 */
export function measure(w: Wave, deskewS: number, bwHz: number): Wave {
  const h = w.t[1] - w.t[0]
  let vds = w.vds.slice()
  let id = w.t.map((t) => interp(w.t, w.id, t - deskewS))
  if (Number.isFinite(bwHz)) {
    const alpha = 1 - Math.exp(-h / (RISE_K / bwHz))
    vds = lowPass(vds, alpha)
    id = lowPass(id, alpha)
  }
  return { t: w.t, vds, id, vgs: w.vgs }
}

/** 积分窗口内的梯形积分 ∫Vds·Id dt（窗口两端的乘积为 0，截断误差可忽略） */
export function energy(w: Wave, win: [number, number]): number {
  let sum = 0
  for (let i = 0; i < w.t.length - 1; i += 1) {
    const inside = w.t[i] >= win[0] && w.t[i + 1] <= win[1]
    if (inside) {
      const p0 = w.vds[i] * w.id[i]
      const p1 = w.vds[i + 1] * w.id[i + 1]
      sum += 0.5 * (p0 + p1) * (w.t[i + 1] - w.t[i])
    }
  }
  return sum
}

export type DptResult = {
  timing: DptTiming
  /** 经过偏斜与带宽后的测量波形（界面显示用） */
  wave: Wave
  windows: DptWindows
  /** 测量值（波形积分，J） */
  eon: number
  eoff: number
  /** 理想测量链（无偏斜、无带宽限制）的积分值（J） */
  eonIdeal: number
  eoffIdeal: number
  /** 相对理想值的误差（%） */
  eonErrPct: number
  eoffErrPct: number
  /** 教学简化公式（J）：Eon ≈ ½·Vdc·I·(t_ri + t_fv) + Qrr·Vdc；Eoff ≈ ½·Vdc·I·(t_rv + t_fi) */
  eonFormula: number
  eoffFormula: number
  /**
   * 分段线性波形的解析积分（J）。
   * Eon：½·Vdc·I·(t_ri + t_fv) + Vdc·(I·t_rr + Qrr)，比简化公式多出反向恢复期间 I·Vdc·t_rr（电流仍为 I、Vds 仍为 Vdc）。
   * Eoff：½·Vdc·I·(t_rv + t_fi) + ΔV·I·t_fi/3，比简化公式多出过冲段。
   */
  eonAnalytic: number
  eoffAnalytic: number
  /** 关断时 Vds 峰值（V） */
  vdsPeak: number
  /** 关断时 Id 峰值（A） */
  idPeak: number
}

/** 完整仿真：理想波形 → 测量链 → 积分；同时给出解析值与简化公式 */
export function simulateDpt(s: DptState): DptResult {
  const { wave, windows, timing: k } = idealWave(s)
  const meas = measure(wave, s.deskewNs * 1e-9, s.bwMhz * 1e6)
  const ideal = measure(wave, 0, Infinity)
  const eon = energy(meas, windows.on)
  const eoff = energy(meas, windows.off)
  const eonIdeal = energy(ideal, windows.on)
  const eoffIdeal = energy(ideal, windows.off)
  const eonFormula = 0.5 * s.vdc * k.current * (k.tRi + k.tFv) + k.qrr * s.vdc
  const eoffFormula = 0.5 * s.vdc * k.current * (k.tRv + k.tFi)
  return {
    timing: k,
    wave: meas,
    windows,
    eon,
    eoff,
    eonIdeal,
    eoffIdeal,
    eonErrPct: (eon / eonIdeal - 1) * 100,
    eoffErrPct: (eoff / eoffIdeal - 1) * 100,
    eonFormula,
    eoffFormula,
    eonAnalytic: 0.5 * s.vdc * k.current * (k.tRi + k.tFv) + s.vdc * (k.current * k.tRr + k.qrr),
    eoffAnalytic: eoffFormula + (k.overshoot * k.current * k.tFi) / 3,
    vdsPeak: Math.max(...meas.vds),
    idPeak: Math.max(...meas.id),
  }
}

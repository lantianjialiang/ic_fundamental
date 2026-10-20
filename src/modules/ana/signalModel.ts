/**
 * 「连续时间信号与频率」的模型（教学示意）。
 * 单位：频率 kHz，时间 ms（kHz × ms 恰好是周期数，所以 sin(2π·f·t) 不需要换算），幅度 V，相位 °。
 * B 路可接一阶 RC 低通：|H(f)| = 1 / √(1 + (f/fc)²)，∠H(f) = −atan(f/fc)。
 */

export type SignalState = {
  /** 两路共用的频率 f，kHz（相位差只在同频时才有确定的意义） */
  f: number
  /** A 路幅度（峰值），V；A 路是参考路 */
  ampA: number
  /** B 路幅度（峰值，滤波前），V */
  ampB: number
  /** B 路相对 A 路的相位，°；正值表示 B 超前 */
  phaseB: number
  /** B 路是否经过一阶 RC 低通 */
  filter: boolean
  /** 低通截止频率 fc，kHz */
  fc: number
}

/** 默认值：滤波关闭（选项顺序里 off 排第一），两路同幅、同相 */
export const DEFAULT_SIGNAL: SignalState = { f: 1, ampA: 1, ampB: 1, phaseB: 0, filter: false, fc: 2 }

/** 波形图的时间窗，ms */
export const WINDOW_MS = 2
const CURVE_POINTS = 800

/** 伯德图的频率范围，kHz（对数轴） */
export const BODE_F_MIN = 0.1
export const BODE_F_MAX = 20
const BODE_POINTS = 160

export type Point = { x: number; y: number }

/** 周期 T = 1 / f，单位 ms（f 为 kHz） */
export function periodMs(f: number): number {
  return 1 / f
}

/** 一阶 RC 低通在频率 f 处的增益（幅度比） */
export function lowpassGain(f: number, fc: number): number {
  return 1 / Math.sqrt(1 + (f / fc) ** 2)
}

/** 一阶 RC 低通在频率 f 处的相位，°（总是滞后，取负值） */
export function lowpassPhaseDeg(f: number, fc: number): number {
  return (-Math.atan(f / fc) * 180) / Math.PI
}

export function gainDb(gain: number): number {
  return 20 * Math.log10(gain)
}

/** 把角度折到 (−180, 180] */
export function wrapDeg(deg: number): number {
  let d = ((deg % 360) + 360) % 360
  if (d > 180) {
    d -= 360
  }
  return d
}

/** 时间差 Δt（ms）在频率 f（kHz）下对应的相位差，°：Δφ = 360°·f·Δt */
export function phaseOfDelay(fKhz: number, dtMs: number): number {
  return wrapDeg(360 * fKhz * dtMs)
}

/** 幅度误差不超过 errPct（%）时，一阶 RC 的截止频率下限，kHz */
export function minCutoffFor(f: number, errPct: number): number {
  const gain = 1 - errPct / 100
  return f / Math.sqrt(1 / (gain * gain) - 1)
}

/** B 路输出相对 A 路的相位差，°：滤波开启时加上低通的相位滞后 */
export function phaseDiffDeg(state: SignalState): number {
  const filterPhase = state.filter ? lowpassPhaseDeg(state.f, state.fc) : 0
  return wrapDeg(state.phaseB + filterPhase)
}

export type SignalResult = {
  /** 周期，ms */
  period: number
  /** 在 f 处的滤波增益（未开滤波时为 1） */
  gain: number
  /** 同一增益的 dB 值 */
  gainDb: number
  /** B 路输出幅度，V */
  outAmpB: number
  /** 幅度误差：相对输入幅度少了多少，%（未开滤波时为 0） */
  ampErrPct: number
  /** B 路输出相对 A 路的相位差，° */
  phaseDiff: number
}

export function signalResult(state: SignalState): SignalResult {
  const gain = state.filter ? lowpassGain(state.f, state.fc) : 1
  return {
    period: periodMs(state.f),
    gain,
    gainDb: gainDb(gain),
    outAmpB: state.ampB * gain,
    ampErrPct: (1 - gain) * 100,
    phaseDiff: phaseDiffDeg(state),
  }
}

export type SignalCurves = {
  /** A 路（参考） */
  a: Point[]
  /** B 路输入（滤波前） */
  bIn: Point[]
  /** B 路输出（滤波后；未开滤波时与输入相同） */
  bOut: Point[]
}

/** 时域三条曲线，时间 0 到 WINDOW_MS */
export function signalCurves(state: SignalState): SignalCurves {
  const gain = state.filter ? lowpassGain(state.f, state.fc) : 1
  const shift = state.filter ? lowpassPhaseDeg(state.f, state.fc) : 0
  const phaseB = (state.phaseB * Math.PI) / 180
  const shiftRad = (shift * Math.PI) / 180
  const a: Point[] = []
  const bIn: Point[] = []
  const bOut: Point[] = []
  for (let i = 0; i <= CURVE_POINTS; i += 1) {
    const t = (WINDOW_MS * i) / CURVE_POINTS
    const base = 2 * Math.PI * state.f * t
    a.push({ x: t, y: state.ampA * Math.sin(base) })
    bIn.push({ x: t, y: state.ampB * Math.sin(base + phaseB) })
    bOut.push({ x: t, y: state.ampB * gain * Math.sin(base + phaseB + shiftRad) })
  }
  return { a, bIn, bOut }
}

export type BodePoint = { f: number; db: number; deg: number }

/** 伯德图曲线：频率对数等分，幅度 dB 与相位 ° */
export function bodeCurve(fc: number): BodePoint[] {
  const points: BodePoint[] = []
  for (let i = 0; i <= BODE_POINTS; i += 1) {
    const f = BODE_F_MIN * (BODE_F_MAX / BODE_F_MIN) ** (i / BODE_POINTS)
    points.push({ f, db: gainDb(lowpassGain(f, fc)), deg: lowpassPhaseDeg(f, fc) })
  }
  return points
}

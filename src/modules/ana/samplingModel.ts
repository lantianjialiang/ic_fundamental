/**
 * 「采样定理与 ADC 采样」的模型（教学示意）。
 * 单位：频率用 kHz，时间用 ms —— kHz × ms 恰好是周期数，所以 sin(2π·f·t) 不需要换算。
 * 抗混叠滤波器（AAF）按一阶 RC 低通处理：|H(f)| = 1 / √(1 + (f / fc)²)。
 */

export type SampleState = {
  /** 采样率 fs，kHz */
  fs: number
  /** 输入正弦频率 f_in，kHz */
  fin: number
  /** 是否在采样前加抗混叠滤波器 */
  aaf: boolean
  /** AAF 截止频率 fc，kHz（只在 aaf 为真时起作用） */
  fc: number
}

export const DEFAULT_SAMPLE: SampleState = { fs: 10, fin: 3, aaf: false, fc: 2 }

/** 画图的时间窗，ms */
export const WINDOW_MS = 4
const CURVE_POINTS = 2400

export type Point = { x: number; y: number }

/** 带符号的表观频率：f_s = f_in − round(f_in / fs) · fs */
export function aliasSigned(fin: number, fs: number): number {
  return fin - Math.round(fin / fs) * fs
}

/** 表观频率（取绝对值），单位 kHz */
export function aliasFreq(fin: number, fs: number): number {
  return Math.abs(aliasSigned(fin, fs))
}

/** 一阶 RC 抗混叠滤波器在频率 f 处的增益（幅度比） */
export function aafGain(f: number, fc: number): number {
  return 1 / Math.sqrt(1 + (f / fc) ** 2)
}

export function gainDb(gain: number): number {
  return 20 * Math.log10(gain)
}

export type SampleResult = {
  /** 表观频率，kHz */
  alias: number
  /** 输入是否超过奈奎斯特频率 fs/2 */
  aliasing: boolean
  /** 采样前在 f_in 处的增益（没开 AAF 时为 1） */
  gain: number
  /** 同一增益的 dB 值（没开 AAF 时为 0） */
  gainDb: number
  /** 奈奎斯特频率 fs/2，kHz */
  nyquist: number
  /** 每个输入周期的采样点数 fs / f_in */
  perPeriod: number
}

export function sampleResult(s: SampleState): SampleResult {
  const gain = s.aaf ? aafGain(s.fin, s.fc) : 1
  return {
    alias: aliasFreq(s.fin, s.fs),
    aliasing: s.fin > s.fs / 2,
    gain,
    gainDb: gainDb(gain),
    nyquist: s.fs / 2,
    perPeriod: s.fs / s.fin,
  }
}

export type SampleCurves = {
  /** 采样前的输入（经 AAF 后），连续曲线 */
  input: Point[]
  /** 没经过 AAF 的原始输入，只在开了 AAF 时画作对比 */
  raw: Point[]
  /** 采样点 */
  samples: Point[]
  /** 从采样点还原出来的表观正弦：经过的样点与输入完全相同 */
  alias: Point[]
}

/** 三条曲线和采样点。时间 0 到 WINDOW_MS */
export function sampleCurves(s: SampleState): SampleCurves {
  const { gain } = sampleResult(s)
  const fsig = aliasSigned(s.fin, s.fs)
  const input: Point[] = []
  const raw: Point[] = []
  const alias: Point[] = []
  for (let i = 0; i <= CURVE_POINTS; i += 1) {
    const t = (WINDOW_MS * i) / CURVE_POINTS
    input.push({ x: t, y: gain * Math.sin(2 * Math.PI * s.fin * t) })
    raw.push({ x: t, y: Math.sin(2 * Math.PI * s.fin * t) })
    alias.push({ x: t, y: gain * Math.sin(2 * Math.PI * fsig * t) })
  }
  const samples: Point[] = []
  for (let k = 0; k / s.fs <= WINDOW_MS + 1e-9; k += 1) {
    const t = k / s.fs
    samples.push({ x: t, y: gain * Math.sin(2 * Math.PI * s.fin * t) })
  }
  return { input, raw, samples, alias }
}

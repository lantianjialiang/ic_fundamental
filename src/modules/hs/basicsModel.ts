/**
 * 高速信号基础（HS-01）的教学模型。
 * 速率 rate（Gb/s）决定 UI = 1000 / rate（ps）。
 * 通道按一阶 RC 低通处理：上升时间（10%–90%）tr 与 −3 dB 带宽满足 BW ≈ 0.35 / tr（tr 单位 ps 时 BW 单位 GHz 为 350 / tr）。
 * 一阶 RC 的 10%–90% 上升时间 = τ·ln 9，所以 τ = tr / ln 9。
 * 一个 UI 结束时，边沿已走到 1 − exp(−UI/τ) = 1 − 9^(−UI/tr) 的比例（完成度）。
 * 判据：tr / UI ≤ 0.5，此时残留误差 9^(−2) ≈ 1.2%，即一位结束时已走到约 99%，波形可视为到达稳态。
 * 反推：判据要求 tr ≤ 0.5·UI，代入 BW ≈ 0.35 / tr，得 BW ≥ 0.7 × 速率（GHz）。
 */

export type BasicsState = {
  /** 数据速率，Gb/s */
  rate: number
  /** 上升时间 tr（10%–90%），ps */
  tr: number
}

/** 速率选项，显示顺序即数组顺序；默认取 [0] */
export const RATES: number[] = [2.5, 5, 10, 16]

export const DEFAULT_BASICS: BasicsState = { rate: RATES[0], tr: 60 }

/** 稳态判据：tr / UI 的上限 */
export const STEADY_RATIO = 0.5

/** 每个 UI 的采样点数 */
export const SPU = 32

/** 演示用的码型：边沿、连 1、连 0 都有，便于看清每一位是否走完 */
export const PATTERN: number[] = [0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0]

const LN9 = Math.log(9)

export type BasicsAnalysis = {
  /** 单位间隔 UI，ps */
  ui: number
  /** 带宽 BW ≈ 0.35 / tr，GHz */
  bw: number
  /** tr / UI */
  ratio: number
  /** 一位结束时边沿已走到目标的比例（0–1） */
  settled: number
  /** 达到判据所需的最小带宽 = 0.7 × 速率，GHz */
  minBw: number
  pass: boolean
  /** 每个采样点的归一化电平（0–1），共 PATTERN.length × SPU 个点 */
  wave: Float64Array
  /** 理想方波（同一时间轴），用来对照 */
  ideal: Float64Array
}

/** 一位结束时的完成度：1 − 9^(−UI/tr) */
export function settledFraction(ratio: number): number {
  return 1 - 9 ** (-1 / ratio)
}

export function analyseBasics(state: BasicsState): BasicsAnalysis {
  const ui = 1000 / state.rate
  const ratio = state.tr / ui
  const tau = state.tr / LN9
  const dt = ui / SPU
  const count = PATTERN.length * SPU
  const wave = new Float64Array(count)
  const ideal = new Float64Array(count)

  let start = 0
  for (let n = 0; n < PATTERN.length; n += 1) {
    const target = PATTERN[n]
    for (let j = 0; j < SPU; j += 1) {
      const idx = n * SPU + j
      wave[idx] = target + (start - target) * Math.exp(-(j * dt) / tau)
      ideal[idx] = target
    }
    start = target + (start - target) * Math.exp(-ui / tau)
  }

  return {
    ui,
    bw: 350 / state.tr,
    ratio,
    settled: settledFraction(ratio),
    minBw: 0.7 * state.rate,
    pass: ratio <= STEADY_RATIO,
    wave,
    ideal,
  }
}

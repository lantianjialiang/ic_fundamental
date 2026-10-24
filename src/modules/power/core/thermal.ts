/**
 * 热模型（PWR 课共用）：Foster 网络的瞬态热阻抗 Zth(t)，以及脉冲下的温升。
 */

/** Foster 网络：每级 Rth_i 与时间常数 τ_i，Zth(t) = Σ Rth_i (1 − e^(−t/τ_i)) */
export type ZthModel = { stages: Array<{ rth: number; tau: number }> }

/** 瞬态热阻抗 Zth(t)，单位 K/W */
export function zth(m: ZthModel, t: number): number {
  if (t <= 0) {
    return 0
  }
  return m.stages.reduce((sum, s) => sum + s.rth * (1 - Math.exp(-t / s.tau)), 0)
}

/** 功率 P（W）加 tPulse（s）后的结温升 ΔT = P · Zth(t)，K */
export function pulseHeating(pW: number, tPulse: number, m: ZthModel): number {
  return pW * zth(m, tPulse)
}

/** 稳态热阻 Rth = Σ Rth_i（t → ∞ 时的 Zth） */
export function steadyRth(m: ZthModel): number {
  return m.stages.reduce((sum, s) => sum + s.rth, 0)
}

/**
 * 单级模型下，温升达到 maxDeltaT 所需的脉宽：t = −τ · ln(1 − ΔTmax / (P · Rth))。
 * 若 ΔTmax ≥ P · Rth（稳态温升），返回 Infinity。
 */
export function singleStagePulseFor(pW: number, rth: number, tau: number, maxDeltaT: number): number {
  const steady = pW * rth
  if (maxDeltaT >= steady) {
    return Infinity
  }
  return -tau * Math.log(1 - maxDeltaT / steady)
}

/** 由 Rds(on) 温度系数 α 和温升算出的相对误差（小数），教学用线性近似 */
export function rdsErrorFromRise(alpha: number, deltaT: number): number {
  return alpha * deltaT
}

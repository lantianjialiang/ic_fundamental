/**
 * 相位噪声的教学模型（RF-10）。
 * L(f) 的单位是 dBc/Hz：偏移载波 f 处、每 1 Hz 带宽的单边噪声功率，相对载波功率。
 * 教学模型（不对应任何具体振荡器）：
 *   L(f) = 10·log10( 10^(L1k/10)·(1 kHz / f)² + 10^(Lfl/10) )
 *   第一项是 1/f² 段（偏移每增加十倍，L 下降 20 dB），L1k 是 1 kHz 处这一项的值；第二项是平坦的底噪 Lfl。
 *
 * 积分相位噪声（线性域）：
 *   θ_rms = √( 2 · ∫[f_lo, f_hi] L_lin(f) df )
 *   系数 2：L(f) 只算一个边带，两个边带合起来是 2L。解析式：
 *   ∫ c/f² df = c·(1/f_lo − 1/f_hi)，∫ fl df = fl·(f_hi − f_lo)。
 * 时间抖动：t_rms = θ_rms / (2π·f0)。积分上限固定为 10 MHz。
 */

/** 1/f² 项的参考偏移，1 kHz */
export const F_REF_HZ = 1e3
/** 积分上限，10 MHz */
export const F_HI_HZ = 1e7
/** 抖动预算（教学取值），ps */
export const JITTER_BUDGET_PS = 1.0
/** 载波频率选项，GHz；显示顺序即数组顺序 */
export const F0_OPTIONS_GHZ: number[] = [1, 5]
/** 积分下限选项，Hz；显示顺序即数组顺序 */
export const FLOW_OPTIONS_HZ: number[] = [1e3, 1e4, 1e5]

export type PnState = {
  /** 1 kHz 处 1/f² 项的 L，dBc/Hz */
  l1k: number
  /** 平坦底噪 Lfl，dBc/Hz */
  floor: number
  /** 载波频率，GHz */
  f0Ghz: number
  /** 积分下限，Hz */
  fLow: number
  /** 偏移频率的指数：f = 10^offsetExp Hz，滑块与图上的点都用它 */
  offsetExp: number
}

export const DEFAULT_PN: PnState = {
  l1k: -85,
  floor: -140,
  f0Ghz: F0_OPTIONS_GHZ[0],
  fLow: FLOW_OPTIONS_HZ[0],
  offsetExp: 5,
}

export function offsetHz(state: PnState): number {
  return 10 ** state.offsetExp
}

/** 频率的显示：Hz / kHz / MHz，取整 */
export function fmtFreq(hz: number): string {
  if (hz >= 1e6) {
    return `${Math.round(hz / 1e6)} MHz`
  }
  if (hz >= 1e3) {
    return `${Math.round(hz / 1e3)} kHz`
  }
  return `${Math.round(hz)} Hz`
}

/** 单点的 L(f)，dBc/Hz：1/f² 项与底噪项在线性域相加 */
export function lOf(state: PnState, hz: number): number {
  const flicker = 10 ** (state.l1k / 10) * (F_REF_HZ / hz) ** 2
  const floor = 10 ** (state.floor / 10)
  return 10 * Math.log10(flicker + floor)
}

export type PnAnalysis = {
  /** 偏移频率处的 L(f)，dBc/Hz */
  l: number
  /** 偏移处 1/f² 项的 L，dBc/Hz */
  lFlicker: number
  /** 偏移处底噪项，dBc/Hz */
  lFloor: number
  /** 积分区间内 1/f² 项的相位方差贡献（rad²） */
  varFlicker: number
  /** 积分区间内底噪项的相位方差贡献（rad²） */
  varFloor: number
  /** 积分相位噪声 θ_rms，rad */
  thetaRad: number
  /** 时间抖动 t_rms，ps */
  jitterPs: number
  /** 抖动是否在预算内 */
  pass: boolean
}

export function analysePn(state: PnState): PnAnalysis {
  const lo = state.fLow
  const hi = F_HI_HZ
  const flickerC = 10 ** (state.l1k / 10) * F_REF_HZ * F_REF_HZ
  const floorLin = 10 ** (state.floor / 10)

  const varFlicker = 2 * flickerC * (1 / lo - 1 / hi)
  const varFloor = 2 * floorLin * (hi - lo)
  const thetaRad = Math.sqrt(varFlicker + varFloor)
  const jitterPs = (thetaRad / (2 * Math.PI * state.f0Ghz * 1e9)) * 1e12

  const f = offsetHz(state)
  const flickerAtF = 10 * Math.log10(10 ** (state.l1k / 10) * (F_REF_HZ / f) ** 2)

  return {
    l: lOf(state, f),
    lFlicker: flickerAtF,
    lFloor: state.floor,
    varFlicker,
    varFloor,
    thetaRad,
    jitterPs,
    pass: jitterPs <= JITTER_BUDGET_PS,
  }
}

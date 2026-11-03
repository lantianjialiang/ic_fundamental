/**
 * 硅光教学模型（PIC）。数值是 VDUT-PIC1 的示意量级，不对应任何代工厂工艺。
 * 波长用 nm，长度用 µm，除非函数名另有说明。
 */

export const C_LIGHT = 2.998e8

/** SOI 220 nm 条形波导的教学默认值 */
export const PIC_TEACH = {
  neff: 2.4,
  ng: 4.2,
  lossDbPerCm: 2.5,
  gcDb: 3,
  lambdaNm: 1550,
  dneffDt: 1.8e-4,
  pdRespAW: 0.8,
  pdDarkA: 10e-9,
  mzmVpi: 4,
} as const

/** f = c/λ，返回 THz。1550 nm ≈ 193.4 THz */
export function lambdaToTHz(lambdaNm: number): number {
  return C_LIGHT / (lambdaNm * 1e3)
}

/** mW → dBm */
export function dbm(pMw: number): number {
  return 10 * Math.log10(Math.max(pMw, 1e-30))
}

/** dBm → mW */
export function mw(dbmValue: number): number {
  return 10 ** (dbmValue / 10)
}

/** dBm → W */
export function dbmToW(dbmValue: number): number {
  return mw(dbmValue) * 1e-3
}

export function linspace(start: number, stop: number, count: number): number[] {
  if (count <= 1) return [start]
  const out: number[] = []
  for (let i = 0; i < count; i += 1) out.push(start + ((stop - start) * i) / (count - 1))
  return out
}

/** 环形谐振器周长（µm） */
export function ringLengthUm(radiusUm: number): number {
  return 2 * Math.PI * radiusUm
}

/**
 * 一阶色散相位：φ = 2πL (ng/λ + (neff − ng)/λ0)。
 * L 用 µm，λ 用 nm。ng 缺省等于 neff 时退回 φ = 2π·neff·L/λ。
 */
export function waveguidePhase(p: {
  lambdaNm: number
  neff: number
  lengthUm: number
  ng?: number
  lambda0Nm?: number
}): number {
  const ng = p.ng ?? p.neff
  const lambda0Nm = p.lambda0Nm ?? PIC_TEACH.lambdaNm
  return 2 * Math.PI * p.lengthUm * 1000 * (ng / p.lambdaNm + (p.neff - ng) / lambda0Nm)
}

/**
 * 全通型环形谐振器功率透射。
 * T = (a² − 2ar·cosφ + r²) / (1 − 2ar·cosφ + (ar)²)，
 * φ = 2πL (ng/λ + (neff − ng)/λ0)。
 * a 是单圈幅度透过率，r 是自耦合系数。a = r 时谐振处 T = 0（临界耦合）。
 */
export function ringAllPass(p: {
  lambdaNm: number[]
  neff: number
  lengthUm: number
  a: number
  r: number
  ng?: number
  lambda0Nm?: number
}): number[] {
  return p.lambdaNm.map((lambda) => {
    const phi = waveguidePhase({
      lambdaNm: lambda,
      neff: p.neff,
      lengthUm: p.lengthUm,
      ng: p.ng,
      lambda0Nm: p.lambda0Nm,
    })
    const cos = Math.cos(phi)
    const ar = p.a * p.r
    const num = p.a * p.a - 2 * ar * cos + p.r * p.r
    const den = 1 - 2 * ar * cos + ar * ar
    return den === 0 ? 0 : num / den
  })
}

/** 谐振波长：φ(λ) = 2πm，取最接近 targetNm 的整数阶 */
export function resonantLambdaNm(neff: number, lengthUm: number, targetNm: number, ng = neff, lambda0Nm = targetNm): number {
  const m = Math.max(1, Math.round((neff * lengthUm) / (targetNm / 1000)))
  const inv = m / (lengthUm * 1000) - (neff - ng) / lambda0Nm
  if (inv <= 0) return (neff * lengthUm * 1000) / m
  return ng / inv
}

/** MZI 功率透射 T = cos²(Δφ/2)，Δφ = 2πΔL (ng/λ + (neff − ng)/λ0) */
export function mziTransmission(p: {
  lambdaNm: number[]
  neff: number
  dlUm: number
  ng?: number
  lambda0Nm?: number
}): number[] {
  return p.lambdaNm.map((lambda) => {
    const dphi = waveguidePhase({
      lambdaNm: lambda,
      neff: p.neff,
      lengthUm: p.dlUm,
      ng: p.ng,
      lambda0Nm: p.lambda0Nm,
    })
    return Math.cos(dphi / 2) ** 2
  })
}

/** FSR（nm）= λ² / (ng · L)。L 用 µm，λ 用 nm */
export function fsrNm(lambdaNm: number, ng: number, lengthUm: number): number {
  return (lambdaNm * lambdaNm) / (ng * lengthUm * 1000)
}

/** 热光漂移，pm/K。dλ/dT = (λ/ng)·dneff/dT */
export function thermalShiftPmPerK(lambdaNm: number, ng: number, dneffdT: number): number {
  return ((lambdaNm * 1000) / ng) * dneffdT
}

/** MZM：P = (P0/2)·(1 + cos(πV/Vπ + φ0)) */
export function mzmPower(p: { p0: number; v: number; vpi: number; phi0: number }): number {
  return (p.p0 / 2) * (1 + Math.cos((Math.PI * p.v) / p.vpi + p.phi0))
}

/** 正交点偏置：V = 0 时输出为 P0/2 */
export const QUADRATURE_PHI = -Math.PI / 2

/** ER（dB）= 10·log10(P1/P0)。P0 ≤ 0 时视为完全消光 */
export function er(p1: number, p0: number): number {
  if (p0 <= 0) return Number.POSITIVE_INFINITY
  return 10 * Math.log10(p1 / p0)
}

/** OMA = P1 − P0，与 P 同一单位 */
export function oma(p1: number, p0: number): number {
  return p1 - p0
}

/**
 * 偏置 φ0、驱动峰峰值 vpp（关于 0 对称）下的高低电平。
 * 插入损耗按平均功率相对 P0：IL = −10·log10(Pavg/P0)。
 */
export function mzmLevels(p0: number, vpi: number, phi0: number, vpp: number): {
  pHigh: number
  pLow: number
  erDb: number
  oma: number
  ilDb: number
} {
  const hi = mzmPower({ p0, v: vpp / 2, vpi, phi0 })
  const lo = mzmPower({ p0, v: -vpp / 2, vpi, phi0 })
  const pHigh = Math.max(hi, lo)
  const pLow = Math.min(hi, lo)
  const avg = (pHigh + pLow) / 2
  return {
    pHigh,
    pLow,
    erDb: er(pHigh, pLow),
    oma: oma(pHigh, pLow),
    ilDb: -10 * Math.log10(Math.max(avg, 1e-30) / Math.max(p0, 1e-30)),
  }
}

/** I = R·P + I_dark。P 用 W，R 用 A/W，返回 A */
export function pdCurrent(pW: number, rAW: number, idark: number): number {
  return rAW * pW + idark
}

/** 高斯模场失准损耗（dB）：L0 + 4.343·(Δ/w)² */
export function gcLossDb(deltaUm: number, wUm: number, l0Db: number): number {
  return l0Db + 4.343 * (deltaUm / wUm) ** 2
}

/** 各段损耗（dB）相加后的到达功率（dBm） */
export function linkBudgetDbm(laserDbm: number, lossesDb: number[]): number {
  return laserDbm - lossesDb.reduce((sum, loss) => sum + loss, 0)
}

/** 能耗/bit（J）= 功率 / 比特率 */
export function energyPerBitJ(powerW: number, bitRate: number): number {
  return powerW / bitRate
}

export type DipMetrics = {
  lambda0: number
  tMin: number
  tBase: number
  erDb: number
  fwhmNm: number
  q: number
}

/** 从一条透射谱读出谐振波长、消光比、FWHM 与 Q。透射是线性功率（不是 dB） */
export function dipMetrics(lambdaNm: number[], transmission: number[]): DipMetrics {
  let iMin = 0
  for (let i = 1; i < transmission.length; i += 1) {
    if (transmission[i] < transmission[iMin]) iMin = i
  }
  const sorted = [...transmission].sort((a, b) => a - b)
  const tBase = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9))]
  const tMin = transmission[iMin]
  const half = tMin + 0.5 * (tBase - tMin)
  let left = iMin
  while (left > 0 && transmission[left] < half) left -= 1
  let right = iMin
  while (right < transmission.length - 1 && transmission[right] < half) right += 1
  const cross = (i0: number, i1: number) => {
    const y0 = transmission[i0]
    const y1 = transmission[i1]
    const frac = y1 === y0 ? 0 : (half - y0) / (y1 - y0)
    return lambdaNm[i0] + (lambdaNm[i1] - lambdaNm[i0]) * frac
  }
  const fwhmNm = Math.max(0, cross(right - 1, right) - cross(left, left + 1))
  const erDb = 10 * Math.log10(Math.max(tBase, 1e-15) / Math.max(tMin, 1e-15))
  return {
    lambda0: lambdaNm[iMin],
    tMin,
    tBase,
    erDb,
    fwhmNm,
    q: fwhmNm > 0 ? lambdaNm[iMin] / fwhmNm : Number.POSITIVE_INFINITY,
  }
}

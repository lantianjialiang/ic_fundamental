/**
 * 光链路与 cut-back。BER 用标准正态的 Q 函数：BER = Q(Q因子)。
 * Q(7.034) ≈ 1e-12。
 */

/** BER = 1e-12 对应的 Q 因子（教学取 7.034） */
export const Q_BER_1E12 = 7.034

/** 标准正态右尾 Q(x) = 0.5·erfc(x/√2) */
export function qfunc(x: number): number {
  return 0.5 * erfc(x / Math.SQRT2)
}

/**
 * 热噪声主导、σ1 ≈ σ0 = σ 时，Q = R·OMA / (2σ)。
 * pRxOmaMw 是接收端 OMA（mW），sigmaA 是噪声电流（A），返回 BER。
 */
export function optLinkBer(p: { pRxOmaMw: number; rAW: number; sigmaA: number }): number {
  const omaW = p.pRxOmaMw * 1e-3
  const q = (p.rAW * omaW) / (2 * p.sigmaA)
  return qfunc(q)
}

/** 给定 Q 的最小 OMA（mW）= 2·Q·σ/R */
export function rxSensitivityOmaMw(q: number, sigmaA: number, rAW: number): number {
  return ((2 * q * sigmaA) / rAW) * 1e3
}

/** mW → dBm */
export function omaDbm(omaMw: number): number {
  return 10 * Math.log10(Math.max(omaMw, 1e-30))
}

export type CutbackFit = { slopeDbPerCm: number; interceptDb: number; r2: number }

/** 插入损耗对长度的直线回归。斜率 = 传输损耗（dB/cm），截距 = 两端耦合损耗之和 */
export function cutbackFit(lengthsCm: number[], lossDb: number[]): CutbackFit {
  const n = lengthsCm.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < n; i += 1) {
    sx += lengthsCm[i]
    sy += lossDb[i]
    sxx += lengthsCm[i] * lengthsCm[i]
    sxy += lengthsCm[i] * lossDb[i]
  }
  const denom = n * sxx - sx * sx
  const slope = denom === 0 ? 0 : (n * sxy - sx * sy) / denom
  const intercept = (sy - slope * sx) / n
  const yMean = sy / n
  let ssTot = 0
  let ssRes = 0
  for (let i = 0; i < n; i += 1) {
    const fit = slope * lengthsCm[i] + intercept
    ssRes += (lossDb[i] - fit) ** 2
    ssTot += (lossDb[i] - yMean) ** 2
  }
  return { slopeDbPerCm: slope, interceptDb: intercept, r2: ssTot === 0 ? 1 : 1 - ssRes / ssTot }
}

/** 良率连乘 */
export function yieldProduct(yields: number[]): number {
  return yields.reduce((acc, value) => acc * value, 1)
}

/** Abramowitz & Stegun 7.1.26，补余误差函数 */
function erfc(x: number): number {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.5 * z)
  const poly =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    )
  return x >= 0 ? poly : 2 - poly
}

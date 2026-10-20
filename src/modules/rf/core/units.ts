/**
 * 射频换算工具（纯函数，无 DOM）。
 * dB 是功率比的对数：dB = 10·log10(P2/P1)；dBm 以 1 mW 为基准；dBc 为相对载波的 dB。
 */

export type Complex = { re: number; im: number }

export function dbToRatio(db: number): number {
  return 10 ** (db / 10)
}

export function ratioToDb(ratio: number): number {
  return 10 * Math.log10(ratio)
}

export function dbmToMw(dbm: number): number {
  return 10 ** (dbm / 10)
}

export function mwToDbm(mw: number): number {
  return 10 * Math.log10(mw)
}

export function dbmToWatt(dbm: number): number {
  return 10 ** ((dbm - 30) / 10)
}

export function wattToDbm(watt: number): number {
  return 10 * Math.log10(watt * 1000)
}

export function magnitude(z: Complex): number {
  return Math.hypot(z.re, z.im)
}

/** 反射系数 Γ = (ZL − Z0) / (ZL + Z0)，复数除法 */
export function reflectionCoeff(zl: Complex, z0 = 50): Complex {
  const nr = zl.re - z0
  const ni = zl.im
  const dr = zl.re + z0
  const di = zl.im
  const d = dr * dr + di * di
  return {
    re: (nr * dr + ni * di) / d,
    im: (ni * dr - nr * di) / d,
  }
}

/** 回波损耗 RL = −20·log10|Γ|（dB）；|Γ| = 0 时为 Infinity */
export function returnLossDb(gammaMag: number): number {
  return -20 * Math.log10(gammaMag)
}

/** 电压驻波比 VSWR = (1 + |Γ|) / (1 − |Γ|)；|Γ| ≥ 1 时为 Infinity */
export function vswr(gammaMag: number): number {
  if (gammaMag >= 1) {
    return Infinity
  }
  return (1 + gammaMag) / (1 - gammaMag)
}

/** 失配损耗 = −10·log10(1 − |Γ|²)（dB）；|Γ| ≥ 1 时为 Infinity */
export function mismatchLossDb(gammaMag: number): number {
  if (gammaMag >= 1) {
    return Infinity
  }
  return -10 * Math.log10(1 - gammaMag * gammaMag)
}

/**
 * Friis 级联噪声系数（输入为各级的 NF(dB) 与增益(dB)，返回总 NF，dB）：
 * F = F1 + (F2−1)/G1 + (F3−1)/(G1·G2) + …（线性值）
 */
export function cascadeNfDb(stages: Array<{ nfDb: number; gainDb: number }>): number {
  let total = 0
  let gainSoFar = 1
  for (let i = 0; i < stages.length; i += 1) {
    const f = dbToRatio(stages[i].nfDb)
    if (i === 0) {
      total = f
    } else {
      total += (f - 1) / gainSoFar
    }
    gainSoFar *= dbToRatio(stages[i].gainDb)
  }
  return ratioToDb(total)
}

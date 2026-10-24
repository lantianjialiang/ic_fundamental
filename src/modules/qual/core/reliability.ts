/**
 * 可靠性教学模型（REL 课共用）：加速因子、Weibull 拟合、χ² 置信上限、Burn-in 残余。
 * 全部是纯函数，单位在注释里写明。数值与 scripts/check-qual.mjs 中的断言一致。
 */

/** Boltzmann 常数，eV/K */
export const K_BOLTZ_EV = 8.617e-5

const KELVIN_OFFSET = 273.15

/** 温度 °C → K */
export function toKelvin(tC: number): number {
  return tC + KELVIN_OFFSET
}

/** Arrhenius 温度加速因子：AF = exp[(Ea/k)(1/Tu − 1/Ts)]，温度用开尔文计算 */
export function arrheniusAF(eaEv: number, tUseC: number, tStressC: number): number {
  const tu = toKelvin(tUseC)
  const ts = toKelvin(tStressC)
  return Math.exp((eaEv / K_BOLTZ_EV) * (1 / tu - 1 / ts))
}

/** 电压加速因子：AF = exp[γ(Vs − Vu)]，γ 单位 1/V */
export function voltageAF(gamma: number, vUse: number, vStress: number): number {
  return Math.exp(gamma * (vStress - vUse))
}

/** Coffin-Manson 温度循环加速因子：AF = (ΔTs / ΔTu)^n */
export function coffinMansonAF(dtUse: number, dtStress: number, n: number): number {
  return Math.pow(dtStress / dtUse, n)
}

/** Black 方程：MTTF = A · J^(−n) · exp(Ea / kT)，T 为开尔文 */
export function blackMTTF(a: number, j: number, n: number, eaEv: number, tK: number): number {
  return a * Math.pow(j, -n) * Math.exp(eaEv / (K_BOLTZ_EV * tK))
}

/** 两参数 Weibull 累积分布 F(t) = 1 − exp[−(t/η)^β] */
export function weibullCdf(beta: number, eta: number, t: number): number {
  if (t <= 0) {
    return 0
  }
  return 1 - Math.exp(-Math.pow(t / eta, beta))
}

/** Weibull 风险函数 h(t) = (β/η)(t/η)^(β−1)，单位 1/时间 */
export function weibullHazard(beta: number, eta: number, t: number): number {
  if (t <= 0) {
    return 0
  }
  return (beta / eta) * Math.pow(t / eta, beta - 1)
}

/**
 * Weibull 拟合：中位秩回归（Bernard 近似 (i−0.3)/(n+0.4)）。
 * censored[i] = true 表示第 i 颗在试验结束时仍未失效（右删失）；删失点不参与回归，
 * 但占据顺序位置，用 Johnson 调整秩处理，使后续失效的秩正确抬高。
 */
export function fitWeibull(times: number[], censored?: boolean[]): { beta: number; eta: number; r2: number } {
  const n = times.length
  const items = times.map((t, i) => ({ t, c: censored ? censored[i] === true : false }))
  items.sort((a, b) => a.t - b.t || Number(a.c) - Number(b.c))
  const xs: number[] = []
  const ys: number[] = []
  let prevRank = 0
  for (let i = 0; i < n; i += 1) {
    const item = items[i]
    if (item.c) {
      continue
    }
    const reverse = n - i
    const adjusted = prevRank + (n + 1 - prevRank) / (1 + reverse)
    prevRank = adjusted
    const f = (adjusted - 0.3) / (n + 0.4)
    xs.push(Math.log(item.t))
    ys.push(Math.log(-Math.log(1 - f)))
  }
  const m = xs.length
  if (m < 2) {
    return { beta: NaN, eta: NaN, r2: NaN }
  }
  const mx = xs.reduce((s, v) => s + v, 0) / m
  const my = ys.reduce((s, v) => s + v, 0) / m
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (let i = 0; i < m; i += 1) {
    sxx += (xs[i] - mx) * (xs[i] - mx)
    sxy += (xs[i] - mx) * (ys[i] - my)
    syy += (ys[i] - my) * (ys[i] - my)
  }
  const beta = sxy / sxx
  const intercept = my - beta * mx
  const eta = Math.exp(-intercept / beta)
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy)
  return { beta, eta, r2 }
}

/** ln Γ(x)，Lanczos 近似（x > 0） */
function lnGamma(x: number): number {
  const g = 7
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61503916999385, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x)
  }
  const xx = x - 1
  let a = coef[0]
  const t = xx + g + 0.5
  for (let i = 1; i < g + 2; i += 1) {
    a += coef[i] / (xx + i)
  }
  return 0.5 * Math.log(2 * Math.PI) + (xx + 0.5) * Math.log(t) - t + Math.log(a)
}

/** 正则化下不完全 Γ 函数 P(a, x)：级数（x < a+1）或连分式 */
function gammaP(a: number, x: number): number {
  if (x <= 0) {
    return 0
  }
  const gln = lnGamma(a)
  if (x < a + 1) {
    let ap = a
    let del = 1 / a
    let sum = del
    for (let i = 0; i < 500; i += 1) {
      ap += 1
      del *= x / ap
      sum += del
      if (Math.abs(del) < Math.abs(sum) * 1e-14) {
        break
      }
    }
    return sum * Math.exp(-x + a * Math.log(x) - gln)
  }
  const tiny = 1e-300
  let b = x + 1 - a
  let c = 1 / tiny
  let d = 1 / b
  let h = d
  for (let i = 1; i < 500; i += 1) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < tiny) {
      d = tiny
    }
    c = b + an / c
    if (Math.abs(c) < tiny) {
      c = tiny
    }
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-14) {
      break
    }
  }
  return 1 - Math.exp(-x + a * Math.log(x) - gln) * h
}

/** χ² 分布的分位数：返回 x，使 P(χ²(dof) ≤ x) = p。dof 为正偶数或奇数均可 */
export function chi2Quantile(p: number, dof: number): number {
  if (p <= 0) {
    return 0
  }
  let lo = 0
  let hi = 1
  while (gammaP(dof / 2, hi / 2) < p) {
    hi *= 2
    if (hi > 1e7) {
      break
    }
  }
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2
    if (gammaP(dof / 2, mid / 2) < p) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

/**
 * 零失效（或 r 次失效）时的失效率上限，单位 /h。
 * λ_upper = χ²(CL, 2r+2) / (2 · DH · AF)，DH = 样本数 × 小时数（器件小时，未加速）。
 * 乘以 1e9 即为 FIT。
 */
export function fitUpperBound(r: number, deviceHours: number, cl: number, af: number): number {
  return chi2Quantile(cl, 2 * r + 2) / (2 * deviceHours * af)
}

/** 证明 fitTarget（FIT）所需的最少样本数（零失效）：n ≥ χ²(CL,2) / (2 · h · AF · λ_target) */
export function minSampleZeroFail(fitTarget: number, cl: number, hours: number, af: number): number {
  const lambda = fitTarget * 1e-9
  return Math.ceil(chi2Quantile(cl, 2) / (2 * hours * af * lambda))
}

/**
 * Burn-in 后仍留在群体中的早期缺陷比例：p · [1 − F_d(h · AF)]。
 * h = 0 时等于 p；h 足够长时趋近 0（只要 h·AF 超过缺陷群体的 η 量级）。
 */
export function burnInResidual(p: number, beta: number, eta: number, biHours: number, af: number): number {
  return p * (1 - weibullCdf(beta, eta, biHours * af))
}

/** 失效率（/h）→ FIT（每 10⁹ 器件小时的失效数） */
export function toFit(lambdaPerHour: number): number {
  return lambdaPerHour * 1e9
}

/** 恒定失效率下的 MTTF（h）= 1 / λ */
export function mttfFromFit(fit: number): number {
  return 1e9 / fit
}

/** 可靠度 R(t) = exp(−λt)，λ 为 FIT */
export function reliabilityFromFit(fit: number, hours: number): number {
  return Math.exp(-(fit * 1e-9) * hours)
}

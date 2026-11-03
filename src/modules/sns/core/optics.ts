/**
 * 光电基础常数与换算（SNS）。教学示意，不对应任何真实传感器型号。
 */

export const H_PLANCK = 6.626e-34
export const C_LIGHT = 2.998e8
export const Q_ELECTRON = 1.602e-19
export const K_BOLTZ = 1.381e-23

/** 光子能量（J）= hc/λ */
export function photonEnergyJ(lambdaNm: number): number {
  return (H_PLANCK * C_LIGHT) / (lambdaNm * 1e-9)
}

/** 光子通量（光子/s）= P / E */
export function photonFlux(powerW: number, lambdaNm: number): number {
  return powerW / photonEnergyJ(lambdaNm)
}

/** 响应度（A/W）= QE · λ[µm] / 1.2398 */
export function responsivity(qe: number, lambdaNm: number): number {
  return (qe * (lambdaNm / 1000)) / 1.2398
}

/** 复位 kTC 噪声，单位 e⁻ rms：√(kTC)/q */
export function kTcNoiseE(cFarad: number, tK: number): number {
  return Math.sqrt(K_BOLTZ * tK * cFarad) / Q_ELECTRON
}

/**
 * 转换增益（V/e⁻）= q/C。
 * C = 1 fF → 约 160 µV/e⁻。
 */
export function conversionGainV(cFarad: number): number {
  return Q_ELECTRON / cFarad
}

/**
 * SNR（线性）= S / √(S + D + σr²)。
 * S、D、σr 都用电子数。返回值再取 20·log10 就是 dB。
 */
export function snrLinear(signalE: number, darkE: number, readNoiseE: number): number {
  return signalE / Math.sqrt(Math.max(signalE + darkE + readNoiseE * readNoiseE, 1e-30))
}

export function snrDb(signalE: number, darkE: number, readNoiseE: number): number {
  return 20 * Math.log10(Math.max(snrLinear(signalE, darkE, readNoiseE), 1e-30))
}

/** 散粒噪声等于读噪时的信号电子数 = σr² */
export function shotEqualsReadE(readNoiseE: number): number {
  return readNoiseE * readNoiseE
}

/** 暗电流随温度：i(T) = i25 · 2^((T−25)/ΔT)。ΔT 是翻倍温度间隔 */
export function darkElectronsPerS(darkE25: number, tempC: number, doubleC: number): number {
  return darkE25 * 2 ** ((tempC - 25) / doubleC)
}

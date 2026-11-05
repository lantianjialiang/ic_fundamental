import { poissonYield, TEACH } from '../mfg/core'

export { poissonYield, TEACH }
export const RETICLE_MM2 = TEACH.reticleMm2

export function siliconPerGoodMm2(d0: number, areaMm2: number): number {
  return areaMm2 / poissonYield(d0, areaMm2)
}

export function knownGoodProb(yieldDie: number, coverage: number): number {
  return yieldDie / (yieldDie + (1 - yieldDie) * (1 - coverage))
}

export function stackYieldW2W(dieYields: number[], bondYield: number): number {
  return dieYields.reduce((acc, y) => acc * y, 1) * bondYield ** Math.max(0, dieYields.length - 1)
}

export function stackYieldD2W(dieYields: number[], coverage: number, bondYield: number): number {
  const kgd = dieYields.map((y) => knownGoodProb(y, coverage))
  return stackYieldW2W(kgd, bondYield)
}

export function tsvResistance(rhoOhmM: number, lengthM: number, radiusM: number): number {
  return (rhoOhmM * lengthM) / (Math.PI * radiusM * radiusM)
}

export function tsvLinerCapacitance(epsR: number, lengthM: number, rM: number, toxM: number): number {
  return (2 * Math.PI * TEACH.eps0 * epsR * lengthM) / Math.log((rM + toxM) / rM)
}

export function daisyChainResistance(n: number, rTsv: number, rBump: number, defects: Array<{ index: number; factor: number }> = []): number {
  let sum = n * (rTsv + rBump)
  for (const d of defects) {
    if (d.index >= 0 && d.index < n) sum += rTsv * (d.factor - 1)
  }
  return sum
}

export function shorelineBandwidthGbpsPerMm(rows: number, pitchUm: number, gbpsPerLane: number): number {
  return rows * (1000 / pitchUm) * gbpsPerLane
}

export function energyPerBitPj(cPf: number, vV: number, activity: number): number {
  return activity * cPf * vV * vV
}

export function ioDensityPerMm2(pitchUm: number): number {
  return (1000 / pitchUm) ** 2
}

export function floorplanArea(dies: Array<{ w: number; h: number }>, spacingMm: number, marginMm: number) {
  const n = dies.length
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  const cellW = Math.max(...dies.map((d) => d.w))
  const cellH = Math.max(...dies.map((d) => d.h))
  const w = cols * cellW + Math.max(0, cols - 1) * spacingMm + 2 * marginMm
  const h = rows * cellH + Math.max(0, rows - 1) * spacingMm + 2 * marginMm
  return { w, h, area: w * h, needsStitching: w * h > RETICLE_MM2 }
}

export function rcDelayPs(rOhm: number, cF: number): number {
  return 0.38 * rOhm * cF * 1e12
}

export function layerStackRth(layers: Array<{ thicknessM: number; kWmK: number; areaM2: number }>) {
  const perLayer = layers.map((l) => l.thicknessM / (l.kWmK * l.areaM2))
  return { perLayer, total: perLayer.reduce((a, b) => a + b, 0) }
}

export function hbmBandwidthGBps(widthBits: number, gbpsPerPin: number): number {
  return (widthBits * gbpsPerPin) / 8
}

export function currentDensityAPerM2(iA: number, radiusM: number): number {
  return iA / (Math.PI * radiusM * radiusM)
}

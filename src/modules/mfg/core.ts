/** MFG / APK 共用的教学示意模型。金额、良率、尺寸都是相对量级，不是任何公司的数据。 */

export const TEACH = {
  waferMm: 300,
  dieMm: 10,
  scribeMm: 0.1,
  d0: 0.1,
  eps0: 8.854e-12,
  rhoCu: 1.68e-8,
  reticleMm2: 26 * 33,
} as const

export function diesPerWafer(waferMm: number, dieW: number, dieH: number, scribeMm: number, edgeExclMm: number): number {
  const area = (dieW + scribeMm) * (dieH + scribeMm)
  const d = Math.max(0, waferMm - 2 * edgeExclMm)
  if (area <= 0 || d <= 0) return 0
  return Math.round((Math.PI * (d / 2) ** 2) / area - (Math.PI * d) / Math.sqrt(2 * area))
}

function areaCm2(areaMm2: number) {
  return areaMm2 / 100
}

export function poissonYield(d0PerCm2: number, areaMm2: number): number {
  return Math.exp(-d0PerCm2 * areaCm2(areaMm2))
}

export function murphyYield(d0PerCm2: number, areaMm2: number): number {
  const ad = d0PerCm2 * areaCm2(areaMm2)
  if (ad < 1e-9) return 1
  const x = (1 - Math.exp(-ad)) / ad
  return x * x
}

export function negBinomialYield(d0PerCm2: number, areaMm2: number, alpha: number): number {
  const ad = d0PerCm2 * areaCm2(areaMm2)
  return (1 + ad / alpha) ** -alpha
}

export function rayleighCdNm(k1: number, lambdaNm: number, na: number): number {
  return (k1 * lambdaNm) / na
}

export function d0Learning(d00: number, dInf: number, tauMonths: number, t: number): number {
  return dInf + (d00 - dInf) * Math.exp(-t / tauMonths)
}

export function sheetResistance4pt(vV: number, iA: number): number {
  return (Math.PI / Math.LN2) * (vV / iA)
}

export function viaChainResistance(n: number, rVia: number): number {
  return n * rVia
}

export function cpk(mean: number, sigma: number, lsl: number, usl: number): number {
  return Math.min((usl - mean) / (3 * sigma), (mean - lsl) / (3 * sigma))
}

export function controlLimits(mean: number, sigma: number, n: number): { lcl: number; ucl: number } {
  const half = (3 * sigma) / Math.sqrt(n)
  return { lcl: mean - half, ucl: mean + half }
}

export function unitCost(nre: number, volume: number, variable: number): number {
  return nre / volume + variable
}

export function breakEvenVolume(nreA: number, varA: number, nreB: number, varB: number): number {
  return (nreB - nreA) / (varA - varB)
}

export function mpwShare(maskCost: number, nProjects: number): number {
  return maskCost / nProjects
}

export function perInsertionCost(consumableCost: number, lifeInsertions: number): number {
  return consumableCost / lifeInsertions
}

export function maxSites(testerChannels: number, pinsPerDut: number): number {
  return Math.floor(testerChannels / pinsPerDut)
}

export function seriesLBandwidthGHz(lNh: number, z0: number): number {
  return (2 * z0) / (2 * Math.PI * lNh)
}

export function microstripZ0(w: number, h: number, t: number, epsR: number): number {
  return (87 / Math.sqrt(epsR + 1.41)) * Math.log((5.98 * h) / (0.8 * w + t))
}

export function escapeTraces(pitch: number, padDia: number, line: number, space: number): number {
  return Math.floor((pitch - padDia - space) / (line + space))
}

export function layerYield(perLayerYield: number, layers: number): number {
  return perLayerYield ** layers
}

export function panelUnits(panelW: number, panelH: number, margin: number, unitW: number, unitH: number, gap: number) {
  const usableW = panelW - 2 * margin
  const usableH = panelH - 2 * margin
  const nx = Math.floor((usableW + gap) / (unitW + gap))
  const ny = Math.floor((usableH + gap) / (unitH + gap))
  const n = nx * ny
  return { nx, ny, n, utilization: (n * unitW * unitH) / (panelW * panelH) }
}

export function allPairsIsolation(nets: number): number {
  return (nets * (nets - 1)) / 2
}

export function flyingProbeTimeS(testPoints: number, moveTimeS: number, probes: number): number {
  return (testPoints * moveTimeS) / probes
}

export function fixtureBreakEven(nreFixture: number, costFlyingPerUnit: number, costFixturePerUnit: number): number {
  return nreFixture / (costFlyingPerUnit - costFixturePerUnit)
}

export type FlowNode = {
  name: string
  yield: number
  coverage?: number
  testCost?: number
  stepCost?: number
  scrapsValue?: boolean
}

export function flowYieldCost(nodes: FlowNode[]) {
  let yieldAll = 1
  let spent = 0
  let scrap = 0
  let test = 0
  for (const node of nodes) {
    spent += node.stepCost ?? 0
    test += node.testCost ?? 0
    spent += node.testCost ?? 0
    scrap += (1 - node.yield) * spent
    spent *= node.yield
    yieldAll *= node.yield
  }
  return { yield: yieldAll, costPerGood: yieldAll > 0 ? spent / yieldAll : Infinity, scrapCost: scrap, testCost: test }
}

export function planTouchdowns(dies: number, cols: number, rows: number) {
  const n = cols * rows
  const touchdowns = Math.ceil(dies / n)
  const partial = touchdowns * n - dies
  return { touchdowns, partial, efficiency: dies / (touchdowns * n) }
}

export function waferTestTime(touchdowns: number, tTouchdownS: number, tLoadS: number): number {
  return touchdowns * tTouchdownS + tLoadS
}

export function product(values: number[]): number {
  return values.reduce((acc, v) => acc * v, 1)
}

// 图中几何（本地坐标，单位是示意像素）：横截面和俯视图共用，横截面就是俯视图上 A–A 线的剖开
export type Span = [number, number]

export const GEO = {
  width: 360,
  height: 260,
  centerY: 130,
  edge: 340,
  viaX: 150,
  padR: 30,
  holeR: 16,
  maskExp: 4,
}

export const TRACES: Span[] = [[22, 18], [54, 18], [86, 18]]
export const VIA_PAD: Span = [120, 60]
export const SMD: Span[] = [[232, 30], [284, 30]]
export const INNER_CU: Span[] = [...TRACES, VIA_PAD]
export const OUTER_CU: Span[] = [...TRACES, VIA_PAD, ...SMD]
export const OPENINGS: Span[] = [
  [VIA_PAD[0] - GEO.maskExp, VIA_PAD[1] + 2 * GEO.maskExp],
  ...SMD.map((s): Span => [s[0] - GEO.maskExp, s[1] + 2 * GEO.maskExp]),
]
export const LEGEND_BAR: Span = [200, 6]

/** 区间的补集：不在 spans 里的那些间隔 */
export function gapsOf(spans: Span[], total: number): Span[] {
  const sorted = [...spans].sort((a, b) => a[0] - b[0])
  const out: Span[] = []
  let cursor = 0
  for (const [x, w] of sorted) {
    if (x > cursor) {
      out.push([cursor, x - cursor])
    }
    cursor = x + w
  }
  if (cursor < total) {
    out.push([cursor, total - cursor])
  }
  return out
}

// 设计规则的数值来源（mm，示意参数，各厂能力不同）
export const RULE = {
  boardMm: 1.6,
  arMax: 8,
  drillPosTol: 0.05,
  layerRegTol: 0.075,
  routeTol: 0.1,
  edgeMargin: 0.15,
  maskRegTol: 0.05,
  maskResolution: 0.075,
  maskExpansion: 0.05,
  inkRegTol: 0.15,
  inkLine: 0.15,
}

export const minDrill = RULE.boardMm / RULE.arMax
export const minRing = RULE.drillPosTol + RULE.layerRegTol
export const minEdge = RULE.routeTol + RULE.edgeMargin
export const minDam = Math.max(RULE.maskResolution, 2 * RULE.maskRegTol)
export const minPadGap = minDam + 2 * RULE.maskExpansion
export const minInkClear = RULE.inkRegTol

// 蚀刻规则：侧蚀 = 铜厚 ÷ 蚀刻因子；干膜分辨率约为膜厚的 2 倍；窄缝里药水换不动，缝宽要 ≥ 1.5 倍铜厚
export type EtchLayer = 'inner' | 'outer'

export const ETCH = {
  factor: 3,
  floor: 50,
  copper: { inner: 18, outer: 50 } as Record<EtchLayer, number>,
  film: { inner: 25, outer: 38 } as Record<EtchLayer, number>,
}

export type EtchResult = {
  t: number
  u: number
  wf: number
  sf: number
  wt: number
  minW: number
  minS: number
  trace: 'ok' | 'weak' | 'open'
  space: 'ok' | 'short'
}

export function etchCheck(layer: EtchLayer, w: number, s: number, comp: boolean): EtchResult {
  const t = ETCH.copper[layer]
  const u = t / ETCH.factor
  const wf = comp ? w + 2 * u : w
  const sf = comp ? s - 2 * u : s
  const wt = wf - 2 * u
  const sMin = Math.max(2 * ETCH.film[layer], 1.5 * t)
  let trace: EtchResult['trace'] = 'ok'
  if (wt < ETCH.floor / 2) {
    trace = 'open'
  } else if (wt < ETCH.floor) {
    trace = 'weak'
  }
  return {
    t,
    u,
    wf,
    sf,
    wt,
    minW: comp ? ETCH.floor : 2 * u + ETCH.floor,
    minS: comp ? sMin + 2 * u : sMin,
    trace,
    space: sf < sMin ? 'short' : 'ok',
  }
}

export const umToMil = (um: number) => um / 25.4

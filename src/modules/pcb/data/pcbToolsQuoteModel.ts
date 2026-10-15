// 示意成本模型：所有系数都是为教学编的整数，不对应任何一家板厂
export type LineId = 'eng' | 'board' | 'tool' | 'etest' | 'finish' | 'expedite' | 'ship'

export type Finish = 'hasl' | 'osp' | 'enig'
export type MaskColor = 'green' | 'black' | 'white'
export type Speed = 'std' | 'fast' | 'rush'
export type Ship = 'std' | 'express'

export type Opts = {
  layers: 2 | 4 | 6
  thick: 1 | 1.6 | 2
  copper: 1 | 2
  finish: Finish
  mask: MaskColor
  qty: 5 | 10 | 20 | 50 | 100
  w: number
  h: number
  track: 0.15 | 0.1
  hole: 0.3 | 0.2
  imp: boolean
  panel: boolean
  speed: Speed
  ship: Ship
}

export const SAMPLE: Opts = {
  layers: 2,
  thick: 1.6,
  copper: 1,
  finish: 'hasl',
  mask: 'green',
  qty: 5,
  w: 30,
  h: 20,
  track: 0.15,
  hole: 0.3,
  imp: false,
  panel: false,
  speed: 'std',
  ship: 'std',
}

export const LINE_IDS: LineId[] = ['eng', 'board', 'tool', 'etest', 'finish', 'expedite', 'ship']

const RATE: Record<number, number> = { 2: 0.2, 4: 0.6, 6: 1.1 }
const ENG: Record<number, number> = { 2: 20, 4: 40, 6: 70 }
const THK: Record<number, number> = { 1: 1.1, 1.6: 1, 2: 1.2 }
const CU: Record<number, number> = { 1: 1, 2: 1.4 }
const SPEED_RATE: Record<Speed, number> = { std: 0, fast: 0.4, rush: 1 }
const SPEED_DAYS: Record<Speed, number> = { std: 0, fast: 2, rush: 3 }
const BASE_DAYS: Record<number, number> = { 2: 4, 4: 6, 6: 9 }
const RAIL = 10
const DENSITY = 1.85
const PACK_G = 100

export function discount(pcs: number) {
  if (pcs >= 100) {
    return 0.55
  }
  if (pcs >= 50) {
    return 0.65
  }
  if (pcs >= 20) {
    return 0.8
  }
  if (pcs >= 10) {
    return 0.9
  }
  return 1
}

export type Quote = {
  lines: Record<LineId, number>
  total: number
  perBoard: number
  pcs: number
  areaCm2: number
  kg: number
  days: number
  disc: number
}

export function quote(o: Opts): Quote {
  // 拼板：2×2 阵列，左右各加 5 mm 工艺边，按阵列面积计费
  const sets = o.panel ? Math.ceil(o.qty / 4) : o.qty
  const pcs = o.panel ? sets * 4 : o.qty
  const setMm2 = o.panel ? (2 * o.w + RAIL) * (2 * o.h) : o.w * o.h
  const areaCm2 = (setMm2 * sets) / 100
  const disc = discount(pcs)
  const fineT = o.track === 0.1 ? 1.25 : 1
  const fineH = o.hole === 0.2 ? 1.2 : 1
  const board = areaCm2 * RATE[o.layers] * THK[o.thick] * CU[o.copper] * fineT * fineH * disc
  const kg = (areaCm2 * (o.thick / 10) * DENSITY + PACK_G) / 1000
  const lines: Record<LineId, number> = {
    eng: ENG[o.layers] + (o.track === 0.1 ? 10 : 0) + (o.hole === 0.2 ? 10 : 0) + (o.imp ? 30 : 0),
    board,
    tool: 5 * o.layers + (o.panel ? 6 : 0),
    etest: (pcs * 0.4 * o.layers) / 2,
    finish: (o.finish === 'enig' ? 0.08 * areaCm2 : 0) + (o.mask === 'green' ? 0 : 3),
    expedite: board * SPEED_RATE[o.speed],
    ship: o.ship === 'std' ? 6 + 8 * kg : 18 + 14 * kg,
  }
  const total = LINE_IDS.reduce((sum, id) => sum + lines[id], 0)
  const base = BASE_DAYS[o.layers] + (o.track === 0.1 ? 1 : 0) + (o.hole === 0.2 ? 1 : 0) + (o.imp ? 2 : 0)
  const days = Math.max(2, base - SPEED_DAYS[o.speed])
  return { lines, total, perBoard: total / pcs, pcs, areaCm2, kg, days, disc }
}

export function money(n: number) {
  return `$${n.toFixed(2)}`
}

export function delta(n: number) {
  if (Math.abs(n) < 0.005) {
    return '0.00'
  }
  return `${n > 0 ? '+' : '-'}${Math.abs(n).toFixed(2)}`
}

/** 每一行的算式，数字全部由模型算出 */
export function formula(id: LineId, o: Opts, q: Quote): string {
  const rate = RATE[o.layers]
  if (id === 'eng') {
    const parts = [`${ENG[o.layers]}`]
    if (o.track === 0.1) {
      parts.push('10')
    }
    if (o.hole === 0.2) {
      parts.push('10')
    }
    if (o.imp) {
      parts.push('30')
    }
    return parts.join(' + ')
  }
  if (id === 'board') {
    return `${q.areaCm2.toFixed(1)} cm2 × ${rate.toFixed(2)} × ${THK[o.thick]} × ${CU[o.copper]} × ${o.track === 0.1 ? 1.25 : 1} × ${o.hole === 0.2 ? 1.2 : 1} × ${q.disc}`
  }
  if (id === 'tool') {
    return o.panel ? `5 × ${o.layers} + 6` : `5 × ${o.layers}`
  }
  if (id === 'etest') {
    return `${q.pcs} × 0.4 × ${o.layers} / 2`
  }
  if (id === 'finish') {
    const enig = o.finish === 'enig' ? `0.08 × ${q.areaCm2.toFixed(1)} cm2` : '0'
    return o.mask === 'green' ? enig : `${enig} + 3`
  }
  if (id === 'expedite') {
    return `${money(q.lines.board)} × ${SPEED_RATE[o.speed]}`
  }
  const base = o.ship === 'std' ? '6 + 8' : '18 + 14'
  return `${base} × ${q.kg.toFixed(3)} kg`
}

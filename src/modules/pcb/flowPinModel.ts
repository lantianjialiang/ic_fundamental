import { SOIC_NAMES, SOT23_DS, SOT23_LIB, type PinCase, type PinView } from './data/pcbFlow'

/** 局部坐标（px，面板中心为原点，y 向下）。尺寸为示意，不按真实毫米画。 */
export type Box = { cx: number; cy: number; w: number; h: number }
export type ChipPin = Box & { n: number; name: string }
export type Pad = Box & { num: number; name: string }
export type Landing = { pin: ChipPin; pad: Pad; ok: boolean; offsetMm: number; overlapPct: number }

export const PIN_COUNT: Record<PinCase, number> = { sot23: 3, soic: 8, qfn: 16 }

export const BODY: Record<PinCase, Box> = {
  sot23: { cx: 0, cy: 0, w: 110, h: 50 },
  soic: { cx: 0, cy: 0, w: 84, h: 136 },
  qfn: { cx: 0, cy: 0, w: 160, h: 160 },
}

// QFN：1 px = 1/QK mm。器件 0.65 mm 间距；库里错选 0.5 mm
const QK = 40
const Q_TERM = { w: 0.35, len: 0.4, pitch: 0.65 }
const Q_PAD = { lib: { w: 0.3, pitch: 0.5 }, fixed: { w: 0.4, pitch: 0.65 }, len: 0.8 }
const Q_MIN_OVERLAP = 50

function qfnBox(n: number, pitch: number, w: number, len: number): Box {
  const side = Math.floor((n - 1) / 4)
  const j = (n - 1) % 4
  const u = (j - 1.5) * pitch * QK
  const c = 1.8 * QK
  const long = len * QK
  const wide = w * QK
  if (side === 0) {
    return { cx: -c, cy: u, w: long, h: wide }
  }
  if (side === 1) {
    return { cx: u, cy: c, w: wide, h: long }
  }
  if (side === 2) {
    return { cx: c, cy: -u, w: long, h: wide }
  }
  return { cx: -u, cy: -c, w: wide, h: long }
}

function soicBox(n: number, padded: boolean): Box {
  const row = n <= 4 ? n - 1 : 8 - n
  const cy = (row - 1.5) * 34
  const left = n <= 4
  const cx = (left ? -1 : 1) * (padded ? 59 : 52)
  return { cx, cy, w: padded ? 40 : 20, h: padded ? 16 : 14 }
}

function sotBox(n: number, padded: boolean): Box {
  const x = n === 1 ? -35 : n === 2 ? 35 : 0
  const dy = n === 3 ? -1 : 1
  return { cx: x, cy: dy * (padded ? 44 : 36), w: padded ? 28 : 20, h: padded ? 36 : 22 }
}

function chipName(kase: PinCase, n: number) {
  if (kase === 'sot23') {
    return SOT23_DS[n]
  }
  if (kase === 'soic') {
    return SOIC_NAMES[n]
  }
  return `P${n}`
}

function padName(kase: PinCase, view: PinView, num: number) {
  if (kase === 'sot23') {
    return (view === 'lib' ? SOT23_LIB : SOT23_DS)[num]
  }
  return chipName(kase, num)
}

export function chipPins(kase: PinCase): ChipPin[] {
  return Array.from({ length: PIN_COUNT[kase] }, (_, i) => {
    const n = i + 1
    const box = kase === 'sot23' ? sotBox(n, false) : kase === 'soic' ? soicBox(n, false) : qfnBox(n, Q_TERM.pitch, Q_TERM.w, Q_TERM.len)
    return { ...box, n, name: chipName(kase, n) }
  })
}

export function pads(kase: PinCase, view: PinView): Pad[] {
  return Array.from({ length: PIN_COUNT[kase] }, (_, i) => {
    const num = i + 1
    let box: Box
    if (kase === 'sot23') {
      box = sotBox(num, true)
    } else if (kase === 'soic') {
      // 底视图编号：和俯视图左右镜像
      const b = soicBox(num, true)
      box = view === 'lib' ? { ...b, cx: -b.cx } : b
    } else {
      const p = Q_PAD[view]
      box = qfnBox(num, p.pitch, p.w, Q_PAD.len)
    }
    return { ...box, num, name: padName(kase, view, num) }
  })
}

function overlapMm(a: number, aw: number, b: number, bw: number) {
  return Math.max(0, Math.min(a + aw / 2, b + bw / 2) - Math.max(a - aw / 2, b - bw / 2))
}

export function landing(kase: PinCase, view: PinView, n: number): Landing {
  const pin = chipPins(kase)[n - 1]
  const all = pads(kase, view)
  if (kase === 'qfn') {
    const pad = all[n - 1]
    const horizontal = pin.w > pin.h
    const t = horizontal ? pin.cy : pin.cx
    const p = horizontal ? pad.cy : pad.cx
    const tw = Q_TERM.w
    const pw = view === 'lib' ? Q_PAD.lib.w : Q_PAD.fixed.w
    const overlap = (overlapMm(t / QK, tw, p / QK, pw) / tw) * 100
    return { pin, pad, ok: overlap >= Q_MIN_OVERLAP, offsetMm: Math.abs(t - p) / QK, overlapPct: overlap }
  }
  let pad = all[0]
  let best = Infinity
  for (const cand of all) {
    const d = Math.hypot(cand.cx - pin.cx, cand.cy - pin.cy)
    if (d < best) {
      best = d
      pad = cand
    }
  }
  return { pin, pad, ok: pin.name === pad.name, offsetMm: 0, overlapPct: 100 }
}

export function allLandings(kase: PinCase, view: PinView): Landing[] {
  return chipPins(kase).map((p) => landing(kase, view, p.n))
}

export function wrongCount(kase: PinCase, view: PinView) {
  return allLandings(kase, view).filter((l) => !l.ok).length
}

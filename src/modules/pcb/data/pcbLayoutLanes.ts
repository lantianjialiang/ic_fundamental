// 回流「车道」的几何：动画、截面曲线和读数都从同一批折线算出来
import { type FreqId, type PlaneId } from './pcbLayoutReturn'

export type Pt = [number, number]
export type Lane = { pts: Pt[]; w: number; yCut: number }

export const TRACE_Y = 116
export const X_SRC = 70
export const X_LOAD = 610
export const PLANE = { x: 40, y: 36, w: 600, h: 160 }
export const SLOT = { x: 326, y: 56, w: 28, h: 120 }
export const CUT_X = 340
export const H_PX = 5 // 走线到平面的距离（图上像素）
export const SPREAD_PX = 30 // 低频时回流散开的尺度
const HF_OFFSETS = [-15, -8, -3, 3, 8, 15]
const LF_PEAKS = [-64, -48, -32, -16, -4, 4, 16, 32, 48, 64]
const SLOT_HALF = SLOT.h / 2

const lorentz = (v: number, s: number) => 1 / (1 + (v / s) * (v / s))

const BUMP_PX = 45 // 槽附近车道被推开的范围

/** 从负载到源的抛物线弧（峰值偏移 peak），bump 是在槽附近额外加的偏移 */
function arc(peak: number, bump: number, n = 48): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i <= n; i += 1) {
    const t = i / n
    const x = X_LOAD + (X_SRC - X_LOAD) * t
    const g = Math.exp(-(((x - CUT_X) / BUMP_PX) ** 2))
    out.push([x, TRACE_Y + 4 * peak * t * (1 - t) + bump * g])
  }
  return out
}

function yAtX(pts: Pt[], x: number) {
  let best = pts[0]
  for (const p of pts) {
    if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) {
      best = p
    }
  }
  return best[1]
}

function hfLane(o: number, slot: boolean, w: number): Lane {
  const y = TRACE_Y + o
  if (!slot) {
    const pts: Pt[] = [[X_LOAD, y], [X_SRC, y]]
    return { pts, w, yCut: y }
  }
  const sign = o < 0 ? -1 : 1
  const yd = TRACE_Y + sign * (SLOT_HALF + 6 + Math.abs(o) * 0.4)
  const xr = SLOT.x + SLOT.w + 14
  const xl = SLOT.x - 14
  const pts: Pt[] = [[X_LOAD, y], [xr, y], [xr, yd], [xl, yd], [xl, y], [X_SRC, y]]
  return { pts, w, yCut: yd }
}

function lfLane(p: number, slot: boolean, w: number): Lane {
  const blocked = slot && Math.abs(p) < SLOT_HALF
  // 被槽挡住的车道，在槽的位置被推到槽端外面，其余部分仍按自己的弧走
  const target = (p < 0 ? -1 : 1) * (SLOT_HALF + 8 + Math.abs(p) * 0.1)
  const pts = arc(p, blocked ? target - p : 0)
  return { pts, w, yCut: yAtX(pts, CUT_X) }
}

export function buildLanes(plane: PlaneId, freq: FreqId): Lane[] {
  const slot = plane === 'slot'
  const raw = freq === 'high' ? HF_OFFSETS.map((o) => lorentz(o, H_PX)) : LF_PEAKS.map((p) => lorentz(p, SPREAD_PX))
  const total = raw.reduce((a, b) => a + b, 0)
  if (freq === 'high') {
    return HF_OFFSETS.map((o, i) => hfLane(o, slot, raw[i] / total))
  }
  return LF_PEAKS.map((p, i) => lfLane(p, slot, raw[i] / total))
}

/** 一条车道和走线（y = TRACE_Y 的直线）围成的面积 */
export function laneArea(lane: Lane) {
  const poly: Pt[] = [...lane.pts, [X_SRC, TRACE_Y], [X_LOAD, TRACE_Y]]
  let sum = 0
  for (let i = 0; i < poly.length; i += 1) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    sum += a[0] * b[1] - b[0] * a[1]
  }
  return Math.abs(sum) / 2
}

export function laneLength(lane: Lane) {
  let sum = 0
  for (let i = 1; i < lane.pts.length; i += 1) {
    sum += Math.hypot(lane.pts[i][0] - lane.pts[i - 1][0], lane.pts[i][1] - lane.pts[i - 1][1])
  }
  return sum
}

export function weightedArea(lanes: Lane[]) {
  return lanes.reduce((acc, l) => acc + l.w * laneArea(l), 0)
}

export function weightedLength(lanes: Lane[]) {
  return lanes.reduce((acc, l) => acc + l.w * laneLength(l), 0)
}

// 参考值：完整平面、高频
export const REF_AREA = weightedArea(buildLanes('solid', 'high'))
export const REF_LEN = weightedLength(buildLanes('solid', 'high'))

/** A–A 处，落在走线正下方 ±3h 以内的回流占比 */
export function underShare(lanes: Lane[]) {
  return lanes.reduce((acc, l) => acc + (Math.abs(l.yCut - TRACE_Y) <= 3 * H_PX ? l.w : 0), 0)
}

/** 沿折线取点，t 在 0..1，用于不播放动画时的静态圆点 */
export function pointAt(pts: Pt[], t: number): Pt {
  const lens: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i += 1) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    lens.push(d)
    total += d
  }
  let rest = (((t % 1) + 1) % 1) * total
  for (let i = 0; i < lens.length; i += 1) {
    if (rest <= lens[i] || i === lens.length - 1) {
      const f = lens[i] === 0 ? 0 : rest / lens[i]
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]
    }
    rest -= lens[i]
  }
  return pts[0]
}

export function pathD(pts: Pt[]) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
}

/** 截面里回流电流密度：每条车道在 A–A 处贡献一个面积等于它权重的高斯，所以总电流守恒 */
export function densityAt(lanes: Lane[], y: number, sigma: number) {
  const norm = 1 / (sigma * Math.sqrt(2 * Math.PI))
  return lanes.reduce((acc, l) => acc + l.w * norm * Math.exp(-((y - l.yCut) ** 2) / (2 * sigma * sigma)), 0)
}

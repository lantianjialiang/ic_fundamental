import { loc, type LText } from '../../../i18n/locale'

// 焊盘尺寸是教学用的典型值（IPC-7351 量级），实际以器件手册推荐焊盘为准
export type Pad = { id: string; x: number; y: number; w: number; h: number; ep?: boolean }
export type FootId = 'r0603' | 'sot23' | 'qfn'
export type Foot = {
  id: FootId
  name: LText
  body: { w: number; h: number }
  scale: number
  pads: Pad[]
  note: LText
}

function qfnPads(): Pad[] {
  const pads: Pad[] = []
  const c = 1.4
  for (let i = 0; i < 4; i++) {
    const off = (i - 1.5) * 0.5
    pads.push({ id: String(1 + i), x: -c, y: off, w: 0.7, h: 0.3 })
  }
  for (let i = 0; i < 4; i++) {
    const off = (i - 1.5) * 0.5
    pads.push({ id: String(5 + i), x: off, y: c, w: 0.3, h: 0.7 })
  }
  for (let i = 0; i < 4; i++) {
    const off = (1.5 - i) * 0.5
    pads.push({ id: String(9 + i), x: c, y: off, w: 0.7, h: 0.3 })
  }
  for (let i = 0; i < 4; i++) {
    const off = (1.5 - i) * 0.5
    pads.push({ id: String(13 + i), x: off, y: -c, w: 0.3, h: 0.7 })
  }
  pads.push({ id: 'EP', x: 0, y: 0, w: 1.7, h: 1.7, ep: true })
  return pads
}

export const FOOTS: Foot[] = [
  {
    id: 'r0603',
    name: loc('0603 电阻', '0603 resistor'),
    body: { w: 1.6, h: 0.8 },
    scale: 90,
    pads: [
      { id: '1', x: -0.8, y: 0, w: 0.9, h: 1.0 },
      { id: '2', x: 0.8, y: 0, w: 0.9, h: 1.0 },
    ],
    note: loc(
      '两个同样的焊盘，两端焊料多少要一致。一边多一边少，回流时两边表面张力不等，小件会被拉起来立碑。所以缩小开口也要左右对称。',
      'Two identical pads, and both ends need the same amount of solder. If one end has more, surface tension during reflow is unequal and the small part is pulled upright (tombstoning). So any reduction must be symmetric.',
    ),
  },
  {
    id: 'sot23',
    name: loc('SOT-23 三极管', 'SOT-23 transistor'),
    body: { w: 2.9, h: 1.3 },
    scale: 62,
    pads: [
      { id: '1', x: -0.95, y: 1.25, w: 0.6, h: 1.0 },
      { id: '2', x: 0.95, y: 1.25, w: 0.6, h: 1.0 },
      { id: '3', x: 0, y: -1.25, w: 0.6, h: 1.0 },
    ],
    note: loc(
      '三个小焊盘，1、2 脚在下排，3 脚在上排中间；焊盘比引脚向外伸一截，让锡在引脚外侧形成可检查的焊脚。',
      'Three small pads: pins 1 and 2 on the bottom row, pin 3 centred on the top row. Each pad extends beyond the lead so the solder forms an inspectable toe fillet.',
    ),
  },
  {
    id: 'qfn',
    name: loc('QFN-16（带散热焊盘）', 'QFN-16 (exposed pad)'),
    body: { w: 3, h: 3 },
    scale: 56,
    pads: qfnPads(),
    note: loc(
      '四周 16 个细焊盘（间距 0.5 mm）加中间一块大的散热焊盘 EP。EP 要大面积焊锡导热，但整块印满锡膏，元件会浮在熔融焊料上、气泡也排不出，所以钢网在 EP 处开成小方块阵列（windowpane），覆盖约 50–80 %。',
      'Sixteen fine pads (0.5 mm pitch) around one large exposed pad (EP). The EP needs a lot of solder for heat, but a solid paste block makes the part float on molten solder and traps voids, so the stencil opens the EP as a grid of small squares (windowpane) covering about 50–80 %.',
    ),
  },
]

export type ApMode = 'full' | 'cut'
export const WINDOW_N = 3
export const AR_MIN = 0.66 // IPC-7525 面积比下限

export type Aperture = { w: number; h: number; area: number; windows: number; each: number }

/** ratio：普通焊盘是开口面积比（0.7–1.0）；EP 是窗格覆盖率（0.5–0.8） */
export function apertureOf(pad: Pad, mode: ApMode, ratio: number): Aperture {
  if (mode === 'full') {
    return { w: pad.w, h: pad.h, area: pad.w * pad.h, windows: 1, each: pad.w * pad.h }
  }
  if (pad.ep) {
    const cell = pad.w / WINDOW_N
    const side = cell * Math.sqrt(ratio)
    return { w: side, h: side, area: side * side * WINDOW_N * WINDOW_N, windows: WINDOW_N * WINDOW_N, each: side * side }
  }
  const k = Math.sqrt(ratio)
  return { w: pad.w * k, h: pad.h * k, area: pad.w * pad.h * ratio, windows: 1, each: pad.w * pad.h * ratio }
}

/** 面积比 = 开口面积 / 孔壁面积，小于 0.66 锡膏容易脱模不干净 */
export function areaRatio(ap: Aperture, thick: number) {
  return (ap.w * ap.h) / (2 * (ap.w + ap.h) * thick)
}

export const paste = (ap: Aperture, thick: number) => ap.area * thick

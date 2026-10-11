/**
 * Load Board（DIB）上所有器件、焊盘、过孔的摆放。
 * 3D 器件（LoadBoard.tsx）和绿油 / 丝印贴图（textures.ts）共用这一份数据，保证贴图上的焊盘、位号和 3D 器件对得上。
 * 坐标都是板面 xz（世界坐标，板中心在原点）。
 */
import {
  BGA,
  CHANNEL_COUNT,
  LB,
  SOCKET,
  allContacts,
  bgaXZ,
  cardX,
  channelCard,
  channelSide,
  contactFor,
  ftRoute,
  type Pkg,
} from './layout'

export const LB_TOP = LB.y + LB.t / 2
export const LB_BOTTOM = LB.y - LB.t / 2

/** 旁路电容（0402 MLCC）：围着 Socket 一圈，每边 9 颗 */
export type CapPart = { x: number; z: number; horiz: boolean; side: number; ref: string }
const CAP_OFF = SOCKET.outer / 2 + 0.2
export const LB_CAPS: CapPart[] = (() => {
  const out: CapPart[] = []
  for (let side = 0; side < 4; side += 1) {
    for (let k = 0; k < 9; k += 1) {
      const t = (k - 4) * 0.2
      const horiz = side % 2 === 0
      const x = horiz ? t : side === 1 ? CAP_OFF : -CAP_OFF
      const z = horiz ? (side === 0 ? CAP_OFF : -CAP_OFF) : t
      out.push({ x, z, horiz, side, ref: `C${side * 9 + k + 1}` })
    }
  }
  return out
})()
/** 电容端头相对中心的偏移（沿器件长边） */
export const CAP_TERM = 0.04

/** 每路通道的串联电阻 R1..R16 与测试点 TP1..TP16（CH1–8 在前排、CH9–16 在后排） */
export type ChannelPart = { x: number; z: number; ch: number; ref: string }
export const LB_RES: ChannelPart[] = Array.from({ length: CHANNEL_COUNT }, (_, ch) => ({
  x: cardX(channelCard(ch)),
  z: channelSide(ch) * 1.46,
  ch,
  ref: `R${ch + 1}`,
}))
export const RES_TERM = 0.035
export const LB_TPS: ChannelPart[] = Array.from({ length: CHANNEL_COUNT }, (_, ch) => ({
  x: cardX(channelCard(ch)),
  z: channelSide(ch) * 1.62,
  ch,
  ref: `TP${ch + 1}`,
}))

/** 继电器 K1..K6（SMD 信号继电器，两长边各 2 只鸥翼脚） */
export type RelayPart = { x: number; z: number; ref: string }
export const RELAY = { w: 0.3, h: 0.16, d: 0.2 }
export const LB_RELAYS: RelayPart[] = Array.from({ length: 6 }, (_, i) => ({
  x: (i < 3 ? -1 : 1) * 1.6,
  z: ((i % 3) - 1) * 0.42,
  ref: `K${i + 1}`,
}))
/** 继电器焊盘：相对继电器中心 */
export const RELAY_PADS: Array<[number, number]> = [
  [-0.07, -0.125],
  [0.07, -0.125],
  [-0.07, 0.125],
  [0.07, 0.125],
]

/** 2×12 牛角座 J1 / J2（左右板边） */
export const HEADER = { w: 0.17, d: 1.3, h: 0.14, cz: -0.1, rows: 2, pins: 12, pitch: 0.1, rowGap: 0.07 }
export const LB_HEADERS = [
  { x: -2.12, ref: 'J1' },
  { x: 2.12, ref: 'J2' },
]
export function headerPins(cx: number): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (let r = 0; r < HEADER.rows; r += 1) {
    for (let k = 0; k < HEADER.pins; k += 1) {
      out.push([cx + (r - 0.5) * HEADER.rowGap, HEADER.cz - ((HEADER.pins - 1) / 2) * HEADER.pitch + k * HEADER.pitch])
    }
  }
  return out
}

/** 板边 SMA 射频座 J3..J6（前板边，错开测试点） */
export const LB_SMAS = [-1.0, -0.5, 0.5, 1.0].map((x, i) => ({ x, z: LB.d / 2 - 0.07, ref: `J${i + 3}` }))

/** 安装孔 MH1..MH4、光学定位点（fiducial） */
export const LB_HOLES: Array<[number, number]> = [
  [-2.03, 1.53],
  [2.03, 1.53],
  [-2.03, -1.53],
  [2.03, -1.53],
]
export const LB_FIDUCIALS: Array<[number, number]> = [
  [-2.15, 1.2],
  [2.15, 1.2],
  [2.15, -1.2],
]

/** 被测通道用到的 DUT 端子（这些球 / 脚走专用通道路由，不做狗骨扇出） */
function channelContactKeys(pkg: Pkg): Set<string> {
  const keys = new Set<string>()
  for (let ch = 0; ch < CHANNEL_COUNT; ch += 1) {
    const c = contactFor(pkg, ch)
    keys.add(`${c.x.toFixed(3)},${c.z.toFixed(3)}`)
  }
  return keys
}

/**
 * BGA 狗骨扇出：每个焊球旁边斜向半个球距打一个过孔；第 5 行（z=0）的一排过孔正好落在剖切面上，剖开时能看到过孔贯穿各层。
 * QFP：中间散热焊盘（EP）下 5×5 散热过孔，同样有一排在 z=0。
 */
export function fanoutVias(pkg: Pkg): Array<[number, number]> {
  if (pkg === 'BGA') {
    const skip = channelContactKeys('BGA')
    const out: Array<[number, number]> = []
    for (let row = 0; row < BGA.grid; row += 1) {
      for (let col = 0; col < BGA.grid; col += 1) {
        const [x, z] = bgaXZ(col, row)
        if (skip.has(`${x.toFixed(3)},${z.toFixed(3)}`)) continue
        out.push([x + BGA.pitch / 2, z - BGA.pitch / 2])
      }
    }
    return out
  }
  const out: Array<[number, number]> = []
  for (let i = -2; i <= 2; i += 1) {
    for (let j = -2; j <= 2; j += 1) out.push([i * 0.14, j * 0.14])
  }
  return out
}

/** BGA 狗骨扇出的短线：焊盘 → 过孔 */
export function fanoutStubs(pkg: Pkg): Array<[[number, number], [number, number]]> {
  if (pkg !== 'BGA') return []
  const skip = channelContactKeys('BGA')
  const out: Array<[[number, number], [number, number]]> = []
  for (const [x, z] of allContacts('BGA')) {
    if (skip.has(`${x.toFixed(3)},${z.toFixed(3)}`)) continue
    out.push([
      [x, z],
      [x + BGA.pitch / 2, z - BGA.pitch / 2],
    ])
  }
  return out
}

/** QFP 散热焊盘边长 */
export const QFP_EP = 0.72

/** 16 路通道路由用到的过孔（去重） */
export function routeVias(pkg: Pkg): Array<[number, number]> {
  const seen = new Set<string>()
  const out: Array<[number, number]> = []
  for (let ch = 0; ch < CHANNEL_COUNT; ch += 1) {
    for (const n of ftRoute(pkg, ch)) {
      if (!n.via) continue
      const key = `${n.x.toFixed(3)},${n.z.toFixed(3)}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push([n.x, n.z])
    }
  }
  return out
}

/** 只画在贴图上的装饰性过孔：电容电源过孔、电阻过孔、SMA 过孔、继电器过孔、板边地过孔（stitching） */
export function decorVias(): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (const c of LB_CAPS) {
    const n = c.side === 0 ? [0, -1] : c.side === 2 ? [0, 1] : c.side === 1 ? [-1, 0] : [1, 0]
    out.push([c.x + n[0]! * 0.1, c.z + n[1]! * 0.1])
  }
  for (const r of LB_RES) out.push([r.x - 0.1, r.z])
  for (const s of LB_SMAS) out.push([s.x, s.z - 0.17])
  for (const k of LB_RELAYS) {
    const inward = k.x > 0 ? -1 : 1
    out.push([k.x + inward * 0.2, k.z - 0.125], [k.x + inward * 0.2, k.z + 0.125])
  }
  const avoid = [...LB_HOLES, ...LB_FIDUCIALS, ...LB_SMAS.map((s) => [s.x, s.z] as [number, number])]
  const ok = (x: number, z: number) => avoid.every(([ax, az]) => Math.hypot(ax - x, az - z) > 0.16)
  const ex = LB.w / 2 - 0.045
  const ez = LB.d / 2 - 0.045
  for (let x = -2.1; x <= 2.11; x += 0.2) {
    if (ok(x, ez)) out.push([x, ez])
    if (ok(x, -ez)) out.push([x, -ez])
  }
  for (let z = -1.5; z <= 1.51; z += 0.2) {
    if (ok(ex, z)) out.push([ex, z])
    if (ok(-ex, z)) out.push([-ex, z])
  }
  return out
}

/** Socket 顶层焊盘（BGA 圆焊盘 / QFP 长条焊盘）的位置与朝向 */
export type TopPad = { x: number; z: number; rotY: number }
export function socketPads(pkg: Pkg): TopPad[] {
  if (pkg === 'BGA') return allContacts('BGA').map(([x, z]) => ({ x, z, rotY: 0 }))
  return allContacts('QFP').map(([x, z]) => ({ x, z, rotY: Math.abs(x) > Math.abs(z) ? 0 : Math.PI / 2 }))
}
export const BGA_PAD_R = 0.034
export const QFP_PAD = { l: 0.12, w: 0.036 }

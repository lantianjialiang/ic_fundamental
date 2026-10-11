/**
 * D02 教学工位的几何与姿态。
 * 所有部件先按「装配好」的设计坐标建模（世界坐标，Y 向上，地面 FLOOR_Y），
 * 分解 / 接触动画只给每一层加一个位移（Pose）。
 * FT（从上到下）：Handler 压头 → DUT → Socket → Load Board → Pogo Tower → Test Head
 * CP（从上到下）：Test Head（翻转）→ Pogo Tower → Probe Card → 晶圆 → Chuck
 * 尺寸为教学放大，通道只画 16 路示意。
 */

export type TestFlow = 'FT' | 'CP'
export type Pkg = 'BGA' | 'QFP'
export type ProbeType = 'cantilever' | 'vertical'
export type Vec3 = [number, number, number]
export type LayerId = 'handler' | 'dut' | 'socket' | 'loadboard' | 'pogo' | 'testhead' | 'probecard' | 'wafer' | 'chuck'
export type ContactPhase = 'idle' | 'load' | 'press' | 'compress' | 'align' | 'rise' | 'overdrive' | 'signal' | 'done'

export const LAYERS: Record<TestFlow, LayerId[]> = {
  FT: ['handler', 'dut', 'socket', 'loadboard', 'pogo', 'testhead'],
  CP: ['testhead', 'pogo', 'probecard', 'wafer', 'chuck'],
}

export const PHASES: Record<TestFlow, ContactPhase[]> = {
  FT: ['load', 'press', 'compress', 'signal', 'done'],
  CP: ['align', 'rise', 'overdrive', 'signal', 'done'],
}

/** 每个阶段的时长（秒） */
export const PHASE_SECONDS: Record<ContactPhase, number> = {
  idle: 0,
  load: 1.1,
  press: 1.3,
  compress: 0.8,
  align: 1.1,
  rise: 1.3,
  overdrive: 1.0,
  signal: 3.6,
  done: 0,
}

export const FLOOR_Y = -2.3
export const CHANNEL_COUNT = 16
export const CARD_COUNT = 8

/** CH1–8 在前排（+Z），CH9–16 在后排（−Z）；每块通道板带一前一后两路 */
export function channelCard(ch: number): number {
  return ch % CARD_COUNT
}
export function channelSide(ch: number): 1 | -1 {
  return ch < CARD_COUNT ? 1 : -1
}
export function cardX(card: number): number {
  return (card - (CARD_COUNT - 1) / 2) * 0.5
}

/* ---------------- Test Head ---------------- */

export const TH = {
  w: 4.6,
  d: 4.4,
  plateH: 0.12,
  shellH: 1.33,
  cardH: 1.3,
  cardD: 3.4,
  cardT: 0.05,
  chipDepth: 0.6,
}

/** 对接面（docking plate 外表面）的世界 Y；FT 朝上、CP 翻转朝下 */
export const TH_DOCK_Y: Record<TestFlow, number> = { FT: -0.44, CP: 0.98 }

/** 测试头通道「出发点」：通道板上的驱动芯片与板边金手指 */
export function cardPoints(flow: TestFlow, ch: number, disp: number): { chip: Vec3; edge: Vec3 } {
  const x = cardX(channelCard(ch))
  const z = channelSide(ch) * FT_PIN_Z
  const dir = flow === 'FT' ? -1 : 1
  const dock = TH_DOCK_Y[flow] + disp
  return {
    chip: [x, dock + dir * TH.chipDepth, z],
    edge: [x, dock, z],
  }
}

/* ---------------- FT ---------------- */

export const FT_PIN_Z = 1.15

export const TOWER_FT = {
  bottom: -0.44,
  top: -0.06,
  blockW: 0.3,
  blockD: 0.62,
  cols: 3,
  rows: 7,
  pitch: 0.08,
  frameW: 4.2,
  frameD: 3.2,
  bar: 0.12,
}

export const LB = { y: 0, t: 0.12, w: 4.6, d: 3.6 }

export const SOCKET = { bottom: 0.06, baseTop: 0.18, top: 0.36, outer: 2.1, pocket: 1.62 }

/** Socket 弹簧针自由状态的针尖高度、最大压缩量 */
export const PIN_FREE_TOP = 0.24
export const COMP = 0.025
/** 装配（压到位）时 DUT 接触面的世界 Y */
export const DUT_BASE_Y = PIN_FREE_TOP - COMP

export const BGA = { body: 1.32, mold: 1.2, pitch: 0.112, grid: 10, ballR: 0.036, subBottom: 0.06, subTop: 0.11, top: 0.21 }
export const QFP = { body: 1.2, bottom: 0.03, top: 0.17, perSide: 16, pitch: 0.065, footReach: 0.14 }

export const BGA_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'] as const

export function dutHeight(pkg: Pkg): number {
  return pkg === 'BGA' ? BGA.top : QFP.top
}

export function bgaXZ(col: number, row: number): [number, number] {
  const mid = (BGA.grid - 1) / 2
  return [(col - mid) * BGA.pitch, (mid - row) * BGA.pitch]
}

export type QfpLead = { x: number; z: number; rotY: number; nx: number; nz: number; pin: number }

/** QFP 引脚：pin 1 在左后角，逆时针（俯视）编号；x/z 是引脚根部（塑封边缘） */
export function qfpLeads(): QfpLead[] {
  const half = QFP.body / 2
  const mid = (QFP.perSide - 1) / 2
  const leads: QfpLead[] = []
  for (let k = 0; k < QFP.perSide; k += 1) {
    const t = (k - mid) * QFP.pitch
    leads.push({ x: -half, z: t, rotY: Math.PI, nx: -1, nz: 0, pin: k + 1 })
  }
  for (let k = 0; k < QFP.perSide; k += 1) {
    const t = (k - mid) * QFP.pitch
    leads.push({ x: t, z: half, rotY: -Math.PI / 2, nx: 0, nz: 1, pin: QFP.perSide + k + 1 })
  }
  for (let k = 0; k < QFP.perSide; k += 1) {
    const t = (mid - k) * QFP.pitch
    leads.push({ x: half, z: t, rotY: 0, nx: 1, nz: 0, pin: QFP.perSide * 2 + k + 1 })
  }
  for (let k = 0; k < QFP.perSide; k += 1) {
    const t = (mid - k) * QFP.pitch
    leads.push({ x: t, z: -half, rotY: Math.PI / 2, nx: 0, nz: -1, pin: QFP.perSide * 3 + k + 1 })
  }
  return leads
}

/** 每个封装的全部接触点（Socket 针 / Load Board 顶层焊盘的位置） */
export function allContacts(pkg: Pkg): Array<[number, number]> {
  if (pkg === 'BGA') {
    const out: Array<[number, number]> = []
    for (let row = 0; row < BGA.grid; row += 1) {
      for (let col = 0; col < BGA.grid; col += 1) out.push(bgaXZ(col, row))
    }
    return out
  }
  return qfpLeads().map((l) => [l.x + l.nx * QFP.footReach, l.z + l.nz * QFP.footReach])
}

/** 通道 → DUT 端子（BGA 球 / QFP 脚）的位置与名字 */
export function contactFor(pkg: Pkg, ch: number): { x: number; z: number; name: string } {
  const c = channelCard(ch)
  const front = channelSide(ch) === 1
  if (pkg === 'BGA') {
    const row = front ? 0 : BGA.grid - 1
    const [x, z] = bgaXZ(c + 1, row)
    return { x, z, name: `${BGA_COLS[c + 1]}${row + 1}` }
  }
  const leads = qfpLeads()
  const lead = front ? leads[QFP.perSide + 4 + c] : leads[QFP.perSide * 3 + 11 - c]
  const l = lead ?? leads[0]!
  return { x: l.x + l.nx * QFP.footReach, z: l.z + l.nz * QFP.footReach, name: String(l.pin) }
}

export const HANDLER = { cupH: 0.04, block: 1.0, blockH: 0.32, shaftH: 0.9, shaftR: 0.13 }

/* ---------------- CP ---------------- */

export const PAD_TOP = 0.006
export const OD = 0.03
export const WAFER = { r: 1.8, t: 0.04, notch: 0.07 }
export const DIE = { pitch: 0.17, size: 0.156, h: 0.003 }
export const CHUCK = { r: 1.95, top: -0.04, h: 0.3 }
export const PC = {
  r: 2.2,
  bottom: 0.46,
  top: 0.58,
  t: 0.12,
  y: 0.52,
  stBottom: 0.34,
  stSize: 1.0,
  ringY: 0.15,
  stiffTop: 0.7,
  upperGuide: 0.3,
  lowerGuide: 0.08,
}
export const TOWER_CP = {
  bottom: 0.58,
  top: 0.98,
  rIn: 1.6,
  rOut: 2.1,
  r: 1.85,
  blocks: 18,
  tCols: 3,
  rRows: 5,
  tPitch: 0.07,
  rPitch: 0.08,
}

export type DieCell = { x: number; z: number; isDut: boolean }

let dieCache: DieCell[] | null = null
export function dieCells(): DieCell[] {
  if (dieCache) return dieCache
  const out: DieCell[] = []
  const n = Math.ceil(WAFER.r / DIE.pitch)
  const limit = WAFER.r - 0.06
  const h = DIE.size / 2
  for (let i = -n; i <= n; i += 1) {
    for (let j = -n; j <= n; j += 1) {
      const x = i * DIE.pitch
      const z = j * DIE.pitch
      const inside = [
        [x - h, z - h],
        [x + h, z - h],
        [x - h, z + h],
        [x + h, z + h],
      ].every(([a, b]) => a! * a! + b! * b! < limit * limit)
      if (inside) out.push({ x, z, isDut: i === 0 && j === 0 })
    }
  }
  dieCache = out
  return out
}

export type DiePad = { x: number; z: number; nx: number; nz: number; tx: number; tz: number; t: number }

const PAD_INSET = DIE.size / 2 - 0.016
const PAD_PITCH = 0.032

function buildPads(): DiePad[] {
  const sides: Array<[number, number, number, number]> = [
    [0, 1, 1, 0],
    [1, 0, 0, -1],
    [0, -1, -1, 0],
    [-1, 0, 0, 1],
  ]
  const pads: DiePad[] = []
  for (const [nx, nz, tx, tz] of sides) {
    for (let k = 0; k < 4; k += 1) {
      const t = (k - 1.5) * PAD_PITCH
      pads.push({ x: nx * PAD_INSET + tx * t, z: nz * PAD_INSET + tz * t, nx, nz, tx, tz, t })
    }
  }
  return pads
}

export const DIE_PADS = buildPads()

/** CP 通道在 Pogo 环上的角度（度） */
export function ringAngle(ch: number): number {
  const a = 160 - 20 * channelCard(ch)
  return channelSide(ch) === 1 ? a : -a
}

export function ringXZ(ch: number, r = TOWER_CP.r): [number, number] {
  const a = (ringAngle(ch) * Math.PI) / 180
  return [r * Math.cos(a), r * Math.sin(a)]
}

/** 按角度顺序把 16 路通道配到 16 个 die pad，走线不交叉 */
const PAD_OF_CHANNEL: number[] = (() => {
  const chs = Array.from({ length: CHANNEL_COUNT }, (_, i) => i).sort((a, b) => ringAngle(a) - ringAngle(b))
  const pads = DIE_PADS.map((p, i) => ({ i, a: Math.atan2(p.z, p.x) })).sort((a, b) => a.a - b.a)
  const out = new Array<number>(CHANNEL_COUNT).fill(0)
  chs.forEach((ch, k) => {
    out[ch] = pads[k]!.i
  })
  return out
})()

export function padFor(ch: number): DiePad {
  return DIE_PADS[PAD_OF_CHANNEL[ch] ?? 0]!
}

export function padIndexFor(ch: number): number {
  return PAD_OF_CHANNEL[ch] ?? 0
}

/** 悬臂针根部（环氧针环上）的 xz */
export function cantileverRoot(p: DiePad): [number, number] {
  return [p.nx * 0.5 + p.tx * p.t * 4, p.nz * 0.5 + p.tz * p.t * 4]
}

/** Pogo 块的位置：FT 为方框内两排，CP 为一圈（angle 为块的径向角） */
export function towerBlocks(flow: TestFlow): Array<{ x: number; z: number; angle: number }> {
  if (flow === 'FT') {
    const out: Array<{ x: number; z: number; angle: number }> = []
    for (const zs of [1, -1]) {
      for (let c = 0; c < CARD_COUNT; c += 1) out.push({ x: cardX(c), z: zs * FT_PIN_Z, angle: 0 })
    }
    return out
  }
  return Array.from({ length: TOWER_CP.blocks }, (_, j) => {
    const a = (j * 2 * Math.PI) / TOWER_CP.blocks
    return { x: TOWER_CP.r * Math.cos(a), z: TOWER_CP.r * Math.sin(a), angle: a }
  })
}

/** 所有 pogo 针的 xz（也是 Load Board 底层 / 探针卡边缘焊盘的位置） */
export function towerPinXZ(flow: TestFlow): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (const b of towerBlocks(flow)) {
    if (flow === 'FT') {
      for (let i = 0; i < TOWER_FT.cols; i += 1) {
        for (let j = 0; j < TOWER_FT.rows; j += 1) {
          out.push([b.x + (i - (TOWER_FT.cols - 1) / 2) * TOWER_FT.pitch, b.z + (j - (TOWER_FT.rows - 1) / 2) * TOWER_FT.pitch])
        }
      }
    } else {
      const ux = Math.cos(b.angle)
      const uz = Math.sin(b.angle)
      for (let i = 0; i < TOWER_CP.rRows; i += 1) {
        for (let j = 0; j < TOWER_CP.tCols; j += 1) {
          const r = (i - (TOWER_CP.rRows - 1) / 2) * TOWER_CP.rPitch
          const tt = (j - (TOWER_CP.tCols - 1) / 2) * TOWER_CP.tPitch
          out.push([b.x + ux * r - uz * tt, b.z + uz * r + ux * tt])
        }
      }
    }
  }
  return out
}

/* ---------------- 姿态 ---------------- */

export type AnimValues = {
  explode: number
  /** FT：Handler 抬起量 0..1 */
  lift: number
  /** FT：压到底 0..1 */
  press: number
  /** FT：Handler 水平送料偏移 0..1 */
  shuttle: number
  /** CP：Chuck 下降量 0..1 */
  drop: number
  /** CP：过驱动 0..1 */
  od: number
  /** CP：XY 台偏移 0..1 */
  waferShift: number
}

export const STATIC_ANIM: AnimValues = { explode: 0, lift: 0, press: 1, shuttle: 0, drop: 0, od: 1, waferShift: 0 }

export type Pose = {
  y: Record<LayerId, number>
  x: Record<LayerId, number>
  /** Socket 弹簧针当前压缩量 */
  pinComp: number
  /** 探针当前被顶起的量 */
  needleDefl: number
}

const ZERO: Record<LayerId, number> = {
  handler: 0,
  dut: 0,
  socket: 0,
  loadboard: 0,
  pogo: 0,
  testhead: 0,
  probecard: 0,
  wafer: 0,
  chuck: 0,
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function computePose(flow: TestFlow, a: AnimValues, out?: Pose): Pose {
  const pose = out ?? { y: { ...ZERO }, x: { ...ZERO }, pinComp: 0, needleDefl: 0 }
  const e = a.explode
  const y = pose.y
  const x = pose.x
  for (const k of Object.keys(ZERO) as LayerId[]) {
    y[k] = 0
    x[k] = 0
  }
  if (flow === 'FT') {
    y.pogo = e * 0.45
    y.loadboard = e * 0.9
    y.socket = e * 1.45
    const rel = a.lift * 0.6 + (1 - a.press) * COMP + e * 0.55
    y.dut = y.socket + rel
    y.handler = y.dut + e * 0.55
    x.dut = a.shuttle * 2.4
    x.handler = x.dut
    pose.pinComp = a.shuttle > 0.01 ? 0 : clamp(COMP - rel, 0, COMP)
    pose.needleDefl = 0
  } else {
    y.chuck = -a.drop * 0.5 + a.od * OD
    y.wafer = y.chuck + e * 0.3
    y.probecard = e * 0.8
    y.pogo = e * 1.3
    y.testhead = e * 1.8
    x.chuck = a.waferShift * 1.3
    x.wafer = x.chuck
    pose.pinComp = 0
    pose.needleDefl = Math.abs(x.wafer) > 0.01 ? 0 : clamp(y.wafer - y.probecard, 0, OD * 1.2)
  }
  return pose
}

export const STATIC_POSE: Record<TestFlow, Pose> = {
  FT: computePose('FT', STATIC_ANIM),
  CP: computePose('CP', STATIC_ANIM),
}

/* ---------------- PCB 走线 ---------------- */

export type PcbLayer = 'top' | 'inner' | 'bottom'
export type PcbNode = { x: number; z: number; layer: PcbLayer; via?: boolean }

export function pcbLayerY(t: number, layer: PcbLayer): number {
  if (layer === 'top') return t / 2 + 0.004
  if (layer === 'bottom') return -t / 2 - 0.004
  return 0
}

/** FT：Load Board 底层（Pogo）→ 过孔 → 内层 → 过孔 → 顶层（Socket 焊盘） */
export function ftRoute(pkg: Pkg, ch: number): PcbNode[] {
  const cx = cardX(channelCard(ch))
  const zs = channelSide(ch)
  const p = contactFor(pkg, ch)
  const v2 = Math.abs(p.z) + 0.1
  const v1 = 0.86
  const bend = Math.max(v2, Math.min(v2 + 0.1, v1 - 0.02))
  return [
    { x: cx, z: zs * FT_PIN_Z, layer: 'bottom' },
    { x: cx, z: zs * v1, layer: 'bottom', via: true },
    { x: cx, z: zs * v1, layer: 'inner', via: true },
    { x: p.x, z: zs * bend, layer: 'inner' },
    { x: p.x, z: zs * v2, layer: 'inner', via: true },
    { x: p.x, z: zs * v2, layer: 'top', via: true },
    { x: p.x, z: p.z, layer: 'top' },
  ]
}

/** CP：Probe Card 顶层（Pogo 环）→ 过孔 → 内层 → 过孔 → 底层（空间转换器） */
export function cpRoute(ch: number): PcbNode[] {
  const [tx, tz] = ringXZ(ch)
  const [v1x, v1z] = ringXZ(ch, 1.66)
  const [bx, bz] = ringXZ(ch, 1.05)
  const pad = padFor(ch)
  const a = Math.atan2(pad.z, pad.x)
  const v2x = Math.cos(a) * 0.4
  const v2z = Math.sin(a) * 0.4
  return [
    { x: tx, z: tz, layer: 'top' },
    { x: v1x, z: v1z, layer: 'top', via: true },
    { x: v1x, z: v1z, layer: 'inner', via: true },
    { x: bx, z: bz, layer: 'inner' },
    { x: v2x, z: v2z, layer: 'inner', via: true },
    { x: v2x, z: v2z, layer: 'bottom', via: true },
  ]
}

/* ---------------- 探针几何 ---------------- */

export type NeedleShape = { pts: Vec3[]; tip: Vec3 }

/** 单根针的折线（设计坐标 + 探针卡位移 + 顶起量），最后一点是针尖 */
export function needleShape(probe: ProbeType, pad: DiePad, pcY: number, defl: number): NeedleShape {
  const tipY = PAD_TOP + pcY + defl
  if (probe === 'cantilever') {
    const [rx, rz] = cantileverRoot(pad)
    const scrub = defl * 0.8
    const tx = pad.x + pad.nx * scrub
    const tz = pad.z + pad.nz * scrub
    const root: Vec3 = [rx, PC.ringY + pcY, rz]
    const knee: Vec3 = [tx + pad.nx * 0.014, tipY + 0.045, tz + pad.nz * 0.014]
    const mid: Vec3 = [(rx + knee[0]) / 2, (root[1] + knee[1]) / 2 - defl * 0.35, (rz + knee[2]) / 2]
    const tip: Vec3 = [tx, tipY, tz]
    return { pts: [root, mid, knee, tip], tip }
  }
  const bow = 0.012 + defl * 0.7
  const top: Vec3 = [pad.x, PC.stBottom + pcY, pad.z]
  const upper: Vec3 = [pad.x, PC.upperGuide + pcY, pad.z]
  const belly: Vec3 = [pad.x + pad.nx * bow, (PC.upperGuide + PC.lowerGuide) / 2 + pcY, pad.z + pad.nz * bow]
  const lower: Vec3 = [pad.x, PC.lowerGuide + pcY, pad.z]
  const tip: Vec3 = [pad.x, tipY, pad.z]
  return { pts: [top, upper, belly, lower, tip], tip }
}

/* ---------------- 信号路径 ---------------- */

export type HopId =
  | 'pe'
  | 'cardEdge'
  | 'pogoTower'
  | 'lbBottom'
  | 'via1'
  | 'inner'
  | 'via2'
  | 'lbTop'
  | 'socketPin'
  | 'dutTerm'
  | 'dutDie'
  | 'pcTop'
  | 'st'
  | 'needle'
  | 'diePad'

export type Hop = { id: HopId; pts: Vec3[] }

function boardPt(n: PcbNode, cy: number, t: number, dx = 0): Vec3 {
  return [n.x + dx, cy + pcbLayerY(t, n.layer), n.z]
}

export function buildHops(flow: TestFlow, pkg: Pkg, probe: ProbeType, ch: number, pose: Pose): Hop[] {
  const { chip, edge } = cardPoints(flow, ch, pose.y.testhead)
  if (flow === 'FT') {
    const r = ftRoute(pkg, ch)
    const lbY = LB.y + pose.y.loadboard
    const b = (i: number) => boardPt(r[i]!, lbY, LB.t)
    const cx = edge[0]
    const cz = edge[2]
    const p = contactFor(pkg, ch)
    const sk = pose.y.socket
    const dutY = DUT_BASE_Y + pose.y.dut
    const dx = pose.x.dut
    return [
      { id: 'pe', pts: [chip, edge] },
      { id: 'pogoTower', pts: [[cx, TOWER_FT.bottom + pose.y.pogo, cz], [cx, TOWER_FT.top + pose.y.pogo, cz]] },
      { id: 'lbBottom', pts: [b(0)] },
      { id: 'via1', pts: [b(1), b(2)] },
      { id: 'inner', pts: [b(3), b(4)] },
      { id: 'via2', pts: [b(5)] },
      { id: 'lbTop', pts: [b(6)] },
      { id: 'socketPin', pts: [[p.x, SOCKET.bottom + sk, p.z], [p.x, PIN_FREE_TOP - pose.pinComp + sk, p.z]] },
      { id: 'dutTerm', pts: [[p.x + dx, dutY + 0.03, p.z]] },
      { id: 'dutDie', pts: [[p.x * 0.35 + dx, dutY + 0.14, p.z * 0.35]] },
    ]
  }
  const r = cpRoute(ch)
  const pcY = PC.y + pose.y.probecard
  const b = (i: number) => boardPt(r[i]!, pcY, PC.t)
  const [rx, rz] = ringXZ(ch)
  const pad = padFor(ch)
  const needle = needleShape(probe, pad, pose.y.probecard, pose.needleDefl)
  const stBottom: Vec3 =
    probe === 'vertical'
      ? [pad.x, PC.stBottom + pose.y.probecard, pad.z]
      : [needle.pts[0]![0] * 0.85, PC.stBottom + pose.y.probecard, needle.pts[0]![2] * 0.85]
  const wy = pose.y.wafer
  const wx = pose.x.wafer
  return [
    { id: 'pe', pts: [chip, edge] },
    { id: 'cardEdge', pts: [[rx, TOWER_CP.top + pose.y.pogo, rz]] },
    { id: 'pogoTower', pts: [[rx, TOWER_CP.bottom + pose.y.pogo, rz]] },
    { id: 'pcTop', pts: [b(0)] },
    { id: 'via1', pts: [b(1), b(2)] },
    { id: 'inner', pts: [b(3), b(4)] },
    { id: 'via2', pts: [b(5)] },
    { id: 'st', pts: [stBottom] },
    { id: 'needle', pts: needle.pts },
    { id: 'diePad', pts: [[pad.x + wx, PAD_TOP + wy, pad.z]] },
  ]
}

export function hopPolyline(hops: Hop[]): Vec3[] {
  const out: Vec3[] = []
  for (const hop of hops) {
    for (const p of hop.pts) {
      const last = out[out.length - 1]
      if (last && Math.hypot(last[0] - p[0], last[1] - p[1], last[2] - p[2]) < 1e-4) continue
      out.push(p)
    }
  }
  return out
}

/* ---------------- 层包围盒 / 镜头 ---------------- */

export type LayerBox = { c: Vec3; s: Vec3 }

export const LAYER_BOX: Record<TestFlow, Partial<Record<LayerId, LayerBox>>> = {
  FT: {
    handler: { c: [0, 1.05, 0], s: [3.2, 1.3, 1.2] },
    dut: { c: [0, 0.32, 0], s: [1.75, 0.26, 1.75] },
    socket: { c: [0, 0.21, 0], s: [2.25, 0.33, 2.25] },
    loadboard: { c: [0, 0, 0], s: [4.75, 0.26, 3.75] },
    pogo: { c: [0, -0.25, 0], s: [4.35, 0.42, 3.35] },
    testhead: { c: [0, -1.22, 0], s: [4.75, 1.6, 4.55] },
  },
  CP: {
    testhead: { c: [0, 1.76, 0], s: [4.75, 1.6, 4.55] },
    pogo: { c: [0, 0.78, 0], s: [4.35, 0.44, 4.35] },
    probecard: { c: [0, 0.4, 0], s: [4.55, 0.62, 4.55] },
    wafer: { c: [0, -0.02, 0], s: [3.75, 0.1, 3.75] },
    chuck: { c: [0, -0.2, 0], s: [4.05, 0.36, 4.05] },
  },
}

export const CAMERA_PRESET: Record<TestFlow, { position: Vec3; target: Vec3; explodeShift: number }> = {
  FT: { position: [7.4, 3.4, 8.4], target: [0, -0.25, 0], explodeShift: 1.2 },
  CP: { position: [7.4, 3.6, 8.4], target: [0, 0.15, 0], explodeShift: 0.9 },
}

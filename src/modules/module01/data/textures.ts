import { CanvasTexture, NoColorSpace, SRGBColorSpace } from 'three'
import {
  BGA_PAD_R,
  CAP_TERM,
  HEADER,
  LB_CAPS,
  LB_FIDUCIALS,
  LB_HEADERS,
  LB_HOLES,
  LB_RELAYS,
  LB_RES,
  LB_SMAS,
  LB_TPS,
  QFP_EP,
  QFP_PAD,
  RELAY,
  RELAY_PADS,
  RES_TERM,
  decorVias,
  fanoutStubs,
  fanoutVias,
  headerPins,
  routeVias,
  socketPads,
} from './loadboard'
import { CARD_COUNT, LB, PCB_STACK, SOCKET, cardX, ftRoute, pcbStack, towerPinXZ, type Pkg, CHANNEL_COUNT } from './layout'

/** 用 Canvas 在本地生成丝印 / 打标 / die 图案贴图（离线，无需下载、不加载字体文件） */

const cache = new Map<string, CanvasTexture>()

function make(
  key: string,
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  linear = false,
) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const g = canvas.getContext('2d')
  if (g) draw(g, w, h)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = linear ? NoColorSpace : SRGBColorSpace
  tex.anisotropy = 8
  cache.set(key, tex)
  return tex
}

const MONO = 'Consolas, "Cascadia Mono", monospace'

/* ---------------- Load Board 绿油 / 丝印 / 焊盘 ---------------- */

/**
 * 一套调色板画两遍：albedo（颜色）和 ORM（G = 粗糙度、B = 金属度）。
 * 这样绿油半光泽、丝印哑光、沉金焊盘是金属，三者在同一张贴图上、一次 draw call。
 */
type Pal = {
  mask: string
  maskCu: string
  dimple: string
  relief: string
  gold: string
  silk: string
  hole: string
  fid: string
}

const ALBEDO: Pal = {
  mask: '#1c6a3a',
  maskCu: '#2b884e',
  dimple: '#155230',
  relief: '#6e7444',
  gold: '#d8b45e',
  silk: '#eef1ea',
  hole: '#121416',
  fid: '#80874f',
}
const ORM: Pal = {
  mask: '#005c00',
  maskCu: '#005200',
  dimple: '#006c00',
  relief: '#00b000',
  gold: '#0040ff',
  silk: '#00e400',
  hole: '#00ff00',
  fid: '#00b000',
}

type Painter = { g: CanvasRenderingContext2D; S: number; X: (x: number) => number; Y: (z: number) => number }

/** 顶面：贴图上方 = 板子后边（−Z）；底面：贴图上方 = 板子前边（+Z）。两面从外面看文字都不是镜像 */
function painter(g: CanvasRenderingContext2D, bottom: boolean): Painter {
  const S = g.canvas.width / LB.w
  return {
    g,
    S,
    X: (x) => (x + LB.w / 2) * S,
    Y: bottom ? (z) => (LB.d / 2 - z) * S : (z) => (z + LB.d / 2) * S,
  }
}

function circ(p: Painter, x: number, z: number, r: number, color: string) {
  p.g.fillStyle = color
  p.g.beginPath()
  p.g.arc(p.X(x), p.Y(z), r * p.S, 0, Math.PI * 2)
  p.g.fill()
}

function ring(p: Painter, x: number, z: number, r: number, w: number, color: string) {
  p.g.strokeStyle = color
  p.g.lineWidth = w * p.S
  p.g.beginPath()
  p.g.arc(p.X(x), p.Y(z), r * p.S, 0, Math.PI * 2)
  p.g.stroke()
}

/** 以 (x, z) 为中心、宽 w（沿 x）深 d（沿 z）的实心矩形 */
function box(p: Painter, x: number, z: number, w: number, d: number, color: string) {
  p.g.fillStyle = color
  p.g.fillRect(p.X(x) - (w / 2) * p.S, p.Y(z) - (d / 2) * p.S, w * p.S, d * p.S)
}

function frame(p: Painter, x0: number, z0: number, x1: number, z1: number, w: number, color: string) {
  p.g.strokeStyle = color
  p.g.lineWidth = w * p.S
  const ax = p.X(x0)
  const bx = p.X(x1)
  const ay = p.Y(z0)
  const by = p.Y(z1)
  p.g.strokeRect(Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay))
}

function line(p: Painter, pts: Array<[number, number]>, w: number, color: string) {
  if (pts.length < 2) return
  p.g.strokeStyle = color
  p.g.lineWidth = w * p.S
  p.g.lineCap = 'round'
  p.g.lineJoin = 'round'
  p.g.beginPath()
  p.g.moveTo(p.X(pts[0]![0]), p.Y(pts[0]![1]))
  for (const [x, z] of pts.slice(1)) p.g.lineTo(p.X(x), p.Y(z))
  p.g.stroke()
}

function text(
  p: Painter,
  str: string,
  x: number,
  z: number,
  size: number,
  color: string,
  align: CanvasTextAlign = 'left',
  bold = false,
) {
  p.g.fillStyle = color
  p.g.font = `${bold ? 'bold ' : ''}${Math.round(size * p.S)}px ${MONO}`
  p.g.textAlign = align
  p.g.textBaseline = 'middle'
  p.g.fillText(str, p.X(x), p.Y(z))
}

/** 绿油表面轻微的不均匀感（只画在颜色贴图上） */
function mottle(g: CanvasRenderingContext2D) {
  const { width: w, height: h } = g.canvas
  let seed = 7
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 4000; i += 1) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)'
    const s = 2 + rnd() * 5
    g.fillRect(rnd() * w, rnd() * h, s, s)
  }
}

const SILK_W = 0.008

function capPads(c: (typeof LB_CAPS)[number]): Array<[number, number]> {
  return c.horiz
    ? [
        [c.x - CAP_TERM, c.z],
        [c.x + CAP_TERM, c.z],
      ]
    : [
        [c.x, c.z - CAP_TERM],
        [c.x, c.z + CAP_TERM],
      ]
}

function capInward(c: (typeof LB_CAPS)[number]): [number, number] {
  if (c.side === 0) return [0, -1]
  if (c.side === 2) return [0, 1]
  return c.side === 1 ? [-1, 0] : [1, 0]
}

function drawLbTop(p: Painter, pal: Pal, pkg: Pkg, albedo: boolean) {
  const { g } = p
  g.fillStyle = pal.mask
  g.fillRect(0, 0, g.canvas.width, g.canvas.height)
  if (albedo) mottle(g)

  // 顶层地铜（继电器区）：铜皮在绿油下面，颜色比纯绿油浅
  for (const sx of [-1, 1]) {
    const x0 = sx * 1.36
    const x1 = sx * 1.98
    box(p, (x0 + x1) / 2, 0, Math.abs(x1 - x0), 1.24, pal.maskCu)
  }

  // 顶层走线（被绿油盖住，看起来是浅绿色的线）
  for (let ch = 0; ch < CHANNEL_COUNT; ch += 1) {
    const r = ftRoute(pkg, ch)
    const a = r[5]!
    const b = r[6]!
    line(p, [[a.x, a.z], [b.x, b.z]], 0.03, pal.maskCu)
  }
  for (const [a, b] of fanoutStubs(pkg)) line(p, [a, b], 0.02, pal.maskCu)
  for (const c of LB_CAPS) {
    const [nx, nz] = capInward(c)
    const pad = capPads(c)[0]!
    line(p, [pad, [c.x + nx * 0.1, c.z + nz * 0.1]], 0.024, pal.maskCu)
  }
  for (const r of LB_RES) {
    const tp = LB_TPS[r.ch]!
    line(p, [[r.x - RES_TERM, r.z], [r.x - 0.1, r.z]], 0.022, pal.maskCu)
    line(p, [[r.x + RES_TERM, r.z], [tp.x, tp.z]], 0.022, pal.maskCu)
  }
  for (const s of LB_SMAS) line(p, [[s.x, s.z], [s.x, s.z - 0.17]], 0.03, pal.maskCu)
  for (const k of LB_RELAYS) {
    const sx = k.x > 0 ? 1 : -1
    const pins = headerPins(sx * 2.12).filter(([px]) => Math.abs(px) < 2.12)
    for (const [dx, dz] of RELAY_PADS) {
      const px = k.x + dx
      const pz = k.z + dz
      if (dx * sx > 0) {
        const pin = pins.reduce((best, cur) => (Math.abs(cur[1] - pz) < Math.abs(best[1] - pz) ? cur : best), pins[0]!)
        line(p, [[px, pz], [sx * 1.86, pz], [sx * 1.94, pin[1]], pin], 0.02, pal.maskCu)
      } else {
        line(p, [[px, pz], [k.x - sx * 0.2, pz]], 0.02, pal.maskCu)
      }
    }
  }

  // 过孔：盖油（tented），表面是一圈浅色环 + 中间小凹点
  for (const [x, z] of [...routeVias(pkg), ...fanoutVias(pkg), ...decorVias()]) {
    circ(p, x, z, 0.021, pal.maskCu)
    circ(p, x, z, 0.008, pal.dimple)
  }

  // 焊盘：阻焊开窗（比焊盘略大，露出一圈基材），中间是沉金
  for (const pad of socketPads(pkg)) {
    if (pkg === 'BGA') {
      circ(p, pad.x, pad.z, BGA_PAD_R + 0.009, pal.relief)
      circ(p, pad.x, pad.z, BGA_PAD_R, pal.gold)
    } else {
      const along = pad.rotY === 0
      const w = along ? QFP_PAD.l : QFP_PAD.w
      const d = along ? QFP_PAD.w : QFP_PAD.l
      box(p, pad.x, pad.z, w + 0.016, d + 0.016, pal.relief)
      box(p, pad.x, pad.z, w, d, pal.gold)
    }
  }
  if (pkg === 'QFP') {
    box(p, 0, 0, QFP_EP + 0.03, QFP_EP + 0.03, pal.relief)
    box(p, 0, 0, QFP_EP, QFP_EP, pal.gold)
    for (const [x, z] of fanoutVias('QFP')) circ(p, x, z, 0.012, pal.hole)
  }
  for (const c of LB_CAPS) {
    for (const [x, z] of capPads(c)) {
      const w = c.horiz ? 0.034 : 0.062
      const d = c.horiz ? 0.062 : 0.034
      box(p, x, z, w + 0.012, d + 0.012, pal.relief)
      box(p, x, z, w, d, pal.gold)
    }
  }
  for (const r of LB_RES) {
    for (const sx of [-1, 1]) {
      box(p, r.x + sx * RES_TERM, r.z, 0.038, 0.054, pal.relief)
      box(p, r.x + sx * RES_TERM, r.z, 0.026, 0.042, pal.gold)
    }
  }
  for (const tp of LB_TPS) {
    circ(p, tp.x, tp.z, 0.036, pal.relief)
    circ(p, tp.x, tp.z, 0.028, pal.gold)
  }
  for (const k of LB_RELAYS) {
    for (const [dx, dz] of RELAY_PADS) {
      box(p, k.x + dx, k.z + dz, 0.052, 0.062, pal.relief)
      box(p, k.x + dx, k.z + dz, 0.04, 0.05, pal.gold)
    }
  }
  for (const h of LB_HEADERS) {
    headerPins(h.x).forEach(([x, z], i) => {
      if (i === 0) box(p, x, z, 0.052, 0.052, pal.gold)
      else circ(p, x, z, 0.027, pal.gold)
      circ(p, x, z, 0.012, pal.hole)
    })
  }
  for (const s of LB_SMAS) {
    box(p, s.x, s.z, 0.05, 0.13, pal.relief)
    box(p, s.x, s.z, 0.04, 0.11, pal.gold)
    for (const sx of [-1, 1]) box(p, s.x + sx * 0.08, s.z, 0.05, 0.13, pal.gold)
  }
  for (const [x, z] of LB_FIDUCIALS) {
    circ(p, x, z, 0.05, pal.fid)
    circ(p, x, z, 0.02, pal.gold)
  }
  for (const [x, z] of LB_HOLES) {
    circ(p, x, z, 0.078, pal.gold)
    circ(p, x, z, 0.045, pal.hole)
  }

  // ---------- 丝印 ----------
  const silk = pal.silk
  frame(p, -LB.w / 2 + 0.035, -LB.d / 2 + 0.035, LB.w / 2 - 0.035, LB.d / 2 - 0.035, SILK_W, silk)

  // Socket 外框 + PIN 1 标记（BGA 的 A1 在左前角，QFP 的 pin 1 在左后角）
  const so = SOCKET.outer / 2 + 0.04
  frame(p, -so, -so, so, so, SILK_W * 1.2, silk)
  const pinZ = pkg === 'BGA' ? 1 : -1
  p.g.fillStyle = silk
  p.g.beginPath()
  p.g.moveTo(p.X(-so - 0.015), p.Y(pinZ * (so - 0.09)))
  p.g.lineTo(p.X(-so - 0.015), p.Y(pinZ * (so + 0.015)))
  p.g.lineTo(p.X(-so + 0.09), p.Y(pinZ * (so + 0.015)))
  p.g.closePath()
  p.g.fill()
  text(p, 'PIN 1', -so - 0.03, pinZ * (so + 0.06), 0.042, silk, 'right', true)
  text(p, 'U1', so, -so - 0.06, 0.05, silk, 'right', true)

  for (const c of LB_CAPS) {
    const size = 0.038
    if (c.side === 0) text(p, c.ref, c.x, c.z + 0.075, size, silk, 'center')
    else if (c.side === 2) text(p, c.ref, c.x, c.z - 0.075, size, silk, 'center')
    else if (c.side === 1) text(p, c.ref, c.x + 0.06, c.z, size, silk, 'left')
    else text(p, c.ref, c.x - 0.06, c.z, size, silk, 'right')
  }
  for (const r of LB_RES) {
    frame(p, r.x - 0.07, r.z - 0.04, r.x + 0.07, r.z + 0.04, SILK_W * 0.7, silk)
    text(p, r.ref, r.x + 0.085, r.z, 0.036, silk, 'left')
  }
  for (const tp of LB_TPS) {
    ring(p, tp.x, tp.z, 0.046, SILK_W * 0.8, silk)
    text(p, tp.ref, tp.x + 0.06, tp.z, 0.036, silk, 'left')
  }
  for (const k of LB_RELAYS) {
    frame(p, k.x - RELAY.w / 2 - 0.015, k.z - RELAY.d / 2 - 0.012, k.x + RELAY.w / 2 + 0.015, k.z + RELAY.d / 2 + 0.012, SILK_W, silk)
    circ(p, k.x - RELAY.w / 2 + 0.03, k.z - RELAY.d / 2 - 0.035, 0.01, silk)
    text(p, k.ref, k.x, k.z - RELAY.d / 2 - 0.075, 0.04, silk, 'center', true)
  }
  for (const h of LB_HEADERS) {
    const z0 = HEADER.cz - HEADER.d / 2
    frame(p, h.x - HEADER.w / 2 - 0.012, z0 - 0.012, h.x + HEADER.w / 2 + 0.012, z0 + HEADER.d + 0.012, SILK_W, silk)
    text(p, h.ref, h.x, z0 - 0.07, 0.05, silk, 'center', true)
  }
  for (const s of LB_SMAS) text(p, s.ref, s.x + 0.08, s.z - 0.11, 0.036, silk, 'left')
  for (const [x, z] of LB_HOLES) ring(p, x, z, 0.1, SILK_W, silk)

  // 标题栏（右后角，避开 Socket 外框和电容）：板名 / 料号 / 封装 / 周期
  frame(p, 1.16, -1.37, 2.0, -0.92, SILK_W, silk)
  text(p, 'DIB-16CH REV A', 1.19, -1.3, 0.066, silk, 'left', true)
  text(p, 'P/N 870-0216-01', 1.19, -1.2, 0.044, silk, 'left')
  text(p, pkg === 'BGA' ? 'SKT BGA-100' : 'SKT QFP-64', 1.19, -1.11, 0.04, silk, 'left')
  text(p, 'IC-LAB WK2641', 1.19, -1.02, 0.04, silk, 'left')

  // 叠层表（左后角），和板边看到的层一一对应
  frame(p, -2.0, -1.37, -1.3, -0.92, SILK_W, silk)
  text(p, 'STACK-UP 8L', -1.97, -1.3, 0.05, silk, 'left', true)
  const names = PCB_STACK.layers.map((t, i) => `L${i + 1} ${t}`)
  text(p, names.slice(0, 4).join(' '), -1.97, -1.19, 0.031, silk, 'left')
  text(p, names.slice(4).join(' '), -1.97, -1.1, 0.031, silk, 'left')
  text(p, 'FR4 1.6mm ENIG', -1.97, -1.01, 0.034, silk, 'left')

  // 左前角：ESD 警示；右前角：序列号条码
  p.g.strokeStyle = silk
  p.g.lineWidth = SILK_W * p.S
  p.g.beginPath()
  p.g.moveTo(p.X(-1.92), p.Y(1.3))
  p.g.lineTo(p.X(-1.82), p.Y(1.12))
  p.g.lineTo(p.X(-1.72), p.Y(1.3))
  p.g.closePath()
  p.g.stroke()
  text(p, '!', -1.82, 1.24, 0.07, silk, 'center', true)
  text(p, 'ESD', -1.66, 1.17, 0.05, silk, 'left', true)
  text(p, 'SENSITIVE', -1.66, 1.25, 0.034, silk, 'left')
  let bx = 1.42
  for (let i = 0; i < 26; i += 1) {
    const w = (i * 7) % 3 === 0 ? 0.012 : 0.006
    box(p, bx + w / 2, 1.16, w, 0.12, silk)
    bx += w + 0.008
  }
  text(p, 'S/N 0042', 1.42, 1.29, 0.036, silk, 'left')
}

function drawLbBottom(p: Painter, pal: Pal, pkg: Pkg, albedo: boolean) {
  const { g } = p
  g.fillStyle = pal.mask
  g.fillRect(0, 0, g.canvas.width, g.canvas.height)
  if (albedo) mottle(g)
  // 底层走线：Pogo 焊盘 → 过孔 1
  for (let ch = 0; ch < CHANNEL_COUNT; ch += 1) {
    const r = ftRoute(pkg, ch)
    line(p, [[r[0]!.x, r[0]!.z], [r[1]!.x, r[1]!.z]], 0.03, pal.maskCu)
  }
  for (const [x, z] of [...routeVias(pkg), ...fanoutVias(pkg), ...decorVias()]) {
    circ(p, x, z, 0.021, pal.maskCu)
    circ(p, x, z, 0.008, pal.dimple)
  }
  for (const [x, z] of towerPinXZ('FT')) {
    circ(p, x, z, 0.031, pal.relief)
    circ(p, x, z, 0.024, pal.gold)
  }
  for (const h of LB_HEADERS) {
    for (const [x, z] of headerPins(h.x)) {
      circ(p, x, z, 0.027, pal.gold)
      circ(p, x, z, 0.012, pal.hole)
    }
  }
  for (const [x, z] of LB_HOLES) {
    circ(p, x, z, 0.078, pal.gold)
    circ(p, x, z, 0.045, pal.hole)
  }
  const silk = pal.silk
  frame(p, -LB.w / 2 + 0.035, -LB.d / 2 + 0.035, LB.w / 2 - 0.035, LB.d / 2 - 0.035, SILK_W * 2, silk)
  for (let c = 0; c < CARD_COUNT; c += 1) {
    for (const zs of [1, -1]) {
      const x = cardX(c)
      frame(p, x - 0.18, zs * 1.15 - 0.34, x + 0.18, zs * 1.15 + 0.34, SILK_W * 2, silk)
      const ch = zs === 1 ? c : c + CARD_COUNT
      text(p, `CH${ch + 1}`, x, zs * 1.56, 0.06, silk, 'center', true)
    }
  }
  text(p, 'DIB-16CH  BOTTOM (L8)', 0, -0.12, 0.09, silk, 'center', true)
  text(p, 'POGO SIDE  16 CH', 0, 0.06, 0.07, silk, 'center')
}

/** Load Board 顶面：绿油 + 丝印 + 沉金焊盘（按封装分两套） */
export function lbTopTextures(pkg: Pkg) {
  const w = 2048
  const h = Math.round((w * LB.d) / LB.w)
  return {
    map: make(`lb-top-${pkg}`, w, h, (g) => drawLbTop(painter(g, false), ALBEDO, pkg, true)),
    orm: make(`lb-top-orm-${pkg}`, w / 2, Math.round(h / 2), (g) => drawLbTop(painter(g, false), ORM, pkg, false), true),
  }
}

/** Load Board 底面：Pogo 焊盘区 + 底层走线 + 通道丝印 */
export function lbBottomTextures(pkg: Pkg) {
  const w = 1024
  const h = Math.round((w * LB.d) / LB.w)
  return {
    map: make(`lb-bot-${pkg}`, w, h, (g) => drawLbBottom(painter(g, true), ALBEDO, pkg, true)),
    orm: make(`lb-bot-orm-${pkg}`, w / 2, Math.round(h / 2), (g) => drawLbBottom(painter(g, true), ORM, pkg, false), true),
  }
}

const STACK_COLOR = {
  albedo: { mask: '#1c6a3a', cu: '#cf7c43', diel: '#a99a62' },
  orm: { mask: '#005c00', cu: '#0048ff', diel: '#00c800' },
}

/** 板边：阻焊 / 铜箔 / 介质交替的叠层条纹（侧面 UV 的 v 方向 = 板厚方向） */
export function lbEdgeTextures() {
  const draw = (pal: (typeof STACK_COLOR)['albedo']) => (g: CanvasRenderingContext2D, w: number, h: number) => {
    const sy = h / LB.t
    const Y = (y: number) => (LB.t / 2 - y) * sy
    const st = pcbStack(LB.t)
    g.fillStyle = pal.diel
    g.fillRect(0, 0, w, h)
    g.fillStyle = pal.mask
    g.fillRect(0, 0, w, PCB_STACK.mask * sy)
    g.fillRect(0, h - PCB_STACK.mask * sy, w, PCB_STACK.mask * sy)
    g.fillStyle = pal.cu
    for (const y of st.copper) g.fillRect(0, Y(y + PCB_STACK.cu / 2), w, PCB_STACK.cu * sy)
  }
  return {
    map: make('lb-edge', 8, 512, draw(STACK_COLOR.albedo)),
    orm: make('lb-edge-orm', 8, 512, draw(STACK_COLOR.orm), true),
  }
}

/**
 * 剖切截面（z = 0 处）：各层铜箔 + 介质 + 两面绿油；
 * GND / PWR 是整层铜皮（信号过孔处挖出隔离环），信号层是一段段走线的截面；z = 0 那排过孔画成贯穿全板的电镀孔。
 */
export function lbSectionTexture(pkg: Pkg) {
  return make(`lb-cut-${pkg}`, 2048, 160, (g, w, h) => {
    const sx = w / LB.w
    const sy = h / LB.t
    const X = (x: number) => (x + LB.w / 2) * sx
    const Y = (y: number) => (LB.t / 2 - y) * sy
    const st = pcbStack(LB.t)
    const cu = PCB_STACK.cu
    g.fillStyle = '#b3a46b'
    g.fillRect(0, 0, w, h)
    // 玻纤布纹理
    g.fillStyle = 'rgba(90,70,30,0.18)'
    for (const d of st.dielectric) {
      for (let y = Y(d.y + d.h / 2) + 2; y < Y(d.y - d.h / 2) - 1; y += 4) {
        for (let x = (y * 7) % 18; x < w; x += 18) g.fillRect(x, y, 10, 1.5)
      }
    }
    g.fillStyle = '#1c6a3a'
    g.fillRect(0, 0, w, PCB_STACK.mask * sy)
    g.fillRect(0, h - PCB_STACK.mask * sy, w, PCB_STACK.mask * sy)

    const cut = (v: [number, number]) => Math.abs(v[1]) < 1e-3
    const sigVias = pkg === 'BGA' ? fanoutVias(pkg).filter(cut).map((v) => v[0]) : []
    const gndVias = pkg === 'QFP' ? fanoutVias(pkg).filter(cut).map((v) => v[0]) : []
    const pwrVias = decorVias()
      .filter(cut)
      .filter((v) => Math.abs(v[0]) < 1.3)
      .map((v) => v[0])
    const allVias = [...sigVias, ...gndVias, ...pwrVias]

    PCB_STACK.layers.forEach((kind, i) => {
      const top = Y(st.copper[i]! + cu / 2)
      const hh = cu * sy
      g.fillStyle = '#cf7c43'
      if (kind === 'GND' || kind === 'PWR') {
        g.fillRect(0, top, w, hh)
        // 不属于本层网络的过孔周围挖隔离环（anti-pad）
        const foreign = kind === 'GND' ? [...sigVias, ...pwrVias] : [...sigVias, ...gndVias]
        g.fillStyle = '#b3a46b'
        for (const x of foreign) g.fillRect(X(x) - 0.03 * sx, top, 0.06 * sx, hh)
        return
      }
      // 信号层：走线截面（确定性的伪随机位置，避开过孔）
      for (let k = 0; k < 40; k += 1) {
        const x = -2.2 + k * 0.112 + 0.03 * Math.sin(k * 12.9898 + i * 4.1)
        const keep = Math.abs(Math.sin(k * 78.233 + i * 1.7)) > 0.4
        if (!keep || allVias.some((v) => Math.abs(v - x) < 0.06)) continue
        g.fillRect(X(x) - 0.014 * sx, top, 0.028 * sx, hh)
      }
      if (i === 0) {
        for (const s of [-1, 1]) g.fillRect(X(Math.min(s * 1.36, s * 1.98)), top, 0.62 * sx, hh)
      }
    })

    // 电镀通孔：孔壁铜 + 中间的孔 + 顶 / 底层的环形焊盘
    const yTop = Y(st.copper[0]! + cu / 2)
    const yBot = Y(st.copper[st.copper.length - 1]! - cu / 2)
    for (const x of allVias) {
      g.fillStyle = '#cf7c43'
      g.fillRect(X(x) - 0.024 * sx, yTop, 0.048 * sx, cu * sy)
      g.fillRect(X(x) - 0.024 * sx, yBot - cu * sy, 0.048 * sx, cu * sy)
      g.fillRect(X(x) - 0.013 * sx, yTop, 0.026 * sx, yBot - yTop)
      g.fillStyle = '#2b1d12'
      g.fillRect(X(x) - 0.008 * sx, yTop + cu * sy, 0.016 * sx, yBot - yTop - 2 * cu * sy)
    }
  })
}

/** 继电器顶面打标 */
export function relayTopTexture() {
  return make('relay-top', 256, 172, (g, w, h) => {
    g.fillStyle = '#20252c'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#d9dde2'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = `bold 40px ${MONO}`
    g.fillText('G6K-2F', w / 2, h / 2 - 22)
    g.font = `30px ${MONO}`
    g.fillText('5VDC', w / 2, h / 2 + 24)
    g.beginPath()
    g.arc(22, 22, 9, 0, Math.PI * 2)
    g.fill()
  })
}

/** DUT 顶面激光打标；BGA 的 A1 在左前角，QFP 的 pin 1 在左后角 */
export function dutMarkTexture(pkg: Pkg) {
  return make(`dut-${pkg}`, 512, 512, (g, w, h) => {
    g.fillStyle = '#1a1b1e'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 900; i += 1) {
      const v = 22 + Math.floor(Math.random() * 10)
      g.fillStyle = `rgb(${v},${v},${v + 2})`
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    }
    g.fillStyle = '#8b9097'
    g.textAlign = 'center'
    g.font = `bold 64px ${MONO}`
    g.fillText('ICLAB', w / 2, h / 2 - 34)
    g.font = `bold 46px ${MONO}`
    g.fillText(pkg === 'BGA' ? 'D02-A7B' : 'D02-Q64', w / 2, h / 2 + 30)
    g.font = `36px ${MONO}`
    g.fillText('2641  TW', w / 2, h / 2 + 86)
    const dotY = pkg === 'BGA' ? h - 60 : 60
    g.fillStyle = '#2b2d31'
    g.beginPath()
    g.arc(60, dotY, 26, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#4a4e55'
    g.lineWidth = 3
    g.stroke()
  })
}

/** 单颗 die 的版图：pad 环 + 若干逻辑 / SRAM 块 */
export function dieTexture() {
  return make('die', 256, 256, (g, w, h) => {
    g.fillStyle = '#2a3140'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#3b465c'
    g.fillRect(10, 10, w - 20, h - 20)
    const blocks: Array<[number, number, number, number, string]> = [
      [40, 40, 80, 70, '#4b5a7a'],
      [130, 40, 86, 70, '#5a4a72'],
      [40, 120, 176, 50, '#355a66'],
      [40, 178, 100, 38, '#5d6a52'],
      [148, 178, 68, 38, '#4b5a7a'],
    ]
    for (const [x, y, bw, bh, c] of blocks) {
      g.fillStyle = c
      g.fillRect(x, y, bw, bh)
    }
    g.strokeStyle = 'rgba(200,210,230,0.25)'
    g.lineWidth = 1
    for (let i = 0; i < 8; i += 1) {
      g.beginPath()
      g.moveTo(40, 120 + i * 6)
      g.lineTo(216, 120 + i * 6)
      g.stroke()
    }
    g.fillStyle = '#c9b06a'
    for (let i = 0; i < 9; i += 1) {
      const t = 28 + i * 25
      g.fillRect(t, 16, 12, 12)
      g.fillRect(t, h - 28, 12, 12)
      g.fillRect(16, t, 12, 12)
      g.fillRect(w - 28, t, 12, 12)
    }
  })
}

/** 探针卡 PCB 顶层丝印（圆形，透明底） */
export function pcSilkTexture() {
  return make('pc-silk', 1024, 1024, (g, w) => {
    g.clearRect(0, 0, w, w)
    g.strokeStyle = '#eef2ea'
    g.fillStyle = '#eef2ea'
    g.lineWidth = 3
    const c = w / 2
    g.beginPath()
    g.arc(c, c, c - 20, 0, Math.PI * 2)
    g.stroke()
    g.beginPath()
    g.arc(c, c, c * 0.68, 0, Math.PI * 2)
    g.stroke()
    g.textAlign = 'center'
    g.font = `bold 34px ${MONO}`
    g.fillText('PROBE CARD  PC-D02', c, c - c * 0.72)
    g.font = `24px ${MONO}`
    g.fillText('POGO RING  ·  18 BLOCKS', c, c + c * 0.78)
    for (let i = 0; i < 4; i += 1) {
      const a = Math.PI / 4 + (i * Math.PI) / 2
      g.beginPath()
      g.arc(c + Math.cos(a) * c * 0.62, c + Math.sin(a) * c * 0.62, 18, 0, Math.PI * 2)
      g.stroke()
    }
  })
}

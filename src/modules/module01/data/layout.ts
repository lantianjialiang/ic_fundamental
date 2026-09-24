/**
 * 教学工位布局。
 * FT：DUT 在上，ATE 在下（handler 把封装器件压进 Socket）。
 * CP：ATE 在上，Wafer 在下（prober + probe card）。
 * 爆炸只拉开间距，不颠倒该模式下的上下顺序。
 */

export type TestFlow = 'FT' | 'CP'

export const CHANNEL_COUNT = 16
export const CHANNEL_SPAN = 2.8
export const CHANNEL_Z = 0.95

export function channelX(index: number): number {
  const t = index / (CHANNEL_COUNT - 1)
  return -CHANNEL_SPAN / 2 + t * CHANNEL_SPAN
}

export const ATE_BODY = {
  w: 4.2,
  h: 1.05,
  d: 2.8,
  channelRadius: 0.045,
  channelZ: CHANNEL_Z,
}

/** FT：测试机在下方，Channel 在顶面朝上对接 Load Board */
export const FT_ATE = {
  assembledY: 0.18,
  explodeOffset: -1.65,
  channelLocalY: 0.56,
}

/** CP：测试头在上方，Channel 在底面朝下对接 Probe Card */
export const CP_ATE = {
  assembledY: 2.35,
  explodeOffset: 1.8,
  channelLocalY: -0.56,
}

export function atePose(flow: TestFlow) {
  return flow === 'FT' ? FT_ATE : CP_ATE
}

export const LOAD_BOARD = {
  assembledY: 1.32,
  explodeOffset: 0.12,
  body: { w: 4.0, h: 0.12, d: 2.6 },
  connectorLocalY: -0.08,
  connectorZ: CHANNEL_Z,
}

export const SOCKET = {
  assembledY: 1.58,
  explodeOffset: 0.82,
  body: { w: 1.55, h: 0.18, d: 1.55 },
  contactRadius: 0.03,
  boardPinRadius: 0.022,
  boardPinLength: 0.12,
}

export const DUT = {
  assembledY: 1.96,
  explodeOffset: 1.65,
  body: { w: 1.32, h: 0.16, d: 1.32 },
  ballRadius: 0.035,
  ballPitch: 0.112,
  grid: 10,
}

/** JEDEC 风格列号：跳过 I */
export const BGA_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'] as const

export function layerY(
  part: { assembledY: number; explodeOffset: number },
  progress: number,
): number {
  return part.assembledY + part.explodeOffset * progress
}

export function bgaXZ(col: number, row: number): [number, number] {
  const n = DUT.grid
  const pitch = DUT.ballPitch
  const x = (col - (n - 1) / 2) * pitch
  const z = ((n - 1) / 2 - row) * pitch
  return [x, z]
}

/** 第一阶段走线示意：16 个 Channel 对应前 16 个 Ball（A1–K1, A2–F2） */
export function mappedBall(channelIndex: number): { col: number; row: number } {
  if (channelIndex < 10) return { col: channelIndex, row: 0 }
  return { col: channelIndex - 10, row: 1 }
}

export const PROBE_CARD = {
  assembledY: 0.72,
  explodeOffset: 0.2,
  radius: 1.95,
  thickness: 0.12,
  connectorLocalY: 0.08,
  connectorZ: CHANNEL_Z,
  padRadius: 0.04,
}

export const NEEDLES = {
  assembledY: 0.56,
  explodeOffset: -0.7,
  length: 0.22,
  radius: 0.012,
  contactRadius: 0.028,
  contactLength: 0.08,
}

export const WAFER = {
  assembledY: 0.08,
  explodeOffset: -1.7,
  radius: 1.72,
  thickness: 0.05,
  /** 主定位边切入深度（primary flat，不是圆形 notch） */
  flatDepth: 0.36,
  dieSize: 0.36,
  dieStreet: 0.045,
}

export type DieCell = {
  col: number
  row: number
  x: number
  z: number
  isDut: boolean
}

export function diePitch(): number {
  return WAFER.dieSize + WAFER.dieStreet
}

let cachedDieCells: DieCell[] | null = null

export function dieCells(): DieCell[] {
  if (cachedDieCells) return cachedDieCells
  cachedDieCells = buildDieCells()
  return cachedDieCells
}

function buildDieCells(): DieCell[] {
  const pitch = diePitch()
  const n = 9
  const innerR = WAFER.radius - 0.06
  const flatX = WAFER.radius - WAFER.flatDepth
  const cells: DieCell[] = []
  const half = WAFER.dieSize / 2

  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      const x = (col - (n - 1) / 2) * pitch
      const z = ((n - 1) / 2 - row) * pitch
      const corners: Array<[number, number]> = [
        [x - half, z - half],
        [x + half, z - half],
        [x - half, z + half],
        [x + half, z + half],
      ]
      const inside = corners.every(([cx, cz]) => cx * cx + cz * cz < innerR * innerR && cx < flatX - 0.02)
      if (!inside) continue
      cells.push({ col, row, x, z, isDut: false })
    }
  }

  let dutIndex = 0
  let best = Infinity
  cells.forEach((cell, i) => {
    const d = cell.x * cell.x + cell.z * cell.z
    if (d < best) {
      best = d
      dutIndex = i
    }
  })
  if (cells[dutIndex]) cells[dutIndex] = { ...cells[dutIndex], isDut: true }
  return cells
}

export function dutDie(): DieCell {
  return dieCells().find((cell) => cell.isDut) ?? { col: 4, row: 4, x: 0, z: 0, isDut: true }
}

/** 16 根针落在被测 die 的 pad 上 */
export function needleXZ(index: number): [number, number] {
  const col = index % 4
  const row = Math.floor(index / 4)
  const pitch = 0.07
  const die = dutDie()
  return [die.x + (col - 1.5) * pitch, die.z + (1.5 - row) * pitch]
}

export const CAMERA = {
  position: [6.2, 5.1, 6.2] as [number, number, number],
  fov: 40,
  target: [0, 1.15, 0] as [number, number, number],
}

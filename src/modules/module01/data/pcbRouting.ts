import {
  LOAD_BOARD,
  PROBE_CARD,
  bgaXZ,
  channelX,
  mappedBall,
  needleXZ,
} from './layout'

export type PcbLayer = 'top' | 'inner' | 'bottom'

export type PcbNode = {
  x: number
  z: number
  layer: PcbLayer
  kind: 'pad' | 'via' | 'bend'
}

export const LAYER_COLOR: Record<PcbLayer, string> = {
  top: '#d4b45a',
  inner: '#c45c38',
  bottom: '#8fa3b8',
}

export function pcbLayerY(thickness: number, layer: PcbLayer): number {
  if (layer === 'top') return thickness / 2 + 0.013
  if (layer === 'bottom') return -thickness / 2 - 0.013
  return 0
}

/** FT：板底接 ATE，板顶接 Socket。Bottom pad → via → inner track → via → top pad */
export function ftBoardRoute(channel: number): PcbNode[] {
  const cx = channelX(channel)
  const cz = LOAD_BOARD.connectorZ
  const { col, row } = mappedBall(channel)
  const [bx, bz] = bgaXZ(col, row)
  const via1z = cz - 0.26
  const via2z = bz + (bz >= 0 ? 0.13 : -0.13)
  const bendZ = 0.18 + (channel % 4) * 0.075
  const bendX = cx * 0.35 + bx * 0.35 + ((channel % 2) * 2 - 1) * 0.12

  return [
    { x: cx, z: cz, layer: 'bottom', kind: 'pad' },
    { x: cx, z: via1z, layer: 'bottom', kind: 'via' },
    { x: cx, z: via1z, layer: 'inner', kind: 'via' },
    { x: bendX, z: bendZ, layer: 'inner', kind: 'bend' },
    { x: bx, z: via2z, layer: 'inner', kind: 'via' },
    { x: bx, z: via2z, layer: 'top', kind: 'via' },
    { x: bx, z: bz, layer: 'top', kind: 'pad' },
  ]
}

/** CP：板顶接 ATE，板底接 Needle。Top pad → via → inner track → via → bottom pad */
export function cpBoardRoute(channel: number): PcbNode[] {
  const cx = channelX(channel)
  const cz = PROBE_CARD.connectorZ
  const [nx, nz] = needleXZ(channel)
  const via1z = cz - 0.24
  const via2x = nx
  const via2z = nz + (Math.abs(nz) < 0.02 ? 0.11 : Math.sign(nz) * 0.11)
  const bendX = ((channel % 4) - 1.5) * 0.14
  const bendZ = 0.38 - Math.floor(channel / 4) * 0.09

  return [
    { x: cx, z: cz, layer: 'top', kind: 'pad' },
    { x: cx, z: via1z, layer: 'top', kind: 'via' },
    { x: cx, z: via1z, layer: 'inner', kind: 'via' },
    { x: bendX, z: bendZ, layer: 'inner', kind: 'bend' },
    { x: via2x, z: via2z, layer: 'inner', kind: 'via' },
    { x: via2x, z: via2z, layer: 'bottom', kind: 'via' },
    { x: nx, z: nz, layer: 'bottom', kind: 'pad' },
  ]
}

export function sameLayerRuns(nodes: PcbNode[]): Array<[PcbNode, PcbNode]> {
  const runs: Array<[PcbNode, PcbNode]> = []
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i]
    const b = nodes[i + 1]
    if (a && b && a.layer === b.layer) runs.push([a, b])
  }
  return runs
}

export function viaSites(nodes: PcbNode[]): Array<{ x: number; z: number }> {
  const seen = new Set<string>()
  const sites: Array<{ x: number; z: number }> = []
  for (const node of nodes) {
    if (node.kind !== 'via') continue
    const key = `${node.x.toFixed(3)},${node.z.toFixed(3)}`
    if (seen.has(key)) continue
    seen.add(key)
    sites.push({ x: node.x, z: node.z })
  }
  return sites
}

import {
  BGA_COLS,
  CHANNEL_COUNT,
  CHANNEL_Z,
  DUT,
  LOAD_BOARD,
  NEEDLES,
  PROBE_CARD,
  SOCKET,
  WAFER,
  atePose,
  bgaXZ,
  channelX,
  layerY,
  mappedBall,
  needleXZ,
  type TestFlow,
} from './layout'
import { cpBoardRoute, ftBoardRoute, pcbLayerY, type PcbNode } from './pcbRouting'

export type Vec3 = [number, number, number]

export type PathHopId =
  | 'ateCh'
  | 'lbBottom'
  | 'via1'
  | 'inner'
  | 'via2'
  | 'lbTop'
  | 'socketPin'
  | 'socketContact'
  | 'dutBall'
  | 'pcTop'
  | 'pcBottom'
  | 'needleContact'
  | 'needleTip'
  | 'diePad'

export type SignalPath = {
  channel: number
  hops: Vec3[]
  hopIds: PathHopId[]
  endpoint: string
  /** 组件之间的空隙连线，不含板内 copper（由 PCB 自己画） */
  airHops: Vec3[][]
  pcbNodes: PcbNode[]
}

export function ballName(channel: number): string {
  const { col, row } = mappedBall(channel)
  return `${BGA_COLS[col]}${row + 1}`
}

export function channelForBall(col: number, row: number): number | null {
  for (let i = 0; i < CHANNEL_COUNT; i += 1) {
    const ball = mappedBall(i)
    if (ball.col === col && ball.row === row) return i
  }
  return null
}

function nodesToWorld(nodes: PcbNode[], boardY: number, thickness: number): Vec3[] {
  return nodes.map((node) => [node.x, boardY + pcbLayerY(thickness, node.layer), node.z])
}

export function buildSignalPath(flow: TestFlow, channel: number, progress: number): SignalPath {
  const pose = atePose(flow)
  const ateY = layerY(pose, progress)
  const ate: Vec3 = [channelX(channel), ateY + pose.channelLocalY, CHANNEL_Z]

  if (flow === 'FT') {
    const lbY = layerY(LOAD_BOARD, progress)
    const skY = layerY(SOCKET, progress)
    const dutY = layerY(DUT, progress)
    const ball = mappedBall(channel)
    const [bx, bz] = bgaXZ(ball.col, ball.row)
    const name = ballName(channel)
    const pcbNodes = ftBoardRoute(channel)
    const pcbWorld = nodesToWorld(pcbNodes, lbY, LOAD_BOARD.body.h)
    const firstPcb = pcbWorld[0] ?? ate
    const lastPcb = pcbWorld[pcbWorld.length - 1] ?? firstPcb
    const socketPin: Vec3 = [bx, skY - SOCKET.body.h / 2 - SOCKET.boardPinLength, bz]
    const socketContact: Vec3 = [bx, skY + SOCKET.body.h / 2 + 0.024, bz]
    const dutBall: Vec3 = [bx, dutY - DUT.body.h / 2 - DUT.ballRadius * 0.85, bz]

    return {
      channel,
      endpoint: name,
      pcbNodes,
      hopIds: [
        'ateCh',
        'lbBottom',
        'via1',
        'inner',
        'via2',
        'lbTop',
        'socketPin',
        'socketContact',
        'dutBall',
      ],
      hops: [ate, ...pcbWorld, socketPin, socketContact, dutBall],
      airHops: [
        [ate, firstPcb],
        [lastPcb, socketPin],
        [socketContact, dutBall],
      ],
    }
  }

  const pcY = layerY(PROBE_CARD, progress)
  const ndY = layerY(NEEDLES, progress)
  const wfY = layerY(WAFER, progress)
  const [nx, nz] = needleXZ(channel)
  const pcbNodes = cpBoardRoute(channel)
  const pcbWorld = nodesToWorld(pcbNodes, pcY, PROBE_CARD.thickness)
  const firstPcb = pcbWorld[0] ?? ate
  const lastPcb = pcbWorld[pcbWorld.length - 1] ?? firstPcb
  const needleContact: Vec3 = [nx, ndY + 0.025 + NEEDLES.contactLength / 2, nz]
  const needleTip: Vec3 = [nx, ndY - NEEDLES.length / 2 - 0.025, nz]
  const diePad: Vec3 = [nx, wfY + WAFER.thickness / 2 + 0.016, nz]

  return {
    channel,
    endpoint: `Die pad ${channel + 1}`,
    pcbNodes,
    hopIds: [
      'ateCh',
      'pcTop',
      'via1',
      'inner',
      'via2',
      'pcBottom',
      'needleContact',
      'needleTip',
      'diePad',
    ],
    hops: [ate, ...pcbWorld, needleContact, needleTip, diePad],
    airHops: [
      [ate, firstPcb],
      [lastPcb, needleContact],
      [needleTip, diePad],
    ],
  }
}

export function allSignalPaths(flow: TestFlow, progress: number): SignalPath[] {
  return Array.from({ length: CHANNEL_COUNT }, (_, i) => buildSignalPath(flow, i, progress))
}

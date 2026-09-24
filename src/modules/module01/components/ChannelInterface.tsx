import {
  atePose,
  CHANNEL_COUNT,
  LOAD_BOARD,
  PROBE_CARD,
  channelX,
  layerY,
  type TestFlow,
} from '../data/layout'

type ChannelInterfaceProps = {
  progress: number
  flow: TestFlow
}

/** 仅连接 ATE Channel → 接口板 Connector，绝不画到 DUT。 */
export function ChannelInterface({ progress, flow }: ChannelInterfaceProps) {
  const pose = atePose(flow)
  const ateY = layerY(pose, progress)
  const board = flow === 'FT' ? LOAD_BOARD : PROBE_CARD
  const boardY = layerY(board, progress)
  const ateCh = ateY + pose.channelLocalY
  const boardCh = boardY + board.connectorLocalY
  const height = Math.max(0.04, Math.abs(ateCh - boardCh))
  const mid = (ateCh + boardCh) / 2

  return (
    <group>
      {Array.from({ length: CHANNEL_COUNT }, (_, i) => (
        <mesh key={i} position={[channelX(i), mid, board.connectorZ]}>
          <cylinderGeometry args={[0.012, 0.012, height, 8]} />
          <meshStandardMaterial color="#6d747c" roughness={0.5} metalness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

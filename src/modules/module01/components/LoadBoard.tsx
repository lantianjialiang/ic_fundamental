import { useLocale } from '../../../i18n/LocaleContext'
import { ui } from '../../../i18n/ui'
import { CHANNEL_COUNT, DUT, LOAD_BOARD, SOCKET, bgaXZ, channelX, layerY } from '../data/layout'
import { ftBoardRoute } from '../data/pcbRouting'
import { PcbCopper } from './PcbCopper'
import { SceneLabel } from './SceneLabel'

type LoadBoardProps = {
  progress: number
  selectedChannel: number | null
  onSelect: (channel: number) => void
}

export function LoadBoard({ progress, selectedChannel, onSelect }: LoadBoardProps) {
  const { t } = useLocale()
  const y = layerY(LOAD_BOARD, progress)
  const { w, h, d } = LOAD_BOARD.body
  const holeR = 0.07
  const holeInset = 0.22

  return (
    <group position={[0, y, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#2f6b3a" roughness={0.7} metalness={0.08} transparent opacity={0.72} />
      </mesh>

      {(
        [
          [-w / 2 + holeInset, -d / 2 + holeInset],
          [w / 2 - holeInset, -d / 2 + holeInset],
          [-w / 2 + holeInset, d / 2 - holeInset],
          [w / 2 - holeInset, d / 2 - holeInset],
        ] as const
      ).map(([hx, hz]) => (
        <mesh key={`${hx}-${hz}`} position={[hx, h / 2 + 0.002, hz]}>
          <cylinderGeometry args={[holeR, holeR, 0.02, 16]} />
          <meshStandardMaterial color="#1a1f24" roughness={0.8} metalness={0.1} />
        </mesh>
      ))}

      <mesh position={[0, -h / 2 - 0.03, LOAD_BOARD.connectorZ]}>
        <boxGeometry args={[CHANNEL_COUNT * 0.2 + 0.2, 0.06, 0.28]} />
        <meshStandardMaterial color="#2a2e34" roughness={0.45} metalness={0.3} />
      </mesh>
      {Array.from({ length: CHANNEL_COUNT }, (_, i) => (
        <mesh
          key={i}
          position={[channelX(i), -h / 2 - 0.055, LOAD_BOARD.connectorZ]}
          onClick={(event) => {
            event.stopPropagation()
            onSelect(i)
          }}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.04, 10]} />
          <meshStandardMaterial
            color={selectedChannel === i ? '#f0d56a' : '#b08d3e'}
            emissive={selectedChannel === i ? '#8a7018' : '#000000'}
            roughness={0.35}
            metalness={0.5}
          />
        </mesh>
      ))}

      <mesh position={[0, h / 2 + 0.003, 0]}>
        <boxGeometry args={[SOCKET.body.w + 0.18, 0.008, SOCKET.body.d + 0.18]} />
        <meshStandardMaterial color="#245530" roughness={0.75} metalness={0.05} />
      </mesh>
      {Array.from({ length: DUT.grid }, (_, row) =>
        Array.from({ length: DUT.grid }, (_, col) => {
          const [x, z] = bgaXZ(col, row)
          return (
            <mesh key={`pad-${col}-${row}`} position={[x, h / 2 + 0.012, z]}>
              <cylinderGeometry args={[0.038, 0.038, 0.018, 12]} />
              <meshStandardMaterial color="#e0c36a" roughness={0.32} metalness={0.55} />
            </mesh>
          )
        }),
      )}

      {Array.from({ length: CHANNEL_COUNT }, (_, i) => (
        <PcbCopper
          key={`net-${i}`}
          nodes={ftBoardRoute(i)}
          thickness={h}
          selected={selectedChannel === i}
          dimmed={selectedChannel !== null && selectedChannel !== i}
          onSelect={() => onSelect(i)}
        />
      ))}

      <mesh position={[-1.55, h / 2 + 0.04, -0.55]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.22, 0.07, 0.1]} />
        <meshStandardMaterial color="#3d2a1c" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[1.45, h / 2 + 0.035, -0.4]}>
        <boxGeometry args={[0.16, 0.06, 0.1]} />
        <meshStandardMaterial color="#c4b48a" roughness={0.4} metalness={0.2} />
      </mesh>

      <SceneLabel
        position={[0, h / 2 + 0.28, -d / 2 + 0.15]}
        title="LOAD BOARD"
        subtitle={t(ui.scene.lbSub)}
      />
      <SceneLabel position={[0, -0.28, LOAD_BOARD.connectorZ + 0.28]} title={t(ui.scene.lbBottom)} />
      <SceneLabel position={[0, 0.22, 0]} title={t(ui.scene.lbTop)} />
    </group>
  )
}

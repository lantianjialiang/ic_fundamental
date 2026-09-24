import { useLocale } from '../../../i18n/LocaleContext'
import { ui } from '../../../i18n/ui'
import { BGA_COLS, DUT as DUT_LAYOUT, bgaXZ, layerY } from '../data/layout'
import { channelForBall } from '../data/paths'
import { SceneLabel } from './SceneLabel'

type DUTProps = {
  progress: number
  selectedChannel: number | null
  onSelect: (channel: number) => void
}

export function DUT({ progress, selectedChannel, onSelect }: DUTProps) {
  const { t } = useLocale()
  const y = layerY(DUT_LAYOUT, progress)
  const { w, h, d } = DUT_LAYOUT.body
  const ballY = -h / 2 - DUT_LAYOUT.ballRadius * 0.85

  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#1c1f24" roughness={0.55} metalness={0.18} />
      </mesh>
      <mesh position={[-w / 2 - 0.006, 0, d / 2 - 0.16]}>
        <boxGeometry args={[0.012, 0.07, 0.07]} />
        <meshStandardMaterial color="#8a9098" roughness={0.45} metalness={0.15} />
      </mesh>

      {Array.from({ length: DUT_LAYOUT.grid }, (_, row) =>
        Array.from({ length: DUT_LAYOUT.grid }, (_, col) => {
          const [x, z] = bgaXZ(col, row)
          const channel = channelForBall(col, row)
          const active = channel !== null && channel === selectedChannel
          return (
            <mesh
              key={`${BGA_COLS[col]}${row + 1}`}
              position={[x, ballY, z]}
              onClick={(event) => {
                if (channel === null) return
                event.stopPropagation()
                onSelect(channel)
              }}
            >
              <sphereGeometry args={[DUT_LAYOUT.ballRadius, 12, 12]} />
              <meshStandardMaterial
                color={active ? '#f0d56a' : '#b7bcc3'}
                emissive={active ? '#8a7018' : '#000000'}
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>
          )
        }),
      )}

      <SceneLabel
        position={[0, h / 2 + 0.2, 0]}
        title="DUT"
        subtitle={t(ui.scene.dutSub)}
      />
    </group>
  )
}

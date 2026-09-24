import { useLocale } from '../../../i18n/LocaleContext'
import { ui } from '../../../i18n/ui'
import { CHANNEL_COUNT, PROBE_CARD, channelX, layerY } from '../data/layout'
import { cpBoardRoute } from '../data/pcbRouting'
import { PcbCopper } from './PcbCopper'
import { SceneLabel } from './SceneLabel'

type ProbeCardProps = {
  progress: number
  selectedChannel: number | null
  onSelect: (channel: number) => void
}

export function ProbeCard({ progress, selectedChannel, onSelect }: ProbeCardProps) {
  const { t } = useLocale()
  const y = layerY(PROBE_CARD, progress)
  const h = PROBE_CARD.thickness
  const r = PROBE_CARD.radius

  return (
    <group position={[0, y, 0]}>
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[r, r, h, 48]} />
        <meshStandardMaterial color="#3a5a32" roughness={0.7} metalness={0.08} transparent opacity={0.7} />
      </mesh>

      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8
        const hr = r - 0.16
        return (
          <mesh key={i} position={[Math.cos(a) * hr, h / 2 + 0.002, Math.sin(a) * hr]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 14]} />
            <meshStandardMaterial color="#1a1f24" roughness={0.8} metalness={0.1} />
          </mesh>
        )
      })}

      <mesh position={[0, h / 2 + 0.03, PROBE_CARD.connectorZ]}>
        <boxGeometry args={[CHANNEL_COUNT * 0.2 + 0.2, 0.06, 0.28]} />
        <meshStandardMaterial color="#2a2e34" roughness={0.45} metalness={0.3} />
      </mesh>
      {Array.from({ length: CHANNEL_COUNT }, (_, i) => (
        <mesh
          key={i}
          position={[channelX(i), h / 2 + 0.055, PROBE_CARD.connectorZ]}
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

      {Array.from({ length: CHANNEL_COUNT }, (_, i) => (
        <PcbCopper
          key={`net-${i}`}
          nodes={cpBoardRoute(i)}
          thickness={h}
          selected={selectedChannel === i}
          dimmed={selectedChannel !== null && selectedChannel !== i}
          onSelect={() => onSelect(i)}
        />
      ))}

      {Array.from({ length: CHANNEL_COUNT }, (_, i) => {
        const pad = cpBoardRoute(i).find((node) => node.kind === 'pad' && node.layer === 'bottom')
        if (!pad) return null
        return (
          <mesh key={`bpad-${i}`} position={[pad.x, -h / 2 - 0.008, pad.z]}>
            <cylinderGeometry args={[PROBE_CARD.padRadius, PROBE_CARD.padRadius, 0.016, 12]} />
            <meshStandardMaterial
              color={selectedChannel === i ? '#f0d56a' : '#e0c36a'}
              roughness={0.32}
              metalness={0.55}
            />
          </mesh>
        )
      })}

      <SceneLabel
        position={[0, h / 2 + 0.28, -r + 0.25]}
        title="PROBE CARD"
        subtitle={t(ui.scene.pcSub)}
      />
      <SceneLabel position={[0, 0.22, PROBE_CARD.connectorZ + 0.28]} title={t(ui.scene.pcTop)} />
    </group>
  )
}

import { useLocale } from '../../../i18n/LocaleContext'
import { ui } from '../../../i18n/ui'
import { ATE_BODY, atePose, CHANNEL_COUNT, channelX, layerY, type TestFlow } from '../data/layout'
import { SceneLabel } from './SceneLabel'

type ATEProps = {
  progress: number
  flow: TestFlow
  selectedChannel: number | null
  onSelect: (channel: number) => void
}

export function ATE({ progress, flow, selectedChannel, onSelect }: ATEProps) {
  const { t } = useLocale()
  const pose = atePose(flow)
  const y = layerY(pose, progress)
  const { w, h, d } = ATE_BODY
  const channelsOnTop = flow === 'FT'

  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#5a616a" roughness={0.5} metalness={0.18} />
      </mesh>
      {!channelsOnTop ? (
        <mesh position={[0, h / 2 + 0.015, 0]}>
          <boxGeometry args={[w * 0.96, 0.03, d * 0.96]} />
          <meshStandardMaterial color="#6a717a" roughness={0.45} metalness={0.2} />
        </mesh>
      ) : null}

      <mesh position={[0, 0.08, d / 2 + 0.01]}>
        <boxGeometry args={[w * 0.72, 0.38, 0.02]} />
        <meshStandardMaterial color="#3d444c" roughness={0.4} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.18, d / 2 + 0.025]}>
        <boxGeometry args={[0.55, 0.08, 0.02]} />
        <meshStandardMaterial color="#5a8f6a" roughness={0.45} metalness={0.1} />
      </mesh>

      {Array.from({ length: CHANNEL_COUNT }, (_, i) => (
        <group
          key={i}
          position={[channelX(i), pose.channelLocalY, ATE_BODY.channelZ]}
          onClick={(event) => {
            event.stopPropagation()
            onSelect(i)
          }}
        >
          <mesh>
            <sphereGeometry args={[ATE_BODY.channelRadius, 16, 16]} />
            <meshStandardMaterial
              color={selectedChannel === i ? '#f0d56a' : '#c9a24a'}
              emissive={selectedChannel === i ? '#8a7018' : '#000000'}
              roughness={0.35}
              metalness={0.45}
            />
          </mesh>
          <mesh position={[0, channelsOnTop ? -0.03 : 0.03, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.02, 12]} />
            <meshStandardMaterial color="#2f343b" roughness={0.6} metalness={0.2} />
          </mesh>
        </group>
      ))}

      <SceneLabel
        position={[0, channelsOnTop ? -h / 2 - 0.22 : h / 2 + 0.22, 0]}
        title="ATE"
        subtitle={t(ui.scene.ateSub)}
      />
      <SceneLabel
        position={[
          0,
          pose.channelLocalY + (channelsOnTop ? 0.16 : -0.12),
          ATE_BODY.channelZ + 0.22,
        ]}
        title="CH1 … CH16"
        subtitle={t(ui.scene.chSub)}
      />
    </group>
  )
}

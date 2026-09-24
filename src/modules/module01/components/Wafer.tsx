import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'
import { useLocale } from '../../../i18n/LocaleContext'
import { ui } from '../../../i18n/ui'
import { CHANNEL_COUNT, WAFER, dieCells, layerY, needleXZ } from '../data/layout'
import { SceneLabel } from './SceneLabel'

type WaferProps = {
  progress: number
}

function createWaferGeometry(): ExtrudeGeometry {
  const radius = WAFER.radius
  const flatX = radius - WAFER.flatDepth
  const half = Math.sqrt(Math.max(0, radius * radius - flatX * flatX))
  const aTop = Math.atan2(half, flatX)
  let aBot = Math.atan2(-half, flatX)
  if (aBot <= aTop) aBot += Math.PI * 2

  const shape = new Shape()
  shape.moveTo(flatX, -half)
  shape.lineTo(flatX, half)
  const steps = 56
  for (let i = 1; i <= steps; i += 1) {
    const a = aTop + ((aBot - aTop) * i) / steps
    shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius)
  }

  return new ExtrudeGeometry(shape, {
    depth: WAFER.thickness,
    bevelEnabled: false,
    curveSegments: 8,
  })
}

export function Wafer({ progress }: WaferProps) {
  const { t } = useLocale()
  const y = layerY(WAFER, progress)
  const dies = useMemo(() => dieCells(), [])
  const geometry = useMemo(() => createWaferGeometry(), [WAFER.radius, WAFER.flatDepth, WAFER.thickness])
  const padY = WAFER.thickness / 2 + 0.008
  const flatWorldX = WAFER.radius - WAFER.flatDepth
  const flatHalf = Math.sqrt(Math.max(0, WAFER.radius ** 2 - flatWorldX ** 2))

  return (
    <group position={[0, y, 0]}>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -WAFER.thickness / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#c9c4b4" roughness={0.38} metalness={0.12} />
      </mesh>

      {dies.map((die) => (
        <mesh
          key={`${die.col}-${die.row}`}
          position={[die.x, padY, die.z]}
        >
          <boxGeometry args={[WAFER.dieSize, 0.012, WAFER.dieSize]} />
          <meshStandardMaterial
            color={die.isDut ? '#4a5a6a' : '#6e6a5e'}
            roughness={0.45}
            metalness={0.12}
          />
        </mesh>
      ))}

      {Array.from({ length: CHANNEL_COUNT }, (_, i) => {
        const [x, z] = needleXZ(i)
        return (
          <mesh key={`pad-${i}`} position={[x, padY + 0.01, z]}>
            <boxGeometry args={[0.032, 0.008, 0.032]} />
            <meshStandardMaterial color="#d4af37" roughness={0.35} metalness={0.45} />
          </mesh>
        )
      })}

      {/* 直线定位边描边，避免被看成整圆 */}
      <mesh position={[flatWorldX, 0.004, 0]}>
        <boxGeometry args={[0.03, 0.02, flatHalf * 2]} />
        <meshStandardMaterial color="#7a766c" roughness={0.55} metalness={0.08} />
      </mesh>

      <mesh position={[0, -WAFER.thickness / 2 - 0.06, 0]}>
        <cylinderGeometry args={[1.2, 1.32, 0.1, 32]} />
        <meshStandardMaterial color="#3a4048" roughness={0.55} metalness={0.2} />
      </mesh>

      <SceneLabel
        position={[0, -0.34, 0]}
        title="WAFER (DUT)"
        subtitle={t(ui.scene.waferSub)}
      />
      <SceneLabel
        position={[flatWorldX + 0.22, 0.16, 0]}
        title={t(ui.scene.flat)}
        subtitle={t(ui.scene.flatSub)}
      />
    </group>
  )
}

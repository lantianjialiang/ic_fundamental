import { CHANNEL_COUNT, NEEDLES, layerY, needleXZ } from '../data/layout'
import { SceneLabel } from './SceneLabel'

type ProbeNeedlesProps = {
  progress: number
}

export function ProbeNeedles({ progress }: ProbeNeedlesProps) {
  const y = layerY(NEEDLES, progress)
  const headH = 0.05
  const contactY = headH / 2 + NEEDLES.contactLength / 2

  return (
    <group position={[0, y, 0]}>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, headH, 28]} />
        <meshStandardMaterial color="#4a515a" roughness={0.5} metalness={0.22} />
      </mesh>

      {Array.from({ length: CHANNEL_COUNT }, (_, i) => {
        const [x, z] = needleXZ(i)
        return (
          <group key={i} position={[x, 0, z]}>
            {/* 上侧触点：顶到 Probe Card 底面焊盘 */}
            <mesh position={[0, contactY, 0]}>
              <cylinderGeometry
                args={[NEEDLES.contactRadius, NEEDLES.contactRadius * 0.75, NEEDLES.contactLength, 10]}
              />
              <meshStandardMaterial color="#e0c36a" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* 下侧探针：接触 wafer pad */}
            <mesh position={[0, -NEEDLES.length / 2 - headH / 2, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[NEEDLES.radius, NEEDLES.length, 8]} />
              <meshStandardMaterial color="#c5c8cc" roughness={0.25} metalness={0.7} />
            </mesh>
          </group>
        )
      })}

      <SceneLabel
        position={[0.72, 0.06, 0]}
        title="PROBE NEEDLES"
        subtitle="Top contacts → card · Tips → die pads"
      />
    </group>
  )
}

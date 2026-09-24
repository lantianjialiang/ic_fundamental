import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import { type TestFlow } from '../data/layout'
import { allSignalPaths, type Vec3 } from '../data/paths'

type ConnectionPathsProps = {
  flow: TestFlow
  progress: number
  selectedChannel: number | null
  onSelect: (channel: number) => void
}

const UP = new Vector3(0, 1, 0)

function segmentPose(a: Vec3, b: Vec3) {
  const start = new Vector3(a[0], a[1], a[2])
  const end = new Vector3(b[0], b[1], b[2])
  const dir = end.clone().sub(start)
  const len = dir.length()
  const mid = start.clone().add(end).multiplyScalar(0.5)
  const quat = new Quaternion().setFromUnitVectors(UP, dir.normalize())
  return { mid, len, quat }
}

export function ConnectionPaths({
  flow,
  progress,
  selectedChannel,
  onSelect,
}: ConnectionPathsProps) {
  const paths = useMemo(() => allSignalPaths(flow, progress), [flow, progress])
  const exploded = progress >= 0.35

  if (!exploded && selectedChannel === null) return null

  const visible = exploded ? paths : paths.filter((path) => path.channel === selectedChannel)

  return (
    <group>
      {visible.map((path) => {
        const active = selectedChannel === path.channel
        const dimmed = selectedChannel !== null && !active
        const color = active ? '#e8c45a' : dimmed ? '#3d4650' : '#7d8a96'
        const radius = active ? 0.02 : 0.01
        return (
          <group
            key={path.channel}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(path.channel)
            }}
          >
            {path.airHops.map((line, lineIndex) =>
              line.slice(0, -1).map((hop, i) => {
                const next = line[i + 1]
                if (!next) return null
                const { mid, len, quat } = segmentPose(hop, next)
                if (len < 0.015) return null
                return (
                  <mesh key={`${lineIndex}-${i}`} position={mid} quaternion={quat}>
                    <cylinderGeometry args={[radius, radius, len, 8]} />
                    <meshStandardMaterial
                      color={color}
                      roughness={0.35}
                      metalness={0.25}
                      transparent
                      opacity={dimmed ? 0.35 : 0.95}
                    />
                  </mesh>
                )
              }),
            )}
          </group>
        )
      })}
    </group>
  )
}

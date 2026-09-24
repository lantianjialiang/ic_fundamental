import { LAYER_COLOR, pcbLayerY, sameLayerRuns, viaSites, type PcbLayer, type PcbNode } from '../data/pcbRouting'

type PcbCopperProps = {
  nodes: PcbNode[]
  thickness: number
  selected: boolean
  dimmed: boolean
  onSelect: () => void
}

function Track({
  a,
  b,
  y,
  layer,
  selected,
  dimmed,
}: {
  a: PcbNode
  b: PcbNode
  y: number
  layer: PcbLayer
  selected: boolean
  dimmed: boolean
}) {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const len = Math.hypot(dx, dz)
  if (len < 1e-4) return null
  const width = selected ? 0.055 : layer === 'inner' ? 0.042 : 0.032
  const height = selected ? 0.022 : 0.016
  return (
    <mesh
      position={[(a.x + b.x) / 2, y, (a.z + b.z) / 2]}
      rotation={[0, Math.atan2(dx, dz), 0]}
    >
      <boxGeometry args={[width, height, len]} />
      <meshStandardMaterial
        color={selected ? '#f0d56a' : LAYER_COLOR[layer]}
        emissive={selected ? '#7a6010' : '#000000'}
        roughness={0.4}
        metalness={0.45}
        transparent={dimmed}
        opacity={dimmed ? 0.25 : 1}
      />
    </mesh>
  )
}

export function PcbCopper({ nodes, thickness, selected, dimmed, onSelect }: PcbCopperProps) {
  const vias = viaSites(nodes)
  const runs = sameLayerRuns(nodes)

  return (
    <group
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
    >
      {runs.map(([a, b], i) => (
        <Track
          key={`${a.layer}-${i}`}
          a={a}
          b={b}
          y={pcbLayerY(thickness, a.layer)}
          layer={a.layer}
          selected={selected}
          dimmed={dimmed}
        />
      ))}

      {vias.map((via) => (
        <group key={`via-${via.x}-${via.z}`}>
          <mesh position={[via.x, 0, via.z]}>
            <cylinderGeometry args={[0.016, 0.016, thickness + 0.028, 10]} />
            <meshStandardMaterial
              color={selected ? '#f0d56a' : '#b8bcc2'}
              emissive={selected ? '#6a5410' : '#000000'}
              roughness={0.35}
              metalness={0.55}
              transparent={dimmed}
              opacity={dimmed ? 0.3 : 1}
            />
          </mesh>
          <mesh position={[via.x, pcbLayerY(thickness, 'top'), via.z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 12]} />
            <meshStandardMaterial color={selected ? '#f0d56a' : LAYER_COLOR.top} roughness={0.35} metalness={0.5} />
          </mesh>
          <mesh position={[via.x, pcbLayerY(thickness, 'bottom'), via.z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 12]} />
            <meshStandardMaterial color={selected ? '#f0d56a' : LAYER_COLOR.bottom} roughness={0.35} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

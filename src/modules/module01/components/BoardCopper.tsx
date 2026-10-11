import { useMemo } from 'react'
import { pcbLayerY, type PcbNode } from '../data/layout'
import { COPPER_COLOR, GEO, MAT } from '../data/materials'
import { InstancedParts, type InstanceItem } from './Instanced'

type BoardCopperProps = {
  routes: PcbNode[][]
  boardY: number
  thickness: number
  selected: number | null
  onSelect: (channel: number) => void
}

/** 多层板内部的走线与过孔（16 路，全部实例化）；选中通道高亮，其余变暗 */
export function BoardCopper({ routes, boardY, thickness, selected, onSelect }: BoardCopperProps) {
  const { tracks, owners, vias, viaPads } = useMemo(() => {
    const tracks: InstanceItem[] = []
    const owners: number[] = []
    const vias: InstanceItem[] = []
    const viaPads: InstanceItem[] = []
    routes.forEach((nodes, ch) => {
      const active = selected === ch
      const dim = selected !== null && !active
      for (let i = 0; i < nodes.length - 1; i += 1) {
        const a = nodes[i]!
        const b = nodes[i + 1]!
        if (a.layer !== b.layer) continue
        const dx = b.x - a.x
        const dz = b.z - a.z
        const len = Math.hypot(dx, dz)
        if (len < 1e-4) continue
        const w = active ? 0.05 : a.layer === 'inner' ? 0.036 : 0.03
        tracks.push({
          p: [(a.x + b.x) / 2, boardY + pcbLayerY(thickness, a.layer), (a.z + b.z) / 2],
          r: [0, Math.atan2(dx, dz), 0],
          s: [w, active ? 0.014 : 0.008, len + w * 0.6],
          c: active ? COPPER_COLOR.selected : dim ? COPPER_COLOR.dim : COPPER_COLOR[a.layer],
        })
        owners.push(ch)
      }
      const seen = new Set<string>()
      for (const n of nodes) {
        if (!n.via) continue
        const key = `${n.x.toFixed(3)},${n.z.toFixed(3)}`
        if (seen.has(key)) continue
        seen.add(key)
        const c = active ? COPPER_COLOR.selected : dim ? COPPER_COLOR.dim : '#c0c4ca'
        vias.push({ p: [n.x, boardY, n.z], s: [0.016, thickness + 0.012, 0.016], c })
        viaPads.push({ p: [n.x, boardY + thickness / 2 + 0.003, n.z], s: [0.032, 0.006, 0.032], c })
        viaPads.push({ p: [n.x, boardY - thickness / 2 - 0.003, n.z], s: [0.032, 0.006, 0.032], c })
      }
    })
    return { tracks, owners, vias, viaPads }
  }, [routes, boardY, thickness, selected])

  return (
    <group>
      <InstancedParts
        geometry={GEO.box}
        material={MAT.trackWhite}
        items={tracks}
        onClick={(event) => {
          event.stopPropagation()
          const ch = event.instanceId === undefined ? undefined : owners[event.instanceId]
          if (ch !== undefined) onSelect(ch)
        }}
      />
      <InstancedParts geometry={GEO.cyl} material={MAT.trackWhite} items={vias} />
      <InstancedParts geometry={GEO.cyl} material={MAT.trackWhite} items={viaPads} />
    </group>
  )
}

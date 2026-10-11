import { useMemo } from 'react'
import { pcbLayerIndex, pcbStack, type BoardSpec, type PcbLayer, type PcbNode } from '../data/layout'
import { COPPER_COLOR, GEO, MAT } from '../data/materials'
import { InstancedParts, type InstanceItem } from './Instanced'
import { PcbSlot, PcbVias } from './PcbStack'

type BoardCopperProps = {
  routes: PcbNode[][]
  spec: BoardSpec
  boardY: number
  selected: number | null
  onSelect: (channel: number) => void
  /** 过孔盖油：孔壁不露出板面、不画表面焊盘（焊环已经画在绿油贴图上） */
  tented?: boolean
}

const ROUTE_LAYERS: PcbLayer[] = ['top', 'inner', 'bottom']

/**
 * 多层板内部的走线与过孔（16 路，全部实例化）；选中通道时其余变暗，选中的那一路由 PathHighlight 高亮。
 * 每层走线放在对应铜层的 PcbSlot 里、过孔放在 PcbVias 里，分层展开时跟着各层走。
 */
export function BoardCopper({ routes, spec, boardY, selected, onSelect, tented = false }: BoardCopperProps) {
  const thickness = spec.t
  const { layers, vias, topPads, bottomPads } = useMemo(() => {
    const st = pcbStack(spec)
    const layers = ROUTE_LAYERS.map((layer) => ({ layer, tracks: [] as InstanceItem[], owners: [] as number[] }))
    const vias: InstanceItem[] = []
    const topPads: InstanceItem[] = []
    const bottomPads: InstanceItem[] = []
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
        const w = a.layer === 'inner' ? 0.036 : 0.03
        const bucket = layers[ROUTE_LAYERS.indexOf(a.layer)]!
        bucket.tracks.push({
          p: [(a.x + b.x) / 2, boardY + st.copper[pcbLayerIndex(spec, a.layer)]!, (a.z + b.z) / 2],
          r: [0, Math.atan2(dx, dz), 0],
          s: [w, 0.006, len + w * 0.6],
          c: active ? COPPER_COLOR.selected : dim ? COPPER_COLOR.dim : COPPER_COLOR[a.layer],
        })
        bucket.owners.push(ch)
      }
      const seen = new Set<string>()
      for (const n of nodes) {
        if (!n.via) continue
        const key = `${n.x.toFixed(3)},${n.z.toFixed(3)}`
        if (seen.has(key)) continue
        seen.add(key)
        const c = active ? COPPER_COLOR.selected : dim ? COPPER_COLOR.dim : '#c0c4ca'
        vias.push({ p: [n.x, 0, n.z], s: [0.016, tented ? thickness - 0.002 : thickness + 0.012, 0.016], c })
        if (!tented) {
          topPads.push({ p: [n.x, boardY + thickness / 2 + 0.003, n.z], s: [0.032, 0.006, 0.032], c })
          bottomPads.push({ p: [n.x, boardY - thickness / 2 - 0.003, n.z], s: [0.032, 0.006, 0.032], c })
        }
      }
    })
    return { layers, vias, topPads, bottomPads }
  }, [routes, spec, boardY, thickness, selected, tented])

  const n = spec.layers.length
  return (
    <group>
      {layers.map(({ layer, tracks, owners }) => (
        <PcbSlot key={layer} spec={spec} slot={2 * pcbLayerIndex(spec, layer) + 1}>
          {tracks.length ? (
            <InstancedParts
              geometry={GEO.box}
              material={MAT.trackClip}
              items={tracks}
              onClick={(event) => {
                event.stopPropagation()
                const ch = event.instanceId === undefined ? undefined : owners[event.instanceId]
                if (ch !== undefined) onSelect(ch)
              }}
            />
          ) : null}
        </PcbSlot>
      ))}
      <PcbVias spec={spec} boardY={boardY}>
        <InstancedParts geometry={GEO.cyl} material={MAT.trackClip} items={vias} />
      </PcbVias>
      {topPads.length ? (
        <PcbSlot spec={spec} slot={0}>
          <InstancedParts geometry={GEO.cyl} material={MAT.trackClip} items={topPads} />
        </PcbSlot>
      ) : null}
      {bottomPads.length ? (
        <PcbSlot spec={spec} slot={2 * n}>
          <InstancedParts geometry={GEO.cyl} material={MAT.trackClip} items={bottomPads} />
        </PcbSlot>
      ) : null}
    </group>
  )
}

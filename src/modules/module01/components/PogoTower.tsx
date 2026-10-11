import { useMemo } from 'react'
import { useScene } from '../context/SceneContext'
import { TOWER_CP, TOWER_FT, towerBlocks, towerPinXZ } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { annulusGeometry, frameGeometry } from '../data/shapes'
import { InstancedParts, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'

/** Pogo Tower：FT 是方框里两排 pogo 块，CP 是一圈 pogo 块 */
export function PogoTower() {
  const { cfg } = useScene()
  const ft = cfg.flow === 'FT'
  const bottom = ft ? TOWER_FT.bottom : TOWER_CP.bottom
  const top = ft ? TOWER_FT.top : TOWER_CP.top
  const h = top - bottom
  const mid = (top + bottom) / 2

  const frame = useMemo(
    () =>
      ft
        ? [frameGeometry(TOWER_FT.frameW, TOWER_FT.frameD, TOWER_FT.frameW - TOWER_FT.bar * 2, TOWER_FT.frameD - TOWER_FT.bar * 2, h)]
        : [
            annulusGeometry(TOWER_CP.rIn - 0.04, TOWER_CP.rIn, h),
            annulusGeometry(TOWER_CP.rOut, TOWER_CP.rOut + 0.05, h),
          ],
    [ft, h],
  )

  const blocks = useMemo<InstanceItem[]>(
    () =>
      towerBlocks(cfg.flow).map((b) => ({
        p: [b.x, mid, b.z],
        r: [0, -b.angle, 0],
        s: ft ? [TOWER_FT.blockW, h - 0.03, TOWER_FT.blockD] : [0.44, h - 0.03, 0.26],
      })),
    [cfg.flow, ft, mid, h],
  )

  const pins = useMemo<InstanceItem[]>(
    () => towerPinXZ(cfg.flow).map(([x, z]) => ({ p: [x, mid, z], s: [0.011, h, 0.011] })),
    [cfg.flow, mid, h],
  )

  const beams = useMemo<InstanceItem[]>(
    () =>
      ft
        ? [
            { p: [0, mid, 0.76], s: [TOWER_FT.frameW - 0.2, 0.2, 0.06] },
            { p: [0, mid, -0.76], s: [TOWER_FT.frameW - 0.2, 0.2, 0.06] },
          ]
        : Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3 + Math.PI / 18
            const r = (TOWER_CP.rIn + TOWER_CP.rOut) / 2
            return { p: [Math.cos(a) * r, top - 0.03, Math.sin(a) * r], r: [0, -a, 0], s: [0.52, 0.05, 0.05] }
          }),
    [ft, mid, top],
  )

  return (
    <LayerGroup id="pogo">
      {frame.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, bottom, 0]} material={MAT.aluminumClip} castShadow receiveShadow />
      ))}
      <InstancedParts geometry={GEO.box} material={MAT.pogoBlock} items={blocks} castShadow />
      <InstancedParts geometry={GEO.box} material={MAT.aluminumClip} items={beams} />
      <InstancedParts geometry={GEO.cyl6} material={MAT.gold} items={pins} />
    </LayerGroup>
  )
}

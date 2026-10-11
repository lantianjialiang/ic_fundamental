import { useMemo } from 'react'
import { TOWER_CP, TOWER_FT, towerBlocks, towerPinXZ } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { annulusGeometry, frameGeometry } from '../data/shapes'
import { InstancedParts, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'

/*
 * FT 与 CP 的 Pogo Tower 形状完全不同，拆成两个组件，分别只挂在各自流程的场景分支里：
 * 切换流程时整棵子树卸载，不会出现「FT 里残留 CP 环形塔」的情况。
 */

const FT_H = TOWER_FT.top - TOWER_FT.bottom
const FT_MID = (TOWER_FT.top + TOWER_FT.bottom) / 2
const CP_H = TOWER_CP.top - TOWER_CP.bottom
const CP_MID = (TOWER_CP.top + TOWER_CP.bottom) / 2

/** FT：方框里两排 pogo 块（压在 Load Board 底面） */
export function PogoTowerFT() {
  const frame = useMemo(
    () => frameGeometry(TOWER_FT.frameW, TOWER_FT.frameD, TOWER_FT.frameW - TOWER_FT.bar * 2, TOWER_FT.frameD - TOWER_FT.bar * 2, FT_H),
    [],
  )
  const blocks = useMemo<InstanceItem[]>(
    () => towerBlocks('FT').map((b) => ({ p: [b.x, FT_MID, b.z], s: [TOWER_FT.blockW, FT_H - 0.03, TOWER_FT.blockD] })),
    [],
  )
  const pins = useMemo<InstanceItem[]>(() => towerPinXZ('FT').map(([x, z]) => ({ p: [x, FT_MID, z], s: [0.011, FT_H, 0.011] })), [])
  const beams = useMemo<InstanceItem[]>(
    () => [
      { p: [0, FT_MID, 0.76], s: [TOWER_FT.frameW - 0.2, 0.2, 0.06] },
      { p: [0, FT_MID, -0.76], s: [TOWER_FT.frameW - 0.2, 0.2, 0.06] },
    ],
    [],
  )

  return (
    <LayerGroup id="pogo">
      <mesh geometry={frame} position={[0, TOWER_FT.bottom, 0]} material={MAT.aluminumClip} castShadow receiveShadow />
      <InstancedParts geometry={GEO.box} material={MAT.pogoBlock} items={blocks} castShadow />
      <InstancedParts geometry={GEO.box} material={MAT.aluminumClip} items={beams} />
      <InstancedParts geometry={GEO.cyl6} material={MAT.gold} items={pins} />
    </LayerGroup>
  )
}

/** CP：一圈 pogo 块（压在探针卡边缘的焊盘环上） */
export function PogoTowerCP() {
  const rings = useMemo(
    () => [annulusGeometry(TOWER_CP.rIn - 0.04, TOWER_CP.rIn, CP_H), annulusGeometry(TOWER_CP.rOut, TOWER_CP.rOut + 0.05, CP_H)],
    [],
  )
  const blocks = useMemo<InstanceItem[]>(
    () => towerBlocks('CP').map((b) => ({ p: [b.x, CP_MID, b.z], r: [0, -b.angle, 0], s: [0.44, CP_H - 0.03, 0.26] })),
    [],
  )
  const pins = useMemo<InstanceItem[]>(() => towerPinXZ('CP').map(([x, z]) => ({ p: [x, CP_MID, z], s: [0.011, CP_H, 0.011] })), [])
  const beams = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3 + Math.PI / 18
        const r = (TOWER_CP.rIn + TOWER_CP.rOut) / 2
        return { p: [Math.cos(a) * r, TOWER_CP.top - 0.03, Math.sin(a) * r], r: [0, -a, 0], s: [0.52, 0.05, 0.05] }
      }),
    [],
  )

  return (
    <LayerGroup id="pogo">
      {rings.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, TOWER_CP.bottom, 0]} material={MAT.aluminumClip} castShadow receiveShadow />
      ))}
      <InstancedParts geometry={GEO.box} material={MAT.pogoBlock} items={blocks} castShadow />
      <InstancedParts geometry={GEO.box} material={MAT.aluminumClip} items={beams} />
      <InstancedParts geometry={GEO.cyl6} material={MAT.gold} items={pins} />
    </LayerGroup>
  )
}

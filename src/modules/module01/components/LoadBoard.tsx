import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'
import { useScene } from '../context/SceneContext'
import { CHANNEL_COUNT, LB, SOCKET, allContacts, ftRoute, qfpLeads, towerPinXZ, QFP } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { lbSilkTexture } from '../data/textures'
import { BoardCopper } from './BoardCopper'
import { InstancedParts, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'

const TOP = LB.y + LB.t / 2
const BOTTOM = LB.y - LB.t / 2

/** Load Board / DIB：FR4 阻焊绿 + 沉金焊盘 + 丝印 + 元件；内层走线由 BoardCopper 画 */
export function LoadBoard() {
  const { cfg } = useScene()
  const silk = useMemo(
    () => new MeshStandardMaterial({ map: lbSilkTexture(), transparent: true, roughness: 0.6, depthWrite: false }),
    [],
  )

  const routes = useMemo(() => Array.from({ length: CHANNEL_COUNT }, (_, ch) => ftRoute(cfg.pkg, ch)), [cfg.pkg])

  const topPads = useMemo<InstanceItem[]>(() => {
    if (cfg.pkg === 'BGA') return allContacts('BGA').map(([x, z]) => ({ p: [x, TOP + 0.003, z], s: [0.034, 0.006, 0.034] }))
    return qfpLeads().map((l) => ({
      p: [l.x + l.nx * QFP.footReach, TOP + 0.003, l.z + l.nz * QFP.footReach],
      r: [0, l.rotY, 0],
      s: [0.12, 0.006, 0.036],
    }))
  }, [cfg.pkg])

  const bottomPads = useMemo<InstanceItem[]>(
    () => towerPinXZ('FT').map(([x, z]) => ({ p: [x, BOTTOM - 0.003, z], s: [0.024, 0.006, 0.024] })),
    [],
  )

  const { caps, terms } = useMemo(() => {
    const caps: InstanceItem[] = []
    const terms: InstanceItem[] = []
    const off = SOCKET.outer / 2 + 0.2
    for (let side = 0; side < 4; side += 1) {
      for (let k = 0; k < 9; k += 1) {
        const t = (k - 4) * 0.2
        const horiz = side % 2 === 0
        const x = horiz ? t : side === 1 ? off : -off
        const z = horiz ? (side === 0 ? off : -off) : t
        caps.push({ p: [x, TOP + 0.024, z], r: [0, horiz ? 0 : Math.PI / 2, 0], s: [0.09, 0.045, 0.05] })
        const dx = horiz ? 0.04 : 0
        const dz = horiz ? 0 : 0.04
        terms.push({ p: [x - dx, TOP + 0.024, z - dz], s: [horiz ? 0.018 : 0.052, 0.047, horiz ? 0.052 : 0.018] })
        terms.push({ p: [x + dx, TOP + 0.024, z + dz], s: [horiz ? 0.018 : 0.052, 0.047, horiz ? 0.052 : 0.018] })
      }
    }
    return { caps, terms }
  }, [])

  const relays = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        p: [(i < 3 ? -1 : 1) * 1.6, TOP + 0.08, ((i % 3) - 1) * 0.42],
        s: [0.3, 0.16, 0.2],
      })),
    [],
  )

  const connectors = useMemo<InstanceItem[]>(
    () => [
      { p: [-2.12, TOP + 0.07, -0.1], s: [0.16, 0.14, 1.3] },
      { p: [2.12, TOP + 0.07, -0.1], s: [0.16, 0.14, 1.3] },
    ],
    [],
  )
  const connectorPins = useMemo<InstanceItem[]>(() => {
    const out: InstanceItem[] = []
    for (const x of [-2.12, 2.12]) {
      for (let k = 0; k < 12; k += 1) out.push({ p: [x, TOP + 0.145, -0.65 + k * 0.1], s: [0.06, 0.012, 0.03] })
    }
    return out
  }, [])
  const sma = useMemo<InstanceItem[]>(
    () => [-1.2, -0.4, 0.4, 1.2].map((x) => ({ p: [x, TOP + 0.06, LB.d / 2 - 0.02], r: [Math.PI / 2, 0, 0], s: [0.06, 0.16, 0.06] })),
    [],
  )
  const screws = useMemo<InstanceItem[]>(
    () =>
      [
        [-2.03, 1.53],
        [2.03, 1.53],
        [-2.03, -1.53],
        [2.03, -1.53],
      ].map(([x, z]) => ({ p: [x!, TOP + 0.015, z!], s: [0.05, 0.03, 0.05] })),
    [],
  )

  return (
    <LayerGroup id="loadboard">
      <RoundedBox
        args={[LB.w, LB.t, LB.d]}
        radius={0.02}
        smoothness={2}
        position={[0, LB.y, 0]}
        material={MAT.fr4Lb}
        castShadow
        receiveShadow
      />
      <mesh position={[0, TOP + 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={silk}>
        <planeGeometry args={[LB.w, LB.d]} />
      </mesh>
      <InstancedParts geometry={cfg.pkg === 'BGA' ? GEO.cyl : GEO.box} material={MAT.gold} items={topPads} />
      <InstancedParts geometry={GEO.cyl} material={MAT.gold} items={bottomPads} />
      <InstancedParts geometry={GEO.box} material={MAT.mlcc} items={caps} />
      <InstancedParts geometry={GEO.box} material={MAT.solder} items={terms} />
      <InstancedParts geometry={GEO.box} material={MAT.mold} items={relays} castShadow />
      <InstancedParts geometry={GEO.box} material={MAT.mold} items={connectors} castShadow />
      <InstancedParts geometry={GEO.box} material={MAT.gold} items={connectorPins} />
      <InstancedParts geometry={GEO.cyl6} material={MAT.gold} items={sma} castShadow />
      <InstancedParts geometry={GEO.cyl} material={MAT.steel} items={screws} />
      <BoardCopper routes={routes} boardY={LB.y} thickness={LB.t} selected={cfg.selected} onSelect={cfg.onSelect} />
    </LayerGroup>
  )
}

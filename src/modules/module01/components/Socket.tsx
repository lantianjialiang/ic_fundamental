import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { useScene } from '../context/SceneContext'
import { PIN_FREE_TOP, SOCKET, allContacts } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { socketHousingGeometry } from '../data/shapes'
import { InstancedParts, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'

const BARREL_TOP = SOCKET.baseTop - 0.015
const CROWN_H = 0.012

/** Socket：带定位槽的阳极氧化壳体 + Torlon 针板 + 弹簧针阵列（实例化，柱塞随压缩下移） */
export function Socket() {
  const { store, cfg } = useScene()
  const plungers = useRef<Group>(null)
  const housing = useMemo(
    () => socketHousingGeometry(SOCKET.outer, SOCKET.pocket, SOCKET.top - SOCKET.bottom - 0.024),
    [],
  )

  const contacts = useMemo(() => allContacts(cfg.pkg), [cfg.pkg])
  const barrels = useMemo<InstanceItem[]>(() => {
    const h = BARREL_TOP - SOCKET.bottom - 0.002
    return contacts.map(([x, z]) => ({ p: [x, SOCKET.bottom + 0.002 + h / 2, z], s: [0.02, h, 0.02] }))
  }, [contacts])
  const rods = useMemo<InstanceItem[]>(() => {
    const h = PIN_FREE_TOP - CROWN_H - BARREL_TOP + 0.01
    return contacts.map(([x, z]) => ({ p: [x, BARREL_TOP - 0.01 + h / 2, z], s: [0.011, h, 0.011] }))
  }, [contacts])
  const crowns = useMemo<InstanceItem[]>(
    () => contacts.map(([x, z]) => ({ p: [x, PIN_FREE_TOP - CROWN_H / 2, z], s: [0.015, CROWN_H, 0.015] })),
    [contacts],
  )
  const screws = useMemo<InstanceItem[]>(() => {
    const r = (SOCKET.outer / 2 + SOCKET.pocket / 2) / 2
    return [
      [-r, -r],
      [r, -r],
      [r, r],
      [-r, r],
    ].map(([x, z]) => ({ p: [x!, SOCKET.top - 0.004, z!], s: [0.045, 0.02, 0.045] }))
  }, [])

  useFrame(() => {
    if (plungers.current) plungers.current.position.y = -store.pose.pinComp
  })

  return (
    <LayerGroup id="socket">
      <mesh geometry={housing} position={[0, SOCKET.bottom, 0]} material={MAT.anodized} castShadow receiveShadow />
      <mesh position={[0, (SOCKET.bottom + SOCKET.baseTop) / 2, 0]} material={MAT.torlon} receiveShadow>
        <boxGeometry args={[SOCKET.pocket - 0.04, SOCKET.baseTop - SOCKET.bottom, SOCKET.pocket - 0.04]} />
      </mesh>
      <InstancedParts geometry={GEO.cyl} material={MAT.steel} items={screws} />
      <InstancedParts geometry={GEO.cyl} material={MAT.gold} items={barrels} />
      <group ref={plungers}>
        <InstancedParts geometry={GEO.cyl} material={MAT.steel} items={rods} />
        <InstancedParts geometry={GEO.cone} material={MAT.gold} items={crowns} />
      </group>
    </LayerGroup>
  )
}

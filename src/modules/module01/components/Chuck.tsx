import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BufferGeometry, TorusGeometry, type Group } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { useScene } from '../context/SceneContext'
import { CHUCK, FLOOR_Y } from '../data/layout'
import { MAT } from '../data/materials'
import { LayerGroup } from './LayerGroup'

function grooveGeometry(): BufferGeometry {
  const rings = [0.35, 0.7, 1.05, 1.4, 1.72].map((r) => {
    const g = new TorusGeometry(r, 0.012, 6, 96)
    g.rotateX(Math.PI / 2)
    return g
  })
  const merged = mergeGeometries(rings) ?? rings[0]!
  merged.translate(0, CHUCK.top + 0.002, 0)
  return merged
}

/** Prober chuck：镀镍真空吸盘 + 同心真空槽 + 伸缩立柱（随 chuck 升降） */
export function Chuck() {
  const groove = useMemo(() => grooveGeometry(), [])
  const columnH = 1.3
  return (
    <LayerGroup id="chuck">
      <mesh position={[0, CHUCK.top - CHUCK.h / 2, 0]} material={MAT.nickel} castShadow receiveShadow>
        <cylinderGeometry args={[CHUCK.r, CHUCK.r, CHUCK.h, 96]} />
      </mesh>
      <mesh geometry={groove} material={MAT.groove} />
      <mesh position={[0, CHUCK.top - CHUCK.h - columnH / 2, 0]} material={MAT.steel} castShadow>
        <cylinderGeometry args={[0.45, 0.45, columnH, 32]} />
      </mesh>
    </LayerGroup>
  )
}

/** 探针台底座（静止）+ XY 台（只跟随 chuck 的水平移动） */
export function ProberBase() {
  const { store } = useScene()
  const stage = useRef<Group>(null)
  useFrame(() => {
    if (stage.current) stage.current.position.x = store.pose.x.chuck
  })
  return (
    <group>
      <RoundedBox
        args={[4.8, 0.9, 4.6]}
        radius={0.05}
        smoothness={3}
        position={[0, FLOOR_Y + 0.45, 0]}
        material={MAT.paint}
        castShadow
        receiveShadow
      />
      <mesh position={[2.405, FLOOR_Y + 0.62, 0]} material={MAT.accent}>
        <boxGeometry args={[0.01, 0.08, 4.2]} />
      </mesh>
      <group ref={stage}>
        <RoundedBox
          args={[3.4, 0.14, 3.4]}
          radius={0.03}
          smoothness={2}
          position={[0, FLOOR_Y + 0.97, 0]}
          material={MAT.aluminum}
          castShadow
          receiveShadow
        />
        <mesh position={[0, FLOOR_Y + 1.04 + 0.2, 0]} material={MAT.paint} castShadow>
          <cylinderGeometry args={[0.58, 0.62, 0.4, 32]} />
        </mesh>
      </group>
    </group>
  )
}

import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Mesh } from 'three'
import { useLocale } from '../../../i18n/LocaleContext'
import { useScene } from '../context/SceneContext'
import { FLOOR_Y, TH, TH_DOCK_Y, type Vec3 } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { T } from '../data/text'
import { InstancedParts, type InstanceItem } from './Instanced'
import { SceneLabel } from './SceneLabel'

const POS: Vec3 = [-5.4, FLOOR_Y, -4.2]
const SIZE = { w: 1.5, h: 3.0, d: 1.3 }

/** 远处的主机柜（Mainframe）+ 连到测试头的粗电缆（简化示意） */
export function Mainframe() {
  const { store, cfg } = useScene()
  const { t } = useLocale()
  const cable = useRef<Mesh>(null)
  const last = useRef(Number.NaN)

  const leds = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        p: [POS[0] + 0.25, POS[1] + 2.5 - i * 0.32, POS[2] + SIZE.d / 2 + 0.006],
        s: [0.7, 0.03, 0.01],
      })),
    [],
  )

  useEffect(() => {
    last.current = Number.NaN
  }, [cfg.flow])

  useEffect(() => {
    const mesh = cable.current
    return () => mesh?.geometry.dispose()
  }, [])

  useFrame(() => {
    const mesh = cable.current
    if (!mesh) return
    const disp = store.pose.y.testhead
    if (Math.abs(disp - last.current) < 0.005) return
    last.current = disp
    const dock = TH_DOCK_Y[cfg.flow] + disp
    const portY = cfg.flow === 'FT' ? dock - 0.8 : dock + 0.8
    const curve = new CatmullRomCurve3([
      new Vector3(POS[0] + SIZE.w / 2, POS[1] + 0.6, POS[2] + 0.2),
      new Vector3(-3.6, FLOOR_Y + 0.12, -3.7),
      new Vector3(-1.4, FLOOR_Y + 0.15, -3.5),
      new Vector3(-0.6, portY - 0.25, -TH.d / 2 - 0.7),
      new Vector3(-0.6, portY, -TH.d / 2 + 0.02),
    ])
    mesh.geometry.dispose()
    mesh.geometry = new TubeGeometry(curve, 64, 0.08, 10, false)
  })

  return (
    <group>
      <RoundedBox
        args={[SIZE.w, SIZE.h, SIZE.d]}
        radius={0.05}
        smoothness={3}
        position={[POS[0], POS[1] + SIZE.h / 2, POS[2]]}
        material={MAT.paint}
        castShadow
        receiveShadow
      />
      <InstancedParts geometry={GEO.box} material={MAT.led} items={leds} />
      <mesh ref={cable} material={MAT.cable} castShadow />
      {cfg.showLabels ? (
        <SceneLabel
          position={[POS[0] + SIZE.w / 2 + 0.2, POS[1] + SIZE.h - 0.3, POS[2] + SIZE.d / 2]}
          title={t(T.mainframe)}
          subtitle={t(T.mainframeSub)}
        />
      ) : null}
    </group>
  )
}

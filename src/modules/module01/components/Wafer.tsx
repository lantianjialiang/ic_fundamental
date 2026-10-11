import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { ExtrudeGeometry, MeshBasicMaterial, MeshStandardMaterial, Shape, type InstancedMesh } from 'three'
import { useLocale } from '../../../i18n/LocaleContext'
import { useScene } from '../context/SceneContext'
import { registerDim } from '../data/dim'
import { DIE, DIE_PADS, PAD_TOP, WAFER, dieCells, padIndexFor } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { frameGeometry } from '../data/shapes'
import { T } from '../data/text'
import { dieTexture } from '../data/textures'
import { InstancedParts, writeInstance, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'
import { SceneLabel } from './SceneLabel'

/** 带 notch 的晶圆外形（notch 朝 +Z，即朝向镜头） */
function waferGeometry(): ExtrudeGeometry {
  const r = WAFER.r
  const half = 0.045
  const a0 = Math.asin(half / r)
  const s = new Shape()
  // Shape 的 -Y 在 rotateX(-90°) 后对应世界 +Z
  const start = -Math.PI / 2 + a0
  const end = -Math.PI / 2 - a0 + Math.PI * 2
  s.moveTo(Math.cos(start) * r, Math.sin(start) * r)
  s.absarc(0, 0, r, start, end, false)
  s.lineTo(0, -r + WAFER.notch)
  s.closePath()
  const g = new ExtrudeGeometry(s, {
    depth: WAFER.t - 0.012,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 96,
  })
  g.rotateX(-Math.PI / 2)
  g.translate(0, -WAFER.t + 0.006, 0)
  return g
}

const dieMat = registerDim(new MeshStandardMaterial({ map: dieTexture(), metalness: 0.35, roughness: 0.32 }))
const outlineMat = registerDim(new MeshBasicMaterial({ color: '#ffcf4a', toneMapped: false }))

/** 晶圆：数百颗 die（实例化）+ 被测 die 高亮 + pad + 扎针后的 scrub 痕 */
export function Wafer() {
  const { store, cfg } = useScene()
  const { t } = useLocale()
  const scrubRef = useRef<InstancedMesh>(null)
  const lastScrub = useRef(-1)
  const geos = useMemo(() => ({ wafer: waferGeometry(), outline: frameGeometry(0.2, 0.2, 0.168, 0.168, 0.002) }), [])

  const dies = useMemo<InstanceItem[]>(
    () =>
      dieCells().map((d) => ({
        p: [d.x, DIE.h / 2, d.z],
        s: [DIE.size, DIE.h, DIE.size],
        c: d.isDut ? '#ffe2a0' : '#ffffff',
      })),
    [],
  )
  const pads = useMemo<InstanceItem[]>(
    () =>
      DIE_PADS.map((p, i) => ({
        p: [p.x, DIE.h + 0.0015, p.z],
        s: [0.022, 0.003, 0.022],
        c: cfg.selected !== null && padIndexFor(cfg.selected) === i ? '#ffd84a' : '#d7dbe0',
      })),
    [cfg.selected],
  )

  useFrame(() => {
    const mesh = scrubRef.current
    if (!mesh) return
    const len = store.scrubMax * (cfg.probe === 'cantilever' ? 0.8 : 0.2)
    if (Math.abs(len - lastScrub.current) < 1e-5) return
    lastScrub.current = len
    DIE_PADS.forEach((p, i) => {
      const l = Math.max(0.0001, len)
      writeInstance(mesh, i, {
        p: [p.x + p.nx * l * 0.5 - p.nx * 0.002, PAD_TOP + 0.0004, p.z + p.nz * l * 0.5 - p.nz * 0.002],
        s: [p.nx !== 0 ? l + 0.004 : 0.007, 0.0008, p.nz !== 0 ? l + 0.004 : 0.007],
      })
    })
    mesh.visible = len > 0.0005
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <LayerGroup id="wafer">
      <mesh geometry={geos.wafer} material={MAT.silicon} receiveShadow castShadow />
      <InstancedParts geometry={GEO.box} material={dieMat} items={dies} receiveShadow />
      <mesh geometry={geos.outline} position={[0, DIE.h, 0]} material={outlineMat} />
      <InstancedParts geometry={GEO.box} material={MAT.trackWhite} items={pads} />
      <instancedMesh ref={scrubRef} args={[GEO.box, MAT.scrub, DIE_PADS.length]} frustumCulled={false} />
      {cfg.showLabels ? (
        <>
          <SceneLabel position={[0, 0.02, WAFER.r + 0.1]} title={t(T.notch)} />
          <SceneLabel position={[-0.1, 0.04, 0.1]} title={t(T.dutDie)} side="left" />
        </>
      ) : null}
    </LayerGroup>
  )
}

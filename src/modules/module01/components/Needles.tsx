import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { InstancedMesh } from 'three'
import { useScene } from '../context/SceneContext'
import { CHANNEL_COUNT, needleShape, padFor } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { writeSegment } from './Instanced'

/** 探针（16 根）：悬臂针 = 斜梁 + 弯折针尖；垂直针 = 导板间微弯的直针。被顶起时实时重算形状 */
export function Needles() {
  const { store, cfg } = useScene()
  const ref = useRef<InstancedMesh>(null)
  const last = useRef(Number.NaN)
  const segs = cfg.probe === 'cantilever' ? 3 : 4
  const count = CHANNEL_COUNT * segs

  useEffect(() => {
    last.current = Number.NaN
  }, [cfg.probe])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const defl = store.pose.needleDefl
    if (Math.abs(defl - last.current) < 1e-5) return
    last.current = defl
    let k = 0
    for (let ch = 0; ch < CHANNEL_COUNT; ch += 1) {
      const { pts } = needleShape(cfg.probe, padFor(ch), 0, defl)
      for (let i = 0; i < pts.length - 1; i += 1) {
        const isTip = i === pts.length - 2
        const r = cfg.probe === 'cantilever' ? (isTip ? 0.0035 : 0.0055) : isTip ? 0.0035 : 0.0045
        writeSegment(mesh, k, pts[i]!, pts[i + 1]!, r)
        k += 1
      }
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh key={cfg.probe} ref={ref} args={[GEO.cyl, MAT.tungsten, count]} frustumCulled={false} />
}

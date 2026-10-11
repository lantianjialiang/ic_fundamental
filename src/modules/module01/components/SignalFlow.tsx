import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  CurvePath,
  LineBasicMaterial,
  LineCurve3,
  MeshBasicMaterial,
  TubeGeometry,
  Vector3,
  type InstancedMesh,
  type LineSegments,
  type Mesh,
} from 'three'
import { activeChannel, useScene } from '../context/SceneContext'
import { CHANNEL_COUNT, buildHops, hopPolyline, type Vec3 } from '../data/layout'
import { GEO } from '../data/materials'
import type { SceneTheme } from '../hooks/useSceneTheme'
import { writeInstance } from './Instanced'

const TRAIL = 7
const PERIOD = 3.2
const MAX_SEGS = CHANNEL_COUNT * 40

type SignalFlowProps = { theme: SceneTheme }

function cumulative(pts: Vec3[]): number[] {
  const out = [0]
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1]!
    const b = pts[i]!
    out.push(out[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))
  }
  return out
}

function sample(pts: Vec3[], cum: number[], s: number): Vec3 {
  const total = cum[cum.length - 1] ?? 0
  const d = Math.min(total, Math.max(0, s))
  let i = 1
  while (i < cum.length - 1 && cum[i]! < d) i += 1
  const a = pts[i - 1] ?? pts[0]!
  const b = pts[i] ?? a
  const seg = cum[i]! - cum[i - 1]!
  const t = seg > 1e-6 ? (d - cum[i - 1]!) / seg : 0
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/**
 * 信号路径：选中通道（或接触动画「信号」阶段的默认 CH1）画一条发光管线，
 * 一串发光小球沿路径从 Test Head 流向 DUT，再流回（去程金色、回程蓝色）。
 * 分解且未选通道时，用细线画出全部 16 路的走向。
 */
export function SignalFlow({ theme }: SignalFlowProps) {
  const { store, cfg } = useScene()
  const tube = useRef<Mesh>(null)
  const pulses = useRef<InstancedMesh>(null)
  const halo = useRef<Mesh>(null)
  const lines = useRef<LineSegments>(null)
  const lastSig = useRef('')

  const light = theme.mode === 'light'
  const colors = useMemo(
    () => (light ? { out: '#d18a00', back: '#0b7fd1', tube: '#9a6700' } : { out: '#ffc93c', back: '#3cc8ff', tube: '#e8c45a' }),
    [light],
  )
  const mats = useMemo(
    () => ({
      // 不透明：和 PathHighlight 一起画在不透明队列里，淡化的部件不会和它抢排序
      tube: new MeshBasicMaterial({ color: colors.tube, toneMapped: false }),
      pulse: new MeshBasicMaterial({ color: colors.out, toneMapped: false }),
      halo: new MeshBasicMaterial({ color: colors.out, transparent: true, opacity: 0.28, toneMapped: false, depthWrite: false }),
      lines: new LineBasicMaterial({ color: theme.muted, transparent: true, opacity: 0.75 }),
    }),
    [colors, theme.muted],
  )
  const lineGeo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(MAX_SEGS * 6), 3))
    g.setDrawRange(0, 0)
    return g
  }, [])

  useEffect(() => () => lineGeo.dispose(), [lineGeo])
  useEffect(() => {
    lastSig.current = ''
  }, [cfg.flow, cfg.pkg, cfg.probe, cfg.selected])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const pose = store.pose
    const ch = activeChannel(store, cfg)

    const tubeMesh = tube.current
    const pulseMesh = pulses.current
    const haloMesh = halo.current
    if (tubeMesh && pulseMesh && haloMesh) {
      if (ch === null) {
        tubeMesh.visible = false
        pulseMesh.visible = false
        haloMesh.visible = false
      } else {
        const pts = hopPolyline(buildHops(cfg.flow, cfg.pkg, cfg.probe, ch, pose))
        const sig = pts.map((p) => `${p[0].toFixed(3)},${p[1].toFixed(3)},${p[2].toFixed(3)}`).join('|')
        if (sig !== lastSig.current) {
          lastSig.current = sig
          const path = new CurvePath<Vector3>()
          for (let i = 1; i < pts.length; i += 1) {
            const a = pts[i - 1]!
            const b = pts[i]!
            path.add(new LineCurve3(new Vector3(...a), new Vector3(...b)))
          }
          tubeMesh.geometry.dispose()
          tubeMesh.geometry = new TubeGeometry(path, Math.max(48, pts.length * 14), 0.014, 8, false)
        }
        tubeMesh.visible = true

        const animate = !cfg.reduced
        pulseMesh.visible = animate
        haloMesh.visible = animate
        if (animate) {
          store.pulseT += dt
          const cum = cumulative(pts)
          const total = cum[cum.length - 1] ?? 0
          const ph = (store.pulseT % PERIOD) / PERIOD
          const outbound = ph < 0.5
          const u = outbound ? ph * 2 : (1 - ph) * 2
          const head = u * total
          const dir = outbound ? -1 : 1
          for (let i = 0; i < TRAIL; i += 1) {
            const p = sample(pts, cum, head + dir * i * 0.045)
            writeInstance(pulseMesh, i, { p, s: 0.036 * (1 - i / (TRAIL + 1)) })
          }
          pulseMesh.instanceMatrix.needsUpdate = true
          const hp = sample(pts, cum, head)
          haloMesh.position.set(hp[0], hp[1], hp[2])
          const c = outbound ? colors.out : colors.back
          mats.pulse.color.set(c)
          mats.halo.color.set(c)
        }
      }
    }

    const lineMesh = lines.current
    if (lineMesh) {
      const showAll = store.explode > 0.3 && ch === null
      lineMesh.visible = showAll
      if (showAll) {
        const arr = lineGeo.getAttribute('position') as BufferAttribute
        let n = 0
        for (let c = 0; c < CHANNEL_COUNT; c += 1) {
          const pts = hopPolyline(buildHops(cfg.flow, cfg.pkg, cfg.probe, c, pose))
          for (let i = 1; i < pts.length && n < MAX_SEGS; i += 1) {
            const a = pts[i - 1]!
            const b = pts[i]!
            arr.setXYZ(n * 2, a[0], a[1], a[2])
            arr.setXYZ(n * 2 + 1, b[0], b[1], b[2])
            n += 1
          }
        }
        arr.needsUpdate = true
        lineGeo.setDrawRange(0, n * 2)
        lineGeo.computeBoundingSphere()
      }
    }
  })

  return (
    <group>
      <mesh ref={tube} material={mats.tube} visible={false} renderOrder={2} />
      <instancedMesh ref={pulses} args={[GEO.sphere, mats.pulse, TRAIL]} frustumCulled={false} visible={false} renderOrder={3} />
      <mesh ref={halo} material={mats.halo} visible={false} renderOrder={4}>
        <sphereGeometry args={[0.075, 16, 12]} />
      </mesh>
      <lineSegments ref={lines} geometry={lineGeo} material={mats.lines} visible={false} />
    </group>
  )
}

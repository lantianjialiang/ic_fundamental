import { Html, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { createContext, useContext, useEffect, useMemo, useRef, type RefObject } from 'react'
import { ExtrudeGeometry, Path, Shape } from 'three'
import { dielectricKinds, KIND_COLOR, VIA_COLOR, VIA_X, type LayerKind, type ViaId } from './data/pcbStackModel'

// 所有尺寸是示意单位；x 向板宽、z 向板深、y 向上
const W = 3.2
const D = 2.0
const CU_T = 0.03
const PAD_R = 0.11
const ANTI_R = 0.2
const BARREL_R = 0.045

export type SceneLayer = { kind: LayerKind; label: string }
/** from / to 从 1 起算，含两端 */
export type SceneVia = { id: ViaId; from: number; to: number; label: string }

type Props = {
  layers: SceneLayer[]
  vias: SceneVia[]
  /** 0 = 叠紧，1 = 最大展开 */
  explode: number
  ariaLabel: string
  fallback: string
}

let glChecked: boolean | null = null
function hasWebGL() {
  if (glChecked === null) {
    try {
      const probe = document.createElement('canvas')
      glChecked = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
    } catch {
      glChecked = false
    }
  }
  return glChecked
}

/** 标签挂到页面自己管理的容器里，卸载时不依赖 R3F 内部的画布容器（否则切走课程会抛 removeChild 错误） */
const TagPortal = createContext<RefObject<HTMLDivElement | null> | null>(null)

function Tag({ position, text, side, color }: { position: [number, number, number]; text: string; side: 'left' | 'right' | 'top'; color?: string }) {
  const portal = useContext(TagPortal)
  return (
    <Html position={position} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }} portal={(portal ?? undefined) as RefObject<HTMLElement> | undefined}>
      <div className={`pcbStack-tag pcbStack-tag--${side}`} style={color ? { borderColor: color } : undefined}>
        {text}
      </div>
    </Html>
  )
}

function PlaneSlab({ y, color, holes }: { y: number; color: string; holes: number[] }) {
  const key = holes.join(',')
  const geo = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-W / 2, -D / 2)
    shape.lineTo(W / 2, -D / 2)
    shape.lineTo(W / 2, D / 2)
    shape.lineTo(-W / 2, D / 2)
    shape.closePath()
    const xs = key === '' ? [] : key.split(',').map(Number)
    for (const x of xs) {
      const hole = new Path()
      hole.absarc(x, 0, ANTI_R, 0, Math.PI * 2, true)
      shape.holes.push(hole)
    }
    return new ExtrudeGeometry(shape, { depth: CU_T, bevelEnabled: false, curveSegments: 28 })
  }, [key])
  useEffect(() => {
    return () => geo.dispose()
  }, [geo])
  // 形状在局部 xy 平面，绕 x 转 -90° 后躺平：局部 z 变成向上
  return (
    <mesh geometry={geo} position={[0, y - CU_T / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color={color} transparent opacity={0.62} depthWrite={false} roughness={0.6} />
    </mesh>
  )
}

function SignalSlab({ y, color, seed }: { y: number; color: string; seed: number }) {
  const z1 = seed % 2 === 0 ? -0.62 : -0.45
  const z2 = seed % 2 === 0 ? 0.58 : 0.72
  return (
    <group position={[0, y, 0]}>
      <mesh>
        <boxGeometry args={[W, CU_T * 0.5, D]} />
        <meshStandardMaterial color={color} transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, z1]}>
        <boxGeometry args={[W - 0.4, CU_T, 0.07]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, z2]}>
        <boxGeometry args={[W - 0.8, CU_T, 0.07]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

function ViaMesh({ via, yOf, kinds }: { via: SceneVia; yOf: (layer: number) => number; kinds: LayerKind[] }) {
  const x = VIA_X[via.id]
  const color = VIA_COLOR[via.id]
  const yTop = yOf(via.from)
  const yBot = yOf(via.to)
  const pads: number[] = []
  for (let layer = via.from; layer <= via.to; layer += 1) {
    // 两端落在这一层；中间只有信号层上有焊盘，平面层是反焊盘（在平面里挖洞）
    if (layer === via.from || layer === via.to || kinds[layer - 1] === 'sig') {
      pads.push(layer)
    }
  }
  const micro = via.id === 'micro'
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, (yTop + yBot) / 2, 0]}>
        <cylinderGeometry args={[micro ? 0.05 : BARREL_R, micro ? 0.026 : BARREL_R, yTop - yBot, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} />
      </mesh>
      {pads.map((layer) => (
        <mesh key={layer} position={[0, yOf(layer), 0]}>
          <cylinderGeometry args={[micro ? PAD_R * 0.8 : PAD_R, micro ? PAD_R * 0.8 : PAD_R, CU_T * 1.4, 28]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function StackScene({ layers, vias, explode, ariaLabel, fallback }: Props) {
  const count = layers.length
  const gap = 0.22 + explode * 0.5
  const dielT = Math.min(0.14, gap - 0.05)
  const yOf = (layer: number) => ((count - 1) / 2 - (layer - 1)) * gap
  const dielectrics = dielectricKinds(count)
  const kinds = layers.map((l) => l.kind)

  const portalRef = useRef<HTMLDivElement>(null)

  if (!hasWebGL()) {
    return <div className="pcbStack-nogl">{fallback}</div>
  }
  return (
    <div className="pcbStack-3d" role="group" aria-label={ariaLabel}>
      <TagPortal.Provider value={portalRef}>
      <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [3.4, 2.5, 4.7], fov: 38, near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 6, 4]} intensity={1.5} />
        <directionalLight position={[-4, -2, -3]} intensity={0.4} />
        {dielectrics.map((kind, i) => (
          <mesh key={`d${count}-${i}`} position={[0, (yOf(i + 1) + yOf(i + 2)) / 2, 0]}>
            <boxGeometry args={[W, dielT, D]} />
            <meshStandardMaterial color={kind === 'core' ? '#9fb36a' : '#d1bd72'} transparent opacity={0.26} depthWrite={false} />
          </mesh>
        ))}
        {layers.map((layer, i) => {
          const n = i + 1
          const y = yOf(n)
          const color = KIND_COLOR[layer.kind]
          // 平面层：只有「从它上面穿过」的过孔才在平面上挖反焊盘；落在这一层的过孔和平面相连
          const holes = vias.filter((v) => v.from < n && n < v.to).map((v) => VIA_X[v.id])
          return (
            <group key={`l${count}-${i}`}>
              {layer.kind === 'sig' ? <SignalSlab y={y} color={color} seed={i} /> : <PlaneSlab y={y} color={color} holes={holes} />}
              <Tag position={[i % 2 === 0 ? -W / 2 : W / 2, y, D / 2]} text={layer.label} side={i % 2 === 0 ? 'left' : 'right'} color={color} />
            </group>
          )
        })}
        {vias.map((via) => (
          <group key={via.id}>
            <ViaMesh via={via} yOf={yOf} kinds={kinds} />
            <Tag position={[VIA_X[via.id], yOf(via.from) + 0.1, 0]} text={via.label} side="top" color={VIA_COLOR[via.id]} />
          </group>
        ))}
        <OrbitControls makeDefault enableDamping dampingFactor={0.12} enablePan={false} minDistance={3.5} maxDistance={11} />
      </Canvas>
      <div ref={portalRef} className="pcbStack-tags" />
      </TagPortal.Provider>
    </div>
  )
}

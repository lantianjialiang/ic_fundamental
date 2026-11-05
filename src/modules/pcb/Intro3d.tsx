import { Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Color, type Group } from 'three'
import { useLocale } from '../../i18n/LocaleContext'
import { ROLE_LABEL, S, type ScenePartId } from './data/pcbIntro'
import { useSceneTheme } from '../module01/hooks/useSceneTheme'

const W = 3.8
const D = 2.05
const CU = 0.03
const GOLD = new Color('#e8c45a')
const BLUE = new Color('#5aa6e6')
const CAM: [number, number, number] = [0.7, 1.55, 3.35]
const MASK_T = 0.028
const HOLE_R = 0.11

const LAYERS = [
  { id: 'maskT', kind: 'mask', y: 0.12 },
  { id: 'l1', kind: 'cu', y: 0.095 },
  { id: 'pp1', kind: 'pp', y: 0.058 },
  { id: 'l2', kind: 'gnd', y: 0.024 },
  { id: 'core', kind: 'core', y: 0 },
  { id: 'l3', kind: 'pwr', y: -0.024 },
  { id: 'pp2', kind: 'pp', y: -0.058 },
  { id: 'l4', kind: 'cu', y: -0.095 },
  { id: 'maskB', kind: 'mask', y: -0.12 },
] as const

const COL: Record<(typeof LAYERS)[number]['kind'], string> = {
  mask: '#1d6a3a',
  cu: '#c8793f',
  pp: '#c4b36a',
  gnd: '#d08a48',
  core: '#6f8a4a',
  pwr: '#c8793f',
}

const QFN = { x: -0.58, z: 0, s: 0.5 }
const CONN = { x: 0.42, zs: [-0.2, 0, 0.2] as const }
const RF = { x: 1.42, z: 0 }
const SCREW_X = -1.58
const THERMAL = [-0.1, 0, 0.1].flatMap((z) => [-0.1, 0.1].map((x) => ({ x: QFN.x + x, z: QFN.z + z })))
const FENCE = [
  { x: 1.1, z: -0.32 },
  { x: 1.42, z: -0.32 },
  { x: 1.74, z: -0.32 },
  { x: 1.1, z: 0.32 },
  { x: 1.42, z: 0.32 },
  { x: 1.74, z: 0.32 },
]
const TRACES = [
  { x: -0.06, z: 0, w: 1.12, d: 0.07 },
  { x: -0.16, z: 0.15, w: 0.78, d: 0.04 },
  { x: -0.22, z: -0.15, w: 0.62, d: 0.04 },
]
const QFN_PADS: Array<[number, number]> = [-0.15, -0.05, 0.05, 0.15].flatMap((o) => [
  [QFN.x + o, QFN.z + 0.27],
  [QFN.x + o, QFN.z - 0.27],
  [QFN.x + 0.27, QFN.z + o],
  [QFN.x - 0.27, QFN.z + o],
])

let glOk: boolean | null = null
function hasWebGL() {
  if (glOk === null) {
    try {
      const probe = document.createElement('canvas')
      glOk = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
    } catch {
      glOk = false
    }
  }
  return glOk
}

const TagPortal = createContext<RefObject<HTMLDivElement | null> | null>(null)

function Tag({
  position,
  text,
  side,
  active,
}: {
  position: [number, number, number]
  text: string
  side: 'left' | 'right' | 'top'
  active?: boolean
}) {
  const portal = useContext(TagPortal)
  return (
    <Html position={position} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }} portal={(portal ?? undefined) as RefObject<HTMLElement> | undefined}>
      <div className={`pcb-intro-tag pcb-intro-tag--${side}${active ? ' is-active' : ''}`}>{text}</div>
    </Html>
  )
}

function glow(on: boolean) {
  return on ? { emissive: GOLD, emissiveIntensity: 0.45 } : { emissive: '#000000', emissiveIntensity: 0 }
}

function Pick({ id, onPick, children }: { id: ScenePartId; onPick: (id: ScenePartId) => void; children: ReactNode }) {
  return (
    <group
      onClick={(event) => {
        event.stopPropagation()
        onPick(id)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      {children}
    </group>
  )
}

function yOf(id: (typeof LAYERS)[number]['id'], explode: number) {
  const index = LAYERS.findIndex((layer) => layer.id === id)
  return LAYERS[index].y + (4 - index) * explode * 0.14
}

function LayerSlab({
  y,
  thick,
  kind,
  glowOn,
}: {
  y: number
  thick: number
  kind: (typeof LAYERS)[number]['kind']
  glowOn: boolean
}) {
  const dielectric = kind === 'pp' || kind === 'core'
  const signal = kind === 'cu'
  return (
    <mesh position={[0, y, 0]}>
      <boxGeometry args={[W, thick, D]} />
      <meshStandardMaterial
        color={COL[kind]}
        roughness={kind === 'mask' ? 0.48 : 0.35}
        metalness={kind === 'mask' || dielectric ? 0.05 : 0.65}
        transparent={dielectric || signal}
        opacity={dielectric ? 0.38 : signal ? 0.28 : 1}
        depthWrite={!dielectric}
        {...glow(glowOn)}
      />
    </mesh>
  )
}

function ViaRing({ x, z, y, on }: { x: number; z: number; y: number; on: boolean }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <cylinderGeometry args={[0.055, 0.055, 0.012, 16]} />
        <meshStandardMaterial color="#d4af5a" metalness={0.8} roughness={0.25} {...glow(on)} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.016, 12]} />
        <meshStandardMaterial color="#1a1c16" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Board({ explode, selected, labels, onPick }: { explode: number; selected: ScenePartId; labels: boolean; onPick: (id: ScenePartId) => void }) {
  const { t } = useLocale()
  const l1 = yOf('l1', explode)
  const l4 = yOf('l4', explode)
  const top = yOf('maskT', explode)
  const bot = yOf('maskB', explode)
  const surf = top + MASK_T / 2 + 0.018
  const viaH = Math.max(0.1, l1 - l4)
  const viaY = (l1 + l4) / 2
  const on = (id: ScenePartId) => selected === id
  const layerTag = (id: (typeof LAYERS)[number]['id']) => {
    if (id === 'l1') return t(S.l1tag)
    if (id === 'l2') return t(S.l2tag)
    if (id === 'l3') return t(S.l3tag)
    if (id === 'l4') return t(S.l4tag)
    if (id === 'core') return t(S.coretag)
    return t(S.pptag)
  }

  return (
    <group>
      {LAYERS.map((layer) => {
        const y = yOf(layer.id, explode)
        const pickId: ScenePartId | null = layer.id === 'l2' ? 'gnd' : layer.id === 'l1' ? 'trace' : null
        const thick = layer.kind === 'cu' || layer.kind === 'gnd' || layer.kind === 'pwr' ? CU : layer.kind === 'core' ? 0.04 : MASK_T
        const slab = <LayerSlab y={y} thick={thick} kind={layer.kind} glowOn={(layer.id === 'l2' && on('gnd')) || (layer.id === 'l1' && on('trace'))} />
        return (
          <group key={layer.id}>
            {pickId ? (
              <Pick id={pickId} onPick={onPick}>
                {slab}
              </Pick>
            ) : (
              slab
            )}
            {labels && explode > 0.2 && (layer.id === 'l1' || layer.id === 'l2' || layer.id === 'l3' || layer.id === 'l4' || layer.id === 'core') ? (
              <Tag
                position={[layer.id === 'l2' || layer.id === 'l4' ? -W / 2 : W / 2, y, D / 2]}
                text={layerTag(layer.id)}
                side={layer.id === 'l2' || layer.id === 'l4' ? 'left' : 'right'}
                active={layer.id === 'l2' && on('gnd')}
              />
            ) : null}
          </group>
        )
      })}

      <Pick id="trace" onPick={onPick}>
        {TRACES.map((seg) => (
          <mesh key={`${seg.x}-${seg.z}`} position={[seg.x, surf + 0.008, seg.z]}>
            <boxGeometry args={[seg.w, 0.028, seg.d]} />
            <meshStandardMaterial
              color="#f4d35e"
              metalness={0}
              roughness={0.4}
              emissive="#c9a227"
              emissiveIntensity={on('trace') ? 0.7 : 0.35}
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
            />
          </mesh>
        ))}
        <mesh position={[QFN.x + 0.27, surf, 0]}>
          <boxGeometry args={[0.09, 0.016, 0.08]} />
          <meshStandardMaterial color="#e0c36a" metalness={0.85} roughness={0.2} {...glow(on('trace'))} />
        </mesh>
        <mesh position={[CONN.x, surf, CONN.zs[0]]}>
          <cylinderGeometry args={[0.055, 0.055, 0.016, 14]} />
          <meshStandardMaterial color="#e0c36a" metalness={0.85} roughness={0.2} {...glow(on('trace'))} />
        </mesh>
      </Pick>

      <Pick id="via" onPick={onPick}>
        {THERMAL.map((v) => (
          <group key={`${v.x}-${v.z}`}>
            <mesh position={[v.x, viaY, v.z]}>
              <cylinderGeometry args={[0.032, 0.032, viaH, 14]} />
              <meshStandardMaterial color="#e29a5a" metalness={0.75} roughness={0.28} {...glow(on('via'))} />
            </mesh>
            <ViaRing x={v.x} z={v.z} y={surf} on={on('via')} />
          </group>
        ))}
        <mesh position={[QFN.x, surf, QFN.z]}>
          <boxGeometry args={[0.28, 0.012, 0.28]} />
          <meshStandardMaterial color="#d4af5a" metalness={0.82} roughness={0.22} {...glow(on('via'))} />
        </mesh>
        {QFN_PADS.map(([x, z]) => {
          const side = Math.abs(x - QFN.x) > Math.abs(z - QFN.z)
          return (
            <mesh key={`pad-${x}-${z}`} position={[x, surf, z]}>
              <boxGeometry args={side ? [0.045, 0.012, 0.07] : [0.07, 0.012, 0.045]} />
              <meshStandardMaterial color="#d4af5a" metalness={0.8} roughness={0.24} {...glow(on('via'))} />
            </mesh>
          )
        })}
        <mesh position={[QFN.x, surf + 0.044, QFN.z]}>
          <boxGeometry args={[QFN.s, 0.075, QFN.s]} />
          <meshStandardMaterial color="#1c2128" roughness={0.42} {...glow(on('via'))} />
        </mesh>
        <mesh position={[QFN.x - 0.17, surf + 0.086, QFN.z - 0.17]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#c9d0d6" roughness={0.35} />
        </mesh>
        <mesh position={[QFN.x, surf - 0.002, QFN.z + 0.34]}>
          <boxGeometry args={[0.62, 0.004, 0.012]} />
          <meshStandardMaterial color="#e8edf2" />
        </mesh>
        <mesh position={[QFN.x, surf - 0.002, QFN.z - 0.34]}>
          <boxGeometry args={[0.62, 0.004, 0.012]} />
          <meshStandardMaterial color="#e8edf2" />
        </mesh>
        <mesh position={[QFN.x + 0.34, surf - 0.002, QFN.z]}>
          <boxGeometry args={[0.012, 0.004, 0.62]} />
          <meshStandardMaterial color="#e8edf2" />
        </mesh>
        <mesh position={[QFN.x - 0.34, surf - 0.002, QFN.z]}>
          <boxGeometry args={[0.012, 0.004, 0.62]} />
          <meshStandardMaterial color="#e8edf2" />
        </mesh>
      </Pick>
      {labels ? <Tag position={[QFN.x, surf + 0.2, QFN.z]} text="QFN" side="top" active={on('via')} /> : null}

      <Pick id="conn" onPick={onPick}>
        <mesh position={[CONN.x, surf + 0.15, 0]}>
          <boxGeometry args={[0.36, 0.3, 0.62]} />
          <meshStandardMaterial color="#2a313a" roughness={0.42} {...glow(on('conn'))} />
        </mesh>
        <mesh position={[CONN.x + 0.07, surf + 0.18, 0]}>
          <boxGeometry args={[0.24, 0.2, 0.5]} />
          <meshStandardMaterial color="#15191f" roughness={0.55} />
        </mesh>
        {CONN.zs.map((z) => (
          <group key={`pin-${z}`}>
            <mesh position={[CONN.x, viaY, z]}>
              <cylinderGeometry args={[0.038, 0.038, viaH, 16]} />
              <meshStandardMaterial color="#d3dae1" metalness={0.8} roughness={0.25} {...glow(on('conn'))} />
            </mesh>
            <mesh position={[CONN.x, surf + 0.12, z]}>
              <boxGeometry args={[0.045, 0.26, 0.045]} />
              <meshStandardMaterial color="#c5ccd3" metalness={0.85} roughness={0.22} {...glow(on('conn'))} />
            </mesh>
            <mesh position={[CONN.x, bot - 0.04, z]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.065, 0.055, 10]} />
              <meshStandardMaterial color="#d3dae1" metalness={0.7} roughness={0.3} {...glow(on('conn'))} />
            </mesh>
          </group>
        ))}
      </Pick>
      {labels ? <Tag position={[CONN.x, surf + 0.42, 0]} text={t(ROLE_LABEL.conn)} side="top" active={on('conn')} /> : null}

      <Pick id="can" onPick={onPick}>
        {FENCE.map((v) => (
          <group key={`fence-${v.x}-${v.z}`}>
            <mesh position={[v.x, viaY, v.z]}>
              <cylinderGeometry args={[0.026, 0.026, viaH, 12]} />
              <meshStandardMaterial color="#e29a5a" metalness={0.7} roughness={0.3} {...glow(on('can'))} />
            </mesh>
            <ViaRing x={v.x} z={v.z} y={surf} on={on('can')} />
          </group>
        ))}
        <mesh position={[RF.x, surf + 0.028, RF.z]}>
          <boxGeometry args={[0.28, 0.05, 0.24]} />
          <meshStandardMaterial color="#1c2128" roughness={0.42} {...glow(on('can'))} />
        </mesh>
        <mesh position={[RF.x, surf, RF.z]}>
          <boxGeometry args={[0.64, 0.01, 0.06]} />
          <meshStandardMaterial color="#c5ccd3" metalness={0.75} roughness={0.28} {...glow(on('can'))} />
        </mesh>
        <mesh position={[RF.x, surf, RF.z]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.64, 0.01, 0.06]} />
          <meshStandardMaterial color="#c5ccd3" metalness={0.75} roughness={0.28} {...glow(on('can'))} />
        </mesh>
        <mesh position={[RF.x, surf + 0.18, RF.z]}>
          <boxGeometry args={[0.58, 0.016, 0.58]} />
          <meshStandardMaterial color="#c5ccd3" metalness={0.75} roughness={0.28} {...glow(on('can'))} />
        </mesh>
        <mesh position={[RF.x - 0.28, surf + 0.1, RF.z]}>
          <boxGeometry args={[0.016, 0.16, 0.58]} />
          <meshStandardMaterial color="#c5ccd3" metalness={0.75} roughness={0.28} {...glow(on('can'))} />
        </mesh>
        <mesh position={[RF.x + 0.28, surf + 0.1, RF.z]}>
          <boxGeometry args={[0.016, 0.16, 0.58]} />
          <meshStandardMaterial color="#c5ccd3" metalness={0.75} roughness={0.28} {...glow(on('can'))} />
        </mesh>
        <mesh position={[RF.x, surf + 0.1, RF.z - 0.28]}>
          <boxGeometry args={[0.58, 0.16, 0.016]} />
          <meshStandardMaterial color="#c5ccd3" metalness={0.75} roughness={0.28} {...glow(on('can'))} />
        </mesh>
        <mesh position={[RF.x, surf + 0.1, RF.z + 0.28]}>
          <boxGeometry args={[0.58, 0.16, 0.016]} />
          <meshStandardMaterial color="#c5ccd3" metalness={0.75} roughness={0.28} {...glow(on('can'))} />
        </mesh>
      </Pick>
      {labels ? <Tag position={[RF.x + 0.12, surf + 0.28, RF.z]} text={t(ROLE_LABEL.can)} side="top" active={on('can')} /> : null}

      <Pick id="screw" onPick={onPick}>
        <mesh position={[SCREW_X, surf, 0]}>
          <cylinderGeometry args={[HOLE_R, HOLE_R, 0.012, 20]} />
          <meshStandardMaterial color="#0f1610" roughness={0.85} {...glow(on('screw'))} />
        </mesh>
        <mesh position={[SCREW_X, bot - 0.3, 0]}>
          <boxGeometry args={[0.55, 0.08, 0.55]} />
          <meshStandardMaterial color="#3a424d" roughness={0.55} {...glow(on('screw'))} />
        </mesh>
        <mesh position={[SCREW_X, (top + bot - 0.22) / 2, 0]}>
          <cylinderGeometry args={[0.042, 0.042, top - bot + 0.28, 18]} />
          <meshStandardMaterial color="#aab3bd" metalness={0.7} roughness={0.3} {...glow(on('screw'))} />
        </mesh>
        <mesh position={[SCREW_X, surf + 0.04, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.055, 22]} />
          <meshStandardMaterial color="#8d96a1" metalness={0.65} roughness={0.32} {...glow(on('screw'))} />
        </mesh>
        <mesh position={[SCREW_X, surf + 0.072, 0]}>
          <boxGeometry args={[0.14, 0.016, 0.028]} />
          <meshStandardMaterial color="#5b6470" roughness={0.45} />
        </mesh>
      </Pick>
      {labels ? <Tag position={[SCREW_X, surf + 0.2, 0]} text={t(S.tagScrew)} side="top" active={on('screw')} /> : null}

      <mesh position={[-1.05, surf + 0.016, 0.62]}>
        <boxGeometry args={[0.1, 0.028, 0.05]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.5} />
      </mesh>
      <mesh position={[-1.09, surf + 0.016, 0.62]}>
        <boxGeometry args={[0.028, 0.03, 0.052]} />
        <meshStandardMaterial color="#c4a35a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-1.01, surf + 0.016, 0.62]}>
        <boxGeometry args={[0.028, 0.03, 0.052]} />
        <meshStandardMaterial color="#c4a35a" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function lerpPath(points: Array<[number, number, number]>, u: number): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, u))
  const scaled = clamped * (points.length - 1)
  const i = Math.min(points.length - 2, Math.floor(scaled))
  const t = scaled - i
  const a = points[i]
  const b = points[i + 1]
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function SignalPulse({ explode, playing, playKey, onDone }: { explode: number; playing: boolean; playKey: number; onDone: () => void }) {
  const go = useRef<Group>(null)
  const back = useRef<Group>(null)
  const clock = useRef(0)
  const l1 = yOf('maskT', explode) + MASK_T / 2 + 0.02
  const l2 = yOf('l2', explode) + 0.025
  const out: Array<[number, number, number]> = [
    [QFN.x + 0.28, l1, 0],
    [0.05, l1, 0],
    [CONN.x, l1, CONN.zs[0]],
  ]
  const ret: Array<[number, number, number]> = [
    [CONN.x, l2, CONN.zs[0]],
    [0.05, l2, 0],
    [QFN.x + 0.28, l2, 0],
  ]

  useEffect(() => {
    if (playing) clock.current = 0
  }, [playing, playKey])

  useFrame((_, dt) => {
    if (!playing) return
    clock.current += dt / 1.15
    const u = clock.current
    if (go.current) {
      const p = lerpPath(out, Math.min(1, u))
      go.current.position.set(p[0], p[1], p[2])
      go.current.visible = u >= 0 && u < 1.05
    }
    if (back.current) {
      const p = lerpPath(ret, Math.min(1, Math.max(0, u - 1)))
      back.current.position.set(p[0], p[1], p[2])
      back.current.visible = u > 1
    }
    if (u >= 2.05) onDone()
  })

  if (!playing) return null
  return (
    <>
      <group ref={go} visible={false}>
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#e8c45a" emissive={GOLD} emissiveIntensity={1.1} />
        </mesh>
      </group>
      <group ref={back} visible={false}>
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#5aa6e6" emissive={BLUE} emissiveIntensity={1.1} />
        </mesh>
      </group>
    </>
  )
}

function SceneInner({
  selected,
  exploded,
  labels,
  playing,
  playKey,
  resetKey,
  onPick,
  onPlayEnd,
}: {
  selected: ScenePartId
  exploded: boolean
  labels: boolean
  playing: boolean
  playKey: number
  resetKey: number
  onPick: (id: ScenePartId) => void
  onPlayEnd: () => void
}) {
  const theme = useSceneTheme()
  const [explode, setExplode] = useState(exploded ? 1 : 0)
  const controls = useRef<{ reset: () => void } | null>(null)

  useEffect(() => {
    controls.current?.reset()
  }, [resetKey])

  useFrame((_, dt) => {
    const target = exploded ? 1 : 0
    setExplode((prev) => {
      const next = prev + (target - prev) * Math.min(1, dt * 6)
      return Math.abs(next - target) < 0.002 ? target : next
    })
  })

  return (
    <>
      <color attach="background" args={[theme.bg]} />
      <ambientLight intensity={theme.mode === 'light' ? 1.25 : 0.95} />
      <directionalLight position={[4, 6, 3]} intensity={1.55} />
      <directionalLight position={[-3, 1.4, -2]} intensity={0.4} />
      <Board explode={explode} selected={selected} labels={labels} onPick={onPick} />
      <SignalPulse explode={explode} playing={playing} playKey={playKey} onDone={onPlayEnd} />
      <OrbitControls
        ref={(node) => {
          controls.current = node
        }}
        makeDefault
        enableDamping
        dampingFactor={0.12}
        minDistance={2.2}
        maxDistance={9}
        target={[0, 0.08, 0]}
      />
    </>
  )
}

export type Intro3dProps = {
  selected: ScenePartId
  exploded: boolean
  labels: boolean
  playing: boolean
  playKey: number
  resetKey: number
  onPick: (id: ScenePartId) => void
  onPlayEnd: () => void
}

export function Intro3dScene({ selected, exploded, labels, playing, playKey, resetKey, onPick, onPlayEnd }: Intro3dProps) {
  const { t } = useLocale()
  const portalRef = useRef<HTMLDivElement>(null)

  if (!hasWebGL()) {
    return <div className="pcb-intro-nogl">{t(S.nogl)}</div>
  }

  return (
    <div className="pcb-intro-3d" role="group" aria-label={t(S.stageAria)}>
      <TagPortal.Provider value={portalRef}>
        <Canvas
          shadows={false}
          dpr={[1, 2]}
          camera={{ position: CAM, fov: 38, near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => undefined}
        >
          <SceneInner
            selected={selected}
            exploded={exploded}
            labels={labels}
            playing={playing}
            playKey={playKey}
            resetKey={resetKey}
            onPick={onPick}
            onPlayEnd={onPlayEnd}
          />
        </Canvas>
        <div ref={portalRef} className="pcb-intro-tags" />
      </TagPortal.Provider>
    </div>
  )
}

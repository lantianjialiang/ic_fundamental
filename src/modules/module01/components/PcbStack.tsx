import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import { CircleGeometry, CylinderGeometry, PlaneGeometry, type Group, type Material } from 'three'
import { useLocale } from '../../../i18n/LocaleContext'
import { useScene } from '../context/SceneContext'
import { PCB_STACK, pcbHalf, pcbSlotLift, pcbStack, type BoardSpec, type LayerId, type Vec3 } from '../data/layout'
import { DIELECTRIC_MAT, GEO } from '../data/materials'
import { PCB_TEXT } from '../data/text'
import { SceneLabel } from './SceneLabel'

/** 分层展开进度超过它才显示分层薄片，否则显示整块板 */
export const SPREAD_MIN = 0.002

/** 跟着 PCB 第 slot 片一起移动的部件（slot 0 = 顶面及其上的器件，2n = 底面及其下的部件） */
export function PcbSlot({ spec, slot, children }: { spec: BoardSpec; slot: number; children: ReactNode }) {
  const { store } = useScene()
  const ref = useRef<Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.position.y = pcbSlotLift(spec, slot, store.pose.spread)
  })
  return <group ref={ref}>{children}</group>
}

/** 贯穿全板的过孔：子元素的 y 相对板中心；分层展开时按比例拉长，始终从顶面连到底面 */
export function PcbVias({ spec, boardY, children }: { spec: BoardSpec; boardY: number; children: ReactNode }) {
  const { store } = useScene()
  const ref = useRef<Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.scale.y = pcbHalf(spec, store.pose.spread) / (spec.t / 2)
  })
  return (
    <group ref={ref} position={[0, boardY, 0]}>
      {children}
    </group>
  )
}

export type PcbOutline = { w: number; d: number } | { r: number }

type Sheet = { slot: number; y: number; kind: 'maskTop' | 'cu' | 'diel' | 'maskBottom'; i: number }

type Column = 'left' | 'right' | 'front'

const UNIT_PLANE = new PlaneGeometry(1, 1)
const DIEL_T = 0.006
const diskCache = new Map<number, { face: CircleGeometry; slab: CylinderGeometry }>()
function diskGeos(r: number) {
  let hit = diskCache.get(r)
  if (!hit) {
    hit = { face: new CircleGeometry(r, 96), slab: new CylinderGeometry(r, r, DIEL_T, 96) }
    diskCache.set(r, hit)
  }
  return hit
}

/**
 * 标签分三列：左列在镜头左侧的板角、右列在右后板角、前列在正对镜头的板角。
 * 铜层奇偶交替放左右两列，同一列相邻标签至少隔 4 片，默认视角下中英文都不重叠。
 */
export function pcbLabelAnchor(outline: PcbOutline, col: Column): Vec3 {
  if ('r' in outline) {
    const r = outline.r
    if (col === 'left') return [-0.75 * r, 0, 0.66 * r]
    if (col === 'right') return [0.75 * r, 0, -0.66 * r]
    return [0.66 * r, 0, 0.75 * r]
  }
  const { w, d } = outline
  if (col === 'left') return [-w / 2, 0, d / 2]
  if (col === 'right') return [w / 2, 0, -d / 2]
  return [w / 2, 0, d / 2]
}

type PcbSheetsProps = {
  id: Extract<LayerId, 'loadboard' | 'probecard'>
  spec: BoardSpec
  boardY: number
  outline: PcbOutline
  /** 每层铜一种材质（从上到下） */
  copper: Material[]
  /** 顶面可叠几张（绿油 + 透明丝印），依次略微抬高 */
  maskTop: Material[]
  maskBottom: Material
}

/** 分解时把多层板拆成一叠薄片：顶面阻焊 / 丝印、各层铜、FR4 介质、底面阻焊 */
export function PcbSheets({ id, spec, boardY, outline, copper, maskTop, maskBottom }: PcbSheetsProps) {
  const { store, cfg } = useScene()
  const { t } = useLocale()
  const root = useRef<Group>(null)
  const refs = useRef<Array<Group | null>>([])

  const sheets = useMemo<Sheet[]>(() => {
    const st = pcbStack(spec)
    const n = spec.layers.length
    const out: Sheet[] = [{ slot: 0, y: spec.t / 2 - PCB_STACK.mask / 2, kind: 'maskTop', i: 0 }]
    for (let i = 0; i < n; i += 1) {
      out.push({ slot: 2 * i + 1, y: st.copper[i]!, kind: 'cu', i })
      if (i < n - 1) out.push({ slot: 2 * i + 2, y: st.dielectric[i]!.y, kind: 'diel', i })
    }
    out.push({ slot: 2 * n, y: -spec.t / 2 + PCB_STACK.mask / 2, kind: 'maskBottom', i: 0 })
    return out
  }, [spec])

  useFrame(() => {
    const spread = store.pose.spread
    if (root.current) root.current.visible = spread > SPREAD_MIN
    if (spread <= SPREAD_MIN) return
    sheets.forEach((s, k) => {
      const g = refs.current[k]
      if (g) g.position.y = boardY + s.y + pcbSlotLift(spec, s.slot, spread)
    })
  })

  const rect = 'r' in outline ? null : outline
  const disk = 'r' in outline ? diskGeos(outline.r) : null
  const faceProps = rect ? { geometry: UNIT_PLANE, scale: [rect.w, rect.d, 1] as Vec3 } : { geometry: disk!.face }
  const n = spec.layers.length
  const midDiel = Math.floor((n - 1) / 2)
  const showLabels = cfg.exploded && (cfg.showLabels || cfg.focus === id)

  // 底面阻焊不标：它和下一层部件的标注挨得太近；侧栏「PCB 层」里有说明
  const label = (s: Sheet): { col: Column; title: string; lift?: number } | null => {
    // 顶面和同列的 L2 只隔 3 片，标签再往上提一点
    if (s.kind === 'maskTop') return { col: 'left', title: t(PCB_TEXT.maskTop), lift: spec.step * 2.4 }
    if (s.kind === 'maskBottom') return null
    if (s.kind === 'diel') return s.i === midDiel ? { col: 'front', title: t(PCB_TEXT.dielectric) } : null
    const name = `L${s.i + 1}`
    const kind = spec.layers[s.i]!
    const text =
      s.i === 0 ? PCB_TEXT.top : s.i === n - 1 ? PCB_TEXT.bottom : kind === 'GND' ? PCB_TEXT.gnd : kind === 'PWR' ? PCB_TEXT.pwr : PCB_TEXT.inner
    return { col: s.i % 2 === 0 ? 'right' : 'left', title: t(text).replace('{name}', name) }
  }

  return (
    <group ref={root} visible={false}>
      {sheets.map((s, k) => {
        const lab = showLabels ? label(s) : null
        const at = lab ? pcbLabelAnchor(outline, lab.col) : null
        return (
          <group
            key={`${s.kind}-${s.slot}`}
            ref={(el) => {
              refs.current[k] = el
            }}
            position={[0, boardY + s.y, 0]}
          >
            {s.kind === 'maskTop'
              ? maskTop.map((m, j) => (
                  <mesh key={j} {...faceProps} material={m} position={[0, j * 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]} />
                ))
              : null}
            {s.kind === 'maskBottom' ? <mesh {...faceProps} material={maskBottom} rotation={[Math.PI / 2, 0, 0]} /> : null}
            {s.kind === 'cu' && copper[s.i] ? <mesh {...faceProps} material={copper[s.i]} rotation={[-Math.PI / 2, 0, 0]} /> : null}
            {s.kind === 'diel' ? (
              rect ? (
                <mesh geometry={GEO.box} material={DIELECTRIC_MAT} scale={[rect.w, DIEL_T, rect.d]} />
              ) : (
                <mesh geometry={disk!.slab} material={DIELECTRIC_MAT} />
              )
            ) : null}
            {lab && at ? (
              <SceneLabel position={[at[0], lab.lift ?? 0, at[2]]} title={lab.title} side={lab.col === 'left' ? 'left' : 'right'} compact />
            ) : null}
          </group>
        )
      })}
    </group>
  )
}

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { PlaneGeometry, type Mesh } from 'three'
import { useScene } from '../context/SceneContext'
import { CHANNEL_COUNT, LB, ftRoute, towerPinXZ } from '../data/layout'
import {
  BGA_PAD_R,
  CAP_TERM,
  HEADER,
  LB_BOTTOM,
  LB_CAPS,
  LB_HEADERS,
  LB_HOLES,
  LB_RELAYS,
  LB_RES,
  LB_SMAS,
  LB_TOP,
  LB_TPS,
  QFP_EP,
  QFP_PAD,
  RELAY,
  RELAY_PADS,
  RES_TERM,
  fanoutVias,
  headerPins,
  socketPads,
} from '../data/loadboard'
import { GEO, MAT, SECTION_PLANE, lbMaterials, relayTopMaterial } from '../data/materials'
import { frameGeometry } from '../data/shapes'
import { BoardCopper } from './BoardCopper'
import { InstancedParts, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'

const UNIT_PLANE = new PlaneGeometry(1, 1)
const HEADER_SHROUD = frameGeometry(HEADER.w, HEADER.d, HEADER.w - 0.03, HEADER.d - 0.03, HEADER.h)

/**
 * Load Board / DIB：8 层 PCB。
 * 板体一个盒子、6 个面分别贴图：四周是叠层截面（绿油 / 铜 / 介质交替），顶 / 底面是绿油 + 丝印 + 沉金焊盘；
 * 剖开到 z=0 时在切口贴一张截面图，能看到各层铜箔和贯穿的过孔。
 * 器件：0402 旁路电容、串联电阻、测试点、SMD 继电器、2×12 牛角座、SMA；内层走线和过孔由 BoardCopper 画。
 */
export function LoadBoard() {
  const { store, cfg } = useScene()
  const cap = useRef<Mesh>(null)
  const mats = lbMaterials(cfg.pkg)
  const bodyMats = useMemo(() => [mats.side, mats.side, mats.top, mats.bottom, mats.side, mats.side], [mats])

  const routes = useMemo(() => Array.from({ length: CHANNEL_COUNT }, (_, ch) => ftRoute(cfg.pkg, ch)), [cfg.pkg])

  const topPads = useMemo<InstanceItem[]>(() => {
    if (cfg.pkg === 'BGA') return socketPads('BGA').map((p) => ({ p: [p.x, LB_TOP + 0.003, p.z], s: [BGA_PAD_R, 0.006, BGA_PAD_R] }))
    const out: InstanceItem[] = socketPads('QFP').map((p) => ({
      p: [p.x, LB_TOP + 0.003, p.z],
      r: [0, p.rotY, 0],
      s: [QFP_PAD.l, 0.006, QFP_PAD.w],
    }))
    out.push({ p: [0, LB_TOP + 0.002, 0], s: [QFP_EP, 0.004, QFP_EP] })
    return out
  }, [cfg.pkg])

  const bottomPads = useMemo<InstanceItem[]>(
    () => towerPinXZ('FT').map(([x, z]) => ({ p: [x, LB_BOTTOM - 0.003, z], s: [0.024, 0.006, 0.024] })),
    [],
  )

  /** 扇出 / 散热过孔孔壁（盖油，不露出板面；剖开或板子半透明时才看得到） */
  const vias = useMemo<InstanceItem[]>(
    () => fanoutVias(cfg.pkg).map(([x, z]) => ({ p: [x, LB.y, z], s: [0.012, LB.t - 0.002, 0.012] })),
    [cfg.pkg],
  )

  const parts = useMemo(() => {
    const caps: InstanceItem[] = []
    const terms: InstanceItem[] = []
    const resBodies: InstanceItem[] = []
    for (const c of LB_CAPS) {
      caps.push({ p: [c.x, LB_TOP + 0.024, c.z], r: [0, c.horiz ? 0 : Math.PI / 2, 0], s: [0.07, 0.045, 0.05] })
      const dx = c.horiz ? CAP_TERM : 0
      const dz = c.horiz ? 0 : CAP_TERM
      const s: InstanceItem['s'] = [c.horiz ? 0.018 : 0.052, 0.047, c.horiz ? 0.052 : 0.018]
      terms.push({ p: [c.x - dx, LB_TOP + 0.024, c.z - dz], s }, { p: [c.x + dx, LB_TOP + 0.024, c.z + dz], s })
    }
    for (const r of LB_RES) {
      resBodies.push({ p: [r.x, LB_TOP + 0.014, r.z], s: [0.05, 0.026, 0.034] })
      for (const sx of [-1, 1]) terms.push({ p: [r.x + sx * RES_TERM, LB_TOP + 0.013, r.z], s: [0.016, 0.026, 0.035] })
    }
    // 继电器鸥翼脚：落在焊盘上
    for (const k of LB_RELAYS) {
      for (const [dx, dz] of RELAY_PADS) terms.push({ p: [k.x + dx, LB_TOP + 0.01, k.z + dz], s: [0.024, 0.02, 0.05] })
    }
    const relays = LB_RELAYS.map<InstanceItem>((k) => ({ p: [k.x, LB_TOP + RELAY.h / 2, k.z], s: [RELAY.w, RELAY.h, RELAY.d] }))
    const relayTops = LB_RELAYS.map<InstanceItem>((k) => ({
      p: [k.x, LB_TOP + RELAY.h + 0.0008, k.z],
      r: [-Math.PI / 2, 0, 0],
      s: [RELAY.w - 0.02, RELAY.d - 0.02, 1],
    }))
    const tps = LB_TPS.map<InstanceItem>((tp) => ({ p: [tp.x, LB_TOP + 0.004, tp.z], s: [0.022, 0.012, 0.022] }))
    const shrouds = LB_HEADERS.map<InstanceItem>((h) => ({ p: [h.x, LB_TOP, HEADER.cz] }))
    const headerPinItems: InstanceItem[] = []
    for (const h of LB_HEADERS) {
      for (const [x, z] of headerPins(h.x)) headerPinItems.push({ p: [x, LB_TOP + 0.06, z], s: [0.014, 0.12, 0.014] })
    }
    const sma = LB_SMAS.map<InstanceItem>((s) => ({ p: [s.x, LB_TOP + 0.06, LB.d / 2 - 0.02], r: [Math.PI / 2, 0, 0], s: [0.06, 0.16, 0.06] }))
    const screws = LB_HOLES.map<InstanceItem>(([x, z]) => ({ p: [x, LB_TOP + 0.015, z], s: [0.06, 0.03, 0.06] }))
    return { caps, terms, resBodies, relays, relayTops, tps, shrouds, headerPinItems, sma, screws }
  }, [])

  // 剖开到底（切面停在 z=0）后，在切口贴截面图；切面移动途中不显示
  useFrame(() => {
    const m = cap.current
    if (!m) return
    const show = store.section > 0.985
    m.visible = show
    if (show) m.position.z = SECTION_PLANE.constant + 0.001
  })

  return (
    <LayerGroup id="loadboard">
      <mesh geometry={GEO.box} material={bodyMats} position={[0, LB.y, 0]} scale={[LB.w, LB.t, LB.d]} castShadow receiveShadow />
      <mesh ref={cap} geometry={UNIT_PLANE} material={mats.cap} position={[0, LB.y, 0]} scale={[LB.w, LB.t, 1]} visible={false} />

      <InstancedParts geometry={cfg.pkg === 'BGA' ? GEO.cyl : GEO.box} material={MAT.gold} items={topPads} />
      <InstancedParts geometry={GEO.cyl} material={MAT.gold} items={bottomPads} />
      <InstancedParts geometry={GEO.cyl} material={MAT.copperClip} items={vias} />
      <InstancedParts geometry={GEO.box} material={MAT.mlcc} items={parts.caps} />
      <InstancedParts geometry={GEO.box} material={MAT.solder} items={parts.terms} />
      <InstancedParts geometry={GEO.box} material={MAT.mold} items={parts.resBodies} />
      <InstancedParts geometry={GEO.sphere} material={MAT.solder} items={parts.tps} />
      <InstancedParts geometry={GEO.box} material={MAT.relayBody} items={parts.relays} castShadow />
      <InstancedParts geometry={UNIT_PLANE} material={relayTopMaterial()} items={parts.relayTops} />
      <InstancedParts geometry={HEADER_SHROUD} material={MAT.plasticGray} items={parts.shrouds} castShadow />
      <InstancedParts geometry={GEO.box} material={MAT.gold} items={parts.headerPinItems} />
      <InstancedParts geometry={GEO.cyl6} material={MAT.gold} items={parts.sma} castShadow />
      <InstancedParts geometry={GEO.cyl} material={MAT.steel} items={parts.screws} />
      <BoardCopper routes={routes} boardY={LB.y} thickness={LB.t} selected={cfg.selected} onSelect={cfg.onSelect} tented />
    </LayerGroup>
  )
}

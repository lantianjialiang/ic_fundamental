import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MeshStandardMaterial, type Group, type InstancedMesh } from 'three'
import { activeChannel, useScene } from '../context/SceneContext'
import {
  BGA,
  DIE,
  FT_PIN_Z,
  LB,
  PC,
  PIN_FREE_TOP,
  SOCKET,
  TH,
  TH_DOCK_Y,
  TOWER_CP,
  TOWER_FT,
  DUT_BASE_Y,
  cardX,
  channelCard,
  channelSide,
  contactFor,
  cpRoute,
  ftRoute,
  needleShape,
  padFor,
  pcbLayerY,
  ringXZ,
  type PcbNode,
  type Pose,
  type Vec3,
} from '../data/layout'
import { GEO } from '../data/materials'
import { writeInstance, writeSegment, type InstanceItem } from './Instanced'

const CAP = 32

/** 高亮材质不登记到淡化表：始终不透明、写深度，所以淡化的部件不会和它抢排序 */
const strong = new MeshStandardMaterial({
  color: '#ffd84a',
  emissive: '#ffae00',
  emissiveIntensity: 1.1,
  metalness: 0.2,
  roughness: 0.35,
})
const soft = new MeshStandardMaterial({
  color: '#3fcf78',
  emissive: '#1e9c52',
  emissiveIntensity: 0.55,
  metalness: 0,
  roughness: 0.5,
})

type Seg = { a: Vec3; b: Vec3; r: number }
type Parts = { boxes: InstanceItem[]; softBoxes: InstanceItem[]; segs: Seg[]; balls: InstanceItem[] }

/** 板上一条路由：同层两点之间是走线（扁盒子），换层处是贯穿全板的过孔（圆柱） */
function boardParts(out: Parts, nodes: PcbNode[], boardY: number, t: number) {
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i]!
    const b = nodes[i + 1]!
    if (a.layer !== b.layer) {
      out.segs.push({ a: [a.x, boardY - t / 2 - 0.004, a.z], b: [a.x, boardY + t / 2 + 0.004, a.z], r: 0.021 })
      continue
    }
    const dx = b.x - a.x
    const dz = b.z - a.z
    const len = Math.hypot(dx, dz)
    if (len < 1e-4) continue
    out.boxes.push({
      p: [(a.x + b.x) / 2, boardY + pcbLayerY(t, a.layer), (a.z + b.z) / 2],
      r: [0, Math.atan2(dx, dz), 0],
      s: [0.05, 0.014, len + 0.05],
    })
  }
}

/** 测试头里这一路的通道板（整块淡绿发光）+ 驱动芯片 + 金手指（金色发光） */
function testHeadParts(out: Parts, flipped: boolean, ch: number, pose: Pose) {
  const x = cardX(channelCard(ch))
  const z = channelSide(ch) * FT_PIN_Z
  const dock = TH_DOCK_Y[flipped ? 'CP' : 'FT'] + pose.y.testhead
  const dir = flipped ? 1 : -1
  out.softBoxes.push({ p: [x, dock + (dir * TH.cardH) / 2, 0], s: [TH.cardT * 1.5, TH.cardH * 1.005, TH.cardD * 1.005] })
  // CP 时测试头绕 Z 轴翻转，芯片在通道板的另一侧
  out.boxes.push({ p: [x + (flipped ? -0.04 : 0.04), dock + dir * TH.chipDepth, z], s: [0.04, 0.24, 0.26] })
  out.boxes.push({ p: [x, dock + dir * 0.03, z], s: [TH.cardT + 0.024, 0.07, 0.3] })
}

function ftParts(out: Parts, pkg: 'BGA' | 'QFP', ch: number, pose: Pose) {
  testHeadParts(out, false, ch, pose)
  const r = ftRoute(pkg, ch)
  const cx = r[0]!.x
  const cz = r[0]!.z
  // Pogo Tower 里对应的那根针
  out.segs.push({ a: [cx, TOWER_FT.bottom + pose.y.pogo, cz], b: [cx, TOWER_FT.top + pose.y.pogo, cz], r: 0.02 })
  const lbY = LB.y + pose.y.loadboard
  // 底层焊盘（Pogo 针压在这里）
  out.segs.push({ a: [cx, lbY - LB.t / 2 - 0.009, cz], b: [cx, lbY - LB.t / 2 + 0.001, cz], r: 0.034 })
  boardParts(out, r, lbY, LB.t)
  // 顶层焊盘（Socket 针压在这里）
  const p = contactFor(pkg, ch)
  if (pkg === 'BGA') out.segs.push({ a: [p.x, lbY + LB.t / 2 - 0.001, p.z], b: [p.x, lbY + LB.t / 2 + 0.009, p.z], r: 0.042 })
  else {
    const alongX = Math.abs(p.x) > Math.abs(p.z)
    out.boxes.push({ p: [p.x, lbY + LB.t / 2 + 0.004, p.z], s: alongX ? [0.14, 0.01, 0.05] : [0.05, 0.01, 0.14] })
  }
  // Socket 里那根弹簧针（随压缩变短）
  const sk = pose.y.socket
  out.segs.push({ a: [p.x, SOCKET.bottom + sk + 0.002, p.z], b: [p.x, PIN_FREE_TOP - pose.pinComp + sk, p.z], r: 0.024 })
  // DUT 的那颗锡球 / 那根引脚
  const dutY = DUT_BASE_Y + pose.y.dut
  const dx = pose.x.dut
  if (pkg === 'BGA') out.balls.push({ p: [p.x + dx, dutY + BGA.ballR * 0.88, p.z], s: BGA.ballR * 1.25 })
  else {
    const alongX = Math.abs(p.x) > Math.abs(p.z)
    out.boxes.push({ p: [p.x + dx, dutY + 0.007, p.z], s: alongX ? [0.11, 0.022, 0.045] : [0.045, 0.022, 0.11] })
  }
}

function cpParts(out: Parts, probe: 'cantilever' | 'vertical', ch: number, pose: Pose) {
  testHeadParts(out, true, ch, pose)
  const [rx, rz] = ringXZ(ch)
  out.segs.push({ a: [rx, TOWER_CP.bottom + pose.y.pogo, rz], b: [rx, TOWER_CP.top + pose.y.pogo, rz], r: 0.02 })
  const pcY = PC.y + pose.y.probecard
  // 探针卡边缘焊盘
  out.segs.push({ a: [rx, pcY + PC.t / 2 - 0.001, rz], b: [rx, pcY + PC.t / 2 + 0.009, rz], r: 0.032 })
  const r = cpRoute(ch)
  boardParts(out, r, pcY, PC.t)
  // 空间转换器内部：从 PCB 底面过孔落到探针根部
  const pad = padFor(ch)
  const needle = needleShape(probe, pad, pose.y.probecard, pose.needleDefl)
  const v2 = r[r.length - 1]!
  const root = needle.pts[0]!
  const stBottom: Vec3 =
    probe === 'vertical' ? [pad.x, PC.stBottom + pose.y.probecard, pad.z] : [root[0] * 0.85, PC.stBottom + pose.y.probecard, root[2] * 0.85]
  out.segs.push({ a: [v2.x, pcY - PC.t / 2, v2.z], b: stBottom, r: 0.012 })
  if (probe === 'cantilever') out.segs.push({ a: stBottom, b: root, r: 0.01 })
  // 那根探针
  for (let i = 0; i < needle.pts.length - 1; i += 1) out.segs.push({ a: needle.pts[i]!, b: needle.pts[i + 1]!, r: 0.009 })
  // die 上被扎的那个 pad
  out.boxes.push({ p: [pad.x + pose.x.wafer, DIE.h + 0.0015 + pose.y.wafer, pad.z], s: [0.032, 0.007, 0.032] })
}

function fill(mesh: InstancedMesh | null, items: InstanceItem[]) {
  if (!mesh) return
  items.forEach((it, i) => writeInstance(mesh, i, it))
  mesh.count = items.length
  mesh.instanceMatrix.needsUpdate = true
}

/**
 * 选中通道（或接触动画信号阶段）时，把这一路经过的实物部件用发光材质重画一遍：
 * 通道板 / Pogo 针 / 板上焊盘、走线、过孔 / Socket 针 / 锡球（CP：探针卡焊盘与走线、空间转换器、探针、die pad）。
 * 重画的几何比原件略大，把原件包在里面，不会 z-fighting。
 */
export function PathHighlight() {
  const { store, cfg } = useScene()
  const boxes = useRef<InstancedMesh>(null)
  const softBoxes = useRef<InstancedMesh>(null)
  const segs = useRef<InstancedMesh>(null)
  const balls = useRef<InstancedMesh>(null)
  const group = useRef<Group>(null)

  useFrame(() => {
    const ch = activeChannel(store, cfg)
    const g = group.current
    if (!g) return
    g.visible = ch !== null
    if (ch === null) return
    const parts: Parts = { boxes: [], softBoxes: [], segs: [], balls: [] }
    if (cfg.flow === 'FT') ftParts(parts, cfg.pkg, ch, store.pose)
    else cpParts(parts, cfg.probe, ch, store.pose)
    fill(boxes.current, parts.boxes)
    fill(softBoxes.current, parts.softBoxes)
    fill(balls.current, parts.balls)
    const sm = segs.current
    if (sm) {
      parts.segs.forEach((s, i) => writeSegment(sm, i, s.a, s.b, s.r))
      sm.count = parts.segs.length
      sm.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={group} visible={false}>
      <instancedMesh ref={boxes} args={[GEO.box, strong, CAP]} frustumCulled={false} />
      <instancedMesh ref={softBoxes} args={[GEO.box, soft, 4]} frustumCulled={false} />
      <instancedMesh ref={segs} args={[GEO.cyl, strong, CAP]} frustumCulled={false} />
      <instancedMesh ref={balls} args={[GEO.sphere, strong, 4]} frustumCulled={false} />
    </group>
  )
}

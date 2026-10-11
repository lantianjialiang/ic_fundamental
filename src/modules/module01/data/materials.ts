import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Plane,
  SphereGeometry,
  Vector3,
  type MeshStandardMaterialParameters,
  type Texture,
} from 'three'
import { registerBoardFade } from './fade'
import { LB_SPEC, PC_SPEC, type Pkg } from './layout'
import {
  lbBottomTextures,
  lbCopperTexture,
  lbEdgeTextures,
  lbSectionTexture,
  lbTopTextures,
  pcCopperTexture,
  relayTopTexture,
} from './textures'

/**
 * 物体本身的物理材质（FR4 绿、沉金、铜、塑封、金属……），不跟随站点主题。
 * 全部是模块级单例，多个 mesh 共用以减少 shader / draw 状态切换。
 */

/** 「剖开」用的裁切面：保留 z ≤ constant 的部分；constant 很大 = 不剖 */
export const SECTION_PLANE = new Plane(new Vector3(0, 0, -1), 50)
export const SECTION_OFF = 50

function std(color: string, metalness: number, roughness: number, extra: MeshStandardMaterialParameters = {}) {
  return new MeshStandardMaterial({ color, metalness, roughness, ...extra })
}

function clipped<M extends MeshStandardMaterial>(mat: M): M {
  mat.clippingPlanes = [SECTION_PLANE]
  mat.clipShadows = true
  mat.side = DoubleSide
  return mat
}

function fr4(clearcoat = 0.6) {
  return new MeshPhysicalMaterial({
    color: '#1d6a3a',
    metalness: 0,
    roughness: 0.42,
    clearcoat,
    clearcoatRoughness: 0.25,
  })
}

export const MAT = {
  /** 测试头机壳：粉末喷涂深灰 */
  thShell: clipped(std('#4a515b', 0.35, 0.5)),
  paint: std('#4a515b', 0.35, 0.5),
  accent: std('#2c6cb0', 0.3, 0.4),
  steel: std('#b5bac1', 0.9, 0.32),
  steelClip: clipped(std('#b5bac1', 0.9, 0.32)),
  aluminum: std('#ccd1d7', 0.85, 0.28),
  aluminumClip: clipped(std('#ccd1d7', 0.85, 0.28)),
  /** Socket 壳体：黑色阳极氧化 */
  anodized: clipped(std('#24272c', 0.55, 0.42)),
  /** Socket 针板：Torlon / PEEK 工程塑料 */
  torlon: clipped(std('#8a5a2b', 0.05, 0.5)),
  pogoBlock: clipped(std('#1e2023', 0.1, 0.5)),
  /** 沉金（ENIG） */
  gold: std('#dcb45c', 1, 0.24),
  copper: std('#c8743f', 1, 0.35),
  solder: std('#c9ccd2', 0.95, 0.22),
  /** 环氧塑封料 */
  mold: std('#18191b', 0, 0.62),
  /** BGA 基板（BT 树脂） */
  bt: std('#3b4230', 0.05, 0.5),
  fr4Card: fr4(0.4),
  fr4Lb: fr4(),
  fr4Pc: fr4(),
  ceramic: std('#ebe5d8', 0, 0.55),
  ceramicClip: clipped(std('#ebe5d8', 0, 0.55)),
  epoxy: std('#3e2b17', 0.1, 0.35),
  tungsten: std('#a9afb6', 1, 0.28),
  nickel: std('#c6c9ce', 0.95, 0.2),
  groove: std('#2b2e33', 0.6, 0.5),
  rubber: std('#262626', 0, 0.9),
  mlcc: std('#b08a5e', 0, 0.6),
  cable: std('#2a2e35', 0.1, 0.7),
  silicon: new MeshPhysicalMaterial({
    color: '#59606e',
    metalness: 0.65,
    roughness: 0.16,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    iridescence: 0.6,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [180, 520],
  }),
  /** 实例着色用（颜色由 instanceColor 给） */
  trackWhite: std('#ffffff', 0.7, 0.35),
  plasticWhite: std('#ffffff', 0, 0.45),
  plasticWhiteClip: clipped(std('#ffffff', 0.05, 0.5)),
  scrub: std('#5a4a35', 0.3, 0.8),
  led: new MeshBasicMaterial({ color: '#3fd0ff', toneMapped: false }),
  ledGreen: new MeshBasicMaterial({ color: '#4ee08a', toneMapped: false }),
  /** 走线 / 过孔（实例着色），参与剖切 */
  trackClip: clipped(std('#ffffff', 0.7, 0.35)),
  /** 过孔孔壁电镀铜，参与剖切 */
  copperClip: clipped(std('#c8743f', 1, 0.3)),
  /** 牛角座 / 继电器塑壳 */
  plasticGray: std('#3a3e45', 0.05, 0.55),
  relayBody: std('#20252c', 0.05, 0.4),
}

registerBoardFade(MAT.fr4Lb)
registerBoardFade(MAT.fr4Pc)

/** Load Board 板体材质：四周侧面是叠层截面贴图，顶 / 底面是绿油 + 丝印 + 焊盘贴图；按封装缓存 */
type LbMaterials = { side: MeshStandardMaterial; top: MeshStandardMaterial; bottom: MeshStandardMaterial; cap: MeshStandardMaterial }
const lbCache = new Map<Pkg, LbMaterials>()
let lbSide: MeshStandardMaterial | null = null

export function lbMaterials(pkg: Pkg): LbMaterials {
  const hit = lbCache.get(pkg)
  if (hit) return hit
  if (!lbSide) {
    const t = lbEdgeTextures()
    lbSide = registerBoardFade(clipped(new MeshStandardMaterial({ map: t.map, roughnessMap: t.orm, metalnessMap: t.orm, roughness: 1, metalness: 1 })))
  }
  const top = lbTopTextures(pkg)
  const bottom = lbBottomTextures(pkg)
  const mats: LbMaterials = {
    side: lbSide,
    top: registerBoardFade(
      clipped(new MeshStandardMaterial({ map: top.map, roughnessMap: top.orm, metalnessMap: top.orm, roughness: 1, metalness: 1 })),
    ),
    bottom: registerBoardFade(
      clipped(new MeshStandardMaterial({ map: bottom.map, roughnessMap: bottom.orm, metalnessMap: bottom.orm, roughness: 1, metalness: 1 })),
    ),
    // 剖切截面：不随板子半透明变淡，剖开后一直看得清各层
    cap: new MeshStandardMaterial({ map: lbSectionTexture(pkg), roughness: 0.55, metalness: 0.15 }),
  }
  lbCache.set(pkg, mats)
  return mats
}

let relayTop: MeshStandardMaterial | null = null
export function relayTopMaterial(): MeshStandardMaterial {
  if (!relayTop) relayTop = new MeshStandardMaterial({ map: relayTopTexture(), roughness: 0.45, metalness: 0.05 })
  return relayTop
}

/**
 * PCB 分层展开用的铜层材质：贴图透明处挖空（alphaTest），露出下面的层。
 * GND / PWR 整片铜皮半透明，否则会把下面的信号层完全挡住。
 */
const copperCache = new Map<string, MeshStandardMaterial>()
export function copperSheetMaterial(key: string, map: Texture, plane: boolean): MeshStandardMaterial {
  const hit = copperCache.get(key)
  if (hit) return hit
  const mat = clipped(
    new MeshStandardMaterial({
      map,
      metalness: 0.7,
      roughness: 0.34,
      alphaTest: 0.3,
      transparent: plane,
      opacity: plane ? 0.62 : 1,
      depthWrite: !plane,
    }),
  )
  copperCache.set(key, mat)
  return mat
}

export function lbCopperMaterials(pkg: Pkg): MeshStandardMaterial[] {
  return LB_SPEC.layers.map((kind, i) => copperSheetMaterial(`lb-${pkg}-${i}`, lbCopperTexture(pkg, i), kind !== 'SIG'))
}

export function pcCopperMaterials(): MeshStandardMaterial[] {
  return PC_SPEC.layers.map((kind, i) => copperSheetMaterial(`pc-${i}`, pcCopperTexture(i), kind !== 'SIG'))
}

/** 探针卡分层展开时的阻焊面（两面可见，随板体一起半透明） */
export const PC_MASK_MAT = registerBoardFade(clipped(std('#1d6a3a', 0, 0.42)))

/** FR4 介质薄片：玻纤环氧本身是半透明的淡黄色 */
export const DIELECTRIC_MAT = clipped(
  new MeshStandardMaterial({ color: '#d2c184', roughness: 0.6, metalness: 0, transparent: true, opacity: 0.3, depthWrite: false }),
)

export const COPPER_COLOR = {
  top: '#dcb45c',
  inner: '#c8743f',
  bottom: '#8fa3b8',
  selected: '#ffd84a',
  dim: '#4b4136',
} as const

export const PULSE_COLOR = { out: '#ffc93c', back: '#3cc8ff' } as const

/** 共用的单位几何体（实例化时用 scale 调尺寸） */
export const GEO = {
  box: new BoxGeometry(1, 1, 1),
  cyl: new CylinderGeometry(1, 1, 1, 12),
  cyl6: new CylinderGeometry(1, 1, 1, 6),
  sphere: new SphereGeometry(1, 14, 10),
  cone: new CylinderGeometry(0, 1, 1, 10),
}

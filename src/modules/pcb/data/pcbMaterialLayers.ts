import { loc, type LText } from '../../../i18n/locale'

// 铜厚：1 oz 铜均匀铺在 1 平方英尺上 ≈ 35 µm
export const OZ_UM = 35
export const ozToUm = (oz: number) => oz * OZ_UM
export const OUTER_FOIL_OZ = 0.5
export const INNER_FOIL_OZ = 0.5
export const PLATING_UM = 20
export const OUTER_CU_UM = ozToUm(OUTER_FOIL_OZ) + PLATING_UM
export const INNER_CU_UM = ozToUm(INNER_FOIL_OZ)
export const MASK_UM = 25

export type LayerKind = 'silk' | 'mask' | 'finish' | 'cuOuter' | 'prepreg' | 'cuInner' | 'core'
export type StackId = 'two' | 'four'

/** 每种叠层从上到下出现的层种类（图例顺序）；图例顺序就是显示顺序 */
export const STACK_KINDS: Record<StackId, LayerKind[]> = {
  two: ['silk', 'mask', 'finish', 'cuOuter', 'core'],
  four: ['silk', 'mask', 'finish', 'cuOuter', 'prepreg', 'cuInner', 'core'],
}

export const STACK_OPTS: Array<{ id: StackId; label: LText }> = [
  { id: 'two', label: loc('2 层板', '2-layer board') },
  { id: 'four', label: loc('4 层板', '4-layer board') },
]

// 介质厚度（mm）：芯板 / 半固化片；示意取值，使整板约 1.6 mm
const CORE_MM: Record<StackId, number> = { two: 1.45, four: 1.0 }
const PREPREG_MM = 0.2

/** 整板厚度估算（mm）：介质 + 铜 + 两面阻焊，不含丝印 */
export function totalMm(stack: StackId): number {
  const cu = 2 * (OUTER_CU_UM / 1000)
  const mask = 2 * (MASK_UM / 1000)
  if (stack === 'two') {
    return CORE_MM.two + cu + mask
  }
  return CORE_MM.four + 2 * PREPREG_MM + cu + 2 * (INNER_CU_UM / 1000) + mask
}

export type LayerInfo = {
  id: LayerKind
  name: LText
  mat: LText
  thick: (s: StackId) => LText
  /** 图例里的一行短厚度 */
  tag: (s: StackId) => LText
  role: LText
}

const fixed = (t: LText) => (): LText => t

export const LAYERS: LayerInfo[] = [
  {
    id: 'silk',
    name: loc('丝印字符', 'Silkscreen'),
    mat: loc('白色环氧基油墨，丝网印刷或喷墨打印。', 'White epoxy-based ink, screen printed or inkjet printed.'),
    thick: fixed(loc('约 15–25 µm。', '≈ 15–25 µm.')),
    tag: fixed(loc('约 15–25 µm', '≈ 15–25 µm')),
    role: loc(
      '标出位号、极性、1 脚、板名和版本，装配和维修时靠它找元件。它不导电也不可焊，所以不能盖住焊盘，否则那个焊盘就焊不上。',
      'Marks designators, polarity, pin 1, board name and revision so people can find parts during assembly and repair. The ink is neither conductive nor solderable, so it must not cover a pad or that pad cannot be soldered.',
    ),
  },
  {
    id: 'mask',
    name: loc('阻焊', 'Solder mask'),
    mat: loc('液态感光（LPI）环氧油墨，常见绿色，也有黑、白、红、蓝。', 'Liquid photoimageable (LPI) epoxy ink, usually green; black, white, red and blue also exist.'),
    thick: fixed(loc(`铜面上约 20–30 µm，铜边角处更薄。`, `≈ 20–30 µm over copper, thinner at copper edges.`)),
    tag: fixed(loc('约 20–30 µm', '≈ 20–30 µm')),
    role: loc(
      '只在焊盘处开窗，其余铜都盖住：焊锡不会在细间距焊盘之间桥连，铜不会受潮氧化，相邻走线之间也多一层绝缘。',
      'Opens only over the pads and covers the rest of the copper: solder cannot bridge fine-pitch pads, copper stays clear of moisture and oxidation, and neighbouring traces get an extra layer of insulation.',
    ),
  },
  {
    id: 'finish',
    name: loc('表面处理（焊盘镀层）', 'Surface finish (pad plating)'),
    mat: loc(
      '图中画的是 ENIG：镍层 + 很薄的金层。也可以换成 HASL、OSP、沉银、沉锡。',
      'Drawn here as ENIG: a nickel layer plus a very thin gold layer. It could instead be HASL, OSP, immersion silver or immersion tin.',
    ),
    thick: fixed(loc('ENIG：镍约 3–6 µm + 金约 0.05–0.1 µm。', 'ENIG: nickel ≈ 3–6 µm + gold ≈ 0.05–0.1 µm.')),
    tag: fixed(loc('Ni 3–6 µm + Au 0.05–0.1 µm', 'Ni 3–6 µm + Au 0.05–0.1 µm')),
    role: loc(
      '只盖在阻焊开窗露出的铜焊盘上：防止裸铜氧化，保证焊接时焊锡能润湿。其余铜已经被阻焊盖住，所以不需要这一层。',
      'Covers only the copper pads exposed by the mask openings: it stops bare copper oxidising and lets solder wet the pad. The rest of the copper is under mask and needs no finish.',
    ),
  },
  {
    id: 'cuOuter',
    name: loc('外层铜 + 电镀', 'Outer copper + plating'),
    mat: loc(
      '电解铜箔（常见 0.5 oz 基铜），再加上孔化电镀铜；和孔壁镀铜是同一次电镀。',
      'Electrodeposited copper foil (commonly 0.5 oz base) plus electroplated copper, deposited in the same plating step that lines the holes.',
    ),
    thick: fixed(
      loc(
        `基铜 ${ozToUm(OUTER_FOIL_OZ)} µm + 电镀约 ${PLATING_UM} µm，成品约 ${Math.round(OUTER_CU_UM)} µm（接近 1 oz）。`,
        `${ozToUm(OUTER_FOIL_OZ)} µm base foil + ≈ ${PLATING_UM} µm plating, finished ≈ ${Math.round(OUTER_CU_UM)} µm (close to 1 oz).`,
      ),
    ),
    tag: fixed(loc(`约 ${Math.round(OUTER_CU_UM)} µm`, `≈ ${Math.round(OUTER_CU_UM)} µm`)),
    role: loc(
      '做走线、焊盘和铜皮。电镀把孔壁和外层表面一起加厚，所以外层成品比基铜厚；这也是外层线宽要比内层放宽一点的原因。',
      'Forms traces, pads and pours. Plating thickens the hole walls and the outer surface together, so finished outer copper is thicker than the base foil, which is why outer-layer trace widths need a little more margin than inner ones.',
    ),
  },
  {
    id: 'prepreg',
    name: loc('半固化片（Prepreg，PP）', 'Prepreg (PP)'),
    mat: loc('玻纤布浸渍未完全固化（B 阶段）的环氧树脂，不带铜。', 'Glass cloth impregnated with partly cured (B-stage) epoxy, no copper.'),
    thick: fixed(loc('压合后每张约 0.05–0.2 mm（常见 106、1080、2116、7628 玻纤布）。', 'After pressing ≈ 0.05–0.2 mm per ply (common glass styles 106, 1080, 2116, 7628).')),
    tag: fixed(loc('约 0.05–0.2 mm', '≈ 0.05–0.2 mm')),
    role: loc(
      '压合时受热变软，流进内层线路之间的空隙，再固化成硬的绝缘层，把芯板和外层铜粘在一起；它的厚度决定层间距，也就决定阻抗。',
      'Softens under heat and pressure, flows into the gaps between inner traces and then cures hard, bonding the core to the outer copper; its thickness sets the layer spacing and therefore the impedance.',
    ),
  },
  {
    id: 'cuInner',
    name: loc('内层铜', 'Inner copper'),
    mat: loc('电解铜箔，蚀刻成走线或整片平面；内层不电镀，只有过孔孔壁才镀铜。', 'ED copper foil etched into traces or solid planes; inner layers are not plated, only the via barrels are.'),
    thick: fixed(loc(`${ozToUm(INNER_FOIL_OZ)} µm（0.5 oz），也有 1 oz。`, `${ozToUm(INNER_FOIL_OZ)} µm (0.5 oz); 1 oz is also used.`)),
    tag: fixed(loc(`约 ${ozToUm(INNER_FOIL_OZ)} µm`, `≈ ${ozToUm(INNER_FOIL_OZ)} µm`)),
    role: loc(
      '四层板里常作 GND 和电源平面，给外层高速信号当回流参考。内层铜离板边要缩进约 0.2–0.5 mm，免得铣边时把铜露出来。',
      'In a 4-layer board these carry GND and power planes and give outer-layer signals a return reference. Inner copper is pulled back about 0.2–0.5 mm from the board edge so routing does not expose it.',
    ),
  },
  {
    id: 'core',
    name: loc('芯板（Core）', 'Core'),
    mat: loc('FR-4：玻纤布 + 完全固化（C 阶段）环氧树脂，两面覆铜。', 'FR-4: glass cloth + fully cured (C-stage) epoxy, copper-clad on both sides.'),
    thick: (s) => (s === 'two' ? loc('约 1.4–1.5 mm；两层板整块板就靠它撑起来。', '≈ 1.4–1.5 mm; in a 2-layer board it carries the whole board.') : loc('约 0.8–1.0 mm。', '≈ 0.8–1.0 mm.')),
    tag: (s) => (s === 'two' ? loc('约 1.4–1.5 mm', '≈ 1.4–1.5 mm') : loc('约 0.8–1.0 mm', '≈ 0.8–1.0 mm')),
    role: loc(
      '整块板的骨架：提供机械强度和绝缘。它已经完全固化，压合时不再流动，所以位置和厚度稳定。',
      'The skeleton of the board: it gives mechanical strength and insulation. It is already fully cured and does not flow in lamination, so its position and thickness stay stable.',
    ),
  },
]

export const LAYER_BY_ID = (id: LayerKind): LayerInfo => LAYERS.find((l) => l.id === id) ?? LAYERS[0]

/** 侧栏 / 卡片用的一条说明：材料、厚度、作用 */
export function layerNote(info: LayerInfo, stack: StackId): LText {
  const th = info.thick(stack)
  return loc(
    `材料：${info.mat.zh} 典型厚度：${th.zh} 作用：${info.role.zh}`,
    `Material: ${info.mat.en} Typical thickness: ${th.en} Role: ${info.role.en}`,
  )
}

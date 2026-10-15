import { loc, type LText } from '../../../i18n/locale'
import { ozToUm } from './pcbMaterialLayers'

export const RHO_CU = 1.72e-8

export type OzId = 'half' | 'one' | 'two'

/** minMm：典型最小线宽 / 间距（示意参数），铜越厚侧蚀越多，只能放宽 */
export const OZ_OPTS: Array<{ id: OzId; oz: number; label: LText; minMm: number; use: LText; why: LText }> = [
  {
    id: 'half',
    oz: 0.5,
    label: loc('0.5 oz', '0.5 oz'),
    minMm: 0.075,
    use: loc('细间距信号层、内层、高密度板。', 'Fine-pitch signal layers, inner layers and dense boards.'),
    why: loc(
      '铜薄，蚀刻时侧蚀的深度小，所以能蚀出更细的线；代价是线路电阻大、载流小。',
      'Thin copper means the etchant undercuts less, so finer lines are possible; the price is higher trace resistance and lower current capacity.',
    ),
  },
  {
    id: 'one',
    oz: 1,
    label: loc('1 oz', '1 oz'),
    minMm: 0.1,
    use: loc('最常见的外层成品铜厚，通用数字和模拟板。', 'The most common finished outer copper weight, for general digital and analogue boards.'),
    why: loc(
      '铜厚 35 µm，电阻和线宽取得比较平衡，大多数板厂都按它报标准价。',
      'At 35 µm, resistance and achievable line width are balanced, and most fabs quote their standard price at this weight.',
    ),
  },
  {
    id: 'two',
    oz: 2,
    label: loc('2 oz', '2 oz'),
    minMm: 0.2,
    use: loc('电源、电机驱动、大电流母线。', 'Power supplies, motor drives and high-current buses.'),
    why: loc(
      '铜厚 70 µm，同样线宽能过的电流约翻倍、发热更少；但蚀刻要蚀得更深，侧蚀更多，所以最小线宽线距要放大，价格也更高。',
      'At 70 µm the same width carries about twice the current with less heating; but the etch is deeper with more undercut, so minimum trace and space must grow and the price rises.',
    ),
  },
]

export const sheetMohm = (oz: number): number => (RHO_CU / (ozToUm(oz) * 1e-6)) * 1000

/** 1 mm 宽、100 mm 长 = 100 个方块 */
export const traceMohm = (oz: number): number => sheetMohm(oz) * 100

export type FoilId = 'ed' | 'ra'

export const FOIL_OPTS: Array<{ id: FoilId; label: LText; make: LText; grain: LText; bend: LText; cost: LText; use: LText }> = [
  {
    id: 'ed',
    label: loc('电解铜（ED）', 'Electrodeposited (ED)'),
    make: loc('在电解液里让铜离子沉积到旋转的钛辊上，一层层长出来再撕下，成卷。', 'Copper ions deposit onto a rotating titanium drum in an electrolyte, grow layer by layer and are peeled off as a roll.'),
    grain: loc('晶粒像竖起的柱子，垂直于板面；朝树脂的一面有粗糙的“牙齿”。', 'Grains stand up like columns, perpendicular to the board; the side facing the resin has rough “teeth”.'),
    bend: loc('反复弯折时，柱状晶界容易沿垂直方向裂开，所以只适合硬板或只弯一次的场合。', 'Under repeated bending the columnar grain boundaries crack through the thickness, so it suits rigid boards or one-time bends.'),
    cost: loc('便宜，几乎所有硬板都用。', 'Cheap, used in almost every rigid board.'),
    use: loc('硬板的内层和外层。', 'Inner and outer layers of rigid boards.'),
  },
  {
    id: 'ra',
    label: loc('压延退火铜（RA）', 'Rolled-annealed (RA)'),
    make: loc('把铜锭反复轧成薄片，再退火消除内应力。', 'A copper ingot is rolled repeatedly into foil and then annealed to relieve internal stress.'),
    grain: loc('晶粒被轧成扁平的片，平行于板面；两面都比较平整。', 'Grains are rolled flat and lie parallel to the board; both faces are fairly smooth.'),
    bend: loc('弯折时晶粒互相滑动而不是裂开，耐弯折次数远高于 ED，所以软板选它。', 'Under bending the flat grains slide over each other instead of cracking, so it survives far more bends than ED, which is why flex boards choose it.'),
    cost: loc('更贵，供货规格也少。', 'Costlier, with fewer available grades.'),
    use: loc('软板（FPC）、需要动态弯折的排线。', 'Flex circuits (FPC) and cables that bend dynamically.'),
  },
]

export const LAM_OPTS: Array<{ id: 'before' | 'after'; label: LText }> = [
  { id: 'before', label: loc('压合前', 'Before pressing') },
  { id: 'after', label: loc('压合后', 'After pressing') },
]

export const LAM_COMPARE: Array<{ k: LText; pp: LText; core: LText }> = [
  { k: loc('有没有铜', 'Has copper?'), pp: loc('没有', 'No'), core: loc('两面都有', 'Both faces') },
  { k: loc('树脂状态', 'Resin state'), pp: loc('半固化（B 阶段），受热会流动', 'Partly cured (B-stage), flows when heated'), core: loc('完全固化（C 阶段），不再流动', 'Fully cured (C-stage), no longer flows') },
  { k: loc('在板子里的作用', 'Role in the board'), pp: loc('粘合层 + 层间绝缘', 'Bonding layer + insulation'), core: loc('骨架 + 做内层线路', 'Skeleton + carries inner traces') },
  { k: loc('厚度怎么定', 'How thickness is set'), pp: loc('选玻纤布型号和张数', 'Choose glass style and ply count'), core: loc('选标准芯板厚度', 'Choose a standard core thickness') },
]

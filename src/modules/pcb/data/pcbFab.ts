import { loc, type LText } from '../../../i18n/locale'
import { STEP_ORDER, type StepId } from './pcbFabModel'
import { DEFECTS_A, type FabDefect } from './pcbFabDefects'
import { DEFECTS_B } from './pcbFabDefects2'
import { ETCH, RULE, etchCheck, minDam, minDrill, minEdge, minInkClear, minPadGap, minRing } from './pcbFabRules'
import { STEPS_A, type FabStep } from './pcbFabSteps'
import { STEPS_B } from './pcbFabSteps2'

export { QUIZ } from './pcbFabQuiz'

export const S = {
  kickerStep: loc('制造工序', 'Process step'),
  kickerDefect: loc('常见缺陷', 'Common defect'),
  introTitle: loc('一块板是“加”和“减”出来的', 'A board is built by adding and removing'),
  flowTitle: loc('十三道工序：点时间轴，或逐帧播放', 'Thirteen steps: click the timeline, or play frame by frame'),
  flowNote: loc(
    '左边是横截面（沿右边俯视图上的 A–A 线剖开），右边是俯视图，两张图每一帧同步。示意：厚度夸张，内层和外层图形简化成同一组线路、过孔和两个焊盘。',
    'Left is the cross-section (cut along line A–A on the top view at right), right is the top view; both change together every frame. Illustrative: thickness is exaggerated, and the layers are simplified to the same traces, one via and two pads.',
  ),
  secLabel: loc('横截面 A–A', 'Cross-section A–A'),
  topLabel: loc('俯视图（顶层）', 'Top view (top layer)'),
  frame: loc('第', 'Frame'),
  prev: loc('上一帧', 'Back'),
  next: loc('下一帧', 'Next'),
  play: loc('自动播放', 'Play'),
  pause: loc('暂停', 'Pause'),
  reset: loc('重来', 'Reset'),
  scrub: loc('拖动选择帧', 'Drag to pick a frame'),
  timeline: loc('工序时间轴', 'Process timeline'),
  what: loc('做什么', 'What it does'),
  equip: loc('用什么设备', 'Equipment'),
  rule: loc('对设计的约束', 'Design constraint'),
  defectTitle: loc('这一步常见的缺陷', 'Typical defects in this step'),
  defectNote: loc('选一个缺陷，横截面上会圈出出问题的位置。', 'Pick a defect and the cross-section circles where it happens.'),
  cause: loc('原因：', 'Cause: '),
  effect: loc('后果：', 'Effect: '),
  fix: loc('对策：', 'Remedy: '),
  etchTitle: loc('为什么有最小线宽线距：蚀刻小实验', 'Why minimum trace and space exist: an etching experiment'),
  etchNote: loc(
    '图按 1 µm = 1 像素的真实比例画。示意参数：蚀刻因子 3，内层铜 18 µm，外层铜 50 µm（底铜加电镀），干膜厚 25 / 38 µm。各厂实际能力不同。',
    'Drawn at 1 µm = 1 pixel. Illustrative parameters: etch factor 3, inner copper 18 µm, outer copper 50 µm (foil plus plating), film 25 / 38 µm. Real capability differs per fab.',
  ),
  layerInner: loc('内层（18 µm 铜）', 'Inner layer (18 µm Cu)'),
  layerOuter: loc('外层（50 µm 铜）', 'Outer layer (50 µm Cu)'),
  compOff: loc('不做补偿', 'No compensation'),
  compOn: loc('厂里做蚀刻补偿', 'Fab compensates etch'),
  width: loc('设计线宽 W', 'Designed trace width W'),
  space: loc('设计线距 S', 'Designed space S'),
  undercut: loc('每边侧蚀 u', 'Undercut per side u'),
  topW: loc('蚀刻后线顶宽', 'Trace top width after etch'),
  baseGap: loc('线脚处线距', 'Space at trace foot'),
  minWS: loc('该层最小线宽 / 线距', 'Min trace / space here'),
  rulesTitle: loc('规则从哪来：一张对照表', 'Where the rules come from: one table'),
  rulesNote: loc('每个数字都是下面的公差加起来或除出来的，不是拍脑袋定的。', 'Every number is a sum or quotient of the tolerances below, not a guess.'),
  colStep: loc('工序', 'Step'),
  colRule: loc('规则', 'Rule'),
  colValue: loc('数值（示意）', 'Value (illustrative)'),
  colWhy: loc('原因', 'Why'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  next2: loc('下一课：供应链与 SMT 生产', 'Next: Supply chain and SMT assembly'),
  asideLater: loc('这些制造规则最后会变成设计规则检查，见 {@pcbDfm}；板子造好以后怎么贴片，见 {@pcbSupply}。', 'These manufacturing limits end up as design-rule checks, see {@pcbDfm}; how the finished board is assembled is in {@pcbSupply}.'),
}

export const INTRO: LText[] = [
  loc(
    '多层板不是“画好再印上去”，而是一层一层“加”和“减”：用光把图案印在感光膜上，再用药水把不要的铜蚀掉，反复很多次。这和 {@pSilicon} 里晶圆的光刻、刻蚀是同一个套路，只是尺度大了一千倍。',
    'A multilayer board is not “drawn and printed”; it is built by adding and removing, layer by layer: light prints a pattern into photosensitive film, chemistry etches away the copper you do not want, and the cycle repeats. It is the same pattern as lithography and etching on a wafer in {@pSilicon}, only about a thousand times larger.',
  ),
  loc(
    '这一课按顺序走完十三道工序：每一步做什么、用什么设备、常见缺陷，以及它给设计留下的限制。材料和叠层先看 {@pcbMaterial}、{@pcbStack}。',
    'This lesson walks all thirteen steps in order: what each does, which equipment, typical defects, and the limit it leaves for design. For materials and stack-up see {@pcbMaterial} and {@pcbStack} first.',
  ),
  loc(
    '为什么有最小线宽线距、最小孔径、孔到板边的距离？因为每条规则都是某道工序的物理极限。知道原因，才知道哪些能和厂家商量，哪些不能。规则最后怎么落到自查清单，见 {@pcbDfm}。',
    'Why do minimum trace and space, minimum drill and edge clearance exist? Because each rule is the physical limit of one process step. Knowing why tells you which can be negotiated with the fab and which cannot. How they land in the self-check list is in {@pcbDfm}.',
  ),
]

export const STEPS: FabStep[] = [...STEPS_A, ...STEPS_B].sort((a, b) => STEP_ORDER.indexOf(a.id) - STEP_ORDER.indexOf(b.id))

export const SHORT: Record<StepId, LText> = {
  cut: loc('开料', 'Cut'),
  inner: loc('内层图形', 'Inner imaging'),
  etch: loc('蚀刻', 'Etch'),
  lam: loc('层压', 'Lamination'),
  drill: loc('钻孔', 'Drill'),
  plate: loc('沉铜电镀', 'Cu plating'),
  outer: loc('外层图形', 'Outer imaging'),
  mask: loc('阻焊', 'Solder mask'),
  legend: loc('字符', 'Legend'),
  finish: loc('表面处理', 'Finish'),
  route: loc('成型', 'Routing'),
  test: loc('电测', 'E-test'),
  final: loc('终检', 'Final QC'),
}

export function defectsOf(step: StepId): FabDefect[] {
  return DEFECTS_A[step] ?? DEFECTS_B[step] ?? []
}

export const MATERIALS: Array<{ id: string; label: LText }> = [
  { id: 'cu', label: loc('铜', 'Copper') },
  { id: 'core', label: loc('芯板', 'Core') },
  { id: 'pp', label: loc('半固化片', 'Prepreg') },
  { id: 'film', label: loc('干膜', 'Dry film') },
  { id: 'sn', label: loc('锡', 'Tin') },
  { id: 'mask', label: loc('阻焊', 'Solder mask') },
  { id: 'ink', label: loc('字符油墨', 'Legend ink') },
  { id: 'ni', label: loc('镍', 'Nickel') },
  { id: 'au', label: loc('金', 'Gold') },
]

export const RULE_ROWS: Array<{ step: LText; rule: LText; value: string; why: LText }> = [
  {
    step: loc('蚀刻', 'Etch'),
    rule: loc('最小线宽 / 线距（内层）', 'Min trace / space (inner)'),
    value: `${etchCheck('inner', 100, 100, false).minW.toFixed(0)} / ${etchCheck('inner', 100, 100, false).minS.toFixed(0)} µm`,
    why: loc('侧蚀 = 铜厚 ÷ 蚀刻因子；干膜分辨率 ≈ 2 × 膜厚', 'Undercut = copper ÷ etch factor; film resolution ≈ 2 × thickness'),
  },
  {
    step: loc('蚀刻', 'Etch'),
    rule: loc('最小线宽 / 线距（外层）', 'Min trace / space (outer)'),
    value: `${etchCheck('outer', 100, 100, false).minW.toFixed(0)} / ${etchCheck('outer', 100, 100, false).minS.toFixed(0)} µm`,
    why: loc(`外层铜厚 ${ETCH.copper.outer} µm，侧蚀更大，缝要 ≥ 1.5 × 铜厚`, `Outer copper is ${ETCH.copper.outer} µm: more undercut, and the gap must be ≥ 1.5 × copper`),
  },
  {
    step: loc('钻孔', 'Drill'),
    rule: loc('最小孔径', 'Minimum drill'),
    value: `${minDrill.toFixed(2)} mm`,
    why: loc(`板厚 ${RULE.boardMm} mm ÷ 纵横比 ${RULE.arMax}:1`, `Board ${RULE.boardMm} mm ÷ aspect ratio ${RULE.arMax}:1`),
  },
  {
    step: loc('钻孔', 'Drill'),
    rule: loc('孔环', 'Annular ring'),
    value: `≥ ${minRing.toFixed(3)} mm`,
    why: loc(`钻孔偏差 ${RULE.drillPosTol} + 层间对位 ${RULE.layerRegTol} mm`, `Drill error ${RULE.drillPosTol} + layer registration ${RULE.layerRegTol} mm`),
  },
  {
    step: loc('阻焊', 'Mask'),
    rule: loc('阻焊坝 / 焊盘边距', 'Dam / pad gap'),
    value: `${minDam.toFixed(2)} / ${minPadGap.toFixed(2)} mm`,
    why: loc(`坝要 ≥ ${minDam.toFixed(2)}，两边开窗各让 ${RULE.maskExpansion} mm`, `Dam ≥ ${minDam.toFixed(2)}, and each opening takes ${RULE.maskExpansion} mm per side`),
  },
  {
    step: loc('字符', 'Legend'),
    rule: loc('字符到焊盘', 'Legend to pad'),
    value: `≥ ${minInkClear.toFixed(2)} mm`,
    why: loc('丝印对位偏差；油墨盖住焊盘就焊不上', 'Print registration error; ink on a pad blocks soldering'),
  },
  {
    step: loc('成型', 'Route'),
    rule: loc('铜到板边', 'Copper to board edge'),
    value: `≥ ${minEdge.toFixed(2)} mm`,
    why: loc(`铣刀公差 ${RULE.routeTol} + 毛刺和露铜余量 ${RULE.edgeMargin} mm`, `Router tolerance ${RULE.routeTol} + burr and exposure margin ${RULE.edgeMargin} mm`),
  },
]

export const TAKEAWAY: LText[] = [
  loc('内层是“贴膜 → 曝光 → 显影 → 蚀刻 → 退膜 → AOI”，之后才压成一块；压合后内层就不能再修。', 'The inner layer goes film → expose → develop → etch → strip → AOI and only then is pressed into one block; after lamination it cannot be repaired.'),
  loc('蚀刻会侧蚀，侧蚀 = 铜厚 ÷ 蚀刻因子，所以有最小线宽线距；外层铜更厚，下限更大。', 'Etching undercuts, by copper thickness ÷ etch factor, which is why minimum trace and space exist; thicker outer copper raises the limit.'),
  loc('孔环 = 钻孔偏差 + 层间对位偏差；最小孔径 = 板厚 ÷ 纵横比。孔壁铜靠“除胶渣 → 化学沉铜 → 电镀”得到。', 'Annular ring = drill error + layer registration error; minimum drill = board thickness ÷ aspect ratio. Wall copper comes from desmear → electroless copper → plating.'),
  loc('外层用图形电镀和锡保护：只在线路和孔里加铜，锡挡住蚀刻液，再退锡。', 'The outer layer uses pattern plating with tin as resist: copper is added only on circuit and in holes, tin shields it from the etchant, and is then stripped.'),
  loc('阻焊坝、字符不压焊盘、铜到板边的距离，都是对位公差加出来的，不是随便定的。', 'Mask dam, no legend on pads and copper-to-edge distance are all sums of registration tolerances, not arbitrary values.'),
]

export const FIGL = {
  uv: loc('UV 光', 'UV light'),
  art: loc('底片 / LDI', 'Artwork / LDI'),
  etchant: loc('蚀刻液', 'Etchant'),
  heat: loc('热 + 压', 'Heat + force'),
  bit: loc('钻头', 'Drill bit'),
  router: loc('铣刀', 'Router'),
  probe: loc('探针', 'Probes'),
  bake: loc('烘烤', 'Bake'),
  aoi: loc('AOI 相机', 'AOI camera'),
  ink: loc('字符', 'Legend'),
  dam: loc('阻焊坝', 'Dam'),
  ring: loc('孔环', 'Annular ring'),
  film: loc('干膜', 'Dry film'),
  maskInk: loc('阻焊油墨', 'Mask ink'),
  niAu: loc('镍 + 金', 'Ni + Au'),
  foil: loc('铜箔', 'Foil'),
  pp: loc('半固化片', 'Prepreg'),
  core: loc('芯板', 'Core'),
}

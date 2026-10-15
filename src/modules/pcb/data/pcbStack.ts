import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerWhy: loc('层数的理由', 'Why this many layers'),
  kickerStack: loc('叠层', 'Stack-up'),
  kickerVia: loc('过孔类型', 'Via type'),
  kickerTerm: loc('孔的结构', 'Hole anatomy'),
  introTitle: loc('一块板子为什么是 2、4 或 6 层', 'Why a board has 2, 4 or 6 layers'),
  whyTitle: loc('选层数：成本、布线密度、参考平面', 'Choosing the layer count: cost, routing density, reference planes'),
  whyNote: loc(
    '点开四个理由，再看下面的对比表。表里的价格是教学用的相对指数（示意参数），只看趋势。',
    'Open the four reasons, then read the table below. Prices are relative teaching indices (illustrative), so read the trend only.',
  ),
  tableLayers: loc('层数', 'Layers'),
  tableSig: loc('信号层', 'Signal layers'),
  tablePlane: loc('平面层', 'Plane layers'),
  tableCost: loc('相对价格', 'Relative price'),
  tableUse: loc('常见用途', 'Typical use'),
  tableCap: loc(
    '平面层数和信号层数由右边的叠层算出；价格指数 = 1 + 0.4 × (层数 − 2)，是示意参数，不是报价。',
    'Plane and signal counts are counted from the stack-ups on this page; price index = 1 + 0.4 × (layers − 2), an illustrative parameter and not a quote.',
  ),
  stackTitle: loc('叠层 3D 爆炸图：旋转、展开、看过孔穿过哪几层', 'Exploded 3D stack-up: rotate, explode, see which layers a via crosses'),
  stackNote: loc(
    '拖动图旋转、滚轮缩放。切换层数，拖动滑块把各层拉开，再打开下面的过孔，看它实际穿过哪几层。示意：层间距是等距的，实际外层介质更薄。',
    'Drag to rotate, scroll to zoom. Switch the layer count, drag the slider to pull the layers apart, then switch on a via to see which layers it really crosses. Illustrative: layer spacing is equal here; real outer dielectrics are thinner.',
  ),
  explode: loc('展开', 'Explode'),
  viaToggles: loc('显示过孔：', 'Show vias: '),
  unavailable: loc('（这种叠层没有）', '(not on this stack)'),
  spans: loc('跨越：', 'Spans: '),
  noGl: loc(
    '这个浏览器没有开启 WebGL，3D 图无法显示。下面的二维截面图画的是同样的内容。',
    'WebGL is not available in this browser, so the 3D view cannot be shown. The 2D cross-sections below show the same content.',
  ),
  viewAria: loc('可旋转的 PCB 叠层 3D 视图', 'Rotatable 3D view of the PCB stack-up'),
  layerList: loc('这一叠的层：', 'Layers of this stack: '),
  dielLabel: loc('介质：', 'Dielectrics: '),
  coreWord: loc('芯板 Core', 'Core'),
  ppWord: loc('半固化片 PP', 'Prepreg PP'),
  whyArr: loc('为什么这样排：', 'Why this arrangement: '),
  useLabel: loc('常见用途：', 'Typical use: '),
  viaTitle: loc('过孔类型：通孔、盲孔、埋孔、微孔', 'Via types: through, blind, buried, micro'),
  viaNote: loc(
    '点图里的一列，或点下面的卡片。图是 6 层板的截面（示意：厚度夸张），每种过孔只画到它真正到达的层。',
    'Click a column in the figure or a card below. The figure is a 6-layer cross-section (illustrative: thickness exaggerated), and each via is drawn only down to the layers it actually reaches.',
  ),
  viaCap: loc(
    '6 层板截面：Sig / GND / Sig / PWR / GND / Sig。通孔穿过 GND 和 PWR 时，那些平面在它周围挖出反焊盘。',
    '6-layer cross-section: Sig / GND / Sig / PWR / GND / Sig. Where the through via passes GND and PWR, those planes have an antipad cut around it.',
  ),
  viaWhere: loc('用在哪里：', 'Where it is used: '),
  viaCost: loc('代价：', 'Cost: '),
  termTitle: loc('焊盘、孔环、反焊盘、热焊盘', 'Pad, annular ring, antipad and thermal relief'),
  termNote: loc(
    '点图里的形状，或点下面的卡片。左边是截面，右边是 L2 地层的俯视；尺寸是示意的典型值。',
    'Click a shape in the figure or a card below. Left is a cross-section; right are top views of the L2 ground layer. Dimensions are illustrative typical values.',
  ),
  termCap: loc(
    '一个信号过孔穿过 GND 和 PWR 平面（各有反焊盘），一个地过孔连到 GND 平面（接 GND 层，PWR 层仍要避让）。',
    'A signal via passes the GND and PWR planes (each with an antipad); a ground via joins the GND plane but must still clear the PWR plane.',
  ),
  termRule: loc('常见规则：', 'Common rule: '),
  takeawayTitle: loc('带走的要点', 'Takeaways'),
  quizTitle: loc('小测验', 'Quiz'),
  quizNote: loc('5 题，选择一个答案。', 'Five questions; pick one answer each.'),
  next: loc('下一课：PCB 制造流程', 'Next: How a PCB Is Made'),
  asideLater: loc(
    '材料和铜厚见 {@pcbMaterial}；叠层怎样压出来、孔怎样钻和镀见 {@pcbFab}；测试用的 Load Board 就是一块多层板，见 {@connection}；这些结构在布线时的用法见 {@pcbLayout}，线宽和阻抗见 {@pcbBasics}。',
    'Materials and copper weight are in {@pcbMaterial}; how the stack is pressed and the holes drilled and plated is in {@pcbFab}; the test load board is itself a multilayer board, see {@connection}; how these structures are used when routing is in {@pcbLayout}, and trace width and impedance are in {@pcbBasics}.',
  ),
}

export const INTRO: LText[] = [
  loc(
    '一块 PCB 里的铜层数，是在三件事之间取舍：花多少钱、线能不能布得下、信号下面有没有一块完整的参考平面。层数越多，布线空间越大、信号越干净，但板越贵、越厚，工序也越多。',
    'The number of copper layers in a PCB balances three things: what it costs, whether the traces fit, and whether each signal has a continuous reference plane under it. More layers give more routing room and cleaner signals, but the board costs more, gets thicker and needs more process steps.',
  ),
  loc(
    '这一课先讲层数怎么选，再用一个 3D 爆炸图看 2、4、6 层的叠法，然后讲过孔怎样把不同的层连起来，最后讲孔本身的几个名词：焊盘、孔环、反焊盘。材料（FR-4、铜箔）先看 {@pcbMaterial}。',
    'This lesson first explains how to pick the layer count, then uses an exploded 3D view of 2-, 4- and 6-layer stack-ups, then shows how vias join the layers, and finally names the parts of a hole: pad, annular ring and antipad. For the materials (FR-4, copper foil) see {@pcbMaterial} first.',
  ),
  loc(
    '测试里用到的 Load Board 和探针卡就是多层板：几十路信号加电源和地，层数往往到 8 层以上，见 {@connection}。',
    'The load boards and probe cards used in testing are multilayer boards: dozens of signals plus power and ground often need eight or more layers, see {@connection}.',
  ),
]

export type WhyId = 'cost' | 'density' | 'plane' | 'even'
export const WHY: Array<{ id: WhyId; title: LText; sub: LText; text: LText }> = [
  {
    id: 'cost',
    title: loc('成本', 'Cost'),
    sub: loc('层数越多越贵', 'More layers cost more'),
    text: loc(
      '每多一对内层，就多一块芯板、多一次内层图形转移和蚀刻、多一次压合和对位，良率也会随工序变多而下降，所以板价大致随层数一步步往上走（见 {@pcbFab}）。能用 2 层做好的板不要为了好看加层；但 2 层板为了绕线把板做大，有时反而比 4 层更贵。',
      'Each extra inner pair adds a core, another inner-layer imaging and etching pass, and more pressing and registration, and yield falls as the steps pile up, so price climbs roughly step by step with layer count (see {@pcbFab}). Do not add layers just because; but a 2-layer board enlarged to make room for routing can end up costing more than a 4-layer one.',
    ),
  },
  {
    id: 'density',
    title: loc('布线密度', 'Routing density'),
    sub: loc('线多了就要换层', 'More nets need more layers'),
    text: loc(
      '线的数量大、芯片引脚多（比如 BGA）时，一层放不下，信号只能换层走，过孔也就多了。多一层信号层，就多一层可以走线的面积；BGA 中间的球还要靠内层引出来，4 层板放不下的 BGA 常常要升到 6 层。',
      'When there are many nets and many pins (a BGA for example), one layer cannot hold them and signals must change layers, which means more vias. Each added signal layer is more area to route on, and the middle balls of a BGA have to escape on inner layers, so a BGA that does not fit on 4 layers often forces 6.',
    ),
  },
  {
    id: 'plane',
    title: loc('参考平面', 'Reference planes'),
    sub: loc('完整的地和电源', 'Solid ground and power'),
    text: loc(
      '高速信号的电流要沿着正下方的平面回到源头，平面越完整、离信号越近，回路面积越小，辐射和串扰越低，线的阻抗也才稳定（见 {@pcbBasics}）。2 层板没有内层可以专门做平面，4 层起就能给信号一层整块的地，这是 4 层板最大的好处。',
      'The current of a fast signal returns to its source along the plane directly beneath it; the more solid that plane and the closer to the trace, the smaller the loop, the lower the radiation and crosstalk, and the steadier the impedance (see {@pcbBasics}). A 2-layer board has no inner layer to dedicate to a plane, while 4 layers can give the signals one solid ground, which is the main benefit of a 4-layer board.',
    ),
  },
  {
    id: 'even',
    title: loc('为什么常是偶数', 'Why layer counts are even'),
    sub: loc('对称压合', 'Symmetric lamination'),
    text: loc(
      '板子由芯板（Core）和半固化片（PP）压成，通常两面对称才不容易翘曲。3、5 层板要少放一层铜，结构不对称，制造时反而要加一层空铜，成本和 4、6 层相差不大，所以设计成偶数层更划算、更平整。',
      'A board is pressed from cores and prepreg, and it stays flat only if it is built symmetrically. A 3- or 5-layer board leaves out one copper layer and is unbalanced, so the fab often adds a dummy layer anyway and the price ends up close to 4 or 6 layers; designing an even count is cheaper and flatter.',
    ),
  },
]

export const TAKEAWAY: LText[] = [
  loc(
    '选层数先问三件事：钱、线放不放得下、信号下面有没有整块参考平面；板上有高速信号或 BGA 时，4 层起步。',
    'Choose the layer count by asking three things: cost, whether the traces fit, and whether each signal has a solid reference plane; with fast signals or a BGA, start at 4 layers.',
  ),
  loc(
    '叠层的口诀：每一层信号都紧邻一个平面，信号层不要相邻；4 层是 Sig/GND/PWR/Sig（或 Sig/GND/GND/Sig），6 层常用 Sig/GND/Sig/PWR/GND/Sig。原因是这样回流路径最短、串扰最小。',
    'The stack-up rule: every signal layer sits next to a plane and signal layers are not adjacent; 4 layers are Sig/GND/PWR/Sig (or Sig/GND/GND/Sig) and 6 layers commonly Sig/GND/Sig/PWR/GND/Sig, because that keeps return paths shortest and crosstalk lowest.',
  ),
  loc(
    '过孔按两端分：通孔连全板，盲孔从外层到内层，埋孔只连内层，微孔是激光打的、只跨一层；越不贯穿越贵，因为要分次压合或激光钻孔。',
    'Vias are named by their ends: through goes all the way, blind runs from an outer layer to an inner one, buried joins inner layers only, and a microvia is laser-drilled across one layer; the less a via goes through, the more it costs, because it needs sequential lamination or laser drilling.',
  ),
  loc(
    '孔环不够会钻破焊盘导致开路；信号过孔穿过平面时平面要挖反焊盘，否则信号会短路到平面；焊盘接大铜皮时用热焊盘，焊接时才不会散热太快。',
    'A thin annular ring lets the drill break out of the pad and open the connection; a signal via crossing a plane needs an antipad, or it shorts to the plane; a pad on a large pour uses thermal relief so it does not lose heat too fast during soldering.',
  ),
]

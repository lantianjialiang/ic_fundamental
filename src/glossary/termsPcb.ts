import { loc } from '../i18n/locale'
import type { GlossaryTerm } from './terms'

/** PCB 入门（L 轨）的术语。和已有词条重名的概念（如 netlist）另起 id，避免覆盖数字测试里的释义。 */
export const PCB_TERMS: GlossaryTerm[] = [
  {
    id: 'pcb',
    term: 'PCB',
    name: loc('印制电路板', 'Printed circuit board'),
    def: loc(
      '用覆铜板做成的、把元器件连起来的板子，同时负责固定和散热。L 轨从 {@pcbIntro} 开始。',
      'A board made from copper-clad laminate that connects components electrically, holds them mechanically and helps carry heat away. The PCB track starts at {@pcbIntro}.',
    ),
    lessons: ['pcbIntro'],
  },
  {
    id: 'fr4',
    term: 'FR-4',
    name: loc('FR-4 环氧玻纤板', 'FR-4 epoxy glass laminate'),
    def: loc(
      '最常用的板材：玻璃布浸环氧树脂。成本低、机械强度好，高频和高温下性能会下降。见 {@pcbMaterial}。',
      'The most common laminate: glass cloth in epoxy resin. Low cost and good mechanical strength, but performance drops at high frequency and high temperature. See {@pcbMaterial}.',
    ),
    lessons: ['pcbMaterial'],
  },
  {
    id: 'tg',
    term: 'Tg',
    name: loc('玻璃化转变温度', 'Glass transition temperature'),
    def: loc(
      '树脂从硬变软的温度。温度超过 Tg，板子膨胀更快，多次过炉容易分层，所以多次回流或高温场合要选高 Tg 板材。',
      'The temperature at which the resin turns from hard to soft. Above Tg the board expands faster and can delaminate after repeated reflow, so high-Tg laminates suit multiple reflows or hot environments.',
    ),
    lessons: ['pcbMaterial', 'pcbSupply'],
  },
  {
    id: 'dk-df',
    term: 'Dk / Df',
    name: loc('介电常数 / 损耗因子', 'Dielectric constant / loss tangent'),
    def: loc(
      'Dk 决定信号传播速度和阻抗，Df 决定信号损耗。高频信号要选 Dk 稳定、Df 小的板材。见 {@pcbMaterial}、{@pcbBasics}。',
      'Dk sets signal speed and impedance; Df sets loss. High-frequency signals need a stable Dk and a low Df. See {@pcbMaterial} and {@pcbBasics}.',
    ),
    lessons: ['pcbMaterial', 'pcbBasics'],
  },
  {
    id: 'copper-weight',
    term: 'Copper weight (oz)',
    name: loc('铜厚', 'Copper weight'),
    def: loc(
      '每平方英尺铜箔的重量，1 oz ≈ 35 µm。外层还要再镀铜，成品铜厚比箔厚。铜越厚，能过的电流越大，但细线越难蚀刻。',
      'Weight of copper per square foot: 1 oz ≈ 35 µm. Outer layers get extra plating, so the finished copper is thicker than the foil. Thicker copper carries more current but is harder to etch into fine lines.',
    ),
    lessons: ['pcbMaterial', 'pcbFab'],
  },
  {
    id: 'prepreg',
    term: 'Prepreg / Core',
    name: loc('半固化片 / 芯板', 'Prepreg / core'),
    def: loc(
      '芯板是两面覆铜、已经固化的板子；半固化片是没有完全固化的树脂片，压合时把各个芯板粘在一起。',
      'A core is a fully cured laminate with copper on both faces; prepreg is a partly cured resin sheet that bonds the cores together during lamination.',
    ),
    lessons: ['pcbStack'],
  },
  {
    id: 'stack-up',
    term: 'Stack-up',
    name: loc('叠层', 'Stack-up'),
    def: loc(
      '板子从上到下各层的顺序：信号层、地层、电源层等。叠层决定阻抗、回流路径和成本，层数一般取偶数。见 {@pcbStack}。',
      'The order of layers from top to bottom: signal, ground, power and so on. The stack-up sets impedance, return paths and cost; layer counts are usually even. See {@pcbStack}.',
    ),
    lessons: ['pcbStack', 'pcbBasics'],
  },
  {
    id: 'blind-via',
    term: 'Blind via',
    name: loc('盲孔', 'Blind via'),
    def: loc(
      '从外层钻到某一内层、不穿透整板的过孔，只能从一面看到。见 {@pcbStack}。',
      'A via that runs from an outer layer to an inner layer without going through the whole board; it is visible from one face only. See {@pcbStack}.',
    ),
    lessons: ['pcbStack'],
  },
  {
    id: 'buried-via',
    term: 'Buried via',
    name: loc('埋孔', 'Buried via'),
    def: loc(
      '只连接内层、两面都看不到的过孔。要在压合前先钻孔、电镀。',
      'A via that joins inner layers only and cannot be seen from either face. It is drilled and plated before lamination.',
    ),
    lessons: ['pcbStack'],
  },
  {
    id: 'annular-ring',
    term: 'Annular ring',
    name: loc('环宽', 'Annular ring'),
    def: loc(
      '孔周围留下的铜环宽度，等于（焊盘直径 − 孔径）÷ 2。环太窄，钻孔偏位时孔会破出焊盘，连接断开。',
      'The copper width around a hole: (pad diameter − hole diameter) ÷ 2. If it is too thin, a drill offset can break out of the pad and open the connection.',
    ),
    lessons: ['pcbStack', 'pcbFab'],
  },
  {
    id: 'antipad',
    term: 'Antipad',
    name: loc('反焊盘', 'Antipad'),
    def: loc(
      '平面层上挖出的圆孔，让穿过它的过孔不和平面短路。',
      'A clearance hole cut in a plane so that a via passing through it does not short to the plane.',
    ),
    lessons: ['pcbStack'],
  },
  {
    id: 'thermal-relief',
    term: 'Thermal relief',
    name: loc('花焊盘', 'Thermal relief'),
    def: loc(
      '焊盘与大面积铺铜之间只用几根细连线相连。焊接时热量不会一下子被铜面吸走，焊锡更容易润湿。',
      'A pad joined to a large copper pour by a few thin spokes. Heat is not drained away at once during soldering, so the solder wets the joint properly.',
    ),
    lessons: ['pcbBasics', 'pcbStack'],
  },
  {
    id: 'etch-factor',
    term: 'Etch factor',
    name: loc('蚀刻因子', 'Etch factor'),
    def: loc(
      '蚀刻时纵向深度与横向侧蚀之比。侧蚀让线顶比设计窄，线越细，相对损失越大。',
      'The ratio of vertical etch depth to lateral undercut. Undercut narrows the top of the trace, and the thinner the line, the bigger the relative loss.',
    ),
    lessons: ['pcbFab'],
  },
  {
    id: 'min-trace-space',
    term: 'Minimum trace / space',
    name: loc('最小线宽线距', 'Minimum trace and space'),
    def: loc(
      '工厂能稳定做出的最细线和最小间隔。它不是随意规定的，由铜厚、蚀刻因子和底片精度共同决定。见 {@pcbFab}、{@pcbDfm}。',
      'The finest trace and smallest gap a fab can make reliably. It is not arbitrary: copper thickness, etch factor and artwork accuracy set it. See {@pcbFab} and {@pcbDfm}.',
    ),
    lessons: ['pcbFab', 'pcbDfm'],
  },
  {
    id: 'solder-mask',
    term: 'Solder mask',
    name: loc('阻焊层', 'Solder mask'),
    def: loc(
      '板子表面的绿色（也有其他颜色）绝缘油墨，只在焊盘上开窗，防止焊锡桥接，同时保护铜线。',
      'The insulating ink on the board surface (green, or other colours), opened only over pads, to stop solder bridging and protect the copper.',
    ),
    lessons: ['pcbFab', 'pcbDfm'],
  },
  {
    id: 'silkscreen',
    term: 'Silkscreen / Legend',
    name: loc('丝印', 'Silkscreen (legend)'),
    def: loc(
      '印在板子上的白色字符和标记，如位号、极性、Logo。不能压在焊盘上，否则油墨会挡住焊锡。',
      'White text and marks printed on the board: reference designators, polarity, logos. Keep it off pads, or the ink blocks solder wetting.',
    ),
    lessons: ['pcbFab', 'pcbDfm'],
  },
  {
    id: 'gerber',
    term: 'Gerber',
    name: loc('Gerber 文件', 'Gerber files'),
    def: loc(
      '工厂做板用的标准图形文件，每层一个，分别给出铜箔、阻焊、丝印等图形；钻孔另有一个文件。',
      'The standard image files a fab uses to make the board: one per layer, giving copper, mask and legend artwork; drill data is a separate file.',
    ),
    lessons: ['pcbSupply'],
  },
  {
    id: 'bom',
    term: 'BOM',
    name: loc('物料清单', 'Bill of materials'),
    def: loc(
      '列出每个位号用什么料、规格、封装和供应商的表。装配厂按它采购和贴片。',
      'A list of every reference designator with its part, value, package and supplier. The assembler buys and places parts from it.',
    ),
    lessons: ['pcbSupply'],
  },
  {
    id: 'stencil',
    term: 'Stencil',
    name: loc('钢网', 'Solder stencil'),
    def: loc(
      '金属薄片，开孔对准焊盘。刮刀把锡膏通过开孔印到焊盘上。',
      'A thin metal sheet with openings over the pads; a squeegee pushes solder paste through them onto the pads.',
    ),
    lessons: ['pcbSupply'],
  },
  {
    id: 'pick-place',
    term: 'Pick and place',
    name: loc('贴片机', 'Pick-and-place machine'),
    def: loc(
      '从料带吸取元件，按坐标放到锡膏上的设备。位置靠板上的基准点（Fiducial）校准。',
      'Equipment that picks components from reels and places them on paste at the given coordinates, aligned by fiducial marks.',
    ),
    lessons: ['pcbSupply', 'pcbBasics'],
  },
  {
    id: 'reflow',
    term: 'Reflow',
    name: loc('回流焊', 'Reflow soldering'),
    def: loc(
      '板子过加热炉，锡膏熔化形成焊点。温度曲线分预热、保温、回流、冷却几段，超标会损坏元件或板子。',
      'Boards pass through a heated oven where the paste melts into joints. The profile has preheat, soak, reflow and cooling zones; going out of spec can damage parts or the board.',
    ),
    lessons: ['pcbSupply'],
  },
  {
    id: 'aoi',
    term: 'AOI',
    name: loc('自动光学检测', 'Automated optical inspection'),
    def: loc(
      '用摄像头比对图像，查焊接缺陷、缺件、错件和移位。内层要在压合前检测，压合后就看不到了。',
      'Cameras compare images to find solder defects, missing or wrong parts and shifts. Inner layers are inspected before lamination, because they cannot be seen afterwards.',
    ),
    lessons: ['pcbSupply', 'pcbFab'],
  },
  {
    id: 'pcb-netlist',
    term: 'Netlist (PCB)',
    name: loc('网表（PCB）', 'Netlist (PCB)'),
    def: loc(
      '记录哪些引脚必须互相连通的清单，是原理图和布线之间的约定。布线完成后要和网表对比，查断路和短路。',
      'The list of which pins must be connected: the agreement between schematic and layout. After routing it is compared with the netlist to find opens and shorts.',
    ),
    lessons: ['pcbFlow', 'pcbTools'],
  },
  {
    id: 'impedance',
    term: 'Characteristic impedance',
    name: loc('特性阻抗', 'Characteristic impedance'),
    def: loc(
      '传输线上电压与电流之比，由线宽、介质厚度、介电常数和铜厚决定。阻抗突变会让信号反射。',
      'The ratio of voltage to current on a transmission line. It depends on trace width, dielectric height, Dk and copper thickness; an abrupt change reflects the signal.',
    ),
    lessons: ['pcbBasics'],
  },
  {
    id: 'microstrip',
    term: 'Microstrip / Stripline',
    name: loc('微带线 / 带状线', 'Microstrip / stripline'),
    def: loc(
      '微带线走在表层，下方有一个参考平面；带状线夹在两个平面之间。两者的阻抗公式不同。',
      'A microstrip runs on an outer layer above one reference plane; a stripline sits between two planes. Their impedance formulas differ.',
    ),
    lessons: ['pcbBasics', 'pcbStack'],
  },
  {
    id: 'ipc-2221',
    term: 'IPC-2221',
    name: loc('IPC-2221 载流标准', 'IPC-2221'),
    def: loc(
      '给出线宽载流能力经验公式的标准：温升、铜厚、线宽共同决定允许电流。它是估算，不能代替实测温升。',
      'A standard with empirical formulas for trace current capacity from temperature rise, copper thickness and width. It is an estimate and does not replace measuring the temperature rise.',
    ),
    lessons: ['pcbBasics'],
  },
  {
    id: 'diff-pair',
    term: 'Differential pair',
    name: loc('差分对', 'Differential pair'),
    def: loc(
      '一对并排走线，传输大小相等、方向相反的信号。要求等长、等距、紧贴，让共模噪声相互抵消。',
      'A pair of traces carrying equal and opposite signals. Keep them equal in length, evenly spaced and close together, so common-mode noise cancels.',
    ),
    lessons: ['pcbLayout'],
  },
  {
    id: 'return-path',
    term: 'Return path',
    name: loc('回流路径', 'Return path'),
    def: loc(
      '信号电流回到源端的路径。高频时回流紧贴信号线下方的参考平面走；平面被开槽或分割，回流就要绕行，环路面积变大。见 {@pcbLayout}。',
      'The path the signal current takes back to its source. At high frequency it follows the reference plane directly under the trace; a slot or split forces a detour and a larger loop. See {@pcbLayout}.',
    ),
    lessons: ['pcbLayout'],
  },
  {
    id: 'dfm',
    term: 'DFM / DFA',
    name: loc('可制造性 / 可装配性设计', 'Design for manufacture / assembly'),
    def: loc(
      '设计时就考虑工厂能做、装配厂能装的规则，例如最小线宽、焊盘间距、拼板和元件方向。见 {@pcbDfm}。',
      'Designing so the fab can build the board and the assembler can place it: minimum trace, pad spacing, panelization and part orientation. See {@pcbDfm}.',
    ),
    lessons: ['pcbDfm'],
  },
  {
    id: 'drc',
    term: 'DRC',
    name: loc('设计规则检查', 'Design rule check'),
    def: loc(
      'EDA 工具按规则自动检查间距、线宽、孔径等。通过 DRC 只说明满足了你设的规则；规则本身要和工厂能力对齐。见 {@pcbTools}。',
      'Automatic checks in the EDA tool of spacing, width, hole size and so on. Passing DRC only shows the rules you set are met; the rules themselves must match the fab. See {@pcbTools}.',
    ),
    lessons: ['pcbTools', 'pcbDfm'],
  },
  {
    id: 'fiducial',
    term: 'Fiducial',
    name: loc('基准点', 'Fiducial mark'),
    def: loc(
      '板上做的铜或阻焊开窗标记，供贴片机和 AOI 识别位置、校准坐标。',
      'A copper or mask-opened mark on the board that pick-and-place machines and AOI use to find position and calibrate coordinates.',
    ),
    lessons: ['pcbBasics', 'pcbSupply'],
  },
  {
    id: 'panelization',
    term: 'Panelization',
    name: loc('拼板', 'Panelization'),
    def: loc(
      '把多块小板拼在一块大板上一起加工、贴片，最后再分割。拼得越满，单板越便宜。',
      'Several small boards arranged on one larger panel for processing and assembly, then separated. The fuller the panel, the cheaper each board.',
    ),
    lessons: ['pcbSupply', 'pcbFab'],
  },
]

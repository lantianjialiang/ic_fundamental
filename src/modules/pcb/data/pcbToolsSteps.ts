import { loc, type LText } from '../../../i18n/locale'

export const WS = {
  stepsAria: loc('Altium 窗口示意：十个步骤', 'Mock Altium window: ten steps'),
  mockCap: loc(
    '示意：窗口是照 Altium 的布局简化画的，不是截图；元器件和数值是为这块小板虚构的。',
    'Illustration: a simplified mock of the Altium layout, not a screenshot; the parts and values are made up for this small board.',
  ),
  noKey: loc('（这一步主要用菜单）', '(mostly menu-driven)'),
}

export type StepId = 'sch' | 'ann' | 'erc' | 'eco' | 'stack' | 'place' | 'route' | 'pour' | 'drc' | 'out'

export type WalkStep = {
  id: StepId
  title: LText
  text: LText
  menu: string
  keys: string | null
  checks: LText[]
  why: LText
}

export const WALK: WalkStep[] = [
  {
    id: 'sch',
    title: loc('原理图录入', 'Schematic capture'),
    text: loc(
      '在 .SchDoc 里放符号、连导线、加电源端口：USB-C 的 VBUS 经限流电阻 R1 点亮 LED D1，温度传感器 U1 旁边放一颗去耦电容 C1。',
      'In the .SchDoc, place symbols, wire them and add power ports: USB-C VBUS lights LED D1 through current-limiting resistor R1, and temperature sensor U1 gets decoupling capacitor C1 beside it.',
    ),
    menu: 'Place » Part / Wire / Power Port',
    keys: 'P, W',
    checks: [
      loc('导线端点落在引脚热点上（端点出现红叉才算连上）', 'Wire ends sit on the pin hot spots (a red cross at the end means it has connected)'),
      loc('每颗器件填好值和封装名', 'Every part has its value and footprint name filled in'),
      loc('电源、地用电源端口，不要靠画长导线', 'Use power ports for supply and ground instead of long wires'),
    ],
    why: loc(
      '原理图只管连接关系。这一步连错，后面所有步骤都在错的网表上工作，所以放在最前面认真查。',
      'A schematic only holds connectivity. If it is wrong here, every later step works on a wrong netlist, so check it first and carefully.',
    ),
  },
  {
    id: 'ann',
    title: loc('编号', 'Annotate'),
    text: loc(
      '给带问号的位号（R?、D?、U?）自动编号成 R1、D1、U1。位号是 PCB 上丝印的名字，也是 BOM 和坐标文件里的唯一索引。',
      'Turn the question-mark designators (R?, D?, U?) into R1, D1, U1. A designator is the silkscreen name on the PCB and the unique key in the BOM and placement files.',
    ),
    menu: 'Tools » Annotation » Annotate Schematics',
    keys: null,
    checks: [
      loc('预览列表里没有重复的位号', 'No duplicate designators in the preview list'),
      loc('编号方向和页面顺序符合习惯（例如从上到下）', 'Numbering order follows the sheet layout you want, for example top to bottom'),
    ],
    why: loc(
      '两个器件同名，BOM 会把它们并成一行、坐标文件也对不上，贴片厂会贴错或漏贴。',
      'Two parts with one name merge into one BOM row and clash in the placement file, so the assembler places the wrong part or skips one.',
    ),
  },
  {
    id: 'erc',
    title: loc('编译 / ERC', 'Compile / ERC'),
    text: loc(
      '编译工程时 Altium 检查电气规则（ERC）并生成网表。Messages 面板里有错误或警告就双击跳到出错位置，改到列表干净。',
      'Compiling the project runs the electrical rule check (ERC) and builds the netlist. If the Messages panel shows errors or warnings, double-click to jump to them and fix until it is clean.',
    ),
    menu: 'Project » Compile PCB Project',
    keys: null,
    checks: [
      loc('Messages 面板显示 Compile successful, no errors found', 'The Messages panel shows “Compile successful, no errors found”'),
      loc('「只有一个引脚的网络」「没有驱动源」这类警告逐条看过，要么修要么确认可以忽略', 'Warnings such as “only one pin” or “no driving source” are each read and either fixed or confirmed harmless'),
    ],
    why: loc(
      'ERC 只能查出你设置的规则能看到的问题；网络名拼错成两个网络它不会报，所以编译干净之后还要自己对一遍（见 {@pcbFlow}）。',
      'ERC only finds what its rules can see. A misspelt net name becomes two nets without any message, so after a clean compile you still review by eye (see {@pcbFlow}).',
    ),
  },
  {
    id: 'eco',
    title: loc('更新 PCB（ECO）', 'Update PCB (ECO)'),
    text: loc(
      'Update PCB 把网表送进 .PcbDoc，先弹出变更单 ECO：列出要添加的器件、网络。先点 Validate Changes 全部打绿勾，再点 Execute Changes。',
      'Update PCB pushes the netlist into the .PcbDoc and opens an Engineering Change Order (ECO) listing the components and nets to add. Click Validate Changes until every row has a green tick, then Execute Changes.',
    ),
    menu: 'Design » Update PCB Document',
    keys: null,
    checks: [
      loc('Validate 之后每行 Check 列都是绿勾', 'After Validate, every row has a green tick in the Check column'),
      loc('有红叉多半是封装名找不到或焊盘号对不上，回封装库修', 'A red cross usually means a footprint was not found or pad numbers do not match; fix it in the footprint library'),
    ],
    why: loc(
      '变更单是原理图和 PCB 之间唯一的同步通道。改连接永远在原理图改、再 Update，两边才不会不一致（见 {@pcbFlow}）。',
      'The ECO is the only sync path between schematic and PCB. Always change connectivity in the schematic and update again, so the two never disagree (see {@pcbFlow}).',
    ),
  },
  {
    id: 'stack',
    title: loc('板框与叠层', 'Board shape and stack'),
    text: loc(
      '先定板子的外形（这里 30 × 20 mm），再打开 Layer Stack Manager 设层：双层板是顶层铜、一块 1.6 mm 的 FR-4 芯板、底层铜，两面各有阻焊和丝印。',
      'First fix the board shape (30 × 20 mm here), then open Layer Stack Manager: a two-layer board is top copper, a 1.6 mm FR-4 core and bottom copper, with solder mask and silkscreen on both outer faces.',
    ),
    menu: 'Design » Board Shape » Redefine Board Shape; Design » Layer Stack Manager',
    keys: 'D, K',
    checks: [
      loc('板框是一个闭合轮廓，尺寸和外壳图一致', 'The outline is one closed contour and matches the enclosure drawing'),
      loc('板厚 1.6 mm、铜厚 1 oz，与下单参数一致', 'Thickness 1.6 mm and copper 1 oz, matching what you will order'),
    ],
    why: loc(
      '叠层决定了阻抗和能布多密，板框决定摆放空间，二者要在布局前定下来，布到一半再改就要整板挪位（见 {@pcbStack}）。',
      'The stack sets impedance and routing density and the outline sets the space, so fix both before placement; changing them halfway means moving everything (see {@pcbStack}).',
    ),
  },
  {
    id: 'place',
    title: loc('布局', 'Placement'),
    text: loc(
      '把器件拖进板框：USB-C 接口贴着板边，LED 靠另一端，传感器远离发热的 R1 和 D1，C1 紧挨 U1 的电源脚。放的时候按空格旋转。',
      'Drag parts into the outline: the USB-C connector on the board edge, the LED at the other end, the sensor away from heat-producing R1 and D1, and C1 right next to U1’s supply pin. Press Spacebar to rotate while dragging.',
    ),
    menu: 'Tools » Component Placement',
    keys: 'Spacebar',
    checks: [
      loc('接口在板边、能插拔；所有器件都在板框里', 'The connector is on the edge and can be plugged; every part is inside the outline'),
      loc('飞线（细线）交叉最少，去耦电容贴着芯片', 'Ratsnest lines cross as little as possible and the decoupling capacitor hugs the chip'),
    ],
    why: loc(
      '布线只能在布局的基础上做。布局时飞线乱成一团，布线就必然绕远路、多打过孔（原则见 {@pcbLayout}）。',
      'Routing can only be as good as the placement. A tangled ratsnest at placement time forces long detours and extra vias later (principles in {@pcbLayout}).',
    ),
  },
  {
    id: 'route',
    title: loc('布线', 'Routing'),
    text: loc(
      '用交互式布线把飞线变成铜线：电源线 VBUS 画粗一些（0.5 mm），信号线 0.25 mm；需要换到背面时按数字键盘的 * 切层，会自动打过孔。',
      'Use interactive routing to turn ratsnest lines into copper: the VBUS supply trace wider (0.5 mm), signals 0.25 mm; to move to the bottom side press * on the numeric keypad, which drops a via automatically.',
    ),
    menu: 'Place » Interactive Routing',
    keys: 'P, T',
    checks: [
      loc('飞线全部消失（没有未布线网络）', 'All ratsnest lines are gone (no un-routed nets)'),
      loc('没有锐角、没有长分支；线宽按网络类设置', 'No acute angles or long stubs; widths follow the net class'),
    ],
    why: loc(
      '线宽决定载流和压降，线距决定会不会短路，这些数来自规则而不是手感，所以规则要在布线前设好（载流估算见 {@pcbBasics}）。',
      'Width sets current capacity and voltage drop and spacing sets whether it shorts; these numbers come from rules, not feel, so set the rules before routing (current estimates in {@pcbBasics}).',
    ),
  },
  {
    id: 'pour',
    title: loc('铺铜', 'Polygon pour'),
    text: loc(
      '在底层放一块 GND 的 Polygon Pour，覆盖整个板面；铜皮和同网络的焊盘用花焊盘（热焊盘）连接，让焊接时热量不会被大铜皮一下带走。',
      'Place a GND polygon pour on the bottom layer over the whole board; the pour joins same-net pads through thermal reliefs so soldering heat is not drained away by the big copper area at once.',
    ),
    menu: 'Place » Polygon Pour',
    keys: 'P, G',
    checks: [
      loc('Net 选 GND，层选 Bottom Layer，铺完后再 Repour 一次', 'Net is GND, layer is Bottom Layer, and the pour is repoured after the last edit'),
      loc('没有孤岛（没连到 GND 的碎铜）', 'No islands (copper pieces not connected to GND)'),
    ],
    why: loc(
      '完整的地铜皮给信号提供回流路径，也能降低 GND 的阻抗；改过走线后铜皮不会自动让位，必须 Repour 才会更新。',
      'A solid ground pour gives signals a return path and lowers GND impedance; after a routing edit the pour does not move aside by itself, so it must be repoured to update.',
    ),
  },
  {
    id: 'drc',
    title: loc('DRC 检查', 'DRC'),
    text: loc(
      '运行设计规则检查：它按 Design » Rules 里的规则逐项比对线距、线宽、孔径、阻焊和丝印，并确认没有未布线网络和短路。目标是 0 个违规。',
      'Run the design rule check: it compares clearance, width, hole size, solder mask and silkscreen against the rules in Design » Rules, and confirms no un-routed nets or shorts. The target is zero violations.',
    ),
    menu: 'Tools » Design Rule Check',
    keys: 'T, D',
    checks: [
      loc('Rule Violations 为 0；Warnings 逐条看过', 'Rule Violations is 0, and every warning has been read'),
      loc('规则本身没有比板厂能力更宽松（见下一节）', 'The rules themselves are not looser than the fab’s capability (see the next section)'),
    ],
    why: loc(
      'DRC 为 0 只表示符合你设的规则。规则如果比板厂能力宽松，检查照样通过、工厂却做不出来，所以规则要按板厂能力来设（见 {@pcbDfm}）。',
      'Zero violations only means the board meets your own rules. If the rules are looser than the fab can build, the check still passes and the fab still cannot make it, so set rules from the fab’s capability (see {@pcbDfm}).',
    ),
  },
  {
    id: 'out',
    title: loc('Output Job 出图', 'Output Job'),
    text: loc(
      '在 .OutJob 里一次配好并生成：Gerber（各层图形）、NC 钻孔、BOM、贴片坐标。板厂拿 Gerber 加钻孔，贴片厂拿 BOM 加坐标（见 {@pcbSupply}）。',
      'In the .OutJob, configure and generate everything at once: Gerber (layer images), NC drill, BOM and pick-and-place. The board fab takes Gerber plus drill, the assembler takes BOM plus placement (see {@pcbSupply}).',
    ),
    menu: 'File » New » Output Job File',
    keys: null,
    checks: [
      loc('Gerber 勾上所有用到的层，包括板框层、阻焊、丝印、锡膏', 'Gerber includes every layer in use: outline, mask, silkscreen and paste'),
      loc('用 Gerber 查看器打开一遍，确认层数、板框和钻孔位置', 'Open the result in a Gerber viewer to confirm layer count, outline and drill positions'),
    ],
    why: loc(
      '工厂只按文件做，不会看你的工程。出图设置存在 OutJob 里，下一版点一下就全部重出，不会漏层（各层含义见 {@pcbFab}）。',
      'The factory builds only from the files and never sees your project. Saving the settings in an OutJob regenerates everything with one click next revision, with no missing layer (what each layer means: {@pcbFab}).',
    ),
  },
]

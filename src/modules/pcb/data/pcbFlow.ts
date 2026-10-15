import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const S = {
  kickerStep: loc('设计流程', 'Design flow'),
  kickerRule: loc('原理图规范', 'Schematic rules'),
  kickerHunt: loc('找错', 'Find the problems'),
  kickerSource: loc('封装来源', 'Footprint source'),
  kickerPin: loc('封装核对', 'Footprint check'),
  kickerReview: loc('设计评审', 'Design review'),
  introTitle: loc('一块板子是怎么「画」出来的', 'How a board gets designed'),
  flowTitle: loc('从需求到出图的十步', 'Ten steps from requirements to output files'),
  flowNote: loc(
    '点任意一步，或用下面的按钮逐步播放。底下两条回头的箭头是最常见的返工环：DRC 不过回布线，评审发现问题回布局。',
    'Click any step, or play them in order with the buttons. The two arrows underneath are the most common rework loops: a failed DRC goes back to routing, and review findings go back to placement.',
  ),
  input: loc('输入', 'Input'),
  output: loc('输出', 'Output'),
  tools: loc('常用工具 / 文件', 'Typical tools / files'),
  pitfall: loc('常见出错', 'What goes wrong'),
  ruleTitle: loc('原理图规范：符号、位号、网络名', 'Schematic rules: symbols, designators, net names'),
  ruleNote: loc(
    '原理图是给人看的，也是给软件看的：软件只认网络名和引脚号，人靠位号和清楚的画法。三个页签分别看。',
    'A schematic is read by people and by software: the software only sees net names and pin numbers, people rely on designators and a clean drawing. Look at each tab.',
  ),
  tabSymbol: loc('符号画法', 'Symbols'),
  tabRef: loc('位号前缀', 'Designators'),
  tabNet: loc('网络命名', 'Net names'),
  colPrefix: loc('前缀', 'Prefix'),
  colPart: loc('器件', 'Part'),
  colExample: loc('例子', 'Example'),
  colKind: loc('类别', 'Kind'),
  colGood: loc('推荐写法', 'Recommended'),
  colBad: loc('避免', 'Avoid'),
  colWhy: loc('原因', 'Why'),
  huntTitle: loc('找错：这张原理图有 5 个问题', 'Find the problems: this schematic has 5 faults'),
  huntNote: loc(
    '一个 MCU 小板的局部。点你觉得有问题的地方，红框是问题，绿框表示那里画得没错。找不到可以点「全部显示」。',
    'Part of a small MCU board. Click wherever you think something is wrong: a red box is a real problem, a green box means that spot is fine. Stuck? Press “Show all”.',
  ),
  found: loc('已找到', 'Found'),
  showAll: loc('全部显示', 'Show all'),
  resetHunt: loc('重来', 'Reset'),
  huntIdle: loc(
    '还没点任何地方。提示：顺着每个引脚看它接到了哪里、网络名是不是完全一样、每颗 IC 的电源脚旁边有没有电容。',
    'Nothing clicked yet. Hint: follow every pin to where it goes, check that net names match exactly, and look for a capacitor next to each IC power pin.',
  ),
  huntDone: loc(
    '5 个都找到了。这几类错误 ERC 只能抓到一部分（悬空输入、重复位号），网络名拼错和缺去耦电容软件不会报，只能靠评审。',
    'All 5 found. ERC catches only some of these (floating input, duplicate designator); a misspelt net name or a missing decoupling capacitor raises no error and has to be caught in review.',
  ),
  sourceTitle: loc('封装从哪来', 'Where footprints come from'),
  sourceNote: loc('三种来源各有长处，点卡片看。不管哪种，用之前都要对着数据手册核一遍。', 'Each of the three sources has strengths; click a card. Whichever you use, check it against the datasheet before use.'),
  pros: loc('优点：', 'Pros: '),
  cons: loc('要小心：', 'Watch out: '),
  whyTitle: loc('为什么封装错是返工头号原因', 'Why footprint errors top the rework list'),
  pinTitle: loc('核对：符号引脚 ↔ 封装焊盘', 'Check: symbol pins ↔ footprint pads'),
  pinNote: loc(
    '选一个案例。左边是数据手册的俯视图（芯片引脚），右边是库里的 PCB 封装，芯片按正常方向（1 脚在左上或左下，和手册一样）放上去，用虚线画出。点任意一个引脚看它落在哪个焊盘上。',
    'Pick a case. On the left is the datasheet top view (the chip pins); on the right is the library PCB footprint with the chip placed in its normal orientation (pin 1 where the datasheet shows it), drawn dashed. Click any pin to see which pad it lands on.',
  ),
  viewLib: loc('库里的封装', 'Library footprint'),
  viewFixed: loc('修正后', 'Corrected'),
  chipPin: loc('芯片引脚', 'Chip pin'),
  landsOn: loc('落在焊盘', 'Lands on pad'),
  padNet: loc('焊盘的网络', 'Pad net'),
  result: loc('结果', 'Result'),
  match: loc('对', 'Match'),
  mismatch: loc('错', 'Mismatch'),
  offset: loc('中心偏移', 'Centre offset'),
  overlap: loc('焊端与焊盘重叠', 'Terminal–pad overlap'),
  wrongPads: loc('错位引脚数', 'Pins wrong'),
  reviewTitle: loc('设计评审：出图前最后一道关', 'Design review: the last gate before output'),
  reviewNote: loc(
    '评审是请没画这块板的人按清单逐条查。下面是一份入门清单，逐条打勾；每条后面写了为什么要查。',
    'A review means someone who did not draw the board goes through a checklist item by item. Below is a starter list; tick each item. Each one says why it matters.',
  ),
  progress: loc('完成', 'Done'),
  resetCheck: loc('清空', 'Clear'),
  checkDone: loc(
    '全部打勾。评审记录要存档：哪条查了、谁查的、发现什么、怎么改的，下一版和量产时都要用。',
    'Everything ticked. Archive the review record: what was checked, by whom, what was found and how it was fixed. You will need it for the next revision and for production.',
  ),
  checkTodo: loc(
    '还有没勾的项。没查完就出图，等于把问题留给板厂、贴片厂和调试的人，代价是一次重新打样。',
    'Some items are unticked. Releasing files before the review is done hands the problem to the fab, the assembler and whoever debugs the board, and the cost is another prototype spin.',
  ),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '封装和 1 脚的外形见 {@pPackage}；网络、焊盘、线宽这些概念见 {@pcbBasics}；在 Altium 里怎么走一遍见 {@pcbTools}。',
    'Package shapes and pin 1: {@pPackage}; nets, pads and trace width: {@pcbBasics}; doing it all in Altium: {@pcbTools}.',
  ),
  next: loc('下一课：基本概念：线宽、铺铜与阻抗', 'Next: Core concepts: trace width, pours and impedance'),
}

export const INTRO: LText[] = [
  loc(
    '前几课讲的是板子怎么造、怎么贴片（{@pcbFab}、{@pcbSupply}）。这一课往前走一步：板厂拿到的 Gerber 是怎么来的。',
    'Earlier lessons covered how a board is fabricated and assembled ({@pcbFab}, {@pcbSupply}). This lesson goes one step earlier: where the Gerber files the fab receives come from.',
  ),
  loc(
    '设计是一条有顺序的流水线：先想清楚要什么，再画原理图（逻辑连接），给每个器件配上封装（物理焊盘），导出网表交给 PCB 编辑器，定叠层，再摆器件、连走线、跑规则检查、请人评审，最后出图。',
    'Design is an ordered pipeline: decide what is needed, draw the schematic (the logical connections), give each part a footprint (its physical pads), pass the netlist to the PCB editor, set the stack-up, place parts, route traces, run the rule check, get a review, and finally generate the output files.',
  ),
  loc(
    '越往后改，代价越大：原理图上改一根线几分钟；板子做出来再发现，就是飞线、割线，甚至整版重做，等几周。',
    'The later a change, the more it costs: fixing a wire in the schematic takes minutes; finding it after the board is built means bodge wires, cut traces or a full respin and weeks of waiting.',
  ),
]

export type StepId = 'req' | 'sch' | 'lib' | 'net' | 'stack' | 'place' | 'route' | 'drc' | 'review' | 'out'

export const STEPS: Array<{ id: StepId; title: LText; input: LText; output: LText; tools: LText; pitfall: LText; text: LText }> = [
  {
    id: 'req',
    title: loc('需求', 'Requirements'),
    text: loc(
      '把「这块板要干什么」写成数字：功能、接口、供电、尺寸、层数预算、成本、环境温度、要过的认证。后面每一步都拿它来判断对不对。',
      'Turn “what this board must do” into numbers: functions, interfaces, power, size, layer budget, cost, ambient temperature and required certifications. Every later step is judged against it.',
    ),
    input: loc('产品需求、结构图（外形、安装孔、接口位置）', 'Product requirements, mechanical drawing (outline, mounting holes, connector positions)'),
    output: loc('需求规格书、框图、主要器件选型', 'Requirement spec, block diagram, key part selection'),
    tools: loc('文档、框图工具、器件数据手册', 'Documents, block-diagram tool, part datasheets'),
    pitfall: loc('漏了接口或电流需求；结构尺寸没确认就开画，后面整板挪位置。', 'An interface or current requirement is missed; drawing starts before the mechanical outline is frozen, and everything moves later.'),
  },
  {
    id: 'sch',
    title: loc('原理图', 'Schematic'),
    text: loc(
      '用符号把器件的逻辑连接画出来：谁的哪个引脚接到哪个网络。原理图不管物理位置，只管连接关系。画完跑 ERC（电气规则检查）。',
      'Draw the logical connections with symbols: which pin of which part connects to which net. A schematic says nothing about physical position, only connectivity. Run ERC (electrical rule check) when done.',
    ),
    input: loc('需求规格、数据手册里的典型应用电路', 'Requirement spec, typical application circuits from datasheets'),
    output: loc('原理图（多页）、ERC 报告', 'Schematic (multi-sheet), ERC report'),
    tools: loc('Altium 的 .SchDoc、KiCad 的 .kicad_sch', 'Altium .SchDoc, KiCad .kicad_sch'),
    pitfall: loc('网络名拼错变成两个网络、输入脚悬空、漏去耦电容、位号重复（见下面找错）。', 'A misspelt net name becomes two nets, floating inputs, missing decoupling, duplicate designators (see the hunt below).'),
  },
  {
    id: 'lib',
    title: loc('封装库', 'Footprint library'),
    text: loc(
      '给每个符号指定 PCB 封装：焊盘的形状、尺寸、间距、编号，以及丝印、装配外形和 3D 模型。符号的引脚号必须和焊盘号一一对上。',
      'Assign a PCB footprint to every symbol: pad shape, size, pitch and numbering, plus silkscreen, assembly outline and 3D model. Symbol pin numbers must match pad numbers one to one.',
    ),
    input: loc('数据手册的封装图和推荐焊盘、IPC-7351、官方库', 'Datasheet package drawing and recommended land pattern, IPC-7351, vendor libraries'),
    output: loc('封装库、每个器件的符号↔封装对应', 'Footprint library, symbol ↔ footprint link for every part'),
    tools: loc('.PcbLib / .pretty、IPC 封装向导', '.PcbLib / .pretty, IPC footprint wizard'),
    pitfall: loc('1 脚方向错、俯视底视看反（镜像）、间距选错变体、引脚映射错。板子做出来才发现。', 'Pin 1 orientation wrong, top and bottom views mixed up (mirrored), wrong pitch variant, wrong pin mapping. Found only after the board is built.'),
  },
  {
    id: 'net',
    title: loc('网表', 'Netlist'),
    text: loc(
      '网表是原理图翻译成的一张清单：每个网络连着哪些「位号.引脚」。PCB 编辑器靠它画飞线（还没布的连接），也靠它做 DRC 的连通检查。',
      'The netlist is the schematic translated into a list: which “designator.pin” pairs each net connects. The PCB editor uses it to draw ratsnest lines (connections not yet routed) and to check connectivity in DRC.',
    ),
    input: loc('通过 ERC 的原理图 + 已指定的封装', 'ERC-clean schematic + assigned footprints'),
    output: loc('网表 / ECO（更新到 PCB 的变更单）', 'Netlist / ECO (change order pushed to the PCB)'),
    tools: loc('Altium「Update PCB」、KiCad「从原理图更新」', 'Altium “Update PCB”, KiCad “Update PCB from schematic”'),
    pitfall: loc('有器件没指定封装或焊盘号对不上，导入时被丢掉或报「找不到引脚」。', 'A part has no footprint, or pad numbers do not match, so it is dropped on import or reported as “pin not found”.'),
  },
  {
    id: 'stack',
    title: loc('叠层设定', 'Stack-up setup'),
    text: loc(
      '定层数和每层用途（信号、地、电源）、板厚、铜厚、介质厚度。它决定了阻抗和能布多密，所以要在布线之前定，最好先找板厂确认能做。',
      'Decide the layer count and each layer’s role (signal, ground, power), board thickness, copper weight and dielectric thicknesses. It sets impedance and routing density, so fix it before routing, ideally confirmed with the fab.',
    ),
    input: loc('层数预算、阻抗要求、板厂工艺能力', 'Layer budget, impedance targets, fab capabilities'),
    output: loc('叠层表、设计规则（线宽线距、过孔尺寸、阻抗线宽）', 'Stack-up table, design rules (trace/space, via sizes, impedance widths)'),
    tools: loc('Layer Stack Manager、板厂叠层表', 'Layer Stack Manager, the fab’s stack-up sheet'),
    pitfall: loc('布完线才改叠层，阻抗线宽全部要重算重走。见 {@pcbStack}。', 'Changing the stack-up after routing means every impedance trace must be recalculated and rerouted. See {@pcbStack}.'),
  },
  {
    id: 'place',
    title: loc('布局', 'Placement'),
    text: loc(
      '先放结构定死的（连接器、安装孔、按键、指示灯），再按功能分区放其他器件；去耦电容贴着电源脚。布局决定了七成的布线难度和信号质量。',
      'Place the mechanically fixed parts first (connectors, mounting holes, buttons, indicators), then the rest by functional block, with decoupling capacitors right next to power pins. Placement decides most of the routing difficulty and signal quality.',
    ),
    input: loc('网表导入后的器件、板框、叠层', 'Imported parts, board outline, stack-up'),
    output: loc('定好位置的器件', 'Placed components'),
    tools: loc('PCB 编辑器、3D 视图查干涉', 'PCB editor, 3D view for collisions'),
    pitfall: loc('接口没靠边、发热器件扎堆、晶振离芯片远。原则见 {@pcbLayout}。', 'Connectors not at the edge, hot parts clustered, crystal far from its chip. Principles: {@pcbLayout}.'),
  },
  {
    id: 'route',
    title: loc('布线', 'Routing'),
    text: loc(
      '按飞线把连接变成铜走线和过孔，铺地铺电源。顺序：关键信号（时钟、差分、高速）和电源先走，普通信号后走。',
      'Turn ratsnest lines into copper traces and vias, and pour ground and power. Order: critical signals (clocks, differential pairs, high speed) and power first, ordinary signals last.',
    ),
    input: loc('布局、设计规则、飞线', 'Placement, design rules, ratsnest'),
    output: loc('完成连接的铜层', 'Fully connected copper layers'),
    tools: loc('交互布线、差分对布线、铺铜', 'Interactive routing, differential-pair routing, copper pour'),
    pitfall: loc('电源线太细（载流不够）、高速线跨分割、锐角和长分支。', 'Power traces too narrow for the current, fast signals crossing plane splits, acute angles and long stubs.'),
  },
  {
    id: 'drc',
    title: loc('DRC', 'DRC'),
    text: loc(
      'DRC（设计规则检查）让软件逐条查：间距、线宽、孔环、未连接网络、短路、丝印压焊盘。规则要按板厂能力设，否则「DRC 通过」也可能做不出来。',
      'DRC (design rule check) has the software check clearance, width, annular ring, unrouted nets, shorts and silkscreen over pads. Rules must follow the fab’s capability, or a “clean DRC” can still be unbuildable.',
    ),
    input: loc('布完线的 PCB、规则集', 'Routed PCB, rule set'),
    output: loc('DRC 报告（目标 0 错误）', 'DRC report (target: 0 errors)'),
    tools: loc('Design Rule Check、规则编辑器', 'Design Rule Check, rule editor'),
    pitfall: loc('不通过就回到布线修改；把错误「批量忽略」而不是逐条看。', 'Failures send you back to routing; “waiving everything” instead of reading each violation is the classic mistake.'),
  },
  {
    id: 'review',
    title: loc('评审', 'Review'),
    text: loc(
      '软件只能查规则，查不了意图：去耦电容放得对不对、接口方向对不对、散热够不够。评审请别人按清单看，发现问题回布局（甚至回原理图）。',
      'Software checks rules, not intent: whether decoupling is placed right, connectors face the right way, cooling is enough. A reviewer goes through a checklist; findings send you back to placement (or even the schematic).',
    ),
    input: loc('PCB、原理图、DRC 报告、检查清单', 'PCB, schematic, DRC report, checklist'),
    output: loc('评审记录、问题清单及修改', 'Review record, issue list and fixes'),
    tools: loc('3D 视图、1:1 打印、检查清单', '3D view, 1:1 printout, checklist'),
    pitfall: loc('自己审自己（盲点相同）；没有清单，凭感觉看。', 'Reviewing your own work (same blind spots); no checklist, just a look-over.'),
  },
  {
    id: 'out',
    title: loc('出图', 'Output files'),
    text: loc(
      '生成交给板厂和贴片厂的文件：各层 Gerber、钻孔文件、BOM、坐标文件、装配图。出完用 Gerber 查看器再看一遍，看到的就是板厂会做的。',
      'Generate the files for the fab and assembler: Gerbers for every layer, drill files, BOM, pick-and-place file, assembly drawing. Open them in a Gerber viewer afterwards: what you see is what the fab will build.',
    ),
    input: loc('通过 DRC 和评审的 PCB', 'PCB that passed DRC and review'),
    output: loc('Gerber、钻孔、BOM、坐标、装配图', 'Gerbers, drill, BOM, pick-and-place, assembly drawing'),
    tools: loc('Output Job、Gerber 查看器', 'Output Job, Gerber viewer'),
    pitfall: loc('漏层（比如没出阻焊层）、BOM 和板子版本不一致。交付清单见 {@pcbSupply}。', 'A missing layer (e.g. no solder mask), BOM out of sync with the board revision. Deliverables: {@pcbSupply}.'),
  },
]

export const LOOPS = {
  drc: loc('DRC 不过 → 回布线', 'DRC fails → back to routing'),
  review: loc('评审发现问题 → 回布局', 'Review finds issues → back to placement'),
}

export const FLOW_CAP = loc(
  '前半段（上排）定义「连什么」，后半段（下排）定义「放哪儿、怎么连」。越晚发现问题，回头的箭头越长。',
  'The first half (top row) defines what connects; the second half (bottom row) defines where parts go and how they connect. The later a problem is found, the longer the arrow back.',
)

export type RuleTab = 'symbol' | 'ref' | 'net'

export const SYMBOL_RULES: LText[] = [
  loc(
    '信号从左往右流：输入在左、输出在右；电源在上、地在下。读图的人不用绕着找。',
    'Signals flow left to right: inputs on the left, outputs on the right; power at the top, ground at the bottom. Readers do not have to hunt around.',
  ),
  loc(
    '符号上同时显示引脚名和引脚号。引脚号是和封装焊盘对应的唯一依据，名字给人看。符号长什么样见 {@pParts}。',
    'Show both the pin name and the pin number on symbols. The number is what ties a pin to a footprint pad; the name is for people. Symbol shapes: {@pParts}.',
  ),
  loc(
    '连接点画实心圆点；不要画「十字」四路交叉，因为打印模糊时分不清是连接还是跨过。改成两个 T 形。',
    'Mark junctions with a solid dot, and avoid four-way crossings: on a blurry print you cannot tell a junction from a crossover. Use two T-junctions instead.',
  ),
  loc(
    '大器件可以拆成几个部件（U1A、U1B、电源部件 U1P），但电源部件不能漏放，否则那几个电源脚在网表里是悬空的。',
    'A large part may be split into sections (U1A, U1B, power section U1P), but do not forget to place the power section, or those power pins float in the netlist.',
  ),
  loc(
    '按功能分页（电源、MCU、接口），页间用网络标号或端口连接，每页有标题栏（版本、日期、作者）。',
    'Split sheets by function (power, MCU, interfaces), connect them with net labels or ports, and give every sheet a title block (revision, date, author).',
  ),
]

export const REF_ROWS: Array<{ prefix: string; part: LText; example: string }> = [
  { prefix: 'R', part: loc('电阻（RN 为排阻）', 'Resistor (RN for a network)'), example: 'R1, R12' },
  { prefix: 'C', part: loc('电容', 'Capacitor'), example: 'C3' },
  { prefix: 'L', part: loc('电感（磁珠常用 FB）', 'Inductor (ferrite beads often FB)'), example: 'L1, FB2' },
  { prefix: 'D', part: loc('二极管（含稳压、TVS；LED 常也用 D）', 'Diode (incl. Zener, TVS; LEDs often use D too)'), example: 'D1' },
  { prefix: 'LED', part: loc('发光二极管（有的公司单列）', 'Light-emitting diode (some companies list it separately)'), example: 'LED1' },
  { prefix: 'Q', part: loc('三极管、MOS 管', 'Transistor, MOSFET'), example: 'Q2' },
  { prefix: 'U', part: loc('集成电路（IC 也常见）', 'Integrated circuit (IC also common)'), example: 'U1' },
  { prefix: 'J', part: loc('连接器（P 有时表示插头）', 'Connector (P sometimes for the plug)'), example: 'J1' },
  { prefix: 'Y', part: loc('晶振（X 也常见）', 'Crystal (X also common)'), example: 'Y1' },
  { prefix: 'TP', part: loc('测试点', 'Test point'), example: 'TP5' },
  { prefix: 'F', part: loc('保险丝', 'Fuse'), example: 'F1' },
  { prefix: 'SW', part: loc('开关、按键（S 也常见）', 'Switch, button (S also common)'), example: 'SW1' },
  { prefix: 'K', part: loc('继电器', 'Relay'), example: 'K1' },
]

export const REF_TEXT = loc(
  '位号在整个设计里必须唯一，因为它会印在丝印上，并且出现在 BOM 和坐标文件里：贴片机按位号找坐标，维修的人按位号找器件。用工具的自动编号（Annotate），不要手改出重复。',
  'Every designator must be unique across the design, because it is printed on the silkscreen and appears in the BOM and pick-and-place file: the placement machine finds coordinates by designator, and a technician finds parts by it. Use the tool’s Annotate function rather than hand-editing into duplicates.',
)

export const NET_ROWS: Array<{ kind: LText; good: string; bad: string; why: LText }> = [
  {
    kind: loc('电源', 'Power'),
    good: 'VCC_3V3, VBUS_5V, VIN_12V',
    bad: 'VCC, 3.3V',
    why: loc('名字里带电压，一眼看出是哪路；「.」和以数字开头在有些工具、网表格式里会出问题。', 'Putting the voltage in the name tells rails apart at a glance; “.” and a leading digit break some tools and netlist formats.'),
  },
  {
    kind: loc('地', 'Ground'),
    good: 'GND, AGND, PGND',
    bad: 'GND1, 0V',
    why: loc('不同的地分开命名，在哪里单点连接要有意设计，不能靠名字碰巧一样。', 'Name separate grounds separately and join them deliberately at one point, not by names that happen to match.'),
  },
  {
    kind: loc('低有效', 'Active low'),
    good: 'RESET_N, nRESET, CS#',
    bad: 'RESET',
    why: loc('只写 RESET 看不出是高有效还是低有效；后缀告诉读者「拉低才生效」。差分对常用 _P/_N，所以低有效最好用 n 前缀或 #，一个项目只用一种。', 'Plain RESET does not say whether it is active high or low; the suffix tells readers “active when pulled low”. Differential pairs often use _P/_N, so prefer an n prefix or # for active low, and use only one convention per project.'),
  },
  {
    kind: loc('总线', 'Bus'),
    good: 'D[0..7] → D0…D7',
    bad: 'DATA0, D_1, Data2',
    why: loc('总线成员名字要规律一致，工具才能把 D[0..7] 展开成 D0 到 D7 并逐根连上。', 'Bus members must be named consistently so the tool can expand D[0..7] into D0 to D7 and connect each one.'),
  },
  {
    kind: loc('差分对', 'Diff pair'),
    good: 'USB_DP / USB_DN',
    bad: 'USB+, USB-',
    why: loc('成对的后缀让布线工具认出差分对、按等长等距一起走；+ − 号在很多格式里不合法。', 'Paired suffixes let the router recognise the pair and route it matched; + and − are illegal in many formats.'),
  },
]

export const NET_TEXT = loc(
  '软件只认字符：两个标号写成 VCC_3V3 和 VCC3V3，就是两个互不相连的网络，哪怕画在一张纸上。下面找错就有这个坑。',
  'Software only compares characters: labels written VCC_3V3 and VCC3V3 are two unconnected nets, even on the same sheet. The hunt below contains exactly this trap.',
)

export type HuntId = 'decap' | 'boot' | 'dupRef' | 'rxLabel' | 'netName' | 'okPullup' | 'okLed' | 'okGnd' | 'okNc'

export const HUNT: Array<{ id: HuntId; issue: boolean; title: LText; text: LText }> = [
  {
    id: 'decap',
    issue: true,
    title: loc('VDD 没有去耦电容', 'No decoupling capacitor on VDD'),
    text: loc(
      'U1 的 VDD 直接接电源网络，旁边没有 100 nF。芯片开关时电流是尖峰，电源线的电感让 VDD 瞬间跌落，引起复位或误动作。每个电源脚放一个 100 nF，布局时贴着引脚，见 {@pcbLayout}。',
      'U1’s VDD connects straight to the rail with no 100 nF next to it. Switching current comes in spikes, and the inductance of the supply trace makes VDD dip momentarily, causing resets or glitches. Put 100 nF on every power pin, placed right at the pin; see {@pcbLayout}.',
    ),
  },
  {
    id: 'boot',
    issue: true,
    title: loc('BOOT0 输入悬空', 'BOOT0 input left floating'),
    text: loc(
      'BOOT0 决定上电从哪里启动，却什么都没接。CMOS 输入阻抗极高，悬空时电平由噪声和漏电决定，可能随机进入引导模式；还可能停在中间电平让输入级上下管同时导通、多耗电。要用电阻下拉（或按手册接）。',
      'BOOT0 selects where the chip boots from, yet nothing is connected. A CMOS input has extremely high impedance, so when floating its level is set by noise and leakage and it may randomly enter boot mode; it can also sit mid-rail with both input transistors partly on, wasting current. Pull it down with a resistor (or wire it as the datasheet says).',
    ),
  },
  {
    id: 'dupRef',
    issue: true,
    title: loc('位号 R2 重复', 'Designator R2 used twice'),
    text: loc(
      'LED 限流电阻和 TX 串联电阻都叫 R2。BOM 里只会有一行 R2，贴片机按位号找坐标会冲突，维修时也不知道是哪颗。ERC 或导入 PCB 时会报错，重新 Annotate 就好。',
      'The LED resistor and the TX series resistor are both R2. The BOM ends up with one R2 line, the placement machine’s coordinates clash, and a technician cannot tell which is which. ERC or PCB import flags it; re-run Annotate.',
    ),
  },
  {
    id: 'rxLabel',
    issue: true,
    title: loc('RX 两头的网络标号没写名字', 'RX net labels left unnamed'),
    text: loc(
      'U1 的 RX 和 J1 的 3 脚各画了一个标号，但都没有名字。工具会给它们各自分配一个自动网络名（如 Net-U1-6），于是是两个网络，RX 实际上是断的。两头都写 UART_RX 才连得上。',
      'U1’s RX and J1 pin 3 each have a label, but neither is named. The tool assigns each its own automatic net name (e.g. Net-U1-6), so they are two nets and RX is actually open. Name both ends UART_RX to connect them.',
    ),
  },
  {
    id: 'netName',
    issue: true,
    title: loc('J1 的电源网络名拼错', 'J1 power net name misspelt'),
    text: loc(
      'J1 的 1 脚标的是 VCC3V3，其他地方都是 VCC_3V3。少一个下划线就是另一个网络：外面接进来的 3.3 V 到不了 U1。ERC 不会报，只能靠评审和看网表时发现「只有一个引脚的网络」。',
      'J1 pin 1 is labelled VCC3V3 while everywhere else says VCC_3V3. One missing underscore makes a different net, so the 3.3 V brought in never reaches U1. ERC does not flag it; only review, or spotting a “net with a single pin” in the netlist, catches it.',
    ),
  },
  {
    id: 'okPullup',
    issue: false,
    title: loc('NRST 上拉：没问题', 'NRST pull-up: fine'),
    text: loc(
      'R1 10 kΩ 把低有效的复位脚 NRST 拉到 VCC_3V3，平时不复位，按键或外部拉低才复位。网络名一致、位号唯一，画法正确。',
      'R1 (10 kΩ) pulls the active-low reset pin NRST up to VCC_3V3, so the chip runs normally and resets only when a button or external driver pulls it low. Names match and designators are unique.',
    ),
  },
  {
    id: 'okLed',
    issue: false,
    title: loc('LED 支路：没问题', 'LED branch: fine'),
    text: loc(
      'PB0 → 限流电阻 → LED 阳极 → 阴极 → GND，三角形箭头指向电流方向、短竖线是阴极。PB0 输出高电平时 LED 亮。（问题只在于电阻的位号重复了。）',
      'PB0 → current-limiting resistor → LED anode → cathode → GND; the triangle points in the current direction and the bar is the cathode. The LED lights when PB0 drives high. (The only fault here is the duplicated resistor designator.)',
    ),
  },
  {
    id: 'okGnd',
    issue: false,
    title: loc('地符号：没问题', 'Ground symbol: fine'),
    text: loc(
      '地符号本身就是名为 GND 的全局网络，所有地符号自动相连，不需要再画线。',
      'A ground symbol is itself a global net named GND; all ground symbols connect automatically without drawing wires.',
    ),
  },
  {
    id: 'okNc',
    issue: false,
    title: loc('PA1 的不连接标记：没问题', 'No-connect mark on PA1: fine'),
    text: loc(
      'PA1 是没用到的普通 GPIO，打了 X（不连接标记），告诉 ERC 是故意不接，固件里把它设成输出或模拟模式就不会悬空。BOOT0 不一样：它在上电那一刻就被硬件读取，固件还没运行，没法靠软件处理，所以必须外接电阻。',
      'PA1 is an unused GPIO with an X (no-connect mark), telling ERC it is deliberately unconnected; firmware sets it to output or analog mode so it never floats. BOOT0 is different: hardware reads it at the instant of power-up before any firmware runs, so software cannot fix it and it needs an external resistor.',
    ),
  },
]

export const HUNT_CAP = loc(
  '示意原理图：U1 是一颗 8 脚 MCU（引脚按功能排布，不是物理位置），J1 是 4 针串口插座。',
  'Illustrative schematic: U1 is an 8-pin MCU (pins arranged by function, not physical position); J1 is a 4-pin serial header.',
)

export type SourceId = 'datasheet' | 'ipc' | 'vendor'

export const SOURCES: Array<{ id: SourceId; title: LText; sub: LText; text: LText; pros: LText; cons: LText }> = [
  {
    id: 'datasheet',
    title: loc('数据手册', 'Datasheet'),
    sub: loc('封装图 + 推荐焊盘', 'Package drawing + land pattern'),
    text: loc(
      '芯片手册最后几页有封装机械图（尺寸带公差）和推荐焊盘图（Recommended Land Pattern）。这是第一手资料，尤其是带散热焊盘、异形引脚的器件。读法见 {@spec}。',
      'The last pages of a datasheet hold the mechanical drawing (dimensions with tolerances) and the recommended land pattern. It is the primary source, especially for parts with exposed pads or unusual leads. Reading a datasheet: {@spec}.',
    ),
    pros: loc('最权威，针对这一颗器件，包括散热焊盘和钢网建议。', 'Most authoritative, specific to this part, including exposed-pad and stencil advice.'),
    cons: loc('不同厂家画法不同；有的只给封装图不给焊盘；注意图是俯视还是底视。', 'Drawing styles differ by vendor; some give only the package, not the land pattern; check whether a view is top or bottom.'),
  },
  {
    id: 'ipc',
    title: loc('IPC-7351 标准', 'IPC-7351 standard'),
    sub: loc('按尺寸公式算焊盘', 'Land pattern from dimensions'),
    text: loc(
      'IPC-7351 用器件的尺寸和公差，加上脚尖、脚跟、侧面的焊料余量，算出焊盘尺寸，并规定了统一命名（如 SOT95P280X145-3N）和 1 脚、零度方向。EDA 里的封装向导就是按它算的。',
      'IPC-7351 computes pad sizes from the part’s dimensions and tolerances plus toe, heel and side solder fillets, and defines standard names (e.g. SOT95P280X145-3N) and the pin-1 / zero-rotation convention. EDA footprint wizards use it.',
    ),
    pros: loc('统一、可重复；有 M/N/L 三档密度可选。', 'Consistent and repeatable; three density levels (M/N/L) to choose from.'),
    cons: loc('输入尺寸抄错就全错；特殊器件仍要看手册。', 'Copy one dimension wrong and the result is wrong; special parts still need the datasheet.'),
  },
  {
    id: 'vendor',
    title: loc('官方 / 第三方库', 'Vendor / library sites'),
    sub: loc('EDA 自带库、厂家下载', 'Built-in libraries, vendor downloads'),
    text: loc(
      'EDA 软件自带库、芯片厂官网、分销商（以及专门的封装网站）提供现成的符号 + 封装 + 3D 模型，下载就能用，省时间。',
      'EDA built-in libraries, chip vendor websites, distributors (and dedicated library sites) provide ready symbol + footprint + 3D model sets that save a lot of time.',
    ),
    pros: loc('快，带 3D 模型，常用器件质量不错。', 'Fast, includes 3D models, good quality for common parts.'),
    cons: loc('不保证对；引脚映射、变体（间距、带不带散热焊盘）必须自己核对。', 'Not guaranteed correct; you must check pin mapping and the variant (pitch, with or without exposed pad) yourself.'),
  },
]

export const WHY_FOOTPRINT: LText[] = [
  loc(
    '封装是原理图和实物之间唯一的物理接口。DRC 只检查焊盘之间的间距和连接，并不知道焊盘该在哪儿，所以封装画错了 DRC 照样 0 错误。',
    'The footprint is the only physical link between the schematic and the real part. DRC checks spacing and connectivity between pads but has no idea where the pads should be, so a wrong footprint still passes DRC with zero errors.',
  ),
  loc(
    '要到板子做好、贴片时才暴露：贴不上、焊不牢、或者焊上了但功能错。QFN、BGA 的焊点在底下，没法飞线补救，只能整版重做，花掉一轮打样的钱和几周时间。',
    'It only shows when the board is built and assembled: the part will not fit, joints fail, or it solders but works wrongly. QFN and BGA joints are underneath, so bodge wires are impossible and the only fix is a respin, costing a prototype round and weeks.',
  ),
  loc(
    '防法：新封装按 1:1 打印，把实物放上去比；核对 1 脚和引脚映射；评审单独列一项。',
    'Prevention: print new footprints 1:1 and lay the real part on the paper; check pin 1 and the pin mapping; make it a dedicated review item.',
  ),
]

export type PinCase = 'sot23' | 'soic' | 'qfn'
export type PinView = 'lib' | 'fixed'

export const PIN_CASES: Array<{ id: PinCase; label: LText; title: LText; lib: LText; fixed: LText }> = [
  {
    id: 'sot23',
    label: loc('SOT-23 MOS：G/S/D 映射', 'SOT-23 MOSFET: G/S/D map'),
    title: loc('引脚映射错：S 和 D 对调', 'Wrong pin map: S and D swapped'),
    lib: loc(
      '这颗 N 沟道 MOS 手册是 1=G、2=S、3=D，库里的符号却按 1=G、2=D、3=S 编（照抄了另一种管子）。焊上去以后源漏接反：体二极管（阳极在 S、阴极在 D）正向导通，负载一直有电，栅极怎么控制都关不掉。',
      'This N-channel MOSFET’s datasheet says 1=G, 2=S, 3=D, but the library symbol is numbered 1=G, 2=D, 3=S (copied from a different device). Once soldered, source and drain are reversed: the body diode (anode at S, cathode at D) is forward biased, the load is always powered, and the gate cannot turn it off.',
    ),
    fixed: loc(
      '把符号的引脚号改成 G=1、S=2、D=3，和手册一致。封装本身（焊盘位置）没错，错的是符号引脚号到焊盘号的对应。',
      'Renumber the symbol to G=1, S=2, D=3 to match the datasheet. The footprint geometry was fine; the error was in the mapping from symbol pin numbers to pad numbers.',
    ),
  },
  {
    id: 'soic',
    label: loc('SOIC-8：镜像', 'SOIC-8: mirrored'),
    title: loc('照着底视图画：编号镜像', 'Drawn from the bottom view: numbering mirrored'),
    lib: loc(
      '画封装的人照着手册的底视图编号，1 脚跑到了右上，编号变成顺时针（注意右边丝印圆点也跑到了右上）。贴片机按坐标文件的 0° 方向放芯片，1 脚仍在左上，于是 1 脚 OUTA 落在 8 号焊盘（V+）上：输出直接接到电源，上电就可能烧。镜像不是旋转，转多少度都对不上。',
      'The footprint was numbered from the datasheet’s bottom view, so pad 1 ended up at the top right and numbering runs clockwise (note the silkscreen dot on the right is now top right too). The placement machine puts the chip at the 0° orientation from the placement file, pin 1 still top left, so pin 1 (OUTA) lands on pad 8 (V+): the output is tied straight to the supply and may burn at power-up. A mirror is not a rotation, so no amount of turning the chip fixes it.',
    ),
    fixed: loc(
      'PCB 封装永远按俯视图（从元件面往下看）画：1 脚在左上，逆时针编号 1→4 沿左边往下、5→8 沿右边往上。',
      'A PCB footprint is always drawn in top view (looking down on the component side): pin 1 at top left, counter-clockwise numbering, 1→4 down the left side and 5→8 up the right.',
    ),
  },
  {
    id: 'qfn',
    label: loc('QFN-16：间距', 'QFN-16: pitch'),
    title: loc('选错变体：0.65 mm 的件配了 0.5 mm 的焊盘', 'Wrong variant: a 0.65 mm part on 0.5 mm pads'),
    lib: loc(
      '同样 4×4 mm、16 脚的 QFN 有不同间距的变体。器件是 0.65 mm 间距，库里选了 0.5 mm 的。中间两个引脚偏得少，越往两端偏得越多，最外侧的焊端只剩一小半压在焊盘上，还贴近了相邻焊盘，容易虚焊或连锡。',
      'A 4×4 mm 16-pin QFN comes in different pitch variants. The part is 0.65 mm pitch but the library picked 0.5 mm. The two middle pins are only slightly off, but the error grows toward the ends: the outermost terminals only partly overlap their pads and creep toward the neighbouring pad, inviting opens or bridges.',
    ),
    fixed: loc(
      '按手册的 e（引脚间距）、D/E（本体尺寸）和 b、L（焊端宽、长）选对变体，或用封装向导按这些尺寸重新生成。',
      'Choose the variant from the datasheet’s e (pitch), D/E (body size) and b, L (terminal width, length), or regenerate the footprint from those numbers with the wizard.',
    ),
  },
]

export const PIN_LABEL = {
  datasheet: loc('数据手册 · 俯视', 'Datasheet · top view'),
  footprint: loc('PCB 封装 · 俯视', 'PCB footprint · top view'),
  chip: loc('虚线 = 放上去的芯片', 'Dashed = the placed chip'),
  under: loc('焊端在底面，虚线为透视', 'Terminals are underneath, shown dashed'),
  libDot: loc('封装丝印 1 脚点', 'Footprint pin-1 dot'),
  cap: loc(
    '俯视图：从元件面往下看，1 脚旁有圆点，按逆时针编号。焊盘尺寸为示意，案例为教学构造。',
    'Top view, looking down on the component side: pin 1 is next to the dot and numbering runs counter-clockwise. Pad sizes are illustrative; the cases are constructed for teaching.',
  ),
}

export const SOT23_DS: Record<number, string> = { 1: 'G', 2: 'S', 3: 'D' }
export const SOT23_LIB: Record<number, string> = { 1: 'G', 2: 'D', 3: 'S' }
export const SOIC_NAMES: Record<number, string> = { 1: 'OUTA', 2: '-INA', 3: '+INA', 4: 'V-', 5: '+INB', 6: '-INB', 7: 'OUTB', 8: 'V+' }

export type CheckGroup = 'sch' | 'lib' | 'pcb' | 'out'

export const CHECK_GROUPS: Array<{ id: CheckGroup; title: LText }> = [
  { id: 'sch', title: loc('原理图', 'Schematic') },
  { id: 'lib', title: loc('封装', 'Footprints') },
  { id: 'pcb', title: loc('布局布线', 'Placement and routing') },
  { id: 'out', title: loc('出图', 'Outputs') },
]

export const CHECKS: Array<{ id: string; group: CheckGroup; text: LText; why: LText }> = [
  {
    id: 'c1',
    group: 'sch',
    text: loc('每颗 IC 的每个电源脚都有去耦电容', 'Every IC power pin has a decoupling capacitor'),
    why: loc('缺了不会报错，但会引起复位、误动作和 EMI。', 'Missing ones raise no error but cause resets, glitches and EMI.'),
  },
  {
    id: 'c2',
    group: 'sch',
    text: loc('没有悬空的输入脚，未用引脚按手册处理', 'No floating inputs; unused pins handled per datasheet'),
    why: loc('CMOS 输入悬空时电平随机，还会多耗电。', 'A floating CMOS input has a random level and wastes current.'),
  },
  {
    id: 'c3',
    group: 'sch',
    text: loc('ERC 0 错误，警告逐条确认过', 'ERC has 0 errors; every warning reviewed'),
    why: loc('警告里常藏着真问题，比如只有一个引脚的网络。', 'Real faults hide in warnings, such as a net with only one pin.'),
  },
  {
    id: 'c4',
    group: 'sch',
    text: loc('位号唯一，同一网络各处名字完全一致', 'Designators unique; each net named identically everywhere'),
    why: loc('名字差一个字符就是两个网络。', 'One character difference makes two nets.'),
  },
  {
    id: 'c5',
    group: 'lib',
    text: loc('新封装 1:1 打印，用实物比对过', 'New footprints printed 1:1 and checked with the real part'),
    why: loc('间距、外形错误一眼就能看出来。', 'Pitch and outline errors show at a glance.'),
  },
  {
    id: 'c6',
    group: 'lib',
    text: loc('1 脚位置、引脚映射和手册俯视图一致', 'Pin 1 and pin mapping match the datasheet top view'),
    why: loc('镜像和映射错误 DRC 查不出来。', 'Mirroring and mapping errors are invisible to DRC.'),
  },
  {
    id: 'c7',
    group: 'lib',
    text: loc('极性器件有丝印极性标识', 'Polarised parts have silkscreen polarity marks'),
    why: loc('贴片和维修靠它判断方向。', 'Assembly and repair rely on them for orientation.'),
  },
  {
    id: 'c8',
    group: 'pcb',
    text: loc('接口靠边、发热器件分散，3D 检查无干涉', 'Connectors at the edge, hot parts spread out, no 3D collisions'),
    why: loc('结构装不上是整版返工。', 'A board that does not fit the enclosure is a full respin.'),
  },
  {
    id: 'c9',
    group: 'pcb',
    text: loc('电源走线宽度满足载流', 'Power traces wide enough for their current'),
    why: loc('太细会发热、压降大，见基本概念一课。', 'Too narrow means heating and voltage drop; see the core concepts lesson.'),
  },
  {
    id: 'c10',
    group: 'pcb',
    text: loc('DRC 0 错误，规则按板厂能力设置', 'DRC 0 errors, rules set to the fab’s capability'),
    why: loc('规则比工艺宽松时，DRC 通过也做不出来。', 'If rules are looser than the process, a clean DRC can still be unbuildable.'),
  },
  {
    id: 'c11',
    group: 'out',
    text: loc('有 Fiducial 标记点和关键测试点', 'Fiducials and key test points are present'),
    why: loc('贴片机要靠标记点对位，调试和 ICT 要靠测试点。', 'The placement machine aligns on fiducials; debug and ICT need test points.'),
  },
  {
    id: 'c12',
    group: 'out',
    text: loc('Gerber 用查看器复查过，BOM、坐标与板子同版本', 'Gerbers checked in a viewer; BOM and placement file match the board revision'),
    why: loc('查看器里看到的就是板厂会做的；版本不一致会贴错料。', 'The viewer shows what the fab will build; mismatched revisions mean wrong parts get placed.'),
  },
]

export const REVIEW_TEXT: LText[] = [
  loc(
    '评审的意义：DRC 查规则，评审查意图。画图的人有盲点，换一双眼睛按清单看，能在最便宜的时候抓到问题。评审结论要写下来，作为出图的放行条件。',
    'Why review: DRC checks rules; review checks intent. The designer has blind spots, and a second pair of eyes with a checklist catches problems while they are still cheap. Record the conclusion and make it the release condition for output files.',
  ),
]

export const TAKEAWAY: LText[] = [
  loc('需求 → 原理图 → 封装库 → 网表 → 叠层 → 布局 → 布线 → DRC → 评审 → 出图；越晚发现问题，返工越贵。', 'Requirements → schematic → footprints → netlist → stack-up → placement → routing → DRC → review → outputs; the later a problem is found, the more it costs.'),
  loc('软件只认网络名和引脚号：名字差一个字符就是两个网络，位号必须唯一。', 'Software only sees net names and pin numbers: one character off makes two nets, and designators must be unique.'),
  loc('封装按俯视图画，1 脚逆时针编号；用之前对照手册核 1 脚、间距和引脚映射，因为 DRC 查不出封装错。', 'Footprints are drawn in top view with counter-clockwise numbering from pin 1; check pin 1, pitch and pin mapping against the datasheet before use, because DRC cannot catch footprint errors.'),
  loc('DRC 不过回布线，评审发现问题回布局；评审按清单、由别人做、留记录。', 'A DRC failure goes back to routing, review findings go back to placement; reviews use a checklist, are done by someone else, and are recorded.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('DRC 报了一处走线间距不够，按流程应该回到哪一步？', 'DRC reports a trace clearance violation. Which step do you go back to?'),
    options: [
      { id: 'a', text: loc('需求', 'Requirements') },
      { id: 'b', text: loc('布线', 'Routing') },
      { id: 'c', text: loc('直接出图，让板厂处理', 'Release the files and let the fab sort it out') },
    ],
    answer: 'b',
    explain: loc('间距是走线画出来的，回布线改；改完重新跑 DRC 直到 0 错误。', 'The clearance comes from how the traces were drawn, so fix it in routing and re-run DRC until it is clean.'),
  },
  {
    id: 'q2',
    prompt: loc('判断：原理图上一处标 VCC_3V3，另一处标 VCC3V3，它们连在一起吗？', 'Judge: one label says VCC_3V3 and another says VCC3V3. Are they connected?'),
    options: [
      { id: 'a', text: loc('连着，意思一样', 'Yes, they mean the same') },
      { id: 'b', text: loc('不连，是两个网络', 'No, they are two nets') },
    ],
    answer: 'b',
    explain: loc('工具逐字符比较网络名，少一个下划线就是另一个网络，而且 ERC 不会报。', 'Tools compare net names character by character; a missing underscore makes another net, and ERC does not flag it.'),
  },
  {
    id: 'q3',
    prompt: loc('SOT-23 N 沟道 MOS 的符号把 S、D 引脚号对调了，焊上后最可能怎样？', 'A SOT-23 N-channel MOSFET symbol has S and D pin numbers swapped. What most likely happens once soldered?'),
    options: [
      { id: 'a', text: loc('完全正常，MOS 管源漏对称', 'Works fine; MOSFETs are symmetric') },
      { id: 'b', text: loc('体二极管导通，负载关不断', 'The body diode conducts and the load cannot be switched off') },
      { id: 'c', text: loc('焊不上去', 'It cannot be soldered') },
    ],
    answer: 'b',
    explain: loc('分立 MOS 的源极和衬底连在一起，体二极管阳极在 S、阴极在 D；接反后它正向导通，栅极控制不了。', 'In a discrete MOSFET the source is tied to the body, so the body diode runs from S (anode) to D (cathode); reversed, it conducts and the gate has no control.'),
  },
  {
    id: 'q4',
    prompt: loc('为什么封装画错了，DRC 还能 0 错误通过？', 'Why can a wrong footprint still pass DRC with zero errors?'),
    options: [
      { id: 'a', text: loc('DRC 只查焊盘之间的规则，不知道焊盘本该在哪', 'DRC only checks rules between pads; it does not know where pads should be') },
      { id: 'b', text: loc('DRC 没开', 'DRC was switched off') },
      { id: 'c', text: loc('封装错不影响板子', 'Footprint errors do not affect the board') },
    ],
    answer: 'a',
    explain: loc('DRC 拿网表和规则比，封装本身的几何是它的输入而不是检查对象，所以要靠手册比对和评审。', 'DRC compares against the netlist and rules; footprint geometry is its input, not something it checks, so datasheet comparison and review must catch it.'),
  },
  {
    id: 'q5',
    prompt: loc('BOM 里看到 Y1、TP3、Q2，它们分别是？', 'The BOM lists Y1, TP3 and Q2. What are they?'),
    options: [
      { id: 'a', text: loc('晶振、测试点、晶体管', 'Crystal, test point, transistor') },
      { id: 'b', text: loc('电阻、跳线、电容', 'Resistor, jumper, capacitor') },
      { id: 'c', text: loc('二极管、保险丝、IC', 'Diode, fuse, IC') },
    ],
    answer: 'a',
    explain: loc('Y 是晶振，TP 是测试点，Q 是三极管或 MOS 管。', 'Y is a crystal, TP a test point, Q a transistor or MOSFET.'),
  },
]

import { loc, type LText } from '../../../i18n/locale'

export const S = {
  kickerFile: loc('工程文件', 'Project file'),
  kickerStep: loc('实操步骤', 'Walkthrough step'),
  kickerRule: loc('DRC 规则', 'DRC rule'),
  kickerQuote: loc('报价单', 'Quote line'),
  introTitle: loc('EDA 工具：把设计变成工厂能用的文件', 'EDA tools: turning a design into files a factory can use'),
  treeTitle: loc('Altium 工程里有哪些文件', 'What files an Altium project contains'),
  treeNote: loc(
    '左边是 Projects 面板的样子（示意）。点任意一个文件，看它装的是什么、和谁有关系。',
    'On the left is what the Projects panel looks like (illustrative). Click any file to see what it holds and what it links to.',
  ),
  inside: loc('里面是什么：', 'What is inside: '),
  link: loc('和谁有关系：', 'How it links: '),
  pitfall: loc('常见坑：', 'Common trap: '),
  walkTitle: loc('从零做一块小板：原理图 → PCB → Gerber', 'A small board from scratch: schematic → PCB → Gerber'),
  walkNote: loc(
    '例子是一块 USB-C 供电的 LED + 温度传感器小板。每一步上面画的是 Altium 窗口的示意：金色是要点的菜单，下面列出这一步要检查什么。菜单名按英文界面写。',
    'The example is a USB-C-powered LED + temperature-sensor board. Each step draws a mock Altium window: the gold item is the menu to click, and the list below says what to check. Menu names follow the English UI.',
  ),
  menuPath: loc('菜单：', 'Menu: '),
  keys: loc('快捷键：', 'Shortcut: '),
  checkList: loc('这一步要检查：', 'Check at this step: '),
  why: loc('为什么：', 'Why: '),
  drcTitle: loc('DRC 规则：按板厂能力来设', 'DRC rules: set them from the fab’s capability'),
  drcNote: loc(
    '规则在 Design » Rules 里设。下面的数是常见打样厂双层板的典型能力，不同厂、不同工艺差别很大，下单前一定去板厂官网的「工艺能力」页面核对。',
    'Rules live in Design » Rules. The numbers below are typical capabilities of common prototype fabs for two-layer boards. Fabs and processes differ a lot: always check the fab’s capability page before ordering.',
  ),
  unitSeg: loc('单位', 'Units'),
  colRule: loc('规则（Altium 名称）', 'Rule (Altium name)'),
  colChecks: loc('检查什么', 'What it checks'),
  colFab: loc('打样厂典型能力', 'Typical prototype fab'),
  colSet: loc('建议设置', 'Suggested setting'),
  typical: loc('典型值', 'typical'),
  drcCap: loc(
    '换算：1 mil = 0.0254 mm。Altium 里按 Q 在 mm 和 mil 之间切换，规则里的数会一起换算。',
    'Conversion: 1 mil = 0.0254 mm. Press Q in Altium to toggle between mm and mil; rule values convert with it.',
  ),
  keyTitle: loc('常用快捷键', 'Everyday shortcuts'),
  keyNote: loc(
    '只列确定在 Altium Designer PCB 编辑器里有效的几个。逗号表示依次按键（菜单加速键），加号表示同时按。',
    'Only shortcuts known to work in the Altium Designer PCB editor. A comma means press the keys one after another (menu accelerators); a plus means hold together.',
  ),
  colKey: loc('按键', 'Keys'),
  colWhen: loc('什么时候用', 'When'),
  colDoes: loc('作用', 'What it does'),
  orderTitle: loc('打样下单：步骤和参数怎么选', 'Ordering prototypes: steps and parameter choices'),
  orderNote: loc(
    '先看下单的顺序，再看每个参数的常见选择。参数没有特殊需求时选默认值，最便宜也最快。',
    'First the order of steps, then the usual choice for each parameter. Without a special need, take the default: it is the cheapest and fastest.',
  ),
  colParam: loc('参数', 'Parameter'),
  colDefault: loc('打样常用', 'Usual prototype choice'),
  colChange: loc('什么时候改', 'When to change it'),
  quoteTitle: loc('看懂报价单', 'Reading the quote'),
  quoteNote: loc(
    '改左边的参数，报价单跟着变。点任意一行看这笔钱是什么、为什么会变。',
    'Change the parameters and the quote updates. Click any line to see what the charge is and why it changes.',
  ),
  quoteCap: loc(
    '示意成本模型：单价、加价都是为教学编的整数，只用来说明「哪些参数影响哪一行」，不是任何一家厂的真实价格。',
    'Illustrative cost model: rates and surcharges are round numbers made up for teaching, only to show which parameter drives which line. They are not any real fab’s prices.',
  ),
  total: loc('合计', 'Total'),
  perBoard: loc('每片', 'Per board'),
  leadTime: loc('预计交期', 'Est. lead time'),
  days: loc('天', 'days'),
  weight: loc('总重', 'Total weight'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '每一步背后的设计道理见 {@pcbFlow}；线宽、铺铜见 {@pcbBasics}；出完 Gerber 后的自查清单见 {@pcbDfm}。',
    'The design reasoning behind each step: {@pcbFlow}; trace width and pours: {@pcbBasics}; the self-check after Gerbers: {@pcbDfm}.',
  ),
  next: loc('下一课：DFM / DFA / DFT 与综合项目', 'Next: DFM / DFA / DFT and the capstone'),
}

export const INTRO: LText[] = [
  loc(
    '前面几课讲的是「为什么这样画」，这一课讲「在软件里具体怎么点」。EDA（电子设计自动化）工具把原理图、封装、布线和规则放在同一个工程里，最后输出工厂能直接读的 Gerber、钻孔、BOM 和坐标文件，这些文件去哪、谁用，见 {@pcbSupply}。',
    'Earlier lessons covered why a board is drawn the way it is; this one covers what to click in the software. An EDA (electronic design automation) tool keeps schematic, footprints, routing and rules in one project, and finally writes the Gerber, drill, BOM and placement files a factory reads directly. Where those files go and who uses them: {@pcbSupply}.',
  ),
  loc(
    '常见工具有 Altium Designer、KiCad（免费开源）、Cadence Allegro / OrCAD、PADS 等。思路都一样：原理图 → 网表 → PCB → 规则检查 → 出图，对应 {@pcbFlow} 里的流程。这里用 Altium 演示，因为它在中小公司和打样圈最常见。',
    'Common tools include Altium Designer, KiCad (free and open source), Cadence Allegro / OrCAD and PADS. They all follow the same idea: schematic → netlist → PCB → rule check → outputs, the flow in {@pcbFlow}. Altium is used here because it is the most common in small and mid-size companies and among prototype shops.',
  ),
]

export type FileId = 'prj' | 'sch' | 'pcb' | 'schlib' | 'pcblib' | 'intlib' | 'outjob' | 'outputs'

export type TreeRow = { depth: number; label: string; file?: FileId; group?: LText }

/** Projects 面板的显示顺序；有 file 的行可点 */
export const TREE: TreeRow[] = [
  { depth: 0, label: 'LED_Sensor.PrjPcb', file: 'prj' },
  { depth: 1, label: 'Source Documents', group: loc('源文件', 'Source documents') },
  { depth: 2, label: 'LED_Sensor.SchDoc', file: 'sch' },
  { depth: 2, label: 'LED_Sensor.PcbDoc', file: 'pcb' },
  { depth: 1, label: 'Libraries', group: loc('库', 'Libraries') },
  { depth: 2, label: 'LED_Sensor.SchLib', file: 'schlib' },
  { depth: 2, label: 'LED_Sensor.PcbLib', file: 'pcblib' },
  { depth: 2, label: 'Company.IntLib', file: 'intlib' },
  { depth: 1, label: 'Settings', group: loc('设置', 'Settings') },
  { depth: 2, label: 'LED_Sensor.OutJob', file: 'outjob' },
  { depth: 0, label: 'Project Outputs for LED_Sensor', file: 'outputs', group: loc('生成的文件夹', 'Generated folder') },
]

export const FILES: Record<FileId, { ext: string; title: LText; inside: LText; link: LText; pitfall: LText }> = {
  prj: {
    ext: '.PrjPcb',
    title: loc('.PrjPcb 工程文件', '.PrjPcb project file'),
    inside: loc(
      '一个文本文件，记着这个工程包含哪些文档、工程选项（ERC 规则、编号方式、输出路径）和变体。它本身不含电路。',
      'A text file listing which documents belong to the project, plus project options (ERC rules, annotation, output path) and variants. It holds no circuit itself.',
    ),
    link: loc(
      '原理图和 PCB 必须在同一个工程里，Update PCB 才知道该把哪张原理图的网表送到哪块板子上。',
      'Schematic and PCB must be in the same project; that is how Update PCB knows which schematic’s netlist goes to which board.',
    ),
    pitfall: loc(
      '只拷贝 .SchDoc 和 .PcbDoc 发给别人，对方打开是「Free Documents」，不在任何工程里，编译和同步都用不了。要连 .PrjPcb 和库一起打包。',
      'Sending only the .SchDoc and .PcbDoc means the recipient opens them as “Free Documents” outside any project, so compile and sync do not work. Package the .PrjPcb and libraries with them.',
    ),
  },
  sch: {
    ext: '.SchDoc',
    title: loc('.SchDoc 原理图', '.SchDoc schematic'),
    inside: loc(
      '器件符号、导线、网络标签、电源端口和每颗器件的参数（位号、阻值、封装名）。一个工程可以有多张原理图，用端口或页面符连起来。',
      'Part symbols, wires, net labels, power ports and each part’s parameters (designator, value, footprint name). A project can have several sheets joined by ports or sheet symbols.',
    ),
    link: loc(
      '编译后得到网表：哪个引脚接哪个网络。PCB 上的飞线就是从这里来的，规范见 {@pcbFlow}。',
      'Compiling it gives the netlist: which pin is on which net. The ratsnest lines on the PCB come from here; drawing rules: {@pcbFlow}.',
    ),
    pitfall: loc(
      '导线端点没真正落在引脚的热点上，看着连了其实是断的，编译时会报「Net … has only one pin」。',
      'A wire end that misses the pin’s hot spot looks connected but is not; compile reports “Net … has only one pin”.',
    ),
  },
  pcb: {
    ext: '.PcbDoc',
    title: loc('.PcbDoc 电路板', '.PcbDoc board'),
    inside: loc(
      '板框、叠层、封装的摆放位置、走线、过孔、铺铜，以及全部设计规则（Design » Rules 里的规则存在这个文件里）。',
      'The board outline, stack-up, footprint positions, tracks, vias, pours and all design rules (the rules in Design » Rules are saved in this file).',
    ),
    link: loc(
      '器件和网络由原理图通过 ECO 同步过来；输出 Gerber 时 OutJob 从这里取数据。',
      'Parts and nets arrive from the schematic through an ECO; when Gerbers are generated, the OutJob reads from here.',
    ),
    pitfall: loc(
      '在 PCB 里直接改网络或删器件，不回原理图改，两边就不一致了。下次 Update PCB 会把改动「改回去」。',
      'Editing nets or deleting parts directly in the PCB without changing the schematic leaves the two out of sync; the next Update PCB will “undo” your edit.',
    ),
  },
  schlib: {
    ext: '.SchLib',
    title: loc('.SchLib 原理图库', '.SchLib schematic library'),
    inside: loc(
      '器件的原理图符号：引脚号、引脚名、电气类型（输入、输出、电源、无源），以及默认关联的封装名。',
      'Schematic symbols: pin numbers, pin names, electrical type (input, output, power, passive) and the linked footprint name.',
    ),
    link: loc(
      '符号的引脚号必须和封装的焊盘号一一对应，Altium 靠这个编号把引脚放到焊盘上。',
      'Symbol pin numbers must match footprint pad numbers one to one; Altium uses these numbers to put each pin on a pad.',
    ),
    pitfall: loc(
      '引脚号照着别家芯片画、或者 SOT-23 三个脚编号顺序搞错，板子做出来管子接反。核对方法见 {@pcbFlow}。',
      'Pin numbers copied from a different chip, or the three SOT-23 pins numbered in the wrong order, give a board with the device wired backwards. How to check: {@pcbFlow}.',
    ),
  },
  pcblib: {
    ext: '.PcbLib',
    title: loc('.PcbLib 封装库', '.PcbLib footprint library'),
    inside: loc(
      '封装（Footprint）：焊盘的形状、尺寸、编号，阻焊和钢网开口，丝印外形，1 脚标记，可选 3D 模型。',
      'Footprints: pad shape, size and number, solder-mask and paste openings, silkscreen outline, pin-1 mark and an optional 3D model.',
    ),
    link: loc(
      '尺寸来自数据手册推荐焊盘或 IPC 标准；焊盘和钢网的关系见 {@pcbBasics}。',
      'Dimensions come from the datasheet’s recommended land pattern or IPC rules; pads versus stencil openings: {@pcbBasics}.',
    ),
    pitfall: loc(
      '把芯片外形尺寸当成焊盘尺寸，或者俯视图 / 底视图看反，是最常见的返工原因之一。',
      'Using the package body size as the pad size, or mixing up top and bottom views, is one of the most common causes of rework.',
    ),
  },
  intlib: {
    ext: '.IntLib',
    title: loc('.IntLib 集成库', '.IntLib integrated library'),
    inside: loc(
      '把符号库、封装库（还可以有仿真模型、3D 模型）编译成一个只读文件。由 .LibPkg 库工程编译而来。',
      'Symbol and footprint libraries (optionally simulation and 3D models) compiled into one read-only file, built from a .LibPkg library package.',
    ),
    link: loc(
      '一颗器件的符号和封装绑在一起发布，团队里人人用的是同一个版本。新版 Altium 更推荐把器件放在 Workspace 里管理，思路相同。',
      'A part’s symbol and footprint are released together, so everyone on the team uses the same version. Newer Altium prefers managing parts in a Workspace; the idea is the same.',
    ),
    pitfall: loc(
      '集成库是只读的，要改得回到源 .SchLib / .PcbLib 改完重新编译；直接在板上改封装不会回写到库里。',
      'It is read-only: to change it, edit the source .SchLib / .PcbLib and recompile. Editing a footprint on the board does not write back to the library.',
    ),
  },
  outjob: {
    ext: '.OutJob',
    title: loc('.OutJob 输出任务', '.OutJob output job'),
    inside: loc(
      '一张「出图清单」：要出哪些文件（Gerber、NC 钻孔、BOM、坐标、装配图）、每个文件的设置（单位、精度、层），以及输出到哪个文件夹。',
      'An output checklist: which files to generate (Gerber, NC drill, BOM, pick-and-place, assembly drawings), the settings for each (units, precision, layers), and the target folder.',
    ),
    link: loc(
      '从 .PcbDoc 和原理图取数据；设置一次保存下来，以后每次改版点一下 Generate Content 就全部重出。',
      'Reads from the .PcbDoc and schematics; set it up once and save it, then each revision regenerates everything with one Generate Content click.',
    ),
    pitfall: loc(
      '每次手动出 Gerber 容易漏层，或者 Gerber 和钻孔的单位、小数位设得不一样，工厂就对不上位置。用 OutJob 把设置固定下来就不会。',
      'Exporting Gerbers by hand each time makes it easy to miss a layer, or to set different units or decimal places for the Gerbers and the drill file, so the fab cannot line them up. Fixing the settings in an OutJob prevents that.',
    ),
  },
  outputs: {
    ext: 'Project Outputs',
    title: loc('Project Outputs 输出文件夹', 'Project Outputs folder'),
    inside: loc(
      '生成的文件：各层 Gerber（.GTL 顶层铜、.GBL 底层铜、.GTO 顶层丝印、.GTS 顶层阻焊……）、NC 钻孔（.TXT）、BOM 表格、坐标文件。',
      'The generated files: one Gerber per layer (.GTL top copper, .GBL bottom copper, .GTO top silkscreen, .GTS top solder mask …), NC drill (.TXT), the BOM spreadsheet and the pick-and-place file.',
    ),
    link: loc(
      '把 Gerber 和钻孔打成一个 zip 发给板厂；BOM 和坐标发给贴片厂。制造怎么用这些层见 {@pcbFab}。',
      'Zip the Gerbers and drill file for the board fab; send the BOM and pick-and-place to the assembler. How manufacturing uses each layer: {@pcbFab}.',
    ),
    pitfall: loc(
      '这是生成物，不要手改；改了设计要重新生成，不然发出去的是旧版本。',
      'These are generated: do not hand-edit them. After a design change regenerate, or the old version goes out.',
    ),
  },
}

export const TREE_CAP = loc(
  'Projects 面板示意。Altium 实际把库再分成 Schematic Library Documents / PCB Library Documents 两个子组，这里合并画。',
  'Projects panel, illustrative. Altium actually splits libraries into Schematic Library Documents and PCB Library Documents sub-groups; they are merged here.',
)

export const TAKEAWAY: LText[] = [
  loc(
    '工程 = .PrjPcb 把 .SchDoc、.PcbDoc、库和 .OutJob 绑在一起；发给别人要整包发，单发图纸同步不了。',
    'A project is the .PrjPcb binding the .SchDoc, .PcbDoc, libraries and .OutJob together; send the whole package, because loose documents cannot sync.',
  ),
  loc(
    '顺序固定：画图 → 编号 → 编译查错 → Update PCB → 板框叠层 → 布局 → 布线 → 铺铜 → DRC → OutJob 出图。改连接只在原理图改，再同步过去。',
    'The order is fixed: draw → annotate → compile → Update PCB → outline and stack → place → route → pour → DRC → OutJob outputs. Change connectivity only in the schematic, then sync.',
  ),
  loc(
    'DRC 规则按板厂能力设，并留余量；0 个违规才出图，因为工厂只按 Gerber 做，不会帮你发现间距太小。',
    'Set DRC rules from the fab’s capability with margin, and only output at zero violations, because the fab builds exactly what the Gerbers say and will not notice a clearance that is too small.',
  ),
  loc(
    '打样参数没有特殊需求就选默认（双层、1.6 mm、1 oz、绿油）；ENIG、阻抗控制、细线细孔、加急都会体现在报价单的某一行上。',
    'Without a special need, take the defaults (two layers, 1.6 mm, 1 oz, green mask); ENIG, impedance control, fine lines and holes, and expedite each show up on a specific quote line.',
  ),
]

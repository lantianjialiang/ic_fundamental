import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type ModuleId } from '../../catalog'

export const S = {
  kickerRole: loc('PCB 的作用', 'What a PCB does'),
  kickerLevel: loc('产品里的位置', 'Place in a product'),
  kickerType: loc('PCB 分类', 'Board types'),
  kickerTerm: loc('术语', 'Term'),
  introTitle: loc('一块板子，把零件变成产品', 'One board turns parts into a product'),
  roleTitle: loc('PCB 的四个作用', 'The four jobs of a PCB'),
  roleNote: loc('点一张卡片，剖面图里高亮负责这件事的结构。', 'Click a card; the cross-section highlights the structure that does that job.'),
  levelTitle: loc('PCB 在产品里的位置', 'Where the PCB sits in a product'),
  levelNote: loc(
    '从左往右一层层放大：整机 → 单板 → 模块 → 元器件。点任意一格看这一层由谁负责、PCB 在这里做什么。',
    'Zoom in from left to right: system → board → module → component. Click any panel to see who owns that level and what the PCB does there.',
  ),
  typeTitle: loc('PCB 的分类', 'Kinds of PCB'),
  typeNote: loc('点一种板子看它的剖面。剖面纵向放大，层厚不按比例。', 'Click a board type to see its cross-section. Vertically exaggerated; layer thicknesses are not to scale.'),
  typeWhere: loc('常见用途：', 'Typical use: '),
  typeWhy: loc('为什么这样做：', 'Why it is built this way: '),
  glossTitle: loc('术语速查表（全课词汇表）', 'Glossary (vocabulary for the whole course)'),
  glossNote: loc(
    '可以按中文、英文或定义里的词搜索，也可以按类别筛选。右列是详细讲这个词的那一课，点编号直接跳过去。',
    'Search by Chinese, English or any word in the definition, or filter by category. The right column is the lesson that teaches the term; click the code to jump there.',
  ),
  search: loc('搜索术语，例如 via、阻焊、ENIG', 'Search terms, e.g. via, solder mask, ENIG'),
  searchAria: loc('搜索术语', 'Search terms'),
  catAria: loc('按类别筛选', 'Filter by category'),
  count: loc('显示 {m} / {n} 条', 'Showing {m} of {n}'),
  empty: loc('没有匹配的术语，换个关键词试试。', 'No matching term. Try another keyword.'),
  colTerm: loc('术语', 'Term'),
  colDef: loc('一句话定义', 'One-line definition'),
  colLesson: loc('在哪课讲', 'Taught in'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '测试用的负载板和探针卡本身就是多层 PCB，见 {@connection}；车间里它们装在哪，见 {@fAte}。',
    'The load boards and probe cards used in test are multilayer PCBs themselves, see {@connection}; where they sit on the test floor: {@fAte}.',
  ),
  next: loc('下一课：板材、铜箔与表面处理', 'Next: Laminate, copper and surface finish'),
}

export const INTRO: LText[] = [
  loc(
    'PCB（Printed Circuit Board，印制电路板）是一块绝缘板，上面用蚀刻出来的铜线代替导线，把芯片、电阻、电容、连接器连成电路。没焊零件的叫 PCB（光板），焊好零件的叫 PCBA。',
    'A PCB (printed circuit board) is an insulating board on which etched copper replaces wires, connecting chips, resistors, capacitors and connectors into a circuit. The bare board is the PCB; once parts are soldered on, it is a PCBA.',
  ),
  loc(
    '芯片封装（{@pPackage}）把 Die 引到毫米级的间距，PCB 再把这些引脚连到一起。半导体测试里到处是 PCB：负载板和探针卡都是几十层的多层板（{@connection}），装在测试机上（{@fAte}）。',
    'The chip package ({@pPackage}) fans the die out to millimetre pitch; the PCB then wires those pins together. Semiconductor test is full of PCBs: load boards and probe cards are multilayer boards with dozens of layers ({@connection}), mounted on the tester ({@fAte}).',
  ),
]

export type RoleId = 'support' | 'connect' | 'heat' | 'shield'

export const ROLES: Array<{ id: RoleId; title: LText; sub: LText; text: LText }> = [
  {
    id: 'support',
    title: loc('支撑', 'Support'),
    sub: loc('固定零件和整板', 'Holds parts and mounts'),
    text: loc(
      '零件焊在焊盘上，靠板子托住；板子再用安装孔和螺丝固定在机壳上。FR-4 板材硬而不易变形，所以几十克的连接器反复插拔，焊点也不会被拉裂。',
      'Parts are soldered to pads and carried by the board; the board is screwed to the chassis through mounting holes. FR-4 is stiff and dimensionally stable, so solder joints are not torn even when a connector is plugged in and out repeatedly.',
    ),
  },
  {
    id: 'connect',
    title: loc('互连', 'Interconnect'),
    sub: loc('铜走线代替导线', 'Copper replaces wires'),
    text: loc(
      '芯片引脚之间的连接全靠蚀刻出的铜走线和过孔。几千个连接一次蚀刻、一次钻孔做完，比手工连线便宜、可靠，而且每块板都一模一样。',
      'Every connection between pins is an etched copper trace or a via. Thousands of connections are made in one etch and one drilling run, which is cheaper and more reliable than hand wiring, and every board is identical.',
    ),
  },
  {
    id: 'heat',
    title: loc('散热', 'Heat'),
    sub: loc('铜皮和过孔导热', 'Copper and vias carry heat'),
    text: loc(
      '铜的导热率约 400 W/m·K，FR-4 只有约 0.3 W/m·K。所以芯片底部散热焊盘下面打一排散热过孔，把热量通过铜孔壁传到内层大面积地铜上散开，比靠板材导热快得多。',
      'Copper conducts heat at about 400 W/m·K, FR-4 at only about 0.3 W/m·K. So a row of thermal vias under the chip’s exposed pad carries heat down the copper barrels into large inner ground copper, far faster than through the laminate.',
    ),
  },
  {
    id: 'shield',
    title: loc('屏蔽', 'Shielding'),
    sub: loc('地平面和屏蔽罩', 'Ground planes and cans'),
    text: loc(
      '完整的内层地平面给信号提供紧贴的回流路径，磁场被限制在走线和平面之间，向外辐射小。射频电路再加一个焊在地环上的金属屏蔽罩，四周用一圈接地过孔（过孔栅栏）封住侧面。',
      'A solid inner ground plane gives signals a return path right beneath them, so the field stays between trace and plane and little radiates out. RF circuits add a metal shield can soldered to a ground ring, with a row of ground vias (a via fence) closing the sides.',
    ),
  },
]

export const ROLE_LABEL = {
  screw: loc('安装孔 + 螺丝', 'Mounting hole + screw'),
  vias: loc('散热过孔', 'Thermal vias'),
  trace: loc('顶层走线', 'Top traces'),
  conn: loc('连接器', 'Connector'),
  can: loc('屏蔽罩', 'Shield can'),
  gnd: loc('L2 地平面', 'L2 ground plane'),
  pwr: loc('L3 电源平面', 'L3 power plane'),
  chassis: loc('机壳', 'Chassis'),
  cap: loc(
    '4 层板剖面示意，纵向放大。左起：安装螺丝、带散热焊盘的 QFN、通孔连接器、屏蔽罩下的射频芯片。',
    'Four-layer board cross-section, vertically exaggerated. From left: mounting screw, a QFN with exposed pad, a through-hole connector, an RF chip under a shield can.',
  ),
}

export type LevelId = 'system' | 'board' | 'module' | 'part'

export const LEVELS: Array<{ id: LevelId; title: LText; example: LText; text: LText }> = [
  {
    id: 'system',
    title: loc('系统 / 整机', 'System'),
    example: loc('例：一台测试机或一部手机', 'E.g. a tester or a phone'),
    text: loc(
      '整机里有机壳、电源、风扇、线缆和一块或几块单板。系统设计决定要几块板、板与板之间用连接器还是背板相连。PCB 在这一层的身份是「被装进去的部件」。',
      'A system has an enclosure, power supply, fans, cables and one or more boards. System design decides how many boards there are and whether they connect through cables, connectors or a backplane. At this level the PCB is a part that gets installed.',
    ),
  },
  {
    id: 'board',
    title: loc('单板', 'Board'),
    example: loc('例：主板、负载板', 'E.g. a mainboard or load board'),
    text: loc(
      '一块 PCB 加上焊好的零件就是一块单板（PCBA）。PCB 设计主要在这一层：定板子尺寸、层数、叠层，把功能区布局好再连线。本课程的大部分内容都在这一层。',
      'One PCB with its parts soldered on is a board (PCBA). PCB design mostly lives here: board size, layer count and stack-up, placing the functional areas and routing them. Most of this course is at this level.',
    ),
  },
  {
    id: 'module',
    title: loc('模块 / 功能区', 'Module'),
    example: loc('例：一块 DC-DC 电源区', 'E.g. a DC-DC power area'),
    text: loc(
      '一组完成一个功能的零件：比如电源芯片 + 电感 + 输入输出电容。它可以就是单板上的一个区，也可以做成一块独立小板（核心板、电源模块）再焊或插到主板上。布局时按模块分区（{@pcbLayout}）。',
      'A group of parts doing one job, such as a regulator chip with its inductor and input/output capacitors. It can be an area on the board or a small separate board (a system-on-module, a power module) soldered or plugged onto the main board. Placement is done module by module ({@pcbLayout}).',
    ),
  },
  {
    id: 'part',
    title: loc('元器件', 'Component'),
    example: loc('例：一颗 0603 电容', 'E.g. one 0603 capacitor'),
    text: loc(
      '最小一级：一个电阻、电容或芯片。PCB 上和它对应的是封装（Footprint）：一组焊盘、丝印外框和极性标记。焊盘画错，零件就焊不上，所以封装是最常见的返工原因之一（{@pcbFlow}）。',
      'The smallest level: one resistor, capacitor or chip. Its counterpart on the PCB is the footprint: a set of pads, a silkscreen outline and a polarity mark. A wrong pad means the part cannot be soldered, which is why footprints are a top cause of rework ({@pcbFlow}).',
    ),
  },
]

export const LEVEL_LABEL = {
  psu: loc('电源', 'PSU'),
  fan: loc('风扇', 'Fan'),
  mcu: 'MCU',
  power: loc('电源区', 'Power'),
  io: loc('接口', 'I/O'),
  mem: loc('存储', 'Memory'),
  ic: loc('稳压芯片', 'Regulator'),
  ind: loc('电感', 'Inductor'),
  cap: loc('电容', 'Caps'),
  body: loc('陶瓷体', 'Ceramic body'),
  term: loc('端电极', 'Terminal'),
  pad: loc('焊盘', 'Pad'),
  solder: loc('焊料', 'Solder'),
  caption: loc('示意图：每一格是前一格虚线框放大后的样子。', 'Illustration: each panel is the dashed box of the previous panel, enlarged.'),
}

export type TypeId = 'single' | 'double' | 'multi' | 'flex' | 'rigidflex' | 'metal'

export const TYPES: Array<{ id: TypeId; title: LText; sub: LText; text: LText; where: LText; why: LText }> = [
  {
    id: 'single',
    title: loc('单面板', 'Single-sided'),
    sub: loc('只有一面有铜', 'Copper on one side'),
    text: loc(
      '基材只有一面覆铜。传统做法是零件插在没有铜的一面，引脚穿过孔，在铜面焊接；孔不需要金属化。',
      'Only one side of the laminate is clad with copper. Traditionally parts sit on the bare side, leads pass through holes and are soldered on the copper side; the holes are not plated.',
    ),
    where: loc('电源适配器、玩具、简单家电。', 'Power adapters, toys, simple appliances.'),
    why: loc('不用电镀孔、工序最少，所以最便宜；但走线不能交叉，只能靠跳线绕开，复杂电路布不下。', 'No plated holes and the fewest steps make it the cheapest; but traces cannot cross except with jumpers, so complex circuits do not fit.'),
  },
  {
    id: 'double',
    title: loc('双面板', 'Double-sided'),
    sub: loc('两面铜 + 金属化孔', 'Two copper sides + PTH'),
    text: loc(
      '芯板两面都有铜。两面之间用金属化通孔（PTH，孔壁镀铜）连起来，走线可以在一面走不通时换到另一面。',
      'Both sides of the core carry copper. Plated through-holes (PTH, copper-plated barrels) join the two sides, so a trace blocked on one side can hop to the other.',
    ),
    where: loc('单片机小板、传感器板、本课综合项目。', 'Small MCU boards, sensor boards, this course’s capstone.'),
    why: loc('加了钻孔和沉铜电镀两道工序，成本比单面高一点，但走线交叉的问题解决了。', 'Drilling and copper plating add cost over single-sided, but crossing traces are no longer a problem.'),
  },
  {
    id: 'multi',
    title: loc('多层板', 'Multilayer'),
    sub: loc('4 层以上，内层有平面', '4+ layers, inner planes'),
    text: loc(
      '把蚀刻好内层图形的芯板和半固化片（PP）叠起来高温压合，再钻孔电镀。常见 4、6、8 层，测试负载板可达 20–40 层以上。',
      'Cores with etched inner patterns are stacked with prepreg (PP) and laminated under heat and pressure, then drilled and plated. 4, 6 and 8 layers are common; test load boards can exceed 20–40 layers.',
    ),
    where: loc('手机、电脑主板、负载板和探针卡。', 'Phones, computer mainboards, load boards and probe cards.'),
    why: loc('内层可以放完整的地平面和电源平面，信号有稳定的回流和阻抗，高速和高密度才做得出来。层数和叠层见 {@pcbStack}。', 'Inner layers can hold solid ground and power planes, giving signals a stable return path and impedance, which high speed and high density need. Layer count and stack-up: {@pcbStack}.'),
  },
  {
    id: 'flex',
    title: loc('软板 FPC', 'Flex (FPC)'),
    sub: loc('聚酰亚胺基材，可弯', 'Polyimide, bendable'),
    text: loc(
      '基材是聚酰亚胺（PI）薄膜，铜一般用压延铜（RA），表面用 PI 覆盖膜代替阻焊油墨。整体只有约 0.1 mm 厚，可以弯折。',
      'The base is a polyimide (PI) film, copper is usually rolled-annealed (RA), and a PI coverlay replaces liquid solder mask. The whole thing is about 0.1 mm thick and can bend.',
    ),
    where: loc('手机屏幕排线、相机模组、折叠铰链。', 'Phone display cables, camera modules, hinges.'),
    why: loc('PI 耐温高、薄而韧；压延铜的晶粒沿长度方向拉长，反复弯折不易裂，所以软板用 RA 铜（{@pcbMaterial}）。', 'PI is heat-resistant, thin and tough; rolled copper has grains stretched along its length, so it survives repeated bending, which is why flex uses RA copper ({@pcbMaterial}).'),
  },
  {
    id: 'rigidflex',
    title: loc('软硬结合板', 'Rigid-flex'),
    sub: loc('硬板区 + 软板区一体', 'Rigid and flex in one'),
    text: loc(
      '软板的 PI 芯层贯穿整块板，在需要装零件的地方两侧再压上 FR-4 成为硬板区；中间只剩软板层的地方可以弯。',
      'The flex PI core runs through the whole board; where parts mount, FR-4 is laminated on both sides to form rigid sections. Where only the flex layers remain, the board can bend.',
    ),
    where: loc('无人机、医疗设备、军工和航天。', 'Drones, medical devices, aerospace and defence.'),
    why: loc('省掉连接器和排线，少了接插件这一失效点，可靠性更高、更省空间；但压合工艺复杂，价格贵好几倍。', 'It removes connectors and cables, one less failure point, so it is more reliable and compact; but the lamination is complex and it costs several times more.'),
  },
  {
    id: 'metal',
    title: loc('金属基板', 'Metal-core'),
    sub: loc('铜 / 薄绝缘层 / 铝', 'Copper / thin dielectric / aluminium'),
    text: loc(
      '最常见的是铝基板：上面一层铜线路，中间一层很薄（约 75–150 µm）的导热绝缘层，下面是 1.0–1.6 mm 厚的铝板。',
      'The most common is the aluminium board: a copper circuit layer on top, a very thin (about 75–150 µm) thermally conductive dielectric in the middle, and a 1.0–1.6 mm aluminium plate below.',
    ),
    where: loc('LED 灯板、电机驱动、电源模块。', 'LED lighting, motor drives, power modules.'),
    why: loc('绝缘层薄且掺了陶瓷填料（1–3 W/m·K，FR-4 约 0.3），热量很快传到铝板再散到散热器上；代价是一般只能做单层线路。', 'The dielectric is thin and ceramic-filled (1–3 W/m·K versus about 0.3 for FR-4), so heat passes quickly into the aluminium and on to the heatsink; the trade-off is usually only one circuit layer.'),
  },
]

export const TYPE_LABEL = {
  silk: loc('丝印', 'Silkscreen'),
  mask: loc('阻焊', 'Solder mask'),
  cu: loc('铜箔', 'Copper'),
  cuOne: loc('铜箔（只在这一面）', 'Copper (this side only)'),
  base1: loc('基材（FR-4 或纸基）', 'Base (FR-4 or paper)'),
  npth: loc('非金属化孔 + 焊点', 'Unplated hole + joint'),
  part: loc('插件零件', 'Through-hole part'),
  top: loc('顶层铜 Top', 'Top copper'),
  bottom: loc('底层铜 Bottom', 'Bottom copper'),
  core: loc('FR-4 芯板', 'FR-4 core'),
  pth: loc('金属化通孔 PTH', 'Plated through-hole'),
  pp: loc('半固化片 PP', 'Prepreg (PP)'),
  l1: loc('L1 信号', 'L1 signal'),
  l2: loc('L2 地平面（与孔相连）', 'L2 ground (tied to via)'),
  l3: loc('L3 电源（反焊盘隔开）', 'L3 power (antipad gap)'),
  l4: loc('L4 信号', 'L4 signal'),
  cover: loc('PI 覆盖膜', 'PI coverlay'),
  glue: loc('胶层', 'Adhesive'),
  ra: loc('压延铜 RA', 'RA copper'),
  pi: loc('PI 基膜', 'PI base film'),
  bend: loc('可弯折', 'Bends'),
  rigid: loc('硬板区', 'Rigid'),
  flexZone: loc('软板区', 'Flex'),
  fr4: 'FR-4',
  flexCore: loc('PI 软板芯（贯穿全板）', 'PI flex core (runs through)'),
  circuit: loc('铜线路层', 'Copper circuit'),
  diel: loc('导热绝缘层（薄）', 'Thermal dielectric (thin)'),
  alu: loc('铝基 1.0–1.6 mm', 'Aluminium 1.0–1.6 mm'),
  led: 'LED',
  heat: loc('热流', 'Heat flow'),
}

export type CatId = 'all' | 'mat' | 'struct' | 'design' | 'file' | 'fab' | 'asm'

export const CATS: Array<{ id: CatId; label: LText }> = [
  { id: 'all', label: loc('全部', 'All') },
  { id: 'mat', label: loc('材料', 'Materials') },
  { id: 'struct', label: loc('结构', 'Structure') },
  { id: 'design', label: loc('设计', 'Design') },
  { id: 'file', label: loc('文件', 'Files') },
  { id: 'fab', label: loc('制板', 'Fabrication') },
  { id: 'asm', label: loc('装配与测试', 'Assembly & test') },
]

export type Term = { zh: string; en: string; cat: Exclude<CatId, 'all'>; def: LText; lesson: ModuleId }

export const TERMS: Term[] = [
  { zh: 'PCB 印制电路板', en: 'Printed circuit board', cat: 'struct', lesson: 'pcbIntro', def: loc('绝缘基材上用铜图形连接零件的板子，没焊零件。', 'An insulating board whose copper pattern connects parts; bare, with nothing soldered.') },
  { zh: 'PCBA 电路板组件', en: 'PCB assembly', cat: 'asm', lesson: 'pcbSupply', def: loc('焊好零件的 PCB。', 'A PCB with its parts soldered on.') },
  { zh: 'FPC 软板', en: 'Flexible printed circuit', cat: 'struct', lesson: 'pcbIntro', def: loc('聚酰亚胺基材、可以弯折的电路板。', 'A bendable circuit board on a polyimide base.') },
  { zh: 'FR-4', en: 'FR-4 laminate', cat: 'mat', lesson: 'pcbMaterial', def: loc('玻纤布浸环氧树脂制成的阻燃板材，最常用的基材。', 'Flame-retardant laminate of woven glass cloth in epoxy; the most common base material.') },
  { zh: 'Tg 玻璃化转变温度', en: 'Glass transition temperature', cat: 'mat', lesson: 'pcbMaterial', def: loc('树脂从硬变软的温度；超过它板子厚度方向膨胀急剧变大。', 'The temperature where resin goes from hard to soft; above it, expansion through the thickness rises steeply.') },
  { zh: 'Core 芯板', en: 'Core', cat: 'mat', lesson: 'pcbMaterial', def: loc('已经固化、两面覆铜的硬板材，内层图形就做在它上面。', 'A cured laminate clad with copper on both sides; inner-layer patterns are etched on it.') },
  { zh: 'PP 半固化片', en: 'Prepreg', cat: 'mat', lesson: 'pcbMaterial', def: loc('树脂没完全固化的玻纤布，层压时熔化把各层粘在一起。', 'Glass cloth with partly cured resin that melts during lamination and bonds the layers together.') },
  { zh: '铜厚 oz', en: 'Copper weight (oz)', cat: 'mat', lesson: 'pcbMaterial', def: loc('每平方英尺铜的盎司数；1 oz 约 35 µm 厚。', 'Ounces of copper per square foot; 1 oz is about 35 µm thick.') },
  { zh: '阻焊', en: 'Solder mask', cat: 'mat', lesson: 'pcbMaterial', def: loc('盖在铜上的绝缘油墨（多为绿色），只在焊盘处开窗，防止焊锡桥连。', 'Insulating ink over the copper (usually green), opened only at pads, so solder does not bridge.') },
  { zh: '丝印', en: 'Silkscreen', cat: 'mat', lesson: 'pcbMaterial', def: loc('印在板面上的位号、外框和极性标记。', 'Printed reference designators, outlines and polarity marks.') },
  { zh: '表面处理', en: 'Surface finish', cat: 'mat', lesson: 'pcbMaterial', def: loc('焊盘铜面上的保护层，防氧化并保证可焊。', 'A protective coat on pad copper that stops oxidation and keeps it solderable.') },
  { zh: 'HASL 喷锡', en: 'Hot-air solder levelling', cat: 'mat', lesson: 'pcbMaterial', def: loc('浸焊锡后用热风吹平；便宜好焊，但表面不平。', 'Dipped in solder and levelled with hot air; cheap and solderable, but not flat.') },
  { zh: 'ENIG 沉金', en: 'Electroless nickel immersion gold', cat: 'mat', lesson: 'pcbMaterial', def: loc('化学镀镍再浸一层薄金；平整，适合 BGA 和细间距。', 'Electroless nickel plus a thin immersion gold; flat, suited to BGA and fine pitch.') },
  { zh: 'OSP 有机保焊膜', en: 'Organic solderability preservative', cat: 'mat', lesson: 'pcbMaterial', def: loc('铜面上一层极薄的有机膜；最便宜、平整，但保存期短。', 'An ultra-thin organic film on the copper; cheapest and flat, but short shelf life.') },
  { zh: '走线', en: 'Trace', cat: 'struct', lesson: 'pcbBasics', def: loc('连接两个焊盘的铜线，宽度决定载流能力。', 'A copper line between pads; its width sets how much current it can carry.') },
  { zh: '焊盘', en: 'Pad', cat: 'struct', lesson: 'pcbBasics', def: loc('零件引脚焊上去的那块铜。', 'The copper area a component lead is soldered to.') },
  { zh: '过孔', en: 'Via', cat: 'struct', lesson: 'pcbStack', def: loc('孔壁镀铜的小孔，把不同层的铜连起来。', 'A small plated hole that connects copper on different layers.') },
  { zh: '孔环', en: 'Annular ring', cat: 'struct', lesson: 'pcbStack', def: loc('焊盘外缘到钻孔边缘那一圈铜，太窄钻偏就会破环。', 'The copper ring between drill edge and pad edge; too narrow and an off-centre drill breaks out.') },
  { zh: '反焊盘', en: 'Antipad', cat: 'struct', lesson: 'pcbStack', def: loc('平面层上为不相连的过孔挖出的空隙。', 'The clearance cut in a plane around a via that must not connect to it.') },
  { zh: '叠层', en: 'Stack-up', cat: 'design', lesson: 'pcbStack', def: loc('各层铜和介质的顺序、厚度与用途。', 'The order, thickness and purpose of every copper and dielectric layer.') },
  { zh: 'HDI 高密度互连', en: 'High-density interconnect', cat: 'struct', lesson: 'pcbStack', def: loc('用激光微孔和逐层积层做出的高密度板。', 'High-density boards built with laser microvias and sequential build-up layers.') },
  { zh: '阻抗控制', en: 'Controlled impedance', cat: 'design', lesson: 'pcbBasics', def: loc('按线宽、介质厚度和介电常数把走线阻抗做到目标值，如 50 Ω。', 'Holding a trace to a target impedance such as 50 Ω through width, dielectric thickness and Dk.') },
  { zh: '位号', en: 'Reference designator', cat: 'design', lesson: 'pcbBasics', def: loc('每个零件的编号，如 R1、C5、U3。', 'The label of each part, such as R1, C5, U3.') },
  { zh: '铺铜', en: 'Copper pour', cat: 'design', lesson: 'pcbBasics', def: loc('把空白区域填满铜并接到某个网络（通常是地）。', 'Filling empty areas with copper tied to a net, usually ground.') },
  { zh: '花焊盘', en: 'Thermal relief', cat: 'design', lesson: 'pcbBasics', def: loc('焊盘只用几根细辐条连到大铜面，焊接时热量不会被铜面吸走。', 'A pad tied to a plane by a few thin spokes, so the plane does not soak up heat during soldering.') },
  { zh: 'Fiducial 标记点', en: 'Fiducial mark', cat: 'design', lesson: 'pcbBasics', def: loc('贴片机相机用来对位的圆形裸铜点。', 'A round bare-copper dot the placement machine camera uses for alignment.') },
  { zh: '测试点', en: 'Test point', cat: 'design', lesson: 'pcbBasics', def: loc('留给探针或飞针接触的裸露焊盘。', 'An exposed pad left for a probe or flying probe to touch.') },
  { zh: '原理图', en: 'Schematic', cat: 'design', lesson: 'pcbFlow', def: loc('用符号和连线表示电路逻辑关系的图。', 'A drawing of the circuit’s logic using symbols and wires.') },
  { zh: '网表', en: 'Netlist', cat: 'file', lesson: 'pcbFlow', def: loc('从原理图导出的「哪些引脚连在一起」清单。', 'The list, exported from the schematic, of which pins connect together.') },
  { zh: '封装', en: 'Footprint', cat: 'design', lesson: 'pcbFlow', def: loc('零件在 PCB 上的焊盘图形、外框和 1 脚标记。', 'A part’s pad pattern, outline and pin-1 mark on the PCB.') },
  { zh: 'DRC 设计规则检查', en: 'Design rule check', cat: 'design', lesson: 'pcbFlow', def: loc('软件自动检查线距、线宽、孔径是否违反规则。', 'Software check of spacing, width and drill against the rules.') },
  { zh: 'Gerber 光绘文件', en: 'Gerber file', cat: 'file', lesson: 'pcbSupply', def: loc('每层图形一份的标准制板文件。', 'The standard fabrication file, one per layer pattern.') },
  { zh: '钻孔文件', en: 'Drill file', cat: 'file', lesson: 'pcbSupply', def: loc('每个孔的坐标和孔径（Excellon 格式）。', 'Coordinates and diameter of every hole (Excellon format).') },
  { zh: 'BOM 物料清单', en: 'Bill of materials', cat: 'file', lesson: 'pcbSupply', def: loc('所有零件的型号、数量和位号清单。', 'The list of every part’s number, quantity and designators.') },
  { zh: '坐标文件', en: 'Pick-and-place file', cat: 'file', lesson: 'pcbSupply', def: loc('每个零件的 X/Y、角度和面，供贴片机使用。', 'Each part’s X/Y, rotation and side, for the placement machine.') },
  { zh: '层压', en: 'Lamination', cat: 'fab', lesson: 'pcbFab', def: loc('高温高压把芯板和 PP 压成一块多层板。', 'Pressing cores and prepreg into one multilayer board under heat and pressure.') },
  { zh: '蚀刻', en: 'Etching', cat: 'fab', lesson: 'pcbFab', def: loc('用药水溶掉不要的铜，留下线路。', 'Dissolving unwanted copper chemically to leave the circuit.') },
  { zh: 'PTH 金属化孔', en: 'Plated through-hole', cat: 'fab', lesson: 'pcbFab', def: loc('钻孔后沉铜电镀，使孔壁导电。', 'A drilled hole made conductive by electroless and electrolytic copper.') },
  { zh: '飞针测试', en: 'Flying probe test', cat: 'fab', lesson: 'pcbFab', def: loc('光板出厂前用移动探针逐个网络测开短路。', 'Moving probes check every net of the bare board for opens and shorts before shipping.') },
  { zh: '拼板', en: 'Panelization', cat: 'asm', lesson: 'pcbSupply', def: loc('把多块小板拼在一张大板上一起生产。', 'Several small boards laid out on one panel to be built together.') },
  { zh: '工艺边', en: 'Breakaway rail', cat: 'asm', lesson: 'pcbSupply', def: loc('拼板两侧留给传送轨道夹持的板边，装配后掰掉。', 'Strips on the panel sides that conveyor rails grip, snapped off after assembly.') },
  { zh: 'SMT 表面贴装', en: 'Surface-mount technology', cat: 'asm', lesson: 'pcbSupply', def: loc('零件贴在板面焊盘上焊接，不穿孔。', 'Parts are soldered onto surface pads without going through holes.') },
  { zh: 'THT 通孔插装', en: 'Through-hole technology', cat: 'asm', lesson: 'pcbSupply', def: loc('零件引脚插进金属化孔再焊。', 'Component leads go through plated holes and are soldered.') },
  { zh: '钢网', en: 'Stencil', cat: 'asm', lesson: 'pcbSupply', def: loc('按焊盘开孔的钢片，用来印刷锡膏。', 'A steel sheet with openings at the pads for printing solder paste.') },
  { zh: '回流焊', en: 'Reflow soldering', cat: 'asm', lesson: 'pcbSupply', def: loc('整板过炉加热，锡膏熔化把贴片零件焊牢。', 'The whole board is heated in an oven so the paste melts and solders the SMT parts.') },
  { zh: '波峰焊', en: 'Wave soldering', cat: 'asm', lesson: 'pcbSupply', def: loc('板子底面掠过熔锡波峰，焊插件零件。', 'The board’s underside passes over a wave of molten solder to solder through-hole parts.') },
  { zh: 'AOI 自动光学检测', en: 'Automated optical inspection', cat: 'asm', lesson: 'pcbSupply', def: loc('相机拍照比对，查缺件、偏位、桥连。', 'Cameras compare images to find missing, shifted or bridged parts.') },
  { zh: 'ICT 在线测试', en: 'In-circuit test', cat: 'asm', lesson: 'pcbSupply', def: loc('针床接触测试点，逐个测元件值和开短路。', 'A bed of nails contacts test points and checks each part value and opens/shorts.') },
  { zh: 'FCT 功能测试', en: 'Functional test', cat: 'asm', lesson: 'pcbSupply', def: loc('给整板上电，按真实功能验证是否工作。', 'Power the whole board and check that it actually works.') },
  { zh: '回流路径', en: 'Return path', cat: 'design', lesson: 'pcbLayout', def: loc('信号电流回到源头所走的路，高速时紧贴在走线下方的平面上。', 'The path signal current takes back to its source; at high speed it runs in the plane right under the trace.') },
  { zh: '去耦电容', en: 'Decoupling capacitor', cat: 'design', lesson: 'pcbLayout', def: loc('靠近芯片电源脚的小电容，就近提供瞬间电流。', 'A small capacitor next to a chip’s power pin that supplies fast current locally.') },
  { zh: 'DFM 可制造性设计', en: 'Design for manufacturing', cat: 'design', lesson: 'pcbDfm', def: loc('让板子在工厂能稳定做出来的设计检查。', 'Design checks so the factory can build the board reliably.') },
  { zh: 'CTI 相对漏电起痕指数', en: 'Comparative tracking index', cat: 'mat', lesson: 'pcbMaterial', def: loc('板材表面抗漏电起痕的等级；数值越高，高压下允许的爬电间距越小。', 'A rating of how well the board surface resists leakage tracking; the higher it is, the smaller the creepage distance a high-voltage design may use.') },
  { zh: '沉银 / 沉锡', en: 'Immersion silver / tin', cat: 'mat', lesson: 'pcbMaterial', def: loc('在铜面化学置换一层薄银或薄锡；平整便宜，但银会变色、锡可能长锡须。', 'A thin silver or tin layer deposited on copper by chemical displacement; flat and cheap, but silver tarnishes and tin can grow whiskers.') },
  { zh: 'Rogers 高频板材', en: 'High-frequency laminate', cat: 'mat', lesson: 'pcbMaterial', def: loc('介电常数稳定、高频损耗低的特种板材，用在射频和高速板上。', 'Specialty laminate with a stable dielectric constant and low high-frequency loss, used on RF and high-speed boards.') },
  { zh: '盲孔 / 埋孔', en: 'Blind / buried via', cat: 'struct', lesson: 'pcbStack', def: loc('盲孔连外层和相邻内层；埋孔只连内层，从板外看不到。', 'A blind via joins an outer layer to an adjacent inner layer; a buried via joins inner layers only and is invisible from outside.') },
  { zh: '微孔', en: 'Microvia', cat: 'struct', lesson: 'pcbStack', def: loc('激光打出的小孔，只跨一两层，是 HDI 板的关键。', 'A laser-drilled small hole spanning only one or two layers; the key feature of HDI boards.') },
  { zh: '锡膏', en: 'Solder paste', cat: 'asm', lesson: 'pcbSupply', def: loc('锡粉加助焊剂调成的膏，经钢网印在焊盘上，回流时熔成焊点。', 'Solder powder mixed with flux into a paste; printed onto pads through the stencil and melted into joints in reflow.') },
  { zh: 'X-ray X 光检测', en: 'X-ray inspection', cat: 'asm', lesson: 'pcbSupply', def: loc('用 X 光看 BGA 底下看不见的焊点，查空洞、桥连和虚焊。', 'X-rays show the joints hidden under a BGA, to find voids, bridges and open joints.') },
  { zh: 'MOQ 最小起订量', en: 'Minimum order quantity', cat: 'file', lesson: 'pcbSupply', def: loc('供应商接单的最低数量；买得比它少，要么不卖，要么加价。', 'The smallest quantity a supplier will sell; below it they either refuse or charge extra.') },
  { zh: 'EOL / NRND 停产与不推荐', en: 'EOL / NRND lifecycle states', cat: 'file', lesson: 'pcbSupply', def: loc('EOL 是停产；NRND 是还能买但不建议用于新设计。BOM 要定期查。', 'EOL means discontinued; NRND means still sold but not recommended for new designs. Check the BOM regularly.') },
  { zh: 'IPC 标准', en: 'IPC standards', cat: 'design', lesson: 'pcbBasics', def: loc('电子互连行业标准；IPC-2221 给线宽、线距和载流经验值，IPC-7351 给封装焊盘尺寸。', 'Electronics interconnect industry standards; IPC-2221 gives trace width, spacing and current rules of thumb, IPC-7351 gives footprint land sizes.') },
  { zh: 'DFA 可装配性设计', en: 'Design for assembly', cat: 'design', lesson: 'pcbDfm', def: loc('让贴片机和焊接炉能顺利装上零件的设计检查，如间距、方向、对位点。', 'Design checks so placement machines and ovens can assemble the parts, such as spacing, orientation and fiducials.') },
  { zh: 'DFT 可测试性设计', en: 'Design for test', cat: 'design', lesson: 'pcbDfm', def: loc('给测试留好接触点和通路，如测试点、调试接口、边界扫描。', 'Leaving contact points and access for test, such as test points, debug headers and boundary scan.') },
  { zh: '芯片封装', en: 'Package', cat: 'struct', lesson: 'pPackage', def: loc('保护裸片并把引脚引出的外壳（QFN、BGA 等）；PCB 上与它对应的是 Footprint，别混。', 'The housing that protects the die and brings out its pins (QFN, BGA…); its counterpart on the PCB is the footprint, do not confuse them.') },
  { zh: 'ATE 自动测试设备', en: 'Automatic test equipment', cat: 'asm', lesson: 'fAte', def: loc('给芯片加激励、测响应的设备；和芯片之间靠负载板或探针卡这类 PCB 连接。', 'Equipment that drives a chip and measures its response; it connects to the chip through PCBs such as a load board or probe card.') },
  { zh: '探针卡', en: 'Probe card', cat: 'asm', lesson: 'connection', def: loc('晶圆测试用的 PCB，装着探针，把测试机通道接到晶圆上的焊盘。', 'The PCB used in wafer test; it carries probe needles that connect tester channels to the pads on the wafer.') },
  { zh: '负载板', en: 'Load board', cat: 'asm', lesson: 'connection', def: loc('ATE 测试头上装 Socket 的多层 PCB，把芯片引脚接到测试通道。', 'The multilayer PCB on the ATE test head carrying the socket, wiring chip pins to tester channels.') },
]

export const TAKEAWAY: LText[] = [
  loc('PCB 四件事：支撑零件、用铜互连、导热散热、地平面和屏蔽罩做屏蔽。', 'A PCB does four things: supports parts, interconnects them in copper, spreads heat, and shields with planes and cans.'),
  loc('层级：系统 → 单板 → 模块 → 元器件；PCB 设计主要在单板这一层。', 'Levels: system → board → module → component; PCB design mostly works at the board level.'),
  loc('单面最便宜但走线不能交叉；双面靠金属化孔换面；多层靠内层平面保证高速信号。', 'Single-sided is cheapest but traces cannot cross; double-sided changes side through plated holes; multilayer relies on inner planes for high-speed signals.'),
  loc('软板用 PI 和压延铜所以能弯；铝基板绝缘层薄且导热，所以 LED 和功率板用它。', 'Flex uses PI and rolled copper, so it bends; aluminium boards have a thin conductive dielectric, so LED and power boards use them.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('芯片底部散热焊盘下打一排过孔，主要是为了？', 'Why put a row of vias under a chip’s exposed pad?'),
    options: [
      { id: 'a', text: loc('增加走线', 'To add more traces') },
      { id: 'b', text: loc('把热量经铜孔壁导到内层地铜散开', 'To conduct heat down copper barrels into inner ground copper') },
      { id: 'c', text: loc('减轻板子重量', 'To make the board lighter') },
    ],
    answer: 'b',
    explain: loc('铜导热约 400 W/m·K，FR-4 只有约 0.3，过孔孔壁是热的捷径。', 'Copper conducts about 400 W/m·K and FR-4 only about 0.3, so the barrels are the heat’s shortcut.'),
  },
  {
    id: 'q2',
    prompt: loc('哪种板子的孔不需要金属化？', 'Which board does not need plated holes?'),
    options: [
      { id: 'a', text: loc('单面板', 'Single-sided') },
      { id: 'b', text: loc('双面板', 'Double-sided') },
      { id: 'c', text: loc('多层板', 'Multilayer') },
    ],
    answer: 'a',
    explain: loc('单面板只有一层铜，孔只是让引脚穿过去在铜面焊接，不用连通两层。', 'With only one copper layer, the hole just lets the lead through to be soldered on the copper side; nothing needs joining.'),
  },
  {
    id: 'q3',
    prompt: loc('手机屏幕排线要反复弯折，最合适的是？', 'A phone display cable bends repeatedly. The best choice is?'),
    options: [
      { id: 'a', text: loc('FR-4 双面板', 'FR-4 double-sided') },
      { id: 'b', text: loc('铝基板', 'Aluminium board') },
      { id: 'c', text: loc('PI 基材 + 压延铜的软板', 'Flex with PI and rolled copper') },
    ],
    answer: 'c',
    explain: loc('PI 薄而韧，压延铜晶粒沿长度方向，耐反复弯折。', 'PI is thin and tough, and rolled copper’s grains run lengthwise, so it survives repeated bending.'),
  },
  {
    id: 'q4',
    prompt: loc('铝基板从上到下的结构是？', 'What is the layer order of an aluminium board, top to bottom?'),
    options: [
      { id: 'a', text: loc('铝 / 铜 / 绝缘层', 'Aluminium / copper / dielectric') },
      { id: 'b', text: loc('铜线路 / 薄导热绝缘层 / 铝板', 'Copper circuit / thin thermal dielectric / aluminium') },
      { id: 'c', text: loc('铜 / 铝 / 铜', 'Copper / aluminium / copper') },
    ],
    answer: 'b',
    explain: loc('铜和铝都导电，中间必须有绝缘层；它做得很薄，热才能快速传到铝板。', 'Copper and aluminium both conduct, so a dielectric must separate them; it is thin so heat reaches the aluminium quickly.'),
  },
  {
    id: 'q5',
    prompt: loc('测试机上的负载板属于哪一类 PCB？', 'What kind of PCB is a tester load board?'),
    options: [
      { id: 'a', text: loc('单面板', 'Single-sided') },
      { id: 'b', text: loc('多层板，常见几十层', 'Multilayer, often dozens of layers') },
      { id: 'c', text: loc('软板', 'Flex') },
    ],
    answer: 'b',
    explain: loc('上千个通道要走线，还要完整的地和电源平面控制阻抗和噪声，只能用多层板。', 'Thousands of channels must be routed, with solid ground and power planes for impedance and noise, so only a multilayer board works.'),
  },
]

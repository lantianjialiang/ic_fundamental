import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const S = {
  kickerChain: loc('产业链', 'Supply chain'),
  kickerRole: loc('公司模式', 'Business model'),
  introTitle: loc('一颗芯片要经过好几家公司', 'One chip passes through several companies'),
  chainTitle: loc('跟着一颗芯片走一遍', 'Follow one chip through the chain'),
  chainNote: loc(
    '点「下一步」或任意一站。金框是两道测试；下面一行是给整条链供货的行业。',
    'Click Next or any stage. Gold frames are the two test steps; the bottom row lists the industries that supply the whole chain.',
  ),
  rolesTitle: loc('四种公司模式：谁做哪一段', 'Four business models: who does which part'),
  rolesNote: loc('点一行看这种公司做什么、举几个例子。', 'Click a row to see what this kind of company does, with examples.'),
  testerTitle: loc('测试工程师站在哪', 'Where the test engineer stands'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '测试在链路上的具体位置、CP / FT 用什么设备，见 {@intro}；探针卡、Socket 怎么接，见 {@connection}。',
    'Exactly where test sits and which equipment CP / FT use: {@intro}. How probe cards and sockets connect: {@connection}.',
  ),
  next: loc('下一课：半导体简史', 'Next: Semiconductor History'),
}

export const INTRO: LText[] = [
  loc(
    '手机里的一颗处理器，通常是 A 公司设计、B 公司在晶圆上造出来、C 公司封装和测试，最后卖给 D 公司装进整机。每家只做自己最擅长的一段。',
    'A phone processor is usually designed by company A, built on wafers by company B, packaged and tested by company C, and finally sold to company D, which puts it into the product. Each company does only the part it is best at.',
  ),
  loc(
    '后面的课会频繁出现 Fabless、Foundry、IDM、OSAT 这些词。本课先把地图和角色认清楚：东西从哪来、交给谁、测试卡在哪两步。',
    'Later lessons use the words Fabless, Foundry, IDM and OSAT all the time. This lesson draws the map first: where things come from, who they go to, and which two steps are test.',
  ),
]

export type StageId = 'design' | 'fab' | 'cp' | 'assy' | 'ft' | 'system'

export type Stage = {
  id: StageId
  title: LText
  who: LText
  /** 这一站交给下一站的东西 */
  output: LText
  text: LText
  test?: boolean
}

export const STAGES: Stage[] = [
  {
    id: 'design',
    title: loc('设计', 'Design'),
    who: loc('Fabless / IDM', 'Fabless / IDM'),
    output: loc('版图数据', 'Layout data'),
    text: loc(
      '定规格、写 RTL、综合、布局布线，最后得到版图（GDSII 等格式）。交给晶圆厂的不是实物，而是一套「要造什么」的数据；晶圆厂据此做光罩。',
      'Define the spec, write RTL, synthesize, place and route, and end up with layout data (GDSII and similar). What goes to the fab is not a physical object but data describing what to build; the fab makes photomasks from it.',
    ),
  },
  {
    id: 'fab',
    title: loc('制造', 'Fabrication'),
    who: loc('Foundry / IDM', 'Foundry / IDM'),
    output: loc('整片晶圆', 'Whole wafers'),
    text: loc(
      '在硅晶圆上反复做薄膜、光刻、刻蚀、掺杂、金属互连，几百道工序、两三个月。产出是一片片晶圆，上面排满还没切开的 die。工艺细节见 {@pSilicon}。',
      'Films, lithography, etch, doping and metal interconnect are repeated on silicon wafers: hundreds of steps over two to three months. The output is wafers covered with dies that have not been cut apart. Process details: {@pSilicon}.',
    ),
  },
  {
    id: 'cp',
    title: loc('CP', 'CP'),
    who: loc('晶圆厂或封测厂', 'Fab or OSAT'),
    output: loc('晶圆 + Bin 图', 'Wafer + bin map'),
    test: true,
    text: loc(
      'Chip Probing（晶圆测试）。探针台带着探针卡扎到每颗 die 的 pad 上，ATE 判好坏，结果记进晶圆 Bin 图。目的是不花钱封装坏 die。',
      'Chip probing (wafer test). A prober drives a probe card onto the pads of each die, the ATE judges pass or fail, and the result goes into the wafer bin map. The goal is to avoid paying to package bad dies.',
    ),
  },
  {
    id: 'assy',
    title: loc('封装', 'Assembly'),
    who: loc('OSAT / IDM', 'OSAT / IDM'),
    output: loc('封装好的芯片', 'Packaged chips'),
    text: loc(
      '按 Bin 图只取好 die：减薄、划片、贴片、打线或倒装、塑封、植球或成型。封装形态见 {@pPackage}。',
      'Using the bin map, take only good dies: thin, dice, attach, wire-bond or flip-chip, mold, then ball-attach or form leads. Package types: {@pPackage}.',
    ),
  },
  {
    id: 'ft',
    title: loc('FT', 'FT'),
    who: loc('OSAT / IDM', 'OSAT / IDM'),
    output: loc('按 Bin 分好的成品', 'Parts sorted by bin'),
    test: true,
    text: loc(
      'Final Test（成品测试）。Handler 把芯片压进 Socket，ATE 测功能、DC、AC，常常还要在高温、低温各测一遍。封装也会做坏，所以封完必须再测。',
      'Final test. A handler presses each chip into a socket and the ATE tests function, DC and AC, often again at hot and cold. Assembly can also break parts, so they must be tested again after packaging.',
    ),
  },
  {
    id: 'system',
    title: loc('系统厂', 'System maker'),
    who: loc('整机 / 模组厂', 'OEM / modules'),
    output: loc('整机', 'Products'),
    text: loc(
      '买芯片焊到电路板上，做成手机、汽车电子、服务器。它们也会抽检来料；坏片流到这里，代价比在 FT 拦住高得多。',
      'Buys chips, solders them onto boards and builds phones, automotive electronics and servers. They also sample incoming parts; a bad part that escapes to this point costs far more than one caught at FT.',
    ),
  },
]

export type SupplyId = 'eda' | 'equip' | 'material'

export const SUPPLY: Array<{ id: SupplyId; title: LText; sub: LText; serves: StageId[]; text: LText }> = [
  {
    id: 'eda',
    title: loc('EDA / IP', 'EDA / IP'),
    sub: loc('设计软件、现成电路模块', 'Design tools, ready-made blocks'),
    serves: ['design'],
    text: loc(
      'EDA 是芯片设计软件（仿真、综合、布局布线、验证）；IP 是可以直接买来用的电路模块，例如 CPU 核、接口 PHY。没有它们，设计公司画不出版图。',
      'EDA is chip design software (simulation, synthesis, place and route, verification); IP is ready-made circuit blocks you can license, such as CPU cores and interface PHYs. Without them, design companies cannot produce layout.',
    ),
  },
  {
    id: 'equip',
    title: loc('设备', 'Equipment'),
    sub: loc('光刻机、刻蚀机、ATE、探针台…', 'Litho, etch, ATE, probers…'),
    serves: ['fab', 'cp', 'assy', 'ft'],
    text: loc(
      '晶圆厂用光刻、刻蚀、薄膜、注入设备；封测厂用划片机、键合机、塑封机；测试用 ATE、探针台、分选机。ATE 这类设备就是本站后面几条轨道的主角。',
      'Fabs use lithography, etch, deposition and implant tools; assembly houses use dicing saws, bonders and molding presses; test uses ATE, probers and handlers. The ATE is the main character of the later tracks on this site.',
    ),
  },
  {
    id: 'material',
    title: loc('材料', 'Materials'),
    sub: loc('硅片、光刻胶、气体、基板…', 'Wafers, resist, gases, substrates…'),
    serves: ['fab', 'assy'],
    text: loc(
      '晶圆厂消耗硅片、光刻胶、特种气体、靶材；封装厂消耗基板、引线框架、键合线、塑封料、焊球。',
      'Fabs consume silicon wafers, photoresist, specialty gases and sputter targets; assembly consumes substrates, lead frames, bond wire, mold compound and solder balls.',
    ),
  },
]

export type RoleId = 'fabless' | 'foundry' | 'idm' | 'osat'

/** 0 = 不做，1 = 部分 / 常见但不总是，2 = 主业 */
export type Cover = 0 | 1 | 2

export const ROLE_COLS: LText[] = [loc('设计', 'Design'), loc('晶圆制造', 'Wafer fab'), loc('封装', 'Assembly'), loc('测试', 'Test')]

export const ROLES: Array<{ id: RoleId; title: LText; full: LText; cover: [Cover, Cover, Cover, Cover]; text: LText; examples: LText }> = [
  {
    id: 'fabless',
    title: loc('Fabless', 'Fabless'),
    full: loc('无晶圆厂设计公司', 'Fabless design house'),
    cover: [2, 0, 0, 1],
    text: loc(
      '只做设计，没有晶圆厂。晶圆交给 Foundry 代工，封测交给 OSAT。测试程序常由自己的产品 / 测试工程师开发，再放到 OSAT 的 ATE 上量产。',
      'Design only, no fab. Wafers are made by a foundry and assembly / test go to an OSAT. The test program is often developed by its own product and test engineers, then run in production on the OSAT’s ATE.',
    ),
    examples: loc('例：高通、英伟达、AMD、联发科', 'e.g. Qualcomm, NVIDIA, AMD, MediaTek'),
  },
  {
    id: 'foundry',
    title: loc('Foundry', 'Foundry'),
    full: loc('晶圆代工厂', 'Pure-play foundry'),
    cover: [0, 2, 1, 1],
    text: loc(
      '只替别人造晶圆，不卖自己品牌的芯片。部分代工厂也提供 CP 和先进封装服务。',
      'Builds wafers for other companies and sells no chips under its own brand. Some foundries also offer CP and advanced packaging.',
    ),
    examples: loc('例：台积电、中芯国际、联电、格芯', 'e.g. TSMC, SMIC, UMC, GlobalFoundries'),
  },
  {
    id: 'idm',
    title: loc('IDM', 'IDM'),
    full: loc('垂直整合制造商', 'Integrated device manufacturer'),
    cover: [2, 2, 1, 2],
    text: loc(
      '设计、制造都自己做，测试通常也自己做；封装可能自有工厂，也可能部分外包。模拟、功率、车规芯片里 IDM 仍然很多。',
      'Does both design and fabrication, and usually its own test; assembly may be in-house or partly outsourced. IDMs are still common in analog, power and automotive chips.',
    ),
    examples: loc('例：英特尔、德州仪器、英飞凌、三星', 'e.g. Intel, Texas Instruments, Infineon, Samsung'),
  },
  {
    id: 'osat',
    title: loc('OSAT', 'OSAT'),
    full: loc('外包封装测试厂', 'Outsourced assembly and test'),
    cover: [0, 0, 2, 2],
    text: loc(
      'Outsourced Semiconductor Assembly and Test。接晶圆进来，做 CP、封装、FT，按 Bin 出货。产线上的测试工程师很多在这里。',
      'Outsourced Semiconductor Assembly and Test. Takes in wafers, runs CP, assembly and FT, and ships by bin. Many production test engineers work here.',
    ),
    examples: loc('例：日月光、安靠、长电科技、通富微电', 'e.g. ASE, Amkor, JCET, TFME'),
  },
]

export const COVER_TEXT: Record<Cover, LText> = {
  0: loc('不做', 'No'),
  1: loc('部分', 'Partly'),
  2: loc('主业', 'Core'),
}

export const TESTER: LText[] = [
  loc(
    '测试工程师常见的三个位置：芯片公司的产品 / 测试开发部门（写程序、做表征），OSAT 或 IDM 的量产测试部门（维护程序、看良率、处理异常），以及 ATE 厂商的应用工程部门（帮客户把程序搭起来）。',
    'Test engineers commonly sit in three places: the product / test development team at a chip company (writing programs and characterizing), the production test team at an OSAT or IDM (maintaining programs, watching yield, handling excursions), and the applications team at an ATE vendor (helping customers bring programs up).',
  ),
  loc(
    '不管在哪，手里的活都绕着同一条主线：规格 → 测法 → 仪器设置 → 程序 → Pass / Fail。这条主线从 {@intro} 开始讲；想先补电学底子，走完本轨道的 {@pParts}、{@pMeasure}。',
    'Wherever they sit, the work follows the same spine: spec → method → instrument setup → program → Pass / Fail. That spine starts in {@intro}; to build the electrical basics first, finish {@pParts} and {@pMeasure} in this track.',
  ),
]

export const TAKEAWAY: LText[] = [
  loc('主线：设计 → 制造 → CP → 封装 → FT → 系统厂。CP 和 FT 是两道测试。', 'The spine: design → fab → CP → assembly → FT → system maker. CP and FT are the two test steps.'),
  loc('Fabless 只设计；Foundry 只代工；IDM 设计制造都做；OSAT 做封装和测试。', 'Fabless only designs; foundries only build wafers; IDMs design and build; OSATs assemble and test.'),
  loc('设计交出去的是数据，晶圆厂交出去的是晶圆，封测厂交出去的是按 Bin 分好的芯片。', 'Design hands over data, the fab hands over wafers, and assembly / test hands over chips sorted by bin.'),
  loc('坏片越晚被发现越贵：CP 省掉封装费，FT 拦住出货，流到系统厂的代价最高。', 'The later a bad part is found, the more it costs: CP saves packaging cost, FT stops shipment, and a part that reaches the system maker costs the most.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('设计公司交给晶圆厂的是什么？', 'What does a design company hand to the fab?'),
    options: [
      { id: 'a', text: loc('一盘已经封装好的样片', 'A tray of packaged samples') },
      { id: 'b', text: loc('版图数据，晶圆厂据此做光罩', 'Layout data, from which the fab makes photomasks') },
      { id: 'c', text: loc('空白硅片', 'Blank silicon wafers') },
    ],
    answer: 'b',
    explain: loc('设计的产出是数据（版图），不是实物；晶圆厂把它变成光罩，再做到晶圆上。', 'Design produces data (layout), not a physical object; the fab turns it into masks and then onto wafers.'),
  },
  {
    id: 'q2',
    prompt: loc('一家公司只做芯片设计，晶圆和封测都外包，它属于？', 'A company only designs chips and outsources both wafers and assembly/test. It is a…'),
    options: [
      { id: 'a', text: loc('IDM', 'IDM') },
      { id: 'b', text: loc('Foundry', 'Foundry') },
      { id: 'c', text: loc('Fabless', 'Fabless') },
    ],
    answer: 'c',
    explain: loc('Fabless = 没有晶圆厂，只做设计。', 'Fabless = no fab, design only.'),
  },
  {
    id: 'q3',
    prompt: loc('OSAT 的主业是？', 'What is an OSAT’s core business?'),
    options: [
      { id: 'a', text: loc('封装和测试', 'Assembly and test') },
      { id: 'b', text: loc('卖 EDA 软件', 'Selling EDA software') },
      { id: 'c', text: loc('拉单晶硅锭', 'Growing silicon ingots') },
    ],
    answer: 'a',
    explain: loc('OSAT = Outsourced Semiconductor Assembly and Test。', 'OSAT = Outsourced Semiconductor Assembly and Test.'),
  },
  {
    id: 'q4',
    prompt: loc('为什么封装前要先做 CP？', 'Why run CP before assembly?'),
    options: [
      { id: 'a', text: loc('CP 能把坏 die 修好', 'CP repairs bad dies') },
      { id: 'b', text: loc('封装要花钱，先挑掉坏 die 就不用封它们', 'Assembly costs money; removing bad dies first means they are not packaged') },
      { id: 'c', text: loc('做过 CP 就不用做 FT', 'After CP, FT is unnecessary') },
    ],
    answer: 'b',
    explain: loc(
      'CP 只判断不修理；它的价值是省掉坏 die 的封装费。封装本身也会出问题，所以 FT 还要再测。',
      'CP judges but does not repair; its value is saving the packaging cost of bad dies. Assembly can introduce faults too, so FT tests again.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('坏片在哪一步被发现，损失最大？', 'Where is finding a bad part most expensive?'),
    options: [
      { id: 'a', text: loc('CP', 'CP') },
      { id: 'b', text: loc('FT', 'FT') },
      { id: 'c', text: loc('已经焊到系统厂的电路板上', 'After it is soldered onto the system maker’s board') },
    ],
    answer: 'c',
    explain: loc(
      '越往后，坏片身上叠加的成本越多（封装、测试、整机、返修、召回），所以测试要尽量早、尽量拦住。',
      'The later it is found, the more cost has piled onto it (assembly, test, the system, rework, recalls), so test aims to catch it early.',
    ),
  },
]

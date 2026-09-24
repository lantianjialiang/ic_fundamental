import { loc, type LText } from '../../../i18n/locale'

export type TermId =
  | 'cp'
  | 'ft'
  | 'ate'
  | 'dut'
  | 'tester'
  | 'loadboard'
  | 'socket'
  | 'probecard'
  | 'handler'
  | 'testprogram'
  | 'testpattern'
  | 'bin'
  | 'yield'

export type ChainId = 'wafer' | 'fab' | 'cp' | 'pkg' | 'ft' | 'product'

export const CHAIN: Array<{ id: ChainId; title: string; subtitle: LText; text: LText }> = [
  {
    id: 'wafer',
    title: 'Wafer',
    subtitle: loc('晶圆', 'Wafer'),
    text: loc(
      '硅片上已经做出成千上万颗尚未分割的芯片。这时看到的还不是一颗封装好的 IC，而是整片晶圆。',
      'The silicon already holds thousands of undiced chips. You are not looking at a packaged IC yet — it is still a whole wafer.',
    ),
  },
  {
    id: 'fab',
    title: 'Wafer Fab',
    subtitle: loc('晶圆制造', 'Wafer fabrication'),
    text: loc(
      'Fab 把电路做到晶圆上。制造完成后，并不知道每一颗 die 是否好用，所以必须测试。',
      'The fab puts the circuit on the wafer. After manufacturing, nobody yet knows which dies work, so they must be tested.',
    ),
  },
  {
    id: 'cp',
    title: 'Wafer Sort / CP',
    subtitle: loc('晶圆测试', 'Wafer test'),
    text: loc(
      'Circuit Probe。在封装前用探针接触晶圆上的 pad，筛掉明显失效的 die，避免把坏 die 送去封装。',
      'Circuit Probe. Probes touch pads on the wafer before packaging, so obviously bad dies are not sent to assembly.',
    ),
  },
  {
    id: 'pkg',
    title: 'Packaging',
    subtitle: loc('封装', 'Assembly'),
    text: loc(
      '把合格 die 封成可以焊接、可以插入 Socket 的器件。封装后才出现引脚、焊球，外形变成学生常见的芯片。',
      'Good dies are packaged so they can be soldered or inserted into a socket. Only then do pins or balls appear — the chip students usually recognize.',
    ),
  },
  {
    id: 'ft',
    title: 'FT',
    subtitle: loc('成品测试', 'Final test'),
    text: loc(
      'Final Test。对封装后的器件做更完整的功能、直流、交流测试，决定能不能出货。',
      'Final Test. Packaged devices get fuller functional, DC, and AC tests that decide whether they may ship.',
    ),
  },
  {
    id: 'product',
    title: 'Final Product',
    subtitle: loc('成品', 'Product'),
    text: loc(
      '通过 FT、打上 Bin 的器件才能进入系统或卖给客户。测试的目的是保证出货质量，不是把芯片“修好”。',
      'Only devices that pass FT and receive a Bin enter a system or go to a customer. Test protects outgoing quality; it does not “repair” the chip.',
    ),
  },
]

export type Term = {
  id: TermId
  name: string
  full: LText | string
  text: LText
  image: string
  caption: LText
  credit: LText | string
}

export const TERMS: Term[] = [
  {
    id: 'cp',
    name: 'CP',
    full: 'Circuit Probe / Wafer Sort',
    text: loc(
      '封装前的晶圆测试。DUT 是晶圆上的 die，接触件是 Probe Card 和探针，没有 Socket。',
      'Wafer test before packaging. The DUT is a die on the wafer. The contact is a probe card and needles — no socket.',
    ),
    image: '/glossary/cp.jpg',
    caption: loc(
      '晶圆探针台：中间是放晶圆的 chuck，上方是显微镜。量产 CP 用更大的 Wafer Prober，但接触方式一样——探针扎 pad，不是插 Socket。',
      'A wafer probe station: the chuck holds the wafer, the microscope sits above. Production CP uses a larger prober, but contact is the same — needles on pads, not a socket.',
    ),
    credit: 'Wikimedia Commons · Micromanipulator P300J Wafer Probe Station · CC BY-SA',
  },
  {
    id: 'ft',
    name: 'FT',
    full: 'Final Test',
    text: loc(
      '封装后的成品测试。DUT 是 packaged device，通常经过 Handler、Load Board 和 Socket 接到 ATE。',
      'Final test after packaging. The DUT is a packaged device, usually reached through a handler, load board, and socket.',
    ),
    image: '/glossary/ft.svg',
    caption: loc(
      'FT 叠层：DUT 在上，经过 Socket 和 Load Board 接到下方 ATE。测的是已封装器件，没有晶圆，也没有 Probe Card。',
      'FT stack: DUT on top, through socket and load board to the ATE below. The DUT is packaged. No wafer, no probe card.',
    ),
    credit: loc('本课示意图，对应下一课 3D 叠层', 'Lesson diagram, matches the next 3D stack'),
  },
  {
    id: 'ate',
    name: 'ATE',
    full: 'Automatic Test Equipment',
    text: loc(
      '自动测试设备。按 Test Program 产生激励、测量响应、控制时序，并给出 Pass / Fail。它不是示波器，也不是万用表。',
      'Automatic Test Equipment. It applies stimulus, measures response, controls timing, and issues Pass / Fail from a test program. It is not a scope and not a DMM.',
    ),
    image: '/glossary/ate.svg',
    caption: loc(
      '量产 ATE 是机柜 + 测试头。DUT 不插在机柜上，而是经 Test Head → Load Board → Socket（或 Probe Card）到达。',
      'A production ATE is a cabinet plus a test head. The DUT does not plug into the cabinet; it is reached through Test Head → Load Board → Socket (or Probe Card).',
    ),
    credit: loc(
      '本课示意图。开放图库几乎没有可授权的量产 ATE 照片，不用实验室源表或 1960 年代展台冒充。',
      'Lesson diagram. Freely licensed production ATE photos are rare; we do not fake them with a lab SMU or a 1960s booth.',
    ),
  },
  {
    id: 'dut',
    name: 'DUT',
    full: 'Device Under Test',
    text: loc(
      '正在被测的对象。CP 时是晶圆上的 die；FT 时是封装后的芯片。不要把 DUT 理解成“裸芯片永远等于封装器件”。',
      'The device being tested. In CP it is a die on the wafer; in FT it is a packaged chip. DUT is not always “the packaged IC”.',
    ),
    image: '/glossary/dut.jpg',
    caption: loc(
      '一颗封装 IC。在 FT 里它就是 DUT；在 CP 里 DUT 则是晶圆上的那一颗 die。',
      'A packaged IC. In FT this is the DUT. In CP the DUT is that one die on the wafer.',
    ),
    credit: 'Wikimedia Commons · Integrated circuit on microchip',
  },
  {
    id: 'tester',
    name: 'Tester',
    full: loc('测试机 / ATE 主机', 'Tester / ATE mainframe'),
    text: loc(
      '工业界常把 ATE 主机叫 Tester。它提供 Channel、电源、测时和测压能力。DUT 并不直接插在 Tester 机箱上。',
      'Industry often calls the ATE mainframe the Tester. It provides channels, supplies, timing, and voltage measurement. The DUT does not plug into that box.',
    ),
    image: '/glossary/tester.png',
    caption: loc(
      '测试头接口特写：密密的弹簧针和通道孔。Channel 从这里出去，再接到 Load Board，而不是直接扎到芯片上。',
      'Test-head interface: dense pogo pins and channel holes. Channels leave here to the load board; they do not stab the chip directly.',
    ),
    credit: loc(
      '教学示意：测试头弹簧针 / 通道孔接口，不是实验室台式源表',
      'Teaching image: test-head pogo / channel interface, not a bench SMU',
    ),
  },
  {
    id: 'loadboard',
    name: 'Load Board',
    full: loc('测试负载板', 'DUT interface board'),
    text: loc(
      '专门为测试设计的 PCB。把 Tester Channel 布线到 DUT 引脚，并提供电源、地和必要外围电路。',
      'A PCB designed for test. It routes tester channels to DUT pins and provides power, ground, and needed support circuitry.',
    ),
    image: '/glossary/loadboard.svg',
    caption: loc(
      'Load Board 不是普通产品主板。一侧是 Tester 连接器，中间是 Socket 焊盘，黄线是走线，蓝点是过孔到内层。',
      'A load board is not a product motherboard. One side is the tester connector, the center is the socket site, gold lines are tracks, blue dots are vias.',
    ),
    credit: loc('本课示意图，对应下一课多层 PCB 走线', 'Lesson diagram, matches the multilayer PCB path'),
  },
  {
    id: 'socket',
    name: 'Socket',
    full: loc('测试插座', 'Test socket'),
    text: loc(
      'FT 用的机械 + 电气接口。让封装器件可以反复插拔，并把 pin / ball 可靠地接到 Load Board。',
      'The mechanical and electrical interface for FT. A packaged device can be inserted many times, and pins or balls meet the load board reliably.',
    ),
    image: '/glossary/socket.png',
    caption: loc(
      '翻盖式芯片插座。量产 FT Socket 结构更复杂，但目的相同：反复接触封装引脚，而不焊接。',
      'A clamshell IC socket. Production FT sockets are more complex, but the job is the same: repeatable contact without soldering.',
    ),
    credit: 'Wikimedia Commons · M4050 Clamshell Socket',
  },
  {
    id: 'probecard',
    name: 'Probe Card',
    full: loc('探针卡', 'Probe card'),
    text: loc(
      'CP 用的接口板。它代替 Socket：一端接 Tester，另一端用探针扎到晶圆 pad 上。',
      'The CP interface board. It replaces the socket: one side meets the tester, the other side needles the wafer pads.',
    ),
    image: '/glossary/probecard.jpg',
    caption: loc(
      'CIS 探针卡针区：每个圆窗里是一丛探针。针朝向晶圆，板的另一面再接到 Tester。',
      'CIS probe-card needle field: each window holds a bundle of probes. Needles face the wafer; the other side of the card meets the tester.',
    ),
    credit: 'Wikimedia Commons · CIS probe card · CC BY-SA 4.0 · Jasycheng',
  },
  {
    id: 'handler',
    name: 'Handler',
    full: loc('分选机', 'Handler'),
    text: loc(
      'FT 产线设备。自动把器件送进 Socket、测试完按 Bin 分拣。教学上先记住：Handler 负责“搬运和分类”，ATE 负责“测量和判定”。',
      'FT floor equipment. It loads devices into the socket and sorts them by Bin after test. Remember: the handler moves and sorts; the ATE measures and judges.',
    ),
    image: '/glossary/handler.svg',
    caption: loc(
      'Handler 从料盘抓取 DUT、压进 Socket，再按 Bin 1 / 2 / 6 分到不同出口。它不测电，只搬运和分类。',
      'The handler picks a DUT from a tray, presses it into the socket, then sorts to Bin 1 / 2 / 6. It does not measure; it only moves and classifies.',
    ),
    credit: loc(
      '本课示意图。开放图库没有可授权的量产分选机照片。',
      'Lesson diagram. No freely licensed production-handler photo was available.',
    ),
  },
  {
    id: 'testprogram',
    name: 'Test Program',
    full: loc('测试程序', 'Test program'),
    text: loc(
      '跑在 Tester / 工控机上的程序。它决定测什么、用哪个 Channel、限值是多少、失败进哪个 Bin。没有 Test Program，ATE 只是一台不会自己思考的机器。',
      'The program on the tester or workstation. It chooses tests, channels, limits, and fail bins. Without it the ATE does not decide anything.',
    ),
    image: '/glossary/testprogram.svg',
    caption: loc(
      '测试程序界面示意：左边是测试项，中间是限值和测量值，右边是 Bin。程序跑在工控机上，不在 DUT 里。',
      'A test-program UI: items on the left, limits and measured values in the center, bins on the right. The program runs on the controller, not inside the DUT.',
    ),
    credit: loc('本课示意图', 'Lesson diagram'),
  },
  {
    id: 'testpattern',
    name: 'Test Pattern',
    full: loc('测试向量 / 图形', 'Test vectors / pattern'),
    text: loc(
      '数字测试里发给 DUT 的 0/1 序列，以及期望的输出。Pattern 描述“这一拍各 pin 是驱动还是比较”，不是波形图本身。',
      'The 0/1 sequence driven to the DUT, plus the expected outputs. A pattern says, per cycle, which pins drive and which compare. It is not the waveform picture itself.',
    ),
    image: '/glossary/pattern.svg',
    caption: loc(
      '每一行是一个 cycle。1/0 = 驱动，H/L = 期望比较，X = 不比较。真实 Pattern 文件更长，逻辑就是这样。',
      'Each row is one cycle. 1/0 = drive, H/L = expect, X = mask. Real pattern files are longer; the idea is the same.',
    ),
    credit: loc('本课示意图', 'Lesson diagram'),
  },
  {
    id: 'bin',
    name: 'Bin',
    full: loc('分档 / 分选结果', 'Sort result'),
    text: loc(
      '每颗 DUT 测完会得到一个 Bin 号。例如 Pass、功能失败、直流失败。Handler 按 Bin 把器件分到不同料管或托盘。',
      'Each DUT gets a Bin number: Pass, functional fail, DC fail, and so on. The handler sorts parts into tubes or trays by that number.',
    ),
    image: '/glossary/bin.svg',
    caption: loc(
      '晶圆 Bin 图：绿 = Pass，红 = 功能失败，黄 = 直流失败。颜色是判定结果，不是芯片外观。',
      'Wafer bin map: green = Pass, red = functional fail, yellow = DC fail. Colors are decisions, not the look of the silicon.',
    ),
    credit: loc('本课示意图', 'Lesson diagram'),
  },
  {
    id: 'yield',
    name: 'Yield',
    full: loc('良率', 'Yield'),
    text: loc(
      '合格数量 / 测试数量。CP Yield 看晶圆上好 die 比例；FT Yield 看封装后还能过测试的比例。Yield 是质量与成本的核心指标。',
      'Pass count / tested count. CP yield is good dies on the wafer; FT yield is packaged parts that still pass. Yield is a core quality and cost number.',
    ),
    image: '/glossary/yield.svg',
    caption: loc(
      '同一张 Bin 图加上数字：Yield = 合格数 / 测试数。格子是 die，颜色是判定，百分比才是良率。',
      'The same bin map with a number: Yield = pass / tested. Squares are dies, colors are decisions, the percentage is yield.',
    ),
    credit: loc('本课示意图。对照词条 Bin 看颜色含义。', 'Lesson diagram. See Bin for what the colors mean.'),
  },
]

export const CHIP_TYPES = [
  {
    id: 'digital',
    name: 'Digital',
    title: loc('数字芯片', 'Digital ICs'),
    examples: loc('MCU、SoC、FPGA、逻辑 ASIC', 'MCU, SoC, FPGA, logic ASIC'),
    params: [
      loc('VIH / VIL'),
      loc('VOH / VOL'),
      loc('Idd'),
      loc('功能 Pattern', 'Functional pattern'),
      loc('Setup / Hold（后续）', 'Setup / Hold (later)'),
    ],
    theory: loc(
      '逻辑电平、时序、扫描/DFT 以后再学。先建立：数字测试大量依赖 Pattern。',
      'Logic levels, timing, and scan/DFT come later. First idea: digital test leans on patterns.',
    ),
  },
  {
    id: 'analog',
    name: 'Analog',
    title: loc('模拟芯片', 'Analog ICs'),
    examples: loc('LDO、运放、ADC / DAC、电源管理', 'LDO, op-amp, ADC / DAC, power management'),
    params: [loc('Offset'), loc('Gain'), loc('INL / DNL'), loc('Iq'), loc('纹波 / PSRR', 'Ripple / PSRR')],
    theory: loc(
      '连续量、精度和噪声。主要用直流源表和采样，而不是大海量数字 Pattern。',
      'Continuous values, accuracy, and noise. Mostly DC source-measure and sampling, not huge digital patterns.',
    ),
  },
  {
    id: 'memory',
    name: 'Memory',
    title: loc('存储芯片', 'Memory ICs'),
    examples: loc('DRAM、SRAM、Flash、EEPROM'),
    params: [
      loc('March 算法', 'March algorithms'),
      loc('Retention'),
      loc('漏电', 'Leakage'),
      loc('地址译码', 'Address decode'),
      loc('Repair / 冗余', 'Repair / redundancy'),
    ],
    theory: loc(
      '阵列、地址、良率修复。测试时间和解法与逻辑芯片很不一样。',
      'Arrays, addresses, and yield repair. Time and methods differ from logic chips.',
    ),
  },
  {
    id: 'rf',
    name: 'RF',
    title: loc('射频芯片', 'RF ICs'),
    examples: loc('PA、LNA、Transceiver、Wi-Fi / 5G RF'),
    params: [
      loc('功率', 'Power'),
      loc('EVM'),
      loc('S 参数', 'S-parameters'),
      loc('噪声系数', 'Noise figure'),
      loc('频率 / 谐波', 'Frequency / harmonics'),
    ],
    theory: loc(
      '高频路径、阻抗和调制质量。需要 RF 仪器与校准，不是普通数字 Channel 能直接替代。',
      'RF paths, impedance, and modulation quality. You need RF instruments and calibration; a digital channel is not a substitute.',
    ),
  },
] as const

export type DiagramId =
  | 'program'
  | 'controller'
  | 'ate'
  | 'pe'
  | 'pmu'
  | 'loadboard'
  | 'socket'
  | 'dut'
  | 'result'

export const DIAGRAM: Array<{ id: DiagramId; title: string; text: LText }> = [
  {
    id: 'program',
    title: 'Test Program',
    text: loc(
      '告诉 Tester 测哪些项目、限值、时序和 Bin。本节只建立它的位置：程序在最上面指挥整台系统。',
      'Tells the tester which items, limits, timing, and bins to use. This lesson only places it: the program sits at the top and commands the system.',
    ),
  },
  {
    id: 'controller',
    title: 'PC / Test Controller',
    text: loc(
      '工控机或工作站加载 Test Program，把命令发给 ATE。学生先记住：人写程序，控制器执行，不是在 DUT 里写程序。',
      'A workstation loads the test program and sends commands to the ATE. People write the program; the controller runs it. It is not written inside the DUT.',
    ),
  },
  {
    id: 'ate',
    title: 'ATE',
    text: loc(
      '测试主机。内部至少有两类资源：Pin Electronics（数字通道）和 PMU（精密测电压/电流）。细节下一阶段再讲。',
      'The tester mainframe. It has at least two resources: Pin Electronics (digital channels) and a PMU (precision V/I). Details come later.',
    ),
  },
  {
    id: 'pe',
    title: 'Pin Electronics',
    text: loc(
      '每个数字 Channel 的驱动/比较电路。现在只要知道：数字 pin 的 0/1 从这里进出。不要先学 Strobe、Timing。',
      'Drive and compare circuits for each digital channel. For now: digital 0/1 enter and leave here. Do not learn Strobe or Timing yet.',
    ),
  },
  {
    id: 'pmu',
    title: 'PMU',
    text: loc(
      'Parametric Measurement Unit，精密源表。用来测漏电、电压、电流等直流参数。现在只要知道它和 Pin Electronics 并列存在。',
      'Parametric Measurement Unit — a precision source-measure unit for leakage, voltage, and current. For now, just know it sits beside Pin Electronics.',
    ),
  },
  {
    id: 'loadboard',
    title: 'Load Board',
    text: loc(
      '把 ATE 的 Channel / PMU 接到 DUT 封装。没有这块板，Tester 到不了芯片引脚。',
      'Connects ATE channels and the PMU to the DUT package. Without this board the tester never reaches the pins.',
    ),
  },
  {
    id: 'socket',
    title: 'Socket',
    text: loc(
      'FT 时 DUT 坐在 Socket 里。CP 没有 Socket，这一层会换成 Probe Card。',
      'In FT the DUT sits in a socket. CP has no socket; this layer becomes a probe card.',
    ),
  },
  {
    id: 'dut',
    title: 'DUT',
    text: loc(
      '被测器件。它被激励、被测量，然后得到 Pass / Fail，而不是“被修理”。',
      'The device under test. It is stimulated and measured, then judged Pass / Fail — not repaired.',
    ),
  },
  {
    id: 'result',
    title: 'Pass / Fail',
    text: loc(
      '比较测量结果和限值后的判定。Fail 会进入某个 Bin。这是测试的输出，不是波形本身。',
      'The decision after comparing a measurement to a limit. Fail goes to a Bin. This is the output of test, not the waveform itself.',
    ),
  },
]

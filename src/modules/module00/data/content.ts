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

export const CHAIN: Array<{ id: ChainId; title: string; subtitle: string; text: string }> = [
  {
    id: 'wafer',
    title: 'Wafer',
    subtitle: '晶圆',
    text: '硅片上已经做出成千上万颗尚未分割的芯片。这时看到的还不是一颗封装好的 IC，而是整片晶圆。',
  },
  {
    id: 'fab',
    title: 'Wafer Fab',
    subtitle: '晶圆制造',
    text: 'Fab 把电路做到晶圆上。制造完成后，并不知道每一颗 die 是否好用，所以必须测试。',
  },
  {
    id: 'cp',
    title: 'Wafer Sort / CP',
    subtitle: '晶圆测试',
    text: 'Circuit Probe。在封装前用探针接触晶圆上的 pad，筛掉明显失效的 die，避免把坏 die 送去封装。',
  },
  {
    id: 'pkg',
    title: 'Packaging',
    subtitle: '封装',
    text: '把合格 die 封成可以焊接、可以插入 Socket 的器件。封装后才出现引脚、焊球，外形变成学生常见的芯片。',
  },
  {
    id: 'ft',
    title: 'FT',
    subtitle: '成品测试',
    text: 'Final Test。对封装后的器件做更完整的功能、直流、交流测试，决定能不能出货。',
  },
  {
    id: 'product',
    title: 'Final Product',
    subtitle: '成品',
    text: '通过 FT、打上 Bin 的器件才能进入系统或卖给客户。测试的目的是保证出货质量，不是把芯片“修好”。',
  },
]

export type Term = {
  id: TermId
  name: string
  full: string
  text: string
  image: string
  caption: string
  credit: string
}

export const TERMS: Term[] = [
  {
    id: 'cp',
    name: 'CP',
    full: 'Circuit Probe / Wafer Sort',
    text: '封装前的晶圆测试。DUT 是晶圆上的 die，接触件是 Probe Card 和探针，没有 Socket。',
    image: '/glossary/cp.jpg',
    caption: '晶圆探针台：中间是放晶圆的 chuck，上方是显微镜。量产 CP 用更大的 Wafer Prober，但接触方式一样——探针扎 pad，不是插 Socket。',
    credit: 'Wikimedia Commons · Micromanipulator P300J Wafer Probe Station · CC BY-SA',
  },
  {
    id: 'ft',
    name: 'FT',
    full: 'Final Test',
    text: '封装后的成品测试。DUT 是 packaged device，通常经过 Handler、Load Board 和 Socket 接到 ATE。',
    image: '/glossary/ft.svg',
    caption: 'FT 叠层：DUT 在上，经过 Socket 和 Load Board 接到下方 ATE。测的是已封装器件，没有晶圆，也没有 Probe Card。',
    credit: '本课示意图，对应下一课 3D 叠层',
  },
  {
    id: 'ate',
    name: 'ATE',
    full: 'Automatic Test Equipment',
    text: '自动测试设备。按 Test Program 产生激励、测量响应、控制时序，并给出 Pass / Fail。它不是示波器，也不是万用表。',
    image: '/glossary/ate.svg',
    caption: '量产 ATE 是机柜 + 测试头。DUT 不插在机柜上，而是经 Test Head → Load Board → Socket（或 Probe Card）到达。',
    credit: '本课示意图。开放图库几乎没有可授权的量产 ATE 照片，不用实验室源表或 1960 年代展台冒充。',
  },
  {
    id: 'dut',
    name: 'DUT',
    full: 'Device Under Test',
    text: '正在被测的对象。CP 时是晶圆上的 die；FT 时是封装后的芯片。不要把 DUT 理解成“裸芯片永远等于封装器件”。',
    image: '/glossary/dut.jpg',
    caption: '一颗封装 IC。在 FT 里它就是 DUT；在 CP 里 DUT 则是晶圆上的那一颗 die。',
    credit: 'Wikimedia Commons · Integrated circuit on microchip',
  },
  {
    id: 'tester',
    name: 'Tester',
    full: '测试机 / ATE 主机',
    text: '工业界常把 ATE 主机叫 Tester。它提供 Channel、电源、测时和测压能力。DUT 并不直接插在 Tester 机箱上。',
    image: '/glossary/tester.png',
    caption: '测试头接口特写：密密的弹簧针和通道孔。Channel 从这里出去，再接到 Load Board，而不是直接扎到芯片上。',
    credit: '教学示意：测试头弹簧针 / 通道孔接口，不是实验室台式源表',
  },
  {
    id: 'loadboard',
    name: 'Load Board',
    full: '测试负载板',
    text: '专门为测试设计的 PCB。把 Tester Channel 布线到 DUT 引脚，并提供电源、地和必要外围电路。',
    image: '/glossary/loadboard.svg',
    caption: 'Load Board 不是普通产品主板。一侧是 Tester 连接器，中间是 Socket 焊盘，黄线是走线，蓝点是过孔到内层。',
    credit: '本课示意图，对应下一课多层 PCB 走线',
  },
  {
    id: 'socket',
    name: 'Socket',
    full: '测试插座',
    text: 'FT 用的机械 + 电气接口。让封装器件可以反复插拔，并把 pin / ball 可靠地接到 Load Board。',
    image: '/glossary/socket.png',
    caption: '翻盖式芯片插座。量产 FT Socket 结构更复杂，但目的相同：反复接触封装引脚，而不焊接。',
    credit: 'Wikimedia Commons · M4050 Clamshell Socket',
  },
  {
    id: 'probecard',
    name: 'Probe Card',
    full: '探针卡',
    text: 'CP 用的接口板。它代替 Socket：一端接 Tester，另一端用探针扎到晶圆 pad 上。',
    image: '/glossary/probecard.jpg',
    caption: 'CIS 探针卡针区：每个圆窗里是一丛探针。针朝向晶圆，板的另一面再接到 Tester。',
    credit: 'Wikimedia Commons · CIS probe card · CC BY-SA 4.0 · Jasycheng',
  },
  {
    id: 'handler',
    name: 'Handler',
    full: '分选机',
    text: 'FT 产线设备。自动把器件送进 Socket、测试完按 Bin 分拣。教学上先记住：Handler 负责“搬运和分类”，ATE 负责“测量和判定”。',
    image: '/glossary/handler.svg',
    caption: 'Handler 从料盘抓取 DUT、压进 Socket，再按 Bin 1 / 2 / 6 分到不同出口。它不测电，只搬运和分类。',
    credit: '本课示意图。开放图库没有可授权的量产分选机照片。',
  },
  {
    id: 'testprogram',
    name: 'Test Program',
    full: '测试程序',
    text: '跑在 Tester / 工控机上的程序。它决定测什么、用哪个 Channel、限值是多少、失败进哪个 Bin。没有 Test Program，ATE 只是一台不会自己思考的机器。',
    image: '/glossary/testprogram.svg',
    caption: '测试程序界面示意：左边是测试项，中间是限值和测量值，右边是 Bin。程序跑在工控机上，不在 DUT 里。',
    credit: '本课示意图',
  },
  {
    id: 'testpattern',
    name: 'Test Pattern',
    full: '测试向量 / 图形',
    text: '数字测试里发给 DUT 的 0/1 序列，以及期望的输出。Pattern 描述“这一拍各 pin 是驱动还是比较”，不是波形图本身。',
    image: '/glossary/pattern.svg',
    caption: '每一行是一个 cycle。1/0 = 驱动，H/L = 期望比较，X = 不比较。真实 Pattern 文件更长，逻辑就是这样。',
    credit: '本课示意图',
  },
  {
    id: 'bin',
    name: 'Bin',
    full: '分档 / 分选结果',
    text: '每颗 DUT 测完会得到一个 Bin 号。例如 Pass、功能失败、直流失败。Handler 按 Bin 把器件分到不同料管或托盘。',
    image: '/glossary/bin.svg',
    caption: '晶圆 Bin 图：绿 = Pass，红 = 功能失败，黄 = 直流失败。颜色是判定结果，不是芯片外观。',
    credit: '本课示意图',
  },
  {
    id: 'yield',
    name: 'Yield',
    full: '良率',
    text: '合格数量 / 测试数量。CP Yield 看晶圆上好 die 比例；FT Yield 看封装后还能过测试的比例。Yield 是质量与成本的核心指标。',
    image: '/glossary/yield.svg',
    caption: '同一张 Bin 图加上数字：Yield = 合格数 / 测试数。格子是 die，颜色是判定，百分比才是良率。',
    credit: '本课示意图。对照词条 Bin 看颜色含义。',
  },
]

export const CHIP_TYPES = [
  {
    id: 'digital',
    name: 'Digital',
    title: '数字芯片',
    examples: 'MCU、SoC、FPGA、逻辑 ASIC',
    params: ['VIH / VIL', 'VOH / VOL', 'Idd', '功能 Pattern', 'Setup / Hold（后续）'],
    theory: '逻辑电平、时序、扫描/DFT 以后再学。先建立：数字测试大量依赖 Pattern。',
  },
  {
    id: 'analog',
    name: 'Analog',
    title: '模拟芯片',
    examples: 'LDO、运放、ADC / DAC、电源管理',
    params: ['Offset', 'Gain', 'INL / DNL', 'Iq', '纹波 / PSRR'],
    theory: '连续量、精度和噪声。主要用直流源表和采样，而不是大海量数字 Pattern。',
  },
  {
    id: 'memory',
    name: 'Memory',
    title: '存储芯片',
    examples: 'DRAM、SRAM、Flash、EEPROM',
    params: ['March 算法', 'Retention', '漏电', '地址译码', 'Repair / 冗余'],
    theory: '阵列、地址、良率修复。测试时间和解法与逻辑芯片很不一样。',
  },
  {
    id: 'rf',
    name: 'RF',
    title: '射频芯片',
    examples: 'PA、LNA、Transceiver、Wi-Fi / 5G RF',
    params: ['功率', 'EVM', 'S 参数', '噪声系数', '频率 / 谐波'],
    theory: '高频路径、阻抗和调制质量。需要 RF 仪器与校准，不是普通数字 Channel 能直接替代。',
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

export const DIAGRAM: Array<{ id: DiagramId; title: string; text: string }> = [
  {
    id: 'program',
    title: 'Test Program',
    text: '告诉 Tester 测哪些项目、限值、时序和 Bin。本节只建立它的位置：程序在最上面指挥整台系统。',
  },
  {
    id: 'controller',
    title: 'PC / Test Controller',
    text: '工控机或工作站加载 Test Program，把命令发给 ATE。学生先记住：人写程序，控制器执行，不是在 DUT 里写程序。',
  },
  {
    id: 'ate',
    title: 'ATE',
    text: '测试主机。内部至少有两类资源：Pin Electronics（数字通道）和 PMU（精密测电压/电流）。细节下一阶段再讲。',
  },
  {
    id: 'pe',
    title: 'Pin Electronics',
    text: '每个数字 Channel 的驱动/比较电路。现在只要知道：数字 pin 的 0/1 从这里进出。不要先学 Strobe、Timing。',
  },
  {
    id: 'pmu',
    title: 'PMU',
    text: 'Parametric Measurement Unit，精密源表。用来测漏电、电压、电流等直流参数。现在只要知道它和 Pin Electronics 并列存在。',
  },
  {
    id: 'loadboard',
    title: 'Load Board',
    text: '把 ATE 的 Channel / PMU 接到 DUT 封装。没有这块板，Tester 到不了芯片引脚。',
  },
  {
    id: 'socket',
    title: 'Socket',
    text: 'FT 时 DUT 坐在 Socket 里。CP 没有 Socket，这一层会换成 Probe Card。',
  },
  {
    id: 'dut',
    title: 'DUT',
    text: '被测器件。它被激励、被测量，然后得到 Pass / Fail，而不是“被修理”。',
  },
  {
    id: 'result',
    title: 'Pass / Fail',
    text: '比较测量结果和限值后的判定。Fail 会进入某个 Bin。这是测试的输出，不是波形本身。',
  },
]

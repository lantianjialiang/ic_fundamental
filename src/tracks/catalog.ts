import { loc, type LText } from '../i18n/locale'
import { type ModuleId } from '../modules/catalog'

export type TrackId =
  | 'digital'
  | 'fund'
  | 'bench'
  | 'analog'
  | 'memory'
  | 'rf'
  | 'hs'
  | 'power'
  | 'sensor'
  | 'qual'
  | 'cpo'

export const TRACKS: Array<{
  id: TrackId
  title: LText
  blurb: LText
  ready: boolean
  lessons: ModuleId[]
  knowledge: Array<{ title: LText; text: LText }>
}> = [
  {
    id: 'digital',
    title: loc('基础 / 数字'),
    blurb: loc('测什么、接到哪，再进 MCU / 逻辑的 DC、功能、Scan。现课 {@intro}–{@latch}，实验 {@bench}。'),
    ready: true,
    lessons: [
      'intro',
      'connection',
      'ate',
      'pmu',
      'spec',
      'dc',
      'func',
      'timing',
      'ac',
      'vector',
      'scan',
      'program',
      'debug',
      'shmoo',
      'alu',
      'latch',
      'bench',
    ],
    knowledge: [
      { title: loc('产业位置'), text: loc('现 {@intro}。CP / FT、ATE、DUT、Bin、Yield。') },
      { title: loc('物理连接'), text: loc('现 {@connection}。仪器 → 板 → 座或探针 → DUT。') },
      { title: loc('规格变成测试'), text: loc('现 {@spec}。主线：Datasheet → Spec → Method → Program → 结果。') },
      { title: loc('0/1 不是物理量'), text: loc('现 {@pmu}。PMU、电压电流、开短路。') },
      { title: loc('通道'), text: loc('Driver / Comparator / Timing / Level。{@ate}。') },
      { title: loc('数字 DC'), text: loc('VIH/VIL、VOH@IOH、Source / Sink。{@dc}。') },
      { title: loc('功能与时间'), text: loc('真值表、Pattern、Strobe、Setup / Hold、tpd。{@func}–{@ac}。拧旋钮见 {@bench}。') },
      { title: loc('交互实验'), text: loc('现 {@bench}。自己设 Period / Drive / Delay / Strobe，以及 Leakage 限流。') },
      { title: loc('向量与 Scan'), text: loc('穷举会爆、ATPG、Shift → Capture → Compare。{@vector}–{@scan}。') },
      { title: loc('程序与表征'), text: loc('Flow、Bin、Debug、Shmoo、ALU。{@program}–{@alu}。') },
      { title: loc('可靠性入口'), text: loc('现 {@latch} Latch-up。完整 ESD / 老化 / 车规见可靠性轨道。') },
    ],
  },
  {
    id: 'fund',
    title: loc('数字测试基础'),
    blurb: loc('从欧姆定律和逻辑门讲起，按量产程序的顺序走完开短路、DC、功能、AC，再到表征、向量、写程序、排错和文档。'),
    ready: true,
    lessons: [
      'fBasics',
      'fAte',
      'fIntro',
      'fSpec',
      'fOpens',
      'fDc',
      'fFunc',
      'fAc',
      'fChar',
      'fVector',
      'fProgram',
      'fCreate',
      'fDebug',
      'fQualify',
      'fLatch',
      'fScan',
    ],
    knowledge: [
      { title: loc('电学与逻辑底子'), text: loc('V = I·R、进制、逻辑电平和噪声容限、门电路、D 触发器。{@fBasics}。') },
      { title: loc('芯片从哪来，测试机长什么样'), text: loc('晶圆、Die、封装；探针台、分选机、负载板；四类测试机。{@fAte}。') },
      { title: loc('测试系统里面'), text: loc('DPS、RVS、PMU、管脚电子；Force / Measure、钳位、Kelvin。{@fIntro}。') },
      { title: loc('规格书是合同'), text: loc('设计规格、测试规格、数据手册各写给谁。条件 + 极限 = 一条测试。{@fSpec}。') },
      { title: loc('先确认接上了'), text: loc('PMU 打 ±100 µA，读保护二极管约 0.65 V。开路、短路一眼分开。{@fOpens}。') },
      { title: loc('DC 就是欧姆定律'), text: loc('VOH/VOL、IDD、IIL/IIH、IOZ、VI、IOS。每条规格背后都藏着一个电阻。{@fDc}。') },
      { title: loc('功能测试'), text: loc('信号格式、Strobe、向量字符、Time Set，以及 Scan / BIST / JTAG 等 DFT。{@fFunc}。') },
      { title: loc('AC 是在找时间边界'), text: loc('Setup、Hold、tPD、脉宽、fMAX。Go/No-Go 与二分搜索。{@fAc}。') },
      { title: loc('表征'), text: loc('二分 / 线性搜索、Shmoo、Datalog。找出芯片真正的工作边界。{@fChar}。') },
      { title: loc('向量从哪来'), text: loc('仿真转向量、Print on Strobe / Change、Simulation for Test 守则。{@fVector}。') },
      { title: loc('写程序、调程序'), text: loc('程序类型、上下电顺序、负载板测试、第一次跑程序、四个嫌疑对象排错。{@fProgram}–{@fDebug}。') },
      { title: loc('交付'), text: loc('Margin、样品、文档包。{@fQualify}。') },
      { title: loc('进阶'), text: loc('Latch-up 测试流程、Scan 的 Flush / Shift 测试。{@fLatch}–{@fScan}。') },
      { title: loc('和「基础 / 数字」的关系'), text: loc('那边先立名词（{@pmu}–{@ac}）；这里用一颗 256×4 SRAM 把量产测试走一遍。') },
    ],
  },
  {
    id: 'bench',
    title: loc('交互实验'),
    blurb: loc('时序、Leakage、Pattern / Stuck。自己拧旋钮，立刻 Pass / Fail。现课 {@bench}。'),
    ready: true,
    lessons: ['bench'],
    knowledge: [
      { title: loc('时序模拟器'), text: loc('设 Period / Drive / DUT Delay / Strobe。波形跟着变，Strobe 太早就是 Compare 在稳定前。') },
      { title: loc('Leakage'), text: loc('Force 电压 → Measure 电流 → 和 Limit 比。拧紧限流，好芯片也会 Fail。') },
      { title: loc('和讲义的关系'), text: loc('词在 {@pmu} / {@timing} / {@ac}。这里不讲新名词，只让你亲手把 Pass 拧成 Fail。') },
    ],
  },
  {
    id: 'analog',
    title: loc('模拟芯片'),
    blurb: loc('运放、基准、LDO / 电源、ADC / DAC。问连续量准不准，不是大海量 Pattern。'),
    ready: false,
    lessons: [],
    knowledge: [
      { title: loc('模拟在问什么'), text: loc('精度、分辨率、重复性、噪声底。Force V / Measure I。Kelvin 只立名字。') },
      { title: loc('仪器槽位'), text: loc('SMU、DMM、AWG、Digitizer。数字 Channel 替代不了量精度。') },
      { title: loc('运放 / 基准 DC'), text: loc('Vos、Ib、Av、Iq、CMRR、PSRR。先直流。') },
      { title: loc('动态'), text: loc('压摆率、建立时间、带宽。不讲完整滤波器。') },
      { title: loc('ADC / DAC'), text: loc('INL / DNL、直方图；SNR / SINAD / ENOB；毛刺与建立。') },
      { title: loc('LDO / 电源'), text: loc('输出精度、dropout、线性/负载调整、Iq、纹波 / PSRR。') },
      { title: loc('模拟 Debug'), text: loc('重复性差先查接地、屏蔽、量程、平均次数。') },
    ],
  },
  {
    id: 'memory',
    title: loc('Memory'),
    blurb: loc('SRAM、DRAM、Flash、EEPROM。阵列太大不能穷举，核心是算法和修复。'),
    ready: false,
    lessons: [],
    knowledge: [
      { title: loc('端口'), text: loc('地址、数据、CS / WE / OE。DRAM 还有 RAS / CAS / 刷新。') },
      { title: loc('为什么不能当 ALU 测'), text: loc('容量把时间变成产线瓶颈。要算法，不要手写全空间。') },
      { title: loc('故障模型'), text: loc('Stuck-at、Transition、Address decoder、Coupling；Retention 单独一类。') },
      { title: loc('March'), text: loc('先会读 ↕ / r0 / w1，再记 MATS+、March C- 各抓什么。') },
      { title: loc('按种类'), text: loc('SRAM 偏 BIST；DRAM 刷新与 tRP；Flash 有 endurance / disturb / 坏块。') },
      { title: loc('Repair'), text: loc('冗余行/列、bitmap。Yield 往往等于能修多少。') },
    ],
  },
  {
    id: 'rf',
    title: loc('RF'),
    blurb: loc('PA、LNA、Transceiver。有载波和 50 Ω 功率，不是高速眼图。'),
    ready: false,
    lessons: [],
    knowledge: [
      { title: loc('数字 Channel 不够'), text: loc('阻抗、功率、频率、校准。Load Board 变成射频夹具。') },
      { title: loc('仪器'), text: loc('信号源、频谱、功率计、VNA。SOLT / 夹具 / de-embed 只立名字。') },
      { title: loc('S 参数'), text: loc('S11 匹配、S21 增益/损耗。回波、VSWR 一句话。') },
      { title: loc('功率与线性'), text: loc('Pout、P1dB、PAE；IP3、IMD、ACLR。') },
      { title: loc('噪声与调制'), text: loc('NF（LNA）；EVM、星座。Wi-Fi / 5G 只选一个教学波形。') },
      { title: loc('按模块选测项'), text: loc('PA ≠ LNA ≠ Transceiver，不要一张表打天下。') },
    ],
  },
  {
    id: 'hs',
    title: loc('高速接口'),
    blurb: loc('SerDes、PCIe / USB / Ethernet 物理层。基带串行，不是天线口。'),
    ready: false,
    lessons: [],
    knowledge: [
      { title: loc('眼图'), text: loc('Pass 是眼够开，不是这一拍是 1。') },
      { title: loc('误码'), text: loc('PRBS、BER、bathtub。') },
      { title: loc('抖动'), text: loc('RJ / DJ / TJ、TIE。先会看图，不推公式。') },
      { title: loc('均衡与时钟'), text: loc('TX FFE、RX CTLE / DFE；PLL、CDR、SSC。') },
      { title: loc('信号完整性'), text: loc('损耗、ISI、串扰、过孔。回扣 {@connection} 多层板。') },
      { title: loc('合规 vs 表征'), text: loc('规格钉一个眼；Shmoo 轴可换成摆幅 / 预加重 / 线损。') },
    ],
  },
  {
    id: 'power',
    title: loc('功率器件'),
    blurb: loc('MOSFET、IGBT、SiC、GaN。高压大电流、发热和安全工作区，不是运放精度课。'),
    ready: false,
    lessons: [],
    knowledge: [
      { title: loc('器件图像'), text: loc('先分清二极管、MOSFET、IGBT、SiC、GaN 各挡什么：电压、电流、开关速度、材料带隙。') },
      { title: loc('阻断与导通'), text: loc('击穿 BV、漏电；导通电阻 RDS(on) / VCE(sat)。同一颗管子两张脸。') },
      { title: loc('阈值与电荷'), text: loc('Vth、Qg、Ciss。开关快慢首先是电荷，不是数字 Period。') },
      { title: loc('开关能量'), text: loc('Eon / Eoff、反向恢复。损耗 = 导通 + 开关，测脉冲才能看见。') },
      { title: loc('安全工作区'), text: loc('SOA、短路承受、雪崩。超了是炸管，不是 Compare Fail。') },
      { title: loc('热'), text: loc('结温、Rth、脉冲宽了电阻会漂。功率测试必须谈热，不能只谈室温直流。') },
      { title: loc('测法约束'), text: loc('Kelvin、限流、脉冲宽度、高压安全。四线在这里不是点名，是保命和保精度。') },
    ],
  },
  {
    id: 'sensor',
    title: loc('传感器 / CIS'),
    blurb: loc('MEMS 与 CMOS 图像传感器。先给光、力、气压，再看电学结果。'),
    ready: false,
    lessons: [],
    knowledge: [
      { title: loc('换能'), text: loc('物理量 → 电学量。没有激励源，测的只是放大器，不是传感器。') },
      { title: loc('MEMS 力学'), text: loc('质量块–弹簧、电容/压阻读出、残余应力、阻尼。先立模型，再谈灵敏度。') },
      { title: loc('CIS 像素'), text: loc('光电二极管、满阱、转换增益、量子效率。一个像素就是一只小光电流计。') },
      { title: loc('阵列不均匀'), text: loc('PRNU、DSNU、暗电流、坏点。CIS 的 Yield 常常是图，不是一颗 Bin。') },
      { title: loc('光学激励'), text: loc('光源、积分球、照度、波长。光路没校准，电学再准也是错的。') },
      { title: loc('力学 / 声学激励'), text: loc('振动台、气压、声压。夹具和校准和电学座同等重要。') },
      { title: loc('和模拟的分界'), text: loc('读出电路的 Offset / 噪声走模拟课；本轨管激励、像素和阵列缺陷。') },
    ],
  },
  {
    id: 'qual',
    title: loc('可靠性 / 车规'),
    blurb: loc('横切轨道：老化、ESD、Latch-up、AEC-Q100。不是又一种芯片，是所有 CMOS 的加试。'),
    ready: true,
    lessons: ['latch'],
    knowledge: [
      { title: loc('失效浴缸'), text: loc('早期失效、偶然失效、磨损失效。量产测试抓早期；可靠性抓尾巴。') },
      { title: loc('电过应力'), text: loc('ESD（HBM / CDM）、EOS、Latch-up。{@latch} 是入口：寄生晶闸管，通常要掉电。') },
      { title: loc('加速老化'), text: loc('温度、电压、湿度加快机理。HTOL、HAST、温循、THB 各加速哪一种。') },
      { title: loc('车规框架'), text: loc('AEC-Q100 是抽样鉴定，不是每颗都跑完整 qual。Grade 说的是温度范围。') },
      { title: loc('Burn-in vs 量产'), text: loc('老化筛弱品；量产测试钉规格点。两者目的不同，不要混成一道程序。') },
      { title: loc('指标怎么说'), text: loc('FIT、寿命、降额。先会读数量级，不推公式证明。') },
      { title: loc('和功能 Fail 分开'), text: loc('向量错按拍红；可靠性是电流、封装裂纹、参数漂移。先分类再选台子。') },
    ],
  },
  {
    id: 'cpo',
    title: loc('硅光共封'),
    blurb: loc('硅光芯片与光电共封装（CPO）。电学路径加上光路：耦合、波长、激光和探测器。'),
    ready: false,
    lessons: [],
    knowledge: [
      { title: loc('光在芯片里'), text: loc('波导、模式、折射率、耦合。光不是“很快的电”，走的是介质里的模式。') },
      { title: loc('关键光电块'), text: loc('调制器、探测器、激光器（常是 III–V 贴装）、光栅/边缘耦合。各有各的失效。') },
      { title: loc('光规格'), text: loc('插入损耗、消光比、波长、响应度、暗电流、激光阈值。Pass 常是 dBm，不是 0/1。') },
      { title: loc('共封在测什么'), text: loc('CPO = 电芯片 + 光引擎在同一封装。要分清测 PIC、测 EIC，还是测封装后的光口。') },
      { title: loc('对准与封装'), text: loc('光纤阵列、耦合效率、贴装公差。微米级错位就是几 dB，像 Socket 接触不良。') },
      { title: loc('热与波长'), text: loc('结温一漂，波长和功率就漂。硅光测试默认要控温。') },
      { title: loc('和高速 / RF 的分界'), text: loc('电口 SerDes 回高速轨道；载波射频回 RF。本轨管光路、耦合和光电转换。') },
    ],
  },
]

/** 课程编号前缀：课程编号 = 前缀 + 它在所属轨道里的序号 */
const PREFIX: Record<TrackId, string> = {
  digital: 'D',
  fund: 'F',
  bench: 'X',
  analog: 'A',
  memory: 'M',
  rf: 'R',
  hs: 'H',
  power: 'P',
  sensor: 'S',
  qual: 'Q',
  cpo: 'C',
}

/** 课程的显示编号。一课出现在多条轨道时，以第一条（所属轨道）为准。 */
export function lessonCode(id: ModuleId): string {
  for (const track of TRACKS) {
    const index = track.lessons.indexOf(id)
    if (index >= 0) return `${PREFIX[track.id]}${String(index + 1).padStart(2, '0')}`
  }
  return id
}

/** 把文案里的 {@课程ID} 换成当前编号 */
export function resolveLessonRefs(text: string): string {
  if (!text.includes('{@')) return text
  return text.replace(/\{@(\w+)\}/g, (_, id: string) => lessonCode(id as ModuleId))
}

export function trackById(id: TrackId) {
  return TRACKS.find((item) => item.id === id)
}

export function trackOfLesson(id: ModuleId, current?: TrackId): TrackId {
  if (current) {
    const track = trackById(current)
    if (track?.lessons.includes(id)) return current
  }
  const owner = TRACKS.find((item) => item.lessons.includes(id))
  return owner?.id ?? current ?? 'digital'
}

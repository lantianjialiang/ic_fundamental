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
  | 'glossary'
  | 'faq'

/** 不是课程列表、而是一整页工具的轨道（术语表、FAQ），首页照样显示成卡片 */
export type TrackPageKind = 'glossary' | 'faq'

export const TRACKS: Array<{
  id: TrackId
  title: LText
  blurb: LText
  ready: boolean
  lessons: ModuleId[]
  knowledge: Array<{ title: LText; text: LText }>
  page?: TrackPageKind
}> = [
  {
    id: 'digital',
    title: loc('基础 / 数字', 'Basics / Digital'),
    blurb: loc(
      '先认名词、看动画：测什么、接到哪，再到 DC、功能、时序、Scan 和程序。现课 {@intro}–{@latch}，实验 {@bench}。',
      'Names and animations first: what is tested and how it connects, then DC, functional, timing, Scan and the program. Lessons {@intro}–{@latch}, lab {@bench}.',
    ),
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
      'vector',
      'scan',
      'program',
      'shmoo',
      'alu',
      'latch',
      'bench',
    ],
    knowledge: [
      {
        title: loc('产业位置', 'Where test sits'),
        text: loc('{@intro}。CP / FT、ATE、DUT、Bin、Yield。', '{@intro}. CP / FT, ATE, DUT, Bin, Yield.'),
      },
      {
        title: loc('物理连接', 'Physical connection'),
        text: loc('{@connection}。测试头 → 板 → Socket 或针卡 → DUT。', '{@connection}. Test head → board → socket or probe card → DUT.'),
      },
      {
        title: loc('通道', 'The channel'),
        text: loc('Driver / Comparator / Timing / Level。{@ate}。', 'Driver / Comparator / Timing / Level. {@ate}.'),
      },
      {
        title: loc('0/1 不是物理量', '0/1 is not a physical quantity'),
        text: loc('{@pmu}。PMU 的 Force / Measure、电压与电流、开短路。', '{@pmu}. PMU force / measure, voltage and current, opens / shorts.'),
      },
      {
        title: loc('规格变成测试', 'From spec to test'),
        text: loc(
          '{@spec}。主线：Datasheet → Spec → Method → Program → 结果。',
          '{@spec}. The spine: Datasheet → Spec → Method → Program → Result.',
        ),
      },
      {
        title: loc('数字 DC', 'Digital DC'),
        text: loc('VIH/VIL、VOH@IOH、Source / Sink。{@dc}。', 'VIH/VIL, VOH@IOH, source / sink. {@dc}.'),
      },
      {
        title: loc('功能与时间', 'Function and time'),
        text: loc(
          '真值表、Pattern、Strobe、Setup / Hold、tPD、fMAX。{@func}–{@timing}。拧旋钮见 {@bench}。',
          'Truth table, pattern, strobe, setup / hold, tPD, fMAX. {@func}–{@timing}. Turn the knobs in {@bench}.',
        ),
      },
      {
        title: loc('向量与 Scan', 'Vectors and Scan'),
        text: loc(
          '穷举会爆炸、ATPG、Shift → Capture → Compare。{@vector}–{@scan}。',
          'Exhaustive testing explodes, ATPG, shift → capture → compare. {@vector}–{@scan}.',
        ),
      },
      {
        title: loc('程序与表征', 'Program and characterization'),
        text: loc('Flow、Bin、排错、Shmoo、ALU。{@program}–{@alu}。', 'Flow, bins, debug, shmoo, ALU. {@program}–{@alu}.'),
      },
      {
        title: loc('可靠性入口', 'Reliability entry'),
        text: loc(
          '{@latch} Latch-up。完整 ESD / 老化 / 车规见可靠性轨道。',
          '{@latch} latch-up. Full ESD / burn-in / automotive lives in the reliability track.',
        ),
      },
      {
        title: loc('交互实验', 'Interactive lab'),
        text: loc(
          '{@bench}。自己设 Period / Drive / Delay / Strobe，以及 Leakage 限流。',
          '{@bench}. Set period / drive / delay / strobe yourself, plus the leakage current limit.',
        ),
      },
    ],
  },
  {
    id: 'fund',
    title: loc('数字测试基础', 'Digital Test Fundamentals'),
    blurb: loc(
      '从欧姆定律和逻辑门讲起，按量产程序的顺序走完开短路、DC、功能、AC，再到表征、向量、写程序、排错和文档。',
      'Starting from Ohm’s law and logic gates, walk the production program in order: opens / shorts, DC, functional, AC, then characterization, vectors, writing the program, troubleshooting and documentation.',
    ),
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
      {
        title: loc('电学与逻辑底子', 'Electrical and logic basics'),
        text: loc(
          'V = I·R、进制、逻辑电平和噪声容限、门电路、D 触发器。{@fBasics}。',
          'V = I·R, number systems, logic levels and noise margin, gates, the D flip-flop. {@fBasics}.',
        ),
      },
      {
        title: loc('芯片从哪来，测试机长什么样', 'Where chips come from, what testers look like'),
        text: loc(
          '晶圆、Die、封装；探针台、分选机、负载板；四类测试机。{@fAte}。',
          'Wafer, die, package; prober, handler, load board; four classes of tester. {@fAte}.',
        ),
      },
      {
        title: loc('测试系统里面', 'Inside the test system'),
        text: loc(
          'DPS、RVS、PMU、管脚电子；Force / Measure、钳位、Kelvin。{@fIntro}。',
          'DPS, RVS, PMU, pin electronics; force / measure, clamps, Kelvin. {@fIntro}.',
        ),
      },
      {
        title: loc('规格书是合同', 'The spec is a contract'),
        text: loc(
          '设计规格、测试规格、数据手册各写给谁。条件 + 极限 = 一条测试。{@fSpec}。',
          'Who the design spec, test spec and data sheet are written for. Conditions + limits = one test. {@fSpec}.',
        ),
      },
      {
        title: loc('先确认接上了', 'First, make sure it is connected'),
        text: loc(
          'PMU 打 ±100 µA，读保护二极管约 0.65 V。开路、短路一眼分开。{@fOpens}。',
          'The PMU forces ±100 µA and reads the protection diode at about 0.65 V. Opens and shorts stand out at a glance. {@fOpens}.',
        ),
      },
      {
        title: loc('DC 就是欧姆定律', 'DC is Ohm’s law'),
        text: loc(
          'VOH/VOL、IDD、IIL/IIH、IOZ、VI、IOS。每条规格背后都藏着一个电阻。{@fDc}。',
          'VOH/VOL, IDD, IIL/IIH, IOZ, VI, IOS. Every spec hides a resistor. {@fDc}.',
        ),
      },
      {
        title: loc('功能测试', 'Functional test'),
        text: loc(
          '信号格式、Strobe、向量字符、Time Set，以及 Scan / BIST / JTAG 等 DFT。{@fFunc}。',
          'Signal formats, strobe, vector characters, time sets, and DFT such as Scan / BIST / JTAG. {@fFunc}.',
        ),
      },
      {
        title: loc('AC 是在找时间边界', 'AC is a search for timing limits'),
        text: loc(
          'Setup、Hold、tPD、脉宽、fMAX。Go/No-Go 与二分搜索。{@fAc}。',
          'Setup, hold, tPD, pulse width, fMAX. Go/no-go and binary search. {@fAc}.',
        ),
      },
      {
        title: loc('表征', 'Characterization'),
        text: loc(
          '二分 / 线性搜索、Shmoo、Datalog。找出芯片真正的工作边界。{@fChar}。',
          'Binary / linear search, shmoo, datalog. Find where the device really stops working. {@fChar}.',
        ),
      },
      {
        title: loc('向量从哪来', 'Where vectors come from'),
        text: loc(
          '仿真转向量、Print on Strobe / Change、Simulation for Test 守则。{@fVector}。',
          'Simulation to vectors, print on strobe / change, simulation-for-test rules. {@fVector}.',
        ),
      },
      {
        title: loc('写程序、调程序', 'Writing and debugging the program'),
        text: loc(
          '程序类型、上下电顺序、负载板测试、第一次跑程序、四个嫌疑对象排错。{@fProgram}–{@fDebug}。',
          'Program types, power-up / power-down order, load board checks, the first run, troubleshooting the four suspects. {@fProgram}–{@fDebug}.',
        ),
      },
      {
        title: loc('交付', 'Release'),
        text: loc('Margin、样品、文档包。{@fQualify}。', 'Margin, samples, documentation package. {@fQualify}.'),
      },
      {
        title: loc('进阶', 'Further topics'),
        text: loc(
          'Latch-up 测试流程、Scan 的 Flush / Shift 测试。{@fLatch}–{@fScan}。',
          'The latch-up test flow, Scan flush / shift tests. {@fLatch}–{@fScan}.',
        ),
      },
      {
        title: loc('和「基础 / 数字」的关系', 'How this relates to Basics / Digital'),
        text: loc(
          '那边先立名词（{@pmu}–{@timing}）；这里用一颗 256×4 SRAM 把量产测试走一遍。',
          'That track introduces the names ({@pmu}–{@timing}); this one walks a 256×4 SRAM through production test.',
        ),
      },
    ],
  },
  {
    id: 'bench',
    title: loc('交互实验', 'Interactive lab'),
    blurb: loc(
      '时序、Leakage、Pattern / Stuck。自己拧旋钮，立刻 Pass / Fail。现课 {@bench}。',
      'Timing, leakage, pattern / stuck. Turn the knobs and see pass / fail at once. Lesson {@bench}.',
    ),
    ready: true,
    lessons: ['bench'],
    knowledge: [
      {
        title: loc('时序模拟器', 'Timing simulator'),
        text: loc(
          '设 Period / Drive / DUT Delay / Strobe。波形跟着变，Strobe 太早就是 Compare 在稳定前。',
          'Set period / drive / DUT delay / strobe. The waveform follows; a strobe that is too early compares before the output settles.',
        ),
      },
      {
        title: loc('Leakage', 'Leakage'),
        text: loc(
          'Force 电压 → Measure 电流 → 和 Limit 比。拧紧限流，好芯片也会 Fail。',
          'Force voltage → measure current → compare with the limit. Tighten the limit and even a good device fails.',
        ),
      },
      {
        title: loc('和讲义的关系', 'How this relates to the lessons'),
        text: loc(
          '词在 {@pmu} / {@timing}。这里不讲新名词，只让你亲手把 Pass 拧成 Fail。',
          'The terms are in {@pmu} / {@timing}. No new names here: you turn a pass into a fail yourself.',
        ),
      },
    ],
  },
  {
    id: 'analog',
    title: loc('模拟芯片', 'Analog'),
    blurb: loc(
      '运放、基准、LDO / 电源、ADC / DAC。问连续量准不准，不是大海量 Pattern。',
      'Op amps, references, LDOs / power, ADC / DAC. The question is how accurate a continuous value is, not millions of patterns.',
    ),
    ready: false,
    lessons: [],
    knowledge: [
      {
        title: loc('模拟在问什么', 'What analog test asks'),
        text: loc(
          '精度、分辨率、重复性、噪声底。Force V / Measure I。Kelvin 只立名字。',
          'Accuracy, resolution, repeatability, noise floor. Force V / measure I. Kelvin is named only.',
        ),
      },
      {
        title: loc('仪器槽位', 'Instrument slots'),
        text: loc(
          'SMU、DMM、AWG、Digitizer。数字 Channel 替代不了量精度。',
          'SMU, DMM, AWG, digitizer. A digital channel cannot replace measurement accuracy.',
        ),
      },
      {
        title: loc('运放 / 基准 DC', 'Op amp / reference DC'),
        text: loc('Vos、Ib、Av、Iq、CMRR、PSRR。先直流。', 'Vos, Ib, Av, Iq, CMRR, PSRR. DC first.'),
      },
      {
        title: loc('动态', 'Dynamic'),
        text: loc('压摆率、建立时间、带宽。不讲完整滤波器。', 'Slew rate, settling time, bandwidth. No full filter theory.'),
      },
      {
        title: loc('ADC / DAC', 'ADC / DAC'),
        text: loc(
          'INL / DNL、直方图；SNR / SINAD / ENOB；毛刺与建立。',
          'INL / DNL, histogram; SNR / SINAD / ENOB; glitches and settling.',
        ),
      },
      {
        title: loc('LDO / 电源', 'LDO / power'),
        text: loc(
          '输出精度、dropout、线性/负载调整、Iq、纹波 / PSRR。',
          'Output accuracy, dropout, line / load regulation, Iq, ripple / PSRR.',
        ),
      },
      {
        title: loc('模拟 Debug', 'Analog debug'),
        text: loc(
          '重复性差先查接地、屏蔽、量程、平均次数。',
          'Poor repeatability: check grounding, shielding, range and averaging first.',
        ),
      },
    ],
  },
  {
    id: 'memory',
    title: loc('Memory', 'Memory'),
    blurb: loc(
      'SRAM、DRAM、Flash、EEPROM。阵列太大不能穷举，核心是算法和修复。',
      'SRAM, DRAM, Flash, EEPROM. Arrays are too large to test exhaustively; the core is algorithms and repair.',
    ),
    ready: false,
    lessons: [],
    knowledge: [
      {
        title: loc('端口', 'Ports'),
        text: loc(
          '地址、数据、CS / WE / OE。DRAM 还有 RAS / CAS / 刷新。',
          'Address, data, CS / WE / OE. DRAM adds RAS / CAS / refresh.',
        ),
      },
      {
        title: loc('为什么不能当 ALU 测', 'Why not test it like an ALU'),
        text: loc(
          '容量把时间变成产线瓶颈。要算法，不要手写全空间。',
          'Capacity turns test time into the production bottleneck. Use algorithms, not hand-written full address space.',
        ),
      },
      {
        title: loc('故障模型', 'Fault models'),
        text: loc(
          'Stuck-at、Transition、Address decoder、Coupling；Retention 单独一类。',
          'Stuck-at, transition, address decoder, coupling; retention is a class of its own.',
        ),
      },
      {
        title: loc('March', 'March'),
        text: loc(
          '先会读 ↕ / r0 / w1，再记 MATS+、March C- 各抓什么。',
          'Learn to read ↕ / r0 / w1 first, then what MATS+ and March C- each catch.',
        ),
      },
      {
        title: loc('按种类', 'By type'),
        text: loc(
          'SRAM 偏 BIST；DRAM 刷新与 tRP；Flash 有 endurance / disturb / 坏块。',
          'SRAM leans on BIST; DRAM has refresh and tRP; Flash has endurance / disturb / bad blocks.',
        ),
      },
      {
        title: loc('Repair', 'Repair'),
        text: loc(
          '冗余行/列、bitmap。Yield 往往等于能修多少。',
          'Redundant rows / columns, bitmaps. Yield often equals how much you can repair.',
        ),
      },
    ],
  },
  {
    id: 'rf',
    title: loc('RF', 'RF'),
    blurb: loc(
      'PA、LNA、Transceiver。有载波和 50 Ω 功率，不是高速眼图。',
      'PA, LNA, transceiver. Carriers and 50 Ω power, not high-speed eye diagrams.',
    ),
    ready: false,
    lessons: [],
    knowledge: [
      {
        title: loc('数字 Channel 不够', 'A digital channel is not enough'),
        text: loc(
          '阻抗、功率、频率、校准。Load Board 变成射频夹具。',
          'Impedance, power, frequency, calibration. The load board becomes an RF fixture.',
        ),
      },
      {
        title: loc('仪器', 'Instruments'),
        text: loc(
          '信号源、频谱、功率计、VNA。SOLT / 夹具 / de-embed 只立名字。',
          'Signal source, spectrum analyzer, power meter, VNA. SOLT / fixtures / de-embedding are named only.',
        ),
      },
      {
        title: loc('S 参数', 'S-parameters'),
        text: loc('S11 匹配、S21 增益/损耗。回波、VSWR 一句话。', 'S11 match, S21 gain / loss. Return loss and VSWR in one line.'),
      },
      {
        title: loc('功率与线性', 'Power and linearity'),
        text: loc('Pout、P1dB、PAE；IP3、IMD、ACLR。', 'Pout, P1dB, PAE; IP3, IMD, ACLR.'),
      },
      {
        title: loc('噪声与调制', 'Noise and modulation'),
        text: loc(
          'NF（LNA）；EVM、星座。Wi-Fi / 5G 只选一个教学波形。',
          'NF (LNA); EVM, constellations. Pick a single teaching waveform from Wi-Fi / 5G.',
        ),
      },
      {
        title: loc('按模块选测项', 'Choose tests per block'),
        text: loc(
          'PA ≠ LNA ≠ Transceiver，不要一张表打天下。',
          'PA ≠ LNA ≠ transceiver; one table does not fit all.',
        ),
      },
    ],
  },
  {
    id: 'hs',
    title: loc('高速接口', 'High-speed I/O'),
    blurb: loc(
      'SerDes、PCIe / USB / Ethernet 物理层。基带串行，不是天线口。',
      'SerDes, PCIe / USB / Ethernet PHY. Baseband serial links, not antenna ports.',
    ),
    ready: false,
    lessons: [],
    knowledge: [
      {
        title: loc('眼图', 'Eye diagram'),
        text: loc('Pass 是眼够开，不是这一拍是 1。', 'Pass means the eye is open enough, not that this bit is a 1.'),
      },
      { title: loc('误码', 'Bit errors'), text: loc('PRBS、BER、bathtub。', 'PRBS, BER, bathtub curves.') },
      {
        title: loc('抖动', 'Jitter'),
        text: loc('RJ / DJ / TJ、TIE。先会看图，不推公式。', 'RJ / DJ / TJ, TIE. Read the plots first; no derivations.'),
      },
      {
        title: loc('均衡与时钟', 'Equalization and clocking'),
        text: loc('TX FFE、RX CTLE / DFE；PLL、CDR、SSC。', 'TX FFE, RX CTLE / DFE; PLL, CDR, SSC.'),
      },
      {
        title: loc('信号完整性', 'Signal integrity'),
        text: loc(
          '损耗、ISI、串扰、过孔。回扣 {@connection} 多层板。',
          'Loss, ISI, crosstalk, vias. Ties back to the multilayer board in {@connection}.',
        ),
      },
      {
        title: loc('合规 vs 表征', 'Compliance vs characterization'),
        text: loc(
          '规格钉一个眼；Shmoo 轴可换成摆幅 / 预加重 / 线损。',
          'The spec pins one eye; shmoo axes can become swing / pre-emphasis / channel loss.',
        ),
      },
    ],
  },
  {
    id: 'power',
    title: loc('功率器件', 'Power devices'),
    blurb: loc(
      'MOSFET、IGBT、SiC、GaN。高压大电流、发热和安全工作区，不是运放精度课。',
      'MOSFET, IGBT, SiC, GaN. High voltage, high current, heat and safe operating area, not op-amp precision.',
    ),
    ready: false,
    lessons: [],
    knowledge: [
      {
        title: loc('器件图像', 'The device picture'),
        text: loc(
          '先分清二极管、MOSFET、IGBT、SiC、GaN 各挡什么：电压、电流、开关速度、材料带隙。',
          'First tell diodes, MOSFETs, IGBTs, SiC and GaN apart: voltage, current, switching speed, bandgap.',
        ),
      },
      {
        title: loc('阻断与导通', 'Blocking and conduction'),
        text: loc(
          '击穿 BV、漏电；导通电阻 RDS(on) / VCE(sat)。同一颗管子两张脸。',
          'Breakdown BV, leakage; on-resistance RDS(on) / VCE(sat). Two faces of the same transistor.',
        ),
      },
      {
        title: loc('阈值与电荷', 'Threshold and charge'),
        text: loc(
          'Vth、Qg、Ciss。开关快慢首先是电荷，不是数字 Period。',
          'Vth, Qg, Ciss. Switching speed is about charge first, not a digital period.',
        ),
      },
      {
        title: loc('开关能量', 'Switching energy'),
        text: loc(
          'Eon / Eoff、反向恢复。损耗 = 导通 + 开关，测脉冲才能看见。',
          'Eon / Eoff, reverse recovery. Loss = conduction + switching; you only see it with pulse tests.',
        ),
      },
      {
        title: loc('安全工作区', 'Safe operating area'),
        text: loc(
          'SOA、短路承受、雪崩。超了是炸管，不是 Compare Fail。',
          'SOA, short-circuit withstand, avalanche. Exceed it and the device blows up; it is not a compare fail.',
        ),
      },
      {
        title: loc('热', 'Heat'),
        text: loc(
          '结温、Rth、脉冲宽了电阻会漂。功率测试必须谈热，不能只谈室温直流。',
          'Junction temperature, Rth; wide pulses make resistance drift. Power test must deal with heat, not just room-temperature DC.',
        ),
      },
      {
        title: loc('测法约束', 'Test method constraints'),
        text: loc(
          'Kelvin、限流、脉冲宽度、高压安全。四线在这里不是点名，是保命和保精度。',
          'Kelvin, current limits, pulse width, high-voltage safety. Four-wire here is about safety and accuracy, not a footnote.',
        ),
      },
    ],
  },
  {
    id: 'sensor',
    title: loc('传感器 / CIS', 'Sensors / CIS'),
    blurb: loc(
      'MEMS 与 CMOS 图像传感器。先给光、力、气压，再看电学结果。',
      'MEMS and CMOS image sensors. Apply light, force or pressure first, then read the electrical result.',
    ),
    ready: false,
    lessons: [],
    knowledge: [
      {
        title: loc('换能', 'Transduction'),
        text: loc(
          '物理量 → 电学量。没有激励源，测的只是放大器，不是传感器。',
          'Physical quantity → electrical quantity. Without a stimulus you are testing the amplifier, not the sensor.',
        ),
      },
      {
        title: loc('MEMS 力学', 'MEMS mechanics'),
        text: loc(
          '质量块–弹簧、电容/压阻读出、残余应力、阻尼。先立模型，再谈灵敏度。',
          'Proof mass and spring, capacitive / piezoresistive readout, residual stress, damping. Model first, then sensitivity.',
        ),
      },
      {
        title: loc('CIS 像素', 'CIS pixels'),
        text: loc(
          '光电二极管、满阱、转换增益、量子效率。一个像素就是一只小光电流计。',
          'Photodiode, full well, conversion gain, quantum efficiency. Each pixel is a tiny photocurrent meter.',
        ),
      },
      {
        title: loc('阵列不均匀', 'Array non-uniformity'),
        text: loc(
          'PRNU、DSNU、暗电流、坏点。CIS 的 Yield 常常是图，不是一颗 Bin。',
          'PRNU, DSNU, dark current, defective pixels. CIS yield is often an image, not a single bin.',
        ),
      },
      {
        title: loc('光学激励', 'Optical stimulus'),
        text: loc(
          '光源、积分球、照度、波长。光路没校准，电学再准也是错的。',
          'Light source, integrating sphere, illuminance, wavelength. If the optics are not calibrated, accurate electronics are still wrong.',
        ),
      },
      {
        title: loc('力学 / 声学激励', 'Mechanical / acoustic stimulus'),
        text: loc(
          '振动台、气压、声压。夹具和校准和电学座同等重要。',
          'Shakers, pressure, sound pressure. Fixtures and calibration matter as much as the electrical socket.',
        ),
      },
      {
        title: loc('和模拟的分界', 'Boundary with analog'),
        text: loc(
          '读出电路的 Offset / 噪声走模拟课；本轨管激励、像素和阵列缺陷。',
          'Readout offset / noise belongs to the analog track; this track covers stimulus, pixels and array defects.',
        ),
      },
    ],
  },
  {
    id: 'qual',
    title: loc('可靠性 / 车规', 'Reliability / Automotive'),
    blurb: loc(
      '横切轨道：老化、ESD、Latch-up、AEC-Q100。不是又一种芯片，是所有 CMOS 的加试。',
      'A cross-cutting track: burn-in, ESD, latch-up, AEC-Q100. Not another chip type, but extra tests for every CMOS device.',
    ),
    ready: true,
    lessons: ['latch'],
    knowledge: [
      {
        title: loc('失效浴缸', 'The bathtub curve'),
        text: loc(
          '早期失效、偶然失效、磨损失效。量产测试抓早期；可靠性抓尾巴。',
          'Infant mortality, random failures, wear-out. Production test catches the early ones; reliability catches the tail.',
        ),
      },
      {
        title: loc('电过应力', 'Electrical overstress'),
        text: loc(
          'ESD（HBM / CDM）、EOS、Latch-up。{@latch} 是入口：寄生晶闸管，通常要掉电。',
          'ESD (HBM / CDM), EOS, latch-up. {@latch} is the entry: a parasitic thyristor that usually needs a power-down.',
        ),
      },
      {
        title: loc('加速老化', 'Accelerated aging'),
        text: loc(
          '温度、电压、湿度加快机理。HTOL、HAST、温循、THB 各加速哪一种。',
          'Temperature, voltage and humidity speed up mechanisms. Which one HTOL, HAST, temperature cycling and THB each accelerate.',
        ),
      },
      {
        title: loc('车规框架', 'Automotive framework'),
        text: loc(
          'AEC-Q100 是抽样鉴定，不是每颗都跑完整 qual。Grade 说的是温度范围。',
          'AEC-Q100 is sample-based qualification, not a full qual on every part. The grade states the temperature range.',
        ),
      },
      {
        title: loc('Burn-in vs 量产', 'Burn-in vs production'),
        text: loc(
          '老化筛弱品；量产测试钉规格点。两者目的不同，不要混成一道程序。',
          'Burn-in screens weak parts; production test checks spec points. Different goals; do not merge them into one program.',
        ),
      },
      {
        title: loc('指标怎么说', 'How the metrics are stated'),
        text: loc('FIT、寿命、降额。先会读数量级，不推公式证明。', 'FIT, lifetime, derating. Read the orders of magnitude; no proofs.'),
      },
      {
        title: loc('和功能 Fail 分开', 'Separate from functional fails'),
        text: loc(
          '向量错按拍红；可靠性是电流、封装裂纹、参数漂移。先分类再选台子。',
          'A vector fail turns a cycle red; reliability is current, package cracks, parameter drift. Classify first, then pick the equipment.',
        ),
      },
    ],
  },
  {
    id: 'cpo',
    title: loc('硅光共封', 'Silicon photonics / CPO'),
    blurb: loc(
      '硅光芯片与光电共封装（CPO）。电学路径加上光路：耦合、波长、激光和探测器。',
      'Silicon photonic chips and co-packaged optics (CPO). The electrical path plus the optical path: coupling, wavelength, lasers and detectors.',
    ),
    ready: false,
    lessons: [],
    knowledge: [
      {
        title: loc('光在芯片里', 'Light on the chip'),
        text: loc(
          '波导、模式、折射率、耦合。光不是“很快的电”，走的是介质里的模式。',
          'Waveguides, modes, refractive index, coupling. Light is not "very fast electricity"; it travels as modes in a dielectric.',
        ),
      },
      {
        title: loc('关键光电块', 'Key photonic blocks'),
        text: loc(
          '调制器、探测器、激光器（常是 III–V 贴装）、光栅/边缘耦合。各有各的失效。',
          'Modulators, detectors, lasers (often bonded III–V), grating / edge couplers. Each fails in its own way.',
        ),
      },
      {
        title: loc('光规格', 'Optical specs'),
        text: loc(
          '插入损耗、消光比、波长、响应度、暗电流、激光阈值。Pass 常是 dBm，不是 0/1。',
          'Insertion loss, extinction ratio, wavelength, responsivity, dark current, laser threshold. Pass is often in dBm, not 0/1.',
        ),
      },
      {
        title: loc('共封在测什么', 'What CPO testing measures'),
        text: loc(
          'CPO = 电芯片 + 光引擎在同一封装。要分清测 PIC、测 EIC，还是测封装后的光口。',
          'CPO = electrical chip + optical engine in one package. Be clear whether you test the PIC, the EIC, or the packaged optical port.',
        ),
      },
      {
        title: loc('对准与封装', 'Alignment and packaging'),
        text: loc(
          '光纤阵列、耦合效率、贴装公差。微米级错位就是几 dB，像 Socket 接触不良。',
          'Fiber arrays, coupling efficiency, placement tolerance. A micron of misalignment costs several dB, like a bad socket contact.',
        ),
      },
      {
        title: loc('热与波长', 'Heat and wavelength'),
        text: loc(
          '结温一漂，波长和功率就漂。硅光测试默认要控温。',
          'When junction temperature drifts, wavelength and power drift. Silicon photonics test needs temperature control by default.',
        ),
      },
      {
        title: loc('和高速 / RF 的分界', 'Boundary with high-speed / RF'),
        text: loc(
          '电口 SerDes 回高速轨道；载波射频回 RF。本轨管光路、耦合和光电转换。',
          'Electrical SerDes goes to the high-speed track; carrier RF goes to RF. This track covers the optical path, coupling and O/E conversion.',
        ),
      },
    ],
  },
  {
    id: 'glossary',
    title: loc('术语表', 'Glossary'),
    blurb: loc(
      '把 D、F 两条轨道里讲到的名词收在一起：原文、中英文名、一句话解释和出处课程。可以搜索，可以按课程或按 A–Z 看。',
      'Every term from the D and F tracks in one place: the original name, Chinese and English names, a one-line definition and the lessons it comes from. Search it, or browse by lesson or A–Z.',
    ),
    ready: true,
    lessons: [],
    knowledge: [],
    page: 'glossary',
  },
  {
    id: 'faq',
    title: loc('常见问题', 'FAQ'),
    blurb: loc(
      '学的时候最容易卡住的问题：电平为什么这样设、Strobe 为什么会错、Scan 怎么走，以及这个网站怎么用。',
      'The questions learners get stuck on most: why levels are set the way they are, how a strobe goes wrong, how scan works, and how to use this site.',
    ),
    ready: true,
    lessons: [],
    knowledge: [],
    page: 'faq',
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
  // 术语表、FAQ 没有课程，前缀只是占位，不参与任何编号
  glossary: 'G',
  faq: 'FAQ',
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

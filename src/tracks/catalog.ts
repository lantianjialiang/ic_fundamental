import { loc, type LText } from '../i18n/locale'
import { type ModuleId } from '../modules/catalog'

export type TrackId =
  | 'prep'
  | 'mos'
  | 'pcb'
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
    id: 'prep',
    title: loc('预备', 'Prep'),
    blurb: loc(
      '产业与历史、硅到封装、元器件与数字认图、桌上怎么量——再进 D / F 测法主线。{@pIndustry}–{@pMeasure}。',
      'Industry and history, silicon to package, components and digital diagrams, bench measurement—then the D / F test spine. {@pIndustry}–{@pMeasure}.',
    ),
    ready: true,
    lessons: ['pIndustry', 'pHistory', 'pSilicon', 'pPackage', 'pParts', 'pDigital', 'pMeasure'],
    knowledge: [
      {
        title: loc('产业角色', 'Industry roles'),
        text: loc('Fabless / Foundry / IDM / OSAT。{@pIndustry}。测试位置见 {@intro}。', 'Fabless / Foundry / IDM / OSAT. {@pIndustry}. Where test sits: {@intro}.'),
      },
      {
        title: loc('简史与测不完', 'History and why exhaustive fails'),
        text: loc('{@pHistory}。向量与 Scan 见 {@vector}–{@scan}、{@fScan}。', '{@pHistory}. Vectors and Scan: {@vector}–{@scan}, {@fScan}.'),
      },
      {
        title: loc('硅到 Die', 'Silicon to die'),
        text: loc('工艺主线与 Yield。{@pSilicon}。设备现场见 {@fAte}。', 'Process spine and yield. {@pSilicon}. Floor equipment: {@fAte}.'),
      },
      {
        title: loc('封装与 CP / FT', 'Package and CP / FT'),
        text: loc('{@pPackage}。物理连接见 {@connection}；链路总览见 {@intro}。', '{@pPackage}. Physical hookup: {@connection}; chain overview: {@intro}.'),
      },
      {
        title: loc('元器件认图', 'Component literacy'),
        text: loc('{@pParts}。桌上测量见 {@pMeasure}。', '{@pParts}. Bench measurement: {@pMeasure}.'),
      },
      {
        title: loc('数字认图', 'Digital diagrams'),
        text: loc('门、触发器、电平窗口（浅）。{@pDigital}。加深见 {@fBasics}。', 'Gates, flip-flops, level windows (light). {@pDigital}. Deeper: {@fBasics}.'),
      },
      {
        title: loc('定律与桌上测量', 'Laws and bench measurement'),
        text: loc('{@pMeasure}。PMU Force / Measure 见 {@fIntro}；开短路见 {@fOpens}。', '{@pMeasure}. PMU force / measure: {@fIntro}; opens / shorts: {@fOpens}.'),
      },
    ],
  },
  {
    id: 'mos',
    title: loc('MOS 管与数字电路', 'MOSFETs and Digital Circuits'),
    blurb: loc(
      'MOS 管怎么导通、在哪个区工作，怎样搭出反相器和逻辑门，板上怎么用、怎么选型。{@mosPrimer}–{@mosSelect}。',
      'How a MOSFET turns on, which region it works in, how it builds inverters and gates, how it is used on boards and how to choose one. {@mosPrimer}–{@mosSelect}.',
    ),
    ready: true,
    lessons: [
      'mosPrimer',
      'mosIntro',
      'mosChannel',
      'mosRegion',
      'mosSwitch',
      'mosInverter',
      'mosGates',
      'mosDynamic',
      'mosApps',
      'mosReal',
      'mosSelect',
    ],
    knowledge: [
      {
        title: loc('预备与认识', 'Primer and first look'),
        text: loc(
          'N / P 型、PN 结、RC（选修）{@mosPrimer}；四个端子、NMOS / PMOS、和 BJT 对比 {@mosIntro}。元件认图见 {@pParts}。',
          'N / P type, PN junction, RC (optional) {@mosPrimer}; four terminals, NMOS / PMOS, comparison with BJT {@mosIntro}. Component literacy: {@pParts}.',
        ),
      },
      {
        title: loc('沟道与工作区', 'Channel and regions'),
        text: loc(
          '积累、耗尽、反型与 Vth {@mosChannel}；截止、线性、饱和与 I-V 曲线 {@mosRegion}。',
          'Accumulation, depletion, inversion and Vth {@mosChannel}; cutoff, linear, saturation and I-V curves {@mosRegion}.',
        ),
      },
      {
        title: loc('开关与 CMOS', 'Switches and CMOS'),
        text: loc(
          '传好 0 / 传好 1、Rds(on)、高低边 {@mosSwitch}；反相器 VTC 与功耗 {@mosInverter}；NAND / NOR、传输门 {@mosGates}。门的真值表见 {@pDigital}。',
          'Good 0 / good 1, Rds(on), high / low side {@mosSwitch}; inverter VTC and power {@mosInverter}; NAND / NOR, transmission gates {@mosGates}. Gate truth tables: {@pDigital}.',
        ),
      },
      {
        title: loc('动态与应用', 'Dynamics and applications'),
        text: loc(
          '寄生电容、米勒平台、Qg 和延时 {@mosDynamic}；GPIO 驱动、负载开关、电平转换、H 桥 {@mosApps}。',
          'Parasitic capacitance, Miller plateau, Qg and delay {@mosDynamic}; GPIO drive, load switches, level shifting, H-bridges {@mosApps}.',
        ),
      },
      {
        title: loc('可靠性与选型', 'Reliability and selection'),
        text: loc(
          '体二极管、漏电、ESD、闩锁 {@mosReal}；数据手册与综合任务 {@mosSelect}。测法见 {@dc}、{@latch}、{@fDc}。',
          'Body diode, leakage, ESD, latch-up {@mosReal}; datasheets and the capstone {@mosSelect}. How they are tested: {@dc}, {@latch}, {@fDc}.',
        ),
      },
    ],
  },
  {
    id: 'pcb',
    title: loc('PCB 入门', 'PCB Basics'),
    blurb: loc(
      'PCB 怎么造出来、怎么从设计变成成品；看懂 PCB 文件和术语，并按清单完成一块双层小板。{@pcbIntro}–{@pcbDfm}。',
      'How a PCB is made and how a design becomes a finished board; read PCB files and terms, then check a small two-layer board against a list. {@pcbIntro}–{@pcbDfm}.',
    ),
    ready: true,
    lessons: [
      'pcbIntro',
      'pcbMaterial',
      'pcbStack',
      'pcbFab',
      'pcbSupply',
      'pcbFlow',
      'pcbBasics',
      'pcbLayout',
      'pcbTools',
      'pcbDfm',
    ],
    knowledge: [
      {
        title: loc('知道：板子是什么、怎么造', 'Know: what a board is and how it is made'),
        text: loc(
          '作用与分类 {@pcbIntro}；材料与表面处理 {@pcbMaterial}；叠层与过孔 {@pcbStack}；制造流程 {@pcbFab}。',
          'Jobs and types {@pcbIntro}; materials and finishes {@pcbMaterial}; stack-up and vias {@pcbStack}; fabrication {@pcbFab}.',
        ),
      },
      {
        title: loc('知道：从设计到成品', 'Know: from design to product'),
        text: loc(
          '供应链、交付文件、SMT {@pcbSupply}。测试用的负载板和针卡见 {@connection}。',
          'Supply chain, deliverables, SMT {@pcbSupply}. Load boards and probe cards used in test: {@connection}.',
        ),
      },
      {
        title: loc('会做：设计', 'Do: design'),
        text: loc(
          '设计流程 {@pcbFlow}；线宽、铺铜、阻抗 {@pcbBasics}；布局布线 {@pcbLayout}；Altium 实操 {@pcbTools}。',
          'Design flow {@pcbFlow}; trace width, pours, impedance {@pcbBasics}; placement and routing {@pcbLayout}; Altium in practice {@pcbTools}.',
        ),
      },
      {
        title: loc('会做：自查', 'Do: self-check'),
        text: loc(
          'DFM / DFA / DFT、常见错误、综合项目 {@pcbDfm}。封装外形见 {@pPackage}。',
          'DFM / DFA / DFT, common mistakes, the capstone {@pcbDfm}. Package outlines: {@pPackage}.',
        ),
      },
    ],
  },
  {
    id: 'digital',
    title: loc('基础 / 数字', 'Basics / Digital'),
    blurb: loc(
      '先认名词、看动画：测什么、接到哪，再到 DC、功能、时序、Scan 和程序。现课 {@intro}–{@genMultisite}。拧旋钮、跑工作站在交互实验 {@vate}。',
      'Names and animations first: what is tested and how it connects, then DC, functional, timing, Scan and the program. Lessons {@intro}–{@genMultisite}. Turning knobs and running the workstation live in the Interactive lab {@vate}.',
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
      'genStdf',
      'genMultisite',
    ],
    knowledge: [
      {
        title: loc('产业位置', 'Where test sits'),
        text: loc(
          '{@intro}。CP / FT、ATE、DUT、Bin、Yield。产业角色预习 {@pIndustry}。',
          '{@intro}. CP / FT, ATE, DUT, Bin, Yield. Industry roles preview: {@pIndustry}.',
        ),
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
          '真值表、Pattern、Strobe、Setup / Hold、tPD、fMAX。{@func}–{@timing}。拧旋钮去交互实验 {@vate}。',
          'Truth table, pattern, strobe, setup / hold, tPD, fMAX. {@func}–{@timing}. Turn the knobs in the Interactive lab {@vate}.',
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
        title: loc('动手去交互实验', 'Hands-on in the Interactive lab'),
        text: loc(
          '本轨不重复挂实验课。时序 / 漏电 / 图案台、虚拟 ATE 工作站见 {@vate}，整批 wafer 见 {@sim}。',
          'This track does not host the lab again. The timing / leakage / pattern bench and virtual ATE workstation are {@vate}; whole-wafer runs are {@sim}.',
        ),
      },
      {
        title: loc('和「数字测试基础」的关系', 'How this relates to Digital Test Fundamentals'),
        text: loc(
          '这边用动画立名词：{@pmu}、{@dc}、{@func}、{@timing}、{@scan}。那边用一颗 256×4 SRAM 把量产测法走一遍：{@fOpens}、{@fDc}、{@fFunc}、{@fAc}。同一主题两课互相链，不必当两遍新课上。',
          'This track uses animations to plant the names: {@pmu}, {@dc}, {@func}, {@timing}, {@scan}. That one walks a 256×4 SRAM through production: {@fOpens}, {@fDc}, {@fFunc}, {@fAc}. Matching lessons link to each other; they are not a second copy of the same class.',
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
          '那边先用动画立名词：{@pmu}、{@dc}、{@func}、{@timing}、{@scan}。这里用一颗 256×4 SRAM 把量产测法走一遍：{@fOpens}、{@fDc}、{@fFunc}、{@fAc}。课页底有「对应课」互链，不必当两遍新课上。',
          'That track plants the names with animations: {@pmu}, {@dc}, {@func}, {@timing}, {@scan}. This one walks a 256×4 SRAM through production: {@fOpens}, {@fDc}, {@fFunc}, {@fAc}. Each lesson footer links to its match; they are not a second copy of the same class.',
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
    ready: true,
    lessons: [
      'anaOverview',
      'anaMeasure',
      'anaResources',
      'anaSmu',
      'anaSignal',
      'anaSampling',
      'anaFft',
      'anaLeak',
      'anaLdo',
      'anaStatic',
      'anaDynamic',
      'anaPll',
      'anaTrim',
      'anaStats',
      'anaCapstone',
    ],
    knowledge: [
      {
        title: loc('模拟在问什么', 'What analog test asks'),
        text: loc(
          '精度、分辨率、重复性、噪声底。Force V / Measure I；四线 Kelvin 见 {@anaMeasure}。',
          'Accuracy, resolution, repeatability, noise floor. Force V / measure I; four-wire Kelvin: {@anaMeasure}.',
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
    ready: true,
    lessons: [
      'memStructure',
      'memRw',
      'memFault',
      'memPattern',
      'memMarch',
      'memTiming',
      'memDram',
      'memDdr',
      'memBist',
      'memParallel',
      'memCoverage',
      'memBin',
      'memCapstone',
    ],
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
    ready: true,
    lessons: [
      'rfOverview',
      'rfDb',
      'rfSystem',
      'rfSparam',
      'rfGain',
      'rfP1db',
      'rfIp3',
      'rfNf',
      'rfHarm',
      'rfPhaseNoise',
      'rfModulation',
      'rfEvm',
      'rfCal',
      'rfCapstone',
    ],
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
    ready: true,
    lessons: [
      'hsBasics',
      'hsChannel',
      'hsTiming',
      'hsJitter',
      'hsEye',
      'hsInterface',
      'hsAteLimit',
      'hsCapstone',
    ],
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
      'MOSFET、IGBT、SiC、GaN。高压大电流、发热和安全工作区，不是运放精度课。现课 {@pwrSelector}–{@pwrProgram}。',
      'MOSFET, IGBT, SiC, GaN. High voltage, high current, heat and safe operating area, not op-amp precision. Lessons {@pwrSelector}–{@pwrProgram}.',
    ),
    ready: true,
    lessons: [
      'pwrSelector',
      'pwrStatic',
      'pwrKelvin',
      'pwrGate',
      'pwrDpt',
      'pwrUis',
      'pwrWbg',
      'pwrProgram',
    ],
    knowledge: [
      {
        title: loc('器件图像', 'The device picture'),
        text: loc(
          '先分清二极管、MOSFET、IGBT、SiC、GaN 各挡什么。入口 {@pwrSelector}。',
          'First tell diodes, MOSFETs, IGBTs, SiC and GaN apart. Start at {@pwrSelector}.',
        ),
      },
      {
        title: loc('阻断、导通与静态测', 'Blocking, conduction and static test'),
        text: loc(
          'BV、Idss / Igss、Vth、Rds(on) 见 {@pwrStatic}。毫欧级要用四线，见 {@pwrKelvin}。',
          'BV, Idss / Igss, Vth and Rds(on) in {@pwrStatic}. Milliohms need four-wire sensing; see {@pwrKelvin}.',
        ),
      },
      {
        title: loc('阈值与电荷', 'Threshold and charge'),
        text: loc(
          'Vth、Qg、米勒平台。开关快慢首先是电荷。见 {@pwrGate}；器件层面见 {@mosDynamic}。',
          'Vth, Qg, Miller plateau. Switching speed is about charge first. See {@pwrGate}; device level: {@mosDynamic}.',
        ),
      },
      {
        title: loc('开关能量', 'Switching energy'),
        text: loc(
          'Eon / Eoff、反向恢复、di/dt 过冲。损耗 = 导通 + 开关。见 {@pwrDpt}。',
          'Eon / Eoff, reverse recovery, di/dt overshoot. Loss = conduction + switching. See {@pwrDpt}.',
        ),
      },
      {
        title: loc('安全工作区', 'Safe operating area'),
        text: loc(
          'SOA、雪崩能量 E_AS = ½LI²·BV/(BV−Vdd)。超了是炸管。见 {@pwrUis}。',
          'SOA, avalanche energy E_AS = ½LI²·BV/(BV−Vdd). Exceed it and the device blows up. See {@pwrUis}.',
        ),
      },
      {
        title: loc('热与宽禁带', 'Heat and wide bandgap'),
        text: loc(
          '结温、Zth、脉宽越长电阻越漂。SiC 预置、GaN 动态 Rds 见 {@pwrWbg}。',
          'Junction temperature, Zth; a longer pulse makes resistance drift. SiC preconditioning and GaN dynamic Rds in {@pwrWbg}.',
        ),
      },
      {
        title: loc('量产程序', 'Production program'),
        text: loc(
          'Kelvin 要在 Rds 前，限流、脉宽、高压互锁。综合见 {@pwrProgram}。',
          'Kelvin before Rds, current limits, pulse width, high-voltage interlock. Capstone: {@pwrProgram}.',
        ),
      },
    ],
  },
  {
    id: 'sensor',
    title: loc('传感器 / CIS', 'Sensors / CIS'),
    blurb: loc(
      '以 CMOS 图像传感器为主线，MEMS 加速度计作对照。先给光或加速度，再看电学结果。现课 {@snsOverview}–{@snsProgram}。',
      'CMOS image sensors as the main line, with a MEMS accelerometer as contrast. Apply light or acceleration first, then read the electrical result. Lessons {@snsOverview}–{@snsProgram}.',
    ),
    ready: true,
    lessons: [
      'snsOverview',
      'snsPhoton',
      'snsPixel',
      'snsPtc',
      'snsDark',
      'snsFlat',
      'snsOptical',
      'snsAccel',
      'snsProgram',
    ],
    knowledge: [
      {
        title: loc('换能与信号链', 'Transduction and the chain'),
        text: loc(
          '本轨以 CIS 为主：敏感元件 → 模拟前端 → ADC → 校准。没有光或力，测的只是放大器。入口 {@snsOverview}。',
          'This track is built around CIS: sensing element → analog front end → ADC → calibration. Without light or force you are testing the amplifier. Start at {@snsOverview}.',
        ),
      },
      {
        title: loc('光子与像素', 'Photons and pixels'),
        text: loc(
          'QE、散粒与读噪见 {@snsPhoton}；4T、FD、CG、CDS、卷帘见 {@snsPixel}。',
          'QE, shot noise and read noise in {@snsPhoton}; 4T, FD, CG, CDS and rolling shutter in {@snsPixel}.',
        ),
      },
      {
        title: loc('PTC 与满阱', 'PTC and full well'),
        text: loc(
          '差帧估 K、读噪和满阱。增益开大，电子数满阱变小。见 {@snsPtc}。',
          'A frame difference estimates K, read noise and full well. Higher gain shrinks the electron full well. See {@snsPtc}.',
        ),
      },
      {
        title: loc('暗场与亮场', 'Dark and bright fields'),
        text: loc(
          '暗电流、DSNU、热像素见 {@snsDark}；PRNU、平场、死点和簇见 {@snsFlat}。Yield 常常是图，不是一颗 Bin。',
          'Dark current, DSNU and hot pixels in {@snsDark}; PRNU, flat field, dead pixels and clusters in {@snsFlat}. Yield is often an image, not a single bin.',
        ),
      },
      {
        title: loc('颜色与光学系统', 'Color and the optical system'),
        text: loc(
          '拜耳、积分球、光谱响应。颜色不是只测 RGB 三点。见 {@snsOptical}。',
          'Bayer, integrating sphere, spectral response. Color is not three RGB points. See {@snsOptical}.',
        ),
      },
      {
        title: loc('MEMS 对照', 'MEMS contrast'),
        text: loc(
          '加速度计只作非光学对照：灵敏度、噪声密度、翻转法、自检代替不了 1 g。见 {@snsAccel}。',
          'The accelerometer is only a non-optical contrast: sensitivity, noise density, flip calibration; self-test does not replace 1 g. See {@snsAccel}.',
        ),
      },
      {
        title: loc('量产程序', 'Production program'),
        text: loc(
          '五项必测、缺陷图写 OTP、按个数和簇分 A/B/C，导出 STDF。见 {@snsProgram}。',
          'Five required steps, a defect map into OTP, grades A/B/C from count and clusters, then STDF. See {@snsProgram}.',
        ),
      },
    ],
  },
  {
    id: 'qual',
    title: loc('可靠性 / 车规', 'Reliability / Automotive'),
    blurb: loc(
      '横切轨道：老化、ESD、Latch-up、AEC-Q100。不是又一种芯片，是所有 CMOS 的加试。REL 系列 {@relBathtub}–{@relFlow}：从浴盆曲线、加速模型讲到车规量产流程。',
      'A cross-cutting track: burn-in, ESD, latch-up, AEC-Q100. Not another chip type, but extra tests for every CMOS device. REL series {@relBathtub}–{@relFlow}: from the bathtub curve and acceleration models to the automotive production flow.',
    ),
    ready: true,
    lessons: [
      'relBathtub',
      'relAccel',
      'relStress',
      'relWeibull',
      'relBurnIn',
      'relAuto',
      'relPat',
      'relFlow',
    ],
    knowledge: [
      {
        title: loc('失效浴缸', 'The bathtub curve'),
        text: loc(
          '早期、随机、磨损三段。出厂测试抓可测缺陷，Burn-in 抓早期，寿命试验抓磨损。从 {@relBathtub} 起，不是闩锁。',
          'Infant, random and wear-out. Production test catches testable defects, burn-in catches early life, life test catches wear-out. Start at {@relBathtub}, not latch-up.',
        ),
      },
      {
        title: loc('电过应力', 'Electrical overstress'),
        text: loc(
          'ESD（HBM / CDM）、EOS、闩锁。{@latch} 是数字课里的相关入口，不在本轨课序里。',
          'ESD (HBM / CDM), EOS, latch-up. {@latch} is a related digital lesson, not in this track’s sequence.',
        ),
      },
      {
        title: loc('加速与试验', 'Acceleration and tests'),
        text: loc(
          'Arrhenius、电压、Coffin-Manson 见 {@relAccel}；HTOL、HTSL、TC、HAST、ELFR 与零失效上限见 {@relStress}。',
          'Arrhenius, voltage and Coffin-Manson in {@relAccel}; HTOL, HTSL, TC, HAST, ELFR and the zero-failure bound in {@relStress}.',
        ),
      },
      {
        title: loc('车规框架', 'Automotive framework'),
        text: loc(
          'AEC-Q100 是抽样鉴定，Grade 说温度范围。ASIL 归 ISO 26262。见 {@relAuto}。',
          'AEC-Q100 is sample-based qualification; the grade states the temperature range. ASIL belongs to ISO 26262. See {@relAuto}.',
        ),
      },
      {
        title: loc('Burn-in vs 量产', 'Burn-in vs production'),
        text: loc(
          '静态 / 动态 / 监控 / 晶圆级老化筛弱品；量产测试钉规格点。见 {@relBurnIn}。',
          'Static, dynamic, monitor and wafer-level burn-in screen weak parts; production test checks spec points. See {@relBurnIn}.',
        ),
      },
      {
        title: loc('指标怎么说', 'How the metrics are stated'),
        text: loc(
          'FIT、MTTF、Weibull。会代公式，并知道 Ea、CL 的不确定。见 {@relWeibull}。',
          'FIT, MTTF, Weibull. Plug in the formulas and know the uncertainty in Ea and CL. See {@relWeibull}.',
        ),
      },
      {
        title: loc('零缺陷筛选', 'Zero-defect screening'),
        text: loc(
          'PAT、SBL、邻近规则抓规格内的坏 die。综合流程见 {@relPat}、{@relFlow}。',
          'PAT, SBL and the neighbourhood rule catch in-spec bad die. The combined flow is {@relPat} and {@relFlow}.',
        ),
      },
    ],
  },
  {
    id: 'cpo',
    title: loc('硅光共封', 'Silicon photonics / CPO'),
    blurb: loc(
      '硅光芯片与光电共封装（CPO）。电学路径加上光路：耦合、波长、激光和探测器。现课 {@picOverview}–{@picFlow}。',
      'Silicon photonic chips and co-packaged optics (CPO). The electrical path plus the optical path: coupling, wavelength, lasers and detectors. Lessons {@picOverview}–{@picFlow}.',
    ),
    ready: true,
    lessons: [
      'picOverview',
      'picUnits',
      'picDevice',
      'picMod',
      'picSweep',
      'picAlign',
      'picCutback',
      'picLink',
      'picFlow',
    ],
    knowledge: [
      {
        title: loc('硅光与 CPO', 'Silicon photonics and CPO'),
        text: loc(
          'PIC 走光，EIC 走电，CPO 把光引擎和 ASIC 封在一起。入口 {@picOverview}。',
          'The PIC carries light, the EIC carries electricity, and CPO packages the optical engine with the ASIC. Start at {@picOverview}.',
        ),
      },
      {
        title: loc('单位与波导', 'Units and waveguides'),
        text: loc(
          'dBm 相加、neff 定相位、ng 定 FSR。见 {@picUnits}。',
          'dBm adds, neff sets phase, ng sets FSR. See {@picUnits}.',
        ),
      },
      {
        title: loc('无源器件', 'Passive devices'),
        text: loc(
          'MZI、微环、FSR = λ²/(ng·L)，谐振 Q = λ/FWHM。见 {@picDevice}。',
          'MZI, rings, FSR = λ²/(ng·L), resonator Q = λ/FWHM. See {@picDevice}.',
        ),
      },
      {
        title: loc('调制与探测', 'Modulation and detection'),
        text: loc(
          'MZM、ER、OMA、PD 响应度。见 {@picMod}。扫描谱见 {@picSweep}。',
          'MZM, ER, OMA, PD responsivity. See {@picMod}. Swept spectra in {@picSweep}.',
        ),
      },
      {
        title: loc('对准与 cut-back', 'Alignment and cut-back'),
        text: loc(
          '光栅/边缘耦合、主动对准见 {@picAlign}；斜率是波导损耗、截距是两端耦合，见 {@picCutback}。',
          'Grating / edge couplers and active alignment in {@picAlign}; slope is waveguide loss and intercept is the two couplers in {@picCutback}.',
        ),
      },
      {
        title: loc('光链路', 'The optical link'),
        text: loc(
          '灵敏度看 OMA，判决 Q 不是谐振 Q。见 {@picLink}。',
          'Sensitivity is specified on OMA; decision Q is not resonator Q. See {@picLink}.',
        ),
      },
      {
        title: loc('CPO 流程', 'CPO flow'),
        text: loc(
          '测试前移、KGD、良率连乘、光学并行。不是每步都扫完整光谱。见 {@picFlow}。',
          'Shift-left, KGD, yield product, optical parallelism. Not a full spectrum at every step. See {@picFlow}.',
        ),
      },
    ],
  },
  {
    id: 'bench',
    title: loc('交互实验', 'Interactive lab'),
    blurb: loc(
      '时序、Leakage、Pattern / Stuck；再到一台虚拟 ATE 工作站跑 IDDQ 和开短路；最后用一台产线模拟器跑整批 wafer、判故障。现课 {@bench}–{@sim}。',
      'Timing, leakage, pattern / stuck; then a virtual ATE workstation running IDDQ and opens / shorts; finally a production simulator that runs whole wafers and diagnoses faults. Lessons {@bench}–{@sim}.',
    ),
    ready: true,
    lessons: ['bench', 'vate', 'sim'],
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
        title: loc('虚拟 ATE 工作站', 'Virtual ATE workstation'),
        text: loc(
          '{@vate}。IDDQ：选 DUT、VDD、向量、等待时间、量程，看读数为什么 PASS / FAIL / 无效。开短路：注入开路、短路、接触电阻，跑完自己定位故障。',
          '{@vate}. IDDQ: pick the DUT, VDD, vector, settling time and range, and see why the reading passes, fails or is invalid. Opens / shorts: inject opens, shorts and contact resistance, then locate the fault yourself.',
        ),
      },
      {
        title: loc('产线模拟器', 'Production simulator'),
        text: loc(
          '{@sim}。一颗 3.3V 器件、七个测试项、六个 Bin：改限值、跑批量、看 Cpk 与 Wafer Map，再判断过杀、漏检和故障根因；还能自己出题。',
          '{@sim}. One 3.3 V device, seven tests, six bins: edit limits, run lots, read Cpk and the wafer map, then judge overkill, underkill and the root cause—and write your own question.',
        ),
      },
      {
        title: loc('和讲义的关系', 'How this relates to the lessons'),
        text: loc(
          '词在 {@pmu} / {@timing} / {@dc}。这里不讲新名词，只让你亲手把 Pass 拧成 Fail，再自己说出原因。',
          'The terms are in {@pmu} / {@timing} / {@dc}. No new names here: you turn a pass into a fail yourself, then say why.',
        ),
      },
    ],
  },
  {
    id: 'glossary',
    title: loc('术语表', 'Glossary'),
    blurb: loc(
      '把 D、F、T（MOS）、L（PCB）、A（模拟）、H（高速）、R（射频）、M（存储器）、P（功率）、S（传感器）、Q（可靠性）、C（硅光）几条轨道里讲到的名词收在一起：原文、中英文名、一句话解释和出处课程。可以搜索，可以按课程或按 A–Z 看。',
      'Terms from the D, F, T (MOS), L (PCB), A (analog), H (high-speed), R (RF), M (memory), P (power), S (sensor), Q (reliability) and C (silicon photonics) tracks in one place: the original name, Chinese and English names, a one-line definition and the lessons it comes from. Search it, or browse by lesson or A–Z.',
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
  // 预备轨用 B（Before）：power 轨道已占用 P
  prep: 'B',
  // MOS 轨用 T（Transistor）：M 已给 Memory；PCB 轨用 L（Layout）：P 已给 power、B 已给预备
  mos: 'T',
  pcb: 'L',
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

/**
 * 「基础 / 数字」与「数字测试基础」同一主题的对应课。
 * 课页底自动互链，避免两套课被当成两遍新课。
 */
export const SIBLING_LESSONS: Partial<Record<ModuleId, readonly ModuleId[]>> = {
  intro: ['fAte'],
  connection: ['fAte'],
  ate: ['fIntro'],
  pmu: ['fOpens', 'fIntro'],
  spec: ['fSpec'],
  dc: ['fDc'],
  func: ['fFunc'],
  timing: ['fAc'],
  vector: ['fVector'],
  scan: ['fScan'],
  program: ['fProgram'],
  shmoo: ['fChar'],
  latch: ['fLatch'],
  fBasics: ['pDigital', 'intro'],
  fAte: ['intro', 'connection'],
  fIntro: ['ate', 'pmu'],
  fSpec: ['spec'],
  fOpens: ['pmu'],
  fDc: ['dc'],
  fFunc: ['func'],
  fAc: ['timing'],
  fChar: ['shmoo'],
  fVector: ['vector'],
  fProgram: ['program'],
  fCreate: ['program'],
  fDebug: ['program'],
  fQualify: ['program'],
  fLatch: ['latch'],
  fScan: ['scan'],
}

export const SIBLING_LABEL = loc('对应课（同一主题，不重复上）：', 'Matching lesson (same topic, not a second copy): ')

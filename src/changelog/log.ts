import { loc, type LText } from '../i18n/locale'
import { type ModuleId } from '../modules/catalog'

/**
 * 网站更新日志，新的在前。
 * 学生能看到的改动，在数组最前面加一条。id 定了就别改。
 * 2026-09-24 到上一条之间的旧记录，按 git 提交整理成一条一条。
 */
export type ChangeEntry = {
  id: string
  date: string
  title: LText
  body: LText
  lessons: ModuleId[]
}

export const CHANGELOG: ChangeEntry[] = [
  {
    id: '2026-11-21-substrate-socket',
    date: '2026-11-21',
    title: loc('更新日志、基板厂、测试座和探针卡', 'Changelog, substrate makers, sockets and probe cards'),
    body: loc(
      '全站加上这份更新日志。封装基板课写入基板厂名单，并分开封测厂。制造流程新增两课：负载板 PCB 上的 Socket，以及探针卡自己的 PCB、空间转换和过驱动。',
      'The site gains this changelog. The package-substrate lesson lists substrate makers and separates the OSAT. Two manufacturing lessons cover the socket on the load-board PCB, and the probe card PCB, space transformer and overdrive.',
    ),
    lessons: ['mfgSubstrate', 'mfgSocket', 'mfgProbe'],
  },
  {
    id: '2026-11-16-review',
    date: '2026-11-16',
    title: loc('复盘并补充课程', 'Review and extra lesson material'),
    body: loc(
      '复盘已有课程，补充先进封装、高速，以及基础、存储、MOS 和预备里的内容。',
      'Reviewed existing lessons and added material in advanced packaging, high-speed, fundamentals, memory, MOS and prep.',
    ),
    lessons: ['apkOverview', 'hsBasics'],
  },
  {
    id: '2026-11-12-tools',
    date: '2026-11-12',
    title: loc('常用工具', 'Tools'),
    body: loc(
      '首页和顶栏加入常用工具：进制、电路和 PCB 尺寸一类的计算器。',
      'The home page and top bar gain Tools: calculators for number bases, circuits and PCB dimensions.',
    ),
    lessons: [],
  },
  {
    id: '2026-11-07-phone',
    date: '2026-11-07',
    title: loc('手机上的排版', 'Layout on a phone'),
    body: loc(
      '收紧页头、导航和反馈区在窄屏上的排版。',
      'Tightened the header, navigation and feedback layout on a narrow screen.',
    ),
    lessons: [],
  },
  {
    id: '2026-11-05-learn-first',
    date: '2026-11-05',
    title: loc('先讲知识，再做题', 'Explain first, then the questions'),
    body: loc(
      '各条轨道的课页改成先读懂、再练习、再做题。制造、模拟、高速、射频、存储、功率、传感器、硅光和可靠性都按这个顺序重排过。',
      'Lesson pages now read as learn, then practice, then questions. Manufacturing, analog, high-speed, RF, memory, power, sensors, silicon photonics and reliability were rearranged to that order.',
    ),
    lessons: ['mfgOverview', 'anaOverview'],
  },
  {
    id: '2026-11-05-home',
    date: '2026-11-05',
    title: loc('首页和轨道名称', 'Home page and track names'),
    body: loc(
      '调整首页介绍和各轨道的名称、简介。',
      'Adjusted the home-page introduction and the name and blurb of each track.',
    ),
    lessons: [],
  },
  {
    id: '2026-11-05-pcb-3d',
    date: '2026-11-05',
    title: loc('PCB 三维视图', 'PCB 3D view'),
    body: loc(
      'PCB 入门课加上可转的三维板子，用来指螺丝、走线、过孔、地平面和屏蔽罩。',
      'The PCB introduction gains a rotatable 3D board for pointing out the screw, traces, vias, ground plane and shield.',
    ),
    lessons: ['pcbIntro'],
  },
  {
    id: '2026-11-04-pcb',
    date: '2026-11-04',
    title: loc('PCB 题目', 'PCB questions'),
    body: loc(
      '更新 PCB 各课的练习和题目。',
      'Updated the practice steps and questions in the PCB lessons.',
    ),
    lessons: ['pcbBasics'],
  },
  {
    id: '2026-11-03-sensor-photonics',
    date: '2026-11-03',
    title: loc('传感器和硅光', 'Sensors and silicon photonics'),
    body: loc(
      '新开传感器和硅光两条轨道，并补充功率与可靠性的内容。',
      'Opened the sensor and silicon-photonics tracks, and added more power and reliability material.',
    ),
    lessons: ['snsOverview', 'picOverview'],
  },
  {
    id: '2026-10-24-power-qual',
    date: '2026-10-24',
    title: loc('产线模拟器、STDF、功率和可靠性', 'Production simulator, STDF, power and reliability'),
    body: loc(
      '数字课后面的模拟器重做。新增 STDF 和多 Site 两课，并开出功率器件和可靠性（含车规向）两条轨道。',
      'Rebuilt the simulator that follows the digital lessons. Added STDF and multi-site lessons, and opened the power-device and reliability tracks.',
    ),
    lessons: ['sim', 'genStdf', 'genMultisite', 'pwrSelector', 'relBurnIn'],
  },
  {
    id: '2026-10-20-four-tracks',
    date: '2026-10-20',
    title: loc('模拟、存储、射频、高速', 'Analog, memory, RF and high-speed'),
    body: loc(
      '一次加上模拟、存储、射频、高速四条轨道。',
      'Added the analog, memory, RF and high-speed tracks in one pass.',
    ),
    lessons: ['anaOverview', 'memStructure', 'rfOverview', 'hsBasics'],
  },
  {
    id: '2026-10-17-atesim',
    date: '2026-10-17',
    title: loc('ATE 产线模拟', 'ATE production simulation'),
    body: loc(
      '加上整条产线的模拟：改限值、跑一批、看良率和晶圆图。',
      'Added a full production-line simulation: edit limits, run a lot, read yield and the wafer map.',
    ),
    lessons: ['sim'],
  },
  {
    id: '2026-10-15-glossary',
    date: '2026-10-15',
    title: loc('术语表和常见问题', 'Glossary and FAQ'),
    body: loc(
      '术语表和常见问题收进站内，MOS 和 PCB 的词条一起放上来。',
      'The glossary and FAQ moved into the site, including the MOS and PCB terms.',
    ),
    lessons: [],
  },
  {
    id: '2026-10-15-prep-mos-pcb',
    date: '2026-10-15',
    title: loc('预备、MOS 和 PCB', 'Prep, MOS and PCB'),
    body: loc(
      '新开三条基础轨道：预备、MOS 管、PCB。',
      'Opened three foundation tracks: prep, the MOS transistor and PCB.',
    ),
    lessons: ['pIndustry', 'mosIntro', 'pcbIntro'],
  },
  {
    id: '2026-10-14-prep',
    date: '2026-10-14',
    title: loc('更前面的基础课', 'Earlier foundation lessons'),
    body: loc(
      '在数字测试前面加预备课，先讲产业、硅片和封装这些名词。',
      'Added prep lessons in front of digital test, for industry, silicon and package vocabulary.',
    ),
    lessons: ['pIndustry'],
  },
  {
    id: '2026-10-11-icon',
    date: '2026-10-11',
    title: loc('站名和图标', 'Site name and icon'),
    body: loc(
      '站点改名并换上图标。',
      'Renamed the site and replaced the icon.',
    ),
    lessons: [],
  },
  {
    id: '2026-10-11-fund',
    date: '2026-10-11',
    title: loc('数字测试基础轨道', 'Digital-test fundamentals track'),
    body: loc(
      '把数字测试基础那一条轨道补全，包括物理连接的三维场景。',
      'Filled out the digital-test fundamentals track, including the 3D physical-connection scene.',
    ),
    lessons: ['fAte', 'connection'],
  },
  {
    id: '2026-10-11-faq',
    date: '2026-10-11',
    title: loc('提问入口', 'A way to ask'),
    body: loc(
      '常见问题页加上提问入口，并修了一批页面问题。',
      'The FAQ page gained a way to send a question, and a batch of page issues was fixed.',
    ),
    lessons: [],
  },
  {
    id: '2026-10-11-basics',
    date: '2026-10-11',
    title: loc('基础课的讲解', 'Explanations in the basics'),
    body: loc(
      '收紧基础课和物理连接课的讲解、图和练习。',
      'Tightened the explanations, figures and practice in the basics and the physical-connection lesson.',
    ),
    lessons: ['intro', 'connection'],
  },
  {
    id: '2026-10-10-chapters',
    date: '2026-10-10',
    title: loc('补齐章节', 'The rest of the chapters'),
    body: loc(
      '数字测试从直流、功能、时序一路补到扫描和程序。',
      'Digital test was filled in from DC, functional and timing through scan and the program.',
    ),
    lessons: ['dc', 'func', 'timing', 'scan', 'program'],
  },
  {
    id: '2026-10-10-theme',
    date: '2026-10-10',
    title: loc('主题和课页细节', 'Theme and lesson detail'),
    body: loc(
      '统一全站主题，并把已有课页的细节写清楚。',
      'Unified the site theme and spelled out the detail on the lessons that already existed.',
    ),
    lessons: ['intro'],
  },
  {
    id: '2026-09-24-explain',
    date: '2026-09-24',
    title: loc('把解释写清楚', 'Clearer explanations'),
    body: loc(
      '功能、时序、向量、扫描这几课的解释改得更直白。',
      'Rewrote the explanations in functional, timing, vector and scan so they read more directly.',
    ),
    lessons: ['func', 'timing', 'vector', 'scan'],
  },
  {
    id: '2026-09-24-after-third',
    date: '2026-09-24',
    title: loc('第三课之后的内容', 'Material after the third lesson'),
    body: loc(
      '在开篇和物理连接之后，补上 ATE、PMU、规格、直流、功能和时序。',
      'After the opener and the physical connection, added ATE, the PMU, specs, DC, functional and timing.',
    ),
    lessons: ['ate', 'pmu', 'spec', 'dc'],
  },
  {
    id: '2026-09-24-first',
    date: '2026-09-24',
    title: loc('第一版', 'First version'),
    body: loc(
      '站点第一版：能看测试在测什么，以及 DUT 怎样接到测试机。更早的修改没有进 git。',
      'First version of the site: what test measures, and how the DUT is wired to the tester. Changes before this were not in git.',
    ),
    lessons: ['intro', 'connection'],
  },
]

import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { type ModuleId } from '../../catalog'

export const S = {
  kickerTime: loc('时间轴', 'Timeline'),
  kickerCount: loc('集成度', 'Integration'),
  introTitle: loc('只记和测试有关的拐点', 'Only the turning points that matter for test'),
  timeTitle: loc('八十年，九个节点', 'Eighty years, nine milestones'),
  timeNote: loc('点轴上的年份看那一年发生了什么、对测试意味着什么。', 'Click a year on the axis to see what happened and what it meant for test.'),
  impact: loc('对测试：', 'For test: '),
  countTitle: loc('晶体管数量：每两年大约翻一番', 'Transistor count: roughly doubling every two years'),
  countNote: loc(
    '纵轴是对数刻度，每格 ×100。点一个芯片看它的晶体管数。虚线是从 4004 出发「每两年翻倍」的参考线。',
    'The vertical axis is logarithmic, ×100 per grid line. Click a chip to see its transistor count. The dashed line is a “doubles every two years” reference starting from the 4004.',
  ),
  exhaustTitle: loc('为什么不能把所有输入组合都试一遍', 'Why you cannot try every input combination'),
  exhaustNote: loc(
    '拖动输入位数。假设测试机每秒打 1 亿个向量（100 MHz），只算纯组合电路。',
    'Drag the number of inputs. Assume the tester applies 100 million vectors per second (100 MHz), combinational logic only.',
  ),
  bits: loc('输入位数', 'Number of inputs'),
  patterns: loc('组合数 2ⁿ', 'Combinations 2ⁿ'),
  time: loc('全部打完需要', 'Time to apply all'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '年份取的是公开资料里最常引用的那一年。结构化测试与 Scan 的做法见 {@vector}、{@scan}。',
    'Years are the ones most commonly cited in public sources. How structured test and Scan work: {@vector}, {@scan}.',
  ),
  next: loc('下一课：从硅到芯片', 'Next: From Silicon to Chip'),
}

export const INTRO: LText[] = [
  loc(
    '1946 年的 ENIAC 用了约 1.7 万只真空管，坏一只就得停机去找。那时的「测试」就是修机器。今天一颗手机芯片有上百亿个晶体管，出厂前每一颗都要自动测过。',
    'ENIAC in 1946 used about 17,000 vacuum tubes; when one failed, the machine stopped while someone hunted for it. “Test” then meant repairing the machine. Today a phone chip has tens of billions of transistors, and every one shipped is tested automatically first.',
  ),
  loc(
    '这中间发生了什么？本课只挑会改变测试方式的节点：器件变小、集成度暴涨、产业分工、管脚和速度上去以后，测试被逼着换了几次方法。',
    'What happened in between? This lesson picks only the milestones that changed how test is done: devices shrank, integration exploded, the industry split up, and as pin counts and speeds rose, test had to change methods several times.',
  ),
]

export type EventId = 'transistor' | 'ic' | 'ate' | 'moore' | 'mpu' | 'foundry' | 'jtag' | 'finfet' | 'chiplet'

export const EVENTS: Array<{ id: EventId; year: number; title: LText; text: LText; impact: LText; links: ModuleId[] }> = [
  {
    id: 'transistor',
    year: 1947,
    title: loc('晶体管', 'The transistor'),
    text: loc(
      '贝尔实验室做出第一只点接触晶体管。固态器件比真空管小、省电、寿命长，电子设备开始变小。',
      'Bell Labs builds the first point-contact transistor. Solid-state devices are smaller, use less power and last longer than tubes, and electronics start to shrink.',
    ),
    impact: loc('器件开始批量生产，需要按参数分选（例如按放大倍数分档）。', 'Devices are mass-produced and need sorting by parameter (for example by gain).'),
    links: ['pParts'],
  },
  {
    id: 'ic',
    year: 1958,
    title: loc('集成电路', 'The integrated circuit'),
    text: loc(
      '德州仪器的 Kilby 在一块锗片上做出多个元件互连的电路（1958）；仙童的 Noyce 随后用平面工艺做出硅集成电路（1959）。',
      'Kilby at Texas Instruments builds several interconnected components on one piece of germanium (1958); Noyce at Fairchild follows with the silicon integrated circuit using the planar process (1959).',
    ),
    impact: loc('一颗芯片里装了很多元件，坏了没法拆开修，只能整颗判好坏。', 'Many components live in one chip; if it fails you cannot open it and fix it, you can only judge the whole chip good or bad.'),
    links: ['pSilicon'],
  },
  {
    id: 'ate',
    year: 1960,
    title: loc('自动测试设备', 'Automatic test equipment'),
    text: loc(
      'Teradyne 等公司在 1960 年代推出自动测试设备，用程序控制加信号、测量和判定，取代人工逐个摆弄仪表。',
      'Teradyne and others introduce automatic test equipment in the 1960s: a program drives the stimulus, the measurement and the verdict, replacing people working meters by hand.',
    ),
    impact: loc('测试第一次变成「写程序」。这就是后面所有课里的 ATE。', 'For the first time, test becomes “writing a program”. This is the ATE in every later lesson.'),
    links: ['intro', 'ate'],
  },
  {
    id: 'moore',
    year: 1965,
    title: loc('摩尔定律', 'Moore’s law'),
    text: loc(
      '戈登·摩尔观察到芯片上的元件数每年翻一番，1975 年修正为大约每两年翻一番。这条经验规律后来几十年基本成立。',
      'Gordon Moore observes that the number of components per chip doubles every year, revised in 1975 to about every two years. The rule of thumb held roughly for decades.',
    ),
    impact: loc('电路越来越大，测试向量和测试时间跟着涨，测试成本成了大问题。', 'Circuits grow, test vectors and test time grow with them, and test cost becomes a major issue.'),
    links: ['vector'],
  },
  {
    id: 'mpu',
    year: 1971,
    title: loc('微处理器', 'The microprocessor'),
    text: loc('英特尔 4004：约 2300 个晶体管，4 位，一颗芯片就是一个 CPU。', 'Intel 4004: about 2,300 transistors, 4-bit, a whole CPU on one chip.'),
    impact: loc('芯片里有了状态（寄存器、存储），只看输入输出很难知道内部对不对。', 'Chips now hold state (registers, memory); looking only at inputs and outputs makes it hard to tell whether the inside is right.'),
    links: ['pDigital', 'func'],
  },
  {
    id: 'foundry',
    year: 1987,
    title: loc('代工模式', 'The foundry model'),
    text: loc(
      '台积电成立，专门替别人造晶圆。设计公司不用自建晶圆厂，Fabless + Foundry + OSAT 的分工逐渐成形。',
      'TSMC is founded to build wafers for others. Design companies no longer need their own fabs, and the Fabless + Foundry + OSAT split gradually takes shape.',
    ),
    impact: loc('测试也可以外包：同一份程序要在封测厂的 ATE 上稳定跑量产。', 'Test can be outsourced too: one program has to run reliably in production on an OSAT’s ATE.'),
    links: ['pIndustry'],
  },
  {
    id: 'jtag',
    year: 1990,
    title: loc('JTAG / 可测性设计', 'JTAG / design for test'),
    text: loc(
      'IEEE 1149.1（JTAG 边界扫描）成为标准。同一时期 Scan 链和 ATPG 工具普及：在设计阶段就把「怎么测」做进芯片。',
      'IEEE 1149.1 (JTAG boundary scan) becomes a standard. In the same period scan chains and ATPG tools spread: how to test is built into the chip at design time.',
    ),
    impact: loc('不再靠从外面硬试，而是让内部触发器能被直接装数和读出。', 'Instead of probing from outside by brute force, internal flip-flops can be loaded and read directly.'),
    links: ['scan', 'fScan'],
  },
  {
    id: 'finfet',
    year: 2011,
    title: loc('FinFET', 'FinFET'),
    text: loc(
      '22 nm 起晶体管从平面变成立体的鳍式结构（FinFET），继续缩小尺寸、控制漏电。',
      'From 22 nm on, transistors change from planar to a three-dimensional fin structure (FinFET) to keep shrinking and control leakage.',
    ),
    impact: loc('工艺更复杂，缺陷种类更多，电压更低、余量更小，表征和 Shmoo 更重要。', 'The process gets more complex, defect types multiply, voltages drop and margins shrink, so characterization and Shmoo matter more.'),
    links: ['shmoo', 'fChar'],
  },
  {
    id: 'chiplet',
    year: 2022,
    title: loc('Chiplet 互连标准', 'Chiplet interconnect standard'),
    text: loc(
      'UCIe 等标准发布，多颗小 die 装进一个封装里拼成大芯片（Chiplet）。2.5D / 3D 封装成为主流高性能芯片的做法。',
      'Standards such as UCIe are released, and several small dies are combined in one package to form a big chip (chiplets). 2.5D / 3D packaging becomes the norm for high-end chips.',
    ),
    impact: loc(
      '一颗坏 die 会拖累整个封装，所以装之前要确认每颗都是好的（KGD，Known Good Die），封完还要测互连。',
      'One bad die ruins the whole package, so each die must be confirmed good before assembly (KGD, Known Good Die), and the interconnect is tested again after.',
    ),
    links: ['pPackage'],
  },
]

export type ChipPoint = { id: string; name: string; year: number; count: number }

/** 公开资料中的典型晶体管数 */
export const CHIPS: ChipPoint[] = [
  { id: 'i4004', name: 'Intel 4004', year: 1971, count: 2.3e3 },
  { id: 'i8086', name: 'Intel 8086', year: 1978, count: 2.9e4 },
  { id: 'i386', name: 'Intel 80386', year: 1985, count: 2.75e5 },
  { id: 'p5', name: 'Intel Pentium', year: 1993, count: 3.1e6 },
  { id: 'p4', name: 'Intel Pentium 4', year: 2000, count: 4.2e7 },
  { id: 'c2d', name: 'Intel Core 2 Duo', year: 2006, count: 2.91e8 },
  { id: 'gf100', name: 'NVIDIA GF100', year: 2010, count: 3.0e9 },
  { id: 'm1', name: 'Apple M1', year: 2020, count: 1.6e10 },
]

const trim = (s: string) => s.replace(/\.0$/, '')

export function fmtCount(n: number): LText {
  let en = n.toLocaleString('en-US')
  if (n >= 1e9) {
    en = `${trim((n / 1e9).toFixed(1))} billion`
  } else if (n >= 1e6) {
    en = `${trim((n / 1e6).toFixed(1))} million`
  }
  if (n >= 1e8) {
    return loc(`约 ${trim((n / 1e8).toFixed(1))} 亿`, `about ${en}`)
  }
  if (n >= 1e4) {
    return loc(`约 ${trim((n / 1e4).toFixed(1))} 万`, `about ${en}`)
  }
  return loc(`约 ${n.toFixed(0)}`, `about ${en}`)
}

export const VECTOR_RATE = 1e8

export function fmtDuration(seconds: number): LText {
  if (seconds < 1e-3) {
    return loc(`${(seconds * 1e6).toFixed(1)} 微秒`, `${(seconds * 1e6).toFixed(1)} µs`)
  }
  if (seconds < 1) {
    return loc(`${(seconds * 1e3).toFixed(1)} 毫秒`, `${(seconds * 1e3).toFixed(1)} ms`)
  }
  if (seconds < 120) {
    return loc(`${seconds.toFixed(1)} 秒`, `${seconds.toFixed(1)} s`)
  }
  if (seconds < 7200) {
    return loc(`${(seconds / 60).toFixed(1)} 分钟`, `${(seconds / 60).toFixed(1)} minutes`)
  }
  if (seconds < 172800) {
    return loc(`${(seconds / 3600).toFixed(1)} 小时`, `${(seconds / 3600).toFixed(1)} hours`)
  }
  const years = seconds / 3.156e7
  if (years < 2) {
    return loc(`${(seconds / 86400).toFixed(0)} 天`, `${(seconds / 86400).toFixed(0)} days`)
  }
  return loc(`${years.toLocaleString('en-US', { maximumFractionDigits: 0 })} 年`, `${years.toLocaleString('en-US', { maximumFractionDigits: 0 })} years`)
}

export function verdict(seconds: number): { tone: 'ok' | 'warn' | 'bad'; text: LText } {
  if (seconds < 0.1) {
    return { tone: 'ok', text: loc('可以穷举：一眨眼就测完。', 'Exhaustive is fine: done in a blink.') }
  }
  if (seconds < 10) {
    return {
      tone: 'warn',
      text: loc('勉强：量产每颗芯片的测试时间通常按秒计，这一项就吃掉了大半。', 'Marginal: production test time per chip is usually counted in seconds, and this one item eats most of it.'),
    }
  }
  return { tone: 'bad', text: loc('不可能：必须换方法，只挑能抓住缺陷的向量。', 'Impossible: you must change method and apply only the vectors that catch defects.') }
}

export const EXHAUST_BODY: LText[] = [
  loc(
    '一个 32 位加法器就有 64 个输入（再加进位）。即使测试机每秒打 1 亿个向量，把 2⁶⁴ 种组合打完也要几千年——这还没算时序电路的内部状态。',
    'A 32-bit adder alone has 64 inputs (plus carry). Even at 100 million vectors per second, applying all 2⁶⁴ combinations takes thousands of years, and that ignores the internal state of sequential logic.',
  ),
  loc(
    '所以行业改成「按故障模型挑向量」：用 ATPG 工具只生成能发现某类缺陷的向量，再用 Scan 把内部触发器变成可以直接装数、读数的移位寄存器。做法见 {@vector}、{@scan}，F 轨对应 {@fVector}、{@fScan}。',
    'So the industry switched to choosing vectors by fault model: ATPG tools generate only the vectors that expose a given class of defect, and Scan turns internal flip-flops into a shift register you can load and read directly. How it works: {@vector}, {@scan}; in the F track, {@fVector}, {@fScan}.',
  ),
]

export const TAKEAWAY: LText[] = [
  loc('晶体管（1947）→ 集成电路（1958）→ ATE（1960 年代）：测试从修机器变成写程序。', 'Transistor (1947) → IC (1958) → ATE (1960s): test changes from repairing machines to writing programs.'),
  loc('集成度大约每两年翻一番；电路越大，测试向量和时间越多。', 'Integration roughly doubles every two years; the bigger the circuit, the more test vectors and time.'),
  loc('穷举 2ⁿ 很快不可能，于是有了故障模型、ATPG 和 Scan（可测性设计）。', 'Exhaustive 2ⁿ quickly becomes impossible, which led to fault models, ATPG and Scan (design for test).'),
  loc('代工分工让测试也能外包；Chiplet 让「已知好 die」成为新要求。', 'The foundry split lets test be outsourced too; chiplets make “known good die” a new requirement.'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('集成电路出现以后，测试最大的变化是？', 'After the integrated circuit appeared, what changed most for test?'),
    options: [
      { id: 'a', text: loc('坏了可以拆开换元件', 'Failed parts can be opened and components replaced') },
      { id: 'b', text: loc('只能整颗判好坏，而且要批量自动测', 'Only the whole chip can be judged, and it must be tested automatically in volume') },
      { id: 'c', text: loc('不再需要测试', 'Test is no longer needed') },
    ],
    answer: 'b',
    explain: loc('元件都在一块硅上，不能拆修；数量大，只能靠设备自动判定。', 'All components share one piece of silicon and cannot be repaired; with high volume, only automatic equipment can judge them.'),
  },
  {
    id: 'q2',
    prompt: loc('摩尔定律（1975 年修正版）说的是？', 'What does Moore’s law (1975 revision) say?'),
    options: [
      { id: 'a', text: loc('芯片上的晶体管数大约每两年翻一番', 'Transistors per chip roughly double every two years') },
      { id: 'b', text: loc('芯片价格每年减半', 'Chip prices halve every year') },
      { id: 'c', text: loc('测试时间每两年减半', 'Test time halves every two years') },
    ],
    answer: 'a',
    explain: loc('它是对集成度增长的经验观察，不是物理定律。', 'It is an empirical observation about integration, not a law of physics.'),
  },
  {
    id: 'q3',
    prompt: loc('一个纯组合电路有 40 个输入，测试机每秒打 1 亿个向量，穷举要多久？', 'A combinational circuit has 40 inputs and the tester applies 100 million vectors per second. How long does exhaustive test take?'),
    options: [
      { id: 'a', text: loc('约 0.4 秒', 'About 0.4 s') },
      { id: 'b', text: loc('约 3 小时', 'About 3 hours') },
      { id: 'c', text: loc('约 3000 年', 'About 3,000 years') },
    ],
    answer: 'b',
    explain: loc('2⁴⁰ ≈ 1.1 × 10¹²，除以 10⁸/秒 ≈ 1.1 × 10⁴ 秒 ≈ 3 小时。量产根本等不起。', '2⁴⁰ ≈ 1.1 × 10¹²; divided by 10⁸/s gives ≈ 1.1 × 10⁴ s ≈ 3 hours. Production cannot wait that long.'),
  },
  {
    id: 'q4',
    prompt: loc('Scan / ATPG 解决的核心问题是？', 'What core problem do Scan / ATPG solve?'),
    options: [
      { id: 'a', text: loc('让芯片跑得更快', 'Making the chip run faster') },
      { id: 'b', text: loc('不穷举也能有效发现缺陷，并且能直接控制、观察内部触发器', 'Finding defects effectively without exhaustive test, by directly controlling and observing internal flip-flops') },
      { id: 'c', text: loc('减少芯片管脚数', 'Reducing pin count') },
    ],
    answer: 'b',
    explain: loc('ATPG 按故障模型挑向量，Scan 让内部状态可装可读。细节见后面的 Scan 课。', 'ATPG picks vectors by fault model and Scan makes internal state loadable and readable. Details in the Scan lessons.'),
  },
  {
    id: 'q5',
    prompt: loc('Chiplet 封装为什么特别强调 KGD（已知好 die）？', 'Why does chiplet packaging stress KGD (known good die)?'),
    options: [
      { id: 'a', text: loc('一颗坏 die 会让整个多 die 封装报废', 'One bad die scraps the whole multi-die package') },
      { id: 'b', text: loc('Chiplet 不需要 FT', 'Chiplets need no FT') },
      { id: 'c', text: loc('KGD 是一种封装材料', 'KGD is a packaging material') },
    ],
    answer: 'a',
    explain: loc('多颗 die 装在一起，任何一颗坏都会连累其它好 die 和昂贵的封装，所以装之前要测得更充分。', 'With several dies in one package, any bad one wastes the good ones and the expensive package, so each must be tested more thoroughly before assembly.'),
  },
]

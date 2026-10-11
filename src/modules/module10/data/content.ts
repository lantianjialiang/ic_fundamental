import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

/* ---------------- 穷举会爆炸 ---------------- */

/** 测试速率 10 MHz：每条向量 100 ns */
export const RATE_HZ = 10e6
export const N_MAX = 64
export const S_MAX = 32
export const YEAR_S = 3.156e7
export const UNIVERSE_S = 4.35e17

export const secondsOf = (bits: number) => 2 ** bits / RATE_HZ

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }

export const sup = (n: number | string) =>
  String(n)
    .split('')
    .map((c) => SUP[c] ?? c)
    .join('')

/** 科学计数：1.8 × 10¹⁹ */
export function sci(x: number) {
  const exp = Math.floor(Math.log10(x))
  const m = x / 10 ** exp
  return `${m.toFixed(1)} × 10${sup(exp)}`
}

const num3 = (x: number) => (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2))

export function countText(bits: number) {
  return bits <= 30 ? (2 ** bits).toLocaleString('en-US') : `≈ ${sci(2 ** bits)}`
}

export const UNIT = {
  ns: loc('ns', 'ns'),
  us: loc('µs', 'µs'),
  ms: loc('ms', 'ms'),
  s: loc('秒', 's'),
  min: loc('分钟', 'min'),
  h: loc('小时', 'h'),
  day: loc('天', 'days'),
  yr: loc('年', 'years'),
}

/** 把秒换成合适的单位 */
export function timeParts(sec: number): { value: string; unit: LText } {
  if (sec < 1e-6) return { value: (sec * 1e9).toFixed(0), unit: UNIT.ns }
  if (sec < 1e-3) return { value: num3(sec * 1e6), unit: UNIT.us }
  if (sec < 1) return { value: num3(sec * 1e3), unit: UNIT.ms }
  if (sec < 60) return { value: num3(sec), unit: UNIT.s }
  if (sec < 3600) return { value: num3(sec / 60), unit: UNIT.min }
  if (sec < 86400) return { value: num3(sec / 3600), unit: UNIT.h }
  if (sec < YEAR_S) return { value: num3(sec / 86400), unit: UNIT.day }
  const y = sec / YEAR_S
  return { value: y < 1e4 ? num3(y) : sci(y), unit: UNIT.yr }
}

/* ---------------- 三种向量来源 ---------------- */

export type SourceId = 'func' | 'algo' | 'atpg'

export const SOURCES: Array<{ id: SourceId; title: LText; text: LText }> = [
  {
    id: 'func',
    title: loc('Functional', 'Functional'),
    text: loc(
      '主要来自设计验证：设计 / 验证工程师用 testbench 跑仿真，把仿真波形（VCD）转成测试向量（WGL、STIL 等格式）交给测试工程师。测试工程师把它转成测试机格式，配上时序（Drive / Strobe 时刻）和电平，再上机调试；只有少量向量由测试工程师针对规格补写，例如某个特定工作模式或边界条件。Functional 证明芯片「功能对」，但说不出覆盖了多少故障。',
      'Mostly from design verification: design or verification engineers run testbench simulations, and the simulation waveforms (VCD) are converted into test vectors (WGL, STIL and similar formats) for the test engineer. The test engineer converts them to the tester format, adds timing (drive / strobe times) and levels, and debugs them on the tester. Only a few vectors are written by the test engineer for specific spec items, such as a particular operating mode or a boundary condition. Functional vectors prove the function is right but say nothing about fault coverage.',
    ),
  },
  {
    id: 'algo',
    title: loc('Algorithmic', 'Algorithmic'),
    text: loc(
      '面向 Memory 这类规则阵列，用 March 等算法（逐个地址写 0，再逐个读 0 写 1……），不预先存 2ⁿ 条，而是现场生成：一种是测试机的 APG（算法图形发生器）按地址边跑边算下一拍；另一种是 DFT 插在片内的 MBIST（Memory BIST）电路自己跑算法，测试机只负责启动它、读回 Pass / Fail。测试工程师选算法、写 APG 程序，或按 DFT 给的步骤调用 MBIST。',
      'For regular arrays such as memory, using March-type algorithms (write 0 to every address, then read 0 and write 1 at every address, …). Nothing is stored as 2ⁿ vectors; the vectors are generated live. Either the tester’s APG (algorithmic pattern generator) computes each cycle from the address on the fly, or an on-chip MBIST (memory BIST) circuit inserted by DFT runs the algorithm itself, and the tester only starts it and reads back pass / fail. The test engineer picks the algorithm and writes the APG program, or runs MBIST following the steps provided by DFT.',
    ),
  },
  {
    id: 'atpg',
    title: loc('ATPG / Scan', 'ATPG / Scan'),
    text: loc(
      '由 DFT 工程师提供：他们在设计里插入 Scan 链（以及 Logic BIST、Memory BIST 等电路），再用 ATPG（Automatic Test Pattern Generation）工具读门级网表和故障模型，对每个故障自动搜一条能抓到它的向量，报出故障覆盖率，输出 STIL / WGL 等 Pattern 文件。测试工程师拿到后转成测试机格式、配时序和电平、上机调试。量产程序里常有一半左右的向量是 DFT 工程师给的。',
      'Provided by the DFT engineer: they insert scan chains (and circuits such as logic BIST and memory BIST) into the design, then run an ATPG (Automatic Test Pattern Generation) tool on the gate-level netlist and a fault model. The tool searches for a vector that catches each fault, reports fault coverage, and writes pattern files such as STIL or WGL. The test engineer converts them to the tester format, adds timing and levels, and debugs them on the tester. In a production program, roughly half of the vectors often come from the DFT engineer.',
    ),
  },
]

/* ---------------- 与门上的 Stuck-at ---------------- */

export type FaultId = 'A0' | 'Y0' | 'Y1'
export type Bit = 0 | 1

export const VECTORS: Array<{ id: string; a: Bit; b: Bit }> = [
  { id: '00', a: 0, b: 0 },
  { id: '01', a: 0, b: 1 },
  { id: '10', a: 1, b: 0 },
  { id: '11', a: 1, b: 1 },
]

export const FAULTS: Array<{ id: FaultId; label: LText; text: LText }> = [
  {
    id: 'A0',
    label: loc('A 粘在 0', 'A stuck-at-0'),
    text: loc(
      'A 粘在 0：要先让好电路的 A = 1 才能「激活」它，还要 B = 1 让差别「传」到 Y。只有 11 能抓到。A 粘 0 时与门输出恒为 0，和 Y 粘在 0 的坏芯片对任何输入都输出一样，从外面根本分不出是哪一个，这叫等价故障（B 粘 0 也一样）。ATPG 对一组等价故障只需测一个。',
      'A stuck-at-0: the good circuit must drive A = 1 to activate it, and B = 1 to propagate the difference to Y. Only 11 catches it. With A stuck at 0 the AND output is always 0, so for every input it behaves exactly like Y stuck-at-0; from outside you cannot tell which one it is. Such faults are called equivalent (B stuck-at-0 too), and ATPG needs to target only one fault from each equivalent group.',
    ),
  },
  {
    id: 'Y0',
    label: loc('Y 粘在 0', 'Y stuck-at-0'),
    text: loc(
      'Y 粘在 0：好电路必须输出 1 才分得出好坏，与门只有 11 输出 1。',
      'Y stuck-at-0: the good circuit must output 1 to tell good from bad, and an AND gate outputs 1 only for 11.',
    ),
  },
  {
    id: 'Y1',
    label: loc('Y 粘在 1', 'Y stuck-at-1'),
    text: loc(
      'Y 粘在 1：好电路必须输出 0。00、01、10 任意一条都能抓到，ATPG 只挑一条就够。',
      'Y stuck-at-1: the good circuit must output 0. Any of 00, 01 or 10 catches it; ATPG picks just one.',
    ),
  },
]

export function evalAnd(a: Bit, b: Bit, fault: FaultId | null): { aIn: Bit; y: Bit } {
  const aIn: Bit = fault === 'A0' ? 0 : a
  if (fault === 'Y0') return { aIn, y: 0 }
  if (fault === 'Y1') return { aIn, y: 1 }
  return { aIn, y: (aIn & b) as Bit }
}

/* ---------------- 要点与复习题 ---------------- */

export const TAKEAWAY = [
  loc(
    'n 个输入要 2ⁿ 条向量；再加 s 个触发器，至少 2ⁿ⁺ˢ 条。几十位就要几千年，穷举交不了货。',
    'n inputs need 2ⁿ vectors; add s flip-flops and it is at least 2ⁿ⁺ˢ. A few dozen bits already take thousands of years, so exhaustive testing cannot ship product.',
  ),
  loc(
    'Functional 主要由设计验证仿真转出来，测试工程师只少量补写；Algorithmic 由 APG 或片内 MBIST 给 Memory 现场生成；ATPG / Scan 由 DFT 工程师用工具按门级网表和故障模型生成。测试工程师的活是转格式、配时序和电平、上机调试。',
    'Functional vectors mostly come from design-verification simulation, with only a few written by the test engineer; algorithmic vectors are generated live for memory by the APG or on-chip MBIST; ATPG / scan vectors are generated by the DFT engineer with tools from the gate netlist and a fault model. The test engineer converts formats, adds timing and levels, and debugs on the tester.',
  ),
  loc(
    '一条向量能不能抓到故障，看它能否激活故障、并把差别传到输出。Stuck-at 只问电平对不对，Transition 还问来不来得及。',
    'Whether a vector catches a fault depends on whether it activates the fault and propagates the difference to an output. Stuck-at asks only about levels; transition faults also ask about speed.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么 64 个输入的电路不能靠穷举交货？', 'Why can a 64-input circuit not be shipped with exhaustive testing?'),
    options: [
      { id: 'lazy', text: loc('只是工程师嫌麻烦', 'Engineers just find it tedious') },
      { id: 'time', text: loc('2⁶⁴ 条在 10 MHz 下要约 5.8 万年，时间根本不允许', '2⁶⁴ vectors at 10 MHz take about 58,000 years; there is simply no time') },
      { id: 'ate', text: loc('ATE 没有 64 个通道', 'The ATE does not have 64 channels') },
      { id: 'mem', text: loc('向量存储器只能存 64 条', 'Vector memory holds only 64 vectors') },
    ],
    answer: 'time',
    explain: loc(
      '2⁶⁴ ≈ 1.8 × 10¹⁹ 条，每条 100 ns，约 1.8 × 10¹² 秒 ≈ 5.8 万年。时间是硬约束。而且穷举只是把每种静态输入各跑一次，不保证抓到 Transition 这类要「特定前后一对向量 + 快时钟」的故障。',
      '2⁶⁴ ≈ 1.8 × 10¹⁹ vectors at 100 ns each is about 1.8 × 10¹² s ≈ 58,000 years. Time is a hard limit. Besides, exhaustive testing only applies each static input once; it does not guarantee catching faults such as transition faults, which need a specific pair of vectors and a fast clock.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('一个 20 输入的电路，再加 10 个触发器，穷举条数至少变成多少？', 'A 20-input circuit gains 10 flip-flops. What is the minimum exhaustive vector count now?'),
    options: [
      { id: 'add', text: loc('2²⁰ + 10，几乎不变', '2²⁰ + 10, almost unchanged') },
      { id: 'mul', text: loc('2³⁰，约是原来的 1000 倍', '2³⁰, about 1000 times more') },
      { id: 'x10', text: loc('原来的 10 倍', '10 times more') },
      { id: 'half', text: loc('反而减半', 'Half as many') },
    ],
    answer: 'mul',
    explain: loc(
      '输出还取决于 10 个触发器存的状态，共 2¹⁰ = 1024 种；每种状态下都要把 2²⁰ 种输入试一遍：2²⁰ × 2¹⁰ = 2³⁰ ≈ 10.7 亿条。状态又不能从 Pin 直接设，进入每个状态还要额外的向量，所以这只是下限。',
      'The output also depends on the state of the 10 flip-flops, 2¹⁰ = 1024 states, and all 2²⁰ inputs must be tried in each: 2²⁰ × 2¹⁰ = 2³⁰ ≈ 1.07 billion vectors. The state cannot be set directly from the pins, and reaching each state takes extra vectors, so this is only a lower bound.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('ATPG 和 Algorithmic 向量差在哪？', 'How do ATPG and algorithmic vectors differ?'),
    options: [
      { id: 'same', text: loc('没有差别，都是自动出向量', 'No difference; both are automatic') },
      { id: 'diff', text: loc('ATPG 对门级故障预先搜好存成文件；Algorithmic 对规则阵列按算法现场生成', 'ATPG searches gate-level faults ahead and stores a file; algorithmic vectors are generated live for regular arrays') },
      { id: 'hand', text: loc('ATPG 是手写的', 'ATPG vectors are hand-written') },
      { id: 'dc', text: loc('Algorithmic 用来测 VOH', 'Algorithmic vectors measure VOH') },
    ],
    answer: 'diff',
    explain: loc(
      'Memory March 由测试机 APG 或片内 MBIST 按地址现场生成，不会给每个与门列故障；ATPG 由 DFT 工程师用工具预先算好、存成 Pattern 文件，也不会按地址递增。两种都不是手写的，区别在对象和生成时机。',
      'A memory March test is generated live by the tester’s APG or on-chip MBIST, address by address, and does not list faults for each AND gate. ATPG patterns are computed ahead by the DFT engineer’s tool and stored as a pattern file, and they do not step through addresses. Neither is hand-written; they differ in target and in when they are generated.',
    ),
  },
  {
    id: 'q3b',
    prompt: loc('量产测试程序里的 ATPG / Scan 向量通常是谁生成的？', 'Who usually generates the ATPG / scan vectors in a production test program?'),
    options: [
      { id: 'te', text: loc('测试工程师按功能逐条手写', 'The test engineer writes them by hand, one by one') },
      { id: 'dft', text: loc('DFT 工程师用 ATPG 工具按门级网表和故障模型生成', 'The DFT engineer, using an ATPG tool on the gate netlist and a fault model') },
      { id: 'ate', text: loc('测试机上电后自己随机生成', 'The tester generates them randomly at power-up') },
      { id: 'cust', text: loc('客户在规格书里写好', 'The customer writes them in the datasheet') },
    ],
    answer: 'dft',
    explain: loc(
      'Scan 链和 BIST 是 DFT 插进设计的，ATPG 向量也由 DFT 工程师生成后交出来。测试工程师负责转成测试机格式、配时序和电平、上机调试。',
      'Scan chains and BIST are inserted by DFT, and the ATPG vectors are generated and handed over by the DFT engineer. The test engineer converts them to the tester format, adds timing and levels, and debugs them on the tester.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('与门输入 A 粘在 0，哪条向量能抓到？', 'An AND gate has input A stuck-at-0. Which vector catches it?'),
    options: [
      { id: '00', text: loc('A=0 B=0', 'A=0 B=0') },
      { id: '10', text: loc('A=1 B=0', 'A=1 B=0') },
      { id: '11', text: loc('A=1 B=1，期望 Y=1；坏芯片输出 0', 'A=1 B=1, expect Y=1; the faulty part gives 0') },
      { id: 'any', text: loc('任意一条都行', 'Any vector') },
    ],
    answer: '11',
    explain: loc(
      'A=1 才激活故障；B=1 才把差别传到 Y。10 时好坏都输出 0，看不出来。',
      'A=1 activates the fault; B=1 propagates the difference to Y. With 10 both parts output 0, so nothing shows.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('与门输出 Y 粘在 1，哪条向量能抓到？', 'An AND gate has output Y stuck-at-1. Which vector catches it?'),
    options: [
      { id: '11', text: loc('A=1 B=1，期望 Y=1', 'A=1 B=1, expect Y=1') },
      { id: '10', text: loc('A=1 B=0（或 00、01），期望 Y=0；坏芯片仍是 1', 'A=1 B=0 (or 00, 01), expect Y=0; the faulty part still gives 1') },
      { id: 'clk', text: loc('只要加快时钟', 'Just speed up the clock') },
      { id: 'none', text: loc('哪条都抓不到', 'None can catch it') },
    ],
    answer: '10',
    explain: loc(
      '好电路必须被驱动到 0，比较时才分得出好坏。11 时好坏都是 1。',
      'The good circuit must be driven to 0 so the compare can tell them apart. With 11 both give 1.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('Transition 故障为什么要一对向量？', 'Why does a transition fault need a pair of vectors?'),
    options: [
      { id: 'even', text: loc('工具喜欢偶数', 'Tools prefer even numbers') },
      { id: 'pair', text: loc('先把节点放到旧值，再发起跳变，并用快时钟 Capture', 'First set the node to its old value, then launch the transition and capture with a fast clock') },
      { id: 'one', text: loc('其实一条静态向量就够', 'One static vector is enough') },
      { id: 'mem', text: loc('因为 Memory March 必须成对', 'Because March tests must come in pairs') },
    ],
    answer: 'pair',
    explain: loc(
      '慢升 / 慢降问的是「这一拍来不来得及」，必须先有旧值、再有跳变，才能看跳得快不快。',
      'Slow-to-rise / slow-to-fall asks "does it make it within this cycle?". You need an old value and then a transition to see how fast it switches.',
    ),
  },
]

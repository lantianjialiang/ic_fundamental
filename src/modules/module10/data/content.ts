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
      '按规格书、真值表手写：输入 01，输出该是 1。证明芯片「功能对」，但说不出覆盖了多少故障。交货时仍然要跑。',
      'Written by hand from the datasheet and truth table: input 01, output should be 1. It proves the function is right but says nothing about fault coverage. It is still run before shipping.',
    ),
  },
  {
    id: 'algo',
    title: loc('Algorithmic', 'Algorithmic'),
    text: loc(
      '面向 Memory 这类规则阵列：写一段算法（如 March：逐个地址写 0、读 0 写 1……），ATE 的算法引擎边跑边按地址生成下一拍，不预先存 2ⁿ 条。',
      'For regular arrays such as memory: write an algorithm (e.g. March: write 0 to each address, then read 0 and write 1, …). The ATE’s algorithmic pattern generator computes each cycle from the address on the fly instead of storing 2ⁿ vectors.',
    ),
  },
  {
    id: 'atpg',
    title: loc('ATPG', 'ATPG'),
    text: loc(
      'Automatic Test Pattern Generation：读门级网表和故障列表，对每个故障自动搜一条能抓到它的向量，预先存成 Pattern 文件交给 ATE 回放。面向不规则的逻辑，能报出故障覆盖率。',
      'Automatic Test Pattern Generation reads the gate-level netlist and a fault list, searches for a vector that catches each fault, and stores the result as a pattern file for the ATE to replay. It targets irregular logic and reports fault coverage.',
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
      'A 粘在 0：要先让好电路的 A = 1 才能「激活」它，还要 B = 1 让差别「传」到 Y。只有 11 能抓到。它和 Y 粘在 0 用同一条向量，叫等价故障。',
      'A stuck-at-0: the good circuit must drive A = 1 to activate it, and B = 1 to propagate the difference to Y. Only 11 catches it. It needs the same vector as Y stuck-at-0, so the two are equivalent faults.',
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
    'Functional 按规格手写；Algorithmic 按算法给 Memory 现场生成；ATPG 按门级网表和故障模型自动搜。',
    'Functional vectors are written by hand from the spec; algorithmic vectors are generated on the fly for memory; ATPG searches automatically from the gate netlist and a fault model.',
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
      { id: 'time', text: loc('2⁶⁴ 条在 10 MHz 下要约 5.8 万年，而且穷举也不等于故障覆盖率', '2⁶⁴ vectors at 10 MHz take about 58,000 years, and exhaustive is not the same as fault coverage') },
      { id: 'ate', text: loc('ATE 没有 64 个通道', 'The ATE does not have 64 channels') },
      { id: 'mem', text: loc('向量存储器只能存 64 条', 'Vector memory holds only 64 vectors') },
    ],
    answer: 'time',
    explain: loc(
      '2⁶⁴ ≈ 1.8 × 10¹⁹ 条，每条 100 ns。时间是硬约束；就算跑完，也说不清对 Transition 这类故障覆盖了多少。',
      '2⁶⁴ ≈ 1.8 × 10¹⁹ vectors at 100 ns each. Time is a hard limit, and even a full run says nothing clear about faults such as transition faults.',
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
      '每种内部状态都要配上全部 2²⁰ 种输入：2²⁰ × 2¹⁰ = 2³⁰。而且进入每个状态还要额外的向量，所以这只是下限。',
      'Each internal state must be combined with all 2²⁰ inputs: 2²⁰ × 2¹⁰ = 2³⁰. Reaching each state takes extra vectors too, so this is only a lower bound.',
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
      'Memory March 不会给每个与门列故障；ATPG 也不会按地址递增。对象和生成时机都不同。',
      'A memory March test does not list faults for each AND gate, and ATPG does not step through addresses. The target and the timing of generation both differ.',
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

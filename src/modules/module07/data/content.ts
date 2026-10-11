import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type Bit = 0 | 1

export type Vector = { a: Bit; b: Bit; y: Bit }

/** XOR 真值表：每一行就是一条向量 */
export const VECTORS: Vector[] = [
  { a: 0, b: 0, y: 0 },
  { a: 0, b: 1, y: 1 },
  { a: 1, b: 0, y: 1 },
  { a: 1, b: 1, y: 0 },
]

export type FaultId = 'none' | 'y0' | 'y1' | 'a0'

export const FAULTS: Array<{ id: FaultId; label: LText; text: LText }> = [
  {
    id: 'none',
    label: loc('无故障', 'No fault'),
    text: loc('好芯片：四行都和期望一致。', 'Good part: all four rows match the expected values.'),
  },
  {
    id: 'y0',
    label: loc('Y stuck-at-0', 'Y stuck-at-0'),
    text: loc(
      '输出 Y 被钉在 0。只有期望 H 的两行（01、10）会红。',
      'Output Y is stuck at 0. Only the two rows expecting H (01, 10) turn red.',
    ),
  },
  {
    id: 'y1',
    label: loc('Y stuck-at-1', 'Y stuck-at-1'),
    text: loc(
      '输出 Y 被钉在 1。只有期望 L 的两行（00、11）会红。',
      'Output Y is stuck at 1. Only the two rows expecting L (00, 11) turn red.',
    ),
  },
  {
    id: 'a0',
    label: loc('A stuck-at-0', 'A stuck-at-0'),
    text: loc(
      '输入 A 在芯片里被钉在 0。只有驱动 A=1 的两行（10、11）会红。哪几行红，就指向哪根线。',
      'Input A is stuck at 0 inside the part. Only the rows driving A=1 (10, 11) turn red. Which rows fail points to which net.',
    ),
  },
]

/** DUT 在某个故障下的实际输出 */
export function dutOut(row: Vector, fault: FaultId): { aIn: Bit; y: Bit } {
  const aIn: Bit = fault === 'a0' ? 0 : row.a
  const xor = (aIn ^ row.b) as Bit
  if (fault === 'y0') return { aIn, y: 0 }
  if (fault === 'y1') return { aIn, y: 1 }
  return { aIn, y: xor }
}

export const TAKEAWAY: LText[] = [
  loc(
    '真值表的一行就是一条测试向量：Tester 驱动输入，在 Strobe 时刻把输出和期望字符比较。',
    'One truth-table row is one test vector: the tester drives the inputs and compares the output with the expected character at the strobe.',
  ),
  loc(
    '向量字符：1 / 0 = 驱动高 / 低；H / L = 期望高 / 低，只比较；X = 这一拍不比较。',
    'Vector characters: 1 / 0 = drive high / low; H / L = expect high / low, compare only; X = do not compare this cycle.',
  ),
  loc(
    '量产 Pattern 就是成千上万条这样的向量。哪几行 Fail，就是排错的起点。',
    'A production pattern is thousands of such vectors. Which rows fail is where debug starts.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Functional Test 在做什么？', 'What does a functional test do?'),
    options: [
      { id: 'v', text: loc('只量电压，不管功能', 'Measure voltages only, ignore function') },
      { id: 'ok', text: loc('按真值表驱动输入，比较输出', 'Drive inputs per the truth table and compare outputs') },
      { id: 'fix', text: loc('把错的输出改正确', 'Correct wrong outputs') },
      { id: 'bin', text: loc('只分配 Bin 号', 'Only assign bin numbers') },
    ],
    answer: 'ok',
    explain: loc(
      '给输入、比输出。哪一行对不上，Compare 就在那一行报 Fail。',
      'Drive inputs, compare outputs. Whichever row mismatches is where the compare reports Fail.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('向量里 Y 那一列写 H 而不是 1，意思是？', 'In a vector, what does H (rather than 1) in the Y column mean?'),
    options: [
      { id: 'drive', text: loc('Tester 把 Y 驱动成高', 'The tester drives Y high') },
      { id: 'cmp', text: loc('期望 Y 为高，Tester 只比较、不驱动', 'Y is expected high; the tester compares and does not drive') },
      { id: 'x', text: loc('这一拍不比较', 'Do not compare this cycle') },
      { id: 'hz', text: loc('Y 是高阻', 'Y is high impedance') },
    ],
    answer: 'cmp',
    explain: loc(
      '1 / 0 用于输入，表示驱动；H / L 用于输出，表示期望并比较；X 表示不比较。',
      '1 / 0 are for inputs and mean drive; H / L are for outputs and mean expect and compare; X means do not compare.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('跑 XOR 四行，只有 01 和 10 两行 Fail。最可能是？', 'Running the four XOR rows, only rows 01 and 10 fail. Most likely cause?'),
    options: [
      { id: 'y0', text: loc('Y stuck-at-0', 'Y stuck-at-0') },
      { id: 'y1', text: loc('Y stuck-at-1', 'Y stuck-at-1') },
      { id: 'a0', text: loc('A stuck-at-0', 'A stuck-at-0') },
      { id: 'none', text: loc('芯片没问题', 'Nothing is wrong with the part') },
    ],
    answer: 'y0',
    explain: loc(
      '01、10 都期望 H。输出钉在 0，正好这两行对不上。',
      'Rows 01 and 10 both expect H. An output stuck at 0 fails exactly those two rows.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('有人把 11 那行的期望从 L 改成了 H，好芯片会怎样？', 'Someone changed the expected value of row 11 from L to H. What happens to a good part?'),
    options: [
      { id: 'all', text: loc('四行都 Fail', 'All four rows fail') },
      { id: 'one', text: loc('只有 11 那行 Fail', 'Only row 11 fails') },
      { id: 'pass', text: loc('仍然全 Pass', 'Still all pass') },
      { id: 'latch', text: loc('触发 Latch-up', 'It triggers latch-up') },
    ],
    answer: 'one',
    explain: loc(
      '芯片没坏，是向量错了。所以 Fail 时先查期望值对不对，再怀疑芯片。',
      'The part is fine; the vector is wrong. On a fail, first check the expected values before blaming the part.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('XOR 的 A=1、B=1 时，Y 是多少？', 'For XOR with A=1 and B=1, what is Y?'),
    options: [
      { id: 'one', text: loc('1', '1') },
      { id: 'zero', text: loc('0：相同为 0，不同为 1', '0: same gives 0, different gives 1') },
      { id: 'x', text: loc('不确定', 'Undefined') },
      { id: 'skip', text: loc('这一行不用测', 'This row need not be tested') },
    ],
    answer: 'zero',
    explain: loc('XOR 是“不同才为 1”。所以这一行的期望字符是 L。', 'XOR is 1 only when the inputs differ, so this row expects L.'),
  },
]

import { loc, type LText } from '../../../i18n/locale'

export const VIH = 2.0
export const VIL = 0.8
export const VMAX = 3.3

export type Logic = '0' | '1' | 'X'

export function logicOf(volts: number): Logic {
  if (volts >= VIH) return '1'
  if (volts <= VIL) return '0'
  return 'X'
}

export type ParamId = 'vih' | 'vil' | 'voh' | 'vol' | 'iih' | 'iil' | 'leak' | 'iddq'

export const PARAMS: Array<{ id: ParamId; title: string; text: LText }> = [
  {
    id: 'vih',
    title: 'VIH',
    text: loc('输入被认成 1 的最低电压。低于它，Tester 不能假定 DUT 看见的是 Logic 1。'),
  },
  {
    id: 'vil',
    title: 'VIL',
    text: loc('输入被认成 0 的最高电压。高于它，Tester 不能假定 DUT 看见的是 Logic 0。'),
  },
  {
    id: 'voh',
    title: 'VOH',
    text: loc('输出为 1 时，电压至少要到多少。Comparator 用门槛去“看”，PMU 可以量真实值。'),
  },
  {
    id: 'vol',
    title: 'VOL',
    text: loc('输出为 0 时，电压最多只能到多少。同样是输出驱动能力，不是抽象的 L。'),
  },
  {
    id: 'iih',
    title: 'IIH',
    text: loc('输入为高电平时流进 / 流出这根 Pin 的电流。数字课先当漏电流的亲戚。'),
  },
  {
    id: 'iil',
    title: 'IIL',
    text: loc('输入为低电平时的输入电流。和 IIH 一对，都是电流，不是 0/1。'),
  },
  {
    id: 'leak',
    title: 'Leakage',
    text: loc('不该导通时还在漏的电流。开路、关态、高阻脚都可能测。'),
  },
  {
    id: 'iddq',
    title: 'IDDQ',
    text: loc('静态电源电流。芯片不该翻转时，电源脚上还在吃多少电。'),
  },
]

export type ContId = 'open' | 'short'

export const CONTINUITY: Array<{
  id: ContId
  volts: number
  verdict: LText
  text: LText
}> = [
  {
    id: 'open',
    volts: 3.3,
    verdict: loc('判 Open'),
    text: loc(
      'PMU 灌一小电流，电压被顶得很高：这根 Pin 几乎没接到地或电源。Continuity 看的是电压，不是 Pattern 里的 H/L。',
    ),
  },
  {
    id: 'short',
    volts: 0.02,
    verdict: loc('判 Short'),
    text: loc(
      '同样灌一小电流，电压几乎掉到 0：这根 Pin 被短到地或邻脚。还是 PMU 的 Force / Measure，不是 Digital Compare。',
    ),
  },
]

export const TAKEAWAY = loc(
  '芯片里并不是抽象的 0/1。ATE 把真实电压、电流翻译成逻辑 0/1。Digital 和 Analog 在 PMU 这一层连上。',
)

export type QuizId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5'

export type QuizQuestion = {
  id: QuizId
  prompt: LText
  options: Array<{ id: string; text: LText }>
  answer: string
  explain: LText
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('PMU 主要在问什么？'),
    options: [
      { id: 'hl', text: loc('这一拍是 H 还是 L') },
      { id: 'vi', text: loc('这根 Pin 的电压、电流符不符合规格') },
      { id: 'fix', text: loc('怎么把坏芯片修好') },
      { id: 'file', text: loc('测试程序文件叫什么') },
    ],
    answer: 'vi',
    explain: loc(
      'Digital Channel 比 0/1。PMU（Parametric Measurement Unit）量电压和电流，再和规格比。',
    ),
  },
  {
    id: 'q2',
    prompt: loc('同一根输入 Pin 上，1.2 V 在 Digital Test 里通常是什么？'),
    options: [
      { id: 'one', text: loc('确定是 Logic 1') },
      { id: 'zero', text: loc('确定是 Logic 0') },
      { id: 'mid', text: loc('还在 VIH / VIL 之间，不能当成确定的 0 或 1') },
      { id: 'fail', text: loc('芯片一定坏了') },
    ],
    answer: 'mid',
    explain: loc(
      '教学门槛是 VIL 0.8 V、VIH 2.0 V。1.2 V 是真实电压，但还没越过被认成 1 的线，也不是稳妥的 0。',
    ),
  },
  {
    id: 'q3',
    prompt: loc('VIH / VIL 和 VOH / VOL 各说的是谁？'),
    options: [
      { id: 'swap', text: loc('VIH / VIL 是输出，VOH / VOL 是输入') },
      { id: 'ok', text: loc('VIH / VIL 是输入门槛，VOH / VOL 是输出电压') },
      { id: 'cur', text: loc('四者都是电流') },
      { id: 'clk', text: loc('四者都是时钟频率') },
    ],
    answer: 'ok',
    explain: loc(
      'I 是 Input，O 是 Output。输入先问“到多少伏才被认成 1/0”；输出再问“吐出来的电压够不够”。',
    ),
  },
  {
    id: 'q4',
    prompt: loc('Continuity（开短路）主要用什么测？'),
    options: [
      { id: 'pat', text: loc('只跑 Pattern，看 H/L') },
      { id: 'pmu', text: loc('用 PMU 灌一小电流、看电压') },
      { id: 'scope', text: loc('必须外接示波器') },
      { id: 'hand', text: loc('用手按一下 Socket') },
    ],
    answer: 'pmu',
    explain: loc(
      '开路电压高，短路电压接近 0。这是第一个“不是 0/1 比较”的例子。仪器细节留给 DC 课。',
    ),
  },
  {
    id: 'q5',
    prompt: loc('Digital 和 Analog 在这一课的接点是什么？'),
    options: [
      { id: 'none', text: loc('完全无关，两套机器') },
      { id: 'ok', text: loc('逻辑 0/1 是 ATE 对真实电压 / 电流的翻译') },
      { id: 'pcb', text: loc('只发生在 Load Board 层数上') },
      { id: 'bin', text: loc('只发生在 Bin 号上') },
    ],
    answer: 'ok',
    explain: loc(
      'Digital Channel 给出翻译后的 0/1。PMU 留下翻译之前的电压和电流。同一根 Pin，两种看法。',
    ),
  },
]

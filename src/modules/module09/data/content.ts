import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const TPD = 8
export const MARGIN = 2

export function acPass(period: number): boolean {
  return period >= TPD + MARGIN
}

export function freqOf(periodNs: number): number {
  return 1000 / periodNs
}

export type MarkId = 'tpd' | 'edge' | 'setup' | 'hold' | 'ctq' | 'fmax'

export const MARKS: Array<{ id: MarkId; title: string; text: LText }> = [
  {
    id: 'tpd',
    title: 'Propagation Delay',
    text: loc('输入沿到输出沿的时间。Strobe 必须晚于它。'),
  },
  {
    id: 'edge',
    title: 'Rise / Fall Time',
    text: loc('沿自己爬升 / 下降要花的时间。沿太慢，有效窗口更窄。'),
  },
  {
    id: 'setup',
    title: 'Setup Time',
    text: loc('数据要在时钟沿之前稳定多久。Period 缩短时它最先被吃掉。'),
  },
  {
    id: 'hold',
    title: 'Hold Time',
    text: loc('时钟沿之后数据还要保持。和 Setup 一前一后。'),
  },
  {
    id: 'ctq',
    title: 'Clock-to-Q',
    text: loc('时钟沿到 Q 输出有效的时间。寄存器链用它代替组合 tpd。'),
  },
  {
    id: 'fmax',
    title: 'Maximum Frequency',
    text: loc('功能仍对的最高时钟。Period 再短，向量就开始 Fail。对接 M05 的 100 MHz。'),
  },
]

export const TAKEAWAY = loc('DC Test 解决“对不对”；AC Test 解决“来不来得及”。')

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('DC 和 AC 各解决什么？'),
    options: [
      { id: 'swap', text: loc('DC 管速度，AC 管电压') },
      { id: 'ok', text: loc('DC 对不对；AC 来不来得及') },
      { id: 'same', text: loc('完全同一件事') },
      { id: 'bin', text: loc('只决定 Bin 颜色') },
    ],
    answer: 'ok',
    explain: loc('电压电流合格，仍可能在高频来不及。fMAX 就是这条边界。'),
  },
  {
    id: 'q2',
    prompt: loc('缩短 Period 直到功能 Fail，测的是哪一项？'),
    options: [
      { id: 'vih', text: loc('VIH') },
      { id: 'fmax', text: loc('fMAX / 最高工作频率') },
      { id: 'idd', text: loc('只是 IDD') },
      { id: 'open', text: loc('开路') },
    ],
    answer: 'fmax',
    explain: loc('同一套 Functional 向量，只改周期。这是 M05 那行 100 MHz 的测法。'),
  },
  {
    id: 'q3',
    prompt: loc('Setup Time 不够时，先怀疑什么？'),
    options: [
      { id: 'voh', text: loc('只怀疑 VOH 数字写错') },
      { id: 'win', text: loc('数据相对时钟的窗口被挤掉了') },
      { id: 'sock', text: loc('Socket 一定没插好') },
      { id: 'xor', text: loc('XOR 真值表反了') },
    ],
    answer: 'win',
    explain: loc('AC 参数都是时间窗口。先回到波形，不要先改功能期望。'),
  },
  {
    id: 'q4',
    prompt: loc('这一课为什么不新画一套图？'),
    options: [
      { id: 'lazy', text: loc('图不够用') },
      { id: 'same', text: loc('AC 就是标在 Timing 波形上的那些时间段') },
      { id: '3d', text: loc('必须用 3D') },
      { id: 'api', text: loc('要先写 Tester API') },
    ],
    answer: 'same',
    explain: loc('Drive、Strobe、Period 已经在上一课。AC 只是给各段时间起规格名。'),
  },
]

import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const PERIOD = 10
export const VALID_FROM = 3
export const VALID_TO = 8

export type StrobeKind = 'early' | 'window' | 'late'

export function strobeKind(ns: number): StrobeKind {
  if (ns < VALID_FROM) return 'early'
  if (ns > VALID_TO) return 'late'
  return 'window'
}

export type TermId = 'drive' | 'strobe' | 'period' | 'setup' | 'hold' | 'tpd'

export const TERMS: Array<{ id: TermId; title: string; text: LText }> = [
  {
    id: 'drive',
    title: 'Drive Edge',
    text: loc('输入在这一拍什么时候被驱动。太晚，Setup 可能不够。'),
  },
  {
    id: 'strobe',
    title: 'Strobe',
    text: loc('输出在这一拍什么时候被采样。也叫 Receive / Compare。太早看到旧值。'),
  },
  {
    id: 'period',
    title: 'Period',
    text: loc('一拍有多长。缩短它就是提高频率，后面 AC / fMAX 会用。'),
  },
  {
    id: 'setup',
    title: 'Setup',
    text: loc('数据相对时钟要提前多久稳定。不够，触发器采到亚稳态或错值。'),
  },
  {
    id: 'hold',
    title: 'Hold',
    text: loc('时钟沿之后数据还要保持多久。太早变，这一拍会错。'),
  },
  {
    id: 'tpd',
    title: 'Propagation Delay',
    text: loc('输入变了，输出要过一会儿才变。这就是 Strobe 不能贴着 Drive 的原因。'),
  },
]

export const TAKEAWAY = loc(
  'DUT 输出不是立即发生的。Strobe 太早：好芯片也会 Fail。太晚：可能采到下一拍。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Strobe 是什么？'),
    options: [
      { id: 'v', text: loc('电源电压') },
      { id: 't', text: loc('这一拍里采样输出的时刻') },
      { id: 'bin', text: loc('Bin 号') },
      { id: 'socket', text: loc('Socket 型号') },
    ],
    answer: 't',
    explain: loc('也叫 Receive / Compare。Drive 是“什么时候给”，Strobe 是“什么时候看”。'),
  },
  {
    id: 'q2',
    prompt: loc('Strobe 太早，最常见的现象是？'),
    options: [
      { id: 'ok', text: loc('采到旧值，好芯片也可能 Fail') },
      { id: 'burn', text: loc('芯片一定被烧坏') },
      { id: 'open', text: loc('一定是开路') },
      { id: 'pass', text: loc('反而更容易 Pass') },
    ],
    answer: 'ok',
    explain: loc('输出还在 Propagation Delay 里。不是 DUT 坏了，是采样时刻不对。'),
  },
  {
    id: 'q3',
    prompt: loc('Period 指什么？'),
    options: [
      { id: 'len', text: loc('一拍有多长') },
      { id: 'voh', text: loc('输出高电平') },
      { id: 'scan', text: loc('扫描链条数') },
      { id: 'bin', text: loc('每天测多少颗') },
    ],
    answer: 'len',
    explain: loc('Period 变短 = 频率变高。窗口被挤窄，Strobe 更难放。'),
  },
  {
    id: 'q4',
    prompt: loc('Setup / Hold 相对谁说？'),
    options: [
      { id: 'vdd', text: loc('只相对 VDD') },
      { id: 'clk', text: loc('数据相对时钟要提前 / 保持多久') },
      { id: 'ate', text: loc('相对机柜高度') },
      { id: 'bin', text: loc('相对 Bin 号') },
    ],
    answer: 'clk',
    explain: loc('下一课会把这两段标回波形。这一课先立住名字。'),
  },
]

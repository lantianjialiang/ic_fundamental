import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { MARGIN, TPD } from '../../timing/glossary'

/** 第一段固定 Period = 20 ns；输出有效窗口 = [tPD, Period] */
export const PERIOD_1 = 20
export const STROBE_MAX = 26

export type StrobeKind = 'early' | 'window' | 'late'

export function strobeKind(ns: number, period = PERIOD_1): StrobeKind {
  if (ns < TPD) return 'early'
  if (ns > period) return 'late'
  return 'window'
}

/** 第二段：输出窗口 Period − tPD 至少要有 MARGIN 才放得下 Strobe */
export const PERIOD_MIN = 6
export const PERIOD_MAX = 20

export function acPass(period: number): boolean {
  return period - TPD >= MARGIN
}

export function freqOf(periodNs: number): number {
  return 1000 / periodNs
}

export const TAKEAWAY = [
  loc(
    'DUT 的输出要等 tPD 才稳定。Strobe 必须落在「tPD 之后、下一个 CLK 沿之前」的窗口里；太早、太晚，好芯片也会 Fail。',
    'The DUT output is only stable after tPD. The strobe must land in the window after tPD and before the next CLK edge. Too early or too late, and even a good device fails.',
  ),
  loc(
    'Setup、Hold、tPD、Period 都是同一张图上的时间段：tSU / tH 相对 CLK 沿量输入，tPD 量输出，Period 量两个沿之间。',
    'Setup, hold, tPD and Period are all time spans on the same diagram: tSU / tH measure the input against the CLK edge, tPD measures the output, Period spans two edges.',
  ),
  loc(
    'DC 测试问「电平对不对」，AC 测试问「来不来得及」。Period 短到窗口放不下 Strobe，同一套向量就 Fail，这条边界就是 fMAX。',
    'DC tests ask "is the level right?"; AC tests ask "is it fast enough?". When Period is too short for the strobe to fit, the same vectors fail. That boundary is fMAX.',
  ),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Strobe 是什么？', 'What is the strobe?'),
    options: [
      { id: 'v', text: loc('电源电压', 'The supply voltage') },
      { id: 't', text: loc('这一拍里测试机采样输出的时刻', 'The moment in the cycle when the tester samples the output') },
      { id: 'drive', text: loc('测试机给输入换值的时刻', 'The moment the tester changes an input') },
      { id: 'bin', text: loc('Bin 号', 'The bin number') },
    ],
    answer: 't',
    explain: loc(
      'Drive 是「什么时候给」，Strobe 是「什么时候看」。Strobe 也叫 Compare。',
      'Drive is "when to apply"; strobe is "when to look". The strobe is also called compare.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('Strobe 放在 CLK 沿后 4 ns，而 tPD = 8 ns，会怎样？', 'The strobe is 4 ns after the CLK edge and tPD = 8 ns. What happens?'),
    options: [
      { id: 'ok', text: loc('OUT 还在变，好芯片也可能 Fail', 'OUT is still changing; even a good device may fail') },
      { id: 'burn', text: loc('芯片会被烧坏', 'The device is damaged') },
      { id: 'pass', text: loc('一定 Pass，越早越保险', 'It always passes; earlier is safer') },
      { id: 'open', text: loc('说明管脚开路', 'It means the pin is open') },
    ],
    answer: 'ok',
    explain: loc(
      '4 ns 落在斜线区：输出还没稳定。不是 DUT 坏了，是采样时刻不对。',
      '4 ns is inside the hatched area: the output is not stable yet. The DUT is fine; the sampling time is wrong.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('Setup Time / Hold Time 是相对什么说的？', 'Setup and hold times are measured relative to what?'),
    options: [
      { id: 'vdd', text: loc('VDD 上电时刻', 'The moment VDD powers up') },
      { id: 'clk', text: loc('CLK 沿：数据要在沿前稳定多久、沿后保持多久', 'The CLK edge: how long data must be stable before it and held after it') },
      { id: 'strobe', text: loc('Strobe 时刻', 'The strobe') },
      { id: 'out', text: loc('OUT 变化的时刻', 'The moment OUT changes') },
    ],
    answer: 'clk',
    explain: loc('tSU 在 CLK 沿之前，tH 在 CLK 沿之后，量的都是输入 DATA。', 'tSU is before the CLK edge, tH after it. Both are about the DATA input.'),
  },
  {
    id: 'q4',
    prompt: loc('本课 tPD = 8 ns，Strobe 需要至少 2 ns 窗口。最短能跑多少 Period？', 'Here tPD = 8 ns and the strobe needs a window of at least 2 ns. What is the shortest Period?'),
    options: [
      { id: '8', text: loc('8 ns', '8 ns') },
      { id: '10', text: loc('10 ns，即 100 MHz', '10 ns, i.e. 100 MHz') },
      { id: '20', text: loc('20 ns', '20 ns') },
      { id: '2', text: loc('2 ns', '2 ns') },
    ],
    answer: '10',
    explain: loc(
      '窗口 = Period − tPD ≥ 2 ns，所以 Period ≥ 10 ns，fMAX = 100 MHz，正好对上 {@spec} 那行规格。',
      'Window = Period − tPD ≥ 2 ns, so Period ≥ 10 ns and fMAX = 100 MHz, matching the line in {@spec}.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('保持同一套功能向量，只把 Period 一步步缩短到 Fail，测的是什么？', 'Keeping the same functional vectors and shortening only the Period until it fails measures what?'),
    options: [
      { id: 'vih', text: loc('VIH', 'VIH') },
      { id: 'fmax', text: loc('fMAX，最高工作频率', 'fMAX, the maximum operating frequency') },
      { id: 'idd', text: loc('IDD', 'IDD') },
      { id: 'open', text: loc('开短路', 'Opens / shorts') },
    ],
    answer: 'fmax',
    explain: loc(
      '电平和真值表都没变，变的只是「来不来得及」。这正是 AC 测试与 DC 测试的分工。',
      'Levels and the truth table are unchanged; only "fast enough?" changes. That is the split between AC and DC tests.',
    ),
  },
]

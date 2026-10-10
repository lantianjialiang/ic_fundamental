import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const TPD = 8
export const MARGIN = 2

export function acPass(period: number): boolean {
  return period >= TPD + MARGIN
}

export function freqOf(periodNs: number): number {
  return 1000 / periodNs
}

export const TAKEAWAY = loc('DC Test 解决“对不对”；AC Test 解决“来不来得及”。时间都标在 {@timing} 同一张 CLK / DATA / OUT 上。')

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
    explain: loc('同一套 Functional 向量，只改周期。这是 {@spec} 那行 100 MHz 的测法。'),
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
    explain: loc('tSU / tH / tPD 都是同一张波形上的时间段。先回到图，不要先改功能期望。'),
  },
  {
    id: 'q4',
    prompt: loc('tPD 和 Clock-to-Q 有什么不同？'),
    options: [
      { id: 'same', text: loc('完全同一个时间，只是两个名字') },
      { id: 'ok', text: loc('tPD 是组合：DATA→OUT；tCQ 是寄存器：CLK→Q') },
      { id: 'edge', text: loc('都是 Rise Time') },
      { id: 'strobe', text: loc('都是 Strobe 的别名') },
    ],
    answer: 'ok',
    explain: loc('同一张图：DATA 变到 OUT 变是 tPD；CLK 沿到 Q 有效是 tCQ。不要混。'),
  },
]

import { loc, type LText } from '../../i18n/locale'

/** {@timing} 课用的教学数值（单位 ns），图、判题、复习题都从这里取，保证自洽 */
export const TPD = 8
/** 测试机在每个 CLK 沿之前多少 ns 换 DATA */
export const DRIVE_LEAD = 4
export const TSU_MIN = 3
export const TH_MIN = 1
/** Strobe 需要的最小窗口：测试机边沿精度 + 沿本身的上升时间 */
export const MARGIN = 2

export type TimingMark = 'setup' | 'hold' | 'tpd' | 'period'

export const TIMING_MARKS: TimingMark[] = ['setup', 'hold', 'tpd', 'period']

export const TIMING: Record<TimingMark, { title: LText; short: LText; text: LText }> = {
  setup: {
    title: loc('Setup Time（tSU）', 'Setup Time (tSU)'),
    short: loc('tSU', 'tSU'),
    text: loc(
      'CLK 沿到来之前，DATA 必须已经稳定的最短时间。图中测试机在沿前 4 ns 换数据，规格要求 ≥ 3 ns，够。',
      'The minimum time DATA must be stable before the CLK edge. Here the tester changes DATA 4 ns before the edge; the spec asks for ≥ 3 ns, so it is met.',
    ),
  },
  hold: {
    title: loc('Hold Time（tH）', 'Hold Time (tH)'),
    short: loc('tH', 'tH'),
    text: loc(
      'CLK 沿过后，DATA 还要保持不变的最短时间。规格 ≥ 1 ns。图中下一拍数据在下一个沿前 4 ns 才换，所以提供的是 Period − 4 ns。',
      'The minimum time DATA must stay unchanged after the CLK edge. The spec is ≥ 1 ns. Here the next data arrives 4 ns before the next edge, so the hold provided is Period − 4 ns.',
    ),
  },
  tpd: {
    title: loc('Propagation Delay（tPD）', 'Propagation Delay (tPD)'),
    short: loc('tPD', 'tPD'),
    text: loc(
      'CLK 沿到 OUT 稳定的延迟，本例 8 ns。沿后到 tPD 之间 OUT 正在变（斜线区），在这里采样会出错。组合逻辑的 tPD 从输入沿量起，道理相同。',
      'The delay from the CLK edge until OUT is stable: 8 ns here. Between the edge and tPD, OUT is still changing (hatched area); sampling there gives wrong data. For combinational logic, tPD is measured from the input edge in the same way.',
    ),
  },
  period: {
    title: loc('Period / fMAX', 'Period / fMAX'),
    short: loc('Period', 'Period'),
    text: loc(
      '两个 CLK 上升沿之间的时间，频率 = 1 / Period。Period 变短，输出窗口 = Period − tPD 跟着变窄；装不下 Strobe 就 Fail。功能仍正确的最高频率就是 fMAX。',
      'The time between two rising CLK edges; frequency = 1 / Period. As Period shrinks, the output window (Period − tPD) narrows. When the strobe no longer fits, the test fails. The highest frequency that still passes is fMAX.',
    ),
  },
}

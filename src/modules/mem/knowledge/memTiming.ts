import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-06 存储器时序测试：读数据有效窗口、输出保持、采样裕量、二分与 Shmoo */
export const MEM_TIMING_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'read-timing-window',
      term: 'Read data-valid window',
      name: loc('读数据有效窗口 [tAA, T + tOH]', 'Read data-valid window [tAA, T + tOH]'),
      def: loc(
        '地址改变后，数据在访问时间 tAA 之后稳定，并保持到下一个地址改变之后的 tOH。采样点必须落在这段窗口里才会读到正确数据。见 {@memTiming}。',
        'After the address changes, the data settles after the access time tAA and stays valid until tOH after the next address change. The strobe must land inside this window to read the correct data. See {@memTiming}.',
      ),
      lessons: ['memTiming'],
    },
    {
      id: 'mem-output-hold',
      term: 'Output hold time (tOH)',
      name: loc('输出保持时间 tOH', 'Output hold time tOH'),
      def: loc(
        '下一个地址改变之后，旧数据仍然有效的时间。它决定窗口的右边界 T + tOH。见 {@memTiming}。',
        'The time after the next address change during which the old data is still valid. It sets the right window edge at T + tOH. See {@memTiming}.',
      ),
      lessons: ['memTiming'],
    },
    {
      id: 'mem-strobe-margin',
      term: 'Strobe margin',
      name: loc('采样裕量', 'Strobe margin'),
      def: loc(
        '采样点到窗口两条边界中较近的一条的距离。裕量为负表示落在窗口外；裕量越大，器件温度或电压漂移时越不容易 FAIL。见 {@memTiming}。',
        'The distance from the strobe to the nearer of the two window edges. A negative margin means the strobe is outside the window; a larger margin tolerates more drift in temperature or voltage before a FAIL. See {@memTiming}.',
      ),
      lessons: ['memTiming'],
    },
  ],
  extraLessons: {
    strobe: ['memTiming'],
    'binary-search': ['memTiming'],
    shmoo: ['memTiming'],
    'setup-time': ['memTiming'],
    'hold-time': ['memTiming'],
    timing: ['memTiming'],
    'read-access-time': ['memTiming'],
  },
  faqs: [
    {
      id: 'mem-timing-why-slant',
      q: loc('为什么 Shmoo 的通过带是斜的？', 'Why is the Shmoo pass band slanted?'),
      a: loc(
        '左边界是 tAA，与周期无关，所以是水平的；右边界是 T + tOH，随周期增大而增大，所以是斜的。周期越短，带子越窄，最后关闭。见 {@memTiming}。',
        'The left edge is tAA, which does not depend on the period, so it is horizontal. The right edge T + tOH grows with the period, so it slopes. A shorter period narrows the band until it closes. See {@memTiming}.',
      ),
      lessons: ['memTiming'],
    },
    {
      id: 'mem-timing-why-no-slow-test',
      q: loc('为什么不能靠把周期拉长，让慢器件也能过？', 'Why not lengthen the period so that slow parts also pass?'),
      a: loc(
        '拉长周期确实会让窗口变宽，但那是放宽了测试条件，器件的 tAA 没有变。量产时要按规格的周期测；用更慢的测试通过，等于放过了一颗在规格周期下会 FAIL 的器件。见 {@memTiming}。',
        'Lengthening the period does widen the window, but that relaxes the test condition; the part’s tAA has not changed. Production must test at the specified period; passing at a slower one lets through a part that would fail at spec. See {@memTiming}.',
      ),
      lessons: ['memTiming'],
    },
    {
      id: 'mem-timing-why-bisect',
      q: loc('为什么用二分找边界，而不是把采样点从 0 扫到 T？', 'Why bisect for the edge instead of sweeping the strobe from 0 to T?'),
      a: loc(
        '逐点扫描要测很多次；二分每次把区间对半缩小，7 次后误差不超过周期的 1/128（约 0.08 ns，周期 10 ns）。两种方法都只用通过 / 失败的测量。见 {@memTiming}。',
        'A linear sweep takes many measurements; bisection halves the interval each time, and after 7 steps the error is at most 1/128 of the period (about 0.08 ns at a 10 ns period). Both methods use only pass/fail measurements. See {@memTiming}.',
      ),
      lessons: ['memTiming'],
    },
  ],
}

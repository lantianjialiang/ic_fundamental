import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-14 测试限值与统计：术语、已有词条的课程补充、常见问题 */
export const ANA_STATS_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'process-cp',
      term: 'Cp',
      name: loc('过程能力 Cp', 'Process capability (Cp)'),
      def: loc(
        '只看工艺分布宽度相对规格宽度的指标：Cp = (USL − LSL) ÷ (6σ)，不考虑均值是否居中。Cp 高只说明分布够窄，均值偏了 Cpk 会降而 Cp 不变，所以要和 Cpk 一起看，见 {@anaStats}。',
        'A measure of process width against spec width: Cp = (USL − LSL) ÷ (6σ), with no regard for centring. A high Cp only says the distribution is narrow enough; if the mean drifts, Cpk falls while Cp stays the same, so read it together with Cpk; see {@anaStats}.',
      ),
      lessons: ['anaStats'],
    },
    {
      id: 'escape',
      term: 'Escape',
      name: loc('漏检', 'Escape'),
      def: loc(
        '坏品被测试程序判为 Pass，流到了客户手里。它是测试判定的一类错误，与过杀（Overkill）相对；保护带越大，漏检越少，但过杀越多。见 {@anaStats}。',
        'A bad part judged as a pass by the test program, so it ships to the customer. It is the counterpart of overkill: a larger guardband lowers escape but raises overkill; see {@anaStats}.',
      ),
      lessons: ['anaStats'],
    },
    {
      id: 'repeatability',
      term: 'Repeatability',
      name: loc('重复性', 'Repeatability'),
      def: loc(
        '同一颗器件、同一套设置，重复测量时读数的分散程度，常用标准差 σm 表示。它是测量自己带来的随机误差；σm 越大，测得值的分布越宽，测得 Cpk 越低，见 {@anaStats}。',
        'The scatter of readings when the same part is measured repeatedly with the same setup, usually given as a standard deviation σm. It is the random error the measurement itself adds; a larger σm widens the measured distribution and lowers the measured Cpk; see {@anaStats}.',
      ),
      lessons: ['anaStats'],
    },
    {
      id: 'measurement-uncertainty',
      term: 'Measurement uncertainty',
      name: loc('测量不确定度', 'Measurement uncertainty'),
      def: loc(
        '对测得值可能偏离真值的范围的估计，本课用扩展不确定度 U = k · σm（k = 2，约 95%）表示。它决定保护带该取多大量级：保护带远小于 U，漏检难以挡住；远大于 U，过杀会明显上升。见 {@anaStats}。',
        'An estimate of how far a reading may lie from the true value, expressed here as the expanded uncertainty U = k · σm (k = 2, about 95%). It sets the order of magnitude of the guardband: far below U, escapes are not blocked; far above U, overkill rises noticeably; see {@anaStats}.',
      ),
      lessons: ['anaStats'],
    },
  ],
  extraLessons: {
    guardband: ['anaStats'],
    cpk: ['anaStats'],
    overkill: ['anaStats'],
    yield: ['anaStats'],
    limit: ['anaStats'],
  },
  faqs: [
    {
      id: 'ana-stats-cp-vs-cpk',
      q: loc('Cp 和 Cpk 什么时候不一样？', 'When do Cp and Cpk differ?'),
      a: loc(
        '均值居中时两者相等。Cp 只看宽度，Cpk 取离均值较近的那一侧，所以均值一偏，Cpk 就低于 Cp。μ = +10 mV、σ = 12 mV 时 Cp ≈ 1.39、Cpk ≈ 1.11。要判断工艺是否够用，两个都看，见 {@anaStats}。',
        'They are equal when the mean is centred. Cp looks only at width, while Cpk uses the nearer side, so once the mean shifts Cpk falls below Cp. At μ = +10 mV and σ = 12 mV, Cp ≈ 1.39 and Cpk ≈ 1.11. Look at both when judging whether a process is adequate; see {@anaStats}.',
      ),
      lessons: ['anaStats'],
    },
    {
      id: 'ana-stats-repeatability-uncertainty',
      q: loc('测量重复性会不会改变 Cpk？', 'Does measurement repeatability change Cpk?'),
      a: loc(
        '会，但只是通过测得值的分布。测得值的标准差是 √(σ² + σm²)，所以测得 Cpk 略低于工艺 Cpk（σ = 12、σm = 2 时约 1.37 对 1.39）。工艺 Cpk 不含测量误差，它回答的是“工艺本身够不够”；测得 Cpk 才是测试机报出来的数，见 {@anaStats}。',
        'It does, but only through the measured distribution. The measured standard deviation is √(σ² + σm²), so measured Cpk is slightly below process Cpk (about 1.37 against 1.39 at σ = 12 and σm = 2). Process Cpk excludes measurement error and answers whether the process itself is adequate; measured Cpk is the number the tester reports; see {@anaStats}.',
      ),
      lessons: ['anaStats'],
    },
  ],
}

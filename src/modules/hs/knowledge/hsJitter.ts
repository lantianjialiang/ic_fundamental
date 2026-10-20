import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** HS-04 抖动与噪声：DJ、RJ、TJ@BER、双狄拉克模型与浴盆曲线 */
export const HS_JITTER_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'deterministic-jitter',
      term: 'Deterministic jitter (DJ)',
      name: loc('确定性抖动（DJ）', 'Deterministic jitter (DJ)'),
      def: loc(
        '有界、可重复的边沿位移，例如码型相关的符号间干扰、串扰和占空比失真。它的范围有硬边界，用峰峰值 DJ_pp 表示。与之相对的是高斯的随机抖动（RJ）。见 {@hsJitter}。',
        'Bounded, repeatable edge displacement, for example pattern-dependent ISI, crosstalk and duty-cycle distortion. It has a hard limit and is given as a peak-to-peak value DJ_pp. Its counterpart is the Gaussian random jitter (RJ). See {@hsJitter}.',
      ),
      lessons: ['hsJitter'],
    },
    {
      id: 'total-jitter',
      term: 'Total jitter (TJ)',
      name: loc('总抖动（TJ）', 'Total jitter (TJ)'),
      def: loc(
        '在指定误码率下，边沿位移的总范围：TJ@BER = DJ_pp + 2·Q(BER)·σ_RJ。它必须说明是在哪个 BER 下测得的，BER 越低 TJ 越大。见 {@hsJitter}。',
        'The total span of edge displacement at a stated bit error rate: TJ@BER = DJ_pp + 2·Q(BER)·σ_RJ. It must always be quoted with its BER, and it grows as the BER falls. See {@hsJitter}.',
      ),
      lessons: ['hsJitter'],
    },
    {
      id: 'dual-dirac',
      term: 'Dual-Dirac model',
      name: loc('双狄拉克模型', 'Dual-Dirac model'),
      def: loc(
        '把 DJ 当作两个位于 ±DJ/2 的尖峰，每个峰上叠一个高斯 RJ。用它可以把已知的 σ_RJ 外推到很低的 BER，得到 TJ@BER。见 {@hsJitter}。',
        'Treats DJ as two spikes at ±DJ/2, each spread by a Gaussian RJ. It extrapolates a known σ_RJ to very low BER, giving TJ@BER. See {@hsJitter}.',
      ),
      lessons: ['hsJitter'],
    },
  ],
  extraLessons: {
    'random-jitter': ['hsJitter'],
    'bathtub-curve': ['hsJitter'],
  },
  faqs: [
    {
      id: 'hs-jitter-tj-formula',
      q: loc('总抖动为什么不是把 DJ 和 RJ 的峰值简单相加？', 'Why is total jitter not just the sum of the DJ and RJ peaks?'),
      a: loc(
        'DJ 有硬边界，按峰峰值整块扣；RJ 是高斯，要按目标 BER 乘以 Q 倍的 σ。TJ@BER = DJ_pp + 2·Q(BER)·σ_RJ，所以 BER 不同，TJ 也不同。把 RJ 当作有界的 ±3σ 会严重低估。见 {@hsJitter}。',
        'DJ has a hard limit and is subtracted whole as a peak-to-peak value; RJ is Gaussian and must be multiplied by the Q factor for the target BER. TJ@BER = DJ_pp + 2·Q(BER)·σ_RJ, so TJ changes with the BER. Treating RJ as a bounded ±3σ badly underestimates it. See {@hsJitter}.',
      ),
      lessons: ['hsJitter'],
    },
    {
      id: 'hs-jitter-histogram-short',
      q: loc('为什么直方图读不出 1e-12 的眼宽？', 'Why can a histogram not show the eye width at 1e-12?'),
      a: loc(
        '直方图只有有限的样本，本站用 4000 个，每个 bin 的概率最低只到约 1/4000。1e-12 要靠 Q 函数和双狄拉克模型外推，这正是模型的用途。见 {@hsJitter}。',
        'A histogram only has finitely many samples; this site uses 4000, so a bin can only show a probability down to about 1/4000. 1e-12 must be extrapolated with the Q function and the dual-Dirac model, which is exactly what the model is for. See {@hsJitter}.',
      ),
      lessons: ['hsJitter'],
    },
    {
      id: 'hs-jitter-rj-vs-dj-ber',
      q: loc('RJ 和 DJ 随 BER 变化有什么不同？', 'How do RJ and DJ differ as the BER changes?'),
      a: loc(
        'DJ 是有界的硬边界，BER 再低也不会超出 ±DJ/2；RJ 的高斯尾随 BER 变低而变远，1e-12 时 Q 约为 7.03。所以 BER 越低，TJ 里来自 RJ 的部分占的比例越大。见 {@hsJitter}。',
        'DJ is a hard bound: however low the BER, it never goes beyond ±DJ/2. The Gaussian tail of RJ moves further out as the BER falls, with Q ≈ 7.03 at 1e-12. So the lower the BER, the larger the share of the TJ that comes from RJ. See {@hsJitter}.',
      ),
      lessons: ['hsJitter'],
    },
  ],
}

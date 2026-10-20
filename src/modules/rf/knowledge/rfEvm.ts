import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-12 EVM 与 ACPR：调制误差、邻道泄漏、Rapp 压缩与频谱再生 */
export const RF_EVM_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'evm',
      term: 'EVM',
      name: loc('误差矢量幅度（EVM）', 'Error vector magnitude (EVM)'),
      def: loc(
        '接收符号与理想符号之差（误差矢量）的均方根，除以参考信号的均方根，用百分比表示。计算前先做增益和相位对齐，剩下的就是符号形状误差。EVM 反映星座上的符号误差。见 {@rfEvm}。',
        'The RMS of the error vectors (received minus ideal symbol), divided by the RMS of the reference, in percent. Gain and phase are aligned first, so what remains is the symbol shape error. EVM reflects symbol error on the constellation. See {@rfEvm}.',
      ),
      lessons: ['rfEvm'],
    },
    {
      id: 'acpr',
      term: 'ACPR',
      name: loc('邻道功率比（ACPR）', 'Adjacent channel power ratio (ACPR)'),
      def: loc(
        '相邻信道功率与主信道功率之比，单位 dBc。数值为负，越负泄漏越少。它反映非线性产生的频谱再生落进邻道的多少，决定能否满足邻道的频谱限值。见 {@rfEvm}。',
        'The ratio of adjacent-channel power to main-channel power, in dBc. The value is negative, and the more negative, the less leakage. It shows how much spectral regrowth from nonlinearity falls into the neighbouring channels, and so whether the adjacent-channel limit is met. See {@rfEvm}.',
      ),
      lessons: ['rfEvm'],
    },
    {
      id: 'spectral-regrowth',
      term: 'Spectral regrowth',
      name: loc('频谱再生', 'Spectral regrowth'),
      def: loc(
        '非线性把原本限带的信号变宽：包络压缩产生的互调分量会落到原信道两侧的邻道。减少非线性（增加回退或线性化）是从源头降低它的办法。见 {@rfEvm}。',
        'Nonlinearity widens a band-limited signal: intermodulation products from envelope compression fall into the neighbouring channels on either side. Reducing the nonlinearity (more back-off or linearisation) is the way to cut it at the source. See {@rfEvm}.',
      ),
      lessons: ['rfEvm'],
    },
  ],
  extraLessons: {
    'rapp-model': ['rfEvm'],
  },
  faqs: [
    {
      id: 'rf-evm-align',
      q: loc('算 EVM 前为什么要先做增益和相位对齐？', 'Why align gain and phase before computing EVM?'),
      a: loc(
        '固定的增益和相位偏差不改变符号的形状，却会被当成误差。对齐用最小二乘求一个复数增益，只把剩下的差别算作误差，这样 EVM 反映的是失真造成的符号误差，而不是接收机的增益设置。见 {@rfEvm}。',
        'A fixed gain and phase offset does not change the shape of the symbols, but would be counted as error. Alignment uses a least-squares complex gain and counts only the remaining difference, so EVM reflects the symbol error caused by distortion rather than the receiver gain setting. See {@rfEvm}.',
      ),
      lessons: ['rfEvm'],
    },
    {
      id: 'rf-acpr-vs-evm',
      q: loc('EVM 合格，ACPR 就一定合格吗？', 'If EVM passes, does ACPR pass too?'),
      a: loc(
        '不一定。EVM 只看符号采样点上的平均误差，ACPR 看整段频谱上泄漏到相邻信道的功率。压缩在波形包络上产生的互调分量会落在邻道，平均误差很小时，邻道泄漏仍可能超标。两项要分别判定，见 {@rfEvm}。',
        'Not necessarily. EVM looks at the average error at the symbol sampling points, while ACPR looks at the power leaking into adjacent channels across the whole spectrum. Intermodulation from envelope compression lands in the neighbouring channels, so ACPR can fail even when the average symbol error is small. Judge the two separately; see {@rfEvm}.',
      ),
      lessons: ['rfEvm'],
    },
    {
      id: 'rf-backoff-tradeoff',
      q: loc('输入回退越多，EVM 和 ACPR 都更好，为什么不一直回退？', 'More back-off improves EVM and ACPR, so why not back off as far as possible?'),
      a: loc(
        '回退越多，功放的输出功率也越小，通常效率也会下降，等于付出了输出功率和电能的代价。这一课只看线性指标，没有建模输出功率与效率；实际设计要在线性度与效率之间权衡，见 {@rfEvm}。',
        'The more you back off, the less output power the amplifier delivers, and efficiency usually drops too, so you pay in output power and energy. This lesson looks only at the linearity metrics and does not model output power or efficiency; a real design trades linearity against efficiency. See {@rfEvm}.',
      ),
      lessons: ['rfEvm'],
    },
  ],
}

import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-05 增益与插入损耗：插损、平坦度、频率响应；以及对已有词条 bandwidth-3db 的课程补充 */
export const RF_GAIN_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'insertion-loss',
      term: 'Insertion loss',
      name: loc('插入损耗（IL）', 'Insertion loss (IL)'),
      def: loc(
        '信号经过一个无源器件（滤波器、线缆、开关）后被衰减的量，IL = −增益，单位 dB。IL 为正数表示功率变小。插损也随频率变化，常画成一条曲线。见 {@rfGain}。',
        'The attenuation a signal suffers passing through a passive device such as a filter, cable or switch; IL = −gain in dB, so a positive IL means the power drops. Insertion loss also varies with frequency and is often drawn as a curve. See {@rfGain}.',
      ),
      lessons: ['rfGain'],
    },
    {
      id: 'gain-flatness',
      term: 'Gain flatness',
      name: loc('增益平坦度', 'Gain flatness'),
      def: loc(
        '工作带宽内增益的最大值减最小值，单位 dB（峰峰值）。它量的是带内起伏，与增益大小无关。规格里的平坦度限值只在工作频段内检查。见 {@rfGain}。',
        'The maximum minus the minimum gain inside the operating band, in dB peak-to-peak. It measures the in-band ripple, not the gain level. A flatness spec is checked only inside the operating band. See {@rfGain}.',
      ),
      lessons: ['rfGain'],
    },
    {
      id: 'frequency-response',
      term: 'Frequency response',
      name: loc('频率响应', 'Frequency response'),
      def: loc(
        '增益（或插损）随频率变化的关系，通常画成对数频率轴上的曲线。二阶带通的教学模型中，中心频率 f0 增益最高，离开 f0 衰减加快；Q 越高，曲线越尖。见 {@rfGain}。',
        'How gain (or insertion loss) changes with frequency, usually plotted as a curve on a log frequency axis. In the second-order band-pass teaching model the gain peaks at the centre frequency f0 and falls faster away from it; a higher Q gives a sharper curve. See {@rfGain}.',
      ),
      lessons: ['rfGain'],
    },
  ],
  extraLessons: {
    'bandwidth-3db': ['rfGain'],
  },
  faqs: [
    {
      id: 'rf-gain-il-sign',
      q: loc('插入损耗和增益是什么关系？', 'What is the relation between insertion loss and gain?'),
      a: loc(
        '对无源器件，插入损耗 IL（dB）= −增益（dB）。IL 为正数表示信号被衰减了多少；放大器的增益为正，表示信号被放大。一条链路的总增益等于各段增益之和（dB），见 {@rfDb}。',
        'For a passive device, insertion loss IL (dB) = −gain (dB). A positive IL is how much the signal is attenuated; an amplifier has a positive gain, meaning the signal is boosted. The total gain of a chain is the sum of the stage gains in dB; see {@rfDb}.',
      ),
      lessons: ['rfGain'],
    },
    {
      id: 'rf-gain-3db-ref',
      q: loc('为什么 3 dB 带宽要相对峰值，而不是相对 0 dB？', 'Why is the 3 dB bandwidth measured relative to the peak rather than to 0 dB?'),
      a: loc(
        '3 dB 带宽定义为增益比峰值低 3 dB 的频率区间。无源器件的峰值可能是 −2.5 dB，若用 0 dB 作基准，边界就会偏到错误的位置。见 {@rfGain}。',
        'The 3 dB bandwidth is the frequency span where the gain is 3 dB below its peak. A passive device may peak at −2.5 dB, and using 0 dB as the reference would put the edges in the wrong place; see {@rfGain}.',
      ),
      lessons: ['rfGain'],
    },
    {
      id: 'rf-gain-flat-band',
      q: loc('平坦度只看 3 dB 带宽内的最大最小值，够不够？', 'Is it enough to take the max and min inside the 3 dB bandwidth for flatness?'),
      a: loc(
        '不够。3 dB 带宽的边界本身就是峰值下降 3 dB，带内的峰峰值会接近 3 dB，它并不反映你实际要用的频段。平坦度应该在工作带宽里算，本站用 f0 ± W/2。见 {@rfGain}。',
        'Not enough. The 3 dB edges are by definition 3 dB below the peak, so the in-band range will be close to 3 dB and says nothing about the band you actually use. Flatness should be computed over the operating band, here f0 ± W/2; see {@rfGain}.',
      ),
      lessons: ['rfGain'],
    },
  ],
}

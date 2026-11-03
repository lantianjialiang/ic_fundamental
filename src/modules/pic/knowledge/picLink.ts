import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const lesson = 'picLink' as ModuleId

/** PIC-08 光链路：眼图、OMA、Q 与灵敏度 */
export const PIC_LINK_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-optical-eye',
      term: 'Optical eye',
      name: loc('光眼图', 'Optical eye'),
      def: loc(
        '光变成电流之后再采样得到的眼图。打开之后，高低电平的读法和电眼图相同。纵轴在转换前对应功率。见 {@picLink}。',
        'An eye sampled after light has been converted to current. Once it is open, the high and low levels are read the same way as an electrical eye. Before conversion the vertical axis is power. See {@picLink}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-sensitivity',
      term: 'Receiver sensitivity',
      name: loc('接收灵敏度', 'Receiver sensitivity'),
      def: loc(
        '达到目标 BER（本课取 1e-12）所需的最小接收 OMA。热噪声下 OMA_min = 2·Q·σ/R。它不是平均功率。见 {@picLink}。',
        'The smallest received OMA that still meets the BER target (1e-12 in this lesson). Under thermal noise, OMA_min = 2·Q·σ/R. It is not an average-power spec. See {@picLink}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-qfactor',
      term: 'Link Q factor',
      name: loc('链路 Q 因子 / 判决 Q', 'Link / decision Q factor'),
      def: loc(
        '热噪声主导、两电平噪声相近时 Q = R·OMA / (2σ)。BER 是标准正态的 Q 函数，Q ≈ 7.034 对应 BER ≈ 1e-12。它是链路余量，不是谐振器的 Q = λ/FWHM。见 {@picLink} 和 {@picDevice}。',
        'When thermal noise dominates and the two levels have similar noise, Q = R·OMA / (2σ). BER is the Q function of a standard normal, and Q ≈ 7.034 corresponds to BER ≈ 1e-12. It is a link margin, not the resonator Q = λ/FWHM. See {@picLink} and {@picDevice}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {
    'eye-diagram': [lesson],
    'pic-oma': [lesson],
  },
  faqs: [
    {
      id: 'pic-link-oma',
      q: loc('灵敏度为什么不看平均功率？', 'Why is sensitivity not an average-power spec?'),
      a: loc(
        '热噪声下 Q = R·OMA / (2σ)，平均功率没有进入这个式子。平均功率相同、OMA 更小的时候，0 和 1 更难分开。见 {@picLink}。',
        'Under thermal noise, Q = R·OMA / (2σ), and average power does not enter that formula. The same average power with a smaller OMA makes 0 and 1 harder to separate. See {@picLink}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-link-q',
      q: loc('Q = 7.034 对应多大的 BER？', 'What BER corresponds to Q = 7.034?'),
      a: loc(
        '大约 1e-12。本课把这个 Q 代进 OMA_min = 2·Q·σ/R，得到 σ = 10 µA、R = 0.8 A/W 时约 0.176 mW（−7.55 dBm）。见 {@picLink}。',
        'About 1e-12. This lesson puts that Q into OMA_min = 2·Q·σ/R. At σ = 10 µA and R = 0.8 A/W the result is about 0.176 mW (−7.55 dBm). See {@picLink}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-link-er-ber',
      q: loc('消光比差一点，电 BER 会不会一起坏？', 'Does a slightly worse extinction ratio ruin the electrical BER?'),
      a: loc(
        '热噪声下 Q = R·OMA / (2σ)，电 BER 看的是 OMA，不是 ER。ER 变差时，要保住同一 OMA，平均功率得抬高。OMA 够、噪声不变，电 BER 可以仍然达标；平均功率预算却先破。见 {@picLink}。',
        'Under thermal noise, Q = R·OMA / (2σ), so electrical BER follows OMA, not ER. When ER falls, holding the same OMA needs a higher average power. With enough OMA and the same noise, electrical BER can still meet the target; the average-power budget breaks first. See {@picLink}.',
      ),
      lessons: [lesson],
    },
  ],
}

import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-08 噪声系数：NF、Friis 级联公式、ENR 与 Y 因子法 */
export const RF_NF_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'noise-figure',
      term: 'NF',
      name: loc('噪声系数（NF）', 'Noise figure (NF)'),
      def: loc(
        '输入端信噪比除以输出端信噪比，取 dB：NF = 10·log₁₀(F)，F 为线性的噪声因子。理想电路 F = 1（0 dB），实际电路都大于 0 dB。见 {@rfNf}。',
        'The input SNR divided by the output SNR, in dB: NF = 10·log₁₀(F), where F is the linear noise factor. An ideal circuit has F = 1 (0 dB); real circuits are above 0 dB. See {@rfNf}.',
      ),
      lessons: ['rfNf'],
    },
    {
      id: 'friis-formula',
      term: 'Friis formula',
      name: loc('Friis 级联公式', 'Friis cascade formula'),
      def: loc(
        '多级级联的总噪声因子：F = F₁ + (F₂ − 1)/G₁ + (F₃ − 1)/(G₁G₂) + …（线性值）。前级增益高，后面各项就小，所以链路的 NF 主要由前几级决定。见 {@rfNf}。',
        'The cascaded noise factor: F = F₁ + (F₂ − 1)/G₁ + (F₃ − 1)/(G₁G₂) + … (linear). A high front gain shrinks the later terms, so the chain NF is set mainly by the first few stages. See {@rfNf}.',
      ),
      lessons: ['rfNf'],
    },
    {
      id: 'enr',
      term: 'ENR',
      name: loc('超噪比（ENR）', 'Excess noise ratio (ENR)'),
      def: loc(
        '噪声源热态（噪声源开）比冷态（290 K）多出来的噪声比，由出厂标定，常用 dB 表示。Y 因子法中 ENR 是已知量。见 {@rfNf}。',
        'The excess noise ratio of a noise source between its hot (on) and cold (290 K) states, calibrated at the factory and usually given in dB. In the Y-factor method ENR is a known input. See {@rfNf}.',
      ),
      lessons: ['rfNf'],
    },
    {
      id: 'y-factor',
      term: 'Y factor',
      name: loc('Y 因子法', 'Y-factor method'),
      def: loc(
        '用噪声源开、关两次输出功率之比 Y = N_hot / N_cold 测 NF，再由 NF(线性) = ENR / (Y − 1) 换算。Y 越接近 1，测得越不准，所以要选足够大的 ENR。见 {@rfNf}。',
        'Measure NF from the ratio Y = N_hot / N_cold of output powers with the noise source on and off, then convert with NF (linear) = ENR / (Y − 1). The closer Y is to 1, the less accurate the result, so choose a large enough ENR. See {@rfNf}.',
      ),
      lessons: ['rfNf'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'rf-nf-front-stage',
      q: loc('为什么 LNA 要放在链路最前面？', 'Why put the LNA at the very front of the chain?'),
      a: loc(
        '前级的噪声会被后面所有的增益放大，而后级的噪声只是除以前面的增益。LNA 的 NF 直接进入总 NF，它的增益又压低了后级的贡献，所以 LNA 的 NF 和增益最关键。见 {@rfNf}。',
        'Noise from an early stage is amplified by all the gain after it, while later noise is only divided by the gain ahead of it. The LNA’s NF goes straight into the total, and its gain suppresses later contributions, so its NF and gain matter most. See {@rfNf}.',
      ),
      lessons: ['rfNf'],
    },
    {
      id: 'rf-nf-add-db',
      q: loc('能不能把各级的 NF（dB）直接相加？', 'Can I just add the stage NFs in dB?'),
      a: loc(
        '不能。级联时相加的是线性的 F − 1，不是 dB 数；dB 相加对应线性值相乘。要先把每级换成线性 F，再按 Friis 公式（含前级增益）算。见 {@rfNf}。',
        'No. What adds up in a cascade is the linear F − 1, not the dB numbers; adding dB corresponds to multiplying linear values. Convert each stage to linear F first, then apply the Friis formula including the front gains. See {@rfNf}.',
      ),
      lessons: ['rfNf'],
    },
    {
      id: 'rf-nf-enr-choice',
      q: loc('ENR 为什么不能选得太小？', 'Why must ENR not be too small?'),
      a: loc(
        'Y 只比 1 大一点时，热态与冷态的读数几乎一样，仪器的小误差会被 1/(Y − 1) 放大，NF 算得很不准。通常要选 ENR 比被测 NF 大好几个 dB 的噪声源，让 Y 明显大于 1。见 {@rfNf}。',
        'When Y is only slightly above 1, the hot and cold readings nearly match and small instrument errors are magnified by 1/(Y − 1), so NF is very inaccurate. Choose a noise source whose ENR is several dB above the device NF so that Y is clearly above 1. See {@rfNf}.',
      ),
      lessons: ['rfNf'],
    },
  ],
}

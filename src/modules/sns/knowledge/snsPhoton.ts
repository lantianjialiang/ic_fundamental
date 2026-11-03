import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

/** SNS-02 光电基础 */
export const SNS_PHOTON_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-qe',
      term: 'Quantum efficiency',
      name: loc('量子效率', 'Quantum efficiency'),
      def: loc(
        '一个入射光子平均产生的电子数，记作 QE。它放大的是信号，不减小读出噪声。见 {@snsPhoton}。',
        'The average number of electrons one incident photon produces, written QE. It scales the signal and does not reduce read noise. See {@snsPhoton}.',
      ),
      lessons: ['snsPhoton' as ModuleId],
    },
    {
      id: 'sns-responsivity',
      term: 'Responsivity',
      name: loc('响应度', 'Responsivity'),
      def: loc(
        '光电流对光功率的比值，单位 A/W。R = QE·λ(µm) / 1.2398。550 nm、QE = 0.6 时约 0.266 A/W。见 {@snsPhoton}。',
        'Photocurrent divided by optical power, in A/W. R = QE * lambda(um) / 1.2398. At 550 nm and QE = 0.6 it is about 0.266 A/W. See {@snsPhoton}.',
      ),
      lessons: ['snsPhoton' as ModuleId],
    },
    {
      id: 'sns-shot',
      term: 'Shot noise',
      name: loc('散粒噪声', 'Shot noise'),
      def: loc(
        '光子或暗电子服从泊松分布，标准差是 √N。光子散粒看信号电子，暗散粒看曝光内积累的暗电子。只剩散粒噪声时，10000 电子的 SNR 是 40 dB。见 {@snsPhoton}。',
        'Photons or dark electrons follow a Poisson distribution, so the std is sqrt(N). Photon shot follows the signal electrons; dark shot follows the dark electrons collected in the exposure. With shot noise alone, 10000 electrons give an SNR of 40 dB. See {@snsPhoton}.',
      ),
      lessons: ['snsPhoton' as ModuleId],
    },
    {
      id: 'sns-read-noise',
      term: 'Read noise',
      name: loc('读出噪声', 'Read noise'),
      def: loc(
        '读出电路加上的电子数 rms，不随信号或曝光变长。它的方差是 σr²。σr² 大于信号电子加暗电子时，读出噪声主导；散粒噪声等于读噪的信号电子数就是 σr²。见 {@snsPhoton}。',
        'An rms electron count added by the readout circuit. It does not grow with the signal or the exposure. Its variance is sigma_r squared. Read noise dominates when that variance exceeds signal electrons plus dark electrons. Shot noise equals read noise at sigma_r squared signal electrons. See {@snsPhoton}.',
      ),
      lessons: ['snsPhoton' as ModuleId],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'sns-photon-snr-prop',
      q: loc('光强加大一倍，SNR 会不会也加大一倍？', 'If the light level doubles, does the SNR double?'),
      a: loc(
        '不会。SNR = S / √(S + D + σr²)。只剩散粒噪声时 SNR = √S，光强加倍只让 SNR 变成 √2 倍，大约多 3 dB，不是两倍。读噪主导时，S 还小，SNR 更接近随 S 线性变，见 {@snsPhoton}。',
        'No. SNR = S / sqrt(S + D + sigma_r^2). With shot noise alone, SNR = sqrt(S), so doubling the light multiplies SNR by sqrt(2), about 3 dB, not by two. While read noise dominates, S is still small and SNR stays closer to linear in S. See {@snsPhoton}.',
      ),
      lessons: ['snsPhoton' as ModuleId],
    },
    {
      id: 'sns-photon-dark-read',
      q: loc('暗电流和读出噪声为什么要分开？', 'Why keep dark current and read noise apart?'),
      a: loc(
        '暗电流按时间积累电子，噪声是这些电子的平方根，曝光加长它就变大。读出噪声是电路的 rms，不跟曝光走。两者在 SNR 的分母里是不同的两项，见 {@snsPhoton}。',
        'Dark current collects electrons over time, and its noise is the square root of those electrons, so a longer exposure makes it larger. Read noise is an rms from the circuit and does not follow the exposure. They are different terms under the square root in the SNR. See {@snsPhoton}.',
      ),
      lessons: ['snsPhoton' as ModuleId],
    },
    {
      id: 'sns-photon-qe-slope',
      q: loc('提高 QE，SNR 曲线会不会变成每十倍 +20 dB？', 'Does raising QE make the SNR curve +20 dB per decade?'),
      a: loc(
        '不会。+20 dB / 十倍信号是读噪主导区的斜率，+10 dB 是散粒噪声主导区。QE 放大的是信号电子，让你在同一条曲线上往右走，不改这两段斜率。见 {@snsPhoton}。',
        'No. +20 dB per decade of signal is the slope in the read-noise region; +10 dB is the shot-noise region. QE scales the signal electrons and moves you right along the same curve. It does not change those two slopes. See {@snsPhoton}.',
      ),
      lessons: ['snsPhoton' as ModuleId],
    },
  ],
}

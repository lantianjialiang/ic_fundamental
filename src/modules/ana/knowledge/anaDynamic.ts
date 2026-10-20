import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-11 ADC 动态参数：SNR、SINAD、THD、SFDR、ENOB，以及已有词条的课程补充、常见问题 */
export const ANA_DYNAMIC_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'snr',
      term: 'SNR',
      name: loc('信噪比', 'Signal-to-noise ratio (SNR)'),
      def: loc(
        '基波功率与噪声功率之比，不含谐波，单位 dB。满量程正弦的理想值是 6.02N + 1.76 dB；位数每加 1，它加 6.02 dB。',
        'Ratio of fundamental power to noise power, harmonics excluded, in dB. The ideal value for a full-scale sine is 6.02N + 1.76 dB; each extra bit adds 6.02 dB.',
      ),
      lessons: ['anaDynamic'],
    },
    {
      id: 'sinad',
      term: 'SINAD',
      name: loc('信纳比', 'Signal-to-noise-and-distortion ratio (SINAD)'),
      def: loc(
        '基波功率与“噪声加谐波”功率之比，单位 dB。它比 SNR 更严，满量程正弦时是换算 ENOB 的依据：ENOB = (SINAD − 1.76) / 6.02。',
        'Ratio of fundamental power to the power of noise plus harmonics, in dB. It is stricter than SNR, and for a full-scale sine it is the basis for ENOB: ENOB = (SINAD − 1.76) / 6.02.',
      ),
      lessons: ['anaDynamic'],
    },
    {
      id: 'thd',
      term: 'THD',
      name: loc('总谐波失真', 'Total harmonic distortion (THD)'),
      def: loc(
        '把 HD2 … HDn 的功率全部相加，再与基波之比，单位 dBc（或 %）。它只看谐波，不含噪声。',
        'The power of HD2 … HDn added together, divided by the fundamental, in dBc (or %). It looks only at harmonics and excludes noise.',
      ),
      lessons: ['anaDynamic'],
    },
    {
      id: 'sfdr',
      term: 'SFDR',
      name: loc('无杂散动态范围', 'Spurious-free dynamic range (SFDR)'),
      def: loc(
        '基波与最大的那一根杂散（谐波或噪声峰）之差，单位 dBc。它是最坏一根的指标，和只看总量的 SNR 口径不同。',
        'Difference between the fundamental and the largest single spur (a harmonic or a noise peak), in dBc. It is a worst-single-spur figure, unlike SNR, which counts the total.',
      ),
      lessons: ['anaDynamic'],
    },
    {
      id: 'enob',
      term: 'ENOB',
      name: loc('有效位数', 'Effective number of bits (ENOB)'),
      def: loc(
        '把测得的 SINAD 换算成等效的理想位数。满量程正弦时 ENOB = (SINAD − 1.76) / 6.02；输入为 0.9 FS 时，先把 0.92 dB 的回退量加回 SINAD 再换算。噪声和谐波越大，ENOB 离标称位数越远。',
        'The measured SINAD converted into an equivalent ideal bit count. For a full-scale sine, ENOB = (SINAD − 1.76) / 6.02; for a 0.9 FS input, add the 0.92 dB backoff back to SINAD before converting. The more noise and harmonics there are, the further ENOB falls below the nominal bit count.',
      ),
      lessons: ['anaDynamic'],
    },
  ],
  extraLessons: {
    'adc-dac': ['anaDynamic'],
  },
  faqs: [
    {
      id: 'ana-enob-meaning',
      q: loc('ENOB 是什么？为什么不直接看位数？', 'What is ENOB, and why not just read the bit count?'),
      a: loc(
        'ENOB 把测得的 SINAD 换算成“等效位数”。满量程正弦时 ENOB = (SINAD − 1.76) / 6.02。一颗标称 10 位的 ADC，噪声和谐波会占走一部分，测出的 ENOB 可能只有 8 位多，这才是它的真实分辨率。见 {@anaDynamic}。',
        'ENOB converts the measured SINAD into an effective bit count. For a full-scale sine, ENOB = (SINAD − 1.76) / 6.02. A nominal 10-bit ADC may measure only about 8 effective bits once noise and harmonics take their share; that is its real resolution. See {@anaDynamic}.',
      ),
      lessons: ['anaDynamic'],
    },
    {
      id: 'ana-sfdr-vs-thd',
      q: loc('SFDR 和 THD 都看谐波，为什么数值不一样？', 'SFDR and THD both look at harmonics. Why do the numbers differ?'),
      a: loc(
        'THD 把所有谐波功率相加，所以谐波多且大小接近时，THD 的 dBc 值会比单根最大杂散的 dBc 值更高（失真更大）；只有一根谐波占主导时两者才接近。SFDR 只取最大的那一根，不做加法。',
        'THD adds the power of all harmonics, so when many harmonics are similar in size its dBc value comes out higher (more distortion) than the single largest spur; the two are close only when one harmonic dominates. SFDR takes just the largest spur and does no adding.',
      ),
      lessons: ['anaDynamic'],
    },
    {
      id: 'ana-coherent-window',
      q: loc('为什么要用相干采样，还要加窗？', 'Why use coherent sampling, and why add a window?'),
      a: loc(
        '相干采样让输入的整周期数 M 与 FFT 点数 N 互质，基波和谐波正好落在整数频点上，不会泄漏到邻近频点。加窗则进一步压制非整周期造成的泄漏。本课用 M = 401、N = 4096，默认 Blackman-Harris 窗。',
        'Coherent sampling picks an integer number of input cycles M coprime with the FFT length N, so the fundamental and harmonics land exactly on integer bins and do not leak into neighbours. A window further suppresses leakage from non-integer cycles. This lesson uses M = 401 and N = 4096, with a Blackman-Harris window by default.',
      ),
      lessons: ['anaDynamic'],
    },
  ],
}

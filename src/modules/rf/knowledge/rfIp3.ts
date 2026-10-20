import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-07 线性度：双音测试、三阶交调 IM3、IIP3 / OIP3；以及对已有词条 fft 的课程补充 */
export const RF_IP3_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'two-tone-test',
      term: 'Two-tone test',
      name: loc('双音测试', 'Two-tone test'),
      def: loc(
        '同时给器件输入两个相近的频率 f1、f2，然后在输出频谱上看新出现的交调分量。它用来测器件的线性度，和单音的压缩测试互补。见 {@rfIp3}。',
        'Feeding a device two close frequencies f1 and f2 at once, then looking for new intermodulation components in the output spectrum. It measures linearity and complements the single-tone compression test. See {@rfIp3}.',
      ),
      lessons: ['rfIp3'],
    },
    {
      id: 'imd3',
      term: 'IM3',
      name: loc('三阶交调（IM3）', 'Third-order intermodulation (IM3)'),
      def: loc(
        '三阶非线性产生的分量，位于 2f1−f2 与 2f2−f1。它离基波只差一个两音间隔，随输入增长的速度是基波的三倍（每 dB 3 dB），因此是放大器线性度的主要限制。见 {@rfIp3}。',
        'A component from third-order nonlinearity, located at 2f1−f2 and 2f2−f1. It sits only one tone spacing from the fundamentals and grows three times as fast with input (3 dB per dB), so it is the main limit on amplifier linearity. See {@rfIp3}.',
      ),
      lessons: ['rfIp3'],
    },
    {
      id: 'ip3',
      term: 'IIP3 / OIP3',
      name: loc('三阶截点（IIP3 / OIP3）', 'Third-order intercept (IIP3 / OIP3)'),
      def: loc(
        'IIP3 是基波与 IM3 外推相交时的输入功率，OIP3 是对应的输出功率。读数公式：IIP3 = Pin + ΔIM3/2，OIP3 = Pout + ΔIM3/2，其中 ΔIM3 是基波与 IM3 的功率差（dB）。小信号时 OIP3 = IIP3 + 增益。见 {@rfIp3}。',
        'IIP3 is the input power where the extrapolated fundamental and IM3 lines cross, and OIP3 is the corresponding output power. Read as IIP3 = Pin + ΔIM3/2 and OIP3 = Pout + ΔIM3/2, where ΔIM3 is the fundamental-to-IM3 power difference in dB. At small signal OIP3 = IIP3 + gain. See {@rfIp3}.',
      ),
      lessons: ['rfIp3'],
    },
  ],
  extraLessons: {
    fft: ['rfIp3'],
  },
  faqs: [
    {
      id: 'rf-ip3-backoff',
      q: loc('测 IIP3 时为什么要回退 15 dB 左右？', 'Why back off about 15 dB when measuring IIP3?'),
      a: loc(
        '外推假设基波斜率为 1。回退不够时基波已被压缩，斜率偏离 1，读出的 IIP3 偏低。在本站的模型里，回退约 15 dB 以上，读数误差才能控制在 0.5 dB 以内。见 {@rfIp3}。',
        'The extrapolation assumes a fundamental slope of 1. With too little backoff the fundamental is already compressed, the slope departs from 1, and the read IIP3 is low. In this site’s model the read error stays within 0.5 dB only when the backoff is about 15 dB or more; see {@rfIp3}.',
      ),
      lessons: ['rfIp3'],
    },
    {
      id: 'rf-ip3-two-tone-slope',
      q: loc('为什么 IM3 随输入增长比基波快？', 'Why does IM3 grow faster with input than the fundamental?'),
      a: loc(
        'IM3 来自三次项，输入每增加 1 dB，三次项的输出增加 3 dB；基波来自一次项，只增加 1 dB。因此 ΔIM3 每增加输入 1 dB 减小 2 dB。见 {@rfIp3}。',
        'IM3 comes from the cubic term, so its output rises 3 dB for each 1 dB of input; the fundamental comes from the linear term and rises only 1 dB. So ΔIM3 shrinks by 2 dB for each 1 dB of input; see {@rfIp3}.',
      ),
      lessons: ['rfIp3'],
    },
    {
      id: 'rf-ip3-clash',
      q: loc('两音频率怎么选才不会让谱线重叠？', 'How should the two tone frequencies be chosen so that lines do not overlap?'),
      a: loc(
        '避免两音成整数倍，比如 f1 = 2·f2 时，2f1−f2 = 3f2 与三次谐波重合。还要检查 2f1−f2、2f2−f1、3f1、3f2 等分量是否落在同一根谱线上。见 {@rfIp3}。',
        'Avoid tones that are integer multiples of each other: when f1 = 2·f2, 2f1−f2 = 3f2 lands on the third harmonic. Also check that 2f1−f2, 2f2−f1, 3f1 and 3f2 do not share a spectral line; see {@rfIp3}.',
      ),
      lessons: ['rfIp3'],
    },
  ],
}

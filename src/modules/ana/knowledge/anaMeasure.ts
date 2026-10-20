import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-02 PMU 测量：Force 与 Measure、量程与误差带、两线与四线接法 */
export const ANA_MEASURE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'error-band',
      term: 'Error band',
      name: loc('误差带', 'Error band'),
      def: loc(
        '仪器读数允许的不确定范围，常写成 ±（读数的 a% + 量程的 b%）。本站示意模型里是 0.1% × 读数 + 0.05% × 量程。读数越小，量程那一项占的比例越大。见 {@anaMeasure}。',
        'The uncertainty band around an instrument reading, usually written as ±(a% of reading + b% of range). In this site’s illustrative model it is 0.1% × reading + 0.05% × range. As the reading shrinks, the range term takes a larger share. See {@anaMeasure}.',
      ),
      lessons: ['anaMeasure'],
    },
    {
      id: 'two-wire',
      term: '2-wire measurement',
      name: loc('两线测量', '2-wire measurement'),
      def: loc(
        '加压和感测共用同一对导线。导线电阻串进加压回路，读数里会多出约 2 × R_lead 的误差；R_DUT 越小，这项误差相对越大。见 {@anaMeasure}。',
        'Force and sense share one pair of leads. Lead resistance sits in the forcing loop and adds an error of about 2 × R_lead to the reading; the smaller R_DUT is, the larger that error is relative to the reading. See {@anaMeasure}.',
      ),
      lessons: ['anaMeasure'],
    },
  ],
  extraLessons: {
    kelvin: ['anaMeasure'],
    'force-measure': ['anaMeasure'],
    'measure-range': ['anaMeasure'],
    pmu: ['anaMeasure'],
  },
  faqs: [
    {
      id: 'ana-measure-range-bigger',
      q: loc('量程选大一点是不是更保险？', 'Is it safer to pick a larger range?'),
      a: loc(
        '不保险。量程变大，「0.05% × 量程」那一项跟着变大；读数很小时，误差带甚至会超过读数本身。应选能容纳读数的最小一档，只有显示 OVR 时才换大一档。见 {@anaMeasure}。',
        'Not safer. A larger range enlarges the “0.05% × range” term, and for a small reading the band can exceed the reading itself. Choose the smallest range that holds the reading, and go up one only when OVR appears; see {@anaMeasure}.',
      ),
      lessons: ['anaMeasure'],
    },
    {
      id: 'ana-kelvin-when',
      q: loc('什么时候一定要用 4 线（Kelvin）接法？', 'When is 4-wire (Kelvin) hookup really needed?'),
      a: loc(
        '两线测量的导线误差约为 2 × R_lead ÷ R_DUT。例如 100 Ω 的 DUT 配 0.5 Ω 导线，误差约 1%，远超 0.3% 的限值，必须改用 4 线：感测线直接接在 DUT 引脚上，导线压降不进读数。DUT 阻值很大时导线误差可以忽略，但仍以规格书要求为准。见 {@pmu}。',
        'The two-wire lead error is about 2 × R_lead ÷ R_DUT. For example, a 100 Ω DUT with 0.5 Ω leads has about 1% error, far beyond a 0.3% limit, so 4-wire is required: the sense lines touch the DUT pins directly and the lead drop stays out of the reading. For a very large DUT resistance the lead error is negligible, but the datasheet still governs. See {@pmu}.',
      ),
      lessons: ['anaMeasure'],
    },
  ],
}

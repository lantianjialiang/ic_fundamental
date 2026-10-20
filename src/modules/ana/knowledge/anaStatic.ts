import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-10 ADC / DAC 静态参数：术语、已有词条的课程补充、常见问题 */
export const ANA_STATIC_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'code-density',
      term: 'Code density',
      name: loc('码密度直方图', 'Code-density histogram'),
      def: loc(
        '用均匀的斜坡或正弦输入驱动 ADC，统计每个输出码的命中数。理想情况下，码宽相同的码命中数也相同；某码的命中数偏离平均，就说明它的宽度偏离 1 LSB。样本数越多，统计波动越小，见 {@anaStatic}。',
        'Drive the ADC with a uniform ramp or sine and count the hits in each output code. Ideally, codes of equal width get equal hits; a code whose count departs from the average is not 1 LSB wide. More samples mean less statistical noise; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
    {
      id: 'offset-error',
      term: 'Offset',
      name: loc('失调误差', 'Offset error'),
      def: loc(
        '第一个码跳变点相对理想位置的偏差，单位 LSB。它反映的是整条传输曲线的平移。在码密度直方图里，由码 0 的命中数算出，见 {@anaStatic}。',
        'The deviation of the first code transition from its ideal position, in LSB. It reflects a shift of the whole transfer curve. In a code-density histogram it is computed from the hits in code 0; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
    {
      id: 'gain-error',
      term: 'Gain',
      name: loc('增益误差', 'Gain error'),
      def: loc(
        '满量程跨度相对理想值的偏差。它让所有码按同一比例拉伸或压缩，本课用 LSB 表示：理想跨度为 62 LSB（码 1 到码 62），偏差 = 实测跨度 − 62。增益误差不计入 DNL，见 {@anaStatic}。',
        'The deviation of the full-scale span from its ideal value. It stretches or compresses every code by the same ratio; in this lesson it is in LSB: the ideal span is 62 LSB (code 1 to code 62), and the error is the measured span minus 62. Gain error does not count toward DNL; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
    {
      id: 'dnl',
      term: 'DNL',
      name: loc('微分非线性', 'Differential nonlinearity (DNL)'),
      def: loc(
        '单个码的实际宽度相对理想宽度（1 LSB）的偏差。本课用码密度直方图算：DNL = 该码命中数 ÷ 中间码平均命中数 − 1。丢码的 DNL 为 −1 LSB，见 {@anaStatic}。',
        'The deviation of a single code’s actual width from the ideal 1 LSB. This lesson computes it from the code-density histogram: DNL = hits in the code ÷ average inner-code hits − 1. A missing code has DNL of −1 LSB; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
    {
      id: 'inl',
      term: 'INL',
      name: loc('积分非线性', 'Integral nonlinearity (INL)'),
      def: loc(
        '各跳变点偏离理想直线的程度，单位 LSB。在本课里它等于 DNL 逐码累加，并以两端连线为基准，所以首尾回到 0。INL 比 DNL 更能反映整体线性度，见 {@anaStatic}。',
        'How far each transition sits from the ideal straight line, in LSB. In this lesson it is the running sum of DNL, referenced to the line between the two ends, so it returns to zero at both ends. INL reflects overall linearity better than DNL; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
    {
      id: 'missing-code',
      term: 'Missing code',
      name: loc('丢码', 'Missing code'),
      def: loc(
        '某个输出码从不出现，即它的宽度为零。直方图里表现为该码命中数为 0，DNL 为 −1 LSB。丢码是功能性缺陷，不能靠平均或修调修回来，见 {@anaStatic}。',
        'An output code that never appears, meaning its width is zero. In the histogram it shows as zero hits, with DNL of −1 LSB. A missing code is a functional defect that averaging or trim cannot fix; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
  ],
  extraLessons: {
    'adc-dac': ['anaStatic'],
    limit: ['anaStatic'],
  },
  faqs: [
    {
      id: 'ana-hist-hits',
      q: loc('码密度直方图的样本数要多少才够？', 'How many samples does a code-density histogram need?'),
      a: loc(
        '没有固定数字，取决于要判定的精度。每码命中数少时，DNL 的统计波动就大：本课 250 次样本时每码只有约 3.7 次命中，DNL 会超过 0.5 LSB 的限值，纯属统计波动。样本数增加 16 倍，噪声只降为 1/4。见 {@anaStatic}。',
        'There is no fixed number; it depends on the precision you need. With few hits per code the DNL statistics are noisy: at 250 samples each code averages only about 3.7 hits, and DNL can exceed the 0.5 LSB limit from noise alone. Raising the sample count 16× cuts the noise to a quarter; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
    {
      id: 'ana-dnl-minus-one',
      q: loc('丢码的 DNL 为什么是 −1 LSB？', 'Why is a missing code’s DNL −1 LSB?'),
      a: loc(
        '丢码的宽度为零，命中数为 0。DNL = 0 ÷ 平均命中数 − 1 = −1 LSB。它表示该码比理想的 1 LSB 少了整整一个 LSB。INL 在丢码处出现一个台阶，见 {@anaStatic}。',
        'A missing code has zero width and zero hits. DNL = 0 ÷ average hits − 1 = −1 LSB, meaning the code is one full LSB narrower than the ideal 1 LSB. INL steps at the missing code; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
    {
      id: 'ana-inl-endpoint',
      q: loc('INL 为什么首尾都回到 0？', 'Why does INL return to zero at both ends?'),
      a: loc(
        '端点法把 INL 的基准线取为两端跳变点的连线，首尾都是 0。DNL 的平均值也是归一后的，所以 DNL 的和为 0，INL 的累加在最后一个中间码回到 0。它不是测出来的“完美”，而是基准线的定义，见 {@anaStatic}。',
        'The endpoint method takes the INL reference as the line joining the two end transitions, so INL is zero at both ends. Because DNL is normalised by its average, the DNL values sum to zero and the running sum returns to zero at the last inner code. This is a property of the reference line, not a sign of a perfect device; see {@anaStatic}.',
      ),
      lessons: ['anaStatic'],
    },
  ],
}

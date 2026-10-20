import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-09 LDO 测试：术语、已有词条的课程补充、常见问题 */
export const ANA_LDO_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'ldo',
      term: 'LDO',
      name: loc('低压差线性稳压器', 'Low-dropout linear regulator (LDO)'),
      def: loc(
        '用线性调整管和反馈环把输出钉在一个标称电压上的稳压器。它的效率受 Vin 与 Vout 之间的压差限制，但噪声低、纹波抑制好，常用来给模拟和射频电路供电。测试要测它稳压的能力，见 {@anaLdo}。',
        'A linear regulator that uses a pass element and a feedback loop to hold its output at a nominal voltage. Its efficiency is limited by the Vin-to-Vout difference, but noise and ripple rejection are good, so it often powers analog and RF circuits. Test it for how well it regulates; see {@anaLdo}.',
      ),
      lessons: ['anaLdo'],
    },
    {
      id: 'line-regulation',
      term: 'Line regulation',
      name: loc('线性调整率', 'Line regulation'),
      def: loc(
        '负载固定时，Vout 随 Vin 变化的比值，单位 mV/V。测法是固定负载，改变 Vin 再算 ΔVout/ΔVin。它只反映输入侧的变化，与负载无关，见 {@anaLdo}。',
        'The change in Vout per change in Vin with the load held fixed, in mV/V. Hold the load, change Vin, and compute ΔVout/ΔVin. It reflects input-side changes only and does not depend on load; see {@anaLdo}.',
      ),
      lessons: ['anaLdo'],
    },
    {
      id: 'load-regulation',
      term: 'Load regulation',
      name: loc('负载调整率', 'Load regulation'),
      def: loc(
        'Vin 固定时，Vout 随负载电流变化的割线斜率，单位 mV/mA。本课以 1 mA 为参考点，按 ΔVout/ΔI 计算。输出级的等效电阻随电流增大，所以大电流段的斜率更陡，见 {@anaLdo}。',
        'The secant slope of Vout against load current with Vin held fixed, in mV/mA. This lesson uses 1 mA as the reference and computes ΔVout/ΔI. The output stage’s effective resistance rises with current, so the slope is steeper at high load; see {@anaLdo}.',
      ),
      lessons: ['anaLdo'],
    },
    {
      id: 'quiescent-current',
      term: 'Iq',
      name: loc('静态电流', 'Quiescent current (Iq)'),
      def: loc(
        'LDO 空载时自身消耗的电流，即 Iin − Iout（Iout 接近 0）。它是稳压器内部电路的耗电，和负载无关；带载时负载电流也从 Iin 流过，就分不清 Iq 了，所以要空载测。见 {@anaLdo}。',
        'The current the LDO itself draws with no load: Iin − Iout, with Iout near zero. It is the regulator’s internal consumption and does not depend on the load. With a load connected, the load current also flows from Iin, so Iq cannot be separated; measure with no load. See {@anaLdo}.',
      ),
      lessons: ['anaLdo'],
    },
    {
      id: 'psrr',
      term: 'PSRR',
      name: loc('电源抑制比', 'Power supply rejection ratio (PSRR)'),
      def: loc(
        '输入纹波与输出纹波之比的分贝数：PSRR = 20·log10(Vin 纹波 ÷ Vout 纹波)。数值越大，纹波被压得越多。PSRR 随频率下降，必须写明纹波频率，见 {@anaLdo}。',
        'The ratio of input ripple to output ripple, in decibels: PSRR = 20·log10(Vin ripple ÷ Vout ripple). A larger value means more ripple is suppressed. PSRR falls with frequency, so the ripple frequency must be stated; see {@anaLdo}.',
      ),
      lessons: ['anaLdo'],
    },
  ],
  extraLessons: {
    pmu: ['anaLdo'],
    dps: ['anaLdo'],
  },
  faqs: [
    {
      id: 'ana-ldo-line-vs-load',
      q: loc('线性调整率和负载调整率要分开测吗？', 'Must line regulation and load regulation be measured separately?'),
      a: loc(
        '要分开。线性调整率固定负载、只变 Vin；负载调整率固定 Vin、只变负载。两个量的输入不同，一起变就分不清 Vout 的变化来自哪里。两项各有限值，见 {@anaLdo}。',
        'Yes. Line regulation holds the load and varies only Vin; load regulation holds Vin and varies only the load. The two inputs differ, so changing both at once makes it impossible to tell which one moved Vout. Each has its own limit; see {@anaLdo}.',
      ),
      lessons: ['anaLdo'],
    },
    {
      id: 'ana-psrr-freq',
      q: loc('PSRR 为什么要写明频率？', 'Why must PSRR state a frequency?'),
      a: loc(
        'PSRR 由反馈环的增益决定，增益随频率下降。低频时纹波被压得多，高频时纹波几乎原样穿过。只写一个 PSRR 数值，别人无法知道它在哪个频率下成立，所以数据手册和测试限值都按频率分开给，见 {@anaLdo}。',
        'PSRR comes from the feedback loop gain, which falls with frequency. Low-frequency ripple is strongly suppressed, while high-frequency ripple passes almost unchanged. A single PSRR number without a frequency cannot say where it holds, so datasheets and test limits give it per frequency; see {@anaLdo}.',
      ),
      lessons: ['anaLdo'],
    },
    {
      id: 'ana-ldo-iq-no-load',
      q: loc('测 Iq 时能不能带着负载测？', 'Can Iq be measured with a load connected?'),
      a: loc(
        '不能。Iq 的定义是空载时 LDO 自己耗的电。带载时负载电流也从 Iin 流过，读数里混进了负载电流，就不是 Iq 了。要测带载时的总电流，应另外说明条件，见 {@anaLdo}。',
        'No. Iq is defined as the current the LDO uses with no load. With a load, the load current also flows from Iin, so the reading includes it and is no longer Iq. A total current with load is a different measurement and must be labelled as such; see {@anaLdo}.',
      ),
      lessons: ['anaLdo'],
    },
  ],
}

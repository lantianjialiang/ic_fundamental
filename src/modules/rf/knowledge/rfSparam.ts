import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-04 阻抗匹配与 S 参数：反射系数 Γ、回波损耗、VSWR 与失配损耗 */
export const RF_SPARAM_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 's-parameter',
      term: 'S-parameters',
      name: loc('S 参数（散射参数）', 'S-parameters (scattering parameters)'),
      def: loc(
        '用入射波与反射、透射波的复数比描述网络的高频特性。S11 是端口 1 的反射系数（单端口负载时就是 Γ），S21 是正向透射。S 参数随频率变化，要用矢量网络分析仪测量。见 {@rfSparam}。',
        'Describe a network’s high-frequency behaviour as complex ratios of incident to reflected and transmitted waves. S11 is the port-1 reflection coefficient (for a one-port load it is Γ), and S21 is forward transmission. They vary with frequency and are measured with a vector network analyzer. See {@rfSparam}.',
      ),
      lessons: ['rfSparam'],
    },
    {
      id: 'reflection-coefficient',
      term: 'Γ',
      name: loc('反射系数（Γ）', 'Reflection coefficient (Γ)'),
      def: loc(
        '负载阻抗相对参考阻抗的归一化差：Γ = (ZL − Z0) / (ZL + Z0)，是复数。|Γ| = 0 表示匹配，|Γ| = 1 表示全反射。见 {@rfSparam}。',
        'The normalized difference between the load impedance and the reference impedance: Γ = (ZL − Z0) / (ZL + Z0), a complex number. |Γ| = 0 means matched and |Γ| = 1 means full reflection. See {@rfSparam}.',
      ),
      lessons: ['rfSparam'],
    },
    {
      id: 'return-loss',
      term: 'RL',
      name: loc('回波损耗（RL）', 'Return loss (RL)'),
      def: loc(
        '反射功率相对入射功率的对数量度：RL = −20·log10|Γ|（dB）。RL 越大，反射越小。它衡量反射，不等于功率损耗。见 {@rfSparam}。',
        'The logarithmic measure of reflected power relative to incident power: RL = −20·log10|Γ| (dB). A larger RL means less reflection. It measures reflection and is not the same as power loss. See {@rfSparam}.',
      ),
      lessons: ['rfSparam'],
    },
    {
      id: 'vswr',
      term: 'VSWR',
      name: loc('电压驻波比（VSWR）', 'Voltage standing-wave ratio (VSWR)'),
      def: loc(
        'VSWR = (1 + |Γ|) / (1 − |Γ|)，1:1 表示匹配，|Γ| = 1 时为无穷大。射频指标常写“VSWR ≤ 2”，对应 |Γ| ≤ 1/3。见 {@rfSparam}。',
        'VSWR = (1 + |Γ|) / (1 − |Γ|); 1:1 means matched, and it is infinite when |Γ| = 1. RF specifications often say “VSWR ≤ 2”, which corresponds to |Γ| ≤ 1/3. See {@rfSparam}.',
      ),
      lessons: ['rfSparam'],
    },
  ],
  extraLessons: {
    impedance: ['rfSparam'],
  },
  faqs: [
    {
      id: 'rf-why-50-ohm',
      q: loc('为什么射频系统常用 50 Ω？', 'Why do RF systems commonly use 50 Ω?'),
      a: loc(
        '50 Ω 是仪器端口、电缆与夹具共同约定的参考阻抗 Z0。约定统一后，接口之间不会因为阻抗不同而反射，Γ 才有意义。50 Ω 也是在功率容量与损耗之间折中的常用值，并非物理上唯一正确的数字。见 {@rfSparam}。',
        '50 Ω is the reference impedance Z0 agreed for instrument ports, cables and fixtures. With one shared value, connected parts do not reflect because of a mismatch, so Γ has a clear meaning. It is a common compromise between power handling and loss, not the only physically correct number. See {@rfSparam}.',
      ),
      lessons: ['rfSparam'],
    },
    {
      id: 'rf-s11-return-loss',
      q: loc('S11 和回波损耗是什么关系？', 'What is the relation between S11 and return loss?'),
      a: loc(
        '单端口负载的 S11 就是 Γ，回波损耗 RL = −20·log10|S11|。例如 |S11| = 0.1 时 RL = 20 dB。注意 RL 与功率损耗不同：RL 只说明反射有多少，失配损耗才是功率损耗。见 {@rfSparam}。',
        'For a one-port load, S11 is Γ, and RL = −20·log10|S11|. For example |S11| = 0.1 gives RL = 20 dB. Note that RL is not the same as power loss: RL only says how much is reflected, and the mismatch loss is the power loss. See {@rfSparam}.',
      ),
      lessons: ['rfSparam'],
    },
    {
      id: 'rf-vswr-2',
      q: loc('为什么很多规格写“VSWR ≤ 2”？', 'Why do many specifications say “VSWR ≤ 2”?'),
      a: loc(
        'VSWR = 2 对应 |Γ| = 1/3，回波损耗约 9.5 dB，失配损耗约 0.5 dB。它是常用的合格线：反射不大，又不要求每个负载都完全匹配。这是教学约定，具体规格以器件手册为准。见 {@rfSparam}。',
        'VSWR = 2 corresponds to |Γ| = 1/3, a return loss of about 9.5 dB and a mismatch loss of about 0.5 dB. It is a common pass line: reflection is modest without requiring a perfect match. This is a teaching convention; the actual specification comes from the device datasheet. See {@rfSparam}.',
      ),
      lessons: ['rfSparam'],
    },
  ],
}

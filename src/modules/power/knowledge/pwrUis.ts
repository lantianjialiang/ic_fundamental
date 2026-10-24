import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** PWR-06 UIS、雪崩能量、SOA 与热阻：非钳位感性开关、安全工作区、Zth 与结温 */
export const PWR_UIS_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'uis',
      term: 'UIS',
      name: loc('非钳位感性开关（UIS）', 'Unclamped inductive switching (UIS)'),
      def: loc(
        '器件关断时没有钳位电路，负载电感把电流推进雪崩区，电感里的能量 ½·L·Ipk² 在器件内耗散。UIS 测的是器件能承受的这份雪崩能量，见 {@pwrUis}。',
        'When the device turns off with no clamp, the load inductor drives the current into avalanche and its energy ½·L·Ipk² is dissipated in the device. UIS measures how much of this avalanche energy the device can take; see {@pwrUis}.',
      ),
      lessons: ['pwrUis'],
    },
    {
      id: 'avalanche-energy',
      term: 'EAS',
      name: loc('单脉冲雪崩能量（EAS）', 'Single-pulse avalanche energy (EAS)'),
      def: loc(
        'UIS 测试中器件能安全承受的单次雪崩能量上限，焦耳。教学简化式 E = ½·L·Ipk²·BV/(BV−Vdd)，比额定值大就判为失效。示例值，以现行标准为准。见 {@pwrUis}。',
        'The single-pulse avalanche energy limit the device can safely absorb in a UIS test, in joules. Teaching-simplified form E = ½·L·Ipk²·BV/(BV−Vdd); a value above the rating is a failure. Example value; follow the current standard. See {@pwrUis}.',
      ),
      lessons: ['pwrUis'],
    },
    {
      id: 'zth',
      term: 'Zth',
      name: loc('瞬态热阻（Zth）', 'Transient thermal impedance (Zth)'),
      def: loc(
        '温升随功率脉冲时间变化的系数，单位 K/W。短脉冲时 Zth 小，只有稳态热阻 Rth 的一部分；脉冲越长越接近 Rth。ΔT = P·Zth(t)，见 {@pwrUis}。',
        'Thermal impedance over time, in K/W: the temperature rise per watt for a power pulse of a given length. Zth is small for short pulses and approaches the steady-state Rth for long ones. ΔT = P·Zth(t); see {@pwrUis}.',
      ),
      lessons: ['pwrUis'],
    },
    {
      id: 'tsep',
      term: 'TSEP',
      name: loc('温敏电参数（TSEP）', 'Temperature-sensitive electrical parameter (TSEP)'),
      def: loc(
        '随结温单调变化的电学量（如体二极管压降），可在器件不加热的小电流下测出结温，用于校准 Zth 或监测温升。见 {@pwrUis}。',
        'An electrical quantity that changes monotonically with junction temperature (for example the body-diode forward voltage). It can be measured at a small current without heating the device, to calibrate Zth or monitor temperature rise; see {@pwrUis}.',
      ),
      lessons: ['pwrUis'],
    },
  ],
  extraLessons: {
    soa: ['pwrUis'],
    'body-diode': ['pwrUis'],
  },
  faqs: [
    {
      id: 'pwr-uis-clamp',
      q: loc('UIS 测试为什么要求 Vdd 低于 BV？', 'Why must Vdd be below BV in a UIS test?'),
      a: loc(
        '雪崩期间 Vds 被钳位在 BV，电感电压 BV−Vdd 才能让电流下降。Vdd 达到或超过 BV 时，电感电压不为正，电流不会在雪崩中降到零，能量式 E = ½·L·Ipk²·BV/(BV−Vdd) 也无意义。见 {@pwrUis}。',
        'During avalanche Vds is clamped at BV, and the inductor voltage BV−Vdd is what drives the current down. When Vdd reaches or exceeds BV, that voltage is not positive, the current does not fall to zero in avalanche, and the energy formula E = ½·L·Ipk²·BV/(BV−Vdd) has no meaning. See {@pwrUis}.',
      ),
      lessons: ['pwrUis'],
    },
    {
      id: 'pwr-uis-soa-time',
      q: loc('为什么 SOA 图里短脉冲的允许电流更大？', 'Why does the SOA allow more current for short pulses?'),
      a: loc(
        '脉冲越短，结温还来不及升到上限，热阻 Zth 只有稳态的一部分。热限制线按 Zth(t) 与 Tj,max − Tcase 算，t 越短线越高，所以允许电流更大。但 Rds(on) 与 BV 边界不随脉宽变化。见 {@pwrUis}。',
        'For short pulses the junction has no time to reach its limit, and Zth is only a fraction of the steady-state value. The thermal boundary uses Zth(t) and Tj,max − Tcase, so the shorter the pulse, the higher the line and the larger the allowed current. The Rds(on) and BV boundaries do not depend on pulse width. See {@pwrUis}.',
      ),
      lessons: ['pwrUis'],
    },
    {
      id: 'pwr-uis-zth-steady',
      q: loc('长脉冲的温升为什么不能再用 Zth 的短脉冲值？', 'Why can the short-pulse Zth not be used for a long pulse?'),
      a: loc(
        '长脉冲时热量扩散到整个散热路径，Zth 趋近稳态 Rth，温升约为 P·Rth。若仍用短脉冲的小 Zth，会低估温升，SOA 与结温判断都会偏乐观。计算时先看脉宽，再选对应的 Zth。见 {@pwrUis}。',
        'For a long pulse the heat spreads through the whole thermal path, so Zth approaches the steady-state Rth and the rise is about P·Rth. Using the small short-pulse Zth would underestimate the rise and make the SOA and junction-temperature checks too optimistic. Look at the pulse width first, then pick the matching Zth. See {@pwrUis}.',
      ),
      lessons: ['pwrUis'],
    },
  ],
}

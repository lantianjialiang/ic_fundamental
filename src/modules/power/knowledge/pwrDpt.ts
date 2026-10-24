import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** PWR-05 双脉冲测试与开关能量：DPT 电路、Eon / Eoff、反向恢复、探头偏斜 */
export const PWR_DPT_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'dpt',
      term: 'Double pulse test (DPT)',
      name: loc('双脉冲测试（DPT）', 'Double-pulse test (DPT)'),
      def: loc(
        '用两个脉冲测开关能量：第一脉冲把负载电感电流打到 I = Vdc·t1/L 后关断，测 Eoff；续流后第二脉冲开通，测 Eon。DPT 多在专用台架上做，见 {@pwrDpt}。',
        'Measures switching energy with two pulses: the first pulse builds the load-inductor current to I = Vdc·t1/L and turns off (Eoff); after freewheeling, the second pulse turns on (Eon). DPT is usually run on a dedicated bench; see {@pwrDpt}.',
      ),
      lessons: ['pwrDpt'],
    },
    {
      id: 'switching-energy',
      term: 'Eon / Eoff',
      name: loc('开关能量（Eon、Eoff）', 'Switching energy (Eon, Eoff)'),
      def: loc(
        '开通或关断期间 Vds 与 Id 的乘积对时间的积分：E = ∫Vds·Id dt，单位焦耳。关断沿和开通沿各算一次。教学简化公式只是近似，见 {@pwrDpt}。',
        'The integral over time of the product of Vds and Id during turn-on or turn-off: E = ∫Vds·Id dt, in joules. Count the turn-off and turn-on edges separately. The teaching-simplified formulas are approximations; see {@pwrDpt}.',
      ),
      lessons: ['pwrDpt'],
    },
    {
      id: 'reverse-recovery',
      term: 'Qrr / trr',
      name: loc('反向恢复（Qrr、trr）', 'Reverse recovery (Qrr, trr)'),
      def: loc(
        '续流二极管从导通切到截止时，要先把存储的电荷 Qrr 抽走，期间出现反向电流尖峰 Irr，持续 trr。它让开通时的电流超过 I，使 Eon 增大。见 {@pwrDpt}。',
        'When a freewheel diode switches from conducting to blocking, its stored charge Qrr must be removed first. A reverse current peak Irr lasts for trr. It pushes the turn-on current above I and raises Eon; see {@pwrDpt}.',
      ),
      lessons: ['pwrDpt'],
    },
    {
      id: 'probe-deskew',
      term: 'Deskew',
      name: loc('探头偏斜（deskew）', 'Probe deskew'),
      def: loc(
        '电压探头与电流探头的传输延迟不同，两路波形在时间上错开。偏斜与电流沿同量级时，开关能量的误差会很大；做 DPT 前要校准。见 {@pwrDpt}。',
        'Voltage and current probes have different propagation delays, so the two waveforms are offset in time. When the skew is comparable to the current edge, the switching-energy error can be large; calibrate before a DPT. See {@pwrDpt}.',
      ),
      lessons: ['pwrDpt'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'pwr-dpt-why-not-dc',
      q: loc('为什么不用直流测开关能量？', 'Why not measure switching energy with DC?'),
      a: loc(
        '直流只能给出稳态的导通损耗。开关能量取决于电压与电流的沿（速度与重叠时间），必须用有开关沿的脉冲测试。DPT 用两个脉冲在同一电流点上测出 Eoff 与 Eon。见 {@pwrDpt}。',
        'DC gives only steady-state conduction loss. Switching energy depends on the voltage and current edges (their speed and overlap), so a pulsed test with real switching edges is needed. DPT uses two pulses at the same current level to measure Eoff and Eon. See {@pwrDpt}.',
      ),
      lessons: ['pwrDpt'],
    },
    {
      id: 'pwr-dpt-deskew-first',
      q: loc('测得 Eoff 偏大，先查什么？', 'Eoff reads high: what should I check first?'),
      a: loc(
        '先查偏斜。电流探头相对电压探头晚到时，Eoff 偏大、Eon 偏小；用校准夹具把两路对齐到同一参考沿。再查探头带宽与积分窗口。见 {@pwrDpt}。',
        'Check skew first. When the current probe is late relative to the voltage probe, Eoff reads high and Eon reads low. Align both channels to a common reference edge with a calibration fixture. Then check the probe bandwidth and the integration window. See {@pwrDpt}.',
      ),
      lessons: ['pwrDpt'],
    },
    {
      id: 'pwr-dpt-why-rg-not-max',
      q: loc('栅极电阻 Rg 为什么不能无限大？', 'Why can the gate resistor Rg not be made infinitely large?'),
      a: loc(
        'Rg 增大让 di/dt 与 dv/dt 变慢，过冲和 EMI 下降，但电压与电流的重叠时间变长，开关能量增大。Rg 是过冲、EMI 与损耗之间的折中。见 {@pwrDpt}。',
        'A larger Rg slows di/dt and dv/dt, lowering overshoot and EMI, but voltage and current overlap for longer, so the switching energy grows. Rg is a trade-off between overshoot, EMI and loss. See {@pwrDpt}.',
      ),
      lessons: ['pwrDpt'],
    },
  ],
}

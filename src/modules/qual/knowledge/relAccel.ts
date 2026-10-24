import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** REL-02 失效机理与加速模型：加速因子、激活能、电迁移、TDDB、Coffin-Manson；本课只做引用 */
export const REL_ACCEL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'acceleration-factor',
      term: 'Acceleration factor (AF)',
      name: loc('加速因子（AF）', 'Acceleration factor (AF)'),
      def: loc(
        '试验条件下的寿命与使用条件下寿命之比。等效使用小时 = 试验小时 × AF。温度用 Arrhenius 计算，温度循环用 Coffin-Manson，电压用 exp[γ(Vs − Vu)]。多个应力的 AF 相乘。见 {@relAccel}。',
        'The ratio of life under use conditions to life under stress conditions. Equivalent use hours = test hours × AF. Temperature uses Arrhenius, temperature cycling uses Coffin-Manson, and voltage uses exp[γ(Vs − Vu)]. AFs of several stresses multiply. See {@relAccel}.',
      ),
      lessons: ['relAccel'],
    },
    {
      id: 'activation-energy',
      term: 'Activation energy (Ea)',
      name: loc('激活能（Ea）', 'Activation energy (Ea)'),
      def: loc(
        '反应或失效过程需要克服的能垒，单位 eV。Ea 决定温度对速率的影响强弱：Arrhenius 中 AF = exp[(Ea/k)(1/Tu − 1/Ts)]。Ea 随机理而异，由数据确定，常有较大的不确定性。见 {@relAccel}。',
        'The energy barrier a reaction or failure process must cross, in eV. Ea sets how strongly temperature changes the rate: in Arrhenius, AF = exp[(Ea/k)(1/Tu − 1/Ts)]. Ea depends on the mechanism, is set by data, and is often uncertain. See {@relAccel}.',
      ),
      lessons: ['relAccel'],
    },
    {
      id: 'electromigration',
      term: 'Electromigration (EM)',
      name: loc('电迁移（EM）', 'Electromigration (EM)'),
      def: loc(
        '金属导线中电流把原子沿电子流方向搬运，导线逐渐变细、断开。寿命可用 Black 方程描述：MTTF = A·J⁻ⁿ·exp(Ea/kT)，J 为电流密度。见 {@relAccel}。',
        'Current in a metal line carries atoms along the electron flow, so the line thins and eventually opens. Its life can be described by Black’s equation: MTTF = A·J⁻ⁿ·exp(Ea/kT), where J is the current density. See {@relAccel}.',
      ),
      lessons: ['relAccel'],
    },
    {
      id: 'tddb',
      term: 'TDDB',
      name: loc('经时介质击穿（TDDB）', 'Time-dependent dielectric breakdown (TDDB)'),
      def: loc(
        '栅氧化层在长期电场下，缺陷逐渐积累并连成导电通路，最后击穿。它随温度（Arrhenius）与电压（指数）加速。见 {@relAccel}。',
        'Under a long-term electric field, a gate oxide accumulates defects that link into a conduction path and finally breaks down. It accelerates with temperature (Arrhenius) and voltage (exponential). See {@relAccel}.',
      ),
      lessons: ['relAccel'],
    },
    {
      id: 'coffin-manson',
      term: 'Coffin-Manson',
      name: loc('Coffin-Manson 模型', 'Coffin-Manson model'),
      def: loc(
        '温度循环疲劳寿命模型：N ∝ ΔT⁻ⁿ，加速因子 AF = (ΔTs / ΔTu)ⁿ。循环幅度 ΔT 越大，疲劳越快；它描述的是循环幅度，不是最高温度。见 {@relAccel}。',
        'A thermal-cycling fatigue model: N ∝ ΔT⁻ⁿ, with acceleration factor AF = (ΔTs / ΔTu)ⁿ. A larger swing ΔT fatigues faster; it describes the cycle swing, not the peak temperature. See {@relAccel}.',
      ),
      lessons: ['relAccel'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'rel-accel-ea-uncertainty',
      q: loc('激活能 Ea 不准，加速因子会差多少？', 'If Ea is not accurate, how much can the acceleration factor change?'),
      a: loc(
        'Ea 在指数里，误差会被放大。以 55 → 125 °C 为例，Ea = 0.7 eV 时 AF_T ≈ 77.7，Ea = 0.5 eV 时只有约 22.4。所以结论要带上 Ea 的范围，或用试验测出 Ea。见 {@relAccel}。',
        'Ea sits in the exponent, so errors are magnified. For 55 → 125 °C, AF_T ≈ 77.7 at Ea = 0.7 eV but only about 22.4 at Ea = 0.5 eV. Report conclusions with the Ea range, or measure Ea in a test. See {@relAccel}.',
      ),
      lessons: ['relAccel'],
    },
    {
      id: 'rel-accel-harsher-better',
      q: loc('加速试验是不是应力越大越好？', 'Is a harsher accelerated test always better?'),
      a: loc(
        '不是。应力过高会引入使用条件下不存在的失效机理，测到的是假失效；加速模型只在适用范围内成立。选应力要看它是否作用于目标机理，并保留在模型有效的范围内。见 {@relAccel}。',
        'No. Excessive stress introduces failure mechanisms that do not occur in use, so the test measures false failures; acceleration models only hold within their range. Choose stresses that act on the target mechanism and stay within the model’s validity. See {@relAccel}.',
      ),
      lessons: ['relAccel'],
    },
    {
      id: 'rel-accel-esd-no-af',
      q: loc('ESD 或闩锁试验能不能用 AF 换算成寿命？', 'Can ESD or latch-up results be converted to life with an AF?'),
      a: loc(
        '不能。ESD 与闩锁是阈值问题：冲击超过器件承受的阈值就坏，不随时间按温度慢慢累积。这类试验用阈值试验（HBM、CDM、闩锁试验）判断，不换算寿命。见 {@relAccel}。',
        'No. ESD and latch-up are threshold problems: the device fails once the shock exceeds its threshold, rather than building up slowly with time and temperature. They are judged by threshold tests (HBM, CDM, latch-up tests) and are not converted to life. See {@relAccel}.',
      ),
      lessons: ['relAccel'],
    },
  ],
}

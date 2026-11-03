import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** PWR-02 静态参数测试：BVdss、Idss / Igss、Vth、Rds(on) 的 force / measure，compliance 与自热 */
export const PWR_STATIC_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'bvdss',
      term: 'BVdss',
      name: loc('击穿电压（BVdss）', 'Breakdown voltage (BVdss)'),
      def: loc(
        '栅源短接（Vgs = 0）时，漏极电流达到规定的小电流（如 250 µA，示例）时的漏源电压。测法是强制电流、测电压，并用电压 compliance 限制击穿后的最高电压。见 {@pwrStatic}。',
        'The drain-source voltage at which, with Vgs = 0, the drain current reaches a specified small value (for example 250 µA, an example). Measured by forcing current and measuring voltage, with a voltage compliance capping the voltage after breakdown. See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
    {
      id: 'idss',
      term: 'Idss',
      name: loc('漏极漏电（Idss）', 'Drain leakage (Idss)'),
      def: loc(
        '栅源短接、漏源加规定比例的击穿电压时，流过漏极的电流。测法是强制 Vds、测电流；它随温度升高而增大（教学示意：每升高 10 °C 翻倍）。见 {@pwrStatic}。',
        'The current flowing into the drain with the gate shorted to the source and a specified fraction of the breakdown voltage across drain and source. Measured by forcing Vds and measuring current; it rises with temperature (teaching illustration: it doubles every 10 °C). See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
    {
      id: 'igss',
      term: 'Igss',
      name: loc('栅极漏电（Igss）', 'Gate leakage (Igss)'),
      def: loc(
        '漏源短接（Vds = 0）时，栅极加规定电压下流过的电流。测法是强制 Vgs、测电流。它和 Idss 不是同一个漏电：Idss 看漏极，Igss 看栅氧。见 {@pwrStatic}。',
        'The current into the gate at a specified Vgs with drain and source shorted (Vds = 0). Measured by forcing Vgs and measuring current. It is not the same leakage as Idss: Idss looks at the drain, Igss at the gate oxide. See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
    {
      id: 'compliance',
      term: 'Compliance',
      name: loc('compliance（限值）', 'Compliance (limit)'),
      def: loc(
        '仪器在强制某个量时，对另一个量设的上限：电压 compliance 限制 DUT 两端最高电压，电流 compliance 限制流过的最大电流。它保护 DUT 与仪器，同时也是读数的上限，读数等于它时说明已被截断。见 {@pwrStatic}。',
        'The upper limit an instrument sets on the other quantity while it forces one: a voltage compliance caps the voltage across the DUT, a current compliance caps the current. It protects the DUT and the instrument, and it also caps the reading: a reading equal to it means it was cut off. See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
    {
      id: 'self-heating',
      term: 'Self-heating',
      name: loc('自热', 'Self-heating'),
      def: loc(
        '器件在测试电流下耗散功率 P = I²·Rds(on)，使结温升高 ΔTj = P·Zth(t)。Rds(on) 随结温增大，所以直流测量会偏大；脉冲把脉宽压短，ΔTj 才小。见 {@pwrStatic}。',
        'The device dissipates P = I²·Rds(on) at the test current, raising the junction by ΔTj = P·Zth(t). Rds(on) grows with junction temperature, so DC measurement reads high; a short pulse keeps ΔTj small. See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
  ],
  extraLessons: {
    vth: ['pwrStatic'],
    'force-measure': ['pwrStatic'],
  },
  faqs: [
    {
      id: 'pwr-static-vth-id',
      q: loc('Vth 为什么报告时必须写明测试电流？', 'Why must a reported Vth state its test current?'),
      a: loc(
        'Vth 由测试电流 Id 定义：Id 越大，读出的 Vgs 越高（饱和区平方律，Vgs = Vth + √(2·Id/kp)）。本课实验里 Id 从 0.25 mA 到 2.5 mA，读数就会不同。所以数据手册和测试报告都要写明 Id，才能比较，见 {@pwrStatic}。',
        'Vth is defined by the test current Id: a larger Id gives a higher reading of Vgs (saturation square law, Vgs = Vth + √(2·Id/kp)). In this lesson Id from 0.25 mA to 2.5 mA gives different readings. Datasheets and reports must state Id before values can be compared. See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
    {
      id: 'pwr-static-pulse-why',
      q: loc('测 Rds(on) 为什么要用脉冲，不能用直流测？', 'Why measure Rds(on) with a pulse instead of DC?'),
      a: loc(
        '直流大电流持续发热，结温升 ΔTj 持续增大，Rds(on) 随之变大，误差 ≈ α·ΔTj。脉冲把脉宽压到毫秒以内，ΔTj 来不及升高，读数更接近 25 °C 真值。本课的单级模型中，50 A 下 10 ms 脉冲误差约 4%，1.7 ms 以内才低于 1%，见 {@pwrStatic}。',
        'DC at high current keeps heating the junction, so ΔTj keeps rising, Rds(on) grows and the error is about α·ΔTj. A pulse limited to milliseconds lets the junction stay close to the 25 °C value. In this lesson’s single-stage model, a 10 ms pulse at 50 A gives about 4% error, and the error is below 1% only up to about 1.7 ms. See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
    {
      id: 'pwr-static-leak-temp',
      q: loc('同一颗良品，为什么高温下测 Idss 会超过限值？', 'Why can a good die exceed the Idss limit when tested hot?'),
      a: loc(
        '漏电随温度升高而增大（教学示意：每升高 10 °C 翻倍）。25 °C 时 10 nA 的良品，125 °C 时约 10 µA，超过了 100 nA 的限值。所以限值必须和测试温度一起写，见 {@pwrStatic}。',
        'Leakage rises with temperature (teaching illustration: it doubles every 10 °C). A 10 nA good die at 25 °C is about 10 µA at 125 °C, which is far above a 100 nA limit. The limit must be stated together with the test temperature. See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
    {
      id: 'pwr-static-pulse-not-longer',
      q: loc('测 Rds(on) 时，脉宽是不是越长越准？', 'Is a longer pulse more accurate when measuring Rds(on)?'),
      a: loc(
        '不是。脉宽越长，ΔTj = P·Zth(t) 越大，Rds(on) 跟着漂，读数离 25 °C 真值越远。本课 50 A 下约 1.7 ms 以内误差才低于 1%，10 ms 大约 4%。要的是短到自热可接受、长到仪器来得及采样的窗口，不是最长脉宽。见 {@pwrStatic}。',
        'No. A longer pulse grows ΔTj = P·Zth(t), so Rds(on) drifts and the reading moves farther from the 25 °C value. In this lesson the error at 50 A stays below 1% only up to about 1.7 ms, and a 10 ms pulse is about 4%. The window should be short enough that self-heating is acceptable and long enough for the instrument to sample, not the longest pulse. See {@pwrStatic}.',
      ),
      lessons: ['pwrStatic'],
    },
  ],
}

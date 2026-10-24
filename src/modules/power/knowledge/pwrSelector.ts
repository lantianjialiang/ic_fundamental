import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** PWR-01 功率器件概述与基础：器件类型、额定耐压、Rds(on)、导通损耗与参数分类 */
export const PWR_SELECTOR_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'igbt',
      term: 'IGBT',
      name: loc('绝缘栅双极晶体管（IGBT）', 'Insulated-gate bipolar transistor (IGBT)'),
      def: loc(
        '栅极用 MOS 结构控制、导通时靠少子注入的功率器件。饱和压降 Vce(sat) 与电流关系不是欧姆式，低压小电流时压降偏大；关断时少子复合慢，有电流拖尾，开关频率高时损耗大。高压、大电流、低频场合有优势。见 {@pwrSelector}。',
        'A power device gated by a MOS structure that conducts through minority-carrier injection. Its saturation drop Vce(sat) does not follow Ohm’s law, so it is large at low current; turn-off has a current tail from slow recombination, so loss is high at high frequency. It suits high voltage, high current and low frequency. See {@pwrSelector}.',
      ),
      lessons: ['pwrSelector'],
    },
    {
      id: 'rds-on',
      term: 'Rds(on)',
      name: loc('导通电阻 Rds(on)', 'On-resistance Rds(on)'),
      def: loc(
        '功率 MOSFET 导通时漏源之间的等效电阻。同一工艺下，额定耐压越高，Rds(on) 越大（教学示意）；温度升高，Rds(on) 也增大。导通损耗 P = I²·Rds(on)。见 {@pwrSelector} 与 {@pwrStatic}。',
        'The equivalent resistance between drain and source when a power MOSFET is on. In one process, a higher rated voltage gives a higher Rds(on) (teaching illustration); Rds(on) also rises with temperature. Conduction loss is P = I²·Rds(on). See {@pwrSelector} and {@pwrStatic}.',
      ),
      lessons: ['pwrSelector', 'pwrStatic'],
    },
    {
      id: 'wbg-material',
      term: 'Wide bandgap',
      name: loc('宽禁带半导体（SiC、GaN）', 'Wide-bandgap semiconductor (SiC, GaN)'),
      def: loc(
        '禁带宽度远大于硅的材料。临界击穿场强高，同一耐压下漂移区可以更薄，Rds(on) 更低，还能耐高温、高频工作。SiC 多用于高压大功率，GaN 在 650 V 左右的高频场合常见。见 {@pwrSelector}。',
        'Materials with a much wider bandgap than silicon. The critical breakdown field is higher, so for the same rating the drift region can be thinner and Rds(on) lower; they also tolerate high temperature and high frequency. SiC is common in high-voltage, high-power parts, and GaN around 650 V in high-frequency designs. See {@pwrSelector}.',
      ),
      lessons: ['pwrSelector'],
    },
    {
      id: 'conduction-loss',
      term: 'Conduction loss',
      name: loc('导通损耗', 'Conduction loss'),
      def: loc(
        '器件导通时的发热。MOSFET 用 P = I²·Rds(on)，IGBT 用 I·Vce(sat)。它与开关频率无关，是低频大电流时的主要损耗。与开关损耗（½·V·I·t_sw·f，教学简化公式）相加就是总损耗。见 {@pwrSelector}。',
        'Heat dissipated while the device is on. A MOSFET uses P = I²·Rds(on), an IGBT uses I·Vce(sat). It does not depend on switching frequency and dominates at low frequency and high current. Added to switching loss (½·V·I·t_sw·f, a teaching-simplified formula) it gives the total. See {@pwrSelector}.',
      ),
      lessons: ['pwrSelector'],
    },
    {
      id: 'rated-voltage',
      term: 'Rated voltage',
      name: loc('额定耐压', 'Rated voltage'),
      def: loc(
        '数据手册给出的最高承受电压（MOSFET 的 BVdss，IGBT 的 Vces）。选型时要留出母线电压的 1.5～2 倍余量（教学经验），给开关过冲和线路尖峰留空间；工作电压贴着额定值是常见的失效原因。见 {@pwrSelector}。',
        'The highest voltage the datasheet guarantees the device can block (BVdss for a MOSFET, Vces for an IGBT). In selection, leave 1.5–2× the bus voltage (a teaching rule of thumb) for switching overshoot and line spikes; running at the rating is a common cause of failure. See {@pwrSelector}.',
      ),
      lessons: ['pwrSelector'],
    },
  ],
  extraLessons: {
    mosfet: ['pwrSelector'],
  },
  faqs: [
    {
      id: 'pwr-selector-low-rds',
      q: loc('Rds(on) 越小越好，为什么不直接选最小的？', 'Lower Rds(on) is better, so why not pick the smallest one?'),
      a: loc(
        'Rds(on) 小通常是靠加大芯片面积得到的，面积大意味着栅极电荷 Qg 与结电容也大，开关和驱动损耗随之增大，短路耐受也会变差。要在导通损耗、开关损耗、成本之间折中，见 {@pwrSelector}。',
        'A low Rds(on) usually comes from a larger die, and a larger die means more gate charge Qg and capacitance, so switching and drive loss rise and short-circuit withstand gets weaker. The right part trades conduction loss against switching loss and cost. See {@pwrSelector}.',
      ),
      lessons: ['pwrSelector'],
    },
    {
      id: 'pwr-selector-rating-margin',
      q: loc('工作电压 400 V，为什么额定耐压不能选 450 V？', 'With a 400 V working voltage, why not pick a 450 V rating?'),
      a: loc(
        '450 V 只有 1.1 倍余量，远低于教学经验的 1.5～2 倍。开关过冲和线路尖峰很容易超过额定值，器件会在瞬态里被击穿。400 V 母线常选 600～800 V 的器件，见 {@pwrSelector}。',
        'A 450 V rating gives only 1.1× margin, well below the teaching rule of 1.5–2×. Switching overshoot and line spikes can easily exceed the rating and break the device during a transient. A 400 V bus usually uses a 600–800 V class device. See {@pwrSelector}.',
      ),
      lessons: ['pwrSelector'],
    },
    {
      id: 'pwr-selector-igbt-vs-mos',
      q: loc('IGBT 一定比 MOSFET 好吗？', 'Is an IGBT always better than a MOSFET?'),
      a: loc(
        '不一定。IGBT 有饱和压降和关断拖尾，频率高时损耗大；MOSFET 在低压、高频场合 Rds(on) 低、没有拖尾。高压、大电流、低频的场合 IGBT 更有优势。选哪一种要看电压、电流与频率，见 {@pwrSelector}。',
        'Not necessarily. An IGBT has a saturation drop and a turn-off tail, so its loss is high at high frequency; a MOSFET has a low Rds(on) and no tail at low voltage and high frequency. At high voltage, high current and low frequency the IGBT has the advantage. Choose by voltage, current and frequency. See {@pwrSelector}.',
      ),
      lessons: ['pwrSelector'],
    },
  ],
}

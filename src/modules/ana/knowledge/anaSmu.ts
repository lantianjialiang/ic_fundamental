import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-04 PMU / SMU 的 FVMI、FIMV、限值与开短路测试：术语、已有词条的课程补充、常见问题 */
export const ANA_SMU_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'smu',
      term: 'SMU',
      name: loc('源表（SMU）', 'Source measure unit (SMU)'),
      def: loc(
        '对一个引脚既能强制加电压或电流，又能在同一引脚上测回电压或电流的仪器。本课用它做 FVMI 与 FIMV 两种模式，见 {@anaSmu}。',
        'An instrument that forces a voltage or a current on a pin and measures the voltage or current on that same pin. This lesson uses it in FVMI and FIMV modes; see {@anaSmu}.',
      ),
      lessons: ['anaSmu'],
    },
    {
      id: 'compliance-hit',
      term: 'Compliance',
      name: loc('限值触顶（Compliance）', 'Compliance limit hit'),
      def: loc(
        '源要输出的量超过设定的限值时，它不再输出理想值，而是停在限值上，这叫限值触顶。这时读到的是被截断的值，要先看是否触顶，再判断引脚，见 {@anaSmu}。',
        'When the value the source must output would exceed the set limit, it stops at the limit instead of the ideal value; this is compliance. The reading is then clipped, so check for compliance before judging the pin; see {@anaSmu}.',
      ),
      lessons: ['anaSmu'],
    },
    {
      id: 'open-circuit',
      term: 'Open circuit',
      name: loc('开路', 'Open circuit'),
      def: loc(
        '引脚与测试系统之间没有通路，电流为零；在负的小电流测试里，电压会一直升到电压限值。用这个现象判定开路，见 {@anaSmu}。',
        'A pin with no path to the test system: the current is zero, and in a small negative-current test the voltage runs up to the voltage limit. This behaviour is used to judge an open; see {@anaSmu}.',
      ),
      lessons: ['anaSmu'],
    },
  ],
  extraLessons: {
    pmu: ['anaSmu'],
    fvmi: ['anaSmu'],
    fimv: ['anaSmu'],
    clamp: ['anaSmu'],
    'opens-shorts': ['anaSmu'],
    'protection-diode': ['anaSmu'],
  },
  faqs: [
    {
      id: 'ana-smu-fvmi-or-fimv',
      q: loc('测一个引脚的开短路，该选 FVMI 还是 FIMV？', 'For an open/short check on a pin, should I use FVMI or FIMV?'),
      a: loc(
        '开短路测的是小电流下的电压响应，所以用 FIMV：强制电流、测电压。FVMI 适合测漏电：强制电压、测电流，关心的是很小的电流时用它。见 {@anaSmu}。',
        'An open/short check looks at the voltage produced by a small current, so use FIMV: force current, measure voltage. FVMI suits leakage: force voltage, measure current, when the small current is what matters; see {@anaSmu}.',
      ),
      lessons: ['anaSmu', 'pmu'],
    },
    {
      id: 'ana-smu-clamp-low',
      q: loc('限值设得太低，好引脚为什么会被判成开路？', 'Why is a good pin judged as open when the limit is set too low?'),
      a: loc(
        '好引脚在 −100 µA 下，电压约为 −0.65 V（保护二极管导通）。如果电压限值设成 0.5 V，源在 −0.5 V 处就触顶，读到的是被截断的值，于是被误判成开路。误判的原因是限值小于被测电压，不是引脚坏了；限值至少要设到 1 V，见 {@anaSmu}。',
        'On a good pin at −100 µA the voltage is about −0.65 V, because the protection diode conducts. If the voltage limit is set to 0.5 V, the source hits the clamp at −0.5 V and reads a clipped value, so the pin is misjudged as open. The cause is a limit smaller than the voltage being measured, not a bad pin; set the limit to at least 1 V; see {@anaSmu}.',
      ),
      lessons: ['anaSmu'],
    },
    {
      id: 'ana-smu-fvmi-open',
      q: loc('FVMI 下测到的电流是 0，是不是说明引脚一定开路？', 'In FVMI, the current reads 0. Does that mean the pin must be open?'),
      a: loc(
        '不一定。电流为 0 可能是开路，也可能只是强制电压设成了 0 V，好引脚也会读 0 A。要确认开路，应该改用 FIMV 加一个小电流，看电压是否触顶到限值，见 {@anaSmu}。',
        'Not necessarily. A current of 0 can mean an open, but it also happens when the forced voltage is simply 0 V, and a good pin also reads 0 A then. To confirm an open, switch to FIMV, force a small current and check whether the voltage hits the limit; see {@anaSmu}.',
      ),
      lessons: ['anaSmu', 'fOpens'],
    },
  ],
}

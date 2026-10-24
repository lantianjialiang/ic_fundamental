import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** REL-06 车规基础：AEC-Q100 框架、车规温度等级、三温测试，以及与三类标准的关系 */
export const REL_AUTO_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'aec-q100',
      term: 'AEC-Q100',
      name: loc('AEC-Q100（元器件认证框架）', 'AEC-Q100 (component qualification framework)'),
      def: loc(
        '汽车电子委员会发布的集成电路认证框架：用温度等级说明环境范围，用一组试验（A–G）说明要验证什么。它管的是元器件的可靠性认证，不等于功能安全。具体条件以现行标准为准。见 {@relAuto}。',
        'A published qualification framework for automotive integrated circuits: temperature grades state the ambient range, and groups of tests (A–G) state what must be verified. It covers component reliability qualification, not functional safety. Conditions follow the current standard. See {@relAuto}.',
      ),
      lessons: ['relAuto'],
    },
    {
      id: 'iso-26262',
      term: 'ISO 26262',
      name: loc('ISO 26262（功能安全）', 'ISO 26262 (functional safety)'),
      def: loc(
        '道路车辆的功能安全标准：分析系统级的故障，按 ASIL 等级提出安全要求，并覆盖随机硬件失效。它要求系统与软件层面的分析，单靠元器件认证无法满足。见 {@relAuto}。',
        'The functional safety standard for road vehicles: it analyses system-level faults, sets safety requirements by ASIL level, and covers random hardware failures. It requires system and software analysis, which component qualification alone cannot provide. See {@relAuto}.',
      ),
      lessons: ['relAuto'],
    },
    {
      id: 'iatf-16949',
      term: 'IATF 16949',
      name: loc('IATF 16949（汽车质量管理体系）', 'IATF 16949 (automotive quality management system)'),
      def: loc(
        '汽车行业的质量管理体系要求：管过程控制、变更通知、可追溯性与供应链质量。它规定的是体系与过程，不规定某个器件的温度或试验数值。见 {@relAuto}。',
        'The quality management system requirements for the automotive industry: process control, change notification, traceability and supply-chain quality. It sets requirements for systems and processes, not for a device’s temperature or test values. See {@relAuto}.',
      ),
      lessons: ['relAuto'],
    },
    {
      id: 'three-temp-test',
      term: 'Three-temperature Test',
      name: loc('三温测试', 'Three-temperature test'),
      def: loc(
        '在低温、室温、高温三个温度点各测一次，覆盖器件的温度范围两端。低温暴露冷启动与基准漂移，高温暴露漏电与精度漂移；温度点不覆盖等级的两端，对应的失效会漏掉。见 {@relAuto}。',
        'Testing at cold, room and hot temperatures to cover both ends of the device’s temperature range. Cold exposes cold-start and reference drift; hot exposes leakage and accuracy drift. Test points that miss an end of the grade let the matching failures through. See {@relAuto}.',
      ),
      lessons: ['relAuto'],
    },
    {
      id: 'auto-grade',
      term: 'Automotive Temperature Grade',
      name: loc('车规温度等级（Grade 0–3）', 'Automotive temperature grade (Grade 0–3)'),
      def: loc(
        '按安装位置的环境温度上限选等级。数字越小，上限越高、范围越宽，认证与测试成本越高；选择时取能覆盖需求的最窄等级。等级表是教学示例，以现行标准为准。见 {@relAuto}。',
        'Chosen from the installed location’s ambient maximum. A smaller number means a higher ceiling and a wider range, with higher qualification and test cost; choose the narrowest grade that still covers the need. The grade table is a teaching example; follow the current standard. See {@relAuto}.',
      ),
      lessons: ['relAuto'],
    },
  ],
  extraLessons: {
    'temperature-grade': ['relAuto'],
  },
  faqs: [
    {
      id: 'rel-auto-standards',
      q: loc('通过 AEC-Q100 就等于满足功能安全吗？', 'Does passing AEC-Q100 mean functional safety is met?'),
      a: loc(
        '不等于。AEC-Q100 是元器件可靠性认证的框架，讲温度等级与试验；功能安全要按 ISO 26262 做系统级的故障分析并定 ASIL 等级，质量体系与追溯则归 IATF 16949。三者分工不同，缺一不可。见 {@relAuto}。',
        'No. AEC-Q100 is the component reliability framework covering temperature grades and tests; functional safety needs a system-level fault analysis and ASIL levels under ISO 26262, and the quality system and traceability fall under IATF 16949. The three have different roles and none replaces another. See {@relAuto}.',
      ),
      lessons: ['relAuto'],
    },
    {
      id: 'rel-auto-grade-pick',
      q: loc('车规温度等级是不是越宽越好？', 'Is a wider automotive temperature grade always better?'),
      a: loc(
        '不是。等级数字越小范围越宽，但认证、测试与材料成本随之增加，超出需要的范围并不增加安全。应按安装位置的环境上限，选能覆盖需求的最窄等级。见 {@relAuto}。',
        'No. A smaller grade number gives a wider range, but qualification, test and material costs rise with it, and range beyond the need adds no safety. Pick the narrowest grade that covers the installed ambient maximum. See {@relAuto}.',
      ),
      lessons: ['relAuto'],
    },
    {
      id: 'rel-auto-three-temp',
      q: loc('三温测试的低温点为什么要覆盖到等级下限？', 'Why must the cold point of a three-temperature test reach the grade floor?'),
      a: loc(
        '冷启动、基准电压漂移和静态电流变化在最冷的点最明显。低温点只有覆盖到等级下限，才能证明器件在整个等级范围内都能工作；高温点同理要覆盖上限。见 {@relAuto}。',
        'Cold start, reference-voltage drift and quiescent-current change are most visible at the coldest point. Only a cold point that reaches the grade floor shows the device works across the whole grade range; the hot point must reach the ceiling for the same reason. See {@relAuto}.',
      ),
      lessons: ['relAuto'],
    },
  ],
}

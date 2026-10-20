import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-01 模拟芯片测试概述：术语、已有词条的课程补充、常见问题 */
export const ANA_OVERVIEW_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'min-typ-max',
      term: 'min / typ / max',
      name: loc('最小值 / 典型值 / 最大值', 'min / typ / max'),
      def: loc(
        '规格书每个参数的三列数。min 与 max 是判定限值，超出就 FAIL；typ 是典型条件下的设计中心，只作参考，不参与判定。',
        'The three columns of each datasheet parameter. min and max are the judgement limits; outside them is FAIL. typ is the design centre under typical conditions, for reference only, and takes no part in the verdict.',
      ),
      lessons: ['anaOverview'],
    },
    {
      id: 'test-conditions',
      term: 'Test conditions',
      name: loc('测试条件', 'Test conditions'),
      def: loc(
        '规格书里每一项后面写的 VDD、温度、负载、输入共模等条件。同一参数换条件，数值会变，所以测试项必须带上条件，结果才能复现和比较。',
        'The VDD, temperature, load and input common-mode written after each datasheet item. The same parameter gives different numbers under different conditions, so a test item must carry its conditions for results to be reproducible and comparable.',
      ),
      lessons: ['anaOverview'],
    },
    {
      id: 'vos',
      term: 'Vos',
      name: loc('输入失调电压', 'Input offset voltage'),
      def: loc(
        '让运放输出为零时，两个输入端之间需要的电压差。它直接决定直流精度的下限，是规格书里最基本的直流参数。',
        'The voltage difference between the two inputs needed to make the output zero. It sets the floor of DC accuracy and is one of the most basic DC parameters on a datasheet.',
      ),
      lessons: ['anaOverview'],
    },
    {
      id: 'analog-test',
      term: 'Analog test',
      name: loc('模拟测试', 'Analog test'),
      def: loc(
        '测连续量（增益、失调、噪声、基准电压）并与规格范围比较的测试。判定依赖精度与噪声底，而不只是 0 与 1，见 {@anaOverview}。',
        'Testing continuous quantities such as gain, offset, noise and reference voltage and comparing them with a spec range. The verdict depends on accuracy and noise floor, not just 0 and 1; see {@anaOverview}.',
      ),
      lessons: ['anaOverview'],
    },
  ],
  extraLessons: {
    datasheet: ['anaOverview'],
    limit: ['anaOverview'],
    'theta-ja': ['anaOverview'],
  },
  faqs: [
    {
      id: 'ana-typ-not-limit',
      q: loc('规格书里的 typ 能当测试限值用吗？', 'Can the typ value in a datasheet be used as a test limit?'),
      a: loc(
        '不能。typ 是典型条件下的设计中心，只用来看设计余量；判定限值只有 min 与 max。测得值在 min 与 max 之内，即使偏离 typ 很远也判 PASS。把 typ 当限值，会把本来合格的芯片判成 FAIL，见 {@anaOverview}。',
        'No. typ is the design centre under typical conditions and only shows the design margin; the judgement limits are min and max alone. A reading inside min and max passes even if it is far from typ. Using typ as a limit would fail good parts; see {@anaOverview}.',
      ),
      lessons: ['anaOverview', 'spec'],
    },
    {
      id: 'ana-every-item-ate',
      q: loc('规格书上的每一项都要在 ATE 上逐颗测吗？', 'Must every datasheet item be tested on ATE for every part?'),
      a: loc(
        '不必。关键的电性参数（失调、偏置电流、静态电流、基准电压等）要逐颗测，漏了就放过坏片。温漂这类表征项要在多个温度下扫描，只在表征阶段做；热阻靠热板测，不是 ATE 的电性项。哪一类放在哪里，见 {@anaOverview}。',
        'No. Key electrical parameters such as offset, bias current, quiescent current and reference voltage must be tested on every part, since missing one lets bad parts through. Characterization items such as drift are swept over temperature only during characterization, and thermal resistance comes from a thermal board rather than an ATE electrical test. See {@anaOverview} for which goes where.',
      ),
      lessons: ['anaOverview', 'spec'],
    },
  ],
}

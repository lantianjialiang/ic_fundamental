import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** REL-03 可靠性试验方法与样本量：零失效上限、置信度、等效器件小时 */
export const REL_STRESS_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'confidence-level',
      term: 'CL',
      name: loc('置信度（CL）', 'Confidence level (CL)'),
      def: loc(
        '上限成立的把握程度，常用 60% 或 90%。CL 越高，χ² 越大，算出的 FIT 上限越大、结论越保守。见 {@relStress}。',
        'How confident the bound is, usually 60% or 90%. A higher CL gives a larger χ², so the FIT bound is larger and the conclusion more conservative. See {@relStress}.',
      ),
      lessons: ['relStress'],
    },
    {
      id: 'zero-failure-test',
      term: 'Zero-failure test',
      name: loc('零失效试验', 'Zero-failure test'),
      def: loc(
        '试验中没有器件失效的抽样。它给出的是失效率上限 χ²(CL, 2)/(2·DH_eq)，不是零失效率；通过只说明上限达标。见 {@relStress}。',
        'A sample test with no failures. It gives a failure-rate upper bound χ²(CL, 2)/(2·DH_eq), not a zero failure rate; passing only shows the bound meets the target. See {@relStress}.',
      ),
      lessons: ['relStress'],
    },
    {
      id: 'equivalent-device-hours',
      term: 'Equivalent device hours',
      name: loc('等效器件小时', 'Equivalent device hours'),
      def: loc(
        '把试验换算到使用条件后的器件小时：DH_eq = n × h × AF。样本数、试验时间和加速因子三者的乘积决定了 FIT 上限能压到多低。见 {@relStress}。',
        'Device hours converted to use conditions: DH_eq = n × h × AF. The product of sample size, test time and acceleration factor sets how low the FIT bound can go. See {@relStress}.',
      ),
      lessons: ['relStress'],
    },
  ],
  extraLessons: {
    esd: ['relStress'],
    'latch-up': ['relStress'],
  },
  faqs: [
    {
      id: 'rel-stress-pass-not-zero',
      q: loc('试验零失效通过，是不是就说明 FIT 合格了？', 'If a test passes with zero failures, does that prove the FIT is within spec?'),
      a: loc(
        '不是。零失效只给出一个在所选置信度下的失效率上限，即 χ²(CL, 2)/(2·n·h·AF)。把这个上限和目标 FIT 比较，才能判断是否达标。通过不等于零失效率，见 {@relStress}。',
        'No. Zero failures give only a failure-rate bound at the chosen confidence, χ²(CL, 2)/(2·n·h·AF). Compare that bound with the target FIT to decide whether it meets spec. Passing does not mean a zero failure rate; see {@relStress}.',
      ),
      lessons: ['relStress'],
    },
    {
      id: 'rel-stress-cl-choice',
      q: loc('置信度 CL 是不是越高越好？', 'Is a higher confidence level always better?'),
      a: loc(
        'CL 越高，χ² 越大，同样的试验算出的 FIT 上限就越大，要达标就得更多样本或更长时间。CL 反映的是把握程度，要按产品要求和成本选，课程里用 60% 与 90% 做对比，示例以现行标准为准，见 {@relStress}。',
        'A higher CL makes χ² larger, so the same test gives a larger FIT bound, and meeting the target needs more samples or longer tests. CL is a statement of confidence, chosen from product requirements and cost; the lesson compares 60% and 90% as examples, follow the current standard. See {@relStress}.',
      ),
      lessons: ['relStress'],
    },
    {
      id: 'rel-stress-hast-model',
      q: loc('HAST 只按温度算加速因子，这样对吗？', 'Is it fine to compute the HAST acceleration factor from temperature alone?'),
      a: loc(
        '这里只是教学简化：课程只用温度的 Arrhenius 项算 AF，湿度项没有计入，实际的湿度加速要用专门的模型并以现行标准为准。见 {@relStress} 与 {@relAccel}。',
        'This is a teaching simplification: the lesson uses only the temperature Arrhenius term for AF and leaves out the humidity term. Real humidity acceleration needs a dedicated model, and the current standard governs. See {@relStress} and {@relAccel}.',
      ),
      lessons: ['relStress'],
    },
  ],
}

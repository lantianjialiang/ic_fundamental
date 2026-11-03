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
    {
      id: 'htol',
      term: 'HTOL',
      name: loc('高温工作寿命（HTOL）', 'High-temperature operating life (HTOL)'),
      def: loc(
        '器件在高温下加电工作一段时间，用来加速使用中的磨损机理。它给出的是失效率上限，不是“零失效”。条件是教学示例，以现行标准为准。见 {@relStress}。',
        'The device is biased and operated at high temperature for a stated time, to accelerate wear-out mechanisms that appear in use. It yields a failure-rate upper bound, not “zero failures”. Conditions are teaching examples; follow the current standard. See {@relStress}.',
      ),
      lessons: ['relStress'],
    },
    {
      id: 'htsl',
      term: 'HTSL',
      name: loc('高温存储寿命（HTSL）', 'High-temperature storage life (HTSL)'),
      def: loc(
        '器件在高温下不加电存放，加速与偏置无关的存储老化（如封装材料、金属界面）。它和 HTOL 的差别是有没有工作偏置。见 {@relStress}。',
        'The device is stored at high temperature with no bias, accelerating storage aging that does not need bias (package materials, metal interfaces). The difference from HTOL is the absence of operating bias. See {@relStress}.',
      ),
      lessons: ['relStress'],
    },
    {
      id: 'temp-cycle',
      term: 'Temperature cycling (TC)',
      name: loc('温度循环（TC）', 'Temperature cycling (TC)'),
      def: loc(
        '在高低温之间反复循环，用热膨胀差加速封装疲劳。加速用 Coffin-Manson，看的是温差幅度 ΔT，不是最高温度。见 {@relStress} 和 {@relAccel}。',
        'Repeated cycles between hot and cold, using thermal-expansion mismatch to accelerate package fatigue. Acceleration uses Coffin-Manson and looks at the swing ΔT, not the peak temperature. See {@relStress} and {@relAccel}.',
      ),
      lessons: ['relStress'],
    },
    {
      id: 'hast',
      term: 'HAST',
      name: loc('高加速温湿度应力（HAST）', 'Highly accelerated temperature and humidity stress (HAST)'),
      def: loc(
        '高温、高湿、常加压，加速潮气进入封装引起的腐蚀或漏电。本课的 AF 只算温度项，湿度项是教学简化，未计入。见 {@relStress}。',
        'High temperature, high humidity and often bias, to accelerate moisture entering the package and causing corrosion or leakage. This lesson’s AF uses only the temperature term; the humidity term is left out as a teaching simplification. See {@relStress}.',
      ),
      lessons: ['relStress'],
    },
    {
      id: 'elfr',
      term: 'ELFR',
      name: loc('早期失效率试验（ELFR）', 'Early life failure rate (ELFR)'),
      def: loc(
        '用较短的加电应力估计早期失效率，对准浴盆曲线的下降段，不是磨损寿命。它和 Burn-in 都针对早期失效，但 ELFR 是鉴定抽样，Burn-in 是量产筛选。见 {@relStress} 和 {@relBurnIn}。',
        'A short biased stress used to estimate the early-life failure rate. It targets the falling infant-mortality segment of the bathtub, not wear-out life. Both ELFR and burn-in address early failures, but ELFR is a qualification sample and burn-in is a production screen. See {@relStress} and {@relBurnIn}.',
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
    {
      id: 'rel-stress-sample-not-bigger',
      q: loc('样本量是不是越大越好？', 'Is a larger sample always better?'),
      a: loc(
        '上限会随 n 变紧，但时间和夹具成本也线性上升。零失效公式里 n 和试验小时、AF 一起进分母，该用多少由目标 FIT、CL 和预算共同决定，不是越多越安全。见 {@relStress}。',
        'The bound tightens with n, but time and fixture cost rise in proportion. In the zero-failure formula n shares the denominator with hours and AF. How many units you need is set by the target FIT, the CL and the budget, not by “more is safer”. See {@relStress}.',
      ),
      lessons: ['relStress'],
    },
  ],
}

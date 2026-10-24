import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** REL-01 可靠性基础与浴盆曲线：失效率、FIT、MTTF、可靠度、早期与磨损失效；浴盆曲线、Burn-in 只追加课程引用 */
export const REL_BATHTUB_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'failure-rate',
      term: 'Failure rate',
      name: loc('失效率 λ(t)', 'Failure rate λ(t)'),
      def: loc(
        '在时间 t 仍然存活的器件，单位时间内失效的比例，也叫风险函数。失效率恒定时，寿命服从指数分布，λ 就是一个常数。见 {@relBathtub}。',
        'The fraction of devices still working at time t that fail per unit time; also called the hazard function. When the failure rate is constant, lifetime is exponential and λ is a constant. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
    {
      id: 'fit',
      term: 'FIT',
      name: loc('FIT（每十亿器件小时失效数）', 'FIT (failures per 10⁹ device-hours)'),
      def: loc(
        'FIT = 每 10⁹ 器件小时的失效数，是失效率的常用单位。例如 100 FIT 表示 10⁹ 颗器件工作一小时只失效 100 颗（或 10⁹ 小时内失效 100 颗）。换算到 /h 要除以 10⁹。见 {@relBathtub}。',
        'FIT = failures per 10⁹ device-hours, the usual unit of failure rate. For example, 100 FIT means 100 failures in 10⁹ device-hours. To convert to /h, divide by 10⁹. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
    {
      id: 'mttf',
      term: 'MTTF',
      name: loc('平均失效前时间（MTTF）', 'Mean time to failure (MTTF)'),
      def: loc(
        '群体寿命的平均值。失效率恒定时 MTTF = 1/λ，换成 FIT 为 10⁹ / FIT（小时）。MTTF 不是“能用多久”：R(MTTF) = e⁻¹ ≈ 0.37，约 63% 已失效。见 {@relBathtub}。',
        'The mean of the population lifetime. With a constant failure rate, MTTF = 1/λ, which in FIT is 10⁹ / FIT hours. MTTF is not “how long it lasts”: R(MTTF) = e⁻¹ ≈ 0.37, so about 63% have already failed. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
    {
      id: 'reliability',
      term: 'Reliability R(t)',
      name: loc('可靠度 R(t)', 'Reliability R(t)'),
      def: loc(
        '到时间 t 仍在正常工作的比例：R(t) = exp(−∫λ dt)。λ 恒定时 R(t) = exp(−λt)。R 随时间单调下降。见 {@relBathtub}。',
        'The fraction still working at time t: R(t) = exp(−∫λ dt). With constant λ, R(t) = exp(−λt). R decreases monotonically with time. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
    {
      id: 'infant-mortality',
      term: 'Infant mortality',
      name: loc('早期失效', 'Infant mortality'),
      def: loc(
        '投入使用的前期，由潜在缺陷引起的失效，失效率随时间下降（Weibull β < 1）。Burn-in 与 ELFR 主要针对这一段。见 {@relBathtub}。',
        'Failures in the early life of a product, caused by latent defects; the failure rate falls with time (Weibull β < 1). Burn-in and ELFR mainly target this segment. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
    {
      id: 'wear-out',
      term: 'Wear-out',
      name: loc('磨损失效', 'Wear-out failure'),
      def: loc(
        '老化机理随时间累积造成的失效，失效率随时间上升（Weibull β > 1）。它在使用后期才明显，短时间的筛选覆盖不到，要靠寿命试验或外推。见 {@relBathtub}。',
        'Failures from aging mechanisms that accumulate over time; the failure rate rises with time (Weibull β > 1). It becomes significant late in life and cannot be reached by short screening; life tests or extrapolation are needed. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
  ],
  extraLessons: {
    'bathtub-curve': ['relBathtub'],
    'burn-in': ['relBathtub'],
  },
  faqs: [
    {
      id: 'rel-bathtub-mttf-life',
      q: loc('MTTF 是不是产品的寿命？', 'Is MTTF the product’s lifetime?'),
      a: loc(
        '不是。MTTF 是群体的平均值。失效率恒定时 MTTF = 1/λ，到 MTTF 时 R = e⁻¹ ≈ 0.37，约 63% 的器件已经失效，个别器件可能远早于它。要说“能用多久”，应给出可靠度（如 5 年的 R）或 B10 寿命。见 {@relBathtub}。',
        'No. MTTF is the average over a population. With a constant failure rate MTTF = 1/λ, and at MTTF R = e⁻¹ ≈ 0.37, so about 63% have failed; some devices fail much earlier. To say how long a part lasts, state a reliability at a time (such as R at 5 years) or a B10 life. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
    {
      id: 'rel-bathtub-fit-mttf',
      q: loc('FIT 怎样换成 MTTF？', 'How do I convert FIT to MTTF?'),
      a: loc(
        '在失效率恒定（随机段）时，MTTF(h) = 10⁹ / FIT。例如 100 FIT 对应 MTTF = 10⁷ h，约 1141 年。注意这是平均值的换算，不代表每颗器件都能用这么久。见 {@relBathtub}。',
        'In the constant-failure-rate (random) segment, MTTF(h) = 10⁹ / FIT. For example, 100 FIT gives MTTF = 10⁷ h, about 1141 years. This is an average conversion and does not mean every device lasts that long. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
    {
      id: 'rel-bathtub-yield-reliability',
      q: loc('良率很高，为什么还会出现早期失效？', 'Yield is high, so why do early failures still happen?'),
      a: loc(
        '良率只统计出厂时通过测试的比例。潜在缺陷可以通过测试，在使用的前几百小时里才暴露，这就是早期失效。出厂测试抓的是可测的缺陷；要降低这部分风险，要靠 Burn-in 或统计筛选。见 {@relBathtub}。',
        'Yield only counts the parts that pass test at shipment. Latent defects can pass test and show up only during the first few hundred hours of use, which is infant mortality. Production test catches testable defects; burn-in or statistical screening is needed to cut this risk. See {@relBathtub}.',
      ),
      lessons: ['relBathtub'],
    },
  ],
}

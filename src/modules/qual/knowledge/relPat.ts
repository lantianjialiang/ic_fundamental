import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** REL-07 零缺陷测试策略：PAT、稳健限值与邻近规则 */
export const REL_PAT_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'part-average-testing',
      term: 'PAT',
      name: loc('零件平均测试（统计筛选）', 'Part average testing (statistical screening)'),
      def: loc(
        '不看规格，只看同一批 die 的参数分布，用动态限值（median ± k·σ_rob）把偏离群体中心的 die 挑出来，抓规格内的潜在缺陷。限值可按 Lot、晶圆或 Site 分开算。见 {@relPat}。',
        'Ignores the spec and looks at the parameter distribution of the same lot. Dynamic limits (median ± k·σ_rob) pick out dies far from the population centre, catching latent defects that sit inside spec. Limits can be set per lot, per wafer or per site. See {@relPat}.',
      ),
      lessons: ['relPat'],
    },
    {
      id: 'robust-sigma',
      term: 'σ_rob',
      name: loc('稳健标准差（1.4826 × MAD）', 'Robust sigma (1.4826 × MAD)'),
      def: loc(
        '由中位数绝对偏差 MAD 估出的标准差：σ_rob = 1.4826 × MAD。少数离群值不会把它拉大，正态分布下与标准差大致相当。PAT 的限值用它来算。见 {@relPat}。',
        'A standard deviation estimated from the median absolute deviation: σ_rob = 1.4826 × MAD. A few outliers do not inflate it, and under a normal distribution it roughly matches the standard deviation. PAT limits are built from it. See {@relPat}.',
      ),
      lessons: ['relPat'],
    },
    {
      id: 'good-die-in-bad-neighborhood',
      term: 'Good die in bad neighborhood',
      name: loc('坏邻域中的好 die（邻近规则）', 'Good die in bad neighborhood (neighbourhood rule)'),
      def: loc(
        '晶圆上一颗未失效的 die，若其半径 r 内的失效 die 数 ≥ m，就被额外剔除。利用潜在缺陷聚集的空间相关性；m 太小会误剔大量附近的好 die。见 {@relPat}。',
        'A die that has not failed is removed if at least m failing dies lie within radius r on the wafer. It uses the spatial clustering of latent defects; too small an m removes many nearby good die. See {@relPat}.',
      ),
      lessons: ['relPat'],
    },
  ],
  extraLessons: {
    wafer: ['relPat'],
    die: ['relPat'],
    yield: ['relPat'],
    stdf: ['relPat'],
  },
  faqs: [
    {
      id: 'rel-pat-median-mad',
      q: loc('PAT 为什么用中位数和 MAD，而不用平均值和标准差？', 'Why does PAT use the median and MAD rather than the mean and standard deviation?'),
      a: loc(
        '平均值和标准差都会被少数离群值拉偏：一颗参数 50 的 die 会把均值拉高、标准差放大，限值变宽，潜在缺陷就被掩盖。中位数与 MAD 只看“中间”的数据，几颗离群值不影响它们。σ_rob = 1.4826 × MAD 在正态分布下与标准差大致相当，所以 k 的含义仍然直观。示例数据与计算见 {@relPat}，统计基础见 {@anaStats}。',
        'The mean and standard deviation are both pulled by a few outliers: one die at 50 raises the mean and inflates the standard deviation, widening the limits and hiding latent defects. The median and MAD depend only on the middle of the data, so a few outliers do not move them. Under a normal distribution σ_rob = 1.4826 × MAD roughly matches the standard deviation, so k keeps its usual meaning. The worked example is in {@relPat}; the statistics basics are in {@anaStats}.',
      ),
      lessons: ['relPat', 'anaStats'],
    },
    {
      id: 'rel-pat-k-tradeoff',
      q: loc('PAT 的 k 取多少才对？', 'What value of PAT k is right?'),
      a: loc(
        'k 没有放之四海而皆准的值。k 越小，限值越窄，潜在缺陷更容易被抓到，但正常分布的尾部好 die 也更容易被误剔（良率损失）。3–8 只是示例范围，实际取值要看潜在缺陷的偏移、良率目标和各公司规程。在 {@relAuto} 的车规语境里，PAT 与 Burn-in、邻近规则一起用，单靠 k 调不出最优解。见 {@relFlow}。',
        'There is no universal k. A smaller k narrows the limit, so latent defects are caught more often, but good dies in the normal tails are also removed more often (yield loss). 3–8 is only an example range; the real value depends on the latent-defect shift, the yield target and each company’s procedure. In the automotive setting of {@relAuto}, PAT is used together with burn-in and the neighbourhood rule, and no single k is the optimum. See {@relFlow}.',
      ),
      lessons: ['relPat', 'relAuto', 'relFlow'],
    },
    {
      id: 'rel-pat-window',
      q: loc('限值按整 Lot、单晶圆还是每 Site 算？', 'Should limits be set per whole lot, per wafer or per site?'),
      a: loc(
        '看偏移来自哪里。整 Lot 窗口假定同批晶圆分布一致，样本多、限值稳，但片与片之间有偏移时，偏高或偏低的晶圆会被系统性误剔。单晶圆窗口以本片为中心，能消掉片间偏移，但样本只有一片，限值噪声大。每 Site 窗口能抓测试座之间的差异。实际产线常几种同时用，见 {@relPat}。',
        'It depends on where the offset comes from. A whole-lot window assumes the wafers share one distribution: it is stable, but when wafers differ, the high or low ones are systematically over-killed. A single-wafer window centres on the wafer and removes wafer-to-wafer offset, but one wafer gives a noisy limit. A per-site window catches differences between test sites. Production lines often combine several; see {@relPat}.',
      ),
      lessons: ['relPat'],
    },
  ],
}

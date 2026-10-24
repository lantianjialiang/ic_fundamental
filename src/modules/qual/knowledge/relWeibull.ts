import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** REL-04 寿命数据分析：Weibull 分布、截尾数据、B10 寿命与外推 */
export const REL_WEIBULL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'weibull-distribution',
      term: 'Weibull distribution',
      name: loc('威布尔分布', 'Weibull distribution'),
      def: loc(
        '两参数寿命分布 F(t) = 1 − exp[−(t/η)^β]：形状 β 决定失效率随时间的走向（β<1 早期、β=1 随机、β>1 磨损），尺度 η 是 63.2% 失效时的时间。画在 Weibull 概率图上是一条直线，斜率为 β。见 {@relWeibull}。',
        'A two-parameter life distribution F(t) = 1 − exp[−(t/η)^β]: the shape β sets how the failure rate changes with time (β<1 early, β=1 random, β>1 wear-out), and the scale η is the time at 63.2% failure. On a Weibull probability plot it is a straight line with slope β. See {@relWeibull}.',
      ),
      lessons: ['relWeibull'],
    },
    {
      id: 'censored-data',
      term: 'Censored data',
      name: loc('截尾数据（右删失）', 'Censored data (right-censored)'),
      def: loc(
        '试验结束或截止时间到了仍未失效的器件数据。它只说明“活过了这个时间”，不计入失效数，也不画成失效点，但占据顺序位置。把它当作失效或直接删掉，都会把寿命估低。见 {@relWeibull}。',
        'Data from units still working at the end of the test or at the cutoff time. It only says “survived this long”: it is not counted as a failure or plotted as one, but it keeps its place in the order. Treating it as a failure or deleting it both bias the life low. See {@relWeibull}.',
      ),
      lessons: ['relWeibull'],
    },
    {
      id: 'b10-life',
      term: 'B10 life',
      name: loc('B10 寿命', 'B10 life'),
      def: loc(
        '10% 器件失效时的时间：t = η·(−ln 0.9)^(1/β)。它是可靠性规格里常用的寿命指标；用于使用条件时，要先把应力下的 η 乘以加速因子。见 {@relWeibull}。',
        'The time at which 10% of units have failed: t = η·(−ln 0.9)^(1/β). It is a common life figure in reliability specs; for use conditions, first multiply the stress η by the acceleration factor. See {@relWeibull}.',
      ),
      lessons: ['relWeibull'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'rel-weibull-few-samples',
      q: loc('失效数很少时，Weibull 拟合还能用吗？', 'Can a Weibull fit be used when there are only a few failures?'),
      a: loc(
        '能算出数字，但误差可能很大。样本少时 β、η 的标准误差大，拟合线的斜率几乎由几个点决定。要同时看误差范围，并增加样本或延长试验，见 {@relWeibull}。',
        'You can compute numbers, but the error may be large. With few samples the standard errors of β and η are big and the slope is set by a handful of points. Look at the error range, and add units or test time. See {@relWeibull}.',
      ),
      lessons: ['relWeibull'],
    },
    {
      id: 'rel-weibull-censor-handling',
      q: loc('截尾数据要怎么处理？能直接删掉吗？', 'How should censored data be handled? Can I just delete it?'),
      a: loc(
        '不能直接删掉。删掉的是长寿命的器件，剩下的全是短寿命样本，寿命会被估低。正确做法是按右删失处理：截尾点不当作失效，但仍占据顺序位置，使后面失效点的秩被正确抬高。见 {@relWeibull}。',
        'Do not simply delete them. Deleting removes the long-lived units and leaves only short-lived samples, which biases the life low. The right approach is right-censoring: censored units are not counted as failures, but they keep their place in the order so later failures get the correct ranks. See {@relWeibull}.',
      ),
      lessons: ['relWeibull'],
    },
    {
      id: 'rel-weibull-extrapolate',
      q: loc('应力试验的寿命能直接当使用寿命吗？', 'Can the stress-test life be used directly as the use life?'),
      a: loc(
        '不能直接当。应力条件下的 η 要乘以加速因子 AF 才是使用条件下的 η，B10 等指标也要按同一个 AF 换算。外推还假设应力下与使用下是同一种失效机理，见 {@relWeibull} 与 {@relAccel}。',
        'No. The stress η must be multiplied by the acceleration factor AF to get the use η, and B10 and similar figures are converted with the same AF. Extrapolation also assumes the same failure mechanism at stress and at use. See {@relWeibull} and {@relAccel}.',
      ),
      lessons: ['relWeibull'],
    },
  ],
}

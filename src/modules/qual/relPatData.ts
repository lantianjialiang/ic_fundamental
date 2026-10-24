import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  NBR_IDS,
  COLOR_IDS,
  SAMPLE_DATA,
  TARGET_CAPTURE,
  TARGET_YIELD_LOSS,
  WAFER_IDS,
  WINDOW_IDS,
  type ColorId,
  type NbrId,
  type Outcome,
  type PatRun,
  type PatState,
  type WindowId,
  samplePat,
  waferCounts,
} from './relPatModel'

/**
 * 把 {0}、{1} … 换成数字或双语片段。
 * 每种语言分别替换：LText 参数取对应语言的文字（如窗口名称），数字与字符串两种语言相同。
 */
export function fill(text: LText, ...vals: Array<string | number | LText>): LText {
  const sub = (tpl: string, pick: (v: string | number | LText) => string) =>
    vals.reduce<string>((acc, v, i) => acc.split(`{${i}}`).join(pick(v)), tpl)
  const zhOf = (v: string | number | LText) => (typeof v === 'object' ? v.zh : String(v))
  const enOf = (v: string | number | LText) => (typeof v === 'object' ? (v.en ?? v.zh) : String(v))
  return loc(sub(text.zh, zhOf), sub(text.en ?? text.zh, enOf))
}

export const WINDOW_LABEL: Record<WindowId, LText> = {
  lot: loc('整 Lot', 'Whole lot'),
  wafer: loc('单晶圆', 'Single wafer'),
  site: loc('每 Site', 'Per site'),
}

export const WINDOW_SEG = WINDOW_IDS.map((id) => ({ id, label: WINDOW_LABEL[id] }))
export const WAFER_SEG = WAFER_IDS.map((id) => ({ id, label: fill(loc('第 {0} 片', 'Wafer {0}'), id) }))
export const NBR_SEG: Array<{ id: NbrId; label: LText }> = [
  { id: NBR_IDS[0], label: loc('关', 'Off') },
  { id: NBR_IDS[1], label: loc('开', 'On') },
]
export const COLOR_SEG: Array<{ id: ColorId; label: LText }> = [
  { id: COLOR_IDS[0], label: loc('判定', 'Outcome') },
  { id: COLOR_IDS[1], label: loc('参数值', 'Parameter') },
]

export const S = {
  kickerNow: loc('这一次 Lot', 'This lot'),
  introTitle: loc('规格内的坏 die 怎样找出来', 'Finding bad dies that sit inside spec'),
  coreTitle: loc('拨一拨：动态限值与邻近规则', 'Try it: dynamic limits and the neighbourhood rule'),
  coreNote: loc(
    '一个 Lot 有 8 片晶圆，每片约 300 颗 die。潜在缺陷的参数在规格内，但偏离群体中心；PAT 用中位数与 MAD 算限值，把它们挑出来。颜色里的“真值”只用于检查结果，PAT 本身看不到。PAT 系数 k 的 3–8 为示例，以现行标准为准。',
    'A lot has 8 wafers of about 300 die each. Latent defects sit inside spec but away from the population centre; PAT uses the median and MAD to set limits and picks them out. The truth labels and the colours are for checking the result only; PAT itself never sees them. The PAT factor k range of 3–8 is an example; follow the current standard.',
  ),
  meanLabel: loc('参数均值 μ', 'Parameter mean μ'),
  sigmaLabel: loc('参数标准差 σ（正常散布）', 'Parameter sigma σ (normal spread)'),
  latentLabel: loc('潜在缺陷比例', 'Latent defect ratio'),
  clusterLabel: loc('聚簇概率（空间集中）', 'Cluster probability (spatial clumping)'),
  shiftLabel: loc('潜在缺陷偏移（以 σ 计）', 'Latent defect shift (in σ)'),
  kLabel: loc('PAT 系数 k：限值 = 中位数 ± k·σ_rob', 'PAT factor k: limit = median ± k·σ_rob'),
  windowLabel: loc('计算窗口', 'Limit window'),
  waferLabel: loc('显示的晶圆', 'Wafer shown'),
  nbrLabel: loc('邻近规则', 'Neighbourhood rule'),
  radiusLabel: loc('半径 r（die 间距）', 'Radius r (die pitch)'),
  minLabel: loc('失效邻居数阈值 m', 'Failing-neighbour threshold m'),
  colorLabel: loc('晶圆图着色', 'Wafer map colour'),
  rPat: loc('PAT 剔除数（整 Lot）', 'PAT removed (whole lot)'),
  rCapture: loc('潜在缺陷捕获（捕获数 / 总数）', 'Latent defects caught (caught / total)'),
  rYield: loc('良率损失（好 die 被误剔）', 'Yield loss (good die removed)'),
  rEscape: loc('漏检（逃逸）潜在缺陷', 'Escapes (latent defects missed)'),
  rNbr: loc('邻近规则额外剔除', 'Extra removed by the neighbourhood rule'),
  rLotLim: loc('整 Lot 限值 [下, 上]', 'Whole-lot limits [low, high]'),
  rWaferLim: loc('本片单独算的限值 [下, 上]', 'This wafer alone [low, high]'),
  rShift: loc('本片中位数偏离整 Lot（÷ σ_rob）', 'Wafer median offset from the lot (÷ σ_rob)'),
  mapAria: loc('晶圆图：每颗 die 的判定或参数值', 'Wafer map: each die’s outcome or parameter value'),
  histAria: loc('参数直方图与限值线', 'Parameter histogram with limit lines'),
  histCap: loc(
    '横轴为参数值（µA，教学示意）。蓝为好 die，橙为潜在缺陷（真值，仅供检查）。规格限远在图外（±10σ），所以所有 die 都在规格内；线是当前窗口算出的限值。',
    'Horizontal axis: parameter value (µA, teaching illustration). Blue = good die, orange = latent defect (truth, for checking only). Spec limits lie far outside the plot (±10σ), so every die is inside spec; the lines are the limits from the current window.',
  ),
  legGood: loc('好 die', 'Good die'),
  legLatent: loc('潜在缺陷（真值）', 'Latent defect (truth)'),
  legLot: loc('整 Lot 限值', 'Whole-lot limit'),
  legWafer: loc('本片限值', 'Wafer limit'),
  legSite: loc('测试座 {0}', 'Site {0}'),
  paramLegend: loc(
    '颜色越红，参数越高（相对整 Lot 中位数，按 σ_rob 计）；灰色为硬失效。',
    'Redder means a higher parameter (relative to the lot median, in σ_rob); grey marks hard fails.',
  ),
  waferSummary: loc(
    '第 {0} 片：{1} 颗 die，PAT 剔除 {2}，邻近规则额外剔除 {3}，潜在缺陷 {4} 颗，其中漏检 {5} 颗。',
    'Wafer {0}: {1} die, PAT removed {2}, neighbourhood rule removed {3} more, {4} latent defects of which {5} missed.',
  ),
  dieLabel: loc(
    '第 {0} 行 第 {1} 列，参数 {2} µA，判定：{3}，真值：{4}',
    'Row {0}, column {1}, parameter {2} µA, outcome: {3}, truth: {4}',
  ),
  truthLatent: loc('潜在缺陷', 'latent defect'),
  truthGood: loc('好 die', 'good die'),
  truthHard: loc('硬失效', 'hard fail'),
  handTitle: loc('手算练习：示例数据', 'Hand calculation: sample data'),
  handNote: loc(
    '先排序取中位数；再算每个值与中位数的偏差，取偏差的中位数得到 MAD；σ_rob = 1.4826 × MAD。在下面填入你算出的中位数与 MAD，对了会显示“正确”。',
    'Sort the values and take the middle one for the median; then take each value’s distance from the median and take the median of those distances for the MAD; σ_rob = 1.4826 × MAD. Enter your median and MAD below; the check marks them correct.',
  ),
  handMedianLabel: loc('中位数', 'Median'),
  handMadLabel: loc('MAD', 'MAD'),
  handOk: loc('正确', 'Correct'),
  handTry: loc('再算一次', 'Try again'),
  handEmpty: loc('未填', 'Not entered'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的 PAT 会按产品、晶圆与 Site 分开设限，还要和统计 Bin 限值（SBL）、良率监控一起用；这里只练中位数、MAD、窗口与邻近规则的取舍。',
    'Real PAT sets limits per product, wafer and site, and works alongside statistical bin limits (SBL) and yield monitoring; here we practise only the median, the MAD, the window and the trade-off of the neighbourhood rule.',
  ),
  next: loc('下一课：综合量产流程', 'Next: Capstone production flow'),
  vOk: loc('两项都达标', 'Both targets met'),
  vLoose: loc('限值太宽，漏检多', 'Limits too loose, too many escapes'),
  vTight: loc('限值太窄，良率损失超标', 'Limits too tight, yield loss over target'),
  vBoth: loc('两项都没达标', 'Neither target met'),
  nbrNote: loc(
    '邻近规则已开：额外剔除 {0} 颗（好 die 与潜在缺陷合计）。它只看附近的失效数，所以失效簇周围的好 die 会被一起剔除；m 取 1 时尤其明显。',
    'Neighbourhood rule on: {0} extra dies removed (good dies and latent defects together). It looks only at nearby failures, so good dies around failure clusters are removed too; m = 1 makes this especially strong.',
  ),
  windowNote: loc(
    '窗口是{0}：限值以本片（或本 site）的中位数为中心。本片中位数偏离整 Lot {1} σ_rob，整 Lot 限值会对这片的好 die 产生系统偏向。',
    'The window is {0}: limits centre on this wafer’s (or site’s) median. This wafer’s median sits {1} σ_rob from the lot median, so the whole-lot limit biases this wafer’s good die one way.',
  ),
}

export const CAT: Record<Outcome, LText> = {
  spec: loc('规格失效（硬失效）', 'Spec fail (hard)'),
  'pat-latent': loc('PAT 抓到', 'Caught by PAT'),
  'pat-good': loc('PAT 误剔', 'PAT over-kill'),
  'nbr-latent': loc('邻近规则抓到', 'Caught by the neighbourhood rule'),
  'nbr-good': loc('邻近规则误剔', 'Neighbourhood over-kill'),
  escape: loc('漏检', 'Escape (missed)'),
  pass: loc('通过', 'Pass'),
}

export const INTRO: LText[] = [
  loc(
    '规格内的 die 也可能是坏的。潜在缺陷（latent defect）的参数偏离群体中心，但没有超过规格限，所以普通的规格测试会放过它们。零件平均测试（PAT）不看规格，只看同一批 die 的分布，把偏离中心很远的挑出来。车规产品对这类“规格内坏品”的要求更严，见 {@relAuto}。',
    'Dies inside spec can still be bad. A latent defect has a parameter pulled away from the population centre but not past the spec limit, so ordinary spec testing lets it through. Part average testing (PAT) ignores the spec and looks at the distribution of the same lot, picking out dies far from the centre. Automotive products are held to a stricter standard for these in-spec bad parts; see {@relAuto}.',
  ),
  loc(
    'PAT 的限值用稳健统计：中位数与 MAD（中位数绝对偏差），σ_rob = 1.4826 × MAD。这两个量不被少数离群值拉偏，在正态分布下 σ_rob 与标准差大致相当。限值 = 中位数 ± k·σ_rob，k 常取 3–8（示例值，以各公司规程为准）。统计的基础见 {@anaStats}。',
    'PAT limits use robust statistics: the median and the MAD (median absolute deviation), with σ_rob = 1.4826 × MAD. Neither is pulled by a few outliers, and under a normal distribution σ_rob roughly matches the standard deviation. Limit = median ± k·σ_rob, with k often 3–8 (example values; follow each company’s procedure). The statistics basics are in {@anaStats}.',
  ),
  loc(
    '邻近规则（good die in bad neighborhood）利用空间相关：潜在缺陷常聚在一起，失效 die 附近的好 die 也可疑，所以半径 r 内的失效数 ≥ m 时就剔除。PAT 的数据依赖晶圆坐标与参数记录（STDF 的 PTR 与坐标字段），见 {@genStdf}。',
    'The neighbourhood rule (good die in bad neighborhood) uses spatial correlation: latent defects tend to cluster, so a good die near failures is suspect too. If at least m failures fall within radius r, the die is removed. PAT depends on wafer coordinates and parameter records (STDF PTR and coordinate fields); see {@genStdf}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '规格内就是好品。潜在缺陷的参数偏移仍在规格内，规格判定一定放过它们；要靠 PAT 或邻近规则，看它相对同批 die 的异常。',
    'Inside spec means good. A latent defect’s shift is still inside spec, so spec testing always lets it pass; PAT or the neighbourhood rule has to catch it by its abnormality relative to the lot.',
  ),
  loc(
    '均值和标准差更直观，用它们就行。一颗 50 的离群值会把均值拉偏、标准差放大，限值变宽，潜在缺陷被掩盖；中位数和 MAD 不受它影响。',
    'Mean and standard deviation are more intuitive, so use them. One outlier of 50 drags the mean and inflates the standard deviation, widening the limits and hiding the latent defects; the median and MAD are not affected.',
  ),
  loc(
    'k 越小越安全。k 小确实能多抓潜在缺陷，但好 die 也更容易被误剔（良率损失）。它是拿良率换漏检，要和良率目标一起定。',
    'A smaller k is safer. A smaller k does catch more latent defects, but good dies are also more likely to be removed (yield loss). It trades yield for escapes, so it must be set together with the yield target.',
  ),
  loc(
    '邻近规则越多越好。m 取 1 时，一颗失效 die 旁边的所有好 die 都会被剔除，良率损失可能很大；它必须和良率损失一起看。',
    'More neighbourhood removal is better. With m = 1, every good die beside a single failure is removed and yield loss can be large; it must be judged together with yield loss.',
  ),
  loc(
    'PAT 能替代 Burn-in。PAT 看的是测试时的参数分布，抓不到使用中才显现的早期失效；两者互补，见 REL-05。',
    'PAT replaces burn-in. PAT looks at test-time parameter distributions and cannot catch early failures that appear only in use; the two are complementary, see REL-05.',
  ),
]

export const TAKEAWAY: LText = loc(
  '动态限值 = 中位数 ± k·σ_rob，σ_rob = 1.4826 × MAD；中位数与 MAD 不受少数离群值影响。窗口决定用谁的分布算限值：整 Lot、单晶圆或每 Site。邻近规则利用失效聚集，能抓到限值之内的潜在缺陷，但也会误剔附近的好 die；PAT 与 Burn-in 互补，不能互相替代。',
  'Dynamic limit = median ± k·σ_rob, with σ_rob = 1.4826 × MAD; the median and MAD are not moved by a few outliers. The window decides whose distribution sets the limit: whole lot, single wafer or per site. The neighbourhood rule uses failure clustering to catch latent defects inside the limits, but it also removes nearby good dies; PAT and burn-in complement each other and neither replaces the other.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么 PAT 的动态限值用中位数和 MAD，而不用均值和标准差？', 'Why do PAT dynamic limits use the median and MAD rather than the mean and standard deviation?'),
    options: [
      { id: 'a', text: loc('中位数和 MAD 算得快，适合量产', 'The median and MAD are faster to compute, which suits production') },
      { id: 'b', text: loc('离群值（如 50）会拉大均值和标准差，限值变宽、潜在缺陷被掩盖；中位数和 MAD 不受少数离群值影响', 'Outliers such as 50 inflate the mean and standard deviation, widening the limits and hiding latent defects; the median and MAD are not moved by a few outliers') },
      { id: 'c', text: loc('均值和标准差只适用于规格限，不能用于限值', 'Mean and standard deviation only apply to spec limits, not to limits') },
    ],
    answer: 'b',
    explain: loc(
      '示例 [10, 11, 9, 10, 10, 12, 8, 10, 11, 9, 50] 的均值约 13.6、标准差约 12.1，都被 50 拉偏；中位数 10 与 MAD 1 几乎不变。',
      'For the sample [10, 11, 9, 10, 10, 12, 8, 10, 11, 9, 50], the mean is about 13.6 and the standard deviation about 12.1, both pulled by 50; the median 10 and the MAD 1 barely move.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('同一组示例数据 [10, 11, 9, 10, 10, 12, 8, 10, 11, 9, 50]，MAD 是多少？', 'For the same sample [10, 11, 9, 10, 10, 12, 8, 10, 11, 9, 50], what is the MAD?'),
    options: [
      { id: 'a', text: loc('2', '2') },
      { id: 'b', text: loc('1.4826', '1.4826') },
      { id: 'c', text: loc('1', '1') },
      { id: 'd', text: loc('10', '10') },
    ],
    answer: 'c',
    explain: loc(
      '中位数是 10；各值与 10 的偏差为 0, 1, 1, 0, 0, 2, 2, 0, 1, 1, 40，排序后中位数是 1，所以 MAD = 1。1.4826 是 σ_rob = 1.4826 × MAD，不是 MAD 本身。',
      'The median is 10; the distances from 10 are 0, 1, 1, 0, 0, 2, 2, 0, 1, 1, 40; their median is 1, so MAD = 1. 1.4826 is σ_rob = 1.4826 × MAD, not the MAD itself.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('同一组数据，k = 6 时下限约是多少？（σ_rob = 1.4826 × MAD，限值 = 中位数 ± k·σ_rob）', 'For the same data with k = 6, what is the lower limit? (σ_rob = 1.4826 × MAD, limit = median ± k·σ_rob)'),
    options: [
      { id: 'a', text: loc('1.1', '1.1') },
      { id: 'b', text: loc('8.9', '8.9') },
      { id: 'c', text: loc('−8.9', '−8.9') },
      { id: 'd', text: loc('18.9', '18.9') },
    ],
    answer: 'a',
    explain: loc(
      'σ_rob = 1.4826 × 1 = 1.4826；下限 = 10 − 6 × 1.4826 ≈ 1.1。上限约 18.9，所以 50 超出上限，被剔除。',
      'σ_rob = 1.4826 × 1 = 1.4826; lower limit = 10 − 6 × 1.4826 ≈ 1.1. The upper limit is about 18.9, so 50 is outside and is removed.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于 PAT 的系数 k，下列哪些说法正确？ ① k 越小，潜在缺陷的捕获率通常越高；② k 越小，好 die 被误剔的风险越高；③ k 只影响规格判定，与 PAT 无关；④ 常取 3–8 只是示例，要以各公司规程为准。',
      'About the PAT factor k, which statements are correct? ① a smaller k usually catches more latent defects; ② a smaller k raises the risk of removing good dies; ③ k only affects spec testing and has nothing to do with PAT; ④ 3–8 is only an example, follow each company’s procedure.',
    ),
    options: [
      { id: 'a', text: loc('① 和 ③', '① and ③') },
      { id: 'b', text: loc('①、②、④', '①, ② and ④') },
      { id: 'c', text: loc('②、③', '② and ③') },
      { id: 'd', text: loc('①、④', '① and ④') },
    ],
    answer: 'b',
    explain: loc(
      '① 对：限值更窄，偏移的潜在缺陷更容易越界；② 对：正常分布的尾部也更容易越界；③ 错：k 正是 PAT 限值的系数；④ 对：3–8 是示例值。所以 k 是在捕获与良率损失之间的取舍。',
      '① Right: a narrower limit lets shifted latent defects cross it more easily. ② Right: normal tails cross a narrower limit more often. ③ Wrong: k is the coefficient of the PAT limit itself. ④ Right: 3–8 is an example range. So k is a trade-off between capture and yield loss.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('某片晶圆的中位数比整 Lot 中位数高 0.6 σ_rob。若用整 Lot 限值筛这片，会发生什么？', 'One wafer’s median is 0.6 σ_rob above the whole-lot median. What happens if you screen that wafer with the whole-lot limits?'),
    options: [
      { id: 'a', text: loc('这片上侧的好 die 更容易被误剔；改用单晶圆窗口（以本片中位数为中心）就不会对一侧系统性误剔', 'Good die on the high side of this wafer are removed more often; the single-wafer window, centred on this wafer’s median, avoids this one-sided bias') },
      { id: 'b', text: loc('这片会全部通过，因为整 Lot 限值更宽', 'The whole wafer passes, because the whole-lot limits are wider') },
      { id: 'c', text: loc('这片的潜在缺陷一定会被抓到，因为偏移更大', 'Its latent defects are always caught, because the shift is larger') },
      { id: 'd', text: loc('限值只和规格有关，与晶圆无关', 'Limits depend only on the spec, not on the wafer') },
    ],
    answer: 'a',
    explain: loc(
      '整 Lot 限值的中心在整 Lot 中位数上，偏高的整片相当于整体往上挪了 0.6 σ_rob，上侧离限值更近，好 die 更易被误剔；这是批内偏移造成的系统性偏向，不是随机误差。单晶圆窗口把中心移到本片，偏移被抵消。',
      'The whole-lot limit centres on the lot median; a wafer sitting 0.6 σ_rob high is effectively shifted up, so its upper side is closer to the limit and good die are removed more often. This is a systematic bias from wafer-to-wafer offset, not random error. The single-wafer window moves the centre to this wafer and cancels the offset.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '关于邻近规则（good die in bad neighborhood），下列哪些说法正确？ ① 它利用潜在缺陷在空间上聚集的特点；② 它只会剔除失效 die 本身；③ m 取 1 时可能误剔大量附近的好 die；④ 它可以替代 Burn-in。',
      'About the neighbourhood rule (good die in bad neighborhood), which statements are correct? ① it uses the spatial clustering of latent defects; ② it only removes the failing die itself; ③ with m = 1 it can remove many nearby good dies; ④ it can replace burn-in.',
    ),
    options: [
      { id: 'a', text: loc('①、②', '① and ②') },
      { id: 'b', text: loc('②、④', '② and ④') },
      { id: 'c', text: loc('①、④', '① and ④') },
      { id: 'd', text: loc('①、③', '① and ③') },
    ],
    answer: 'd',
    explain: loc(
      '① 对：潜在缺陷常成簇，失效 die 附近的好 die 也更可疑；② 错：它会额外剔除附近的好 die；③ 对：m = 1 时一颗失效邻居就够，良率损失会急剧增加；④ 错：它与 Burn-in 互补，不能替代。',
      '① Right: latent defects cluster, so good die near failures are suspect too. ② Wrong: it removes nearby good die as well. ③ Right: with m = 1 a single failing neighbour is enough, and yield loss jumps. ④ Wrong: it complements burn-in and cannot replace it.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('一个 Lot 有 2000 颗好 die（规格内、无潜在缺陷），PAT 误剔了 12 颗。良率损失是多少？', 'A lot has 2000 good die (inside spec, no latent defect), and PAT removes 12 of them. What is the yield loss?'),
    options: [
      { id: 'a', text: loc('0.06%', '0.06%') },
      { id: 'b', text: loc('6%', '6%') },
      { id: 'c', text: loc('0.006%', '0.006%') },
      { id: 'd', text: loc('0.6%', '0.6%') },
    ],
    answer: 'd',
    explain: loc(
      '良率损失 = 误剔的好 die ÷ 好 die 总数 = 12 ÷ 2000 = 0.006 = 0.6%。这超过了本课 0.5% 的目标。',
      'Yield loss = good die removed ÷ total good die = 12 ÷ 2000 = 0.006 = 0.6%. That is above this lesson’s 0.5% target.',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '潜在缺陷的参数中心在 +4σ，PAT 上限取在 +3σ 处（假设 σ_rob ≈ σ，且潜在缺陷的散布近似为 σ）。大约多少比例的潜在缺陷会超过上限？',
      'The latent defect centre sits at +4σ and the PAT upper limit at +3σ (assume σ_rob ≈ σ, and the latent spread is about σ). Roughly what share of latent defects exceed the upper limit?',
    ),
    options: [
      { id: 'a', text: loc('16%', '16%') },
      { id: 'b', text: loc('50%', '50%') },
      { id: 'c', text: loc('84%', '84%') },
      { id: 'd', text: loc('98%', '98%') },
    ],
    answer: 'c',
    explain: loc(
      '设潜在缺陷参数 X ~ N(4σ, σ²)，P(X > 3σ) = P(z > −1) ≈ 84%。中心在限值之外，多数会被抓到，但仍有约 16% 漏检：只看中心不够，散布也要算进去。',
      'Let the latent parameter X ~ N(4σ, σ²). P(X > 3σ) = P(z > −1) ≈ 84%. The centre lies outside the limit so most are caught, but about 16% still escape: the spread matters as well as the centre.',
    ),
  },
  {
    id: 'q9',
    prompt: loc('一颗 die 通过了规格测试，是否一定是好品？', 'A die passes the spec test. Is it necessarily a good part?'),
    options: [
      { id: 'a', text: loc('不一定：潜在缺陷的参数仍在规格内，规格测试放过它们；PAT 与邻近规则看的是相对群体的异常', 'Not necessarily: latent defects stay inside spec and pass spec testing; PAT and the neighbourhood rule look at abnormality relative to the population') },
      { id: 'b', text: loc('是：规格内就是好品', 'Yes: inside spec means good') },
      { id: 'c', text: loc('是：只要 PAT 也通过', 'Yes: as long as PAT also passes') },
      { id: 'd', text: loc('不一定，但把 k 调到最小就一定能找出全部', 'Not necessarily, but setting k to its minimum will always find them all') },
    ],
    answer: 'a',
    explain: loc(
      '规格限远在潜在缺陷之外，所以它们通过规格测试（本课模型中规格限为 ±10σ）。PAT 看同批 die 的分布，能抓到偏离群体的规格内坏品，但不是万能，漏检仍会发生。d 错：把 k 调小会误剔更多好 die，也不保证全部找出。',
      'The spec limit lies far outside the latent defects, so they pass spec testing (in this model the spec limit is ±10σ). PAT looks at the distribution of the lot and can catch in-spec bad parts that stand out from the population, but it is not perfect and escapes still occur. d is wrong: a smaller k removes more good die and does not guarantee finding them all.',
    ),
  },
  {
    id: 'q10',
    prompt: loc('PAT 与 Burn-in 是什么关系？', 'What is the relationship between PAT and burn-in?'),
    options: [
      { id: 'a', text: loc('只要选一个，两者可以互相替代', 'Pick one; the two can replace each other') },
      { id: 'b', text: loc('都是对封装后的成品做的高温测试', 'Both are high-temperature tests on packaged finished parts') },
      { id: 'c', text: loc('只有车规产品需要 PAT，Burn-in 与它无关', 'Only automotive products need PAT, and burn-in has nothing to do with it') },
      { id: 'd', text: loc('互补：PAT 用测试参数的分布找异常；Burn-in 用高温与电压应力提前暴露早期失效', 'Complementary: PAT finds abnormal parts from the test-parameter distribution; burn-in uses heat and voltage stress to expose early failures') },
    ],
    answer: 'd',
    explain: loc(
      'PAT 只看测试时的参数分布，抓不到在使用中才显现的早期失效；Burn-in 用加速应力提前暴露，但不能靠参数分布找出规格内的离群 die。两者互补，见 REL-05。',
      'PAT looks only at test-time parameter distributions and cannot catch early failures that appear only in use; burn-in uses accelerated stress to expose them early but cannot find in-spec outliers from parameter distributions. The two are complementary; see REL-05.',
    ),
  },
]

/** 四张任务卡：完成与否由当前参数和模型结果算出，重置后自动还原 */
export const TASK_T1 = loc('T1：手算示例数据的中位数与 MAD，在练习框里填对两个数。', 'T1: Hand-calculate the median and MAD of the sample data and enter both correctly in the practice box.')
export const TASK_T2 = loc('T2：选 k，使潜在缺陷捕获率 ≥ 80%，且良率损失 ≤ 0.5%。', 'T2: Choose k so that latent-defect capture is at least 80% and yield loss is at most 0.5%.')
export const TASK_T3 = loc('T3：启用邻近规则，读出额外良率损失与漏检的变化。', 'T3: Turn on the neighbourhood rule and read how extra yield loss and escapes change.')
export const TASK_T4 = loc(
  'T4：切到单晶圆窗口，选一片中位数偏离整 Lot 超过 0.5 σ_rob 的晶圆，比较两种限值。',
  'T4: Switch to the single-wafer window, pick a wafer whose median is more than 0.5 σ_rob from the lot median, and compare the two limits.',
)

/** 手算练习的判定：学生输入是否与模型算出的值一致 */
export function handState(text: string, target: number): 'empty' | 'ok' | 'wrong' {
  if (text.trim() === '') {
    return 'empty'
  }
  return Math.abs(Number(text) - target) < 1e-9 ? 'ok' : 'wrong'
}

/** 四张任务卡：done 由当前状态与模型结果算出 */
export function taskItems(state: PatState, run: PatRun): TaskItem[] {
  const hand = samplePat(state.k)
  const shift = run.waferMedian - run.lotMedian
  return [
    {
      id: 'hand-calc',
      text: TASK_T1,
      done: handState(state.handMedian, hand.median) === 'ok' && handState(state.handMad, hand.mad) === 'ok',
    },
    {
      id: 'capture-yield',
      text: TASK_T2,
      done: run.stats.capture >= TARGET_CAPTURE && run.stats.yieldLoss <= TARGET_YIELD_LOSS,
    },
    {
      id: 'nbr-on',
      text: TASK_T3,
      done: state.nbr === 'on' && run.stats.nbrExtra > 0,
    },
    {
      id: 'window-compare',
      text: TASK_T4,
      done: state.window === 'wafer' && Math.abs(shift) / run.sigmaRob >= 0.5,
    },
  ]
}

/** 右侧说明栏：根据捕获率与良率损失给结论，并写出原因（窗口、邻近规则都会影响结论） */
export function verdictOf(state: PatState, run: PatRun): { title: LText; text: LText } {
  const { stats } = run
  const capPct = (stats.capture * 100).toFixed(0)
  const yl = (stats.yieldLoss * 100).toFixed(2)
  const k = state.k.toFixed(1)
  const shift = state.latentShift.toFixed(1)
  const captureOk = stats.capture >= TARGET_CAPTURE
  const yieldOk = stats.yieldLoss <= TARGET_YIELD_LOSS
  const sentences: LText[] = []

  if (captureOk && yieldOk) {
    sentences.push(
      fill(
        loc(
          '捕获率 {0}%，良率损失 {1}%，都在目标内。原因：限值到中位数的距离是 k·σ_rob = {2}·σ_rob，正常的好 die 很少越界，而潜在缺陷的偏移（{3}σ）大多落在限值之外。这是这一组固定种子的结果，不是统计上的保证。',
          'Capture {0}% and yield loss {1}%, both within target. Reason: the limit sits k·σ_rob = {2}·σ_rob from the median, few normal good die cross it, and most latent defects, shifted by {3}σ, fall outside it. This is the result for this fixed seed, not a statistical guarantee.',
        ),
        capPct,
        yl,
        k,
        shift,
      ),
    )
  } else if (!captureOk && yieldOk) {
    sentences.push(
      fill(
        loc(
          '捕获率只有 {0}%，漏检 {1} 颗。原因：限值是 k·σ_rob = {2}·σ_rob，比潜在缺陷的偏移（{3}σ）宽，中心落在限值之内的潜在缺陷就漏掉了。PAT 只能抓到偏离中心超过 k·σ_rob 的 die，要把它们挑出来，k 必须比偏移量小。',
          'Capture is only {0}%, with {1} escapes. Reason: the limit is k·σ_rob = {2}·σ_rob, wider than the latent-defect shift ({3}σ), so latent defects whose centre sits inside the limit are missed. PAT can only catch dies more than k·σ_rob from the centre, so k has to be smaller than the shift.',
        ),
        capPct,
        stats.escapes,
        k,
        shift,
      ),
    )
  } else if (captureOk && !yieldOk) {
    sentences.push(
      fill(
        loc(
          '良率损失 {0}%，超过 0.5% 的目标。原因：k = {1} 的限值太窄，正常分布的尾部也落在限值之外，好 die 被误剔。k 小能多抓潜在缺陷，但要拿良率去换。',
          'Yield loss {0}% is over the 0.5% target. Reason: k = {1} gives a limit so narrow that the normal tails also fall outside it, and good die are removed. A smaller k catches more latent defects, but the price is yield.',
        ),
        yl,
        k,
      ),
    )
  } else {
    sentences.push(
      fill(
        loc(
          '捕获率 {0}%、良率损失 {1}%，两项都没达标。先看 k：k = {2} 时的限值同时对漏检和误剔都不合适，换一个 k 再看两项的变化。',
          'Capture {0}% and yield loss {1}%: neither target is met. Look at k first: with k = {2} the limit is wrong for both escapes and over-kill, so try another k and watch both numbers.',
        ),
        capPct,
        yl,
        k,
      ),
    )
  }

  if (state.window !== 'lot') {
    const delta = ((run.waferMedian - run.lotMedian) / run.sigmaRob).toFixed(2)
    sentences.push(fill(S.windowNote, state.window === 'wafer' ? WINDOW_LABEL.wafer : WINDOW_LABEL.site, delta))
  }
  if (state.nbr === 'on') {
    sentences.push(fill(S.nbrNote, stats.nbrExtra))
  }

  const title = captureOk && yieldOk ? S.vOk : !captureOk && yieldOk ? S.vLoose : captureOk && !yieldOk ? S.vTight : S.vBoth
  return {
    title,
    text: { zh: sentences.map((s) => s.zh).join(''), en: sentences.map((s) => s.en ?? s.zh).join(' ') },
  }
}

/** 手算练习的示例数据（页面展示用，与模型里的 SAMPLE_DATA 同一组） */
export const SAMPLE_TEXT = SAMPLE_DATA.join(', ')

/** 页面用：显示晶圆的计数摘要 */
export function waferSummary(run: PatRun): LText {
  const c = waferCounts(run)
  return fill(S.waferSummary, run.waferIdx + 1, c.dies, c.pat, c.nbr, c.latent, c.escapes)
}

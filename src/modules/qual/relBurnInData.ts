import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  bestFeasible,
  biAf,
  type BiAnalysis,
  type BiCurvePoint,
  type BiState,
  minHForTarget,
  REF_T_BI,
  SCREEN_IDS,
  TARGET_PPM,
  V_USE,
} from './relBurnInModel'

/** 把 {0}、{1} … 换成数值；中英文译文都替换，数字不用拼进 loc 的模板字符串里 */
export function fill(text: LText, ...values: string[]): LText {
  const apply = (source: string) => values.reduce((acc, value, index) => acc.split(`{${index}}`).join(value), source)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f3 = (value: number) => value.toFixed(3)

export const U = {
  costH: loc('$/件·h', '$/part·h'),
  costPart: loc('$/件', '$/part'),
  shape: loc('（形状）', '(shape)'),
}

export const SCREEN_OPTIONS = [
  { id: SCREEN_IDS[0], label: loc('不做统计筛选', 'No statistical screen') },
  { id: SCREEN_IDS[1], label: loc('做 PAT 统计筛选', 'With PAT screen') },
]

export const S = {
  kickerNow: loc('这一次 Burn-in', 'This burn-in'),
  introTitle: loc('Burn-in：用加速条件提前暴露早期失效', 'Burn-in: expose early failures sooner with acceleration'),
  coreTitle: loc('拨一拨：BI 时间、温度与成本', 'Try it: burn-in time, temperature and cost'),
  coreNote: loc(
    '群体 10⁵ 件，其中一部分带潜在缺陷（缺陷子群）。BI 按加速因子把 h 小时折合成 h·AF 个现场小时，这段时间里失效的缺陷被剔除，留下的残余才会流到现场。BI 温度与电压的数值是教学示例，以现行标准为准。',
    'The population is 10⁵ parts; some carry latent defects (a defect subgroup). Burn-in turns h hours into h·AF use hours: defects that fail in that span are removed, and the residue reaches the field. The BI temperature and voltage values are teaching examples; follow the current standard.',
  ),
  pLabel: loc('缺陷子群比例 p', 'Defect subgroup share p'),
  betaLabel: loc('缺陷寿命形状 β_d', 'Defect Weibull shape β_d'),
  etaLabel: loc('缺陷寿命尺度 η_d（使用条件，h）', 'Defect Weibull scale η_d (use conditions, h)'),
  tBiLabel: loc('BI 温度（示例，以现行标准为准）', 'BI temperature (example; follow the current standard)'),
  vBiLabel: loc('BI 电压（示例，以现行标准为准）', 'BI voltage (example; follow the current standard)'),
  hLabel: loc('BI 时间', 'BI time'),
  cBiLabel: loc('BI 成本（每件每小时）', 'BI cost (per part per hour)'),
  cScrapLabel: loc('失效品报废成本', 'Scrap cost per failed part'),
  cFieldLabel: loc('现场失效成本', 'Field failure cost per part'),
  tFieldLabel: loc('现场窗口 T_field', 'Field window T_field'),
  screenLabel: loc('统计筛选（REL-07 的 PAT，教学示意）', 'Statistical screen (PAT from REL-07, illustrative)'),
  rAf: loc('BI 加速因子 AF', 'BI acceleration factor AF'),
  rRemoved: loc('被 BI 剔除（占群体）', 'Removed by BI (share of population)'),
  rResidual: loc('BI 后残余缺陷（占群体）', 'Residual defects after BI (share of population)'),
  rFieldPpm: loc('T_field 内现场失效', 'Field failures within T_field'),
  rCost: loc('单件总成本（$）', 'Total cost per part ($)'),
  rBestFree: loc('成本最低的 BI 时间（不管 ppm）', 'BI time with lowest cost (ignoring ppm)'),
  rBestTarget: loc('达到 ppm 目标的最短 BI 时间', 'Shortest BI time that meets the ppm target'),
  rBestFeasible: loc('ppm 约束下成本最低的 BI 时间', 'BI time with lowest cost under the ppm limit'),
  rTargetLabel: loc('现场 ppm 目标（教学示例）', 'Field ppm target (teaching example)'),
  noneWithin: loc('168 h 内达不到', 'Not reached within 168 h'),
  hUnit: loc('h', 'h'),
  curveNow: loc('当前 {0} h', 'Now {0} h'),
  legBi: loc('BI 成本', 'BI cost'),
  legRest: loc('报废 + 现场失效', 'Scrap + field failures'),
  legTotal: loc('总成本', 'Total cost'),
  legTarget: loc('ppm 目标', 'ppm target'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '统计筛选（PAT、邻近规则）在 REL-07 展开；把 Burn-in 与 PAT 放在同一条量产流程里比较，见 REL-08。',
    'Statistical screening (PAT and neighborhood rules) is covered in REL-07; REL-08 compares burn-in and PAT within one production flow.',
  ),
  next: loc('下一课：车规基础：AEC-Q100 框架与温度等级', 'Next: Automotive basics: AEC-Q100 framework and temperature grades'),
  task1: loc('把现场 ppm 压到目标以内（调 BI 时间或温度）。', 'Bring the field ppm within the target (adjust BI time or temperature).'),
  task2: loc('在 ppm 约束下，把单件总成本压到最低。', 'Under the ppm constraint, bring the total cost per part as low as possible.'),
  task3: loc('提高 BI 温度（140 °C 以上），让达标时间变短，并读出新的 AF。', 'Raise the BI temperature (140 °C or more) so the time to target gets shorter, and read the new AF.'),
  task4: loc('对比“无 BI + 统计筛选”：BI 时间设为 0，并选做 PAT。', 'Compare “no BI + statistical screen”: set BI time to 0 and choose the PAT screen.'),
}

export const INTRO = [
  loc(
    '早期失效来自出厂时就带着的潜在缺陷。在 {@relBathtub} 的浴盆曲线里，它们挤在早期失效段；出厂测试只能剔除已经表现出来的缺陷，剩下的要靠 Burn-in：在高温、高压下让器件工作一段时间，用加速的方式把弱品提前烧坏。',
    'Early failures come from latent defects that are already in the part at shipment. On the bathtub curve in {@relBathtub} they sit in the infant-mortality segment. Production test removes only defects that already show up; the rest is left to burn-in, which runs parts at high temperature and voltage for a while so the weak ones fail early.',
  ),
  loc(
    'Burn-in 的加速靠 {@relAccel} 里的加速因子：BI 的温度和电压折算成 AF，h 小时的 BI 就相当于现场的 h·AF 小时。时间、温度、电压三者互相替代，但替代要以失效机理不变为前提。',
    'Burn-in acceleration uses the acceleration factors from {@relAccel}: the BI temperature and voltage give an AF, so h hours of BI is equivalent to h·AF hours in the field. Time, temperature and voltage can trade off against each other, but only while the failure mechanism stays the same.',
  ),
  loc(
    'BI 前后各做一次读点测试（在 ATE 上完成），可以看出剔除了多少件。成本是另一条线：BI 时间、炉子与老化板的产能、报废与现场失效的代价，共同决定最省的 BI 时间。下面的实验把这几项放在一起算。',
    'Read points before and after burn-in (done on the ATE) show how many parts were removed. Cost is the other side: BI time, oven and board capacity, scrap and field failure costs together decide the cheapest BI time. The lab below puts them together.',
  ),
]

export const MISCONCEPTIONS = [
  loc(
    'Burn-in 时间越长越好。残余缺陷确实随 h·AF 下降，但 BI 成本与时间成正比，还会给器件带来额外应力。过了 ppm 目标之后，每多烧一小时，省下的现场失效成本远小于它的 BI 成本，所以要找的是最省的时间，不是最长的时间。',
    'Longer burn-in is always better. Residual defects do fall as h·AF grows, but BI cost is proportional to time, and extra stress can damage good parts. Past the ppm target, each extra hour saves far less field-failure cost than it costs, so the goal is the cheapest time, not the longest.',
  ),
  loc(
    'Burn-in 能剔除所有缺陷。BI 只剔除 F_d(h·AF) 那一部分的缺陷子群；残余 p·[1 − F_d(h·AF)] 会留在出货的产品里，它们在 T_field 内陆续失效，所以 BI 后仍会有现场失效。',
    'Burn-in removes all defects. Burn-in removes only the share F_d(h·AF) of the defect subgroup; the residue p·[1 − F_d(h·AF)] ships, and it fails in the field within T_field. Field failures therefore remain after burn-in.',
  ),
  loc(
    '所有产品都需要 Burn-in。BI 只对有早期失效风险、且现场失效代价高的产品才值得做。没有潜在缺陷风险、测试已经很充分的产品，BI 的成本可能超过它的收益。',
    'Every product needs burn-in. Burn-in is worth its cost only where early-failure risk and the cost of field failure are high. For products with little latent-defect risk and thorough test, the BI cost can exceed its benefit.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Burn-in 用加速条件把缺陷子群在出货前提前暴露：残余 = p·[1 − F_d(h·AF)]，AF 由温度（Arrhenius）和电压（指数）相乘得到。BI 时间是 ppm 与成本之间的折中：ppm 目标决定最短时间，成本决定最省的时间；BI 不能剔除全部缺陷，也不是越长越好。',
  'Burn-in exposes the defect subgroup before shipment with accelerated stress: residual = p·[1 − F_d(h·AF)], where AF multiplies the temperature term (Arrhenius) and the voltage term (exponential). BI time trades ppm against cost: the ppm target sets the shortest time and cost sets the cheapest one. Burn-in cannot remove every defect, and longer is not better.',
)

/** 每件成本、ppm 等由 analyseBi 算出，任务卡与说明栏都从同一套结果读数 */
export function taskItems(state: BiState, a: BiAnalysis, curve: BiCurvePoint[], refCurve: BiCurvePoint[]): TaskItem[] {
  const meets = a.fieldPpm <= TARGET_PPM
  const best = bestFeasible(curve, TARGET_PPM)
  const hMin = minHForTarget(curve, TARGET_PPM)
  const refMin = minHForTarget(refCurve, TARGET_PPM)
  return [
    { id: 't1', text: S.task1, done: meets },
    { id: 't2', text: S.task2, done: meets && best !== null && state.biHours === best.h },
    {
      id: 't3',
      text: S.task3,
      done: state.tBiC >= 140 && hMin !== null && hMin < (refMin ?? Infinity),
    },
    { id: 't4', text: S.task4, done: state.biHours === 0 && state.screen === SCREEN_IDS[1] },
  ]
}

/** 右侧说明栏：根据当前结果给结论，并写出原因 */
export function verdictOf(state: BiState, a: BiAnalysis, curve: BiCurvePoint[]): { title: LText; text: LText } {
  const best = bestFeasible(curve, TARGET_PPM)
  const removedShare = a.pEff > 0 ? (a.biRemoved / a.pEff) * 100 : 0
  if (a.fieldPpm > TARGET_PPM && state.biHours === 0) {
    return {
      title: loc('没有 BI，缺陷全部流到现场', 'No BI: every defect reaches the field'),
      text: fill(
        loc(
          'BI 时间为 0，缺陷子群的现场失效为 {0} ppm，超过目标 {1} ppm。原因：BI 的作用是在出货前用加速条件把这些缺陷提前暴露，不做 BI 时它们只能在用户那里暴露。',
          'With BI time 0, field failures are {0} ppm, above the {1} ppm target. Reason: burn-in exposes these defects before shipment with accelerated stress; without it they show up at the customer.',
        ),
        f0(a.fieldPpm),
        f0(TARGET_PPM),
      ),
    }
  }
  if (a.fieldPpm > TARGET_PPM) {
    return {
      title: loc('BI 时间不够，残余仍超目标', 'BI too short: residue still above target'),
      text: fill(
        loc(
          'BI {0} h 折合现场 {1} h，残余缺陷 {2} ppm，T_field 内失效 {3} ppm 仍超过目标 {4} ppm。原因：残余 = p·[1 − F_d(h·AF)]，h·AF 还不够长，F_d 没有接近 1，留下的缺陷会在现场陆续失效。',
          'BI {0} h gives {1} use hours; residual defects are {2} ppm and the T_field failures {3} ppm, still above the {4} ppm target. Reason: residual = p·[1 − F_d(h·AF)], and h·AF is not yet long enough for F_d to approach 1, so the survivors fail in the field over time.',
        ),
        f0(state.biHours),
        f0(a.useHours),
        f0(a.residual * 1e6),
        f0(a.fieldPpm),
        f0(TARGET_PPM),
      ),
    }
  }
  if (best !== null && state.biHours > best.h) {
    return {
      title: loc('达标，但 BI 时间超过最省的点', 'Meets the target, but BI runs past the cheapest point'),
      text: fill(
        loc(
          '最省的达标点是 {0} h（${1}/件），当前 {2} h（${3}/件）。原因：达标之后，每多 1 h BI 要付 ${4}/件 的成本，而它能少掉的现场失效成本已经很小。',
          'The cheapest point that meets the target is {0} h (${1}/part); now {2} h (${3}/part). Reason: once the target is met, each extra BI hour costs ${4}/part, while the field-failure cost it still avoids is already small.',
        ),
        f0(best.h),
        f3(best.cost),
        f0(state.biHours),
        f3(a.cost),
        f3(state.cBi),
      ),
    }
  }
  return {
    title: loc('达到 ppm 目标', 'Meets the ppm target'),
    text: fill(
      loc(
        'T_field 内现场失效 {0} ppm，达到目标 {1} ppm。原因：BI 在 {2} h（等效现场 {3} h）里剔除了 {4}% 的缺陷子群，残余已经低到现场失效率可以接受。',
        'Field failures within T_field are {0} ppm, meeting the {1} ppm target. Reason: burn-in of {2} h (≈ {3} use hours) removed {4}% of the defect subgroup, and the residue is now low enough for the field failure rate.',
      ),
      f0(a.fieldPpm),
      f0(TARGET_PPM),
      f0(state.biHours),
      f0(a.useHours),
      f0(removedShare),
    ),
  }
}

/** 调用同一套模型算出的数值，保证测验题与页面一致 */
const AF_125 = biAf(REF_T_BI, V_USE)
const AF_150 = biAf(150, V_USE)
export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Burn-in 的主要目的是什么？', 'What is the main purpose of burn-in?'),
    options: [
      { id: 'a', text: loc('测出芯片的最高工作频率', 'Measure the chip’s maximum operating frequency') },
      { id: 'b', text: loc('把所有缺陷都找出来', 'Find every defect') },
      { id: 'c', text: loc('在出货前用加速条件提前暴露早期失效，剔除弱品', 'Use accelerated stress before shipment to expose early failures and remove weak parts') },
    ],
    answer: 'c',
    explain: loc(
      'Burn-in 的对象是潜在缺陷引起的早期失效：用高温、高压把它们提前激发出来。它不测频率，也找不出全部缺陷，只是在出货前把一部分弱品剔掉。',
      'Burn-in targets early failures caused by latent defects: high temperature and voltage bring them out early. It does not measure frequency and cannot find every defect; it removes part of the weak population before shipment.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '下面三条说法，哪几条都正确？\nS1：BI 用加速条件把潜在缺陷在出货前暴露。\nS2：BI 能剔除全部缺陷，出货后就不会再有早期失效。\nS3：BI 前后各做一次读点，可以统计被剔除的数量。',
      'Which statements are all correct?\nS1: BI exposes latent defects before shipment with accelerated stress.\nS2: BI removes every defect, so no early failures occur after shipment.\nS3: Read points before and after BI can count how many parts were removed.',
    ),
    options: [
      { id: 'a', text: loc('S1 和 S2 都对', 'S1 and S2 are correct') },
      { id: 'b', text: loc('S1、S3 都对', 'S1 and S3 are correct') },
      { id: 'c', text: loc('S2、S3 都对', 'S2 and S3 are correct') },
      { id: 'd', text: loc('S1、S2、S3 都对', 'S1, S2 and S3 are all correct') },
    ],
    answer: 'b',
    explain: loc(
      'S2 错：BI 只剔除 F_d(h·AF) 那一部分，残余 p·[1 − F_d(h·AF)] 出货后仍会在现场失效。S1 和 S3 都是 BI 的基本做法：加速暴露，前后读点比较。',
      'S2 is wrong: BI removes only the share F_d(h·AF); the residue p·[1 − F_d(h·AF)] still fails in the field. S1 and S3 are the basic practice: accelerated exposure, and comparing read points before and after.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('潜在缺陷比例 p = 0.5%，群体 N = 10⁵ 件。不做 BI、也不做统计筛选，有多少件带缺陷的件流到出货环节？', 'The latent defect share p = 0.5% and the population is N = 10⁵ parts. With no BI and no statistical screen, how many defective parts reach shipment?'),
    options: [
      { id: 'a', text: fill(loc('{0} 件', '{0} parts'), '5000') },
      { id: 'b', text: fill(loc('{0} 件', '{0} parts'), '50') },
      { id: 'c', text: fill(loc('{0} 件', '{0} parts'), '500') },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'N · p = 10⁵ × 0.5% = {0} 件。没有 BI 和筛选，这些缺陷件全部出货。',
        'N · p = 10⁵ × 0.5% = {0} parts. With no BI and no screen, all of these defective parts ship.',
      ),
      '500',
    ),
  },
  {
    id: 'q4',
    prompt: loc('有人说：“残余随 BI 时间下降，那就一直烧到 168 h 以上，越久越好。”这句话对吗？', 'Someone says: “Residue falls with BI time, so keep burning longer than 168 h; longer is better.” Is that right?'),
    options: [
      { id: 'a', text: loc('不对：残余确实下降，但 BI 成本随时间线性增加，还可能损伤好件；要在 ppm 与成本之间找最省的时间', 'Not right: residue does fall, but BI cost rises linearly with time and can damage good parts; find the cheapest time that meets ppm') },
      { id: 'b', text: loc('对：时间越长，现场失效越少，没有代价', 'Right: the longer the burn-in, the fewer field failures, with no downside') },
      { id: 'c', text: loc('不对：BI 时间和残余缺陷没有关系', 'Not right: BI time has nothing to do with residual defects') },
    ],
    answer: 'a',
    explain: loc(
      '残余 p·[1 − F_d(h·AF)] 确实随 h 下降，但这是递减的收益，而 BI 成本、炉子产能和可能的额外应力随时间增加。过了 ppm 目标之后，多烧的每一小时省下的现场成本远小于它的成本。',
      'Residue p·[1 − F_d(h·AF)] does fall with h, but the benefit diminishes while BI cost, oven capacity and possible extra stress grow with time. Past the ppm target, each extra hour saves far less field cost than it costs.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('BI 温度从 125 °C 提到 150 °C，其余不变（Ea = 0.7 eV，使用温度 55 °C，电压不变）。温度部分的 AF 大约变为多少？', 'BI temperature goes from 125 °C to 150 °C with everything else fixed (Ea = 0.7 eV, use temperature 55 °C, voltage unchanged). Roughly what does the temperature AF become?'),
    options: [
      { id: 'a', text: fill(loc('约 {0}', 'about {0}'), f0(AF_150 * 10)) },
      { id: 'b', text: fill(loc('约 {0}', 'about {0}'), f0(AF_150)) },
      { id: 'c', text: fill(loc('约 {0}（不变）', 'about {0} (unchanged)'), f1(AF_125)) },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'AF = exp[(Ea/k)(1/T_use − 1/T_BI)]，温度用开尔文：125 °C 时约 {0}，150 °C 时约 {1}。温度每升高一点，AF 都会明显增加，所以提高 BI 温度能缩短达标时间。',
        'AF = exp[(Ea/k)(1/T_use − 1/T_BI)] with temperatures in kelvin: about {0} at 125 °C and about {1} at 150 °C. Each step up in temperature raises AF noticeably, so a hotter BI shortens the time to target.',
      ),
      f1(AF_125),
      f0(AF_150),
    ),
  },
  {
    id: 'q6',
    prompt: loc('只做 PAT 统计筛选，不做 BI，能否替代 BI？', 'Can PAT statistical screening alone replace burn-in?'),
    options: [
      { id: 'a', text: loc('不能完全替代：二者互补。PAT 抓参数离群的潜在缺陷，BI 用时间与温度暴露弱品，要压低残余还需要 BI', 'Not fully: they are complementary. PAT catches parametric outliers, while BI exposes weak parts with time and temperature; lowering residue further needs BI') },
      { id: 'b', text: loc('能，PAT 比 BI 便宜，可以完全替代', 'Yes, PAT is cheaper, so it fully replaces BI') },
      { id: 'c', text: loc('能，只要限值拧得足够紧', 'Yes, as long as the limits are tight enough') },
    ],
    answer: 'a',
    explain: loc(
      'PAT 依赖参数是否离群，有些潜在缺陷参数完全正常，抓不到；BI 靠时间与温度激发。两者抓的缺陷不完全相同，所以是互补关系，见 REL-07。',
      'PAT depends on whether a parameter is an outlier, and some latent defects look completely normal, so it misses them; BI forces them out with time and temperature. The two catch different defects, so they are complementary; see REL-07.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '下面三条，哪几条是 Burn-in 的代价或副作用？\n(i) 占用老化板和炉子的产能，成本随时间增加。\n(ii) 高温、高压本身也是应力，过度 BI 可能给好件带来额外损伤。\n(iii) BI 后可以省掉全部 ATE 功能测试。',
      'Which of these are costs or side effects of burn-in?\n(i) It occupies oven and board capacity, so cost rises with time.\n(ii) High temperature and voltage are stress too; excessive BI can damage good parts.\n(iii) After BI, all ATE functional tests can be skipped.',
    ),
    options: [
      { id: 'a', text: loc('(ii)、(iii) 都对', '(ii) and (iii) are correct') },
      { id: 'b', text: loc('(i)、(iii) 都对', '(i) and (iii) are correct') },
      { id: 'c', text: loc('(i)、(ii) 都对', '(i) and (ii) are correct') },
    ],
    answer: 'c',
    explain: loc(
      '(iii) 错：BI 只是加速暴露，前后的读点和功能测试仍要做，不能因为做了 BI 就省掉测试。(i) 和 (ii) 是 BI 的代价，所以要在 ppm 目标下找最省的时间和温度。',
      '(iii) is wrong: burn-in only accelerates exposure; read points and functional tests still run, and BI does not replace them. (i) and (ii) are real costs of BI, which is why the cheapest time and temperature are sought under the ppm target.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('BI 前后各做一次读点（测试），它的主要作用是什么？', 'What is the main purpose of read points before and after BI?'),
    options: [
      { id: 'a', text: loc('比较 BI 前后的参数，找出被 BI 剔除的件，并确认留下的件仍然正常', 'Compare parameters before and after BI to find the parts BI removed and confirm the survivors are still normal') },
      { id: 'b', text: loc('让 BI 跑得更快', 'Make the BI run faster') },
      { id: 'c', text: loc('代替 BI 的温度控制', 'Replace the temperature control of BI') },
    ],
    answer: 'a',
    explain: loc(
      '读点在 ATE 上完成，它把“BI 前能过、BI 后失效”的件找出来，既是剔除的记录，也是检查 BI 有没有把好件烧坏的依据。它不控制温度，也不加快 BI。',
      'Read points run on the ATE. They identify parts that passed before BI and failed after, which records the removals and checks that BI has not damaged good parts. They do not control temperature or speed up BI.',
    ),
  },
  {
    id: 'q9',
    prompt: loc('某产品 BI 24 h 之后，残余缺陷对应的现场 ppm 仍超过目标。最合理的调整是哪一个？', 'After 24 h of BI, the field ppm of the residue is still above target. Which adjustment makes the most sense?'),
    options: [
      { id: 'a', text: loc('把 BI 温度降到 55 °C，省成本', 'Lower the BI temperature to 55 °C to save cost') },
      { id: 'b', text: loc('延长 BI 时间，或提高 BI 温度（加大 AF），让 h·AF 更长，使 F_d 接近 1', 'Lengthen the BI time or raise the BI temperature (larger AF) so that h·AF is longer and F_d approaches 1') },
      { id: 'c', text: loc('取消 BI，直接出货', 'Cancel BI and ship directly') },
    ],
    answer: 'b',
    explain: loc(
      '残余 = p·[1 − F_d(h·AF)]，要让它变小，就要让 h·AF 变长：要么 h 更长，要么 AF 更大（温度、电压更高）。降温只会让 AF 变小、残余变大；取消 BI 等于把残余全部交给现场。',
      'Residue = p·[1 − F_d(h·AF)]. To shrink it, make h·AF longer: either a longer h or a larger AF from higher temperature or voltage. Lowering the temperature shrinks AF and raises the residue; cancelling BI hands the whole residue to the field.',
    ),
  },
]

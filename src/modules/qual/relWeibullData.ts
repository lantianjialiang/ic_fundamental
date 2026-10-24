import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { fill } from './relStressData'
import { B10_F, DEFAULT_AF, type FailureMode, type WeibullAnalysis, type WeibullState } from './relWeibullModel'

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

/** 数字无效（样本太少无法拟合）时显示破折号 */
export function orDash(value: number, digits: (v: number) => string): string {
  return Number.isFinite(value) ? digits(value) : '—'
}

export const S = {
  kicker: loc('这一次寿命数据', 'This life data set'),
  introTitle: loc('寿命数据怎样画成直线，又怎样外推', 'How life data becomes a line, and how it is extrapolated'),
  coreTitle: loc('拨一拨：样本量、截尾与种子怎样影响拟合', 'Try it: how sample size, censoring and seed affect the fit'),
  coreNote: loc(
    '真值 β、η 决定样本怎样生成（逆 CDF 抽样）；拟合结果只是估计。图的横轴是对数时间，纵轴是 Weibull 概率坐标 ln(−ln(1−F))：数据近似成一条直线时，斜率就是 β̂，直线与真值的差就是估计误差。',
    'The true β and η decide how the sample is generated (inverse-CDF sampling); the fit is only an estimate. The x-axis is log time and the y-axis is the Weibull probability scale ln(−ln(1−F)). When the data lie near a line, its slope is β̂, and the gap from the true line is the estimation error.',
  ),
  betaLabel: loc('真值 β（形状）', 'True β (shape)'),
  etaLabel: loc('真值 η（尺度，应力条件，h）', 'True η (scale, stress condition, h)'),
  nLabel: loc('样本数 n', 'Sample size n'),
  censorLabel: loc('截尾时间（超过仍未失效则截尾，h）', 'Censoring time (still alive past this is censored, h)'),
  seedLabel: loc('随机种子', 'Random seed'),
  afLabel: loc('加速因子 AF（外推用，默认 ≈ 77.7）', 'Acceleration factor AF (for extrapolation, default ≈ 77.7)'),
  rBeta: loc('β̂（真值 {tb}）', 'β̂ (true {tb})'),
  rBetaErr: loc('β 相对误差', 'β relative error'),
  rEta: loc('η̂（真值 {te} h）', 'η̂ (true {te} h)'),
  rEtaErr: loc('η 相对误差', 'η relative error'),
  rCounts: loc('失效数 / 截尾数', 'Failures / censored'),
  rR2: loc('拟合 R²', 'Fit R²'),
  rMode: loc('失效模式（由 β̂）', 'Failure mode (from β̂)'),
  rB10: loc('使用条件 B10（估计 / 真值）', 'Use-condition B10 (estimate / true)'),
  rR10: loc('使用条件 10 年可靠度（估计 / 真值）', '10-year use reliability (estimate / true)'),
  modeEarly: loc('早期失效（β < 1）', 'Early failure (β < 1)'),
  modeRandom: loc('随机失效（β ≈ 1）', 'Random failure (β ≈ 1)'),
  modeWear: loc('磨损失效（β > 1）', 'Wear-out failure (β > 1)'),
  vNoFit: loc('无法拟合', 'Cannot fit'),
  vNoFitText: loc(
    '失效数只有 {f} 颗。原因：Weibull 回归至少要两个失效点才有斜率；样本少时要加大样本量或延长截尾时间，让更多器件失效。',
    'Only {f} failures. Reason: a Weibull regression needs at least two failure points to have a slope; with a small sample, increase n or lengthen the censoring time so more units fail.',
  ),
  vEarlyText: loc(
    'β̂ = {beta}，小于 1，失效率随时间下降，失效集中在早期。原因：β 决定风险函数 h(t) 的走向，β < 1 时 h(t) 随时间单调下降。样本 {n} 颗（失效 {f}，截尾 {c}），β 估计误差 {err}%。',
    'β̂ = {beta}, below 1: the failure rate falls with time and failures cluster early. Reason: β sets the direction of the hazard h(t), which falls monotonically when β < 1. Sample {n} (failures {f}, censored {c}); β error {err}%.',
  ),
  vRandomText: loc(
    'β̂ = {beta}，接近 1，失效率大致恒定，寿命近似指数分布。原因：β = 1 时 h(t) 为常数。样本 {n} 颗（失效 {f}，截尾 {c}），β 估计误差 {err}%。',
    'β̂ = {beta}, close to 1: the failure rate is roughly constant and the life is close to exponential. Reason: at β = 1, h(t) is constant. Sample {n} (failures {f}, censored {c}); β error {err}%.',
  ),
  vWearText: loc(
    'β̂ = {beta}，大于 1，失效率随时间上升。原因：β > 1 时 h(t) 随时间增大，器件越老越容易失效。样本 {n} 颗（失效 {f}，截尾 {c}），β 估计误差 {err}%。',
    'β̂ = {beta}, above 1: the failure rate rises with time. Reason: for β > 1, h(t) grows with time, so older units fail more often. Sample {n} (failures {f}, censored {c}); β error {err}%.',
  ),
  vExtrap: loc(
    '外推：η_use = η̂ × AF，使用条件 B10 ≈ {b10} h（真值 {b10t} h）。外推只在同一失效机理在两种应力下都成立时才可靠。',
    'Extrapolation: η_use = η̂ × AF gives a use-condition B10 ≈ {b10} h (true {b10t} h). Extrapolation is valid only if the same failure mechanism holds at both stresses.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  figPlotTitle: loc('Weibull 概率图与拟合线', 'Weibull probability plot and fitted line'),
  figPlotNote: loc(
    '每个失效点用中位秩 F 画在图上；截尾点不画点，只在横轴上标出截尾时间。蓝线是拟合线，金色虚线是真值。',
    'Each failure is plotted at its median rank F; censored units are not plotted, only their censoring time is marked on the x-axis. The blue line is the fit; the dashed gold line is the truth.',
  ),
  figPlotAria: loc('Weibull 概率图：失效点、拟合线与真值线', 'Weibull probability plot: failure points, fitted line and true line'),
  figPlotCap: loc(
    '横轴是对数时间，纵轴是 Weibull 概率坐标：直线斜率为 β，过 F = 63.2% 处的时间为 η。',
    'x-axis: log time; y-axis: Weibull probability scale. The line slope is β, and the time at F = 63.2% is η.',
  ),
  next: loc('下一课：Burn-in 与早期失效筛选', 'Next: Burn-in and early-failure screening'),
  task1: loc('n = 50，β 估计误差小于 15%。', 'n = 50 with the β error below 15%.'),
  task2: loc('n = 10，观察 β、η 的误差变大（与 T1 对比）。', 'n = 10: see the β and η errors grow (compare with T1).'),
  task3: loc('由 β̂ 小于 1 判断失效模式为早期失效。', 'Use β̂ below 1 to name the failure mode as early failure.'),
  task4: loc('设置 AF（如 77.7），外推使用条件的 B10。', 'Set the AF (for example 77.7) and extrapolate the use-condition B10.'),
}

export const INTRO = [
  loc(
    '寿命数据是“多少小时后失效”的记录。两参数 Weibull 分布用形状 β 描述失效率随时间怎样变化，用尺度 η 描述寿命的量级：F(η) = 1 − e^(−1) ≈ 63.2%。把失效数据排好秩后画在 Weibull 概率图上，点近似落在一条直线上，斜率就是 β；β 的含义见 {@relBathtub}。',
    'Life data records how many hours until failure. The two-parameter Weibull distribution describes the failure-rate trend with the shape β and the life scale with η, where F(η) = 1 − e^(−1) ≈ 63.2%. Plot the ranked failures on a Weibull probability plot and the points fall near a line whose slope is β; the meaning of β is in {@relBathtub}.',
  ),
  loc(
    '试验数据往往不完整：到试验结束仍未失效的器件是截尾（右删失）数据，它只告诉你“活过了这个时间”。应力条件下的 η 要乘以加速因子 AF 才是使用条件下的 η，AF 的算法见 {@relAccel}，试验设计见 {@relStress}。',
    'Test data are often incomplete: units still working at the end are right-censored, and they only tell you the unit survived that long. The stress-condition η must be multiplied by the acceleration factor AF to give the use-condition η; the AF method is in {@relAccel} and the test design in {@relStress}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '失效数很少也能精确拟合。点越少，β 与 η 的误差越大；本课示例里 n = 10 的误差可以超过 20%，而 n = 1000 时通常在几个百分点以内。拟合数字要连同误差一起看。',
    'A few failures still give an exact fit. Fewer points mean larger errors in β and η: in this lesson n = 10 can exceed 20% error, while n = 1000 is usually within a few percent. Read the fit together with its error.',
  ),
  loc(
    '忽略截尾数据。把截尾器件当作失效，或者直接删掉，都会把寿命估低（η 偏小）。正确做法是按右删失处理：截尾点不画成失效点，但占据顺序位置。',
    'Ignoring censored data. Treating censored units as failures, or deleting them, biases the life low (η too small). The right way is right-censoring: censored units are not plotted as failures but still take a place in the order.',
  ),
  loc(
    '直接把应力条件的寿命当使用寿命。应力下的 η 要乘以 AF 才是使用条件下的 η；而且外推只在同一失效机理成立时才可靠。',
    'Taking the stress-condition life as the use life. The stress η must be multiplied by AF to give the use η, and extrapolation is reliable only when the same failure mechanism holds.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Weibull：F(t) = 1 − exp[−(t/η)^β]，线性化后 ln(−ln(1−F)) = β·ln t − β·ln η，斜率为 β。截尾数据按右删失处理；n 小则 β、η 误差大；外推用 η_use = η_stress × AF，B10 = η·(−ln 0.9)^(1/β)。',
  'Weibull: F(t) = 1 − exp[−(t/η)^β]; linearised, ln(−ln(1−F)) = β·ln t − β·ln η, so the slope is β. Treat censored data as right-censored; small n gives large β and η errors; extrapolate with η_use = η_stress × AF, and B10 = η·(−ln 0.9)^(1/β).',
)

/** 小测数字由同一套公式算出 */
const B10_REF = 1000 * Math.pow(-Math.log(1 - B10_F), 1 / 2)
const B10_USE = B10_REF * DEFAULT_AF

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Weibull 概率图上的直线斜率为 β。哪种情况说明失效集中在早期？', 'On a Weibull plot the line slope is β. Which case points to early failures?'),
    options: [
      { id: 'a', text: loc('β > 1', 'β > 1') },
      { id: 'b', text: loc('β < 1', 'β < 1') },
      { id: 'c', text: loc('β = 0', 'β = 0') },
    ],
    answer: 'b',
    explain: loc(
      'β < 1 时 h(t) ∝ t^(β−1) 随时间下降，失效率越到后面越低，失效集中在早期；β > 1 是磨损；β = 0 不是合理的 Weibull 形状。',
      'With β < 1, h(t) ∝ t^(β−1) falls with time, so the failure rate drops later on and failures cluster early. β > 1 is wear-out; β = 0 is not a valid Weibull shape.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于截尾数据，哪几句是对的？① 截尾器件在试验结束时仍未失效，应按右删失处理，不当作失效；② 把截尾器件当作失效处理，会把 η 估小；③ 直接删掉所有截尾器件，估计仍然无偏。',
      'Which statements about censored data are correct? ① Censored units are still working at the end and should be treated as right-censored, not failures; ② treating censored units as failures biases η low; ③ deleting all censored units still gives an unbiased estimate.',
    ),
    options: [
      { id: 'a', text: loc('① 和 ②', '① and ②') },
      { id: 'b', text: loc('② 和 ③', '② and ③') },
      { id: 'c', text: loc('①、②、③ 都对', '① ② ③ are all correct') },
    ],
    answer: 'a',
    explain: loc(
      '①和②对。③错：删掉长寿命的截尾器件只剩短寿命的样本，寿命会被系统地估低。',
      '① and ② are correct. ③ is wrong: deleting long-lived censored units leaves only short-lived samples, so the life is systematically underestimated.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('同一种子下，n = 10 和 n = 1000 相比，关于 β 估计的说法哪个对？', 'With the same seed family, which statement about β estimates for n = 10 versus n = 1000 is right?'),
    options: [
      { id: 'a', text: loc('n = 10 的估计更不确定，平均误差通常更大', 'n = 10 is less certain and its average error is usually larger') },
      { id: 'b', text: loc('n = 10 更准，因为点少更容易画直线', 'n = 10 is more accurate because fewer points are easier to line up') },
      { id: 'c', text: loc('样本量对估计没有影响', 'Sample size has no effect on the estimate') },
    ],
    answer: 'a',
    explain: loc(
      '估计的标准误差随 n 增大而减小。本课用 30 个种子取平均：n = 10 的平均 β 误差明显大于 n = 1000。',
      'The standard error of the estimate shrinks as n grows. In this lesson, averaging over 30 seeds, the mean β error for n = 10 is clearly larger than for n = 1000.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '应力条件下 η = 1000 h，AF = 77.7，β = 2。使用条件下的 B10 约为多少小时？',
      'Stress-condition η = 1000 h, AF = 77.7, β = 2. About what is the use-condition B10 in hours?',
    ),
    options: [
      { id: 'a', text: fill(loc('{v} h（忘了乘 AF）', '{v} h (forgot to multiply by AF)'), { v: f1(B10_REF) }) },
      { id: 'b', text: fill(loc('{v} h（把 AF 当成 1/10）', '{v} h (treated AF as 1/10)'), { v: f0(B10_REF * (DEFAULT_AF / 10)) }) },
      { id: 'c', text: loc(`${f0(B10_USE)} h`, `${f0(B10_USE)} h`) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'B10 = η·(−ln 0.9)^(1/β) = 1000 × 0.1054^(0.5) ≈ {ref} h（应力条件）；使用条件 η_use = η × AF，B10_use = {ref} × 77.7 ≈ {use} h。',
        'B10 = η·(−ln 0.9)^(1/β) = 1000 × 0.1054^(0.5) ≈ {ref} h (stress); use-condition η_use = η × AF, so B10_use = {ref} × 77.7 ≈ {use} h.',
      ),
      { ref: f1(B10_REF), use: f0(B10_USE) },
    ),
  },
  {
    id: 'q5',
    prompt: loc('β = 2、η = 1000 h（应力条件，未外推）。F(t) = 10% 的时间约为多少？', 'β = 2, η = 1000 h (stress condition, not yet extrapolated). About what time is F(t) = 10%?'),
    options: [
      { id: 'a', text: loc(`${f1(B10_REF)} h`, `${f1(B10_REF)} h`) },
      { id: 'b', text: loc('1000 h（就是 η）', '1000 h (that is η)') },
      { id: 'c', text: loc('100 h', '100 h') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'η 是 F = 63.2% 时的时间，10% 失效的时间比 η 短：t = η·(−ln 0.9)^(1/β) = 1000 × 0.1054^(1/2) ≈ {ref} h。',
        'η is the time at F = 63.2%, so the 10% point is earlier: t = η·(−ln 0.9)^(1/β) = 1000 × 0.1054^(1/2) ≈ {ref} h.',
      ),
      { ref: f1(B10_REF) },
    ),
  },
  {
    id: 'q6',
    prompt: loc('把应力条件的 η 外推到使用条件，正确的换算是哪一个？', 'Which conversion correctly extrapolates a stress η to use conditions?'),
    options: [
      { id: 'a', text: loc('η_use = η_stress', 'η_use = η_stress') },
      { id: 'b', text: loc('η_use = η_stress × AF', 'η_use = η_stress × AF') },
      { id: 'c', text: loc('η_use = η_stress / AF', 'η_use = η_stress / AF') },
    ],
    answer: 'b',
    explain: loc(
      'AF 是应力条件相对使用条件的加速倍数：应力下 1 h 相当于使用条件下 AF 小时，所以寿命要乘 AF。直接把 η_stress 当 η_use 会把寿命估得过短。',
      'AF is how many times faster the stress runs than use: one stress hour is worth AF use hours, so life is multiplied by AF. Using η_stress directly as η_use underestimates the life.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '哪几句关于 β 与失效模式的判断是对的？① β < 1 为早期失效，失效率随时间下降；② β ≈ 1 为随机失效，失效率近似恒定；③ β > 1 为磨损失效，失效率随时间下降。',
      'Which statements about β and failure mode are correct? ① β < 1 is early failure, with the failure rate falling over time; ② β ≈ 1 is random failure, with a roughly constant failure rate; ③ β > 1 is wear-out, with the failure rate falling over time.',
    ),
    options: [
      { id: 'a', text: loc('② 和 ③', '② and ③') },
      { id: 'b', text: loc('① 和 ②', '① and ②') },
      { id: 'c', text: loc('①、②、③ 都对', '① ② ③ are all correct') },
    ],
    answer: 'b',
    explain: loc(
      '①和②对。③错：β > 1 时失效率随时间上升，正是磨损的特征。',
      '① and ② are correct. ③ is wrong: for β > 1 the failure rate rises with time, which is the signature of wear-out.',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '只有 n = 5 个样本时，拟合得到 β̂ = 1.2，有人说“β 确认大于 1，是磨损失效”。这个结论有什么问题？',
      'With only n = 5, the fit gives β̂ = 1.2, and someone says “β is confirmed above 1, so it is wear-out.” What is wrong with this?',
    ),
    options: [
      { id: 'a', text: loc('没有问题，β 大于 1 就能判断', 'Nothing is wrong; β above 1 settles it') },
      { id: 'b', text: loc('直接看 β 的正负号就够了', 'The sign of β alone is enough') },
      { id: 'c', text: loc('样本太少，β 的不确定性很大，结论不可靠，要看误差范围或增加样本', 'The sample is too small, so β is very uncertain; the conclusion is unreliable and needs error bounds or more units') },
    ],
    answer: 'c',
    explain: loc(
      '5 个点的斜率误差很大，1.2 与 1 的差距完全可能只是抽样波动。判断失效模式要结合误差范围，并增加样本或截尾数据。',
      'The slope from 5 points is very uncertain, and a gap of 1.2 versus 1 can easily be sampling noise. Judge the failure mode with its error range, and add units or data.',
    ),
  },
  {
    id: 'q9',
    prompt: loc(
      '一批 n = 50 的数据里，12 颗失效，38 颗在试验结束时仍未失效（截尾）。参与 Weibull 回归的失效点有多少个？',
      'A batch of n = 50 has 12 failures and 38 units still working at the end (censored). How many failure points enter the Weibull regression?',
    ),
    options: [
      { id: 'a', text: loc('12', '12') },
      { id: 'b', text: loc('50', '50') },
      { id: 'c', text: loc('38', '38') },
    ],
    answer: 'a',
    explain: loc(
      '截尾点不画成失效点，所以参与回归的只有 12 个失效点。但 38 个截尾点仍占据顺序位置，使后面失效点的中位秩被正确抬高。',
      'Censored units are not plotted as failures, so only the 12 failure points enter the regression. The 38 censored units still take their place in the order, which correctly raises the median ranks of the later failures.',
    ),
  },
]

/** 任务卡：完成与否由当前参数与拟合结果判定 */
export function taskItems(state: WeibullState, a: WeibullAnalysis): TaskItem[] {
  return [
    { id: 'n50', text: S.task1, done: state.n >= 50 && a.finite && a.errBeta < 0.15 },
    { id: 'n10', text: S.task2, done: state.n <= 10 },
    { id: 'early', text: S.task3, done: a.finite && a.fit.beta < 1 },
    { id: 'b10', text: S.task4, done: state.af >= 10 && Number.isFinite(a.b10Use) },
  ]
}

export function modeLabel(mode: FailureMode): LText {
  if (mode === 'early') {
    return S.modeEarly
  }
  return mode === 'random' ? S.modeRandom : S.modeWear
}

/** 右侧说明栏：由拟合出的 β̂ 给失效模式，并写出原因与误差 */
export function verdictOf(
  state: WeibullState,
  a: WeibullAnalysis,
  mode: FailureMode,
): { title: LText; text: LText } {
  if (!a.finite) {
    return { title: S.vNoFit, text: fill(S.vNoFitText, { f: String(a.failures) }) }
  }
  const vars = {
    beta: f2(a.fit.beta),
    err: f1(a.errBeta * 100),
    n: String(state.n),
    f: String(a.failures),
    c: String(a.censored),
    b10: f0(a.b10Use),
    b10t: f0(a.b10True),
  }
  const body = fill(mode === 'early' ? S.vEarlyText : mode === 'random' ? S.vRandomText : S.vWearText, vars)
  const extra = fill(S.vExtrap, vars)
  return { title: modeLabel(mode), text: loc(body.zh + extra.zh, `${body.en ?? body.zh} ${extra.en ?? extra.zh}`) }
}

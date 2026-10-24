import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { reliabilityFromFit, mttfFromFit } from './core/reliability'
import { FIVE_YEARS_H, HOURS_PER_YEAR, PPM_TARGET, SEG_IDS, fmtHours, type BathAnalysis, type BathState, type SegId } from './relBathtubModel'

/** 把占位符 {key} 换成数字文字，中英文都替换（数字本身不翻译） */
export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f5 = (value: number) => value.toFixed(5)

export const SEG_LABEL: Record<SegId, LText> = {
  random: loc('随机段', 'Random segment'),
  early: loc('早期段', 'Early segment'),
  wear: loc('磨损段', 'Wear-out segment'),
}

export const SEG_OPTIONS = SEG_IDS.map((id) => ({ id, label: SEG_LABEL[id] }))

export const S = {
  kickerNow: loc('这一次曲线', 'This curve'),
  introTitle: loc('失效率、可靠度与浴盆曲线', 'Failure rate, reliability and the bathtub curve'),
  coreTitle: loc('拨一拨：三段失效与可靠度', 'Try it: the three failure segments and reliability'),
  coreNote: loc(
    '群体是 5000 颗器件的蒙特卡洛样本，随机种子固定，所以同样的设置每次结果一样。左图是失效率 h(t)（FIT，对数纵轴），中图是可靠度 R(t)，右图是失效数直方图（蓝柱为蒙特卡洛计数，金线为解析期望）。阴影是“ELFR 覆盖的段”，由下方的选择决定。',
    'The population is a Monte Carlo sample of 5000 devices with a fixed random seed, so the same settings always give the same result. The left plot is the failure rate h(t) (FIT, log scale), the middle plot is the reliability R(t), and the right plot is the failure histogram (blue bars: Monte Carlo counts; gold line: analytic expectation). The shaded band is the segment covered by ELFR, chosen below.',
  ),
  earlyLabel: loc('早期缺陷群体比例', 'Early-defect fraction'),
  betaEarlyLabel: loc('早期群体 β（< 1）', 'Early-group β (< 1)'),
  etaEarlyLabel: loc('早期群体 η（特征寿命）', 'Early-group η (characteristic life)'),
  randomLabel: loc('随机段 λ', 'Random-segment λ'),
  betaWearLabel: loc('磨损群体 β（> 1）', 'Wear-out β (> 1)'),
  etaWearLabel: loc('磨损群体 η（特征寿命）', 'Wear-out η (characteristic life)'),
  screenLabel: loc('筛选（老化）时间', 'Screening (burn-in) time'),
  segLabel: loc('ELFR 覆盖哪一段', 'Which segment ELFR covers'),
  resample: loc('换一批样本（改随机种子）', 'Draw a new sample (change seed)'),
  rEarlyEnd: loc('早期段结束 t₁（h 降到 2λ 以下）', 'Early segment ends t₁ (h falls below 2λ)'),
  rBottom: loc('浴盆底：最低失效率 h', 'Bottom of the bathtub: lowest h'),
  rWearStart: loc('磨损段开始 t₂（h 回升到 2λ）', 'Wear-out starts t₂ (h rises back to 2λ)'),
  rMttf: loc('随机段 MTTF = 1/λ', 'Random-segment MTTF = 1/λ'),
  rR5Full: loc('5 年可靠度 R（全群体）', '5-year reliability R (whole population)'),
  rR5Random: loc('5 年可靠度（只看随机段）', '5-year reliability (random segment only)'),
  rR90: loc('R = 0.9 对应的时间', 'Time at which R = 0.9'),
  rMc: loc('5 年内失效：蒙特卡洛计数 / 解析期望', 'Failures within 5 years: Monte Carlo count / analytic expectation'),
  rPpm: loc('出货残余早期缺陷（筛选后，ppm）', 'Residual early defects after screening (ppm)'),
  unitYear: loc('年', 'yr'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '加速因子（REL-02）、试验时长与样本量（REL-03）、Weibull 拟合（REL-04）会在后面的课里展开；这里只建立三段失效的概念。',
    'Acceleration factors (REL-02), test duration and sample size (REL-03) and Weibull fitting (REL-04) come in later lessons; here we only build the idea of the three failure segments.',
  ),
  next: loc('下一课：失效机理与加速模型', 'Next: Failure mechanisms and acceleration models'),
  task1: loc('把随机段 λ 设为 100 FIT，读出随机段 MTTF（应为 10⁷ h）。', 'Set the random-segment λ to 100 FIT and read the random-segment MTTF (it should be 10⁷ h).'),
  task2: loc(
    '把早期比例设为 0、磨损段 η 推到 10⁶ h，只剩随机段，读出 5 年可靠度（应为 0.99563）。',
    'Set the early fraction to 0 and push the wear-out η to 10⁶ h, leaving only the random segment; read the 5-year reliability (it should be 0.99563).',
  ),
  task3: loc(
    '调高筛选时间，让出货残余早期缺陷降到 1000 ppm 以下（教学目标）。',
    'Raise the screening time until the residual early defects in shipped parts are below 1000 ppm (a teaching target).',
  ),
  task4: loc('把 ELFR 覆盖的段选为早期段，看阴影覆盖的时间范围。', 'Choose the early segment for ELFR and look at the time range the shading covers.'),
  vEarly: loc('ELFR 覆盖早期段', 'ELFR covers the early segment'),
  vRandom: loc('ELFR 不以随机段为目标', 'ELFR does not target the random segment'),
  vWear: loc('ELFR 覆盖不到磨损段', 'ELFR cannot reach the wear-out segment'),
  vEarlyText: loc(
    '早期段结束于约 {t1}。原因：这一段失效率高、并随时间下降，短时间的应力就能把其中的弱品提前暴露。当前出货残余早期缺陷约 {ppm} ppm（教学目标 {target} ppm）。',
    'The early segment ends at about {t1}. Reason: this segment has a high failure rate that falls with time, so a short stress can expose the weak parts early. The residual early defects in shipped parts are about {ppm} ppm (teaching target {target} ppm).',
  ),
  vRandomText: loc(
    '随机段的 λ 恒定，MTTF = 1/λ = {mttf}。随机失效与时间无关，短时间的试验很难抓到它，所以 ELFR 不以这一段为目标。',
    'In the random segment λ is constant and MTTF = 1/λ = {mttf}. Random failures do not depend on time, so a short test rarely catches them; ELFR therefore does not target this segment.',
  ),
  vWearText: loc(
    '磨损段在约 {t2} 之后才明显上升。ELFR 只有短时间，覆盖不到它；要用寿命试验或外推来看磨损（见 {@relWeibull}）。',
    'The wear-out segment rises noticeably only after about {t2}. ELFR is short and cannot reach it; use a life test or extrapolation to see wear-out (see {@relWeibull}).',
  ),
}

export const FIG = {
  bathAria: loc(
    '失效率 h(t) 随时间变化的曲线，横轴为对数时间，纵轴为对数 FIT，并标出 ELFR 覆盖的段',
    'Failure rate h(t) versus time: log time on the x-axis, log FIT on the y-axis, with the segment covered by ELFR shaded',
  ),
  bathTitle: loc('失效率 h(t)', 'Failure rate h(t)'),
  bathCap: loc(
    '曲线先高后低，再在末端回升：左侧是早期段，中间平坦的是随机段，右侧回升的是磨损段。虚线标出 t₁ 与 t₂。',
    'The curve starts high, falls, then rises at the end: the left is the early segment, the flat middle is the random segment, and the rising right end is wear-out. Dashed lines mark t₁ and t₂.',
  ),
  relAria: loc('可靠度 R(t) 曲线：全群体与只看随机段两条', 'Reliability R(t) curves: whole population and random segment only'),
  relTitle: loc('可靠度 R(t)', 'Reliability R(t)'),
  relCap: loc(
    '金线是全群体，蓝虚线是只看随机段的 exp(−λt)。两条线在早期与磨损的影响下分开，虚线标出 R = 0.9 的位置。',
    'The gold line is the whole population; the blue dashed line is exp(−λt) for the random segment only. The two diverge because of early and wear-out failures; the dotted line marks R = 0.9.',
  ),
  histAria: loc('失效数直方图：蒙特卡洛计数与解析期望的对比', 'Failure histogram: Monte Carlo counts against the analytic expectation'),
  histTitle: loc('失效数（每个对数时间箱）', 'Failures per log-time bin'),
  histCap: loc(
    '蓝柱是 5000 颗样本里落在每个时间箱的失效数，金线是同一箱的解析期望。两者只差随机抽样的波动，偏差应在 3σ 以内。',
    'Blue bars are the failures of the 5000 sampled devices in each time bin; the gold line is the analytic expectation for the same bin. They differ only by sampling noise, which should stay within 3σ.',
  ),
  axT: loc('时间 t（h，对数）', 'Time t (h, log)'),
  axH: loc('h(t)（FIT，对数）', 'h(t) (FIT, log)'),
  legHazard: loc('金线：h(t) 全群体', 'Gold: h(t), whole population'),
  legRel: loc('金线：R(t) 全群体', 'Gold: R(t), whole population'),
  legRandom: loc('蓝虚线：随机段 exp(−λt)', 'Blue dashed: random segment exp(−λt)'),
  legMc: loc('蓝柱：蒙特卡洛计数', 'Blue bars: Monte Carlo counts'),
  legExp: loc('金线：解析期望', 'Gold line: analytic expectation'),
  legBand: loc('阴影：ELFR 覆盖的段', 'Shaded: segment covered by ELFR'),
}

export const INTRO = [
  loc(
    '可靠性研究的是“产品能用多久，会有多少失效”。最常用的描述是失效率 λ(t)：在时间 t 仍然存活的器件，单位时间里失效的比例。把 λ(t) 随时间画出来，常是两端高、中间低的曲线，叫浴盆曲线。',
    'Reliability asks how long a product keeps working and how many fail. The usual description is the failure rate λ(t): among devices still working at time t, the fraction that fail per unit time. Plotted against time it often looks like a bathtub: high at both ends, low in the middle.',
  ),
  loc(
    '浴盆曲线分三段：早期失效（前几百小时内，潜在缺陷暴露，失效率随时间下降）、随机失效（失效率基本恒定，与时间无关）、磨损失效（老化机理累积，失效率随时间上升）。用 Weibull 形状参数 β 描述：β < 1 是早期，β = 1 是随机，β > 1 是磨损。加速模型见 {@relAccel}。',
    'The bathtub curve has three segments: infant mortality (in the first few hundred hours, latent defects show up and the failure rate falls), random failures (the failure rate is roughly constant), and wear-out (aging mechanisms accumulate and the failure rate rises). The Weibull shape β describes them: β < 1 is early, β = 1 is random, β > 1 is wear-out. Acceleration models are in {@relAccel}.',
  ),
  loc(
    '这一课是 REL 系列的第一课。统计与数据基础（Cpk、中位数等）见 {@anaStats}，测试数据的格式见 {@genStdf}；出厂测试、Burn-in 与寿命试验分别对准浴盆曲线的哪一段，是本课的主要问题。',
    'This is the first lesson of the REL series. Statistics and data basics (Cpk, medians) are in {@anaStats}, and the test-data format is in {@genStdf}. Which segment production test, burn-in and life test each address is the main question of this lesson.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'MTTF 就是器件的寿命。MTTF 是平均意义：λ 恒定时 MTTF = 1/λ，但 R(MTTF) = e⁻¹ ≈ 0.37，也就是说到这个时间约 63% 的器件已经失效，个别器件可能远早于它。',
    'MTTF is the lifetime. It is an average: with a constant λ, MTTF = 1/λ, but R(MTTF) = e⁻¹ ≈ 0.37, so by that time about 63% of devices have failed, and some fail much earlier.',
  ),
  loc(
    'FIT 越大越好。FIT 是失效率，数越大失效越多、越不可靠；100 FIT 的失效率只有 1000 FIT 的十分之一。',
    'A larger FIT is better. FIT is a failure rate: the larger it is, the more failures and the less reliable the part; 100 FIT is one tenth of 1000 FIT.',
  ),
  loc(
    '良率高就等于可靠。良率只说明出厂时通过测试的比例；潜在缺陷的早期失效与随时间累积的磨损，要靠 Burn-in、统计筛选和寿命试验去抓。',
    'High yield means high reliability. Yield is only the fraction that passes test at shipment; latent early failures and wear-out that builds up over time are caught by burn-in, statistical screening and life tests.',
  ),
]

export const TAKEAWAY: LText = loc(
  '浴盆曲线三段：早期（β < 1，失效率下降）、随机（β = 1，λ 恒定，MTTF = 1/λ）、磨损（β > 1，失效率上升）。λ 恒定时 R(t) = exp(−λt)；FIT = 每 10⁹ 器件小时的失效数，MTTF(h) = 10⁹ / FIT。出厂测试、Burn-in、寿命试验各自对准浴盆曲线的不同段。',
  'Three segments of the bathtub curve: early (β < 1, failure rate falling), random (β = 1, λ constant, MTTF = 1/λ) and wear-out (β > 1, failure rate rising). With constant λ, R(t) = exp(−λt); FIT = failures per 10⁹ device-hours, and MTTF(h) = 10⁹ / FIT. Production test, burn-in and life test each address a different segment of the bathtub curve.',
)

/** 小测题中的数字由同一套函数算出，与页面保持一致 */
const MTTF_100 = mttfFromFit(100)
const R_5Y_100 = reliabilityFromFit(100, FIVE_YEARS_H)
const YEARS_1E7 = 1e7 / HOURS_PER_YEAR

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('一批器件的 MTTF 为 10⁷ h（失效率恒定），下面哪句最准确？', 'A batch of devices has an MTTF of 10⁷ h (constant failure rate). Which statement is most accurate?'),
    options: [
      { id: 'a', text: loc('每颗器件都能用到 10⁷ h', 'Every device lasts 10⁷ h') },
      { id: 'b', text: loc('这是平均值：到 10⁷ h 时约 63% 已失效，个别器件可能远早于它', 'It is an average: by 10⁷ h about 63% have failed, and some fail much earlier') },
      { id: 'c', text: loc('到 10⁷ h 时，全部器件同时失效', 'At 10⁷ h all devices fail at the same moment') },
    ],
    answer: 'b',
    explain: loc(
      '恒定失效率下 R(MTTF) = e⁻¹ ≈ 0.37，所以到 MTTF 时约 63% 已经失效。MTTF 是对整个群体的平均，不是每颗器件的寿命。',
      'With a constant failure rate R(MTTF) = e⁻¹ ≈ 0.37, so about 63% have failed by MTTF. MTTF averages over the population; it is not each device’s lifetime.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于 FIT 与 MTTF，下列哪些说法正确？(1) FIT 是每 10⁹ 器件小时的失效数；(2) λ 恒定时 MTTF(h) = 10⁹ / FIT；(3) FIT 越大，器件越可靠；(4) MTTF 是所有器件的寿命上限。',
      'Which statements about FIT and MTTF are correct? (1) FIT is failures per 10⁹ device-hours; (2) with constant λ, MTTF(h) = 10⁹ / FIT; (3) the larger the FIT, the more reliable the device; (4) MTTF is an upper limit on every device’s life.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1) 与 (2) 是 FIT 的定义与换算。(3) 反了：FIT 越大失效越多。(4) 错：MTTF 是平均，有的器件远早于它失效，也有的远晚于它。',
      '(1) and (2) are the definition and conversion of FIT. (3) is reversed: the larger the FIT, the more failures. (4) is wrong: MTTF is an average, and some devices fail far earlier while others last far longer.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('随机段失效率 λ = 100 FIT，MTTF 约是多少小时？', 'The random-segment failure rate is λ = 100 FIT. About how many hours is the MTTF?'),
    options: [
      { id: 'a', text: loc('1×10⁶ h', '1×10⁶ h') },
      { id: 'b', text: loc('1×10⁹ h', '1×10⁹ h') },
      { id: 'c', text: loc(fmtHours(MTTF_100), fmtHours(MTTF_100)) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'MTTF(h) = 10⁹ / FIT = 10⁹ / 100 = {mttf}。注意 FIT 的单位是“每 10⁹ 器件小时”，换算时分子是 10⁹。',
        'MTTF(h) = 10⁹ / FIT = 10⁹ / 100 = {mttf}. Note that FIT is failures per 10⁹ device-hours, so the numerator is 10⁹.',
      ),
      { mttf: fmtHours(MTTF_100) },
    ),
  },
  {
    id: 'q4',
    prompt: loc('λ = 100 FIT 的随机段，5 年（43800 h）的可靠度 R = exp(−λt) 约是多少？', 'For the random segment with λ = 100 FIT, about what is the 5-year (43800 h) reliability R = exp(−λt)?'),
    options: [
      { id: 'a', text: loc('0.90000', '0.90000') },
      { id: 'b', text: loc(f5(R_5Y_100), f5(R_5Y_100)) },
      { id: 'c', text: loc('0.99999', '0.99999') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'λt = 100×10⁻⁹ × 43800 = 0.00438，R = exp(−0.00438) ≈ {r}。失效率很低时，5 年内几乎都还在。',
        'λt = 100×10⁻⁹ × 43800 = 0.00438, so R = exp(−0.00438) ≈ {r}. When the failure rate is very low, almost all devices are still working after 5 years.',
      ),
      { r: f5(R_5Y_100) },
    ),
  },
  {
    id: 'q5',
    prompt: loc('10⁷ h 约合多少年？（取每年 8760 h）', 'About how many years is 10⁷ h? (Use 8760 h per year.)'),
    options: [
      { id: 'a', text: fill(loc('约 {v} 年', 'About {v} years'), { v: f0(YEARS_1E7) }) },
      { id: 'b', text: fill(loc('约 {v} 年', 'About {v} years'), { v: f0(YEARS_1E7 / 10) }) },
      { id: 'c', text: fill(loc('约 {v} 年', 'About {v} years'), { v: f0(YEARS_1E7 * 10) }) },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '10⁷ / 8760 ≈ {exact} 年，约 {v} 年。10⁷ h 是 MTTF 的平均意义，远超一个产品的使用寿命，它不是“能用这么久”的承诺。',
        '10⁷ / 8760 ≈ {exact} years, about {v} years. 10⁷ h is an average value far beyond any product’s service life; it is not a promise that the device lasts that long.',
      ),
      { exact: f1(YEARS_1E7), v: f0(YEARS_1E7) },
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '关于出厂测试、Burn-in 与浴盆曲线，下列哪些说法正确？(1) 出厂测试主要剔除可测的硬缺陷；(2) Burn-in 主要针对早期失效段；(3) 出厂测试能看出磨损段的失效；(4) Burn-in 能把随机段的失效率降到零。',
      'Which statements about production test, burn-in and the bathtub curve are correct? (1) Production test mainly removes testable hard defects; (2) burn-in mainly targets the early segment; (3) production test reveals wear-out failures; (4) burn-in can bring the random-segment failure rate to zero.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'c', text: loc('(1)、(2)', '(1), (2)') },
    ],
    answer: 'c',
    explain: loc(
      '(3) 错：磨损靠时间累积，出厂时还没有发生。(4) 错：随机失效是恒定失效率，筛选只能把早期群体的弱品剔掉，不能让随机段归零。',
      '(3) is wrong: wear-out builds up with time and has not happened at shipment. (4) is wrong: random failures have a constant failure rate, and screening only removes weak early-group parts; it cannot bring the random segment to zero.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('某批产品出厂测试 100% 通过、良率 99%。能否据此说它 5 年内不会失效？', 'A lot passes production test 100% with 99% yield. Can we conclude that it will not fail within 5 years?'),
    options: [
      { id: 'a', text: loc('能，良率高就说明可靠', 'Yes: high yield means high reliability') },
      { id: 'b', text: loc('不能：良率只说明出厂时通过测试；早期缺陷、随机失效与磨损要分别评估', 'No: yield only shows the parts passed at shipment; early defects, random failures and wear-out must be assessed separately') },
      { id: 'c', text: loc('能，只要测试覆盖率是 100%', 'Yes, as long as test coverage is 100%') },
    ],
    answer: 'b',
    explain: loc(
      '出厂测试抓的是“可测的”缺陷。潜在缺陷可能通过测试、在使用中早期失效；随机失效与磨损也与出厂测试无关。所以良率与可靠性是两件事。',
      'Production test catches testable defects. Latent defects can pass test and then fail early in use; random failures and wear-out are not revealed by production test either. So yield and reliability are two different things.',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '关于 Weibull 形状参数 β，下列哪些说法正确？(1) β < 1 对应早期段，失效率随时间下降；(2) β = 1 对应随机段，失效率恒定；(3) β > 1 对应磨损段，失效率随时间上升；(4) β 越大，特征寿命 η 越长。',
      'Which statements about the Weibull shape β are correct? (1) β < 1 is the early segment, with a falling failure rate; (2) β = 1 is the random segment, with a constant failure rate; (3) β > 1 is wear-out, with a rising failure rate; (4) the larger β, the longer the characteristic life η.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(3)', '(1), (2), (3)') },
      { id: 'b', text: loc('(1)、(4)', '(1), (4)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1)(2)(3) 是 β 与失效率形状的对应关系。(4) 错：η 是尺度参数，表示约 63% 失效的时间；β 决定曲线的形状，不决定 η 的大小。',
      '(1), (2) and (3) are the links between β and the shape of the failure rate. (4) is wrong: η is the scale parameter, the time by which about 63% have failed; β sets the shape, not the size of η.',
    ),
  },
]

/** 四张任务卡：完成与否由当前设置与分析结果算出，重置后自动还原 */
export function taskItems(state: BathState, a: BathAnalysis): TaskItem[] {
  return [
    { id: 'random-mttf', text: S.task1, done: state.randomFit === 100 },
    { id: 'pure-random', text: S.task2, done: state.earlyFrac === 0 && state.etaWear >= 1e6 && state.randomFit === 100 },
    { id: 'screen-ppm', text: S.task3, done: a.shipPpm <= PPM_TARGET },
    { id: 'elfr-early', text: S.task4, done: state.seg === 'early' },
  ]
}

/** 右侧说明栏：按 ELFR 覆盖的段给结论，并写出原因和数值 */
export function verdictOf(state: BathState, a: BathAnalysis): { title: LText; text: LText } {
  const common = { ppm: f0(a.shipPpm), target: f0(PPM_TARGET) }
  if (state.seg === 'early') {
    return { title: S.vEarly, text: fill(S.vEarlyText, { ...common, t1: fmtHours(a.t1) }) }
  }
  if (state.seg === 'wear') {
    return { title: S.vWear, text: fill(S.vWearText, { t2: fmtHours(a.t2) }) }
  }
  return { title: S.vRandom, text: fill(S.vRandomText, { mttf: fmtHours(a.mttfRandomH) }) }
}

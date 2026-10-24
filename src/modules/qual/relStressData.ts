import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { arrheniusAF, chi2Quantile, fitUpperBound, minSampleZeroFail } from './core/reliability'
import { CL_OPTIONS, TEST_TYPES, T_USE_C, type StressAnalysis, type StressState, type TestType } from './relStressModel'

/** 把 {key} 换成数值，中英文都换 */
export function fill(text: LText, vars: Record<string, string>): LText {
  const sub = (s: string) => Object.keys(vars).reduce((acc, key) => acc.split(`{${key}}`).join(vars[key]), s)
  return loc(sub(text.zh), text.en === undefined ? undefined : sub(text.en))
}

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)
const sci = (value: number) => value.toExponential(2)

/** 参考加速因子：Ea 0.7 eV，55 → 125 °C，与 REL-02 的 T1 一致 */
export const REF_AF = arrheniusAF(0.7, T_USE_C, 125)

export const CL_SEG = CL_OPTIONS.map((cl) => ({ id: String(cl), label: `${Math.round(cl * 100)}%` }))

/** 试验类型一览：名称保留英文缩写，目的与应力用两种语言写 */
export const TEST_INFO: Record<TestType, { name: string; purpose: LText; stress: LText }> = {
  htol: {
    name: 'HTOL',
    purpose: loc(
      '高温工作寿命：加温度并加工作偏置，激发电迁移、TDDB、HCI 等硅片机理',
      'High-temperature operating life: temperature plus operating bias to excite EM, TDDB, HCI and other die mechanisms',
    ),
    stress: loc('Arrhenius 温度加速，示例 125 °C 加偏置', 'Arrhenius temperature acceleration, example 125 °C with bias'),
  },
  htsl: {
    name: 'HTSL',
    purpose: loc(
      '高温存储寿命：只加温度、不加偏置，考核封装材料、键合与金属间化合物的老化',
      'High-temperature storage life: temperature only, no bias; checks package materials, bonds and intermetallic ageing',
    ),
    stress: loc('Arrhenius 温度加速，示例 150 °C 存储', 'Arrhenius temperature acceleration, example 150 °C storage'),
  },
  tc: {
    name: 'TC',
    purpose: loc(
      '温度循环：反复冷热，不同材料热膨胀系数不同，焊点、键合和界面因疲劳而开裂',
      'Temperature cycling: repeated hot and cold; mismatched expansion fatigues solder joints, bonds and interfaces',
    ),
    stress: loc('Coffin-Manson 温差加速，使用 ΔT 65 °C（教学取值）', 'Coffin-Manson swing acceleration, use ΔT 65 °C (teaching value)'),
  },
  hast: {
    name: 'HAST',
    purpose: loc(
      '高加速温湿度应力：高温、高湿并加压，加快湿气侵入、腐蚀与分层',
      'Highly accelerated temperature-humidity stress: high temperature, humidity and pressure speed up moisture ingress, corrosion and delamination',
    ),
    stress: loc('本课只算温度项（Arrhenius），湿度效应未计入', 'Only the temperature term (Arrhenius) here; humidity effect not included'),
  },
}

export const TEST_SEG = TEST_TYPES.map((id) => ({ id, label: TEST_INFO[id].name }))

export const S = {
  kicker: loc('这一次试验方案', 'This test plan'),
  introTitle: loc('试验为什么要抽样，又怎么换算成 FIT', 'Why test a sample, and how it becomes a FIT'),
  coreTitle: loc('拨一拨：选试验类型，看样本与时间换来多少把握', 'Try it: pick a test and see what sample and time buy'),
  coreNote: loc(
    '试验类型决定应力：HTOL、HTSL、HAST 调应力温度，按 Arrhenius 算 AF；TC 调温度循环的温差，按 Coffin-Manson 算 AF。批次数乘以每批片数得到样本数 n。',
    'The test type sets the stress: HTOL, HTSL and HAST use the stress temperature with AF from Arrhenius; TC uses the cycle swing with AF from Coffin-Manson. Batches times units per batch gives the sample size n.',
  ),
  stdNote: loc('示例，以现行标准为准', 'Example; follow the current standard'),
  typeLabel: loc('试验类型', 'Test type'),
  batchesLabel: loc('批次数（示例：3 批，以现行标准为准）', 'Batches (example: 3; follow the current standard)'),
  perBatchLabel: loc('每批样本数（示例：77 片，以现行标准为准）', 'Units per batch (example: 77; follow the current standard)'),
  hoursLabel: loc('试验小时 h（示例，以现行标准为准）', 'Test hours h (example; follow the current standard)'),
  tStressLabel: loc('应力温度 T_stress（Arrhenius 类）', 'Stress temperature T_stress (Arrhenius type)'),
  dtStressLabel: loc('温度循环温差 ΔT_stress（TC）', 'Cycle temperature swing ΔT_stress (TC)'),
  eaLabel: loc('激活能 Ea（教学默认 0.7 eV）', 'Activation energy Ea (teaching default 0.7 eV)'),
  rLabel: loc('试验中的失效数 r', 'Failures during the test r'),
  clLabel: loc('置信度 CL', 'Confidence level CL'),
  targetLabel: loc('目标 FIT', 'Target FIT'),
  rN: loc('样本数 n（批次 × 每批）', 'Sample size n (batches × per batch)'),
  rAf: loc('加速因子 AF', 'Acceleration factor AF'),
  rDh: loc('器件小时 n × h（未加速）', 'Device hours n × h (unaccelerated)'),
  rEquiv: loc('等效器件小时 n × h × AF', 'Equivalent device hours n × h × AF'),
  rFit: loc('FIT 上限（按 CL 与 r）', 'FIT upper bound (for CL and r)'),
  rMin: loc('证明目标所需的最少样本数', 'Minimum sample to prove the target'),
  rPass: loc('是否达到目标', 'Meets the target?'),
  meets: loc('达到', 'Meets'),
  misses: loc('未达到', 'Misses'),
  figFitTitle: loc('FIT 上限随失效数 r 变化', 'FIT upper bound versus failures r'),
  figFitNote: loc(
    '同一样本与时间下，失效数每增加一个，χ² 的自由度增加 2，上限随之变大。红色圆点是当前的 r。',
    'With the same sample and time, each extra failure adds 2 degrees of freedom to χ² and raises the bound. The gold dot marks the current r.',
  ),
  figTradeTitle: loc('样本量 — 时间折中（r = 0）', 'Sample size versus time trade-off (r = 0)'),
  figTradeNote: loc(
    '每条曲线是同一个 FIT 目标：样本与时间的乘积相同，效果就相同，所以曲线是双曲线。金点是当前设置。',
    'Each curve is one FIT target: the same product of sample and time gives the same bound, so the curves are hyperbolas. The gold dot is the current setting.',
  ),
  figFitAria: loc('FIT 上限随失效数变化的折线图', 'Line chart of the FIT upper bound versus failures'),
  figTradeAria: loc('样本量与试验时间的折中曲线图', 'Trade-off chart of sample size versus test time'),
  figFitCap: loc('横轴是失效数 r，纵轴是 FIT 上限，虚线是目标 FIT。', 'x-axis: failures r; y-axis: FIT upper bound; dashed line: target FIT.'),
  figTradeCap: loc('横轴是试验小时，纵轴是样本数，每条线都满足一个 FIT 目标。', 'x-axis: test hours; y-axis: sample size; each line meets one FIT target.'),
  tableTitle: loc('试验类型一览', 'Test type overview'),
  tableNote: loc(
    '每种试验的目的都不同；条件只是示例，以现行标准为准。',
    'Each test has a different purpose; the conditions are examples only, follow the current standard.',
  ),
  colType: loc('试验', 'Test'),
  colPurpose: loc('目的', 'Purpose'),
  colStress: loc('应力与本课的算法', 'Stress and the model used here'),
  otherTests: loc(
    '另外两类不是寿命试验：ESD（人体模型 HBM、器件充电模型 CDM）与闩锁（过压或电流注入）测的是瞬态冲击下的承受能力，结果是通过或不通过，不估计使用寿命。',
    'Two more are not life tests: ESD (human-body model HBM and charged-device model CDM) and latch-up (overvoltage or current injection) check tolerance to transient stress. They give pass or fail and do not estimate a life.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  vPass: loc('达到目标', 'Meets the target'),
  vFail: loc('未达目标', 'Misses the target'),
  vPassText: loc(
    '上限 {fit} FIT 不超过目标 {target} FIT（CL {cl}%，r = {r}，n = {n}，AF = {af}）。原因：零失效或少量失效只给出“在 CL 下失效率不高于此值”的上限，不是零失效率；这个结论的前提是 AF 正确。',
    'The bound {fit} FIT is no more than the target {target} FIT (CL {cl}%, r = {r}, n = {n}, AF = {af}). Reason: zero or few failures give only a bound (“the failure rate is no higher than this at the stated CL”), not a zero failure rate; the conclusion also depends on the AF being right.',
  ),
  vFailText: loc(
    '上限 {fit} FIT 高于目标 {target} FIT。原因：n × h × AF 不够大，等效器件小时太少。证明目标至少需要 {min} 个样本（同 h、AF、CL、r）。加样本或加时间都能压低上限，代价是成本与周期。',
    'The bound {fit} FIT is above the target {target} FIT. Reason: n × h × AF is too small, so there are too few equivalent device hours. Proving the target needs at least {min} units (same h, AF, CL and r). More units or more hours both lower the bound, at the cost of money and time.',
  ),
  next: loc('下一课：Weibull 与 FIT', 'Next: Weibull and FIT'),
  task1: loc(
    'n = 231（3 批 × 77 片）、h = 1000、r = 0、CL = 60%，读出 FIT 上限（约 51）。',
    'n = 231 (3 batches × 77), h = 1000, r = 0, CL = 60%: read the FIT upper bound (about 51).',
  ),
  task2: loc('其它条件同 T1，把 CL 改为 90%，上限约 128 FIT。', 'Same as T1 but CL = 90%: the bound is about 128 FIT.'),
  task3: loc('其它条件同 T1，出现 r = 1 后重新计算上限。', 'Same as T1 but with r = 1 after the test: recompute the bound.'),
  task4: loc(
    '目标 50 FIT、CL 60%、固定 1000 h，求出最少样本量（约 236）。',
    'Target 50 FIT, CL 60%, fixed 1000 h: find the minimum sample size (about 236).',
  ),
}

export const INTRO: LText[] = [
  loc(
    '可靠性试验不可能把所有器件都做到失效。常见做法是抽一批样本，放在加速应力下工作或存放一段时间（HTOL、HTSL、温度循环、HAST 等），再用电学测试读点。试验中没有失效，并不说明失效率为零，只能给出一个在某个置信度下的上限。加速因子 AF 把试验小时换算成使用条件下的等效器件小时，AF 的算法见 {@relAccel}。',
    'Testing every device to failure is impossible. The usual practice is to take a sample, run it under accelerated stress (HTOL, HTSL, temperature cycling, HAST and so on), and read it electrically at checkpoints. Zero failures does not prove a zero failure rate: it gives only an upper bound at a chosen confidence level. The acceleration factor AF turns test hours into equivalent device hours at use conditions; the AF method is in {@relAccel}.',
  ),
  loc(
    '核心公式：DH_eq = n × h × AF；λ_upper = χ²(CL, 2r+2) / (2 · n·h · AF)，乘以 10⁹ 得到 FIT。示例的批次数、片数与时长都以现行标准为准，教学中只用来练习算法。',
    'Core formulas: DH_eq = n × h × AF; λ_upper = χ²(CL, 2r+2) / (2 · n·h · AF); multiply by 10⁹ to get FIT. The batch counts, unit counts and durations are examples; follow the current standard. They are used here only to practise the method.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '试验通过就代表 FIT 低于规格。零失效只说明：在所选 CL 下，失效率不超过算出的上限。它不是零失效率，也不自动低于规格；必须把上限和目标 FIT 比较。',
    'A passing test means the FIT is below spec. Zero failures only show that, at the chosen CL, the failure rate is no higher than the computed bound. It is not a zero failure rate and does not automatically meet the spec; compare the bound with the target FIT.',
  ),
  loc(
    '样本量越大越好。上限只和 n × h × AF 的乘积有关，加样本和加时间效果相同（DH 相同时）；但样本与时间都要花钱、花周期，要按成本选。',
    'Bigger samples are always better. The bound depends only on the product n × h × AF, so more units and more hours have the same effect when DH is the same; but both cost money and time, so choose by cost.',
  ),
  loc(
    'ESD 与闩锁是寿命试验。它们测的是对瞬态过压、电流注入的承受能力，结果是通过或不通过，不用来估计使用寿命的失效率。',
    'ESD and latch-up are life tests. They test tolerance to transient overvoltage and current injection, give pass or fail, and are not used to estimate a life failure rate.',
  ),
]

export const TAKEAWAY: LText = loc(
  '零失效抽样给出的是上限 χ²(CL, 2)/(2·n·h·AF)：样本、小时、AF 越大，上限越小；CL 越高，上限越大，因为要的把握更大。反过来，目标 FIT 可以反推最少样本量。',
  'Zero-failure sampling gives the bound χ²(CL, 2)/(2·n·h·AF): the larger the sample, hours or AF, the lower the bound; a higher CL gives a larger bound because you want more confidence. Going the other way, a target FIT gives the minimum sample size.',
)

/** 小测数字由同一套函数算出，与页面保持一致 */
const Q_N = 231
const Q_H = 1000
const Q_DH_EQ = Q_N * Q_H * REF_AF
const Q_CHI_60_2 = chi2Quantile(0.6, 2)
const Q_CHI_90_2 = chi2Quantile(0.9, 2)
const Q_CHI_60_4 = chi2Quantile(0.6, 4)
const Q_FIT_60 = fitUpperBound(0, Q_N * Q_H, 0.6, REF_AF) * 1e9
const Q_FIT_90 = fitUpperBound(0, Q_N * Q_H, 0.9, REF_AF) * 1e9
const Q_FIT_R1 = fitUpperBound(1, Q_N * Q_H, 0.6, REF_AF) * 1e9
const Q_MIN_N = minSampleZeroFail(50, 0.6, Q_H, REF_AF)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('零失效（r = 0）通过了一次 HTOL，这能说明什么？', 'A HTOL passes with zero failures. What does that show?'),
    options: [
      { id: 'a', text: loc('器件的失效率为零', 'The failure rate is zero') },
      { id: 'b', text: loc('FIT 一定低于规格的目标', 'The FIT is certainly below the spec target') },
      { id: 'c', text: loc('在所选置信度下，失效率不超过算出的上限', 'At the chosen confidence, the failure rate is no higher than the computed bound') },
    ],
    answer: 'c',
    explain: loc(
      '零失效只给出上限 χ²(CL, 2)/(2·n·h·AF)，不是零失效率。这个上限还要和目标 FIT 比较，才能判断是否达标。',
      'Zero failures give only the bound χ²(CL, 2)/(2·n·h·AF), not a zero failure rate. The bound must still be compared with the target FIT before deciding whether the target is met.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '下面三句话，哪几句是对的？① 样本数 n 与试验小时 h 对上限的作用相同（都按 n·h 缩放）；② 样本翻倍、时间减半，n·h 不变，r 与 CL 相同时上限不变；③ 样本越大，在任何情况下都更划算。',
      'Which of these statements are correct? ① Sample size n and test hours h act the same way on the bound (both scale n·h); ② doubling n and halving h keeps n·h, so with the same r and CL the bound does not change; ③ a bigger sample is always more economical.',
    ),
    options: [
      { id: 'a', text: loc('① 和 ②', '① and ②') },
      { id: 'b', text: loc('② 和 ③', '② and ③') },
      { id: 'c', text: loc('①、②、③ 都对', '① ② ③ are all correct') },
    ],
    answer: 'a',
    explain: loc(
      '上限 ∝ 1/(n·h·AF)，所以 n 与 h 的作用相同（①对，②也对）。③错：样本与时间都花成本，要按成本选择。',
      'The bound is proportional to 1/(n·h·AF), so n and h act the same way (① is correct, and ② too). ③ is wrong: samples and time both cost money, so choose by cost.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('HTOL 与 HTSL 的主要区别是什么？', 'What is the main difference between HTOL and HTSL?'),
    options: [
      { id: 'a', text: loc('HTSL 同时加温度与工作偏置，HTOL 只加温度', 'HTSL applies temperature plus bias, HTOL temperature only') },
      { id: 'b', text: loc('HTOL 同时加温度与工作偏置，HTSL 只加温度、不加偏置', 'HTOL applies temperature plus operating bias, HTSL temperature only with no bias') },
      { id: 'c', text: loc('两者都不加温度，只看时间', 'Neither applies temperature; only time matters') },
    ],
    answer: 'b',
    explain: loc(
      'HTOL 是高温工作寿命，器件工作并加偏置，会激发电迁移、TDDB、HCI 等机理；HTSL 只加温度，不加偏置，考核封装与键合的老化。两者都靠温度加速。',
      'HTOL is high-temperature operating life: the device runs with bias and excites EM, TDDB, HCI and similar mechanisms. HTSL applies temperature only, without bias, and checks package and bond ageing. Both are accelerated by temperature.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '样本 n = 231、h = 1000、AF = 77.7、r = 0、CL = 60%，FIT 上限约为多少？',
      'n = 231, h = 1000, AF = 77.7, r = 0, CL = 60%: about what is the FIT upper bound?',
    ),
    options: [
      { id: 'a', text: loc('25 FIT', '25 FIT') },
      { id: 'b', text: loc(`${f0(Q_FIT_60)} FIT`, `${f0(Q_FIT_60)} FIT`) },
      { id: 'c', text: loc('128 FIT', '128 FIT') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'DH_eq = 231 × 1000 × 77.7 ≈ {dh}；χ²(0.6, 2) = {chi}；上限 = {chi} / (2 × {dh}) ≈ {fit} FIT。注意分母是 2·DH_eq，所以 r = 0 时上限约为 χ² 的 1/(2 × 1.795e7)。',
        'DH_eq = 231 × 1000 × 77.7 ≈ {dh}; χ²(0.6, 2) = {chi}; bound = {chi} / (2 × {dh}) ≈ {fit} FIT. The denominator is 2·DH_eq, so at r = 0 the bound is χ² divided by 2 × 1.795e7.',
      ),
      { dh: sci(Q_DH_EQ), chi: f2(Q_CHI_60_2), fit: f0(Q_FIT_60) },
    ),
  },
  {
    id: 'q5',
    prompt: loc('同样的样本与时间，把 CL 从 60% 改为 90%，FIT 上限约为多少？', 'Same sample and time, CL raised from 60% to 90%: about what is the FIT upper bound?'),
    options: [
      { id: 'a', text: loc(`${f0(Q_FIT_60)} FIT`, `${f0(Q_FIT_60)} FIT`) },
      { id: 'b', text: loc('236 FIT', '236 FIT') },
      { id: 'c', text: loc(`${f0(Q_FIT_90)} FIT`, `${f0(Q_FIT_90)} FIT`) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'χ²(0.9, 2) = {chi}，比 χ²(0.6, 2) = {chi60} 大。上限正比于 χ²，所以 CL 越高，上限越大：要的把握越大，结论越保守。上限 ≈ {fit} FIT。',
        'χ²(0.9, 2) = {chi}, larger than χ²(0.6, 2) = {chi60}. The bound is proportional to χ², so a higher CL gives a larger bound: more confidence means a more conservative conclusion. Bound ≈ {fit} FIT.',
      ),
      { chi: f2(Q_CHI_90_2), chi60: f2(Q_CHI_60_2), fit: f0(Q_FIT_90) },
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '目标 50 FIT、CL 60%、每颗 1000 h、AF = 77.7、r = 0，至少需要多少样本？',
      'Target 50 FIT, CL 60%, 1000 h per unit, AF = 77.7, r = 0: at least how many units are needed?',
    ),
    options: [
      { id: 'a', text: loc(String(Q_MIN_N), String(Q_MIN_N)) },
      { id: 'b', text: loc('118', '118') },
      { id: 'c', text: loc('472', '472') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'n ≥ χ²(0.6, 2) / (2 · h · AF · λ_target) = {chi} / (2 × 1000 × 77.7 × 50e-9) ≈ {raw}，向上取整得 {n}。118 是 100 FIT 的答案，472 是 25 FIT 的答案。',
        'n ≥ χ²(0.6, 2) / (2 · h · AF · λ_target) = {chi} / (2 × 1000 × 77.7 × 50e-9) ≈ {raw}, rounded up to {n}. 118 is the answer for 100 FIT, and 472 is the answer for 25 FIT.',
      ),
      { chi: f2(Q_CHI_60_2), raw: f1(Q_CHI_60_2 / (2 * Q_H * REF_AF * 50e-9)), n: String(Q_MIN_N) },
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '哪几句符合本课的标准政策？① 批次数 3 × 77 片、试验时长这类数字要标“示例，以现行标准为准”；② 125 °C、1000 h 可以当作标准规定值写进文档；③ 试验条件要以标准原文为准，不能自行抄写标准原文。',
      'Which statements follow this lesson’s standards policy? ① Numbers such as 3 batches × 77 units and test duration must be marked “example; follow the current standard”; ② 125 °C and 1000 h can be written into a document as the standard’s values; ③ conditions must be taken from the current standard, and the standard text must not be copied.',
    ),
    options: [
      { id: 'a', text: loc('② 和 ③', '② and ③') },
      { id: 'b', text: loc('① 和 ③', '① and ③') },
      { id: 'c', text: loc('只有 ②', 'Only ②') },
    ],
    answer: 'b',
    explain: loc(
      '①和③对：具体数值只是示例，要标注，并且不复制标准原文。②错：125 °C、1000 h 在这里只是教学示例，不能声称是标准规定值。',
      '① and ③ are correct: specific numbers are examples and must be labelled, and standard text must not be copied. ② is wrong: 125 °C and 1000 h are teaching examples here, not the standard’s stated values.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('r = 0、CL 与试验时间都不变，把样本量 n 增加一倍，FIT 上限大约怎样变化？', 'With r = 0, CL and test time unchanged, doubling n: roughly how does the FIT upper bound change?'),
    options: [
      { id: 'a', text: loc('基本不变', 'Almost unchanged') },
      { id: 'b', text: loc('约加倍', 'Roughly doubles') },
      { id: 'c', text: loc('约减半', 'Roughly halves') },
    ],
    answer: 'c',
    explain: loc(
      '上限 = χ² / (2·n·h·AF)，与 n 成反比。n 翻倍，分母翻倍，上限约减半。',
      'The bound = χ² / (2·n·h·AF), inversely proportional to n. Doubling n doubles the denominator, so the bound roughly halves.',
    ),
  },
  {
    id: 'q9',
    prompt: loc(
      '同样的样本（n = 231、h = 1000、AF = 77.7、CL = 60%），试验中出现 1 个失效（r = 1），FIT 上限约为多少？',
      'Same sample (n = 231, h = 1000, AF = 77.7, CL = 60%), but one failure occurs (r = 1): about what is the FIT upper bound?',
    ),
    options: [
      { id: 'a', text: loc(`${f0(Q_FIT_60 * 2)} FIT`, `${f0(Q_FIT_60 * 2)} FIT`) },
      { id: 'b', text: loc(`${f0(Q_FIT_60)} FIT`, `${f0(Q_FIT_60)} FIT`) },
      { id: 'c', text: loc(`${f0(Q_FIT_R1)} FIT`, `${f0(Q_FIT_R1)} FIT`) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        'r = 1 时自由度为 2r + 2 = 4，χ²(0.6, 4) ≈ {chi4}，上限 = {chi4} / (2 × {dh}) ≈ {fit} FIT。不能把 r = 0 的结果乘以 2 来近似。',
        'With r = 1 the degrees of freedom are 2r + 2 = 4, χ²(0.6, 4) ≈ {chi4}, bound = {chi4} / (2 × {dh}) ≈ {fit} FIT. Doubling the r = 0 result is not a valid shortcut.',
      ),
      { chi4: f2(Q_CHI_60_4), dh: sci(Q_DH_EQ), fit: f0(Q_FIT_R1) },
    ),
  },
]

/** 任务卡：完成与否由当前设置和算出的结果判定，重置后自动还原 */
export function taskItems(state: StressState, a: StressAnalysis): TaskItem[] {
  const isRef = Math.abs(a.af - REF_AF) < 0.05
  return [
    {
      id: 'ref-fit-60',
      text: S.task1,
      done: a.n === 231 && state.hours === 1000 && state.r === 0 && state.cl === CL_OPTIONS[0] && isRef,
    },
    {
      id: 'cl-90',
      text: S.task2,
      done: a.n === 231 && state.hours === 1000 && state.r === 0 && state.cl === CL_OPTIONS[1] && isRef,
    },
    {
      id: 'one-fail',
      text: S.task3,
      done: a.n === 231 && state.hours === 1000 && state.r >= 1 && isRef,
    },
    {
      id: 'min-sample',
      text: S.task4,
      done: state.targetFit === 50 && state.cl === CL_OPTIONS[0] && state.hours === 1000 && state.r === 0 && isRef && a.n === a.minSample,
    },
  ]
}

/** 右侧说明栏：根据 FIT 上限与目标的比较给结论，并写出原因 */
export function verdictOf(state: StressState, a: StressAnalysis): { title: LText; text: LText } {
  const vars = {
    fit: f1(a.fitUpper),
    target: f0(state.targetFit),
    cl: f0(state.cl * 100),
    r: String(state.r),
    n: String(a.n),
    af: f1(a.af),
    min: String(a.minSample),
  }
  if (a.pass) {
    return { title: S.vPass, text: fill(S.vPassText, vars) }
  }
  return { title: S.vFail, text: fill(S.vFailText, vars) }
}

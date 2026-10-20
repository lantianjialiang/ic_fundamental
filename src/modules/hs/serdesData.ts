import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { qOfBer, tjAtBer } from './core/jitter'
import {
  BER_LIMIT,
  DEVICE_NAME,
  SAMPLES,
  SAMPLE_IDS,
  SPEC_EH_MV,
  SPEC_EW_UI,
  UI_PS,
  countingSeconds,
  eyeHeightMv,
  eyeWidthUi,
  runAll,
  type RunReport,
  type SampleId,
} from './serdesModel'

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

export const SAMPLE_LABEL: Record<SampleId, LText> = {
  typ: loc('样片 A：典型', 'Sample A: typical'),
  jitter: loc('样片 B：抖动偏大', 'Sample B: large jitter'),
  noise: loc('样片 C：噪声偏大', 'Sample C: large noise'),
}

export const SAMPLE_OPTIONS = SAMPLE_IDS.map((id) => ({ id, label: SAMPLE_LABEL[id] }))

/** 格式化 BER：太小的值不显示具体指数，只说明低于 1e-15 */
export function fmtBer(ber: number): string {
  if (ber < 1e-15) {
    return '< 1e-15'
  }
  return ber.toExponential(1)
}

export const S = {
  kickerNow: loc('这一次运行', 'This run'),
  introTitle: loc('把前面各课串成一次测试', 'Put the earlier lessons into one test'),
  coreTitle: loc('跑一颗虚拟 SerDes：扫时序、看眼、评 BER', 'Run a virtual SerDes: sweep timing, read the eye, assess BER'),
  coreNote: loc(
    `器件是虚构的 ${DEVICE_NAME}，速率 10 Gb/s（UI = 100 ps）。规格 BER 1e-12 下眼宽 ≥ ${SPEC_EW_UI.toFixed(2)} UI、眼高 ≥ ${SPEC_EH_MV} mV，都是本站的教学取值，不是任何标准的数字。`,
    `The device is the fictional ${DEVICE_NAME} at 10 Gb/s (UI = 100 ps). The spec at BER 1e-12 is eye width ≥ ${SPEC_EW_UI.toFixed(2)} UI and eye height ≥ ${SPEC_EH_MV} mV. These are teaching values set on this site, not numbers from any standard.`,
    ),
  sampleLabel: loc('被测样片', 'Device sample'),
  runAll: loc('运行全部', 'Run all'),
  runAria: loc('运行全部：时序扫描、眼图分析、BER 评估，然后出报告', 'Run all: timing sweep, eye analysis and BER assessment, then the report'),
  idleHint: loc('还没有运行。点“运行全部”出报告；换了样片后要重新运行。', 'Not run yet. Press “Run all” to get the report; after changing the sample, run again.'),
  reportTitle: loc('测试报告', 'Test report'),
  reportNote: loc('每一项都写出测得值、限值与结论。PASS 要求所有检查项都 PASS。', 'Every item shows the measured value, the limit and the result. PASS needs every check to pass.'),
  colItem: loc('项目', 'Item'),
  colMeasured: loc('测得', 'Measured'),
  colLimit: loc('限值', 'Limit'),
  colResult: loc('结果', 'Result'),
  rowPhase: loc('最佳采样相位（浴盆最低点）', 'Best sampling phase (bathtub centre)'),
  rowBer: loc('最佳相位处的 BER', 'BER at the best phase'),
  rowEw: loc('眼宽 @ BER 1e-12', 'Eye width @ BER 1e-12'),
  rowEh: loc('眼高 @ BER 1e-12', 'Eye height @ BER 1e-12'),
  rowOverall: loc('整体判定', 'Overall verdict'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  info: loc('信息', 'Info'),
  csvBtn: loc('下载 CSV', 'Download CSV'),
  csvAria: loc('下载本次报告的 CSV（每个扫描点一行，后面是汇总行）', 'Download this report as CSV (one row per sweep point, then summary rows)'),
  csvNote: loc(
    'CSV 每个扫描点一行，后面是汇总行。列名（英文）：item, value, unit, limit, result。',
    'The CSV has one row per sweep point, then summary rows. Column names: item, value, unit, limit, result.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的高速测试还要做 PRBS 同步、环回配置、CDR 的锁定与均衡器设置，并在多个温度与电压下重复。这里的样片与规格都是示意的，见 {@hsInterface}。',
    'Real high-speed test also covers PRBS sync, loopback setup, CDR lock and equaliser settings, repeated over temperature and voltage. The samples and limits here are illustrative; see {@hsInterface}.',
  ),
  idleTitle: loc('还没有运行', 'Not run yet'),
  idleText: loc(
    '点“运行全部”，依次做时序扫描、眼图分析与 BER 评估，然后出报告。',
    'Press “Run all” to do the timing sweep, eye analysis and BER assessment in turn, then get the report.',
  ),
  overallPassTitle: loc('PASS：样片满足规格', 'PASS: the sample meets the spec'),
  overallFailTitle: loc('FAIL：样片不满足规格', 'FAIL: the sample does not meet the spec'),
  task1: loc('运行全部一次，得到完整的测试报告。', 'Run all once and get the full test report.'),
  task2: loc('换到样片 B（抖动偏大），整体判定为 FAIL。', 'Switch to sample B (large jitter); the overall verdict is FAIL.'),
  task3: loc('换到样片 C（噪声偏大），找出唯一 FAIL 的项：是眼高还是眼宽？', 'Switch to sample C (large noise); find the only failing item: eye height or eye width?'),
  task4: loc('对样片 A（典型）运行，整体判定为 PASS。', 'Run sample A (typical); the overall verdict is PASS.'),
  task5: loc('下载 CSV，表头为 item,value,unit,limit,result。', 'Download the CSV; the header is item,value,unit,limit,result.'),
}

export const FIG = {
  bathAria: loc(
    '浴盆曲线：采样相位从 0 到 1 UI，每点的 BER（对数）；红线是 BER 1e-12，金线是最佳采样相位',
    'Bathtub curve: BER (log scale) at each sampling phase from 0 to 1 UI; the red line is BER 1e-12 and the gold line is the best sampling phase',
  ),
  bathCap: loc(
    '横轴是采样相位（ps），纵轴是 log₁₀ BER。低于红线的区间就是 BER 1e-12 下的眼宽。噪声大时，浴盆底会被电压项抬平。',
    'The horizontal axis is the sampling phase (ps) and the vertical axis is log₁₀ BER. The part below the red line is the eye width at BER 1e-12. With large noise the floor of the bathtub is lifted flat by the voltage term.',
  ),
  eyeAria: loc('BER 1e-12 下的眼：实线矩形是眼，虚线矩形是规格的 mask', 'The eye at BER 1e-12: the solid rectangle is the eye and the dashed rectangle is the spec mask'),
  eyeCap: loc(
    '实线是 BER 1e-12 下量到的眼；虚线是规格 mask。眼要完整盖住 mask，才算合格。',
    'The solid rectangle is the eye measured at BER 1e-12; the dashed one is the spec mask. The eye must fully cover the mask to pass.',
  ),
  legendEye: loc('BER 1e-12 下的眼', 'Eye at BER 1e-12'),
  legendMask: loc('规格 mask', 'Spec mask'),
  legendFloor: loc('无噪声的中心眼高', 'Centre eye height without noise'),
  legendRed: loc('BER 1e-12', 'BER 1e-12'),
  legendBest: loc('最佳采样相位', 'Best sampling phase'),
  axisPhase: loc('采样相位 (ps)', 'Sampling phase (ps)'),
}

/** 三个步骤，顺序即运行顺序 */
export const STEPS: LText[] = [
  loc(
    '时序扫描：采样相位从 0 扫到 1 UI，每点测一次 BER，画出浴盆曲线，取最低点作为最佳相位。',
    'Timing sweep: move the sampling phase from 0 to 1 UI, measure BER at each point, plot the bathtub, and take the lowest point as the best phase.',
  ),
  loc(
    '眼图分析：在最佳相位上，用 BER 1e-12 量眼宽（UI − TJ）与眼高（EH₀ − 2·Q·σ），再与规格矩形比较。',
    'Eye analysis: at the best phase, measure the eye width at BER 1e-12 (UI − TJ) and height (EH₀ − 2·Q·σ), then compare with the spec rectangle.',
  ),
  loc(
    'BER 评估：直接数 1e-12 太慢，用 TJ 与噪声模型外推，并与限值比较，最后出报告。',
    'BER assessment: counting to 1e-12 is too slow, so extrapolate with the TJ and noise models, compare with the limits, then write the report.',
  ),
]

export const INTRO = [
  loc(
    '{@hsEye} 讲了怎样读眼图，{@hsJitter} 讲了抖动与 TJ(BER) 的关系，{@hsInterface} 讲了 PRBS、BER 与环回。这一课把它们串成一次完整的测试：对虚拟器件做时序扫描，在 BER 1e-12 下量眼宽与眼高，最后出一份 PASS / FAIL 报告。',
    'The {@hsEye} lesson showed how to read an eye, {@hsJitter} covered jitter and TJ(BER), and {@hsInterface} covered PRBS, BER and loopback. This lesson puts them into one complete test: a timing sweep on the virtual device, eye width and height at BER 1e-12, and a PASS / FAIL report at the end.',
  ),
  loc(
    '测试路径会压窄眼图（见 {@hsAteLimit}），这里假设路径已经处理好，只看器件与判定。三个步骤是：扫时序找最佳相位；在最佳相位上量眼图；用 TJ 与噪声模型评估 BER 1e-12，再与规格比较。',
    'The test path narrows the eye (see {@hsAteLimit}). Here we assume the path has been handled and look only at the device and the verdict. The three steps are: sweep timing to find the best phase; read the eye at that phase; assess BER 1e-12 with the TJ and noise models and compare with the spec.',
  ),
]

export const MISCONCEPTIONS = [
  loc(
    '中心一点的 BER 很低，就说明器件合格。规格看的是 BER 1e-12 下的眼宽与眼高；中心 BER 低只说明中心有余量，眼边缘的余量可能已经不够。',
    'A very low BER at the centre means the device passes. The spec is the eye width and height at BER 1e-12; a low centre BER only shows the centre has margin, while the edges may already be short of it.',
  ),
  loc(
    'BER 1e-12 可以直接数出来。要有 95% 把握证明 BER 低于 1e-12，需要约 3×10¹² 个比特；10 Gb/s 下约 300 s，所以通常用浴盆外推，并说明外推的模型。',
    'BER 1e-12 can simply be counted. To be 95% confident that BER is below 1e-12 you need about 3×10¹² bits, roughly 300 s at 10 Gb/s, so people usually extrapolate a bathtub and state the model used.',
  ),
  loc(
    '采样点一定放在眼的几何中心。每颗样片的偏移（skew）不同，最佳相位就不同；要用时序扫描去找浴盆的最低点。',
    'The sampling point is always at the geometric centre of the eye. Each sample has its own skew, so the best phase differs; use a timing sweep to find the bottom of the bathtub.',
  ),
]

export const TAKEAWAY: LText = loc(
  '时序扫描找最佳相位（浴盆最低点）；在 BER 1e-12 下量眼宽（UI − TJ，TJ = DJ + 2·Q·RJ）与眼高（EH = EH₀ − 2·Q·σ），再与规格比较；报告的每一项都写出测得值、限值和结论，CSV 用英文列名。',
  'Find the best phase with a timing sweep (the bottom of the bathtub); at BER 1e-12 measure the eye width (UI − TJ, with TJ = DJ + 2·Q·RJ) and eye height (EH = EH₀ − 2·Q·σ), then compare with the spec; every report item shows the measured value, the limit and the result, and the CSV uses English column names.',
)

/** 右侧说明栏：没运行时给提示；运行后判定哪一项不过，并给出数值与原因 */
export function verdictOf(sample: SampleId, report: RunReport | null): { title: LText; text: LText } {
  if (report === null) {
    return { title: S.idleTitle, text: S.idleText }
  }
  const p = SAMPLES[sample]
  const { ewUi, ehMv, bestPhasePs, checks } = report
  const q = qOfBer(BER_LIMIT)
  const tj = tjAtBer(p.djPp, p.rjRms, BER_LIMIT)
  if (checks.overall) {
    return {
      title: S.overallPassTitle,
      text: loc(
        `最佳采样相位 ${f1(bestPhasePs)} ps。BER 1e-12 下眼宽 ${f2(ewUi)} UI（≥ ${f2(SPEC_EW_UI)}），眼高 ${f0(ehMv)} mV（≥ ${SPEC_EH_MV}）。规格看的是 1e-12 时的余量，而不是中心一点的 BER。`,
        `Best sampling phase ${f1(bestPhasePs)} ps. At BER 1e-12 the eye width is ${f2(ewUi)} UI (≥ ${f2(SPEC_EW_UI)}) and the eye height is ${f0(ehMv)} mV (≥ ${SPEC_EH_MV}). The spec is the margin at 1e-12, not the BER at a single centre point.`,
      ),
    }
  }
  const widthText = loc(
    `眼宽只剩 ${f2(ewUi)} UI，低于 ${f2(SPEC_EW_UI)}。原因：DJ ${f1(p.djPp)} ps 加上 2·Q·RJ，让 TJ(1e-12) 达到 ${f1(tj)} ps，占掉了 ${f0(UI_PS)} ps 的 UI 里的大部分。`,
    `Eye width is only ${f2(ewUi)} UI, below ${f2(SPEC_EW_UI)}. Reason: DJ ${f1(p.djPp)} ps plus 2·Q·RJ make TJ(1e-12) reach ${f1(tj)} ps, using up most of the ${f0(UI_PS)} ps UI.`,
  )
  const heightText = loc(
    `眼高只剩 ${f0(ehMv)} mV，低于 ${SPEC_EH_MV}。原因：EH = ${f0(p.eyeMv)} − 2 × ${f2(q)} × ${f0(p.noiseMv)} mV，电压噪声把两个电平往中间压。时序裕量仍够，失效只出现在眼高上。`,
    `Eye height is only ${f0(ehMv)} mV, below ${SPEC_EH_MV}. Reason: EH = ${f0(p.eyeMv)} − 2 × ${f2(q)} × ${f0(p.noiseMv)} mV, so the voltage noise pulls the two levels inward. Timing margin is still enough; the failure is only in the height.`,
  )
  if (!checks.ew && checks.eh) {
    return { title: S.overallFailTitle, text: widthText }
  }
  if (checks.ew && !checks.eh) {
    return { title: S.overallFailTitle, text: heightText }
  }
  return {
    title: S.overallFailTitle,
    text: loc(`${widthText.zh} ${heightText.zh}`, `${widthText.en ?? ''} ${heightText.en ?? ''}`),
  }
}

/** 五张任务卡：完成与否由当前样片、运行状态与报告算出；csvDone 记录是否已经点过下载 */
export function taskItems(sample: SampleId, report: RunReport | null, csvDone: boolean): TaskItem[] {
  const ran = report !== null
  return [
    { id: 'run', text: S.task1, done: ran },
    { id: 'jitter', text: S.task2, done: ran && sample === 'jitter' && !report.checks.overall },
    { id: 'noise', text: S.task3, done: ran && sample === 'noise' && !report.checks.eh && report.checks.ew },
    { id: 'typ', text: S.task4, done: ran && sample === 'typ' && report.checks.overall },
    { id: 'csv', text: S.task5, done: csvDone },
  ]
}

/* ---------- 小测：数字由模型函数算出 ---------- */

const JIT = SAMPLES.jitter
const NOISE = SAMPLES.noise
const Q_1E12 = qOfBer(BER_LIMIT)
const TJ_EX = tjAtBer(18, 2.5, BER_LIMIT)
const TJ_JIT = tjAtBer(JIT.djPp, JIT.rjRms, BER_LIMIT)
const EW_JIT = eyeWidthUi(BER_LIMIT, JIT)
const EH_NOISE = eyeHeightMv(BER_LIMIT, NOISE)
const EH_NOISE_ONE_SIDED = NOISE.eyeMv - Q_1E12 * NOISE.noiseMv
const EW_NOISE = eyeWidthUi(BER_LIMIT, NOISE)
const BEST_TYP = runAll('typ').bestPhasePs

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('确定性抖动 DJ = 18 ps，随机抖动 RJ = 2.5 ps（rms）。BER 1e-12 下的总抖动 TJ 约是多少？', 'Deterministic jitter DJ = 18 ps and random jitter RJ = 2.5 ps (rms). About what is the total jitter TJ at BER 1e-12?'),
    options: [
      { id: 'a', text: loc('18 ps', '18 ps') },
      { id: 'b', text: loc(`${f0(TJ_EX)} ps`, `${f0(TJ_EX)} ps`) },
      { id: 'c', text: loc('35 ps', '35 ps') },
    ],
    answer: 'b',
    explain: loc(
      `TJ = DJ + 2·Q·RJ = 18 + 2 × ${f2(Q_1E12)} × 2.5 = ${f1(TJ_EX)} ps。只写 DJ 漏掉了随机部分；只写 2·Q·RJ 漏掉了确定性部分。`,
      `TJ = DJ + 2·Q·RJ = 18 + 2 × ${f2(Q_1E12)} × 2.5 = ${f1(TJ_EX)} ps. Writing only DJ misses the random part; writing only 2·Q·RJ misses the deterministic part.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '样片 B：DJ = 30 ps，RJ = 3.5 ps（rms），UI = 100 ps。BER 1e-12 下的眼宽是多少？与规格 0.40 UI 比较，结果如何？',
      'Sample B: DJ = 30 ps, RJ = 3.5 ps (rms), UI = 100 ps. What is the eye width at BER 1e-12, and how does it compare with the 0.40 UI spec?',
    ),
    options: [
      { id: 'a', text: loc('0.70 UI，通过', '0.70 UI, pass') },
      { id: 'b', text: loc(`${f2(EW_JIT)} UI，不通过`, `${f2(EW_JIT)} UI, fail`) },
      { id: 'c', text: loc('0.40 UI，刚好通过', '0.40 UI, just passes') },
    ],
    answer: 'b',
    explain: loc(
      `TJ = 30 + 2 × ${f2(Q_1E12)} × 3.5 = ${f1(TJ_JIT)} ps，眼宽 = (100 − ${f1(TJ_JIT)}) ÷ 100 = ${f2(EW_JIT)} UI，低于 0.40 UI，判 FAIL。只减 DJ 会得到 0.70 UI，那是漏掉了随机抖动。`,
      `TJ = 30 + 2 × ${f2(Q_1E12)} × 3.5 = ${f1(TJ_JIT)} ps, so the eye width = (100 − ${f1(TJ_JIT)}) ÷ 100 = ${f2(EW_JIT)} UI, below 0.40 UI, which is a FAIL. Subtracting only DJ gives 0.70 UI, which forgets the random jitter.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '样片 C：中心眼高（无噪声）200 mV，电压噪声 σ = 12 mV rms。BER 1e-12 下的眼高约是多少？',
      'Sample C: centre eye height without noise 200 mV, voltage noise σ = 12 mV rms. About what is the eye height at BER 1e-12?',
    ),
    options: [
      { id: 'a', text: loc('200 mV（忽略噪声）', '200 mV (ignoring noise)') },
      { id: 'b', text: loc(`${f0(EH_NOISE)} mV`, `${f0(EH_NOISE)} mV`) },
      { id: 'c', text: loc(`${f0(EH_NOISE_ONE_SIDED)} mV（只算单边）`, `${f0(EH_NOISE_ONE_SIDED)} mV (one side only)`) },
    ],
    answer: 'b',
    explain: loc(
      `EH = EH₀ − 2·Q·σ = 200 − 2 × ${f2(Q_1E12)} × 12 = ${f1(EH_NOISE)} mV，低于 ${SPEC_EH_MV} mV，判 FAIL。只算单边会得到 ${f0(EH_NOISE_ONE_SIDED)} mV，那是把两侧的裕量少算了一侧。`,
      `EH = EH₀ − 2·Q·σ = 200 − 2 × ${f2(Q_1E12)} × 12 = ${f1(EH_NOISE)} mV, below ${SPEC_EH_MV} mV, a FAIL. Counting only one side gives ${f0(EH_NOISE_ONE_SIDED)} mV, which leaves out one of the two margins.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('要有 95% 的把握，直接计数证明 BER 低于 1e-12，至少要测多少个比特？', 'To be 95% confident by direct counting that BER is below 1e-12, how many bits at least must be tested?'),
    options: [
      { id: 'a', text: loc('10¹⁰ 个', '10¹⁰ bits') },
      { id: 'b', text: loc('10¹² 个', '10¹² bits') },
      { id: 'c', text: loc('3 × 10¹² 个', '3 × 10¹² bits') },
    ],
    answer: 'c',
    explain: loc(
      `零错误的 N 个比特，在 95% 置信度下 BER < 3 ÷ N。要 BER < 1e-12，需要 N = 3 ÷ 1e-12 = 3 × 10¹² 个比特；10 Gb/s 下约 ${f0(countingSeconds(BER_LIMIT))} s。`,
      `With zero errors in N bits, the 95% upper bound is BER < 3 ÷ N. For BER < 1e-12, N = 3 ÷ 1e-12 = 3 × 10¹² bits, about ${f0(countingSeconds(BER_LIMIT))} s at 10 Gb/s.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('为什么常用浴盆外推，而不直接测 BER 1e-12 下的眼宽？', 'Why is bathtub extrapolation often used instead of measuring the eye width directly at BER 1e-12?'),
    options: [
      { id: 'a', text: loc('直接测 1e-12 的眼宽更准，外推没有用', 'Measuring at 1e-12 directly is more accurate; extrapolation is useless') },
      { id: 'b', text: loc('在 BER 较高（如 1e-9）的区域就能测到足够多的错误，再用 Q 函数的尾部外推到 1e-12，省时间', 'Errors are frequent enough at higher BER (such as 1e-9); the Q-function tail is fitted there and extrapolated to 1e-12, which saves time') },
      { id: 'c', text: loc('外推不需要任何测量数据', 'Extrapolation needs no measured data at all') },
    ],
    answer: 'b',
    explain: loc(
      '浴盆曲线的尾部近似是 Q 函数，BER 较高的区域测得快；用它拟合出的 TJ 外推到 1e-12。外推依赖模型，所以报告里要写明用的是哪种模型，并检查它与测量是否吻合。',
      'The tails of a bathtub curve follow the Q function, and the higher-BER region is measured quickly. Fitting TJ there and extrapolating to 1e-12 saves time. Extrapolation depends on the model, so the report must state which model was used and check that it agrees with the measurement.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('样片 C（噪声偏大）的报告里，哪一项 FAIL？', 'In the report for sample C (large noise), which item fails?'),
    options: [
      { id: 'a', text: loc('眼高', 'Eye height') },
      { id: 'b', text: loc('眼宽', 'Eye width') },
      { id: 'c', text: loc('最佳采样相位', 'Best sampling phase') },
    ],
    answer: 'a',
    explain: loc(
      `电压噪声压的是两个电平之间的高度，所以眼高 ${f0(EH_NOISE)} mV 不达标。它的时序项没有变，眼宽 ${f2(EW_NOISE)} UI 仍然达标。`,
      `Voltage noise squeezes the height between the two levels, so the eye height of ${f0(EH_NOISE)} mV fails. Its timing terms are unchanged, so the eye width of ${f2(EW_NOISE)} UI still passes.`,
    ),
  },
  {
    id: 'q7',
    prompt: loc('最佳采样相位应该怎样确定？', 'How should the best sampling phase be determined?'),
    options: [
      { id: 'a', text: loc('取眼的几何中心，即固定的 0.5 UI', 'Take the geometric centre of the eye, a fixed 0.5 UI') },
      { id: 'b', text: loc('取时序扫描中时序项最小（浴盆最低点）的相位', 'Take the phase with the smallest timing BER in the sweep (the bottom of the bathtub)') },
      { id: 'c', text: loc('取 BER 最高的相位，因为那里的眼最窄', 'Take the phase with the highest BER, because the eye is narrowest there') },
    ],
    answer: 'b',
    explain: loc(
      `数据眼的中心相对采样时钟偏移 skew，最佳相位 ≈ skew + 0.5 UI。典型样片扫出的最佳相位是 ${f1(BEST_TYP)} ps，不一定在 50 ps；固定取 0.5 UI 会偏离真正的中心。`,
      `The data eye’s centre is offset from the sampling clock by the skew, so the best phase ≈ skew + 0.5 UI. The sweep gives ${f1(BEST_TYP)} ps for the typical sample, not necessarily 50 ps; a fixed 0.5 UI would miss the true centre.`,
    ),
  },
]
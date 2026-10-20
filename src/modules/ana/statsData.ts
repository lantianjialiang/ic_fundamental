import { loc, type LText } from '../../i18n/locale'
import type { QuizQuestion } from '../../lab/QuizList'
import type { TaskItem } from '../../lab/TaskList'
import {
  CENTER_MV,
  DEFAULT_STATS,
  LSL_MV,
  N_BATCH,
  TARGET_CPK,
  TARGET_ESCAPE_PCT,
  TARGET_OVERKILL_PCT,
  TARGET_YIELD_PCT,
  USL_MV,
  analyze,
  pct,
  type BatchSummary,
  type StatsResult,
  type StatsState,
} from './statsModel'

export const S = {
  nextPrefix: loc('下一课：', 'Next: '),
  kickerNow: loc('这一次判定', 'This test decision'),
  introTitle: loc('限值与统计：测得值怎么变成合格或不合格', 'Limits and statistics: how a reading becomes pass or fail'),
  coreTitle: loc('拨一拨：工艺分布、保护带与测量误差', 'Try it: process spread, guardband and measurement error'),
  coreNote: loc(
    '规格是 LSL 1150 mV、USL 1250 mV，标称 1200 mV。器件的真实值服从工艺分布 μ、σ；测量会再叠加重复性 σm 和测试机偏置 bias。测试只看测得值，并用保护带把测试限值向规格内收缩。数字是教学示意。',
    'The spec is LSL 1150 mV and USL 1250 mV, nominal 1200 mV. True values follow the process distribution μ, σ; measurement adds repeatability σm and the tester bias. The test only sees the measured value and tightens the test limits inside the spec by the guardband. The numbers are illustrative.',
  ),
  muLabel: loc('μ 工艺均值偏移', 'μ process mean offset'),
  sigmaLabel: loc('σ 工艺标准差', 'σ process spread'),
  guardLabel: loc('保护带 GB', 'Guardband GB'),
  sigmaMLabel: loc('σm 测量重复性', 'σm measurement repeatability'),
  biasLabel: loc('bias 测试机偏置', 'bias tester offset'),
  resampleBtn: loc('重新抽样（换种子）', 'Resample (new seed)'),
  resetBtn: loc('恢复默认', 'Reset defaults'),
  rLimits: loc('测试限值', 'Test limits'),
  rYield: loc('真实合格率', 'True yield'),
  rTestYield: loc('测试通过率', 'Test pass rate'),
  rOver: loc('过杀（占全部）', 'Overkill (of all parts)'),
  rUnder: loc('漏检（占全部）', 'Escape (of all parts)'),
  rCp: loc('Cp（工艺）', 'Cp (process)'),
  rCpk: loc('Cpk（工艺）', 'Cpk (process)'),
  rCpkMeas: loc('Cpk（测得）', 'Cpk (measured)'),
  rUnc: loc('扩展不确定度 U = 2σm', 'Expanded uncertainty U = 2σm'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  verdictTitle: loc('统计判定', 'Statistical verdict'),
  verdictPass: loc('结论：PASS', 'Verdict: PASS'),
  verdictFailCpk: loc('结论：FAIL（工艺能力不足）', 'Verdict: FAIL (process capability too low)'),
  verdictFailEscape: loc('结论：FAIL（漏检超标）', 'Verdict: FAIL (escapes too high)'),
  verdictFailOver: loc('结论：FAIL（过杀超标）', 'Verdict: FAIL (overkill too high)'),
  asideLater: loc(
    '这里的分布是正态的，批次数 2000 件只是抽样。实际的数据会有漂移、相关性和 Gauge R&R 等问题，留给后面的课程；这里只看限值、保护带、Cp / Cpk 和过杀漏检。',
    'The distribution here is normal and the 2000 parts are just a sample. Real data has drift, correlation and Gauge R&R effects, left for later lessons; here we only look at limits, guardband, Cp / Cpk, overkill and escape.',
  ),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  batchTitle: loc('这一批（2000 件）', 'This batch (2000 parts)'),
  task1: loc(
    '把均值 μ 调到 0，并把 σ 压到能让工艺 Cpk ≥ 1.33、真实合格率 ≥ 99.9%。',
    'Centre the mean at μ = 0 and bring σ down until the process Cpk ≥ 1.33 and true yield ≥ 99.9%.',
  ),
  task2: loc(
    '保持 σ = 20、μ = 0、σm = 2、bias = 0 的默认值，只调保护带，使过杀 ≤ 0.5% 且漏检 ≤ 0.05%。',
    'Keep the defaults σ = 20, μ = 0, σm = 2, bias = 0, and only change the guardband until overkill ≤ 0.5% and escape ≤ 0.05%.',
  ),
  task3: loc('把测量重复性 σm 提到 5 mV 以上，观察不确定度 U 与过杀、漏检怎么变。', 'Raise σm to 5 mV or more and observe how the uncertainty U and the overkill and escape change.'),
}

export const FIG = {
  histAria: loc(
    '测得值直方图：绿色柱是测试判定通过的区间，红色柱在测试限值外；红实线是规格 LSL、USL，金色虚线是测试限值',
    'Histogram of measured values: green bars pass the test window, red bars fall outside it; solid red lines are the spec LSL and USL, gold dashed lines are the test limits',
  ),
  histCap: loc(
    '横轴是测得值（mV），每格 2 mV。规格（红实线）是真实合格的边界；测试限值（金色虚线）比规格向内收了一个保护带。落在两条金线之间的器件判通过。',
    'The x-axis is the measured value (mV), 2 mV per bin. The spec (solid red) is the true pass boundary; the test limits (gold dashed) sit inside it by one guardband. Parts between the gold lines pass.',
  ),
  histPass: loc('测试通过', 'Pass'),
  histFail: loc('测试失败', 'Test fail'),
  histSpec: loc('规格 LSL/USL', 'Spec LSL/USL'),
  histLimit: loc('测试限值（GB）', 'Test limit (GB)'),
  guardAria: loc(
    '保护带扫描：横轴是保护带，纵轴是占全部器件的百分比；蓝线是过杀，红线是漏检，虚线是目标，竖线标出当前保护带',
    'Guardband sweep: guardband on the x-axis, percent of all parts on the y-axis; the blue line is overkill, the red line escape, dashed lines are targets, and the vertical line marks the current guardband',
  ),
  guardCap: loc(
    '保护带越大，测试限值越往里，过杀越多、漏检越少；两条曲线相交处的保护带不是最优解，只是两个目标同时满足的一段区间。',
    'The larger the guardband, the further inside the test limits sit: more overkill, fewer escapes. Where the curves cross is not an optimum; the useful region is the guardband range where both targets hold.',
  ),
  guardOver: loc('过杀', 'Overkill'),
  guardUnder: loc('漏检', 'Escape'),
  guardTarget: loc('目标', 'Target'),
  guardNow: loc('当前 GB', 'Current GB'),
  guardX: loc('保护带 GB（mV）', 'Guardband GB (mV)'),
}

export const INTRO: LText[] = [
  loc(
    '{@anaStatic} 讲过静态参数怎么测、怎么判。这一课接着讨论：测出来的数字和规格比较时，判定为什么会出错。规格限值 LSL、USL 是真实合格的边界，但测试只能看到测得值，测得值里有测量误差，所以要用保护带把测试限值向内收。',
    '{@anaStatic} covered how static parameters are measured and judged. This lesson asks why a judgement can go wrong: the spec limits LSL and USL are the true pass boundary, but the test only sees the measured value, which carries measurement error, so a guardband pulls the test limit inward.',
  ),
  loc(
    '这里要分清两类指标：Cp、Cpk 只看工艺分布相对规格的余量；过杀、漏检看的是测试判定与真实值之间的错配。保护带能调的是后者，不能改变前者。',
    'Two kinds of measure must be kept apart: Cp and Cpk look only at process spread against the spec; overkill and escape look at the mismatch between the test decision and the true value. A guardband changes the second kind, not the first.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '保护带可以把 Cpk 调到 1.33 以上。保护带只挪动测试限值，工艺分布的 μ 和 σ 没变，Cpk 也不变。Cpk 不够，只能减小 σ 或把均值拉回中心。',
    'A guardband can raise Cpk to 1.33. A guardband only moves the test limits; the process μ and σ do not change, so Cpk does not change either. If Cpk is too low, reduce σ or bring the mean back to centre.',
  ),
  loc(
    '过杀和漏检是两件事，加一个保护带就能同时降低。保护带是一个旋钮：往里收，过杀上升、漏检下降；往外放则相反。两个目标只能在一段保护带区间里同时满足，见上面的扫描图。',
    'Overkill and escape can both be lowered by adding a guardband. A guardband is one knob: tighten it and overkill rises while escape falls; loosen it and the reverse happens. Both targets hold only over a range of guardband values; see the sweep above.',
  ),
  loc(
    '测试通过率高，就说明器件的良率高。测试通过率 = 真实合格率 − 过杀 + 漏检；漏检会让通过率虚高，过杀会让通过率虚低，两者都不是真实良率。',
    'A high test pass rate means a high true yield. Test pass rate = true yield − overkill + escape; escapes inflate the pass rate and overkill deflates it, so neither equals the true yield.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Cp、Cpk 只看工艺分布相对规格的余量，保护带不能改变它们；保护带只调判定，往里收减少漏检、增加过杀，要在两个目标之间找区间；测量重复性 σm 会把测得值的分布变宽，要用不确定度 U 去衡量它。',
  'Cp and Cpk measure process spread against the spec and a guardband cannot change them; a guardband only moves the decision, trading fewer escapes for more overkill, so find a range that meets both targets; measurement repeatability σm widens the measured distribution, which the uncertainty U quantifies.',
)

export function batchLine(b: BatchSummary): LText {
  return loc(
    `批次 ${N_BATCH} 件：测试通过 ${b.passN} 件，过杀 ${b.overkillN} 件，漏检 ${b.escapeN} 件；真实值的均值 ${b.meanX.toFixed(2)} mV，样本标准差 ${b.sdX.toFixed(2)} mV。换种子会得到另一批，但统计量在期望附近波动。`,
    `Batch of ${N_BATCH} parts: ${b.passN} pass the test, ${b.overkillN} overkill, ${b.escapeN} escapes; true-value mean ${b.meanX.toFixed(2)} mV, sample sd ${b.sdX.toFixed(2)} mV. A new seed gives another batch, and the statistics scatter around their expected values.`,
  )
}

/** 右侧说明栏：按工艺 Cpk → 漏检 → 过杀的顺序给出第一条不满足的结论和原因 */
export function verdictOf(s: StatsState, r: StatsResult): { title: LText; text: LText } {
  const cpkText = r.cpkProcess.toFixed(2)
  if (r.cpkProcess < TARGET_CPK) {
    return {
      title: S.verdictFailCpk,
      text: loc(
        `工艺 Cpk = ${cpkText}，低于 ${TARGET_CPK}。保护带只能把限值往里挪，不能缩小工艺分布；要提高 Cpk，只能减小 σ，或者把均值 μ 拉回标称值。`,
        `Process Cpk = ${cpkText}, below ${TARGET_CPK}. A guardband only moves the limits inward and cannot narrow the process spread; to raise Cpk, reduce σ or bring the mean μ back to nominal.`,
      ),
    }
  }
  if (r.escape * 100 > TARGET_ESCAPE_PCT) {
    return {
      title: S.verdictFailEscape,
      text: loc(
        `漏检 ${pct(r.escape, 2)}，超过目标 ${TARGET_ESCAPE_PCT}%。保护带 ${s.guard} mV 不够，测量误差让真实不合格的器件有机会落进测试限值之内。加大保护带能降低漏检，但过杀会上升。`,
        `Escape ${pct(r.escape, 2)}, above the ${TARGET_ESCAPE_PCT}% target. A guardband of ${s.guard} mV is too small: measurement error lets truly bad parts land inside the test limits. A larger guardband lowers escape but raises overkill.`,
      ),
    }
  }
  if (r.overkill * 100 > TARGET_OVERKILL_PCT) {
    return {
      title: S.verdictFailOver,
      text: loc(
        `过杀 ${pct(r.overkill, 2)}，超过目标 ${TARGET_OVERKILL_PCT}%。保护带 ${s.guard} mV 太大，把真实合格的器件也判废了。收小保护带能降低过杀，但漏检会上升。`,
        `Overkill ${pct(r.overkill, 2)}, above the ${TARGET_OVERKILL_PCT}% target. A guardband of ${s.guard} mV is too large and rejects truly good parts. Reducing it lowers overkill but raises escape.`,
      ),
    }
  }
  return {
    title: S.verdictPass,
    text: loc(
      `Cpk ${cpkText}、过杀 ${pct(r.overkill, 2)}、漏检 ${pct(r.escape, 2)} 都在目标内，判定 PASS。测试限值 ${r.testLo}–${r.testHi} mV。`,
      `Cpk ${cpkText}, overkill ${pct(r.overkill, 2)} and escape ${pct(r.escape, 2)} are all within target, so the verdict is PASS. Test limits ${r.testLo}–${r.testHi} mV.`,
    ),
  }
}

/** 三张任务卡：完成与否直接由状态和解析结果算出 */
export function taskItems(s: StatsState, r: StatsResult): TaskItem[] {
  const d = DEFAULT_STATS
  return [
    {
      id: 'center',
      text: S.task1,
      done: s.mu === 0 && r.cpkProcess >= TARGET_CPK && r.yieldTrue * 100 >= TARGET_YIELD_PCT,
    },
    {
      id: 'guard',
      text: S.task2,
      done:
        s.sigma === d.sigma &&
        s.mu === 0 &&
        s.sigmaM === d.sigmaM &&
        s.bias === 0 &&
        r.overkill * 100 <= TARGET_OVERKILL_PCT &&
        r.escape * 100 <= TARGET_ESCAPE_PCT,
    },
    { id: 'sigmaM', text: S.task3, done: s.sigmaM >= 5 },
  ]
}

const f2 = (value: number) => value.toFixed(2)
const Q1 = analyze({ ...DEFAULT_STATS, mu: 10, sigma: 12 })
const Q2_OFF = analyze({ ...DEFAULT_STATS, guard: 0 })
const Q2_ON = analyze({ ...DEFAULT_STATS, guard: 2 })
const Q3_12 = analyze({ ...DEFAULT_STATS, sigma: 12 })
const Q3_20 = analyze({ ...DEFAULT_STATS, sigma: 20 })
const Q3_25 = analyze({ ...DEFAULT_STATS, sigma: 25 })
const Q4 = analyze({ ...DEFAULT_STATS, mu: 20, sigma: 12 })
const Q6 = analyze({ ...DEFAULT_STATS, guard: 2 })

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `μ = +10 mV、σ = 12 mV 时，Cp 和 Cpk 分别是多少？（规格 ${LSL_MV}–${USL_MV} mV）`,
      `With μ = +10 mV and σ = 12 mV, what are Cp and Cpk? (spec ${LSL_MV}–${USL_MV} mV)`,
    ),
    options: [
      { id: 'a', text: loc(`Cp ${f2(Q1.cp)}，Cpk ${f2(Q1.cp)}`, `Cp ${f2(Q1.cp)}, Cpk ${f2(Q1.cp)}`) },
      { id: 'b', text: loc(`Cp ${f2(Q1.cp)}，Cpk ${f2(Q1.cpkProcess)}`, `Cp ${f2(Q1.cp)}, Cpk ${f2(Q1.cpkProcess)}`) },
      { id: 'c', text: loc(`Cp ${f2(Q1.cpkProcess)}，Cpk ${f2(Q1.cp)}`, `Cp ${f2(Q1.cpkProcess)}, Cpk ${f2(Q1.cp)}`) },
    ],
    answer: 'b',
    explain: loc(
      `Cp 只看宽度：(USL − LSL)/(6σ) = 100/72 = ${f2(Q1.cp)}，与均值无关。Cpk 取离均值较近的那一侧：均值 ${CENTER_MV + 10} 离 USL 还有 40 mV，离 LSL 有 60 mV，min = 40，Cpk = 40/36 = ${f2(Q1.cpkProcess)}。均值一偏，Cpk 就低于 Cp。`,
      `Cp looks only at width: (USL − LSL)/(6σ) = 100/72 = ${f2(Q1.cp)}, independent of the mean. Cpk uses the nearer side: the mean ${CENTER_MV + 10} is 40 mV from USL and 60 mV from LSL, so min = 40 and Cpk = 40/36 = ${f2(Q1.cpkProcess)}. Once the mean shifts, Cpk falls below Cp.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('σ = 20 mV、σm = 2 mV 时，保护带从 0 加到 2 mV，过杀和漏检会怎么变？', 'With σ = 20 mV and σm = 2 mV, what happens to overkill and escape when the guardband goes from 0 to 2 mV?'),
    options: [
      { id: 'a', text: loc('过杀减少，漏检增加', 'Overkill falls, escape rises') },
      { id: 'b', text: loc('过杀增加，漏检减少', 'Overkill rises, escape falls') },
      { id: 'c', text: loc('两者都不变，保护带只影响显示', 'Both stay the same; the guardband only affects the display') },
    ],
    answer: 'b',
    explain: loc(
      `保护带从 0 到 2 mV：过杀从 ${pct(Q2_OFF.overkill, 2)} 升到 ${pct(Q2_ON.overkill, 2)}，漏检从 ${pct(Q2_OFF.escape, 2)} 降到 ${pct(Q2_ON.escape, 2)}。保护带把测试限值向内收，合格器件更容易被误判，但不合格器件更难混进来。`,
      `Guardband 0 to 2 mV: overkill goes from ${pct(Q2_OFF.overkill, 2)} to ${pct(Q2_ON.overkill, 2)}, and escape goes from ${pct(Q2_OFF.escape, 2)} to ${pct(Q2_ON.escape, 2)}. The guardband pulls the test limits inward, so good parts are more often rejected while bad parts are harder to slip through.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('μ = 0、σm = 2 mV、bias = 0 时，σ = 12 mV 的真实合格率是多少？', 'With μ = 0, σm = 2 mV and bias = 0, what is the true yield at σ = 12 mV?'),
    options: [
      { id: 'a', text: loc(`${pct(Q3_12.yieldTrue, 3)}`, `${pct(Q3_12.yieldTrue, 3)}`) },
      { id: 'b', text: loc(`${pct(Q3_20.yieldTrue, 2)}`, `${pct(Q3_20.yieldTrue, 2)}`) },
      { id: 'c', text: loc(`${pct(Q3_25.yieldTrue, 2)}`, `${pct(Q3_25.yieldTrue, 2)}`) },
    ],
    answer: 'a',
    explain: loc(
      `规格离中心 ±50 mV，σ = 12 时 z = 50/12 ≈ 4.17，两侧之外的概率约 3×10⁻⁵，所以真实合格率约 ${pct(Q3_12.yieldTrue, 3)}。σ = 20 时 z = 2.5，良率只有 ${pct(Q3_20.yieldTrue, 2)}。这说明 σ 对良率的影响比保护带大得多。`,
      `The spec is ±50 mV from centre. At σ = 12, z = 50/12 ≈ 4.17, and the tail beyond both limits is about 3×10⁻⁵, so the true yield is about ${pct(Q3_12.yieldTrue, 3)}. At σ = 20, z = 2.5 and the yield is only ${pct(Q3_20.yieldTrue, 2)}. σ moves yield far more than a guardband does.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('σ = 12 mV 不变，均值从 0 移到 +20 mV，Cp 和 Cpk 会怎么变？', 'With σ = 12 mV fixed, the mean moves from 0 to +20 mV. What happens to Cp and Cpk?'),
    options: [
      { id: 'a', text: loc('Cp 不变，Cpk 变大', 'Cp unchanged, Cpk rises') },
      { id: 'b', text: loc(`Cp 不变，Cpk 降到 ${f2(Q4.cpkProcess)}`, `Cp unchanged, Cpk falls to ${f2(Q4.cpkProcess)}`) },
      { id: 'c', text: loc('Cp 和 Cpk 都不变', 'Both Cp and Cpk unchanged') },
    ],
    answer: 'b',
    explain: loc(
      `Cp 只看宽度，μ 移动不影响它，仍是 ${f2(Q4.cp)}。Cpk 取较近的一侧：均值 ${CENTER_MV + 20} 离 USL 只有 30 mV，min = 30，Cpk = 30/36 = ${f2(Q4.cpkProcess)}，比居中时的 ${f2(Q3_12.cpkProcess)} 低。`,
      `Cp depends only on width, so the mean shift leaves it at ${f2(Q4.cp)}. Cpk uses the nearer side: the mean ${CENTER_MV + 20} is only 30 mV from USL, so min = 30 and Cpk = 30/36 = ${f2(Q4.cpkProcess)}, below the centred value ${f2(Q3_12.cpkProcess)}.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('μ = 0、σ = 12 mV、σm = 2 mV 时，测得 Cpk 和工艺 Cpk 相比怎样？', 'With μ = 0, σ = 12 mV and σm = 2 mV, how does the measured Cpk compare with the process Cpk?'),
    options: [
      { id: 'a', text: loc('测得 Cpk 更高，因为测量误差会让分布变窄', 'Measured Cpk is higher, because measurement error narrows the distribution') },
      { id: 'b', text: loc(`测得 Cpk 略低（${f2(Q3_12.cpkMeasured)} < ${f2(Q3_12.cpkProcess)}），σm 把测得值的分布变宽`, `Measured Cpk slightly lower (${f2(Q3_12.cpkMeasured)} < ${f2(Q3_12.cpkProcess)}), since σm widens the measured distribution`) },
      { id: 'c', text: loc('两者完全相同，测量误差不影响 Cpk', 'Identical; measurement error does not affect Cpk') },
    ],
    answer: 'b',
    explain: loc(
      `测得值的标准差是 √(σ² + σm²) = √(144 + 4) ≈ 12.17 mV，比 σ 大，所以测得 Cpk = 50/(3 × 12.17) ≈ ${f2(Q3_12.cpkMeasured)}，略低于工艺 Cpk ${f2(Q3_12.cpkProcess)}。测量误差只会让判断变差，不会让分布变窄。`,
      `The measured standard deviation is √(σ² + σm²) = √(144 + 4) ≈ 12.17 mV, larger than σ. So measured Cpk = 50/(3 × 12.17) ≈ ${f2(Q3_12.cpkMeasured)}, slightly below process Cpk ${f2(Q3_12.cpkProcess)}. Measurement error can only make the decision worse; it cannot narrow the distribution.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('测试通过率与真实合格率、过杀、漏检的关系是什么？', 'What is the relationship between the test pass rate, true yield, overkill and escape?'),
    options: [
      { id: 'a', text: loc('通过率 = 真实合格率 − 过杀 + 漏检', 'Pass rate = true yield − overkill + escape') },
      { id: 'b', text: loc('通过率 = 真实合格率 + 过杀 − 漏检', 'Pass rate = true yield + overkill − escape') },
      { id: 'c', text: loc('通过率 = 真实合格率', 'Pass rate = true yield') },
    ],
    answer: 'a',
    explain: loc(
      `通过的器件包括：真实合格且判通过（合格 − 过杀），加上真实不合格却判通过（漏检）。保护带 2 mV 时：${pct(Q6.yieldTrue, 2)} − ${pct(Q6.overkill, 2)} + ${pct(Q6.escape, 2)} ≈ ${pct(Q6.yieldTest, 2)}。`,
      `Passing parts are the truly good ones judged pass (good − overkill) plus the truly bad ones judged pass (escape). With a 2 mV guardband: ${pct(Q6.yieldTrue, 2)} − ${pct(Q6.overkill, 2)} + ${pct(Q6.escape, 2)} ≈ ${pct(Q6.yieldTest, 2)}.`,
    ),
  },
]

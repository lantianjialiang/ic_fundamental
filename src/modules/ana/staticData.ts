import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  DEVICES,
  HITS_OPTIONS,
  LIMIT_DNL_LSB,
  LIMIT_GAIN_LSB,
  LIMIT_INL_LSB,
  LIMIT_OFFSET_LSB,
  NCODES,
  RAMP_LEN,
  RAMP_LO,
  deviceOf,
  type DeviceId,
  type StaticResult,
  type StaticState,
} from './staticModel'

/** 带符号的 LSB 数，保留两位小数 */
export function fmtLsb(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)} LSB`
}

/** 预测框：与理想每码命中数的相对误差在 1% 以内算对 */
export function isPredictionRight(input: string, expected: number): boolean {
  if (input.trim() === '') {
    return false
  }
  const value = Number(input)
  return Number.isFinite(value) && Math.abs(value - expected) <= 0.01 * expected
}

/** 预测框下方的反馈句：没输入给提示，答对给出模型的值，答错只说方法 */
export function predictFeedback(input: string, predicted: boolean, expected: number): LText {
  if (input.trim() === '') {
    return S.predictHint
  }
  if (predicted) {
    return loc(
      `对了：理想每码命中数约为 ${expected.toFixed(1)}，与模型一致。`,
      `Correct: the ideal count per code is about ${expected.toFixed(1)}, matching the model.`,
    )
  }
  return S.predictBad
}

export const DEVICE_LABELS: Record<DeviceId, LText> = {
  typ: loc('典型器件', 'Typical device'),
  gain: loc('增益偏差大', 'Large gain error'),
  miss: loc(`丢码（码 ${deviceOf('miss').missCode ?? 0}）`, `Missing code (code ${deviceOf('miss').missCode ?? 0})`),
}

/** 器件选项：顺序即显示顺序 */
export const DEVICE_OPTIONS: Array<{ id: DeviceId; label: LText }> = DEVICES.map((d) => ({
  id: d.id,
  label: DEVICE_LABELS[d.id],
}))

/** 样本数选项：字符串 id 与 HITS_OPTIONS 一一对应 */
export const HITS_SEG_OPTIONS: Array<{ id: string; label: string }> = HITS_OPTIONS.map((h) => ({
  id: String(h),
  label: String(h),
}))

export const S = {
  kickerNow: loc('这一次测量', 'This measurement'),
  next: loc('下一课', 'Next lesson'),
  introTitle: loc('ADC 怎样把电压变成码：静态参数先看什么', 'How an ADC turns voltage into codes: which static parameters come first'),
  coreTitle: loc('拨一拨：器件与样本数', 'Try it: device and sample count'),
  coreNote: loc(
    '虚构 6 位 ADC VDUT-ADC1，共 64 个码。输入是一段覆盖 −2 ~ 66 LSB 的斜坡，统计每个码的命中数（码密度直方图）。数字是教学示意，不对应任何真实器件。',
    'Virtual 6-bit ADC VDUT-ADC1 with 64 codes. The input is a ramp covering −2 to 66 LSB; the hits in each code form the code-density histogram. The numbers are a teaching model, not a real device.',
  ),
  deviceLabel: loc('被测器件', 'Device under test'),
  hitsLabel: loc('样本数 N（次）', 'Hits N (samples)'),
  rHits: loc('样本数 N', 'Hits N'),
  rOffset: loc(`Offset（限值 ±${LIMIT_OFFSET_LSB} LSB）`, `Offset (limit ±${LIMIT_OFFSET_LSB} LSB)`),
  rGain: loc(`Gain（限值 ±${LIMIT_GAIN_LSB} LSB）`, `Gain (limit ±${LIMIT_GAIN_LSB} LSB)`),
  rDnl: loc(`最大 |DNL|（限值 ${LIMIT_DNL_LSB} LSB）`, `Max |DNL| (limit ${LIMIT_DNL_LSB} LSB)`),
  rInl: loc(`最大 |INL|（限值 ${LIMIT_INL_LSB} LSB）`, `Max |INL| (limit ${LIMIT_INL_LSB} LSB)`),
  rMissing: loc('丢码', 'Missing codes'),
  rVerdict: loc('判定', 'Verdict'),
  none: loc('无', 'None'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  predictTitle: loc('先算，再看', 'Calculate first'),
  predictLabel: loc('预测理想每码命中数', 'Predicted ideal hits per code'),
  predictHint: loc(
    `提示：斜坡覆盖 ${RAMP_LEN} LSB，每个中间码宽 1 LSB。理想每码命中数 = N ÷ ${RAMP_LEN}。`,
    `Hint: the ramp covers ${RAMP_LEN} LSB and each inner code is 1 LSB wide. Ideal hits per code = N ÷ ${RAMP_LEN}.`,
  ),
  predictBad: loc(
    '还不对：用的是覆盖范围，不是码数。斜坡覆盖的 LSB 数是 68，不是 64。',
    'Not yet: divide by the ramp range, not the number of codes. The ramp spans 68 LSB, not 64.',
  ),
  histTitle: loc('码密度直方图：各码的命中数', 'Code-density histogram: hits per code'),
  histNote: loc(
    '虚线是理想的中间码命中数。码 0 和码 63 偏大，是因为斜坡在两端伸出了满量程，这两个码各覆盖 3 LSB。红色短线标出命中数为 0 的码。',
    'The dashed line is the ideal count for an inner code. Codes 0 and 63 are large because the ramp extends past full scale; each covers 3 LSB. Red marks show codes with zero hits.',
  ),
  dnlTitle: loc('DNL 与 INL：逐码偏差与它的累加', 'DNL and INL: per-code error and its running sum'),
  dnlNote: loc(
    '上图是每个中间码的 DNL，下图是 INL（DNL 的累加）。虚线是限值；INL 首尾都回到 0，因为端点法把直线拉成两端的连线。',
    'The top panel is DNL for each inner code, the bottom panel is INL (the running sum of DNL). Dashed lines are limits; INL returns to zero at both ends because the endpoint method draws the line between the two ends.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '动态参数（SNR、THD、ENOB）留到下一课；这里只看每个码的位置和直方图的统计。',
    'Dynamic parameters (SNR, THD, ENOB) are left for the next lesson; here we only look at each code’s position and the histogram statistics.',
  ),
  task1: loc('预测：算出理想每码命中数，填进预测框（误差 1% 以内）。', 'Predict: work out the ideal hits per code and enter it in the prediction box (within 1%).'),
  task2: loc('把器件换成丢码，找出丢失的码号。', 'Switch to the missing-code device and find the lost code number.'),
  task3: loc('把样本数降到 250，观察 DNL 的噪声会变大。', 'Lower the sample count to 250 and watch the DNL noise grow.'),
}

export const FIG = {
  histAria: loc('码密度直方图：各码命中数的柱状图，理想值为虚线', 'Code-density histogram: bars of hits per code, with the ideal as a dashed line'),
  histCap: loc(
    '每根柱子是一个码的命中数。斜坡是均匀的，所以理想的中间码柱高相同；柱高偏离虚线，说明该码的宽度偏离 1 LSB。',
    'Each bar is the hits in one code. The ramp is uniform, so ideal inner codes have equal bars; a bar off the dashed line means that code is not 1 LSB wide.',
  ),
  histAxis: loc('命中数', 'Hits'),
  histExpect: loc('理想 N ÷ 68', 'Ideal N ÷ 68'),
  dnlAria: loc('DNL 柱状图与 INL 折线图，标出限值', 'DNL bars and INL line with limits marked'),
  dnlCap: loc(
    'DNL = 命中数 ÷ 中间码平均命中数 − 1，与增益无关。INL 是 DNL 的逐码累加，超过 ±1 LSB 就会在曲线上越界。',
    'DNL = hits ÷ mean inner-code hits − 1, which does not depend on gain. INL is the running sum of DNL; a curve beyond ±1 LSB fails.',
  ),
  dnlAxis: loc('DNL (LSB)', 'DNL (LSB)'),
  inlAxis: loc('INL (LSB)', 'INL (LSB)'),
}

export const INTRO: LText[] = [
  loc(
    '{@anaSampling} 讲了采样与混叠；ADC 的另一半问题是量化：每个码覆盖一段电压，码与码之间的跳变点不一定等距。静态参数只看这些跳变点的位置，不看频谱。',
    '{@anaSampling} covered sampling and aliasing. The other half of an ADC problem is quantisation: each code covers a span of voltage, and the transition points between codes are not necessarily evenly spaced. Static parameters look only at where those transitions sit, not at a spectrum.',
  ),
  loc(
    '这一课练四件事：Offset（第一个跳变点的位置）、Gain（满量程的跨度）、DNL（单个码宽相对平均值的偏差）、INL（DNL 的累加，也就是各跳变点偏离直线的程度）。丢码是 DNL 为 −1 的特例。动态参数见 {@anaDynamic}。',
    'This lesson practises four things: offset (where the first transition sits), gain (the full-scale span), DNL (each code width against the average) and INL (the running sum of DNL, i.e. how far each transition sits from the line). A missing code is the special case where DNL is −1. Dynamic parameters are in {@anaDynamic}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'DNL 超限就一定是坏码。样本数少时，每码命中数只有几次，统计波动本身就会让 DNL 超过 0.5 LSB；判定前要先确认样本数够不够。',
    'A DNL over limit always means a bad code. With few samples each code has only a few hits, and the statistical noise alone can push DNL past 0.5 LSB; check the sample count before judging.',
  ),
  loc(
    '增益误差会算进 DNL。增益误差让所有码按同一比例拉伸，DNL 以中间码的平均命中数为基准，归一后不计入；只有某个码比平均宽或窄才是 DNL。',
    'Gain error goes into DNL. Gain stretches every code by the same ratio; DNL is measured against the average inner-code hits, so the common ratio cancels. Only a code that is wider or narrower than average shows up in DNL.',
  ),
  loc(
    '丢码的 DNL 不是 0。丢码的码宽为零，命中数为 0，DNL = 0 ÷ 平均 − 1 = −1 LSB，INL 在那里出现一个台阶。',
    'A missing code does not have DNL of 0. Its width is zero and it gets no hits, so DNL = 0 ÷ mean − 1 = −1 LSB, and INL steps down there.',
  ),
  loc(
    '理想每码命中数等于 N ÷ 码数。斜坡覆盖的范围是 68 LSB，不是 64 个码；每个中间码宽 1 LSB，所以理想每码命中数是 N ÷ 68。',
    'Ideal hits per code is N ÷ number of codes. The ramp covers 68 LSB, not 64 codes; each inner code is 1 LSB wide, so the ideal is N ÷ 68.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Offset 看码 0 的命中数（第一个跳变点的位置）；Gain 看满量程跨度；DNL 看单个码的命中数相对平均值；INL 是 DNL 的累加。样本数越多，统计波动越小，判定越可靠；丢码表现为命中数为 0。',
  'Offset comes from the hits in code 0 (where the first transition sits); gain is the full-scale span; DNL compares one code’s hits with the average; INL is the running sum of DNL. More samples mean less statistical noise and a more reliable verdict; a missing code shows up as zero hits.',
)

/** 判定右侧说明：按 Offset → Gain → 丢码 → DNL → INL 的顺序给出第一个不通过的项及原因 */
export function verdictOf(state: StaticState, result: StaticResult): { title: LText; text: LText } {
  if (!result.offsetPass) {
    return {
      title: S.fail,
      text: loc(
        `Offset ${fmtLsb(result.offsetLsb)}，超过 ±${LIMIT_OFFSET_LSB} LSB。它由码 0 的命中数算出：命中数少，说明第一个跳变点整体偏移了。`,
        `Offset ${fmtLsb(result.offsetLsb)}, beyond ±${LIMIT_OFFSET_LSB} LSB. It is computed from the hits in code 0: fewer hits means the first transition has shifted as a whole.`,
      ),
    }
  }
  if (!result.gainPass) {
    return {
      title: S.fail,
      text: loc(
        `Gain ${fmtLsb(result.gainLsb)}，超过 ±${LIMIT_GAIN_LSB} LSB。满量程跨度应为 62 LSB，这里多出或少了 ${Math.abs(result.gainLsb).toFixed(2)} LSB。增益误差只改跨度，不改单个码的相对宽度，所以 DNL 可能仍然通过。`,
        `Gain ${fmtLsb(result.gainLsb)}, beyond ±${LIMIT_GAIN_LSB} LSB. The full-scale span should be 62 LSB, and here it is off by ${Math.abs(result.gainLsb).toFixed(2)} LSB. Gain error changes only the span, not the relative width of each code, so DNL can still pass.`,
      ),
    }
  }
  if (result.missing.length > 0) {
    return {
      title: S.fail,
      text: loc(
        `码 ${result.missing.join(', ')} 的命中数为 0，宽度为零：DNL = −1 LSB，INL 在该码处出现一个台阶。丢码是功能性缺陷，不能靠平均或修调救回来。`,
        `Code ${result.missing.join(', ')} has zero hits, so its width is zero: DNL = −1 LSB, and INL steps at that code. A missing code is a functional defect that averaging or trim cannot recover.`,
      ),
    }
  }
  if (!result.dnlPass) {
    return {
      title: S.fail,
      text: loc(
        `最大 |DNL| 为 ${result.maxDnl.toFixed(2)} LSB，超过 ±${LIMIT_DNL_LSB} LSB。N = ${state.hits} 时每码平均只有 ${result.expected.toFixed(1)} 次命中，统计波动可能就有这么大；先增加样本数，再判断是不是器件的问题。`,
        `Max |DNL| is ${result.maxDnl.toFixed(2)} LSB, beyond ±${LIMIT_DNL_LSB} LSB. At N = ${state.hits} each code averages only ${result.expected.toFixed(1)} hits, and statistical noise can be this large; raise the sample count before deciding the device is at fault.`,
      ),
    }
  }
  if (!result.inlPass) {
    return {
      title: S.fail,
      text: loc(
        `最大 |INL| 为 ${result.maxInl.toFixed(2)} LSB，超过 ±${LIMIT_INL_LSB} LSB。INL 是 DNL 的累加，单个码的小偏差会在曲线上逐步累积，所以 INL 比 DNL 更能反映整体的线性度。`,
        `Max |INL| is ${result.maxInl.toFixed(2)} LSB, beyond ±${LIMIT_INL_LSB} LSB. INL is the running sum of DNL, so small per-code errors build up along the curve; INL reflects overall linearity better than DNL does.`,
      ),
    }
  }
  return {
    title: S.pass,
    text: loc(
      `Offset ${fmtLsb(result.offsetLsb)}，Gain ${fmtLsb(result.gainLsb)}，最大 |DNL| ${result.maxDnl.toFixed(2)} LSB，最大 |INL| ${result.maxInl.toFixed(2)} LSB，无丢码。这些结论只对当前样本数和直方图测量成立，样本数变了，统计结果也会变。`,
      `Offset ${fmtLsb(result.offsetLsb)}, gain ${fmtLsb(result.gainLsb)}, max |DNL| ${result.maxDnl.toFixed(2)} LSB, max |INL| ${result.maxInl.toFixed(2)} LSB, no missing codes. These hold for the current sample count and histogram; a different sample count changes the statistics.`,
    ),
  }
}

/** 三张任务卡：完成与否由当前设置和预测框内容算出 */
export function taskItems(state: StaticState, result: StaticResult, predicted: boolean): TaskItem[] {
  return [
    { id: 'predict', text: S.task1, done: predicted },
    { id: 'miss', text: S.task2, done: state.device === 'miss' && result.missing.length > 0 },
    { id: 'hits', text: S.task3, done: state.hits === HITS_OPTIONS[HITS_OPTIONS.length - 1] },
  ]
}

/* 小测的数字全部由模型常量算出：改了模型，题干和解析自动跟着变 */
const Q_N = HITS_OPTIONS[0]
const Q_N_SMALL = HITS_OPTIONS[2]
const Q_EXPECT = Q_N / RAMP_LEN
const Q_WRONG_CODES = Q_N / NCODES
const Q_WRONG_ENDPOINT = (Q_N * 3) / RAMP_LEN
const Q_GAIN_ERR = deviceOf('gain').gainErr
const Q_SPAN_DEV = (NCODES - 2) * Q_GAIN_ERR
const Q_NOISE_RATIO = Math.sqrt(Q_N / Q_N_SMALL)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `N = ${Q_N} 次样本，斜坡覆盖 ${RAMP_LEN} LSB。中间码的理想命中数约是多少？`,
      `N = ${Q_N} samples on a ramp covering ${RAMP_LEN} LSB. About how many hits should an inner code get?`,
    ),
    options: [
      { id: 'a', text: loc(`${Q_WRONG_CODES.toFixed(0)}`, `${Q_WRONG_CODES.toFixed(0)}`) },
      { id: 'b', text: loc(`${Q_EXPECT.toFixed(0)}`, `${Q_EXPECT.toFixed(0)}`) },
      { id: 'c', text: loc(`${Q_WRONG_ENDPOINT.toFixed(0)}`, `${Q_WRONG_ENDPOINT.toFixed(0)}`) },
    ],
    answer: 'b',
    explain: loc(
      `理想命中数 = N ÷ ${RAMP_LEN} ≈ ${Q_EXPECT.toFixed(1)}。选项 a 是 N ÷ 64，把斜坡当成只覆盖 64 码；选项 c 是端点码的理想值（3 LSB 宽），不是中间码。`,
      `Ideal hits = N ÷ ${RAMP_LEN} ≈ ${Q_EXPECT.toFixed(1)}. Option a is N ÷ 64, which treats the ramp as covering only 64 codes; option c is the ideal for an endpoint code (3 LSB wide), not an inner code.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('Offset 为什么由码 0 的命中数算出？', 'Why is offset computed from the hits in code 0?'),
    options: [
      { id: 'a', text: loc('码 0 的命中数直接等于 Offset 的 LSB 数', 'The hits in code 0 equal the offset in LSB directly') },
      { id: 'b', text: loc('码 0 的命中数占比对应第一个跳变点 T_1 的位置，T_1 相对理想值 1 LSB 的偏差就是 Offset', 'The share of hits in code 0 gives the position of the first transition T_1; its deviation from the ideal 1 LSB is the offset') },
      { id: 'c', text: loc('码 0 的命中数越多，Offset 越小', 'The more hits in code 0, the smaller the offset') },
    ],
    answer: 'b',
    explain: loc(
      `斜坡从 ${RAMP_LO} LSB 均匀开始，低于 T_1 的样本落在码 0，所以 T_1 = ${RAMP_LO} + ${RAMP_LEN} × H_0 ÷ N。Offset = T_1 − 1 LSB。选项 c 反了：码 0 的命中数是位置的估计，不是 Offset 的大小。`,
      `The ramp starts uniformly at ${RAMP_LO} LSB, and samples below T_1 land in code 0, so T_1 = ${RAMP_LO} + ${RAMP_LEN} × H_0 ÷ N. Offset = T_1 − 1 LSB. Option c is backwards: the code-0 count estimates a position, not the size of the offset.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      `增益偏差 ${(Q_GAIN_ERR * 100).toFixed(0)}% 的器件，满量程跨度（码 1 到码 62 之间）的偏差约是多少 LSB？`,
      `A device with ${(Q_GAIN_ERR * 100).toFixed(0)}% gain error: about how many LSB is the full-scale span (between code 1 and code 62) off by?`,
    ),
    options: [
      { id: 'a', text: loc(`${Q_GAIN_ERR.toFixed(2)} LSB`, `${Q_GAIN_ERR.toFixed(2)} LSB`) },
      { id: 'b', text: loc(`${Q_SPAN_DEV.toFixed(2)} LSB`, `${Q_SPAN_DEV.toFixed(2)} LSB`) },
      { id: 'c', text: loc(`${(Q_SPAN_DEV * 10).toFixed(1)} LSB`, `${(Q_SPAN_DEV * 10).toFixed(1)} LSB`) },
    ],
    answer: 'b',
    explain: loc(
      `理想跨度 62 LSB，偏差 = 62 × ${Q_GAIN_ERR.toFixed(2)} ≈ ${Q_SPAN_DEV.toFixed(2)} LSB，超过 ±1 LSB 的 Gain 限值。选项 a 忘了乘以 62。`,
      `Ideal span 62 LSB, deviation = 62 × ${Q_GAIN_ERR.toFixed(2)} ≈ ${Q_SPAN_DEV.toFixed(2)} LSB, beyond the ±1 LSB gain limit. Option a forgets to multiply by 62.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('DNL 为什么以中间码的平均命中数为基准？', 'Why is DNL measured against the average inner-code hits?'),
    options: [
      { id: 'a', text: loc('平均值越大，DNL 越容易通过限值', 'A larger average makes the DNL limit easier to pass') },
      { id: 'b', text: loc('增益误差让所有码等比例变化，归一后被抵消，DNL 只反映码与码之间的不均匀', 'Gain error scales every code by the same ratio, which cancels after normalisation, so DNL shows only the unevenness between codes') },
      { id: 'c', text: loc('平均值是 N ÷ 码数，因为这样计算最快', 'The average is N ÷ number of codes, because that is the fastest to compute') },
    ],
    answer: 'b',
    explain: loc(
      '增益误差是整体拉伸，每个码的宽度都按同一比例变化；用平均码宽归一后，这个比例被约掉，DNL 只剩下码与码之间的差异。选项 c 也不对：平均值来自实测的中间码计数，不是理想值。',
      'Gain error stretches the whole transfer, so each code width changes by the same ratio; normalising by the average width removes that ratio, and DNL keeps only the difference between codes. Option c is also wrong: the average comes from the measured inner-code counts, not the ideal value.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('某个中间码的命中数为 0，它的 DNL 是多少？', 'An inner code has zero hits. What is its DNL?'),
    options: [
      { id: 'a', text: loc('0 LSB', '0 LSB') },
      { id: 'b', text: loc('−1 LSB', '−1 LSB') },
      { id: 'c', text: loc('+1 LSB', '+1 LSB') },
    ],
    answer: 'b',
    explain: loc(
      'DNL = 命中数 ÷ 平均命中数 − 1 = 0 ÷ 平均 − 1 = −1 LSB。码宽为零，比理想的 1 LSB 少了整整一个 LSB，这就是丢码的判据。',
      'DNL = hits ÷ mean hits − 1 = 0 ÷ mean − 1 = −1 LSB. The code has zero width, one full LSB less than the ideal 1 LSB, which is the test for a missing code.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      `样本数从 ${Q_N} 降到 ${Q_N_SMALL}（÷ ${Q_N / Q_N_SMALL}），统计噪声的标准差大约变成原来的几倍？`,
      `Sample count drops from ${Q_N} to ${Q_N_SMALL} (÷ ${Q_N / Q_N_SMALL}). Roughly how many times larger does the statistical noise standard deviation become?`,
    ),
    options: [
      { id: 'a', text: loc(`${(Q_N / Q_N_SMALL).toFixed(0)} 倍`, `${(Q_N / Q_N_SMALL).toFixed(0)}×`) },
      { id: 'b', text: loc(`${Q_NOISE_RATIO.toFixed(0)} 倍`, `${Q_NOISE_RATIO.toFixed(0)}×`) },
      { id: 'c', text: loc('2 倍', '2×') },
    ],
    answer: 'b',
    explain: loc(
      `计数的统计噪声与 √N 成反比，所以噪声比 = √(${Q_N} ÷ ${Q_N_SMALL}) = ${Q_NOISE_RATIO.toFixed(0)}。选项 a 把噪声当成与 N 成正比，错了。`,
      `Count noise scales as 1 ÷ √N, so the noise ratio = √(${Q_N} ÷ ${Q_N_SMALL}) = ${Q_NOISE_RATIO.toFixed(0)}. Option a treats the noise as proportional to N, which is wrong.`,
    ),
  },
]

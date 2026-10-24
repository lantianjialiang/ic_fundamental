import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { qOfBer, tjAtBer } from './core/jitter'
import { BER_TARGETS, RATES, type JitterAnalysis, type JitterState } from './hsJitterModel'

export const RATE_OPTIONS = RATES.map((rate) => ({ id: String(rate), label: `${rate} Gb/s` }))
export const BER_OPTIONS = BER_TARGETS.map((ber) => ({ id: String(ber), label: ber.toExponential(0) }))

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

/** 小测与结论里的数字由公式算出，与页面的计算保持一致 */
const Q_12 = qOfBer(1e-12)
const TJ_Q1 = tjAtBer(20, 2, 1e-12)
const TJ_Q2 = tjAtBer(20, 3, 1e-12)

export const S = {
  kickerNow: loc('这一次抖动', 'This jitter setting'),
  introTitle: loc('抖动拆成两部分：有界的 DJ 与高斯的 RJ', 'Jitter splits into two parts: bounded DJ and Gaussian RJ'),
  coreTitle: loc('拨一拨：DJ、RJ 与目标 BER', 'Try it: DJ, RJ and the target BER'),
  coreNote: loc(
    '左边是固定种子抽样得到的直方图（蓝柱）和双峰高斯的理论曲线（金线）；右边是浴盆曲线，纵轴是误码率的对数。绿色区是目标 BER 下的眼开口。',
    'Left: a histogram of fixed-seed samples (blue bars) with the theoretical two-peak Gaussian (gold line). Right: the bathtub curve, with log BER on the vertical axis. The green band is the eye opening at the target BER.',
  ),
  rateLabel: loc('数据速率', 'Data rate'),
  berLabel: loc('目标 BER', 'Target BER'),
  rjLabel: loc('随机抖动 RJ (ps rms)', 'Random jitter RJ (ps rms)'),
  djLabel: loc('确定性抖动 DJ (ps pp)', 'Deterministic jitter DJ (ps pp)'),
  rUi: loc('单位间隔 UI', 'Unit interval UI'),
  rQ: loc('Q⁻¹(目标 BER)', 'Q⁻¹(target BER)'),
  rTjRef: loc('TJ@1e-12（tjAtBer）', 'TJ@1e-12 (tjAtBer)'),
  rTjTarget: loc('TJ@目标 BER', 'TJ@target BER'),
  rOpen: loc('目标 BER 下的开口 = UI − TJ', 'Opening at target BER = UI − TJ'),
  rVerdict: loc('判定（目标 BER）', 'Verdict (target BER)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  prereqTitle: loc('补充：本课用到的预设知识', 'Supplement: background this lesson assumes'),
  prereqNote: loc(
    '正文里的 Q⁻¹、双狄拉克 TJ 与开口公式都从这一节列出的几条推出。读完正文再回来看。',
    'The Q⁻¹, dual-Dirac TJ and opening formulas in the body are derived from the items below. Read the body first, then come back here.',
  ),
  asideLater: loc(
    '直方图只抽了有限个样本，最低只能看到约 1/4000 的尾部概率，1e-12 要靠 Q 函数外推。真实的抖动分解还有码型相关的 DDJ、周期抖动和噪声耦合，这里只练 DJ、RJ 与 TJ 三件事。',
    'A histogram of finite samples only shows tail probabilities down to about 1/4000, so 1e-12 must be extrapolated with the Q function. Real jitter decomposition also includes pattern-dependent DDJ, periodic jitter and noise coupling; here we only practise DJ, RJ and TJ.',
  ),
  next: loc('下一课：眼图分析', 'Next: Eye Diagram Analysis'),
  task1: loc('把 RJ、DJ 调大，让目标 BER 下的 TJ 超过 UI，眼完全闭合（FAIL）。', 'Raise RJ and DJ until TJ at the target BER exceeds the UI, so the eye closes completely (FAIL).'),
  task2: loc('把 RJ 调到 3 ps rms 以上，观察直方图的高斯尾变宽。', 'Raise RJ to 3 ps rms or more and watch the Gaussian tails of the histogram widen.'),
  task3: loc('把 DJ 调到 20 ps 以上，同时把 RJ 压到 1 ps rms 以下，让直方图出现两个分开的峰。', 'Raise DJ to 20 ps or more and bring RJ down to 1 ps rms or less, so the histogram shows two separate peaks.'),
  task4: loc('把目标 BER 改成 1e-15，比较 TJ 增加了多少。', 'Change the target BER to 1e-15 and compare how much TJ increases.'),
}

export const FIG = {
  histAria: loc(
    '抖动直方图：固定种子抽样的数据沿偏移，两个高斯峰分别在 ±DJ/2 附近',
    'Jitter histogram: fixed-seed sampled edge offsets, with two Gaussian peaks near ±DJ/2',
  ),
  histCap: loc(
    '蓝柱是 4000 个数据沿的偏移次数，金线是双峰高斯的理论计数。两个峰的间距由 DJ 决定（在 ±DJ/2），每个峰的宽度由 RJ 决定。',
    'Blue bars count the offsets of 4000 data edges; the gold line is the theoretical count of the two-peak Gaussian. The peak spacing is set by DJ (at ±DJ/2) and each peak width by RJ.',
  ),
  histCount: loc('次数', 'Count'),
  bathAria: loc(
    '浴盆曲线：误码率的对数随采样位置变化，目标 BER 下的开口为绿色区',
    'Bathtub curve: log of BER against sampling position, with the opening at the target BER shaded green',
  ),
  bathCap: loc(
    '横轴是采样点的位置，纵轴是误码率的对数。两侧的陡墙由 RJ 的高斯尾决定；中间的平底是 BER 低于显示下限（1e-16）的区域。虚线是目标 BER，绿色区是它下面的眼开口。',
    'The horizontal axis is the sampling position and the vertical axis is log BER. The steep walls are set by the Gaussian tails of RJ; the flat floor is where BER is below the displayed limit (1e-16). The dashed line is the target BER and the green band is the eye opening below it.',
  ),
  openLabel: loc('开口', 'Opening'),
}

export const INTRO = [
  loc(
    '{@hsTiming} 说明采样窗口会被抖动缩小。这一课把抖动本身拆开看：确定性抖动（DJ）有界、可以重复，随机抖动（RJ）是高斯分布，尾部没有硬边界。两者合成的总抖动（TJ）必须说明是在哪一个误码率下测的。',
    'The {@hsTiming} lesson showed that jitter shrinks the sampling window. This lesson takes the jitter apart: deterministic jitter (DJ) is bounded and repeatable, while random jitter (RJ) is Gaussian and its tail has no hard limit. The total jitter (TJ) that combines them must always be quoted at a stated BER.',
  ),
  loc(
    '这一课的三件事：分清 DJ 与 RJ 的形状；用双狄拉克模型算出 TJ@BER（TJ = DJ_pp + 2·Q(BER)·σ_RJ）；从浴盆曲线读出目标 BER 下的眼开口。正态分布与统计的基本量见 {@anaStats}。',
    'This lesson practises three things: tell the shapes of DJ and RJ apart; compute TJ@BER with the dual-Dirac model (TJ = DJ_pp + 2·Q(BER)·σ_RJ); and read the eye opening at the target BER from the bathtub curve. For the basic statistics of the normal distribution see {@anaStats}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    `用 6σ 作为 RJ 的峰峰值就够了。高斯尾没有硬边界，BER 为 1e-12 时要用 2·Q(1e-12)·σ ≈ ${f0(2 * Q_12)}σ，6σ 会严重低估。`,
    `Taking 6σ as the peak-to-peak RJ is enough. A Gaussian tail has no hard edge; at BER 1e-12 you need 2·Q(1e-12)·σ ≈ ${f0(2 * Q_12)}σ, and 6σ badly underestimates it.`,
  ),
  loc(
    'DJ 也像 RJ 一样，BER 越低越大。DJ 有界：双峰固定在 ±DJ/2，测得再多、BER 再低也不会超出；随 BER 变大的只有 RJ 的 Q 倍数。',
    'DJ also grows as the BER gets lower. DJ is bounded: its peaks sit at ±DJ/2 and never go beyond, however many bits you test. Only the RJ term grows with the Q factor.',
  ),
  loc(
    '直方图画得够多，就能直接读出 1e-12 的眼宽。4000 个样本的直方图，每个 bin 的概率最低只到约 1/4000；1e-12 要靠模型外推，这正是双狄拉克模型的用途。',
    'With enough samples the histogram shows the 1e-12 eye width directly. A 4000-sample histogram only reaches a probability of about 1/4000 per bin; 1e-12 has to be extrapolated with the model, which is what the dual-Dirac model is for.',
  ),
]

/** 课末补充：Q 与 Q⁻¹ 的记号、高斯尾为什么乘 Q⁻¹、双狄拉克模型推导、DJ 为什么不乘 Q、直方图的极限 */
export const PREREQ: LText[] = [
  loc(
    'Q 函数的记号：Q(x) 是标准正态分布的尾部概率，P(X > x)，Q(x) = ½·erfc(x ÷ √2)。页面和代码里写的 Q(BER) 实际指它的反函数 Q⁻¹(BER)：使尾部概率恰好等于 BER 的 σ 倍数。Q⁻¹(1e-9) ≈ 6，Q⁻¹(1e-12) ≈ 7.03，Q⁻¹(1e-15) ≈ 8。',
    'Notation for Q: Q(x) is the tail probability of a standard normal, P(X > x) = ½·erfc(x ÷ √2). The page and code write Q(BER) for its inverse Q⁻¹(BER): the number of σ at which the tail probability equals BER. Q⁻¹(1e-9) ≈ 6, Q⁻¹(1e-12) ≈ 7.03, Q⁻¹(1e-15) ≈ 8.',
  ),
  loc(
    '高斯项为什么乘 Q⁻¹：RJ 没有硬边界，要让误码率达到 BER，边沿必须偏离均值 Q⁻¹(BER)·σ，而左右两侧各有一个边沿，所以 RJ 贡献的峰峰值是 2·Q⁻¹(BER)·σ。例：σ = 2 ps、BER 1e-12 时是 2 × 7.03 × 2 ≈ 28 ps，远大于 6σ = 12 ps。',
    'Why the Gaussian term is multiplied by Q⁻¹(BER): RJ has no hard edge, so to reach a BER the edge must sit Q⁻¹(BER)·σ away from its mean, and each side contributes one edge. So RJ adds 2·Q⁻¹(BER)·σ peak-to-peak. Example: σ = 2 ps at BER 1e-12 gives 2 × 7.03 × 2 ≈ 28 ps, far more than 6σ = 12 ps.',
  ),
  loc(
    '双狄拉克模型的推导：把 DJ 近似成两个 δ 峰，一半的沿在 −DJ/2，一半在 +DJ/2；每个峰再被高斯 RJ 展宽。某一侧的边沿越过采样点的概率就是高斯尾。于是 BER 下的眼开口 = UI − 两侧各自的（DJ/2 + Q⁻¹·σ）之和 = UI − DJ − 2·Q⁻¹(BER)·σ = UI − TJ(BER)。',
    'Derivation of the dual-Dirac model: approximate DJ by two delta peaks, half the edges at −DJ/2 and half at +DJ/2; each peak is then widened by the Gaussian RJ. The chance that one side’s edge crosses the sample is a Gaussian tail. The eye opening at a given BER is UI minus the two sides, each at DJ/2 + Q⁻¹(BER)·σ: UI − DJ − 2·Q⁻¹(BER)·σ = UI − TJ(BER).',
  ),
  loc(
    '为什么 DJ 不乘 Q：DJ 有界，峰位置固定在 ±DJ/2，无论测多少位都不会超出，所以它按峰峰值整块扣。只有 RJ 的尾部会随 BER 降低而变远。',
    'Why DJ is not multiplied by Q: DJ is bounded, its peaks sit at ±DJ/2, and no number of bits goes beyond them, so it is subtracted whole as a peak-to-peak value. Only the RJ tail moves further out as BER falls.',
  ),
  loc(
    '直方图的极限：4000 个样本，每个 bin 的概率最低只能看到约 1/4000，所以 1e-12 只能靠模型外推。页面的固定随机种子只保证每次结果相同，不改变统计结论。',
    'Limit of the histogram: with 4000 samples the smallest probability a bin can show is about 1/4000, so 1e-12 can only be reached by extrapolation with the model. The fixed random seed on the page only makes every run identical; it does not change the statistics.',
  ),
]

export const TAKEAWAY: LText = loc(
  `TJ@BER = DJ_pp + 2·Q⁻¹(BER)·σ_RJ（Q(1e-12) ≈ ${f2(Q_12)}）。DJ 有界，按峰峰值整块扣；RJ 是高斯，尾部随 BER 变远。眼开口 = UI − TJ@BER，必须针对一个指定的 BER 说，否则数字没有意义。`,
  `TJ@BER = DJ_pp + 2·Q⁻¹(BER)·σ_RJ (Q(1e-12) ≈ ${f2(Q_12)}). DJ is bounded and is subtracted whole as a peak-to-peak value; RJ is Gaussian and its tail reaches further as BER falls. The eye opening = UI − TJ@BER, and it must always be stated for a given BER, otherwise the number means nothing.`,
)

const NOTE_RJ = loc(
  '直方图只有有限个样本，看不到 1e-12 的尾部；这里的 TJ 是用 Q 函数外推出来的。',
  'A histogram of finite samples cannot show the 1e-12 tail; the TJ here is extrapolated with the Q function.',
)

/** 右侧说明栏：根据目标 BER 下的开口给结论和原因 */
export function verdictOf(state: JitterState, a: JitterAnalysis): { title: LText; text: LText; note: LText | null } {
  const berText = state.ber.toExponential(0)
  const note = state.rj > 0 ? NOTE_RJ : null
  if (a.pass) {
    return {
      title: S.pass,
      text: loc(
        `在 ${berText} 下 TJ = ${f1(a.tjTarget)} ps，比 UI = ${f1(a.ui)} ps 小，眼还开着 ${f1(a.opening)} ps。DJ 有界，按峰峰值 ${f1(state.dj)} ps 整块扣；RJ 的高斯尾按 Q(${berText}) = ${f2(a.q)} 倍的 σ 扣。`,
        `At ${berText} the TJ is ${f1(a.tjTarget)} ps, less than the UI of ${f1(a.ui)} ps, so the eye is still open by ${f1(a.opening)} ps. DJ is bounded and subtracted whole as its ${f1(state.dj)} ps peak-to-peak; the RJ tail is subtracted as Q(${berText}) = ${f2(a.q)} times σ.`,
      ),
      note,
    }
  }
  return {
    title: S.fail,
    text: loc(
      `在 ${berText} 下 TJ = ${f1(a.tjTarget)} ps 已经超过 UI = ${f1(a.ui)} ps，眼完全闭合（开口 ${f1(a.opening)} ps < 0）。原因：DJ 固定为 ${f1(state.dj)} ps，而 RJ 的 Q 倍数随 BER 降低而变大，两者加在一起就超过了一个 UI。`,
      `At ${berText} the TJ of ${f1(a.tjTarget)} ps already exceeds the UI of ${f1(a.ui)} ps, so the eye is completely closed (opening ${f1(a.opening)} ps < 0). The cause: DJ is fixed at ${f1(state.dj)} ps, and the RJ Q factor grows as the BER falls; together they exceed one UI.`,
    ),
    note,
  }
}

/** 四张任务卡：完成与否由当前设置和分析结果算出 */
export function taskItems(state: JitterState, a: JitterAnalysis): TaskItem[] {
  return [
    { id: 'fail', text: S.task1, done: !a.pass },
    { id: 'rj', text: S.task2, done: state.rj >= 3 },
    { id: 'dj', text: S.task3, done: state.dj >= 20 && state.rj <= 1 },
    { id: 'ber', text: S.task4, done: state.ber === 1e-15 },
  ]
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('DJ 峰峰值 20 ps、RJ 为 2 ps rms，1e-12 下的 TJ 大约是多少？', 'DJ is 20 ps peak-to-peak and RJ is 2 ps rms. Roughly what is TJ at 1e-12?'),
    options: [
      { id: 'a', text: loc('20 ps（只看 DJ）', '20 ps (DJ only)') },
      { id: 'b', text: loc(`${f1(TJ_Q1)} ps`, `${f1(TJ_Q1)} ps`) },
      { id: 'c', text: loc('4 ps（2 × RJ）', '4 ps (2 × RJ)') },
    ],
    answer: 'b',
    explain: loc(
      `TJ = DJ_pp + 2·Q(1e-12)·σ = 20 + 2 × ${f2(Q_12)} × 2 ≈ ${f1(TJ_Q1)} ps。只看 DJ 会少算约 ${f0(TJ_Q1 - 20)} ps 的随机部分。`,
      `TJ = DJ_pp + 2·Q(1e-12)·σ = 20 + 2 × ${f2(Q_12)} × 2 ≈ ${f1(TJ_Q1)} ps. Counting DJ alone misses about ${f0(TJ_Q1 - 20)} ps of random contribution.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('DJ 仍是 20 ps，RJ 从 2 ps rms 增到 3 ps rms，1e-12 下的 TJ 增加多少？', 'DJ stays at 20 ps and RJ rises from 2 ps rms to 3 ps rms. By how much does TJ at 1e-12 increase?'),
    options: [
      { id: 'a', text: loc('1 ps', '1 ps') },
      { id: 'b', text: loc(`${f1(TJ_Q2 - TJ_Q1)} ps`, `${f1(TJ_Q2 - TJ_Q1)} ps`) },
      { id: 'c', text: loc('3 ps', '3 ps') },
    ],
    answer: 'b',
    explain: loc(
      `ΔTJ = 2·Q(1e-12)·Δσ = 2 × ${f2(Q_12)} × 1 ≈ ${f1(TJ_Q2 - TJ_Q1)} ps。RJ 每增加 1 ps rms，TJ@1e-12 就增加约 ${f0(2 * Q_12)} ps，而不是 1 ps。`,
      `ΔTJ = 2·Q(1e-12)·Δσ = 2 × ${f2(Q_12)} × 1 ≈ ${f1(TJ_Q2 - TJ_Q1)} ps. Each 1 ps rms of RJ adds about ${f0(2 * Q_12)} ps to TJ@1e-12, not 1 ps.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('为什么 DJ 项不随目标 BER 变大？', 'Why does the DJ term not grow as the target BER gets lower?'),
    options: [
      { id: 'a', text: loc('DJ 有界，双峰固定在 ±DJ/2，BER 再低也不会超出，所以在 TJ 公式里它是固定项', 'DJ is bounded: its peaks sit fixed at ±DJ/2 and never go beyond, however low the BER, so it is a fixed term in the TJ formula') },
      { id: 'b', text: loc('DJ 是高斯分布，BER 越低尾部越长', 'DJ is Gaussian, and its tail gets longer as the BER falls') },
      { id: 'c', text: loc('DJ 只在 BER 大于 1e-9 时才出现', 'DJ only appears when the BER is above 1e-9') },
    ],
    answer: 'a',
    explain: loc(
      '双狄拉克模型把 DJ 当成两个有界的尖峰（±DJ/2），测多少个沿都不会超出它们。随 BER 变远的只有 RJ 的高斯尾，所以只有 RJ 项要乘 Q(BER)。',
      'The dual-Dirac model treats DJ as two bounded spikes at ±DJ/2 that no number of edges will exceed. Only the Gaussian tail of RJ moves further out as BER falls, so only the RJ term is multiplied by Q(BER).',
    ),
  },
  {
    id: 'q4',
    prompt: loc('双狄拉克模型里，DJ 的分布长什么样？', 'In the dual-Dirac model, what does the DJ distribution look like?'),
    options: [
      { id: 'a', text: loc('两个尖峰分别在 ±DJ/2，每个峰上再叠一个高斯 RJ', 'Two spikes at ±DJ/2, each spread by a Gaussian RJ') },
      { id: 'b', text: loc('一个在 ±DJ 之间的均匀分布', 'A uniform distribution spanning ±DJ') },
      { id: 'c', text: loc('一个标准差为 DJ/6 的高斯', 'A Gaussian with standard deviation DJ/6') },
    ],
    answer: 'a',
    explain: loc(
      '双狄拉克模型用两个 δ 峰表示 DJ：一半的沿在 −DJ/2，一半在 +DJ/2；RJ 的高斯让每个峰变宽。直方图上看到的就是两个分开的、各自展宽的峰。',
      'The dual-Dirac model represents DJ by two delta peaks: half the edges sit at −DJ/2 and half at +DJ/2; the RJ Gaussian widens each peak. The histogram shows two separate, widened peaks.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('为什么 4000 个样本的直方图读不出 1e-12 的 TJ？', 'Why can a histogram of 4000 samples not read off TJ at 1e-12?'),
    options: [
      { id: 'a', text: loc('每个 bin 的概率最低只能看到约 1/4000，1e-12 要靠 Q 函数外推', 'A bin can only show a probability down to about 1/4000, so 1e-12 must be extrapolated with the Q function') },
      { id: 'b', text: loc('直方图不能显示高斯分布', 'A histogram cannot show a Gaussian distribution') },
      { id: 'c', text: loc('BER 只能在眼图上测，直方图不适用', 'BER can only be measured on an eye diagram, not a histogram') },
    ],
    answer: 'a',
    explain: loc(
      '1e-12 意味着要统计万亿次量级的沿，直接计数不可行。直方图只负责展示形状，尾部的概率要用双狄拉克模型和 Q 函数外推。',
      '1e-12 means counting on the order of a trillion edges, which is not feasible directly. The histogram shows the shape; the tail probabilities are extrapolated with the dual-Dirac model and the Q function.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('RJ 固定，DJ 从 0 加到 20 ps，目标 BER 下的眼开口会怎样？', 'With RJ fixed, DJ rises from 0 to 20 ps. What happens to the eye opening at the target BER?'),
    options: [
      { id: 'a', text: loc('开口减少约 20 ps：两侧的陡墙各向内移约 10 ps', 'It shrinks by about 20 ps: each steep wall moves inward by about 10 ps') },
      { id: 'b', text: loc('浴盆变深，开口不变', 'The bathtub gets deeper and the opening stays the same') },
      { id: 'c', text: loc('开口变宽，因为 DJ 让采样更分散', 'It widens, because DJ spreads the samples out') },
    ],
    answer: 'a',
    explain: loc(
      '开口 = UI − DJ_pp − 2·Q·σ。DJ 的 20 ps 在两侧各吃掉一半（10 ps），合计 20 ps；RJ 不变，它的那一项也不变。',
      'Opening = UI − DJ_pp − 2·Q·σ. The 20 ps of DJ eats half on each side (10 ps each), 20 ps in total; RJ is unchanged, so its term is unchanged.',
    ),
  },
]

import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  BITS,
  LONG_RUN,
  ORDERS,
  PATHS,
  RATES,
  type InterfaceAnalysis,
  type InterfacePath,
  type InterfaceState,
} from './interfaceModel'

const f0 = (value: number) => value.toFixed(0)

/** 科学计数：7.5×10^-5 这样的写法，尾数保留两位有效小数 */
export function sci(value: number): string {
  const exp = Math.floor(Math.log10(value))
  const mant = Number((value / 10 ** exp).toFixed(2))
  return `${mant}×10^${exp}`
}

export const ORDER_OPTIONS = ORDERS.map((order) => ({ id: String(order), label: `PRBS${order}` }))

/** 由 Seg 传回的字符串 id 换回阶数；找不到时取第一个 */
export function orderOf(id: string) {
  return ORDERS.find((order) => String(order) === id) ?? ORDERS[0]
}

export const RATE_OPTIONS = RATES.map((rate) => ({ id: String(rate), label: `${rate} Gb/s` }))

const PATH_LABEL: Record<InterfacePath, LText> = {
  ext: loc('外部链路：ATE 采样引脚', 'External: ATE samples the pin'),
  loop: loc('Loopback：芯片内部回环', 'Loopback: inside the chip'),
}

export const PATH_OPTIONS = PATHS.map((id) => ({ id, label: PATH_LABEL[id] }))

export const S = {
  kickerNow: loc('这一次测试', 'This test run'),
  introTitle: loc('高速接口测试：用误码率说话', 'High-speed interface test: judge by bit error rate'),
  coreTitle: loc('拨一拨：码型、路径与采样相位', 'Try it: pattern, path and sampling phase'),
  coreNote: loc(
    '每个点都是对 40000 位的实测：用 PRBS 码型逐位取样，错误位数除以总位数就是 BER。横轴是采样相位，纵轴是 log10(BER)；虚线是双狄拉克模型对更低 BER 的外推。',
    'Each point is a measurement over 40000 bits: the PRBS pattern is sampled bit by bit, and errors divided by bits gives the BER. The x-axis is the sampling phase and the y-axis is log10(BER); the dashed line extrapolates to lower BER with a dual-Dirac model.',
  ),
  patternLabel: loc('码型阶数', 'Pattern order'),
  pathLabel: loc('测试路径', 'Test path'),
  rateLabel: loc('数据速率', 'Data rate'),
  phaseLabel: loc('采样相位 φ', 'Sampling phase φ'),
  rjLabel: loc('DUT 随机抖动 RJ (ps rms)', 'DUT random jitter RJ (ps rms)'),
  djLabel: loc('DUT 确定性抖动 DJ (ps pp)', 'DUT deterministic jitter DJ (ps pp)'),
  wanderLabel: loc('长连边沿偏移 (ps)', 'Long-run edge shift (ps)'),
  axisPhase: loc('采样相位 φ（UI）', 'Sampling phase φ (UI)'),
  curveMeasured: loc(
    '实心点：错误位数 ÷ 位数。空心点：0 错误，画在 3/N 的上限处。',
    'Filled: errors ÷ bits. Hollow: 0 errors, drawn at the 3/N upper bound.',
  ),
  curveExt: loc('虚线：双狄拉克外推（不含长连偏移）', 'Dashed: dual-Dirac extrapolation (no long-run shift)'),
  markNow: loc('当前相位', 'This phase'),
  targetLine: loc('BER 1e-12 线（外推）', 'BER 1e-12 line (extrapolated)'),
  rUi: loc('单位间隔 UI', 'Unit interval UI'),
  rPhase: loc('采样相位（时间）', 'Sampling phase (time)'),
  rErr: loc('错误位数（本相位）', 'Error bits (this phase)'),
  rBer: loc('BER（本相位，实测）', 'BER (this phase, measured)'),
  rOpenLoop: loc('眼宽 @1e-12：Loopback（外推）', 'Eye width @1e-12: loopback (extrapolated)'),
  rOpenExt: loc('眼宽 @1e-12：外部链路（外推）', 'Eye width @1e-12: external path (extrapolated)'),
  rVerdict: loc('判定（本相位）', 'Verdict (this phase)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  closed: loc('闭合', 'closed'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实测试还要去嵌入夹具与板级走线的损耗、统计远多于 4 万位的数据，并用更完整的模型外推；码型也要覆盖长连与最坏情况。这里只练浴盆曲线、码型阶数和 Loopback 三件事。',
    'A real test also de-embeds the fixture and board-trace loss, counts far more than 40000 bits, extrapolates with a fuller model, and makes sure the pattern covers long runs and worst cases. Here we only practise the bathtub curve, pattern order and Loopback.',
  ),
  next: loc('下一课：ATE 高速测试的限制', 'Next: Limits of ATE for High-speed Test'),
  passNote: loc(
    '“0 错误”只说明这些位没错，不等于 BER 为零。要说 1e-12，看右侧的外推读数。',
    '“0 errors” only means these bits were clean, not that BER is zero. For 1e-12, read the extrapolated numbers on the right.',
  ),
  extNote: loc(
    '外部链路还叠加了 ATE 与夹具的附加抖动，所以错误比芯片本身多；切到 Loopback 只剩芯片内部路径。',
    'The external path also adds ATE and fixture jitter, so it shows more errors than the chip alone; Loopback leaves only the path inside the chip.',
  ),
  task1: loc(
    '把采样相位移到边沿附近（小于 0.15 UI 或大于 0.85 UI），让错误位数大于 0（FAIL）。',
    'Move the sampling phase close to an edge (below 0.15 UI or above 0.85 UI) until the error count is above 0 (FAIL).',
  ),
  task2: loc(
    '把 RJ 加到 6 ps 以上，看外推的眼宽是否缩到 UI 的一半以下。',
    'Raise RJ to 6 ps or more and check whether the extrapolated eye width falls below half a UI.',
  ),
  task3: loc(
    '选 PRBS15 或 PRBS31，把长连偏移加到 15 ps 以上，采样相位放在 0.05–0.25 UI，看到长连引起的错误。',
    'Pick PRBS15 or PRBS31, raise the long-run shift to 15 ps or more, and put the sampling phase at 0.05–0.25 UI to see errors caused by long runs.',
  ),
  task4: loc(
    '保持上一条的设置，只把码型换成 PRBS7，长连引起的错误消失，说出 PRBS7 为什么测不到这类缺陷。',
    'Keep the settings from the previous card, switch only the pattern to PRBS7, and see the long-run errors disappear; explain why PRBS7 cannot catch this defect.',
  ),
  task5: loc(
    '打开 Loopback，对比两条路径的眼宽读数，说出差距来自 ATE 与夹具的附加抖动。',
    'Turn on Loopback, compare the two eye-width readings, and explain that the gap comes from the added ATE and fixture jitter.',
  ),
}

export const FIG = {
  bathAria: loc(
    'BER 浴盆曲线：横轴采样相位，纵轴 log10(BER)，中间低、两侧高',
    'BER bathtub curve: sampling phase on the x-axis, log10(BER) on the y-axis, low in the middle and high at the sides',
  ),
  bathCap: loc(
    '横轴是采样相位，中间（0.5 UI）BER 最低。实测点与双狄拉克外推在可测范围内应该重合；低于测量地板的部分只能靠外推。',
    'The x-axis is the sampling phase; BER is lowest in the middle (0.5 UI). Measured points and the dual-Dirac extrapolation should overlap where measurable; below the measurement floor only the extrapolation is available.',
  ),
  pathAria: loc('测试路径示意：外部链路与 Loopback 两种方式', 'Test path diagram: external path versus Loopback'),
  pathCap: loc(
    '外部链路时，数据从 DUT 引脚经夹具送到 ATE 比较器，夹具与比较器的抖动会混进结果。Loopback 时，芯片内部把 Tx 接回 Rx，错误由芯片内的 PRBS 检测器计数，ATE 只读回计数。',
    'With the external path, data leaves the DUT pin, crosses the fixture and reaches the ATE comparator, so fixture and comparator jitter mix into the result. With Loopback, the chip connects Tx back to Rx internally, its own PRBS checker counts errors, and the ATE only reads the count back.',
  ),
  ateTitle: loc('ATE 测试机', 'ATE tester'),
  comparator: loc('比较器采样', 'Comparator samples'),
  readCount: loc('只读错误计数', 'Reads error count'),
  dutTitle: loc('DUT 芯片', 'DUT chip'),
  fixture: loc('夹具', 'Fixture'),
  addedJitter: loc('附加抖动', 'Added jitter'),
  errLine: loc('错误计数（低速）', 'Error count (slow)'),
  checker: loc('PRBS 检测器', 'PRBS checker'),
  loopLabel: loc('回环', 'Loop'),
}

export const INTRO = [
  loc(
    '{@hsEye} 讲的是眼图：把许多个 UI 叠起来看形状。这一课换一个问法：在某个采样时刻，到底有多少位是错的。误码率（BER）= 错误位数 ÷ 总位数，是高速接口的最终裁判。PRBS 码型让接收端能重新算出“这一位应该是什么”，所以错误才能被数出来。',
    'The {@hsEye} lesson looked at the shape of the eye. This lesson asks a different question: at a given sampling moment, how many bits are actually wrong? Bit error rate (BER) = errors ÷ total bits is the final judge of a high-speed interface. A PRBS pattern lets the receiver recompute what each bit should be, so errors can be counted.',
  ),
  loc(
    '测试的关键是采样相位。把采样点从边沿一点点移到眼中间，BER 会从很高降到很低，画出来就是浴盆曲线。{@hsJitter} 的抖动决定了浴盆两侧的陡峭程度；ATE 能不能测到足够低的 BER，还要看 {@hsAteLimit} 讲的路径限制。',
    'The key is the sampling phase. Move the sampling point from an edge into the middle of the eye and BER falls from high to low; plotted, that is the bathtub curve. The jitter in {@hsJitter} sets how steep the walls are, and whether ATE can reach a low enough BER also depends on the path limits in {@hsAteLimit}.',
  ),
  loc(
    '这一课练三件事：用 PRBS 数错误并算出 BER；扫采样相位画浴盆曲线，读懂 0 错误时的置信上限与外推；打开或关闭 Loopback，说清楚 ATE 为什么常用它。',
    'This lesson practises three things: count errors with PRBS and compute BER; sweep the sampling phase to draw the bathtub curve, reading the 95% upper bound at zero errors and the extrapolation; and switch Loopback on or off, explaining why ATE often uses it.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '测了很多位都没错，就说 BER 为零。其实 0 错误只能给出上限：N 位里 0 错误，95% 置信的上限约为 3 ÷ N，位数越多，上限越低。',
    'Many bits with no errors means BER is zero. In fact zero errors only sets an upper bound: with 0 errors in N bits, the 95% upper bound is about 3 ÷ N, and the more bits, the lower the bound.',
  ),
  loc(
    '开了 Loopback，就代表整条链路。Loopback 去掉的是外部路径，所以它只代表芯片内部那一段；夹具与 ATE 比较器的质量要另外测，或者去嵌入。',
    'With Loopback on, the result represents the whole link. Loopback removes the external path, so it only represents the part inside the chip; the quality of the fixture and ATE comparator must be measured separately or de-embedded.',
  ),
  loc(
    'PRBS7 测得干净，就说明码型覆盖够了。PRBS7 的最长连续相同位只有 7 位，连续 8 位以上才出现的缺陷它永远看不到。码型要覆盖的是最坏情况，不只是“位数多”。',
    'PRBS7 came out clean, so the pattern coverage must be enough. The longest run of identical bits in PRBS7 is only 7, so a defect that appears only after 8 or more identical bits will never be seen. The pattern must cover the worst case, not just have many bits.',
  ),
]

export const TAKEAWAY: LText = loc(
  'BER = 错误位数 ÷ 总位数；0 错误只给出上限 3 ÷ N。浴盆曲线中间最低、两侧最高，因为采样点离边沿越近，抖动越容易越过它。Loopback 让芯片自己计错，ATE 只读回计数，因为 ATE 的比较器与夹具测不准多 Gb/s 的引脚眼图。PRBS 阶数决定码型能覆盖多长的连续相同位。',
  'BER = errors ÷ total bits; zero errors only gives the upper bound 3 ÷ N. The bathtub is lowest in the middle and highest at the sides, because the closer the sample is to an edge, the more easily jitter pushes an edge across it. Loopback lets the chip count its own errors and the ATE only reads the count, because ATE comparators and fixtures cannot measure the eye on a multi-Gb/s pin accurately. The PRBS order sets how long a run of identical bits the pattern covers.',
)

/** 误码率的文字：有错误时写实测值，0 错误时写上限 */
export function berText(a: InterfaceAnalysis): LText {
  if (a.errors > 0) {
    return loc(`${a.errors} 位错误，BER = ${a.ber.toExponential(1)}`, `${a.errors} errors, BER = ${a.ber.toExponential(1)}`)
  }
  return loc(
    `0 错误，BER < ${a.floor.toExponential(1)}（95%）`,
    `0 errors, BER < ${a.floor.toExponential(1)} (95%)`,
  )
}

/** 外推眼宽的文字：可能闭合 */
export function openText(ps: number, ui: number): LText {
  if (ps <= 0) {
    return S.closed
  }
  const pct = f0((ps / ui) * 100)
  return loc(`${f0(ps)} ps，占 ${pct}% UI`, `${f0(ps)} ps, ${pct}% UI`)
}

/** 右侧说明栏：根据当前相位的统计给出结论与原因；note 为补充说明（没有时为 null） */
export function verdictOf(state: InterfaceState, a: InterfaceAnalysis): { title: LText; text: LText; note: LText | null } {
  const phase = state.phase.toFixed(2)
  const phasePs = f0(state.phase * a.ui)
  if (a.pass) {
    return {
      title: S.pass,
      text: loc(
        `在 ${phase} UI（${phasePs} ps）采样，${BITS} 位里一个错误也没有，所以 BER 的 95% 上限约为 ${sci(a.floor)}。采样点离两侧边沿都有余量，抖动没有把任何一个边沿推过它。`,
        `Sampling at ${phase} UI (${phasePs} ps), none of the ${BITS} bits is in error, so the BER is below about ${sci(a.floor)} at 95% confidence. The sample is clear of both edges, and jitter does not push either edge across it.`,
      ),
      note: S.passNote,
    }
  }
  if (a.longErrors / a.errors > 0.5) {
    return {
      title: S.fail,
      text: loc(
        `在 ${phase} UI 有 ${a.errors} 个错误，BER 约 ${a.ber.toExponential(1)}，其中 ${a.longErrors} 个来自长连后的边沿：长连偏移把它推到了采样点附近。只有连续相同位达到 ${LONG_RUN} 位的码型会触发它；PRBS7 的最长连续相同位只有 7 位，所以测不到。`,
        `At ${phase} UI there are ${a.errors} errors, BER about ${a.ber.toExponential(1)}, and ${a.longErrors} of them come from an edge that follows a long run: the long-run shift pushed it toward the sample. Only patterns with at least ${LONG_RUN} identical bits in a row trigger it; the longest run in PRBS7 is 7 bits, so PRBS7 cannot see it.`,
      ),
      note: null,
    }
  }
  const nearLeft = state.phase < 0.5
  return {
    title: S.fail,
    text: nearLeft
      ? loc(
          `在 ${phase} UI 有 ${a.errors} 个错误，BER 约 ${a.ber.toExponential(1)}。采样点离左边沿只有 ${f0(state.phase * a.ui)} ps，DJ + RJ 的抖动把左边沿推过了它。`,
          `At ${phase} UI there are ${a.errors} errors, BER about ${a.ber.toExponential(1)}. The sample is only ${f0(state.phase * a.ui)} ps from the left edge, and DJ + RJ jitter pushed that edge across it.`,
        )
      : loc(
          `在 ${phase} UI 有 ${a.errors} 个错误，BER 约 ${a.ber.toExponential(1)}。采样点离右边沿只有 ${f0((1 - state.phase) * a.ui)} ps，DJ + RJ 的抖动把右边沿推过了它。`,
          `At ${phase} UI there are ${a.errors} errors, BER about ${a.ber.toExponential(1)}. The sample is only ${f0((1 - state.phase) * a.ui)} ps from the right edge, and DJ + RJ jitter pushed that edge across it.`,
        ),
    note: state.path === 'ext' ? S.extNote : null,
  }
}

/** 五张任务卡：完成与否由当前设置和统计结果算出 */
export function taskItems(state: InterfaceState, a: InterfaceAnalysis): TaskItem[] {
  const nearEdge = state.phase <= 0.15 || state.phase >= 0.85
  const inLongBand = state.phase >= 0.05 && state.phase <= 0.25
  return [
    { id: 'edge', text: S.task1, done: nearEdge && a.errors > 0 },
    { id: 'rj', text: S.task2, done: state.rj >= 6 && a.openPs < a.ui * 0.5 },
    { id: 'longFail', text: S.task3, done: state.order >= 15 && state.wander >= 15 && inLongBand && a.longErrors > 0 },
    { id: 'longMiss', text: S.task4, done: state.order === 7 && state.wander >= 15 && inLongBand && a.longErrors === 0 },
    { id: 'loop', text: S.task5, done: state.path === 'loop' },
  ]
}

/** 小测题干中的数字由模型算出，与页面的换算保持一致 */
const ZERO_BITS_1E12 = 3 / 1e-12
const SECONDS_AT_1E12 = ZERO_BITS_1E12 / (RATES[0] * 1e9)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `N = ${BITS} 位全部没有错误。95% 置信下，BER 的上限大约是多少？`,
      `N = ${BITS} bits with no errors at all. At 95% confidence, roughly what is the upper bound on BER?`,
    ),
    options: [
      { id: 'a', text: loc('0', '0') },
      { id: 'b', text: loc(sci(3 / BITS), sci(3 / BITS)) },
      { id: 'c', text: loc('1e-12', '1e-12') },
    ],
    answer: 'b',
    explain: loc(
      `0 错误时的 95% 上限约为 3 ÷ N = 3 ÷ ${BITS} = ${sci(3 / BITS)}。它是一个上限，不是“BER 等于 0”。`,
      `With 0 errors the 95% upper bound is about 3 ÷ N = 3 ÷ ${BITS} = ${sci(3 / BITS)}. It is an upper bound, not a statement that BER equals zero.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('要用 0 错误证明 BER 小于 1e-12（95%），大约要测多少位？', 'To show BER below 1e-12 (95%) with zero errors, about how many bits must be measured?'),
    options: [
      { id: 'a', text: loc(sci(ZERO_BITS_1E12), sci(ZERO_BITS_1E12)) },
      { id: 'b', text: loc(sci(3 / 1e-9), sci(3 / 1e-9)) },
      { id: 'c', text: loc(sci(3 / 1e-6), sci(3 / 1e-6)) },
    ],
    answer: 'a',
    explain: loc(
      `3 ÷ 1e-12 = ${sci(ZERO_BITS_1E12)} 位。在 ${RATES[0]} Gb/s 下每秒约 ${sci(RATES[0] * 1e9)} 位，每条通道约需 ${f0(SECONDS_AT_1E12)} 秒，所以工程上改用外推。`,
      `3 ÷ 1e-12 = ${sci(ZERO_BITS_1E12)} bits. At ${RATES[0]} Gb/s that is about ${sci(RATES[0] * 1e9)} bits per second, so each lane needs about ${f0(SECONDS_AT_1E12)} s; in practice extrapolation is used instead.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('ATE 常用 Loopback 测高速发送端（Tx），最主要的原因是什么？', 'What is the main reason ATE often uses Loopback to test a high-speed transmitter (Tx)?'),
    options: [
      { id: 'a', text: loc('Loopback 会让 BER 自动变成 0', 'Loopback makes the BER automatically zero') },
      { id: 'b', text: loc('Loopback 能把速率降到 1 Mb/s 以下', 'Loopback lowers the rate below 1 Mb/s') },
      { id: 'c', text: loc('ATE 的比较器与夹具跟不上多 Gb/s 的边沿，直接测 Tx 眼图测不准；Loopback 让芯片自己计错，ATE 只读计数', 'ATE comparators and fixtures cannot follow multi-Gb/s edges, so the Tx eye cannot be measured accurately at the pin; with Loopback the chip counts its own errors and ATE only reads the count') },
    ],
    answer: 'c',
    explain: loc(
      'Loopback 不改变芯片的 BER，只改变谁来计错：芯片内部的 PRBS 检测器计数，ATE 只读回结果。外部路径没有被测到，要另外去嵌入。',
      'Loopback does not change the chip’s BER; it changes who counts the errors: the on-chip PRBS checker counts, and ATE only reads the result. The external path is not measured and must be de-embedded separately.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('浴盆曲线为什么在眼中间（0.5 UI 附近）最低？', 'Why is the bathtub curve lowest near the middle of the eye (around 0.5 UI)?'),
    options: [
      { id: 'a', text: loc('中间的采样电压一定比边缘高', 'The sampling voltage is always higher in the middle') },
      { id: 'b', text: loc('中间离两侧边沿最远，抖动越过采样点的概率最小', 'The middle is farthest from both edges, so jitter is least likely to push an edge across the sample') },
      { id: 'c', text: loc('中间的抖动为零', 'Jitter is zero in the middle') },
    ],
    answer: 'b',
    explain: loc(
      'BER 由边沿越过采样点的概率决定。采样点在眼中间时，两侧边沿都要偏得很远才能越过它，所以 BER 最低；越靠近边沿，概率越大，BER 急剧升高。',
      'BER is set by the chance that an edge crosses the sample. At the middle of the eye both edges must move a long way to cross it, so BER is lowest; closer to an edge the chance grows and BER rises steeply.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('一个缺陷只在连续 8 位相同之后才出现。下面哪种码型最可能测不出它？', 'A defect appears only after 8 identical bits in a row. Which pattern is most likely to miss it?'),
    options: [
      { id: 'a', text: loc('PRBS7', 'PRBS7') },
      { id: 'b', text: loc('PRBS15', 'PRBS15') },
      { id: 'c', text: loc('PRBS31', 'PRBS31') },
    ],
    answer: 'a',
    explain: loc(
      'PRBS7 的最长连续相同位只有 7 位（连 1），连 0 最长 6 位，达不到 8 位，所以永远不会触发这个缺陷。PRBS15 与 PRBS31 的最长连续位分别是 15 与 31 位，能够触发。',
      'In PRBS7 the longest run of identical bits is 7 (ones) or 6 (zeros), never reaching 8, so it can never trigger this defect. PRBS15 and PRBS31 have longest runs of 15 and 31 bits, so they can.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('为什么 1e-12 的眼宽常常要靠外推，而不是直接测出来？', 'Why is the eye width at 1e-12 usually extrapolated instead of measured directly?'),
    options: [
      { id: 'a', text: loc('外推比实测更准', 'Extrapolation is always more accurate than measurement') },
      { id: 'b', text: loc('模型不需要任何测量数据', 'The model needs no measured data at all') },
      { id: 'c', text: loc(`1e-12 需要约 ${sci(ZERO_BITS_1E12)} 位，测不完，只能用尾部模型推算`, `1e-12 needs about ${sci(ZERO_BITS_1E12)} bits, which cannot be measured in practice, so a tail model is used`) },
    ],
    answer: 'c',
    explain: loc(
      `实测 BER 只能落在 1/位数 附近（这一课是 ${BITS} 位，下限约 ${sci(3 / BITS)}）。要看到 1e-12 就得测约 ${sci(ZERO_BITS_1E12)} 位，所以先测浴盆的中段，再用双狄拉克模型外推尾部，并且写明这是外推。`,
      `Measured BER can only reach about 1 over the number of bits (this lesson uses ${BITS} bits, a floor near ${sci(3 / BITS)}). Seeing 1e-12 needs about ${sci(ZERO_BITS_1E12)} bits, so the middle of the bathtub is measured and the tails are extrapolated with a dual-Dirac model, labelled as extrapolation.`,
    ),
  },
]

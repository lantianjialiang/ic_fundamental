import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { DEFAULT_TIMING, RATES, type TimingAnalysis, type TimingState } from './hsTimingModel'

export const RATE_OPTIONS = RATES.map((rate) => ({ id: String(rate), label: `${rate} Gb/s` }))

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)

export const S = {
  kickerNow: loc('这一次采样', 'This sampling edge'),
  introTitle: loc('采样沿要落在数据稳定的那一段里', 'The sampling edge must land in the stable part of the data'),
  coreTitle: loc('拖一拖：采样沿放在哪里才安全', 'Try it: where is the sampling edge safe?'),
  coreNote: loc(
    '下图是一个数据位，两端是数据沿，每个沿都带着随机抖动（灰色刻线）。红色是 Setup 与 Hold 违例区，绿色是有效采样区，竖线是采样沿。',
    'The figure shows one data bit; both edges carry random jitter (grey ticks). Red is the setup and hold violation zone, green is the valid sampling window, and the vertical line is the sampling edge.',
  ),
  rateLabel: loc('数据速率', 'Data rate'),
  tsuLabel: loc('建立时间 tSU (ps)', 'Setup time tSU (ps)'),
  thLabel: loc('保持时间 tH (ps)', 'Hold time tH (ps)'),
  jitterLabel: loc('数据沿抖动 σ (ps rms)', 'Data-edge jitter σ (ps rms)'),
  phaseLabel: loc('采样沿位置 (占 UI)', 'Sampling edge position (of UI)'),
  rUi: loc('单位间隔 UI', 'Unit interval UI'),
  rSample: loc('采样沿位置', 'Sampling edge position'),
  rSetup: loc('Setup 边界（采样沿须晚于）', 'Setup boundary (sample must be later)'),
  rHold: loc('Hold 边界（采样沿须早于）', 'Hold boundary (sample must be earlier)'),
  rWindow: loc('有效窗口宽度', 'Valid window width'),
  rSetupMargin: loc('Setup 裕量', 'Setup margin'),
  rHoldMargin: loc('Hold 裕量', 'Hold margin'),
  rVerdict: loc('判定', 'Verdict'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实接收端的建立、保持时间随温度、电压和数据翻转方向变化，时钟还有自己的抖动；这里只练窗口、边界和裕量三件事。',
    'Real receiver setup and hold times vary with temperature, voltage and edge direction, and the clock has its own jitter; here we only practise the window, the boundaries and the margin.',
  ),
  next: loc('下一课：抖动与噪声', 'Next: Jitter and Noise'),
  task1: loc('把采样沿拖到 Setup 边界之前，让它判 FAIL（Setup 违例）。', 'Drag the sampling edge before the setup boundary so it fails (setup violation).'),
  task2: loc('把采样沿拖到 Hold 边界之后，让它判 FAIL（Hold 违例）。', 'Drag the sampling edge after the hold boundary so it fails (hold violation).'),
  task3: loc('把速率提到 25 Gb/s，在更窄的窗口里仍找到一个 PASS 的采样沿。', 'Raise the rate to 25 Gb/s and still find a PASS sampling edge in the narrower window.'),
  task4: loc('把数据沿抖动加到 2 ps rms 以上，看窗口怎么变窄。', 'Raise the data-edge jitter to 2 ps rms or more and watch the window narrow.'),
  task5: loc('让窗口关闭（宽度 < 0），说出是哪几个量把它吃掉的。', 'Close the window (width < 0) and name the quantities that eat it.'),
}

export const FIG = {
  aria: loc(
    '数据位时序图：两端数据沿带抖动，红色为 Setup 与 Hold 违例区，绿色为有效采样区，竖线为采样沿',
    'Timing diagram of one data bit: both edges carry jitter, red marks the setup and hold violation zones, green marks the valid window, and a vertical line marks the sampling edge',
  ),
  cap: loc(
    '灰色刻线是各个数据沿的抖动位置。红色区要么在数据沿之后的 tSU 内（Setup 违例），要么在下一个数据沿之前的 tH 内（Hold 违例）；两者之间的绿色区才是有效采样区。',
    'Grey ticks show where individual data edges land. Red zones lie within tSU after an edge (setup violation) or within tH before the next edge (hold violation); the green zone between them is the valid sampling window.',
  ),
  clock: loc('采样沿', 'Sampling edge'),
  edge0: loc('数据沿', 'Data edge'),
  edge1: loc('下一个数据沿', 'Next data edge'),
}

export const INTRO = [
  loc(
    '{@hsEye} 看的是许多个 UI 叠在一起的整体张开程度。这一课换一个角度：接收端在某一个时刻去“采样”每一位，采样沿放在哪里，决定了这一位判得对不对。UI 的概念见 {@hsBasics}。',
    'The {@hsEye} lesson looks at how open many UIs are when stacked. This lesson takes a different angle: the receiver samples each bit at one instant, and where the sampling edge lands decides whether that bit is read correctly. For the UI concept see {@hsBasics}.',
  ),
  loc(
    '采样沿必须落在数据稳定的那段时间里：数据沿之后要先等 tSU 才稳定（建立），采样之后数据还要再保持 tH（保持）。这一课只练三件事：找到 Setup / Hold 边界，算出时序裕量，并说清窗口是被 UI 和数据沿抖动一起缩小的。',
    'The sampling edge must land in the time the data is stable: after a data edge the data needs tSU to settle (setup), and after sampling it must hold for tH (hold). This lesson practises three things: find the setup and hold boundaries, compute the timing margin, and explain why jitter shrinks the window along with the UI.',
  ),
]

export const MISCONCEPTIONS = [
  loc(
    '采样沿放得离数据沿越近越好。采样沿越靠近数据沿，越容易落进 Setup 或 Hold 窗口，判定结果不可靠；窗口中央两侧的裕量才是可靠的。',
    'The closer the sampling edge is to a data edge the better. The closer it sits, the more likely it falls into the setup or hold window and the result is unreliable; the margins at the centre of the window are the reliable ones.',
  ),
  loc(
    '只要 UI 够大，时序就一定没问题。UI 只是窗口的上限，窗口还要扣掉 tSU、tH 和边沿抖动的峰峰值；速率一高，扣完可能什么都不剩。',
    'If the UI is large enough, timing is always fine. The UI is only the upper bound of the window; you must also subtract tSU, tH and the peak-to-peak edge jitter, and at a high rate little may remain.',
  ),
  loc(
    '抖动用 rms 估计就够了。窗口要对每一个数据沿都成立，最坏的是最晚的前沿和最早的后沿，所以要用抖动的峰峰值（最晚与最早之差），而不是 rms。',
    'Estimating jitter with the rms value is enough. The window must hold for every data edge, and the worst cases are the latest leading edge and the earliest trailing edge, so use the peak-to-peak spread (latest minus earliest), not the rms.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Setup 边界 S = tSU + 最晚前沿；Hold 边界 H = UI − tH + 最早后沿；有效窗口 W = H − S = UI − tSU − tH − 抖动峰峰值。采样沿必须落在 S 与 H 之间，裕量取两侧较小的那个，放在窗口中央时最小裕量最大。',
  'Setup boundary S = tSU + latest leading edge; hold boundary H = UI − tH + earliest trailing edge; valid window W = H − S = UI − tSU − tH − peak-to-peak jitter. The sampling edge must sit between S and H; the margin is the smaller of the two sides, and it is largest at the centre of the window.',
)

const JIT_NOTE = loc(
  '边沿抖动把窗口两端各推进了一段（最晚的前沿、最早的后沿），所以窗口比 UI − tSU − tH 窄。',
  'Edge jitter pushes both ends of the window inward (the latest leading edge and the earliest trailing edge), so the window is narrower than UI − tSU − tH.',
)

/** 右侧说明栏：根据采样沿的位置给结论和原因 */
export function verdictOf(state: TimingState, a: TimingAnalysis): { title: LText; text: LText; note: LText | null } {
  const note = state.jitter > 0 ? JIT_NOTE : null
  if (a.violation === 'closed') {
    return {
      title: S.fail,
      text: loc(
        `窗口已经关闭：UI ${f1(a.ui)} ps 扣掉 tSU ${f1(state.tsu)} ps 和 tH ${f1(state.th)} ps，再扣掉抖动峰峰值 ${f1(a.jitterPp)} ps，剩下 ${f1(a.window)} ps（负值）。窗口宽度由 UI 与边沿抖动共同决定，任何采样沿都会违例；要减小 tSU、tH 或抖动，或者降低速率。`,
        `The window is closed: UI ${f1(a.ui)} ps minus tSU ${f1(state.tsu)} ps and tH ${f1(state.th)} ps, minus the edge jitter peak-to-peak ${f1(a.jitterPp)} ps, leaves ${f1(a.window)} ps (negative). The window width is set by the UI and the edge jitter together, so every sampling edge fails; reduce tSU, tH or the jitter, or lower the rate.`,
      ),
      note,
    }
  }
  if (a.violation === 'setup') {
    return {
      title: S.fail,
      text: loc(
        `采样沿在 ${f1(a.sample)} ps，早于 Setup 边界 ${f1(a.setupBoundary)} ps。最晚的那个前沿被抖动推到了 ${f1(a.maxEdge)} ps，加上 tSU 之后才是可以采样的时刻；采样沿太早，新数据还没稳定。Setup 裕量 ${f1(a.setupMargin)} ps。`,
        `The sampling edge is at ${f1(a.sample)} ps, earlier than the setup boundary ${f1(a.setupBoundary)} ps. The latest leading edge has been pushed by jitter to ${f1(a.maxEdge)} ps, and only tSU after that is the earliest safe sampling time; the sampling edge is too early and the new data has not settled. Setup margin ${f1(a.setupMargin)} ps.`,
      ),
      note,
    }
  }
  if (a.violation === 'hold') {
    return {
      title: S.fail,
      text: loc(
        `采样沿在 ${f1(a.sample)} ps，晚于 Hold 边界 ${f1(a.holdBoundary)} ps。最早的下一个数据沿被抖动拉到了 ${f1(a.ui + a.minEdge)} ps，采样之后还要保持 tH = ${f1(state.th)} ps，所以采样沿最晚只能到 ${f1(a.holdBoundary)} ps；采样沿太晚，数据在采样之后马上就变了。Hold 裕量 ${f1(a.holdMargin)} ps。`,
        `The sampling edge is at ${f1(a.sample)} ps, later than the hold boundary ${f1(a.holdBoundary)} ps. The earliest next data edge has been pulled by jitter to ${f1(a.ui + a.minEdge)} ps, and the data must hold for tH = ${f1(state.th)} ps after sampling, so the sampling edge can be at most ${f1(a.holdBoundary)} ps; too late, the data changes right after sampling. Hold margin ${f1(a.holdMargin)} ps.`,
      ),
      note,
    }
  }
  return {
    title: S.pass,
    text: loc(
      `采样沿在 Setup 与 Hold 边界之间：离 Setup 边界 ${f1(a.setupMargin)} ps，离 Hold 边界 ${f1(a.holdMargin)} ps，最小裕量 ${f1(a.margin)} ps。有效窗口宽 ${f1(a.window)} ps = UI − tSU − tH − 抖动峰峰值，所以窗口中央两侧的裕量最均衡。`,
      `The sampling edge sits between the setup and hold boundaries: ${f1(a.setupMargin)} ps from the setup boundary, ${f1(a.holdMargin)} ps from the hold boundary, minimum margin ${f1(a.margin)} ps. The valid window is ${f1(a.window)} ps = UI − tSU − tH − jitter peak-to-peak, so the centre of the window balances the two margins best.`,
    ),
    note,
  }
}

/** 五张任务卡：完成与否由当前设置和采样沿结果算出 */
export function taskItems(state: TimingState, a: TimingAnalysis): TaskItem[] {
  return [
    { id: 'setup', text: S.task1, done: a.violation === 'setup' },
    { id: 'hold', text: S.task2, done: a.violation === 'hold' },
    { id: 'rate25', text: S.task3, done: state.rate === 25 && a.pass },
    { id: 'jitter', text: S.task4, done: state.jitter >= 2 },
    { id: 'closed', text: S.task5, done: a.violation === 'closed' },
  ]
}

/** 小测题干中的数字由公式算出，与页面的换算保持一致 */
const UI_10G = 1000 / 10
const UI_16G = 1000 / 16
const UI_25G = 1000 / 25
const WIN_10G = UI_10G - DEFAULT_TIMING.tsu - DEFAULT_TIMING.th
const WIN_16G = UI_16G - DEFAULT_TIMING.tsu - DEFAULT_TIMING.th

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('25 Gb/s 的单位间隔 UI 是多少？', 'What is the unit interval UI at 25 Gb/s?'),
    options: [
      { id: 'a', text: loc('4 ps', '4 ps') },
      { id: 'b', text: loc(`${f0(UI_25G)} ps`, `${f0(UI_25G)} ps`) },
      { id: 'c', text: loc('400 ps', '400 ps') },
    ],
    answer: 'b',
    explain: loc(
      `UI = 1000 ÷ 25 = ${f0(UI_25G)} ps。每一位只有 ${f0(UI_25G)} ps，tSU、tH 和抖动都要从这里扣。`,
      `UI = 1000 ÷ 25 = ${f0(UI_25G)} ps. Each bit has only ${f0(UI_25G)} ps, and tSU, tH and jitter all come out of it.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      `10 Gb/s，tSU = ${f0(DEFAULT_TIMING.tsu)} ps，tH = ${f0(DEFAULT_TIMING.th)} ps，数据沿完全没有抖动。有效窗口宽多少？`,
      `10 Gb/s, tSU = ${f0(DEFAULT_TIMING.tsu)} ps, tH = ${f0(DEFAULT_TIMING.th)} ps, and the data edges have no jitter at all. How wide is the valid window?`,
    ),
    options: [
      { id: 'a', text: loc(`${f0(WIN_10G)} ps`, `${f0(WIN_10G)} ps`) },
      { id: 'b', text: loc(`${f0(UI_10G - DEFAULT_TIMING.tsu)} ps`, `${f0(UI_10G - DEFAULT_TIMING.tsu)} ps`) },
      { id: 'c', text: loc(`${f0(UI_10G)} ps`, `${f0(UI_10G)} ps`) },
    ],
    answer: 'a',
    explain: loc(
      `W = UI − tSU − tH = ${f0(UI_10G)} − ${f0(DEFAULT_TIMING.tsu)} − ${f0(DEFAULT_TIMING.th)} = ${f0(WIN_10G)} ps。没有抖动时，窗口只被两个器件参数吃掉；只扣 tSU 或者干脆不扣都是漏项。`,
      `W = UI − tSU − tH = ${f0(UI_10G)} − ${f0(DEFAULT_TIMING.tsu)} − ${f0(DEFAULT_TIMING.th)} = ${f0(WIN_10G)} ps. With no jitter, only the two device parameters eat the window; subtracting only tSU, or nothing, leaves out a term.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '同样的 tSU、tH，速率从 10 Gb/s 提到 16 Gb/s，有效窗口会怎样变化？',
      'With the same tSU and tH, what happens to the valid window when the rate rises from 10 Gb/s to 16 Gb/s?',
    ),
    options: [
      { id: 'a', text: loc('不变，tSU、tH 与速率无关，窗口也不变', 'Unchanged: tSU and tH do not depend on rate, so the window stays the same') },
      { id: 'b', text: loc('变窄：UI 缩短，而 tSU、tH 是器件的固定值', 'Narrower: the UI shrinks while tSU and tH are fixed device values') },
      { id: 'c', text: loc('变宽：速率越高，采样越从容', 'Wider: a higher rate gives more room to sample') },
    ],
    answer: 'b',
    explain: loc(
      `UI 从 ${f0(UI_10G)} ps 缩到 ${f1(UI_16G)} ps，扣掉同样的 tSU、tH 后，窗口从 ${f0(WIN_10G)} ps 变成 ${f1(WIN_16G)} ps。速率提高，窗口只会变窄。`,
      `The UI shrinks from ${f0(UI_10G)} ps to ${f1(UI_16G)} ps; subtracting the same tSU and tH, the window drops from ${f0(WIN_10G)} ps to ${f1(WIN_16G)} ps. A higher rate can only narrow the window.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('采样沿落在 Setup 边界之前，违反的是哪一条？', 'The sampling edge lands before the setup boundary. Which requirement is violated?'),
    options: [
      { id: 'a', text: loc('Setup：新数据还没稳定满 tSU', 'Setup: the new data has not been stable for tSU') },
      { id: 'b', text: loc('Hold：采样之后数据变得太早', 'Hold: the data changes too soon after sampling') },
      { id: 'c', text: loc('两条都不违反，只是抖动大', 'Neither; it is only a large jitter') },
    ],
    answer: 'a',
    explain: loc(
      'Setup 边界是 tSU 加上最晚前沿。采样沿早于它，说明采样时新数据还没有稳定满 tSU。Hold 看的是采样之后的下一个数据沿，与这一侧无关。',
      'The setup boundary is tSU plus the latest leading edge. A sampling edge before it means the new data had not been stable for tSU at sampling time. Hold concerns the next data edge after sampling, which is not this side.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('边沿抖动把有效窗口缩小，应该用抖动的哪一个量来扣？', 'Edge jitter shrinks the valid window. Which jitter quantity should be subtracted?'),
    options: [
      { id: 'a', text: loc('抖动的 rms 值', 'The rms value of the jitter') },
      { id: 'b', text: loc('抖动的峰峰值：最晚沿与最早沿之差', 'The peak-to-peak jitter: latest edge minus earliest edge') },
      { id: 'c', text: loc('抖动的平均值', 'The average of the jitter') },
    ],
    answer: 'b',
    explain: loc(
      '窗口要对每一个数据沿都成立，最坏的情况是最晚的前沿和最早的后沿，两者之差就是峰峰值。rms 只描述典型的宽度，不是最坏情况，拿它来扣会高估窗口。',
      'The window must hold for every data edge, and the worst case is the latest leading edge and the earliest trailing edge; their difference is the peak-to-peak value. The rms describes only a typical width, not the worst case, so subtracting it overestimates the window.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('为什么把采样沿放在窗口中央最稳？', 'Why is the centre of the window the most robust place for the sampling edge?'),
    options: [
      { id: 'a', text: loc('中央离 Setup 与 Hold 两边都最远，最小裕量最大', 'The centre is farthest from both the setup and hold boundaries, so the minimum margin is largest') },
      { id: 'b', text: loc('中央时 UI 最长，所以窗口最宽', 'At the centre the UI is longest, so the window is widest') },
      { id: 'c', text: loc('中央没有抖动，数据最干净', 'There is no jitter at the centre, so the data is cleanest') },
    ],
    answer: 'a',
    explain: loc(
      '时序裕量 = min(φ − S, H − φ)。在窗口中央两项相等，而且都是最大值；偏向任何一边，另一边的裕量就会变小，温度或抖动稍一变就可能违例。',
      'Timing margin = min(φ − S, H − φ). At the centre the two terms are equal and both are at their largest; moving toward either side shrinks the other margin, and a small change in temperature or jitter can then cause a violation.',
    ),
  },
]

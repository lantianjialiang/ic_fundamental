import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type EyeAnalysis, type EyeState, MASK_MV, RATES } from './eyeModel'

export const RATE_OPTIONS = RATES.map((rate) => ({ id: String(rate), label: `${rate} Gb/s` }))

const f0 = (value: number) => value.toFixed(0)
const f2 = (value: number) => value.toFixed(2)

export const S = {
  kickerNow: loc('这一次眼图', 'This eye diagram'),
  introTitle: loc('眼图：把许多个 UI 叠在一起看', 'Eye diagram: many UIs stacked on top of each other'),
  coreTitle: loc('拨一拨：速率、带宽与抖动', 'Try it: rate, bandwidth and jitter'),
  coreNote: loc(
    '信道是一阶 RC 低通，带宽越低，边沿越慢。下图是 PRBS7 码型叠成的眼图，白色六边形是 mask 禁区；有采样点落进去就判 FAIL。',
    'The channel is a first-order RC low-pass; the lower the bandwidth, the slower the edges. The eye below is PRBS7 stacked on itself, and the hexagon is the mask: any sample inside it fails.',
  ),
  rateLabel: loc('数据速率', 'Data rate'),
  bwLabel: loc('信道带宽 BW (GHz)', 'Channel bandwidth BW (GHz)'),
  rjLabel: loc('随机抖动 RJ (ps rms)', 'Random jitter RJ (ps rms)'),
  rUi: loc('单位间隔 UI', 'Unit interval UI'),
  rRise: loc('上升时间 ≈ 350 / BW', 'Rise time ≈ 350 / BW'),
  rHeight: loc('中心眼高（0.5 UI）', 'Eye height at centre (0.5 UI)'),
  rWidth: loc('眼宽', 'Eye width'),
  rHits: loc('落进 mask 的采样点', 'Samples inside the mask'),
  rVerdict: loc('判定（mask）', 'Verdict (mask)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  prereqTitle: loc('补充：本课用到的预设知识', 'Supplement: background this lesson assumes'),
  prereqNote: loc(
    '正文里的眼图画法、眼高与眼宽、mask 形状和 350 ÷ BW 都从这一节列出的几条推出。读完正文再回来看。',
    'The eye construction, eye height and width, mask shape and 350 ÷ BW in the body are derived from the items below. Read the body first, then come back here.',
  ),
  asideLater: loc(
    '真实的眼图还要看均衡（CTLE / FFE / DFE）、串扰、电源噪声，以及用统计方法外推到 BER 10⁻¹²；这里只练 UI、上升时间和 mask 三件事。',
    'Real eye analysis also covers equalisation (CTLE / FFE / DFE), crosstalk, supply noise, and extrapolating to BER 10⁻¹² statistically; here we only practise UI, rise time and the mask.',
  ),
  next: loc('下一课：高速接口测试', 'Next: High-speed Interface Test'),
  task1: loc(
    '10 Gb/s 下把 BW 降到 5 GHz 以下，让眼图撞进 mask（FAIL）。',
    'At 10 Gb/s, lower BW to 5 GHz or below so the eye hits the mask (FAIL).',
  ),
  task2: loc(
    '换成 16 Gb/s，把 BW 提到 12 GHz，让眼图通过 mask（PASS）。',
    'Switch to 16 Gb/s and raise BW to 12 GHz so the eye passes the mask (PASS).',
  ),
  task3: loc('把 RJ 加到 6 ps rms 以上，观察眼宽怎么变。', 'Raise RJ to 6 ps rms or more and watch how the eye width changes.'),
}

export const FIG = {
  eyeAria: loc('PRBS7 眼图：两个 UI 的叠加波形与六边形 mask', 'PRBS7 eye diagram: overlaid waveforms over two UIs with the hexagon mask'),
  eyeCap: loc(
    '每条淡蓝线是一段叠加的波形，横轴 0–2 UI，中间的竖线是交叉点。金色六边形是 mask，红点是落进 mask 的采样点。',
    'Each faint blue line is one overlaid waveform over 0–2 UI; the crossings sit at the edges of the eye. The gold hexagon is the mask and the red dots are samples inside it.',
  ),
}

export const INTRO = [
  loc(
    '{@pmu} 讲的是 ATE 的直流 / 低速测试仪器。高速串行链路的测试换了一种思路：信号以 Gb/s 速率传输，一个单位间隔（UI）只有几十到一百多皮秒，所以要看的是整体形状，而不是某一个数。',
    'The {@pmu} lesson covered DC and low-speed ATE instruments. High-speed serial test takes a different view: signals run at Gb/s, one unit interval (UI) is only tens to over a hundred picoseconds, so you look at the overall shape rather than one number.',
  ),
  loc(
    '这一课只练三件事：算出 UI 和上升时间；读懂眼图的眼高（幅度余量）与眼宽（时序余量）；用 mask 判断链路通不通过，并找出是速率、带宽还是抖动造成的。',
    'This lesson practises three things: compute the UI and rise time; read the eye height (amplitude margin) and eye width (timing margin); and use the mask to decide pass or fail, then find whether rate, bandwidth or jitter is to blame.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '眼图只看眼高。眼高是幅度余量，眼宽是时序余量；抖动主要吃掉眼宽，只看眼高会漏掉时序问题。',
    'Eye height alone is enough. Height is the amplitude margin and width is the timing margin; jitter mainly eats the width, so checking only the height misses timing problems.',
  ),
  loc(
    '上升时间只影响速度，不影响眼图。上升时间占 UI 的比例越大，边沿越早拖进判决区，眼高和眼宽都会被吃掉。',
    'Rise time only affects speed, not the eye. The larger the rise time is as a share of the UI, the earlier the edge drags into the decision region, eating into both height and width.',
  ),
  loc(
    '带宽够了，就不用管抖动。带宽决定边沿的形状（ISI），抖动决定边沿的时刻，两者都要进 mask 的判定。',
    'Once bandwidth is enough, jitter can be ignored. Bandwidth shapes the edges (ISI) and jitter moves their timing; both must be judged against the mask.',
  ),
]

/** 课末补充：眼图怎么画、眼高与眼宽的定义、mask 的形状、350 ÷ BW 的来源、PRBS7 为什么能暴露码间干扰 */
export const PREREQ: LText[] = [
  loc(
    '眼图怎么画：接收端按时钟对齐数据，把连续的波形每 2 UI 切一段（0–2 UI）叠在一起，每个采样相位上的所有电平合起来就是一片“眼”。本页每个 UI 取 32 个采样点，叠加三个 PRBS7 周期，前 127 位用来让滤波器建立。',
    'How an eye is drawn: with the receiver clocked to the data, successive waveform segments are cut every 2 UI (0–2 UI) and overlaid. At each sampling phase, all the levels together form the eye. This page uses 32 samples per UI and overlays three PRBS7 periods, skipping the first 127 bits to let the filter settle.',
  ),
  loc(
    '眼高与眼宽的定义：在中心（0.5 UI）采样相位上，眼高 = min（“1”的采样值）− max（“0”的采样值），单位 mV。眼宽 = 每个采样相位上眼开口为正的相位数 ÷ 每 UI 采样点数，单位 UI。眼高看幅度余量，眼宽看时序余量。',
    'Definitions: at the centre (0.5 UI) sampling phase, eye height = min(samples of “1”) − max(samples of “0”), in mV. Eye width = the number of sampling phases where the opening is positive, divided by the samples per UI, in UI. Height is the amplitude margin; width is the timing margin.',
  ),
  loc(
    '350 ÷ BW 的来源：一阶 RC 的 τ = 1 ÷ (2π·BW)，10%–90% 上升时间 = τ·ln 9 = ln 9 ÷ (2π·BW) ≈ 0.35 ÷ BW（BW 用赫兹、时间用秒）；BW 用 GHz、上升时间用 ps 时就是 350 ÷ BW。完整推导见 HS-01 的补充。',
    'Where rise time ≈ 350 ÷ BW comes from: for a first-order RC, τ = 1 ÷ (2π·BW), and the 10%–90% rise time is τ·ln 9 = ln 9 ÷ (2π·BW) ≈ 0.35 ÷ BW (BW in hertz, time in seconds); with BW in GHz and rise time in ps this is 350 ÷ BW. The full derivation is in the HS-01 supplement.',
  ),
  loc(
    'mask 的形状：以眼中心为中心的六边形禁区。中心半高 200 mV；离中心水平距离 0.15 UI 以内是平顶（|v| ≤ 200 mV），0.15–0.35 UI 之间线性收窄到 0，超过 0.35 UI 的地方没有禁区。采样点落进去就判 FAIL。这些尺寸是本站的教学取值，不是任何标准的数字。',
    'Shape of the mask: a hexagon centred on the eye. Its half-height is 200 mV; within 0.15 UI horizontally of the centre the top and bottom are flat (|v| ≤ 200 mV), then they taper linearly to zero at 0.35 UI, and nothing lies beyond that. Any sample inside it fails. These sizes are teaching values on this site, not numbers from a standard.',
  ),
  loc(
    'PRBS7 为什么能暴露码间干扰：PRBS7 是 127 位的伪随机码型（周期 2⁷ − 1，见 HS-06）。一个周期里，每一种 7 位组合恰好出现一次（全 0 除外），所以叠加后能看到各种相邻位组合造成的拖尾。它不是真随机，每个周期都一样。',
    'Why PRBS7 exposes inter-symbol interference: PRBS7 is a 127-bit pseudo-random pattern (period 2⁷ − 1, see HS-06). In one period every 7-bit combination appears exactly once except all zeros, so stacking it shows the tails left by every neighbouring-bit combination. It is not truly random; it repeats the same way each period.',
  ),
]

export const TAKEAWAY: LText = loc(
  'UI = 1000 / 速率（ps）；上升时间 ≈ 350 / BW（ps），占 UI 的比例决定眼张不张开；中心眼高看幅度余量，眼宽看时序余量；mask 是每个采样点都不能碰的禁区。',
  'UI = 1000 / rate (ps); rise time ≈ 350 / BW (ps), and its share of the UI decides whether the eye opens; the centre height is the amplitude margin, the width is the timing margin; the mask is a zone no sample may touch.',
)

const RJ_PASS_NOTE = loc(
  'RJ 会把交叉点左右推开，所以眼宽比没有抖动时窄。',
  'RJ pushes the crossings sideways, so the eye is narrower than with no jitter.',
)
const RJ_FAIL_NOTE = loc(
  'RJ 还会让交叉点左右漂移，眼宽进一步变窄。',
  'RJ also moves the crossings sideways, narrowing the eye further.',
)

/** 右侧说明栏：根据眼图结果给结论和原因；note 是抖动的补充说明（没有抖动时为 null） */
export function verdictOf(state: EyeState, a: EyeAnalysis): { title: LText; text: LText; note: LText | null } {
  const share = f0((a.riseTime / a.ui) * 100)
  if (a.pass) {
    return {
      title: S.pass,
      text: loc(
        `没有采样点落进 mask。中心眼高 ${f0(a.height)} mV，眼宽 ${f2(a.width)} UI。上升时间约 ${f0(a.riseTime)} ps，占 UI 的 ${share}%，边沿在一个 UI 内基本走完。`,
        `No sample falls inside the mask. Centre eye height is ${f0(a.height)} mV and eye width is ${f2(a.width)} UI. Rise time is about ${f0(a.riseTime)} ps, ${share}% of the UI, so the edge finishes within one UI.`,
      ),
      note: state.rj > 0 ? RJ_PASS_NOTE : null,
    }
  }
  return {
    title: S.fail,
    text: loc(
      `${a.hits} 个采样点落进 mask。上升时间约 ${f0(a.riseTime)} ps，已经占到 UI 的 ${share}%，边沿还没走完就到了判决区，中心的电平被压低。提高 BW 或降低速率可以让边沿有足够时间走完。`,
      `${a.hits} samples fall inside the mask. Rise time is about ${f0(a.riseTime)} ps, already ${share}% of the UI, so the edge has not finished before the decision region and the centre level is pulled in. Raising BW or lowering the rate gives the edge enough time.`,
    ),
    note: state.rj > 0 ? RJ_FAIL_NOTE : null,
  }
}

/** 三张任务卡：完成与否由当前设置和眼图结果算出 */
export function taskItems(state: EyeState, a: EyeAnalysis): TaskItem[] {
  return [
    { id: 'fail', text: S.task1, done: state.rate === 10 && state.bw <= 5 && a.hits > 0 },
    { id: 'pass16', text: S.task2, done: state.rate === 16 && state.bw >= 12 && a.pass },
    { id: 'rj', text: S.task3, done: state.rj >= 6 },
  ]
}

/** 小测题干中的数字由公式算出，与页面的换算保持一致 */
const UI_10G = 1000 / 10
const RISE_BW5 = 350 / 5
const RISE_BW8 = 350 / 8
const UI_16G = 1000 / 16

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('10 Gb/s 的单位间隔 UI 是多少？', 'What is the unit interval UI at 10 Gb/s?'),
    options: [
      { id: 'a', text: loc('10 ps', '10 ps') },
      { id: 'b', text: loc(`${f0(UI_10G)} ps`, `${f0(UI_10G)} ps`) },
      { id: 'c', text: loc('1 ns', '1 ns') },
    ],
    answer: 'b',
    explain: loc(
      `UI = 1 / 速率 = 1 / 10 Gb/s = ${f0(UI_10G)} ps。每一位只有 ${f0(UI_10G)} ps 的时间窗，边沿必须在这之内走完。`,
      `UI = 1 / rate = 1 / 10 Gb/s = ${f0(UI_10G)} ps. Each bit has only a ${f0(UI_10G)} ps window, and the edge must finish within it.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('信道带宽 BW = 5 GHz，用 350 / BW 估算上升时间约是多少？', 'Channel bandwidth BW = 5 GHz. Estimating with 350 / BW, about how long is the rise time?'),
    options: [
      { id: 'a', text: loc('35 ps', '35 ps') },
      { id: 'b', text: loc(`${f0(RISE_BW5)} ps`, `${f0(RISE_BW5)} ps`) },
      { id: 'c', text: loc('700 ps', '700 ps') },
    ],
    answer: 'b',
    explain: loc(
      `350 / 5 = ${f0(RISE_BW5)} ps。在 10 Gb/s（UI = ${f0(UI_10G)} ps）下，它占 ${f0((RISE_BW5 / UI_10G) * 100)}% 的 UI，眼会几乎闭合。`,
      `350 / 5 = ${f0(RISE_BW5)} ps. At 10 Gb/s (UI = ${f0(UI_10G)} ps) it takes ${f0((RISE_BW5 / UI_10G) * 100)}% of the UI, so the eye nearly closes.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('BW 不变（8 GHz），把速率从 10 Gb/s 提到 16 Gb/s，眼图会怎样？', 'BW stays at 8 GHz and the rate rises from 10 Gb/s to 16 Gb/s. What happens to the eye?'),
    options: [
      { id: 'a', text: loc('眼图变好，因为 UI 变大了', 'The eye improves because the UI gets bigger') },
      { id: 'b', text: loc('上升时间占 UI 的比例变大，边沿更容易侵入判决区', 'The rise time takes a larger share of the UI, so edges reach the decision region more easily') },
      { id: 'c', text: loc('与速率无关，只看 BW', 'Unrelated to rate; only BW matters') },
    ],
    answer: 'b',
    explain: loc(
      `上升时间 350 / 8 ≈ ${f0(RISE_BW8)} ps。10 Gb/s 时 UI = ${f0(UI_10G)} ps，占 ${f0((RISE_BW8 / UI_10G) * 100)}%；16 Gb/s 时 UI 只有 ${f2(UI_16G)} ps，占 ${f0((RISE_BW8 / UI_16G) * 100)}%。速率越高，UI 越短，同样的边沿越占便宜。`,
      `Rise time 350 / 8 ≈ ${f0(RISE_BW8)} ps. At 10 Gb/s the UI is ${f0(UI_10G)} ps, so it takes ${f0((RISE_BW8 / UI_10G) * 100)}%; at 16 Gb/s the UI is only ${f2(UI_16G)} ps, so it takes ${f0((RISE_BW8 / UI_16G) * 100)}%. A higher rate shortens the UI, so the same edge takes a bigger share.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('随机抖动（RJ）变大时，眼图哪一个量最先变差？', 'As random jitter (RJ) grows, which eye metric degrades first?'),
    options: [
      { id: 'a', text: loc('中心眼高', 'Centre eye height') },
      { id: 'b', text: loc('眼宽', 'Eye width') },
      { id: 'c', text: loc('上升时间', 'Rise time') },
    ],
    answer: 'b',
    explain: loc(
      '抖动把边沿的交叉点左右推开，改变的是采样时刻的余量，所以眼宽先变小。中心处的电平主要由带宽（ISI）决定，眼高受抖动的影响要小得多。',
      'Jitter pushes the crossings sideways, which changes the timing margin, so the eye width shrinks first. The centre level is set mainly by bandwidth (ISI), and jitter affects the height much less.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('眼图中心的眼高是怎么定义的？', 'How is the centre eye height defined?'),
    options: [
      { id: 'a', text: loc('中心采样时，"1" 的最低电平减去 "0" 的最高电平', 'At the centre sample: the lowest "1" level minus the highest "0" level') },
      { id: 'b', text: loc('整个眼图的最高值减去最低值', 'The highest value minus the lowest value over the whole eye') },
      { id: 'c', text: loc('上升沿的斜率', 'The slope of the rising edge') },
    ],
    answer: 'a',
    explain: loc(
      `在 0.5 UI 处，眼高 = min(1 的采样值) − max(0 的采样值)。mask 的半高是 ±${MASK_MV} mV，中心眼高必须留出比它更大的空间才不会撞进去。`,
      `At 0.5 UI, eye height = min(samples of 1) − max(samples of 0). The mask is ±${MASK_MV} mV at its centre, so the centre opening must leave room around it to avoid a hit.`,
    ),
  },
]

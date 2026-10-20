import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type BasicsAnalysis, type BasicsState, RATES, settledFraction } from './basicsModel'

export const RATE_OPTIONS = RATES.map((rate) => ({ id: String(rate), label: `${rate} Gb/s` }))

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

export const S = {
  kickerNow: loc('这一次的波形', 'This waveform'),
  introTitle: loc('数据速率、UI 与上升时间', 'Data rate, UI and rise time'),
  coreTitle: loc('拨一拨：速率与上升时间', 'Try it: data rate and rise time'),
  coreNote: loc(
    '一位占的时间是 UI = 1000 / 速率。上升时间 tr 由通道带宽决定（BW ≈ 0.35 / tr）。下图是一段 0/1 码型经过一阶 RC 通道后的波形，虚线是理想方波。',
    'One bit lasts UI = 1000 / rate. Rise time tr is set by the channel bandwidth (BW ≈ 0.35 / tr). The chart shows a 0/1 pattern after a first-order RC channel; the dashed line is the ideal square wave.',
  ),
  rateLabel: loc('数据速率', 'Data rate'),
  trLabel: loc('上升时间 tr（10%–90%）', 'Rise time tr (10%–90%)'),
  rUi: loc('单位间隔 UI = 1000 / 速率', 'Unit interval UI = 1000 / rate'),
  rBw: loc('带宽 BW ≈ 350 / tr', 'Bandwidth BW ≈ 350 / tr'),
  rRatio: loc('tr / UI（判据 ≤ 0.50）', 'tr / UI (criterion ≤ 0.50)'),
  rSettled: loc('一位结束时走到目标的比例', 'Share of target reached at bit end'),
  rMinBw: loc('达标所需 BW ≥ 0.7 × 速率', 'BW needed: ≥ 0.7 × rate'),
  rVerdict: loc('判定（稳态）', 'Verdict (steady state)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的链路还要考虑阻抗、损耗、串扰和均衡，这些在下一课 HS-02 里展开；这里只练 UI、上升时间和稳态判据。',
    'Real links also involve impedance, loss, crosstalk and equalisation; HS-02 covers them next. Here we only practise UI, rise time and the steady-state criterion.',
  ),
  next: loc('下一课：传输与信号完整性', 'Next: Transmission and Signal Integrity'),
  task1: loc(
    '10 Gb/s 下把 tr 调到 60 ps 或更大，看一位结束时边沿是否还没走完（FAIL）。',
    'At 10 Gb/s, raise tr to 60 ps or more and see whether the edge is still unfinished at the end of a bit (FAIL).',
  ),
  task2: loc(
    '换到 16 Gb/s，把 tr 降到 30 ps 以内，让波形达到稳态（PASS）。',
    'Switch to 16 Gb/s and bring tr to 30 ps or less so the waveform reaches steady state (PASS).',
  ),
  task3: loc(
    '设为 10 Gb/s、tr = 50 ps：BW 读数应为 7 GHz，正好卡在判据边界上。',
    'Set 10 Gb/s and tr = 50 ps: the BW readout should read 7 GHz, right on the criterion boundary.',
  ),
}

export const FIG = {
  aria: loc(
    '一段 0/1 码型经过一阶 RC 通道后的波形，标出上升时间 tr 的 10% 与 90% 位置',
    'Waveform of a 0/1 pattern after a first-order RC channel, with the 10% and 90% points of the rise time marked',
  ),
  cap: loc(
    '实线是通道输出，虚线是理想方波。金色标出 tr 的 10%–90% 区间；每一位只有 UI 这么长，边沿没走完就要转向下一位。',
    'The solid line is the channel output and the dashed line the ideal square wave. The gold marks show the 10%–90% span of tr; each bit is only one UI long, so an unfinished edge is cut short by the next bit.',
  ),
  axis: loc('时间（UI）', 'Time (UI)'),
}

export const INTRO = [
  loc(
    '高速串行链路的数据是一位一位连续发出去的。速率为 Gb/s 时，一位（一个单位间隔，UI）只有几百到几十皮秒。{@anaSignal} 讲过的 RC 低通在这里同样适用：边沿要花一段时间才能走完，而 UI 不会等它。',
    'High-speed serial links send data one bit after another. At Gb/s rates one unit interval (UI) lasts only hundreds to tens of picoseconds. The RC low-pass from {@anaSignal} applies here too: an edge takes time to finish, and the UI does not wait for it.',
  ),
  loc(
    '这一课只做三件事：从速率算出 UI；从带宽算出上升时间（BW ≈ 0.35 / tr）；用 tr / UI 判断一位结束时波形是否已经到达稳态。',
    'This lesson does three things: compute the UI from the rate; compute the rise time from the bandwidth (BW ≈ 0.35 / tr); and use tr / UI to judge whether the waveform has reached steady state at the end of each bit.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '速率越高，只要带宽不变，波形就一样。速率提高让 UI 变短，而 tr 由带宽决定、不变，tr / UI 变大，边沿更占一位的时间。',
    'If the rate goes up and the bandwidth stays put, the waveform stays the same. The UI shrinks while tr, set by bandwidth, does not change, so tr / UI grows and edges take a bigger share of each bit.',
  ),
  loc(
    '带宽够用一次，就能跑任何速率。所需带宽随速率增长：要求 tr ≤ 0.5 UI 时，BW ≥ 0.7 × 速率，速率翻倍，带宽也要翻倍。',
    'Enough bandwidth once means any rate works. The bandwidth needed grows with rate: with tr ≤ 0.5 UI, BW ≥ 0.7 × rate, so doubling the rate doubles the bandwidth requirement.',
  ),
  loc(
    '上升时间和带宽是两件独立的事。BW ≈ 0.35 / tr 把两者绑在一起：知道一个，就能算出另一个。',
    'Rise time and bandwidth are separate things. BW ≈ 0.35 / tr ties them together: knowing one gives you the other.',
  ),
]

export const TAKEAWAY: LText = loc(
  'UI = 1000 / 速率（ps）；BW ≈ 0.35 / tr（tr 为 ps 时 BW 为 GHz）；判据 tr / UI ≤ 0.5，一位结束时约 99% 到位，即波形到达稳态；由此得到 BW ≥ 0.7 × 速率。',
  'UI = 1000 / rate (ps); BW ≈ 0.35 / tr (BW in GHz when tr is in ps); criterion tr / UI ≤ 0.5, so about 99% has settled at the end of each bit and the waveform is steady; hence BW ≥ 0.7 × rate.',
)

/** 右侧说明栏：根据波形结果给结论和原因 */
export function verdictOf(state: BasicsState, a: BasicsAnalysis): { title: LText; text: LText; note: LText | null } {
  const ratio = f2(a.ratio)
  const settled = f1(a.settled * 100)
  if (a.pass) {
    return {
      title: S.pass,
      text: loc(
        `tr / UI = ${ratio} ≤ 0.5。UI 有 ${f1(a.ui)} ps，而上升时间只有 ${f0(state.tr)} ps，一位结束时边沿已走到 ${settled}%，剩下的误差最多约 1.2%，波形基本到达稳态。`,
        `tr / UI = ${ratio} ≤ 0.5. The UI is ${f1(a.ui)} ps and the rise time only ${f0(state.tr)} ps, so the edge has reached ${settled}% by the end of each bit; the remaining error is at most about 1.2%, and the waveform is essentially steady.`,
      ),
      note: null,
    }
  }
  const residual = f1(100 - a.settled * 100)
  return {
    title: S.fail,
    text: loc(
      `tr / UI = ${ratio} > 0.5。UI 只有 ${f1(a.ui)} ps，上升时间却要 ${f0(state.tr)} ps，一位结束时边沿只走到 ${settled}%，剩下的 ${residual}% 会拖到下一位上，相邻位互相影响。要么降低速率让 UI 变长，要么提高带宽（减小 tr），让 tr ≤ 0.5 UI。`,
      `tr / UI = ${ratio} > 0.5. The UI is only ${f1(a.ui)} ps but the rise time is ${f0(state.tr)} ps, so the edge reaches only ${settled}% by the end of the bit; the remaining ${residual}% spills into the next bit and neighbouring bits interfere. Either lower the rate to lengthen the UI, or raise the bandwidth (reduce tr) so that tr ≤ 0.5 UI.`,
    ),
    note: null,
  }
}

/** 三张任务卡：完成与否由当前设置和波形结果算出 */
export function taskItems(state: BasicsState, a: BasicsAnalysis): TaskItem[] {
  return [
    { id: 'fail10', text: S.task1, done: state.rate === 10 && state.tr >= 60 && !a.pass },
    { id: 'pass16', text: S.task2, done: state.rate === 16 && state.tr <= 30 && a.pass },
    { id: 'edge50', text: S.task3, done: state.rate === 10 && state.tr === 50 },
  ]
}

/** 小测题干中的数字由模型公式算出，与页面的换算保持一致 */
const UI_10G = 1000 / 10
const UI_16G = 1000 / 16
const BW_TR70 = 350 / 70
const MIN_BW_16G = 0.7 * 16
const SETTLED_10G_60 = settledFraction(60 / UI_10G)
const RATIO_10G_40 = 40 / UI_10G
const RATIO_16G_40 = 40 / UI_16G

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
      `UI = 1000 / 10 = ${f0(UI_10G)} ps。每一位只有 ${f0(UI_10G)} ps 的时间，边沿必须在这段时间里走完。`,
      `UI = 1000 / 10 = ${f0(UI_10G)} ps. Each bit has only ${f0(UI_10G)} ps, and the edge must finish within that time.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('上升时间 tr = 70 ps，用 BW ≈ 0.35 / tr 估算，带宽约是多少？', 'Rise time tr = 70 ps. Using BW ≈ 0.35 / tr, about what bandwidth is needed?'),
    options: [
      { id: 'a', text: loc('2.5 GHz', '2.5 GHz') },
      { id: 'b', text: loc('5 GHz', '5 GHz') },
      { id: 'c', text: loc('25 GHz', '25 GHz') },
    ],
    answer: 'b',
    explain: loc(
      `350 / 70 = ${f1(BW_TR70)} GHz。tr 用 ps、BW 用 GHz 时，BW ≈ 350 / tr。`,
      `350 / 70 = ${f1(BW_TR70)} GHz. With tr in ps and BW in GHz, BW ≈ 350 / tr.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('16 Gb/s 下，要让 tr / UI ≤ 0.5，带宽至少要多少？', 'At 16 Gb/s, what is the minimum bandwidth needed for tr / UI ≤ 0.5?'),
    options: [
      { id: 'a', text: loc('5.6 GHz', '5.6 GHz') },
      { id: 'b', text: loc('11.2 GHz', '11.2 GHz') },
      { id: 'c', text: loc('22.4 GHz', '22.4 GHz') },
    ],
    answer: 'b',
    explain: loc(
      `UI = ${f1(UI_16G)} ps，所以 tr ≤ 0.5 × ${f1(UI_16G)} = ${f2(UI_16G / 2)} ps，BW ≥ 350 / ${f2(UI_16G / 2)} = ${f1(MIN_BW_16G)} GHz，即 0.7 × 16。`,
      `UI = ${f1(UI_16G)} ps, so tr ≤ 0.5 × ${f1(UI_16G)} = ${f2(UI_16G / 2)} ps, and BW ≥ 350 / ${f2(UI_16G / 2)} = ${f1(MIN_BW_16G)} GHz, i.e. 0.7 × 16.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('10 Gb/s 下 tr = 60 ps，一位结束时波形能否到达稳态？', 'At 10 Gb/s with tr = 60 ps, does the waveform reach steady state by the end of each bit?'),
    options: [
      { id: 'a', text: loc('能，tr 比 UI 短', 'Yes, tr is shorter than the UI') },
      { id: 'b', text: loc(`不能，只走到 ${f1(SETTLED_10G_60 * 100)}%，tr / UI = 0.6 > 0.5`, `No, it reaches only ${f1(SETTLED_10G_60 * 100)}%, and tr / UI = 0.6 > 0.5`) },
      { id: 'c', text: loc('无法判断，要用示波器', 'Cannot tell without an oscilloscope') },
    ],
    answer: 'b',
    explain: loc(
      `tr / UI = 60 / 100 = 0.6，超过判据 0.5。一阶 RC 下一位结束时完成度为 1 − 9^(−UI/tr) = 1 − 9^(−1/0.6) ≈ ${f1(SETTLED_10G_60 * 100)}%，还差约 ${f1(100 - SETTLED_10G_60 * 100)}%。`,
      `tr / UI = 60 / 100 = 0.6, above the 0.5 criterion. For a first-order RC the completion at bit end is 1 − 9^(−1/0.6) ≈ ${f1(SETTLED_10G_60 * 100)}%, short by about ${f1(100 - SETTLED_10G_60 * 100)}%.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('为什么 tr / UI = 0.5 被定为稳态判据的边界？', 'Why is tr / UI = 0.5 chosen as the steady-state boundary?'),
    options: [
      { id: 'a', text: loc('0.5 是随手定的经验值，没有依据', 'It is an arbitrary rule of thumb with no basis') },
      { id: 'b', text: loc('一阶 RC 的 10%–90% 上升时间约 2.2 τ，UI = 2 tr 时一位结束的残留只有约 1.2%', 'A first-order RC has a 10%–90% rise time of about 2.2 τ; at UI = 2 tr the residual at bit end is only about 1.2%') },
      { id: 'c', text: loc('只要 tr 小于 1 ns 就行', 'Any tr under 1 ns is enough') },
    ],
    answer: 'b',
    explain: loc(
      '10%–90% 上升时间 = τ·ln 9 ≈ 2.2 τ。UI = 2 tr 时 UI / τ = 2·ln 9 ≈ 4.4，残留 e^(−4.4) = 1/81 ≈ 1.2%。所以 tr / UI = 0.5 对应约 99% 到位。',
      `The 10%–90% rise time is τ·ln 9 ≈ 2.2 τ. At UI = 2 tr, UI / τ = 2·ln 9 ≈ 4.4, and the residual is e^(−4.4) = 1/81 ≈ 1.2%. So tr / UI = 0.5 corresponds to about 99% settled.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('速率从 10 Gb/s 提到 16 Gb/s，tr 保持 40 ps 不变，tr / UI 会怎样？', 'The rate goes from 10 Gb/s to 16 Gb/s with tr fixed at 40 ps. What happens to tr / UI?'),
    options: [
      { id: 'a', text: loc('变小', 'It gets smaller') },
      { id: 'b', text: loc('变大', 'It gets bigger') },
      { id: 'c', text: loc('不变', 'It stays the same') },
    ],
    answer: 'b',
    explain: loc(
      `10 Gb/s 时 tr / UI = 40 / ${f0(UI_10G)} = ${f2(RATIO_10G_40)}；16 Gb/s 时 UI 缩短到 ${f1(UI_16G)} ps，tr / UI = 40 / ${f1(UI_16G)} = ${f2(RATIO_16G_40)}。速率越高，同样的边沿越占一位的时间。`,
      `At 10 Gb/s, tr / UI = 40 / ${f0(UI_10G)} = ${f2(RATIO_10G_40)}; at 16 Gb/s the UI shrinks to ${f1(UI_16G)} ps, so tr / UI = 40 / ${f1(UI_16G)} = ${f2(RATIO_16G_40)}. A higher rate means the same edge takes a bigger share of each bit.`,
    ),
  },
]
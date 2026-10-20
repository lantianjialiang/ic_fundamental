import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  gainDb,
  lowpassGain,
  lowpassPhaseDeg,
  minCutoffFor,
  periodMs,
  phaseOfDelay,
  type SignalResult,
  type SignalState,
} from './signalModel'

export const S = {
  kickerNow: loc('这一次波形与滤波', 'This waveform and filter run'),
  introTitle: loc('连续信号：周期、频率、幅度与相位', 'Continuous signals: period, frequency, amplitude and phase'),
  coreTitle: loc('拨一拨：频率、幅度与相位', 'Try it: frequency, amplitude and phase'),
  coreNote: loc(
    '两路正弦共用频率 f。A 路是参考（相位 0°），B 路的相位可以调。相位差只在同频时才有确定的意义，所以两路必须用同一个 f。',
    'Both sine waves share the frequency f. Channel A is the reference at 0°, and you can set the phase of channel B. A phase difference only has a clear meaning at the same frequency, so both channels use one f.',
  ),
  fLabel: loc('频率 f (kHz)', 'Frequency f (kHz)'),
  ampALabel: loc('A 路幅度 (V)', 'Channel A amplitude (V)'),
  ampBLabel: loc('B 路幅度 (V)', 'Channel B amplitude (V)'),
  phaseLabel: loc('B 相对 A 的相位 (°)', 'Phase of B relative to A (°)'),
  rPeriod: loc('周期 T = 1/f', 'Period T = 1/f'),
  rPhase: loc('B 相对 A 的相位差', 'Phase difference, B vs A'),
  rGain: loc('滤波增益 @ f', 'Filter gain @ f'),
  rOutB: loc('B 路输出幅度', 'Channel B output amplitude'),
  rBw: loc('3 dB 带宽（= fc）', '3 dB bandwidth (= fc)'),
  noFilterBw: loc('滤波关，无带宽', 'Filter off: no bandwidth'),
  rErr: loc('幅度误差', 'Amplitude error'),
  bodeTitle: loc('低通的幅度与相位：随频率怎么变', 'Low-pass gain and phase versus frequency'),
  bodeNote: loc(
    '横轴是对数频率。图中两条曲线就是一阶 RC 低通的幅度 |H| 与相位 ∠H；蓝线标出 f，金色虚线标出截止频率 fc。改 fc，两条曲线整体左右移动。',
    'The horizontal axis is logarithmic frequency. The two curves are the gain |H| and phase ∠H of the first-order RC low-pass; the blue line marks f and the gold dashed line marks the cutoff fc. Changing fc shifts both curves sideways.',
  ),
  filterLabel: loc('低通滤波（接在 B 路）', 'Low-pass filter (on channel B)'),
  filterOff: loc('关', 'Off'),
  filterOn: loc('开', 'On'),
  fcLabel: loc('截止频率 fc (kHz)', 'Cutoff frequency fc (kHz)'),
  offTitle: loc('滤波关：两路只差设定的相位', 'Filter off: the two channels differ only by the set phase'),
  filterTitle: loc('滤波开：幅度和相位一起变', 'Filter on: amplitude and phase both change'),
  asideLater: loc(
    '滤波器的阶数、通带纹波和群延时在规格书里；这里只看一阶 RC 的幅度与相位。',
    'Filter order, passband ripple and group delay are in the datasheet; here we only look at the amplitude and phase of a first-order RC.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  nextPrefix: loc('下一课：', 'Next: '),
  task1: loc(
    '关闭滤波，把 B 相对 A 的相位差调到 60°（误差 ±1°）。',
    'With the filter off, set the phase of B relative to A to 60° (within ±1°).',
  ),
  task2: loc(
    '开启滤波，调整 f 与 fc，使 f 处的增益正好是 −3 dB（误差 0.1 dB）。',
    'With the filter on, adjust f and fc so the gain at f is exactly −3 dB (within 0.1 dB).',
  ),
  task3: loc(
    '开启滤波，把 f 设为 1 kHz，调 fc，使滤波后的幅度误差不超过 3%。',
    'With the filter on, set f to 1 kHz and adjust fc so the amplitude error after filtering is at most 3%.',
  ),
}

export const FIG = {
  waveAria: loc(
    '时域图：A 路与 B 路两个正弦，开启滤波时还有滤波前后的对比',
    'Time-domain plot: sine waves on channels A and B, with the before and after filter comparison when the filter is on',
  ),
  waveCap: loc(
    '蓝线是 A 路（参考），金线是 B 路输入。开启滤波时，紫线是 B 经过 RC 低通后的输出：幅度变小，相位变滞后。',
    'Blue is channel A (reference) and gold is the B input. With the filter on, the purple line is B after the RC low-pass: its amplitude drops and its phase lags.',
  ),
  legA: loc('A 路（参考）', 'A (reference)'),
  legB: loc('B 路输入', 'B input'),
  legBout: loc('B 滤波后', 'B filtered'),
  bodeAria: loc(
    '伯德图：一阶 RC 低通的幅度与相位随频率变化，标出 f 与 fc',
    'Bode plot: gain and phase of the first-order RC low-pass versus frequency, marking f and fc',
  ),
  bodeCap: loc(
    '高于 fc 的频率每高 10 倍，幅度约降 20 dB。相位在 fc 处为 −45°，远低于 fc 时接近 0°，远高于 fc 时接近 −90°。',
    'Above fc the gain falls about 20 dB per decade. The phase is −45° at fc, near 0° far below fc, and near −90° far above it.',
  ),
}

export const FILTER_OPTIONS: Array<{ id: 'off' | 'on'; label: LText }> = [
  { id: 'off', label: S.filterOff },
  { id: 'on', label: S.filterOn },
]

export const INTRO: LText[] = [
  loc(
    '{@anaResources} 讲过 AWG 与 Digitizer：AWG 给 DUT 送测试激励，Digitizer 把响应采回来。要比较两路信号，就要比较同一频率下的幅度与相位，所以先要说清正弦信号的几个参数。',
    'The {@anaResources} lesson covered the AWG and the digitizer: the AWG drives a test stimulus into the DUT and the digitizer captures the response. To compare two signals you compare their amplitude and phase at the same frequency, so first pin down the parameters of a sine wave.',
  ),
  loc(
    '这一课练三件事：用周期、频率、幅度、相位描述一个正弦；比较两路同频信号的相位差；看一阶 RC 低通的截止频率怎样改变幅度和相位。采样与混叠留到 {@anaSampling}。',
    'This lesson practises three things: describing a sine wave by its period, frequency, amplitude and phase; comparing the phase difference of two same-frequency signals; and seeing how the cutoff of a first-order RC low-pass changes amplitude and phase. Sampling and aliasing come in {@anaSampling}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '相位差与频率无关。同样的时间差 Δt，频率越高，对应的相位差越大（Δφ = 360°·f·Δt）。所以两路信号的相位差只在同频时比较才有意义。',
    'Phase difference does not depend on frequency. For the same time offset Δt, a higher frequency gives a larger phase difference (Δφ = 360°·f·Δt). A phase difference is only meaningful when both signals share a frequency.',
  ),
  loc(
    '−3 dB 就是幅度减半。−3 dB 对应幅度的 0.707 倍，功率约为一半；幅度减半是 −6 dB。对一阶 RC，−3 dB 点正好是截止频率 fc。',
    '−3 dB is not half the amplitude. −3 dB is 0.707 times the amplitude, about half the power; half the amplitude is −6 dB. For a first-order RC, the −3 dB point is exactly the cutoff fc.',
  ),
  loc(
    '低通滤波只改幅度，不改相位。RC 低通在 fc 处相位滞后 45°，f 远高于 fc 时滞后接近 90°。幅度和相位是一起变的，比较两路时要把滤波的相位算进去。',
    'A low-pass only changes amplitude, not phase. An RC low-pass lags by 45° at fc and by nearly 90° far above fc. Amplitude and phase change together, so count the filter’s phase when comparing two channels.',
  ),
]

export const TAKEAWAY: LText = loc(
  '周期 T = 1/f，相位用角度表示；两路相位差要在同频下比较，Δφ = 360°·f·Δt。一阶 RC 低通 |H| = 1/√(1+(f/fc)²)，相位 = −atan(f/fc)：fc 处是 −3 dB、−45°；f 远低于 fc 时几乎不变，f 远高于 fc 时每高 10 倍衰减约 20 dB。',
  'The period is T = 1/f and phase is an angle. Compare the phase of two channels at the same frequency, with Δφ = 360°·f·Δt. A first-order RC low-pass has |H| = 1/√(1+(f/fc)²) and phase = −atan(f/fc): at fc it is −3 dB and −45°; far below fc it barely changes, and far above fc it falls about 20 dB per decade.',
)

/** 右侧说明栏：根据当前设置和结果给出结论和原因 */
export function verdictOf(state: SignalState, result: SignalResult): { title: LText; text: LText } {
  const f = state.f.toFixed(1)
  if (!state.filter) {
    return {
      title: S.offTitle,
      text: loc(
        `两路都是 ${f} kHz。A 为参考，B 相对 A 的相位差就是你设定的 ${result.phaseDiff.toFixed(1)}°。打开滤波后，B 还会多一段滞后，相位差随之改变。`,
        `Both channels are ${f} kHz. A is the reference, so the phase of B relative to A is the ${result.phaseDiff.toFixed(1)}° you set. With the filter on, B picks up an extra lag and the phase difference changes.`,
      ),
    }
  }
  const lag = Math.abs(lowpassPhaseDeg(state.f, state.fc)).toFixed(1)
  return {
    title: S.filterTitle,
    text: loc(
      `f = ${f} kHz、fc = ${state.fc.toFixed(1)} kHz 时，|H| = ${result.gain.toFixed(3)}，增益 ${result.gainDb.toFixed(2)} dB，幅度误差 ${result.ampErrPct.toFixed(2)}%，相位滞后 ${lag}°。因为 |H| = 1/√(1+(f/fc)²)：f 比 fc 高得越多，衰减越大；f = fc 时正好是 −3 dB、−45°。`,
      `At f = ${f} kHz and fc = ${state.fc.toFixed(1)} kHz, |H| = ${result.gain.toFixed(3)}, a gain of ${result.gainDb.toFixed(2)} dB, an amplitude error of ${result.ampErrPct.toFixed(2)}% and a lag of ${lag}°. Because |H| = 1/√(1+(f/fc)²), the higher f is above fc, the more it is attenuated; at f = fc it is exactly −3 dB and −45°.`,
    ),
  }
}

/** 三张任务卡：完成与否由当前设置和结果算出 */
export function taskItems(state: SignalState, result: SignalResult): TaskItem[] {
  const t1 = !state.filter && Math.abs(result.phaseDiff - 60) <= 1
  const t2 = state.filter && Math.abs(result.gainDb + 3.01) <= 0.1
  const t3 = state.filter && Math.abs(state.f - 1) < 1e-6 && result.ampErrPct <= 3
  return [
    { id: 'phase', text: S.task1, done: t1 },
    { id: 'bandwidth', text: S.task2, done: t2 },
    { id: 'error', text: S.task3, done: t3 },
  ]
}

/** 小测的数字全部由模型算出，改了模型，小测和解析自动跟着变 */
const Q1_PERIOD = periodMs(2)
const Q2_GAIN = gainDb(lowpassGain(1, 1))
const Q3_GAIN = gainDb(lowpassGain(10, 1))
const Q4_PHASE = lowpassPhaseDeg(1, 1)
const Q5_1KHZ = phaseOfDelay(1, 0.25)
const Q5_2KHZ = phaseOfDelay(2, 0.25)
const Q6_FC = minCutoffFor(1, 3)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('一路正弦的频率是 2 kHz，它的周期是多少？', 'A sine wave has a frequency of 2 kHz. What is its period?'),
    options: [
      { id: 'a', text: loc('2 ms', '2 ms') },
      { id: 'b', text: loc(`${Q1_PERIOD.toFixed(3)} ms`, `${Q1_PERIOD.toFixed(3)} ms`) },
      { id: 'c', text: loc('0.5 kHz', '0.5 kHz') },
    ],
    answer: 'b',
    explain: loc(
      `T = 1/f = 1/(2 kHz) = 0.5 ms。周期与频率互为倒数，kHz 对应 ms。`,
      `T = 1/f = 1/(2 kHz) = 0.5 ms. Period and frequency are reciprocals, and kHz pairs with ms.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '一阶 RC 低通，fc = 1 kHz。输入 f = 1 kHz 时，增益是多少 dB？',
      'First-order RC low-pass with fc = 1 kHz. What is the gain in dB at f = 1 kHz?',
    ),
    options: [
      { id: 'a', text: loc(`${Q2_GAIN.toFixed(1)} dB`, `${Q2_GAIN.toFixed(1)} dB`) },
      { id: 'b', text: loc('-6.0 dB', '-6.0 dB') },
      { id: 'c', text: loc('0.0 dB', '0.0 dB') },
    ],
    answer: 'a',
    explain: loc(
      `|H| = 1/√(1+1²) = 1/√2 ≈ 0.707，换算 20·log10(0.707) = ${Q2_GAIN.toFixed(2)} dB。这正是 3 dB 点：f = fc 时增益正好降到 −3 dB。`,
      `|H| = 1/√(1+1²) = 1/√2 ≈ 0.707, which is 20·log10(0.707) = ${Q2_GAIN.toFixed(2)} dB. This is the 3 dB point: at f = fc the gain falls to exactly −3 dB.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '同一滤波器（fc = 1 kHz），输入 f = 10 kHz 时，增益大约是多少 dB？',
      'Same filter (fc = 1 kHz). About what gain in dB at f = 10 kHz?',
    ),
    options: [
      { id: 'a', text: loc('-3.0 dB', '-3.0 dB') },
      { id: 'b', text: loc(`${Q3_GAIN.toFixed(1)} dB`, `${Q3_GAIN.toFixed(1)} dB`) },
      { id: 'c', text: loc('-40.0 dB', '-40.0 dB') },
    ],
    answer: 'b',
    explain: loc(
      `f/fc = 10，|H| = 1/√101 ≈ 0.0995，换算 ${Q3_GAIN.toFixed(2)} dB。频率高于 fc 后，每高 10 倍衰减约 20 dB。`,
      `f/fc = 10, so |H| = 1/√101 ≈ 0.0995, which is ${Q3_GAIN.toFixed(2)} dB. Above fc, the gain falls about 20 dB per decade.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '同一滤波器，输入 f = fc = 1 kHz 时，输出相对输入的相位是多少？',
      'Same filter. At f = fc = 1 kHz, what is the output phase relative to the input?',
    ),
    options: [
      { id: 'a', text: loc('0°', '0°') },
      { id: 'b', text: loc(`${Q4_PHASE.toFixed(0)}°`, `${Q4_PHASE.toFixed(0)}°`) },
      { id: 'c', text: loc('-90°', '-90°') },
    ],
    answer: 'b',
    explain: loc(
      `相位 = −atan(f/fc) = −atan(1) = −45°。3 dB 点的相位滞后正好是 45°，远低于 fc 时接近 0，远高于 fc 时接近 90°。`,
      `Phase = −atan(f/fc) = −atan(1) = −45°. The lag at the 3 dB point is exactly 45°; it is near 0° far below fc and near 90° far above it.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '两路信号之间固定有 Δt = 0.25 ms 的时间差（B 比 A 晚）。在 1 kHz 与 2 kHz 下，两路相位差的大小分别是多少？',
      'Two signals have a fixed time offset Δt = 0.25 ms (B lags A). At 1 kHz and at 2 kHz, what are the sizes of the phase differences?',
    ),
    options: [
      { id: 'a', text: loc('两个频率下都是 90°', 'Both are 90°') },
      { id: 'b', text: loc(`1 kHz 为 ${Q5_1KHZ.toFixed(0)}°，2 kHz 为 ${Q5_2KHZ.toFixed(0)}°`, `1 kHz gives ${Q5_1KHZ.toFixed(0)}°, 2 kHz gives ${Q5_2KHZ.toFixed(0)}°`) },
      { id: 'c', text: loc('两个频率下都是 0°', 'Both are 0°') },
    ],
    answer: 'b',
    explain: loc(
      `Δφ = 360°·f·Δt：1 kHz 时为 360 × 1 × 0.25 = 90°；2 kHz 时为 180°。同样的时间差，频率翻倍，相位差也翻倍，所以相位差只在同频时才能直接比较。`,
      `Δφ = 360°·f·Δt: at 1 kHz it is 360 × 1 × 0.25 = 90°; at 2 kHz it is 180°. For the same time offset, doubling the frequency doubles the phase difference, so phase differences can only be compared directly at the same frequency.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '要让 1 kHz 处的幅度误差不超过 3%，截止频率 fc 至少要多高？',
      'To keep the amplitude error at 1 kHz within 3%, how high must the cutoff fc be at least?',
    ),
    options: [
      { id: 'a', text: loc('1 kHz', '1 kHz') },
      { id: 'b', text: loc(`${Q6_FC.toFixed(1)} kHz`, `${Q6_FC.toFixed(1)} kHz`) },
      { id: 'c', text: loc('0.25 kHz', '0.25 kHz') },
    ],
    answer: 'b',
    explain: loc(
      `误差 3% 时增益要不低于 0.97，即 fc ≥ f / √(1/0.97² − 1) ≈ ${Q6_FC.toFixed(2)} kHz，取 ${Q6_FC.toFixed(1)} kHz。fc 再低，有用信号的幅度就被压下去了。`,
      `A 3% error means the gain is at least 0.97, so fc ≥ f / √(1/0.97² − 1) ≈ ${Q6_FC.toFixed(2)} kHz, i.e. ${Q6_FC.toFixed(1)} kHz. Any lower and the wanted signal’s amplitude is pulled down.`,
    ),
  },
]

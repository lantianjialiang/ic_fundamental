import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { aafGain, aliasFreq, gainDb, type SampleResult, type SampleState } from './samplingModel'

const f1 = (value: number) => value.toFixed(1)

export const S = {
  kickerNow: loc('这一次采样', 'This sampling run'),
  introTitle: loc('采样就是每隔 1/fs 读一次', 'Sampling reads the signal once every 1/fs'),
  coreTitle: loc('拨一拨：采样率、输入频率与 AAF', 'Try it: sampling rate, input frequency and the AAF'),
  coreNote: loc(
    '蓝线是输入信号，圆点是 ADC 在每个采样时刻读到的值。下方的频谱标出奈奎斯特频率 fs/2：超过它的输入会折叠回来。',
    'The blue curve is the input and the dots are the values the ADC reads at each sample instant. The spectrum below marks the Nyquist frequency fs/2: any input above it folds back.',
  ),
  fsLabel: loc('采样率 fs (kHz)', 'Sampling rate fs (kHz)'),
  finLabel: loc('输入频率 f_in (kHz)', 'Input frequency f_in (kHz)'),
  aafLabel: loc('抗混叠滤波器 AAF', 'Anti-alias filter (AAF)'),
  fcLabel: loc('AAF 截止频率 fc (kHz)', 'AAF cutoff fc (kHz)'),
  aafOff: loc('关', 'Off'),
  aafOn: loc('开', 'On'),
  rNyquist: loc('奈奎斯特频率 fs/2', 'Nyquist frequency fs/2'),
  rPerPeriod: loc('每个输入周期的采样点数', 'Samples per input cycle'),
  rGain: loc('采样前增益 @ f_in', 'Gain before sampling @ f_in'),
  rAliasing: loc('是否超过 fs/2', 'Above fs/2?'),
  yes: loc('是', 'Yes'),
  no: loc('否', 'No'),
  hidden: loc('先填下面的预测', 'Predict below first'),
  predictTitle: loc('先预测，再看结果', 'Predict, then check'),
  predictLabel: loc('ADC 看到的表观频率 (kHz)', 'Apparent frequency seen by the ADC (kHz)'),
  predictHint: loc(
    '提示：f_alias = |f_in − round(f_in / fs) · fs|。预测对之前，图上不画折叠后的波形，右侧也不显示表观频率。',
    'Hint: f_alias = |f_in − round(f_in / fs) · fs|. Until you predict correctly, the folded wave is not drawn and the apparent frequency is hidden.',
  ),
  predictOk: loc('对了：表观频率就是下面图里的虚线波形。', 'Correct: the apparent frequency is the dashed wave in the figure.'),
  predictBad: loc('还不对：先看 f_in 超过 fs/2 多少，再算折叠。', 'Not yet: first see how far f_in is above fs/2, then fold it.'),
  rApparent: loc('表观频率（ADC 看到的）', 'Apparent frequency (seen by the ADC)'),
  ok: loc('不混叠', 'No aliasing'),
  alias: loc('混叠', 'Aliasing'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '过采样、Sigma-Delta 的噪声整形、以及 ADC 本身的抖动和孔径误差，留到动态参数那一课；这里只看采样率和输入频率的关系。',
    'Oversampling, sigma-delta noise shaping, and ADC jitter and aperture error are left to the dynamic-parameter lesson; here we only look at the sampling rate against the input frequency.',
  ),
  next: loc('下一课：波形采集与 FFT', 'Next: waveform capture and FFT'),
  task1: loc(
    '把 f_in 调到超过 fs/2，让它混叠（例如 fs = 10 kHz 时 f_in ≥ 5.1 kHz）。',
    'Set f_in above fs/2 so it aliases (for example, f_in ≥ 5.1 kHz when fs = 10 kHz).',
  ),
  task2: loc(
    '在预测框里填对表观频率（误差 0.1 kHz 以内）。',
    'Enter the apparent frequency in the prediction box (within 0.1 kHz).',
  ),
  task3: loc(
    '开启 AAF，把 fc 调低，使 f_in 处的增益至少衰减 6 dB。',
    'Turn on the AAF and lower fc so the gain at f_in drops by at least 6 dB.',
  ),
}

export const FIG = {
  waveAria: loc('时域图：输入正弦、采样点与 AAF 后的波形', 'Time-domain plot: input sine, sample points and the wave after the AAF'),
  waveCap: loc(
    '蓝线是采样前的连续信号（开 AAF 时为衰减后的波形，灰线是原始信号）。圆点是采样时刻的值；虚线是预测正确后，这些圆点能被还原出的表观波形。',
    'The blue curve is the continuous signal before sampling (after the AAF when it is on; the grey curve is the raw signal). Dots are the values taken at sample instants; the dashed line appears once you predict correctly and is the apparent wave those dots can be fitted to.',
  ),
  freqAria: loc('频谱图：0 到 20 kHz，标出 f_in、表观频率与奈奎斯特频率', 'Spectrum: 0 to 20 kHz, marking f_in, the apparent frequency and the Nyquist frequency'),
  freqCap: loc(
    '横轴是频率。竖线是输入频率 f_in，奈奎斯特频率 fs/2 以上的部分会折叠到 0 与 fs/2 之间；折叠后的位置就是表观频率。',
    'The horizontal axis is frequency. The solid line is f_in; anything above the Nyquist frequency fs/2 folds into the band between 0 and fs/2, and its folded position is the apparent frequency.',
  ),
  fin: loc('f_in', 'f_in'),
  nyq: loc('fs/2', 'fs/2'),
  apparent: loc('表观', 'Apparent'),
}

/** 「先预测」：预测框的内容与当前 alias 比较，误差不超过 0.1 kHz 才算对 */
export function predictOk(input: string, result: SampleResult): boolean {
  if (input.trim() === '') {
    return false
  }
  const value = Number(input)
  return Number.isFinite(value) && Math.abs(value - result.alias) <= 0.1
}

export const INTRO: LText[] = [
  loc(
    '{@pMeasure} 讲过的是连续的电压和电流。ATE 的数字化仪、ADC 把连续信号变成一串数，这个过程叫采样。每隔 1/fs 读一次，只能看到采样点上的值。',
    'The {@pMeasure} lesson covered continuous voltage and current. An ATE digitizer or ADC turns a continuous signal into a list of numbers; that is sampling. It reads one value every 1/fs and sees nothing in between.',
  ),
  loc(
    '这一课只练三件事：判断输入是否超过奈奎斯特频率 fs/2；算出它折叠后的表观频率；说清抗混叠滤波器（AAF）为什么必须在采样之前放。',
    'This lesson practises three things: decide whether the input is above the Nyquist frequency fs/2; compute its folded apparent frequency; explain why the anti-alias filter (AAF) must sit before the sampler.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '采样率越高，超过 fs/2 的输入就不会混叠。采样率只决定折叠的位置，不能让 f_in > fs/2 的成分消失；只要 f_in 超过 fs/2，它就一定会折叠。',
    'A higher sampling rate stops aliasing for inputs above fs/2. The sampling rate only decides where the fold lands; it does not make components above fs/2 vanish. Any input above fs/2 always folds.',
  ),
  loc(
    '采样后用软件滤波就能去掉混叠。混叠发生在采样那一刻，采样点已经和真正的低频信号分不开；采样后的数字滤波只能去掉已经存在的成分，不能把它们还原。',
    'Digital filtering after sampling removes aliasing. Aliasing happens at the instant of sampling, when the sample points can no longer be told apart from a real low-frequency signal; digital filtering afterwards cannot undo it.',
  ),
  loc(
    'AAF 截止频率调得越低越安全。fc 调低，f_in 处的衰减确实更大，但通带里有用的信号也会被衰减；通常 fc 设在 fs/2 附近或略低，留给有用信号足够的带宽。',
    'A lower AAF cutoff is always safer. Lowering fc does attenuate f_in more, but it also attenuates useful in-band signal; usually fc is set near or a little below fs/2, leaving enough bandwidth for the wanted signal.',
  ),
]

export const TAKEAWAY: LText = loc(
  '采样率 fs 必须大于输入最高频率的两倍（超过 fs/2 就混叠）；混叠后表观频率 = |f_in − round(f_in/fs)·fs|；AAF 要在采样之前放，并把 fc 放在 fs/2 附近。',
  'The sampling rate fs must be more than twice the highest input frequency (above fs/2 it aliases). The apparent frequency after aliasing is |f_in − round(f_in/fs)·fs|. The AAF must sit before the sampler, with fc near fs/2.',
)

/** 右侧说明栏：根据当前结果给出结论和原因 */
export function verdictOf(state: SampleState, result: SampleResult): { title: LText; text: LText } {
  const fin = f1(state.fin)
  const nyq = f1(result.nyquist)
  const alias = f1(result.alias)
  const gain = f1(gainDb(result.gain))
  if (result.aliasing && state.aaf) {
    return {
      title: S.alias,
      text: loc(
        `f_in = ${fin} kHz 超过 fs/2 = ${nyq} kHz，仍会折叠到 ${alias} kHz。AAF 在 f_in 处只给了 ${gain} dB 的衰减：它能让折叠成分变小，却不能把它变回正确的频率。要真正消除混叠，AAF 的截止要低于 fs/2。`,
        `f_in = ${fin} kHz is above fs/2 = ${nyq} kHz, so it still folds to ${alias} kHz. The AAF gives only ${gain} dB of attenuation at f_in: it makes the folded component smaller but cannot restore the right frequency. To remove aliasing for real, the AAF cutoff must be below fs/2.`,
      ),
    }
  }
  if (result.aliasing) {
    return {
      title: S.alias,
      text: loc(
        `f_in = ${fin} kHz 超过 fs/2 = ${nyq} kHz。采样后它会折叠成 ${alias} kHz，而采样点与真正的 ${alias} kHz 信号完全相同，ADC 无法区分。加上 AAF 才能在采样前把它削弱。`,
        `f_in = ${fin} kHz is above fs/2 = ${nyq} kHz. After sampling it folds to ${alias} kHz, and the sample points match a real ${alias} kHz signal exactly, so the ADC cannot tell them apart. An AAF before the sampler weakens it first.`,
      ),
    }
  }
  if (state.aaf) {
    return {
      title: S.ok,
      text: loc(
        `f_in = ${fin} kHz 低于 fs/2 = ${nyq} kHz，不混叠，表观频率就是 ${fin} kHz。AAF 在 f_in 处还是衰减了 ${gain} dB：fc 设得越低，这部分损失越大，要看它是否压到了有用信号。`,
        `f_in = ${fin} kHz is below fs/2 = ${nyq} kHz, so there is no aliasing and the apparent frequency is ${fin} kHz. The AAF still attenuates f_in by ${gain} dB: the lower fc is, the more of the wanted signal it removes.`,
      ),
    }
  }
  return {
    title: S.ok,
    text: loc(
      `f_in = ${fin} kHz 低于 fs/2 = ${nyq} kHz，每个周期 ${f1(result.perPeriod)} 个采样点，不混叠，表观频率就是 ${fin} kHz。`,
      `f_in = ${fin} kHz is below fs/2 = ${nyq} kHz, with ${f1(result.perPeriod)} samples per cycle, so there is no aliasing and the apparent frequency is ${fin} kHz.`,
    ),
  }
}

/** 三张任务卡：完成与否由当前设置、预测框内容算出 */
export function taskItems(state: SampleState, result: SampleResult, predicted: boolean): TaskItem[] {
  const gainAtFin = gainDb(aafGain(state.fin, state.fc))
  return [
    { id: 'alias', text: S.task1, done: result.aliasing },
    { id: 'predict', text: S.task2, done: predicted },
    { id: 'aaf', text: S.task3, done: state.aaf && gainAtFin <= -6 },
  ]
}

/** 小测题干里的数字全部由模型算出，改了模型，小测和解析自动跟着变 */
const Q1_ALIAS = aliasFreq(7, 10)
const Q4_GAIN_DB = gainDb(aafGain(3, 2))

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('fs = 10 kHz，输入 f_in = 7 kHz。ADC 看到的表观频率是多少？', 'fs = 10 kHz and f_in = 7 kHz. What apparent frequency does the ADC see?'),
    options: [
      { id: 'a', text: loc('7.0 kHz', '7.0 kHz') },
      { id: 'b', text: loc(`${f1(Q1_ALIAS)} kHz`, `${f1(Q1_ALIAS)} kHz`) },
      { id: 'c', text: loc('5.0 kHz', '5.0 kHz') },
    ],
    answer: 'b',
    explain: loc(
      `7 kHz 超过 fs/2 = 5 kHz，折叠后是 |7 − round(0.7) × 10| = |7 − 10| = ${f1(Q1_ALIAS)} kHz。7 kHz 本身不会被看见。`,
      `7 kHz is above fs/2 = 5 kHz, so it folds to |7 − round(0.7) × 10| = |7 − 10| = ${f1(Q1_ALIAS)} kHz. The 7 kHz tone itself is never seen.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('要无混叠地采一个 5 kHz 的正弦，fs 最低取多少？', 'To sample a 5 kHz sine without aliasing, what is the lowest fs?'),
    options: [
      { id: 'a', text: loc('5 kHz', '5 kHz') },
      { id: 'b', text: loc('10 kHz', '10 kHz') },
      { id: 'c', text: loc('2.5 kHz', '2.5 kHz') },
    ],
    answer: 'b',
    explain: loc(
      'fs 必须大于 2 × f_in，所以 fs > 10 kHz。取 fs = 5 kHz 时 f_in 正好等于 fs，采样点落在同一相位上，看到的是直流。',
      'fs must be greater than 2 × f_in, so fs > 10 kHz. With fs = 5 kHz, f_in equals fs and every sample lands on the same phase, so the ADC sees a DC level.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('抗混叠滤波器（AAF）应该放在哪里，起什么作用？', 'Where should the anti-alias filter (AAF) sit, and what does it do?'),
    options: [
      { id: 'a', text: loc('采样之后，把 ADC 的噪声滤掉', 'After sampling, to filter out ADC noise') },
      { id: 'b', text: loc('采样之前，衰减 fs/2 以上的成分，防止它折叠', 'Before sampling, to attenuate components above fs/2 so they cannot fold') },
      { id: 'c', text: loc('采样之前，把采样率提高一倍', 'Before sampling, to double the sampling rate') },
    ],
    answer: 'b',
    explain: loc(
      '混叠在采样那一刻就发生了，所以滤波必须在采样之前。AAF 把 fs/2 以上的成分削弱，使折叠后的幅度足够小；它不改变采样率本身。',
      'Aliasing happens at the instant of sampling, so the filter must come before the sampler. The AAF weakens components above fs/2 so the folded amplitude is small enough; it does not change the sampling rate itself.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('AAF 截止 fc = 2 kHz（一阶 RC），f_in = 3 kHz。f_in 处的增益大约是多少 dB？', 'AAF cutoff fc = 2 kHz (first-order RC) and f_in = 3 kHz. About how many dB of gain does f_in see?'),
    options: [
      { id: 'a', text: loc(`${f1(Q4_GAIN_DB)} dB`, `${f1(Q4_GAIN_DB)} dB`) },
      { id: 'b', text: loc('−3.0 dB', '−3.0 dB') },
      { id: 'c', text: loc('0.0 dB', '0.0 dB') },
    ],
    answer: 'a',
    explain: loc(
      `一阶 RC：|H| = 1/√(1 + (3/2)²) = 1/√3.25 ≈ 0.555，换算成 ${f1(Q4_GAIN_DB)} dB。−3 dB 只在 f = fc 处成立，f_in 高于 fc 后衰减更多。`,
      `First-order RC: |H| = 1/√(1 + (3/2)²) = 1/√3.25 ≈ 0.555, which is ${f1(Q4_GAIN_DB)} dB. The −3 dB point applies only at f = fc; above fc the attenuation grows.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('把 AAF 的截止频率 fc 设得太低，会出现什么问题？', 'What goes wrong if the AAF cutoff fc is set too low?'),
    options: [
      { id: 'a', text: loc('高频混叠会更严重', 'High-frequency aliasing gets worse') },
      { id: 'b', text: loc('通带里有用的信号也会被衰减，测得的幅度偏小', 'Wanted in-band signal is attenuated too, so the measured amplitude reads low') },
      { id: 'c', text: loc('采样率会自动升高', 'The sampling rate rises automatically') },
    ],
    answer: 'b',
    explain: loc(
      'fc 低，滤波器在有用频段内也开始衰减，结果是幅度、THD 等指标失真。AAF 要在“压住 fs/2 以上”与“保留有用带宽”之间取舍。',
      'With a low fc the filter starts attenuating the useful band, so amplitude and THD results are distorted. The AAF is a trade-off between suppressing components above fs/2 and keeping the wanted bandwidth.',
    ),
  },
]

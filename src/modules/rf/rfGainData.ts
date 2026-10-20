import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { CENTRE_DB, FLAT_LIMIT_DB, analyseGain, type DeviceKind, type GainAnalysis, type GainState } from './rfGainModel'

const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

export const DEVICE_OPTIONS: Array<{ id: DeviceKind; label: LText }> = [
  { id: 'amp', label: loc('放大器', 'Amplifier') },
  { id: 'passive', label: loc('无源器件（滤波器）', 'Passive (filter)') },
]

export const S = {
  kickerNow: loc('这一条增益曲线', 'This gain curve'),
  introTitle: loc('增益、插损与频率响应', 'Gain, insertion loss and frequency response'),
  coreTitle: loc('拨一拨：器件、Q 与工作带宽', 'Try it: device, Q and operating band'),
  coreNote: loc(
    '频率响应用二阶带通做教学模型（不对应真实器件）：中心频率 f0 增益最高，离开 f0 衰减加快。金色带是工作带宽，平坦度只在它里面算；虚线是峰值下降 3 dB 的位置。',
    'The frequency response uses a second-order band-pass as a teaching model (not a real device): gain peaks at f0 and falls faster away from it. The gold band is the operating band where flatness is measured; the dashed line is 3 dB below the peak.',
  ),
  deviceLabel: loc('器件', 'Device'),
  f0Label: loc('中心频率 f0 (GHz)', 'Centre frequency f0 (GHz)'),
  qLabel: loc('品质因数 Q', 'Quality factor Q'),
  bandLabel: loc('工作带宽 W (GHz)', 'Operating bandwidth W (GHz)'),
  rGain: loc('中心增益 G0', 'Centre gain G0'),
  rIl: loc('插入损耗 IL = −G0', 'Insertion loss IL = −G0'),
  rPeakF: loc('峰值频率', 'Peak frequency'),
  rBw: loc('3 dB 带宽（区间）', '3 dB bandwidth (range)'),
  rFlat: loc('工作带宽内平坦度（峰峰）', 'Flatness in band (peak-to-peak)'),
  rVerdict: loc('判定（平坦度 ≤ 1 dB）', 'Verdict (flatness ≤ 1 dB)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  outRange: loc('超出扫描范围', 'Outside the sweep range'),
  asideLater: loc(
    '真实器件的增益曲线通常用网络分析仪测 S21，还要看相位与群时延；这里只用一个教学模型看增益、插损、3 dB 带宽和平坦度四件事。',
    'Real gain curves are usually measured as S21 on a network analyser, and phase and group delay matter too; here a teaching model covers only gain, insertion loss, 3 dB bandwidth and flatness.',
  ),
  next: loc('下一课：输出功率与 P1dB', 'Next: Output Power and P1dB'),
  task1: loc('切到无源器件，读出插入损耗（IL 为正数）。', 'Switch to the passive device and read the insertion loss (IL is a positive number).'),
  task2: loc('把 3 dB 带宽收窄到 1.2 GHz 以下（BW ≈ f0 ÷ Q）。', 'Narrow the 3 dB bandwidth below 1.2 GHz (BW ≈ f0 ÷ Q).'),
  task3: loc('把工作带宽拉宽，让平坦度超过 1 dB（FAIL）。', 'Widen the operating band until the flatness goes above 1 dB (FAIL).'),
  task4: loc(
    '把工作带宽拉到 2 GHz 以上，同时平坦度通过（PASS）。提示：工作带宽占 f0 的比例越小，带内越平。',
    'Widen the operating band to 2 GHz or more and still pass the flatness limit (PASS). Hint: the smaller the band is as a share of f0, the flatter it is.',
  ),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
}

export const FIG = {
  aria: loc(
    '增益曲线：对数频率轴上的带通响应，金色带为工作带宽，虚线为峰值下降 3 dB，红点为 3 dB 带宽两端',
    'Gain curve: band-pass response on a log frequency axis; the gold band is the operating band, the dashed line is 3 dB below the peak, and red dots mark the 3 dB band edges',
  ),
  cap: loc(
    '蓝线是扫频得到的增益曲线（对数频率轴，0.1–20 GHz）。红点是 3 dB 带宽的两端，金色虚线是峰值下降 3 dB 的位置，金色带是工作带宽。',
    'The blue curve is the swept gain (log frequency axis, 0.1–20 GHz). Red dots are the 3 dB band edges, the gold dashed line is 3 dB below the peak, and the gold band is the operating band.',
  ),
}

export const INTRO = [
  loc(
    '放大器和滤波器都可以用一条增益曲线来描述：横轴是频率，纵轴是输出与输入功率之比（dB）。{@rfDb} 讲过，dB 相加就是级联的总增益；这一课看的是增益怎样随频率变化。',
    'An amplifier or a filter can both be described by a gain curve: frequency on the horizontal axis and the output-to-input power ratio in dB on the vertical axis. As {@rfDb} showed, dB values add along a cascade; this lesson looks at how the gain changes with frequency.',
  ),
  loc(
    '这一课只练三件事：扫频画出增益曲线；找出峰值下降 3 dB 的两个频率，得到 3 dB 带宽；在工作带宽内算出平坦度，也就是最大增益减最小增益。无源器件没有增益，只有插入损耗 IL = −增益，而且它也随频率变化。',
    'This lesson practises three things: sweep the frequency to draw the gain curve; find the two frequencies 3 dB below the peak to get the 3 dB bandwidth; and compute the flatness inside the operating band, the maximum gain minus the minimum gain. A passive device has no gain, only an insertion loss IL = −gain, and that loss also varies with frequency.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '增益越高越好，带宽可以不管。带宽决定哪些频率能通过；带宽外增益下降，宽带信号的高频成分被削弱，调制和眼图都会变形。',
    'Higher gain is always better, so bandwidth can be ignored. Bandwidth decides which frequencies get through; outside it the gain falls and the high-frequency parts of a wideband signal are attenuated, distorting modulation and the eye.',
  ),
  loc(
    '3 dB 带宽就是平坦度。3 dB 带宽是峰值下降 3 dB 的两个频率之间的宽度；平坦度是工作带宽内的峰峰值。两者不是同一个量。',
    '3 dB bandwidth is the same as flatness. The 3 dB bandwidth is the span between the two points 3 dB below the peak; flatness is the peak-to-peak gain inside the operating band. They are different quantities.',
  ),
  loc(
    '无源器件的插损是一个固定的数，不随频率变。滤波器的插损正是随频率变化的，插损曲线决定了哪些频率能通过。',
    'Passive insertion loss is one fixed number that does not change with frequency. A filter’s insertion loss is exactly what varies with frequency; that loss curve decides which frequencies pass.',
  ),
]

export const TAKEAWAY: LText = loc(
  '增益曲线 = 中心增益 + 随频率变化的衰减。3 dB 带宽是峰值下降 3 dB 的两个频率之间的宽度（二阶带通近似为 f0 ÷ Q）；平坦度是工作带宽内最大增益减最小增益。无源器件只有插损，IL = −增益。',
  'Gain curve = centre gain + a frequency-dependent roll-off. The 3 dB bandwidth is the span between the two points 3 dB below the peak (approximately f0 ÷ Q for a second-order band-pass); flatness is the maximum minus the minimum gain in the operating band. A passive device only has insertion loss, IL = −gain.',
)

/** 小测题干里的数字由模型算出，与页面的换算保持一致 */
const IL_PASSIVE = -CENTRE_DB.passive
const F0_Q2 = 4
const Q_Q2 = 2
const BW_Q2 = F0_Q2 / Q_Q2
const FLAT_Q5 = analyseGain({ device: 'amp', f0: 4, q: 1.5, band: 1 }).flatPp

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '一个无源滤波器的中心插入损耗是 2.5 dB，它的中心增益是多少？',
      'A passive filter has a centre insertion loss of 2.5 dB. What is its centre gain?',
    ),
    options: [
      { id: 'a', text: loc('+2.5 dB', '+2.5 dB') },
      { id: 'b', text: loc(`−${f1(IL_PASSIVE)} dB`, `−${f1(IL_PASSIVE)} dB`) },
      { id: 'c', text: loc('0 dB', '0 dB') },
    ],
    answer: 'b',
    explain: loc(
      `插入损耗 IL = −增益，所以增益 = −${f1(IL_PASSIVE)} dB。无源器件不能放大，增益不会为正。`,
      `IL = −gain, so the gain is −${f1(IL_PASSIVE)} dB. A passive device cannot amplify, so its gain is never positive.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      `中心频率 f0 = ${F0_Q2} GHz，二阶带通的品质因数 Q = ${Q_Q2}。3 dB 带宽约是多少？`,
      `The centre frequency is f0 = ${F0_Q2} GHz and the second-order band-pass has Q = ${Q_Q2}. About how wide is the 3 dB bandwidth?`,
    ),
    options: [
      { id: 'a', text: loc(`${F0_Q2 * Q_Q2} GHz`, `${F0_Q2 * Q_Q2} GHz`) },
      { id: 'b', text: loc(`${F0_Q2 / (2 * Q_Q2)} GHz`, `${F0_Q2 / (2 * Q_Q2)} GHz`) },
      { id: 'c', text: loc(`${BW_Q2} GHz`, `${BW_Q2} GHz`) },
    ],
    answer: 'c',
    explain: loc(
      `3 dB 带宽 ≈ f0 ÷ Q = ${F0_Q2} ÷ ${Q_Q2} = ${BW_Q2} GHz。Q 越高，带宽越窄，曲线越尖；数值扫描的结果与 f0 ÷ Q 一致。`,
      `The 3 dB bandwidth ≈ f0 ÷ Q = ${F0_Q2} ÷ ${Q_Q2} = ${BW_Q2} GHz. A higher Q gives a narrower, sharper curve; the swept result agrees with f0 ÷ Q.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('增益平坦度指的是什么？', 'What does gain flatness mean?'),
    options: [
      { id: 'a', text: loc('工作带宽内增益的最大值减最小值（峰峰 dB）', 'Maximum minus minimum gain inside the operating band (peak-to-peak dB)') },
      { id: 'b', text: loc('峰值增益本身', 'The peak gain itself') },
      { id: 'c', text: loc('3 dB 带宽的宽度', 'The width of the 3 dB bandwidth') },
    ],
    answer: 'a',
    explain: loc(
      '平坦度量的是带内起伏，与增益大小无关：增益 12 dB 的放大器，只要带内起伏小，也算平坦。3 dB 带宽量的是峰值下降 3 dB 的边界，是另一回事。',
      'Flatness measures the ripple inside the band, not the gain level: a 12 dB amplifier is flat if its in-band variation is small. The 3 dB bandwidth marks the points 3 dB below the peak, which is a different measure.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('扫频测 3 dB 带宽时，判断“下降 3 dB”应该以什么为参考电平？', 'When measuring the 3 dB bandwidth by sweeping, what reference level is used to judge a 3 dB drop?'),
    options: [
      { id: 'a', text: loc('0 dB（绝对值）', '0 dB (absolute)') },
      { id: 'b', text: loc('曲线的峰值', 'The peak of the curve') },
      { id: 'c', text: loc('工作带宽内的平均增益', 'The average gain inside the operating band') },
    ],
    answer: 'b',
    explain: loc(
      '3 dB 带宽定义为相对峰值下降 3 dB 的频率区间。无源器件的峰值可能低于 0 dB（例如 −2.5 dB），若用 0 dB 作参考，边界位置就会错。',
      'The 3 dB bandwidth is defined relative to the peak: the band where the gain is 3 dB below it. A passive device peaks below 0 dB (for example −2.5 dB), so using 0 dB as the reference would put the edges in the wrong place.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('中心频率 4 GHz、Q = 1.5，工作带宽 W = 1 GHz 时，带内平坦度约为多少？', 'With centre frequency 4 GHz, Q = 1.5 and an operating band W = 1 GHz, about how flat is the band?'),
    options: [
      { id: 'a', text: loc('0.0 dB', '0.0 dB') },
      { id: 'b', text: loc(`${f1(FLAT_Q5)} dB`, `${f1(FLAT_Q5)} dB`) },
      { id: 'c', text: loc('3.0 dB', '3.0 dB') },
    ],
    answer: 'b',
    explain: loc(
      `工作带宽 3.5–4.5 GHz 内，最低的点在两端，峰峰值约 ${f1(FLAT_Q5)} dB。3.0 dB 是 3 dB 带宽的标称值，不是平坦度。`,
      `Inside the 3.5–4.5 GHz band the lowest points are at the edges, giving a peak-to-peak of about ${f1(FLAT_Q5)} dB. The 3.0 dB figure is the nominal 3 dB level, not a flatness.`,
    ),
  },
]

/** 三张（四张）任务卡：完成与否由当前设置和扫频结果算出 */
export function taskItems(state: GainState, a: GainAnalysis): TaskItem[] {
  return [
    { id: 'passive', text: S.task1, done: state.device === 'passive' },
    { id: 'bw', text: S.task2, done: a.bw3 !== null && a.bw3 < 1.2 },
    { id: 'fail', text: S.task3, done: a.flatPp > FLAT_LIMIT_DB },
    { id: 'wide', text: S.task4, done: state.band >= 2 && a.pass },
  ]
}

/** 右侧说明栏：结论 + 原因（平坦度由工作带宽两端决定） */
export function verdictOf(a: GainAnalysis): { title: LText; text: LText; note: LText | null } {
  const lo = f2(a.bandLow)
  const hi = f2(a.bandHigh)
  const pp = f2(a.flatPp)
  const limit = f1(FLAT_LIMIT_DB)
  if (a.pass) {
    return {
      title: S.pass,
      text: loc(
        `工作带宽 ${lo}–${hi} GHz 内，增益最大值减最小值为 ${pp} dB，不超过限值 ${limit} dB。`,
        `Inside the operating band ${lo}–${hi} GHz the gain varies by ${pp} dB peak-to-peak, within the ${limit} dB limit.`,
      ),
      note: loc(
        '带内最低的点在带宽两端，因为离 f0 越远衰减越多。工作带宽越窄，两端越靠近 f0，平坦度越好。',
        'The lowest in-band points are at the band edges, because attenuation grows the further you move from f0. A narrower operating band keeps the edges close to f0, so it is flatter.',
      ),
    }
  }
  return {
    title: S.fail,
    text: loc(
      `工作带宽 ${lo}–${hi} GHz 内增益峰峰差 ${pp} dB，超过限值 ${limit} dB。`,
      `Inside the operating band ${lo}–${hi} GHz the gain varies by ${pp} dB peak-to-peak, above the ${limit} dB limit.`,
    ),
    note: loc(
      '原因在 Q 和带宽：Q 越高，曲线越尖，离开 f0 后下降越快；降低 Q，或者收窄工作带宽，都能让带内更平。',
      'The cause is Q and the band width: a higher Q gives a sharper curve that falls faster away from f0. Lowering Q, or narrowing the operating band, makes the band flatter.',
    ),
  }
}

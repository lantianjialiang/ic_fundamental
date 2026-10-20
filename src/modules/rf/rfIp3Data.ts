import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  F1_DEFAULT,
  F2_DEFAULT,
  GAIN_DB,
  IIP3_DEFAULT,
  IIP3_TOL_DB,
  type Ip3Analysis,
  type Ip3State,
} from './rfIp3Model'

const fmt1 = (value: number) => value.toFixed(1)
const fmt2 = (value: number) => value.toFixed(2)

export const S = {
  kickerNow: loc('这一次双音测试', 'This two-tone test'),
  introTitle: loc('双音测试：交调失真与 IIP3 / OIP3', 'Two-tone test: intermodulation and IIP3 / OIP3'),
  coreTitle: loc('拨一拨：两音频率、输入功率与器件 IIP3', 'Try it: tone frequencies, input power and device IIP3'),
  coreNote: loc(
    '两个音 f1、f2 同时加入器件，非线性在 2f1−f2 与 2f2−f1 处产生三阶交调（IM3）。下图是仿真得到的输出频谱，蓝点是基波，红点是 IM3。',
    'Two tones f1 and f2 enter the device together, and the nonlinearity creates third-order intermodulation (IM3) at 2f1−f2 and 2f2−f1. The spectrum below is the simulated output: blue dots are the fundamentals, red dots are the IM3 products.',
  ),
  f1Label: loc('音 f1 频率 (MHz)', 'Tone f1 frequency (MHz)'),
  f2Label: loc('音 f2 频率 (MHz)', 'Tone f2 frequency (MHz)'),
  pinLabel: loc('每音输入功率 Pin (dBm)', 'Input power per tone Pin (dBm)'),
  iip3Label: loc('器件 IIP3 设定 (dBm)', 'Device IIP3 setting (dBm)'),
  rGain: loc('测得增益（基波输出 − Pin）', 'Measured gain (fundamental out − Pin)'),
  rPout: loc('每音输出功率 Pout', 'Output power per tone Pout'),
  rDelta: loc('ΔIM3（基波 − IM3，较差一侧）', 'ΔIM3 (fundamental − IM3, worse side)'),
  rIip3: loc('读出的 IIP3 = Pin + ΔIM3/2', 'Read IIP3 = Pin + ΔIM3/2'),
  rOip3: loc('读出的 OIP3 = Pout + ΔIM3/2', 'Read OIP3 = Pout + ΔIM3/2'),
  rVerdict: loc('判定（读出的 IIP3 与设定相差 ≤ 0.5 dB）', 'Verdict (read IIP3 within 0.5 dB of the setting)'),
  setTag: loc('设定', 'set'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  clashShort: loc('谱线重叠', 'Lines overlap'),
  lgF1: loc('基波 f1', 'Fundamental f1'),
  lgF2: loc('基波 f2', 'Fundamental f2'),
  lgIm: loc('IM3（2f1−f2、2f2−f1）', 'IM3 (2f1−f2, 2f2−f1)'),
  clashTitle: loc('读数不可靠', 'Reading not reliable'),
  clashText: loc(
    '两音的某个谐波或 IM3 与另一根谱线落在同一根谱线上（例如 f1 = 2·f2 时，2f1−f2 = 3f2），谱线混在一起，无法分开读。',
    'A harmonic or an IM3 product lands on the same spectral line as another component (for example when f1 = 2·f2, then 2f1−f2 = 3f2), so the lines merge and cannot be read separately.',
  ),
  clashNote: loc('请把 f1 与 f2 换成互不成整数倍、彼此不重合的频率。', 'Choose f1 and f2 that are not integer multiples of each other and whose products do not coincide.'),
  asideLater: loc(
    '真实测试还要考虑两音的功率平衡、噪声底、调制信号的邻道泄漏（ACPR）等；这里只用理想两音和一个三次多项式模型。',
    'Real tests also consider tone power balance, the noise floor and adjacent-channel leakage (ACPR) of modulated signals; here an ideal two-tone and a cubic polynomial model are used.',
  ),
  next: loc('下一课：噪声系数', 'Next: Noise Figure'),
  task1: loc('把两音间隔拉到 20 MHz 以上，并且谱线不重叠。', 'Widen the tone spacing to 20 MHz or more, with no overlapping lines.'),
  task2: loc('把 Pin 降到 −25 dBm 以下，让 ΔIM3 超过 60 dB（IM3 远低于基波）。', 'Lower Pin below −25 dBm so that ΔIM3 exceeds 60 dB (IM3 far below the fundamental).'),
  task3: loc('把器件 IIP3 设到 15 dBm 以上，并且读出的 IIP3 与设定相差 ≤ 0.5 dB（PASS）。', 'Set the device IIP3 to 15 dBm or more, with the read IIP3 within 0.5 dB of the setting (PASS).'),
  task4: loc(
    '把 Pin 推到离 IIP3 不到 10 dB 的地方，让读出的 IIP3 偏离设定超过 0.5 dB（FAIL）。',
    'Push Pin to within 10 dB of IIP3 so that the read IIP3 deviates from the setting by more than 0.5 dB (FAIL).',
  ),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
}

export const FIG = {
  aria: loc(
    '双音输出频谱：横轴 0–512 MHz，纵轴为 dBm，蓝点为两个基波，红点为两侧三阶交调 IM3',
    'Two-tone output spectrum: frequency 0–512 MHz on the horizontal axis, power in dBm on the vertical axis; blue dots are the two fundamentals and red dots are the two IM3 products',
  ),
  cap: loc(
    '仿真的输出频谱（1 MHz 谱线间隔，无噪声）。IM3 比基波低的分贝数就是 ΔIM3；它随输入增大而减小。',
    'Simulated output spectrum (1 MHz line spacing, no noise). The number of dB by which IM3 sits below the fundamental is ΔIM3; it shrinks as the input rises.',
  ),
}

export const INTRO = [
  loc(
    '{@rfP1db} 讲的是单音下的压缩：输出饱和，增益下降。信号里有两个相邻频率时，非线性还会产生新的频率分量，它们落在有用信号旁边，滤波器很难去掉，这就是交调失真（IMD）。',
    '{@rfP1db} covered compression with a single tone: the output saturates and the gain falls. With two nearby frequencies at the input, the nonlinearity also creates new frequency components beside the wanted signals, which a filter struggles to remove; this is intermodulation distortion (IMD).',
  ),
  loc(
    '三阶交调（IM3）是最麻烦的一种：它落在 2f1−f2 与 2f2−f1，离基波只差一个两音间隔；它随输入增长的速度是基波的三倍（每 dB 3 dB）。IIP3 与 OIP3 把这条关系外推到一个假想的交点，用来比较两台器件的线性度。',
    'Third-order intermodulation (IM3) is the most troublesome: it lands at 2f1−f2 and 2f2−f1, only one tone spacing away from the fundamentals, and it grows three times as fast as the fundamental (3 dB per dB of input). IIP3 and OIP3 extrapolate this relation to an imaginary intercept, which is used to compare the linearity of two devices.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'IIP3 是器件能承受的最大输入功率。IIP3 是外推出来的假想交点，真实器件在远低于它的输入时就已经压缩了。它是线性度指标，不是功率上限。',
    'IIP3 is the largest input the device can take. IIP3 is an extrapolated, imaginary intercept; a real device has already compressed well below it. It is a linearity figure, not a power limit.',
  ),
  loc(
    '只要看到 IM3 就够了。IM3 要和基波比（ΔIM3）才有意义；单看 IM3 的绝对功率，无法比较增益不同的两台器件。',
    'Seeing the IM3 is enough. IM3 only means something relative to the fundamental (ΔIM3); on its own, its absolute power cannot compare two devices with different gains.',
  ),
  loc(
    '两音频率随便选，只要不一样就行。两音成整数倍或谐波与 IM3 重合时，谱线混在一起，读数不可靠。',
    'Any two different tone frequencies will do. If the tones are integer multiples of each other, or a harmonic and an IM3 coincide, the lines merge and the reading is unreliable.',
  ),
]

export const TAKEAWAY: LText = loc(
  'IM3 出现在 2f1−f2 与 2f2−f1；Pin 每升 1 dB，基波升 1 dB、IM3 升 3 dB，所以 ΔIM3 每升 1 dB 减少 2 dB。IIP3 = Pin + ΔIM3/2，OIP3 = Pout + ΔIM3/2（假设小信号外推），小信号时 OIP3 = IIP3 + 增益。回退要足够大（约 15 dB 以上），读出的 IIP3 才可靠。',
  'IM3 appears at 2f1−f2 and 2f2−f1; as Pin rises 1 dB the fundamental rises 1 dB and IM3 rises 3 dB, so ΔIM3 shrinks by 2 dB per dB of input. IIP3 = Pin + ΔIM3/2 and OIP3 = Pout + ΔIM3/2 (assuming small-signal extrapolation), and at small signal OIP3 = IIP3 + gain. The backoff must be large, about 15 dB or more, before the read IIP3 can be trusted.',
)

/** 小测题干里的数字由模型常量算出，与页面的换算保持一致 */
const IM_LOW = 2 * F1_DEFAULT - F2_DEFAULT
const IM_HIGH = 2 * F2_DEFAULT - F1_DEFAULT
const OIP3_SMALL = IIP3_DEFAULT + GAIN_DB
const PIN_EX = -15
const DIM3_EX = 40
const IIP3_EX = PIN_EX + DIM3_EX / 2

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `两音 f1 = ${F1_DEFAULT} MHz、f2 = ${F2_DEFAULT} MHz，三阶交调 IM3 出现在哪两个频率？`,
      `The two tones are f1 = ${F1_DEFAULT} MHz and f2 = ${F2_DEFAULT} MHz. At which two frequencies does the third-order IM3 appear?`,
    ),
    options: [
      { id: 'a', text: loc(`${IM_LOW} MHz 与 ${IM_HIGH} MHz`, `${IM_LOW} MHz and ${IM_HIGH} MHz`) },
      { id: 'b', text: loc(`${F1_DEFAULT + F2_DEFAULT} MHz 与 ${F2_DEFAULT - F1_DEFAULT} MHz`, `${F1_DEFAULT + F2_DEFAULT} MHz and ${F2_DEFAULT - F1_DEFAULT} MHz`) },
      { id: 'c', text: loc(`${2 * F1_DEFAULT} MHz 与 ${2 * F2_DEFAULT} MHz`, `${2 * F1_DEFAULT} MHz and ${2 * F2_DEFAULT} MHz`) },
    ],
    answer: 'a',
    explain: loc(
      `三阶交调在 2f1−f2 = ${IM_LOW} MHz 与 2f2−f1 = ${IM_HIGH} MHz。和与差（f1+f2、f2−f1）是二阶项，2f1、2f2 是二次谐波，都不是 IM3。`,
      `Third-order IM3 appears at 2f1−f2 = ${IM_LOW} MHz and 2f2−f1 = ${IM_HIGH} MHz. The sum and difference (f1+f2, f2−f1) are second-order products, and 2f1, 2f2 are second harmonics; none of these is IM3.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      `器件 IIP3 = ${IIP3_DEFAULT} dBm，小信号增益 ${GAIN_DB} dB，小信号时 OIP3 是多少？`,
      `The device has IIP3 = ${IIP3_DEFAULT} dBm and small-signal gain ${GAIN_DB} dB. What is its small-signal OIP3?`,
    ),
    options: [
      { id: 'a', text: loc(`${OIP3_SMALL} dBm`, `${OIP3_SMALL} dBm`) },
      { id: 'b', text: loc(`${IIP3_DEFAULT} dBm`, `${IIP3_DEFAULT} dBm`) },
      { id: 'c', text: loc(`${GAIN_DB} dBm`, `${GAIN_DB} dBm`) },
    ],
    answer: 'a',
    explain: loc(
      `小信号时 OIP3 = IIP3 + 增益 = ${IIP3_DEFAULT} + ${GAIN_DB} = ${OIP3_SMALL} dBm。线性段里，输出的截点就是输入截点再加上增益。`,
      `At small signal OIP3 = IIP3 + gain = ${IIP3_DEFAULT} + ${GAIN_DB} = ${OIP3_SMALL} dBm. In the linear region the output intercept is the input intercept plus the gain.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('输入每增加 1 dB，基波输出增加 1 dB，IM3 的输出增加多少 dB？', 'When the input rises by 1 dB, the fundamental output rises 1 dB. By how many dB does the IM3 output rise?'),
    options: [
      { id: 'a', text: loc('1 dB', '1 dB') },
      { id: 'b', text: loc('2 dB', '2 dB') },
      { id: 'c', text: loc('3 dB', '3 dB') },
    ],
    answer: 'c',
    explain: loc(
      'IM3 由三次项产生，输入每增 1 dB，三次项的输出增加 3 dB；基波是一次项，只增加 1 dB。因此 ΔIM3 每增加输入 1 dB 减少 2 dB。',
      'IM3 comes from the cubic term, so its output rises 3 dB for every 1 dB of input; the fundamental comes from the linear term and rises only 1 dB. So ΔIM3 shrinks by 2 dB per dB of input.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `每音输入 Pin = ${PIN_EX} dBm，测得 ΔIM3 = ${DIM3_EX} dB，读出的 IIP3 是多少？`,
      `Each tone is at Pin = ${PIN_EX} dBm and the measured ΔIM3 = ${DIM3_EX} dB. What IIP3 is read?`,
    ),
    options: [
      { id: 'a', text: loc(`${PIN_EX - DIM3_EX / 2} dBm`, `${PIN_EX - DIM3_EX / 2} dBm`) },
      { id: 'b', text: loc(`${IIP3_EX} dBm`, `${IIP3_EX} dBm`) },
      { id: 'c', text: loc(`${PIN_EX + DIM3_EX} dBm`, `${PIN_EX + DIM3_EX} dBm`) },
    ],
    answer: 'b',
    explain: loc(
      `IIP3 = Pin + ΔIM3/2 = ${PIN_EX} + ${DIM3_EX}/2 = ${IIP3_EX} dBm。ΔIM3/2 要加上，不是减去：IM3 越低，IIP3 越高。`,
      `IIP3 = Pin + ΔIM3/2 = ${PIN_EX} + ${DIM3_EX}/2 = ${IIP3_EX} dBm. ΔIM3/2 is added, not subtracted: the lower the IM3, the higher the IIP3.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('如果把两音设成 f1 = 2·f2（例如 f2 = 60 MHz，f1 = 120 MHz），会发生什么？', 'What happens if the tones are set to f1 = 2·f2 (for example f2 = 60 MHz and f1 = 120 MHz)?'),
    options: [
      { id: 'a', text: loc('2f1−f2 = 3f2 与 f2 的三次谐波落在同一根谱线上，读数混在一起', 'The IM3 at 2f1−f2 = 3f2 lands on the third harmonic of f2, so the readings merge') },
      { id: 'b', text: loc('IM3 完全消失，读不到任何交调', 'The IM3 disappears completely; no intermodulation can be read') },
      { id: 'c', text: loc('基波增益变成两倍', 'The fundamental gain doubles') },
    ],
    answer: 'a',
    explain: loc(
      '当 f1 = 2·f2 时，2f1−f2 = 3f2，正好是 f2 的三次谐波频率。两者在同一根谱线上，无法分开。选用互不成整数倍的两音可以避免。',
      'When f1 = 2·f2, 2f1−f2 = 3f2, exactly the third-harmonic frequency of f2. The two land on the same spectral line and cannot be separated. Choosing two tones that are not integer multiples avoids this.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('测 IIP3 时，为什么要让 Pin 比 IIP3 低 15 dB 左右？', 'Why should Pin be about 15 dB below IIP3 when measuring IIP3?'),
    options: [
      { id: 'a', text: loc('为了让 IM3 大到能看见', 'So that the IM3 is large enough to see') },
      { id: 'b', text: loc('为了避免基波被压缩，让外推的斜率关系成立', 'To avoid compressing the fundamental, so that the extrapolation slopes hold') },
      { id: 'c', text: loc('为了让 OIP3 等于 IIP3', 'So that OIP3 equals IIP3') },
    ],
    answer: 'b',
    explain: loc(
      '外推假设基波斜率为 1。回退不够时，基波的增益已经开始下降，斜率偏离 1，读出的 IIP3 就会偏低。回退足够大，压缩项小到可以忽略。',
      'The extrapolation assumes the fundamental slope is 1. With too little backoff the fundamental gain has already started to fall, so the slope departs from 1 and the read IIP3 comes out low. With enough backoff the compression term is negligible.',
    ),
  },
]

/** 四张任务卡：完成与否由当前设置和仿真结果算出 */
export function taskItems(state: Ip3State, a: Ip3Analysis): TaskItem[] {
  return [
    { id: 'sep', text: S.task1, done: !a.clash && Math.abs(state.f1 - state.f2) >= 20 },
    { id: 'low', text: S.task2, done: !a.clash && state.pin <= -25 && a.dIm3 >= 60 },
    { id: 'hi', text: S.task3, done: state.iip3 >= 15 && a.pass },
    { id: 'close', text: S.task4, done: !a.clash && Math.abs(a.err) > IIP3_TOL_DB && a.backoffDb < 10 },
  ]
}

/** 右侧说明栏：结论 + 原因 */
export function verdictOf(state: Ip3State, a: Ip3Analysis): { title: LText; text: LText; note: LText } {
  if (a.clash) {
    return { title: S.clashTitle, text: S.clashText, note: S.clashNote }
  }
  const backoff = a.backoffDb.toFixed(0)
  const errAbs = Math.abs(a.err).toFixed(2)
  if (a.pass) {
    return {
      title: S.pass,
      text: loc(
        `读出的 IIP3 为 ${fmt2(a.iip3Read)} dBm，设定为 ${fmt1(state.iip3)} dBm，相差 ${errAbs} dB，在 ±${fmt1(IIP3_TOL_DB)} dB 之内。`,
        `The IIP3 read back is ${fmt2(a.iip3Read)} dBm against a setting of ${fmt1(state.iip3)} dBm, a difference of ${errAbs} dB, within ±${fmt1(IIP3_TOL_DB)} dB.`,
      ),
      note: loc(
        `此时回退 ${backoff} dB，基波仍在线性区，ΔIM3 随 Pin 的变化符合斜率 1 与 3，外推可靠。`,
        `Backoff here is ${backoff} dB, the fundamental is still linear, and ΔIM3 changes with Pin at the expected slopes, so the extrapolation is reliable.`,
      ),
    }
  }
  return {
    title: S.fail,
    text: loc(
      `读出的 IIP3 与设定相差 ${errAbs} dB，超过 ±${fmt1(IIP3_TOL_DB)} dB。`,
      `The IIP3 read back differs from the setting by ${errAbs} dB, beyond ±${fmt1(IIP3_TOL_DB)} dB.`,
    ),
    note: loc(
      `此时回退只有 ${backoff} dB，基波已经被压缩，ΔIM3 不再按斜率 2 变化，外推偏低。要读准 IIP3，回退要在 15 dB 以上。`,
      `Backoff is only ${backoff} dB here, so the fundamental is already compressed and ΔIM3 no longer follows the expected slope; the extrapolation reads low. For an accurate IIP3, back off by 15 dB or more.`,
    ),
  }
}

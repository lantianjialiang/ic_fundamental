import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { sensorSample, twoPoint } from './core/sensor'
import {
  COMP_IDS,
  MARK_IDS,
  STIMULUS_IDS,
  overviewFlags,
  type CompId,
  type MarkId,
  type OverviewAnalysis,
  type OverviewState,
  type StimulusId,
} from './snsOverviewModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

function join(parts: LText[]): LText {
  return {
    zh: parts.map((part) => part.zh).join(''),
    en: parts.map((part) => part.en ?? part.zh).join(''),
  }
}

const f2 = (value: number) => value.toFixed(2)
const f3 = (value: number) => value.toFixed(3)
const f4 = (value: number) => value.toFixed(4)

const MARK_LABEL: Record<MarkId, LText> = {
  physical: loc('物理激励', 'Physical stimulus'),
  electrical: loc('只用电激励', 'Electrical only'),
}

const COMP_LABEL: Record<CompId, LText> = {
  off: loc('不补偿', 'No compensation'),
  on: loc('补偿到 25 C', 'Compensate to 25 C'),
}

export const MARK_OPTIONS = MARK_IDS.map((id) => ({ id, label: MARK_LABEL[id] }))
export const COMP_OPTIONS = COMP_IDS.map((id) => ({ id, label: COMP_LABEL[id] }))

const COPY: Record<StimulusId, { title: LText; verdictTitle: LText; reason: LText }> = {
  flat: {
    title: loc('平场光', 'Flat-field light'),
    verdictTitle: loc('平场光要物理激励', 'Flat-field light needs a physical stimulus'),
    reason: loc(
      '原因：像面必须被均匀光照到，片内电路产生不了这片光，所以这项要物理激励。',
      'Reason: the image plane has to be lit evenly, and on-chip circuits cannot make that light, so this item needs a physical stimulus. ',
    ),
  },
  shaker: {
    title: loc('振动台', 'Shaker'),
    verdictTitle: loc('振动台要物理激励', 'A shaker needs a physical stimulus'),
    reason: loc(
      '原因：加速度来自运动或重力，振动台把真实的力加到质量块上，所以这项要物理激励。',
      'Reason: acceleration comes from motion or gravity, and a shaker puts a real force on the proof mass, so this item needs a physical stimulus. ',
    ),
  },
  pressure: {
    title: loc('压力', 'Pressure'),
    verdictTitle: loc('压力要物理激励', 'Pressure needs a physical stimulus'),
    reason: loc(
      '原因：压力要作用在膜片上，读寄存器读不到真实压力，所以这项要物理激励。',
      'Reason: pressure has to act on the diaphragm, and a register read does not apply a real pressure, so this item needs a physical stimulus. ',
    ),
  },
  chamber: {
    title: loc('温箱', 'Temperature chamber'),
    verdictTitle: loc('温箱要物理激励', 'A temperature chamber needs a physical stimulus'),
    reason: loc(
      '原因：温漂要在真实温度下测，芯片自报的温度代替不了温箱，所以这项要物理激励。',
      'Reason: drift has to be measured at a real temperature, and a value the chip reports cannot replace the chamber, so this item needs a physical stimulus. ',
    ),
  },
  cont: {
    title: loc('连续性', 'Continuity'),
    verdictTitle: loc('连续性只用电激励', 'Continuity is electrical only'),
    reason: loc(
      '原因：连续性看引脚是否接通，加电流量电压即可，不需要光、力或温度，所以这项只用电激励。',
      'Reason: continuity checks that a pin is connected by forcing current and measuring voltage, with no light, force, or temperature, so this item is electrical only. ',
    ),
  },
  idd: {
    title: loc('电源电流 IDD', 'IDD'),
    verdictTitle: loc('IDD 只用电激励', 'IDD is electrical only'),
    reason: loc(
      '原因：电源电流是电参数，上电后量电流即可，不需要把物理量加到敏感元件上，所以这项只用电激励。',
      'Reason: supply current is an electrical parameter measured after power-up, with nothing physical applied to the sensing element, so this item is electrical only. ',
    ),
  },
  reg: {
    title: loc('读寄存器', 'Register read'),
    verdictTitle: loc('读寄存器只用电激励', 'A register read is electrical only'),
    reason: loc(
      '原因：读寄存器只走数字接口，并不把被测量加到敏感元件上，所以这项只用电激励。',
      'Reason: a register read uses only the digital interface and does not apply the measurand to the sensing element, so this item is electrical only. ',
    ),
  },
  bist: {
    title: loc('电自检', 'Electrical self-test'),
    verdictTitle: loc('电自检只用电激励', 'Electrical self-test is electrical only'),
    reason: loc(
      '原因：片内自检用电压或电流模仿激励，本身不施加光、力或压力，所以归在只用电激励；它也覆盖不了全部物理响应。',
      'Reason: on-chip self-test imitates a stimulus with voltage or current and does not apply light, force, or pressure, so it counts as electrical only. It also cannot cover the whole physical response. ',
    ),
  },
}

export const STIMULUS_CARDS = STIMULUS_IDS.map((id) => ({
  id,
  title: COPY[id].title,
  text: COPY[id].reason,
  verdictTitle: COPY[id].verdictTitle,
  reason: COPY[id].reason,
}))

export const S = {
  teach: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  kickerNow: loc('这一项激励', 'This stimulus'),
  introTitle: loc('传感器测什么', 'What a sensor test measures'),
  coreTitle: loc('练一练：传递函数与激励', 'Practice: transfer function and stimulus'),
  coreNote: loc(
    '虚拟器件的输出是 S·x + b + nl·x²，再加温漂和噪声。随机种子固定，同样的旋钮每次结果一样。两点法用 x = 0 和 x = 1；最小二乘用五个点。噪声不为 0 时，两点法斜率的理论标准差按 1/√N 缩小。',
    'The virtual device output is S*x + b + nl*x^2, plus temperature drift and noise. The random seed is fixed, so the same knobs always give the same result. Two-point uses x = 0 and x = 1; least squares uses five points. With noise above 0, the theoretical std of the two-point slope shrinks as 1/sqrt(N).',
  ),
  sLabel: loc('灵敏度 S', 'Sensitivity S'),
  bLabel: loc('偏移 b', 'Offset b'),
  nlLabel: loc('二阶非线性 nl', 'Quadratic nl'),
  noiseLabel: loc('噪声 σ', 'Noise sigma'),
  tcoLabel: loc('温漂系数', 'Tempco'),
  nLabel: loc('平均次数 N', 'Averages N'),
  tempALabel: loc('测量温度', 'Measurement temperature'),
  tempBLabel: loc('第二温度', 'Second temperature'),
  compLabel: loc('温漂补偿', 'Temperature compensation'),
  markLabel: loc('把选中的这项标成', 'Mark the selected item as'),
  rTpS: loc('两点法 S', 'Two-point S'),
  rTpB: loc('两点法 b', 'Two-point b'),
  rLsS: loc('最小二乘 S', 'Least-squares S'),
  rLsB: loc('最小二乘 b', 'Least-squares b'),
  rNl: loc('最大非线性', 'Max nonlinearity'),
  rStd: loc('斜率标准差（理论）', 'Slope std (theory)'),
  rRatio: loc('相对 N=1 的倍数', 'Factor versus N=1'),
  rTco: loc('温漂估计', 'Tempco estimate'),
  curveAria: loc('输入输出曲线：蓝点是测量，金线是最小二乘直线', 'Input-output curve: blue points are measurements, the gold line is the least-squares fit'),
  curveX: loc('输入', 'input'),
  curveY: loc('输出', 'out'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '光电换算、像素读出链和 PTC 在后面的课。这里先把传递函数和“要不要物理激励”分开。',
    'Photon conversion, the pixel readout chain, and the PTC come in later lessons. Here we only separate the transfer function from the question of a physical stimulus.',
  ),
  next: loc('下一课：光电基础：光子、量子效率与噪声', 'Next: Photo basics: photons, quantum efficiency and noise'),
  task1: loc(
    '把噪声 σ 调到 0。非线性为 0 且测量温度是 25 C（或已经补偿）时，两点法的 S 和 b 与旋钮一致。',
    'Set the noise sigma to 0. With nonlinearity at 0 and the measurement temperature at 25 C (or with compensation already on), two-point S and b match the knobs.',
  ),
  task2: loc(
    '把噪声调到大于 0，并把平均次数 N 调到 16 或以上。斜率的理论标准差按 1/√N 缩小，N = 16 时是单次的 1/4。',
    'Set the noise above 0 and the average count N to 16 or more. The theoretical slope std shrinks as 1/sqrt(N), and at N = 16 it is 1/4 of a single sample.',
  ),
  task3: loc(
    '打开温漂补偿，并让两个温度不相同。补偿用两个温度点估计温漂，再把读数折回 25 C。',
    'Turn temperature compensation on and keep the two temperatures different. Compensation estimates the drift from the two temperatures and refers the readings back to 25 C.',
  ),
  task4: loc(
    '选中每一项，按右侧的结论把它标成物理激励或只用电激励。八项都与结论一致才算完成。',
    'Select each item and mark it as a physical stimulus or electrical only, following the conclusion in the side panel. The card is done when all eight match that conclusion.',
  ),
  tail: loc(
    '当前两点法 S = {s}（旋钮 {sk}），b = {b}，噪声 σ = {noise}，N = {n}，斜率标准差是 N = 1 时的 {ratio} 倍（理论值 {std}）。温漂估计 {tco} /C。已标对 {ok}/8。',
    'Two-point S is {s} now (knob {sk}), b is {b}, noise sigma is {noise}, N is {n}, and the slope std is {ratio} times the N = 1 value (theory {std}). Tempco estimate is {tco} per C. {ok}/8 items are marked correctly. ',
  ),
  markedPhys: loc('你现在把它标成物理激励。', 'You currently mark it as a physical stimulus.'),
  markedElec: loc('你现在把它标成只用电激励。', 'You currently mark it as electrical only.'),
  compOn: loc('温漂补偿开着，读数已折回 25 C。', 'Temperature compensation is on, so readings are referred back to 25 C.'),
  compOff: loc('温漂补偿关着，读数仍带测量温度相对 25 C 的偏移。', 'Temperature compensation is off, so readings still include the shift from 25 C.'),
}

export const FIG = {
  curveAria: S.curveAria,
  curveX: S.curveX,
  curveY: S.curveY,
}

export function curveSummary(a: OverviewAnalysis): LText {
  return fill(
    loc(
      '蓝点是五个输入上的平均读数，金线是最小二乘直线。最大非线性 {nl}%，是各点偏离这条直线的最大值占输出跨度的比例；噪声大或 N 小时，随机起伏也会把这个百分数抬高。',
      'Blue points are the averaged readings at five inputs. The gold line is the least-squares fit. Max nonlinearity is {nl} percent: the largest gap from that line, as a fraction of the output span. Large noise or a small N also raises this percent.',
    ),
    { nl: f2(a.maxNlPct) },
  )
}

export const INTRO = [
  loc(
    '传感器先把光、力、压力或温度变成电，再经过模拟前端、ADC 和数字校准。虚拟器件 VDUT-CIS1 后面的图像课用的是同一条链；这一课只用通用模型 out = S·x + b，把偏移、灵敏度、线性度、噪声和温漂分开。',
    'A sensor turns light, force, pressure, or temperature into electricity, then passes it through an analog front end, an ADC, and digital calibration. The later image lessons for the virtual device VDUT-CIS1 use the same chain. This lesson uses only the general model out = S*x + b, and separates offset, sensitivity, linearity, noise, and temperature drift.',
  ),
  loc(
    '难的是激励。平场光、振动台、压力和温箱都要把真实的物理量加到敏感元件上，慢、贵、也不好并行。连续性、IDD、读寄存器和电自检只用电，快，但盖不住全部物理响应。校准把系统误差写成系数放进 OTP（见 {@anaTrim}），去不掉随机噪声。',
    'The hard part is the stimulus. Flat-field light, a shaker, pressure, and a temperature chamber all apply a real physical quantity to the sensing element. That is slow, costly, and hard to run in parallel. Continuity, IDD, a register read, and electrical self-test use electricity only and are fast, but they do not cover the whole physical response. Calibration writes the systematic error into OTP as coefficients (see {@anaTrim}) and does not remove random noise.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '传感器测试只是读一个 ADC。读数要跟施加的物理量对上，才能分出灵敏度和偏移；没有激励，ADC 码本身说明不了传感器好不好。',
    'A sensor test is only an ADC read. The reading has to be paired with the applied physical quantity before sensitivity and offset can be separated. Without a stimulus, the ADC code alone does not say whether the sensor is good.',
  ),
  loc(
    '校准能把噪声消掉。校准改的是偏移、灵敏度和温漂这类系统误差；随机噪声每次不一样，平均可以压低它，写进 OTP 的系数去不掉它。',
    'Calibration removes noise. Calibration changes systematic errors such as offset, sensitivity, and drift. Random noise is different every time. Averaging can reduce it. A coefficient stored in OTP cannot remove it.',
  ),
  loc(
    '片内电自检可以完全代替物理激励。自检覆盖的是电通路的一部分，光、力、压力和真实温度仍然要靠外部激励才能看到。',
    'On-chip electrical self-test can fully replace a physical stimulus. Self-test covers part of the electrical path. Light, force, pressure, and a real temperature still need an external stimulus.',
  ),
]

export const TAKEAWAY: LText = loc(
  '传递函数 out = S·x + b，再加上非线性、噪声和温漂。两点法用两个输入求 S 和 b；噪声下把 N 次平均，斜率标准差按 1/√N 下降。温漂用两个温度估计后再补偿。平场光、振动台、压力、温箱要物理激励；连续性、IDD、读寄存器、电自检只用电。',
  'The transfer is out = S*x + b, plus nonlinearity, noise, and drift. Two-point finds S and b from two inputs. Under noise, averaging N samples shrinks the slope std as 1/sqrt(N). Drift is estimated from two temperatures and then compensated. Flat-field light, a shaker, pressure, and a chamber need a physical stimulus. Continuity, IDD, a register read, and electrical self-test are electrical only.',
)

const TP = twoPoint(0, 0.2, 10, 5.2)
const Y_IDEAL = sensorSample({ s: 2, b: 0.2, nl: 0, noise: 0, tco: 0, x: 1, tempC: 25, rand: () => 0 })
const S_TXT = f2(TP.s)
const S_LO = f2(TP.s * 0.8)
const S_HI = f2(TP.s * 1.2)
const Y_TXT = f2(Y_IDEAL)
const Y_LO = f2(Y_IDEAL - 0.2)
const Y_HI = f2(Y_IDEAL + 0.2)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('一条传感器信号链，按信号走过的顺序，哪一组最完整？', 'Which set is the most complete sensor signal chain, in the order the signal travels?'),
    options: [
      { id: 'a', text: loc('敏感元件、模拟前端、ADC、数字校准', 'Sensing element, analog front end, ADC, digital calibration') },
      { id: 'b', text: loc('只有 ADC 和一颗存储器', 'Only an ADC and a memory') },
      { id: 'c', text: loc('探针卡、插座、机械手', 'Probe card, socket, handler') },
    ],
    answer: 'a',
    explain: loc(
      '被测量先打到敏感元件，变成电以后才进入模拟前端和 ADC，最后用数字校准修系统误差。接触硬件不是这条信号链本身。',
      'The measurand hits the sensing element first and becomes an electrical signal, which then enters the analog front end and the ADC. Digital calibration corrects systematic error last. Contact hardware is not this signal chain.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于 out = S·x + b，下列哪些说法正确？(1) S 是灵敏度，b 是零输入偏移；(2) 校准系数可以去掉随机噪声；(3) 两点法至少要用两个不同的 x；(4) 非线性会让只连两点的斜率偏离真正的 S。',
      'Which statements about out = S*x + b are correct? (1) S is sensitivity and b is the zero-input offset; (2) a calibration coefficient can remove random noise; (3) two-point needs at least two different values of x; (4) nonlinearity makes a slope through only two points differ from the true S.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'b', text: loc('(1)、(3)、(4)', '(1), (3), (4)') },
      { id: 'c', text: loc('(2)、(3)', '(2), (3)') },
    ],
    answer: 'b',
    explain: loc(
      '(1)(3)(4) 是传递函数和两点法的定义。二阶项 nl·x² 会让 x = 0 与 x = 满量程连出的斜率变成 S + nl。(2) 错：校准只修系统误差。',
      '(1), (3), and (4) are the transfer function and the two-point method. A quadratic term nl*x^2 makes the slope between x = 0 and full scale equal S + nl. (2) is wrong: calibration corrects systematic error only.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('两点 (x, y) = (0, 0.2) 和 (10, 5.2)，求出的灵敏度 S 是多少？', 'Two points (x, y) = (0, 0.2) and (10, 5.2). What sensitivity S do they give?'),
    options: [
      { id: 'a', text: loc(S_LO, S_LO) },
      { id: 'b', text: loc(S_TXT, S_TXT) },
      { id: 'c', text: loc(S_HI, S_HI) },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'S = (5.2 − 0.2) / (10 − 0) = {s}，b = 0.2。差一分母就会得到旁边的 {lo} 或 {hi}。',
        'S = (5.2 - 0.2) / (10 - 0) = {s}, and b = 0.2. A slip in the denominator gives the nearby values {lo} or {hi}.',
      ),
      { s: S_TXT, lo: S_LO, hi: S_HI },
    ),
  },
  {
    id: 'q4',
    prompt: loc('噪声不变，把平均次数从 N = 1 提高到 N = 16。斜率估计的标准差大约变成原来的几分之一？', 'Noise stays the same and the average count goes from N = 1 to N = 16. About what fraction of the original value is the slope std?'),
    options: [
      { id: 'a', text: loc('1/2', '1/2') },
      { id: 'b', text: loc('1/8', '1/8') },
      { id: 'c', text: loc('1/4', '1/4') },
    ],
    answer: 'c',
    explain: loc(
      '平均值的标准差按 1/√N 下降。√16 = 4，所以是原来的 1/4。1/2 是 N = 4 的结果，1/8 是把 N 当成了除数而不是开方。',
      'The std of an average falls as 1/sqrt(N). sqrt(16) = 4, so the std is 1/4 of the original. 1/2 is the result for N = 4, and 1/8 treats N as a divisor instead of a square root.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('S = 2，b = 0.2，nl = 0，温度 25 C，x = 1。理想输出是多少？', 'S = 2, b = 0.2, nl = 0, temperature 25 C, x = 1. What is the ideal output?'),
    options: [
      { id: 'a', text: loc(Y_TXT, Y_TXT) },
      { id: 'b', text: loc(Y_LO, Y_LO) },
      { id: 'c', text: loc(Y_HI, Y_HI) },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'out = S·x + b = 2·1 + 0.2 = {y}。25 C 时温漂项是 0。{lo} 漏加了偏移，{hi} 把偏移加了两次。',
        'out = S*x + b = 2*1 + 0.2 = {y}. At 25 C the drift term is 0. {lo} drops the offset, and {hi} adds the offset twice.',
      ),
      { y: Y_TXT, lo: Y_LO, hi: Y_HI },
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '下列哪些必须把物理量加到敏感元件上？(1) 平场光；(2) 连续性；(3) 振动台；(4) 读寄存器。',
      'Which of these must apply a physical quantity to the sensing element? (1) flat-field light; (2) continuity; (3) a shaker; (4) a register read.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '平场光要照到像面，振动台要把力加到质量块上，都是物理激励。连续性和读寄存器只用电，不接触被测量。',
      'Flat-field light has to reach the image plane, and a shaker has to put force on the proof mass. Both are physical stimuli. Continuity and a register read use electricity only and do not apply the measurand.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('校准并写入 OTP 之后，下一次上电的随机噪声会怎样？', 'After calibration is written to OTP, what happens to the random noise at the next power-up?'),
    options: [
      { id: 'a', text: loc('噪声被系数减成 0', 'The coefficient reduces the noise to 0') },
      { id: 'b', text: loc('噪声还在；OTP 里只有系统误差的修正', 'The noise is still there; OTP holds only the systematic correction') },
      { id: 'c', text: loc('噪声变成固定图案，可以用一点法去掉', 'The noise becomes a fixed pattern and a one-point method removes it') },
    ],
    answer: 'b',
    explain: loc(
      'OTP 保存的是偏移、灵敏度或温漂的系数，下次上电照样加上去。随机噪声每次抽样不同，系数减不掉，只能靠平均把标准差压到 1/√N。',
      'OTP stores coefficients for offset, sensitivity, or drift, and the next power-up applies them again. Random noise is a new draw every time, so a coefficient cannot subtract it. Averaging is what shrinks the std as 1/sqrt(N).',
    ),
  },
  {
    id: 'q8',
    prompt: loc('为什么物理激励常常限制多站点并行？', 'Why does a physical stimulus often limit multi-site parallelism?'),
    options: [
      { id: 'a', text: loc('因为 ADC 位数不够', 'Because the ADC does not have enough bits') },
      { id: 'b', text: loc('因为光、力、压力或温箱很难同时均匀地加到每一颗', 'Because light, force, pressure, or a chamber is hard to apply evenly to every site at once') },
      { id: 'c', text: loc('因为数字口不能共享', 'Because a digital port cannot be shared') },
    ],
    answer: 'b',
    explain: loc(
      '电激励容易分配到很多站点。积分球、振动台、压力腔和温箱要覆盖每一颗，体积和均匀性都会卡住站点数，所以测试时间和并行度受激励设备限制。',
      'An electrical stimulus is easy to fan out to many sites. An integrating sphere, a shaker, a pressure cavity, or a chamber has to cover every device, and size plus uniformity limit the site count. Test time and parallelism are therefore set by the stimulus gear.',
    ),
  },
]

export function taskItems(state: OverviewState, a: OverviewAnalysis): TaskItem[] {
  const flags = overviewFlags(state, a)
  return [
    { id: 'match-knobs', text: S.task1, done: flags.t1 },
    { id: 'average-n', text: S.task2, done: flags.t2 },
    { id: 'compensate', text: S.task3, done: flags.t3 },
    { id: 'classify', text: S.task4, done: flags.t4 },
  ]
}

export function verdictOf(state: OverviewState, a: OverviewAnalysis): { title: LText; text: LText } {
  const item = STIMULUS_CARDS.find((card) => card.id === state.picked) ?? STIMULUS_CARDS[0]
  const mark = state.marks[item.id]
  const tail = fill(S.tail, {
    s: f3(a.tp.s),
    sk: f3(state.s),
    b: f3(a.tp.b),
    noise: f3(state.noise),
    n: String(state.nAvg),
    ratio: f3(a.tighten),
    std: f4(a.stdS),
    tco: f4(a.tcoEst),
    ok: String(a.marksCorrect),
  })
  const marked = mark === 'physical' ? S.markedPhys : S.markedElec
  const comp = state.comp === 'on' ? S.compOn : S.compOff
  return { title: item.verdictTitle, text: join([item.reason, tail, marked, comp]) }
}

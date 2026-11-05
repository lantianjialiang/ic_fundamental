import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { flipCal, noiseInBand, tiltSensitivityError } from './core/sensor'
import { EXAMPLE_MINUS, EXAMPLE_PLUS, MODE_IDS, PLAN_IDS, type AccelAnalysis, type AccelState, type PlanId } from './snsAccelModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const f2 = (n: number) => n.toFixed(2)
const f3 = (n: number) => n.toFixed(3)
const f4 = (n: number) => n.toFixed(4)

const EXAMPLE = flipCal(EXAMPLE_PLUS, EXAMPLE_MINUS)
const TILT_2 = tiltSensitivityError(2) * 100
const NOISE_MG = noiseInBand(150e-6, 50) * 1e3

export const MODE_OPTIONS = MODE_IDS.map((id) => ({
  id,
  label: id === 'live' ? loc('实测', 'Live') : loc('示例', 'Example'),
}))

export const PLAN_OPTIONS = PLAN_IDS.map((id) => ({
  id,
  label: id === 'flip' ? loc('翻转', 'Flip') : id === 'spinner' ? loc('转台', 'Spinner') : loc('自检', 'Self-test'),
}))

export const S = {
  kickerNow: loc('这一次激励', 'This stimulus'),
  introTitle: loc('0 g 偏移、灵敏度与噪声', '0 g offset, sensitivity and noise'),
  coreTitle: loc('练一练：翻转、倾角与带宽', 'Practice: flip, tilt and bandwidth'),
  coreNote: loc(
    '初值来自 VDUT-ACC1：灵敏度 0.3 V/g，偏移 1.65 V。六位置表含 0 g 和 ±1 g，每个格子的随机种子是固定的。翻转读数取 X 轴的 +1 g 和 −1 g，再交给 flipCal。',
    'The starting knobs are VDUT-ACC1: sensitivity 0.3 V/g, offset 1.65 V. The six-position table includes 0 g and ±1 g, and each cell uses a fixed seed. The flip reading takes +1 g and -1 g on X and passes them to flipCal.',
  ),
  callout: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  sLabel: loc('真灵敏度', 'True sensitivity'),
  offLabel: loc('真偏移', 'True offset'),
  ndLabel: loc('噪声密度', 'Noise density'),
  bwLabel: loc('带宽', 'Bandwidth'),
  nlLabel: loc('非线性', 'Nonlinearity'),
  tempLabel: loc('温度', 'Temperature'),
  tiltLabel: loc('安装倾角', 'Mount tilt'),
  noiseLabel: loc('翻转时关掉噪声', 'Turn noise off for the flip'),
  modeLabel: loc('读数来源', 'Reading source'),
  planLabel: loc('测试方案', 'Test plan'),
  rPlus: loc('X 轴 +1 g', 'X at +1 g'),
  rMinus: loc('X 轴 −1 g', 'X at -1 g'),
  rOff: loc('翻转得到的偏移', 'Offset from the flip'),
  rS: loc('翻转得到的灵敏度', 'Sensitivity from the flip'),
  rTilt: loc('倾角造成的灵敏度误差', 'Sensitivity error from tilt'),
  rNoise: loc('带宽内噪声', 'In-band noise'),
  rNoiseV: loc('这份噪声折成电压', 'That noise as a voltage'),
  tableCap: loc('三轴的 0 g 与 ±1 g。同一格每次结果一样。', '0 g and ±1 g on three axes. The same cell always gives the same result.'),
  colAxis: loc('轴', 'Axis'),
  colG: loc('施加', 'Applied'),
  colV: loc('电压', 'Voltage'),
  exampleLine: loc(
    '示例：V+ = 1.95 V，V− = 1.35 V，flipCal 得到偏移 {off} V、灵敏度 {s} V/g。',
    'Example: V+ = 1.95 V and V- = 1.35 V. flipCal returns offset {off} V and sensitivity {s} V/g.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '下一课把 CIS 的暗场、亮场和缺陷图收成一套量产程序。加速度计的物理激励不会因此被自检替代。',
    'The next lesson folds the CIS dark test, bright test and defect map into one production program. A physical stimulus for the accelerometer is still not replaced by self-test.',
  ),
  next: loc('下一课：CIS 量产程序', 'Next: CIS production program'),
  task1: loc(
    '关掉翻转噪声并把倾角调到 0°，使模型的 +1 g / −1 g 与 flipCal 对齐。',
    'Turn the flip noise off and set tilt to 0°, so the model +1 g / -1 g pair lines up with flipCal.',
  ),
  task2: loc('把安装倾角调到 2°，读出灵敏度误差。', 'Set the mount tilt to 2° and read the sensitivity error.'),
  task3: loc(
    '把噪声密度放到 150 µg/√Hz、带宽放到 50 Hz，读出带宽内噪声。这是 VDUT-ACC1 的标称值，不是页面初值。',
    'Set the noise density to 150 ug/rtHz and the bandwidth to 50 Hz, and read the in-band noise. These are the VDUT-ACC1 ratings, not the page defaults.',
  ),
  task4: loc('把测试方案选成自检，并在侧栏读它为什么代替不了物理激励。', 'Choose self-test as the plan, and read in the side panel why it does not replace a physical stimulus.'),
  vFlip: loc('翻转用两次重力把偏移和灵敏度分开', 'A flip separates offset and sensitivity with two gravity readings'),
  vSpin: loc('转台覆盖更全，也更慢', 'A spinner covers more, and it is slower'),
  vSelf: loc('自检代替不了物理激励', 'Self-test does not replace a physical stimulus'),
  vFlipText: loc(
    'X 轴 +1 g 是 {vp} V，−1 g 是 {vm} V，flipCal 得到偏移 {off} V、灵敏度 {s} V/g。原因：两个方向相加去掉灵敏度、只留偏移，相减去掉偏移、只留灵敏度，再除以 2。送进这两次读数的噪声密度是 {nd} µg/√Hz，倾角 {tilt} °，倾角误差 {err}%，带宽内噪声 {mg} mg。',
    'X at +1 g is {vp} V and at -1 g is {vm} V. flipCal returns offset {off} V and sensitivity {s} V/g. Reason: adding the two directions removes sensitivity and leaves the offset; subtracting them removes the offset and leaves the sensitivity, then divide by 2. The noise density used for these two readings is {nd} ug/rtHz. Tilt is {tilt} °, the tilt error is {err}%, and the in-band noise is {mg} mg.',
  ),
  vSpinText: loc(
    '转台可以把角度和角速度设到翻转覆盖不到的位置。原因：它要机械转动，时间长、并行度低，适合把特性测全，不适合每颗都做一遍。当前倾角 {tilt} ° 的灵敏度误差是 {err}%，带宽内噪声 {mg} mg。',
    'A spinner can set angles and rates the flip never reaches. Reason: it has to move mechanically, so it is slow and hard to run in parallel. It suits a full characterization, not a test of every unit. At a tilt of {tilt} ° the sensitivity error is {err}%, and the in-band noise is {mg} mg.',
  ),
  vSelfText: loc(
    '静电自检代替不了物理激励。原因：自检只在片内加一个等效加速度，用来确认模拟前端有反应，覆盖不到真实重力、安装倾角和封装应力。当前翻转法给出的灵敏度是 {s} V/g，带宽内噪声是 {mg} mg，自检给不出这两个数。',
    'Electrical self-test does not replace a physical stimulus. Reason: self-test only applies an equivalent acceleration inside the die, to check that the analog front end responds. It does not cover real gravity, mount tilt or package stress. The flip currently reports {s} V/g, and the in-band noise is {mg} mg. Self-test does not produce those two numbers.',
  ),
}

export const INTRO = [
  loc(
    '模拟输出的加速度计可以写成 V = 偏移 + 灵敏度 × 加速度，再加上非线性、温漂和噪声。VDUT-ACC1 的灵敏度是 0.3 V/g，0 g 时输出落在 1.65 V 附近。',
    'An analog accelerometer can be written as V = offset + sensitivity x acceleration, plus nonlinearity, temperature drift and noise. VDUT-ACC1 has a sensitivity of 0.3 V/g, and at 0 g the output sits near 1.65 V.',
  ),
  loc(
    '翻转法把同一根轴对着 +1 g 和 −1 g 各读一次。偏移 = (V+ + V−) / 2，灵敏度 = (V+ − V−) / 2，单位 V/g。安装倾角 θ 让有效重力变成 g·cosθ，相对误差是 1 − cosθ。',
    'A flip reads the same axis once at +1 g and once at -1 g. Offset = (V+ + V-) / 2. Sensitivity = (V+ - V-) / 2, in V/g. A mount tilt θ turns the effective gravity into g·cosθ, and the relative error is 1 - cosθ.',
  ),
  loc(
    '噪声密度的单位是 g/√Hz，带宽内的噪声是 ND·√BW。转台能扫更多角度，但慢。静电自检便宜，只能证明电路有反应，不能代替一次真实的重力或转台激励。',
    'Noise density is in g/rtHz. Noise inside the bandwidth is ND·sqrt(BW). A spinner can sweep more angles, and it is slow. Electrical self-test is cheap. It only shows that the circuit responds. It does not replace a real gravity reading or a spinner.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '自检可以完全代替物理激励。自检是片内的等效加速度，不包含安装倾角、封装应力和真实的 1 g。量产常把自检和少量物理标定放在一起用。',
    'Self-test can fully replace a physical stimulus. Self-test is an on-die equivalent acceleration. It does not include mount tilt, package stress or a real 1 g. Production usually pairs self-test with a small amount of physical calibration.',
  ),
  loc(
    '安装倾斜可以忽略。2° 的误差大约是 0.061%。规格紧的时候，这已经和灵敏度误差放在同一个量级。',
    'Mount tilt can be ignored. The error at 2° is about 0.061%. On a tight spec that already sits in the same range as the sensitivity error.',
  ),
  loc(
    '噪声密度和带宽无关。读到的噪声是 ND·√BW，带宽加大，同样的密度会变成更大的有效值。',
    'Noise density does not depend on bandwidth. The noise you read is ND·sqrt(BW). A wider bandwidth turns the same density into a larger rms value.',
  ),
]

export const TAKEAWAY: LText = loc(
  '偏移 = (V+ + V−) / 2，灵敏度 = (V+ − V−) / (2 g)。倾角误差 = 1 − cosθ，2° 约为 0.061%。带宽内噪声 = ND·√BW，150 µg/√Hz 和 50 Hz 约为 1.06 mg。自检确认电路，不代替物理激励。',
  'Offset = (V+ + V-) / 2. Sensitivity = (V+ - V-) / (2 g). Tilt error = 1 - cosθ, about 0.061% at 2°. In-band noise = ND·sqrt(BW). 150 ug/rtHz and 50 Hz give about 1.06 mg. Self-test checks the circuit. It does not replace a physical stimulus.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('V+ = 1.95 V，V− = 1.35 V。翻转法得到的偏移是多少？', 'V+ = 1.95 V and V- = 1.35 V. What offset does the flip return?'),
    options: [
      { id: 'a', text: loc('0.30 V', '0.30 V') },
      { id: 'b', text: loc(`${f2(EXAMPLE.offsetV)} V`, `${f2(EXAMPLE.offsetV)} V`) },
      { id: 'c', text: loc('3.30 V', '3.30 V') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '偏移 = (1.95 + 1.35) / 2 = {v} V。相加把 ±1 g 的灵敏度项消掉了。',
        'Offset = (1.95 + 1.35) / 2 = {v} V. Adding the two readings cancels the ±1 g sensitivity term.',
      ),
      { v: f2(EXAMPLE.offsetV) },
    ),
  },
  {
    id: 'q2',
    prompt: loc('同一组电压，灵敏度是多少？', 'With the same two voltages, what is the sensitivity?'),
    options: [
      { id: 'a', text: loc(`${f2(EXAMPLE.sVg)} V/g`, `${f2(EXAMPLE.sVg)} V/g`) },
      { id: 'b', text: loc('0.60 V/g', '0.60 V/g') },
      { id: 'c', text: loc('1.65 V/g', '1.65 V/g') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '灵敏度 = (1.95 − 1.35) / 2 = {v} V/g。相减把偏移消掉，分母是 2 g。',
        'Sensitivity = (1.95 - 1.35) / 2 = {v} V/g. Subtracting removes the offset, and the denominator is 2 g.',
      ),
      { v: f2(EXAMPLE.sVg) },
    ),
  },
  {
    id: 'q3',
    prompt: loc('安装倾角 2° 时，灵敏度的相对误差大约是多少？', 'About what is the relative sensitivity error at a mount tilt of 2°?'),
    options: [
      { id: 'a', text: loc('0.015%', '0.015%') },
      { id: 'b', text: loc(`${f3(TILT_2)}%`, `${f3(TILT_2)}%`) },
      { id: 'c', text: loc('2.000%', '2.000%') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '误差 = 1 − cos(2°) = {v}%。小角度时它大约是 θ²/2（θ 用弧度），不是 2% 本身。',
        'The error is 1 - cos(2°) = {v}%. For a small angle it is about θ^2/2 with θ in radians, not the 2% you might read off the degree number.',
      ),
      { v: f3(TILT_2) },
    ),
  },
  {
    id: 'q4',
    prompt: loc('噪声密度 150 µg/√Hz，带宽 50 Hz。带宽内噪声大约是多少 mg？', 'Noise density is 150 ug/rtHz and bandwidth is 50 Hz. About how many mg is the in-band noise?'),
    options: [
      { id: 'a', text: loc('0.15 mg', '0.15 mg') },
      { id: 'b', text: loc(`${f2(NOISE_MG)} mg`, `${f2(NOISE_MG)} mg`) },
      { id: 'c', text: loc('7.50 mg', '7.50 mg') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'σ = 150e-6 × sqrt(50) = {v} mg。带宽在根号里，不是直接相乘。',
        'σ = 150e-6 x sqrt(50) = {v} mg. Bandwidth sits under the square root. It is not a direct product.',
      ),
      { v: f2(NOISE_MG) },
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于翻转法，下列哪些说法正确？(1) 偏移是两次电压的平均；(2) 灵敏度是两次电压之差再除以 2 g；(3) 只测一个方向就能同时得到偏移和灵敏度；(4) 噪声会留在这一对读数里。',
      'Which statements about the flip are correct? (1) Offset is the average of the two voltages; (2) sensitivity is the difference of the two voltages divided by 2 g; (3) one direction is enough to get both offset and sensitivity; (4) noise stays in that pair of readings.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(3) 少了一次反向。只有一个方向时，偏移和灵敏度缠在同一个电压里，拆不开。',
      '(3) is missing the reversed reading. With only one direction, offset and sensitivity sit in the same voltage and cannot be split.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '关于自检、翻转和转台，下列哪些说法正确？(1) 自检确认片内电路有反应；(2) 自检覆盖了安装倾角和封装应力；(3) 转台能给翻转给不了的角度；(4) 转台慢，不适合每颗都做全套。',
      'Which statements about self-test, a flip and a spinner are correct? (1) Self-test checks that the on-die circuit responds; (2) self-test covers mount tilt and package stress; (3) a spinner can set angles a flip cannot; (4) a spinner is slow, so a full sweep on every unit is a poor fit.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)、(4)', '(1), (3), (4)') },
      { id: 'b', text: loc('(1)、(2)、(3)', '(1), (2), (3)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(2) 把自检说大了。片内的等效加速度到不了安装面和封装，这些仍要靠物理激励。',
      '(2) overstates self-test. An on-die equivalent acceleration never reaches the mount or the package. Those still need a physical stimulus.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('带宽从 50 Hz 改成 200 Hz，噪声密度不变。带宽内噪声变成原来的几倍？', 'Bandwidth changes from 50 Hz to 200 Hz and the noise density stays the same. By what factor does the in-band noise grow?'),
    options: [
      { id: 'a', text: loc('2 倍，因为噪声按带宽的平方根变', '2 times, because the noise follows the square root of bandwidth') },
      { id: 'b', text: loc('4 倍，因为带宽变成 4 倍', '4 times, because the bandwidth is 4 times larger') },
      { id: 'c', text: loc('不变，噪声密度已经含了带宽', 'It stays the same, because noise density already includes bandwidth') },
    ],
    answer: 'a',
    explain: loc(
      'σ = ND·√BW。200/50 = 4，根号是 2。噪声密度本身不含带宽，带宽是另外乘上去的。',
      'σ = ND·sqrt(BW). 200/50 = 4, and the square root of that is 2. Noise density does not already include bandwidth. Bandwidth is applied on top.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('0 g 偏移和灵敏度为什么要分开校准？', 'Why are 0 g offset and sensitivity calibrated separately?'),
    options: [
      { id: 'a', text: loc('一个是没加速度时的输出，一个是每 g 的电压变化，写进补偿时是两项', 'One is the output with no acceleration, the other is volts per g. Compensation stores them as two terms') },
      { id: 'b', text: loc('两者永远相等', 'They are always equal') },
      { id: 'c', text: loc('灵敏度就是带宽内噪声', 'Sensitivity is the in-band noise') },
    ],
    answer: 'a',
    explain: loc(
      '偏移是 0 g 的电压，灵敏度是斜率。翻转法用加和减把它们拆开，再写进校准。噪声是另一项，不代替斜率。',
      'Offset is the voltage at 0 g. Sensitivity is the slope. The flip splits them by adding and subtracting, and both are written into the calibration. Noise is a third term. It does not stand in for the slope.',
    ),
  },
]

export function taskItems(state: AccelState): TaskItem[] {
  return [
    { id: 'flip-quiet', text: S.task1, done: state.noiseOff && state.tiltDeg === 0 },
    { id: 'tilt-2', text: S.task2, done: state.tiltDeg === 2 },
    { id: 'noise-spec', text: S.task3, done: state.ndUg === 150 && state.bwHz === 50 },
    { id: 'selftest', text: S.task4, done: state.plan === 'selftest' },
  ]
}

export function verdictOf(state: AccelState, a: AccelAnalysis): { title: LText; text: LText } {
  const ndUsed = state.noiseOff ? 0 : state.ndUg
  const common = {
    vp: f4(a.vPlus),
    vm: f4(a.vMinus),
    off: f4(a.offsetV),
    s: f4(a.sVg),
    nd: f2(ndUsed),
    tilt: f0safe(state.tiltDeg),
    err: f3(a.tiltPct),
    mg: f2(a.noiseMg),
  }
  const text: Record<PlanId, LText> = {
    flip: fill(S.vFlipText, common),
    spinner: fill(S.vSpinText, common),
    selftest: fill(S.vSelfText, common),
  }
  const title: Record<PlanId, LText> = { flip: S.vFlip, spinner: S.vSpin, selftest: S.vSelf }
  return { title: title[state.plan], text: text[state.plan] }
}

function f0safe(n: number): string {
  return Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1)
}

export const exampleNumbers = {
  off: f2(EXAMPLE.offsetV),
  s: f2(EXAMPLE.sVg),
}

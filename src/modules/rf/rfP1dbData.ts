import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { P1DB_DROP_DB, analyseP1db, vrmsToDbm, type P1dbAnalysis, type P1dbState } from './rfP1dbModel'

const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

/** P1dB 在 Psat 以下多少 dB（只取决于平滑系数 p，与增益、Psat 无关） */
function gapBelowPsat(p: number): number {
  const a = analyseP1db({ gain: 15, psat: 20, p, pin: -5 })
  return a.p1out === null ? Number.NaN : a.psat - a.p1out
}

export const S = {
  kickerNow: loc('这一次工作点', 'This operating point'),
  introTitle: loc('输出功率、压缩与 P1dB', 'Output power, compression and P1dB'),
  coreTitle: loc('拨一拨：增益、Psat、平滑系数与输入功率', 'Try it: gain, Psat, smoothness and input power'),
  coreNote: loc(
    '放大器用 Rapp 型压缩模型（线性域的电压关系）：输入增大时输出先按 1:1 增长，再逼近饱和功率 Psat。虚线是理想的 1:1 增长；蓝线偏离它的地方就是压缩。',
    'The amplifier uses a Rapp-type compression model in the linear voltage domain: the output first rises 1:1 with input, then approaches the saturated power Psat. The dashed line is ideal 1:1 growth; where the blue curve bends away from it is compression.',
  ),
  gainLabel: loc('小信号增益 G (dB)', 'Small-signal gain G (dB)'),
  psatLabel: loc('饱和输出功率 Psat (dBm)', 'Saturated output power Psat (dBm)'),
  pLabel: loc('平滑系数 p（2–3）', 'Smoothness p (2–3)'),
  pinLabel: loc('输入功率 Pin (dBm)', 'Input power Pin (dBm)'),
  rSmall: loc('小信号增益', 'Small-signal gain'),
  rIn1: loc('P1dB 输入功率', 'P1dB input power'),
  rOut1: loc('P1dB 输出功率', 'P1dB output power'),
  rGap: loc('P1dB 比 Psat 低', 'P1dB below Psat'),
  rOp: loc('工作点输出功率 Pout', 'Output power at the operating point'),
  rComp: loc('工作点增益压缩', 'Gain compression at the operating point'),
  linear: loc('线性区', 'Linear region'),
  compressed: loc('已压缩', 'Compressed'),
  asideLater: loc(
    '真实放大器的压缩还与频率、偏置、温度有关，并且要用调制信号测 ACPR 和 EVM；这里只用一个 Rapp 模型看压缩、P1dB 和饱和三件事。',
    'Real amplifier compression also depends on frequency, bias and temperature, and modulated-signal tests such as ACPR and EVM go further; here a single Rapp model shows compression, P1dB and saturation.',
  ),
  next: loc('下一课：线性度：IP3 与 IMD', 'Next: Linearity: IP3 and IMD'),
  task1: loc(
    '把 Pin 调到 P1dB 工作点附近，让增益压缩约 1 dB（0.7–1.3 dB 之间）。',
    'Set Pin near the P1dB operating point so the gain compresses by about 1 dB (between 0.7 and 1.3 dB).',
  ),
  task2: loc('把输入推到增益压缩 3 dB 以上，进入饱和区。', 'Drive the input until the gain compresses by 3 dB or more, into saturation.'),
  task3: loc('把饱和输出功率 Psat 降到 15 dBm 以下，看 P1dB 随之下降。', 'Lower Psat below 15 dBm and watch P1dB drop with it.'),
  task4: loc('把平滑系数 p 调到 3，比较 P1dB 与 Psat 的差距。', 'Set the smoothness p to 3 and compare the gap between P1dB and Psat.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
}

export const FIG = {
  aria: loc(
    'P1dB 图：输出功率随输入功率变化，虚线为理想 1:1 增长，红线为 Psat，金点为 P1dB，蓝点为工作点',
    'P1dB plot: output power against input power; the dashed line is ideal 1:1 growth, the red line is Psat, the gold dot is P1dB and the blue dot is the operating point',
  ),
  cap: loc(
    '横轴是输入功率，纵轴是输出功率（都是 dBm，50 Ω）。虚线是理想的 1:1 增长，蓝线是 Rapp 模型，红线是饱和功率 Psat，金点是增益比小信号低 1 dB 的 P1dB，蓝点是工作点。',
    'Horizontal is input power and vertical is output power (both in dBm, 50 Ω). The dashed line is ideal 1:1 growth, the blue line is the Rapp model, the red line is the saturated power Psat, the gold dot is P1dB (gain 1 dB below small-signal), and the blue dot is the operating point.',
  ),
}

export const INTRO = [
  loc(
    '上一课 {@rfGain} 讲的是小信号下的增益，增益是常数，与输入大小无关。信号大到一定程度，放大器进入非线性区，增益开始下降，这叫增益压缩。',
    'In the previous lesson {@rfGain} the gain was a small-signal constant that did not depend on the input level. When the signal is large enough the amplifier enters its nonlinear region and the gain starts to drop; this is gain compression.',
  ),
  loc(
    '这一课要做三件事：扫描输入功率，看出压缩与饱和；用插值找到增益比小信号低 1 dB 的 P1dB 点；用 dBm 读出输出功率。50 Ω 系统里功率、电压与 dBm 的换算在 {@rfDb} 中讲过。',
    'This lesson does three things: sweep the input power to see compression and saturation; interpolate to find the P1dB point where the gain is 1 dB below its small-signal value; and read the output power in dBm. The conversions between power, voltage and dBm in a 50 Ω system were covered in {@rfDb}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '1 dB 压缩点就是饱和点。P1dB 是增益比小信号低 1 dB 的点，此时输出还比 Psat 低 1–2 dB 左右；真正饱和要在更高的输入下才完全发生。',
    'The 1 dB compression point is the saturation point. P1dB is where the gain is 1 dB below the small-signal value; the output is then still about 1–2 dB below Psat, and full saturation only happens at higher input.',
  ),
  loc(
    '输入越大，输出一定越大。过了 P1dB 之后，输出的增长明显变慢；达到 Psat 后几乎不再增加，输入再大，输出也不会按 1:1 增长。',
    'More input always means more output. Past P1dB the output grows much more slowly; once it reaches Psat it barely increases, and no matter how much more input you apply it does not keep rising 1:1.',
  ),
  loc(
    '压缩只影响增益，不影响频谱。压缩会产生谐波和互调，RF-07 里的 IM3 正是非线性带来的新频率分量。',
    'Compression only changes the gain, not the spectrum. Compression creates harmonics and intermodulation; the IM3 in RF-07 is a new frequency component created by nonlinearity.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Rapp 模型里，输出随输入增大而逼近饱和功率 Psat；增益比小信号低 1 dB 的输入点就是 P1dB，用扫描加插值求出。P1dB 通常比 Psat 低 1–2 dB（p = 2 时约 2.2 dB，p = 3 时约 1.0 dB）。dBm 以 50 Ω 负载、1 mW 为参考。',
  'In the Rapp model the output rises with input and approaches the saturated power Psat; the input where the gain is 1 dB below its small-signal value is P1dB, found by sweeping and interpolating. P1dB is usually 1–2 dB below Psat (about 2.2 dB for p = 2 and about 1.0 dB for p = 3). dBm is referenced to 1 mW in a 50 Ω load.',
)

/** 小测题干里的数字由模型算出，与页面的换算保持一致 */
const GAP_P2 = gapBelowPsat(2)
const GAP_P3 = gapBelowPsat(3)
const VRMS_1_DBM = vrmsToDbm(1)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '增益 15 dB、p = 2 的放大器，P1dB 的输出功率比饱和功率 Psat 低大约多少？',
      'For an amplifier with 15 dB gain and p = 2, roughly how far below the saturated output power Psat is the P1dB output?',
    ),
    options: [
      { id: 'a', text: loc(`约 ${f1(GAP_P2)} dB`, `about ${f1(GAP_P2)} dB`) },
      { id: 'b', text: loc('0 dB（两者相等）', '0 dB (the same)') },
      { id: 'c', text: loc('约 6 dB', 'about 6 dB') },
    ],
    answer: 'a',
    explain: loc(
      `在 Rapp 模型里，增益压缩 1 dB 时，输出约为 Psat 的 ${f1(GAP_P2)} dB 以下（p = 2）。这个差只取决于 p，与增益和 Psat 的大小无关。`,
      `In the Rapp model the output at 1 dB compression sits about ${f1(GAP_P2)} dB below Psat (p = 2). The gap depends only on p, not on the gain or on Psat.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('P1dB 的定义是什么？', 'What is the definition of P1dB?'),
    options: [
      { id: 'a', text: loc('输出功率等于饱和功率一半的点', 'The point where the output equals half of Psat') },
      { id: 'b', text: loc('增益比小信号增益低 1 dB 的输入（输出）功率点', 'The input (output) power where the gain is 1 dB below the small-signal gain') },
      { id: 'c', text: loc('增益降为 0 的输入功率', 'The input power where the gain falls to 0') },
    ],
    answer: 'b',
    explain: loc(
      '1 dB 压缩点按增益的相对变化定义：增益比小信号增益低 1 dB 时的输入（或输出）功率。它在扫描中找到，两个相邻点之间用线性插值求出。',
      'The 1 dB compression point is defined by the relative change of gain: the input (or output) power where the gain is 1 dB below the small-signal gain. It is found by sweeping and interpolating between neighbouring points.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('放大器过了 P1dB 后，输出为什么不再随输入按 1:1 增长？', 'Why does the output stop rising 1:1 with input once the amplifier is past P1dB?'),
    options: [
      { id: 'a', text: loc('非线性压缩：输出接近 Vsat 时，曲线斜率下降，增益随输入增大而降低', 'Nonlinear compression: near Vsat the curve slope falls, so the gain drops as input rises') },
      { id: 'b', text: loc('输入阻抗突然变大', 'The input impedance suddenly rises') },
      { id: 'c', text: loc('频率变高了', 'The frequency has gone up') },
    ],
    answer: 'a',
    explain: loc(
      'Rapp 曲线在 Vout 接近 Vsat 时斜率变小，所以增益随输入增大而下降。这是非线性压缩，与阻抗和频率无关。',
      'The Rapp curve flattens as Vout approaches Vsat, so the gain falls as the input rises. This is nonlinear compression; it has nothing to do with impedance or frequency.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('在 50 Ω 系统中，输出电压有效值为 1 V，输出功率约为多少 dBm？', 'In a 50 Ω system, the output is 1 V rms. About how many dBm is the output power?'),
    options: [
      { id: 'a', text: loc('0.0 dBm', '0.0 dBm') },
      { id: 'b', text: loc(`${f1(VRMS_1_DBM)} dBm`, `${f1(VRMS_1_DBM)} dBm`) },
      { id: 'c', text: loc('30.0 dBm', '30.0 dBm') },
    ],
    answer: 'b',
    explain: loc(
      `P = V²/R = 1²/50 = 0.02 W = 20 mW，换算 dBm：10·log10(20) = ${f1(VRMS_1_DBM)} dBm。`,
      `P = V²/R = 1²/50 = 0.02 W = 20 mW, and in dBm: 10·log10(20) = ${f1(VRMS_1_DBM)} dBm.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('平滑系数 p 从 2 调到 3，P1dB 与 Psat 之间的差距会怎样？', 'If the smoothness p goes from 2 to 3, how does the gap between P1dB and Psat change?'),
    options: [
      { id: 'a', text: loc('变大', 'It grows') },
      { id: 'b', text: loc(`缩小：从约 ${f1(GAP_P2)} dB 变到约 ${f1(GAP_P3)} dB`, `It shrinks: from about ${f1(GAP_P2)} dB to about ${f1(GAP_P3)} dB`) },
      { id: 'c', text: loc('不变', 'It does not change') },
    ],
    answer: 'b',
    explain: loc(
      'p 越大，拐点越尖，曲线越接近理想限幅；压缩 1 dB 时更接近 Vsat，也就是更接近 Psat。',
      'A larger p gives a sharper knee that is closer to an ideal limiter; a 1 dB compression then happens nearer Vsat, that is nearer Psat.',
    ),
  },
]

/** 四张任务卡：完成与否由当前设置和扫描结果算出 */
export function taskItems(state: P1dbState, a: P1dbAnalysis): TaskItem[] {
  return [
    { id: 'p1', text: S.task1, done: a.compressDb >= 0.7 && a.compressDb <= 1.3 },
    { id: 'sat', text: S.task2, done: a.compressDb >= 3 },
    { id: 'psat', text: S.task3, done: state.psat <= 15 },
    { id: 'p3', text: S.task4, done: state.p >= 3 },
  ]
}

/** 右侧说明栏：线性区还是压缩区，以及原因 */
export function verdictOf(a: P1dbAnalysis): { title: LText; text: LText; note: LText } {
  const comp = f2(a.compressDb)
  const opOut = f1(a.opPout)
  const p1in = a.p1in === null ? '—' : f1(a.p1in)
  if (a.compressDb < 1) {
    return {
      title: S.linear,
      text: loc(
        `输入 ${f1(a.pin)} dBm 时输出 ${opOut} dBm，增益只压缩了 ${comp} dB（小于 ${P1DB_DROP_DB} dB），仍在线性区。P1dB 的输入点约为 ${p1in} dBm。`,
        `At input ${f1(a.pin)} dBm the output is ${opOut} dBm; the gain is compressed by only ${comp} dB (less than ${P1DB_DROP_DB} dB), so it is still linear. The P1dB input is about ${p1in} dBm.`,
      ),
      note: loc(
        '输出离饱和还有距离，Rapp 曲线的斜率接近 1，输出随输入按 1:1 增长。',
        'The output is still well short of saturation, the Rapp curve slope is close to 1, and the output rises 1:1 with the input.',
      ),
    }
  }
  return {
    title: S.compressed,
    text: loc(
      `增益被压缩了 ${comp} dB，超过 ${P1DB_DROP_DB} dB 的 P1dB 门限，输出只有 ${opOut} dBm。`,
      `The gain is compressed by ${comp} dB, beyond the ${P1DB_DROP_DB} dB P1dB threshold, and the output is only ${opOut} dBm.`,
    ),
    note: loc(
      '输出接近 Vsat 时，Rapp 曲线的斜率下降，增益随输入增大而降低。这时波形开始削顶，谐波和交调都会增大。',
      'As the output nears Vsat the Rapp curve flattens and the gain falls as input rises. The waveform starts to clip, and harmonics and intermodulation both grow.',
    ),
  }
}
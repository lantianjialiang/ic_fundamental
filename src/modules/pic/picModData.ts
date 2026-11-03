import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { QUADRATURE_PHI, dbmToW, mzmLevels, mzmPower, pdCurrent } from './core/photonics'
import { DRIFT_IDS, TAB_IDS, fmtEr, type DriftId, type ModAnalysis, type ModState, type ModTab } from './picModModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

function joinText(a: LText, b: LText): LText {
  return { zh: `${a.zh} ${b.zh}`, en: `${a.en ?? a.zh} ${b.en ?? b.zh}` }
}

export const TAB_LABEL: Record<ModTab, LText> = {
  mzm: loc('调制器', 'Modulator'),
  pd: loc('探测器', 'Photodetector'),
}

export const TABS = TAB_IDS.map((id) => ({ id, label: TAB_LABEL[id] }))

export const DRIFT_LABEL: Record<DriftId, LText> = {
  raises: loc('偏离正交点会提高消光比', 'Drifting off quadrature raises the extinction ratio'),
  lowers: loc('偏离正交点会降低消光比', 'Drifting off quadrature lowers the extinction ratio'),
  same: loc('偏置漂移不改变消光比', 'Bias drift does not change the extinction ratio'),
}

export const DRIFT_OPTIONS = DRIFT_IDS.map((id) => ({ id, label: DRIFT_LABEL[id] }))

export const FIG = {
  pHigh: loc('P1', 'P1'),
  pLow: loc('P0', 'P0'),
  x: loc('V', 'V'),
  y: loc('P', 'P'),
  aria: loc('调制器传输曲线，横轴电压，纵轴光功率，并标出驱动的高低两点', 'Modulator transfer curve, voltage on the horizontal axis and optical power on the vertical axis, with the high and low drive points marked'),
  sum: loc('驱动 ±{v}/2 V 的两点：高电平 {p1} mW，低电平 {p0} mW。', 'The two drive points at plus or minus {v}/2 V are high {p1} mW and low {p0} mW.'),
}

export const S = {
  kickerNow: loc('这个偏置', 'This bias'),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  introTitle: loc('余弦形的调制器，和一只光电二极管', 'A cosine-shaped modulator, and a photodiode'),
  coreTitle: loc('两个标签：先看调制器，再看探测器', 'Two tabs: the modulator first, then the photodetector'),
  coreNote: loc(
    'P = (P0/2)·(1 + cos(πV/Vπ + φ0))。正交点是 φ0 = -π/2，V = 0 时输出为 P0/2。环调制器更小，但也更怕温度，不能和 MZM 互换。',
    'P = (P0/2) * (1 + cos(pi V/Vpi + phi0)). Quadrature is phi0 = -pi/2, so the output at V = 0 is P0/2. A ring modulator is smaller, and also more sensitive to temperature. It is not interchangeable with an MZM.',
  ),
  tabAria: loc('调制器与探测器标签', 'Modulator and photodetector tabs'),
  p0Label: loc('输入光功率 P0', 'Input optical power P0'),
  vpiLabel: loc('Vπ', 'Vpi'),
  phiLabel: loc('偏置 φ0', 'Bias phi0'),
  vppLabel: loc('驱动 Vpp', 'Drive Vpp'),
  dbmLabel: loc('入射光功率', 'Incident optical power'),
  respLabel: loc('响应度 R', 'Responsivity R'),
  darkLabel: loc('暗电流', 'Dark current'),
  driftLabel: loc('偏置漂离开正交点时', 'When the bias drifts off quadrature'),
  rAt0: loc('V = 0 的输出', 'Output at V = 0'),
  rP1: loc('高电平 P1', 'High level P1'),
  rP0: loc('低电平 P0', 'Low level P0'),
  rEr: loc('消光比 ER', 'Extinction ratio ER'),
  rOma: loc('OMA', 'OMA'),
  rIl: loc('插入损耗 IL', 'Insertion loss IL'),
  rPhoto: loc('光电流 R·P', 'Photocurrent R*P'),
  rTotal: loc('总电流', 'Total current'),
  rDark: loc('暗电流', 'Dark current'),
  extinct: loc(
    'P 从 0 摆到 P0，消光比是无穷大。原因：正交点上 ±Vπ/2 的满摆幅正好走到传输曲线的峰值和零点。',
    'P swings from 0 to P0, so the extinction ratio is infinite. Reason: at quadrature a full swing of plus or minus Vpi/2 lands on the peak and the null of the transfer curve.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '眼图上的 ER 和 OMA 会在光链路那一课再量一次。这里先把调制曲线和光电流算对。',
    'ER and OMA on an eye diagram are measured again in the optical-link lesson. Here the modulator curve and the photocurrent come first.',
  ),
  next: loc('下一课：光源、功率计与波长扫描', 'Next: source, power meter and wavelength sweep'),
  task1: loc('把偏置调到正交点（-90 度，即 -π/2）。V = 0 的读数应为输入 P0 的一半。', 'Set the bias to quadrature (-90 degrees, which is -pi/2). The V = 0 readout should be half of the input P0.'),
  task2: loc(
    '在正交点把 Vπ 设为 4 V、Vpp 设为 4 V。高低电平应落到 0 和 P0，消光比为无穷大。',
    'At quadrature set Vpi to 4 V and Vpp to 4 V. The levels should land on 0 and P0, and the extinction ratio is infinite.',
  ),
  task3: loc('在探测器上把入射功率设为 -10 dBm、响应度设为 0.8 A/W，读出光电流 80 µA。', 'On the photodetector, set the incident power to -10 dBm and the responsivity to 0.8 A/W, and read a photocurrent of 80 µA.'),
  task4: loc('选择偏置漂移的后果：偏离正交点会降低消光比。', 'Choose the result of bias drift: drifting off quadrature lowers the extinction ratio.'),
  mzmTitle: loc('正交点把偏置放在半功率', 'Quadrature puts the bias at half power'),
  mzmOff: loc('当前不在正交点', 'Not at quadrature'),
  mzmText: loc(
    'V = 0 的输出是 {at0} mW，输入 P0 是 {p0} mW。高电平 P1 = {p1} mW，低电平 P0 = {p0l} mW，ER = {er}，OMA = {oma} mW，IL = {il} dB。',
    'The output at V = 0 is {at0} mW, and the input P0 is {p0} mW. High level P1 = {p1} mW, low level P0 = {p0l} mW, ER = {er}, OMA = {oma} mW, IL = {il} dB.',
  ),
  quadText: loc(
    '原因：φ0 = -π/2 是正交点，余弦项为 0，所以 V = 0 时 P = P0/2 = {half} mW。',
    'Reason: phi0 = -pi/2 is quadrature, the cosine term is 0, and at V = 0 the power is P0/2 = {half} mW.',
  ),
  fullText: loc(
    '原因：Vpp = Vπ = 4 V，在正交点上 ±Vπ/2 走到 P = P0 和 P = 0，所以 ER 为无穷大，OMA = P0 = {oma} mW。',
    'Reason: Vpp = Vpi = 4 V. At quadrature, plus or minus Vpi/2 reaches P = P0 and P = 0, so ER is infinite and OMA = P0 = {oma} mW.',
  ),
  driftText: loc(
    '偏离正交点会降低消光比。原因：两个驱动点离开余弦最陡的地方，同样的 Vpp 换来的 P1/P0 更小。当前 ER 是 {er}。',
    'Drifting off quadrature lowers the extinction ratio. Reason: the two drive points leave the steepest part of the cosine, so the same Vpp buys a smaller P1/P0. The ER at this bias is {er}.',
  ),
  pdTitle: loc('光电流是响应度乘功率', 'Photocurrent is responsivity times power'),
  pdText: loc(
    '光电流是 {sig} µA，加上暗电流后的总电流是 {tot} µA。原因：I = R·P + I_dark。{dbm} dBm 是 {mw} mW，乘以 R = {r} A/W。',
    'The photocurrent is {sig} µA, and the total current including dark current is {tot} µA. Reason: I = R*P + I_dark. {dbm} dBm is {mw} mW, times R = {r} A/W.',
  ),
  pd80: loc(
    '当入射是 -10 dBm、R = 0.8 A/W 时，0.1 mW × 0.8 A/W = 80 µA；暗电流再加 {n} nA，所以总电流比 80 µA 略大。',
    'At -10 dBm and R = 0.8 A/W, 0.1 mW times 0.8 A/W = 80 µA. Dark current adds {n} nA, so the total sits slightly above 80 µA.',
  ),
}

export const INTRO = [
  loc(
    '马赫-曾德尔调制器的功率是 P = (P0/2)·(1 + cos(πV/Vπ + φ0))。正交点取 φ0 = -π/2，曲线最陡，V = 0 时输出正好是 P0/2。消光比 ER = 10·log10(P1/P0)，光调制幅度 OMA = P1 - P0。插入损耗按平均功率相对 P0 来算。',
    'A Mach-Zehnder modulator has P = (P0/2) * (1 + cos(pi V/Vpi + phi0)). Quadrature uses phi0 = -pi/2, where the curve is steepest, and the output at V = 0 is exactly P0/2. Extinction ratio ER = 10 log10(P1/P0), and optical modulation amplitude OMA = P1 - P0. Insertion loss compares the average power with P0.',
  ),
  loc(
    '环调制器面积小、电容小，但谐振跟着温度走，偏置和波长都要锁。MZM 更长、驱动电压往往更高，工作点却宽得多。两者不能互换：一个靠谐振，一个靠两臂干涉。',
    'A ring modulator is small and has little capacitance, but the resonance follows temperature, so both the bias and the wavelength have to be locked. An MZM is longer and often needs a higher drive, but the operating point is much wider. They are not interchangeable: one relies on a resonance, the other on interference of two arms.',
  ),
  loc(
    '探测器的电流是 I = R·P + I_dark。响应度 R 的单位是 A/W。暗电流是没光时也存在的电流，nA 级，小信号时它会抬高噪声底。外置激光的 L-I 曲线则用来看阈值和斜率效率，那是 ELS 自己的测试。',
    'Photodetector current is I = R*P + I_dark. Responsivity R is in A/W. Dark current is the current with no light, usually nanoamperes, and it raises the noise floor on a small signal. The laser L-I curve is how threshold and slope efficiency are read; that test belongs to the ELS itself.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '驱动越大越好。超过 Vπ 之后，余弦会折返，眼图开始闭合，消光比不一定更高。',
    'A larger drive is always better. Past Vpi the cosine folds back, the eye starts to close, and the extinction ratio does not necessarily rise.',
  ),
  loc(
    '暗电流可以忽略。在 -10 dBm、0.8 A/W 时信号是 80 µA，暗电流若涨到微安就会明显抬高本底；它本身也是晶圆上能快速电测的一项。',
    'Dark current can be ignored. At -10 dBm and 0.8 A/W the signal is 80 µA. If the dark current rises into the microamperes it lifts the floor, and it is also a fast electrical screen on the wafer.',
  ),
  loc(
    '环调制器和 MZM 可以互换。环更小，但谐振对温度敏感；MZM 靠两臂的相位，工作点宽。测试项目、热控和驱动都不一样。',
    'A ring modulator and an MZM are interchangeable. The ring is smaller, but its resonance is thermally sensitive. The MZM uses the phase of two arms and has a wide operating point. The test list, the thermal control and the driver are different.',
  ),
]

export const TAKEAWAY: LText = loc(
  'MZM 在正交点（φ0 = -π/2）的 V = 0 输出是 P0/2。ER = 10·log10(P1/P0)，OMA = P1 - P0。满摆幅 ±Vπ/2 走到消光，ER 为无穷大。偏离正交点会降低 ER。环调制器更小也更怕温度，不能替换 MZM。探测器 I = R·P + I_dark。',
  'At MZM quadrature (phi0 = -pi/2) the output at V = 0 is P0/2. ER = 10 log10(P1/P0) and OMA = P1 - P0. A full swing of plus or minus Vpi/2 reaches extinction, so ER is infinite. Drifting off quadrature lowers ER. A ring modulator is smaller and more thermally sensitive, and it does not replace an MZM. A photodetector has I = R*P + I_dark.',
)

const P_HALF = mzmPower({ p0: 1, v: 0, vpi: 4, phi0: QUADRATURE_PHI })
const LEVELS = mzmLevels(1, 4, QUADRATURE_PHI, 4)
const UA = pdCurrent(dbmToW(-10), 0.8, 0) * 1e6

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('输入 P0 = 1 mW，正交点、V = 0 时输出是多少？', 'Input P0 = 1 mW. What is the output at quadrature and V = 0?'),
    options: [
      { id: 'a', text: loc(`${P_HALF.toFixed(2)} mW`, `${P_HALF.toFixed(2)} mW`) },
      { id: 'b', text: loc('1.00 mW', '1.00 mW') },
      { id: 'c', text: loc('0.00 mW', '0.00 mW') },
    ],
    answer: 'a',
    explain: loc(
      'φ0 = -π/2 时余弦项为 0，P = P0/2。1 mW 的一半是 0.50 mW。峰值偏置才会在 V = 0 给出全部 P0。',
      'With phi0 = -pi/2 the cosine term is 0, so P = P0/2. Half of 1 mW is 0.50 mW. A peak bias is what gives the full P0 at V = 0.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('入射 -10 dBm、响应度 0.8 A/W、先不计暗电流，光电流是多少？', 'Incident power -10 dBm, responsivity 0.8 A/W, ignoring dark current. What is the photocurrent?'),
    options: [
      { id: 'a', text: loc(`${UA.toFixed(0)} µA`, `${UA.toFixed(0)} µA`) },
      { id: 'b', text: loc('8 µA', '8 µA') },
      { id: 'c', text: loc('0.8 µA', '0.8 µA') },
    ],
    answer: 'a',
    explain: loc(
      '-10 dBm = 0.1 mW = 10^-4 W。I = 0.8 A/W × 10^-4 W = 80 µA。差一个 10 倍通常是把 dBm 的毫瓦数点错了位。',
      '-10 dBm = 0.1 mW = 1e-4 W. I = 0.8 A/W * 1e-4 W = 80 µA. A factor-of-ten error usually comes from shifting the milliwatt decimal.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('正交点、Vπ = 4 V、驱动 4 Vpp、P0 = 1 mW 时，OMA 是多少？', 'At quadrature, Vpi = 4 V, a 4 Vpp drive and P0 = 1 mW, what is the OMA?'),
    options: [
      { id: 'a', text: loc(`${LEVELS.oma.toFixed(2)} mW`, `${LEVELS.oma.toFixed(2)} mW`) },
      { id: 'b', text: loc('0.50 mW', '0.50 mW') },
      { id: 'c', text: loc('0.00 mW', '0.00 mW') },
    ],
    answer: 'a',
    explain: loc(
      '±Vπ/2 走到 P = P0 和 P = 0，所以 OMA = P0 - 0 = 1 mW，ER 为无穷大。0.50 mW 是正交点上 V = 0 的功率，不是两个电平之差。',
      'Plus or minus Vpi/2 reaches P = P0 and P = 0, so OMA = P0 - 0 = 1 mW and ER is infinite. 0.50 mW is the power at V = 0 on quadrature, not the difference of the two levels.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于 ER 和 OMA，下列哪些说法正确？(1) ER = 10·log10(P1/P0)；(2) OMA = P1 - P0；(3) 驱动一旦超过第一个零点，ER 一定继续变大；(4) ER 和 OMA 是同一个量。',
      'Which of these statements about ER and OMA are correct? (1) ER = 10 log10(P1/P0); (2) OMA = P1 - P0; (3) once the drive passes the first null, ER keeps increasing; (4) ER and OMA are the same quantity.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'b', text: loc('(1)、(3)、(4)', '(1), (3), (4)') },
      { id: 'c', text: loc('(2)、(3)', '(2), (3)') },
    ],
    answer: 'a',
    explain: loc(
      '(1) 是比值的分贝，(2) 是功率差，单位不同。(3) 错：过了零点余弦折返，两电平会重新靠近。(4) 错：一个是比值，一个是差值。',
      '(1) is a ratio in decibels and (2) is a power difference; the units differ. (3) is wrong: past the null the cosine folds back and the two levels move together again. (4) is wrong: one is a ratio and the other is a difference.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于环调制器和 MZM，下列哪些说法正确？(1) 环调制器面积小；(2) 环调制器对温度敏感；(3) 环调制器和 MZM 可以互换；(4) MZM 的正交点是线性偏置点。',
      'Which of these statements about a ring modulator and an MZM are correct? (1) A ring modulator is small; (2) a ring modulator is thermally sensitive; (3) a ring modulator and an MZM are interchangeable; (4) MZM quadrature is the linear bias point.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '环小，但谐振跟着温度走。MZM 的正交点落在余弦最陡、最接近直线的地方。两者的偏置、热控和测试都不一样，不能互换。',
      'The ring is small, but the resonance follows temperature. MZM quadrature sits where the cosine is steepest and closest to a straight line. The bias, the thermal control and the test list differ, so they are not interchangeable.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('偏置从正交点漂开，消光比怎样变？', 'What happens to the extinction ratio when the bias drifts off quadrature?'),
    options: [
      { id: 'a', text: loc('降低，因为驱动点离开了最陡的区域', 'It falls, because the drive points leave the steepest region') },
      { id: 'b', text: loc('提高，因为平均功率变了', 'It rises, because the average power changed') },
      { id: 'c', text: loc('不变，ER 只由 Vπ 决定', 'It stays the same; ER depends only on Vpi') },
    ],
    answer: 'a',
    explain: loc(
      '同样的 Vpp，在正交点能拉开最大的 P1 和 P0。漂向峰值或零点后，两点的功率差变小，ER 下降。',
      'The same Vpp opens the largest gap between P1 and P0 at quadrature. Drift toward the peak or the null shrinks that gap, so ER falls.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('暗电流在电流公式里处于什么位置？', 'Where does dark current sit in the current formula?'),
    options: [
      { id: 'a', text: loc('加在光电流上：I = R·P + I_dark', 'It adds to the photocurrent: I = R*P + I_dark') },
      { id: 'b', text: loc('它是一个 dB 损耗，从光功率里减去', 'It is a dB loss subtracted from the optical power') },
      { id: 'c', text: loc('它替换响应度，公式变成 I = I_dark·P', 'It replaces responsivity, so I = I_dark * P') },
    ],
    answer: 'a',
    explain: loc(
      '响应度乘的是光功率，暗电流是没光也有的一项，两者相加。它不是 dB，也不能代替 A/W。',
      'Responsivity multiplies optical power. Dark current is the term that remains with no light, and the two add. It is not a dB figure, and it does not replace A/W.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('正交点、满摆幅 ±Vπ/2、P0 = 1 mW 时，插入损耗大约是多少？', 'At quadrature with a full swing of plus or minus Vpi/2 and P0 = 1 mW, about what is the insertion loss?'),
    options: [
      { id: 'a', text: loc(`${LEVELS.ilDb.toFixed(2)} dB`, `${LEVELS.ilDb.toFixed(2)} dB`) },
      { id: 'b', text: loc('0.00 dB', '0.00 dB') },
      { id: 'c', text: loc('10.00 dB', '10.00 dB') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '两个电平是 P0 和 0，平均是 P0/2。IL = -10·log10((P0/2)/P0) = {il} dB，也就是 3 dB 那一档：平均功率是输入的一半。',
        'The two levels are P0 and 0, so the average is P0/2. IL = -10 log10((P0/2)/P0) = {il} dB, the 3 dB case: the average power is half the input.',
      ),
      { il: LEVELS.ilDb.toFixed(2) },
    ),
  },
]

export function taskItems(analysis: ModAnalysis): TaskItem[] {
  return [
    { id: 'quad', text: S.task1, done: analysis.task1 },
    { id: 'full', text: S.task2, done: analysis.task2 },
    { id: 'pd', text: S.task3, done: analysis.task3 },
    { id: 'drift', text: S.task4, done: analysis.task4 },
  ]
}

export function verdictOf(state: ModState, analysis: ModAnalysis): { title: LText; text: LText } {
  const er = fmtEr(analysis.erDb)
  const drift = state.drift === 'lowers' ? fill(S.driftText, { er }) : null
  if (state.tab === 'pd') {
    const mw = dbmToW(state.pdDbm) * 1e3
    const body = fill(S.pdText, {
      sig: (analysis.photoA * 1e6).toFixed(2),
      tot: (analysis.totalA * 1e6).toFixed(2),
      dbm: state.pdDbm.toFixed(0),
      mw: mw.toFixed(3),
      r: state.resp.toFixed(1),
    })
    const extra = analysis.task3 ? fill(S.pd80, { n: state.darkNa.toFixed(0) }) : null
    const withExtra = extra ? joinText(body, extra) : body
    return { title: S.pdTitle, text: drift ? joinText(withExtra, drift) : withExtra }
  }
  const body = fill(S.mzmText, {
    at0: analysis.at0.toFixed(3),
    p0: state.p0.toFixed(2),
    p1: analysis.pHigh.toFixed(3),
    p0l: analysis.pLow.toFixed(3),
    er,
    oma: analysis.oma.toFixed(3),
    il: analysis.ilDb.toFixed(2),
  })
  const parts = [body]
  if (analysis.quad) parts.push(fill(S.quadText, { half: (state.p0 / 2).toFixed(3) }))
  if (analysis.task2) parts.push(fill(S.fullText, { oma: analysis.oma.toFixed(3) }))
  if (drift) parts.push(drift)
  const text = parts.slice(1).reduce((acc, part) => joinText(acc, part), parts[0])
  return { title: analysis.quad ? S.mzmTitle : S.mzmOff, text }
}

import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { DUT_IDS, NORM_IDS, SETTLE_S, analyseSweep, erGapDb, type SweepAnalysis, type SweepState } from './picSweepModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const REF = analyseSweep({ dut: 'ring', spanNm: 8, stepNm: 0.5, laserDbm: 0, floorDbm: -50, norm: 'off', wanderDb: 0 })
const FSR_TXT = REF.fsr.toFixed(2)
const FWHM_TXT = REF.fineDip.fwhmNm.toFixed(2)
const FIFTH_TXT = (REF.fineDip.fwhmNm / 5).toFixed(2)

export const DUT_OPTIONS = DUT_IDS.map((id) => ({
  id,
  label: id === 'ring' ? loc('环形谐振器', 'Ring') : loc('MZI', 'MZI'),
}))

export const NORM_OPTIONS = NORM_IDS.map((id) => ({
  id,
  label: id === 'off' ? loc('关', 'Off') : loc('开', 'On'),
}))

export const S = {
  kickerNow: loc('这一次扫描', 'This sweep'),
  introTitle: loc('光源、功率计与波长扫描', 'Source, power meter and the wavelength sweep'),
  coreTitle: loc('拨一拨：步长、归一化与噪声底', 'Try it: step, normalization and the noise floor'),
  coreNote: loc(
    '蓝线是原始读数，金线是减去光栅回环之后的归一化谱。回环是平坦的，里面只有耦合偏移。谷值和线宽从噪声底截断之前的线性透射读出。',
    'Blue is the raw reading. Gold is the spectrum after subtracting a flat grating loop, which contains only the coupling offset. The dip and the linewidth are read from the linear transmission before the noise floor is applied.',
  ),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  dutLabel: loc('被测结构', 'Device'),
  spanLabel: loc('扫描范围', 'Span'),
  stepLabel: loc('步长', 'Step'),
  laserLabel: loc('激光功率', 'Laser power'),
  floorLabel: loc('噪声底', 'Noise floor'),
  normLabel: loc('归一化', 'Normalize'),
  wanderLabel: loc('耦合波动', 'Coupling wander'),
  rLam: loc('本次扫描的谷值', 'Dip on this step'),
  rFine: loc('细栅格的谷值', 'Dip on the fine grid'),
  rFsr: loc('FSR（解析）', 'FSR (analytic)'),
  rFwhm: loc('线宽 FWHM（细栅格）', 'Linewidth FWHM (fine grid)'),
  rEr: loc('真实消光比', 'True extinction ratio'),
  rMeas: loc('测得消光比（含噪声底）', 'Measured extinction ratio (with floor)'),
  rErr: loc('归一化平均误差', 'Mean error after normalization'),
  rTime: loc('点数与大致时间', 'Points and approximate time'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '光纤怎么对准、对准要花多少时间，是下一课的内容。',
    'How the fiber is aligned, and how long that takes, is the next lesson.',
  ),
  next: loc('下一课：光纤耦合与对准', 'Next: Fiber coupling and alignment'),
  task1: loc(
    '把步长调到细栅格线宽的 1/5 以下。步长越小，点数越多，测试时间越长。',
    'Set the step below one fifth of the fine-grid linewidth. A smaller step means more points and a longer test.',
  ),
  task2: loc(
    '打开归一化，并把耦合波动调到大于 0。归一化曲线相对去掉耦合后的真实谱，平均误差要小于 0.05 dB。',
    'Turn normalization on and set the coupling wander above 0. The mean error of the normalized curve against the true spectrum, with coupling removed, must be under 0.05 dB.',
  ),
  task3: loc(
    '让噪声底限制消光比：测得消光比要比真实消光比至少差 3 dB。侧栏会说明原因。',
    'Let the noise floor limit the extinction ratio: the measured ER must be at least 3 dB worse than the true ER. The side panel states the reason.',
  ),
  task4: loc(
    '把步长调到大于线宽。侧栏会说明峰可能被漏掉。',
    'Set the step larger than the linewidth. The side panel explains that the peak can be missed.',
  ),
  legRaw: loc('原始', 'Raw'),
  legNorm: loc('归一', 'Norm'),
  xLabel: loc('波长 nm', 'Wavelength nm'),
  yLabel: loc('dBm / dB', 'dBm / dB'),
  plotAria: loc('波长扫描谱，蓝线为原始读数，金线为归一化', 'Wavelength sweep, blue raw and gold normalized'),
  vTitleRing: loc('环形谐振器的扫描', 'Ring sweep'),
  vTitleMzi: loc('MZI 的扫描', 'MZI sweep'),
  vTitleFloor: loc('噪声底限制了消光比', 'The noise floor limits the extinction ratio'),
  vTitleMiss: loc('峰可能被漏掉', 'The peak can be missed'),
}

export const FIG_SUMMARY = loc(
  '游标在 {nm} nm：原始 {raw} dBm，归一化 {norm} dB。',
  'Cursor at {nm} nm: raw {raw} dBm, normalized {norm} dB.',
)

const vBody = loc(
  '结论：{kind}。FSR 是 {fsr} nm，细栅格线宽 {fwhm} nm，这次扫描的谷值在 {lam} nm（细栅格 {fine} nm）。原因：读数来自步长 {step} nm 的采样，线宽的 1/5 是 {fifth} nm。归一化相对真实谱的平均误差是 {err} dB。这一扫描有 {n} 个点，按每点 {settle} ms 约 {sec} s；步长再减小，测试时间会变长。',
  'Conclusion: {kind}. FSR is {fsr} nm, the fine-grid linewidth is {fwhm} nm, and the dip on this step is at {lam} nm (fine grid {fine} nm). Reason: the reading is sampled at a step of {step} nm, and one fifth of the linewidth is {fifth} nm. The mean error of the normalized curve against the true spectrum is {err} dB. This scan has {n} points, about {sec} s at {settle} ms each; a smaller step makes the test longer.',
)

const vFloor = loc(
  '噪声底把谷值截在 {floor} dBm，测得消光比 {meas} dB，比真实消光比 {trueEr} dB 差了 {gap} dB。原因：谷底已经埋进仪器噪声，再深的谐振也读不出来。',
  'The noise floor clamps the dip at {floor} dBm, so the measured ER is {meas} dB, which is {gap} dB worse than the true ER of {trueEr} dB. Reason: the bottom of the dip is buried in the instrument noise, and a deeper resonance cannot be read.',
)

const vMiss = loc(
  '步长 {step} nm 已经大于线宽 {fwhm} nm，峰可能被漏掉。原因：采样间隔比整个谐振还宽，谷值可能落在两个点之间，读到的只是峰的肩膀。',
  'The step of {step} nm is larger than the linewidth of {fwhm} nm, so the peak can be missed. Reason: the sample spacing is wider than the whole resonance, the dip can fall between two points, and the meter only sees the shoulder.',
)

export const INTRO = [
  loc(
    '可调谐激光器（TLS）按步长改变波长，光功率计在每个波长上读一次功率，连起来就是传输谱。扫描范围要盖住你关心的谐振或干涉条纹。',
    'A tunable laser steps the wavelength, and a power meter reads the power at each step. Joined together, the readings are a transmission spectrum. The span has to cover the resonance or the fringe you care about.',
  ),
  loc(
    '光纤和光栅的耦合会整体上下浮动。量产时用一段参考回环（直波导加同样的耦合器）做归一化：器件谱减去回环谱，耦合和光源的共同波动就被消掉。dB 的加减见 {@rfDb}。',
    'Fiber and grating coupling wander up and down as a whole. In production a reference loop (a straight waveguide with the same couplers) is subtracted from the device spectrum, which removes the shared coupling and source drift. Adding and subtracting dB is covered in {@rfDb}.',
  ),
  loc(
    '步长要比线宽细，大约小于线宽的 1/5，谷值才不会落在两个采样点之间。步长更小，点数更多，测试时间更长。噪声底则决定你能读到的最大消光比。',
    'The step has to be finer than the linewidth, about one fifth of it, or the dip falls between two samples. A smaller step means more points and a longer test. The noise floor sets the largest extinction ratio you can read.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '步长越小越好。步长小于线宽的大约 1/5 之后，峰位不再明显变准，点数和测试时间却继续增加。',
    'A smaller step is always better. Once the step is below about one fifth of the linewidth, the peak location stops improving, while the point count and the test time keep growing.',
  ),
  loc(
    '不归一化也能得到器件自己的损耗。耦合波动会整条曲线一起上下移动，不减参考回环，你读到的是耦合加器件。',
    'You can read the device loss without normalizing. Coupling wander shifts the whole curve, so without the reference loop the reading is coupling plus device.',
  ),
  loc(
    '消光比越大，测得越准。谷值一旦低于噪声底，读数就停在噪声底上，报出来的消光比是被仪器截断的。',
    'A larger extinction ratio is measured more accurately. Once the dip goes below the noise floor, the reading stops at the floor, and the reported ER is clipped by the instrument.',
  ),
]

export const TAKEAWAY: LText = loc(
  'TLS 加功率计按步长拼出传输谱。归一化减去平坦的光栅回环，耦合偏移就消失。步长要小于线宽的约 1/5，但步长更小会拉长测试时间。噪声底截住谷值，从而限制读到的消光比。',
  'A TLS and a power meter build the spectrum one step at a time. Normalization subtracts a flat grating loop, so the coupling offset disappears. The step should be under about one fifth of the linewidth, but a smaller step makes the test longer. The noise floor clamps the dip and limits the extinction ratio you can read.',
)

export function taskItems(state: SweepState, analysis: SweepAnalysis): TaskItem[] {
  const gap = erGapDb(analysis)
  return [
    { id: 't1', text: S.task1, done: state.stepNm < analysis.fineDip.fwhmNm / 5 },
    { id: 't2', text: S.task2, done: state.norm === 'on' && state.wanderDb > 0 && analysis.meanErrDb < 0.05 },
    { id: 't3', text: S.task3, done: gap >= 3 },
    { id: 't4', text: S.task4, done: state.stepNm > analysis.fineDip.fwhmNm },
  ]
}

export function verdictOf(state: SweepState, analysis: SweepAnalysis): { title: LText; text: LText } {
  const gap = erGapDb(analysis)
  const kind = state.dut === 'ring' ? loc('环形谐振器，谷值是谐振', 'a ring, and the dip is a resonance') : loc('MZI，谷值是干涉零点', 'an MZI, and the dip is an interference null')
  const nums = {
    kind: kind.zh,
    fsr: analysis.fsr.toFixed(2),
    fwhm: analysis.fineDip.fwhmNm.toFixed(2),
    lam: analysis.scanDip.lambda0.toFixed(3),
    fine: analysis.fineDip.lambda0.toFixed(3),
    step: state.stepNm.toFixed(2),
    fifth: (analysis.fineDip.fwhmNm / 5).toFixed(2),
    err: analysis.meanErrDb.toFixed(3),
    n: String(analysis.points),
    settle: String(Math.round(SETTLE_S * 1000)),
    sec: analysis.timeS.toFixed(2),
  }
  const numsEn = {
    ...nums,
    kind: kind.en ?? kind.zh,
  }
  const parts: LText[] = [fill(vBody, nums)]
  parts[0] = { zh: fill(vBody, nums).zh, en: fill(vBody, numsEn).en }
  if (gap >= 3) {
    parts.push(
      fill(vFloor, {
        floor: state.floorDbm.toFixed(0),
        meas: analysis.measuredErDb.toFixed(1),
        trueEr: analysis.fineDip.erDb.toFixed(1),
        gap: gap.toFixed(1),
      }),
    )
  }
  if (state.stepNm > analysis.fineDip.fwhmNm) {
    parts.push(fill(vMiss, { step: state.stepNm.toFixed(2), fwhm: analysis.fineDip.fwhmNm.toFixed(2) }))
  }
  let title = state.dut === 'ring' ? S.vTitleRing : S.vTitleMzi
  if (gap >= 3) title = S.vTitleFloor
  if (state.stepNm > analysis.fineDip.fwhmNm) title = S.vTitleMiss
  return {
    title,
    text: { zh: parts.map((p) => p.zh).join(''), en: parts.map((p) => p.en ?? '').join(' ') },
  }
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('波长扫描的谱是怎么来的？', 'Where does a wavelength-sweep spectrum come from?'),
    options: [
      { id: 'a', text: loc('激光固定波长，示波器一次抓完整条谱', 'The laser stays at one wavelength and an oscilloscope grabs the whole spectrum at once') },
      { id: 'b', text: loc('可调谐激光器逐步改波长，功率计在每一步读功率', 'A tunable laser steps the wavelength and a power meter reads the power at each step') },
      { id: 'c', text: loc('只测一个波长的功率，再乘以长度', 'Measure the power at one wavelength and multiply by the length') },
    ],
    answer: 'b',
    explain: loc(
      'TLS 每走一步，功率计读一次。把这些点连起来才是传输谱，所以点数直接决定测试时间。',
      'The TLS takes one step, the power meter reads once, and the points joined together are the spectrum. The point count is the test time.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于归一化和噪声底，哪些说法对？(1) 参考回环用来消掉耦合和光源的共同波动；(2) 归一化之后耦合偏移还在谱上；(3) 谷值低于噪声底时，读到的消光比会被截断；(4) 噪声底越高，能读到的消光比越大。',
      'Which statements about normalization and the noise floor are right? (1) A reference loop removes the shared coupling and source drift; (2) after normalization the coupling offset is still on the spectrum; (3) once the dip is below the noise floor, the read ER is clipped; (4) a higher noise floor lets you read a larger ER.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'c', text: loc('(1)、(4)', '(1), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1) 和 (3) 是对的。归一化就是把回环减掉，耦合偏移应当消失。(4) 反了：噪声底越高，谷值越早被截住，读到的消光比越小。',
      '(1) and (3) are right. Normalization subtracts the loop, so the coupling offset should disappear. (4) is backwards: a higher floor clips the dip sooner, and the ER you can read gets smaller.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      `这颗虚拟环在当前参数下的 FSR 大约是多少？（由 λ² / (ng·L) 算出）`,
      `About how large is this virtual ring's FSR at the current parameters? (from λ² / (ng·L))`,
    ),
    options: [
      { id: 'a', text: loc(`${(Number(FSR_TXT) / 2).toFixed(2)} nm`, `${(Number(FSR_TXT) / 2).toFixed(2)} nm`) },
      { id: 'b', text: loc(`${FSR_TXT} nm`, `${FSR_TXT} nm`) },
      { id: 'c', text: loc(`${(Number(FSR_TXT) * 2).toFixed(2)} nm`, `${(Number(FSR_TXT) * 2).toFixed(2)} nm`) },
    ],
    answer: 'b',
    explain: loc(
      `FSR = λ² / (ng·L)。这颗环的解析结果是 ${FSR_TXT} nm，和扫描图上相邻谐振的间距一致。`,
      `FSR = λ² / (ng·L). The analytic result for this ring is ${FSR_TXT} nm, the same spacing as neighboring resonances on the sweep.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '峰顶读数是 0 dBm，噪声底是 −12 dBm。仪器最多能读出多大的消光比？',
      'The peak reads 0 dBm and the noise floor is −12 dBm. What is the largest extinction ratio the instrument can report?',
    ),
    options: [
      { id: 'a', text: loc('6 dB', '6 dB') },
      { id: 'b', text: loc('12 dB', '12 dB') },
      { id: 'c', text: loc('24 dB', '24 dB') },
    ],
    answer: 'b',
    explain: loc(
      '谷值最深也只能停在噪声底。峰在 0 dBm、底在 −12 dBm，读到的消光比就是 12 dB。',
      'The dip cannot be read below the noise floor. With the peak at 0 dBm and the floor at −12 dBm, the reported ER is 12 dB.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      `细栅格线宽约 ${FWHM_TXT} nm。哪个步长小于线宽的 1/5（约 ${FIFTH_TXT} nm）？`,
      `The fine-grid linewidth is about ${FWHM_TXT} nm. Which step is smaller than one fifth of the linewidth (about ${FIFTH_TXT} nm)?`,
    ),
    options: [
      { id: 'a', text: loc('0.50 nm', '0.50 nm') },
      { id: 'b', text: loc('0.20 nm', '0.20 nm') },
      { id: 'c', text: loc('1.50 nm', '1.50 nm') },
    ],
    answer: 'b',
    explain: loc(
      `线宽的 1/5 约 ${FIFTH_TXT} nm。0.20 nm 比它小，峰位才稳；0.50 nm 和 1.50 nm 都更粗。步长继续减小会增加测试时间。`,
      `One fifth of the linewidth is about ${FIFTH_TXT} nm. 0.20 nm is smaller, so the peak location stays stable; 0.50 nm and 1.50 nm are coarser. Making the step still smaller increases the test time.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '关于步长和测试时间，哪些说法对？(1) 步长大于线宽时，谐振峰可能落在两个采样点之间；(2) 步长越小，测试时间越短；(3) 点数约等于范围除以步长；(4) 线宽的大约 1/5 是一个够用的步长上限。',
      'Which statements about step and test time are right? (1) When the step is wider than the linewidth, the resonance can fall between two samples; (2) a smaller step makes the test shorter; (3) the point count is about the span divided by the step; (4) about one fifth of the linewidth is a sufficient upper bound on the step.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)', '(1), (2)') },
      { id: 'b', text: loc('(1)、(3)、(4)', '(1), (3), (4)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'b',
    explain: loc(
      '(1)、(3)、(4) 对。(2) 反了：步长越小，点数越多，测试时间越长。',
      '(1), (3) and (4) are right. (2) is backwards: a smaller step means more points and a longer test.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '耦合波动把整条谱上移了 2 dB。打开归一化、用平坦的光栅回环做参考之后，这 2 dB 会怎样？',
      'Coupling wander has shifted the whole spectrum up by 2 dB. After you turn normalization on and use a flat grating loop as the reference, what happens to that 2 dB?',
    ),
    options: [
      { id: 'a', text: loc('还在，因为归一化只改变线宽', 'It stays, because normalization only changes the linewidth') },
      { id: 'b', text: loc('被减掉，因为回环里只有同样的耦合偏移', 'It is subtracted, because the loop contains only the same coupling offset') },
      { id: 'c', text: loc('变成谐振波长的移动', 'It turns into a shift of the resonant wavelength') },
    ],
    answer: 'b',
    explain: loc(
      '回环是平坦的，读数等于激光功率减去耦合偏移。器件谱减去这个参考之后，共同的偏移消失，剩下的是器件自己的形状。',
      'The loop is flat, so its reading is the laser power minus the coupling offset. Subtracting that reference removes the shared offset and leaves the shape of the device.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('下面哪一项是量产扫描里必须有的？', 'Which of these does a production sweep need?'),
    options: [
      { id: 'a', text: loc('一条参考回环，用来归一化', 'A reference loop, used for normalization') },
      { id: 'b', text: loc('把步长固定成 0.001 nm，不管线宽', 'A step fixed at 0.001 nm, regardless of the linewidth') },
      { id: 'c', text: loc('用平均功率代替每个波长的读数', 'Average power instead of a reading at each wavelength') },
    ],
    answer: 'a',
    explain: loc(
      '参考结构用来扣掉耦合和光源的波动，是量产扫描的一部分。步长按线宽来选，不是越细越好。',
      'A reference structure removes coupling and source drift, and it is part of a production sweep. The step is chosen from the linewidth; finer is not automatically better.',
    ),
  },
]

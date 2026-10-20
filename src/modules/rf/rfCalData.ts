import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { DEFAULT_CAL, SPEC_DB, type CalMethod, type CalResult, type CalState, smoothLossDb } from './rfCalModel'

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

export const CAL_OPTIONS: Array<{ id: CalMethod; label: LText }> = [
  { id: 'none', label: loc('不校准', 'No calibration') },
  { id: 'deembed', label: loc('仪器端口直通 + 去嵌入', 'Port thru + de-embedding') },
  { id: 'dut', label: loc('DUT 接口直通校准', 'Thru cal at DUT interface') },
]

export const S = {
  kickerNow: loc('这一次校准', 'This calibration run'),
  introTitle: loc('线缆和夹具也被测进了结果', 'The cable and fixture are measured too'),
  coreTitle: loc('拨一拨：损耗、纹波与校准方式', 'Try it: loss, ripple and calibration method'),
  coreNote: loc(
    '测得值 = 真值 × 误差因子，换成 dB 就是相加。红线是不校准时的误差，蓝线是按当前方式补偿后的误差，金色带是 ±0.3 dB 的规格。',
    'Measured = true × error factor; in dB the two add. The red line is the error without calibration, the blue line is the error after the chosen compensation, and the gold band is the ±0.3 dB spec.',
  ),
  methodLabel: loc('校准方式（参考面的位置）', 'Calibration method (where the reference plane is)'),
  lossLabel: loc('线缆 + 夹具损耗 k', 'Cable + fixture loss k'),
  rippleLabel: loc('失配纹波幅度 r', 'Mismatch ripple r'),
  uncLabel: loc('直通标准件不确定度 u', 'Thru standard uncertainty u'),
  rLoss: loc('6 GHz 处的平滑损耗', 'Smooth loss at 6 GHz'),
  rBefore: loc('校准前最大误差', 'Largest error before calibration'),
  rAfter: loc('补偿后最大误差', 'Largest error after compensation'),
  rSpec: loc('规格', 'Spec'),
  rVerdict: loc('判定（±0.3 dB）', 'Verdict (±0.3 dB)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的校准还要做两端口（S11、S22）的反射修正、TRL / SOLT 等标准件组合，以及温度漂移；这里只练直通标准件、参考面和去嵌入三件事。',
    'Real calibration also corrects the reflection terms (S11, S22) with TRL / SOLT standard sets and handles temperature drift; here we only practise the thru standard, the reference plane and de-embedding.',
  ),
  next: loc('下一课：综合：RF 收发器测试', 'Next: Capstone: RF Transceiver Test'),
  task1: loc('不校准，找出超出 ±0.3 dB 的最大误差（看右侧读数）。', 'Without calibration, find the largest error beyond ±0.3 dB (see the readout).'),
  task2: loc('切换到“DUT 接口直通校准”，让补偿后的误差 PASS。', 'Switch to “Thru cal at DUT interface” so the compensated error is PASS.'),
  task3: loc(
    '选“仪器端口直通 + 去嵌入”，把纹波调到 0.4 dB 以上，看去嵌入为什么不够。',
    'Choose “Port thru + de-embedding”, raise the ripple to 0.4 dB or more, and see why de-embedding is not enough.',
  ),
  task4: loc(
    '切到 DUT 接口校准，把标准件不确定度 u 调到 0.15 dB 以上，看补偿后的误差如何变。',
    'Use DUT-interface calibration, raise the standard uncertainty u to 0.15 dB or more, and watch how the compensated error changes.',
  ),
}

export const FIG = {
  pathAria: loc('链路示意：仪器端口、线缆、夹具、DUT，以及两个可能的校准参考面', 'Signal path: instrument port, cable, fixture, DUT, and the two possible calibration reference planes'),
  boxInstrument: loc('仪器', 'Instrument'),
  boxCable: loc('线缆', 'Cable'),
  boxFixture: loc('夹具', 'Fixture'),
  boxDut: loc('DUT', 'DUT'),
  planePort: loc('仪器端口', 'Instrument port'),
  planeDut: loc('DUT 接口', 'DUT interface'),
  errAria: loc('误差随频率的曲线：校准前后对比，金色带为 ±0.3 dB 规格', 'Error versus frequency: before and after calibration, with the gold band as the ±0.3 dB spec'),
  errCap: loc(
    '横轴是频率（0.5–6 GHz），纵轴是测得值减去真值（dB）。红线是校准前，蓝线是校准后；两条线重合，说明这种方式没有修掉误差。',
    'Horizontal axis: frequency (0.5–6 GHz); vertical axis: measured minus true (dB). Red is before calibration, blue after; coincident lines mean this method did not remove the error.',
  ),
  legendBefore: loc('校准前', 'Before'),
  legendAfter: loc('校准后', 'After'),
  unitDb: loc('dB', 'dB'),
  unitGhz: loc('GHz', 'GHz'),
}

export const PATH_CAP: Record<CalMethod, LText> = {
  none: loc(
    '参考面在仪器端口。线缆和夹具在参考面之后，它们的损耗和纹波全部算进了测得值。',
    'The reference plane is at the instrument port. The cable and fixture sit beyond it, so their loss and ripple all end up in the reading.',
  ),
  deembed: loc(
    '参考面仍在仪器端口，直通校准只修仪器本身。随后用夹具模型扣掉平滑损耗；模型里没有纹波，纹波留在残差中。',
    'The reference plane stays at the instrument port, so the thru cal only corrects the instrument. The fixture model then removes the smooth loss; ripple is not in the model and stays in the residual.',
  ),
  dut: loc(
    '参考面移到 DUT 接口。直通标准件接在这里校准，线缆、夹具和纹波都进入误差因子，测 DUT 时一并除掉。',
    'The reference plane moves to the DUT interface. The thru standard is measured there, so cable, fixture and ripple all enter the error factor and are removed together.',
  ),
}

export const INTRO = [
  loc(
    '仪器和 DUT 之间隔着线缆与夹具（Load Board 上的 RF 走线、接头）。它们有损耗、有相位，还会因为失配产生纹波。仪器读到的不是 DUT 的真值，而是 DUT 加上整段通路的结果，{@rfSystem} 里算过的链路损耗就是这一段。',
    'Between the instrument and the DUT sit the cable and fixture (RF traces and connectors on the load board). They add loss and phase, and mismatch adds ripple. The instrument reads not the DUT’s true value but the DUT plus the whole path; the path loss worked out in {@rfSystem} is this segment.',
  ),
  loc(
    '校准的做法：用已知的标准件（直通 Thru、开路、短路或负载）测一次，求出这段通路的误差因子，之后测 DUT 时把它除掉。去嵌入（de-embedding）是另一条路：不再实测标准件，而是用夹具的数学模型把它从结果里扣掉。二端口的描述见 {@rfSparam}。',
    'Calibration measures known standards (thru, open, short or load) once, works out the error factor of this path, and divides it out when measuring the DUT. De-embedding is another route: instead of measuring a standard, a mathematical model of the fixture is subtracted from the result. The two-port description is in {@rfSparam}.',
  ),
]

export const MISCONCEPTIONS = [
  loc(
    '线缆损耗设一个固定补偿值就行。损耗随频率变化，失配还会造成纹波；一个常数只能修平均值，修不了斜率和纹波。',
    'A fixed loss offset is enough. Loss changes with frequency and mismatch adds ripple; a single constant fixes only the average, not the slope or the ripple.',
  ),
  loc(
    '在仪器端口校准过，线缆就不用管了。参考面在仪器端口时，线缆和夹具都在参考面之后，校准管不到它们。',
    'After a calibration at the instrument port, the cable can be ignored. With the reference plane at the instrument port, the cable and fixture lie beyond it and the calibration cannot reach them.',
  ),
  loc(
    '标准件是绝对真值，校准越做越准。标准件本身也有不确定度，补偿后的误差不会比它更小。',
    'The standard is the absolute truth, so calibration can always get more accurate. The standard itself has uncertainty, and the compensated error cannot be smaller than it.',
  ),
]

export const TAKEAWAY = loc(
  '测得值 = 真值 × 误差因子，dB 下相加。校准 = 用已知标准件求出误差因子；参考面放在哪里，决定哪些损耗被修掉。去嵌入只能修掉模型里有的部分（平滑损耗），纹波要靠校准实测。补偿后的误差不会比标准件的不确定度更小。',
  'Measured = true × error factor, which adds in dB. Calibration = using known standards to find the error factor; where the reference plane sits decides which losses get removed. De-embedding can only remove what its model contains (smooth loss); ripple must be measured by calibration. The compensated error cannot be smaller than the standard’s uncertainty.',
)

/** 小测题干里的数字都由模型常量算出 */
const LOSS_K = DEFAULT_CAL.lossPerGhz
const RIPPLE_Q = 0.4
const UNC_Q = 0.2

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `线缆 + 夹具的损耗系数为 ${f1(LOSS_K)} dB/GHz 时，4 GHz 处的平滑损耗是多少？`,
      `With a cable + fixture loss of ${f1(LOSS_K)} dB/GHz, what is the smooth loss at 4 GHz?`,
    ),
    options: [
      { id: 'a', text: loc(`${f1(LOSS_K)} dB`, `${f1(LOSS_K)} dB`) },
      { id: 'b', text: loc(`${f1(smoothLossDb(4, LOSS_K))} dB`, `${f1(smoothLossDb(4, LOSS_K))} dB`) },
      { id: 'c', text: loc(`${f0(smoothLossDb(4, LOSS_K) * 10)} dB`, `${f0(smoothLossDb(4, LOSS_K) * 10)} dB`) },
    ],
    answer: 'b',
    explain: loc(
      `损耗随频率线性增加：${f1(LOSS_K)} × 4 = ${f1(smoothLossDb(4, LOSS_K))} dB。同样的模型下 6 GHz 为 ${f1(smoothLossDb(6, LOSS_K))} dB，是规格 ±${f1(SPEC_DB)} dB 的 ${f0(smoothLossDb(6, LOSS_K) / SPEC_DB)} 倍，所以这种损耗不能忽略。`,
      `Loss grows linearly with frequency: ${f1(LOSS_K)} × 4 = ${f1(smoothLossDb(4, LOSS_K))} dB. In the same model 6 GHz gives ${f1(smoothLossDb(6, LOSS_K))} dB, which is ${f0(smoothLossDb(6, LOSS_K) / SPEC_DB)} times the ±${f1(SPEC_DB)} dB spec, so it cannot be ignored.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('在仪器端口做直通校准后，测 DUT 时线缆损耗会怎样？', 'After a thru calibration at the instrument port, what happens to the cable loss when you measure the DUT?'),
    options: [
      { id: 'a', text: loc('被完全修掉', 'Fully removed') },
      { id: 'b', text: loc('被放大一倍', 'Doubled') },
      {
        id: 'c',
        text: loc('仍在测量结果里：参考面在仪器端口，线缆在参考面之后', 'Still in the reading: the reference plane is at the instrument port, so the cable lies beyond it'),
      },
    ],
    answer: 'c',
    explain: loc(
      '校准只修正参考面之前的误差。线缆和夹具在参考面之后，校准管不到它们；要修掉它们，参考面要移到 DUT 接口，或者用去嵌入扣掉模型里的部分。',
      'Calibration corrects only the errors before the reference plane. The cable and fixture are beyond it, so the calibration cannot reach them; to remove them the reference plane must move to the DUT interface, or de-embedding must subtract them.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      `去嵌入只补偿平滑损耗。夹具的失配纹波峰值为 ${f1(RIPPLE_Q)} dB，去嵌入后的残差大约是多少？`,
      `De-embedding only compensates the smooth loss. The fixture ripple peaks at ${f1(RIPPLE_Q)} dB; about how large is the residual after de-embedding?`,
    ),
    options: [
      { id: 'a', text: loc(`${f1(RIPPLE_Q)} dB`, `${f1(RIPPLE_Q)} dB`) },
      { id: 'b', text: loc('0 dB', '0 dB') },
      { id: 'c', text: loc(`${f1(RIPPLE_Q * 10)} dB`, `${f1(RIPPLE_Q * 10)} dB`) },
    ],
    answer: 'a',
    explain: loc(
      '去嵌入模型只有 k·f，没有纹波，所以纹波整体留在残差里，峰值约等于纹波幅度。纹波要靠 DUT 接口的直通校准实测修掉。',
      'The de-embedding model contains only k·f and no ripple, so the ripple stays in the residual and its peak is about the ripple amplitude. Ripple must be measured and removed by a thru calibration at the DUT interface.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `在 DUT 接口做直通校准，标准件不确定度为 ${f2(UNC_Q)} dB。补偿后的误差最好能做到多少？`,
      `Thru calibration at the DUT interface uses a standard with ${f2(UNC_Q)} dB uncertainty. What is the best compensated error you can reach?`,
    ),
    options: [
      { id: 'a', text: loc('零，校准是理想的', 'Zero: calibration is ideal') },
      { id: 'b', text: loc('不会比标准件本身的不确定度更小', 'Not smaller than the standard’s own uncertainty') },
      { id: 'c', text: loc('可以比标准件更准，只要多测几次', 'More accurate than the standard if you average enough') },
    ],
    answer: 'b',
    explain: loc(
      '误差因子里包含了标准件的偏差，修正时它被原样带进结果。平均、重测只能压掉测量噪声，压不掉标准件固定的偏差。',
      'The error factor contains the standard’s deviation, which is carried into the result unchanged. Averaging and re-measuring only reduce measurement noise; they cannot remove the standard’s fixed deviation.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('用 dB 表示时，修正公式应该是哪一个？（测得值和误差因子都用 dB）', 'In dB, which correction formula is right? (measured value and error factor both in dB)'),
    options: [
      { id: 'a', text: loc('修正 = 测得 dB × 误差 dB', 'Correction = measured dB × error dB') },
      { id: 'b', text: loc('修正 = 测得 dB + 误差 dB', 'Correction = measured dB + error dB') },
      { id: 'c', text: loc('修正 = 测得 dB − 误差 dB', 'Correction = measured dB − error dB') },
    ],
    answer: 'c',
    explain: loc(
      '测得 = 真值 × 误差因子，取 dB 后变成相加：测得 dB = 真值 dB + 误差 dB，所以真值 dB = 测得 dB − 误差 dB。',
      'Measured = true × error factor; in dB this becomes a sum: measured dB = true dB + error dB, so true dB = measured dB − error dB.',
    ),
  },
]

/** 四条任务卡：完成情况由当前设置与结果实时算出 */
export function taskItems(state: CalState, result: CalResult): TaskItem[] {
  return [
    { id: 'none-fail', text: S.task1, done: state.method === 'none' && result.maxBefore > SPEC_DB },
    { id: 'dut-pass', text: S.task2, done: state.method === 'dut' && result.pass },
    { id: 'ripple', text: S.task3, done: state.method === 'deembed' && state.ripple >= 0.4 && !result.pass },
    { id: 'unc', text: S.task4, done: state.method === 'dut' && state.stdUnc >= 0.15 },
  ]
}

/** 右侧说明栏：结论 + 原因，原因写在同一段里 */
export function verdictOf(state: CalState, result: CalResult): { title: LText; text: LText } {
  const before = f2(result.maxBefore)
  const after = f2(result.maxAfter)
  const loss = f2(result.lossAtStop)
  const ripple = f2(state.ripple)
  const unc = f2(state.stdUnc)

  if (state.method === 'none') {
    if (result.maxBefore > SPEC_DB) {
      return {
        title: S.fail,
        text: loc(
          `不校准时，6 GHz 处线缆和夹具的平滑损耗约 ${loss} dB，最大误差幅度 ${before} dB，超出 ±${f1(SPEC_DB)} dB。原因：参考面在仪器端口，线缆和夹具都在参考面之后，被当成 DUT 的一部分测了进去。`,
          `Without calibration, the smooth loss of cable and fixture at 6 GHz is about ${loss} dB, and the largest error magnitude is ${before} dB, beyond ±${f1(SPEC_DB)} dB. Reason: the reference plane is at the instrument port, so the cable and fixture lie beyond it and are measured as part of the DUT.`,
        ),
      }
    }
    return {
      title: S.pass,
      text: loc(
        `这次不校准也在规格内：最大误差幅度 ${before} dB，小于 ±${f1(SPEC_DB)} dB。损耗小、纹波小时可以不校准；把损耗或纹波调大，就会超出规格。`,
        `Without calibration it is still within spec: the largest error magnitude is ${before} dB, below ±${f1(SPEC_DB)} dB. When loss and ripple are small, calibration can be skipped; raise them and the error goes out of spec.`,
      ),
    }
  }

  if (state.method === 'deembed') {
    if (result.pass) {
      return {
        title: S.pass,
        text: loc(
          `去嵌入扣掉了平滑损耗，剩下的误差基本只有纹波和噪声，最大 ${after} dB，在规格内。纹波 ${ripple} dB 没有进入夹具模型，它的大小决定了这种方法的上限。`,
          `De-embedding removed the smooth loss, so what remains is mostly ripple and noise: the largest is ${after} dB, within spec. The ${ripple} dB ripple is not in the fixture model, and its size sets the limit of this method.`,
        ),
      }
    }
    return {
      title: S.fail,
      text: loc(
        `去嵌入只补偿了平滑损耗。失配纹波 ${ripple} dB 没有进入夹具模型，残差最大 ${after} dB，超出 ±${f1(SPEC_DB)} dB。要修掉纹波，需要在 DUT 接口做直通校准。`,
        `De-embedding only compensated the smooth loss. The ${ripple} dB mismatch ripple is not in the fixture model, so the residual reaches ${after} dB, beyond ±${f1(SPEC_DB)} dB. To remove the ripple, use a thru calibration at the DUT interface.`,
      ),
    }
  }

  if (result.pass) {
    return {
      title: S.pass,
      text: loc(
        `参考面在 DUT 接口，误差因子包含线缆、夹具和纹波。补偿后只剩标准件不确定度与测量噪声，最大 ${after} dB，在规格内。`,
        `The reference plane is at the DUT interface, so the error factor includes cable, fixture and ripple. After compensation only the standard’s uncertainty and measurement noise remain: the largest is ${after} dB, within spec.`,
      ),
    }
  }
  return {
    title: S.fail,
    text: loc(
      `补偿后最大误差 ${after} dB，超出 ±${f1(SPEC_DB)} dB。主要原因：直通标准件的不确定度 u = ${unc} dB 被原样带进了误差因子，校准不可能比标准件更准。`,
      `The largest compensated error is ${after} dB, beyond ±${f1(SPEC_DB)} dB. Main reason: the thru standard’s uncertainty u = ${unc} dB is carried straight into the error factor, and calibration cannot be more accurate than its standard.`,
    ),
  }
}

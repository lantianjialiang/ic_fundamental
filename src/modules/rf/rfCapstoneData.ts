import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  BER_BITS,
  BER_LIMIT,
  EBN0_REQ_DB,
  EVM_LIMIT_PCT,
  GAIN_LIMIT_DB,
  IMPL_LOSS_DB,
  POUT_LIMIT_DBM,
  SENS_SPEC_DBM,
  SNR_REQ_DB,
  qInverse,
  type Bin,
  type CapState,
  type DeviceResult,
  type StopAt,
  type Summary,
} from './rfCapstoneModel'

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

/** 测试步骤（顺序即执行顺序） */
export const STEP_LABELS: LText[] = [
  loc('上电与校准', 'Power-up & cal'),
  loc('Tx 输出功率', 'Tx output power'),
  loc('Tx EVM', 'Tx EVM'),
  loc('Rx 增益', 'Rx gain'),
  loc('Rx 灵敏度（BER）', 'Rx sensitivity (BER)'),
]

/** 停止项对应的步骤序号；none 表示全部通过 */
const STOP_INDEX: Record<StopAt, number> = { none: 99, txPower: 1, txEvm: 2, rxGain: 3, rxBer: 4 }

export type StepStatus = 'pass' | 'fail' | 'skip'

/** 第 step 步的状态：在停止项之前为通过，停止项为失败，之后为跳过 */
export function stepStatus(stopAt: StopAt, step: number): StepStatus {
  const at = STOP_INDEX[stopAt]
  if (step > at) {
    return 'skip'
  }
  if (step === at) {
    return 'fail'
  }
  return 'pass'
}

export const STATUS_LABELS: Record<StepStatus, LText> = {
  pass: loc('通过', 'Pass'),
  fail: loc('失败', 'Fail'),
  skip: loc('跳过', 'Skipped'),
}

/** 报告表“停在”一列：全部通过时显示“通过”，否则显示停止的那一步 */
export const STOP_TEXT: Record<StopAt, LText> = {
  none: STATUS_LABELS.pass,
  txPower: STEP_LABELS[1],
  txEvm: STEP_LABELS[2],
  rxGain: STEP_LABELS[3],
  rxBer: STEP_LABELS[4],
}

export const BIN_LABELS: Record<Bin, LText> = {
  pass: loc('Pass', 'Pass'),
  txFail: loc('Tx 失败', 'Tx fail'),
  rxFail: loc('Rx 失败', 'Rx fail'),
}

export const S = {
  kickerNow: loc('这一颗器件', 'This device'),
  introTitle: loc('射频收发器：发射与接收两条线', 'RF transceiver: a transmit and a receive path'),
  coreTitle: loc('一颗器件：按顺序测，遇错即停', 'One device: test in order, stop at the first fail'),
  coreNote: loc(
    '按 上电与校准 → Tx 输出功率 → Tx EVM → Rx 增益 → Rx 灵敏度 的顺序测。选一个器件编号，看它在哪一步停下；右侧读数是这颗器件的测量值。',
    'Tested in the order power-up & cal → Tx output power → Tx EVM → Rx gain → Rx sensitivity. Pick a device number to see the step where it stops; the readouts are that device’s measured values.',
  ),
  spreadLabel: loc('工艺散布倍数', 'Process spread (×)'),
  rxTestLabel: loc('Rx 测试功率 (dBm)', 'Rx test power (dBm)'),
  deviceLabel: loc('器件编号（1–100）', 'Device number (1–100)'),
  flowNote: loc(
    '前项失败即停止：后面的步骤标为“跳过”，不计入结果；器件按第一次失败的项分到 Tx 失败或 Rx 失败。',
    'If a step fails, the steps after it are skipped and not counted; the device is binned by its first failing step.',
  ),
  rPout: loc('Tx 输出功率', 'Tx output power'),
  rEvm: loc('Tx EVM', 'Tx EVM'),
  rGain: loc('Rx 增益', 'Rx gain'),
  rBer: loc('误码 / 比特（BER 估计）', 'Errors / bits (BER estimate)'),
  rSens: loc('解析灵敏度（BER = 1e-3）', 'Analytic sensitivity (BER = 1e-3)'),
  rBin: loc('Bin 判定', 'Bin'),
  notRun: loc('未测', 'Not run'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  berAria: loc(
    'BER 随输入功率变化的曲线，标出 BER = 1e-3 的参考线、规格线与当前测试点',
    'BER versus input power, with the BER = 1e-3 reference line, the spec line and the current test point',
  ),
  berCap: loc(
    '横轴是输入功率（dBm），纵轴是 BER（对数）。曲线是这颗器件的解析 BER；金色虚线是规格线，红点是当前测试功率下的理论 BER。误码数由计数得到，写在右侧读数里，两者会有统计波动。',
    'Horizontal axis: input power (dBm); vertical axis: BER (log). The curve is this device’s analytic BER; the gold dashed line is the spec and the red dot is the theoretical BER at the test power. The error count comes from counting and is in the readout; the two differ by statistical noise.',
  ),
  specLabel: loc(`规格 ${f0(SENS_SPEC_DBM)} dBm`, `Spec ${f0(SENS_SPEC_DBM)} dBm`),
  refLabel: loc('BER 1e-3', 'BER 1e-3'),
  batchTitle: loc('批量：100 颗的 Bin 分布与报告', 'Batch: Bin distribution and report for 100 devices'),
  batchNote: loc(
    '同一批 100 颗器件用同一组设置测试；改动散布或测试功率后，整批重新计算。',
    'The same 100 devices are tested with the same settings; changing spread or test power re-runs the whole batch.',
  ),
  rPass: loc('Pass 颗数', 'Pass count'),
  rYield: loc('良率', 'Yield'),
  rTxFail: loc('Tx 失败颗数', 'Tx fail count'),
  rRxFail: loc('Rx 失败颗数', 'Rx fail count'),
  binTitle: loc('Bin 分布', 'Bin distribution'),
  stopTitle: loc('按停止的测试项计数', 'Count by the test where the device stopped'),
  colTest: loc('测试项', 'Test'),
  colLimit: loc('限值', 'Limit'),
  colStop: loc('停在此项', 'Stopped here'),
  limitPout: loc(`${f0(POUT_LIMIT_DBM[0])}–${f0(POUT_LIMIT_DBM[1])} dBm`, `${f0(POUT_LIMIT_DBM[0])}–${f0(POUT_LIMIT_DBM[1])} dBm`),
  limitEvm: loc(`≤ ${f0(EVM_LIMIT_PCT)} %`, `≤ ${f0(EVM_LIMIT_PCT)} %`),
  limitGain: loc(`${f0(GAIN_LIMIT_DB[0])}–${f0(GAIN_LIMIT_DB[1])} dB`, `${f0(GAIN_LIMIT_DB[0])}–${f0(GAIN_LIMIT_DB[1])} dB`),
  limitBer: loc(`BER ≤ ${BER_LIMIT}`, `BER ≤ ${BER_LIMIT}`),
  csvBtn: loc('导出 CSV 报告', 'Export CSV report'),
  csvNote: loc(
    '报告是一张表：每颗器件一行，包含各项测量值、限值判定和 Bin。这张表就是 Datalog（测试数据记录）的雏形。CSV 在浏览器里生成并下载，不上传到任何地方。',
    'The report is one table: one row per device with measured values, limit verdicts and the bin. It is a simple form of a datalog. The CSV is built and downloaded in the browser; nothing is uploaded.',
  ),
  reportTitle: loc('报告表', 'Report table'),
  colDev: loc('编号', 'Device'),
  colPout: loc('P_out (dBm)', 'P_out (dBm)'),
  colEvm: loc('EVM (%)', 'EVM (%)'),
  colGain: loc('增益 (dB)', 'Gain (dB)'),
  colErr: loc('误码 / bit', 'Errors / bits'),
  colBin: loc('Bin', 'Bin'),
  colStopAt: loc('停在', 'Stopped at'),
  asideLater: loc(
    '真实产线还要考虑多站点并测与测试时间、温度与电源时序、校准周期，以及测试数据的追溯；这里只练顺序、限值、判定和报告。',
    'A real line also deals with multisite test and test time, temperature and power sequencing, calibration intervals and data traceability; here we only practise order, limits, verdicts and the report.',
  ),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc('选一颗 Tx 失败的器件，确认它的 Rx 步骤显示“跳过”。', 'Pick a device that fails Tx and confirm its Rx steps show “Skipped”.'),
  task2: loc('把工艺散布调到 1.5 以上，让良率降到 80% 以下。', 'Raise the process spread to 1.5 or more so the yield drops below 80%.'),
  task3: loc('找一颗 Rx 失败（BER 测试）的器件，读出它的误码数与解析灵敏度。', 'Find a device that fails the Rx BER test, and read its error count and analytic sensitivity.'),
  task4: loc('导出一份 CSV 报告。', 'Export one CSV report.'),
}

export const INTRO = [
  loc(
    '射频收发器（Transceiver）把发射链（Tx：上变频、功率放大）和接收链（Rx：低噪声放大、下变频）放在同一颗芯片里。测试要分两条线看：Tx 看输出功率和调制质量（EVM），Rx 看增益和灵敏度。前面 {@rfEvm}、{@rfNf} 讲的指标，这一课全部用上。',
    'An RF transceiver puts a transmit chain (Tx: up-conversion and power amplification) and a receive chain (Rx: low-noise amplification and down-conversion) on one chip. Test looks at two lines: Tx checks output power and modulation quality (EVM), and Rx checks gain and sensitivity. Every metric from {@rfEvm} and {@rfNf} is used here.',
  ),
  loc(
    '这一课的虚拟器件叫 VDUT-RFT1（虚构，规格为教学取值）。我们按固定顺序测它，任何一项不过就停，并把它分到对应的 Bin；再对 100 颗不同的器件跑一遍，统计 Bin 分布，最后导出一张报告表。',
    'The virtual device here is VDUT-RFT1 (fictional; its limits are teaching values). We test it in a fixed order, stop at any failing step and bin it accordingly; then we run 100 different devices, count the bins and export a report table.',
  ),
]

export const MISCONCEPTIONS = [
  loc(
    '灵敏度就是仪器能测到的最小功率。灵敏度是在规定 BER 下能正确解码的最小功率，要用 BER 判定，不是看有没有信号。',
    'Sensitivity is the smallest signal the instrument can see. It is the smallest input that decodes correctly at a specified BER, judged by BER, not by whether a signal is present.',
  ),
  loc(
    '测一个功率点就能知道灵敏度。一个测试功率只给出 Pass 或 Fail；灵敏度是 BER 曲线穿过 1e-3 的那一点，要多点扫描或用模型外推。',
    'One test power tells you the sensitivity. One power point gives only Pass or Fail; sensitivity is where the BER curve crosses 1e-3, which needs a sweep or a model extrapolation.',
  ),
  loc(
    'Tx、Rx 各自都过，整颗就一定合格。顺序有意义：前项失败即停，器件按第一个失败项分 Bin，后项的数据根本不存在。',
    'If Tx and Rx each pass, the whole device passes. Order matters: a failing step stops the flow and the device is binned by its first failure, so later data never exists.',
  ),
]

export const TAKEAWAY = loc(
  '顺序：上电与校准 → Tx（功率、EVM）→ Rx（增益、灵敏度），任一项失败即停止，并按第一次失败的项分 Bin。灵敏度用 BER 定义：BER = 1e-3 时 QPSK 约需 Eb/N0 6.8 dB，加上实现损耗，SNR 约 9 dB，因此灵敏度 ≈ −114 dBm + NF + 9 dB。批量看 Bin 分布；报告要带上测试功率和限值，否则结果无法复现。',
  'Order: power-up & cal → Tx (power, EVM) → Rx (gain, sensitivity); any failing step stops the flow and bins the device by its first failure. Sensitivity is defined by BER: at BER = 1e-3 QPSK needs about 6.8 dB Eb/N0, plus implementation loss the SNR is about 9 dB, so sensitivity ≈ −114 dBm + NF + 9 dB. Read the bin distribution across a batch; the report must state the test power and limits, or the result cannot be reproduced.',
)

/** 小测题干中的数字由模型常量算出 */
const EBN0_TEXT = f1(EBN0_REQ_DB)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Tx 输出功率不合格的器件，为什么不再测 Rx？', 'Why is a device whose Tx output power fails not tested for Rx?'),
    options: [
      { id: 'a', text: loc('为了让 Rx 结果更准', 'To make the Rx result more accurate') },
      { id: 'b', text: loc('Rx 测试不需要电源', 'Rx test needs no power') },
      {
        id: 'c',
        text: loc('前提不成立：输出功率已不在范围内，后面的 EVM 与灵敏度无法解读，同时省下测试时间', 'The premise fails: output power is already out of range, so later EVM and sensitivity cannot be interpreted, and test time is saved'),
      },
    ],
    answer: 'c',
    explain: loc(
      '停止条件是为了两件事：后项的数据在前项失败时没有意义，且省时间。这颗器件已经分到 Tx 失败，Rx 的数据不会改变它的 Bin。',
      'The stop rule serves two purposes: later data has no meaning once an earlier step fails, and it saves time. The device is already binned as a Tx failure, so Rx data cannot change its bin.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('QPSK 要达到 BER = 1e-3，大约需要多少 Eb/N0？', 'Roughly how much Eb/N0 does QPSK need to reach BER = 1e-3?'),
    options: [
      { id: 'a', text: loc('1 dB', '1 dB') },
      { id: 'b', text: loc('30 dB', '30 dB') },
      { id: 'c', text: loc(`${EBN0_TEXT} dB`, `${EBN0_TEXT} dB`) },
    ],
    answer: 'c',
    explain: loc(
      `Q(√(2·Eb/N0)) = 1e-3 ⇒ √(2·Eb/N0) ≈ ${f2(qInverse(BER_LIMIT))} ⇒ Eb/N0 ≈ ${EBN0_TEXT} dB。加上 ${f1(IMPL_LOSS_DB)} dB 的实现损耗，接收端 SNR 要约 ${f1(SNR_REQ_DB)} dB。`,
      `Q(√(2·Eb/N0)) = 1e-3 ⇒ √(2·Eb/N0) ≈ ${f2(qInverse(BER_LIMIT))} ⇒ Eb/N0 ≈ ${EBN0_TEXT} dB. Adding ${f1(IMPL_LOSS_DB)} dB of implementation loss, the receiver SNR must be about ${f1(SNR_REQ_DB)} dB.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(`BER 限值为 ${BER_LIMIT}，${BER_BITS} 个比特中最多允许几个误码？`, `The BER limit is ${BER_LIMIT}. Out of ${BER_BITS} bits, how many errors are allowed at most?`),
    options: [
      { id: 'a', text: loc(`${f0(BER_LIMIT * BER_BITS)} 个`, `${f0(BER_LIMIT * BER_BITS)} errors`) },
      { id: 'b', text: loc('2 个', '2 errors') },
      { id: 'c', text: loc('200 个', '200 errors') },
    ],
    answer: 'a',
    explain: loc(
      `BER = 误码数 ÷ 比特数，所以误码数上限 = ${BER_LIMIT} × ${BER_BITS} = ${f0(BER_LIMIT * BER_BITS)} 个。`,
      `BER = errors ÷ bits, so the error limit = ${BER_LIMIT} × ${BER_BITS} = ${f0(BER_LIMIT * BER_BITS)} errors.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('只数到 1 个误码（BER 估计约 5e-5）时，这个结论可靠吗？', 'If only one error is counted (BER estimate about 5e-5), is the conclusion reliable?'),
    options: [
      { id: 'a', text: loc('非常可靠，BER 就是 5e-5', 'Very reliable: the BER is 5e-5') },
      {
        id: 'b',
        text: loc('统计波动很大：误码数太少时，要看误码数够不够多，或改用解析外推', 'Statistically very noisy: with so few errors you need enough errors counted, or use analytic extrapolation'),
      },
      { id: 'c', text: loc('只要不为零就一定 Fail', 'Any nonzero count means Fail') },
    ],
    answer: 'b',
    explain: loc(
      '误码计数是随机事件：计到 1 个时，真实值可能是 0.3 个也可能是 2 个，波动接近 100%。判定限值要让误码数足够多（限值 20 个误码对应 20000 bit），或用 Q 函数外推。',
      'Error counting is a random process: with 1 error counted the true expectation could be 0.3 or 2, a spread near 100%. To judge a limit, count enough errors (a 20-error limit over 20000 bits), or extrapolate with the Q function.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('工艺散布倍数增大后，良率一般会怎样？', 'When the process spread increases, what usually happens to the yield?'),
    options: [
      { id: 'a', text: loc('降低', 'Goes down') },
      { id: 'b', text: loc('升高', 'Goes up') },
      { id: 'c', text: loc('不变', 'Unchanged') },
    ],
    answer: 'a',
    explain: loc(
      '散布变大后，输出功率、EVM、增益和噪声系数都更容易落到限值外，越过限值的器件变多，良率下降。这正是量产要控制工艺散布的原因。',
      'With a larger spread, output power, EVM, gain and noise figure are more likely to fall outside their limits, so more devices fail and the yield drops. This is why production must control process spread.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(`Rx 测试功率设得比规格线（${f0(SENS_SPEC_DBM)} dBm）更低，比如 ${f0(SENS_SPEC_DBM - 3)} dBm，会怎样？`, `If the Rx test power is set below the spec line (${f0(SENS_SPEC_DBM)} dBm), say ${f0(SENS_SPEC_DBM - 3)} dBm, what happens?`),
    options: [
      { id: 'a', text: loc('判定更松：差器件会漏过（漏检）', 'The test is looser: bad devices slip through (escapes)') },
      { id: 'b', text: loc('没有影响，判定永远与规格一致', 'No effect: the verdict always matches the spec') },
      {
        id: 'c',
        text: loc('判定更严：本来合格的器件会被误判为 Fail（过杀）', 'The test is stricter: devices that meet the spec are wrongly failed (overkill)'),
      },
    ],
    answer: 'c',
    explain: loc(
      '测试功率更低时，只有噪声系数更小的器件才能过 BER 测试。那些灵敏度落在规格线与测试点之间的器件，规格上合格，却在测试中被判 Fail，这就是过杀。',
      'At a lower test power only devices with a smaller noise figure pass the BER test. Devices whose sensitivity lies between the spec line and the test point meet the spec, yet fail the test: that is overkill.',
    ),
  },
]

/** 四条任务卡：完成情况由当前器件、批量结果与是否已导出实时算出 */
export function taskItems(cap: CapState, device: DeviceResult, summary: Summary, exported: boolean): TaskItem[] {
  return [
    { id: 'tx-fail', text: S.task1, done: device.bin === 'txFail' },
    { id: 'yield', text: S.task2, done: cap.spread >= 1.5 && summary.yieldPct < 80 },
    { id: 'rx-fail', text: S.task3, done: device.bin === 'rxFail' && device.stopAt === 'rxBer' },
    { id: 'export', text: S.task4, done: exported },
  ]
}

/** 右侧说明栏：当前器件的结论 + 原因；note 只在 Rx 判定用的测试功率偏离规格线时出现 */
export function verdictOf(cap: CapState, r: DeviceResult): { title: LText; text: LText; note: LText | null } {
  const idx = r.index
  const pout = f2(r.pout)
  const sens = f2(r.sensDbm)
  const nf = f2(r.nfDb)
  const testNote = cap.rxTest !== SENS_SPEC_DBM
    ? loc(
        `注意：Rx 测试功率 ${f0(cap.rxTest)} dBm 与规格线 ${f0(SENS_SPEC_DBM)} dBm 不同，这一项的判定已偏离规格。`,
        `Note: the Rx test power ${f0(cap.rxTest)} dBm differs from the ${f0(SENS_SPEC_DBM)} dBm spec line, so this verdict no longer matches the spec.`,
      )
    : null

  if (r.stopAt === 'txPower') {
    return {
      title: S.fail,
      text: loc(
        `#${idx}：输出功率 ${pout} dBm 不在 ${f0(POUT_LIMIT_DBM[0])}–${f0(POUT_LIMIT_DBM[1])} dBm 内。前项失败即停：EVM 与 Rx 都不测，直接分到 Tx 失败。`,
        `#${idx}: output power ${pout} dBm is outside ${f0(POUT_LIMIT_DBM[0])}–${f0(POUT_LIMIT_DBM[1])} dBm. The first failure stops the flow: EVM and Rx are not tested, and the device is binned as Tx fail.`,
      ),
      note: null,
    }
  }
  if (r.stopAt === 'txEvm') {
    return {
      title: S.fail,
      text: loc(
        `#${idx}：输出功率 ${pout} dBm 合格，但 EVM ${f2(r.evm ?? 0)} % 超过 ${f0(EVM_LIMIT_PCT)} %，调制质量不过。停在 EVM，Rx 不测，分到 Tx 失败。`,
        `#${idx}: output power ${pout} dBm is fine, but EVM ${f2(r.evm ?? 0)} % exceeds ${f0(EVM_LIMIT_PCT)} %, so modulation quality fails. It stops at EVM, Rx is not tested, and the device is binned as Tx fail.`,
      ),
      note: null,
    }
  }
  if (r.stopAt === 'rxGain') {
    return {
      title: S.fail,
      text: loc(
        `#${idx}：Tx 两项都过，但 Rx 增益 ${f2(r.gain ?? 0)} dB 不在 ${f0(GAIN_LIMIT_DB[0])}–${f0(GAIN_LIMIT_DB[1])} dB 内。停在 Rx 增益，灵敏度不测，分到 Rx 失败。`,
        `#${idx}: both Tx tests pass, but Rx gain ${f2(r.gain ?? 0)} dB is outside ${f0(GAIN_LIMIT_DB[0])}–${f0(GAIN_LIMIT_DB[1])} dB. It stops at Rx gain, sensitivity is not tested, and the device is binned as Rx fail.`,
      ),
      note: null,
    }
  }
  if (r.stopAt === 'rxBer') {
    return {
      title: S.fail,
      text: loc(
        `#${idx}：在 Rx 测试功率 ${f0(cap.rxTest)} dBm 下，${r.errors ?? 0} 个误码 / ${BER_BITS} bit，BER 估计 ${(r.ber ?? 0).toExponential(1)}，超过 ${BER_LIMIT}。原因：它的噪声系数 NF = ${nf} dB，解析灵敏度 ${sens} dBm，比测试功率更差。`,
        `#${idx}: at the Rx test power ${f0(cap.rxTest)} dBm, ${r.errors ?? 0} errors in ${BER_BITS} bits gives a BER estimate of ${(r.ber ?? 0).toExponential(1)}, above ${BER_LIMIT}. Reason: its noise figure is NF = ${nf} dB, so its analytic sensitivity is ${sens} dBm, which is worse than the test power.`,
      ),
      note: testNote,
    }
  }
  return {
    title: S.pass,
    text: loc(
      `#${idx}：输出 ${pout} dBm、EVM ${f2(r.evm ?? 0)} %、增益 ${f2(r.gain ?? 0)} dB、${r.errors ?? 0} 个误码 / ${BER_BITS} bit，四项都在限值内，判为 Pass。`,
      `#${idx}: output ${pout} dBm, EVM ${f2(r.evm ?? 0)} %, gain ${f2(r.gain ?? 0)} dB, ${r.errors ?? 0} errors in ${BER_BITS} bits; all four are within limits, so it is a Pass.`,
    ),
    note: testNote,
  }
}

export const BIN_ORDER: Bin[] = ['pass', 'txFail', 'rxFail']

import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  R_S_KOHM,
  SETTLE_TOL_UA,
  SPEC_UA,
  TAU_MS,
  U_INST_UA,
  V_SPEC,
  limitUa,
  settleNeededMs,
  steadyUa,
  type DutId,
  type LeakResult,
  type LeakState,
  type MeasureKind,
} from './leakModel'

const f1 = (value: number) => value.toFixed(1)

export const MEASURE_OPTIONS: Array<{ id: MeasureKind; label: LText }> = [
  { id: 'leak', label: loc('引脚漏电 IIH', 'Pin leakage IIH') },
  { id: 'iq', label: loc('静态电流 IQ', 'Quiescent current IQ') },
]

export const DUT_OPTIONS: Array<{ id: DutId; label: LText }> = [
  { id: 'healthy', label: loc('良品', 'Good part') },
  { id: 'edge', label: loc('边缘件', 'Edge part') },
  { id: 'fault', label: loc('故障件', 'Fault part') },
]

export const S = {
  kickerNow: loc('这一次测量', 'This measurement'),
  nextPrefix: loc('下一课：', 'Next: '),
  devName: loc('器件 VDUT-LKG1（虚构型号，数值为示意）', 'Device VDUT-LKG1 (fictional model, numbers are illustrative)'),
  introTitle: loc('加了电压，电流不是立刻就稳', 'After forcing voltage, the current does not settle at once'),
  coreTitle: loc('拨一拨：测哪一项、加多少电压、等多久、留多少保护带', 'Try it: which item, how much voltage, how long to wait, how much guardband'),
  coreNote: loc(
    '上图是 PMU 经 R_S 加压到引脚、引脚旁有去耦电容的电路。下图是三颗器件的读数随时间的变化，虚线是限值，点是当前设置下的读数。',
    'The top figure shows the PMU forcing voltage through R_S to the pin, with a decoupling capacitor at the pin. The bottom figure shows the reading of each device over time; the dashed line is the limit and the dot is the reading at the current settings.',
  ),
  modeLabel: loc('测量项', 'Measurement'),
  dutLabel: loc('被测件', 'Device under test'),
  vLabel: loc('Force 电压 V_force (V)', 'Force voltage V_force (V)'),
  settleLabel: loc('加压后等待 t (ms)', 'Wait after forcing t (ms)'),
  guardLabel: loc('保护带 guardband (µA)', 'Guardband (µA)'),
  dutHealthy: loc('良品', 'Good part'),
  dutEdge: loc('边缘件', 'Edge part'),
  dutFault: loc('故障件', 'Fault part'),
  measLeak: loc('引脚漏电', 'Pin leakage'),
  measIq: loc('静态电流', 'Quiescent current'),
  pathLeak: loc('引脚 → GND 漏电', 'Pin → GND leakage'),
  pathIq: loc('VDD 脚 → 内部电路', 'VDD pin → core'),
  nodeLeak: loc('引脚', 'pin'),
  nodeIq: loc('VDD 脚', 'VDD'),
  rSpec: loc('规格（5.0 V）', 'Spec (5.0 V)'),
  rLimit: loc('测试限值 = 规格 − 保护带', 'Test limit = spec − guardband'),
  rSteady: loc('稳态电流（真值）', 'Steady current (true value)'),
  rTrans: loc('残余瞬态 @ 等待时间', 'Residual transient @ wait time'),
  rReading: loc('仪器读数', 'Instrument reading'),
  rNeed: loc('残余降到 1 µA 所需时间', 'Time for residual to fall to 1 µA'),
  rVerdict: loc('判定', 'Verdict'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  invalid: loc('无效（条件或等待不符）', 'INVALID (condition or wait not met)'),
  limitLbl: loc('限值', 'Limit'),
  specLbl: loc('规格', 'Spec'),
  settleLbl: loc('所需等待', 'Settle needed'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '数字课的 IDDQ 和静态电流测试在原理上相同，这里只看模拟引脚的漏电与静态电流怎样判定；LDO 的静态电流与负载条件留到下一课。',
    'The digital IDDQ and quiescent current test follow the same principle; here we only look at how analog pin leakage and quiescent current are judged. LDO quiescent current under load is left to the next lesson.',
  ),
  task1: loc(
    '在规格条件下（5.0 V，等待足够），把故障件判成 FAIL。',
    'Under the spec condition (5.0 V, enough wait), judge the fault part as FAIL.',
  ),
  task2: loc(
    '保护带不小于仪器不确定度（1 µA），并且边缘件在规格条件下判 PASS。',
    'Set a guardband no smaller than the instrument uncertainty (1 µA), and judge the edge part as PASS under the spec condition.',
  ),
  task3: loc(
    '在规格条件下，把良品判成 PASS。',
    'Under the spec condition, judge the good part as PASS.',
  ),
  vCond: loc('条件不符：这次结果无效', 'Condition mismatch: this result is invalid'),
  vSettle: loc('等待不够：读数还不能用', 'Not settled: the reading cannot be used yet'),
  vPass: loc('稳定后 PASS：读数在限值以内', 'Settled PASS: reading within the limit'),
  vFail: loc('真的超规格：器件本身偏大', 'Really out of spec: the device itself is high'),
  vOver: loc('过杀：好件被保护带误杀', 'Overkill: a good part was rejected by the guardband'),
}

export const FIG = {
  hookAria: loc('电路图：PMU 经 R_S 加压到 DUT 引脚，引脚旁有去耦电容 C 到地', 'Circuit: the PMU forces voltage through R_S to the DUT pin, with a decoupling capacitor C to ground'),
  hookCap: loc(
    'PMU 工作在 FVMI 模式：加规定电压，量流过引脚的电流。电容 C 在加压瞬间要充电，充电电流经过 R_S，所以读数先大后小。',
    'The PMU runs in FVMI mode: it forces a set voltage and measures the current through the pin. Capacitor C charges at the moment of forcing, and that charging current flows through R_S, so the reading starts high and then falls.',
  ),
  settleAria: loc('曲线图：三颗器件的读数随等待时间变化，标出限值与规格', 'Plot: each device reading against wait time, with the limit and spec marked'),
  settleCap: loc(
    '横轴是加压后的等待时间。瞬态按 e^(−t/τ) 衰减，τ = R_S·C = 1 ms，所以读数曲线先下降，再贴近稳态。判定只能取稳定之后的读数。',
    'The horizontal axis is the wait after forcing. The transient decays as e^(−t/τ) with τ = R_S·C = 1 ms, so each reading curve falls and then flattens onto its steady value. The verdict may only use a settled reading.',
  ),
}

/** 右侧说明栏与判定的结论：条件不符 → 等待不够 → 稳定后比较限值，超限时再区分真超规格与过杀 */
export function verdictOf(state: LeakState, r: LeakResult): { title: LText; text: LText } {
  const i0 = (state.vForce / R_S_KOHM) * 1000
  const v = f1(state.vForce)
  const reading = f1(r.reading)
  const transient = f1(r.transient)
  const steady = f1(r.steady)
  const limit = f1(r.limit)
  const spec = f1(r.spec)
  const tol = f1(SETTLE_TOL_UA)
  const need = f1(r.needMs)
  if (!r.vOk) {
    return {
      title: S.vCond,
      text: loc(
        `Force 电压为 ${v} V，规格条件是 ${f1(V_SPEC)} V。漏电和静态电流都随电压变化（这里按线性示意），条件不同，数值就不能和规格比较，所以这次判定无效。`,
        `The Force voltage is ${v} V, but the spec condition is ${f1(V_SPEC)} V. Leakage and quiescent current both change with voltage (linear here, for illustration), so a different condition gives numbers that cannot be compared with the spec; this verdict is invalid.`,
      ),
    }
  }
  if (!r.settled) {
    return {
      title: S.vSettle,
      text: loc(
        `读数 ${reading} µA 里还有 ${transient} µA 的充电瞬态，超过 ${tol} µA 的容差。残余 = I0·e^(−t/τ)，I0 = V/R_S = ${f1(i0)} µA，要降到 ${tol} µA 以下，至少要等 τ·ln(I0/容差) = ${need} ms。等待不够时，PASS 或 FAIL 都不能信。`,
        `The reading ${reading} µA still carries a charging transient of ${transient} µA, above the ${tol} µA tolerance. Residual = I0·e^(−t/τ) with I0 = V/R_S = ${f1(i0)} µA; to fall below ${tol} µA you must wait at least τ·ln(I0/tolerance) = ${need} ms. While the wait is short, neither PASS nor FAIL can be trusted.`,
      ),
    }
  }
  if (r.pass) {
    return {
      title: S.vPass,
      text: loc(
        `稳定后读数 ${reading} µA ≤ 限值 ${limit} µA，判 PASS。残余已降到容差以内，读数接近稳态 ${steady} µA，比较的是器件本身的电流。`,
        `After settling the reading ${reading} µA is at or below the limit ${limit} µA, so PASS. The residual is within tolerance, so the reading is close to the steady ${steady} µA and compares the device's own current.`,
      ),
    }
  }
  if (r.steady > r.spec) {
    return {
      title: S.vFail,
      text: loc(
        `稳态 ${steady} µA 超过规格 ${spec} µA，这是器件本身的漏电或静态电流偏大，不是瞬态造成的，判 FAIL。`,
        `The steady ${steady} µA exceeds the spec ${spec} µA. The device's own leakage or quiescent current is high, not a transient, so FAIL.`,
      ),
    }
  }
  return {
    title: S.vOver,
    text: loc(
      `稳态 ${steady} µA 仍在规格 ${spec} µA 之内，是合格件；但保护带把限值收到 ${limit} µA，读数超过它就判 FAIL。这是过杀：保护带太大，边缘好件被误杀。`,
      `The steady ${steady} µA is still within the spec ${spec} µA, so the part is good; but the guardband has pulled the limit down to ${limit} µA, and a reading above it fails. This is overkill: too large a guardband rejects good edge parts.`,
    ),
  }
}

/** 三张任务卡：完成与否由当前设置和判定结果算出 */
export function taskItems(state: LeakState, r: LeakResult): TaskItem[] {
  const conditionsOk = r.vOk && r.settled
  return [
    { id: 'fault', text: S.task1, done: state.dut === 'fault' && conditionsOk && !r.pass },
    {
      id: 'guard',
      text: S.task2,
      done: state.guard >= U_INST_UA && state.dut === 'edge' && conditionsOk && r.pass,
    },
    { id: 'healthy', text: S.task3, done: state.dut === 'healthy' && conditionsOk && r.pass },
  ]
}

export const INTRO: LText[] = [
  loc(
    '{@anaSmu} 讲过 PMU 能加压、量电流。这一课把它用在两类测试上：引脚漏电（IIH）和静态电流（IQ）。它们的规格都是电流上限，判定就是把读数和限值比较。',
    'The {@anaSmu} lesson covered how a PMU forces voltage and measures current. This lesson applies that to two tests: pin leakage (IIH) and quiescent current (IQ). Both specs are current limits, and the verdict compares the reading with the limit.',
  ),
  loc(
    '这一课练三件事：加压后要等多久才能读；测试限值怎样由规格和保护带算出；为什么条件不符的结果不能用来判定。{@fDc} 讲的 IDDQ 与这里的静态电流是同一类问题。',
    'This lesson practises three things: how long to wait after forcing before reading; how the test limit is built from the spec and the guardband; and why a result taken at the wrong condition cannot be used for judgement. The IDDQ in {@fDc} is the same kind of problem as the quiescent current here.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '读数低于限值就是合格。读数低可能只是没等稳定，或者 Force 电压没有放在规格条件；这两种情况下读数都不代表器件，必须先看等待时间和条件是否符合规格。',
    'A reading below the limit means the part is good. A low reading may only mean the wait was too short, or that the Force voltage was not at the spec condition; in either case the reading does not represent the device, so check the wait and the condition against the spec first.',
  ),
  loc(
    '保护带越大越安全。保护带把限值往里收，好件被误杀（过杀）的概率就上升。合理的保护带只需覆盖仪器不确定度（这里 1 µA），再大就是用良率换心理安慰。',
    'A bigger guardband is always safer. It pulls the limit inward, so good parts are rejected more often (overkill). A sensible guardband only needs to cover the instrument uncertainty (here 1 µA); more than that trades yield for false comfort.',
  ),
  loc(
    '稳态电流不必等，加压后立刻读就行。加压瞬间有 V/R_S 的充电电流，它要经过 R_S·C 的时间才衰减到容差以内；数字课的 IDDQ 测试也是同一个道理。',
    'Steady-state current needs no wait; read right after forcing. The moment voltage is applied, a charging current of V/R_S flows, and it takes about R_S·C to decay below tolerance; the digital IDDQ test follows the same principle.',
  ),
]

export const TAKEAWAY: LText = loc(
  'FVMI 测量要在规格条件下（这里 5.0 V）、等残余瞬态降到容差之后再读；测试限值 = 规格 − 保护带，保护带至少覆盖仪器不确定度，但不能大到误杀边缘的好件。',
  'An FVMI measurement must be taken at the spec condition (here 5.0 V) and read only after the residual transient has fallen within tolerance. The test limit is spec − guardband: the guardband should at least cover the instrument uncertainty, but must not be so large that it rejects good edge parts.',
)

/** 小测题干里的数字全部由模型算出，改了模型，小测和解析自动跟着变 */
const Q1_NEED = f1(settleNeededMs(V_SPEC))
const Q1_I0 = (V_SPEC / R_S_KOHM) * 1000
const Q3_FAULT_5V = f1(steadyUa('leak', 'fault', V_SPEC))
const Q3_FAULT_15V = f1(steadyUa('leak', 'fault', 1.5))
const Q4_LIMIT = f1(limitUa('iq', 2))

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `V_force = ${f1(V_SPEC)} V，R_S = ${R_S_KOHM} kΩ，C = 10 nF。瞬态从约 ${f1(Q1_I0)} µA 开始衰减，要降到 1 µA 以下，最少要等多久？`,
      `V_force = ${f1(V_SPEC)} V, R_S = ${R_S_KOHM} kΩ, C = 10 nF. The transient starts near ${f1(Q1_I0)} µA. How long at least must you wait for it to fall below 1 µA?`,
    ),
    options: [
      { id: 'a', text: loc('0.1 ms', '0.1 ms') },
      { id: 'b', text: loc(`${Q1_NEED} ms`, `${Q1_NEED} ms`) },
      { id: 'c', text: loc('50 ms', '50 ms') },
    ],
    answer: 'b',
    explain: loc(
      `τ = R_S·C = ${R_S_KOHM} kΩ × 10 nF = ${f1(TAU_MS)} ms。残余 = I0·e^(−t/τ) ≤ 1 µA，所以 t ≥ τ·ln(${f1(Q1_I0)}) ≈ ${Q1_NEED} ms。等待时间要按 τ 算，不能凭感觉。`,
      `τ = R_S·C = ${R_S_KOHM} kΩ × 10 nF = ${f1(TAU_MS)} ms. The residual I0·e^(−t/τ) must be at most 1 µA, so t ≥ τ·ln(${f1(Q1_I0)}) ≈ ${Q1_NEED} ms. The wait must be set from τ, not by feel.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('测试限值 = 规格 − 保护带。保护带的主要作用是什么？', 'Test limit = spec − guardband. What is the main job of the guardband?'),
    options: [
      { id: 'a', text: loc('让好件更容易判 PASS', 'Make good parts easier to pass') },
      { id: 'b', text: loc('把 Force 电压自动降到规格以下', 'Automatically lower the Force voltage below spec') },
      { id: 'c', text: loc('给仪器不确定度留余量，防止接近规格的坏件读偏低而漏检', 'Leave margin for instrument uncertainty so a bad part near the spec, reading low, is not missed') },
    ],
    answer: 'c',
    explain: loc(
      `仪器读数有 ±${f1(U_INST_UA)} µA 的不确定度。真值在规格附近的件，读数可能偏低 ${f1(U_INST_UA)} µA，直接拿规格比就会漏检。把限值收紧保护带，就能拦下这类件；保护带太大则会误杀边缘好件。`,
      `The instrument reading has an uncertainty of ±${f1(U_INST_UA)} µA. A part whose true value is near the spec may read ${f1(U_INST_UA)} µA low, and comparing that reading directly with the spec would miss it. Tightening the limit by the guardband catches such parts; too large a guardband rejects good edge parts.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      `故障件在 5.0 V 时稳态漏电约 ${Q3_FAULT_5V} µA。把 Force 降到 1.5 V，稳态读数约 ${Q3_FAULT_15V} µA，判 PASS。这个结论能用吗？`,
      `At 5.0 V the fault part's steady leakage is about ${Q3_FAULT_5V} µA. Lowering Force to 1.5 V gives a steady reading of about ${Q3_FAULT_15V} µA, which passes. Can this conclusion be used?`,
    ),
    options: [
      { id: 'a', text: loc('能用：读数低于限值就是 PASS', 'Yes: a reading below the limit is a PASS') },
      { id: 'b', text: loc('不能用：规格条件是 5.0 V，换条件测的结果不能用来判这条规格', 'No: the spec condition is 5.0 V, and a result taken at another condition cannot judge this spec') },
      { id: 'c', text: loc('能用：漏电与电压无关', 'Yes: leakage does not depend on voltage') },
    ],
    answer: 'b',
    explain: loc(
      `漏电随电压变化（这里按线性示意），所以 1.5 V 时读数确实降到 ${Q3_FAULT_15V} µA。但规格写的是 5.0 V 下的值，这颗件在 5.0 V 下仍是 ${Q3_FAULT_5V} µA 的故障件。换条件就等于换了一个测试，结论不能对应到规格上。`,
      `Leakage changes with voltage (linear here, for illustration), so at 1.5 V the reading really does fall to ${Q3_FAULT_15V} µA. But the spec is written at 5.0 V, where this part is still a fault at ${Q3_FAULT_5V} µA. Changing the condition is a different test, and its conclusion does not map onto the spec.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `IQ 规格 ${f1(SPEC_UA.iq)} µA，保护带 2 µA，限值 ${Q4_LIMIT} µA。某件稳定后读数 49 µA，应判什么？`,
      `IQ spec ${f1(SPEC_UA.iq)} µA, guardband 2 µA, limit ${Q4_LIMIT} µA. A part settles to a reading of 49 µA. What should the verdict be?`,
    ),
    options: [
      { id: 'a', text: loc('PASS，因为 49 < 50', 'PASS, because 49 < 50') },
      { id: 'b', text: loc(`FAIL，49 超过限值 ${Q4_LIMIT} µA`, `FAIL, because 49 is above the limit ${Q4_LIMIT} µA`) },
      { id: 'c', text: loc('无法判定，静态电流没有限值', 'Cannot judge, quiescent current has no limit') },
    ],
    answer: 'b',
    explain: loc(
      `测试限值 = ${f1(SPEC_UA.iq)} − 2 = ${Q4_LIMIT} µA，读数 49 µA 超过它，判 FAIL。这颗件的规格值 49 µA 其实仍合格（< 50），这就是保护带带来的过杀：保护带换来的是对仪器不确定度的余量，代价是这类边缘好件会被误杀。`,
      `The test limit = ${f1(SPEC_UA.iq)} − 2 = ${Q4_LIMIT} µA, and the reading 49 µA is above it, so FAIL. Against the spec the part is actually good (49 < 50); this is overkill caused by the guardband, which buys margin for instrument uncertainty at the cost of rejecting such edge parts.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '数字课的 IDDQ 测试和本课的静态电流测试都要“先等稳定再读”。直接原因是什么？',
      'Both the digital IDDQ test and this lesson\'s quiescent current test must wait to settle before reading. What is the direct reason?',
    ),
    options: [
      { id: 'a', text: loc('瞬态充电电流没有衰减完，读数里混着它', 'The charging transient has not decayed and is mixed into the reading') },
      { id: 'b', text: loc('测试机需要预热', 'The tester needs to warm up') },
      { id: 'c', text: loc('电流表有记忆效应，需要复位', 'The ammeter has memory and must be reset') },
    ],
    answer: 'a',
    explain: loc(
      '去耦电容和内部节点在加压或换向量后要充电，充电电流按 RC 衰减。没等够，读数里混着这段瞬态，好件也会超限。数字课的 IDDQ 讲的是同一件事，见 {@fDc}。',
      'Decoupling capacitors and internal nodes charge after forcing or a vector change, and that charging current decays with RC. If you read too early the transient is mixed into the reading and a good part can fail; the digital IDDQ lesson covers the same effect, see {@fDc}.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('输入漏电 IIH 的规格是电流上限（≤ 10 µA）。应该用哪种测法？', 'The input leakage IIH spec is a current limit (≤ 10 µA). Which measurement method should be used?'),
    options: [
      { id: 'a', text: loc('加电流、量电压（FIMV）', 'Force current, measure voltage (FIMV)') },
      { id: 'b', text: loc('加电压、量电流（FVMI）', 'Force voltage, measure current (FVMI)') },
      { id: 'c', text: loc('用万用表直接量引脚电阻', 'Measure the pin resistance with a multimeter') },
    ],
    answer: 'b',
    explain: loc(
      '规格的限值是电流，就用 FVMI：PMU 加规定电压（这里 5.0 V），直接读回流过引脚的电流，与限值比较。FIMV 适合以电压为限值的参数，如 VOH、VOL，见 {@pmu}。',
      'The limit is a current, so use FVMI: the PMU forces the specified voltage (here 5.0 V) and reads back the current through the pin to compare with the limit. FIMV suits parameters whose limit is a voltage, such as VOH and VOL; see {@pmu}.',
    ),
  },
]
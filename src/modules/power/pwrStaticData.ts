import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { fillL } from './pwrSelectorData'
import {
  BV_TRUE,
  PARAM_ORDER,
  measureOf,
  passWith,
  type Measure,
  type SampleId,
  type StaticParam,
  type StaticState,
} from './pwrStaticModel'

export const PARAM_LABEL: Record<StaticParam, LText> = {
  bvdss: loc('BVdss 击穿电压', 'BVdss breakdown voltage'),
  idss: loc('Idss 漏极漏电', 'Idss drain leakage'),
  igss: loc('Igss 栅极漏电', 'Igss gate leakage'),
  vth: loc('Vth 阈值电压', 'Vth threshold voltage'),
  rdson: loc('Rds(on) 导通电阻', 'Rds(on) on-resistance'),
}

/** 强制量与 compliance 的名称和单位；单位不随语言变化，写成英文符号 */
export const FORCE_LABEL: Record<StaticParam, LText> = {
  bvdss: loc('强制电流 Id', 'Force current Id'),
  idss: loc('强制漏源电压 Vds', 'Force drain-source voltage Vds'),
  igss: loc('强制栅源电压 Vgs', 'Force gate-source voltage Vgs'),
  vth: loc('强制电流 Id', 'Force current Id'),
  rdson: loc('强制电流 Id', 'Force current Id'),
}
export const FORCE_UNIT: Record<StaticParam, string> = {
  bvdss: 'µA',
  idss: 'V',
  igss: 'V',
  vth: 'mA',
  rdson: 'A',
}
export const COMPLIANCE_LABEL: Record<StaticParam, LText> = {
  bvdss: loc('电压 compliance', 'Voltage compliance'),
  idss: loc('电流 compliance', 'Current compliance'),
  igss: loc('电流 compliance', 'Current compliance'),
  vth: loc('电压 compliance', 'Voltage compliance'),
  rdson: loc('电压 compliance', 'Voltage compliance'),
}
export const COMPLIANCE_UNIT: Record<StaticParam, string> = {
  bvdss: 'V',
  idss: 'nA',
  igss: 'nA',
  vth: 'V',
  rdson: 'V',
}

export const PARAM_SEG = PARAM_ORDER.map((id) => ({ id, label: PARAM_LABEL[id] }))

export const SAMPLE_LABEL: Record<SampleId, LText> = {
  good: loc('良品', 'Good die'),
  leaky: loc('漏电偏大（示例）', 'High leakage (example)'),
  gate: loc('栅漏偏大（示例）', 'High gate leakage (example)'),
}

export const SAMPLE_SEG = (['good', 'leaky', 'gate'] as SampleId[]).map((id) => ({ id, label: SAMPLE_LABEL[id] }))

/** 力与测量表（教学参考，示例值以现行标准为准） */
export const FORCE_TABLE: Array<{ param: LText; force: LText; measure: LText; note: LText }> = [
  {
    param: loc('BVdss', 'BVdss'),
    force: loc('Vgs = 0，Id 为小电流（示例 250 µA）', 'Vgs = 0, small Id (example 250 µA)'),
    measure: loc('Vds', 'Vds'),
    note: loc('雪崩起点', 'Avalanche onset'),
  },
  {
    param: loc('Idss', 'Idss'),
    force: loc('Vgs = 0，Vds 取 BV 的某个比例（示例 80%）', 'Vgs = 0, Vds at a fraction of BV (example 80%)'),
    measure: loc('Id', 'Id'),
    note: loc('漏电', 'Leakage'),
  },
  {
    param: loc('Igss', 'Igss'),
    force: loc('Vds = 0，Vgs = ±额定值（示例 ±20 V）', 'Vds = 0, Vgs = ± rated value (example ±20 V)'),
    measure: loc('Ig', 'Ig'),
    note: loc('栅漏电', 'Gate leakage'),
  },
  {
    param: loc('Vth', 'Vth'),
    force: loc('Vds 固定（或栅漏短接），Id 为小电流', 'Vds fixed (or gate-drain shorted), small Id'),
    measure: loc('Vgs', 'Vgs'),
    note: loc('依赖 Id 条件', 'Depends on the Id condition'),
  },
  {
    param: loc('Rds(on)', 'Rds(on)'),
    force: loc('Vgs = 驱动电压，Id = 规定电流', 'Vgs = drive voltage, Id = specified current'),
    measure: loc('Vds，R = Vds / Id', 'Vds, R = Vds / Id'),
    note: loc('需要脉冲', 'Needs pulsing'),
  },
  {
    param: loc('Vsd', 'Vsd'),
    force: loc('源漏电流 Is', 'Source-drain current Is'),
    measure: loc('Vsd', 'Vsd'),
    note: loc('体二极管', 'Body diode'),
  },
  {
    param: loc('IGBT 对应', 'IGBT equivalent'),
    force: loc('同上，按器件类型选条件', 'As above, conditions by device type'),
    measure: loc('Vce(sat)、Vge(th)、Ices', 'Vce(sat), Vge(th), Ices'),
    note: loc('—', '—'),
  },
]

export const S = {
  kickerNow: loc('这一次静态测试', 'This static test'),
  introTitle: loc('力与测量：静态参数怎么测', 'Force and measure: how static parameters are tested'),
  introNote: loc('表中的强制值与限值都是教学示例，示例，以现行标准为准。', 'The force values and limits in this table are teaching examples. Example; follow the current standard.'),
  tableParam: loc('参数', 'Parameter'),
  tableForce: loc('Force（施加）', 'Force'),
  tableMeasure: loc('Measure（测量）', 'Measure'),
  tableNote: loc('说明', 'Note'),
  coreTitle: loc('拨一拨：选参数、设条件，看读数', 'Try it: pick a parameter, set the conditions, read the result'),
  coreNote: loc(
    '选一个参数后，下面的强制值与 compliance 会回到该参数的默认值。图只在测 Rds(on) 时出现，因为只有它受自热影响。这里的器件是虚构的教学模型（VDUT-MOS1），数值仅用于理解趋势。',
    'After you pick a parameter, the force and compliance values reset to that parameter’s defaults. The figure appears only for Rds(on), the only parameter that self-heats. The device is a fictional teaching model (VDUT-MOS1); the numbers are for understanding trends.',
  ),
  paramLabel: loc('测量参数', 'Measured parameter'),
  sampleLabel: loc('样品', 'Sample'),
  limitLabel: loc('限值（PASS / FAIL 用）', 'Limit (for PASS / FAIL)'),
  limitUnit: 'nA',
  taLabel: loc('环境温度 Ta', 'Ambient temperature Ta'),
  pulseLabel: loc('脉宽 t_on', 'Pulse width t_on'),
  dutyLabel: loc('占空比 D', 'Duty cycle D'),
  dutyUnit: '%',
  taUnit: '°C',
  pulseUnit: 'µs',
  thermalNote: loc(
    '热模型（教学示意）：单级 Foster，Rth = 1 K/W，τ = 10 ms。自热 ΔTj = P·Zth(t)，Zth(t) = Rth(1 − e^(−t/τ))。',
    'Thermal model (teaching illustration): single-stage Foster, Rth = 1 K/W, τ = 10 ms. Self-heating ΔTj = P·Zth(t), with Zth(t) = Rth(1 − e^(−t/τ)).',
  ),
  formulaNote: loc(
    '教学简化公式：R(T) = R25·[1 + α(T − 25)]，α = 0.5 %/°C；误差 ≈ α·ΔTj。',
    'Teaching-simplified formulas: R(T) = R25·[1 + α(T − 25)], α = 0.5 %/°C; error ≈ α·ΔTj.',
  ),
  vthNote: loc(
    'Vth 依赖测试电流：本课用饱和区平方律 Vgs = Vth + √(2·Id / kp) 反推（教学简化公式）。Id 越大，读数越高，所以“Vth 没有唯一值”，必须写明 Id。',
    'Vth depends on the test current: this lesson uses the saturation square law Vgs = Vth + √(2·Id / kp) (teaching-simplified formula). A larger Id gives a higher reading, so “Vth has no single value”: state the Id.',
  ),
  complianceNote: loc(
    'compliance 是仪器的限值：电压 compliance 限制 DUT 两端最高电压，电流 compliance 限制流过的最大电流。读数不能超过它。示例，以现行标准为准。',
    'Compliance is the instrument’s limit: a voltage compliance caps the voltage across the DUT, a current compliance caps the current. A reading cannot exceed it. Example; follow the current standard.',
  ),
  rMeas: loc('测得值', 'Measured value'),
  rDtj: loc('结温升 ΔTj', 'Junction temperature rise ΔTj'),
  rErr: loc('误差（相对 25 °C 真值）', 'Error (vs 25 °C truth)'),
  rClip: loc('compliance', 'Compliance'),
  rMaxPulse: loc('1% 误差的最大单脉冲宽', 'Longest single pulse for 1% error'),
  rVthDiff: loc('相对 1 mA 参考条件的差', 'Difference from the 1 mA reference'),
  rJudge: loc('判定', 'Judgement'),
  clipHit: loc('命中', 'Hit'),
  clipNo: loc('未命中', 'Not hit'),
  judgeUnknown: loc('无法判定', 'Cannot decide'),
  noValue: loc('—', '—'),
  noLimit: loc('不受限', 'No limit'),
  rdsAria: loc('误差随脉宽变化的曲线，标出 1% 误差线和当前脉宽（教学示意）', 'Error against pulse width with the 1% error line and the current pulse marked (teaching illustration)'),
  rdsTitle: loc('Rds(on) 误差随脉宽（教学示意）', 'Rds(on) error against pulse width (teaching illustration)'),
  errSummary: loc('当前脉宽 {pulse}：误差 {err}%（教学示意）', 'Pulse {pulse}: error {err}% (teaching illustration)'),
  rdsCap: loc(
    '脉宽越长，结温升越大，误差越大。虚线是 1% 误差。脉宽在毫秒以内时，误差可以压在 1% 以下。',
    'The longer the pulse, the larger the junction rise and the error. The dashed line is 1% error. Within a few milliseconds the error can stay below 1%.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。多选题用组合选项，题干会说明要选哪几条。', 'Pick an answer to see right or wrong with an explanation. Multi-select questions use combined options; the prompt says which statements to pick.'),
  asideLater: loc(
    '下一课：开尔文连接。Rds(on) 只有几毫欧，导线与接触电阻会把它淹没，要用四线测量。',
    'Next: Kelvin connection. Rds(on) is only a few milliohms, so lead and contact resistance can swamp it; a four-wire measurement is needed.',
  ),
  next: loc('下一课：开尔文连接', 'Next: Kelvin connection'),
  task1: loc(
    '测 BVdss：强制电流 100～500 µA（示例 250 µA），voltage compliance 设在 BV ±1 V 之内（99～101 V）。',
    'Measure BVdss: force 100–500 µA (example 250 µA) and set the voltage compliance within ±1 V of BV (99–101 V).',
  ),
  task2: loc(
    'I = 50 A 时比较 10 ms 与 100 µs 的脉宽，找出误差 <1% 的最大脉宽（约 1.7 ms）。',
    'At I = 50 A, compare a 10 ms and a 100 µs pulse, then find the longest pulse with error below 1% (about 1.7 ms).',
  ),
  task3: loc(
    '在不同 Id 下读 Vth：把 Id 从默认的 250 µA 改到至少 2.5 mA，说明 Vth 没有唯一值。',
    'Read Vth at different Id: move Id from the default 250 µA to at least 2.5 mA and explain why Vth has no single value.',
  ),
  task4: loc(
    '设置 Idss 或 Igss 的限值，让良品 PASS、故障样品 FAIL（示例限值 100 nA，示例，以现行标准为准）。',
    'Set an Idss or Igss limit so that the good die passes and the faulty die fails (example limit 100 nA; example, follow the current standard).',
  ),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
}

export const INTRO: LText[] = [
  loc(
    '静态参数是在直流或脉冲条件下测出来的：对 DUT 施加（force）一个量，测量（measure）另一个量。同一个参数，force 与 measure 换个方式，测出的东西就不同。参数的定义还依赖测试条件，例如 Vth 要写明 Id，BVdss 要写明 Id 与 compliance。下表是本课用到的 force 与 measure 方式。',
    'Static parameters are measured with DC or pulsed conditions: force one quantity on the DUT and measure another. The same parameter measured the other way round gives a different quantity, and definitions depend on conditions: Vth needs its Id stated, and BVdss needs its Id and compliance stated. The table below gives the force and measure setup used in this lesson.',
  ),
  loc(
    '用 SMU（源表）测静态参数，要解决三件事。第一是 compliance：击穿或短路时限制电压和电流，保护 DUT 与仪器。第二是自热：Rds(on) 在大电流下因发热而变大，所以要用脉冲，让结温升来不及上去。第三是限值：把测得值与规格上下限比较，判 PASS 或 FAIL。ANA-04 讲过的 FVMI 与 FIMV 在这里落到具体参数上，见 {@anaSmu}。',
    'Measuring static parameters with an SMU means solving three things. First, compliance limits the voltage and current during breakdown or a short, protecting the DUT and the instrument. Second, self-heating: Rds(on) rises as the device heats at high current, so pulse it so the junction cannot heat up much. Third, limits: compare the reading with the specification and call PASS or FAIL. The FVMI and FIMV modes from {@anaSmu} are applied to specific parameters here.',
  ),
  loc(
    '漏电和 Vth 也有陷阱：漏电随温度升高而增大（教学示意：每升高 10 °C 翻倍），Vth 随测试电流而变，所以同一个器件换一个条件，读数就不同。本课的实验把这些都做成了可以拨的控件。',
    'Leakage and Vth also have traps: leakage rises with temperature (teaching illustration: it doubles every 10 °C), and Vth changes with the test current, so the same device gives a different number under different conditions. The lab below makes each of these a control you can change.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'DC 测量比脉冲更准。直流大电流会持续发热，结温升高，Rds(on) 随之增大（教学示意：α = 0.5 %/°C）；脉冲把脉宽压到毫秒以内，结温升来不及上去，读数更接近 25 °C 真值。',
    'DC is more accurate than pulsed measurement. A DC high current keeps heating the die, the junction rises and Rds(on) grows (teaching illustration: α = 0.5 %/°C); a short pulse limits the rise so the reading is closer to the 25 °C truth.',
  ),
  loc(
    'Vth 是器件常数。Vth 由测试电流 Id 定义：Id 越大，读出的 Vgs 越高（饱和区平方律，教学简化）。数据手册要写明 Id 与 Vds 条件，否则两个数不能比。',
    'Vth is a device constant. Vth is defined by the test current Id: a larger Id gives a higher reading of Vgs (square law, teaching-simplified). The datasheet must state Id and Vds, or two numbers cannot be compared.',
  ),
  loc(
    '漏电只与器件有关。测得的漏电还包括夹具、线缆和绝缘的漏电，它们在高压下尤其明显（见 {@pwrKelvin}）；温度升高，漏电也会成倍增加。',
    'Leakage depends only on the device. The reading also includes fixture, cable and insulation leakage, which matters most at high voltage (see {@pwrKelvin}); leakage also multiplies with temperature.',
  ),
]

export const TAKEAWAY: LText = loc(
  'BVdss：小电流强制、测电压，compliance 设在 BV 附近。Idss/Igss：规定条件下测漏电，compliance 是电流限，限值判 PASS / FAIL。Vth：依赖 Id，必须写明条件。Rds(on)：用脉冲测，误差 ≈ α·ΔTj，脉宽越长自热越大。',
  'BVdss: force a small current and measure the voltage, with compliance set near BV. Idss/Igss: measure leakage under stated conditions; the compliance is a current cap and the limit gives PASS / FAIL. Vth: depends on Id, so state the condition. Rds(on): pulse it, since error ≈ α·ΔTj and longer pulses self-heat more.',
)

/** 右侧说明栏：根据当前参数与读数给结论，并写出原因 */
export function verdictOf(s: StaticState, m: Measure): { title: LText; text: LText } {
  const finiteMax = m.maxPulse !== null && Number.isFinite(m.maxPulse)
  const maxText: LText = finiteMax
    ? fillL(loc('约 {x} ms', 'about {x} ms'), { x: ((m.maxPulse ?? 0) * 1e3).toFixed(2) })
    : S.noLimit
  const vars: Record<string, LText | string> = {
    comp: String(s.compliance),
    bv: String(BV_TRUE),
    value: m.value.toFixed(2),
    temp: String(s.ta),
    limit: String(s.limitNa),
    id: String(s.force),
    diff: m.vthDiffMv === null ? '0' : m.vthDiffMv.toFixed(1),
    pulse: s.pulseUs >= 1000 ? `${(s.pulseUs / 1000).toFixed(2)} ms` : `${s.pulseUs} µs`,
    dt: m.dTj === null ? '0' : m.dTj.toFixed(2),
    err: m.errPct === null ? '0' : m.errPct.toFixed(2),
    maxms: maxText,
  }
  if (s.param === 'bvdss') {
    if (m.clipped) {
      return {
        title: loc('compliance 命中', 'Compliance hit'),
        text: fillL(
          loc(
            'compliance 设为 {comp} V，低于击穿电压 {bv} V，读数被截在 {comp} V，不是击穿电压。把 compliance 设到 BV 附近（±1 V）再测。',
            'Compliance is {comp} V, below the {bv} V breakdown, so the reading is capped at {comp} V and is not the breakdown voltage. Set the compliance near BV (±1 V) and measure again.',
          ),
          vars,
        ),
      }
    }
    if (s.compliance > BV_TRUE + 1) {
      return {
        title: loc('compliance 偏高', 'Compliance is high'),
        text: fillL(
          loc(
            '读数仍是 {value} V，但 compliance 设到 {comp} V，击穿后允许的电压更高，DUT 承受的应力也更大。把它压到 BV ±1 V 之内。',
            'The reading is still {value} V, but with the compliance at {comp} V the voltage after breakdown can climb higher and stress the DUT more. Bring it within ±1 V of BV.',
          ),
          vars,
        ),
      }
    }
    return {
      title: loc('BV 读数有效', 'BV reading is valid'),
      text: fillL(
        loc(
          'compliance {comp} V 贴着 BV（{bv} V），读数为 {value} V。compliance 既让读数不被截断，又限制击穿后的最高电压，保护 DUT。',
          'With the compliance at {comp} V, close to BV ({bv} V), the reading is {value} V. The compliance keeps the reading uncut and limits the voltage after breakdown to protect the DUT.',
        ),
        vars,
      ),
    }
  }
  if (s.param === 'idss' || s.param === 'igss') {
    if (m.pass === true) {
      return {
        title: S.pass,
        text: fillL(
          loc(
            '读数 {value} nA 不超过限值 {limit} nA，判 PASS。注意这是 {temp} °C 下的结果：温度每升高 10 °C，漏电翻倍，同一颗器件换温度，结论可能就变了。',
            'The reading {value} nA does not exceed the {limit} nA limit, so PASS. This is at {temp} °C: leakage doubles every 10 °C, so the same die can change verdict at another temperature.',
          ),
          vars,
        ),
      }
    }
    if (m.pass === false) {
      return {
        title: S.fail,
        text: fillL(
          loc(
            '读数 {value} nA 超过限值 {limit} nA，判 FAIL。即使 compliance（{comp} nA）被命中，只要它已经超过限值，也能确定是 FAIL。',
            'The reading {value} nA is above the {limit} nA limit, so FAIL. Even if the compliance ({comp} nA) is hit, once it is above the limit the FAIL is certain.',
          ),
          vars,
        ),
      }
    }
    return {
      title: loc('无法判定', 'Cannot decide'),
      text: fillL(
        loc(
          '读数被 compliance（{comp} nA）截断，真值不低于它；而 compliance 低于限值（{limit} nA），所以无法判定。把 compliance 提到限值以上再测。',
          'The reading is capped by the {comp} nA compliance, so the true value is at least that; the compliance is below the {limit} nA limit, so no decision is possible. Raise the compliance above the limit and measure again.',
        ),
        vars,
      ),
    }
  }
  if (s.param === 'vth') {
    if (m.clipped) {
      return {
        title: loc('compliance 命中', 'Compliance hit'),
        text: fillL(
          loc(
            'Vgs 超过了电压 compliance {comp} V，读数被截断。把 compliance 提到 Vgs 以上（Vgs 约为 Vth 加上几十毫伏）。',
            'Vgs exceeds the {comp} V voltage compliance, so the reading is capped. Raise the compliance above Vgs (Vth plus a few tens of millivolts).',
          ),
          vars,
        ),
      }
    }
    return {
      title: loc('Vth 没有唯一值', 'Vth has no single value'),
      text: fillL(
        loc(
          'Id = {id} mA 时读出 {value} V，相对 1 mA 参考条件相差 {diff} mV。Id 越大，读数越高。所以报告 Vth 时必须写明 Id，才能和别人的数比较。',
          'At Id = {id} mA the reading is {value} V, {diff} mV from the 1 mA reference. A larger Id gives a higher reading, so any reported Vth must state its Id before it can be compared.',
        ),
        vars,
      ),
    }
  }
  // Rds(on)
  if (m.clipped) {
    return {
      title: loc('compliance 命中', 'Compliance hit'),
      text: fillL(
        loc(
          'Vds 超过了电压 compliance {comp} V，读数被截断，算出的 R = V/I 偏小。把 compliance 提到 I·Rds(on) 以上。',
          'Vds exceeds the {comp} V voltage compliance, so the reading is capped and R = V/I comes out too small. Raise the compliance above I·Rds(on).',
        ),
        vars,
      ),
    }
  }
  const small = (m.errPct ?? 0) < 1
  return {
    title: small ? loc('误差在 1% 以内', 'Error within 1%') : loc('自热误差超过 1%', 'Self-heating error above 1%'),
    text: fillL(
      loc(
        '脉宽 {pulse}，结温升 {dt} K，误差 {err}%。自热把 Rds(on) 抬高，脉冲越长越明显。1% 误差对应的单脉冲最长：{maxms}。',
        'With a {pulse} pulse the junction rises {dt} K and the error is {err}%. Self-heating lifts Rds(on), more so for longer pulses. Longest single pulse for 1% error: {maxms}.',
      ),
      vars,
    ),
  }
}

/** 四张任务卡：完成与否由当前设置与读数算出，重置后自动还原 */
export function taskItems(s: StaticState): TaskItem[] {
  const m = measureOf(s)
  const good = passWith(s, 'good')
  const faulty = passWith(s, s.param === 'igss' ? 'gate' : 'leaky')
  return [
    {
      id: 'bvdss-setup',
      text: S.task1,
      done: s.param === 'bvdss' && s.force >= 100 && s.force <= 500 && s.compliance >= BV_TRUE - 1 && s.compliance <= BV_TRUE + 1,
    },
    {
      id: 'pulse-width',
      text: S.task2,
      done: s.param === 'rdson' && s.force === 50 && (m.errPct ?? 100) < 1 && s.pulseUs >= 1500,
    },
    {
      id: 'vth-current',
      text: S.task3,
      done: s.param === 'vth' && s.force >= 2.5,
    },
    {
      id: 'limits',
      text: S.task4,
      done: (s.param === 'idss' || s.param === 'igss') && good === true && faulty === false,
    },
  ]
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '单级 Foster 热模型中，P = 12.5 W、Rth = 1 K/W、τ = 10 ms，脉宽 10 ms 时，结温升 ΔTj = P·Zth(t) 约为多少？',
      'In a single-stage Foster model with P = 12.5 W, Rth = 1 K/W and τ = 10 ms, what is the junction rise ΔTj = P·Zth(t) for a 10 ms pulse?',
    ),
    options: [
      { id: 'a', text: loc('1.3 K', '1.3 K') },
      { id: 'b', text: loc('7.9 K', '7.9 K') },
      { id: 'c', text: loc('12.5 K', '12.5 K') },
      { id: 'd', text: loc('0.5 K', '0.5 K') },
    ],
    answer: 'b',
    explain: loc(
      'Zth(10 ms) = 1 × (1 − e⁻¹) ≈ 0.632 K/W，ΔTj = 12.5 × 0.632 ≈ 7.9 K。12.5 K 是长时间（稳态）的温升，脉宽 10 ms 时还没到稳态。',
      'Zth(10 ms) = 1 × (1 − e⁻¹) ≈ 0.632 K/W, so ΔTj = 12.5 × 0.632 ≈ 7.9 K. The 12.5 K is the steady-state rise; a 10 ms pulse does not reach steady state.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '接上题，Rds(on) 的温度系数 α = 0.5 %/°C，ΔTj = 7.9 K，测得的 Rds(on) 相对 25 °C 真值的误差约为多少？',
      'Continuing, the Rds(on) temperature coefficient is α = 0.5 %/°C and ΔTj = 7.9 K. About how large is the error in Rds(on) against the 25 °C truth?',
    ),
    options: [
      { id: 'a', text: loc('0.4%', '0.4%') },
      { id: 'b', text: loc('39.5%', '39.5%') },
      { id: 'c', text: loc('3.95%', '3.95%') },
      { id: 'd', text: loc('0.95%', '0.95%') },
    ],
    answer: 'c',
    explain: loc(
      '误差 ≈ α·ΔTj = 0.005 × 7.9 = 0.0395，即 3.95%。这是教学简化公式，只在 α 近似不变的范围内成立。',
      'Error ≈ α·ΔTj = 0.005 × 7.9 = 0.0395, i.e. 3.95%. This is a teaching-simplified formula, valid while α is roughly constant.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      'I = 50 A、Rds(on) = 5 mΩ，要求自热引起的误差 <1%（即 ΔTj < 2 K），用单级模型算，单脉冲的最长脉宽约为多少？',
      'With I = 50 A and Rds(on) = 5 mΩ, and a requirement that self-heating error stays under 1% (ΔTj < 2 K), what is the longest single pulse with the single-stage model?',
    ),
    options: [
      { id: 'a', text: loc('1.74 ms', '1.74 ms') },
      { id: 'b', text: loc('100 µs', '100 µs') },
      { id: 'c', text: loc('17.4 ms', '17.4 ms') },
      { id: 'd', text: loc('10 ms', '10 ms') },
    ],
    answer: 'a',
    explain: loc(
      'P = 12.5 W，t = −τ·ln(1 − ΔTmax/(P·Rth)) = −10 ms × ln(1 − 2/12.5) = −10 ms × ln(0.84) ≈ 1.74 ms。10 ms 时误差已经约 4%，远超 1%。',
      'P = 12.5 W, t = −τ·ln(1 − ΔTmax/(P·Rth)) = −10 ms × ln(1 − 2/12.5) = −10 ms × ln(0.84) ≈ 1.74 ms. At 10 ms the error is already about 4%, far above 1%.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('脉冲测量为什么能减小 Rds(on) 的测量误差？', 'Why does pulsed measurement reduce the Rds(on) measurement error?'),
    options: [
      { id: 'a', text: loc('脉冲的电压更高，测得的 Vds 更准', 'The pulse has a higher voltage, so Vds is more accurate') },
      { id: 'b', text: loc('脉冲让 Vth 变小，器件更容易导通', 'The pulse lowers Vth, so the device turns on more easily') },
      { id: 'c', text: loc('脉冲可以去掉 compliance 的限制', 'The pulse removes the need for a compliance') },
      { id: 'd', text: loc('脉宽短，结温来不及升高，自热小', 'The pulse is short, so the junction has no time to heat up much') },
    ],
    answer: 'd',
    explain: loc(
      '自热误差 ≈ α·ΔTj，ΔTj 随脉宽增长。脉宽短，ΔTj 小，读数就接近 25 °C 真值。脉冲不改变电压，也不去掉 compliance。',
      'Self-heating error ≈ α·ΔTj, and ΔTj grows with pulse width. A short pulse keeps ΔTj small, so the reading stays near the 25 °C truth. A pulse does not change the voltage or remove the compliance.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于 Vth 的说法，哪些正确？① Vth 是器件常数；② Vth 依赖测试电流 Id；③ 同一器件，Id 越大读数越高（饱和区平方律）；④ 数据手册只需给一个 Vth 值。',
      'Which statements about Vth are correct? ① Vth is a device constant; ② Vth depends on the test current Id; ③ for the same device, a larger Id gives a higher reading (saturation square law); ④ a datasheet needs only one Vth value.',
    ),
    options: [
      { id: 'a', text: loc('① 和 ④', '① and ④') },
      { id: 'b', text: loc('② 和 ③', '② and ③') },
      { id: 'c', text: loc('①、②、③', '①, ② and ③') },
      { id: 'd', text: loc('② 和 ④', '② and ④') },
    ],
    answer: 'b',
    explain: loc(
      '② 和 ③ 对：Vth 由 Id 定义，Vgs = Vth + √(2·Id/kp)，Id 越大读数越高。① 错：Vth 不是常数。④ 错：规格书要写出测试条件（Id、Vds）以及典型值范围。',
      '② and ③ are right: Vth is defined by Id, and Vgs = Vth + √(2·Id/kp) rises with Id. ① is wrong: Vth is not a constant. ④ is wrong: the datasheet must state the conditions (Id, Vds) and the typical range.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '下列哪些是正确的测量设置？① BVdss 的电压 compliance 设在 BV 附近；② 测 Rds(on) 用直流长脉冲；③ Idss 在 Vds 取 BV 的某个比例下测；④ Igss 时 Vds = 0，Vgs 加 ±额定值。',
      'Which of these are correct measurement setups? ① BVdss voltage compliance set near BV; ② Rds(on) measured with a long DC pulse; ③ Idss measured with Vds at a fraction of BV; ④ Igss measured with Vds = 0 and Vgs at ± the rated value.',
    ),
    options: [
      { id: 'a', text: loc('①、③ 和 ④', '①, ③ and ④') },
      { id: 'b', text: loc('① 和 ②', '① and ②') },
      { id: 'c', text: loc('② 和 ④', '② and ④') },
      { id: 'd', text: loc('③ 和 ④', '③ and ④') },
    ],
    answer: 'a',
    explain: loc(
      '① 对：compliance 贴着 BV 既能读到 BV，又限制击穿后的电压。③ 对：Idss 按 BV 的比例强制 Vds。④ 对：Igss 是栅极漏电，Vds = 0。② 错：Rds(on) 要用脉冲，长时间直流会自热。',
      '① is right: a compliance close to BV reads BV and limits the post-breakdown voltage. ③ is right: Idss forces Vds at a fraction of BV. ④ is right: Igss is gate leakage with Vds = 0. ② is wrong: Rds(on) must be pulsed, since long DC self-heats.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      'Idss 测试读数恰好等于设定的 compliance（1000 nA），这说明什么？',
      'The Idss reading equals the set compliance (1000 nA) exactly. What does that tell you?',
    ),
    options: [
      { id: 'a', text: loc('器件的漏电正好是 1000 nA', 'The device leakage is exactly 1000 nA') },
      { id: 'b', text: loc('测试通过，可以判 PASS', 'The test passed, so PASS is valid') },
      { id: 'c', text: loc('真实漏电可能更大，读数被 compliance 截断，不能据此判 PASS', 'True leakage may be higher and the reading is capped by the compliance, so no PASS can be given') },
      { id: 'd', text: loc('把 Vds 降到 0 就能恢复正确读数', 'Lowering Vds to 0 restores a correct reading') },
    ],
    answer: 'c',
    explain: loc(
      '读数等于 compliance 说明仪器已经限流，真实电流可能更大。这时只能确定真值不低于 compliance；若 compliance 高于限值就已经 FAIL，否则无法判定。',
      'A reading equal to the compliance means the instrument hit its current limit, so the true current may be higher. You can only conclude the true value is at least the compliance; if the compliance is above the limit that is already a FAIL, otherwise the result is undecided.',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '良品在 25 °C 时 Idss 为 10 nA，按“每升高 10 °C 漏电翻倍”（教学简化），125 °C 时约为多少？',
      'A good die has Idss = 10 nA at 25 °C. With leakage doubling every 10 °C (teaching-simplified), what is it at 125 °C?',
    ),
    options: [
      { id: 'a', text: loc('10 nA', '10 nA') },
      { id: 'b', text: loc('100 nA', '100 nA') },
      { id: 'c', text: loc('1 µA', '1 µA') },
      { id: 'd', text: loc('10.24 µA', '10.24 µA') },
    ],
    answer: 'd',
    explain: loc(
      '125 °C 比 25 °C 高 100 K，翻倍 10 次：10 nA × 2¹⁰ = 10240 nA ≈ 10.24 µA。这说明高温测漏电时，同一个良品也可能超过限值。',
      '125 °C is 100 K above 25 °C, so there are 10 doublings: 10 nA × 2¹⁰ = 10240 nA ≈ 10.24 µA. A good die can exceed a fixed limit at high temperature.',
    ),
  },
  {
    id: 'q9',
    prompt: loc(
      '下列哪些说法是常见误区（错误的）？① DC 测 Rds(on) 比脉冲更准；② Vth 测一次就固定不变；③ 漏电只与器件有关，夹具也会贡献。',
      'Which of these are common misconceptions (wrong statements)? ① DC measurement of Rds(on) is more accurate than pulsing; ② Vth is fixed once measured; ③ leakage depends only on the device, the fixture contributes too.',
    ),
    options: [
      { id: 'a', text: loc('① 和 ②', '① and ②') },
      { id: 'b', text: loc('①、②、③', '①, ② and ③') },
      { id: 'c', text: loc('① 和 ③', '① and ③') },
      { id: 'd', text: loc('② 和 ③', '② and ③') },
    ],
    answer: 'b',
    explain: loc(
      '三条都是误区：DC 大电流自热让 Rds(on) 偏大；Vth 随 Id、温度与条件变化；测得的漏电包括夹具与绝缘的漏电（见 PWR-03）。',
      'All three are misconceptions: DC high current self-heats and raises Rds(on); Vth changes with Id, temperature and conditions; the measured leakage includes fixture and insulation leakage (see PWR-03).',
    ),
  },
  {
    id: 'q10',
    prompt: loc(
      '工程师在 Vth 测试中，Id = 250 µA 读出 3.01 V，Id = 2.5 mA 读出 3.03 V。最合理的解释是什么？',
      'An engineer reads 3.01 V at Id = 250 µA and 3.03 V at Id = 2.5 mA in a Vth test. What is the most reasonable explanation?',
    ),
    options: [
      { id: 'a', text: loc('两个读数都可能正确，它们对应不同的 Id 条件，规格书要把 Id 写清楚', 'Both can be correct: they are different Id conditions, and the datasheet must state Id') },
      { id: 'b', text: loc('器件已经损坏，应该报废', 'The device is damaged and should be scrapped') },
      { id: 'c', text: loc('第二个读数一定是错的', 'The second reading must be wrong') },
      { id: 'd', text: loc('Vth 只能在 1 mA 下测量', 'Vth can only be measured at 1 mA') },
    ],
    answer: 'a',
    explain: loc(
      'Vth 由测试电流定义，Id 越大读数越高（平方律）。两个数都可能正确，只是条件不同。所以只比较同一 Id 条件下的 Vth，报告时必须写明 Id。',
      'Vth is defined by the test current, and a larger Id gives a higher reading (square law). Both values can be correct under different conditions, so compare Vth only at the same Id and always report the Id.',
    ),
  },
]
import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { fmtV } from '../fund/parts'
import { fmtSI } from './measureModel'
import {
  CONT_CURRENT,
  CONT_HIGH,
  CONT_LOW,
  DEFAULT_SMU,
  SAFE_VLIMIT,
  VD_FWD,
  continuityJudge,
  smuMeasure,
  type ContinuityJudge,
  type DutKind,
  type SmuMode,
  type SmuResult,
  type SmuState,
} from './smuModel'

export const S = {
  kickerNow: loc('这一次测量', 'This measurement'),
  introTitle: loc('PMU / SMU：一个通道，加一个量、测另一个量', 'PMU / SMU: one channel, force one quantity, measure the other'),
  coreTitle: loc('拨一拨：模式、DUT 与限值', 'Try it: mode, DUT and compliance'),
  coreNote: loc(
    '下面的仪器是教学模型，DUT 是虚拟器件 VDUT-SMU1，数值都是示意。FVMI 加压测流，FIMV 加流测压；没有被强制的那个量由限值钳住。',
    'The instrument below is a teaching model. The DUT is the virtual device VDUT-SMU1 and all numbers are illustrative. FVMI forces voltage and measures current; FIMV forces current and measures voltage. The quantity that is not forced is held by the compliance limit.',
  ),
  modeLabel: loc('测量方式', 'Measurement mode'),
  vForce: loc('强制电压 Force V', 'Forced voltage (Force V)'),
  iForce: loc('强制电流 Force I', 'Forced current (Force I)'),
  dutLabel: loc('DUT 管脚状态', 'DUT pin condition'),
  iLimit: loc('电流限值（FVMI）', 'Current compliance (FVMI)'),
  vLimit: loc('电压限值（FIMV）', 'Voltage compliance (FIMV)'),
  rForce: loc('强制值', 'Forced value'),
  rLimit: loc('限值', 'Compliance'),
  rIdeal: loc('理想读数（无限值）', 'Ideal reading (no compliance)'),
  rReading: loc('仪器读数', 'Instrument reading'),
  rPinV: loc('管脚实际电压', 'Actual pin voltage'),
  rPinI: loc('管脚实际电流', 'Actual pin current'),
  rComp: loc('是否撞限', 'Compliance hit?'),
  hit: loc('撞限', 'Hit'),
  noHit: loc('未撞限', 'No'),
  noPath: loc('无通路（无穷大）', 'No path (infinite)'),
  compTitle: loc('限值与读数：撞限时读数停在限值上', 'Compliance and reading: a hit pins the reading at the limit'),
  compNote: loc(
    '蓝圈是理想读数，即没有限值时 DUT 本该给出的值；实心点是仪器真正显示的读数，未撞限为绿色，撞限为红色。金色短线标出限值。',
    'The blue ring is the ideal reading, the value the DUT would give with no limit. The solid dot is what the instrument shows: green when within the limit, red on a hit. The gold ticks mark the compliance limit.',
  ),
  clampTitle: loc('撞限：读数被钳住', 'Compliance hit: reading clamped'),
  noPathTitle: loc('无通路', 'No path'),
  validTitle: loc('读数有效', 'Reading valid'),
  signTitle: loc('电流方向错', 'Wrong current sign'),
  limitTitle: loc('限值太低', 'Compliance too low'),
  openTitle: loc('开路', 'Open'),
  shortTitle: loc('短路', 'Short'),
  passTitle: loc('连通', 'Connected'),
  otherTitle: loc('超出判据', 'Outside the criteria'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '限值精度、建立时间和保护继电器的细节在仪器规格书里；这里只练选模式、设限值和判开短路。',
    'Limit accuracy, settling time and protection relays are in the instrument datasheet; here we only practise choosing the mode, setting the limit and judging opens and shorts.',
  ),
  nextPrefix: loc('下一课：', 'Next: '),
}

export const FIG = {
  hookAria: loc('接线示意：PMU / SMU 通道与 DUT 管脚内部的元件', 'Hookup diagram: PMU / SMU channel and the parts inside the DUT pin'),
  hookCap: loc(
    '管脚对地可能是四种情况：好脚是一只保护二极管加一个很大的漏电电阻，二极管只在约 −0.65 V 以下导通；过流器件是低阻；短路是更低的阻值；开路则没有任何通路。红色表示撞限。',
    'The pin to ground can be one of four cases: a good pin, an ESD diode in parallel with a very large leakage resistance, where the diode conducts only below about −0.65 V; an overcurrent device, a low resistance; a short, an even lower resistance; or an open, with no path at all. Red means a compliance hit.',
  ),
  instrument: loc('PMU / SMU', 'PMU / SMU'),
  boxLimit: loc('限值', 'Limit'),
  hitText: loc('撞限', 'Compliance'),
  okText: loc('未撞限', 'Within limit'),
  noPathText: loc('无通路', 'No path'),
  pinText: loc('DUT 管脚', 'DUT pin'),
  compAria: loc('限值仪表：理想读数、限值与仪器读数在同一刻度上', 'Compliance gauge: ideal reading, limit and instrument reading on one scale'),
  compCap: loc(
    '横轴：FVMI 为电流（对数刻度），FIMV 为电压（线性刻度）。读数不会越过限值线；超过的部分被钳住，PMU 的实际输出也跟着变。',
    'Horizontal axis: current on a log scale for FVMI, voltage on a linear scale for FIMV. The reading never goes past the limit line; whatever exceeds it is clamped, and the real output changes with it.',
  ),
  ideal: loc('理想', 'Ideal'),
  reading: loc('读数', 'Reading'),
  limit: loc('限值', 'Limit'),
  window: loc('好脚窗口', 'Good-pin window'),
}

export const MODE_OPTIONS: Array<{ id: SmuMode; label: LText }> = [
  { id: 'fvmi', label: loc('FVMI：加压测流', 'FVMI: force V, measure I') },
  { id: 'fimv', label: loc('FIMV：加流测压', 'FIMV: force I, measure V') },
]

export const DUT_NAMES: Record<DutKind, LText> = {
  good: loc('好脚（保护二极管）', 'Good pin (ESD diode)'),
  overcurrent: loc('过流器件（低阻）', 'Overcurrent device (low R)'),
  open: loc('开路（无通路）', 'Open (no path)'),
  short: loc('短路（对地低阻）', 'Short (low R to ground)'),
}

export const DUT_OPTIONS: Array<{ id: DutKind; label: LText }> = [
  { id: 'good', label: DUT_NAMES.good },
  { id: 'overcurrent', label: DUT_NAMES.overcurrent },
  { id: 'open', label: DUT_NAMES.open },
  { id: 'short', label: DUT_NAMES.short },
]

export const INTRO: LText[] = [
  loc(
    '{@anaMeasure} 讲过 Force 与 Measure。PMU / SMU 把这件事做成一个通道：加压就测流，加流就测压；它既是电源，也是电表。',
    '{@anaMeasure} covered Force and Measure. A PMU / SMU puts that into one channel: force voltage and measure current, or force current and measure voltage. It is both a source and a meter.',
  ),
  loc(
    '这一课练三件事：FVMI 与 FIMV 怎么选；限值（Compliance）什么时候钳住读数；用 −100 µA 与开短路判据判断管脚是否接好。PMU 的完整结构见 {@pmu}。',
    'This lesson practises three things: how to choose between FVMI and FIMV; when a compliance limit clamps the reading; and how to use a −100 µA current with the open / short criteria to check that a pin is connected. The full PMU structure is in {@pmu}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '限值设得越高越安全。限值是 PMU 的保护上限：设得太高，过流或短路时电流可能烧坏 DUT 或仪器；设得太低，好脚也会撞限被误判。应该设在正常读数之上、损坏电流之下。',
    'A higher compliance is always safer. The limit is the PMU’s protection ceiling: set too high, an overcurrent or short can damage the DUT or the instrument; set too low, a good pin hits the limit and is misjudged. Set it above the normal reading and below the damage level.',
  ),
  loc(
    'FVMI 读到 0 A 就说明管脚是好的。开路时没有电流，读数是 0 A；好脚的漏电也接近 0。FVMI 分不清这两种情况，判开路要用 FIMV：加一个电流，看电压会不会被推到钳位。',
    'Reading 0 A with FVMI means the pin is good. An open also reads 0 A, and a good pin leaks very little, so FVMI cannot tell them apart. To find an open, use FIMV: force a current and check whether the voltage is pushed to the clamp.',
  ),
  loc(
    '撞限一定说明 DUT 坏了。撞限只说明限值挡住了输出：限值低于器件正常需要的值时，好脚也会撞限。先把限值设到合理范围再判断，撞限不等于坏。',
    'A compliance hit always means the DUT is bad. A hit only means the limit stopped the output. If the limit is below what a good device needs, a good pin also hits. Set a sensible limit before judging; a hit does not by itself mean a bad part.',
  ),
]

export const TAKEAWAY: LText = loc(
  'FVMI 加压测流，FIMV 加流测压；被强制的量由你选，另一个量由仪器读。撞限时读数停在限值上，要先调好限值再判。开短路用 −100 µA 灌入：好脚的保护二极管把管脚钳在约 −0.65 V，开路会被推到电压限值，短路接近 0 V；电压限值要在 1 V 以上，否则好脚会被误判。',
  'FVMI forces voltage and measures current; FIMV forces current and measures voltage. You choose which quantity is forced, and the instrument reads the other. On a hit the reading sits on the limit, so set the limit before judging. For opens and shorts, sink −100 µA: a good pin’s ESD diode clamps the pin near −0.65 V, an open runs to the voltage limit, and a short reads near 0 V. Keep the voltage limit at 1 V or more, or a good pin is misjudged.',
)

/** 右侧说明栏：根据当前设置和结果给出结论和原因 */
export function verdictOf(state: SmuState, result: SmuResult): { title: LText; text: LText } {
  if (state.mode === 'fvmi') {
    if (result.compliance) {
      return {
        title: S.clampTitle,
        text: loc(
          `所设电流限值 ${fmtSI(state.iLimit, 'A')} 小于 DUT 需要的 ${fmtSI(result.ideal ?? 0, 'A')}。PMU 只能把电流压在限值上，管脚电压随之变成 ${fmtV(result.pinVoltage)}。读数是限值，不是真实电流。`,
          `The current limit ${fmtSI(state.iLimit, 'A')} is below the ${fmtSI(result.ideal ?? 0, 'A')} the DUT needs. The PMU can only hold the current at the limit, so the pin voltage becomes ${fmtV(result.pinVoltage)}. The reading is the limit, not the true current.`,
        ),
      }
    }
    if (state.dut === 'open') {
      return {
        title: S.noPathTitle,
        text: loc(
          '开路时没有电流，读数是 0 A。FVMI 只看电流，好脚的漏电也接近 0，所以 FVMI 分不清开路和好脚；判开路要用 FIMV。',
          'An open carries no current, so the reading is 0 A. FVMI only looks at current, and a good pin leaks almost none, so FVMI cannot separate an open from a good pin; use FIMV to check for opens.',
        ),
      }
    }
    return {
      title: S.validTitle,
      text: loc(
        `读数 ${fmtSI(result.reading, 'A')} 没有撞限，它就是 DUT 的真实电流（示意）。`,
        `The reading of ${fmtSI(result.reading, 'A')} did not hit the limit, so it is the DUT’s real current (illustrative).`,
      ),
    }
  }

  const judge = continuityJudge(state, result)
  if (judge === 'sign') {
    return {
      title: S.signTitle,
      text: loc(
        '正电流把管脚推向电源轨，好脚也会撞限，判不出连通。开短路判据要用 −100 µA 灌出管脚，让保护二极管在 −0.65 V 附近钳住。',
        'A positive current pushes the pin toward the supply rail, so a good pin also hits the limit and cannot show continuity. The open / short test sinks −100 µA so the ESD diode clamps near −0.65 V.',
      ),
    }
  }
  if (judge === 'limit') {
    return {
      title: S.limitTitle,
      text: loc(
        `电压限值 ${state.vLimit.toFixed(2)} V 低于好脚的 -${VD_FWD.toFixed(2)} V 压降，PMU 在限值处撞限，好脚被误判成开路。把电压限值提到 1 V 以上再判。`,
        `The voltage limit of ${state.vLimit.toFixed(2)} V is below the -${VD_FWD.toFixed(2)} V drop of a good pin, so the PMU hits the limit and a good pin is misjudged as open. Raise the voltage limit to 1 V or more and judge again.`,
      ),
    }
  }
  if (judge === 'open') {
    return {
      title: S.openTitle,
      text: loc(
        `读数撞在 -${state.vLimit.toFixed(2)} V，限值已在 1 V 以上：灌入的电流没有回路，电压一路被推到钳位，判为开路。`,
        `The reading hits -${state.vLimit.toFixed(2)} V with the limit at 1 V or more: the current has no return path, so the voltage climbs to the clamp. Judged open.`,
      ),
    }
  }
  if (judge === 'short') {
    return {
      title: S.shortTitle,
      text: loc(
        `读数 ${fmtV(result.reading)} 接近 0 V，远离好脚的 -${VD_FWD.toFixed(2)} V，管脚对地是低阻，判为短路。过流器件在这里也表现为低阻。`,
        `The reading of ${fmtV(result.reading)} is near 0 V, far from the -${VD_FWD.toFixed(2)} V of a good pin, so the pin is low-resistance to ground and judged short. An overcurrent device also looks low-resistance here.`,
      ),
    }
  }
  if (judge === 'pass') {
    return {
      title: S.passTitle,
      text: loc(
        `读数 ${fmtV(result.reading)} 落在 ${CONT_LOW.toFixed(2)} V 到 ${CONT_HIGH.toFixed(2)} V 之间，判为连通：保护二极管正常导通。`,
        `The reading of ${fmtV(result.reading)} lies between ${CONT_LOW.toFixed(2)} V and ${CONT_HIGH.toFixed(2)} V, so it is judged connected: the protection diode conducts normally.`,
      ),
    }
  }
  return {
    title: S.otherTitle,
    text: loc('读数不在任何判据之内，先检查 DUT 状态与限值。', 'The reading is outside every criterion; check the DUT condition and the limit first.'),
  }
}

/** 三张任务卡：完成与否由当前设置和结果算出 */
export function taskItems(state: SmuState, result: SmuResult, judge: ContinuityJudge): TaskItem[] {
  const t1 = state.mode === 'fvmi' && state.dut === 'overcurrent' && Math.abs(state.vForce - 1) < 1e-6 && !result.compliance
  const t2 =
    state.mode === 'fimv' &&
    Math.abs(state.iForce - CONT_CURRENT) < 1e-12 &&
    ((state.dut === 'open' && judge === 'open') || (state.dut === 'short' && judge === 'short'))
  const t3 =
    state.mode === 'fimv' &&
    state.dut === 'good' &&
    Math.abs(state.iForce - CONT_CURRENT) < 1e-12 &&
    state.vLimit >= SAFE_VLIMIT &&
    judge === 'pass'
  return [
    {
      id: 'compliance',
      text: loc(
        'FVMI 在 1 V 下测过流器件：把电流限值设得足够大，让读数不被钳位。',
        'FVMI at 1 V on the overcurrent device: set a current limit high enough that the reading is not clamped.',
      ),
      done: t1,
    },
    {
      id: 'openshort',
      text: loc(
        'FIMV 灌入 −100 µA，电压限值不低于 1 V：选开路或短路 DUT，用判据判出它的状态。',
        'FIMV with −100 µA and a voltage limit of at least 1 V: pick the open or the short DUT and use the criteria to identify it.',
      ),
      done: t2,
    },
    {
      id: 'connected',
      text: loc(
        'FIMV 灌入 −100 µA，电压限值不低于 1 V：对好脚测试，判为连通。',
        'FIMV with −100 µA and a voltage limit of at least 1 V: test the good pin and judge it connected.',
      ),
      done: t3,
    },
  ]
}

/** 小测的数字全部由模型算出，改了模型，小测和解析自动跟着变 */
const DEFAULT_FVMI: SmuState = { ...DEFAULT_SMU, mode: 'fvmi', vForce: 1, iLimit: 1e-3 }
const Q_OVER_FVMI = smuMeasure({ ...DEFAULT_FVMI, dut: 'overcurrent' })
const Q_GOOD_FVMI = smuMeasure({ ...DEFAULT_FVMI, dut: 'good' })
const Q_GOOD_FIMV = smuMeasure({ ...DEFAULT_SMU, mode: 'fimv', iForce: CONT_CURRENT, vLimit: 3, dut: 'good' })
const Q_OPEN_FIMV = smuMeasure({ ...DEFAULT_SMU, mode: 'fimv', iForce: CONT_CURRENT, vLimit: 3, dut: 'open' })
const Q_POS_FIMV = smuMeasure({ ...DEFAULT_SMU, mode: 'fimv', iForce: -CONT_CURRENT, vLimit: 3, dut: 'good' })
const Q_LOW_FIMV = smuMeasure({ ...DEFAULT_SMU, mode: 'fimv', iForce: CONT_CURRENT, vLimit: 0.5, dut: 'good' })

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      'FVMI：强制 1 V，DUT 是过流器件，电流限值设为 1 mA。仪器读数是多少？',
      'FVMI: force 1 V on the overcurrent device with a 1 mA current limit. What does the instrument read?',
    ),
    options: [
      { id: 'a', text: loc(`${fmtSI(Q_OVER_FVMI.ideal ?? 0, 'A')}（DUT 本来需要的电流）`, `${fmtSI(Q_OVER_FVMI.ideal ?? 0, 'A')} (what the DUT would need)`) },
      { id: 'b', text: loc(`${fmtSI(Q_OVER_FVMI.reading, 'A')}（撞限，读数被钳住）`, `${fmtSI(Q_OVER_FVMI.reading, 'A')} (hit, reading clamped)`) },
      { id: 'c', text: loc('0 A', '0 A') },
    ],
    answer: 'b',
    explain: loc(
      `DUT 需要 ${fmtSI(Q_OVER_FVMI.ideal ?? 0, 'A')}，但限值只有 ${fmtSI(1e-3, 'A')}。PMU 把电流压在限值上，读数就停在 ${fmtSI(Q_OVER_FVMI.reading, 'A')}，不是真实值。把限值提到 100 mA 以上，读数就不再被钳位。`,
      `The DUT needs ${fmtSI(Q_OVER_FVMI.ideal ?? 0, 'A')}, but the limit is only ${fmtSI(1e-3, 'A')}. The PMU holds the current at the limit, so the reading stops at ${fmtSI(Q_OVER_FVMI.reading, 'A')}, not the true value. With a limit of 100 mA or more, the reading is no longer clamped.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      'FIMV：灌入 −100 µA，电压限值 3 V，测好脚。仪器读数约是多少？',
      'FIMV: sink −100 µA with a 3 V voltage limit on a good pin. About what does the instrument read?',
    ),
    options: [
      { id: 'a', text: loc('0 V', '0 V') },
      { id: 'b', text: loc(`${fmtV(Q_GOOD_FIMV.reading)}（保护二极管钳位）`, `${fmtV(Q_GOOD_FIMV.reading)} (clamped by the ESD diode)`) },
      { id: 'c', text: loc('-3.00 V（撞限）', '-3.00 V (hit)') },
    ],
    answer: 'b',
    explain: loc(
      `灌出 −100 µA 时，保护二极管从 VSS 向管脚补电流，管脚被钳在 ${fmtV(Q_GOOD_FIMV.reading)} 附近，远低于 3 V 限值，所以不撞限。这个压降就是开短路判据的依据。`,
      `When −100 µA is sunk, the ESD diode feeds current into the pin from VSS and holds it near ${fmtV(Q_GOOD_FIMV.reading)}, far inside the 3 V limit, so there is no hit. This drop is the basis of the open / short criterion.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      'FIMV：灌入 −100 µA，电压限值 3 V，测开路管脚。仪器读数是多少？',
      'FIMV: sink −100 µA with a 3 V voltage limit on an open pin. What does the instrument read?',
    ),
    options: [
      { id: 'a', text: loc(`${fmtV(Q_GOOD_FIMV.reading)}（好脚）`, `${fmtV(Q_GOOD_FIMV.reading)} (good pin)`) },
      { id: 'b', text: loc('0 V', '0 V') },
      { id: 'c', text: loc(`${fmtV(Q_OPEN_FIMV.reading)}（撞限）`, `${fmtV(Q_OPEN_FIMV.reading)} (hit)`) },
    ],
    answer: 'c',
    explain: loc(
      `开路时没有电流回路，PMU 把电压一路推到 3 V 限值，读数停在 ${fmtV(Q_OPEN_FIMV.reading)} 并撞限。限值已在 1 V 以上，所以这是开路，而不是限值太低。`,
      `An open has no current return path, so the PMU drives the voltage up to the 3 V limit and the reading stops at ${fmtV(Q_OPEN_FIMV.reading)} with a hit. The limit is above 1 V, so this is an open, not a limit that is too low.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      'FIMV：灌入 +100 µA（正电流），电压限值 3 V，测好脚。仪器读数是多少？',
      'FIMV: force +100 µA (positive current) with a 3 V voltage limit on a good pin. What does the instrument read?',
    ),
    options: [
      { id: 'a', text: loc('+0.65 V', '+0.65 V') },
      { id: 'b', text: loc(`${fmtV(Q_POS_FIMV.reading)}（撞限）`, `${fmtV(Q_POS_FIMV.reading)} (hit)`) },
      { id: 'c', text: loc(`${fmtV(Q_POS_FIMV.ideal ?? 0)}（理想值）`, `${fmtV(Q_POS_FIMV.ideal ?? 0)} (ideal value)`) },
    ],
    answer: 'b',
    explain: loc(
      `好脚对地只有 1 MΩ 的漏电通路，+100 µA 要把管脚推到 ${fmtV(Q_POS_FIMV.ideal ?? 0)}，远超 3 V 限值。读数被钳在 ${fmtV(Q_POS_FIMV.reading)}，管脚实际只流过 ${fmtSI(Q_POS_FIMV.pinCurrent, 'A')}。正电流不能用来判连通。`,
      `A good pin only has a 1 MΩ leakage path to ground, so +100 µA would drive the pin to ${fmtV(Q_POS_FIMV.ideal ?? 0)}, far beyond the 3 V limit. The reading is clamped at ${fmtV(Q_POS_FIMV.reading)}, and the pin actually carries only ${fmtSI(Q_POS_FIMV.pinCurrent, 'A')}. A positive current cannot be used to judge continuity.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      'FVMI：强制 1 V，电流限值 1 mA，测开路管脚。仪器读数是多少？',
      'FVMI: force 1 V with a 1 mA current limit on an open pin. What does the instrument read?',
    ),
    options: [
      { id: 'a', text: loc(`${fmtSI(Q_GOOD_FVMI.ideal ?? 0, 'A')}（好脚的漏电）`, `${fmtSI(Q_GOOD_FVMI.ideal ?? 0, 'A')} (a good pin's leakage)`) },
      { id: 'b', text: loc('0 A', '0 A') },
      { id: 'c', text: loc(`${fmtSI(1e-3, 'A')}（撞限）`, `${fmtSI(1e-3, 'A')} (hit)`) },
    ],
    answer: 'b',
    explain: loc(
      `开路时没有电流通路，读数就是 0 A。好脚只漏 ${fmtSI(Q_GOOD_FVMI.ideal ?? 0, 'A')}，两者在读数上只差一点点，所以 FVMI 很难判开路。判开路要用 FIMV 加电流看电压。`,
      `An open has no current path, so the reading is 0 A. A good pin leaks only ${fmtSI(Q_GOOD_FVMI.ideal ?? 0, 'A')}, so the two readings differ by very little and FVMI is a poor open test. Use FIMV to force a current and look at the voltage.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      'FIMV：灌入 −100 µA，电压限值设为 0.5 V，测好脚。读数贴着 −0.50 V 且撞限。最合理的结论是什么？',
      'FIMV: sink −100 µA with a 0.5 V voltage limit on a good pin. The reading sits at −0.50 V with a hit. What is the most reasonable conclusion?',
    ),
    options: [
      { id: 'a', text: loc('管脚真的开路', 'The pin really is open') },
      { id: 'b', text: loc('限值太低（0.5 V 小于 0.65 V），好脚被误判成开路', 'The limit is too low (0.5 V is below 0.65 V), so a good pin is misjudged as open') },
      { id: 'c', text: loc('DUT 过流', 'The DUT is overcurrent') },
    ],
    answer: 'b',
    explain: loc(
      `好脚的保护二极管需要约 0.65 V 才能导通，限值 0.5 V 挡住了它，读数停在 ${fmtV(Q_LOW_FIMV.reading)} 并撞限。读数像开路，但原因是限值。把电压限值提到 1 V 以上，好脚会读到 ${fmtV(Q_GOOD_FIMV.reading)}。`,
      `The good pin’s ESD diode needs about 0.65 V to conduct, and the 0.5 V limit blocks it, so the reading stops at ${fmtV(Q_LOW_FIMV.reading)} with a hit. It looks like an open, but the cause is the limit. With a voltage limit of 1 V or more, the good pin reads ${fmtV(Q_GOOD_FIMV.reading)}.`,
    ),
  },
]

import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  DEFAULT_STATE,
  LEAD_OHM,
  LIMIT_PCT,
  fmtPct,
  instrumentBand,
  measure,
  measureOnRange,
  type MeasureMode,
  type MeasureResult,
  type MeasureState,
  type WireMode,
} from './measureModel'

export const S = {
  kickerNow: loc('这一次测量', 'This measurement'),
  introTitle: loc('测量 = Force 一个量，Measure 另一个量', 'A measurement = force one quantity, measure another'),
  coreTitle: loc('拨一拨：接法、量程与误差', 'Try it: hookup, range and error'),
  coreNote: loc(
    'PMU / SMU 只做两件事：在 DUT 上 Force 一个量（电压或电流），同时 Measure 另一个量。下面的仪器是教学模型，误差带与导线电阻都是示意数字。',
    'A PMU / SMU does two things: it forces one quantity (voltage or current) on the DUT and measures the other. The instrument below is a teaching model; the error band and lead resistance are illustrative numbers.',
  ),
  modeLabel: loc('测量方式', 'Measurement mode'),
  vForce: loc('Force 电压', 'Force voltage'),
  iForce: loc('Force 电流', 'Force current'),
  rDut: loc('DUT 电阻', 'DUT resistance'),
  wiresLabel: loc('接法', 'Wiring'),
  iRangeLabel: loc('电流量程（测 I 用）', 'Current range (for measuring I)'),
  vRangeLabel: loc('电压量程（测 V 用）', 'Voltage range (for measuring V)'),
  rangeTitle: loc('量程与误差带', 'Range and error band'),
  rangeNote: loc(
    '同一个读数，换一档量程，误差带就变。每根横条是该量程下的误差带占读数的百分比；虚线是测试限值 0.3%。',
    'The same reading gets a different error band on each range. Each bar is that range’s band as a percentage of the reading; the dashed line is the 0.3% test limit.',
  ),
  rTrue: loc('理想值（无导线、无误差）', 'Ideal value (no leads, no error)'),
  rReading: loc('仪器读数', 'Instrument reading'),
  rSetup: loc('导线引起的误差', 'Error from the leads'),
  rBand: loc('仪器误差带（±）', 'Instrument band (±)'),
  rRange: loc('量程状态', 'Range status'),
  rVerdict: loc('判定（限值 0.3%）', 'Verdict (limit 0.3%)'),
  ok: loc('量程内', 'In range'),
  ovr: loc('OVR 超量程', 'OVR over range'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '量程和误差带的细节（满量程项、温漂、校准）在仪器规格书里；这里只练选量程和判断接法。',
    'Range detail (full-scale term, drift, calibration) lives in the instrument datasheet; here we only practise choosing a range and judging the hookup.',
  ),
  next: loc('下一课：ATE 模拟资源与负载板', 'Next: ATE analog resources and load board'),
  modeForceV: loc('Force V → 测 I', 'Force V → measure I'),
  modeForceI: loc('Force I → 测 V', 'Force I → measure V'),
  wiresTwo: loc('2 线（普通）', '2-wire (plain)'),
  wiresFour: loc('4 线 Kelvin', '4-wire Kelvin'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
}

export const FIG = {
  hookAria: loc('测量接线示意图：仪器、导线电阻与 DUT', 'Hookup diagram: instrument, lead resistance and DUT'),
  hookCap: loc(
    '蓝线是加压回路。红色小块是导线电阻：2 线时它串进回路，读数会偏；4 线 Kelvin 时金色虚线的感测线直接接在 DUT 引脚上，只量电压、几乎不通过电流，导线压降不进读数。',
    'Blue is the forcing loop. Red blocks are lead resistance: in 2-wire mode it sits in the loop and skews the reading; in 4-wire Kelvin mode the gold dashed sense lines touch the DUT pins, carry almost no current, so the lead drop stays out of the reading.',
  ),
  senseTwo: loc('2 线：加压和感测共用同一对线', '2-wire: force and sense share the same leads'),
  senseFour: loc('4 线：金色虚线是感测线，不通过电流', '4-wire: gold dashed lines are sense lines and carry no current'),
  instrument: loc('PMU / SMU', 'PMU / SMU'),
  rangeAria: loc('各量程的误差带横条', 'Error band bars for each range'),
  rangeCap: loc(
    '横条越短误差带越窄。读数很小时，「0.05% × 量程」那一项占主导，所以选能容纳读数的最小量程。OVR 的量程没有可用的读数。',
    'Shorter bars mean a narrower band. For a small reading the “0.05% × range” term dominates, so pick the smallest range that still holds the reading. An OVR range gives no usable reading.',
  ),
  bandAxis: loc('误差带占读数（0–2%）', 'Error band as % of reading (0–2%)'),
  limitLabel: loc('限值 0.3%', 'Limit 0.3%'),
  selected: loc('当前', 'Now'),
}

export const MODE_OPTIONS: Array<{ id: MeasureMode; label: LText }> = [
  { id: 'forceV', label: S.modeForceV },
  { id: 'forceI', label: S.modeForceI },
]

export const WIRE_OPTIONS: Array<{ id: WireMode; label: LText }> = [
  { id: 'two', label: S.wiresTwo },
  { id: 'four', label: S.wiresFour },
]

export const INTRO: LText[] = [
  loc(
    '{@pMeasure} 讲过 V = IR 和电压表、电流表怎么接。ATE 的 PMU（SMU）把这件事做成一个能编程的仪器：一个通道既能当电压源，也能当电流表；另一个量由它同时读回来。',
    '{@pMeasure} covered V = IR and how voltmeters and ammeters are connected. An ATE PMU (SMU) turns that into a programmable instrument: one channel can act as a voltage source and an ammeter at the same time, and it reads back the other quantity.',
  ),
  loc(
    '这一课只练三件事：Force 的是哪个量、Measure 的是哪个量；量程怎么选才不超量程、误差带是多少；导线电阻什么时候会让结果偏。PMU 的完整结构见 {@pmu}。',
    'This lesson practises three things: which quantity is forced and which is measured; how to pick a range that does not overrange and what the error band is; when lead resistance skews the result. The full PMU structure is in {@pmu}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '量程越大越保险。量程变大，「0.05% × 量程」那一项跟着变大；读数小的时候，误差带甚至会比读数本身还大。',
    'A bigger range is always safer. A bigger range enlarges the “0.05% × range” term, and for a small reading the band can even exceed the reading itself.',
  ),
  loc(
    '只有低阻才需要 4 线。严格说，导线误差约等于 2 × R_lead ÷ R_DUT，R_DUT 越小越明显；高阻 DUT 的导线误差通常可以忽略。',
    'Only low resistances need 4-wire. Strictly, the lead error is about 2 × R_lead ÷ R_DUT, so it grows as R_DUT shrinks; for a high-resistance DUT it is usually negligible.',
  ),
  loc(
    '读数小，误差就小。误差带有两项：一项正比于读数，一项正比于量程。读数小了，正比于量程的那一项不会变小。',
    'A small reading means a small error. The band has two terms: one proportional to the reading, one to the range. A smaller reading does not shrink the range term.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Force 与 Measure 要成对想：先定 Force 的量，再选 Measure 的量程；量程选能容纳读数的最小一档；低阻 DUT 用 4 线 Kelvin，把导线压降挡在感测之外。',
  'Think of force and measure as a pair: set the forced quantity first, then choose the measuring range; use the smallest range that holds the reading; use 4-wire Kelvin for low-resistance DUTs so the lead drop stays out of the sense path.',
)

/** 右侧说明栏：根据当前结果给一句结论和原因，不让学生自己猜 */
export function verdictOf(result: MeasureResult): { title: LText; text: LText } {
  if (result.overrange) {
    return {
      title: S.ovr,
      text: loc(
        '读数超出所选量程，仪器只能显示 OVR。OVR 的数不能当测量值：换大一档量程，或者检查 DUT 是不是真的有这么大的电流 / 电压。',
        'The reading is over the selected range, so the instrument can only show OVR. An OVR value is not a measurement: pick the next larger range, or check whether the DUT really carries that much current or voltage.',
      ),
    }
  }
  if (Math.abs(result.setupPct) > LIMIT_PCT) {
    return {
      title: S.fail,
      text: loc(
        `导线引起的误差是 ${fmtPct(result.setupPct)}，超过 0.3%。导线电阻串进了回路，读数被拉偏。低阻 DUT 改用 4 线 Kelvin，让感测线直接接在 DUT 引脚上。`,
        `The lead error is ${fmtPct(result.setupPct)}, beyond 0.3%. The lead resistance sits in the loop and pulls the reading off. For a low-resistance DUT switch to 4-wire Kelvin so the sense lines touch the DUT pins directly.`,
      ),
    }
  }
  if (result.bandPct > LIMIT_PCT) {
    return {
      title: S.fail,
      text: loc(
        `这一档量程的误差带是读数的 ${result.bandPct.toFixed(2)}%，超过 0.3%。量程比读数大太多，「0.05% × 量程」把误差拖大。改选能容纳读数的最小一档。`,
        `On this range the error band is ${result.bandPct.toFixed(2)}% of the reading, beyond 0.3%. The range is far larger than the reading, so the “0.05% × range” term inflates the error. Choose the smallest range that still holds the reading.`,
      ),
    }
  }
  return {
    title: S.pass,
    text: loc(
      `误差带 ${result.bandPct.toFixed(2)}%、导线误差 ${fmtPct(result.setupPct)}，都在 0.3% 以内。注意量程是按「被测的那个量」选的，不是按加压的那个量。`,
      `Band ${result.bandPct.toFixed(2)}% and lead error ${fmtPct(result.setupPct)}, both within 0.3%. Note the range is chosen for the quantity being measured, not the one being forced.`,
    ),
  }
}

/** 三张任务卡：完成与否直接由当前设置和结果算出 */
export function taskItems(state: MeasureState, result: MeasureResult): TaskItem[] {
  const t1 = state.mode === 'forceV' && Math.abs(state.vForce - 1) < 1e-9 && state.rDut === 1e4 && result.pass
  const t2 = state.mode === 'forceI' && Math.abs(state.iForce - 1e-3) < 1e-12 && state.rDut === 100 && state.wires === 'four' && result.pass
  const t3 = state.mode === 'forceI' && Math.abs(state.iForce - 1e-3) < 1e-12 && state.wires === 'two' && state.rDut >= 1e3 && result.pass
  return [
    {
      id: 'range',
      text: loc(
        'Force V = 1.0 V，DUT = 10 kΩ，选对电流量程，使测量通过 0.3% 限值。',
        'Force V = 1.0 V, DUT = 10 kΩ: pick the current range so the measurement passes the 0.3% limit.',
      ),
      done: t1,
    },
    {
      id: 'kelvin',
      text: loc(
        'Force I = 1 mA，DUT = 100 Ω：换成 4 线接法，并选对电压量程，使测量通过限值。',
        'Force I = 1 mA, DUT = 100 Ω: switch to 4-wire and pick the voltage range so the measurement passes the limit.',
      ),
      done: t2,
    },
    {
      id: 'twowire',
      text: loc(
        'Force I = 1 mA，用 2 线找一个 DUT（电阻 ≥ 1 kΩ），并选对电压量程，使 2 线测量也通过限值。',
        'Force I = 1 mA with 2-wire: find a DUT of at least 1 kΩ and pick the voltage range so the 2-wire measurement still passes.',
      ),
      done: t3,
    },
  ]
}

/** 小测的答案全部由模型算出，改了模型，小测和解析自动跟着变 */
const BAND_AT_1MA = measure({ ...DEFAULT_STATE, vForce: 1, rDut: 1e4, iRange: 1e-3, wires: 'two' })
const LEAD_ERR_2WIRE = measure({ ...DEFAULT_STATE, mode: 'forceI', iForce: 1e-3, rDut: 100, wires: 'two' })
const BAND_02 = measureOnRange({ ...DEFAULT_STATE, mode: 'forceI', iForce: 1e-3, rDut: 100, wires: 'four' }, 0.2)
const BAND_2 = measureOnRange({ ...DEFAULT_STATE, mode: 'forceI', iForce: 1e-3, rDut: 100, wires: 'four' }, 2)
const BAND_0V2 = instrumentBand(0.1, 0.2)
const BAND_2V = instrumentBand(0.1, 2)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      'DUT 是 100 Ω，用 2 线接法做 Force I = 1 mA、测电压。读数比真值（0.1 V）偏高，主要原因是什么？',
      'The DUT is 100 Ω. Using 2-wire wiring, Force I = 1 mA and measure voltage. The reading is above the true 0.1 V. What is the main cause?',
    ),
    options: [
      { id: 'a', text: loc('量程误差：满量程项太大', 'Range error: the full-scale term is too large') },
      { id: 'b', text: loc('导线电阻串进了回路，回路变成 R + 2·R_lead', 'Lead resistance is in the loop: it becomes R + 2·R_lead') },
      { id: 'c', text: loc('仪器 ADC 的位数不够', 'The instrument ADC has too few bits') },
    ],
    answer: 'b',
    explain: loc(
      `回路电阻 = 100 + 2 × ${LEAD_OHM} = 101 Ω，所以电压读数 = 1 mA × 101 Ω = 0.101 V，比真值高 ${fmtPct(LEAD_ERR_2WIRE.setupPct)}。改用 4 线 Kelvin 后这一项消失。`,
      `Loop resistance = 100 + 2 × ${LEAD_OHM} = 101 Ω, so the voltage reads 1 mA × 101 Ω = 0.101 V, which is ${fmtPct(LEAD_ERR_2WIRE.setupPct)} above the truth. With 4-wire Kelvin this term disappears.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      'Force V = 1 V，DUT = 10 kΩ，电流约 100 µA。选 1 mA 量程，误差带占读数的百分比约是多少？',
      'Force V = 1 V, DUT = 10 kΩ, current about 100 µA. On the 1 mA range, about what percentage of the reading is the error band?',
    ),
    options: [
      { id: 'a', text: loc('0.15%', '0.15%') },
      { id: 'b', text: loc(`${BAND_AT_1MA.bandPct.toFixed(2)}%`, `${BAND_AT_1MA.bandPct.toFixed(2)}%`) },
      { id: 'c', text: loc('6.00%', '6.00%') },
    ],
    answer: 'b',
    explain: loc(
      `误差带 = 0.1% × 100 µA + 0.05% × 1 mA = 0.1 µA + 0.5 µA = 0.6 µA，占读数 ${BAND_AT_1MA.bandPct.toFixed(2)}%。用 100 µA 量程时只有 0.15%，所以应选更小的量程。`,
      `Band = 0.1% × 100 µA + 0.05% × 1 mA = 0.1 µA + 0.5 µA = 0.6 µA, which is ${BAND_AT_1MA.bandPct.toFixed(2)}% of the reading. On the 100 µA range it is only 0.15%, so the smaller range is the right choice.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('读数是 0.1 V，有 0.2 V 和 2 V 两档电压量程可选。哪一档的误差带更窄？', 'The reading is 0.1 V, and the voltage ranges 0.2 V and 2 V are both available. Which range has the narrower band?'),
    options: [
      { id: 'a', text: loc('2 V 量程更窄', 'The 2 V range is narrower') },
      { id: 'b', text: loc('0.2 V 量程更窄', 'The 0.2 V range is narrower') },
      { id: 'c', text: loc('两档一样宽', 'Both are the same width') },
    ],
    answer: 'b',
    explain: loc(
      `0.2 V 量程：0.1% × 0.1 V + 0.05% × 0.2 V = ${(BAND_0V2 * 1e3).toFixed(3)} mV，占读数 ${((BAND_0V2 / 0.1) * 100).toFixed(2)}%；2 V 量程：${(BAND_2V * 1e3).toFixed(2)} mV，占读数 ${((BAND_2V / 0.1) * 100).toFixed(2)}%。量程越大，满量程项越大。`,
      `0.2 V range: 0.1% × 0.1 V + 0.05% × 0.2 V = ${(BAND_0V2 * 1e3).toFixed(3)} mV, which is ${((BAND_0V2 / 0.1) * 100).toFixed(2)}% of the reading; 2 V range: ${(BAND_2V * 1e3).toFixed(2)} mV, ${((BAND_2V / 0.1) * 100).toFixed(2)}% of the reading. A larger range makes the full-scale term larger.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('仪器显示 OVR，这说明什么？', 'The instrument shows OVR. What does that mean?'),
    options: [
      { id: 'a', text: loc('读数已经很准，OVR 只是提示量程大', 'The reading is already accurate; OVR only hints the range is large') },
      { id: 'b', text: loc('读数超出所选量程，这个数不能当测量值', 'The reading is over the selected range, so the number is not a valid measurement') },
      { id: 'c', text: loc('DUT 一定已经坏了', 'The DUT must already be broken') },
    ],
    answer: 'b',
    explain: loc(
      'OVR 表示测量值超出了所选量程的满量程。它只说明量程不够，不能说明 DUT 好坏；换大一档量程后再看。',
      'OVR means the measured value exceeds the full scale of the selected range. It only says the range is too small, not whether the DUT is good or bad; re-measure on a larger range.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '「误差带占读数」为什么会随读数变小而变大？',
      'Why does the error band as a percentage of the reading grow when the reading gets smaller?',
    ),
    options: [
      { id: 'a', text: loc('仪器的增益会随读数变化', 'The instrument gain changes with the reading') },
      { id: 'b', text: loc('量程项不随读数变小，所以它在误差带里占的比例越来越大', 'The range term does not shrink with the reading, so it takes a larger share of the band') },
      { id: 'c', text: loc('导线电阻随读数变大', 'The lead resistance grows with the reading') },
    ],
    answer: 'b',
    explain: loc(
      `误差带 = 0.1% × 读数 + 0.05% × 量程。读数变小时，前一项变小，后一项（只和量程有关）不变，所以误差带占读数的百分比变大。本例 Force I 的 0.2 V 量程里，读数 ${BAND_02.reading.toFixed(3)} V 的误差带是 ${BAND_02.bandPct.toFixed(2)}%，2 V 量程是 ${BAND_2.bandPct.toFixed(2)}%。`,
      `Band = 0.1% × reading + 0.05% × range. As the reading shrinks, the first term shrinks but the second, which depends only on the range, does not. So the band as a share of the reading grows. In this example, a ${BAND_02.reading.toFixed(3)} V reading has a band of ${BAND_02.bandPct.toFixed(2)}% on the 0.2 V range and ${BAND_2.bandPct.toFixed(2)}% on the 2 V range.`,
    ),
  },
]
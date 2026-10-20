import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  IQ,
  IQ_MAX,
  VOH,
  VOH_MIN,
  VREF,
  VREF_MAX,
  VREF_MIN,
  VREF_TYP,
  VREF_TYP_GAP_MV,
  coverage,
  gapMv,
  inLimits,
  type Coverage,
  type SpecId,
} from './overviewModel'

/** 把若干段文字用分隔符连起来（中英各自拼接） */
export function joinText(parts: LText[], sep: LText): LText {
  return {
    zh: parts.map((part) => part.zh).join(sep.zh),
    en: parts.map((part) => part.en ?? part.zh).join(sep.en ?? sep.zh),
  }
}

export const S = {
  kickerNow: loc('这一份规格书', 'This datasheet'),
  introTitle: loc('模拟测试量的是连续的量', 'Analog test measures continuous quantities'),
  coreTitle: loc('拨一拨：勾选需要在 ATE 上测的项', 'Try it: check the items to test on ATE'),
  coreNote: loc(
    '下表是一份虚构的规格书 VDUT-MIX1（运放加基准的混合信号芯片，数值均为示意）。勾选你认为需要在 ATE 上逐颗测的项；系统会比对“关键项是否遗漏”和“是否勾了不必测的项”。',
    'The table is a fictional datasheet for VDUT-MIX1, an op-amp plus reference mixed-signal chip (all values are illustrative). Check the items you think need per-part testing on ATE; the system compares missing key items with items that need no per-part test.',
  ),
  colPick: loc('测', 'Test'),
  colName: loc('参数', 'Parameter'),
  colSym: loc('符号', 'Symbol'),
  colUnit: loc('单位', 'Unit'),
  colCond: loc('测试条件', 'Test conditions'),
  sep: loc('、', ', '),
  none: loc('无', 'None'),
  rMissing: loc('遗漏（关键项没勾）', 'Missing (key item not checked)'),
  rExtra: loc('多余（不必在 ATE 上测）', 'Extra (no per-part ATE test needed)'),
  measured: loc('测得 Vref', 'Measured Vref'),
  rInLimit: loc('是否在 min–max 内', 'Within min–max?'),
  rGap: loc('与 typ 的偏差', 'Offset from typ'),
  yes: loc('是', 'Yes'),
  no: loc('否', 'No'),
  passWord: loc('PASS', 'PASS'),
  failWord: loc('FAIL', 'FAIL'),
  missTitle: loc('有遗漏', 'Missing items'),
  extraTitle: loc('有多余', 'Extra items'),
  okTitle: loc('覆盖完整', 'Coverage complete'),
  task1: loc('勾选全部关键项，没有遗漏。', 'Check every key item, with none missing.'),
  task2: loc('至少勾选一项，并且不勾不必在 ATE 上测的项。', 'Check at least one item, and do not check items that need no per-part ATE test.'),
  task3: loc(
    `把 Vref 测得值调到 min–max 之内，并且离 typ 至少 ${VREF_TYP_GAP_MV} mV。`,
    `Set the measured Vref inside min–max and at least ${VREF_TYP_GAP_MV} mV away from typ.`,
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '规格书里每个参数的测试电路、扫描温度和统计方法，属于后面的静态、动态参数等课；这里只练读规格书和判断哪些项要在 ATE 上测。',
    'Test circuits, temperature sweeps and statistics for each parameter come in the later static and dynamic parameter lessons; here we only practise reading a datasheet and judging which items to test on ATE.',
  ),
  nextPrefix: loc('下一课：', 'Next: '),
}

export const FIG = {
  limitAria: loc('基准电压的 min / typ / max 数轴，标出测得值', 'Number line of min / typ / max for the reference voltage, with the measured value marked'),
  measured: loc('测得', 'Measured'),
  limitCap: loc(
    '绿色带是规格允许的范围，金色虚线是 typ。圆点是测得值：在绿色带内是 PASS，带外是 FAIL。typ 不是边界，所以圆点落在虚线两侧都可以。',
    'The green band is the range the datasheet allows; the gold dashed line is typ. The dot is the measured value: inside the green band it passes, outside it fails. typ is not a boundary, so the dot may sit on either side of the dashed line.',
  ),
}

/** 规格书各参数的文字：名称、测试条件、为什么要（或不要）在 ATE 上测 */
export type SpecText = { name: LText; cond: LText; reason: LText }

export const SPEC_TEXT: Record<SpecId, SpecText> = {
  vos: {
    name: loc('输入失调电压', 'Input offset voltage'),
    cond: loc('VCM = VDD/2，25 °C', 'VCM = VDD/2, 25 °C'),
    reason: loc('失调电压直接决定直流精度的下限，是最基本的直流项。', 'Offset voltage sets the floor of DC accuracy; it is the most basic DC item.'),
  },
  ib: {
    name: loc('输入偏置电流', 'Input bias current'),
    cond: loc('VCM = VDD/2，25 °C', 'VCM = VDD/2, 25 °C'),
    reason: loc('偏置电流流过高阻源会变成误差，输入端的直流精度要靠它来保证。', 'Bias current flowing through a high-impedance source becomes error, so the input DC accuracy depends on it.'),
  },
  iq: {
    name: loc('静态电流', 'Quiescent current'),
    cond: loc('VDD = 5.0 V，无负载，25 °C', 'VDD = 5.0 V, no load, 25 °C'),
    reason: loc('静态电流是芯片没有负载时自己耗掉的电流，直接关系到功耗，也能暴露内部短路。', 'Quiescent current is what the chip draws with no load; it sets the power and can expose internal shorts.'),
  },
  avol: {
    name: loc('开环增益', 'Open-loop gain'),
    cond: loc('RL = 10 kΩ，25 °C', 'RL = 10 kΩ, 25 °C'),
    reason: loc('开环增益决定反馈后的增益误差，不测就无法保证精度。', 'Open-loop gain sets the gain error after feedback, so accuracy cannot be guaranteed without it.'),
  },
  voh: {
    name: loc('输出高摆幅', 'Output high swing'),
    cond: loc('VDD = 5.0 V，RL = 10 kΩ', 'VDD = 5.0 V, RL = 10 kΩ'),
    reason: loc('输出高摆幅决定输出能升到多高；不测，下游就可能认不出高电平。', 'Output high swing sets how high the output can go; untested, the next stage may not recognise a high level.'),
  },
  vref: {
    name: loc('基准输出电压', 'Reference output voltage'),
    cond: loc('IL = 0 mA，25 °C', 'IL = 0 mA, 25 °C'),
    reason: loc('基准电压是这颗芯片的核心输出，必须落在 min 与 max 之间。', 'The reference voltage is the core output of this chip and must lie between min and max.'),
  },
  tcvref: {
    name: loc('基准温漂', 'Reference temperature drift'),
    cond: loc('−40 °C 至 125 °C，箱式法', '−40 °C to 125 °C, box method'),
    reason: loc('温漂要在多个温度下扫描才能得到，属于表征；每颗都做全温区测试，成本过高。', 'Drift needs sweeps over several temperatures, which is characterization; a full temperature sweep on every part costs too much.'),
  },
  thetaja: {
    name: loc('封装热阻 θJA', 'Package thermal resistance θJA'),
    cond: loc('JEDEC 标准板，静止空气', 'JEDEC board, still air'),
    reason: loc('热阻要在规定的散热板上靠温升测得，不是电性测试项，不属于 ATE 的逐颗判定。', 'Thermal resistance is found from temperature rise on a specified board. It is not an electrical test, so it does not belong to per-part ATE judgement.'),
  },
}

/** 右侧说明栏：根据勾选结果给一句结论和原因（初始状态对应规格书第一项 Vos） */
export function coverageVerdict(cov: Coverage): { title: LText; text: LText } {
  if (cov.missing.length > 0) {
    const first = SPEC_TEXT[cov.missing[0].id]
    const names = joinText(cov.missing.map((item) => SPEC_TEXT[item.id].name), S.sep)
    const count = cov.missing.length
    return {
      title: S.missTitle,
      text: loc(
        `还有 ${count} 项关键指标没有勾选：${names.zh}。以 ${first.name.zh} 为例：${first.reason.zh}不测就没有判定，坏片会被放过。`,
        `${count} key items are not checked: ${names.en}. Take ${first.name.en}: ${first.reason.en} Without a test there is no limit to apply, so bad parts pass.`,
      ),
    }
  }
  if (cov.extra.length > 0) {
    const first = SPEC_TEXT[cov.extra[0].id]
    const names = joinText(cov.extra.map((item) => SPEC_TEXT[item.id].name), S.sep)
    const count = cov.extra.length
    return {
      title: S.extraTitle,
      text: loc(
        `勾选了 ${count} 项不必在 ATE 上逐颗测的项：${names.zh}。以 ${first.name.zh} 为例：${first.reason.zh}`,
        `${count} items are checked that need no per-part ATE test: ${names.en}. Take ${first.name.en}: ${first.reason.en}`,
      ),
    }
  }
  return {
    title: S.okTitle,
    text: loc(
      '关键项全部勾选，没有多余项。接下来看 Vref 的测得值是否落在 min 与 max 之间。',
      'All key items are checked and nothing extra is selected. Next, check whether the measured Vref lies between min and max.',
    ),
  }
}

/** 测得 Vref 的一句说明：先判 min / max，再说明 typ 为什么不参与判定 */
export function vrefNote(value: number): LText {
  const gap = gapMv(value, VREF_TYP)
  if (value < VREF_MIN) {
    return loc(
      `测得 ${value.toFixed(3)} V 低于 min ${VREF_MIN.toFixed(3)} V，判 FAIL。`,
      `The measured ${value.toFixed(3)} V is below min ${VREF_MIN.toFixed(3)} V, so the verdict is FAIL.`,
    )
  }
  if (value > VREF_MAX) {
    return loc(
      `测得 ${value.toFixed(3)} V 高于 max ${VREF_MAX.toFixed(3)} V，判 FAIL。`,
      `The measured ${value.toFixed(3)} V is above max ${VREF_MAX.toFixed(3)} V, so the verdict is FAIL.`,
    )
  }
  if (Math.abs(gap) >= VREF_TYP_GAP_MV) {
    return loc(
      `测得值在 min–max 之内，但与 typ 相差 ${gap} mV。typ 只是典型值，不是限值：在 min–max 之内就判 PASS，偏离 typ 本身不算失效。`,
      `The reading is inside min–max but ${gap} mV away from typ. typ is a typical value, not a limit: anything inside min–max passes, and drifting from typ alone is not a failure.`,
    )
  }
  return loc('测得值在 min–max 之内，并且离 typ 很近，判 PASS。', 'The reading is inside min–max and close to typ, so it passes.')
}

/** 三张任务卡：完成与否由当前勾选与测得值直接算出 */
export function taskItems(selected: readonly SpecId[], vref: number): TaskItem[] {
  const cov = coverage(selected)
  return [
    { id: 'missing', text: S.task1, done: cov.missing.length === 0 },
    { id: 'extra', text: S.task2, done: selected.length > 0 && cov.extra.length === 0 },
    {
      id: 'gap',
      text: S.task3,
      done: inLimits(vref, VREF) && Math.abs(gapMv(vref, VREF_TYP)) >= VREF_TYP_GAP_MV,
    },
  ]
}

export const INTRO: LText[] = [
  loc(
    '{@pDigital} 里的数字测试只问 0 与 1：电压过了门限就认成 1，否则认成 0。模拟测试量的是连续的量：增益、失调、噪声、基准电压。结果要和规格书给出的范围比较，所以精度和噪声底比“对错”更重要。',
    'The digital test in {@pDigital} asks only 0 or 1: a voltage past the threshold reads as 1, otherwise as 0. Analog test measures continuous quantities such as gain, offset, noise and reference voltage. Results are compared against the range the datasheet gives, so accuracy and noise floor matter more than right or wrong.',
  ),
  loc(
    '这一课读一份虚构的规格书 VDUT-MIX1，练三件事：把规格书的每一行对应到一个测试项；看懂 min、typ、max 和测试条件；判断哪些项需要在 ATE 上测。ATE 的整体结构见 {@ate}，规格书的写法见 {@spec}。',
    'This lesson reads a fictional datasheet, VDUT-MIX1, and practises three things: mapping each datasheet line to a test item; reading min, typ, max and the test conditions; and deciding which items need testing on ATE. The overall ATE structure is in {@ate}; how datasheets are written is in {@spec}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'typ 就是目标值，偏离 typ 就判 Fail。typ 只是典型条件下的设计中心，判定只看 min 与 max；在限值之内偏离 typ，不算失效。',
    'typ is the target, so drifting from typ means Fail. typ is only the typical design centre; the verdict uses min and max alone, so a value inside the limits is not a failure even if it sits away from typ.',
  ),
  loc(
    '规格书上每一行都要在 ATE 上逐颗测。表征项（温漂）要在多个温度下扫描才能得到，逐颗测成本太高；信息项（热阻）不是电性参数，逐颗测只会浪费测试时间。',
    'Every datasheet line must be tested on every part. Characterization items such as temperature drift need sweeps over several temperatures, which costs too much per part; information items such as thermal resistance are not electrical, so per-part tests only waste time.',
  ),
  loc(
    '模拟测试只测一次、一个条件就够。连续量会随 VDD、温度和负载变化，一个条件测出的数不能代表全部条件；测试条件要写进测试项，结果才能复现和比较。',
    'One measurement at one condition is enough. Continuous quantities shift with VDD, temperature and load, so one condition does not represent the others; the test conditions must be part of the test item for results to be reproducible and comparable.',
  ),
]

export const TAKEAWAY: LText = loc(
  '模拟测试量的是连续的量：判定只看规格里的 min 与 max，typ 只作参考；每个测试项都要带上测试条件。读规格书时先问每一项“是否需要在 ATE 上逐颗测”：关键项遗漏会放过坏片，表征项和信息项则不必逐颗测。',
  'Analog test measures continuous quantities: the verdict uses only the datasheet min and max, typ is a reference, and every test item must carry its test conditions. When reading a datasheet, first ask whether each item needs per-part ATE testing: missing a key item lets bad parts through, while characterization and information items need no per-part test.',
)

/* ---------- 小测：数字全部由模型算出；答案由判定函数得出，改了模型，小测跟着变 ---------- */

const VREF_Q1 = 2.47
const IQ_Q2 = 1.2
const VOH_Q3 = 4.8

const Q1_OK = inLimits(VREF_Q1, VREF)
const Q2_OK = inLimits(IQ_Q2, IQ)
const Q3_OK = inLimits(VOH_Q3, VOH)

/** 判定词条：把 ok 映射成「落在范围内 / 超出范围」之类的文字，不在模板字符串里夹中文 */
function phrase(ok: boolean, inside: LText, outside: LText): LText {
  return ok ? inside : outside
}

const Q1_PHRASE = phrase(
  Q1_OK,
  loc('落在 min 与 max 之间', 'lies between min and max'),
  loc(`低于 min ${VREF_MIN.toFixed(3)} V`, `is below min ${VREF_MIN.toFixed(3)} V`),
)
const Q2_PHRASE = phrase(
  Q2_OK,
  loc(`没有超过 max ${IQ_MAX} mA`, `does not exceed the max of ${IQ_MAX} mA`),
  loc(`超过了 max ${IQ_MAX} mA`, `exceeds the max of ${IQ_MAX} mA`),
)
const Q3_PHRASE = phrase(
  Q3_OK,
  loc(`不低于 min ${VOH_MIN} V`, `is not below min ${VOH_MIN} V`),
  loc(`低于 min ${VOH_MIN} V`, `is below min ${VOH_MIN} V`),
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `VDUT-MIX1 的基准输出 Vref 测得 ${VREF_Q1.toFixed(3)} V（示意数据）。规格写的是 min ${VREF_MIN.toFixed(3)} V、typ ${VREF_TYP.toFixed(3)} V、max ${VREF_MAX.toFixed(3)} V。判定是什么？`,
      `The reference output Vref of VDUT-MIX1 measures ${VREF_Q1.toFixed(3)} V (illustrative). The datasheet gives min ${VREF_MIN.toFixed(3)} V, typ ${VREF_TYP.toFixed(3)} V and max ${VREF_MAX.toFixed(3)} V. What is the verdict?`,
    ),
    options: [
      { id: 'a', text: S.passWord },
      { id: 'b', text: S.failWord },
    ],
    answer: Q1_OK ? 'a' : 'b',
    explain: loc(
      `${VREF_Q1.toFixed(3)} V ${Q1_PHRASE.zh}，判定为 ${Q1_OK ? 'PASS' : 'FAIL'}。typ ${VREF_TYP.toFixed(3)} V 只是典型值，不参与判定；判定只看 min 与 max。`,
      `${VREF_Q1.toFixed(3)} V ${Q1_PHRASE.en}, so the verdict is ${Q1_OK ? 'PASS' : 'FAIL'}. The typ value of ${VREF_TYP.toFixed(3)} V is only a typical value and takes no part in the verdict; only min and max decide.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      `Iq 静态电流只有 max 没有 min。测得 ${IQ_Q2} mA，判定是什么？`,
      `Iq quiescent current has a max but no min. It measures ${IQ_Q2} mA. What is the verdict?`,
    ),
    options: [
      { id: 'a', text: S.passWord },
      { id: 'b', text: S.failWord },
    ],
    answer: Q2_OK ? 'a' : 'b',
    explain: loc(
      `${IQ_Q2} mA ${Q2_PHRASE.zh}，判定为 ${Q2_OK ? 'PASS' : 'FAIL'}。只有一侧限值的参数，另一侧不判，不是“不用管”。`,
      `${IQ_Q2} mA ${Q2_PHRASE.en}, so the verdict is ${Q2_OK ? 'PASS' : 'FAIL'}. A parameter with only one limit is judged on that side only; the other side is not checked, which does not mean it can be ignored.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      `输出高摆幅 VOH 测得 ${VOH_Q3.toFixed(2)} V，规格只写了 min ${VOH_MIN} V。判定是什么？`,
      `The output high swing VOH measures ${VOH_Q3.toFixed(2)} V, and the datasheet only gives min ${VOH_MIN} V. What is the verdict?`,
    ),
    options: [
      { id: 'a', text: S.passWord },
      { id: 'b', text: S.failWord },
    ],
    answer: Q3_OK ? 'a' : 'b',
    explain: loc(
      `${VOH_Q3.toFixed(2)} V ${Q3_PHRASE.zh}，判定为 ${Q3_OK ? 'PASS' : 'FAIL'}。输出高电平不够高时，下游可能认不出 1。`,
      `${VOH_Q3.toFixed(2)} V ${Q3_PHRASE.en}, so the verdict is ${Q3_OK ? 'PASS' : 'FAIL'}. If the high level is not high enough, the next stage may not recognise a 1.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('规格书里的封装热阻 θJA，应该怎么处理？', 'How should the package thermal resistance θJA in the datasheet be handled?'),
    options: [
      { id: 'a', text: loc('必须逐颗测，和其它项一样判定', 'Test every part and judge it like any other item') },
      { id: 'b', text: loc('不是电性测试项，靠热板或热阻测量得到，不放进逐颗 ATE 判定', 'Not an electrical test item: it comes from a thermal board or thermal measurement, so it stays out of per-part ATE judgement') },
      { id: 'c', text: loc('只测一颗样品写进规格，ATE 上不用管', 'Measure one sample for the datasheet; ATE does not need it') },
    ],
    answer: 'b',
    explain: loc(
      'θJA 描述封装把热量导到环境的能力，要在规定的散热板和静止空气条件下，靠温升测得。它不是加电压、量电流的电性参数；放进逐颗 ATE 判定只会增加测试时间，还判不出功能好坏。',
      'θJA describes how well the package carries heat to the surroundings. It comes from the temperature rise on a specified board in still air, not from forcing and measuring electrical quantities. Putting it into per-part ATE judgement only adds test time and cannot tell whether the chip works.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('规格书里 typ 这一列的作用是什么？', 'What is the role of the typ column in a datasheet?'),
    options: [
      { id: 'a', text: loc('量产判定的限值', 'The production limit used for the verdict') },
      { id: 'b', text: loc('典型条件下的中心值，只作参考；判定只看 min 与 max', 'The centre value at typical conditions, for reference only; the verdict uses min and max alone') },
      { id: 'c', text: loc('测试时必须强制施加的电压', 'The voltage that must be forced during the test') },
    ],
    answer: 'b',
    explain: loc(
      'typ 是典型条件下的中心值，用来看设计余量。只有 min 与 max 是判定限值，所以在限值之内偏离 typ 不算失效。',
      'typ is the centre value at typical conditions and shows the design margin. Only min and max are judgement limits, so a value inside the limits is not a failure even if it differs from typ.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('模拟测试和数字测试的主要区别是什么？', 'What is the main difference between analog test and digital test?'),
    options: [
      { id: 'a', text: loc('模拟测试量的是连续量，结果受精度和噪声底限制，要和规格范围比较', 'Analog test measures continuous quantities limited by accuracy and noise floor, compared against a spec range') },
      { id: 'b', text: loc('模拟测试只看 0 或 1，和数字测试一样只有对错', 'Analog test only looks at 0 or 1, just like digital test, with right or wrong only') },
      { id: 'c', text: loc('模拟测试不需要写测试条件，因为结果不随条件变化', 'Analog test needs no test conditions, because results do not change with conditions') },
    ],
    answer: 'a',
    explain: loc(
      '数字测试主要比较 0 与 1 的电压门限；模拟测试要量增益、失调、噪声、基准电压这些连续量，并与规格范围比较。精度、噪声底和测试条件都会影响结果，所以必须写清。',
      'Digital test mainly compares 0 and 1 against voltage thresholds. Analog test measures continuous quantities such as gain, offset, noise and reference voltage, and compares them with a spec range. Accuracy, noise floor and test conditions all affect the result, so they must be stated.',
    ),
  },
]
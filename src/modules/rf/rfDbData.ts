import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { formatSi, fmtFixed } from './rfFormat'
import { DUT_INPUT_MAX_DBM, type DbAnalysis, type DbState } from './rfDbModel'
import { dbToRatio, mwToDbm, wattToDbm } from './core/units'

export const S = {
  kickerNow: loc('这一组数', 'These numbers'),
  introTitle: loc('dB 是比值，dBm 是绝对功率', 'dB is a ratio, dBm is an absolute power'),
  introParas: [
    loc(
      '射频链路的功率跨度很大：从信号源的几毫瓦，到接收机前端的几皮瓦。直接用 W 或 mW 写，数字又长又难加减。所以用对数：比值用 dB，绝对功率用 dBm（以 1 mW 为基准），相对载波的值用 dBc。',
      'RF power can span from milliwatts at the source to picowatts at a receiver. Writing it in W or mW gives long numbers that are hard to add. So we use logarithms: ratios in dB, absolute power in dBm (referenced to 1 mW), and levels relative to a carrier in dBc.',
    ),
    loc(
      '定义写成公式：dB = 10·log10(P₂ / P₁)；dBm = 10·log10(P / 1 mW)；dBc = 10·log10(P_spur / P_carrier)。',
      'As formulas: dB = 10·log10(P₂ / P₁); dBm = 10·log10(P / 1 mW); dBc = 10·log10(P_spur / P_carrier).',
    ),
    loc(
      '这一课练三件事：W、mW 与 dBm 互相换算；用 dB 把级联的增益和损耗相加，算出输出功率；用 dBc 算出杂散的绝对功率。它们的对象都是 {@rfOverview} 里讲过的功率。',
      'This lesson practises three things: converting between W, mW and dBm; adding gains and losses in dB along a cascade to find the output power; and using dBc to find the absolute power of a spur. All of them work on the power introduced in {@rfOverview}.',
    ),
  ],
  quickTitle: loc('三个常用点（记住它们就能心算）', 'Three anchor points (memorise them for mental maths)'),
  coreTitle: loc('换算：W、mW 与 dBm', 'Conversion: W, mW and dBm'),
  coreNote: loc(
    '在输入框里输入一个功率，并选它的单位。读数同时给出 dBm 与带 SI 前缀的瓦数；切换单位时，功率保持不变。',
    'Type a power and choose its unit. The readouts give dBm and the power in watts with SI prefixes; switching the unit keeps the same power.',
  ),
  unitLabel: loc('输入单位', 'Input unit'),
  valueLabel: loc('功率值', 'Power value'),
  invalid: loc(
    '输入无效：W 与 mW 必须是大于 0 的数，dBm 可以是负数。读数暂时不更新。',
    'Invalid input: W and mW must be numbers greater than 0; dBm may be negative. Readouts hold until the input is valid.',
  ),
  rDbm: loc('功率（dBm）', 'Power (dBm)'),
  rWatt: loc('功率（瓦，带 SI 前缀）', 'Power (watts, with SI prefix)'),
  cascadeTitle: loc('级联：用 dB 相加', 'Cascade: add in dB'),
  cascadeNote: loc(
    '每段的 dB 值：正数是增益，负数是损耗。总增益 = 各段 dB 相加；输出 dBm = 信号源 dBm + 总增益。线性验算：10^(总 dB / 10) 应等于各段线性值的乘积。',
    'Each stage in dB: positive is gain, negative is loss. Total gain = sum of the stage dB values; output dBm = source dBm + total gain. Linear check: 10^(total dB / 10) equals the product of the stage ratios.',
  ),
  srcLabel: loc('信号源输出', 'Source output'),
  cableLabel: loc('线缆（损耗为负）', 'Cable (loss is negative)'),
  ampLabel: loc('放大器增益', 'Amplifier gain'),
  attLabel: loc('衰减器（损耗为负）', 'Attenuator (loss is negative)'),
  rTotal: loc('总增益 Σ dB', 'Total gain Σ dB'),
  rLinear: loc('线性验算 10^(Σ dB / 10)', 'Linear check 10^(Σ dB / 10)'),
  rOut: loc('输出功率（dBm）', 'Output power (dBm)'),
  rOutWatt: loc('输出功率（瓦）', 'Output power (watts)'),
  dbcTitle: loc('相对值：dBc', 'Relative level: dBc'),
  dbcNote: loc(
    '杂散的 dBc 是它相对载波的差值，通常为负。杂散的绝对功率 = 载波 dBm + 杂散 dBc；换算成瓦才能判断它到底有多大。',
    'A spur in dBc is its difference from the carrier, usually negative. Its absolute power = carrier dBm + spur dBc; convert to watts to judge its real size.',
  ),
  carrierLabel: loc('载波功率（dBm）', 'Carrier power (dBm)'),
  spurLabel: loc('杂散 相对载波（dBc）', 'Spur relative to carrier (dBc)'),
  rSpurDbm: loc('杂散绝对功率（dBm）', 'Absolute spur power (dBm)'),
  rSpurWatt: loc('杂散绝对功率（瓦）', 'Absolute spur power (watts)'),
  verdictTitle: loc('换算结果', 'Conversion result'),
  overTitle: loc('输出过功率', 'Output overdriven'),
  invalidTitle: loc('输入无效', 'Invalid input'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实链路还有噪声、非线性和反射，dB 只管功率的大小；这些在后面的课程里再接着看。',
    'A real link also has noise, nonlinearity and reflections; dB only tracks the size of power. Those come up in later lessons.',
  ),
  next: loc('下一课：RF 测试系统与链路', 'Next: RF Test System and Signal Path'),
  task1: loc('输入 1 W，读出换算后的 30 dBm。', 'Enter 1 W and read 30 dBm.'),
  task2: loc('切到 dBm 输入 −30 dBm，读出它等于 1 µW。', 'Switch to dBm, enter −30 dBm and read it as 1 µW.'),
  task3: loc('级联：把总增益调到 0 dB 附近（±1 dB 以内）。', 'Cascade: bring the total gain within ±1 dB of 0.'),
  task4: loc('dBc：把杂散压到比载波低 60 dBc 以上（≤ −60 dBc）。', 'dBc: push the spur at least 60 dBc below the carrier (≤ −60 dBc).'),
  task5: loc(`级联：把输出调到超过示例上限 +${DUT_INPUT_MAX_DBM} dBm。`, `Cascade: raise the output above the +${DUT_INPUT_MAX_DBM} dBm example limit.`),
}

export const INTRO_UNITS_NOTE = loc(
  '注意：这里的 +10 dBm 上限是本站虚拟器件 VDUT-RFT1 的教学值，不是真实器件的规格。',
  'Note: the +10 dBm limit here is a teaching value for the virtual device VDUT-RFT1, not a real device spec.',
)

export const MISCONCEPTIONS: LText[] = [
  loc(
    'dB 是绝对单位，和 dBm 一样。dB 是两个功率的比值，没有绝对大小；dBm 是以 1 mW 为基准的绝对功率。“增益 10 dB”和“输出 10 dBm”完全不是一回事。',
    'dB is an absolute unit, the same as dBm. dB is a ratio of two powers with no absolute size; dBm is an absolute power referenced to 1 mW. "10 dB gain" and "10 dBm output" are completely different things.',
  ),
  loc(
    'dB 相加，功率也直接相加。级联时 dB 相加对应的是功率相乘：+3 dB 加 +3 dB = +6 dB，即 2 × 2 = 4 倍，而不是 6 倍。',
    'Adding dB means adding power. Adding dB along a cascade corresponds to multiplying powers: +3 dB plus +3 dB = +6 dB, i.e. 2 × 2 = 4 times, not 6 times.',
  ),
  loc(
    '杂散的 −40 dBc 就是 −40 dBm。dBc 是相对载波的差值，要先加上载波的 dBm，才是杂散的绝对功率。',
    'A spur at −40 dBc is not −40 dBm by itself. dBc is a difference from the carrier; add the carrier’s dBm first to get the spur’s absolute power.',
  ),
]

export const TAKEAWAY: LText = loc(
  'dB 是比值；dBm 以 1 mW 为基准，dBm = 10·log10(P / 1 mW)；dBc 以载波为基准。级联的 dB 直接相加得到总增益；绝对功率 = 基准 dBm + dB，或 载波 dBm + dBc。',
  'dB is a ratio; dBm is referenced to 1 mW, dBm = 10·log10(P / 1 mW); dBc is referenced to the carrier. Along a cascade the dB values add to give the total gain; absolute power = reference dBm + dB, or carrier dBm + dBc.',
)

/** 三个锚点：1 W、1 mW、1 µW 对应的 dBm，由模型算出 */
export const ANCHORS: LText[] = [
  loc(`1 W = ${wattToDbm(1).toFixed(0)} dBm`, `1 W = ${wattToDbm(1).toFixed(0)} dBm`),
  loc(`1 mW = ${mwToDbm(1).toFixed(0)} dBm`, `1 mW = ${mwToDbm(1).toFixed(0)} dBm`),
  loc(`1 µW = ${mwToDbm(0.001).toFixed(0)} dBm`, `1 µW = ${mwToDbm(0.001).toFixed(0)} dBm`),
]

/** 右侧说明栏：换算结果与级联结论；null 表示无需附加说明 */
export function verdictOf(state: DbState, a: DbAnalysis): { title: LText; text: LText; note: LText | null } {
  if (a.input === null) {
    return { title: S.invalidTitle, text: S.invalid, note: null }
  }
  const inputText = state.unit === 'dBm' ? fmtFixed(a.input.dbm, 2, 'dBm') : formatSi(a.input.watt, 'W')
  const outWatt = formatSi(a.outMw / 1000, 'W')
  const text = loc(
    `输入 ${inputText} 折算为 ${a.input.dbm.toFixed(2)} dBm。级联后输出 ${a.outDbm.toFixed(2)} dBm，即 ${outWatt}；总增益 ${a.totalDb.toFixed(1)} dB，线性上相当于 ×${a.linearGain.toFixed(2)}。`,
    `Input ${inputText} is ${a.input.dbm.toFixed(2)} dBm. After the cascade the output is ${a.outDbm.toFixed(2)} dBm, i.e. ${outWatt}; total gain ${a.totalDb.toFixed(1)} dB, which is ×${a.linearGain.toFixed(2)} in linear terms.`,
  )
  if (a.overLimit) {
    return {
      title: S.overTitle,
      text,
      note: loc(
        `输出高于示例上限 +${DUT_INPUT_MAX_DBM} dBm，DUT 会过功率。降低信号源或加上衰减即可。`,
        `The output is above the +${DUT_INPUT_MAX_DBM} dBm example limit, so the DUT would be overdriven. Lower the source or add attenuation.`,
      ),
    }
  }
  return {
    title: S.verdictTitle,
    text,
    note: loc(
      `输出在示例上限 +${DUT_INPUT_MAX_DBM} dBm 以内。`,
      `The output is within the +${DUT_INPUT_MAX_DBM} dBm example limit.`,
    ),
  }
}

/** 五张任务卡：完成与否由当前设置和模型结果算出 */
export function taskItems(state: DbState, a: DbAnalysis): TaskItem[] {
  return [
    {
      id: 'w1',
      text: S.task1,
      done: state.unit === 'W' && a.input !== null && Math.abs(a.input.watt - 1) < 1e-9,
    },
    {
      id: 'dbm-30',
      text: S.task2,
      done: state.unit === 'dBm' && a.input !== null && Math.abs(a.input.dbm + 30) < 1e-9,
    },
    { id: 'gain0', text: S.task3, done: Math.abs(a.totalDb) <= 1 },
    { id: 'spur60', text: S.task4, done: state.spurDbc <= -60 },
    { id: 'over', text: S.task5, done: a.overLimit },
  ]
}

/** 小测题干与选项里的数字都由模型函数算出 */
const OUT_CASCADE = 0 + 15 - 3 - 10

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('1 mW 折算成 dBm 是多少？', 'What is 1 mW in dBm?'),
    options: [
      { id: 'a', text: loc(`${mwToDbm(1).toFixed(0)} dBm`, `${mwToDbm(1).toFixed(0)} dBm`) },
      { id: 'b', text: loc(`${mwToDbm(1).toFixed(0)} dB`, `${mwToDbm(1).toFixed(0)} dB`) },
      { id: 'c', text: loc(`${mwToDbm(0.001).toFixed(0)} dBm`, `${mwToDbm(0.001).toFixed(0)} dBm`) },
    ],
    answer: 'a',
    explain: loc(
      'dBm = 10·log10(1 mW / 1 mW) = 0 dBm。1 mW 就是基准，所以是 0；它不是 dB，因为 dB 只是比值。',
      'dBm = 10·log10(1 mW / 1 mW) = 0 dBm. 1 mW is the reference, so it is 0; it is dBm, not dB, because dB is only a ratio.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('1 W 折算成 dBm 是多少？', 'What is 1 W in dBm?'),
    options: [
      { id: 'a', text: loc(`${(wattToDbm(1) - 29).toFixed(0)} dBm`, `${(wattToDbm(1) - 29).toFixed(0)} dBm`) },
      { id: 'b', text: loc(`${wattToDbm(1).toFixed(0)} dBm`, `${wattToDbm(1).toFixed(0)} dBm`) },
      { id: 'c', text: loc(`${(wattToDbm(1) * 2).toFixed(0)} dBm`, `${(wattToDbm(1) * 2).toFixed(0)} dBm`) },
    ],
    answer: 'b',
    explain: loc(
      `1 W = 1000 mW，dBm = 10·log10(1000) = ${wattToDbm(1).toFixed(0)} dBm。记住：每 ×10 是 +10 dB，1 W 就是 1 mW 再加 30 dB。`,
      `1 W = 1000 mW, dBm = 10·log10(1000) = ${wattToDbm(1).toFixed(0)} dBm. Remember: each ×10 is +10 dB, so 1 W is 1 mW plus 30 dB.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('10 mW 是多少 dBm？', 'What is 10 mW in dBm?'),
    options: [
      { id: 'a', text: loc(`${mwToDbm(1).toFixed(0)} dBm`, `${mwToDbm(1).toFixed(0)} dBm`) },
      { id: 'b', text: loc(`${mwToDbm(10).toFixed(0)} dBm`, `${mwToDbm(10).toFixed(0)} dBm`) },
      { id: 'c', text: loc(`${mwToDbm(100).toFixed(0)} dBm`, `${mwToDbm(100).toFixed(0)} dBm`) },
    ],
    answer: 'b',
    explain: loc(
      `dBm = 10·log10(10) = ${mwToDbm(10).toFixed(0)} dBm。10 mW 是 1 mW 的 10 倍，就是 +10 dB。`,
      `dBm = 10·log10(10) = ${mwToDbm(10).toFixed(0)} dBm. 10 mW is ten times 1 mW, which is +10 dB.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '信号源 0 dBm，依次经过 +15 dB 放大器、−3 dB 线缆、−10 dB 衰减器。输出是多少 dBm？',
      'A 0 dBm source passes a +15 dB amplifier, then a −3 dB cable, then a −10 dB attenuator. What is the output in dBm?',
    ),
    options: [
      { id: 'a', text: loc(`${OUT_CASCADE} dBm`, `${OUT_CASCADE} dBm`) },
      { id: 'b', text: loc('15 dBm（只加了增益，忘了损耗）', '15 dBm (only the gain was added, losses forgotten)') },
      { id: 'c', text: loc('−13 dBm（只加了损耗，忘了增益）', '−13 dBm (only the losses were added, gain forgotten)') },
    ],
    answer: 'a',
    explain: loc(
      `总增益 = +15 − 3 − 10 = ${OUT_CASCADE} dB，输出 = 0 dBm + ${OUT_CASCADE} dB = ${OUT_CASCADE} dBm。增益和损耗都是 dB，直接相加。`,
      `Total gain = +15 − 3 − 10 = ${OUT_CASCADE} dB, so output = 0 dBm + ${OUT_CASCADE} dB = ${OUT_CASCADE} dBm. Gains and losses are both in dB, so they simply add.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('载波 +10 dBm，杂散为 −40 dBc。杂散的绝对功率是多少？', 'The carrier is +10 dBm and a spur sits at −40 dBc. What is the absolute spur power?'),
    options: [
      { id: 'a', text: loc(`${10 - 40} dBm`, `${10 - 40} dBm`) },
      { id: 'b', text: loc(`${-40} dBm（忘了载波功率）`, `${-40} dBm (carrier power forgotten)`) },
      { id: 'c', text: loc(`${10 + 40} dBm（把 dBc 的符号弄反）`, `${10 + 40} dBm (dBc sign flipped)`) },
    ],
    answer: 'a',
    explain: loc(
      `绝对功率 = 载波 dBm + dBc = 10 + (−40) = ${10 - 40} dBm。dBc 是相对载波的差值，要先加上载波功率。`,
      `Absolute power = carrier dBm + dBc = 10 + (−40) = ${10 - 40} dBm. dBc is a difference from the carrier, so the carrier power must be added first.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('功率增加 +3 dB，大约是原来的多少倍？', 'About how many times the power is a +3 dB increase?'),
    options: [
      { id: 'a', text: loc('约 3 倍', 'About 3 times') },
      { id: 'b', text: loc(`约 ${Math.round(dbToRatio(3))} 倍`, `About ${Math.round(dbToRatio(3))} times`) },
      { id: 'c', text: loc('约 10 倍', 'About 10 times') },
    ],
    answer: 'b',
    explain: loc(
      `10^(3/10) = ${dbToRatio(3).toFixed(3)}，约 ${Math.round(dbToRatio(3))} 倍。+3 dB 不是 3 倍，要记住它约等于 2 倍。`,
      `10^(3/10) = ${dbToRatio(3).toFixed(3)}, about ${Math.round(dbToRatio(3))} times. +3 dB is not 3 times; remember it is about 2 times.`,
    ),
  },
]

import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { dbmToWatt } from './core/units'
import { formatSi } from './rfFormat'
import { DEFAULT_SYSTEM, DUT_INPUT_MAX_DBM, type LinkAnalysis, type LinkErrorCode, type RfSystemState } from './rfSystemModel'

export const S = {
  kickerNow: loc('这一条链路', 'This link'),
  introTitle: loc('信号从哪里来，功率在哪里丢', 'Where the signal comes from and where the power is lost'),
  introParas: [
    loc(
      '一条射频测试链路通常是：信号源（SG）→ 线缆 → 夹具 → DUT → 线缆 → 分析仪（SA）。信号源给出激励，分析仪读取响应，中间每一段线缆和夹具都会吃掉一部分功率。',
      'A typical RF test path is: signal generator (SG) → cable → fixture → DUT → cable → analyzer (SA). The SG provides the stimulus, the analyzer reads the response, and every cable and fixture in between consumes some power.',
    ),
    loc(
      'DUT 收到的功率只由 DUT 前面的几段决定：信号源输出 dBm 减去前段各段的损耗，各段相加用的正是 {@rfDb} 的 dB 规则。DUT 后面的线缆只影响分析仪读数。这一课就是要把这个顺序算对。',
      'The power the DUT receives depends only on the segments before it: source output in dBm minus the losses of the earlier segments. Adding those segments uses the dB rules from {@rfDb}. Cables after the DUT only affect the analyzer reading. This lesson is about getting that order right.',
    ),
  ],
  coreTitle: loc('选择连接方案', 'Choose a connection'),
  coreNote: loc(
    '点选一种接法，链路图和读数同时更新。标准链路能读数；其余四种各缺一个关键元件或接反，会被判为连错，并给出原因。',
    'Pick a wiring and the link diagram and readouts update together. The standard link gives a reading; the other four each miss a key part or have it reversed, and are flagged with the reason.',
  ),
  presetLabel: loc('连接方案', 'Connection'),
  sgLabel: loc('信号源输出（dBm）', 'Source output (dBm)'),
  cableLabel: loc('每根线缆的损耗（dB）', 'Loss per cable (dB)'),
  fixtureLabel: loc('夹具损耗（dB）', 'Fixture loss (dB)'),
  rDut: loc('到达 DUT 的功率', 'Power at DUT input'),
  rDutWatt: loc('到达 DUT 的功率（瓦）', 'Power at DUT input (watts)'),
  rSa: loc('分析仪读数（DUT 之后）', 'Analyzer reading (after DUT)'),
  rLink: loc('链路判定', 'Link check'),
  linkOk: loc('通过', 'OK'),
  linkBad: loc('连错', 'Wrong link'),
  rulesTitle: loc('判定规则', 'Link rules'),
  rules: [
    loc('1. 必须有且只有一个信号源 SG，它在链路起点。', '1. Exactly one SG, at the start of the link.'),
    loc('2. 必须有 DUT，且在 SG 与 SA 之间。', '2. A DUT must be present, between the SG and the SA.'),
    loc('3. 必须有分析仪 SA，它在链路终点。', '3. An SA must be at the end of the link.'),
  ],
  verdictOk: loc('链路正确', 'Link OK'),
  errNote: loc(
    '先把接法改对，再读功率：连错的链路读数没有意义，不能拿来判 DUT。',
    'Fix the wiring first: a reading from a wrong link means nothing and cannot be used to judge the DUT.',
  ),
  afterNote: loc(
    'DUT 后面的线缆只影响分析仪读数，不改变 DUT 的输入功率。',
    'The cable after the DUT only changes the analyzer reading; it does not change the DUT input power.',
  ),
  overNote: loc(
    `到达 DUT 的功率超过示例上限 +${DUT_INPUT_MAX_DBM} dBm，DUT 会过功率。降低信号源输出，或在前段加衰减。`,
    `The power at the DUT is above the +${DUT_INPUT_MAX_DBM} dBm example limit, so the DUT would be overdriven. Lower the source output or add attenuation upstream.`,
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的测试链路还要做校准与去嵌入，把线缆、夹具的影响从结果里扣掉；这一课只练连接判定和功率预算。',
    'Real test paths also need calibration and de-embedding to remove cable and fixture effects from results; this lesson practises link checks and the power budget only.',
  ),
  next: loc('下一课：阻抗匹配与 S 参数', 'Next: Impedance Matching and S-parameters'),
  task1: loc('选“标准链路”，读出到达 DUT 的功率。', 'Select the standard link and read the power at the DUT.'),
  task2: loc('把线缆损耗调到 3 dB 以上，看 DUT 的输入功率怎么下降。', 'Raise the cable loss to 3 dB or more and watch the DUT input power drop.'),
  task3: loc('选一个连错的方案，读出报错的原因。', 'Pick a wrong wiring and read the reason it is flagged.'),
  task4: loc(`让到达 DUT 的功率超过示例上限 +${DUT_INPUT_MAX_DBM} dBm。`, `Make the power at the DUT exceed the +${DUT_INPUT_MAX_DBM} dBm example limit.`),
}

/** 四种连错的标题与原因，每条都写明为什么不能算数 */
export const ERROR_TEXT: Record<LinkErrorCode, { title: LText; reason: LText }> = {
  noSg: {
    title: loc('缺信号源', 'No signal source'),
    reason: loc(
      '链路里没有 SG，DUT 收不到任何激励，也就没有可以测量的响应。分析仪读到的只是底噪，算不出 DUT 的功率。',
      'There is no SG in the link, so the DUT receives no stimulus and there is no response to measure. The analyzer sees only the noise floor, so no DUT power can be computed.',
    ),
  },
  noSa: {
    title: loc('缺分析仪', 'No analyzer'),
    reason: loc(
      '链路里没有 SA，DUT 的输出没有地方读，这条链路不给出测量结果。',
      'There is no SA in the link, so the DUT output has nowhere to be read and the link gives no result.',
    ),
  },
  noDut: {
    title: loc('缺 DUT', 'No DUT'),
    reason: loc(
      '链路里没有 DUT，SG 到 SA 只是一段直通。它测的是线缆，不是器件，所以不能用来判 DUT。',
      'There is no DUT, so SG to SA is just a through path. It measures the cables, not a device, so it cannot judge a DUT.',
    ),
  },
  reversed: {
    title: loc('SG / SA 接反', 'SG and SA reversed'),
    reason: loc(
      '信号从分析仪那一端打进去，DUT 的方向也反了。信号源必须在链路起点，分析仪在终点，否则测到的是 DUT 的反向响应。',
      'The signal is injected from the analyzer end, so the DUT is also backwards. The SG must be at the start and the SA at the end; otherwise you measure the reverse response of the DUT.',
    ),
  },
}

/** 右侧说明栏：连错时给出原因；通过时给出 DUT 功率与分析仪读数 */
export function verdictOf(state: RfSystemState, a: LinkAnalysis): { title: LText; text: LText; note: LText } {
  if (a.error !== null) {
    return { title: ERROR_TEXT[a.error].title, text: ERROR_TEXT[a.error].reason, note: S.errNote }
  }
  const dut = a.dutDbm === null ? state.sgDbm : a.dutDbm
  const sa = a.saDbm === null ? dut : a.saDbm
  const dutWatt = formatSi(dbmToWatt(dut), 'W')
  return {
    title: S.verdictOk,
    text: loc(
      `到达 DUT 的功率为 ${dut.toFixed(2)} dBm（${dutWatt}）：信号源 ${state.sgDbm.toFixed(1)} dBm 减去 DUT 前段的损耗 ${a.upstreamLossDb.toFixed(1)} dB。分析仪读数 ${sa.toFixed(2)} dBm。`,
      `The power at the DUT is ${dut.toFixed(2)} dBm (${dutWatt}): the source at ${state.sgDbm.toFixed(1)} dBm minus ${a.upstreamLossDb.toFixed(1)} dB of loss before the DUT. The analyzer reads ${sa.toFixed(2)} dBm.`,
    ),
    note: a.overLimit ? S.overNote : S.afterNote,
  }
}

/** 四张任务卡：完成与否由当前方案和参数算出 */
export function taskItems(state: RfSystemState, a: LinkAnalysis): TaskItem[] {
  return [
    { id: 'std', text: S.task1, done: state.preset === 'std' },
    { id: 'cable3', text: S.task2, done: state.cableDb >= 3 },
    { id: 'wrong', text: S.task3, done: state.preset !== 'std' },
    { id: 'over', text: S.task4, done: a.overLimit },
  ]
}

/** 小测数字由默认参数与公式算出 */
const DEFAULT_DUT = DEFAULT_SYSTEM.sgDbm - DEFAULT_SYSTEM.cableDb - DEFAULT_SYSTEM.fixtureDb

export const MISCONCEPTIONS: LText[] = [
  loc(
    '信号源输出就是 DUT 的输入功率。中间的线缆和夹具都会吃掉功率，DUT 实际收到的是信号源输出减去前段各段损耗。',
    'The source output is the DUT input power. Cables and fixtures in between eat power; the DUT receives the source level minus all the upstream losses.',
  ),
  loc(
    'DUT 后面的线缆也会减小 DUT 的输入功率。DUT 后段的损耗只改变分析仪的读数；要算 DUT 的输出功率时，才需要把它扣掉（去嵌入）。',
    'Cables after the DUT also reduce the DUT input power. Losses after the DUT only change the analyzer reading; they are removed when you calculate the DUT output (de-embedding).',
  ),
  loc(
    '链路连错了，仍能算出一个数就可以用。缺元件或接反的链路算出的数不是任何器件的性能，必须先判定连接，再读功率。',
    'If a wrong link still produces a number, the number is usable. A link with a missing part or reversed parts gives no device performance, so check the connection before reading power.',
  ),
]

export const TAKEAWAY: LText = loc(
  'DUT 收到的功率 = 信号源 dBm − DUT 前段各段损耗（dB）；DUT 后段只影响分析仪读数。连接必须是 SG 在起点、DUT 在中间、SA 在终点，否则先报错，不算数。',
  'Power at the DUT = source dBm − the losses of the segments before it (dB); segments after the DUT only affect the analyzer reading. The link must have the SG at the start, the DUT in the middle and the SA at the end; otherwise it is flagged first and no number is trusted.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('链路里没有信号源，DUT 会怎样？', 'What happens if the link has no signal source?'),
    options: [
      { id: 'a', text: loc('信号源关掉，DUT 仍能收到同样的功率', 'With the source off the DUT still receives the same power') },
      { id: 'b', text: loc('DUT 没有激励，这条链路不能测，必须报错', 'The DUT has no stimulus, the link cannot measure, so it must be flagged') },
      { id: 'c', text: loc('分析仪会自己产生信号，链路仍然有效', 'The analyzer makes its own signal, so the link is still valid') },
    ],
    answer: 'b',
    explain: loc(
      '没有 SG 就没有激励功率。DUT 收不到任何东西，分析仪只能读到底噪，所以规则 1 直接报“缺信号源”，而不是算出一个数。',
      'Without an SG there is no stimulus power. The DUT receives nothing and the analyzer reads only the noise floor, so rule 1 flags “no signal source” instead of giving a number.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('标准链路（默认参数：SG 0 dBm，线缆 1.5 dB，夹具 2 dB），到达 DUT 的功率是多少？', 'Standard link with default settings (SG 0 dBm, cable 1.5 dB, fixture 2 dB): what is the power at the DUT?'),
    options: [
      { id: 'a', text: loc(`${DEFAULT_DUT.toFixed(1)} dBm`, `${DEFAULT_DUT.toFixed(1)} dBm`) },
      { id: 'b', text: loc(`${(-DEFAULT_DUT).toFixed(1)} dBm`, `${(-DEFAULT_DUT).toFixed(1)} dBm`) },
      {
        id: 'c',
        text: loc(
          `${(DEFAULT_SYSTEM.sgDbm + DEFAULT_SYSTEM.cableDb - DEFAULT_SYSTEM.fixtureDb).toFixed(1)} dBm`,
          `${(DEFAULT_SYSTEM.sgDbm + DEFAULT_SYSTEM.cableDb - DEFAULT_SYSTEM.fixtureDb).toFixed(1)} dBm`,
        ),
      },
    ],
    answer: 'a',
    explain: loc(
      `到达 DUT = 0 − 1.5 − 2 = ${DEFAULT_DUT.toFixed(1)} dBm。损耗要从源功率里减去；把线缆当成增益加上去，会得到 −0.5 dBm 这种错误结果。`,
      `Power at DUT = 0 − 1.5 − 2 = ${DEFAULT_DUT.toFixed(1)} dBm. Losses are subtracted from the source level; adding the cable as if it were gain gives a wrong −0.5 dBm.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('把 DUT 后面的线缆损耗增加 3 dB，DUT 的输入功率会怎样？', 'If the cable after the DUT gets 3 dB more loss, what happens to the DUT input power?'),
    options: [
      { id: 'a', text: loc('减少 3 dB', 'Drops by 3 dB') },
      { id: 'b', text: loc('不变，只影响分析仪读数', 'Unchanged; it only affects the analyzer reading') },
      { id: 'c', text: loc('增加 3 dB', 'Rises by 3 dB') },
    ],
    answer: 'b',
    explain: loc(
      'DUT 前段的损耗才会减少到达 DUT 的功率；DUT 后面的线缆在 DUT 之后，只改变分析仪读数。这是链路顺序的核心。',
      'Only losses before the DUT reduce the power reaching it; the cable after the DUT sits downstream and only changes the analyzer reading. This is the core of the link order.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('信号源从 0 dBm 提高到 +10 dBm，线缆与夹具不变，到达 DUT 的功率是多少？', 'The source rises from 0 dBm to +10 dBm with cables and fixture unchanged. What is the power at the DUT?'),
    options: [
      { id: 'a', text: loc(`${(10 - 3.5).toFixed(1)} dBm`, `${(10 - 3.5).toFixed(1)} dBm`) },
      { id: 'b', text: loc('10 dBm（忽略了损耗）', '10 dBm (losses ignored)') },
      { id: 'c', text: loc(`${(10 + 3.5).toFixed(1)} dBm（把损耗当成增益）`, `${(10 + 3.5).toFixed(1)} dBm (losses treated as gain)`) },
    ],
    answer: 'a',
    explain: loc(
      `10 − (1.5 + 2) = ${(10 - 3.5).toFixed(1)} dBm。源功率每提高 1 dB，到达 DUT 的功率也提高 1 dB，但损耗仍要减去。`,
      `10 − (1.5 + 2) = ${(10 - 3.5).toFixed(1)} dBm. Each dB the source rises raises the DUT power by 1 dB, but the losses are still subtracted.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('把信号源和分析仪接反，会出现什么问题？', 'What goes wrong if the SG and the analyzer are swapped?'),
    options: [
      { id: 'a', text: loc('到达 DUT 的功率会变大', 'The power at the DUT gets larger') },
      { id: 'b', text: loc('信号从分析仪一端注入，DUT 的方向反了，测不到它的正向响应', 'The signal enters from the analyzer end, the DUT faces backwards, and its forward response is never measured') },
      { id: 'c', text: loc('与结果无关，只影响线缆长度', 'No effect on the result; only the cable length matters') },
    ],
    answer: 'b',
    explain: loc(
      '信号源必须在链路起点，分析仪在终点。接反后 DUT 的方向也反了，读到的是反向响应，不是我们要测的正向性能，所以规则 4 直接报错。',
      'The SG must be at the start and the analyzer at the end. Swapped, the DUT is also reversed and the reading is its reverse response, not the forward performance we want, so rule 4 flags it.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('只有“信号源 → 线缆 → 分析仪”，没有 DUT，能判断 DUT 合不合格吗？', 'With only “SG → cable → analyzer” and no DUT, can you judge whether a DUT passes?'),
    options: [
      { id: 'a', text: loc('能，直接读出 DUT 的增益', 'Yes, read the DUT gain directly') },
      { id: 'b', text: loc('不能，链路里没有 DUT，只是直通，它测的是线缆', 'No; with no DUT the path is only a through and it measures the cable') },
      { id: 'c', text: loc('能，线缆损耗就是 DUT 的损耗', 'Yes, the cable loss is the DUT loss') },
    ],
    answer: 'b',
    explain: loc(
      '没有 DUT 的链路只有线缆和仪器，读数反映的是线缆，不是器件。规则 3 要求链路里必须有 DUT。',
      'With no DUT the path contains only cables and instruments, so the reading reflects the cables, not a device. Rule 3 requires a DUT in the link.',
    ),
  },
]

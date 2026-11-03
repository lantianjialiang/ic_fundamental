import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { Q_BER_1E12, qfunc } from './core/link'
import { BER_TARGET, CLAIM_IDS, analyseLink, type LinkAnalysis, type LinkState } from './picLinkModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const REF = analyseLink({
  txOmaMw: 1,
  erDb: 8,
  lossDb: 0,
  rAw: 0.8,
  sigmaUa: 10,
  jitter: 0,
  claim: 'avg',
  cursor: 0,
})
const REF_DBM = REF.refSensDbm.toFixed(2)
const REF_MW = REF.refSensMw.toFixed(3)
const BER_AT_Q = qfunc(Q_BER_1E12)

export function fmtBer(ber: number): string {
  if (!Number.isFinite(ber) || ber <= 0) return '0'
  return ber.toExponential(2)
}

export const CLAIM_OPTIONS = CLAIM_IDS.map((id) => ({
  id,
  label:
    id === 'avg'
      ? loc('灵敏度看平均功率', 'Sensitivity follows average power')
      : loc('有限消光比会恶化灵敏度', 'Finite ER hurts sensitivity'),
}))

export const S = {
  kickerNow: loc('这一条链路', 'This link'),
  introTitle: loc('光眼图、OMA 与 BER', 'The optical eye, OMA and BER'),
  coreTitle: loc('拨一拨：OMA、损耗与噪声', 'Try it: OMA, loss and noise'),
  coreNote: loc(
    '上面的方块高度是发射 OMA，旁边标消光比。下面是 BER 对接收 OMA，虚线是 1e-12。游标从最左边开始，停在曲线最接近 1e-12 的那一点。',
    'The height of the upper block is the transmitted OMA, with the extinction ratio labeled beside it. Below, BER is plotted against received OMA, and the dashed line is 1e-12. The cursor starts at the left. Park it on the point closest to 1e-12.',
  ),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  omaLabel: loc('发射 OMA', 'TX OMA'),
  erLabel: loc('消光比 ER', 'Extinction ratio ER'),
  lossLabel: loc('链路损耗', 'Link loss'),
  rLabel: loc('响应度 R', 'Responsivity R'),
  sigmaLabel: loc('TIA 噪声 σ', 'TIA noise σ'),
  jitterLabel: loc('抖动占位（加宽 σ）', 'Jitter placeholder (widens σ)'),
  claimLabel: loc('哪句对', 'Which claim'),
  rQ: loc('Q 因子', 'Q factor'),
  rBer: loc('BER', 'BER'),
  rSens: loc('灵敏度', 'Sensitivity'),
  rRef: loc('σ = 10 µA、R = 0.8 的灵敏度', 'Sensitivity at σ = 10 µA, R = 0.8'),
  rMargin: loc('余量（接收 OMA − 灵敏度）', 'Margin (received OMA − sensitivity)'),
  rAvg: loc('平均功率（同一 OMA）', 'Average power (same OMA)'),
  rRx: loc('接收 OMA', 'Received OMA'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '把灵敏度和良率放进整条 CPO 流程，看测试前移和 UPH，是下一课。',
    'Putting sensitivity and yield into the whole CPO flow, including shift-left and UPH, is the next lesson.',
  ),
  next: loc('下一课：CPO 测试流程与成本', 'Next: CPO test flow and cost'),
  task1: loc(
    `把 σ 调到 10 µA、R 调到 0.8 A/W，抖动保持 0。灵敏度应约为 ${REF_DBM} dBm（${REF_MW} mW）。`,
    `Set σ to 10 µA and R to 0.8 A/W, and leave jitter at 0. The sensitivity should be about ${REF_DBM} dBm (${REF_MW} mW).`,
  ),
  task2: loc(
    '把 BER 曲线的游标停在最接近 1e-12 的那一点。',
    'Park the BER-curve cursor on the point closest to 1e-12.',
  ),
  task3: loc(
    '加大链路损耗，直到 BER 超过 1e-12 并且余量小于 0。',
    'Increase the link loss until the BER is above 1e-12 and the margin is below 0.',
  ),
  task4: loc(
    '在「哪句对」里选中「有限消光比会恶化灵敏度」。平均功率不是灵敏度规格，OMA 才是。',
    'In “which claim”, select “Finite ER hurts sensitivity”. Average power is not the sensitivity spec; OMA is.',
  ),
  eyeAria: loc('光眼图：方块高度是 OMA，旁边标着消光比', 'Optical eye: the block height is OMA, with the extinction ratio labeled beside it'),
  berAria: loc('BER 对接收 OMA 的曲线，虚线为 1e-12，金线为游标', 'BER versus received OMA, dashed line at 1e-12, gold cursor'),
  vTitleOma: loc('灵敏度看 OMA', 'Sensitivity uses OMA'),
  vTitleEr: loc('有限消光比抬高平均功率', 'Finite ER raises the average power'),
  vTitleMargin: loc('余量为负', 'The margin is negative'),
}

const vBase = loc(
  '结论：灵敏度的规格是 OMA，不是平均功率。原因：热噪声主导时 Q = R·OMA / (2σ) = {q}，BER = {ber}，平均功率 {avg} mW 没有进入这个式子。当前接收 OMA 是 {rx} mW，灵敏度 {sens} dBm（{sensMw} mW），余量 {margin} mW。',
  'Conclusion: the sensitivity spec is OMA, not average power. Reason: when thermal noise dominates, Q = R·OMA / (2σ) = {q}, BER = {ber}, and the average power of {avg} mW does not enter that formula. Received OMA is {rx} mW, sensitivity is {sens} dBm ({sensMw} mW), and the margin is {margin} mW.',
)

const vEr = loc(
  '有限消光比会恶化按平均功率来报的灵敏度。原因：同一 OMA 下 Pavg/OMA = (ER+1)/(2(ER−1)) = {ratio}。ER 越低，为了保住这个 OMA，平均功率越高；按 OMA 报的灵敏度本身不变。',
  'A finite extinction ratio hurts a sensitivity that is quoted as average power. Reason: at this OMA, Pavg/OMA = (ER+1)/(2(ER−1)) = {ratio}. A lower ER needs more average power to keep that OMA. The sensitivity quoted as OMA itself does not change.',
)

const vMargin = loc(
  '链路损耗已经把接收 OMA 压到灵敏度以下：余量 {margin} mW < 0，BER = {ber}，超过 1e-12。原因：接收 OMA = 发射 OMA × 10^(−损耗/10)，Q 随接收 OMA 下降。',
  'Link loss has pushed the received OMA below the sensitivity: the margin is {margin} mW < 0, and the BER is {ber}, above 1e-12. Reason: received OMA = transmitted OMA × 10^(−loss/10), and Q falls with the received OMA.',
)

export const INTRO = [
  loc(
    '光眼图是光变成电流之后再采样得到的，打开之后和电眼图一样读高低电平。消光比 ER = 10·log10(P1/P0)，OMA = P1 − P0。平均功率是 (P1+P0)/2，不是灵敏度规格。电眼图见 {@hsEye}。',
    'An optical eye is sampled after light has been converted to current. Once it is open, the high and low levels are read the same way as an electrical eye. ER = 10·log10(P1/P0) and OMA = P1 − P0. Average power is (P1+P0)/2, and it is not the sensitivity spec. The electrical eye is in {@hsEye}.',
  ),
  loc(
    '热噪声主导、两电平噪声相近时，Q = R·OMA / (2σ)，BER = Q 函数(Q)。BER = 1e-12 时 Q 约 7.034，对应的最小 OMA 就是接收灵敏度。抖动在这里只是把 σ 加宽的占位，电学抖动见 {@hsJitter}。',
    'When thermal noise dominates and the two levels have similar noise, Q = R·OMA / (2σ) and BER is the Q function of Q. At BER = 1e-12, Q is about 7.034, and the smallest OMA for that Q is the receiver sensitivity. Jitter here is only a placeholder that widens σ. Electrical jitter is in {@hsJitter}.',
  ),
  loc(
    '有限的消光比不会改变 OMA 的定义，但要达到同一个 OMA，ER 越低，平均功率越高。所以「灵敏度」如果误用平均功率来报，有限 ER 会让它变差。',
    'A finite extinction ratio does not change the definition of OMA. Reaching the same OMA at a lower ER does take more average power. So if sensitivity is quoted, by mistake, as average power, a finite ER makes that number worse.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '平均功率就是灵敏度。灵敏度比的是接收端还能不能把 0 和 1 分开，热噪声下这个能力由 OMA 决定，不是由平均功率决定。',
    'Average power is the sensitivity. Sensitivity asks whether the receiver can still separate 0 and 1. Under thermal noise that ability is set by OMA, not by average power.',
  ),
  loc(
    'ER 越大越好，没有代价。ER 受调制器摆幅和功耗限制。ER 很低时，为了保住 OMA，平均功率要升高。',
    'A larger ER is always better and free. ER is limited by the modulator swing and by power. At a very low ER, holding the OMA requires a higher average power.',
  ),
  loc(
    '光链路的 BER 和电链路无关。光变成电流之后，判决、抖动和 BER 目标与电眼图是同一套。',
    'Optical-link BER has nothing to do with the electrical link. After light becomes current, the decision, the jitter and the BER target are the same ideas as the electrical eye.',
  ),
]

export const TAKEAWAY: LText = loc(
  '光眼图是光电转换之后的采样。灵敏度看 OMA，不看平均功率。Q = R·OMA / (2σ)，BER = Q(Q)，1e-12 对应 Q ≈ 7.034。有限消光比抬高的是达到同一 OMA 所需的平均功率。',
  'An optical eye is sampled after optical-to-electrical conversion. Sensitivity is an OMA spec, not an average-power spec. Q = R·OMA / (2σ), BER = Q(Q), and 1e-12 corresponds to Q ≈ 7.034. A finite extinction ratio raises the average power needed to hold the same OMA.',
)

export function taskItems(state: LinkState, analysis: LinkAnalysis): TaskItem[] {
  return [
    {
      id: 't1',
      text: S.task1,
      done:
        Math.abs(state.sigmaUa - 10) < 0.01 &&
        Math.abs(state.rAw - 0.8) < 0.001 &&
        state.jitter <= 1e-9 &&
        Math.abs(analysis.sensDbm - analysis.refSensDbm) < 0.05,
    },
    { id: 't2', text: S.task2, done: state.cursor === analysis.closest },
    { id: 't3', text: S.task3, done: analysis.ber > BER_TARGET && analysis.marginMw < 0 },
    { id: 't4', text: S.task4, done: state.claim === 'er' },
  ]
}

export function verdictOf(state: LinkState, analysis: LinkAnalysis): { title: LText; text: LText } {
  const ratio = analysis.pAvgMw / Math.max(state.txOmaMw, 1e-9)
  const parts: LText[] = [
    fill(vBase, {
      q: analysis.q.toFixed(2),
      ber: fmtBer(analysis.ber),
      avg: analysis.pAvgMw.toFixed(3),
      rx: analysis.pRxMw.toFixed(3),
      sens: analysis.sensDbm.toFixed(2),
      sensMw: analysis.sensMw.toFixed(3),
      margin: analysis.marginMw.toFixed(3),
    }),
  ]
  const marginBad = analysis.ber > BER_TARGET && analysis.marginMw < 0
  if (marginBad) parts.push(fill(vMargin, { margin: analysis.marginMw.toFixed(3), ber: fmtBer(analysis.ber) }))
  if (state.claim === 'er') parts.push(fill(vEr, { ratio: ratio.toFixed(2) }))
  let title = S.vTitleOma
  if (state.claim === 'er') title = S.vTitleEr
  if (marginBad) title = S.vTitleMargin
  return { title, text: { zh: parts.map((p) => p.zh).join(''), en: parts.map((p) => p.en ?? '').join(' ') } }
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('接收灵敏度在热噪声主导时，应该用哪个量来规定？', 'When thermal noise dominates, which quantity should specify the receiver sensitivity?'),
    options: [
      { id: 'a', text: loc('平均功率', 'Average power') },
      { id: 'b', text: loc('OMA', 'OMA') },
      { id: 'c', text: loc('激光器的波长', 'The laser wavelength') },
    ],
    answer: 'b',
    explain: loc(
      'Q = R·OMA / (2σ)。平均功率没有进入这个式子，所以灵敏度规格是 OMA。',
      'Q = R·OMA / (2σ). Average power does not enter that formula, so the sensitivity spec is OMA.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于 ER、OMA 和平均功率，哪些说法对？(1) OMA = P1 − P0；(2) 平均功率 = (P1+P0)/2；(3) 灵敏度规格就是平均功率；(4) ER 很低时，保住同一个 OMA 需要更高的平均功率。',
      'Which statements about ER, OMA and average power are right? (1) OMA = P1 − P0; (2) average power = (P1+P0)/2; (3) the sensitivity spec is average power; (4) at a low ER, holding the same OMA needs a higher average power.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(3)、(4)', '(3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1)、(2)、(4) 对。(3) 不对：灵敏度看 OMA。有限 ER 恶化的是按平均功率来报的那个数。',
      '(1), (2) and (4) are right. (3) is wrong: sensitivity is an OMA spec. A finite ER hurts the number only when someone quotes it as average power.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      'σ = 10 µA，R = 0.8 A/W，BER = 1e-12（Q = 7.034）。最小 OMA 大约是多少？',
      'σ = 10 µA, R = 0.8 A/W, BER = 1e-12 (Q = 7.034). About what is the minimum OMA?',
    ),
    options: [
      { id: 'a', text: loc(`${(REF.refSensMw / 2).toFixed(3)} mW`, `${(REF.refSensMw / 2).toFixed(3)} mW`) },
      { id: 'b', text: loc(`${REF_MW} mW（${REF_DBM} dBm）`, `${REF_MW} mW (${REF_DBM} dBm)`) },
      { id: 'c', text: loc(`${(REF.refSensMw * 2).toFixed(3)} mW`, `${(REF.refSensMw * 2).toFixed(3)} mW`) },
    ],
    answer: 'b',
    explain: loc(
      `OMA_min = 2·Q·σ/R。代入之后是 ${REF_MW} mW，也就是 ${REF_DBM} dBm。`,
      `OMA_min = 2·Q·σ/R. Substituting gives ${REF_MW} mW, which is ${REF_DBM} dBm.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('Q = 7.034 时，BER 大约是多少？', 'About what is the BER at Q = 7.034?'),
    options: [
      { id: 'a', text: loc('1e-3', '1e-3') },
      { id: 'b', text: loc('1e-6', '1e-6') },
      { id: 'c', text: loc('1e-12', '1e-12') },
    ],
    answer: 'c',
    explain: loc(
      `教学取值 Q = 7.034 就是为了 BER = 1e-12。Q 函数在这一点给出 ${BER_AT_Q.toExponential(2)}。`,
      `The teaching value Q = 7.034 is chosen for BER = 1e-12. The Q function at that point returns ${BER_AT_Q.toExponential(2)}.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于链路余量，哪些说法对？(1) 余量 = 接收 OMA − 灵敏度 OMA；(2) 余量为负表示接收 OMA 已经低于 1e-12 所需的 OMA；(3) 加大链路损耗会提高接收 OMA；(4) BER 随 Q 下降而变差。',
      'Which statements about link margin are right? (1) Margin = received OMA − sensitivity OMA; (2) a negative margin means the received OMA is already below the OMA needed for 1e-12; (3) more link loss raises the received OMA; (4) BER gets worse as Q falls.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)', '(2), (3)') },
    ],
    answer: 'a',
    explain: loc(
      '(1)、(2)、(4) 对。(3) 反了：链路损耗越大，接收 OMA 越小，Q 和余量一起下降。',
      '(1), (2) and (4) are right. (3) is backwards: more link loss makes the received OMA smaller, and both Q and the margin fall.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('抖动占位在这个模型里做什么？', 'What does the jitter placeholder do in this model?'),
    options: [
      { id: 'a', text: loc('把 σ 乘上 (1 + 抖动)，噪声变大，灵敏度变差', 'It multiplies σ by (1 + jitter), so the noise grows and the sensitivity gets worse') },
      { id: 'b', text: loc('直接提高发射 OMA', 'It raises the transmitted OMA directly') },
      { id: 'c', text: loc('把 BER 固定成 0', 'It pins the BER at 0') },
    ],
    answer: 'a',
    explain: loc(
      '这里不单独画抖动谱，只让有效噪声 σ_eff = σ·(1+抖动)。σ 变大，同样的 OMA 对应更小的 Q。',
      'This lesson does not draw a jitter spectrum. It only sets σ_eff = σ·(1+jitter). A larger σ means a smaller Q for the same OMA.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('光眼图和电眼图的关系，哪句对？', 'Which statement about the optical eye and the electrical eye is right?'),
    options: [
      { id: 'a', text: loc('光变成电流之后，高低电平和 BER 的读法与电眼图相同', 'After light becomes current, the high and low levels and the BER are read the same way as an electrical eye') },
      { id: 'b', text: loc('光眼图不能看消光比', 'An optical eye cannot show an extinction ratio') },
      { id: 'c', text: loc('光眼图的纵轴必须是波长', 'The vertical axis of an optical eye must be wavelength') },
    ],
    answer: 'a',
    explain: loc(
      '光电转换之后，眼图就是电流（或电压）对时间。ER 和 OMA 在转换之前用功率定义，判决和 BER 在转换之后与电链路同一套。',
      'After optical-to-electrical conversion, the eye is current (or voltage) versus time. ER and OMA are defined in power before that conversion. The decision and the BER after it are the same ideas as in an electrical link.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('ER 从很高降到 6 dB 左右，OMA 保持不变。哪一项会变差？', 'ER falls from very high to about 6 dB, while OMA stays the same. Which number gets worse?'),
    options: [
      { id: 'a', text: loc('按 OMA 规定的灵敏度', 'The sensitivity specified as OMA') },
      { id: 'b', text: loc('为了保住这个 OMA 所需的平均功率（按平均功率来报的灵敏度会变差）', 'The average power needed to hold that OMA (a sensitivity quoted as average power gets worse)') },
      { id: 'c', text: loc('响应度 R 的单位', 'The unit of responsivity R') },
    ],
    answer: 'b',
    explain: loc(
      'OMA 不变时，Q 和按 OMA 报的灵敏度不变。ER 下降会让 P0 抬高，平均功率相对 OMA 变大。',
      'With OMA unchanged, Q and the OMA sensitivity stay the same. A lower ER raises P0, so the average power grows relative to the OMA.',
    ),
  },
]

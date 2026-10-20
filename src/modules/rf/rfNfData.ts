import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { dbToRatio, ratioToDb } from './core/units'
import { ENR_OPTIONS, type NfAnalysis, type NfState } from './rfNfModel'

export const ENR_SEG = ENR_OPTIONS.map((enr) => ({ id: String(enr), label: loc(`${enr} dB`, `${enr} dB`) }))

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)
const pct = (share: number) => (share * 100).toFixed(0)

export const S = {
  kickerNow: loc('这一次链路', 'This chain'),
  introTitle: loc('噪声系数：电路给信号添了多少噪声', 'Noise figure: how much noise a circuit adds to the signal'),
  coreTitle: loc('拨一拨：前级增益与各级噪声', 'Try it: front-stage gain and each stage’s noise'),
  coreNote: loc(
    '下图是三级链路。LNA 的增益和三级的噪声系数可以拨；混频器增益 −7 dB（变频损耗）、中频放大器增益 20 dB 是固定的教学取值。条形图把超出信源噪声的部分（F − 1）按级分开，每一条的长度就是这一级的份额。',
    'The chain has three stages. You can adjust the LNA gain and the three noise figures; the mixer gain (−7 dB, conversion loss) and the IF amplifier gain (20 dB) are fixed teaching values. The bars split the excess noise above the source (F − 1) by stage; each bar’s length is that stage’s share.',
  ),
  gLabel: loc('LNA 增益 G₁', 'LNA gain G₁'),
  nf1Label: loc('LNA 噪声系数 NF₁', 'LNA noise figure NF₁'),
  nf2Label: loc('混频器噪声系数 NF₂', 'Mixer noise figure NF₂'),
  nf3Label: loc('中频放大器噪声系数 NF₃', 'IF amplifier noise figure NF₃'),
  stageLna: loc('低噪声放大器', 'LNA'),
  stageMixer: loc('混频器', 'Mixer'),
  stageIf: loc('中频放大器', 'IF amplifier'),
  rTotal: loc('链路总 NF（Friis）', 'Chain NF (Friis)'),
  rChainGain: loc('链路总增益', 'Chain gain'),
  rLnaTerm: loc('LNA：F₁ − 1', 'LNA: F₁ − 1'),
  rMixerTerm: loc('混频器：(F₂ − 1) / G₁', 'Mixer: (F₂ − 1) / G₁'),
  rIfTerm: loc('中频放大器：(F₃ − 1) / (G₁G₂)', 'IF amp: (F₃ − 1) / (G₁G₂)'),
  rSum: loc('合计 F − 1（线性）', 'Total F − 1 (linear)'),
  yTitle: loc('Y 因子法：用噪声源测 NF', 'Y-factor method: measure NF with a noise source'),
  yNote: loc(
    '噪声源的 ENR 是出厂标定的已知量。噪声源关（冷态）、开（热态）各读一次输出功率，Y = N_hot / N_cold（线性）。ENR 选得太小时，Y 只比 1 大一点，两次读数几乎一样，换算误差被放大。',
    'The ENR of the noise source is a calibrated known value. Read the output power with the source off (cold) and on (hot): Y = N_hot / N_cold (linear). If ENR is too small, Y is barely above 1, the two readings nearly match, and the conversion error is magnified.',
  ),
  enrLabel: loc('噪声源 ENR（已知）', 'Noise source ENR (known)'),
  yCold: loc('N_cold（噪声源关）', 'N_cold (source off)'),
  yHot: loc('N_hot（噪声源开）', 'N_hot (source on)'),
  yValue: loc('Y = N_hot / N_cold（线性）', 'Y = N_hot / N_cold (linear)'),
  yNf: loc('NF = ENR / (Y − 1)，换成 dB', 'NF = ENR / (Y − 1), in dB'),
  yCheck: loc('Y 法算出的 NF 与 Friis 比较', 'Y-factor NF compared with Friis'),
  same: loc('一致', 'Match'),
  differ: loc('不一致', 'Mismatch'),
  vFront: loc('前级 NF 主导', 'The front stage dominates'),
  vBack: loc('后级占了不少份额', 'Later stages take a large share'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的接收机还要看镜像抑制、增益平坦度、噪声与线性度（IIP3）的折中；这里只练 Friis 级联与 Y 因子两件事。',
    'A real receiver also weighs image rejection, gain flatness and the noise-linearity trade-off (IIP3); here we only practise Friis cascading and the Y-factor method.',
  ),
  next: loc('下一课：谐波与杂散', 'Next: Harmonics and Spurious'),
  task1: loc('把 LNA 增益降到 5 dB 以下，让 LNA 的份额低于一半（后级主导）。', 'Lower the LNA gain to 5 dB or less so its share falls below half (later stages dominate).'),
  task2: loc(
    '把 LNA 增益提到 25 dB 以上，让链路 NF 与 LNA 自己的 NF 相差不到 0.2 dB。',
    'Raise the LNA gain to 25 dB or more so the chain NF is within 0.2 dB of the LNA’s own NF.',
  ),
  task3: loc('把 LNA 的噪声系数调到 3 dB 以上，让它占超出噪声的六成以上。', 'Raise the LNA noise figure to 3 dB or more so it takes more than 60% of the excess noise.'),
  task4: loc('把 ENR 换成 5 dB，看 Y 怎样变小，并核对 Y 法算出的 NF 与 Friis 一致。', 'Switch ENR to 5 dB, watch Y shrink, and check that the Y-factor NF still matches Friis.'),
}

export const FIG = {
  chainAria: loc(
    '三级链路：低噪声放大器、混频器、中频放大器，各自的增益与噪声系数',
    'Three-stage chain: LNA, mixer and IF amplifier, each with its gain and noise figure',
  ),
  chainCap: loc(
    '信号从左到右经过三级。越靠前的级，它的噪声越少被后面的增益“稀释”，对总 NF 的影响越大。',
    'The signal passes three stages from left to right. The earlier a stage, the less its noise is diluted by later gain, so the more it affects the total NF.',
  ),
  barAria: loc('三级各自占超出噪声的份额的条形图', 'Bar chart of each stage’s share of the excess noise'),
  barTitle: loc('超出信源噪声的部分（F − 1），按级分配', 'Excess noise above the source (F − 1), by stage'),
  barCap: loc(
    '条形越长，这一级对总 NF 的影响越大。LNA 的条形用金色标出。',
    'The longer the bar, the more that stage affects the total NF. The LNA bar is drawn in gold.',
  ),
}

export const INTRO = [
  loc(
    '噪声系数 NF 衡量一个电路给信号添了多少噪声：输入端信噪比除以输出端信噪比，取 dB。理想的、不添噪声的电路 NF = 0 dB，实际电路都大于 0 dB。接收机里 NF 决定能分辨的最弱信号，这一课要算的是一条三级链路的总 NF。',
    'Noise figure NF measures how much noise a circuit adds to the signal: the input SNR divided by the output SNR, in dB. An ideal circuit that adds no noise has NF = 0 dB; real circuits are always above 0 dB. In a receiver NF sets the weakest signal you can detect. This lesson computes the total NF of a three-stage chain.',
  ),
  loc(
    '级联时总 NF 不是各级 NF 直接相加。Friis 公式（线性值）为 F = F₁ + (F₂ − 1)/G₁ + (F₃ − 1)/(G₁G₂)：后级的噪声要除以前面的增益，才折算到输入端。前级增益高，后级的项就小，所以链路的 NF 主要由前几级决定。增益的换算见 {@rfGain}。',
    'Cascaded NF is not a simple sum of the stage NFs. The Friis formula (linear values) is F = F₁ + (F₂ − 1)/G₁ + (F₃ − 1)/(G₁G₂): later-stage noise is divided by the gain ahead of it when referred to the input. A high front gain shrinks the later terms, so the chain NF is set mainly by the first few stages. Gain conversions are in {@rfGain}.',
  ),
  loc(
    '实际中不知道信号源的噪声到底多大，于是用噪声源：噪声源关（冷态）、开（热态）各测一次输出功率，Y = N_hot / N_cold，再由噪声源出厂标定的 ENR 算出 NF = ENR / (Y − 1)。接收机的系统级测量见 {@rfSystem}。',
    'In practice the noise of the signal source is not known, so a noise source is used: measure the output with the source off (cold) and on (hot), take Y = N_hot / N_cold, and convert with the factory-calibrated ENR: NF = ENR / (Y − 1). The system-level measurement setup is in {@rfSystem}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '只看最后一级的 NF。后级的噪声要除以前级增益才折算到输入端，前级增益足够高时后级几乎不影响总 NF；但前级增益不够，后级就会主导。要看各级的贡献，不能只看一级。',
    'Only the last stage’s NF matters. Later-stage noise is divided by the front gain when referred to the input, so with enough front gain the later stages barely change the total; with too little front gain they dominate. Look at every stage’s contribution, not just one.',
  ),
  loc(
    'NF 可以直接相加。NF 是 dB 数，级联要先换成线性的 F，再用 Friis 公式（含前级增益）计算。dB 相加对应的是线性值相乘，不是级联的噪声相加。',
    'NFs can be added directly. NF is a dB number; for a cascade you must first convert to linear F and use the Friis formula, which includes the front gain. Adding dB corresponds to multiplying linear values, not to cascading noise.',
  ),
  loc(
    'ENR 随便选，有噪声源就行。Y 只比 1 大一点时，两次读数几乎一样，读数的小误差会被 1/(Y − 1) 放大，NF 算得很不准。选 ENR 时要让 Y 明显大于 1。',
    'Any ENR will do as long as there is a noise source. When Y is only slightly above 1, the two readings nearly match and small reading errors are magnified by 1/(Y − 1), so NF comes out very inaccurate. Pick an ENR that keeps Y clearly above 1.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Friis：F = F₁ + (F₂ − 1)/G₁ + (F₃ − 1)/(G₁G₂)，线性相加，后级要除以前级增益；前级 NF 与增益是链路 NF 的主导因素。Y 因子法：Y = N_hot / N_cold，NF = ENR / (Y − 1)，先算线性再换 dB。',
  'Friis: F = F₁ + (F₂ − 1)/G₁ + (F₃ − 1)/(G₁G₂), added in linear terms with later stages divided by the front gain; the front stage’s NF and gain dominate the chain NF. Y-factor: Y = N_hot / N_cold, NF = ENR / (Y − 1), computed in linear and then converted to dB.',
)

/** 小测题中的数字由同一套换算函数算出，与页面保持一致 */
const Q1_F1 = dbToRatio(1)
const Q1_F2 = dbToRatio(10)
const Q1_G1 = dbToRatio(10)
const Q1_NF = ratioToDb(Q1_F1 + (Q1_F2 - 1) / Q1_G1)
const Q4_NF = ratioToDb(dbToRatio(15) / (4 - 1))
const Q5_Y = dbToRatio(3)
const Q5_NF = ratioToDb(dbToRatio(15) / (Q5_Y - 1))
const Q6_Y = 1 + dbToRatio(5) / dbToRatio(10)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '两级链路：第一级增益 10 dB、NF 1 dB；第二级 NF 10 dB。总 NF 大约是多少？',
      'Two stages: the first has 10 dB gain and 1 dB NF; the second has 10 dB NF. Roughly what is the total NF?',
    ),
    options: [
      { id: 'a', text: loc(`${f0(1 + 10)} dB（把 1 与 10 直接相加）`, `${f0(1 + 10)} dB (adding 1 and 10 directly)`) },
      { id: 'b', text: loc(`${f1(Q1_NF)} dB`, `${f1(Q1_NF)} dB`) },
      { id: 'c', text: loc('1 dB（只看第一级）', '1 dB (first stage only)') },
    ],
    answer: 'b',
    explain: loc(
      `F = F₁ + (F₂ − 1)/G₁ = ${f2(Q1_F1)} + ${f0(Q1_F2 - 1)}/${f0(Q1_G1)} = ${f2(Q1_F1 + (Q1_F2 - 1) / Q1_G1)}，换成 dB 约 ${f1(Q1_NF)} dB。直接相加得 11 dB 是错的：dB 相加对应线性值相乘，级联要用 Friis。`,
      `F = F₁ + (F₂ − 1)/G₁ = ${f2(Q1_F1)} + ${f0(Q1_F2 - 1)}/${f0(Q1_G1)} = ${f2(Q1_F1 + (Q1_F2 - 1) / Q1_G1)}, about ${f1(Q1_NF)} dB in dB. Adding to 11 dB is wrong: adding dB multiplies linear values, and cascades must use Friis.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('为什么后级噪声在总 NF 里的贡献会随前级增益变小？', 'Why does a later stage’s noise contribution shrink as the front-stage gain grows?'),
    options: [
      { id: 'a', text: loc('后级噪声被前级的滤波器挡掉了', 'The front stage’s filter blocks the later noise') },
      { id: 'b', text: loc('后级噪声要除以前级增益，才折算到输入端', 'Later noise is divided by the front gain when referred to the input') },
      { id: 'c', text: loc('后级自己的 NF 会随前级增益自动下降', 'The later stage’s own NF drops automatically with front gain') },
    ],
    answer: 'b',
    explain: loc(
      '第二级的项是 (F₂ − 1)/G₁。前级增益 G₁ 越大，这一项越小：前级已经把信号放大了，后级的噪声相对信号就变得不重要。',
      'The second stage’s term is (F₂ − 1)/G₁. The larger the front gain G₁, the smaller this term: the signal is already amplified, so the later noise matters less relative to it.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('教学上，三级链路里哪一级最应该先优化？', 'Teaching-wise, which stage of the three should be optimised first?'),
    options: [
      { id: 'a', text: loc('最后一级，离输出最近', 'The last stage, closest to the output') },
      { id: 'b', text: loc('混频器，它没有增益', 'The mixer, because it has no gain') },
      { id: 'c', text: loc('第一级 LNA：它的 NF 直接进入总 NF，它的增益又压低后级的贡献', 'The first stage, the LNA: its NF goes straight into the total, and its gain suppresses later contributions') },
    ],
    answer: 'c',
    explain: loc(
      'Friis 的第一项 F₁ 不会被任何增益除掉，所以第一级的 NF 几乎整体进入总 NF；它的增益 G₁ 又把后面各级的贡献压下去。这就是“前级 NF 主导”。',
      'The first Friis term F₁ is not divided by any gain, so the first stage’s NF passes almost wholly into the total; its gain G₁ then suppresses the later contributions. That is why the front stage dominates.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('噪声源 ENR = 15 dB，测得 Y = 4（线性）。用 Y 因子法算出的 NF 约是多少？', 'A noise source with ENR = 15 dB gives Y = 4 (linear). About what NF does the Y-factor method give?'),
    options: [
      { id: 'a', text: loc(`${f1(15 - 4)} dB（用 15 减去 4）`, `${f1(15 - 4)} dB (15 minus 4)`) },
      { id: 'b', text: loc(`${f1(Q4_NF)} dB`, `${f1(Q4_NF)} dB`) },
      { id: 'c', text: loc('4.0 dB（直接取 Y）', '4.0 dB (taking Y directly)') },
    ],
    answer: 'b',
    explain: loc(
      `线性换算：NF = ENR / (Y − 1) = ${f2(dbToRatio(15))} / 3 = ${f2(dbToRatio(15) / 3)}，换成 dB 约 ${f1(Q4_NF)} dB。Y 是线性值，不能直接当 dB 去减。`,
      `Linear conversion: NF = ENR / (Y − 1) = ${f2(dbToRatio(15))} / 3 = ${f2(dbToRatio(15) / 3)}, about ${f1(Q4_NF)} dB in dB. Y is linear and cannot be subtracted as if it were dB.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('ENR = 15 dB，热态的输出功率比冷态高 3 dB。链路的 NF 大约是多少？', 'ENR = 15 dB, and the hot output power is 3 dB above the cold. About what is the chain NF?'),
    options: [
      { id: 'a', text: loc('3 dB（就是两次读数的差）', '3 dB (the difference of the two readings)') },
      { id: 'b', text: loc('0 dB', '0 dB') },
      { id: 'c', text: loc(`${f1(Q5_NF)} dB，几乎等于 ENR`, `${f1(Q5_NF)} dB, almost equal to ENR`) },
    ],
    answer: 'c',
    explain: loc(
      `Y = 10^(3/10) ≈ ${f2(Q5_Y)}，Y − 1 ≈ 1，所以 NF（线性）≈ ENR（线性），约 ${f1(Q5_NF)} dB。读数差 3 dB 不是 NF，要先换成线性 Y 再代入公式。`,
      `Y = 10^(3/10) ≈ ${f2(Q5_Y)}, so Y − 1 ≈ 1 and NF (linear) ≈ ENR (linear), about ${f1(Q5_NF)} dB. The 3 dB reading difference is not the NF; convert it to a linear Y first.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('噪声源 ENR 选得太小（5 dB），去测 NF = 10 dB 的被测件，会发生什么？', 'The noise source ENR is too small (5 dB) for a device with NF = 10 dB. What happens?'),
    options: [
      { id: 'a', text: loc('Y 变大，测得更准', 'Y gets larger and the measurement is more accurate') },
      { id: 'b', text: loc('ENR 与测量无关，只看 Y', 'ENR does not matter; only Y does') },
      { id: 'c', text: loc(`Y 只有 ${f2(Q6_Y)}，接近 1，两次读数差很小，读数误差被放大`, `Y is only ${f2(Q6_Y)}, close to 1, so the two readings differ little and reading errors are magnified`) },
    ],
    answer: 'c',
    explain: loc(
      '公式 NF = ENR / (Y − 1) 中 Y − 1 在分母上。Y 接近 1 时分母很小，NF 对 Y 的读数误差非常敏感。所以要选 ENR 足够大的噪声源。',
      'In NF = ENR / (Y − 1), Y − 1 is the denominator. When Y is close to 1 the denominator is tiny and NF is very sensitive to reading errors in Y. Choose a noise source with a large enough ENR.',
    ),
  },
]

/** 四张任务卡：完成与否由当前设置和链路结果算出，重置后自动还原 */
export function taskItems(state: NfState, a: NfAnalysis): TaskItem[] {
  return [
    { id: 'front-low', text: S.task1, done: state.g1 <= 5 && a.stages[0].share < 0.5 },
    { id: 'gain-high', text: S.task2, done: state.g1 >= 25 && a.totalNfDb - state.nf1 < 0.2 },
    { id: 'lna-dominant', text: S.task3, done: state.nf1 >= 3 && a.stages[0].share > 0.6 },
    { id: 'enr-5', text: S.task4, done: state.enr === ENR_OPTIONS[1] },
  ]
}

/** 右侧说明栏：根据 LNA 占的份额给结论，并写出原因 */
export function verdictOf(state: NfState, a: NfAnalysis): { title: LText; text: LText } {
  const lnaShare = a.stages[0].share
  const diff = f2(a.totalNfDb - state.nf1)
  if (lnaShare >= 0.5) {
    return {
      title: S.vFront,
      text: loc(
        `LNA 占超出噪声的 ${pct(lnaShare)}%。链路 NF ${f2(a.totalNfDb)} dB 只比 LNA 自己的 ${f1(state.nf1)} dB 高 ${diff} dB。原因：后级的噪声要除以 LNA 的增益（${f0(state.g1)} dB）才折算到输入端，所以前级增益高，后级的贡献就小。`,
        `The LNA takes ${pct(lnaShare)}% of the excess noise. The chain NF of ${f2(a.totalNfDb)} dB is only ${diff} dB above the LNA’s own ${f1(state.nf1)} dB. Reason: later-stage noise is divided by the LNA gain (${f0(state.g1)} dB) when referred to the input, so the higher the front gain, the smaller the later stages’ share.`,
      ),
    }
  }
  return {
    title: S.vBack,
    text: loc(
      `LNA 只占 ${pct(lnaShare)}%，后级合计占 ${pct(1 - lnaShare)}%。LNA 增益只有 ${f0(state.g1)} dB，后级的噪声没有被压下去，链路 NF 比 LNA 高出 ${diff} dB。提高 LNA 增益，或降低混频器、中频放大器的 NF，都能拉低总 NF。`,
      `The LNA takes only ${pct(lnaShare)}% and the later stages ${pct(1 - lnaShare)}%. With an LNA gain of only ${f0(state.g1)} dB, later noise is not suppressed, so the chain NF is ${diff} dB above the LNA’s NF. Raising the LNA gain, or lowering the mixer or IF amplifier NF, lowers the total.`,
    ),
  }
}

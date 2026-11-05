import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { PIC_TEACH, lambdaToTHz, linkBudgetDbm, mw } from './core/photonics'
import {
  LOSS_IDS,
  fmtDbm,
  fmtMw,
  type LossId,
  type NodeId,
  type UnitsAnalysis,
  type UnitsState,
} from './picUnitsModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

function fillTerm(text: LText, term: LText, values: Record<string, string>): LText {
  const filled = fill(text, values)
  return {
    zh: filled.zh.split('{term}').join(term.zh),
    en: (filled.en ?? filled.zh).split('{term}').join(term.en ?? term.zh),
  }
}

export const LOSS_NAME: Record<LossId, LText> = {
  gcIn: loc('输入光栅', 'input grating'),
  wg: loc('波导', 'waveguide'),
  mod: loc('调制器', 'modulator'),
  gcOut: loc('输出光栅', 'output grating'),
}

export const LOSS_BUTTON: Record<LossId, LText> = {
  gcIn: loc('输入光栅 {db} dB', 'GC in {db} dB'),
  wg: loc('波导 {db} dB', 'Waveguide {db} dB'),
  mod: loc('调制器 {db} dB', 'Modulator {db} dB'),
  gcOut: loc('输出光栅 {db} dB', 'GC out {db} dB'),
}

export const NODE_LABEL: Record<NodeId, LText> = {
  laser: loc('激光', 'Laser'),
  gcIn: loc('输入 GC', 'GC in'),
  wg: loc('波导', 'Guide'),
  mod: loc('调制', 'Mod'),
  gcOut: loc('输出 GC', 'GC out'),
}

export const MW3_OPTIONS = [
  { id: 'off' as const, label: loc('示例关闭', 'Example off') },
  { id: 'on' as const, label: loc('换算 -3 dBm', 'Convert -3 dBm') },
]

export const S = {
  kickerNow: loc('这条链路', 'This link'),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  introTitle: loc('波长、功率和可以相加的 dB', 'Wavelength, power, and dB that add'),
  coreTitle: loc('练一练：从激光到输出光栅', 'Practice: from the laser to the output grating'),
  coreNote: loc(
    'dB 损耗直接相加，再从激光的 dBm 里减去。mW 不能这样减。3 dB 大约是功率减半。波长只改频率，不改这条链路上的 dB 旋钮。',
    'Losses in dB add, then subtract from the laser dBm. Milliwatts do not subtract that way. 3 dB is about half the power. Wavelength changes the frequency only; it does not change the dB knobs on this link.',
  ),
  laserLabel: loc('激光功率', 'Laser power'),
  gcInLabel: loc('输入光栅损耗', 'Input grating loss'),
  lengthLabel: loc('波导长度', 'Waveguide length'),
  lossLabel: loc('波导传输损耗', 'Waveguide propagation loss'),
  modLabel: loc('调制器损耗', 'Modulator loss'),
  gcOutLabel: loc('输出光栅损耗', 'Output grating loss'),
  lambdaLabel: loc('波长', 'Wavelength'),
  mw3Label: loc('-3 dBm 换算示例', '-3 dBm conversion example'),
  lossPickLabel: loc('哪一段最值得优化', 'Which loss is most worth optimizing'),
  rFreq: loc('频率', 'Frequency'),
  rTotal: loc('总损耗', 'Total loss'),
  rArrival: loc('到达功率', 'Arrival power'),
  rNode: loc('{name}', '{name}'),
  rMw3: loc('-3 dBm 换成 mW', '-3 dBm in mW'),
  chainAria: loc('光功率沿激光、输入光栅、波导、调制器和输出光栅传递，每格标出 dBm 和 mW', 'Optical power along the laser, input grating, waveguide, modulator and output grating, with dBm and mW in each box'),
  chainSum: loc(
    '到达 {out} dBm（{mw} mW）。总损耗 {loss} dB。dB 相加，mW 不相加。',
    'Arrival {out} dBm ({mw} mW). Total loss {loss} dB. dB adds; milliwatts do not.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    'dB 和 dBm 的电学用法见 {@rfDb}。自由光谱范围要用群折射率 ng，下一课再算。',
    'The electrical use of dB and dBm is in {@rfDb}. Free spectral range uses the group index ng, which the next lesson computes.',
  ),
  next: loc('下一课：波导、MZI 与环形谐振器', 'Next: waveguides, the MZI and the ring'),
  task1: loc('把波长设为 1550 nm，读出频率。', 'Set the wavelength to 1550 nm and read the frequency.'),
  task2: loc(
    '激光 10 dBm、输入光栅 3 dB、波导 0.5 cm、损耗 2.5 dB/cm、调制器 4 dB、输出光栅 3 dB，读出到达功率。',
    'Set the laser to 10 dBm, the input grating to 3 dB, the waveguide to 0.5 cm at 2.5 dB/cm, the modulator to 4 dB and the output grating to 3 dB. Read the arrival power.',
  ),
  task3: loc('打开“换算 -3 dBm”，读出对应的毫瓦数。', 'Turn on Convert -3 dBm and read the value in milliwatts.'),
  task4: loc('在四段损耗里选当前 dB 最大的那一段。旋钮一变，答案会跟着变。', 'Among the four loss terms, pick the one with the largest dB. The answer follows the knobs.'),
  arriveTitle: loc('到达功率由 dB 相加得到', 'Arrival power comes from adding dB'),
  arriveText: loc(
    '到达功率是 {out} dBm（{mw} mW）。原因：各段 dB 相加得到总损耗 {loss} dB，再从激光 dBm 里减去；mW 不能按同样的办法相减。频率是 {thz} THz，因为 f = c/λ，波长 {nm} nm。当前选中的{term}是 {db} dB。3 dB 约为功率减半。',
    'Arrival power is {out} dBm ({mw} mW). Reason: the dB terms add to {loss} dB and that sum is subtracted from the laser dBm; milliwatts are not subtracted the same way. Frequency is {thz} THz because f = c/lambda at {nm} nm. The selected {term} is {db} dB. 3 dB is about half the power.',
  ),
  bestTitle: loc('这一段最值得优化', 'This term is the one most worth optimizing'),
  bestText: loc(
    '{term}最值得优化，因为它是 {db} dB，是当前各段里最大的。原因：dB 可以直接相加，这里少 1 dB，到达功率就高 1 dB。到达功率是 {out} dBm（{mw} mW），总损耗 {loss} dB。频率是 {thz} THz，因为 f = c/λ，波长 {nm} nm。mW 不能相加；3 dB 是功率减半。',
    'The {term} is most worth optimizing because it is {db} dB, the largest term right now. Reason: dB adds, so 1 dB less here raises the arrival by 1 dB. Arrival is {out} dBm ({mw} mW) after {loss} dB of loss. Frequency is {thz} THz because f = c/lambda at {nm} nm. Milliwatts do not add; 3 dB is half the power.',
  ),
}

export const INTRO = [
  loc(
    '光的频率是 f = c/λ。1550 nm 约是 193.4 THz，1310 nm 更高，约 229 THz。硅光常用这两个窗口。功率用 dBm：dBm = 10·log10(P / 1 mW)。损耗用 dB，几段损耗直接相加。',
    'Optical frequency is f = c/lambda. 1550 nm is about 193.4 THz; 1310 nm is higher, about 229 THz. Silicon photonics uses both windows. Power is reported in dBm: dBm = 10 log10(P / 1 mW). Loss is in dB, and several dB terms add.',
  ),
  loc(
    '3 dB 约是功率减半：-3 dBm 约是 0.501 mW，而 0 dBm 是 1 mW。mW 不能把各段损耗直接相减。有效折射率 neff 决定相位，群折射率 ng 决定自由光谱范围和群延迟。SOI 条波导的 TE 和 TM 不一样，光栅常常只按 TE 设计。',
    '3 dB is about half the power: -3 dBm is about 0.501 mW, while 0 dBm is 1 mW. Milliwatts do not subtract section by section. The effective index neff sets the phase; the group index ng sets the free spectral range and the group delay. TE and TM differ on an SOI strip waveguide, and a grating is often designed for TE only.',
  ),
  loc(
    '这一课的损耗量级来自虚拟器件 VDUT-PIC1：光栅约 3 dB，波导约 2.5 dB/cm。电学里的 dB 见 {@rfDb}。',
    'The loss scale in this lesson comes from the virtual device VDUT-PIC1: about 3 dB per grating and about 2.5 dB/cm in the waveguide. dB in electrical work is in {@rfDb}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'dB 可以换成 mW 再做同样的加减。dB 是对数，相加对应功率相乘；把两段 3 dB 加成 6 dB，功率变成四分之一，而不是减去 6 mW。',
    'A dB figure can be turned into mW and then added the same way. dB is logarithmic, so adding dB multiplies power. Two 3 dB sections are 6 dB, which is one quarter of the power, not 6 mW subtracted.',
  ),
  loc(
    '有效折射率就是材料折射率。体硅的折射率大约 3.5，条波导的 neff 还取决于截面，教学值约 2.4；决定 FSR 的是更大的 ng。',
    'Effective index is the material index. Bulk silicon is about 3.5; a strip waveguide neff also depends on the cross-section, and the teaching value is about 2.4. FSR uses the larger ng.',
  ),
  loc(
    '波长越短，损耗越低。频率确实更高，但这条链路上的 dB 由光栅、长度和调制器决定，不由波长旋钮决定。',
    'A shorter wavelength means lower loss. The frequency is higher, but the dB on this link is set by the gratings, the length and the modulator, not by the wavelength knob.',
  ),
]

export const TAKEAWAY: LText = loc(
  'f = c/λ，1550 nm 约 193.4 THz。dBm = 10·log10(P/1 mW)，dB 损耗相加，mW 不相加，3 dB 约为功率减半。neff 管相位，ng 管 FSR 和群延迟，TE 与 TM 可以不同。波导损耗按 dB/cm 估计。',
  'f = c/lambda, and 1550 nm is about 193.4 THz. dBm = 10 log10(P/1 mW). Losses in dB add, milliwatts do not, and 3 dB is about half the power. neff sets the phase, ng sets FSR and group delay, and TE and TM can differ. Waveguide loss is estimated in dB/cm.',
)

const F1550 = lambdaToTHz(PIC_TEACH.lambdaNm).toFixed(1)
const F1310 = lambdaToTHz(1310).toFixed(1)
const ARRIVAL = linkBudgetDbm(10, [3, 0.5 * PIC_TEACH.lossDbPerCm, 4, PIC_TEACH.gcDb]).toFixed(2)
const MW3 = mw(-3).toFixed(3)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('1550 nm 大约是多少 THz？', 'About how many THz is 1550 nm?'),
    options: [
      { id: 'a', text: loc(`${F1550} THz`, `${F1550} THz`) },
      { id: 'b', text: loc(`${F1310} THz`, `${F1310} THz`) },
      { id: 'c', text: loc('155.0 THz', '155.0 THz') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'f = c/λ。1550 nm 得到 {f} THz，落在 193.4 THz 的 0.1 THz 以内。{other} THz 是 1310 nm 的量级。',
        'f = c/lambda. 1550 nm gives {f} THz, within 0.1 THz of 193.4 THz. {other} THz is the scale of 1310 nm.',
      ),
      { f: F1550, other: F1310 },
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '激光 10 dBm，损耗依次为 3 dB、1.25 dB、4 dB、3 dB。到达功率是多少？',
      'The laser is 10 dBm and the losses are 3 dB, 1.25 dB, 4 dB and 3 dB. What is the arrival power?',
    ),
    options: [
      { id: 'a', text: loc(`${ARRIVAL} dBm`, `${ARRIVAL} dBm`) },
      { id: 'b', text: loc('10.00 dBm', '10.00 dBm') },
      { id: 'c', text: loc('-11.25 dBm', '-11.25 dBm') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'dB 相加：3 + 1.25 + 4 + 3 = 11.25 dB。10 - 11.25 = {out} dBm。-11.25 是忘了加上激光的 10 dBm。',
        'The dB terms add: 3 + 1.25 + 4 + 3 = 11.25 dB. 10 - 11.25 = {out} dBm. -11.25 forgets to start from the laser at 10 dBm.',
      ),
      { out: ARRIVAL },
    ),
  },
  {
    id: 'q3',
    prompt: loc('-3 dBm 大约是多少 mW？', 'About how many mW is -3 dBm?'),
    options: [
      { id: 'a', text: loc(`${MW3} mW`, `${MW3} mW`) },
      { id: 'b', text: loc('2.000 mW', '2.000 mW') },
      { id: 'c', text: loc('-3.000 mW', '-3.000 mW') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'mW = 10^(dBm/10)。10^(-0.3) = {mw} mW，约是 1 mW 的一半。所以 3 dB 是功率减半，不是减去 3 mW。',
        'mW = 10^(dBm/10). 10^(-0.3) = {mw} mW, about half of 1 mW. So 3 dB is half the power, not 3 mW subtracted.',
      ),
      { mw: MW3 },
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于 dB 和 mW，下列哪些说法正确？(1) 各段 dB 损耗可以相加；(2) 各段 mW 损耗按同样的方式相加；(3) 3 dB 约为功率减半；(4) 波导越长，损耗的 dB 一定更小。',
      'Which of these statements about dB and mW are correct? (1) Section losses in dB add; (2) section losses in mW add the same way; (3) 3 dB is about half the power; (4) a longer waveguide always has a smaller loss in dB.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'c', text: loc('(1)、(2)、(3)', '(1), (2), (3)') },
    ],
    answer: 'a',
    explain: loc(
      '(1) 和 (3) 是对数的定义：相加对应相乘，3 dB 约是 1/2。(2) 错：mW 要先换算再相乘，不能把 dB 当 mW 相加。(4) 反了：更长的波导，dB/cm 乘上更长的厘米数，损耗更大。',
      '(1) and (3) are what the logarithm means: adding dB multiplies power, and 3 dB is about 1/2. (2) is wrong: milliwatts have to be converted and multiplied; dB is not added as if it were mW. (4) is reversed: a longer waveguide multiplies dB/cm by more centimeters, so the loss is larger.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于折射率和偏振，下列哪些说法正确？(1) neff 决定波导里的相位；(2) ng 决定自由光谱范围和群延迟；(3) neff 就是体硅的折射率；(4) TE 和 TM 的 neff 可以不同，耦合器常常只支持 TE。',
      'Which of these statements about index and polarization are correct? (1) neff sets the phase along the waveguide; (2) ng sets the free spectral range and the group delay; (3) neff is the refractive index of bulk silicon; (4) TE and TM can have different neff, and a coupler is often built for TE only.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      'neff 约 2.4 是截面决定的有效折射率，不是体硅的 3.5。ng 约 4.2，用在 FSR = λ² / (ng·L)。偏振一变，耦合器的损耗可能完全不同。',
      'neff of about 2.4 is set by the cross-section; it is not the bulk-silicon index of 3.5. ng of about 4.2 is what FSR = lambda^2 / (ng L) uses. Change the polarization and a coupler loss can change completely.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('一条链路里，哪一段损耗最值得先优化？', 'On one link, which loss is most worth optimizing first?'),
    options: [
      { id: 'a', text: loc('当前 dB 最大的那一段', 'The term with the largest dB') },
      { id: 'b', text: loc('当前 dB 最小的那一段', 'The term with the smallest dB') },
      { id: 'c', text: loc('列表里的第一段，和数值无关', 'The first term in the list, whatever the number') },
    ],
    answer: 'a',
    explain: loc(
      'dB 直接相加，所以最大的那一项对到达功率的影响也最大。它是哪一段取决于当前旋钮，不能写死。',
      'dB adds, so the largest term also moves the arrival power the most. Which term that is depends on the current knobs; it is not a fixed name.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('1310 nm 和 1550 nm，谁的频率更高？', 'Which has the higher frequency, 1310 nm or 1550 nm?'),
    options: [
      { id: 'a', text: loc('1310 nm，因为波长更短', '1310 nm, because the wavelength is shorter') },
      { id: 'b', text: loc('1550 nm，因为这个数更大', '1550 nm, because that number is larger') },
      { id: 'c', text: loc('两者频率相同', 'They have the same frequency') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        'f = c/λ，波长越短频率越高。1310 nm 是 {a} THz，1550 nm 是 {b} THz。',
        'f = c/lambda, so a shorter wavelength is a higher frequency. 1310 nm is {a} THz and 1550 nm is {b} THz.',
      ),
      { a: F1310, b: F1550 },
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '关于这条链路预算，下列哪些说法正确？(1) 到达 dBm = 激光 dBm 减去各段 dB 之和；(2) 每一级的 mW 等于上一级 mW 减去损耗的 mW；(3) 输入光栅、波导、调制器和输出光栅都是 dB 项；(4) 在这个模型里，把波长从 1310 nm 改到 1550 nm 会改变 dB 之和。',
      'Which of these statements about this link budget are correct? (1) Arrival dBm = laser dBm minus the sum of the dB losses; (2) each stage in mW equals the previous mW minus the loss in mW; (3) the input grating, the waveguide, the modulator and the output grating are all dB terms; (4) in this model, changing the wavelength from 1310 nm to 1550 nm changes the dB sum.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1) 和 (3) 就是预算的做法。(2) 错：mW 按 10^(dB/10) 去乘，不是相减。(4) 错：这个模型里的 dB 旋钮不随波长改变，波长只改频率。',
      '(1) and (3) are how the budget is built. (2) is wrong: milliwatts are multiplied by 10^(dB/10), not subtracted. (4) is wrong: the dB knobs in this model do not follow wavelength; wavelength only changes the frequency.',
    ),
  },
]

export function lossOptions(parts: Record<LossId, number>) {
  return LOSS_IDS.map((id) => ({ id, label: fill(LOSS_BUTTON[id], { db: parts[id].toFixed(2) }) }))
}

export function taskItems(analysis: UnitsAnalysis): TaskItem[] {
  return [
    { id: 'freq', text: S.task1, done: analysis.task1 },
    { id: 'budget', text: S.task2, done: analysis.task2 },
    { id: 'mw3', text: S.task3, done: analysis.task3 },
    { id: 'best', text: S.task4, done: analysis.task4 },
  ]
}

export function verdictOf(state: UnitsState, analysis: UnitsAnalysis): { title: LText; text: LText } {
  const values = {
    out: fmtDbm(analysis.arrival),
    mw: fmtMw(analysis.nodes[analysis.nodes.length - 1].mw),
    loss: analysis.total.toFixed(2),
    thz: analysis.freqTHz.toFixed(1),
    nm: state.lambdaNm.toFixed(0),
    db: analysis.parts[state.lossPick].toFixed(2),
  }
  const term = LOSS_NAME[state.lossPick]
  if (analysis.parts[state.lossPick] === analysis.parts[analysis.best]) {
    return { title: S.bestTitle, text: fillTerm(S.bestText, term, values) }
  }
  return { title: S.arriveTitle, text: fillTerm(S.arriveText, term, values) }
}

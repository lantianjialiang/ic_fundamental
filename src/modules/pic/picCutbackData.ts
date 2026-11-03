import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { cutbackFit } from './core/link'
import { DARK_THRESHOLD_NA, LENGTHS_CM, RADIAL_IDS, type CutAnalysis, type CutState } from './picCutbackModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const DEMO = cutbackFit(
  [0.1, 0.5, 1, 2],
  [0.1, 0.5, 1, 2].map((lengthCm) => 2.5 * lengthCm + 6),
)

export const RADIAL_OPTIONS = RADIAL_IDS.map((id) => ({
  id,
  label: id === 'off' ? loc('关', 'Off') : loc('开', 'On'),
}))

export const S = {
  kickerNow: loc('这一次提取', 'This extraction'),
  introTitle: loc('晶圆上的电学筛选与 cut-back', 'Electrical screen and cut-back on the wafer'),
  coreTitle: loc('拨一拨：长度、噪声与晶圆图', 'Try it: lengths, noise and the wafer map'),
  coreNote: loc(
    '左上是插入损耗对长度。蓝点是测量，金线是回归。斜率是传输损耗（dB/cm），截距是两端耦合损耗之和，所以 GC 损耗是截距的一半。下面的晶圆图是每颗 die 提取出的斜率。',
    'The upper plot is insertion loss against length. Blue points are measurements and the gold line is the fit. The slope is propagation loss (dB/cm). The intercept is the sum of the two couplers, so the GC loss is half the intercept. The wafer map below is the extracted slope of each die.',
  ),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  lossLabel: loc('真值传输损耗', 'True propagation loss'),
  gcLabel: loc('真值 GC 损耗', 'True GC loss'),
  noiseLabel: loc('测量噪声', 'Measurement noise'),
  repeatLabel: loc('每个长度的重复次数', 'Repeats per length'),
  lenLabel: loc('参加拟合的长度', 'Lengths in the fit'),
  radialLabel: loc('径向系统性偏差', 'Radial systematic trend'),
  edgeLabel: loc('中心到边缘的额外损耗', 'Extra loss from center to edge'),
  darkLabel: loc('PD 暗电流', 'PD dark current'),
  rSlope: loc('拟合斜率', 'Fitted slope'),
  rInt: loc('拟合截距', 'Fitted intercept'),
  rGc: loc('GC 损耗（截距 / 2）', 'GC loss (intercept / 2)'),
  rErr: loc('斜率减真值', 'Slope minus the true loss'),
  rR2: loc('拟合 R²', 'Fit R²'),
  rDark: loc('暗电流与阈值', 'Dark current and the threshold'),
  rDie: loc('选中 die 的斜率', 'Slope of the selected die'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '把提取出的损耗放进一条光链路，看 BER 和灵敏度，是下一课。',
    'Putting the extracted loss into an optical link, and reading BER and sensitivity, is the next lesson.',
  ),
  next: loc('下一课：光链路测试', 'Next: Optical link test'),
  task1: loc(
    '把测量噪声调到 0，使拟合斜率和真值的差小于 0.1 dB/cm。',
    'Set the measurement noise to 0 so the fitted slope is within 0.1 dB/cm of the true loss.',
  ),
  task2: loc(
    '保留 2 cm 那一档，让拟合至少有 4 个长度，并把噪声降到 0.05 dB 或更低。',
    'Keep the 2 cm length, use at least 4 lengths, and bring the noise down to 0.05 dB or less.',
  ),
  task3: loc(
    '打开径向偏差。侧栏会指出从中心到边缘的趋势。',
    'Turn the radial trend on. The side panel names the center-to-edge pattern.',
  ),
  task4: loc(
    '把 PD 暗电流调到阈值以上。侧栏会说明这道电学筛选要排在慢的光学测试之前。',
    'Raise the PD dark current above the threshold. The side panel says this electrical screen runs before the slow optical test.',
  ),
  plotAria: loc('插入损耗对波导长度的散点，以及回归直线', 'Insertion loss versus waveguide length, with the fitted line'),
  xLabel: loc('长度 cm', 'Length cm'),
  yLabel: loc('损耗 dB', 'Loss dB'),
  mapAria: loc('晶圆图，颜色表示每颗 die 提取的传输损耗', 'Wafer map colored by the extracted propagation loss of each die'),
  dieLabel: loc('第 {row} 行第 {col} 列，提取损耗 {loss} dB/cm', 'Row {row}, column {col}, extracted loss {loss} dB/cm'),
  vTitleFit: loc('GC 损耗是截距的一半', 'GC loss is half the intercept'),
  vTitleRadial: loc('中心到边缘的系统性偏差', 'A center-to-edge systematic trend'),
  vTitleDark: loc('暗电流筛选先于光学', 'The dark-current screen runs before optics'),
}

const vFit = loc(
  '结论：选中第 {row} 行第 {col} 列，这颗 die 的提取斜率是 {die} dB/cm。回归斜率是 {slope} dB/cm，真值 {trueLoss} dB/cm，差 {err} dB/cm。GC 损耗是截距的一半，等于 {gc} dB，不是截距 {intercept} dB。原因：波导两端各有一个耦合器，截距 = 2×GC。',
  'Conclusion: the selected die is row {row}, column {col}, and its extracted slope is {die} dB/cm. The fit slope is {slope} dB/cm against a true loss of {trueLoss} dB/cm, a difference of {err} dB/cm. GC loss is half the intercept, {gc} dB, not the intercept of {intercept} dB. Reason: there is one coupler at each end of the waveguide, so the intercept is 2×GC.',
)

const vRadial = loc(
  '晶圆上从中心到边缘，提取损耗升高约 {span} dB/cm（旋钮设的边缘额外量是 {edge} dB/cm）。原因：这是中心到边缘的径向系统性偏差，不是随机噪声，边缘 die 比中心高。',
  'From the center to the edge of the wafer, the extracted loss rises by about {span} dB/cm (the knob’s extra edge loss is {edge} dB/cm). Reason: this is a center-to-edge radial systematic trend, not random noise, and edge dies sit above the center.',
)

const vDark = loc(
  '这颗 PD 的暗电流是 {dark} nA，高于阈值 {th} nA，电学筛选判为失效。原因：暗电流是电学量，这道筛选要排在慢的光学测试之前，坏的探测器不必再上光学台。',
  'This PD’s dark current is {dark} nA, above the threshold of {th} nA, so the electrical screen fails it. Reason: dark current is an electrical measurement, and this screen runs before the slow optical test, so a bad detector never reaches the optical bench.',
)

export const INTRO = [
  loc(
    '晶圆级光电测试里，电学项（加热器电阻、PD 暗电流）又快又便宜；光学项（传输谱、耦合）要移动光纤，慢得多。能用电学筛掉的，不要留到光学。',
    'In a wafer-level photonic test, the electrical items (heater resistance, PD dark current) are fast and cheap. The optical items (a transmission spectrum, coupling) move a fiber and are much slower. Anything an electrical screen can reject should not wait for optics.',
  ),
  loc(
    'Cut-back 用几条不同长度的波导做插入损耗对长度的直线回归。斜率是传输损耗（dB/cm），截距是两端耦合损耗之和。GC 损耗等于截距的一半，不是截距本身。统计里的回归见 {@anaStats}。',
    'Cut-back fits insertion loss against length for several waveguide lengths. The slope is propagation loss (dB/cm). The intercept is the sum of the two coupling losses. GC loss is half the intercept, not the intercept itself. Regression as a statistic is in {@anaStats}.',
  ),
  loc(
    '长度范围太窄、点数太少，或者对准在重复测量里晃，斜率就会漂。晶圆图上若从中心到边缘一边高一边低，那是系统性偏差，不是一颗颗 die 的随机噪声。',
    'A short length range, too few points, or alignment that wanders between repeats will move the slope. On the wafer map, a smooth rise from the center to the edge is a systematic trend, not die-to-die random noise.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '两个长度就够了。两点一定能画出一条线，但任何一个点的噪声都会整段变成斜率误差。长度拉得更开、点更多，同样的噪声对斜率的拉动更小。',
    'Two lengths are enough. Two points always define a line, but noise on either point becomes a slope error for the whole line. A wider length range and more points move the slope less for the same noise.',
  ),
  loc(
    '对准的重复性可以忽略。每次重新对准的损耗抖动会加进每个长度的读数，回归会把它当成波导损耗。',
    'Alignment repeatability can be ignored. The loss jitter of each realignment is added into every length, and the fit treats it as waveguide loss.',
  ),
  loc(
    'GC 损耗等于截距。截距是两端耦合之和。一边一个光栅时，GC 损耗是截距的一半。',
    'GC loss equals the intercept. The intercept is the sum of the two couplers. With one grating at each end, the GC loss is half the intercept.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Cut-back 的斜率是传输损耗（dB/cm），截距是两端耦合之和，GC 损耗是截距的一半。长度范围、点数和测量噪声一起决定斜率误差。晶圆图上的中心到边缘是系统性偏差。PD 暗电流这道电学筛选要排在慢的光学测试之前。',
  'The cut-back slope is propagation loss (dB/cm), the intercept is the sum of the two couplers, and the GC loss is half the intercept. Length range, point count and measurement noise together set the slope error. A center-to-edge pattern on the wafer map is systematic. The PD dark-current screen runs before the slow optical test.',
)

export function taskItems(state: CutState, analysis: CutAnalysis): TaskItem[] {
  const err = analysis.slopeErr
  const count = LENGTHS_CM.filter((_, index) => state.use[index]).length
  return [
    { id: 't1', text: S.task1, done: state.noiseDb <= 1e-9 && err !== null && Math.abs(err) < 0.1 },
    {
      id: 't2',
      text: S.task2,
      done: state.use[3] === true && count >= 4 && state.noiseDb <= 0.05,
    },
    { id: 't3', text: S.task3, done: state.radial === 'on' },
    { id: 't4', text: S.task4, done: state.darkNa > DARK_THRESHOLD_NA },
  ]
}

export function verdictOf(
  state: CutState,
  analysis: CutAnalysis,
  die: { row: number; col: number; param: number },
): { title: LText; text: LText } {
  const fit = analysis.fit
  const slope = fit ? fit.slopeDbPerCm : 0
  const intercept = fit ? fit.interceptDb : 0
  const params = analysis.wafer.dies.map((item) => item.param)
  const span = Math.max(...params) - Math.min(...params)
  const parts: LText[] = [
    fill(vFit, {
      row: String(die.row + 1),
      col: String(die.col + 1),
      die: die.param.toFixed(3),
      slope: slope.toFixed(3),
      trueLoss: state.trueLoss.toFixed(2),
      err: (slope - state.trueLoss).toFixed(3),
      gc: (intercept / 2).toFixed(3),
      intercept: intercept.toFixed(3),
    }),
  ]
  if (state.radial === 'on') {
    parts.push(fill(vRadial, { span: span.toFixed(2), edge: state.edgeDb.toFixed(1) }))
  }
  if (state.darkNa > DARK_THRESHOLD_NA) {
    parts.push(fill(vDark, { dark: String(state.darkNa), th: String(DARK_THRESHOLD_NA) }))
  }
  let title = S.vTitleFit
  if (state.radial === 'on') title = S.vTitleRadial
  if (state.darkNa > DARK_THRESHOLD_NA) title = S.vTitleDark
  return { title, text: { zh: parts.map((p) => p.zh).join(''), en: parts.map((p) => p.en ?? '').join(' ') } }
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Cut-back 回归里，斜率和截距各是什么？', 'In a cut-back fit, what are the slope and the intercept?'),
    options: [
      { id: 'a', text: loc('斜率是传输损耗（dB/cm），截距是两端耦合损耗之和', 'The slope is propagation loss (dB/cm), and the intercept is the sum of the two coupling losses') },
      { id: 'b', text: loc('斜率是 GC 损耗，截距是传输损耗', 'The slope is the GC loss, and the intercept is the propagation loss') },
      { id: 'c', text: loc('斜率和截距都是暗电流', 'Both the slope and the intercept are dark current') },
    ],
    answer: 'a',
    explain: loc(
      '损耗 = 传输损耗 × 长度 + 两端耦合。对长度作图，斜率就是每厘米的传输损耗，截距是长度为零时剩下的耦合。',
      'Loss = propagation loss × length + the two couplers. Against length, the slope is the propagation loss per centimeter, and the intercept is the coupling left at zero length.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于 cut-back，哪些说法对？(1) 长度范围越宽，同样的噪声对斜率的影响越小；(2) 两个点就一定比四个点稳；(3) 重复对准的抖动会进回归；(4) GC 损耗等于截距本身。',
      'Which statements about cut-back are right? (1) A wider length range makes the same noise move the slope less; (2) two points are always more stable than four; (3) realignment jitter enters the fit; (4) GC loss equals the intercept itself.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'c', text: loc('(1)、(4)', '(1), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1) 和 (3) 对。(2) 反了：点越少，一个坏点越能把斜率拉走。(4) 不对：两端各有一个耦合器，GC 是截距的一半。',
      '(1) and (3) are right. (2) is backwards: with fewer points, one bad point pulls the slope harder. (4) is wrong: there is a coupler at each end, so the GC is half the intercept.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '真值传输损耗 2.5 dB/cm，两端 GC 各 3 dB，没有噪声。长度 2 cm 的插入损耗是多少？',
      'True propagation loss is 2.5 dB/cm and each GC is 3 dB, with no noise. What is the insertion loss at 2 cm?',
    ),
    options: [
      { id: 'a', text: loc('5 dB', '5 dB') },
      { id: 'b', text: loc('8 dB', '8 dB') },
      { id: 'c', text: loc('11 dB', '11 dB') },
    ],
    answer: 'c',
    explain: loc(
      '损耗 = 2.5×2 + 2×3 = 11 dB。2.5×2 是波导，2×3 是两端的光栅。',
      'Loss = 2.5×2 + 2×3 = 11 dB. 2.5×2 is the waveguide, and 2×3 is the grating at each end.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `无噪声、长度 0.1/0.5/1/2 cm、真值 2.5 dB/cm、两端耦合合计 6 dB 时，回归截距是 ${DEMO.interceptDb.toFixed(0)} dB。一边一个光栅，GC 损耗是多少？`,
      `With no noise, lengths 0.1/0.5/1/2 cm, a true loss of 2.5 dB/cm and 6 dB of coupling at the two ends together, the fit intercept is ${DEMO.interceptDb.toFixed(0)} dB. With one grating at each end, what is the GC loss?`,
    ),
    options: [
      { id: 'a', text: loc('6 dB', '6 dB') },
      { id: 'b', text: loc('3 dB', '3 dB') },
      { id: 'c', text: loc('12 dB', '12 dB') },
    ],
    answer: 'b',
    explain: loc(
      '截距是两端之和。一边一个光栅时，GC = 截距 / 2 = 3 dB，不是 6 dB。',
      'The intercept is the sum of the two ends. With one grating at each end, GC = intercept / 2 = 3 dB, not 6 dB.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '晶圆图上，提取损耗从中心到边缘平滑升高。这更像什么？',
      'On the wafer map the extracted loss rises smoothly from the center to the edge. What does that look like?',
    ),
    options: [
      { id: 'a', text: loc('随机噪声，可以多测几次平均掉', 'Random noise, which more repeats will average away') },
      { id: 'b', text: loc('中心到边缘的径向系统性偏差', 'A center-to-edge radial systematic trend') },
      { id: 'c', text: loc('PD 暗电流超标', 'A PD dark current above the limit') },
    ],
    answer: 'b',
    explain: loc(
      '平滑的中心到边缘是工艺或测量台的系统性趋势，重复测量消不掉。随机噪声不会画成这样一圈一圈变高。',
      'A smooth center-to-edge rise is a process or bench systematic trend. Repeats do not remove it. Random noise does not draw a ring that gets higher outward.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '关于晶圆级流程，哪些说法对？(1) PD 暗电流可以用电学快速筛选；(2) 这道电学筛选应排在慢的光学测试之前；(3) 光学 cut-back 比暗电流更快；(4) 已知良好裸片是为了别把坏片送去后面的昂贵组装。',
      'Which statements about the wafer flow are right? (1) PD dark current can be screened electrically and quickly; (2) that electrical screen should run before the slow optical test; (3) an optical cut-back is faster than a dark-current reading; (4) a known-good die is how you avoid sending a bad die into an expensive later assembly.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1)、(2)、(4) 对。(3) 反了：光学要对准和扫描，比一次暗电流慢得多。',
      '(1), (2) and (4) are right. (3) is backwards: optics needs alignment and a sweep, which is much slower than one dark-current reading.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('为什么晶圆级光学不能每颗 die 都做完整扫描？', 'Why can a wafer-level optical test not run a full sweep on every die?'),
    options: [
      { id: 'a', text: loc('因为光学对准和扫描慢，量产要靠测试结构和抽样', 'Because optical alignment and sweeps are slow, so production relies on test structures and sampling') },
      { id: 'b', text: loc('因为暗电流不能在晶圆上测', 'Because dark current cannot be measured on a wafer') },
      { id: 'c', text: loc('因为回归只能用一个长度', 'Because a fit can use only one length') },
    ],
    answer: 'a',
    explain: loc(
      '每颗 die 都做完整光学，时间乘上整片晶圆就不可接受。电学先筛，光学放在 PCM 和抽样上。',
      'A full optical test on every die, multiplied by the wafer, is too slow. Electrical screens go first, and optics stays on process-control monitors and a sample.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('截距是 6 dB。只说「GC 损耗是 6 dB」错在哪里？', 'The intercept is 6 dB. What is wrong with saying the GC loss is 6 dB?'),
    options: [
      { id: 'a', text: loc('没有错，截距就是一个光栅的损耗', 'Nothing; the intercept is the loss of one grating') },
      { id: 'b', text: loc('6 dB 是两端之和，一个光栅大约是 3 dB', '6 dB is the sum of the two ends, so one grating is about 3 dB') },
      { id: 'c', text: loc('6 dB 是传输损耗，和耦合无关', '6 dB is the propagation loss and has nothing to do with coupling') },
    ],
    answer: 'b',
    explain: loc(
      '回归截距 = 2×GC。把截距直接当成一个光栅的损耗，会把耦合损耗算大一倍。',
      'The fit intercept is 2×GC. Taking the intercept as one grating doubles the coupling loss.',
    ),
  },
]

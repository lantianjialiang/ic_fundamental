import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { gcLossDb } from './core/photonics'
import { ALG_IDS, DELTA_IDS, analyseAlign, type AlignAnalysis, type AlignState, type AlgId } from './picAlignModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const EXTRA = gcLossDb(1, 1, 0)
const EXTRA_TXT = EXTRA.toFixed(3)

export const ALG_OPTIONS = ALG_IDS.map((id) => ({
  id,
  label:
    id === 'raster' ? loc('栅格', 'Raster') : id === 'spiral' ? loc('螺旋', 'Spiral') : loc('爬山', 'Hill'),
}))

export const DELTA_OPTIONS = DELTA_IDS.map((id) => ({
  id,
  label: id === 'off' ? loc('关', 'Off') : loc('Δ = w', 'Δ = w'),
}))

export const S = {
  kickerNow: loc('这一次对准', 'This alignment'),
  introTitle: loc('光栅、边缘耦合与主动对准', 'Grating, edge coupling and active alignment'),
  coreTitle: loc('拨一拨：三种搜索', 'Try it: three searches'),
  coreNote: loc(
    '热图是耦合读数（dBm，越亮越高）。白圈是真峰，金点是当前算法停下的位置，金线是它走过的点。三种算法的步数和时间始终都列在右边。',
    'The heat map is the coupling reading (dBm, brighter is higher). The white ring is the true peak, the gold dot is where the selected search stopped, and the gold line is the points it visited. Moves and time for all three searches stay listed on the right.',
  ),
  teach: loc(
    '教学示意：参数来自虚拟器件 VDUT-PIC1，不对应任何代工厂工艺。',
    'Teaching illustration: values are for the virtual device VDUT-PIC1 and do not match any foundry process.',
  ),
  wLabel: loc('模场半径 w', 'Mode-field radius w'),
  l0Label: loc('峰值耦合损耗 L0', 'On-peak coupling loss L0'),
  noiseLabel: loc('读数噪声', 'Reading noise'),
  rangeLabel: loc('搜索范围', 'Search range'),
  stepLabel: loc('步长', 'Step'),
  moveLabel: loc('每步移动加稳定', 'Move and settle per step'),
  algLabel: loc('算法', 'Algorithm'),
  deltaLabel: loc('Δ = w 的例子', 'Δ = w example'),
  rMoves: loc('当前算法的步数', 'Moves of the selected search'),
  rTime: loc('当前算法的时间', 'Time of the selected search'),
  rExcess: loc('最终附加损耗', 'Final excess loss'),
  rDist: loc('离真峰的距离', 'Distance to the true peak'),
  rExtra: loc('Δ = w、L0 = 0 的附加损耗', 'Extra loss at Δ = w, L0 = 0'),
  rRaster: loc('栅格：步数 / 时间 / 附加损耗', 'Raster: moves / time / excess'),
  rSpiral: loc('螺旋：步数 / 时间 / 附加损耗', 'Spiral: moves / time / excess'),
  rHill: loc('爬山：步数 / 时间 / 附加损耗', 'Hill: moves / time / excess'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '晶圆上怎么把波导损耗和耦合损耗分开，是下一课的 cut-back。',
    'How a wafer test separates waveguide loss from coupling loss is the cut-back lesson next.',
  ),
  next: loc('下一课：晶圆级光电测试与参数提取', 'Next: Wafer-level photonic test and parameter extraction'),
  task1: loc(
    '打开「Δ = w」的例子。附加损耗应当是 4.343 dB（L0 取 0）。',
    'Turn on the Δ = w example. The extra loss should be 4.343 dB (with L0 set to 0).',
  ),
  task2: loc(
    '把读数噪声调到 0，让当前选中的算法把附加损耗降到 0.2 dB 以内。噪声大于 0 时这项不算完成。',
    'Set the reading noise to 0 and bring the excess loss of the selected search to 0.2 dB or less. If the noise is above 0, this task stays open.',
  ),
  task3: loc(
    '改用螺旋搜索，并让它的步数少于栅格。对准往往比后面的测量更花时间。',
    'Switch to the spiral search and make its move count smaller than the raster. Alignment often takes longer than the measurement that follows.',
  ),
  task4: loc(
    '把噪声调到至少 1 dB，算法选爬山，直到附加损耗大于 0.5 dB。侧栏会说明假峰。',
    'Set the noise to at least 1 dB, choose hill-climb, and leave the excess loss above 0.5 dB. The side panel explains the false peak.',
  ),
  mapAria: loc('耦合热图与对准轨迹', 'Coupling heat map and the alignment path'),
  vTitleRaster: loc('栅格铺满了搜索范围', 'Raster covers the whole range'),
  vTitleSpiral: loc('螺旋不必铺满', 'The spiral does not have to cover everything'),
  vTitleHill: loc('爬山沿读数往上走', 'Hill-climb follows the reading upward'),
  vTitleDelta: loc('Δ = w 的附加损耗', 'Extra loss at Δ = w'),
  vTitleFalse: loc('爬山停在假峰上', 'Hill-climb stopped on a false peak'),
}

const REF_ALIGN = analyseAlign({
  wUm: 4,
  l0Db: 3,
  noiseDb: 0,
  rangeUm: 6,
  stepUm: 1,
  moveS: 0.2,
  alg: 'raster',
  deltaW: 'off',
})
const RASTER_MOVES = String(REF_ALIGN.runs.raster.moves)
const RASTER_TIME = REF_ALIGN.runs.raster.timeS.toFixed(1)

export const FIG_SUMMARY = loc(
  '真峰在 ({x0}, {y0}) µm。当前算法停在 ({x}, {y}) µm，附加损耗 {ex} dB，走了 {moves} 步。',
  'The true peak is at ({x0}, {y0}) µm. The selected search stopped at ({x}, {y}) µm, with {ex} dB excess loss, after {moves} moves.',
)

const vRun = loc(
  '结论：{alg}走了 {moves} 步、用了 {time} s，停在离真峰 {dist} µm 的地方，附加损耗 {ex} dB。原因：{why}光学测试的时间常常被对准占掉，因为每一步都要移动并等读数稳定。',
  'Conclusion: {alg} took {moves} moves and {time} s, and stopped {dist} µm from the true peak with {ex} dB of excess loss. Reason: {why} Alignment often dominates optical test time, because every step has to move and then wait for the reading to settle.',
)

const ALG_WORD: Record<AlgId, LText> = {
  raster: loc('栅格', 'Raster'),
  spiral: loc('螺旋', 'Spiral'),
  hill: loc('爬山', 'Hill-climb'),
}

const WHY: Record<AlgId, LText> = {
  raster: loc(
    '栅格把范围内每一个点都走到，步数是三种里最多的。',
    'raster visits every point in the range, so it takes the most moves of the three. ',
  ),
  spiral: loc(
    '螺旋从中心向外，连续两圈没有更好的读数就停，所以峰在中部时步数少于铺满的栅格。',
    'the spiral grows outward from the center and stops after two rings with no better reading, so it takes fewer moves than a full raster when the peak is near the middle. ',
  ),
  hill: loc(
    '爬山只比较上下左右，读数变好才走，步长减半后再试。',
    'hill-climb only compares the four neighbors, steps when the reading improves, and then tries again at half the step. ',
  ),
}

const vDelta = loc(
  'Δ = w 且 L0 = 0 时，附加损耗是 {extra} dB。原因：L = L0 + 4.343·(Δ/w)²，Δ/w = 1，多出来的就是 4.343 dB。',
  'With Δ = w and L0 = 0, the extra loss is {extra} dB. Reason: L = L0 + 4.343·(Δ/w)², and Δ/w = 1, so the extra term is 4.343 dB.',
)

const vFalse = loc(
  '爬山停在了假峰上：附加损耗 {ex} dB，离真峰还有 {dist} µm。原因：读数噪声有 {noise} dB，已经盖过邻近点之间真实的功率差，算法把噪声当成了峰。',
  'Hill-climb stopped on a false peak: the excess loss is {ex} dB and the stop is still {dist} µm from the true peak. Reason: the reading noise is {noise} dB, larger than the real power difference between neighbors, so the search treats the noise as a peak.',
)

export const INTRO = [
  loc(
    '光栅耦合器从芯片表面差不多垂直地进光，对位置的公差比较宽，但带宽有限。边缘耦合器从芯片端面进光，带宽更宽，对位置和角度更严。光纤阵列（FAU）是一排光纤一起对准。',
    'A grating coupler enters the chip from the top, nearly vertical. Its position tolerance is wider, and its bandwidth is limited. An edge coupler enters through the chip facet. Its bandwidth is wider, and it is stricter about position and angle. A fiber array unit (FAU) aligns a row of fibers together.',
  ),
  loc(
    '高斯模场失准的附加损耗大约是 L = L0 + 4.343·(Δ/w)²，w 是模场半径。Δ = w 时，这一项就是 4.343 dB。横向、角度、间隙和偏振都会再加损耗。',
    'The extra loss of a mismatched Gaussian mode is about L = L0 + 4.343·(Δ/w)², where w is the mode-field radius. At Δ = w that term is 4.343 dB. Angle, gap and polarization add loss as well.',
  ),
  loc(
    '主动对准用功率读数当目标，在平面上找峰。栅格铺满范围，螺旋从中心向外可以早点停，爬山沿斜率走、步数少，但读数一吵就会停在假峰上。对准的移动和稳定时间，常常比后面的测量更长。',
    'Active alignment uses the power reading as the goal and searches the plane for the peak. Raster covers the whole range. A spiral grows from the center and can stop early. Hill-climb follows the slope and takes fewer moves, but noisy readings stop it on a false peak. The move-and-settle time of alignment is often longer than the measurement that follows.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '对准一次就一直对准。热漂移和机械回差会让峰慢慢走开，量产要看重复性，必要时重新找峰。',
    'Align once and it stays aligned. Thermal drift and mechanical backlash walk the peak away. Production has to watch repeatability and search again when needed.',
  ),
  loc(
    '步长越小越好。步长小于模场之后，附加损耗下降变慢，步数和时间继续增加。',
    'A smaller step is always better. Once the step is smaller than the mode field, the excess loss improves slowly, while the move count and the time keep growing.',
  ),
  loc(
    '耦合损耗只由横向偏移决定。角度、间隙和偏振都会再改变耦合，边缘耦合对角度尤其敏感。',
    'Coupling loss is only the lateral offset. Angle, gap and polarization all change the coupling too, and an edge coupler is especially sensitive to angle.',
  ),
]

export const TAKEAWAY: LText = loc(
  '光栅耦合公差宽、带宽有限；边缘耦合带宽宽、对位更严。Δ = w 时附加损耗是 4.343 dB。栅格步数多，螺旋可以早点停，爬山怕噪声里的假峰。对准的移动和稳定常常主导光学测试时间。',
  'A grating coupler has a wider position tolerance and a limited bandwidth. An edge coupler has a wider bandwidth and a tighter alignment. At Δ = w the extra loss is 4.343 dB. Raster takes many moves, a spiral can stop early, and hill-climb can lock onto a false peak in noise. Move and settle often dominate optical test time.',
)

function line(run: AlignAnalysis['runs'][AlgId]) {
  return `${run.moves} / ${run.timeS.toFixed(2)} s / ${run.excessDb.toFixed(3)} dB`
}

export function taskItems(state: AlignState, analysis: AlignAnalysis): TaskItem[] {
  const selected = analysis.runs[state.alg]
  return [
    { id: 't1', text: S.task1, done: state.deltaW === 'on' },
    { id: 't2', text: S.task2, done: state.noiseDb <= 1e-9 && selected.excessDb <= 0.2 },
    { id: 't3', text: S.task3, done: state.alg === 'spiral' && analysis.runs.spiral.moves < analysis.runs.raster.moves },
    { id: 't4', text: S.task4, done: state.noiseDb >= 1 && state.alg === 'hill' && selected.excessDb > 0.5 },
  ]
}

export function verdictOf(state: AlignState, analysis: AlignAnalysis): { title: LText; text: LText } {
  const run = analysis.runs[state.alg]
  const why = WHY[state.alg]
  const word = ALG_WORD[state.alg]
  const zh = fill(vRun, {
    alg: word.zh,
    moves: String(run.moves),
    time: run.timeS.toFixed(2),
    dist: run.distUm.toFixed(2),
    ex: run.excessDb.toFixed(3),
    why: why.zh,
  }).zh
  const en = fill(vRun, {
    alg: word.en ?? word.zh,
    moves: String(run.moves),
    time: run.timeS.toFixed(2),
    dist: run.distUm.toFixed(2),
    ex: run.excessDb.toFixed(3),
    why: why.en ?? '',
  }).en
  const parts: LText[] = [{ zh, en }]
  if (state.deltaW === 'on') parts.push(fill(vDelta, { extra: analysis.deltaWExtraDb.toFixed(3) }))
  const falsePeak = state.noiseDb >= 1 && state.alg === 'hill' && run.excessDb > 0.5
  if (falsePeak) {
    parts.push(fill(vFalse, { ex: run.excessDb.toFixed(2), dist: run.distUm.toFixed(2), noise: state.noiseDb.toFixed(1) }))
  }
  let title = state.alg === 'raster' ? S.vTitleRaster : state.alg === 'spiral' ? S.vTitleSpiral : S.vTitleHill
  if (state.deltaW === 'on') title = S.vTitleDelta
  if (falsePeak) title = S.vTitleFalse
  return { title, text: { zh: parts.map((p) => p.zh).join(''), en: parts.map((p) => p.en ?? '').join(' ') } }
}

export function compareLine(analysis: AlignAnalysis, id: AlgId) {
  return line(analysis.runs[id])
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('光栅耦合器和边缘耦合器，哪句更准确？', 'Which statement about grating and edge couplers is more accurate?'),
    options: [
      { id: 'a', text: loc('光栅从表面进光，位置公差通常比边缘耦合宽', 'A grating enters from the top, and its position tolerance is usually wider than an edge coupler') },
      { id: 'b', text: loc('边缘耦合带宽更窄，所以更好对准', 'An edge coupler has a narrower bandwidth, so it is easier to align') },
      { id: 'c', text: loc('两者都只在乎波长，不在乎位置', 'Both care only about wavelength, not position') },
    ],
    answer: 'a',
    explain: loc(
      '光栅近似垂直进光，位置公差较宽，带宽有限。边缘耦合带宽更宽，对位置和角度更严。',
      'A grating enters nearly vertically, with a wider position tolerance and a limited bandwidth. An edge coupler has a wider bandwidth and is stricter about position and angle.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于失准损耗，哪些说法对？(1) L = L0 + 4.343·(Δ/w)²；(2) Δ = w 且 L0 = 0 时，附加损耗是 4.343 dB；(3) 只有横向偏移会改变耦合；(4) w 是模场半径。',
      'Which statements about misalignment loss are right? (1) L = L0 + 4.343·(Δ/w)²; (2) at Δ = w and L0 = 0 the extra loss is 4.343 dB; (3) only a lateral offset changes the coupling; (4) w is the mode-field radius.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1)、(2)、(4) 是这个教学公式。(3) 不对：角度、间隙和偏振也会改变耦合。',
      '(1), (2) and (4) are this teaching formula. (3) is wrong: angle, gap and polarization change the coupling too.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('Δ = w、L0 = 0 时，附加损耗是多少？', 'What is the extra loss at Δ = w and L0 = 0?'),
    options: [
      { id: 'a', text: loc('2.171 dB', '2.171 dB') },
      { id: 'b', text: loc(`${EXTRA_TXT} dB`, `${EXTRA_TXT} dB`) },
      { id: 'c', text: loc('8.686 dB', '8.686 dB') },
    ],
    answer: 'b',
    explain: loc(
      `(Δ/w)² = 1，所以附加项就是 4.343 dB。本课函数 gcLossDb(w, w, 0) 给出 ${EXTRA_TXT} dB。`,
      `(Δ/w)² = 1, so the extra term is 4.343 dB. gcLossDb(w, w, 0) in this lesson returns ${EXTRA_TXT} dB.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      `默认几何下，无噪声的栅格要走 ${RASTER_MOVES} 步。每步移动加稳定 0.2 s，总时间大约是多少？`,
      `In the default geometry, a noiseless raster takes ${RASTER_MOVES} moves. At 0.2 s of move-and-settle per step, about how long is that?`,
    ),
    options: [
      { id: 'a', text: loc(`${(Number(RASTER_TIME) / 2).toFixed(1)} s`, `${(Number(RASTER_TIME) / 2).toFixed(1)} s`) },
      { id: 'b', text: loc(`${RASTER_TIME} s`, `${RASTER_TIME} s`) },
      { id: 'c', text: loc(`${(Number(RASTER_TIME) * 2).toFixed(1)} s`, `${(Number(RASTER_TIME) * 2).toFixed(1)} s`) },
    ],
    answer: 'b',
    explain: loc(
      `时间 = 步数 × 每步时间 = ${RASTER_MOVES} × 0.2 s = ${RASTER_TIME} s。这就是对准常常比测量本身更花时间的原因。`,
      `Time = moves × time per step = ${RASTER_MOVES} × 0.2 s = ${RASTER_TIME} s. This is why alignment often takes longer than the measurement itself.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于三种算法，哪些说法对？(1) 栅格的步数通常最多；(2) 峰在搜索范围中部时，螺旋可以比栅格少走很多步；(3) 爬山在大噪声下仍一定停在真峰；(4) 三种算法在无噪声、步长合适时都能靠近真峰。',
      'Which statements about the three searches are right? (1) Raster usually takes the most moves; (2) when the peak is near the middle, a spiral can take far fewer moves than raster; (3) hill-climb still always stops on the true peak in large noise; (4) with no noise and a suitable step, all three can finish near the true peak.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(1)、(2)、(4) 对。(3) 不对：噪声一大，爬山会把假峰当成终点，附加损耗就下不来。',
      '(1), (2) and (4) are right. (3) is wrong: in large noise, hill-climb can stop on a false peak and the excess loss stays high.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('读数噪声变大时，爬山最典型的失败是什么？', 'When the reading noise grows, what is the typical failure of hill-climb?'),
    options: [
      { id: 'a', text: loc('它会把噪声里的高点当成峰，停在离真峰还有一段距离的地方', 'It treats a noisy high point as the peak and stops some distance from the true peak') },
      { id: 'b', text: loc('它会自动改成铺满的栅格', 'It automatically turns into a full raster') },
      { id: 'c', text: loc('噪声越大，它越一定停在真峰上', 'The larger the noise, the more surely it stops on the true peak') },
    ],
    answer: 'a',
    explain: loc(
      '爬山只看邻点谁的读数大。噪声盖过真实的功率差时，它就在假峰上停下来。',
      'Hill-climb only looks at which neighbor reads higher. When noise exceeds the real power difference, it stops on a false peak.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('光纤阵列（FAU）在多通道测试里做什么？', 'What does a fiber array unit (FAU) do in a multi-channel test?'),
    options: [
      { id: 'a', text: loc('一排光纤一起对准，通道之间的相对位置由阵列固定', 'A row of fibers is aligned together, and the array fixes their relative positions') },
      { id: 'b', text: loc('代替激光器发出波长扫描', 'It replaces the laser and emits the wavelength sweep') },
      { id: 'c', text: loc('只用来测暗电流', 'It is used only to measure dark current') },
    ],
    answer: 'a',
    explain: loc(
      'FAU 把多根光纤按固定间距排好。主动对准找的是整排的峰，通道数一多，对准时间更显眼。',
      'An FAU holds many fibers at a fixed pitch. Active alignment searches for the peak of the whole row, and with more channels the alignment time stands out even more.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('为什么说对准常常主导光学测试时间？', 'Why does alignment often dominate optical test time?'),
    options: [
      { id: 'a', text: loc('每一步都要移动平台并等读数稳定，步数一多，时间就超过后面的测量', 'Each step moves the stage and waits for the reading to settle, so many steps outlast the measurement that follows') },
      { id: 'b', text: loc('因为激光器不能改变波长', 'Because the laser cannot change wavelength') },
      { id: 'c', text: loc('因为功率计只能读一次', 'Because the power meter can be read only once') },
    ],
    answer: 'a',
    explain: loc(
      '光学对准是机械运动加稳定，不是一次电学采样。栅格尤其容易把时间花在还没靠近峰的那些点上。',
      'Optical alignment is mechanical motion plus settling, not a single electrical sample. Raster in particular spends time on points that are still far from the peak.',
    ),
  },
]

import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

/* ---------------- Shmoo 模型 ---------------- */

/** 行：VDD 0.70–1.30 V，每格 0.05 V（下标 0 是最低电压） */
export const VOLTS = Array.from({ length: 13 }, (_, i) => Math.round((0.7 + i * 0.05) * 100) / 100)
/** 列：100–800 MHz，每格 50 MHz */
export const FREQS = Array.from({ length: 15 }, (_, i) => 100 + i * 50)

/** 规格框：VDD 0.90–1.10 V，工作频率 ≤ 400 MHz */
export const SPEC = { vMin: 0.9, vMax: 1.1, fMax: 400 }

export type ChipId = 'good' | 'marginal' | 'bad'

export type ChipModel = {
  id: ChipId
  label: LText
  /** fMAX ≈ k ·(VDD − vt)，单位 MHz：门延迟随 VDD 升高而变短 */
  k: number
  vt: number
  /** 最低工作电压：低于它无论多慢都 Fail */
  vmin: number
  /** 不连续的格子：holes 本该 Pass 却 Fail，islands 本该 Fail 却 Pass。键为 `${v}|${f}` */
  holes: string[]
  islands: string[]
  text: LText
}

export const cellKey = (v: number, f: number) => `${v.toFixed(2)}|${f}`

export const CHIPS: ChipModel[] = [
  {
    id: 'good',
    label: loc('好芯片', 'Good chip'),
    k: 1000,
    vt: 0.35,
    vmin: 0.75,
    holes: [],
    islands: [],
    text: loc(
      '边界平滑：电压越高能跑得越快，大约是一条斜线；低于 0.75 V 全 Fail。0.90 V 下能跑到 550 MHz，比规格 400 MHz 多 150 MHz；规格框下方还有 3 行 Pass，裕量充足。',
      'A smooth boundary: higher voltage allows higher speed, roughly a straight slope; below 0.75 V everything fails. At 0.90 V it runs to 550 MHz, 150 MHz above the 400 MHz spec, and three passing rows sit below the spec box, so the margin is healthy.',
    ),
  },
  {
    id: 'marginal',
    label: loc('边缘芯片', 'Marginal chip'),
    k: 1000,
    vt: 0.48,
    vmin: 0.85,
    holes: [],
    islands: [],
    text: loc(
      '形状一样，但 Pass 区缩小了：斜边界左移（0.90 V 下只能跑到 400 MHz），底边上移到 0.85 V。边界正好贴着规格框的右下角（0.90 V / 400 MHz），频率裕量为 0。量产今天能 Pass，温度一高或换一台测试机就可能 Fail。',
      'Same shape, but the pass region has shrunk: the sloped edge moved left (only 400 MHz at 0.90 V) and the bottom edge rose to 0.85 V. The edge just touches the lower-right corner of the spec box (0.90 V / 400 MHz), so the frequency margin is 0. It passes production today but may fail when hotter or on another tester.',
    ),
  },
  {
    id: 'bad',
    label: loc('有问题的芯片', 'Problem chip'),
    k: 1000,
    vt: 0.35,
    vmin: 0.75,
    holes: [cellKey(1.0, 300), cellKey(1.0, 350), cellKey(1.05, 300), cellKey(1.05, 350)],
    islands: [cellKey(0.8, 600), cellKey(0.8, 650), cellKey(0.85, 650)],
    text: loc(
      '边界模型和好芯片一样（0.90 V 下 fMAX 也是 550 MHz），单看裕量看不出问题。但图上有两处不连续：红框是空洞，1.00–1.05 V × 300–350 MHz 四格在规格框里，四周都 Pass，偏偏这里 Fail；金框是孤岛，0.80 V 的 600、650 MHz 和 0.85 V 的 650 MHz 三格，按模型这两个电压最多只能跑 450、500 MHz，本该 Fail 却 Pass。边界不连续，说明有不稳定的失效、噪声或测试程序本身的问题，要先排查。注意：如果量产只测框角（0.90 V、1.10 V 下的 400 MHz），这颗会被放过。',
      'Its boundary model matches the good chip (fMAX is also 550 MHz at 0.90 V), so the margin alone shows nothing wrong. But the plot has two breaks: the red box is a hole, four cells at 1.00–1.05 V × 300–350 MHz inside the spec box that fail although everything around them passes; the gold box is an island, 600 and 650 MHz at 0.80 V plus 650 MHz at 0.85 V, which pass although the model allows only 450 and 500 MHz at those voltages. A broken boundary points to an unstable failure, noise or a test program problem, so investigate first. Note: if production only tests the box corners (400 MHz at 0.90 V and 1.10 V), this chip slips through.',
    ),
  },
]

export function fmaxAt(chip: ChipModel, v: number) {
  return chip.k * (v - chip.vt)
}

export type CellKind = 'pass' | 'slow' | 'lowV' | 'hole' | 'island'

export function cellKind(chip: ChipModel, v: number, f: number): CellKind {
  const key = cellKey(v, f)
  if (chip.holes.includes(key)) return 'hole'
  if (chip.islands.includes(key)) return 'island'
  if (v < chip.vmin - 1e-6) return 'lowV'
  if (f > fmaxAt(chip, v) + 1e-6) return 'slow'
  return 'pass'
}

export const isPass = (kind: CellKind) => kind === 'pass' || kind === 'island'

export const inSpec = (v: number, f: number) => v >= SPEC.vMin - 1e-6 && v <= SPEC.vMax + 1e-6 && f <= SPEC.fMax

export const CELL_TEXT: Record<CellKind, LText> = {
  pass: loc('这一点 Pass。', 'This point passes.'),
  slow: loc(
    '频率太高：这个 VDD 下门延迟太长，信号在 Strobe 之前还没稳定。把电压调高，门变快，就能多跑几格。',
    'Too fast: at this VDD the gate delay is too long and the signal has not settled before the strobe. Raise VDD and the gates speed up, so more cells pass.',
  ),
  lowV: loc(
    '电压低于最低工作电压：电路已经不能可靠地翻转和保持数据，频率再低也 Fail。这和速度无关。',
    'Below the minimum operating voltage: the circuit can no longer switch and hold data reliably, so it fails at any frequency. This is not a speed problem.',
  ),
  hole: loc(
    '空洞：四周都 Pass，偏偏这里 Fail。常见原因是间歇性失效、电源噪声，或程序里某个条件没设对。',
    'A hole: everything around it passes but this point fails. Typical causes are intermittent failures, supply noise or a wrong setting in the program.',
  ),
  island: loc(
    '孤岛：按边界本该 Fail，这里却 Pass。结果和相邻条件对不上，说明测量不稳定，不能当作真实裕量。',
    'An island: by the boundary it should fail, yet it passes. The result disagrees with its neighbours, so the measurement is unstable and is not real margin.',
  ),
}

export const SPEC_TEXT = {
  inPass: loc('在规格框内：用户会在这个条件下使用，必须 Pass。', 'Inside the spec box: customers use the part here, so it must pass.'),
  inFail: loc('在规格框内却 Fail：用户按规格使用也会出错，这颗芯片必须挑出来。', 'Fails inside the spec box: it would fail in normal use, so the chip must be rejected.'),
  outPass: loc('在规格框外 Pass：这就是裕量。离框越远，越不怕温度、老化和测试机误差。', 'Passes outside the spec box: this is margin. The farther from the box, the safer against temperature, aging and tester error.'),
  outFail: loc('在规格框外 Fail：超出规格的条件，不算缺陷。', 'Fails outside the spec box: beyond the spec, so not a defect.'),
}

/* ---------------- 文字 ---------------- */

export const L = {
  introTitle: loc('量产测一个点，表征扫一片', 'Production tests a point; characterization sweeps an area'),
  introBody: loc(
    '量产测试把电压、频率钉在几个条件上，只判 Pass / Fail，然后分 Bin。表征（Characterization）要回答的是：这颗芯片到底能工作到哪里？Shmoo 图就是答案：同一套功能向量，在每一个（VDD，频率）组合上跑一遍，每格记一个 Pass 或 Fail。怎样用搜索更快地找边界、怎样读 Datalog，详见 {@fChar}。',
    'Production testing fixes voltage and frequency at a few conditions, decides pass or fail and bins the part. Characterization asks where the chip actually stops working. A Shmoo plot answers that: run the same functional vectors at every (VDD, frequency) pair and record pass or fail in each cell. Faster boundary searches and reading the datalog are in {@fChar}.',
  ),
  gridTitle: loc('点格子看 Pass / Fail', 'Click a cell to see pass or fail'),
  gridNote: loc(
    '纵轴 VDD，横轴频率。虚线框是规格（0.90–1.10 V，≤ 400 MHz）。换一颗芯片，看边界形状怎么变。',
    'VDD is vertical, frequency horizontal. The dashed box is the spec (0.90–1.10 V, ≤ 400 MHz). Switch chips and watch the boundary change.',
  ),
  axisV: loc('VDD (V) ↑', 'VDD (V) ↑'),
  axisF: loc('频率 (MHz) →', 'Frequency (MHz) →'),
  spec: loc('规格', 'Spec'),
  model: loc('fMAX ≈ k ·(VDD − Vt)', 'fMAX ≈ k ·(VDD − Vt)'),
  vminLine: loc('最低工作电压', 'Min. operating voltage'),
  legendPass: loc('Pass', 'Pass'),
  legendFail: loc('Fail', 'Fail'),
  legendBad: loc('空洞（规格内 Fail）', 'Hole (fails in spec)'),
  legendIsland: loc('孤岛（边界外 Pass）', 'Island (passes past the edge)'),
  noteHole: loc('空洞：规格内本该 Pass 却 Fail', 'Hole: should pass, but fails'),
  noteIsland: loc('孤岛：边界外本该 Fail 却 Pass', 'Island: should fail, but passes'),
  figCap: loc(
    '绿色 Pass，灰色 Fail；红底 ✕ 是规格框内的 Fail（空洞），橙底圆点是模型边界外却 Pass 的格子（孤岛）。斜虚线是 fMAX 随 VDD 升高的趋势，横虚线是最低工作电压。',
    'Green passes, grey fails; red with ✕ is a failure inside the spec box (a hole), orange with a dot passes beyond the model edge (an island). The sloped dashed line is fMAX rising with VDD; the flat one is the minimum operating voltage.',
  ),
  rdFails: loc('规格框内 Fail', 'Fails in spec box'),
  rdFmax: loc('0.90 V 时 fMAX', 'fMAX at 0.90 V'),
  rdMargin: loc('频率裕量', 'Frequency margin'),
  rdVmin: loc('最低工作电压', 'Min. operating voltage'),
  cells: loc('格', 'cells'),
  yieldTitle: loc('和 Yield、Bin 对上', 'How this ties to yield and bins'),
  yieldBody: loc(
    'Yield（良率）= 进 Bin 1 的颗数 ÷ 总颗数，是在固定测试条件下算出来的。Shmoo 解释这个数字：边缘芯片多，条件一变良率就掉；有空洞的芯片，量产只测一个点就可能漏掉。',
    'Yield = parts in bin 1 ÷ parts tested, measured at fixed test conditions. The Shmoo explains that number: with many marginal chips, yield drops as soon as conditions shift; a chip with a hole can slip through a single-point production test.',
  ),
  takeawayTitle: loc('本课要点', 'Key points'),
  quizTitle: loc('复习题', 'Review'),
  quizNote: loc('选完立刻出对错和解释。', 'You get the answer and explanation right away.'),
  yes: loc('对。', 'Correct. '),
  no: loc('不对。', 'Not quite. '),
  kickerCell: loc('格子', 'Cell'),
  kickerChip: loc('芯片', 'Chip'),
}

export const TAKEAWAY: LText[] = [
  loc('量产钉在几个条件上判 Bin；表征扫出芯片能工作到哪条边界。', 'Production checks a few conditions and bins; characterization maps where the chip stops working.'),
  loc('Shmoo：同一套向量，只改 VDD 和频率，每格一个 Pass / Fail。', 'Shmoo: same vectors, only VDD and frequency change, one pass/fail per cell.'),
  loc(
    'VDD 越高门越快，fMAX 大致随 VDD 线性升高；低于最低工作电压，多慢都 Fail。',
    'Higher VDD makes gates faster, so fMAX rises roughly linearly with VDD; below the minimum operating voltage it fails at any speed.',
  ),
  loc('看边界离规格框多远（裕量），也看边界是否连续（空洞、孤岛要排查）。', 'Check how far the edge is from the spec box (margin) and whether it is continuous (holes and islands need investigation).'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Shmoo 图里每一格的 Pass / Fail 怎么来的？', 'Where does each pass/fail cell in a Shmoo come from?'),
    options: [
      { id: 'guess', text: loc('凭经验涂颜色', 'Coloured by experience') },
      { id: 'same', text: loc('同一套功能向量，只改这一格的 VDD 和频率', 'The same functional vectors, run at that cell’s VDD and frequency') },
      { id: 'os', text: loc('只做开短路', 'Only opens/shorts') },
      { id: 'bin', text: loc('按 Bin 号上色', 'Coloured by bin number') },
    ],
    answer: 'same',
    explain: loc('条件在变，向量和期望值不变。', 'The conditions change; the vectors and expected data do not.'),
  },
  {
    id: 'q2',
    prompt: loc('为什么 VDD 越高，通常能跑的频率越高？', 'Why can a chip usually run faster at higher VDD?'),
    options: [
      { id: 'luck', text: loc('随机的', 'It is random') },
      { id: 'delay', text: loc('驱动电流更大，门延迟变短，信号更早稳定', 'More drive current shortens gate delay, so signals settle sooner') },
      { id: 'scan', text: loc('高电压打开了扫描链', 'High voltage enables the scan chain') },
      { id: 'open', text: loc('高电压能修好开路', 'High voltage repairs opens') },
    ],
    answer: 'delay',
    explain: loc('所以 fMAX 大致随 VDD 线性升高，Pass 区的右边界是一条斜线。', 'So fMAX rises roughly linearly with VDD and the right edge of the pass region slopes.'),
  },
  {
    id: 'q3',
    prompt: loc('VDD 低于某个值以后，频率降到最低也 Fail。为什么？', 'Below a certain VDD, the chip fails even at the lowest frequency. Why?'),
    options: [
      { id: 'vmin', text: loc('低于最低工作电压，电路不能可靠翻转和保持数据', 'Below the minimum operating voltage the circuit cannot switch or hold data reliably') },
      { id: 'fast', text: loc('频率还是太高', 'The frequency is still too high') },
      { id: 'tester', text: loc('测试机坏了', 'The tester is broken') },
      { id: 'bin', text: loc('Bin 设错了', 'The bin is wrong') },
    ],
    answer: 'vmin',
    explain: loc('这条边界是水平的，和速度无关。', 'That edge is horizontal; it has nothing to do with speed.'),
  },
  {
    id: 'q4',
    prompt: loc('规格框里出现一块 Fail 的空洞，四周都 Pass。应该怎么办？', 'A failing hole appears inside the spec box, with passes all around. What should you do?'),
    options: [
      { id: 'ignore', text: loc('框角那一点 Pass 就行，不用管', 'The corner point passes, so ignore it') },
      { id: 'check', text: loc('先排查：间歇性失效、噪声或程序设置问题', 'Investigate: intermittent failure, noise or a program setting') },
      { id: 'raise', text: loc('把规格框改大', 'Enlarge the spec box') },
      { id: 'yield', text: loc('直接算进良率', 'Just count it in yield') },
    ],
    answer: 'check',
    explain: loc('边界不连续，说明结果不可信或芯片有隐患。量产只测一个点会漏掉它。', 'A broken boundary means the result is unreliable or the chip has a latent defect. A single-point production test would miss it.'),
  },
  {
    id: 'q5',
    prompt: loc('边缘芯片的 Pass 区贴着规格框角。它的风险是？', 'A marginal chip’s pass region just touches the spec box corner. What is the risk?'),
    options: [
      { id: 'none', text: loc('没有风险，反正 Pass 了', 'None, it passed') },
      { id: 'margin', text: loc('裕量几乎为零，温度、老化或换测试机就可能 Fail', 'Almost no margin; temperature, aging or a different tester may make it fail') },
      { id: 'faster', text: loc('它比好芯片更快', 'It is faster than a good chip') },
      { id: 'os', text: loc('一定有开路', 'It must have an open') },
    ],
    answer: 'margin',
    explain: loc('表征的价值之一，就是看出「Pass 了，但离悬崖多远」。', 'One value of characterization is seeing how close a passing chip is to the edge.'),
  },
  {
    id: 'q6',
    prompt: loc('Yield 和 Shmoo 的关系？', 'How do yield and the Shmoo relate?'),
    options: [
      { id: 'ok', text: loc('Yield 是固定条件下的通过比例；Shmoo 解释条件一变为什么会翻盘', 'Yield is the pass ratio at fixed conditions; the Shmoo explains why results flip when conditions change') },
      { id: 'swap', text: loc('Shmoo 可以代替 Bin', 'The Shmoo replaces binning') },
      { id: 'same', text: loc('两者是同一个数字', 'They are the same number') },
      { id: 'alu', text: loc('只有 ALU 才有 Yield', 'Only ALUs have yield') },
    ],
    answer: 'ok',
    explain: loc('量产给一个答案，表征画出那道边界。', 'Production gives one answer; characterization draws the boundary.'),
  },
]

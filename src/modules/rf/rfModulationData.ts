import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { constellation, minDistance, NSYM, SCHEMES, type ModAnalysis, type ModState, type Scheme } from './modulationModel'

const f2 = (value: number) => value.toFixed(2)
const D_QPSK = minDistance(constellation('qpsk'))
const D_QAM = minDistance(constellation('qam16'))

export const SCHEME_LABEL: Record<Scheme, LText> = {
  qpsk: loc('QPSK（4 点）', 'QPSK (4 points)'),
  qam16: loc('16QAM（16 点）', '16QAM (16 points)'),
}

/** 调制选项：显示顺序即数组顺序，默认选中 [0] */
export const SCHEME_OPTIONS: Array<{ id: Scheme; label: LText }> = SCHEMES.map((id) => ({ id, label: SCHEME_LABEL[id] }))

export const S = {
  kickerNow: loc('这一次星座', 'This constellation'),
  introTitle: loc('I/Q 两路：两个正交的载波', 'I/Q: two orthogonal carriers'),
  coreTitle: loc('拨一拨：调制方式与 I/Q 失衡', 'Try it: modulation and I/Q imbalance'),
  coreNote: loc(
    '空心 × 是理想点，虚线是判决边界；实心点是接收端看到的符号（每个符号都加了一点噪声）。ε 是 Q 路相对 I 路的增益误差，φ 是 Q 路相对 I 路的相位误差，两者都为 0 时没有失衡。',
    'Hollow × marks are the ideal points and dashed lines are decision boundaries; solid dots are the symbols the receiver sees (each has a little noise). ε is the Q-path gain error relative to I, and φ is the Q-path phase error relative to I; both zero means no imbalance.',
  ),
  schemeLabel: loc('调制方式', 'Modulation'),
  epsLabel: loc('Q 路增益误差 ε (%)', 'Q-path gain error ε (%)'),
  phiLabel: loc('Q 路相位误差 φ (°)', 'Q-path phase error φ (°)'),
  rScheme: loc('调制方式', 'Modulation'),
  rPoints: loc('星座点数（每符号 bit）', 'Points (bits per symbol)'),
  rGain: loc('Q 路增益误差换算', 'Q-path gain error in dB'),
  rDmin: loc('理想点最小间距', 'Minimum spacing of ideal points'),
  rErrors: loc(`判错符号数（共 ${NSYM} 个）`, `Symbol errors (of ${NSYM})`),
  rVerdict: loc('判决结果', 'Decision result'),
  noErr: loc('无判错', 'No errors'),
  hasErr: loc('有判错', 'Errors present'),
  vIdeal: loc('星座与理想一致', 'Constellation matches the ideal'),
  vImbalance: loc('有失衡，还没判错', 'Imbalance present, no errors yet'),
  vBad: loc('已经判错', 'Symbols now misjudged'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的调制还要看滤波成形、功放的非线性（下一课）、载波相位噪声和同步；这一课只练星座和 I/Q 失衡。',
    'Real modulation also involves pulse shaping, amplifier nonlinearity (next lesson), carrier phase noise and synchronisation; this lesson practises only the constellation and I/Q imbalance.',
  ),
  nextPrefix: loc('下一课：', 'Next: '),
  task1: loc('切换到 16QAM，观察 16 个点排成 4×4 的方阵。', 'Switch to 16QAM and see the 16 points arranged as a 4×4 grid.'),
  task2: loc('把 Q 路增益误差调到 15 % 以上，看星座沿 Q 方向被拉长。', 'Raise the Q-path gain error to 15 % or more and watch the constellation stretch along Q.'),
  task3: loc('把 Q 路相位误差调到 10° 以上，看星座斜切成平行四边形。', 'Raise the Q-path phase error to 10° or more and watch the constellation shear into a parallelogram.'),
  task4: loc('在 16QAM 下让至少一个符号判错（红点）。', 'In 16QAM, make at least one symbol misjudged (a red dot).'),
}

export const FIG = {
  constAria: loc(
    '星座图：空心叉是理想点，虚线是判决边界，实心点是接收符号，红色表示判错',
    'Constellation: hollow crosses are ideal points, dashed lines are decision boundaries, solid dots are received symbols, red marks a wrong decision',
  ),
  constCap: loc(
    '空心 × 是理想点，虚线是判决边界（落在哪一块就判成哪个点）。实心点是接收符号，红色表示落进了别的判决区。',
    'Hollow × marks are ideal points and dashed lines are decision boundaries (a symbol is judged as the point whose region it falls in). Solid dots are received symbols; red means it landed in another decision region.',
  ),
}

export const INTRO: LText[] = [
  loc(
    '{@rfDb} 讲的是功率的换算，{@rfSparam} 讲的是阻抗。这一课进入调制：发射机要把比特搬到射频载波上。常见的做法是两路正交的载波，同相路 I 与正交路 Q 各自承载一个幅度，相加以后就是一个带相位的信号。',
    '{@rfDb} covered power conversion and {@rfSparam} covered impedance. This lesson moves to modulation: the transmitter has to put bits onto an RF carrier. A common method uses two orthogonal carriers; the in-phase path I and the quadrature path Q each carry one amplitude, and their sum is one signal with a phase.',
  ),
  loc(
    '基带上每个符号就是平面上的一个点 (I, Q)：横坐标是 I 路的幅度，纵坐标是 Q 路的幅度。所有可能的点构成星座图。这一课只练三件事：认出 QPSK（4 点）和 16QAM（16 点）；切换调制方式，看点的分布和间距；调 I/Q 失衡，看星座怎么变形。',
    'At baseband each symbol is one point (I, Q) on a plane: the horizontal coordinate is the I amplitude and the vertical one is the Q amplitude. All possible points form the constellation. This lesson practises three things: recognise QPSK (4 points) and 16QAM (16 points); switch the modulation and see the layout and spacing; and apply I/Q imbalance and watch the constellation distort.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '星座图只是好看，和误码无关。判决边界和点间距直接决定误码，星座变形就是误码的来源。',
    'A constellation diagram is only for looks and has nothing to do with bit errors. Decision boundaries and point spacing set the error rate, and constellation distortion is where errors come from.',
  ),
  loc(
    'I/Q 失衡只是把图画歪，数据照样能收。变形越过判决边界的符号就会判错，图歪不歪是次要的。',
    'I/Q imbalance just skews the picture, and data still gets through. Symbols pushed across a decision boundary are misjudged; how crooked the picture looks is secondary.',
  ),
  loc(
    '16QAM 比 QPSK 好，因为点多。点多意味着每符号的比特多，但点距变小，对噪声和失真的容忍度也变小。',
    '16QAM is better than QPSK because it has more points. More points means more bits per symbol, but smaller spacing and less tolerance for noise and distortion.',
  ),
]

export const TAKEAWAY: LText = loc(
  `QPSK 每符号 2 bit、4 点，点间距约 ${f2(D_QPSK)}；16QAM 每符号 4 bit、16 点，点间距约 ${f2(D_QAM)}（平均功率都归一化为 1）。Q 路增益误差让星座沿 Q 方向拉伸，相位误差让星座斜切；判决边界把平面分给最近的点，点离边界越近，越容易判错。`,
  `QPSK carries 2 bits per symbol with 4 points at about ${f2(D_QPSK)} spacing; 16QAM carries 4 bits with 16 points at about ${f2(D_QAM)} (both normalised to unit average power). Q-path gain error stretches the constellation along Q and phase error shears it; decision boundaries split the plane among the nearest points, and the closer a point is to a boundary, the sooner it is misjudged.`,
)

function join(parts: LText[]): LText {
  return loc(
    parts.map((part) => part.zh).join(''),
    parts.map((part) => part.en ?? part.zh).join(' '),
  )
}

/** 右侧说明栏：根据星座和判决结果给结论与原因 */
export function verdictOf(state: ModState, a: ModAnalysis): { title: LText; text: LText } {
  const eps = state.epsPct
  const phi = state.phiDeg
  const epsAbs = Math.abs(eps).toFixed(0)
  const phiAbs = Math.abs(phi).toFixed(1)
  const dmin = f2(a.dMin)
  const ideal = eps === 0 && phi === 0
  let title = S.vImbalance
  if (a.errors > 0) {
    title = S.vBad
  } else if (ideal) {
    title = S.vIdeal
  }

  const parts: LText[] = []
  if (ideal) {
    parts.push(loc('没有 I/Q 失衡，接收点只剩一点噪声，所以星座就是理想的点阵。', 'With no I/Q imbalance only a little noise is left, so the constellation is the ideal grid.'))
  }
  if (eps > 0) {
    parts.push(
      loc(
        `Q 路增益偏大 ${epsAbs} %，Q′ = (1+ε)·Q，星座沿 Q 方向被拉长；I 路不变，所以 I 方向的判决边界还在原处。`,
        `The Q-path gain is ${epsAbs} % high: Q′ = (1+ε)·Q, so the constellation stretches along Q; the I path is unchanged, so the decision boundaries along I stay put.`,
      ),
    )
  }
  if (eps < 0) {
    parts.push(
      loc(
        `Q 路增益偏小 ${epsAbs} %，星座沿 Q 方向被压扁，点在 Q 方向上靠近判决边界。`,
        `The Q-path gain is ${epsAbs} % low, so the constellation is squashed along Q and points move closer to the decision boundaries in that direction.`,
      ),
    )
  }
  if (phi !== 0) {
    parts.push(
      loc(
        `Q 路相位偏 ${phiAbs}°，Q′ 里混入了一部分 I 分量，星座沿 I 方向斜切成平行四边形。`,
        `The Q-path phase is off by ${phiAbs}°, so Q′ picks up part of the I component and the constellation shears into a parallelogram.`,
      ),
    )
  }
  if (a.errors > 0) {
    parts.push(
      state.scheme === 'qam16'
        ? loc(
            `${a.errors} 个符号落进了别的判决区。16QAM 的点间距只有 ${dmin}，判决边界离点近，同样的变形更容易越界。`,
            `${a.errors} symbols fall into another decision region. The 16QAM spacing is only ${dmin}, so the boundaries sit close to the points and the same distortion crosses them more easily.`,
          )
        : loc(
            `${a.errors} 个符号落进了别的判决区。QPSK 的点间距为 ${dmin}，这点失衡仍不足以越界。`,
            `${a.errors} symbols fall into another decision region. The QPSK spacing is ${dmin}, and this imbalance is still not enough to cross a boundary.`,
          ),
    )
  } else if (!ideal) {
    parts.push(
      loc(
        `目前还没有符号越界。点间距 ${dmin} 对这点变形还有余量。`,
        `No symbol has crossed a boundary yet. The spacing of ${dmin} still leaves room for this distortion.`,
      ),
    )
  }
  return { title, text: join(parts) }
}

/** 四张任务卡：完成与否由当前设置和星座结果算出 */
export function taskItems(state: ModState, a: ModAnalysis): TaskItem[] {
  return [
    { id: 'qam', text: S.task1, done: state.scheme === 'qam16' },
    { id: 'eps', text: S.task2, done: Math.abs(state.epsPct) >= 15 },
    { id: 'phi', text: S.task3, done: Math.abs(state.phiDeg) >= 10 },
    { id: 'err', text: S.task4, done: state.scheme === 'qam16' && a.errors > 0 },
  ]
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('QPSK 的星座有几个点？每个符号携带几个比特？', 'How many points does the QPSK constellation have, and how many bits does each symbol carry?'),
    options: [
      { id: 'a', text: loc('2 点，1 bit', '2 points, 1 bit') },
      { id: 'b', text: loc('4 点，2 bit', '4 points, 2 bits') },
      { id: 'c', text: loc('8 点，3 bit', '8 points, 3 bits') },
    ],
    answer: 'b',
    explain: loc(
      '4 = 2²，所以 QPSK 有 4 个点，每个点对应 2 bit。16QAM 的 16 = 2⁴，对应 4 bit。',
      '4 = 2², so QPSK has 4 points, each carrying 2 bits. 16QAM has 16 = 2⁴ points and 4 bits.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('平均功率归一化为 1 后，QPSK 与 16QAM 的相邻点间距大约各是多少？', 'With average power normalised to 1, about how far apart are adjacent points in QPSK and in 16QAM?'),
    options: [
      { id: 'a', text: loc('两者都约 1.41', 'Both about 1.41') },
      { id: 'b', text: loc('两者都约 0.63', 'Both about 0.63') },
      { id: 'c', text: loc(`QPSK 约 ${f2(D_QPSK)}，16QAM 约 ${f2(D_QAM)}`, `QPSK about ${f2(D_QPSK)}, 16QAM about ${f2(D_QAM)}`) },
    ],
    answer: 'c',
    explain: loc(
      `QPSK 的 4 点在 (±0.71, ±0.71)，相邻点距离 √2 ≈ ${f2(D_QPSK)}。16QAM 相邻电平差为 2，除以 √10，得 2/√10 ≈ ${f2(D_QAM)}。`,
      `QPSK's 4 points sit at (±0.71, ±0.71), so adjacent points are √2 ≈ ${f2(D_QPSK)} apart. In 16QAM adjacent levels differ by 2, divided by √10, giving 2/√10 ≈ ${f2(D_QAM)}.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('只有 Q 路增益偏大（ε > 0，φ = 0）时，星座会怎样变？', 'If only the Q-path gain is too high (ε > 0, φ = 0), how does the constellation change?'),
    options: [
      { id: 'a', text: loc('整体绕原点旋转', 'Rotates as a whole about the origin') },
      { id: 'b', text: loc('沿 Q 方向拉长成长方形', 'Stretches along Q into a rectangle') },
      { id: 'c', text: loc('整体缩小一半', 'Shrinks uniformly by half') },
    ],
    answer: 'b',
    explain: loc(
      'ε > 0、φ = 0 时 Q′ = (1+ε)·Q，I 不变。Q 坐标被放大，所以网格沿 Q 方向拉成长方形；I 方向的判决边界仍在原处。',
      'With ε > 0 and φ = 0, Q′ = (1+ε)·Q and I is unchanged. The Q coordinates are scaled up, so the grid stretches into a rectangle along Q; the boundaries along I stay where they were.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('Q 路相位误差 φ 让星座怎样变形？', 'How does the Q-path phase error φ distort the constellation?'),
    options: [
      { id: 'a', text: loc('斜切成平行四边形', 'Shears into a parallelogram') },
      { id: 'b', text: loc('整体旋转一个角度', 'Rotates as a whole by an angle') },
      { id: 'c', text: loc('点与点之间的距离都变大', 'All distances between points grow') },
    ],
    answer: 'a',
    explain: loc(
      'φ 让 Q′ = Q·cosφ + I·sinφ：每个点的 Q 坐标多了一项正比于 I 的量，于是方阵沿 I 方向斜切成平行四边形。整体旋转对所有点是同样的偏移，点之间的相对位置不变，不是 I/Q 失衡。',
      'With φ, Q′ = Q·cosφ + I·sinφ: each point gains a Q term proportional to I, so the square shears into a parallelogram. A whole-constellation rotation shifts every point equally and keeps their relative positions, so it is not I/Q imbalance.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('同样的 I/Q 失衡下，哪种调制更容易判错？为什么？', 'Under the same I/Q imbalance, which modulation is more likely to make errors, and why?'),
    options: [
      { id: 'a', text: loc('QPSK，点数少所以敏感', 'QPSK, because it has fewer points and is more sensitive') },
      { id: 'b', text: loc('两者一样，失衡与调制无关', 'Both the same, since imbalance has nothing to do with modulation') },
      { id: 'c', text: loc('16QAM，点间距小，判决边界裕量少', '16QAM, because its spacing is small and there is little margin to the boundaries') },
    ],
    answer: 'c',
    explain: loc(
      `同样的失衡下，16QAM 的点间距只有 ${f2(D_QAM)}，QPSK 是 ${f2(D_QPSK)}。点离判决边界更近，变形更容易越界，所以 16QAM 先判错。`,
      `Under the same imbalance, the 16QAM spacing is only ${f2(D_QAM)} against ${f2(D_QPSK)} for QPSK. Points sit closer to their decision boundaries, so distortion crosses them sooner, and 16QAM errors first.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('为什么 I 路和 Q 路能同时传两个独立的数？', 'Why can the I and Q paths carry two independent numbers at the same time?'),
    options: [
      { id: 'a', text: loc('它们的频率不同', 'Their frequencies differ') },
      { id: 'b', text: loc('它们相差 90°、互相正交，理想情况下互不干扰', 'They differ by 90° and are orthogonal, so ideally they do not interfere') },
      { id: 'c', text: loc('一路传正数，一路传负数', 'One carries positive numbers and the other negative numbers') },
    ],
    answer: 'b',
    explain: loc(
      'I 路与 Q 路的载波相差 90°，在理想情况下互不干扰，因此一个符号可以同时携带两个独立的幅度。',
      'The I and Q carriers differ by 90°, so ideally they do not interfere and one symbol can carry two independent amplitudes.',
    ),
  },
]

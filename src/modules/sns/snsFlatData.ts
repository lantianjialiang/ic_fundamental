import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { prnuMeasured } from './core/sensor'
import { FLAT_FOCUS, type FlatAnalysis, type FlatFocus, type FlatState } from './snsFlatModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const f1 = (n: number) => n.toFixed(1)
const f2 = (n: number) => n.toFixed(2)
const f3 = (n: number) => n.toFixed(3)

const QUIZ_SIGMA = 0.008
const QUIZ_PRNU = 0.01
const QUIZ_N = 4
const QUIZ_MEAS = prnuMeasured(QUIZ_PRNU, QUIZ_SIGMA, QUIZ_N) * 100
const QUIZ_SHARE = ((QUIZ_SIGMA * QUIZ_SIGMA) / QUIZ_N / (QUIZ_PRNU * QUIZ_PRNU)) * 100

export const FOCUS_OPTIONS = FLAT_FOCUS.map((id) => ({
  id,
  label:
    id === 'prnu'
      ? loc('PRNU', 'PRNU')
      : id === 'shading'
        ? loc('shading', 'Shading')
        : id === 'defect'
          ? loc('缺陷', 'Defects')
          : loc('线性度', 'Linearity'),
}))

const pct = (fraction: number) => (fraction * 100).toFixed(2)

function closeCount(got: number, want: number): boolean {
  return Math.abs(got - want) <= Math.max(2, Math.round(want * 0.3))
}

export const S = {
  kickerNow: loc('这一次亮场', 'This bright frame'),
  introTitle: loc('PRNU、shading、线性度与缺陷', 'PRNU, shading, linearity and defects'),
  coreTitle: loc('拨一拨：平场、阈值与非线性', 'Try it: flat field, thresholds and nonlinearity'),
  coreNote: loc(
    'PRNU 用没有缺陷像素的平场来算，这是量产里先挖掉坏点再算不均匀的做法。热图和缺陷图仍来自带缺陷的 VDUT-CIS1。画面 64×64。公式：PRNU_meas^2 = PRNU^2 + (σt/μ)^2 / N。shading 是左右渐变，不是像素级 PRNU。',
    'PRNU is computed on a flat field with defective pixels left out, the same order production uses: remove bad pixels, then measure non-uniformity. The heat map and the defect map still come from VDUT-CIS1 with its defects. The frame is 64x64. Formula: PRNU_meas^2 = PRNU^2 + (st/mu)^2 / N. Shading is a left-to-right ramp. It is not pixel PRNU.',
  ),
  callout: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  prnuLabel: loc('真 PRNU', 'True PRNU'),
  shadeLabel: loc('shading', 'Shading'),
  nLabel: loc('平均帧数 N', 'Frames to average, N'),
  deadLabel: loc('死点阈值（相对中位数）', 'Dead threshold (fraction of the median)'),
  lowLabel: loc('低灵敏阈值（相对中位数）', 'Low-sensitivity threshold (fraction of the median)'),
  hotLabel: loc('热点阈值（暗场 DN）', 'Hot threshold (dark DN)'),
  nlLabel: loc('非线性系数', 'Nonlinearity'),
  darkLabel: loc('做暗场校正', 'Apply dark correction'),
  shadeToggle: loc('去掉 shading', 'Remove shading'),
  focusLabel: loc('侧栏看哪一项', 'What the side panel explains'),
  rShown: loc('当前汇报的 PRNU', 'PRNU being reported'),
  rOn: loc('去掉 shading 后的 PRNU', 'PRNU with shading removed'),
  rOff: loc('留下 shading 的 PRNU', 'PRNU with shading kept'),
  rShare: loc('时间项占真 PRNU 平方的比例', 'Temporal term as a fraction of true PRNU squared'),
  rFormula: loc('公式给出的 PRNU_meas', 'PRNU_meas from the formula'),
  rSigma: loc('单帧 σt/μ', 'Single-frame st/mu'),
  rDead: loc('死点：分类 / 掩膜', 'Dead: classified / mask'),
  rHot: loc('热点：分类 / 掩膜', 'Hot: classified / mask'),
  rLow: loc('低灵敏：分类 / 掩膜', 'Low: classified / mask'),
  rCluster: loc('缺陷簇', 'Defect clusters'),
  rDev: loc('10%–90% 最大偏差', 'Max deviation in the 10%–90% window'),
  rExp: loc('偏差最大的曝光', 'Exposure at the largest deviation'),
  legDead: loc('死点', 'Dead'),
  legHot: loc('热点', 'Hot'),
  legLow: loc('偏低', 'Low'),
  legOk: loc('正常', 'OK'),
  frameAria: loc('亮场伪彩图，亮度高的像素更亮', 'Bright-field heat map. Brighter pixels are higher signal.'),
  frameCap: loc('带缺陷的平均亮帧。汇报的 PRNU 是 {prnu}%。', 'Averaged bright frame with defects. The reported PRNU is {prnu}%.'),
  mapAria: loc('缺陷分类图：蓝色死点，金色热点，紫色低灵敏', 'Defect map: blue dead, gold hot, purple low-sensitivity.'),
  mapCap: loc('死点 {d}，热点 {h}，低灵敏 {l}，簇 {k}。', 'Dead {d}, hot {h}, low {l}, clusters {k}.'),
  linAria: loc('平均 DN 对曝光的曲线，金色是 10% 到 90% 窗口里的拟合直线', 'Mean DN versus exposure. The gold line is the fit inside the 10% to 90% window.'),
  linCap: loc('蓝点是各档曝光。金色大点是偏差最大的那一档。', 'Blue points are the exposure steps. The large gold point is the step with the largest deviation.'),
  axX: loc('曝光 t（s）', 'Exposure t (s)'),
  axY: loc('均值 DN', 'Mean DN'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '光源自己的不均匀会加进测得的 PRNU，下一课用光学系统把它拆开。',
    'Non-uniformity of the source itself adds into the measured PRNU. The next lesson splits that out with the optical system.',
  ),
  next: loc('下一课：颜色与光学系统', 'Next: Color and the optical system'),
  task1: loc(
    '加大 N，直到时间项 (σt/μ)^2 / N 不到真 PRNU 平方的 10%。公式写在本节说明里。',
    'Raise N until the temporal term (st/mu)^2 / N is under 10% of the true PRNU squared. The formula is in the note for this section.',
  ),
  task2: loc('打开“去掉 shading”，看汇报的 PRNU 和留下渐变时的读数差多少。', 'Turn on “Remove shading” and read how the reported PRNU differs from the value that still includes the ramp.'),
  task3: loc(
    '把死点阈值调到约 0.15、低灵敏约 0.5、热点约 500 DN，使三类计数接近掩膜。',
    'Set the dead threshold near 0.15, the low-sensitivity threshold near 0.5 and the hot threshold near 500 DN, so the three counts sit close to the mask.',
  ),
  task4: loc(
    '加大非线性，直到 10%–90% 窗口的最大偏差超过 1%，并读出那一档曝光。',
    'Raise the nonlinearity until the max deviation inside the 10%–90% window is over 1%, and read which exposure that is.',
  ),
  vPrnu: loc('时间噪声会抬高测得的 PRNU', 'Temporal noise raises the measured PRNU'),
  vShade: loc('shading 不是 PRNU', 'Shading is not PRNU'),
  vDef: loc('三类缺陷要分开数', 'Count the three defect types separately'),
  vLin: loc('最大偏差标出该看的那一档曝光', 'The max deviation marks the exposure to look at'),
  vPrnuText: loc(
    '真 PRNU 是 {true}%，公式 PRNU_meas = {formula}%（σt/μ = {sig}，N = {n}）。时间项占真值平方的 {share}%。原因：PRNU_meas^2 = PRNU^2 + (σt/μ)^2 / N，N 不够时第二项还没有落到真值的 10% 以下。',
    'True PRNU is {true}%. The formula gives PRNU_meas = {formula}% (st/mu = {sig}, N = {n}). The temporal term is {share}% of the true value squared. Reason: PRNU_meas^2 = PRNU^2 + (st/mu)^2 / N. Until N is large enough, the second term is still more than 10% of the true value squared.',
  ),
  vShadeText: loc(
    '去掉平面后 PRNU 是 {on}%，留下左右渐变时是 {off}%。原因：shading 是整幅画面的低阶斜坡，像素级 PRNU 是把这个斜坡扣掉之后的相对标准差。当前去掉 shading 的开关是 {flag}。',
    'PRNU with the plane removed is {on}%. With the left-to-right ramp kept, it is {off}%. Reason: shading is a low-order slope across the frame. Pixel PRNU is the relative standard deviation after that slope is taken out. The shading-removal switch is {flag}.',
  ),
  vDefText: loc(
    '掩膜是死点 {md}、热点 {mh}、低灵敏 {ml}；分类结果是 {cd}、{ch}、{cl}，簇 {k} 个。原因：死点和低灵敏看亮场减暗场之后相对中位数的比例，热点看暗场的绝对 DN，簇是上下左右连在一起的缺陷。',
    'The mask has {md} dead, {mh} hot and {ml} low pixels. Classification reports {cd}, {ch} and {cl}, in {k} clusters. Reason: dead and low-sensitivity use the bright-minus-dark response as a fraction of the median, hot uses absolute dark DN, and a cluster is defects that touch on the four neighbors.',
  ),
  vLinText: loc(
    '非线性系数 {nl} 时，10%–90% 窗口里相对拟合直线的最大偏差是 {dev}%，出现在曝光 {exp} s。原因：二阶项把响应压离直线，偏差超过 1% 的那一档就是这个窗口里最该看的曝光。',
    'At nonlinearity {nl}, the largest deviation from the fitted line inside the 10%–90% window is {dev}%, at an exposure of {exp} s. Reason: the second-order term pulls the response off the straight line. The exposure where the deviation exceeds 1% is the one to look at inside this window.',
  ),
}

export const INTRO = [
  loc(
    '亮场用一块尽量均匀的光把像素照到中间信号。PRNU 是去掉暗信号、去掉时间噪声之后的空间标准差除以均值。只拍一帧时，时间噪声还留在估计里：PRNU_meas^2 = PRNU^2 + (σt/μ)^2 / N。',
    'A bright test lights the pixels to a mid-level signal with a field that is as even as possible. PRNU is the spatial standard deviation divided by the mean, after dark signal and temporal noise are removed. With too few frames, temporal noise stays in the estimate: PRNU_meas^2 = PRNU^2 + (st/mu)^2 / N.',
  ),
  loc(
    'shading 是从画面一边到另一边的缓变，常用一个平面把它扣掉。扣掉之后剩下的才是像素和像素之间的 PRNU。把 shading 算进 PRNU，会把光源或镜头的渐变记到器件头上。',
    'Shading is a slow change from one side of the frame to the other. A plane fit takes it out. What remains is the pixel-to-pixel PRNU. Folding shading into PRNU charges the device for a ramp that came from the source or the lens.',
  ),
  loc(
    '缺陷按响应来分：死点几乎没有信号，低灵敏只有正常像素的一小部分，热点在暗场里就已经很亮。连在一起的缺陷算一簇。线性度看 10% 到 90% 满幅这一段里，离最佳直线最远的相对偏差。',
    'Defects are split by response. A dead pixel has almost no signal, a low-sensitivity pixel has only a fraction of a normal pixel, and a hot pixel is already bright in the dark. Defects that touch count as one cluster. Linearity is the largest relative miss from the best straight line between 10% and 90% of full scale.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '一帧就能测 PRNU。一帧的空间标准差里还有时间噪声。N 太小的时候，(σt/μ)^2 / N 可以和真 PRNU 的平方差不多大。',
    'One frame is enough to measure PRNU. The spatial standard deviation of one frame still contains temporal noise. When N is small, (st/mu)^2 / N can be as large as the true PRNU squared.',
  ),
  loc(
    'shading 就是 PRNU。shading 是低阶渐变，PRNU 是去掉这个渐变之后像素之间的相对起伏。',
    'Shading is PRNU. Shading is a low-order ramp. PRNU is the pixel-to-pixel variation that remains after that ramp is removed.',
  ),
  loc(
    '缺陷只看单个像素亮不亮。相邻的坏点会连成簇，分级通常对簇另有一条规则。',
    'A defect is only whether one pixel is bright or dark. Neighboring bad pixels form a cluster, and grading usually has a separate rule for clusters.',
  ),
]

export const TAKEAWAY: LText = loc(
  'PRNU_meas^2 = PRNU^2 + (σt/μ)^2 / N。shading 用平面扣掉，不并进像素 PRNU。线性度取 10%–90% 窗口里相对直线的最大偏差。死点、热点、低灵敏用不同的阈值，簇按相邻关系合并。',
  'PRNU_meas^2 = PRNU^2 + (st/mu)^2 / N. Shading is removed with a plane and is not folded into pixel PRNU. Linearity is the largest relative deviation from a straight line inside the 10%–90% window. Dead, hot and low-sensitivity pixels use different thresholds, and clusters are merged by neighborhood.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '真 PRNU = 1%，单帧 σt/μ = 0.008，N = 4。公式给出的 PRNU_meas 大约是多少？',
      'True PRNU = 1%, single-frame st/mu = 0.008, N = 4. About what PRNU_meas does the formula give?',
    ),
    options: [
      { id: 'a', text: loc('1.000%', '1.000%') },
      { id: 'b', text: loc(`${f3(QUIZ_MEAS)}%`, `${f3(QUIZ_MEAS)}%`) },
      { id: 'c', text: loc('1.800%', '1.800%') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        'PRNU_meas = sqrt(0.01^2 + 0.008^2 / 4) = {v}%。时间项把测得值抬到真值上面。',
        'PRNU_meas = sqrt(0.01^2 + 0.008^2 / 4) = {v}%. The temporal term lifts the measured value above the true one.',
      ),
      { v: f3(QUIZ_MEAS) },
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '同样是 PRNU = 1%、σt/μ = 0.008、N = 4。时间项 (σt/μ)^2 / N 占真 PRNU 平方的百分之多少？',
      'Same case: PRNU = 1%, st/mu = 0.008, N = 4. What percent of the true PRNU squared is the temporal term (st/mu)^2 / N?',
    ),
    options: [
      { id: 'a', text: loc(`${f1(QUIZ_SHARE)}%`, `${f1(QUIZ_SHARE)}%`) },
      { id: 'b', text: loc('4.0%', '4.0%') },
      { id: 'c', text: loc('80%', '80%') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '(0.008^2 / 4) / 0.01^2 = {v}%。要让这项低于 10%，得继续加大 N。',
        '(0.008^2 / 4) / 0.01^2 = {v}%. To bring this term under 10%, N has to go higher.',
      ),
      { v: f1(QUIZ_SHARE) },
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '关于 PRNU 和 shading，下列哪些说法正确？(1) shading 是低阶渐变；(2) 去掉平面后的相对标准差才是像素 PRNU；(3) shading 应当加进 PRNU 指标；(4) 一帧的空间标准差里还有时间噪声。',
      'Which statements about PRNU and shading are correct? (1) Shading is a low-order ramp; (2) pixel PRNU is the relative standard deviation after the plane is removed; (3) shading should be added into the PRNU number; (4) the spatial standard deviation of one frame still contains temporal noise.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(3) 把两件不同的事加在一起了。渐变来自光路或镜头时，不该记成像素的 PRNU。',
      '(3) adds two different things together. A ramp that comes from the light path or the lens should not be recorded as pixel PRNU.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于缺陷分类，下列哪些说法正确？(1) 死点的亮场响应接近 0；(2) 热点主要看暗场 DN；(3) 低灵敏是响应偏低但还没有死；(4) 簇只按缺陷总数来判，不看它们是否相邻。',
      'Which statements about defect classification are correct? (1) A dead pixel has a bright-field response near 0; (2) a hot pixel is judged mainly from dark DN; (3) low sensitivity means the response is low but the pixel is not dead; (4) a cluster is judged only by the total defect count, ignoring whether the pixels touch.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(3)', '(1), (2), (3)') },
      { id: 'b', text: loc('(1)、(4)', '(1), (4)') },
      { id: 'c', text: loc('(2)、(3)、(4)', '(2), (3), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(4) 漏了相邻这一条。簇是上下左右连在一起的缺陷，分级常常因此把器件降一档。',
      '(4) leaves out the neighborhood rule. A cluster is defects that touch up, down, left or right, and grading often drops a part one grade because of it.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('线性度的 10%–90% 窗口在比什么？', 'What does the 10%–90% linearity window compare?'),
    options: [
      { id: 'a', text: loc('每个曝光点和最佳直线的相对偏差，取其中最大的', 'The relative deviation of each exposure from the best straight line, and then the largest of those') },
      { id: 'b', text: loc('最亮和最暗两个点的比值', 'The ratio of the brightest point to the darkest point') },
      { id: 'c', text: loc('PRNU 和 shading 的差', 'The difference between PRNU and shading') },
    ],
    answer: 'a',
    explain: loc(
      '在峰值的 10% 到 90% 这一段里做直线拟合，再找相对偏差最大的那一档曝光。饱和区通常不放进这个窗口。',
      'Fit a straight line between 10% and 90% of the peak, then find the exposure with the largest relative deviation. The saturated region is usually kept out of this window.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('暗场校正开关改变的是哪一项？', 'What does the dark-correction switch change?'),
    options: [
      { id: 'a', text: loc('从亮帧里减去暗帧，再算 PRNU', 'It subtracts the dark frames from the bright frames before PRNU is computed') },
      { id: 'b', text: loc('把真 PRNU 旋钮直接设成 0', 'It sets the true-PRNU knob to 0') },
      { id: 'c', text: loc('把缺陷掩膜清掉', 'It clears the defect mask') },
    ],
    answer: 'a',
    explain: loc(
      'PRNU 要用信号，不该把黑电平和暗电流的空间图案留在分子里。减暗帧是这一步。它不改变注入的缺陷，也不代替去掉 shading。',
      'PRNU should use the signal. Black level and the spatial pattern of dark current should not stay in the numerator. Subtracting the dark frame is that step. It does not change the injected defects, and it does not replace shading removal.',
    ),
  },
  {
    id: 'q7',
    prompt: loc(
      '关于帧平均，下列哪些说法正确？(1) N 越大，时间项越小；(2) N 能把 shading 消掉；(3) 时间项和真 PRNU 按平方相加；(4) 缺陷像素是固定图案，平均去不掉。',
      'Which statements about frame averaging are correct? (1) A larger N makes the temporal term smaller; (2) N removes shading; (3) the temporal term and the true PRNU add as squares; (4) defective pixels are a fixed pattern, and averaging does not remove them.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)、(4)', '(1), (3), (4)') },
      { id: 'b', text: loc('(2)、(3)', '(2), (3)') },
      { id: 'c', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(2) 错了。shading 每帧都在，平均去不掉，要靠平面拟合。时间噪声才随 N 下降。',
      '(2) is wrong. Shading is present in every frame, so averaging does not remove it. A plane fit does. Temporal noise is what falls with N.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('热点为什么不和死点用同一条“相对中位数”的规则？', 'Why does a hot pixel not use the same “fraction of the median” rule as a dead pixel?'),
    options: [
      { id: 'a', text: loc('热点在亮场里响应往往并不低，它的问题出在暗场已经偏高', 'A hot pixel often still responds in the bright field. Its problem is that the dark frame is already high') },
      { id: 'b', text: loc('热点一定是一整列，不能按像素看', 'A hot pixel is always a whole column, so it cannot be judged per pixel') },
      { id: 'c', text: loc('热点只在彩色通道里出现', 'Hot pixels appear only in a color channel') },
    ],
    answer: 'a',
    explain: loc(
      '死点和低灵敏是亮场响应不够。热点是暗电流太大，所以用暗场的绝对 DN 来抓。两类阈值对调就会漏检。',
      'Dead and low-sensitivity pixels do not respond enough in the bright field. A hot pixel has too much dark current, so it is caught with an absolute dark DN. Swapping the two thresholds misses one of them.',
    ),
  },
]

export function taskItems(state: FlatState, a: FlatAnalysis): TaskItem[] {
  const countsClose =
    closeCount(a.counts.dead, a.mask.dead) && closeCount(a.counts.hot, a.mask.hot) && closeCount(a.counts.low, a.mask.low)
  return [
    { id: 'n-share', text: S.task1, done: Number.isFinite(a.temporalShare) && a.temporalShare < 0.1 },
    { id: 'shade-off', text: S.task2, done: state.removeShading },
    { id: 'classify', text: S.task3, done: countsClose && a.mask.hot > 0 && a.mask.low > 0 },
    { id: 'lin-1', text: S.task4, done: a.maxDevPct > 1 },
  ]
}

export function verdictOf(state: FlatState, a: FlatAnalysis): { title: LText; text: LText } {
  const share = Number.isFinite(a.temporalShare) ? f1(a.temporalShare * 100) : '—'
  const common = {
    true: f2(state.prnuPct),
    formula: f2(a.prnuFormula * 100),
    sig: f3(a.sigmaOverMu),
    n: String(state.nAvg),
    share,
    on: pct(a.prnuOn),
    off: pct(a.prnuOff),
    flag: state.removeShading ? 'ON' : 'OFF',
    md: String(a.mask.dead),
    mh: String(a.mask.hot),
    ml: String(a.mask.low),
    cd: String(a.counts.dead),
    ch: String(a.counts.hot),
    cl: String(a.counts.low),
    k: String(a.clusters),
    nl: f3(state.nonlin),
    dev: f2(a.maxDevPct),
    exp: f3(a.exposures[a.atIndex] ?? 0),
  }
  const text: Record<FlatFocus, LText> = {
    prnu: fill(S.vPrnuText, common),
    shading: fill(S.vShadeText, common),
    defect: fill(S.vDefText, common),
    linear: fill(S.vLinText, common),
  }
  const title: Record<FlatFocus, LText> = { prnu: S.vPrnu, shading: S.vShade, defect: S.vDef, linear: S.vLin }
  return { title: title[state.focus], text: text[state.focus] }
}

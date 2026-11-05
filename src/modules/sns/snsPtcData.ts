import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { varRelError } from './core/frames'
import { MODE_IDS, ptcFlags, type ModeId, type PtcAnalysis, type PtcState } from './snsPtcModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const MODE_LABEL: Record<ModeId, LText> = {
  diff: loc('差帧', 'Difference'),
  single: loc('单帧', 'Single frame'),
}

export const MODE_OPTIONS = MODE_IDS.map((id) => ({ id, label: MODE_LABEL[id] }))

function fmtK(k: number): string {
  return Number.isFinite(k) ? k.toFixed(2) : '--'
}

export const S = {
  teach: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  kickerNow: loc('这一条 PTC', 'This PTC'),
  introTitle: loc('用图像反推 K', 'Recover K from images'),
  coreTitle: loc('练一练：差帧和 ROI', 'Practice: difference frames and the ROI'),
  coreNote: loc(
    'VDUT-CIS1 的帧是 128×128，曝光点不超过 12。每个点采两帧。差帧用 var(f1−f2)/2，固定图案被减掉，斜率的倒数是 K。单帧改用 f1 自己的方差，PRNU 留在里面，斜率变大，K 偏小。初值是差帧、PRNU = 0、ROI 边长 32、K = 8；要把 ROI 加大，K 估计才会稳到 3% 以内。',
    'A VDUT-CIS1 frame here is 128 by 128, with at most 12 exposure points. Each point takes two frames. Difference mode uses var(f1-f2)/2, so fixed pattern cancels and K is the reciprocal of the slope. Single-frame mode uses the variance of f1 alone, so PRNU stays in and the slope rises, which makes K low. The start is difference mode, PRNU = 0, ROI side 32, and K = 8; enlarge the ROI before the K estimate settles within 3%.',
  ),
  kLabel: loc('真值 K', 'True K'),
  readLabel: loc('读出噪声', 'Read noise'),
  fwcLabel: loc('满阱', 'Full well'),
  prnuLabel: loc('PRNU', 'PRNU'),
  pointsLabel: loc('曝光点数', 'Exposure points'),
  roiLabel: loc('ROI 边长', 'ROI side'),
  modeLabel: loc('方差怎么算', 'How variance is taken'),
  rK: loc('K 估计', 'K estimate'),
  rRead: loc('读出噪声估计', 'Read-noise estimate'),
  rFwc: loc('满阱估计', 'Full-well estimate'),
  rDr: loc('动态范围', 'Dynamic range'),
  rSnr: loc('SNR 最大', 'SNR max'),
  rRel: loc('K 相对误差', 'K relative error'),
  rVar: loc('方差相对误差', 'Variance relative error'),
  frameAria: loc('一帧灰度图，亮暗表示 DN', 'One grayscale frame; brightness is DN'),
  plotAria: loc('光子传递曲线，横轴对数均值，纵轴对数方差，金线是拟合', 'Photon transfer curve, log mean versus log variance, with a gold fit'),
  plotX: loc('均值', 'mean'),
  plotY: loc('方差', 'var'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc('暗场把时间噪声和 DSNU 分开，亮场再看 PRNU。这一课只把 K、读噪和满阱从 PTC 里读出来。', 'The dark test separates temporal noise from DSNU, and the bright test looks at PRNU. This lesson only reads K, read noise, and full well from the PTC.'),
  next: loc('下一课：暗场测试：暗电流、DSNU 与热像素', 'Next: Dark test: dark current, DSNU and hot pixels'),
  task1: loc(
    '使用差帧，并把 ROI 边长调到 96 或以上，让 K 估计相对真值的误差小于 3%。初值 ROI = 32 时方差太晃，还达不到。',
    'Use difference frames and set the ROI side to 96 or more so the K estimate stays within 3% of the true value. The starting ROI of 32 is too noisy to get there.',
  ),
  task2: loc(
    '改成单帧方差，并把 PRNU 调到 0.02 或以上。固定图案留在方差里，斜率变大，K 会被拉低。',
    'Switch to single-frame variance and set PRNU to 0.02 or higher. Fixed pattern stays in the variance, the slope rises, and K is pulled low.',
  ),
  task3: loc(
    '把满阱旋钮调到 20000 e-，扫描里要有一个达到满阱的亮点，并且满阱估计落在旋钮的 20% 以内。差帧且 PRNU 不高时可以做到；单帧加上 PRNU 后估计会离开这个范围。',
    'Set the full-well knob to 20000 e-. The sweep needs a bright point that reaches full well, and the full-well estimate must stay within 20% of the knob. Difference frames and low PRNU can do this. Single-frame variance plus PRNU pushes the estimate out of that band.',
  ),
  task4: loc(
    '把 ROI 边长调到 100 或以上，使方差估计的相对误差 √(2/(n−1)) 低于 2%。n 是 ROI 的像素数。',
    'Set the ROI side to 100 or more so the relative error of the variance estimate, sqrt(2/(n-1)), is below 2%. n is the pixel count of the ROI.',
  ),
  diffTitle: loc('差帧：K 来自散粒噪声斜率', 'Difference frames: K comes from the shot-noise slope'),
  singleTitle: loc('单帧：方差里还有 PRNU', 'Single frame: PRNU is still in the variance'),
  diffWhy: loc(
    '原因：两帧相减再除以 2，不随时间变化的 FPN 和 PRNU 被消掉，剩下的方差对均值的斜率是 1/K。当前 K 估计 {k}，真值 {kt}，相对误差 {rel}%。满阱估计 {fwc}，旋钮 {fk}。ROI {side} 像素的方差相对误差约 {ve}%。',
    'Reason: subtracting the two frames and dividing by 2 cancels FPN and PRNU, which do not change with time, and the slope of variance versus mean is 1/K. K estimate is {k} now, the true value is {kt}, and the relative error is {rel}%. Full-well estimate is {fwc}, the knob is {fk}. The variance relative error on {side} ROI pixels is about {ve}%. ',
  ),
  singleWhy: loc(
    '原因：单帧方差还包含像素之间的 PRNU。PRNU 越大，方差被抬得越高，斜率越大，K = 1/斜率就越小。当前 PRNU = {prnu}，K 估计 {k}，真值 {kt}，相对误差 {rel}%。满阱估计 {fwc}（旋钮 {fk}）。ROI {side} 像素的方差相对误差约 {ve}%。',
    'Reason: single-frame variance still contains PRNU between pixels. A larger PRNU inflates the variance, the slope gets steeper, and K = 1/slope comes out low. PRNU is {prnu} now, the K estimate is {k}, the true value is {kt}, and the relative error is {rel}%. Full-well estimate is {fwc} (knob {fk}). The variance relative error on {side} ROI pixels is about {ve}%. ',
  ),
}

export function frameSummary(a: PtcAnalysis): LText {
  return fill(
    loc(
      '图是整帧 {w}×{w} 里的一档中等曝光，统计用左上角 {side}×{side} 的 ROI，平均 DN 约 {mean}。饱和与拟合数字见右侧和 PTC 图。',
      'The picture is one mid exposure of the full {w} by {w} frame. Statistics use the {side} by {side} ROI at the top left, with a mean of about {mean} DN. Saturation and the fit are in the readouts and the PTC plot.',
    ),
    { w: String(a.w), side: String(a.roi.w), mean: a.previewMean.toFixed(1) },
  )
}

export function plotSummary(a: PtcAnalysis): LText {
  return fill(
    loc(
      '蓝点是各曝光的均值和方差（对数坐标），金线斜率的倒数是 K。当前斜率 {slope}，K 估计 {k}。方差掉下去的亮端是饱和，用来读满阱。',
      'Blue points are mean and variance at each exposure (log axes). K is the reciprocal of the gold slope. The slope is {slope} now and the K estimate is {k}. The bright end where variance falls is saturation, which is where full well is read.',
    ),
    { slope: a.slope.toFixed(4), k: fmtK(a.k) },
  )
}

export const INTRO = [
  loc(
    '光子传递曲线在每个曝光采两帧。均值是两帧 ROI 平均再减去暗场，方差是两帧之差的方差除以 2。散粒噪声区里，DN 的方差 = 均值 / K + 读出噪声方差，所以 K = 1 / 斜率。K（e-/DN）和转换增益 CG（V/e-）的关系是 K = Vref / (2^N · CG)。暗端的截距给出读出噪声，方差掉下去的位置是饱和，满阱 = 饱和均值 × K。',
    'A photon transfer curve takes two frames at each exposure. The mean is the average of the two ROI means minus the dark mean, and the variance is the variance of the frame difference divided by 2. In the shot-noise region the DN variance equals mean / K plus the read-noise variance, so K = 1 / slope. K (e-/DN) and conversion gain CG (V/e-) are related by K = Vref / (2^N · CG). The intercept at the dark end gives read noise. Where the variance falls off is saturation, and full well = saturated mean times K.',
  ),
  loc(
    '动态范围是满阱电子数除以读出噪声，SNR 的最大值约是 √满阱。方差估计自己也有误差，大约 √(2/(n−1))，n 是 ROI 像素数，所以 ROI 不能太小。单帧方差把 PRNU 和 FPN 算了进去，斜率偏大，K 偏小。量产往往只抽几个曝光点，整条曲线留在特性化里做。',
    'Dynamic range is full-well electrons divided by read noise, and the maximum SNR is about the square root of full well. The variance estimate has its own error, about sqrt(2/(n-1)), where n is the ROI pixel count, so the ROI cannot be tiny. Single-frame variance includes PRNU and FPN, the slope comes out high, and K comes out low. Production test often samples only a few exposures and leaves the full curve to characterization.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '方差除以均值就是增益。那只在读出噪声可以忽略、而且方差里没有固定图案时才接近 1/K。正规做法是对一段散粒噪声区做直线，取斜率的倒数。',
    'Variance divided by the mean is the gain. That is close to 1/K only when read noise is negligible and the variance contains no fixed pattern. The proper method fits a line through the shot-noise region and takes the reciprocal of the slope.',
  ),
  loc(
    'ROI 越小越好，看起来更“局部”。像素太少时方差估计的相对误差 √(2/(n−1)) 会很大，K 跟着晃。边长 100 大约是 1 万像素，相对误差约 1.4%。',
    'A smaller ROI is better because it looks more local. With too few pixels the relative error of the variance, sqrt(2/(n-1)), gets large and K wanders. A side of 100 is about 10000 pixels and a relative error near 1.4%.',
  ),
  loc(
    '一个曝光点就够画出 PTC。一个点定不了斜率和饱和拐点。至少要有一段散粒噪声区和一个开始饱和的亮点，满阱才读得出来。',
    'One exposure point is enough to draw a PTC. One point cannot set both the slope and the saturation knee. You need a shot-noise stretch and a bright point that has started to saturate before full well can be read.',
  ),
]

export const TAKEAWAY: LText = loc(
  '差帧 PTC：方差 = 均值 / K + 读噪方差，K = 1 / 斜率。满阱 = 饱和均值 × K，动态范围 = 满阱 / 读噪，SNR 最大约 √满阱。单帧方差含 PRNU，K 偏小。方差相对误差约 √(2/(n−1))。',
  'Difference-frame PTC: variance = mean / K + read-noise variance, and K = 1 / slope. Full well = saturated mean times K, dynamic range = full well / read noise, and maximum SNR is about sqrt(full well). Single-frame variance includes PRNU and makes K low. The relative variance error is about sqrt(2/(n-1)).',
)

const VE = varRelError(10000) * 100
const VE_TXT = VE.toFixed(2)
const VE_LO = (VE * 0.85).toFixed(2)
const VE_HI = (VE * 1.15).toFixed(2)
const FWC = 20000
const FWC_LO = '18000'
const FWC_HI = '22000'

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('差帧法 PTC 在每个曝光点上，方差是怎样得到的？', 'In a difference-frame PTC, how is the variance obtained at each exposure?'),
    options: [
      { id: 'a', text: loc('只采一帧，用这一帧的空间方差', 'Take one frame and use that frame spatial variance') },
      { id: 'b', text: loc('采两帧，用两帧之差的方差除以 2', 'Take two frames and use the variance of their difference divided by 2') },
      { id: 'c', text: loc('采两帧相加，再用平均图的方差', 'Add two frames and use the variance of the average image') },
    ],
    answer: 'b',
    explain: loc(
      '两帧里相同的固定图案相减变成 0，剩下的时间噪声方差要除以 2，才回到单帧的时间噪声。单帧空间方差会把 PRNU 算进去。',
      'Fixed pattern that is the same in both frames subtracts to 0. The remaining temporal variance is divided by 2 to get back to the temporal noise of one frame. The spatial variance of a single frame includes PRNU.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '关于 PTC 的斜率，下列哪些说法正确？(1) 散粒噪声区的斜率是 1/K；(2) 差帧能去掉 FPN 和 PRNU；(3) 单帧方差会使斜率变大、K 变小；(4) 斜率就是 K 本身。',
      'Which statements about the PTC slope are correct? (1) the slope in the shot-noise region is 1/K; (2) a frame difference removes FPN and PRNU; (3) single-frame variance makes the slope larger and K smaller; (4) the slope is K itself.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(3)', '(1), (2), (3)') },
      { id: 'b', text: loc('(1)、(4)', '(1), (4)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '方差对均值的斜率是 1/K，所以 K 是斜率的倒数，不是斜率本身。(4) 把这两步弄反了。单帧把 PRNU 加进方差，斜率偏大，K 偏小。',
      'The slope of variance versus mean is 1/K, so K is the reciprocal of the slope, not the slope itself. (4) swaps those two steps. A single frame adds PRNU into the variance, the slope comes out high, and K comes out low.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('散粒噪声区拟合得到的斜率是 0.10（方差对均值）。K 是多少 e-/DN？', 'The fit in the shot-noise region has slope 0.10 (variance versus mean). What is K in e-/DN?'),
    options: [
      { id: 'a', text: loc('8', '8') },
      { id: 'b', text: loc('10', '10') },
      { id: 'c', text: loc('12', '12') },
    ],
    answer: 'b',
    explain: loc(
      'K = 1 / 斜率 = 1 / 0.10 = 10。8 和 12 是同一倒数附近差了 20% 的数，不是斜率本身。',
      'K = 1 / slope = 1 / 0.10 = 10. 8 and 12 sit about 20% away from that reciprocal. The answer is not the slope itself.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('ROI 有 10000 个像素时，方差估计的相对误差大约是百分之多少？', 'About what is the relative error of the variance estimate, in percent, when the ROI has 10000 pixels?'),
    options: [
      { id: 'a', text: loc(VE_LO, VE_LO) },
      { id: 'b', text: loc(VE_HI, VE_HI) },
      { id: 'c', text: loc(VE_TXT, VE_TXT) },
    ],
    answer: 'c',
    explain: fill(
      loc(
        '相对误差 √(2/(n−1))，n = 10000，约 {v}%。{lo} 和 {hi} 大约偏了 15%。',
        'The relative error is sqrt(2/(n-1)). With n = 10000 it is about {v}%. {lo} and {hi} are about 15% off.',
      ),
      { v: VE_TXT, lo: VE_LO, hi: VE_HI },
    ),
  },
  {
    id: 'q5',
    prompt: loc('饱和均值是 2000 DN，K = 10 e-/DN。满阱大约是多少电子？', 'The saturated mean is 2000 DN and K = 10 e-/DN. About how many electrons is full well?'),
    options: [
      { id: 'a', text: loc(FWC_LO, FWC_LO) },
      { id: 'b', text: loc(String(FWC), String(FWC)) },
      { id: 'c', text: loc(FWC_HI, FWC_HI) },
    ],
    answer: 'b',
    explain: loc(
      '满阱 = 饱和均值 × K = 2000 × 10 = 20000 电子。18000 和 22000 是同一乘积附近差了 10% 的数。',
      'Full well = saturated mean times K = 2000 * 10 = 20000 electrons. 18000 and 22000 sit about 10% away from that product.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '关于 ROI 和曝光点，下列哪些说法正确？(1) n 越大，方差相对误差越小；(2) 只有一个曝光点也能同时定出斜率和满阱；(3) 边长 100 的 ROI 大约有 1 万像素，相对误差约 1.4%；(4) ROI 越小，K 越稳。',
      'Which statements about the ROI and the exposure points are correct? (1) a larger n makes the relative variance error smaller; (2) one exposure point can set both the slope and full well; (3) an ROI of side 100 has about 10000 pixels and a relative error near 1.4%; (4) a smaller ROI makes K more stable.',
    ),
    options: [
      { id: 'a', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'b', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'c', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
    ],
    answer: 'b',
    explain: loc(
      '相对误差按 1/√n 下降，所以像素越多越稳。(3) 就是 n = 10000 的数字。(2) 错：一个点定不了直线，也看不到饱和拐点。(4) 反了。',
      'The relative error falls as 1/sqrt(n), so more pixels make it more stable. (3) is the number for n = 10000. (2) is wrong: one point cannot set a line and does not show the saturation knee. (4) is reversed.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('同样的画面改用单帧方差，K 估计常常偏小。主要原因是什么？', 'Using single-frame variance on the same scene often makes the K estimate low. What is the main reason?'),
    options: [
      { id: 'a', text: loc('ADC 位数变了', 'The ADC bit count changed') },
      { id: 'b', text: loc('PRNU 和 FPN 留在方差里，斜率变大，K = 1/斜率变小', 'PRNU and FPN stay in the variance, the slope rises, and K = 1/slope gets smaller') },
      { id: 'c', text: loc('两帧之差把散粒噪声消掉了', 'The frame difference removed the shot noise') },
    ],
    answer: 'b',
    explain: loc(
      '单帧的空间起伏里有 PRNU。这部分方差随信号变大，拟合斜率变陡，倒数 K 就偏小。差帧才是把固定图案消掉的那一种；单帧并没有做差。',
      'The spatial variation of one frame contains PRNU. That variance grows with the signal, the fitted slope gets steeper, and the reciprocal K comes out low. The frame difference is what removes fixed pattern. A single frame does not take that difference.',
    ),
  },
  {
    id: 'q8',
    prompt: loc('动态范围和 SNR 最大值，在 PTC 里分别对应什么？', 'In a PTC, what do dynamic range and the maximum SNR correspond to?'),
    options: [
      { id: 'a', text: loc('动态范围 = 满阱 / 读噪，SNR 最大约 √满阱', 'Dynamic range = full well / read noise, and maximum SNR is about sqrt(full well)') },
      { id: 'b', text: loc('动态范围 = K，SNR 最大 = 读噪', 'Dynamic range = K, and maximum SNR = read noise') },
      { id: 'c', text: loc('两者都等于斜率', 'Both equal the slope') },
    ],
    answer: 'a',
    explain: loc(
      '满阱是能装下的最多电子，读噪是暗端的底，两者相除是动态范围。只剩散粒噪声时 SNR = √S，所以最大大约出现在满阱，是 √满阱。',
      'Full well is the most electrons the pixel can hold, and read noise is the floor at the dark end. Their ratio is the dynamic range. With shot noise alone, SNR = sqrt(S), so the maximum is about at full well and equals sqrt(full well).',
    ),
  },
]

export function taskItems(state: PtcState, a: PtcAnalysis): TaskItem[] {
  const flags = ptcFlags(state, a)
  return [
    { id: 'k-err', text: S.task1, done: flags.t1 },
    { id: 'single-prnu', text: S.task2, done: flags.t2 },
    { id: 'fwc', text: S.task3, done: flags.t3 },
    { id: 'roi', text: S.task4, done: flags.t4 },
  ]
}

export function verdictOf(state: PtcState, a: PtcAnalysis): { title: LText; text: LText } {
  const nums = {
    k: fmtK(a.k),
    kt: state.kTrue.toFixed(2),
    rel: Number.isFinite(a.relK) ? (a.relK * 100).toFixed(2) : '--',
    fwc: fmtK(a.fwcE),
    fk: state.fwcE.toFixed(0),
    side: String(a.roi.w * a.roi.h),
    ve: (a.varRel * 100).toFixed(2),
    prnu: state.prnu.toFixed(3),
  }
  if (state.mode === 'diff') return { title: S.diffTitle, text: fill(S.diffWhy, nums) }
  return { title: S.singleTitle, text: fill(S.singleWhy, nums) }
}

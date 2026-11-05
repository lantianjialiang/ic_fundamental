import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { darkElectronsPerS } from './core/optics'
import { COMPARE_S, FOCUS_IDS, type DarkAnalysis, type DarkState, type FocusId } from './snsDarkModel'

export function fill(text: LText, values: Record<string, string>): LText {
  const apply = (s: string) => Object.keys(values).reduce((acc, key) => acc.split(`{${key}}`).join(values[key]), s)
  return { zh: apply(text.zh), en: apply(text.en ?? text.zh) }
}

const f0 = (n: number) => n.toFixed(0)
const f1 = (n: number) => n.toFixed(1)
const f2 = (n: number) => n.toFixed(2)
const f3 = (n: number) => n.toFixed(3)

const RATIO_60 = darkElectronsPerS(20, 60, 7) / darkElectronsPerS(20, 25, 7)
const E_1S = darkElectronsPerS(20, 25, 7) * 1
const E_01S = darkElectronsPerS(20, 25, 7) * COMPARE_S
const SHRINK_16 = 1 / Math.sqrt(16)

export const FOCUS_OPTIONS = FOCUS_IDS.map((id) => ({
  id,
  label:
    id === 'dsnu'
      ? loc('DSNU', 'DSNU')
      : id === 'temp'
        ? loc('温度', 'Temperature')
        : loc('热像素', 'Hot pixels'),
}))

export const S = {
  kickerNow: loc('这一次暗场', 'This dark frame'),
  introTitle: loc('暗电流、DSNU 与热像素', 'Dark current, DSNU and hot pixels'),
  coreTitle: loc('练一练：暗帧、平均与阈值', 'Practice: dark frames, averaging and the threshold'),
  coreNote: loc(
    '翻倍温度间隔是教学示意，用来演示暗电流每隔若干度加倍，不是某一款真实传感器的固定值。画面是 VDUT-CIS1 的 64×64 暗帧，照度为 0。金色是超过阈值的像素，蓝色是其余。',
    'The doubling interval is a teaching illustration of dark current doubling every few degrees. It is not a fixed value of any real sensor. The picture is a 64x64 dark frame of VDUT-CIS1 with illumination set to 0. Gold marks pixels over the threshold. Blue marks the rest.',
  ),
  callout: loc(
    '教学示意：参数来自虚拟器件，不对应任何真实型号。',
    'Teaching illustration: values come from a virtual device and do not match any real part.',
  ),
  darkLabel: loc('25 °C 暗电流', 'Dark current at 25 °C'),
  doubleLabel: loc('翻倍温度间隔', 'Doubling interval'),
  tempLabel: loc('温度', 'Temperature'),
  expLabel: loc('曝光', 'Exposure'),
  readLabel: loc('读出噪声', 'Read noise'),
  nLabel: loc('平均帧数 N', 'Frames to average, N'),
  thLabel: loc('热像素阈值', 'Hot-pixel threshold'),
  focusLabel: loc('侧栏看哪一项', 'What the side panel explains'),
  rMean: loc('平均暗信号', 'Mean dark signal'),
  rSingle: loc('单帧标准差（去掉热像素）', 'Single-frame std (hot pixels left out)'),
  rDsnu: loc('DSNU（平均后，去掉热像素）', 'DSNU (after averaging, hot pixels left out)'),
  rFull: loc('整帧空间标准差（含热像素）', 'Full-frame spatial std (hot pixels kept)'),
  rRatio: loc('相对 25 °C 的暗电流倍数', 'Dark-current ratio versus 25 °C'),
  rNow: loc('当前曝光的暗电子', 'Dark electrons at this exposure'),
  rRef: loc('0.1 s 对照的暗电子', 'Dark electrons on the 0.1 s line'),
  rHot: loc('超过阈值的像素', 'Pixels over the threshold'),
  rInjected: loc('掩膜里的热像素', 'Hot pixels in the mask'),
  rRecall: loc('热像素检出', 'Hot-pixel recall'),
  rFalse: loc('正常像素误判', 'False calls on normal pixels'),
  histAria: loc('暗帧 DN 的对数直方图，金色是超过阈值的箱子', 'Log histogram of dark-frame DN. Gold bins sit over the threshold.'),
  histCap: loc(
    '纵轴是 log10(计数+1)。绝大多数像素挤在黑电平附近，热像素出现在右侧的金色箱子里。',
    'The vertical axis is log10(count+1). Most pixels sit near the black level. Hot pixels show up in the gold bins on the right.',
  ),
  barAria: loc('当前曝光与 0.1 s 对照的暗电子数', 'Dark electrons at the current exposure and on the 0.1 s comparison line'),
  barNow: loc('当前', 'Now'),
  barRef: loc('0.1 s', '0.1 s'),
  frameAria: loc('64×64 暗帧，金色描边是超过阈值的像素', '64x64 dark frame. Gold outlines mark pixels over the threshold.'),
  frameCap: loc('平均后的暗帧。均值 {mean} DN，超过阈值 {hot} 个像素。', 'Averaged dark frame. Mean {mean} DN, {hot} pixels over the threshold.'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '亮场的 PRNU、缺陷分类和线性度在下一课。这里只把暗电流、时间噪声和热像素分开。',
    'PRNU, defect classification and linearity are in the next lesson. Here we only separate dark current, temporal noise and hot pixels.',
  ),
  next: loc('下一课：亮场、PRNU 与缺陷', 'Next: Bright field, PRNU and defects'),
  task1: loc(
    '把温度调到 60 °C，翻倍间隔保持 7 °C，使相对 25 °C 的暗电流倍数为 32。',
    'Set temperature to 60 °C and keep the doubling interval at 7 °C, so the dark current is 32 times the 25 °C value.',
  ),
  task2: loc('把曝光调到 1 s，对照旁边 0.1 s 的暗电子数。', 'Set the exposure to 1 s and compare it with the 0.1 s dark-electron line.'),
  task3: loc('把平均帧数调到 16 或更多，看去掉热像素后的标准差按 1/sqrt(N) 下降。', 'Set the average to 16 frames or more and watch the hot-pixel-free std fall as 1/sqrt(N).'),
  task4: loc(
    '把热像素阈值调到 500 DN 附近，使掩膜里的热像素大多被抓住，而且正常像素的误判低于 1%。',
    'Set the hot-pixel threshold near 500 DN so most mask hot pixels are caught and false calls on normal pixels stay under 1%.',
  ),
  vDsnu: loc('单帧标准差不是 DSNU', 'A single-frame standard deviation is not DSNU'),
  vTemp: loc('暗电流按翻倍间隔随温度变', 'Dark current follows the doubling interval'),
  vHot: loc('阈值要落在热像素和正常像素之间', 'The threshold has to sit between hot pixels and normal pixels'),
  vDsnuText: loc(
    '去掉热像素后，单帧空间标准差是 {single} DN，N = {n} 帧平均后的 DSNU 是 {dsnu} DN。原因：单帧标准差里还有时间噪声，所以它不是 DSNU；平均把这部分按 1/sqrt(N) = {factor} 压低，{single} × {factor} = {pred} DN，和测到的 DSNU 对齐。整帧标准差仍有 {full} DN，因为热像素是空间上的固定点，平均去不掉。',
    'With hot pixels left out, the single-frame spatial std is {single} DN and the DSNU after N = {n} averaged frames is {dsnu} DN. Reason: the single-frame std still contains temporal noise, so it is not DSNU. Averaging removes that part as 1/sqrt(N) = {factor}. {single} x {factor} = {pred} DN, which lines up with the measured DSNU. The full-frame std is still {full} DN, because hot pixels are fixed in space and averaging does not remove them.',
  ),
  vTempText: loc(
    '当前 {t} °C、翻倍间隔 {d} °C（教学示意）时，相对 25 °C 的倍数是 {ratio}，暗电流 {rate} e-/s。原因：i(T) = i25 · 2^((T-25)/ΔT)，它不是对温度的直线。曝光 {exp} s 积下 {eNow} 个暗电子，0.1 s 对照线是 {eRef} 个。',
    'At {t} °C with a doubling interval of {d} °C (a teaching illustration), the ratio versus 25 °C is {ratio}, so the dark current is {rate} e-/s. Reason: i(T) = i25 · 2^((T-25)/dT). It is not a straight line in temperature. This exposure of {exp} s collects {eNow} dark electrons. The 0.1 s comparison line collects {eRef}.',
  ),
  vHotText: loc(
    '掩膜里有 {inj} 个热像素，阈值 {th} DN 抓住了 {caught} 个（检出 {recall}%），正常像素误判 {fr}%。原因：热像素比黑电平高出大约一千 DN，阈值要落在这个空隙里，才能抓住尾部，又不把正常像素算进去。',
    'The mask holds {inj} hot pixels. A threshold of {th} DN catches {caught} of them (recall {recall}%), and {fr}% of normal pixels are false calls. Reason: hot pixels sit about a thousand DN above the black level, so the threshold has to land in that gap: catch the tail, and leave normal pixels alone.',
  ),
}

export const INTRO = [
  loc(
    '暗场是把光挡住之后再曝光。每个像素仍然会积下暗电流，读出时再加上黑电平和读出噪声。VDUT-CIS1 在 25 °C 的暗电流是每秒若干个电子，随温度按翻倍间隔上升。这个间隔是教学示意。',
    'A dark frame is an exposure with the light blocked. Every pixel still collects dark current, and the readout adds a black level and read noise. VDUT-CIS1 collects a few electrons per second at 25 °C, and that rate rises with a doubling interval. The interval is a teaching illustration.',
  ),
  loc(
    'DSNU 是逐像素做完时间平均之后，画面上的空间标准差。单帧的标准差不是 DSNU，因为里面还有时间噪声。多帧平均把时间噪声按 1/sqrt(N) 压低，固定的热像素还在。统计口径见 {@anaStats}。',
    'DSNU is the spatial standard deviation after each pixel has been averaged over time. The standard deviation of one frame is not DSNU, because temporal noise is still in it. Averaging frames reduces that temporal noise as 1/sqrt(N). Fixed hot pixels remain. The statistical wording is in {@anaStats}.',
  ),
  loc(
    '热像素是暗电流分布的长尾。阈值太高会漏检，太低会把正常像素判成热像素。暗场要避光，也要控温，长曝光会直接变成测试时间。',
    'Hot pixels are the long tail of the dark-current distribution. A threshold that is too high misses them. A threshold that is too low marks normal pixels as hot. A dark test needs the light blocked and the temperature held, and a long exposure becomes test time directly.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '暗电流和温度成直线。教学模型是每过一个翻倍间隔就乘 2：从 25 °C 到 60 °C、间隔 7 °C，倍数是 2^5 = 32，不是 (60-25) 的比例。',
    'Dark current is a straight line in temperature. The teaching model multiplies by 2 at every doubling interval. From 25 °C to 60 °C with a 7 °C interval the factor is 2^5 = 32, which is not the ratio of (60-25).',
  ),
  loc(
    '单帧标准差就是 DSNU。单帧里还有读出噪声和暗散粒噪声。DSNU 要先按像素做时间平均，再算空间标准差。',
    'The single-frame standard deviation is DSNU. A single frame still contains read noise and dark shot noise. DSNU averages each pixel over time first, then takes the spatial standard deviation.',
  ),
  loc(
    '阈值越低越安全。阈值低于正常暗信号时，整幅画面都会被标成热像素，后面的分级会被误判淹没。',
    'A lower threshold is always safer. Once the threshold drops into the normal dark signal, the whole frame is marked hot and later grading is flooded with false calls.',
  ),
]

export const TAKEAWAY: LText = loc(
  '暗信号 = 黑电平 + 暗电子 / K。暗电子 = i(T) · t，i(T) = i25 · 2^((T-25)/ΔT)，ΔT 是教学示意的翻倍间隔。DSNU 是平均之后的空间标准差；单帧标准差还含时间噪声，平均按 1/sqrt(N) 去掉它。热像素用阈值抓，要同时看检出和误判。',
  'Dark signal = black level + dark electrons / K. Dark electrons = i(T) · t, with i(T) = i25 · 2^((T-25)/dT). dT is a teaching doubling interval. DSNU is the spatial standard deviation after averaging. A single-frame standard deviation still holds temporal noise, and averaging removes it as 1/sqrt(N). A hot-pixel threshold is judged by recall and by false calls together.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      'VDUT-CIS1 的翻倍间隔设为 7 °C。暗电流从 25 °C 到 60 °C 变成几倍？',
      'The doubling interval of VDUT-CIS1 is set to 7 °C. By what factor does dark current grow from 25 °C to 60 °C?',
    ),
    options: [
      { id: 'a', text: loc('8', '8') },
      { id: 'b', text: loc(f0(RATIO_60), f0(RATIO_60)) },
      { id: 'c', text: loc('128', '128') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '(60-25)/7 = 5，倍数 = 2^5 = {r}。翻倍间隔是教学示意，换一个间隔，倍数就变。',
        '(60-25)/7 = 5, so the factor is 2^5 = {r}. The doubling interval is a teaching illustration: change it and the factor changes.',
      ),
      { r: f0(RATIO_60) },
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '25 °C 的暗电流是 20 e-/s。曝光 1 s 积下的暗电子，是 0.1 s 的多少倍？',
      'Dark current at 25 °C is 20 e-/s. How many times more dark electrons does a 1 s exposure collect than a 0.1 s exposure?',
    ),
    options: [
      { id: 'a', text: loc('2', '2') },
      { id: 'b', text: loc(f0(E_1S / E_01S), f0(E_1S / E_01S)) },
      { id: 'c', text: loc('20', '20') },
    ],
    answer: 'b',
    explain: fill(
      loc(
        '暗电子 = 速率 × 曝光。1 s 是 {a} 个电子，0.1 s 是 {b} 个，倍数是 {r}。黑电平不随曝光变，所以比的是电子数，不是含黑电平的 DN。',
        'Dark electrons = rate x exposure. 1 s collects {a} electrons and 0.1 s collects {b}, so the factor is {r}. Black level does not change with exposure, so the ratio is in electrons, not in DN that still includes the black level.',
      ),
      { a: f0(E_1S), b: f1(E_01S), r: f0(E_1S / E_01S) },
    ),
  },
  {
    id: 'q3',
    prompt: loc('用 N = 16 帧做平均，时间噪声大约变成单帧的多少？', 'If you average N = 16 frames, about what fraction of the single-frame temporal noise remains?'),
    options: [
      { id: 'a', text: loc(f2(SHRINK_16), f2(SHRINK_16)) },
      { id: 'b', text: loc('0.50', '0.50') },
      { id: 'c', text: loc('0.06', '0.06') },
    ],
    answer: 'a',
    explain: fill(
      loc(
        '独立噪声平均后按 1/sqrt(N) 下降。N = 16 时是 1/4 = {r}。这只去掉时间噪声，去不掉热像素那种空间固定图案。',
        'Independent noise falls as 1/sqrt(N) when frames are averaged. At N = 16 that is 1/4 = {r}. This removes temporal noise only. It does not remove a spatial pattern such as a hot pixel.',
      ),
      { r: f2(SHRINK_16) },
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '关于 DSNU，下列哪些说法正确？(1) DSNU 是时间平均之后的空间标准差；(2) 单帧标准差已经是 DSNU；(3) 平均按 1/sqrt(N) 压低时间噪声；(4) 热像素会随平均消失。',
      'Which statements about DSNU are correct? (1) DSNU is the spatial standard deviation after a time average; (2) the single-frame standard deviation is already DSNU; (3) averaging reduces temporal noise as 1/sqrt(N); (4) hot pixels disappear when you average.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)', '(1), (3)') },
      { id: 'b', text: loc('(2)、(4)', '(2), (4)') },
      { id: 'c', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(2) 错在单帧里还有时间噪声。(4) 错在热像素每帧都在同一个位置，平均之后它还在，只是读数更稳。',
      '(2) is wrong because a single frame still contains temporal noise. (4) is wrong because a hot pixel sits on the same site every frame, so averaging leaves it in place and only makes the reading steadier.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      '关于热像素阈值，下列哪些说法正确？(1) 阈值要高于正常暗信号、低于热像素；(2) 阈值越低，漏检越少，误判也一定越少；(3) 检出率看的是掩膜里的热像素有多少被抓住；(4) 误判是正常像素被标成热像素。',
      'Which statements about the hot-pixel threshold are correct? (1) It should sit above the normal dark signal and below the hot pixels; (2) a lower threshold always cuts both misses and false calls; (3) recall is how many mask hot pixels are caught; (4) a false call is a normal pixel marked hot.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(3)、(4)', '(1), (3), (4)') },
      { id: 'b', text: loc('(2)、(3)', '(2), (3)') },
      { id: 'c', text: loc('(1)、(2)、(4)', '(1), (2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(2) 把两件事绑在一起了。阈值降低会少漏检，但误判会变多。要同时看检出和误判。',
      '(2) ties two effects together. Lowering the threshold misses fewer hot pixels, and it also creates more false calls. Recall and false calls have to be read together.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('同样的暗电流速率，曝光加大 10 倍，暗电子数怎么变？', 'At the same dark-current rate, what happens to the dark-electron count if the exposure is multiplied by 10?'),
    options: [
      { id: 'a', text: loc('大约不变，因为黑电平没变', 'It stays about the same, because the black level is unchanged') },
      { id: 'b', text: loc('大约变成 10 倍，因为暗电子 = 速率 × 曝光', 'It becomes about 10 times larger, because dark electrons = rate x exposure') },
      { id: 'c', text: loc('变成原来的 1/10，长曝光会把暗电流平均掉', 'It falls to 1/10, because a long exposure averages the dark current away') },
    ],
    answer: 'b',
    explain: loc(
      '暗电子随曝光线性积累。黑电平是加在 DN 上的常数，不代替这份积分。长曝光让暗信号更大，也让测试更慢。',
      'Dark electrons accumulate in proportion to exposure. Black level is a constant added in DN. It does not replace that integral. A longer exposure makes a larger dark signal, and it also makes the test slower.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('整帧空间标准差几乎不随 N 下降，最常见的原因是什么？', 'The full-frame spatial standard deviation barely falls as N grows. What is the usual reason?'),
    options: [
      { id: 'a', text: loc('平均写错了，时间噪声不该下降', 'The average is wrong, and temporal noise should not fall') },
      { id: 'b', text: loc('少数热像素是固定图案，它们支配了整帧标准差', 'A few hot pixels are a fixed pattern, and they dominate the full-frame standard deviation') },
      { id: 'c', text: loc('DSNU 定义为单帧标准差，所以不该变', 'DSNU is defined as the single-frame standard deviation, so it should not change') },
    ],
    answer: 'b',
    explain: loc(
      '热像素每帧都亮在同一个地方。平均去掉的是每个像素上的时间噪声；去掉热像素之后，剩下的标准差才会按 1/sqrt(N) 下降。',
      'A hot pixel is bright on the same site in every frame. Averaging removes the temporal noise on each pixel. After the hot pixels are left out, the remaining standard deviation falls as 1/sqrt(N).',
    ),
  },
  {
    id: 'q8',
    prompt: loc(
      '关于暗场测试的条件，下列哪些说法正确？(1) 需要避光；(2) 温度会改暗电流，所以要控温；(3) 曝光越长，暗电子越多，测试也越慢；(4) 暗场可以不看温度，因为暗电流是常数。',
      'Which statements about a dark test are correct? (1) The light has to be blocked; (2) temperature changes dark current, so it has to be controlled; (3) a longer exposure collects more dark electrons and also takes more test time; (4) temperature can be ignored, because dark current is a constant.',
    ),
    options: [
      { id: 'a', text: loc('(1)、(2)、(3)', '(1), (2), (3)') },
      { id: 'b', text: loc('(1)、(4)', '(1), (4)') },
      { id: 'c', text: loc('(2)、(4)', '(2), (4)') },
    ],
    answer: 'a',
    explain: loc(
      '(4) 和翻倍模型相反。温度变了，暗电流按 2^((T-25)/ΔT) 变，ΔT 在这门课里是教学示意。',
      '(4) runs against the doubling model. When temperature changes, dark current changes as 2^((T-25)/dT). In this lesson dT is a teaching illustration.',
    ),
  },
]

export function taskItems(state: DarkState, a: DarkAnalysis): TaskItem[] {
  return [
    { id: 'temp-32', text: S.task1, done: state.tempC === 60 && state.doubleC === 7 && Math.abs(a.ratio - 32) < 0.05 },
    { id: 'exp-1s', text: S.task2, done: state.exposureS === 1 },
    { id: 'n-16', text: S.task3, done: state.nAvg >= 16 },
    { id: 'hot-catch', text: S.task4, done: a.recall >= 0.8 && a.falseRate < 0.01 },
  ]
}

export function verdictOf(state: DarkState, a: DarkAnalysis): { title: LText; text: LText } {
  const common = {
    single: f3(a.singleNorm),
    dsnu: f3(a.dsnuNorm),
    n: f0(state.nAvg),
    factor: f3(a.factor),
    pred: f3(a.singleNorm * a.factor),
    full: f1(a.fullStd),
    t: f0(state.tempC),
    d: f0(state.doubleC),
    ratio: f2(a.ratio),
    rate: f1(a.rate),
    exp: f2(state.exposureS),
    eNow: f1(a.eNow),
    eRef: f1(a.eRef),
    inj: f0(a.injected),
    th: f0(state.hotTh),
    caught: f0(a.caught),
    recall: f0(a.recall * 100),
    fr: f2(a.falseRate * 100),
  }
  const text: Record<FocusId, LText> = {
    dsnu: fill(S.vDsnuText, common),
    temp: fill(S.vTempText, common),
    hot: fill(S.vHotText, common),
  }
  const title: Record<FocusId, LText> = { dsnu: S.vDsnu, temp: S.vTemp, hot: S.vHot }
  return { title: title[state.focus], text: text[state.focus] }
}

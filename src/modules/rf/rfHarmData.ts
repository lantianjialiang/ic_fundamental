import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type CompKey, type HarmAnalysis, type HarmState } from './rfHarmModel'

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)

/** 分量的全称（结论里用）与图上的短标签 */
export const NAME: Record<CompKey, LText> = {
  f0: loc('基波 f₀（100 MHz）', 'Fundamental f₀ (100 MHz)'),
  h2: loc('2 次谐波 2f₀（200 MHz）', '2nd harmonic 2f₀ (200 MHz)'),
  h3: loc('3 次谐波 3f₀（300 MHz）', '3rd harmonic 3f₀ (300 MHz)'),
  spur: loc('杂散（137 MHz）', 'Spur (137 MHz)'),
}

export const LABEL: Record<CompKey, LText> = {
  f0: loc('f₀', 'f0'),
  h2: loc('2f₀', '2f0'),
  h3: loc('3f₀', '3f0'),
  spur: loc('杂散', 'Spur'),
}

const HARM_REASON = loc(
  '谐波来自功放等器件的非线性：驱动越大、越接近饱和，越多能量被推到 2f₀、3f₀ 上，所以要靠降低驱动或加滤波器来压。',
  'Harmonics come from the nonlinearity of the amplifier and similar parts: the harder it is driven and the closer to saturation, the more energy lands on 2f₀ and 3f₀, so reduce the drive or add filtering.',
)
const SPUR_REASON = loc(
  '杂散不是基波的整数倍，多半来自时钟、混频或电源耦合，调功放解决不了，要去查源头。',
  'A spur is not an integer multiple of the fundamental; it usually comes from the clock, mixing or supply coupling. Tuning the amplifier will not fix it, so trace the source.',
)
const LIST_SEP = loc('；', '; ')

export const S = {
  kickerNow: loc('这一次频谱', 'This spectrum'),
  introTitle: loc('谐波与杂散：频谱上多出来的分量', 'Harmonics and spurs: the extra components on a spectrum'),
  coreTitle: loc('拨一拨：谐波电平与频谱掩模', 'Try it: harmonic levels and the spectrum mask'),
  coreNote: loc(
    '下图是一次频谱测量的结果（假设见下文）：基波在 100 MHz，2 次、3 次谐波与一个 137 MHz 杂散都用 dBc（相对基波的 dB）标注。阶梯线是频谱掩模，超过它的分量标红并判 FAIL。假设：采样率 1024 MHz，记录 1024 点，基波恰好落在整数个频率格上，频谱由加了 Blackman–Harris 窗的 FFT 得到。',
    'The plot is a measured spectrum (assumptions below): a fundamental at 100 MHz, 2nd and 3rd harmonics and a 137 MHz spur, each labelled in dBc (dB relative to the fundamental). The stepped line is the spectrum mask; any component above it turns red and fails. Assumptions: 1024 MHz sample rate, 1024 points, the fundamental falls on a whole number of frequency bins, and the spectrum is an FFT with a Blackman–Harris window.',
  ),
  h2Label: loc('2 次谐波 2f₀ 电平（dBc）', '2nd harmonic 2f₀ level (dBc)'),
  h3Label: loc('3 次谐波 3f₀ 电平（dBc）', '3rd harmonic 3f₀ level (dBc)'),
  spurLabel: loc('137 MHz 杂散电平（dBc）', '137 MHz spur level (dBc)'),
  rF0: loc('基波 f₀（100 MHz）', 'Fundamental f₀ (100 MHz)'),
  rH2: loc('2 次谐波 2f₀（200 MHz）', '2nd harmonic 2f₀ (200 MHz)'),
  rH3: loc('3 次谐波 3f₀（300 MHz）', '3rd harmonic 3f₀ (300 MHz)'),
  rSpur: loc('杂散（137 MHz，非谐波）', 'Spur (137 MHz, not a harmonic)'),
  rVerdict: loc('频谱掩模判定', 'Spectrum mask verdict'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  maskLabel: loc('频谱掩模', 'Spectrum mask'),
  vPass: loc('频谱合格', 'Spectrum passes'),
  vFail: loc('频谱超限', 'Spectrum fails the mask'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实规范的掩模分频段、分带宽定义，还会区分绝对功率（dBm）与 dBc；这里只练读 dBc、找超限分量，并说清原因。',
    'Real specifications define masks by band and by measurement bandwidth, and they also use absolute power (dBm) as well as dBc; here we only practise reading dBc, finding the component over its limit, and stating why.',
  ),
  next: loc('下一课：相位噪声', 'Next: Phase Noise'),
  task1: loc('把 2 次谐波抬到 −20 dBc 左右，超过 −30 dBc 的限值，判 FAIL。', 'Raise the 2nd harmonic to about −20 dBc, above the −30 dBc limit, so it fails.'),
  task2: loc('把 3 次谐波抬到 −35 dBc，超过 −40 dBc 的限值（看 3f₀ 那一条）。', 'Raise the 3rd harmonic to −35 dBc, above its −40 dBc limit (watch the 3f₀ line).'),
  task3: loc(
    '把杂散抬到 −40 dBc 以上，看它落在 137 MHz（不是谐波），在 50–150 MHz 段超过 −45 dBc。',
    'Raise the spur above −40 dBc and see that it sits at 137 MHz (not a harmonic), over the −45 dBc limit in the 50–150 MHz band.',
  ),
  task4: loc('把三个分量都压到限值以下，让频谱判 PASS。', 'Bring all three components under their limits so the spectrum passes.'),
}

export const FIG = {
  aria: loc(
    '频谱图：基波、2 次与 3 次谐波、137 MHz 杂散，以及阶梯状的频谱掩模',
    'Spectrum: fundamental, 2nd and 3rd harmonics, a 137 MHz spur, and the stepped spectrum mask',
  ),
  axis: loc('横轴：频率 MHz；纵轴：dBc', 'Horizontal: frequency in MHz; vertical: dBc'),
  cap: loc(
    '横轴是频率（0–512 MHz），纵轴是相对基波的 dBc。金色阶梯线是掩模，超过它的分量标红。0–50 MHz 紧挨基波，不在掩模内。',
    'The horizontal axis is frequency (0–512 MHz) and the vertical axis is dBc relative to the fundamental. The gold stepped line is the mask; components above it are marked in red. 0–50 MHz sits next to the fundamental and is outside the mask.',
  ),
}

export const INTRO = [
  loc(
    '上一课的 IP3 讲的是双音测试里的三阶交调。这一课换个角度：单音输入时，非线性器件的输出里也会出现基波的整数倍（谐波），以及与基波不成整数倍关系的杂散。它们都会占用别的频段，所以要在频谱上一条一条找出来、标出电平。见 {@rfIp3}。',
    'The previous lesson covered third-order intermodulation in a two-tone test. This one takes another view: with a single tone, a nonlinear device also puts out integer multiples of the fundamental (harmonics), plus spurs that are not integer multiples. They occupy other bands, so each one has to be found on the spectrum and its level marked. See {@rfIp3}.',
  ),
  loc(
    '频谱上的分量通常用 dBc 标注，即比基波低多少 dB；dBc 相对载波，所以比的是频谱的纯净度。频谱掩模规定各个频段允许的最大 dBc，超限的分量就判 FAIL。幅度谱的 FFT 算法见 {@anaFft}。',
    'Spectral components are usually labelled in dBc, meaning how many dB below the fundamental they sit; dBc is relative to the carrier, so it compares the purity of the spectrum. A spectrum mask sets the largest allowed dBc in each band, and any component above it fails. The FFT behind an amplitude spectrum is in {@anaFft}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '杂散就是谐波。谐波是基波的整数倍，杂散不一定：137 MHz 不是 100 MHz 的整数倍，它来自别处，调功放的偏置压不下去。',
    'A spur is just a harmonic. Harmonics are integer multiples of the fundamental but spurs need not be: 137 MHz is not a multiple of 100 MHz, it comes from elsewhere, and biasing the amplifier will not remove it.',
  ),
  loc(
    '只要谐波比基波低就行。掩模按频段分别给限值：谐波低于基波 30 dB 也可能超限（2f₀ 所在的 150–250 MHz 段限值只有 −30 dBc）。每一段都要过，不能只看一个数。',
    'It is enough for harmonics to sit below the fundamental. The mask sets limits band by band: a harmonic 30 dB below the fundamental can still fail (the 150–250 MHz band that holds 2f₀ is limited to −30 dBc). Every band must pass, not just one number.',
  ),
  loc(
    'dBc 和绝对功率一样，可以直接比较。dBc 是相对基波的，两个频谱的基波功率不同时，dBc 相同也不代表发射的绝对功率相同。',
    'dBc is the same as absolute power and can be compared directly. dBc is relative to the fundamental: if two spectra have different fundamental power, the same dBc does not mean the same absolute emission.',
  ),
]

export const TAKEAWAY: LText = loc(
  '谐波是基波的整数倍（2f₀、3f₀），主要来自非线性，靠降低驱动或滤波压；杂散不是整数倍，要查源头。分量用 dBc 标注（相对基波的 dB）；频谱掩模是分频段的阶梯线，超过任何一段的限值都判 FAIL。',
  'Harmonics are integer multiples of the fundamental (2f₀, 3f₀), mainly from nonlinearity, and are reduced by lowering the drive or filtering; spurs are not integer multiples and their source must be traced. Components are labelled in dBc (dB relative to the fundamental); the spectrum mask is a band-by-band stepped line, and exceeding any band’s limit fails.',
)

const Q1_DB = 20 * Math.log10(1 / 20)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('2 次谐波的电压幅度是基波的 1/20，它是多少 dBc？', 'The 2nd harmonic has 1/20 the fundamental’s voltage amplitude. How many dBc is that?'),
    options: [
      { id: 'a', text: loc('−20.0 dBc', '−20.0 dBc') },
      { id: 'b', text: loc('−10.0 dBc', '−10.0 dBc') },
      { id: 'c', text: loc(`${f1(Q1_DB)} dBc`, `${f1(Q1_DB)} dBc`) },
    ],
    answer: 'c',
    explain: loc(
      `dBc = 20·log₁₀(A₂/A₁) = 20·log₁₀(1/20) ≈ ${f1(Q1_DB)} dBc。这里是幅度比，系数用 20；如果是功率比才用 10。直接把 1/20 当成 −20 dBc 是错的。`,
      `dBc = 20·log₁₀(A₂/A₁) = 20·log₁₀(1/20) ≈ ${f1(Q1_DB)} dBc. This is an amplitude ratio, so the factor is 20; a power ratio would use 10. Reading 1/20 as −20 dBc is wrong.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('谐波与杂散的区别是什么？', 'What is the difference between a harmonic and a spur?'),
    options: [
      { id: 'a', text: loc('杂散一定是 2 次谐波', 'A spur is always the 2nd harmonic') },
      { id: 'b', text: loc('谐波是基波的整数倍，杂散不一定', 'Harmonics are integer multiples of the fundamental; spurs need not be') },
      { id: 'c', text: loc('谐波只出现在 1 GHz 以下', 'Harmonics only appear below 1 GHz') },
    ],
    answer: 'b',
    explain: loc(
      '2f₀ 和 3f₀ 是基波的整数倍，所以是谐波；本课的 137 MHz 不是 100 MHz 的整数倍，是杂散。两者的来源不同，查的方向也不同。',
      '2f₀ and 3f₀ are integer multiples of the fundamental, so they are harmonics; the 137 MHz component in this lesson is not a multiple of 100 MHz, so it is a spur. They have different sources and need different checks.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('想直接降低功放产生的 2 次谐波，哪一个做法最直接？', 'Which step most directly reduces the 2nd harmonic a power amplifier produces?'),
    options: [
      { id: 'a', text: loc('降低驱动，让功放远离饱和', 'Reduce the drive so the amplifier moves away from saturation') },
      { id: 'b', text: loc('把 dBc 限值放宽', 'Relax the dBc limit') },
      { id: 'c', text: loc('把功放推到更深的饱和，以提高输出功率', 'Push the amplifier deeper into saturation to raise output power') },
    ],
    answer: 'a',
    explain: loc(
      '功放越接近饱和，输出波形越被削平，非线性越强，谐波也越大。降低驱动（退避）让它更线性，但输出功率也会降，要在功率与线性之间权衡。放宽限值只是改了判定，没有改善频谱。',
      'The closer an amplifier is to saturation, the more its waveform is clipped and the stronger the nonlinearity and harmonics. Backing off the drive makes it more linear but lowers output power, so the trade-off must be weighed. Relaxing the limit changes the verdict, not the spectrum.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('2 次谐波测得 −24 dBc，150–250 MHz 段的限值是 −30 dBc。结论是什么？', 'The 2nd harmonic measures −24 dBc, and the 150–250 MHz limit is −30 dBc. What is the conclusion?'),
    options: [
      { id: 'a', text: loc('余量 6 dB，判 PASS', 'Margin 6 dB, PASS') },
      { id: 'b', text: loc('超限 6 dB，判 FAIL', 'Over the limit by 6 dB, FAIL') },
      { id: 'c', text: loc('超限 54 dB，判 FAIL', 'Over the limit by 54 dB, FAIL') },
    ],
    answer: 'b',
    explain: loc(
      'dBc 数值越小越好。−24 比限值 −30 高 6 dB，所以超限 6 dB，判 FAIL。原因：这一段的 2f₀ 比允许的电平高，谐波偏大。',
      'Smaller dBc is better. −24 is 6 dB above the −30 limit, so it is over by 6 dB and fails. The cause: the 2f₀ level in this band is higher than allowed, so the harmonic is too large.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('137 MHz 杂散测得 −47 dBc，落在 50–150 MHz 段，限值 −45 dBc。结论是什么？', 'A 137 MHz spur measures −47 dBc, in the 50–150 MHz band with a −45 dBc limit. What is the conclusion?'),
    options: [
      { id: 'a', text: loc('FAIL，超限 2 dB', 'FAIL, over by 2 dB') },
      { id: 'b', text: loc('PASS，余量 2 dB', 'PASS, margin 2 dB') },
      { id: 'c', text: loc('无法判断，掩模不管杂散', 'Cannot tell, the mask ignores spurs') },
    ],
    answer: 'b',
    explain: loc(
      '余量 = 限值 − 测量值 = −45 − (−47) = 2 dB，大于 0，合格。掩模同样管杂散，不只管谐波。',
      'Margin = limit − measured = −45 − (−47) = 2 dB, which is above zero, so it passes. The mask covers spurs as well as harmonics.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('为什么 dBc 要以基波为参考？', 'Why is dBc referenced to the fundamental?'),
    options: [
      { id: 'a', text: loc('基波功率越大，dBc 越大', 'The larger the fundamental power, the larger the dBc') },
      { id: 'b', text: loc('只对 2 次谐波有意义', 'It only makes sense for the 2nd harmonic') },
      { id: 'c', text: loc('消去了基波绝对功率的影响，便于比较频谱的纯净度', 'It removes the effect of absolute fundamental power, so spectral purity can be compared') },
    ],
    answer: 'c',
    explain: loc(
      '频谱整体平移（基波与各分量同时变大或变小）时，dBc 不变，于是可以在不同功率下比较频谱的纯净度。',
      'If the whole spectrum shifts (the fundamental and every component move together), dBc stays the same, so spectral purity can be compared across different power levels.',
    ),
  },
]

/** 四张任务卡：完成与否由当前设置和频谱结果算出 */
export function taskItems(state: HarmState, a: HarmAnalysis): TaskItem[] {
  return [
    { id: 'h2-fail', text: S.task1, done: state.h2 > -30 },
    { id: 'h3-fail', text: S.task2, done: state.h3 > -40 },
    { id: 'spur-fail', text: S.task3, done: state.spur > -45 },
    { id: 'all-pass', text: S.task4, done: a.pass },
  ]
}

/** 右侧说明栏：列出超限分量与原因；全部合格时说明最接近限值的分量 */
export function verdictOf(a: HarmAnalysis): { title: LText; text: LText } {
  const order: CompKey[] = ['h2', 'h3', 'spur']
  const failed = order.filter((key) => !a.comps[key].pass)
  if (failed.length === 0) {
    let closest: CompKey = 'h2'
    for (let i = 0; i < order.length; i += 1) {
      const key = order[i]
      if ((a.comps[key].margin ?? 0) < (a.comps[closest].margin ?? 0)) {
        closest = key
      }
    }
    const margin = f1(a.comps[closest].margin ?? 0)
    return {
      title: S.vPass,
      text: loc(
        `三个分量都在掩模之下。最接近限值的是${NAME[closest].zh}，余量 ${margin} dB。`,
        `All three components are under the mask. The one closest to its limit is ${NAME[closest].en ?? NAME[closest].zh}, with ${margin} dB of margin.`,
      ),
    }
  }

  const lines = failed.map((key) => {
    const c = a.comps[key]
    const limit = f0(c.limitDbc ?? 0)
    return loc(
      `${NAME[key].zh} ${f1(c.dbc)} dBc，限值 ${limit} dBc`,
      `${NAME[key].en ?? NAME[key].zh} at ${f1(c.dbc)} dBc, limit ${limit} dBc`,
    )
  })
  const zhList = lines.map((line) => line.zh).join(LIST_SEP.zh)
  const enList = lines.map((line) => line.en ?? line.zh).join(LIST_SEP.en ?? '; ')
  const harmFail = failed.includes('h2') || failed.includes('h3')
  const spurFail = failed.includes('spur')
  return {
    title: S.vFail,
    text: loc(
      `${zhList}，超出掩模，判 FAIL。${harmFail ? HARM_REASON.zh : ''}${spurFail ? SPUR_REASON.zh : ''}`,
      `${enList}: over the mask, FAIL. ${harmFail ? HARM_REASON.en ?? '' : ''}${spurFail ? SPUR_REASON.en ?? '' : ''}`,
    ),
  }
}

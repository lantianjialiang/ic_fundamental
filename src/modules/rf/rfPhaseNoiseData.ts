import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { FLOW_OPTIONS_HZ, F0_OPTIONS_GHZ, F_HI_HZ, fmtFreq, JITTER_BUDGET_PS, type PnAnalysis, type PnState } from './rfPhaseNoiseModel'

const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)
const f0 = (value: number) => value.toFixed(0)

export const F0_SEG = F0_OPTIONS_GHZ.map((ghz) => ({ id: String(ghz), label: `${ghz} GHz` }))
export const FLOW_SEG = FLOW_OPTIONS_HZ.map((hz) => ({ id: String(hz), label: fmtFreq(hz) }))

export const S = {
  kickerNow: loc('这一次相位噪声', 'This phase noise'),
  introTitle: loc('相位噪声：信号的相位在“抖”', 'Phase noise: the signal’s phase wanders'),
  coreTitle: loc('拨一拨：偏移频率、积分与抖动', 'Try it: offset, integration and jitter'),
  coreNote: loc(
    '下图是模型算出的 L(f)（dBc/Hz，对数频率轴）。拖滑块，或在曲线上点一下，选偏移频率；右侧读出该点的 L(f)。金色阴影是积分区间，把它积分、开方得到 rad rms，再除以 2π·f0 就是时间抖动。',
    'The plot shows the modelled L(f) in dBc/Hz on a log frequency axis. Drag the slider, or click the curve, to pick an offset; the readout gives L(f) there. The gold band is the integration range: integrate it, take the root to get rad rms, and divide by 2π·f0 to get the time jitter.',
  ),
  f0Label: loc('载波频率 f0', 'Carrier frequency f0'),
  l1kLabel: loc('1/f² 项在 1 kHz 处的 L(1 kHz)（dBc/Hz）', '1/f² term at 1 kHz, L(1 kHz) (dBc/Hz)'),
  flLabel: loc('平坦底噪 Lfl（dBc/Hz）', 'Flat floor Lfl (dBc/Hz)'),
  fLowLabel: loc('积分下限', 'Integration lower limit'),
  offsetLabel: loc('偏移频率 f（对数滑块）', 'Offset frequency f (log slider)'),
  rOffset: loc('偏移频率 f', 'Offset frequency f'),
  rL: loc('L(f)', 'L(f)'),
  rFlicker: loc('其中 1/f² 项', 'of which 1/f² term'),
  rFloor: loc('其中底噪项', 'of which floor'),
  rBand: loc('积分区间', 'Integration band'),
  rTheta: loc('积分相位噪声 θ_rms', 'Integrated phase noise θ_rms'),
  rJitter: loc(`时间抖动 t_rms（预算 ${f1(JITTER_BUDGET_PS)} ps）`, `Time jitter t_rms (budget ${f1(JITTER_BUDGET_PS)} ps)`),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  vPass: loc('抖动在预算内', 'Jitter is within budget'),
  vFail: loc('抖动超出预算', 'Jitter exceeds the budget'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实振荡器的 L(f) 还有 1/f³ 段、环路带宽内外的分段（PLL）以及杂散的影响；这里只用 1/f² 加平坦底噪的教学模型，练读 dBc/Hz、做积分和换算。',
    'A real oscillator’s L(f) also has a 1/f³ region and loop-bandwidth segments (PLL), plus spur effects; here we use only the teaching model of a 1/f² term plus a flat floor, to practise reading dBc/Hz, integrating and converting.',
  ),
  next: loc('下一课：调制基础', 'Next: Modulation Basics'),
  task1: loc(
    '把 L(1 kHz) 抬到 −75 dBc/Hz 以上，让积分抖动超过 1.0 ps（FAIL）。',
    'Raise L(1 kHz) above −75 dBc/Hz so the integrated jitter exceeds 1.0 ps (FAIL).',
  ),
  task2: loc('把积分下限从 1 kHz 提到 10 kHz，看 1/f² 段的积分怎么变。', 'Raise the integration lower limit from 1 kHz to 10 kHz and watch how the 1/f² integral changes.'),
  task3: loc('把载波换成 5 GHz：同样的 dBc/Hz，时间抖动变成 1 GHz 时的 1/5。', 'Switch the carrier to 5 GHz: with the same dBc/Hz, the time jitter becomes one fifth of the 1 GHz value.'),
  task4: loc('把偏移频率拨到 1 MHz 以上（或在图上点右侧），读出底噪段的 dBc/Hz。', 'Move the offset above 1 MHz (or click the right side of the plot) and read the floor’s dBc/Hz.'),
}

export const FIG = {
  aria: loc(
    '相位噪声曲线：1/f² 段、平坦底噪、积分区间与当前偏移频率',
    'Phase-noise curve: the 1/f² slope, the flat floor, the integration band and the current offset',
  ),
  cap: loc(
    '横轴是偏移频率（对数，1 kHz–10 MHz），纵轴是 dBc/Hz。虚线分别是 1/f² 段与底噪段，金色阴影是积分区间，红点是当前偏移频率；点击曲线也能选频偏。',
    'Horizontal: offset frequency (log scale, 1 kHz–10 MHz); vertical: dBc/Hz. The dashed lines are the 1/f² slope and the floor; the gold band is the integration range; the red dot is the current offset. Clicking the curve also picks an offset.',
  ),
  band: loc('积分区间', 'Integration band'),
  axis: loc('横轴：偏移频率（对数）；纵轴：dBc/Hz', 'Horizontal: offset frequency (log); vertical: dBc/Hz'),
}

export const INTRO = [
  loc(
    '{@rfNf} 讲的是电路自己加了多少噪声，那是幅度与功率的问题；振荡器（本振、时钟）的噪声则主要表现成信号相位的随机漂移，这就是相位噪声。L(f) 用偏移载波 f 处、每 1 Hz 带宽内的噪声功率与载波功率之比表示，单位 dBc/Hz。',
    'The {@rfNf} lesson is about how much noise a circuit adds, an amplitude-and-power matter. Oscillator noise (LO, clock) shows up mainly as a random drift of the signal phase; that is phase noise. L(f) expresses the noise power in a 1 Hz bandwidth at offset f from the carrier, relative to the carrier power, in dBc/Hz.',
  ),
  loc(
    '相位的随机漂移可以换算成时间抖动：把偏移区间内的 L(f) 积分、开方得到相位的 rms（弧度），再除以 2π·f0，就是秒级的时间抖动。它与 {@anaPll} 讲的周期抖动、采样时钟抖动直接相关，和 {@rfHarm} 里的杂散也要分开看。',
    'Phase drift converts to time jitter: integrate L(f) over the offset range, take the root to get the phase rms in radians, and divide by 2π·f0 to get the time jitter in seconds. It ties directly to the period jitter and clock jitter in {@anaPll}; spurs from {@rfHarm} must be considered separately.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'dBc/Hz 和 dBc 是一回事。dBc 是某个带宽内的总噪声功率比，dBc/Hz 是每 1 Hz 的功率比；同一个数字在不同带宽下意义不同，积分前要先说清楚带宽。',
    'dBc/Hz and dBc are the same thing. dBc is the total noise power ratio over a band, while dBc/Hz is the ratio per 1 Hz; the same number means different things over different bandwidths, so state the band before integrating.',
  ),
  loc(
    '只看 1 kHz 处的读数就够了。1/f² 段在 1 kHz 附近最强，但积分会把整个区间的噪声都加进来，远处的底噪段也会占相当一部分；底噪高时，抖动会被它主导。',
    'The reading at 1 kHz alone is enough. The 1/f² term is strongest near 1 kHz, but integration adds the whole band, and the distant floor can take a large share; when the floor is high, it dominates the jitter.',
  ),
  loc(
    '相位噪声越低，时间抖动一定越小，与载波频率无关。θ 只取决于 dBc/Hz 与积分区间，时间抖动 t = θ / (2π·f0) 却与载波频率成反比，载波越高，同样的相位噪声换成的时间抖动越小。',
    'Lower phase noise always means lower time jitter, whatever the carrier frequency. θ depends only on the dBc/Hz and the band, but the time jitter t = θ / (2π·f0) is inversely proportional to the carrier frequency, so a higher carrier turns the same phase noise into less time jitter.',
  ),
]

export const TAKEAWAY: LText = loc(
  'L(f) 单位是 dBc/Hz，即每赫兹的噪声功率相对载波的 dB 数；积分相位噪声 θ = √(2∫L df)，在线性域积分后开方；时间抖动 t = θ / (2π·f0)。积分下限决定 1/f² 段的贡献大小，底噪决定高频段的贡献。',
  'L(f) is in dBc/Hz, the noise power per hertz relative to the carrier in dB; the integrated phase noise is θ = √(2∫L df), integrated in linear terms and then square-rooted; the time jitter is t = θ / (2π·f0). The integration lower limit sets how much the 1/f² term contributes, and the floor sets the contribution from high offsets.',
)

const Q1_PS = (0.01 / (2 * Math.PI * 1e9)) * 1e12
const Q2_DB = 10 * Math.log10(100)
const Q6_RATIO = (1 / 1e4 - 1 / F_HI_HZ) / (1 / 1e3 - 1 / F_HI_HZ)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('载波 1 GHz，积分相位噪声 θ = 0.01 rad rms。时间抖动大约是多少？', 'Carrier at 1 GHz, integrated phase noise θ = 0.01 rad rms. About what is the time jitter?'),
    options: [
      { id: 'a', text: loc(`${f1(Q1_PS * 10)} ps`, `${f1(Q1_PS * 10)} ps`) },
      { id: 'b', text: loc(`${f2(Q1_PS)} ps`, `${f2(Q1_PS)} ps`) },
      { id: 'c', text: loc(`${f2(Q1_PS / 10)} ps`, `${f2(Q1_PS / 10)} ps`) },
    ],
    answer: 'b',
    explain: loc(
      `t = θ / (2π·f0) = 0.01 / (2π × 1 GHz) ≈ ${f2(Q1_PS)} ps。忘了除以 2π，或把 θ 直接当作时间，结果都会差很多。`,
      `t = θ / (2π·f0) = 0.01 / (2π × 1 GHz) ≈ ${f2(Q1_PS)} ps. Forgetting the 2π, or reading θ directly as a time, gives a very different result.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('在 1/f² 段，偏移频率增加 10 倍，L 大约下降多少？', 'In the 1/f² region, if the offset frequency grows tenfold, by about how much does L fall?'),
    options: [
      { id: 'a', text: loc('10 dB', '10 dB') },
      { id: 'b', text: loc(`${f0(Q2_DB)} dB`, `${f0(Q2_DB)} dB`) },
      { id: 'c', text: loc('40 dB', '40 dB') },
    ],
    answer: 'b',
    explain: loc(
      `1/f²：功率随 f⁻² 变化，10 log₁₀(10²) = ${f0(Q2_DB)} dB，即每十倍频下降 ${f0(Q2_DB)} dB（斜率 −20 dB/十倍频）。`,
      `1/f²: power varies as f⁻², so 10·log₁₀(10²) = ${f0(Q2_DB)} dB; the slope is −${f0(Q2_DB)} dB per decade.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('dBc/Hz 里的“/Hz”是什么意思？', 'What does “/Hz” mean in dBc/Hz?'),
    options: [
      { id: 'a', text: loc('每赫兹带宽内的噪声功率，相对载波功率的 dB 数', 'The noise power in one hertz of bandwidth, in dB relative to the carrier power') },
      { id: 'b', text: loc('每秒钟的抖动次数', 'The number of jitter events per second') },
      { id: 'c', text: loc('载波频率的单位', 'The unit of the carrier frequency') },
    ],
    answer: 'a',
    explain: loc(
      '“/Hz”表示归一化到 1 Hz 带宽。要得到某个带宽内的总噪声，需要把线性的 L 在带宽上积分，而不是直接相加 dB 数。',
      '“/Hz” means normalised to a 1 Hz bandwidth. To get the total noise in a band, integrate the linear L over the band; do not just add dB numbers.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('积分相位噪声的公式 θ = √(2∫L df) 里为什么有系数 2？', 'Why is there a factor of 2 in θ = √(2∫L df)?'),
    options: [
      { id: 'a', text: loc('把 rms 换成峰峰值', 'To convert rms to peak-to-peak') },
      { id: 'b', text: loc('L 只算单边带，两个边带合起来是 2L', 'L counts only one sideband; the two sidebands together make 2L') },
      { id: 'c', text: loc('把 dB 换成线性', 'To convert dB to linear') },
    ],
    answer: 'b',
    explain: loc(
      'L(f) 定义在单边带上。相位调制同时把能量放到载波两侧，两个边带的噪声功率合起来是 2L，所以积分前乘 2。',
      'L(f) is defined on one sideband. Phase noise spreads energy to both sides of the carrier, so the two sidebands together carry 2L and the integral is multiplied by 2.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('载波从 1 GHz 换到 5 GHz，dBc/Hz 曲线不变，积分抖动会怎样？', 'The carrier moves from 1 GHz to 5 GHz with the same dBc/Hz curve. What happens to the integrated jitter?'),
    options: [
      { id: 'a', text: loc('不变', 'Unchanged') },
      { id: 'b', text: loc('变为 1/5', 'Becomes one fifth') },
      { id: 'c', text: loc('变为 5 倍', 'Becomes five times') },
    ],
    answer: 'b',
    explain: loc(
      'θ 只取决于相对载波的噪声，与 f0 无关；时间抖动 t = θ / (2π·f0) 与 f0 成反比，所以变为 1/5。',
      'θ depends only on the noise relative to the carrier, not on f0; the time jitter t = θ / (2π·f0) is inversely proportional to f0, so it becomes one fifth.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('积分下限从 1 kHz 提到 10 kHz，1/f² 项的积分大约变为原来的多少？', 'Raising the integration lower limit from 1 kHz to 10 kHz, what fraction of the 1/f² integral remains?'),
    options: [
      { id: 'a', text: loc(`约 ${f2(Q6_RATIO)}（即 1/10）`, `About ${f2(Q6_RATIO)} (that is, 1/10)`) },
      { id: 'b', text: loc('不变', 'Unchanged') },
      { id: 'c', text: loc('10 倍', 'Ten times') },
    ],
    answer: 'a',
    explain: loc(
      '∫ c/f² df = c(1/f_lo − 1/f_hi)，f_hi 很大时 c/f_hi 可以忽略，剩下的 c/f_lo 随下限提高到 10 倍而缩小到 1/10。这也是为什么积分下限会明显左右抖动结果。',
      '∫ c/f² df = c(1/f_lo − 1/f_hi). With f_hi large, c/f_hi is negligible, so what remains is c/f_lo, which shrinks to 1/10 when the lower limit rises tenfold. This is why the lower limit strongly affects the jitter result.',
    ),
  },
]

/** 四张任务卡：完成与否由当前设置和积分结果算出 */
export function taskItems(state: PnState, a: PnAnalysis): TaskItem[] {
  return [
    { id: 'l1k-high', text: S.task1, done: state.l1k >= -75 && !a.pass },
    { id: 'low-10k', text: S.task2, done: state.fLow >= 1e4 },
    { id: 'carrier-5g', text: S.task3, done: state.f0Ghz === 5 },
    { id: 'floor-read', text: S.task4, done: state.offsetExp >= 6 },
  ]
}

/** 右侧说明栏：给出抖动与预算的比较，超限时写出原因 */
export function verdictOf(state: PnState, a: PnAnalysis): { title: LText; text: LText } {
  const total = a.varFlicker + a.varFloor
  const share = (a.varFlicker / total) * 100
  const jitter = f2(a.jitterPs)
  if (a.pass) {
    return {
      title: S.vPass,
      text: loc(
        `积分抖动 ${jitter} ps，在 ${f1(JITTER_BUDGET_PS)} ps 预算以内。积分区间里 1/f² 段占相位方差的 ${f0(share)}%：离载波近的噪声在积分中占比最大，所以积分下限决定抖动的大小。`,
        `The integrated jitter is ${jitter} ps, within the ${f1(JITTER_BUDGET_PS)} ps budget. The 1/f² term is ${f0(share)}% of the phase variance in the band: noise near the carrier weighs most in the integral, so the lower limit sets the jitter.`,
      ),
    }
  }
  return {
    title: S.vFail,
    text: loc(
      `积分抖动 ${jitter} ps，超过 ${f1(JITTER_BUDGET_PS)} ps 预算，判 FAIL。原因：1/f² 段的 L(1 kHz) 偏高（${f0(state.l1k)} dBc/Hz），积分区间从 ${fmtFreq(state.fLow)} 开始，它占了 ${f0(share)}% 的相位方差。把积分下限抬高，或降低 L(1 kHz)，都能压低抖动。`,
      `The integrated jitter is ${jitter} ps, over the ${f1(JITTER_BUDGET_PS)} ps budget, so it FAILS. Reason: L(1 kHz) of the 1/f² term is high (${f0(state.l1k)} dBc/Hz), the band starts at ${fmtFreq(state.fLow)}, and it holds ${f0(share)}% of the phase variance. Raising the lower limit, or lowering L(1 kHz), reduces the jitter.`,
    ),
  }
}

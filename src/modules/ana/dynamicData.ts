import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type WindowKind } from './core/fft'
import { ADC_BITS, INPUT_AMP, SINAD_SPEC, type DynamicResult, type DynamicState } from './dynamicModel'

const IDEAL_10 = 6.02 * 10 + 1.76
const ENOB_50 = (50 - 1.76) / 6.02
const BACKOFF_DB = 20 * Math.log10(INPUT_AMP)

export const S = {
  kickerNow: loc('这一次采样', 'This capture'),
  introTitle: loc('动态参数：用一个正弦看 ADC 的频谱', 'Dynamic parameters: one sine wave, read the ADC spectrum'),
  coreTitle: loc('拨一拨：位数、噪声与谐波', 'Try it: bits, noise and harmonics'),
  coreNote: loc(
    '虚拟 ADC（VDUT-ADC2）的输入固定为 0.9 满量程的正弦。拨位数、输入噪声、HD2 与 HD3，下方频谱和读数随之变化；HD 拨到最左（−120 dBc）即关闭该项非线性。ENOB 公式里补上了 0.9 FS 输入的 0.92 dB 回退量。所有数值都是模型生成的示意结果。',
    'The virtual ADC (VDUT-ADC2) takes a sine fixed at 0.9 of full scale. Change the bits, input noise, HD2 and HD3, and the spectrum and readings follow; dragging an HD knob to the far left (−120 dBc) switches that nonlinearity off. The ENOB formula adds back the 0.92 dB backoff of this 0.9 FS input. All values are illustrative model output.',
  ),
  bitsLabel: loc('ADC 位数 N', 'ADC resolution N'),
  windowLabel: loc('分析窗', 'Analysis window'),
  noiseLabel: loc('输入噪声 σ', 'Input noise σ'),
  hd2Label: loc('二阶谐波 HD2 目标', 'Second harmonic HD2 target'),
  hd3Label: loc('三阶谐波 HD3 目标', 'Third harmonic HD3 target'),
  seedLabel: loc('随机种子（噪声的抽样）', 'Random seed (noise sampling)'),
  rIdeal: loc('理想 SNR（满量程，6.02N + 1.76）', 'Ideal SNR (full scale, 6.02N + 1.76)'),
  rIdealInput: loc('理想 SNR（本例 0.9 FS 输入）', 'Ideal SNR (this 0.9 FS input)'),
  rSnr: loc('SNR（不含谐波）', 'SNR (harmonics excluded)'),
  rSinad: loc('SINAD（含谐波）· 限值 50 dB', 'SINAD (with harmonics) · limit 50 dB'),
  rThd: loc('THD（HD2 … HD9 的 RMS 和）', 'THD (RMS sum of HD2 … HD9)'),
  rSfdr: loc('SFDR（基波 − 最大杂散）', 'SFDR (fundamental minus largest spur)'),
  rSpur: loc('限制 SFDR 的杂散', 'Spur that limits SFDR'),
  rEnob: loc('ENOB（有效位数）', 'ENOB (effective bits)'),
  spurNoise: loc('噪声 / 其它', 'Noise / other'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  asideLater: loc(
    '这一课只看动态指标（频谱里的信号、噪声与谐波）；静态的 INL、DNL 与采样混叠不在这里重复。',
    'This lesson looks only at dynamic metrics (signal, noise and harmonics in the spectrum); static INL and DNL and sampling aliasing are not repeated here.',
  ),
  nextPrefix: loc('下一课：', 'Next: '),
  task1: loc('把 ENOB 调到 7.0 – 7.5 之间（输入噪声可以把有效位数拉低）。', 'Bring ENOB into 7.0 – 7.5 (input noise can pull the effective bits down).'),
  task2: loc(
    '把 HD3 调到 −40 至 −45 dBc，使它成为限制 SFDR 的杂散，SFDR 落在 35 – 45 dB。',
    'Set HD3 to between −40 and −45 dBc so that it becomes the spur limiting SFDR, with SFDR between 35 and 45 dB.',
  ),
  task3: loc('让 SINAD 不低于 50 dB 的规格限值。', 'Get SINAD to at least the 50 dB spec limit.'),
  task4: loc(
    '用 12 位或更高的位数，把 SINAD 提到 70 dB 以上（噪声与谐波都要调小）。',
    'Use 12 bits or more and push SINAD above 70 dB (keep noise and harmonics small).',
  ),
}

export const FIG = {
  specAria: loc('频谱图：0 到 5 MHz，标出基波、HD2、HD3 与噪底', 'Spectrum: 0 to 5 MHz, marking the fundamental, HD2, HD3 and the noise floor'),
  specCap: loc(
    '横轴是频率（0–5 MHz，示意 fs = 10 MS/s），纵轴是每个频点的幅度，满量程正弦为 0 dBFS。相干采样让基波与每次谐波各占一个频点，标注的是它们的峰值；虚线是其余频点的平均高度，即噪底。红点是限制 SFDR 的那根杂散。',
    'The horizontal axis is frequency (0–5 MHz, illustrative fs = 10 MS/s); the vertical axis is each bin’s amplitude, with a full-scale sine at 0 dBFS. Coherent sampling puts the fundamental and each harmonic in one bin, and the labels mark their peaks; the dashed line is the average height of the other bins, the noise floor. The red dot is the spur that limits SFDR.',
  ),
  fund: loc('基波', 'Fund'),
  noise: loc('噪底', 'Noise floor'),
}

export const WINDOW_OPTIONS: Array<{ id: WindowKind; label: LText }> = [
  { id: 'blackman-harris', label: loc('Blackman-Harris 窗', 'Blackman-Harris window') },
  { id: 'hann', label: loc('Hann 窗', 'Hann window') },
]

export const BIT_OPTIONS: Array<{ id: string; label: LText }> = ADC_BITS.map((b) => ({
  id: String(b),
  label: loc(`${b} 位`, `${b}-bit`),
}))

export const INTRO: LText[] = [
  loc(
    '{@anaSampling} 讲了采样与混叠，{@anaFft} 讲了怎么从波形得到频谱。{@anaStatic} 讲的 INL、DNL 只看每个码的位置；这一课换成动态：给 ADC 一个正弦，它输出的频谱里有多少是信号、多少是噪声和谐波。',
    '{@anaSampling} covered sampling and aliasing, and {@anaFft} covered how to get a spectrum from a waveform. INL and DNL in {@anaStatic} only look at where each code sits; this lesson switches to dynamics: feed the ADC a sine and ask how much of its output spectrum is signal and how much is noise and harmonics.',
  ),
  loc(
    '这一课只练三件事：说清 SNR、SINAD、THD、SFDR 各是哪一块功率；用 ENOB 把测得的指标换算成“等效位数”；用 6.02N + 1.76 判断测得值是否合理，并找出限制它的那一项。',
    'This lesson practises three things: say which part of the power each of SNR, SINAD, THD and SFDR counts; convert the measured numbers into an effective bit count with ENOB; and use 6.02N + 1.76 to judge whether a reading is reasonable and find the term that limits it.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '位数越多，ENOB 一定越高。ENOB 是测出来的：输入噪声或谐波很大时，再多的位也被淹没，有效位数照样低。',
    'More bits always means a higher ENOB. ENOB is measured: with large input noise or harmonics, extra bits are buried and the effective bits stay low.',
  ),
  loc(
    'SFDR 就是 SNR。SNR 把全部噪声加起来，SFDR 只看最大的那一根杂散；两者算法不同，数值也可能差很多，不能互相换算。',
    'SFDR is the same as SNR. SNR adds up all the noise, while SFDR looks only at the largest single spur; the two use different rules, can differ a lot, and cannot be converted into each other.',
  ),
  loc(
    '谐波多就是噪声大。谐波是固定频点上的离散峰，噪声是铺满整个频带的底；它们在频谱上的形状不同，相干采样和窗函数就是为了把它们分开读。',
    'More harmonics means more noise. Harmonics are discrete peaks at fixed bins, while noise is a floor spread across the whole band; they look different on a spectrum, and coherent sampling plus a window exist to read them apart.',
  ),
]

export const TAKEAWAY: LText = loc(
  '满量程正弦下，SNR 只算噪声，SINAD 再加上谐波，ENOB = (SINAD − 1.76) / 6.02 把它折算成有效位数；THD 把 HD2 … HDn 的 RMS 相加，SFDR 只看最大的那一根杂散。读数要用相干采样加 Blackman-Harris 窗才准。',
  'For a full-scale sine, SNR counts only noise, SINAD adds harmonics, and ENOB = (SINAD − 1.76) / 6.02 turns that into effective bits; THD RMS-sums HD2 … HDn, and SFDR looks only at the largest spur. Readings are accurate only with coherent sampling and a Blackman-Harris window.',
)

/** 右侧说明栏：根据 SINAD 是否过限、主因是噪声还是谐波，给出结论和原因 */
export function verdictOf(state: DynamicState, result: DynamicResult): { title: LText; text: LText } {
  const sinad = result.sinad.toFixed(1)
  const snr = result.snr.toFixed(1)
  const thd = result.thd.toFixed(1)
  const enob = result.enob.toFixed(2)
  const idealIn = result.idealAtInput.toFixed(1)
  if (result.sinad < SINAD_SPEC) {
    if (result.thd > -result.snr) {
      return {
        title: S.fail,
        text: loc(
          `SINAD ${sinad} dB 低于 50 dB 限值，而且谐波功率比噪声还大（THD ${thd} dBc，SNR ${snr} dB）。主因是非线性：把 HD2 / HD3 调小，SINAD 才会回升。`,
          `SINAD ${sinad} dB is below the 50 dB limit, and the harmonics carry more power than the noise (THD ${thd} dBc, SNR ${snr} dB). The main cause is nonlinearity: lower HD2 / HD3 and SINAD will rise.`,
        ),
      }
    }
    return {
      title: S.fail,
      text: loc(
        `SINAD ${sinad} dB 低于 50 dB 限值，主因是噪声。${state.bits} 位理想 ADC 在 0.9 FS 输入下的上限就是 ${idealIn} dB（6.02N + 1.76 再减 0.92）。位数不够时，只把谐波调小也过不了限值。`,
        `SINAD ${sinad} dB is below the 50 dB limit, and noise is the main cause. An ideal ${state.bits}-bit ADC with a 0.9 FS input tops out at ${idealIn} dB (6.02N + 1.76 minus 0.92). With too few bits, cutting the harmonics alone will not pass.`,
      ),
    }
  }
  return {
    title: S.pass,
    text: loc(
      `SINAD ${sinad} dB ≥ 50 dB。ENOB = ${enob}，理想 ${state.bits} 位应为 ${state.bits}。两者的差，就是噪声与谐波占走的位数。`,
      `SINAD ${sinad} dB is at least 50 dB. ENOB is ${enob}, against an ideal ${state.bits}. The gap is the number of bits taken by noise and harmonics.`,
    ),
  }
}

/** 四张任务卡：完成与否由当前设置和结果算出，重置后随之还原 */
export function taskItems(state: DynamicState, result: DynamicResult): TaskItem[] {
  return [
    { id: 'enob', text: S.task1, done: result.enob >= 7 && result.enob <= 7.5 },
    {
      id: 'spur',
      text: S.task2,
      done: result.spurHarmonic === 3 && result.sfdr >= 35 && result.sfdr <= 45,
    },
    { id: 'sinad', text: S.task3, done: result.sinad >= SINAD_SPEC },
    { id: 'twelve', text: S.task4, done: state.bits >= 12 && result.sinad >= 70 },
  ]
}

/** 小测题干和选项里的数字全部由模型常数算出，改了模型，小测和解析自动跟着变 */
export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '一颗理想 10 位 ADC，用满量程正弦测 SNR，理论值约是多少？',
      'For an ideal 10-bit ADC tested with a full-scale sine, what is the theoretical SNR?',
    ),
    options: [
      { id: 'a', text: loc(`${(6.02 * 10).toFixed(1)} dB（只算 6.02N）`, `${(6.02 * 10).toFixed(1)} dB (6.02N only)`) },
      { id: 'b', text: loc(`${IDEAL_10.toFixed(1)} dB（6.02N + 1.76）`, `${IDEAL_10.toFixed(1)} dB (6.02N + 1.76)`) },
      { id: 'c', text: loc('50.0 dB', '50.0 dB') },
    ],
    answer: 'b',
    explain: loc(
      `满量程正弦的理想 SNR = 6.02 × 10 + 1.76 = ${IDEAL_10.toFixed(2)} dB。1.76 来自正弦波的峰均比：10·log10(3/2) ≈ 1.76 dB，只算 6.02N 会少这一项。`,
      `The ideal SNR of a full-scale sine is 6.02 × 10 + 1.76 = ${IDEAL_10.toFixed(2)} dB. The 1.76 comes from the sine’s peak-to-RMS ratio, 10·log10(3/2) ≈ 1.76 dB; using 6.02N alone drops this term.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '满量程正弦测得 SINAD = 50 dB，按 ENOB = (SINAD − 1.76) / 6.02 算，有效位数约是多少？',
      'A full-scale sine gives SINAD = 50 dB. Using ENOB = (SINAD − 1.76) / 6.02, about how many effective bits is that?',
    ),
    options: [
      { id: 'a', text: loc(`${ENOB_50.toFixed(1)} 位`, `${ENOB_50.toFixed(1)} bits`) },
      { id: 'b', text: loc(`${(50 / 6.02).toFixed(1)} 位`, `${(50 / 6.02).toFixed(1)} bits`) },
      { id: 'c', text: loc(`${((50 + 1.76) / 6.02).toFixed(1)} 位`, `${((50 + 1.76) / 6.02).toFixed(1)} bits`) },
    ],
    answer: 'a',
    explain: loc(
      `ENOB = (50 − 1.76) / 6.02 = ${ENOB_50.toFixed(2)}，约 8.0 位。先减 1.76 去掉正弦的理想项，再除以 6.02 把 dB 换成位。把 1.76 加上去或漏掉除法，都会得到别的数。`,
      `ENOB = (50 − 1.76) / 6.02 = ${ENOB_50.toFixed(2)}, about 8.0 bits. Subtract 1.76 first to remove the sine’s ideal term, then divide by 6.02 to convert dB into bits. Adding 1.76 or skipping the division gives a different number.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('关于 THD，下面哪句话是对的？', 'Which statement about THD is correct?'),
    options: [
      { id: 'a', text: loc('只看 HD2 的幅度，它就代表全部谐波', 'Only HD2’s amplitude matters; it stands for all harmonics') },
      { id: 'b', text: loc('把 HD2 … HDn 的 RMS 相加，再与基波之比', 'RMS-sum HD2 … HDn, then divide by the fundamental') },
      { id: 'c', text: loc('把全部噪声功率与基波之比', 'Total noise power divided by the fundamental') },
    ],
    answer: 'b',
    explain: loc(
      'THD = 20·log10(√(ΣA_h²) / A₁)，各次谐波的功率逐个相加。只看 HD2 会漏掉 HD3 及更高次的贡献；把全部噪声算进去的是 SINAD 或 SNR 的口径。',
      'THD = 20·log10(√(ΣA_h²) / A₁): each harmonic’s power is added in turn. Looking only at HD2 misses HD3 and higher; counting all the noise is the SNR or SINAD definition instead.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('测得 SFDR = 70 dBc，下面哪句解释最准确？', 'SFDR is measured at 70 dBc. Which explanation is most accurate?'),
    options: [
      { id: 'a', text: loc('总噪声比基波低 70 dB', 'Total noise is 70 dB below the fundamental') },
      { id: 'b', text: loc('最大的那一根杂散（谐波或噪声峰）比基波低 70 dB', 'The largest single spur (harmonic or noise peak) is 70 dB below the fundamental') },
      { id: 'c', text: loc(`有效位数是 ${(70 / 6.02).toFixed(1)} 位`, `The effective resolution is ${(70 / 6.02).toFixed(1)} bits`) },
    ],
    answer: 'b',
    explain: loc(
      'SFDR 只取最大的那一根杂散，不是总噪声，它说的是最坏的一根有多大。它和 SNR 的数值可能不同，所以不能互相换算。',
      'SFDR takes only the largest single spur, not the total noise; it tells you how big the worst single spur is. It can differ from SNR, so the two cannot be converted into each other.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('位数每加 1 位，理想 SNR 大约提高多少？', 'When the resolution increases by one bit, about how much does the ideal SNR rise?'),
    options: [
      { id: 'a', text: loc('6.02 dB', '6.02 dB') },
      { id: 'b', text: loc('3.01 dB', '3.01 dB') },
      { id: 'c', text: loc('1.76 dB', '1.76 dB') },
    ],
    answer: 'a',
    explain: loc(
      'SNR = 6.02N + 1.76，N 每加 1，SNR 加 6.02 dB。每多一位，LSB 减半，量化噪声功率降到原来的 1/4，即 6.02 dB。',
      'SNR = 6.02N + 1.76, so each extra bit adds 6.02 dB. One more bit halves the LSB, cutting the quantization noise power to one quarter, which is 6.02 dB.',
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      '输入幅度只有 0.9 FS（约 −0.92 dBFS），理想 SNR 比满量程正弦低多少？',
      'The input amplitude is only 0.9 FS (about −0.92 dBFS). By how much is the ideal SNR lower than for a full-scale sine?',
    ),
    options: [
      { id: 'a', text: loc('0.0 dB，幅度不影响 SNR', '0.0 dB; amplitude does not affect SNR') },
      { id: 'b', text: loc(`${(-BACKOFF_DB * 2).toFixed(1)} dB`, `${(-BACKOFF_DB * 2).toFixed(1)} dB`) },
      { id: 'c', text: loc(`${(-BACKOFF_DB).toFixed(1)} dB`, `${(-BACKOFF_DB).toFixed(1)} dB`) },
    ],
    answer: 'c',
    explain: loc(
      `信号功率少了 ${(-BACKOFF_DB).toFixed(2)} dB（20·log10(0.9)），噪声不变，所以理想 SNR 也低约 0.9 dB。这就是页面上「理想 SNR（本例 0.9 FS 输入）」比 6.02N + 1.76 低的原因。`,
      `Signal power is ${(-BACKOFF_DB).toFixed(2)} dB lower (20·log10(0.9)) while the noise stays the same, so the ideal SNR is about 0.9 dB lower. That is why the page’s “ideal SNR (this 0.9 FS input)” sits below 6.02N + 1.76.`,
    ),
  },
]
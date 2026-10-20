import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type WindowKind } from './core/fft'
import {
  BIN_KHZ,
  COH_TASK_PCT,
  FS_KHZ,
  FUND_TASK_PCT,
  N_POINTS,
  READ_LIMIT_PCT,
  RECT_MIDWAY_DB,
  RECT_MIDWAY_GAIN,
  fmtPct,
  type FftResult,
  type FftState,
  type SampleMode,
} from './fftModel'
import { aliasFreq } from './samplingModel'

const f1 = (value: number) => value.toFixed(1)
const f3 = (value: number) => value.toFixed(3)

/** 读数落在 ±READ_LIMIT_PCT 以内为 pass，否则 fail */
export function stateOf(errPct: number): 'pass' | 'fail' {
  return Math.abs(errPct) <= READ_LIMIT_PCT ? 'pass' : 'fail'
}

export const MODE_OPTIONS: Array<{ id: SampleMode; label: LText }> = [
  { id: 'nonCoherent', label: loc('非相干', 'Non-coherent') },
  { id: 'coherent', label: loc('相干 M·fs/N', 'Coherent M·fs/N') },
]

export const WIN_OPTIONS: Array<{ id: WindowKind; label: LText }> = [
  { id: 'rect', label: loc('矩形 rect', 'Rectangular') },
  { id: 'hann', label: loc('汉宁 Hann', 'Hann') },
  { id: 'blackman-harris', label: loc('Blackman-Harris', 'Blackman-Harris') },
]

export const S = {
  kickerNow: loc('这一次记录', 'This record'),
  nextPrefix: loc('下一课：', 'Next: '),
  introTitle: loc('时域的波形，频域的谱线', 'A waveform in time, lines in frequency'),
  coreTitle: loc('拨一拨：采样方式、窗函数与 f_in', 'Try it: sampling mode, window and f_in'),
  coreNote: loc(
    '上图是 N 点时域记录，下图是它的幅度谱。基波的真值是 1 V，HD2 为 1.0%，HD3 为 0.3%；看看谱线读数离真值有多远。',
    'The top plot is the N-point time record and the bottom plot is its amplitude spectrum. The true fundamental is 1 V, HD2 is 1.0% and HD3 is 0.3%; check how far the line readings sit from these.',
  ),
  modeLabel: loc('采样方式', 'Sampling mode'),
  winLabel: loc('窗函数', 'Window'),
  finLabel: loc('基波 f_in (kHz)', 'Fundamental f_in (kHz)'),
  rBin: loc('谱线间隔 Δf = fs / N', 'Bin spacing Δf = fs / N'),
  rTrue: loc('真值（发生器设定）', 'True values (generator setting)'),
  rF0: loc('实际基波频率 f0', 'Actual fundamental f0'),
  rFund: loc('基波读数', 'Fundamental reading'),
  rHd2: loc('HD2 读数（占基波）', 'HD2 reading (of fundamental)'),
  rHd3: loc('HD3 读数（占基波）', 'HD3 reading (of fundamental)'),
  rVerdict: loc(`判定（误差 ±${READ_LIMIT_PCT}% 以内）`, `Verdict (error within ±${READ_LIMIT_PCT}%)`),
  pass: loc('三项都在限内', 'All three within limit'),
  fail: loc('至少一项超差', 'At least one out of limit'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    'ENOB、SFDR、THD 的完整定义和判定，放到动态参数那一课；这里只练读谱线、看泄漏、会用相干采样。',
    'The full definitions and limits of ENOB, SFDR and THD are covered in the dynamic-parameter lesson; here we only practise reading lines, spotting leakage and using coherent sampling.',
  ),
  task1: loc(
    '保持非相干，换一个非矩形窗，使 HD3 读数误差在 ±3% 以内。提示：f_in 落在谱线中心附近（如 8.3 kHz）时泄漏很小，但换一个 f_in 就会再错。',
    'Keep non-coherent, switch to a non-rectangular window and bring the HD3 reading error within ±3%. Hint: near a line centre (such as 8.3 kHz) leakage is tiny, but another f_in will bring the error back.',
  ),
  task2: loc(
    '切到相干采样，使 HD2、HD3 的读数误差都不超过 0.5%。',
    'Switch to coherent sampling so the HD2 and HD3 reading errors are both within 0.5%.',
  ),
  task3: loc(
    '使基波读数误差不超过 ±1%（相干或非相干都行，但要选对 f_in 或窗函数）。',
    'Bring the fundamental reading error within ±1% (coherent or non-coherent both work; choose f_in or the window correctly).',
  ),
  vCoh: loc('相干采样：整数个周期，没有泄漏', 'Coherent sampling: whole cycles, no leakage'),
  vLucky: loc('碰巧读准：f_in 落在谱线中心', 'Read correctly by luck: f_in on a line centre'),
  vLeak: loc('频谱泄漏：峰值读数偏低', 'Spectral leakage: peak readings low'),
  vWin: loc('窗函数压住了远处泄漏', 'The window suppresses far leakage'),
  vOff: loc('窗函数还不够：峰值仍偏', 'The window is not enough: peaks still off'),
}

export const FIG = {
  timeAria: loc('时域图：N 点记录与所选窗的包络', 'Time-domain plot: N-point record and the envelope of the chosen window'),
  timeCap: loc(
    '蓝线是记录的前 N 个点（对应 N / fs 的时长）。非矩形窗时，虚线是窗的包络：记录两端被压向零，截断的跳变变小。',
    'The blue curve is the N-point record, lasting N / fs. For a non-rectangular window the dashed line is the window envelope: the record ends are pulled toward zero, so the truncation jump shrinks.',
  ),
  freqAria: loc('频谱图：0 到 50 kHz 的幅度谱，标出基波、HD2、HD3 的读数谱线', 'Spectrum: amplitude spectrum from 0 to 50 kHz, marking the fundamental, HD2 and HD3 reading lines'),
  freqCap: loc(
    '横轴是频率，谱线间隔 Δf = fs / N；纵轴是 dBV（1 V 峰值为 0 dBV）。读数取谱线附近的最大值；非相干时能量分散到邻近谱线，峰值会偏低。',
    'The horizontal axis is frequency, with bin spacing Δf = fs / N; the vertical axis is dBV (1 V peak = 0 dBV). A reading takes the maximum near each line; in non-coherent sampling the energy spreads to neighbouring lines and the peak reads low.',
  ),
  fund: loc('基波', 'Fund'),
  hd2: loc('HD2', 'HD2'),
  hd3: loc('HD3', 'HD3'),
}

export const INTRO = [
  loc(
    '{@anaSampling} 讲的是采样率和混叠。采样之后，ADC 得到的是 N 个数。要看它含有哪些频率成分，就做 FFT：把时域记录变成频域的谱线，相邻两根谱线相隔 Δf = fs / N。',
    'The {@anaSampling} lesson covered sampling rate and aliasing. After sampling the ADC holds N numbers. To see which frequencies they contain, run an FFT: the time record becomes spectral lines spaced Δf = fs / N apart.',
  ),
  loc(
    '这一课练三件事：算出谱线间隔 Δf；看懂窗函数和频谱泄漏为什么让峰值读数偏；用相干采样让基波和谐波都落在整数谱线上。HD2、HD3 这类谐波读数，是后面失真类参数的基础。',
    'This lesson practises three things: compute the bin spacing Δf; understand why windows and spectral leakage bias peak readings; use coherent sampling so the fundamental and harmonics land on whole bins. Harmonic readings such as HD2 and HD3 underpin the distortion parameters that follow.',
  ),
]

const RECT_DB_TXT = RECT_MIDWAY_DB.toFixed(1)

export const MISCONCEPTIONS: LText[] = [
  loc(
    '增加 N 就能消除泄漏。N 变大只让谱线更密（Δf = fs/N 变小），f_in 与谱线中心的相对位置不变，非相干时泄漏的相对比例几乎不变。消除泄漏要靠相干采样，让 M·fs/N 整数化。',
    'Increasing N removes leakage. A larger N only packs the lines more tightly (Δf = fs/N shrinks); the position of f_in relative to a line centre stays the same, so in non-coherent sampling the leakage fraction barely changes. Leakage is removed by coherent sampling, which makes M·fs/N an exact whole bin.',
  ),
  loc(
    `加了窗函数，泄漏就没有了。窗函数压的是远处的旁瓣，代价是主瓣变宽；峰值读数仍取决于 f_in 离谱线中心多远，矩形窗最坏时峰值偏低约 ${RECT_DB_TXT} dB。`,
    `Adding a window removes leakage. A window suppresses far sidelobes at the cost of a wider main lobe; the peak reading still depends on how far f_in sits from a line centre, and the worst case for a rectangular window reads about ${RECT_DB_TXT} dB low.`,
  ),
  loc(
    '相干采样只要 f_in 是整数 kHz 就行。相干要求 f_in = M·fs/N，M 与 N 互质；还要求激励源与采样时钟同源，否则记录内相位漂移，整周期条件就不成立。',
    'Coherent sampling only needs f_in to be a whole number of kHz. Coherence requires f_in = M·fs/N with M coprime to N, and the stimulus must share a clock with the sampler; otherwise the phase drifts inside the record and the whole-cycle condition fails.',
  ),
]

export const TAKEAWAY: LText = loc(
  '谱线间隔 Δf = fs / N；非相干时峰值因泄漏和扇形损失而偏低，窗函数只能压远处旁瓣，不能消除偏差；相干采样让 M·fs/N 落在整数谱线上、M 与 N 互质，基波和谐波的读数才能精确。',
  'The bin spacing is Δf = fs / N. In non-coherent sampling peaks read low from leakage and scalloping; a window only suppresses far sidelobes and cannot remove the bias. Coherent sampling puts M·fs/N on an exact whole bin, with M coprime to N, so fundamental and harmonic readings become exact.',
)

/** 右侧说明栏：根据当前设置与结果给出结论和原因 */
export function verdictOf(state: FftState, r: FftResult): { title: LText; text: LText } {
  const fin = f3(r.f0)
  const off = r.offsetBins.toFixed(2)
  const err = loc(
    `基波 ${fmtPct(r.errFund)}，HD2 ${fmtPct(r.errHd2)}，HD3 ${fmtPct(r.errHd3)}`,
    `fundamental ${fmtPct(r.errFund)}, HD2 ${fmtPct(r.errHd2)}, HD3 ${fmtPct(r.errHd3)}`,
  )
  const errZh = err.zh
  const errEn = err.en ?? ''
  if (state.mode === 'coherent') {
    return {
      title: S.vCoh,
      text: loc(
        `相干采样：实际 f_in = M·fs/N = ${r.m} × ${FS_KHZ} / ${N_POINTS} kHz = ${fin} kHz，整数个周期正好装进 ${N_POINTS} 点记录，首尾相接没有截断跳变，能量只落在一根谱线上。读数误差：${errZh}。`,
        `Coherent sampling: the actual f_in = M·fs/N = ${r.m} × ${FS_KHZ} / ${N_POINTS} kHz = ${fin} kHz, a whole number of cycles fits exactly in the ${N_POINTS}-point record, so the ends join with no truncation jump and the energy sits on one line. Reading errors: ${errEn}.`,
      ),
    }
  }
  if (r.pass && state.win === 'rect') {
    return {
      title: S.vLucky,
      text: loc(
        `矩形窗下 f_in = ${fin} kHz 离谱线中心只差 ${off} 根，泄漏本来就小，读数误差：${errZh}。这是 f_in 碰巧落在谱线附近的结果，换一个 f_in 就会变。`,
        `With the rectangular window f_in = ${fin} kHz sits only ${off} lines from a line centre, so leakage is already small and the reading errors are ${errEn}. This is luck from f_in landing near a line centre; another f_in will change it.`,
      ),
    }
  }
  if (r.pass) {
    return {
      title: S.vWin,
      text: loc(
        `非相干 + 非矩形窗：窗函数压低了远处的泄漏，读数误差：${errZh}。但 f_in 离谱线中心还差 ${off} 根，窗函数只压旁瓣，不能让峰值回到真值，换 f_in 就会再错。`,
        `Non-coherent with a non-rectangular window: the window suppresses far leakage and the reading errors are ${errEn}. But f_in sits ${off} lines from a line centre, and a window only suppresses sidelobes; it cannot bring the peak back to truth, so another f_in will be off again.`,
      ),
    }
  }
  if (state.win === 'rect') {
    return {
      title: S.vLeak,
      text: loc(
        `非相干 + 矩形窗：f_in = ${fin} kHz 不在谱线中心（离中心 ${off} 根），能量泄漏到邻近谱线，基波被削平。读数误差：${errZh}。矩形窗的旁瓣最高，HD2、HD3 也被泄漏搅乱。`,
        `Non-coherent with a rectangular window: f_in = ${fin} kHz is not on a line centre (${off} lines away), so energy leaks into neighbouring lines and the fundamental is flattened. Reading errors: ${errEn}. The rectangular window has the highest sidelobes, so HD2 and HD3 are also scrambled by leakage.`,
      ),
    }
  }
  return {
    title: S.vOff,
    text: loc(
      `非相干 + 非矩形窗：窗函数已压低远处泄漏，但 f_in 离谱线中心还差 ${off} 根，峰值仍偏。读数误差：${errZh}。窗函数不能消除这种偏差，要换相干采样，或把 f_in 调到谱线上。`,
      `Non-coherent with a non-rectangular window: the window already lowers far leakage, but f_in is still ${off} lines from a line centre and the peaks stay off. Reading errors: ${errEn}. A window cannot remove this bias; use coherent sampling, or move f_in onto a line.`,
    ),
  }
}

/** 三张任务卡：完成与否由当前设置和读数算出 */
export function taskItems(state: FftState, r: FftResult): TaskItem[] {
  return [
    {
      id: 'hd3',
      text: S.task1,
      done: state.mode === 'nonCoherent' && state.win !== 'rect' && Math.abs(r.errHd3) <= READ_LIMIT_PCT,
    },
    {
      id: 'coh',
      text: S.task2,
      done: state.mode === 'coherent' && Math.abs(r.errHd2) <= COH_TASK_PCT && Math.abs(r.errHd3) <= COH_TASK_PCT,
    },
    {
      id: 'fund',
      text: S.task3,
      done: Math.abs(r.errFund) <= FUND_TASK_PCT,
    },
  ]
}

/** 小测题干里的数字全部由模型算出，改了模型，小测和解析自动跟着变 */
const Q5_ALIAS = aliasFreq(3 * 30, FS_KHZ)
const Q1_BIN_HZ = f1(BIN_KHZ * 1000)
const Q6_ERR_PCT = (RECT_MIDWAY_GAIN - 1) * 100

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(`fs = ${FS_KHZ} kHz，N = ${N_POINTS}。FFT 的谱线间隔 Δf 是多少？`, `fs = ${FS_KHZ} kHz and N = ${N_POINTS}. What is the FFT bin spacing Δf?`),
    options: [
      { id: 'a', text: loc('1.0 kHz', '1.0 kHz') },
      { id: 'b', text: loc('976.6 Hz', '976.6 Hz') },
      { id: 'c', text: loc(`${Q1_BIN_HZ} Hz`, `${Q1_BIN_HZ} Hz`) },
    ],
    answer: 'c',
    explain: loc(
      `Δf = fs / N = ${FS_KHZ} kHz / ${N_POINTS} ≈ ${Q1_BIN_HZ} Hz。976.6 Hz 是把 fs 误当成 1 MHz 算出来的。`,
      `Δf = fs / N = ${FS_KHZ} kHz / ${N_POINTS} ≈ ${Q1_BIN_HZ} Hz. 976.6 Hz comes from wrongly taking fs as 1 MHz.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('非相干采样时，能量从一根谱线分散到邻近谱线，这种现象叫什么？', 'In non-coherent sampling, energy spreads from one line into its neighbours. What is this called?'),
    options: [
      { id: 'a', text: loc('频谱泄漏', 'Spectral leakage') },
      { id: 'b', text: loc('混叠', 'Aliasing') },
      { id: 'c', text: loc('量化噪声', 'Quantization noise') },
    ],
    answer: 'a',
    explain: loc(
      '记录在非整数周期处被截断，截断的跳变把能量分散到邻近谱线，这就是频谱泄漏。混叠是采样时的折叠，是另一回事，见 {@anaSampling}。',
      'The record is cut at a non-integer number of cycles, and the cut-off jump spreads energy into neighbouring lines; that is spectral leakage. Aliasing is folding during sampling, a different effect; see {@anaSampling}.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(`N = ${N_POINTS} 时，相干采样的 M 应满足什么条件？`, `With N = ${N_POINTS}, what must M satisfy for coherent sampling?`),
    options: [
      { id: 'a', text: loc('M 为偶数', 'M is even') },
      { id: 'b', text: loc('M 是 2 的幂', 'M is a power of 2') },
      { id: 'c', text: loc('M 与 N 互质，即 M 为奇数', 'M is coprime to N, i.e. M is odd') },
    ],
    answer: 'c',
    explain: loc(
      'M 与 N 有公因数时，N 点的采样相位只会取到 N / gcd 个值（M = 4 时只有 256 个），ADC 码型覆盖不全，谐波也容易和基波挤在同一组相位上。1024 = 2¹⁰，与它互质等价于 M 为奇数。',
      'If M shares a factor with N, the N sample phases take only N / gcd distinct values (only 256 when M = 4), so ADC codes are covered poorly and harmonics bunch on the same phase set as the fundamental. Since 1024 = 2¹⁰, being coprime to it means M is odd.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('把矩形窗换成 Hann 窗，频谱上最直接的变化是什么？', 'Switching from a rectangular window to a Hann window, what is the most direct change in the spectrum?'),
    options: [
      { id: 'a', text: loc('主瓣变窄，分辨率更高', 'The main lobe narrows and resolution improves') },
      { id: 'b', text: loc('远处旁瓣变高', 'Far sidelobes get higher') },
      { id: 'c', text: loc('远处旁瓣明显降低，但主瓣变宽', 'Far sidelobes drop a lot, but the main lobe widens') },
    ],
    answer: 'c',
    explain: loc(
      'Hann 窗把记录两端平滑压到零，截断跳变变小，首旁瓣约 −31 dB，矩形窗约 −13 dB。代价是主瓣更宽，相邻谱线分到的能量更多，所以它不是消除泄漏的办法。',
      'The Hann window tapers both ends of the record to zero, so the truncation jump shrinks; its first sidelobe is about −31 dB versus about −13 dB for rectangular. The cost is a wider main lobe that spreads more energy to neighbouring lines, so it is not a cure for leakage.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      `fs = ${FS_KHZ} kHz 的数字化仪采一个 30 kHz 基波的三次谐波（90 kHz）。ADC 看到的频率是多少？`,
      `A ${FS_KHZ} kHz digitizer samples the third harmonic (90 kHz) of a 30 kHz fundamental. What frequency does the ADC see?`,
    ),
    options: [
      { id: 'a', text: loc(`${f1(Q5_ALIAS)} kHz`, `${f1(Q5_ALIAS)} kHz`) },
      { id: 'b', text: loc('90.0 kHz', '90.0 kHz') },
      { id: 'c', text: loc('30.0 kHz', '30.0 kHz') },
    ],
    answer: 'a',
    explain: loc(
      `90 kHz 超过 fs/2 = ${f1(FS_KHZ / 2)} kHz，折叠到 |90 − round(0.9) × ${FS_KHZ}| = ${f1(Q5_ALIAS)} kHz。这就是为什么 HD 的测量要保证谐波在 fs/2 以内，见 {@anaSampling}。`,
      `90 kHz is above fs/2 = ${f1(FS_KHZ / 2)} kHz, so it folds to |90 − round(0.9) × ${FS_KHZ}| = ${f1(Q5_ALIAS)} kHz. This is why HD measurements must keep harmonics below fs/2; see {@anaSampling}.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('非相干矩形窗，f_in 恰好位于两根谱线正中间。峰值读数相对真值大约偏多少？', 'Non-coherent rectangular window, with f_in exactly midway between two lines. About how far off is the peak reading from truth?'),
    options: [
      { id: 'a', text: loc('-3.9%', '-3.9%') },
      { id: 'b', text: loc('+36%', '+36%') },
      { id: 'c', text: loc(fmtPct(Q6_ERR_PCT), fmtPct(Q6_ERR_PCT)) },
    ],
    answer: 'c',
    explain: loc(
      `两根邻近谱线离 f_in 都是半根谱线。矩形窗在这一点的峰值是 2/π ≈ ${RECT_MIDWAY_GAIN.toFixed(3)}，换成 dB 是 ${RECT_DB_TXT} dB，所以峰值偏低约 36%。这是非相干矩形窗的最坏情况，相干采样让它为零。`,
      `Both neighbouring lines are half a line away from f_in. The rectangular window gives a peak of 2/π ≈ ${RECT_MIDWAY_GAIN.toFixed(3)} at this point, which is ${RECT_DB_TXT} dB, so the peak reads about 36% low. This is the worst case for non-coherent rectangular sampling; coherent sampling makes it zero.`,
    ),
  },
]
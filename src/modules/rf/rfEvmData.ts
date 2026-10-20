import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { ACPR_OK_DB, analyseEvm, type EvmAnalysis, type EvmState, EVM_OK_PCT } from './evmModel'

/** 输入回退滑条的范围（dB） */
export const IBO = { min: 0, max: 12, step: 0.5 }

const f0 = (value: number) => value.toFixed(0)
const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

/** 小测与解析里引用的数字，都由模型在加载时算出（与页面同一套计算） */
const EX_QPSK_0 = analyseEvm({ scheme: 'qpsk', ibo: 0 })
const EX_QPSK_2 = analyseEvm({ scheme: 'qpsk', ibo: 2 })
const EX_QPSK_6 = analyseEvm({ scheme: 'qpsk', ibo: 6 })
const EX_QAM_0 = analyseEvm({ scheme: 'qam16', ibo: 0 })

export const S = {
  kickerNow: loc('这一次失真', 'This distortion'),
  introTitle: loc('EVM 与 ACPR：一个看符号，一个看频谱', 'EVM and ACPR: one looks at symbols, one at the spectrum'),
  coreTitle: loc('拨一拨：输入回退与调制方式', 'Try it: input back-off and modulation'),
  coreNote: loc(
    '功放用 Rapp 模型压缩幅度：输入越接近饱和，压缩越重。左图是星座：空心叉是理想符号，实心点是功放输出经过接收滤波、对齐后的符号。右图是 AM/AM 曲线。下方是频谱：灰线是线性输出，橙线是失真输出。',
    'The amplifier compresses amplitude with a Rapp model: the closer the input is to saturation, the stronger the compression. Left: the constellation, with hollow crosses for ideal symbols and solid dots for the amplifier output after receive filtering and alignment. Right: the AM/AM curve. Below: the spectrum, with grey for the linear output and orange for the distorted output.',
  ),
  schemeLabel: loc('调制方式', 'Modulation'),
  iboLabel: loc('输入回退 IBO (dB)', 'Input back-off IBO (dB)'),
  rEvm: loc('EVM（符号误差）', 'EVM (symbol error)'),
  rAcpr: loc('ACPR（邻道泄漏）', 'ACPR (adjacent-channel leakage)'),
  rAcprIdeal: loc('线性输出的 ACPR（对照）', 'ACPR of the linear output (reference)'),
  rPapr: loc('峰均比 PAPR', 'Peak-to-average ratio (PAPR)'),
  rPeak: loc('峰值输入 / 饱和（饱和 = 1）', 'Peak input / saturation (saturation = 1)'),
  rVerdict: loc('判定（示意门限）', 'Verdict (illustrative limits)'),
  pass: loc('合格', 'Pass'),
  fail: loc('超标', 'Over limit'),
  vBoth: loc('两项都在示意门限内', 'Both within the illustrative limits'),
  vEvmOnly: loc('EVM 合格，但 ACPR 超标', 'EVM passes, but ACPR fails'),
  vAcprOnly: loc('EVM 超标，但 ACPR 合格', 'EVM fails, but ACPR passes'),
  vBothBad: loc('两项都超标', 'Both over limit'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的 EVM 与 ACPR 还要考虑滤波器、载波泄漏、相位噪声、功放的 AM/PM 以及数字预失真（DPD）；这一课只用 AM/AM 压缩和理想接收滤波。',
    'Real EVM and ACPR also involve filters, carrier leakage, phase noise, AM/PM in the amplifier and digital predistortion (DPD); this lesson uses only AM/AM compression and an ideal receive filter.',
  ),
  nextPrefix: loc('下一课：', 'Next: '),
  task1: loc('切换到 16QAM，在同样的回退下，EVM 比 QPSK 大得多。', 'Switch to 16QAM: at the same back-off its EVM is much higher than QPSK.'),
  task2: loc('在 16QAM 下把 IBO 降到 2 dB 以下，让 EVM 和 ACPR 都超过示意门限。', 'In 16QAM, drop IBO below 2 dB so that both EVM and ACPR exceed the illustrative limits.'),
  task3: loc('找到 EVM 合格、ACPR 超标的设置（例如 QPSK、IBO 调到 2 dB）。', 'Find a setting where EVM passes but ACPR fails (for example QPSK at IBO 2 dB).'),
  task4: loc('把 IBO 提到 10 dB 以上，让 EVM 与 ACPR 都回到示意门限以内。', 'Raise IBO to 10 dB or more so that EVM and ACPR both return within the illustrative limits.'),
  reasonEvm: loc(
    'EVM 超标的原因：峰值段被压缩，幅度被压低、星座点向中心收缩，符号偏离了理想位置。',
    'Why EVM fails: the peaks are compressed, amplitudes are pulled down and the constellation points shrink towards the centre, so symbols move away from their ideal positions.',
  ),
  reasonAcpr: loc(
    'ACPR 超标的原因：压缩产生的互调分量落进了相邻信道，频谱被“再生”出来。',
    'Why ACPR fails: intermodulation from compression lands in the adjacent channels, so the spectrum regrows.',
  ),
}

export const FIG = {
  constAria: loc('星座图：空心叉为理想符号，实心点为对齐后的功放输出', 'Constellation: hollow crosses are ideal symbols, solid dots are the aligned amplifier output'),
  constCap: loc(
    '空心 × 是理想符号，实心点是功放输出经过接收滤波、对齐后的符号。点离叉越远，EVM 越大。',
    'Hollow × marks are ideal symbols; solid dots are the amplifier output after receive filtering and alignment. The further a dot sits from its cross, the larger the EVM.',
  ),
  rappAria: loc('Rapp AM/AM 曲线：输出幅度随输入幅度趋于饱和，标出平均与峰值的工作点', 'Rapp AM/AM curve: output amplitude levels off towards saturation, with the average and peak operating points marked'),
  rappCap: loc(
    '曲线越贴近虚线越线性。峰值进入弯折区的那一段，幅度被压低，符号也就偏了。',
    'The closer the curve stays to the dashed diagonal, the more linear it is. The part of a peak that enters the bend is pulled down, and the symbols move with it.',
  ),
  specAria: loc('频谱图：灰线为线性输出，橙线为失真输出，金色为主信道，灰色块为相邻信道', 'Spectrum: grey line is the linear output, orange line the distorted output, gold band the main channel, grey bands the adjacent channels'),
  specCap: loc(
    '横轴是频率，单位为符号率。中间金色是主信道，两侧灰色是相邻信道；橙线在灰色块里高出灰线的部分，就是落进邻道的频谱再生。',
    'The horizontal axis is frequency in symbol rates. The gold band in the middle is the main channel and the grey bands on either side are adjacent channels; where the orange line rises above grey inside those bands is spectral regrowth.',
  ),
}

export const INTRO = [
  loc(
    '{@rfModulation} 讲了星座：符号是平面上的点，点之间的距离决定了能容忍多大的误差。这一课把发射机和功放接进来：功放在输入接近饱和时压缩幅度，符号被推偏，频谱也被撑宽。两个指标分别描述这两种后果。',
    'In {@rfModulation} symbols were points on a plane, and the spacing between points set how much error could be tolerated. This lesson adds the transmitter and the amplifier: near saturation the amplifier compresses amplitude, pushing symbols off position and widening the spectrum. Two metrics describe the two consequences.',
  ),
  loc(
    'EVM 是接收符号偏离理想符号的均方根，反映星座上的符号误差；ACPR 是泄漏到相邻信道的功率与主信道功率之比，反映频谱再生。这一课只练两件事：读出 EVM% 与 ACPR；对比理想与失真的信号，看清它们为什么会同时变化。',
    'EVM is the RMS deviation of received symbols from their ideal positions, reflecting symbol error on the constellation; ACPR is the power leaking into adjacent channels relative to the main channel, reflecting spectral regrowth. This lesson practises two things: reading EVM in percent and ACPR, and comparing ideal and distorted signals to see why they change together.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    'EVM 小，ACPR 就一定小。两者量的东西不同：EVM 只看符号采样点，ACPR 看整段频谱。按本站的示意门限，QPSK 在 2 dB 回退时 EVM 合格，ACPR 却超标。',
    'A small EVM means a small ACPR. The two measure different things: EVM looks at the symbol sampling points, ACPR at the whole spectrum. With this site’s illustrative limits, QPSK at 2 dB back-off passes EVM but fails ACPR.',
  ),
  loc(
    'EVM 是某一个点的误差。它是所有参与统计的符号误差的均方根，并且要先做增益和相位对齐。',
    'EVM is not the error of one point. It is the RMS of the errors over all symbols counted, computed after gain and phase alignment.',
  ),
  loc(
    '回退越多越好，没有代价。回退越多线性越好，但输出功率通常下降、效率也会下降；这一课只建模线性指标，不建模这些代价。',
    'More back-off is always better at no cost. More back-off makes the output more linear, but output power usually drops and so does efficiency; this lesson models only the linearity metrics, not these costs.',
  ),
]

export const TAKEAWAY: LText = loc(
  'EVM(%) = √(Σ|err|² / Σ|ref|²) × 100，计算前先做增益和相位对齐；EVM 反映符号误差，在星座上看是点的散开。ACPR（dBc）= 10·log10(P_相邻 / P_主)，越负越好，反映压缩产生的频谱再生，在频谱上看是邻道被抬高。两者都随输入回退变化，但一个合格不能代替另一个。',
  'EVM(%) = √(Σ|err|² / Σ|ref|²) × 100, computed after gain and phase alignment; EVM reflects symbol error, which shows on the constellation as points spreading out. ACPR (dBc) = 10·log10(P_adj / P_main), the more negative the better; it reflects spectral regrowth from compression, which shows on the spectrum as the adjacent channels rising. Both change with input back-off, but passing one does not mean passing the other.',
)

function join(parts: LText[]): LText {
  return loc(
    parts.map((part) => part.zh).join(''),
    parts.map((part) => part.en ?? part.zh).join(' '),
  )
}

/** 右侧说明栏：根据 EVM 与 ACPR 给结论，并说明超标的原因 */
export function verdictOf(state: EvmState, a: EvmAnalysis): { title: LText; text: LText } {
  const evmOk = a.evmPct <= EVM_OK_PCT
  const acprOk = a.acprDb <= ACPR_OK_DB
  const evmTxt = `${f2(a.evmPct)} %`
  const acprTxt = `${f1(a.acprDb)} dBc`
  let title = S.vBothBad
  if (evmOk && acprOk) {
    title = S.vBoth
  } else if (evmOk) {
    title = S.vEvmOnly
  } else if (acprOk) {
    title = S.vAcprOnly
  }

  const parts: LText[] = []
  if (evmOk && acprOk) {
    parts.push(
      loc(
        `EVM ${evmTxt}，符号基本没有被推偏；ACPR ${acprTxt}，邻道泄漏很少。峰值输入 ${f2(a.peakIn)} 离饱和还有余量。`,
        `EVM is ${evmTxt}, so symbols are barely pushed off position; ACPR is ${acprTxt}, so little leaks into the neighbours. The peak input is ${f2(a.peakIn)}, still short of saturation.`,
      ),
    )
  } else {
    parts.push(
      loc(
        `当前 EVM ${evmTxt}，ACPR ${acprTxt}。`,
        `Currently EVM is ${evmTxt} and ACPR is ${acprTxt}.`,
      ),
    )
  }
  if (!evmOk) {
    parts.push(S.reasonEvm)
  }
  if (!acprOk) {
    parts.push(S.reasonAcpr)
  }
  if (evmOk && !acprOk) {
    parts.push(
      loc(
        `EVM 只看符号采样点上的平均误差，它合格并不能说明频谱合格。线性输出的 ACPR 只有 ${f1(a.acprIdealDb)} dBc，超标部分全部来自功放的压缩。`,
        `EVM looks only at the average error at the symbol sampling points, so passing it does not mean the spectrum passes. The linear output has an ACPR of only ${f1(a.acprIdealDb)} dBc; the excess comes entirely from amplifier compression.`,
      ),
    )
  }
  const schemeNote =
    state.scheme === 'qam16'
      ? loc(
          `16QAM 的峰均比 ${f1(a.papr)} dB 较高，更多符号落进压缩区。`,
          `16QAM has a high peak-to-average ratio of ${f1(a.papr)} dB, so more symbols fall into the compression region.`,
        )
      : loc(
          `QPSK 的峰均比 ${f1(a.papr)} dB 较低，同样的回退下压缩较轻。`,
          `QPSK has a low peak-to-average ratio of ${f1(a.papr)} dB, so compression is milder at the same back-off.`,
        )
  parts.push(schemeNote)
  return { title, text: join(parts) }
}

/** 四张任务卡：完成与否由当前设置和 EVM、ACPR 算出 */
export function taskItems(state: EvmState, a: EvmAnalysis): TaskItem[] {
  const evmOk = a.evmPct <= EVM_OK_PCT
  const acprOk = a.acprDb <= ACPR_OK_DB
  return [
    { id: 'qam', text: S.task1, done: state.scheme === 'qam16' },
    { id: 'both-bad', text: S.task2, done: state.scheme === 'qam16' && state.ibo <= 2 && !evmOk && !acprOk },
    { id: 'evm-only', text: S.task3, done: evmOk && !acprOk },
    { id: 'both-ok', text: S.task4, done: state.ibo >= 10 && evmOk && acprOk },
  ]
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('平均误差功率是参考功率的 1 %，EVM 大约是多少？', 'The average error power is 1 % of the reference power. About what is the EVM?'),
    options: [
      { id: 'a', text: loc('1 %', '1 %') },
      { id: 'b', text: loc('10 %', '10 %') },
      { id: 'c', text: loc('100 %', '100 %') },
    ],
    answer: 'b',
    explain: loc(
      `EVM = √(误差功率 / 参考功率) × 100 = √0.01 × 100 = ${f0(Math.sqrt(0.01) * 100)} %。注意要先开根号，不能直接用功率比。`,
      `EVM = √(error power / reference power) × 100 = √0.01 × 100 = ${f0(Math.sqrt(0.01) * 100)} %. Take the square root first; do not use the power ratio directly.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('计算 EVM 之前，为什么要先做增益和相位对齐？', 'Why align gain and phase before computing EVM?'),
    options: [
      { id: 'a', text: loc('固定的增益和相位偏差不是符号形状误差，不先去掉会被算进 EVM', 'A fixed gain and phase offset is not symbol shape error; without removing it, it would be counted in EVM') },
      { id: 'b', text: loc('对齐会让 EVM 变大，便于比较', 'Alignment makes EVM larger, which makes comparison easier') },
      { id: 'c', text: loc('只有 QPSK 才需要对齐', 'Only QPSK needs alignment') },
    ],
    answer: 'a',
    explain: loc(
      '固定的增益和相位偏差会让每个符号都偏同样的量，却不改变星座的形状。把它们当成误差，EVM 就反映了接收机的设置，而不是失真。对齐用最小二乘求复数增益，剩下的才是失真造成的误差。',
      'A fixed gain and phase offset shifts every symbol by the same amount but does not change the shape of the constellation. Counting it as error would make EVM reflect the receiver setting rather than distortion. Alignment uses a least-squares complex gain, and only the remainder is distortion error.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('ACPR 反映的是什么？', 'What does ACPR reflect?'),
    options: [
      { id: 'a', text: loc('符号在星座上的平均偏离', 'The average deviation of symbols on the constellation') },
      { id: 'b', text: loc('时钟抖动造成的采样时刻误差', 'Sampling-time error caused by clock jitter') },
      { id: 'c', text: loc('失真频谱泄漏到相邻信道的功率', 'Distorted spectrum power leaking into the adjacent channels') },
    ],
    answer: 'c',
    explain: loc(
      'ACPR 是相邻信道功率与主信道功率之比。非线性把信号的频谱撑宽，泄漏到邻道，所以它反映频谱再生，不是符号误差。',
      'ACPR is the adjacent-channel power divided by the main-channel power. Nonlinearity widens the spectrum and leaks it into the neighbours, so ACPR reflects spectral regrowth rather than symbol error.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('输入回退 IBO 增大（离饱和更远），EVM 与 ACPR 通常怎样变化？', 'As input back-off IBO increases (further from saturation), how do EVM and ACPR usually change?'),
    options: [
      { id: 'a', text: loc('EVM 增大，ACPR 减小', 'EVM rises and ACPR falls') },
      { id: 'b', text: loc('两者都减小', 'Both fall') },
      { id: 'c', text: loc('两者都增大', 'Both rise') },
    ],
    answer: 'b',
    explain: loc(
      `回退越多，压缩越轻。本站的数值：QPSK 在 0 dB 时 EVM ${f2(EX_QPSK_0.evmPct)} %、ACPR ${f1(EX_QPSK_0.acprDb)} dBc；在 6 dB 时 EVM 降到 ${f2(EX_QPSK_6.evmPct)} %、ACPR 降到 ${f1(EX_QPSK_6.acprDb)} dBc。`,
      `More back-off means milder compression. Numbers from this site: QPSK at 0 dB has EVM ${f2(EX_QPSK_0.evmPct)} % and ACPR ${f1(EX_QPSK_0.acprDb)} dBc; at 6 dB EVM falls to ${f2(EX_QPSK_6.evmPct)} % and ACPR to ${f1(EX_QPSK_6.acprDb)} dBc.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('同样的 IBO 下，16QAM 比 QPSK 更容易超标，主要是因为什么？', 'At the same IBO, why does 16QAM exceed limits more easily than QPSK?'),
    options: [
      { id: 'a', text: loc('16QAM 的符号速率更高', '16QAM has a higher symbol rate') },
      { id: 'b', text: loc('16QAM 的载波频率更高', '16QAM uses a higher carrier frequency') },
      { id: 'c', text: loc('16QAM 的峰均比更高，更多时刻落进压缩区', '16QAM has a higher peak-to-average ratio, so more instants fall into the compression region') },
    ],
    answer: 'c',
    explain: loc(
      `16QAM 的峰均比约 ${f1(EX_QAM_0.papr)} dB，QPSK 约 ${f1(EX_QPSK_0.papr)} dB。峰值更高，同样的回退下有更多时刻进入 Rapp 曲线的弯折区。`,
      `The 16QAM peak-to-average ratio is about ${f1(EX_QAM_0.papr)} dB, against about ${f1(EX_QPSK_0.papr)} dB for QPSK. Higher peaks mean more instants enter the bend of the Rapp curve at the same back-off.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc('EVM 合格，ACPR 就一定合格吗？', 'If EVM passes, does ACPR certainly pass?'),
    options: [
      { id: 'a', text: loc('不一定，两者量的东西不同，要分别判定', 'Not necessarily: they measure different things and must be judged separately') },
      { id: 'b', text: loc('一定，两者只是同一个数的两种写法', 'Yes: they are two ways of writing the same number') },
      { id: 'c', text: loc('一定不，ACPR 只和接收机有关', 'No: ACPR depends only on the receiver') },
    ],
    answer: 'a',
    explain: loc(
      `不一定。QPSK 在 2 dB 回退时 EVM 为 ${f2(EX_QPSK_2.evmPct)} %（低于 ${EVM_OK_PCT} %，合格），ACPR 却是 ${f1(EX_QPSK_2.acprDb)} dBc（高于 ${ACPR_OK_DB} dBc，超标）。`,
      `Not necessarily. QPSK at 2 dB back-off has EVM ${f2(EX_QPSK_2.evmPct)} % (below ${EVM_OK_PCT} %, passes), yet ACPR is ${f1(EX_QPSK_2.acprDb)} dBc (above ${ACPR_OK_DB} dBc, fails).`,
    ),
  },
]

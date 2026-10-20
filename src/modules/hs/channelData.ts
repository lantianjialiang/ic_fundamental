import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type ChannelAnalysis, type ChannelState, EYE_PASS, PE_K, PE_MODES, type PeMode, RATES } from './channelModel'

export const RATE_OPTIONS = RATES.map((rate) => ({ id: String(rate), label: `${rate} Gb/s` }))

const PE_LABEL: Record<PeMode, LText> = {
  off: loc('关', 'Off'),
  on: loc('开（预加重）', 'On (pre-emphasis)'),
}
export const PE_OPTIONS = PE_MODES.map((mode) => ({ id: mode, label: PE_LABEL[mode] }))

const f1 = (value: number) => value.toFixed(1)
const f2 = (value: number) => value.toFixed(2)

export const S = {
  kickerNow: loc('这一次的接收波形', 'This received waveform'),
  introTitle: loc('信号怎么在通道里变形', 'How a signal gets distorted in the channel'),
  coreTitle: loc('拨一拨：损耗、终端失配与预加重', 'Try it: loss, termination mismatch and pre-emphasis'),
  coreNote: loc(
    '通道是一段 50 Ω 传输线加一阶低通（损耗）。终端 ZL 偏离 50 Ω 时，部分能量被反射回去，在波形上留下电平台阶和回声。下图是接收端波形；虚线是理想方波（同样时延，无损无反射）。',
    'The channel is a 50 Ω line plus a first-order low-pass (loss). When the termination ZL differs from 50 Ω, part of the energy reflects back, leaving level steps and echoes on the waveform. The chart shows the receiver waveform; the dashed line is the ideal square wave (same delay, no loss or reflection).',
  ),
  rateLabel: loc('数据速率', 'Data rate'),
  peLabel: loc('发送端预加重', 'Transmitter pre-emphasis'),
  bwLabel: loc('通道带宽 BW (GHz)', 'Channel bandwidth BW (GHz)'),
  zlLabel: loc('终端阻抗 ZL (Ω)', 'Termination impedance ZL (Ω)'),
  rNyq: loc('奈奎斯特频率 f_N = 速率 / 2', 'Nyquist frequency f_N = rate / 2'),
  rLoss: loc('f_N 处的通道损耗', 'Channel loss at f_N'),
  rGamma: loc('反射系数 |Γ|', 'Reflection coefficient |Γ|'),
  rRl: loc('回波损耗 RL', 'Return loss RL'),
  rLevel: loc('远端稳态电平（相对 ZL = 50 Ω）', 'Far-end steady level (relative to ZL = 50 Ω)'),
  rOpen: loc(`中心眼张开度（理想 2.00，判据 ≥ ${EYE_PASS.toFixed(1)}）`, `Centre eye opening (ideal 2.00, criterion ≥ ${EYE_PASS.toFixed(1)})`),
  rVerdict: loc('判定（眼图）', 'Verdict (eye)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '这里没有画串扰，只讲概念；真实的 CTLE、FFE、DFE 也只讲作用，不做参数设计。眼图的 mask 判定见 HS-05。',
    'Crosstalk is not modelled here, only described. Real CTLE, FFE and DFE are explained by their purpose, not designed. Mask judgement on the eye is in HS-05.',
  ),
  next: loc('下一课：时钟与数据时序', 'Next: Clock and Data Timing'),
  task1: loc(
    '10 Gb/s、关闭预加重，把 BW 降到 3 GHz 或更低，让眼张开度掉到判据以下（FAIL）。',
    'At 10 Gb/s with pre-emphasis off, lower BW to 3 GHz or less so the eye opening drops below the criterion (FAIL).',
  ),
  task2: loc(
    '保持 10 Gb/s、BW 3 GHz，打开预加重，让眼图重新通过判据（PASS）。',
    'Keep 10 Gb/s and BW 3 GHz, turn pre-emphasis on, and bring the eye back above the criterion (PASS).',
  ),
  task3: loc(
    '把 ZL 调到偏离 50 Ω 较多（|Γ| ≥ 0.3），在波形上找出电平台阶和回声。',
    'Move ZL well away from 50 Ω (|Γ| ≥ 0.3) and find the level step and echo on the waveform.',
  ),
  task4: loc(
    '5 Gb/s、BW 8 GHz 时，打开预加重，看中心眼张开度为什么反而变小（过度均衡）。',
    'At 5 Gb/s and BW 8 GHz, turn pre-emphasis on and see why the centre eye opening gets smaller (over-equalisation).',
  ),
}

export const FIG = {
  aria: loc(
    '接收端波形与理想方波对照图，标出远端稳态电平，可以看到电平台阶和回声',
    'Receiver waveform against the ideal square wave, with the far-end steady level marked; level steps and echoes are visible',
  ),
  cap: loc(
    '实线是接收端波形；虚线是理想方波；点线是远端稳态电平。ZL 偏离 50 Ω 时电平会被抬高或压低，跳变后还有回声，它们都是反射造成的。',
    'The solid line is the receiver waveform, the dashed line the ideal square wave and the dotted line the far-end steady level. When ZL is off 50 Ω the level is raised or lowered, and echoes follow each transition; reflections cause both.',
  ),
  axis: loc('时间（UI）', 'Time (UI)'),
}

export const INTRO = [
  loc(
    '{@hsBasics} 讲过：边沿要花一段时间才能走完，UI 不等它。HS-02 把这个问题搬到真正的传输线上：阻抗不连续会反射，带宽不够会拖慢边沿，相邻位的尾巴叠进当前位，就是码间干扰（ISI）。',
    'The {@hsBasics} lesson showed that an edge takes time to finish and the UI does not wait. HS-02 moves this onto a real transmission line: an impedance discontinuity reflects energy, limited bandwidth slows the edge, and the tails of neighbouring bits pile into the current bit; that is intersymbol interference (ISI).',
  ),
  loc(
    '这一课的反射用 Γ = (ZL − Z0) / (ZL + Z0) 和 RL = −20·log|Γ| 计算，损耗和 ISI 用一阶低通近似，预加重开关直接改动发送端的波形。眼图的判定沿用 {@hsEye} 的做法。',
    'Reflections here use Γ = (ZL − Z0) / (ZL + Z0) and RL = −20·log|Γ|; loss and ISI use a first-order low-pass; the pre-emphasis switch changes the transmitted waveform directly. Eye judgement follows the approach of {@hsEye}.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '阻抗不匹配只会让信号变小。反射会把一部分能量弹回去，在驱动端再次反射就形成回声；ZL 偏高还会把接收电平抬高。',
    'Impedance mismatch only makes the signal smaller. Reflection bounces part of the energy back, and reflecting again at the driver creates echoes; a high ZL even raises the received level.',
  ),
  loc(
    '通道损耗只影响幅度，不影响时序。低通会把边沿拉慢，前一位的尾巴进入当前位，交叉点就左右漂移，时序和幅度都受影响。',
    'Channel loss only affects amplitude, not timing. The low-pass slows the edges, the tail of the previous bit enters the current one, and the crossings drift sideways, so both timing and amplitude suffer.',
  ),
  loc(
    '预加重越多越好。过强会压低连续同样的位，眼张开度反而变小；它只该补偿损耗那部分，不该超过需要。',
    'More pre-emphasis is always better. Too much pulls down runs of identical bits and shrinks the eye; it should only compensate the loss that is actually there.',
  ),
]

export const TAKEAWAY: LText = loc(
  '阻抗失配产生反射 Γ = (ZL − Z0)/(ZL + Z0)，RL = −20·log|Γ|，造成电平变化和回声；损耗（BW 低，奈奎斯特损耗大）让边沿变慢，产生 ISI；预加重在发送端加强跳变，CTLE 在接收端提高高频增益，DFE 用已判决的位减掉拖尾，都是补偿 ISI 的办法，要适度。',
  'Impedance mismatch causes reflection Γ = (ZL − Z0)/(ZL + Z0), RL = −20·log|Γ|, which shifts levels and creates echoes; loss (low BW, high Nyquist loss) slows edges and creates ISI; pre-emphasis boosts transitions at the transmitter, CTLE raises high-frequency gain at the receiver and DFE subtracts the tail using decided bits. All of them compensate ISI and must be used in moderation.',
)

/** 右侧说明栏：根据眼图结果给结论和原因 */
export function verdictOf(state: ChannelState, a: ChannelAnalysis): { title: LText; text: LText; note: LText | null } {
  const open = f2(a.eyeOpen)
  const loss = f1(a.lossDb)
  const flatLevel = f2((1 - PE_K) / (1 + PE_K))
  if (a.pass) {
    const peNote =
      state.pe === 'on'
        ? a.lossDb < 3
          ? loc(
              `预加重开着，连续同样的位只剩满幅的 ${flatLevel} 倍；这里损耗不大，它反而吃掉了张开度。`,
              `Pre-emphasis is on, so runs of identical bits keep only ${flatLevel} times full swing; with this little loss it eats into the opening instead.`,
            )
          : loc(
              `预加重开着，它补回了高频，代价是连续同样的位只剩满幅的 ${flatLevel} 倍。`,
              `Pre-emphasis is on: it restores the high frequencies, at the cost of runs of identical bits keeping only ${flatLevel} times full swing.`,
            )
        : null
    const reflNote =
      a.gammaMag >= 0.2
        ? loc(
            `终端失配 |Γ| = ${f2(a.gammaMag)}，回声仍在，但没有把眼睛压到判据以下。`,
            `The termination mismatch gives |Γ| = ${f2(a.gammaMag)}; echoes are present but do not push the eye below the criterion.`,
          )
        : null
    return {
      title: S.pass,
      text: loc(
        `中心眼张开度 ${open}，高于 ${EYE_PASS.toFixed(1)} 的判据。奈奎斯特频率处的通道损耗是 ${loss} dB。`,
        `Centre eye opening is ${open}, above the ${EYE_PASS.toFixed(1)} criterion. The channel loss at the Nyquist frequency is ${loss} dB.`,
      ),
      note: peNote ?? reflNote,
    }
  }
  if (state.pe === 'off') {
    return {
      title: S.fail,
      text: loc(
        `中心眼张开度只有 ${open}，低于 ${EYE_PASS.toFixed(1)} 的判据。奈奎斯特频率处损耗 ${loss} dB，边沿被拉慢，前一位的尾巴拖进当前位（ISI）。打开预加重，或提高 BW，可以把边沿补回来。`,
        `Centre eye opening is only ${open}, below the ${EYE_PASS.toFixed(1)} criterion. Loss at the Nyquist frequency is ${loss} dB, which slows the edges so the tail of the previous bit enters the current one (ISI). Turning pre-emphasis on or raising BW restores the edges.`,
      ),
      note:
        a.gammaMag >= 0.2
          ? loc(
              `另外终端失配 |Γ| = ${f2(a.gammaMag)}，回声还会再压一层。`,
              `The termination mismatch, |Γ| = ${f2(a.gammaMag)}, adds echoes on top.`,
            )
          : null,
    }
  }
  return {
    title: S.fail,
    text: loc(
      `中心眼张开度只有 ${open}，低于 ${EYE_PASS.toFixed(1)} 的判据。即使开了预加重，奈奎斯特频率处的损耗仍有 ${loss} dB，补偿不够。要么提高 BW，要么降低速率。`,
      `Centre eye opening is only ${open}, below the ${EYE_PASS.toFixed(1)} criterion. Even with pre-emphasis on, the Nyquist-frequency loss is still ${loss} dB and the compensation is not enough. Either raise BW or lower the rate.`,
    ),
    note:
      a.gammaMag >= 0.2
        ? loc(
            `终端失配 |Γ| = ${f2(a.gammaMag)} 也会拖累眼图，先把 ZL 调回 50 Ω 再看。`,
            `The termination mismatch, |Γ| = ${f2(a.gammaMag)}, also drags the eye down; set ZL back to 50 Ω first.`,
          )
        : null,
  }
}

/** 四张任务卡：完成与否由当前设置和眼图结果算出 */
export function taskItems(state: ChannelState, a: ChannelAnalysis): TaskItem[] {
  return [
    { id: 'bwFail', text: S.task1, done: state.rate === 10 && state.bw <= 3 && state.pe === 'off' && !a.pass },
    { id: 'peRescue', text: S.task2, done: state.rate === 10 && state.bw <= 3 && state.pe === 'on' && a.pass },
    { id: 'reflect', text: S.task3, done: a.gammaMag >= 0.3 },
    { id: 'overEq', text: S.task4, done: state.rate === 5 && state.bw >= 8 && state.pe === 'on' },
  ]
}

/** 小测题干中的数字由模型公式算出，与页面的换算保持一致 */
const GAMMA_150 = (150 - 50) / (150 + 50)
const RL_150 = -20 * Math.log10(GAMMA_150)
const LOSS_5G_AT_NYQ = 10 * Math.log10(1 + (5 / 5) ** 2)
const GAMMA_RL10 = 10 ** (-10 / 20)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('传输线 Z0 = 50 Ω，终端 ZL = 150 Ω，反射系数 |Γ| 是多少？', 'A line with Z0 = 50 Ω is terminated in ZL = 150 Ω. What is the reflection coefficient |Γ|?'),
    options: [
      { id: 'a', text: loc('0.25', '0.25') },
      { id: 'b', text: loc(f2(GAMMA_150), f2(GAMMA_150)) },
      { id: 'c', text: loc('3', '3') },
    ],
    answer: 'b',
    explain: loc(
      `Γ = (ZL − Z0) / (ZL + Z0) = (150 − 50) / (150 + 50) = ${f2(GAMMA_150)}。回波损耗 RL = −20·log|Γ| = ${f1(RL_150)} dB。3 是 VSWR，不是 Γ。`,
      `Γ = (ZL − Z0) / (ZL + Z0) = (150 − 50) / (150 + 50) = ${f2(GAMMA_150)}. Return loss RL = −20·log|Γ| = ${f1(RL_150)} dB. The 3 is the VSWR, not Γ.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('终端与 Z0 完全匹配（ZL = Z0）时，回波损耗是多少？', 'With the termination exactly matched (ZL = Z0), what is the return loss?'),
    options: [
      { id: 'a', text: loc('0 dB', '0 dB') },
      { id: 'b', text: loc('6 dB', '6 dB') },
      { id: 'c', text: loc('∞（没有反射）', '∞ (no reflection)') },
    ],
    answer: 'c',
    explain: loc(
      'ZL = Z0 时 Γ = 0，RL = −20·log(0) = ∞，能量全部被终端吸收，没有回波。',
      'With ZL = Z0, Γ = 0 and RL = −20·log(0) = ∞; all the energy is absorbed by the termination and there is no echo.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('回波损耗 RL = 10 dB 时，|Γ| 大约是多少？', 'If the return loss RL is 10 dB, about what is |Γ|?'),
    options: [
      { id: 'a', text: loc('0.1', '0.1') },
      { id: 'b', text: loc(f2(GAMMA_RL10), f2(GAMMA_RL10)) },
      { id: 'c', text: loc('0.5', '0.5') },
    ],
    answer: 'b',
    explain: loc(
      `|Γ| = 10^(−RL / 20) = 10^(−0.5) ≈ ${f2(GAMMA_RL10)}。RL 越大，反射越小；RL 每增加 20 dB，|Γ| 缩小到十分之一。`,
      `|Γ| = 10^(−RL / 20) = 10^(−0.5) ≈ ${f2(GAMMA_RL10)}. The larger the RL, the smaller the reflection; every extra 20 dB of RL cuts |Γ| by a factor of ten.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('10 Gb/s 的通道，BW = 5 GHz，奈奎斯特频率 5 GHz 处的损耗约是多少？', 'A 10 Gb/s channel with BW = 5 GHz has what loss at the 5 GHz Nyquist frequency?'),
    options: [
      { id: 'a', text: loc('0 dB', '0 dB') },
      { id: 'b', text: loc('3 dB', '3 dB') },
      { id: 'c', text: loc('6 dB', '6 dB') },
    ],
    answer: 'b',
    explain: loc(
      `f_N = 10 / 2 = 5 GHz，损耗 = 10·log10(1 + (f_N / BW)²) = 10·log10(1 + 1) = ${f2(LOSS_5G_AT_NYQ)} dB。BW 正好等于 f_N 时，损耗就是 3 dB。`,
      `f_N = 10 / 2 = 5 GHz, loss = 10·log10(1 + (f_N / BW)²) = 10·log10(1 + 1) = ${f2(LOSS_5G_AT_NYQ)} dB. When BW equals f_N, the loss is exactly 3 dB.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('码间干扰（ISI）的直接原因是什么？', 'What directly causes intersymbol interference (ISI)?'),
    options: [
      { id: 'a', text: loc('相邻走线之间的串扰', 'Crosstalk from neighbouring traces') },
      { id: 'b', text: loc('通道带宽不够，前面位的尾巴叠进当前位', 'Insufficient channel bandwidth, so the tails of earlier bits pile into the current bit') },
      { id: 'c', text: loc('电源噪声', 'Supply noise') },
    ],
    answer: 'b',
    explain: loc(
      'ISI 来自通道的有限带宽：边沿拉慢后，前一位还没走完，就被下一位的采样叠加。串扰和电源噪声也会影响眼图，但它们不是 ISI 的定义。',
      'ISI comes from finite channel bandwidth: slowed edges leave the previous bit unfinished, and its tail adds to the sample of the next bit. Crosstalk and supply noise also close the eye, but they are not the definition of ISI.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('发送端预加重（pre-emphasis）的作用是什么？', 'What does transmitter pre-emphasis do?'),
    options: [
      { id: 'a', text: loc('在跳变处加强，补偿通道的高频损耗', 'Boost the transitions to compensate the channel’s high-frequency loss') },
      { id: 'b', text: loc('把所有位都提高到满幅', 'Raise every bit to full swing') },
      { id: 'c', text: loc('消除终端的反射', 'Remove reflections at the termination') },
    ],
    answer: 'a',
    explain: loc(
      '预加重让跳变位保持满幅、连续同样的位被压低，相当于补偿高频成分。它不能消除反射，过强则会压低连续位，让眼张开度变小。',
      'Pre-emphasis keeps transition bits at full swing and lowers runs of identical bits, compensating the high-frequency content. It cannot remove reflections, and too much shrinks the eye by pulling down the runs.',
    ),
  },
  {
    id: 'q7',
    prompt: loc('判决反馈均衡（DFE）的基本思路是什么？', 'What is the basic idea of a decision-feedback equaliser (DFE)?'),
    options: [
      { id: 'a', text: loc('用已经判决的前几位估计拖尾，从当前采样里减掉', 'Estimate the tail from the already-decided earlier bits and subtract it from the current sample') },
      { id: 'b', text: loc('把整个接收信号放大', 'Amplify the whole received signal') },
      { id: 'c', text: loc('在发送端多加一个时钟', 'Add one more clock at the transmitter') },
    ],
    answer: 'a',
    explain: loc(
      'DFE 只针对后标（post-cursor）ISI：前面几位已经判决，它们的拖尾可以估计出来，再从当前采样里减掉。它只讲概念，本课不做参数设计。',
      'A DFE targets post-cursor ISI: the earlier bits are already decided, so their tails can be estimated and subtracted from the current sample. This lesson only explains the concept and does not design parameters.',
    ),
  },
]

import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-12 PLL / 时钟测试：PLL、ppm、参考时钟、锁定时间、周期抖动，以及已有词条的课程补充、常见问题 */
export const ANA_PLL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pll',
      term: 'PLL',
      name: loc('锁相环', 'Phase-locked loop (PLL)'),
      def: loc(
        '用反馈让输出时钟锁定到参考时钟的电路：输出经 ÷N 回到鉴相器，锁定时 f_out = N·f_ref。锁定后，参考的 ppm 误差会原样传到输出。',
        'A circuit that locks an output clock to a reference clock by feedback: the output is divided by N and fed back to the phase detector, and when locked f_out = N·f_ref. Once locked, the reference’s ppm error passes straight to the output.',
      ),
      lessons: ['anaPll'],
    },
    {
      id: 'ppm',
      term: 'ppm',
      name: loc('百万分之一（ppm）', 'Parts per million (ppm)'),
      def: loc(
        '相对误差的单位，1 ppm = 10^-6。换算到频率：1 ppm 作用在 800 MHz 上，误差是 800 Hz。',
        'A relative error unit, 1 ppm = 10^-6. In frequency terms, 1 ppm at 800 MHz is an error of 800 Hz.',
      ),
      lessons: ['anaPll'],
    },
    {
      id: 'reference-clock',
      term: 'Reference clock',
      name: loc('参考时钟', 'Reference clock'),
      def: loc(
        'PLL 的频率基准，通常是晶振。它的 ppm 误差、相位噪声和抖动都会传到输出，所以测 PLL 之前要先确认参考本身合格。',
        'The frequency reference of a PLL, usually a crystal. Its ppm error, phase noise and jitter all pass through to the output, so confirm the reference itself is good before testing the PLL.',
      ),
      lessons: ['anaPll'],
    },
    {
      id: 'lock-time',
      term: 'Lock time',
      name: loc('锁定时间', 'Lock time'),
      def: loc(
        '从上电或换频开始，到输出误差进入锁定窗（本模型中为 ±10 ppm）所用的时间。一阶模型中 τ = 1 / (2π·BW)，锁定时间约为 τ·ln(2000)。',
        'The time from power-up or a frequency change until the output error enters the lock window (±10 ppm in this model). In the first-order model τ = 1 / (2π·BW) and the lock time is about τ·ln(2000).',
      ),
      lessons: ['anaPll'],
    },
    {
      id: 'period-jitter',
      term: 'Period jitter',
      name: loc('周期抖动', 'Period jitter'),
      def: loc(
        '每个时钟周期长度的随机偏差，用 rms（均方根）表示。参考抖动与 VCO 自身的抖动按平方和合成。',
        'Random variation in the length of each clock period, given as an rms value. The reference jitter and the VCO’s own jitter combine in root-sum-square.',
      ),
      lessons: ['anaPll'],
    },
  ],
  extraLessons: {
    'settling-time': ['anaPll'],
  },
  faqs: [
    {
      id: 'ana-pll-ref-ppm',
      q: loc('参考晶振有 ppm 误差，PLL 能不能修正它？', 'The reference crystal has a ppm error. Can the PLL correct it?'),
      a: loc(
        '不能。锁定后 f_out = N·f_ref，环路只保证分频比 N 正确，参考的 ppm 误差原样传到输出。要满足频率规格，只能换更准的参考，或用修调（trim）在别处校正。见 {@anaPll}。',
        'No. Once locked, f_out = N·f_ref: the loop only guarantees the divider ratio N, and the reference’s ppm error passes to the output unchanged. To meet a frequency spec, use a more accurate reference or correct it elsewhere with trim. See {@anaPll}.',
      ),
      lessons: ['anaPll'],
    },
    {
      id: 'ana-pll-unlock',
      q: loc('PLL 没有锁定，可能是什么原因？', 'The PLL does not lock. What could be the cause?'),
      a: loc(
        '两类常见原因。一是环路不稳定：BW 超过 f_ref / 10，环路振荡。二是 BW 太小：锁定时间超过测试窗口，测试时判为未锁定。先检查 BW 的上下限，再看锁定时间。',
        'Two common causes. First, the loop is unstable: BW exceeds f_ref / 10, so it oscillates. Second, BW is too small: the lock time exceeds the test window, so the test reports not locked. Check the BW limits first, then the lock time.',
      ),
      lessons: ['anaPll'],
    },
    {
      id: 'ana-jitter-measure',
      q: loc('同样的参数，为什么测得的抖动每次都有一点不同？', 'With the same parameters, why does the measured jitter differ a little each time?'),
      a: loc(
        '测量值是有限样本的估计。σ 的相对起伏约为 1/√(2N)，N = 2000 时约 1.6%。固定种子能复现结果，但并不等于理论值。判定时要看测得值与规格限值的差距是否大于这个起伏。',
        'The measured value is an estimate from a finite sample. The relative scatter of σ is about 1/√(2N), about 1.6% for N = 2000. A fixed seed makes the result reproducible but does not equal the theory. When judging, check whether the gap to the limit is larger than this scatter.',
      ),
      lessons: ['anaPll'],
    },
  ],
}

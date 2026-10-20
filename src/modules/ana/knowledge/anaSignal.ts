import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-05 连续时间信号：周期、频率、幅度、相位、一阶 RC 低通与带宽：术语、已有词条的课程补充、常见问题 */
export const ANA_SIGNAL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sine-wave',
      term: 'Sine wave',
      name: loc('正弦波', 'Sine wave'),
      def: loc(
        '由幅度、频率（或周期）和相位三个参数完整描述的连续信号：v(t) = A·sin(2πft + φ)。见 {@anaSignal}。',
        'A continuous signal fully described by amplitude, frequency (or period) and phase: v(t) = A·sin(2πft + φ); see {@anaSignal}.',
      ),
      lessons: ['anaSignal'],
    },
    {
      id: 'phase-shift',
      term: 'Phase difference',
      name: loc('相位差', 'Phase difference'),
      def: loc(
        '两路同频正弦之间的角度差。它和时间差的关系是 Δφ = 360°·f·Δt，所以只在同一频率下才有确定的意义；见 {@anaSignal}。',
        'The angle between two same-frequency sine waves. It relates to a time offset by Δφ = 360°·f·Δt, so it is only well defined at one frequency; see {@anaSignal}.',
      ),
      lessons: ['anaSignal'],
    },
    {
      id: 'rc-lowpass',
      term: 'RC low-pass filter',
      name: loc('一阶 RC 低通', 'First-order RC low-pass'),
      def: loc(
        '由一个电阻和一个电容组成的最简单低通滤波器。增益 |H| = 1/√(1+(f/fc)²)，相位 −atan(f/fc)：高频被压低，相位滞后。见 {@anaSignal}。',
        'The simplest low-pass filter, made of one resistor and one capacitor. Its gain is |H| = 1/√(1+(f/fc)²) and its phase is −atan(f/fc): high frequencies are attenuated and the phase lags; see {@anaSignal}.',
      ),
      lessons: ['anaSignal'],
    },
    {
      id: 'bandwidth-3db',
      term: '3 dB bandwidth',
      name: loc('−3 dB 带宽', '−3 dB bandwidth'),
      def: loc(
        '增益降到低频增益的 0.707 倍（即 −3 dB）时的频率。对一阶 RC 低通，它就是截止频率 fc；幅度减半是 −6 dB，不是 −3 dB。见 {@anaSignal}。',
        'The frequency at which the gain falls to 0.707 times the low-frequency gain (−3 dB). For a first-order RC low-pass it equals the cutoff fc; halving the amplitude is −6 dB, not −3 dB; see {@anaSignal}.',
      ),
      lessons: ['anaSignal'],
    },
  ],
  extraLessons: {
    period: ['anaSignal'],
  },
  faqs: [
    {
      id: 'ana-signal-phase-same-f',
      q: loc('两路相位差能不能在不同频率下直接比较？', 'Can phase differences at different frequencies be compared directly?'),
      a: loc(
        '不能直接比较。同样的时间差 Δt，频率越高，相位差越大（Δφ = 360°·f·Δt）。要比较两路，要么在同一频率下量相位差，要么比较时间差 Δt，见 {@anaSignal}。',
        'Not directly. For the same time offset Δt, a higher frequency gives a larger phase difference (Δφ = 360°·f·Δt). To compare two channels, either measure the phase difference at one common frequency or compare the time offset Δt; see {@anaSignal}.',
      ),
      lessons: ['anaSignal'],
    },
    {
      id: 'ana-signal-minus3db',
      q: loc('−3 dB 是不是就是幅度减半？', 'Is −3 dB the same as halving the amplitude?'),
      a: loc(
        '不是。−3 dB 对应幅度的 0.707 倍，功率约为一半；幅度减半是 −6 dB。对一阶 RC，f = fc 时正好是 −3 dB，见 {@anaSignal}。',
        'No. −3 dB is 0.707 times the amplitude, about half the power; halving the amplitude is −6 dB. For a first-order RC, f = fc gives exactly −3 dB; see {@anaSignal}.',
      ),
      lessons: ['anaSignal'],
    },
    {
      id: 'ana-signal-fc-choice',
      q: loc('截止频率 fc 怎么选？', 'How should the cutoff frequency fc be chosen?'),
      a: loc(
        'fc 要比需要保留的信号频率高得多，否则有用信号会被压下去。若要求幅度误差不超过 e（如 3% 时 e = 0.03），则 fc ≥ f / √(1/(1−e)² − 1)。例如 1 kHz 要求 3% 以内，fc 至少约 4 kHz，见 {@anaSignal}。',
        'fc must be well above the signal frequency you want to keep, or the wanted signal is attenuated. For an amplitude error of at most e (for 3%, e = 0.03), fc ≥ f / √(1/(1−e)² − 1). For example, 1 kHz within 3% needs fc of about 4 kHz; see {@anaSignal}.',
      ),
      lessons: ['anaSignal'],
    },
  ],
}

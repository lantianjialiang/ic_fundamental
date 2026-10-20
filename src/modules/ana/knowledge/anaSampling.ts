import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-06 采样与混叠：奈奎斯特、混叠、抗混叠滤波器（AAF）、表观频率 */
export const ANA_SAMPLING_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sampling-rate',
      term: 'Sampling rate',
      name: loc('采样率 fs', 'Sampling rate fs'),
      def: loc(
        'ADC 或数字化仪每秒读取的次数，单位 Sa/s 或 kHz。相邻两次采样的间隔是 1/fs。要想不混叠，输入频率必须低于 fs/2。见 {@anaSampling}。',
        'How many times per second an ADC or digitizer reads the signal, in Sa/s or kHz. The gap between samples is 1/fs. To avoid aliasing the input frequency must stay below fs/2. See {@anaSampling}.',
      ),
      lessons: ['anaSampling'],
    },
    {
      id: 'nyquist-frequency',
      term: 'Nyquist frequency',
      name: loc('奈奎斯特频率 fs/2', 'Nyquist frequency fs/2'),
      def: loc(
        '采样率的一半，是能被无混叠采样的最高频率。超过它的输入会折叠回 0 到 fs/2 之间。见 {@anaSampling}。',
        'Half the sampling rate: the highest frequency that can be sampled without aliasing. Inputs above it fold back into the band between 0 and fs/2. See {@anaSampling}.',
      ),
      lessons: ['anaSampling'],
    },
    {
      id: 'aliasing',
      term: 'Aliasing',
      name: loc('混叠（折叠）', 'Aliasing (folding)'),
      def: loc(
        '输入频率超过 fs/2 时，采样点与一个较低频率的信号完全相同，ADC 无法区分。混叠发生在采样那一刻，之后的数字滤波无法还原。见 {@anaSampling}。',
        'When the input is above fs/2, its sample points are identical to those of a lower-frequency signal, and the ADC cannot tell them apart. Aliasing happens at the instant of sampling, so digital filtering afterwards cannot undo it. See {@anaSampling}.',
      ),
      lessons: ['anaSampling'],
    },
    {
      id: 'apparent-frequency',
      term: 'Apparent frequency',
      name: loc('表观频率', 'Apparent frequency'),
      def: loc(
        '混叠后 ADC 看到的频率，公式 f_alias = |f_in − round(f_in ÷ fs) · fs|。例如 fs = 10 kHz、f_in = 7 kHz 时，表观频率是 3 kHz。见 {@anaSampling}。',
        'The frequency the ADC sees after aliasing, f_alias = |f_in − round(f_in ÷ fs) · fs|. For example, with fs = 10 kHz and f_in = 7 kHz the apparent frequency is 3 kHz. See {@anaSampling}.',
      ),
      lessons: ['anaSampling'],
    },
    {
      id: 'anti-alias-filter',
      term: 'AAF',
      name: loc('抗混叠滤波器（AAF）', 'Anti-alias filter (AAF)'),
      def: loc(
        '放在采样之前的模拟低通滤波器，衰减 fs/2 以上的成分，防止它折叠。截止频率 fc 通常设在 fs/2 附近或略低：太低会削弱有用信号。见 {@anaSampling}。',
        'An analog low-pass placed before the sampler. It attenuates components above fs/2 so they cannot fold. Its cutoff fc is usually set near or a little below fs/2; too low and it attenuates the wanted signal. See {@anaSampling}.',
      ),
      lessons: ['anaSampling'],
    },
  ],
  extraLessons: {
    'adc-dac': ['anaSampling'],
  },
  faqs: [
    {
      id: 'ana-alias-after-sampling',
      q: loc('采样后用软件滤波能去掉混叠吗？', 'Can digital filtering after sampling remove aliasing?'),
      a: loc(
        '不能。混叠发生在采样那一刻：高于 fs/2 的输入和一个低频信号给出完全相同的采样点，之后的数字滤波分不开它们。必须在采样之前用模拟 AAF 把它削弱。见 {@anaSampling}。',
        'No. Aliasing happens at the instant of sampling: an input above fs/2 gives exactly the same sample points as a lower-frequency signal, and digital filtering afterwards cannot separate them. An analog AAF before the sampler must weaken it first. See {@anaSampling}.',
      ),
      lessons: ['anaSampling'],
    },
    {
      id: 'ana-aaf-cutoff',
      q: loc('抗混叠滤波器的截止频率是不是越低越好？', 'Is a lower AAF cutoff always better?'),
      a: loc(
        '不是。fc 越低，f_in 处的衰减越大，但有用的带内信号也会被削弱，幅度和失真的测量都会偏。通常把 fc 放在 fs/2 附近或略低，在压住混叠和保留带宽之间取舍。见 {@anaSampling}。',
        'No. A lower fc attenuates f_in more, but it also weakens the wanted in-band signal, so amplitude and distortion measurements shift. Usually fc sits near or a little below fs/2, trading suppression of aliasing against kept bandwidth. See {@anaSampling}.',
      ),
      lessons: ['anaSampling'],
    },
    {
      id: 'ana-sampling-rate-margin',
      q: loc('采样率只要是信号频率的两倍就够了吗？', 'Is twice the signal frequency enough for the sampling rate?'),
      a: loc(
        '理论上 fs 必须严格大于 2 × f_in（奈奎斯特判据）。实际测试通常取远高于这个值：信号接近 fs/2 时，每个周期只剩几个采样点，幅度和相位都难以还原，而 AAF 在 fs/2 附近也压不够陡。见 {@anaSampling}。',
        'In theory fs must be strictly greater than 2 × f_in (the Nyquist criterion). In practice test setups use a much higher rate: near fs/2 only a few samples fall in each cycle, amplitude and phase are hard to recover, and the AAF is not steep enough right at fs/2. See {@anaSampling}.',
      ),
      lessons: ['anaSampling'],
    },
  ],
}

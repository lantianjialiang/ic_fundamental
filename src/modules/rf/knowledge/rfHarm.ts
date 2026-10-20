import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-09 谐波与杂散：谐波、杂散、dBc 与频谱掩模 */
export const RF_HARM_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'harmonic',
      term: 'Harmonic',
      name: loc('谐波', 'Harmonic'),
      def: loc(
        '基波整数倍频率上的分量：2f₀ 是 2 次谐波，3f₀ 是 3 次谐波。功放等非线性器件的输出里会产生它们，驱动越大、越接近饱和越强。见 {@rfHarm}。',
        'Components at integer multiples of the fundamental: 2f₀ is the 2nd harmonic and 3f₀ the 3rd. Nonlinear parts such as power amplifiers produce them, more strongly the harder they are driven and the closer to saturation. See {@rfHarm}.',
      ),
      lessons: ['rfHarm'],
    },
    {
      id: 'spurious',
      term: 'Spur',
      name: loc('杂散', 'Spurious emission / spur'),
      def: loc(
        '不是基波整数倍、却出现在频谱上的分量，常来自时钟、混频或电源耦合。与谐波一样要查是否超出掩模，但查源头的方向不同。见 {@rfHarm}。',
        'A component on the spectrum that is not an integer multiple of the fundamental, often from the clock, mixing or supply coupling. Like harmonics it must be checked against the mask, but the source is traced in a different way. See {@rfHarm}.',
      ),
      lessons: ['rfHarm'],
    },
    {
      id: 'spectrum-mask',
      term: 'Spectrum mask',
      name: loc('频谱掩模', 'Spectrum mask'),
      def: loc(
        '规定各个频段允许的最大谐波与杂散电平的阶梯线，任何分量超过它就判 FAIL。本站掩模的数值是教学取值，不对应任何规范。见 {@rfHarm}。',
        'A stepped line setting the largest allowed harmonic and spur level in each band; any component above it fails. The mask values on this site are teaching values and do not match any standard. See {@rfHarm}.',
      ),
      lessons: ['rfHarm'],
    },
  ],
  extraLessons: {
    dbc: ['rfHarm', 'rfPhaseNoise'],
    'harmonic-distortion': ['rfHarm'],
    thd: ['rfHarm'],
    sfdr: ['rfHarm'],
    fft: ['rfHarm'],
  },
  faqs: [
    {
      id: 'rf-harm-spur-vs-harmonic',
      q: loc('杂散和谐波有什么区别？', 'How do spurs differ from harmonics?'),
      a: loc(
        '谐波是基波的整数倍（2f₀、3f₀），通常来自非线性，降低驱动或滤波可以压低。杂散不是整数倍（如本课的 137 MHz），常来自时钟、混频或电源耦合，调功放的偏置解决不了。两者都要进掩模判定。见 {@rfHarm}。',
        'Harmonics are integer multiples of the fundamental (2f₀, 3f₀), usually from nonlinearity, and can be reduced by lowering drive or filtering. Spurs are not integer multiples (such as 137 MHz in this lesson), often from the clock, mixing or supply coupling, and biasing the amplifier will not remove them. Both are judged against the mask. See {@rfHarm}.',
      ),
      lessons: ['rfHarm'],
    },
    {
      id: 'rf-harm-why-backoff',
      q: loc('为什么降低驱动就能压低谐波？', 'Why does lowering the drive reduce harmonics?'),
      a: loc(
        '功放越接近饱和，输出波形越被削平，谐波越强。降低驱动（退避，backoff）让工作点离开饱和区，非线性变弱，谐波随之下降。代价是输出功率也降低，要在功率与线性之间权衡。见 {@rfHarm}。',
        'The closer an amplifier is to saturation, the more its output is clipped and the stronger its harmonics. Lowering the drive (backoff) moves the operating point away from saturation, weakens the nonlinearity and reduces the harmonics. The cost is lower output power, so power and linearity must be traded off. See {@rfHarm}.',
      ),
      lessons: ['rfHarm'],
    },
    {
      id: 'rf-harm-dbc-vs-dbm',
      q: loc('为什么掩模常用 dBc，而不是绝对功率？', 'Why are masks often given in dBc rather than absolute power?'),
      a: loc(
        'dBc 相对基波，消去了基波功率大小的影响，便于比较频谱的纯净度。但有的规范也给绝对功率（dBm）限值，因为有些干扰关心的是实际发射出去的功率。本站掩模只用 dBc，是教学取值。见 {@rfHarm}。',
        'dBc is relative to the fundamental, which removes the effect of the fundamental’s absolute power, so spectral purity can be compared. Some standards also give absolute power (dBm) limits, because some interference depends on the power actually radiated. The mask on this site uses only dBc and holds teaching values. See {@rfHarm}.',
      ),
      lessons: ['rfHarm'],
    },
  ],
}

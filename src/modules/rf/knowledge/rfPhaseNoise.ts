import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-10 相位噪声：L(f)、积分相位噪声、频偏与 dBc/Hz */
export const RF_PHASE_NOISE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'phase-noise',
      term: 'Phase noise L(f)',
      name: loc('相位噪声 L(f)', 'Phase noise L(f)'),
      def: loc(
        '偏移载波 f 处、每 1 Hz 带宽内的单边噪声功率，相对载波功率，单位 dBc/Hz。振荡器和时钟越“干净”，L 越低。见 {@rfPhaseNoise}。',
        'The single-sideband noise power in a 1 Hz bandwidth at offset f from the carrier, relative to the carrier power, in dBc/Hz. The cleaner the oscillator or clock, the lower L. See {@rfPhaseNoise}.',
      ),
      lessons: ['rfPhaseNoise'],
    },
    {
      id: 'integrated-phase-noise',
      term: 'Integrated phase noise',
      name: loc('积分相位噪声', 'Integrated phase noise'),
      def: loc(
        '在一段偏移区间内把线性的 L(f) 积分，乘 2（两个边带）后开方，得到相位的 rms（弧度）。除以 2π·f0 就是时间抖动。见 {@rfPhaseNoise}。',
        'Integrate the linear L(f) over an offset range, multiply by 2 for both sidebands and take the square root to get the phase rms in radians. Dividing by 2π·f0 gives the time jitter. See {@rfPhaseNoise}.',
      ),
      lessons: ['rfPhaseNoise'],
    },
    {
      id: 'offset-frequency',
      term: 'Offset frequency',
      name: loc('频偏', 'Offset frequency'),
      def: loc(
        '离开载波的频率差 f。相位噪声必须说明在哪个频偏上，例如 L(100 kHz)。1/f² 段随频偏增大而下降，底噪段则基本不变。见 {@rfPhaseNoise}。',
        'The frequency distance f from the carrier. Phase noise must state its offset, for example L(100 kHz). The 1/f² region falls as the offset grows, while the floor stays roughly flat. See {@rfPhaseNoise}.',
      ),
      lessons: ['rfPhaseNoise'],
    },
  ],
  extraLessons: {
    'period-jitter': ['rfPhaseNoise'],
  },
  faqs: [
    {
      id: 'rf-pn-dbchz',
      q: loc('dBc/Hz 和 dBc 有什么区别？', 'How does dBc/Hz differ from dBc?'),
      a: loc(
        'dBc 是某个带宽内总的噪声功率相对载波的 dB 数；dBc/Hz 是每 1 Hz 带宽内的值。把线性的 L 乘以带宽再换成 dB，才得到该带宽的 dBc（约为 L + 10·log₁₀(带宽)）。见 {@rfPhaseNoise}。',
        'dBc is the total noise power over a band, in dB relative to the carrier; dBc/Hz is the value in one hertz of bandwidth. Multiply the linear L by the bandwidth and convert to dB to get the dBc of that band (about L + 10·log₁₀(bandwidth)). See {@rfPhaseNoise}.',
      ),
      lessons: ['rfPhaseNoise'],
    },
    {
      id: 'rf-pn-lower-limit',
      q: loc('为什么积分下限会明显影响抖动？', 'Why does the integration lower limit change the jitter so much?'),
      a: loc(
        '1/f² 段的 L 随偏移增大而快速下降，它的积分 c(1/f_lo − 1/f_hi) 在 f_lo 处最大。把下限从 1 kHz 提到 10 kHz，这一项大约缩小到 1/10。但底噪段的积分与下限关系不大，所以底噪占比高时，改下限的效果有限。见 {@rfPhaseNoise}。',
        'The L of the 1/f² region falls quickly with offset, and its integral c(1/f_lo − 1/f_hi) is largest at f_lo. Raising the lower limit from 1 kHz to 10 kHz shrinks this term to about 1/10. The floor’s integral barely depends on the lower limit, so when the floor dominates, changing the limit helps less. See {@rfPhaseNoise}.',
      ),
      lessons: ['rfPhaseNoise'],
    },
    {
      id: 'rf-pn-jitter-convert',
      q: loc('相位噪声怎么换算成时间抖动？', 'How is phase noise converted to time jitter?'),
      a: loc(
        '先在偏移区间内对线性的 L(f) 积分，乘 2 后开方得到 θ_rms（弧度），再除以 2π·f0 得到时间抖动 t_rms（秒）。例如 θ = 0.01 rad、f0 = 1 GHz 时，t ≈ 1.59 ps。见 {@rfPhaseNoise}。',
        'First integrate the linear L(f) over the offset range, multiply by 2 and take the square root to get θ_rms in radians, then divide by 2π·f0 to get the time jitter t_rms in seconds. For example, θ = 0.01 rad at f0 = 1 GHz gives t ≈ 1.59 ps. See {@rfPhaseNoise}.',
      ),
      lessons: ['rfPhaseNoise'],
    },
  ],
}

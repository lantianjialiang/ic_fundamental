import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-06 输出功率与 P1dB：压缩点、饱和功率与 Rapp 模型 */
export const RF_P1DB_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'p1db',
      term: 'P1dB',
      name: loc('1 dB 压缩点（P1dB）', '1 dB compression point (P1dB)'),
      def: loc(
        '增益比小信号增益低 1 dB 时的输入功率（或输出功率）。它是放大器线性范围的常用终点：超过它，输出就不再按 1:1 增长。常在扫描中找到，相邻两点之间线性插值。见 {@rfP1db}。',
        'The input power (or output power) at which the gain is 1 dB below its small-signal value. It is the usual end of an amplifier’s linear range: beyond it the output no longer rises 1:1. It is found by sweeping, with linear interpolation between neighbouring points. See {@rfP1db}.',
      ),
      lessons: ['rfP1db'],
    },
    {
      id: 'psat',
      term: 'Psat',
      name: loc('饱和输出功率（Psat）', 'Saturated output power (Psat)'),
      def: loc(
        '输入继续增大，输出功率趋近的极限值。它比 P1dB 高 1–2 dB 左右：P1dB 时增益已经下降，Psat 时输出几乎不再增加。见 {@rfP1db}。',
        'The limit that the output power approaches as the input keeps rising. It sits about 1–2 dB above P1dB: at P1dB the gain has already dropped, while at Psat the output barely increases. See {@rfP1db}.',
      ),
      lessons: ['rfP1db'],
    },
    {
      id: 'rapp-model',
      term: 'Rapp model',
      name: loc('Rapp 压缩模型', 'Rapp compression model'),
      def: loc(
        '一种在线性（电压）域描述放大器饱和的经验模型：Vout = G·Vin / (1 + (G·Vin/Vsat)^(2p))^(1/(2p))。p 是平滑系数，p 越大，拐点越尖。本站的 p 取 2–3，是教学假设。见 {@rfP1db}。',
        'An empirical model of amplifier saturation in the linear voltage domain: Vout = G·Vin / (1 + (G·Vin/Vsat)^(2p))^(1/(2p)). p is the smoothness factor; a larger p gives a sharper knee. This site uses p between 2 and 3 as a teaching assumption. See {@rfP1db}.',
      ),
      lessons: ['rfP1db'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'rf-p1db-below-psat',
      q: loc('P1dB 为什么比 Psat 低？', 'Why is P1dB below Psat?'),
      a: loc(
        'P1dB 是增益下降 1 dB 的点，此时输出还没有到达饱和。在 Rapp 模型里，p = 2 时 P1dB 比 Psat 低约 2.2 dB，p = 3 时约 1.0 dB。p 越大，两者越接近。见 {@rfP1db}。',
        'P1dB is where the gain has dropped by 1 dB, and at that point the output has not yet reached saturation. In the Rapp model P1dB sits about 2.2 dB below Psat for p = 2 and about 1.0 dB below for p = 3; the larger p, the closer the two are. See {@rfP1db}.',
      ),
      lessons: ['rfP1db'],
    },
    {
      id: 'rf-p1db-dbm-50ohm',
      q: loc('dBm 的功率是怎么从电压算出来的？', 'How is a dBm power worked out from a voltage?'),
      a: loc(
        '50 Ω 系统中，有效值电压 V 对应功率 P = V²/50（W），再换成 dBm：10·log10(P / 1 mW)。例如 1 V 有效值对应 20 mW，即 13.0 dBm。见 {@rfDb}。',
        'In a 50 Ω system a voltage V rms corresponds to P = V²/50 (W), converted to dBm as 10·log10(P / 1 mW). For example, 1 V rms is 20 mW, which is 13.0 dBm; see {@rfDb}.',
      ),
      lessons: ['rfP1db'],
    },
    {
      id: 'rf-p1db-smoothness',
      q: loc('平滑系数 p 取多大合适？', 'What value of the smoothness p is appropriate?'),
      a: loc(
        '真实器件的拐点形状要靠实测拟合。本站取 p = 2–3 只是为了让曲线形状合理，不对应某个器件。改 p 时，P1dB 与 Psat 的差距会跟着变，这正是要看的地方。见 {@rfP1db}。',
        'The knee shape of a real device has to be fitted from measurements. This site uses p = 2–3 only to keep the curve shape plausible, not to match any device. Changing p changes the gap between P1dB and Psat, which is exactly what to observe; see {@rfP1db}.',
      ),
      lessons: ['rfP1db'],
    },
  ],
}

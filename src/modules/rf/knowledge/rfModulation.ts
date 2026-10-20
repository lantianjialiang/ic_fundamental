import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-11 调制基础：I/Q 两路、星座图、16QAM 与 I/Q 失衡 */
export const RF_MODULATION_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'iq-channels',
      term: 'I/Q',
      name: loc('I/Q 两路（同相路与正交路）', 'I/Q (in-phase and quadrature paths)'),
      def: loc(
        '用相差 90° 的两个载波（cos 与 sin）各传一路幅度。理想情况下两路互不干扰，合起来就是平面上的一个点。I 是同相路，Q 是正交路。见 {@rfModulation}。',
        'Two carriers 90° apart (cos and sin) each carry one amplitude. Ideally the two paths do not interfere, and together they form one point on a plane. I is the in-phase path and Q the quadrature path. See {@rfModulation}.',
      ),
      lessons: ['rfModulation'],
    },
    {
      id: 'constellation',
      term: 'Constellation',
      name: loc('星座图', 'Constellation diagram'),
      def: loc(
        '把所有可能的符号画在 I–Q 平面上的图。QPSK 是 4 个点，每符号 2 bit；16QAM 是 4×4 = 16 个点，每符号 4 bit。点之间的距离越小，越容易被噪声和失真推到别的点上。见 {@rfModulation}。',
        'A plot of every possible symbol on the I–Q plane. QPSK has 4 points, 2 bits per symbol; 16QAM has 4×4 = 16 points, 4 bits per symbol. The closer the points, the easier noise and distortion push one onto another. See {@rfModulation}.',
      ),
      lessons: ['rfModulation'],
    },
    {
      id: 'qam16',
      term: '16QAM',
      name: loc('16 点正交幅度调制（16QAM）', '16-point quadrature amplitude modulation (16QAM)'),
      def: loc(
        'I 和 Q 各取 4 个电平（−3、−1、+1、+3），组成 4×4 = 16 个点，每符号 4 bit。平均功率归一化后，点间距约 0.63，QPSK 约 1.41，所以同样的失真更容易判错。见 {@rfModulation}。',
        'I and Q each take 4 levels (−3, −1, +1, +3), giving 4×4 = 16 points and 4 bits per symbol. With average power normalised, the spacing is about 0.63 against 1.41 for QPSK, so the same distortion causes errors sooner. See {@rfModulation}.',
      ),
      lessons: ['rfModulation'],
    },
    {
      id: 'iq-imbalance',
      term: 'I/Q imbalance',
      name: loc('I/Q 失衡', 'I/Q imbalance'),
      def: loc(
        '两路不对称：Q 路增益与 I 路不同（ε），或两路的正交关系偏离 90°（φ）。失衡让星座拉伸或斜切，点靠近判决边界后就会判错。见 {@rfModulation}。',
        'The two paths are not matched: the Q-path gain differs from the I-path gain (ε), or the quadrature relation is off 90° (φ). Imbalance stretches or shears the constellation, and points pushed near a decision boundary are misjudged. See {@rfModulation}.',
      ),
      lessons: ['rfModulation'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'rf-mod-why-iq',
      q: loc('为什么要用 I/Q 两路，而不是只调一个幅度？', 'Why use two I/Q paths instead of modulating only one amplitude?'),
      a: loc(
        '只调一个幅度（ASK）只能传一个数。I/Q 用两路正交的载波，一个符号可以同时携带两个独立的数，所以同样的带宽能传更多比特。代价是两路必须匹配：增益或相位不一致就会出现 I/Q 失衡，见 {@rfModulation}。',
        'Modulating a single amplitude (ASK) carries only one number. I/Q uses two orthogonal carriers, so one symbol carries two independent numbers at once, and the same bandwidth carries more bits. The cost is that the two paths must match: a gain or phase mismatch causes I/Q imbalance; see {@rfModulation}.',
      ),
      lessons: ['rfModulation'],
    },
    {
      id: 'rf-mod-16qam-harder',
      q: loc('16QAM 比 QPSK 多一倍的比特，为什么更怕失真？', 'Why is 16QAM, with twice the bits of QPSK, more sensitive to distortion?'),
      a: loc(
        '点数多，点间距就小（归一化后约 0.63 对 1.41）。判决边界离点更近，噪声或 I/Q 失衡只要推动一小段距离就会越界。高阶调制用更高的线性度和信噪比换来更高的数据率，见 {@rfModulation}。',
        'More points means smaller spacing (about 0.63 against 1.41 once normalised). Decision boundaries sit closer to each point, so noise or I/Q imbalance only has to move a point a short distance to cross one. Higher-order modulation trades linearity and SNR for data rate; see {@rfModulation}.',
      ),
      lessons: ['rfModulation'],
    },
    {
      id: 'rf-mod-iq-shape',
      q: loc('I/Q 失衡在星座图上是什么样子？', 'What does I/Q imbalance look like on the constellation?'),
      a: loc(
        '增益误差 ε 只作用于 Q 路，让星座沿 Q 方向拉长或压扁，变成长方形；相位误差 φ 让 Q 路混入一部分 I 路分量，星座斜切成平行四边形。两者都不改变点数，但会让点靠近判决边界，见 {@rfModulation}。',
        'The gain error ε acts only on the Q path, stretching or squashing the constellation along Q into a rectangle. The phase error φ mixes part of the I component into Q, shearing the constellation into a parallelogram. Neither changes the number of points, but both move points towards decision boundaries; see {@rfModulation}.',
      ),
      lessons: ['rfModulation'],
    },
  ],
}

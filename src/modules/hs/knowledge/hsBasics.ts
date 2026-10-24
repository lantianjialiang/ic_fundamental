import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** HS-01 高速信号基础：数据速率、UI、上升时间与带宽的关系、稳态判据 */
export const HS_BASICS_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'data-rate',
      term: 'Data rate',
      name: loc('数据速率', 'Data rate'),
      def: loc(
        '每秒传输的比特数，单位 Gb/s。速率越高，一位占的时间（UI）越短，对信道带宽和边沿速度的要求越高。见 {@hsBasics}。',
        'The number of bits sent per second, in Gb/s. The higher the rate, the shorter each bit (UI), and the more bandwidth and edge speed the channel must deliver. See {@hsBasics}.',
      ),
      lessons: ['hsBasics'],
    },
    {
      id: 'bw-rise-rule',
      term: 'BW ≈ 350 / tr',
      name: loc('带宽与上升时间的经验公式', 'Bandwidth–rise-time rule of thumb'),
      def: loc(
        '一阶 RC 通道的 −3 dB 带宽与 10%–90% 上升时间之间的近似关系：BW × tr = ln 9 ÷ 2π ≈ 0.35（单位为秒与赫兹）；tr 用 ps、BW 用 GHz 时即 BW ≈ 350 / tr。知道其中一个，就能估算另一个。见 {@hsBasics}。',
        'The approximate link between the −3 dB bandwidth of a first-order channel and its 10%–90% rise time: BW × tr = ln 9 ÷ 2π ≈ 0.35 (in seconds and hertz); with tr in ps and BW in GHz this is BW ≈ 350 / tr. Knowing one gives an estimate of the other. See {@hsBasics}.',
      ),
      lessons: ['hsBasics'],
    },
    {
      id: 'settling-ratio',
      term: 'tr / UI',
      name: loc('上升时间占 UI 的比例', 'Rise time as a share of the UI'),
      def: loc(
        '上升时间除以单位间隔。本站判据是 tr / UI ≤ 0.5：一位结束时边沿已走到约 99%，波形可视为到达稳态。比例越大，相邻位互相影响越重。见 {@hsBasics}。',
        'Rise time divided by the unit interval. This site’s criterion is tr / UI ≤ 0.5: by the end of a bit the edge has reached about 99%, so the waveform is steady. The larger the ratio, the more neighbouring bits interfere. See {@hsBasics}.',
      ),
      lessons: ['hsBasics'],
    },
  ],
  extraLessons: {
    'rise-time': ['hsBasics'],
    'unit-interval': ['hsBasics'],
    'bandwidth-3db': ['hsBasics'],
    'rc-lowpass': ['hsBasics'],
  },
  faqs: [
    {
      id: 'hs-basics-rate-up-bw',
      q: loc('速率翻倍，带宽也要翻倍吗？', 'If the rate doubles, must the bandwidth double too?'),
      a: loc(
        '按本站判据（tr ≤ 0.5 UI）是的：BW ≥ 0.7 × 速率，速率翻倍，所需带宽也翻倍。真实链路可以用均衡补偿一部分损耗，但基本关系不变。见 {@hsBasics}。',
        'Under this site’s criterion (tr ≤ 0.5 UI), yes: BW ≥ 0.7 × rate, so doubling the rate doubles the bandwidth needed. Real links can offset part of the loss with equalisation, but the basic relation stays. See {@hsBasics}.',
      ),
      lessons: ['hsBasics'],
    },
    {
      id: 'hs-basics-why-half-ui',
      q: loc('为什么判据取 tr / UI = 0.5，而不是 0.3 或 1？', 'Why is the criterion tr / UI = 0.5 rather than 0.3 or 1?'),
      a: loc(
        '一阶 RC 的 10%–90% 上升时间约为 2.2 τ。UI = 2 tr 时，一位结束时残留约 1.2%，也就是约 99% 到位，这是“基本稳态”的常用标准。0.3 更保守但带宽要求更高；取 1 时一位结束只到约 89%，相邻位影响已经很明显。见 {@hsBasics}。',
        'A first-order RC has a 10%–90% rise time of about 2.2 τ. At UI = 2 tr the residual at bit end is about 1.2%, i.e. about 99% settled, a common standard for “essentially steady”. 0.3 is more conservative but needs more bandwidth; at 1 the edge reaches only about 89% and neighbouring bits already interfere noticeably. See {@hsBasics}.',
      ),
      lessons: ['hsBasics'],
    },
    {
      id: 'hs-basics-ui-from-rate',
      q: loc('UI 和速率怎么换算？', 'How do UI and data rate convert?'),
      a: loc(
        'UI = 1 ÷ 速率。速率以 Gb/s 为单位时，UI（ps）= 1000 ÷ 速率：10 Gb/s 时 UI = 100 ps，16 Gb/s 时 UI = 62.5 ps。它只与速率有关，与带宽无关。见 {@hsBasics}。',
        'UI = 1 ÷ rate. With the rate in Gb/s, UI (ps) = 1000 ÷ rate: 100 ps at 10 Gb/s and 62.5 ps at 16 Gb/s. It depends only on the rate, not on the bandwidth. See {@hsBasics}.',
      ),
      lessons: ['hsBasics'],
    },
    {
      id: 'hs-basics-where-1000',
      q: loc('UI = 1000 ÷ 速率，这个 1000 是从哪来的？', 'UI = 1000 ÷ rate: where does the 1000 come from?'),
      a: loc(
        '速率 R 以 Gb/s 计，即每秒 R × 10⁹ 位，一位占 1 ÷ (R × 10⁹) 秒。1 秒 = 10¹² ps，所以 UI = 10¹² ÷ (R × 10⁹) ps = 1000 ÷ R ps。1000 只是 10¹² 与 10⁹ 的单位换算。见 {@hsBasics}。',
        'The rate R is in Gb/s, meaning R × 10⁹ bits per second, so one bit lasts 1 ÷ (R × 10⁹) s. One second is 10¹² ps, so UI = 10¹² ÷ (R × 10⁹) ps = 1000 ÷ R ps. The 1000 is simply the unit conversion between 10¹² and 10⁹. See {@hsBasics}.',
      ),
      lessons: ['hsBasics'],
    },
    {
      id: 'hs-basics-bw-units',
      q: loc('BW ≈ 0.35 / tr 和 BW ≈ 350 / tr 有什么区别？', 'What is the difference between BW ≈ 0.35 / tr and BW ≈ 350 / tr?'),
      a: loc(
        '是同一个公式，只是单位不同。0.35 来自 ln 9 ÷ 2π，tr 与 BW 都用国际单位（tr 用秒、BW 用赫兹）时用 0.35。工程上常用 tr 用 ps、BW 用 GHz：1 ns = 1000 ps，换算后系数变成 350。例：tr = 70 ps 时 BW ≈ 350 ÷ 70 = 5 GHz。见 {@hsBasics}。',
        'They are the same formula with different units. 0.35 comes from ln 9 ÷ 2π and applies when tr is in seconds and BW in hertz. In engineering practice tr is in ps and BW in GHz: since 1 ns = 1000 ps, the constant becomes 350. Example: at tr = 70 ps, BW ≈ 350 ÷ 70 = 5 GHz. See {@hsBasics}.',
      ),
      lessons: ['hsBasics'],
    },
  ],
}

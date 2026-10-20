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
      term: 'BW ≈ 0.35 / tr',
      name: loc('带宽与上升时间的经验公式', 'Bandwidth–rise-time rule of thumb'),
      def: loc(
        '一阶 RC 通道的 −3 dB 带宽与 10%–90% 上升时间之间的近似关系：BW ≈ 0.35 / tr（tr 为 ps 时 BW 为 GHz）。知道其中一个，就能估算另一个。见 {@hsBasics}。',
        'The approximate link between the −3 dB bandwidth of a first-order channel and its 10%–90% rise time: BW ≈ 0.35 / tr (BW in GHz when tr is in ps). Knowing one gives an estimate of the other. See {@hsBasics}.',
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
  ],
}

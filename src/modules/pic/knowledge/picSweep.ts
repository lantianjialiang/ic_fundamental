import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const lesson = 'picSweep' as ModuleId

/** PIC-05 波长扫描：TLS、归一化、噪声底、步长 */
export const PIC_SWEEP_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-tls',
      term: 'Tunable laser source',
      name: loc('可调谐激光器（TLS）', 'Tunable laser source (TLS)'),
      def: loc(
        '按设定步长改变波长的激光器。每个波长上功率计读一次，连起来就是传输谱。见 {@picSweep}。',
        'A laser that steps its wavelength. A power meter reads once at each wavelength, and the points joined together are a transmission spectrum. See {@picSweep}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-normalize',
      term: 'Normalization',
      name: loc('归一化（参考回环）', 'Normalization (reference loop)'),
      def: loc(
        '用一段平坦的光栅回环做参考，器件谱减去回环谱。回环里只有耦合偏移，所以整条曲线的上下平移会被消掉。见 {@picSweep}。',
        'A flat grating loop is the reference, and the device spectrum minus the loop spectrum removes it. The loop contains only the coupling offset, so the up-and-down shift of the whole curve disappears. See {@picSweep}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-noise-floor',
      term: 'Noise floor',
      name: loc('噪声底', 'Noise floor'),
      def: loc(
        '功率计还能分辨的最低功率。谷值一旦低于噪声底，读数就停在噪声底上，报出的消光比被截断。见 {@picSweep}。',
        'The lowest power a power meter can still resolve. Once a dip goes below the noise floor, the reading stops there and the reported extinction ratio is clipped. See {@picSweep}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-step',
      term: 'Sweep step',
      name: loc('扫描步长', 'Sweep step'),
      def: loc(
        '相邻两个波长点的间隔。要小于线宽的大约 1/5，峰才不容易落在两个点之间。步长再小，点数和测试时间按比例增加。见 {@picSweep}。',
        'The gap between two wavelength points. It should be under about one fifth of the linewidth, or the peak can fall between two samples. A still smaller step adds points and test time in proportion. See {@picSweep}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {
    dbm: [lesson],
  },
  faqs: [
    {
      id: 'pic-sweep-step-time',
      q: loc('步长是不是越小越好？', 'Is a smaller step always better?'),
      a: loc(
        '不是。步长小于线宽的大约 1/5 之后，峰位不再明显变准，点数和测试时间却继续增加。步长大于线宽时，峰可能被漏掉。见 {@picSweep}。',
        'No. Once the step is below about one fifth of the linewidth, the peak location stops improving, while the point count and the test time keep growing. When the step is wider than the linewidth, the peak can be missed. See {@picSweep}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-sweep-normalize',
      q: loc('为什么一定要做归一化？', 'Why is normalization required?'),
      a: loc(
        '耦合和光源会把整条谱一起抬高或压低。不减参考回环，读到的是耦合加器件，不是器件自己的损耗。平坦回环只含耦合偏移，减掉之后偏移就消失。见 {@picSweep}。',
        'Coupling and the source shift the whole spectrum up or down together. Without subtracting a reference loop, the reading is coupling plus device, not the device loss alone. A flat loop contains only the coupling offset, and subtracting it removes that offset. See {@picSweep}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-sweep-er-floor',
      q: loc('谱线上的消光比是不是越大测得越准？', 'Does a larger extinction ratio on the plot mean a more accurate measurement?'),
      a: loc(
        '不是。低于噪声底的谷被画在底上，不能拿图上的谷底去除以峰值来报 ER。噪声底截断了真正的消光，再扫更密也读不出更深的坑。见 {@picSweep}、{@picDevice}。',
        'No. Valleys below the noise floor are drawn on the floor; you cannot divide that floor by the peak and report ER. The floor clips the true extinction, and a finer sweep will not recover a deeper dip. See {@picSweep} and {@picDevice}.',
      ),
      lessons: [lesson],
    },
  ],
}

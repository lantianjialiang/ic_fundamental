import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const lesson = 'picAlign' as ModuleId

/** PIC-06 光纤耦合与主动对准 */
export const PIC_ALIGN_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'pic-gc',
      term: 'Grating coupler',
      name: loc('光栅耦合器', 'Grating coupler'),
      def: loc(
        '从芯片表面近似垂直进光的耦合器。位置公差通常比边缘耦合宽，带宽有限。对准后仍在的耦合损耗记为 L0；失准附加损耗只是 4.343·(Δ/w)²，总损耗 L = L0 + 4.343·(Δ/w)²。见 {@picAlign}。',
        'A coupler that enters the chip from the top, nearly vertically. Its position tolerance is usually wider than an edge coupler, and its bandwidth is limited. L0 is the coupling loss that remains after alignment; the extra misalignment loss is only 4.343·(Δ/w)², so the total is L = L0 + 4.343·(Δ/w)². See {@picAlign}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-edge',
      term: 'Edge coupler',
      name: loc('边缘耦合器', 'Edge coupler'),
      def: loc(
        '从芯片端面进光的耦合器。带宽比光栅宽，对位置和角度更严。见 {@picAlign}。',
        'A coupler that enters through the chip facet. Its bandwidth is wider than a grating, and it is stricter about position and angle. See {@picAlign}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-active-align',
      term: 'Active alignment',
      name: loc('主动对准', 'Active alignment'),
      def: loc(
        '用功率读数当目标，在平面上找耦合峰。栅格铺满范围，螺旋可以早点停，爬山步数少但怕噪声里的假峰。见 {@picAlign}。',
        'A search that uses the power reading as the goal and looks for the coupling peak in the plane. Raster covers the range, a spiral can stop early, and hill-climb takes fewer moves but can lock onto a false peak in noise. See {@picAlign}.',
      ),
      lessons: [lesson],
    },
  ],
  extraLessons: {
    'pic-fau': [lesson],
  },
  faqs: [
    {
      id: 'pic-align-delta-w',
      q: loc('Δ = w 时附加损耗是多少？', 'What is the extra loss at Δ = w?'),
      a: loc(
        'L = L0 + 4.343·(Δ/w)²。Δ = w 且 L0 = 0 时，附加损耗就是 4.343 dB。角度、间隙和偏振还会再加。见 {@picAlign}。',
        'L = L0 + 4.343·(Δ/w)². At Δ = w and L0 = 0 the extra loss is 4.343 dB. Angle, gap and polarization add more. See {@picAlign}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-align-hill-noise',
      q: loc('为什么噪声一大，爬山就会失败？', 'Why does hill-climb fail when the noise is large?'),
      a: loc(
        '爬山只比较邻点谁的读数高。噪声盖过真实的功率差时，它会把假峰当成终点，停在离真峰还有一段距离的地方。见 {@picAlign}。',
        'Hill-climb only compares which neighbor reads higher. When noise exceeds the real power difference, it treats a false peak as the end and stops some distance from the true peak. See {@picAlign}.',
      ),
      lessons: [lesson],
    },
    {
      id: 'pic-align-drift',
      q: loc('对准一次之后会不会一直准？', 'Does one alignment stay aligned?'),
      a: loc(
        '不会。温度、夹具应力和光纤回弹都会让峰值再漂。主动对准找到的是当时的功率峰，过一会儿 Δ 又不是 0，附加损耗按 4.343·(Δ/w)² 回来。量产要对每一组通道重新找峰，或在贴装后复核耦合。见 {@picAlign}。',
        'No. Temperature, fixture stress and fiber spring-back move the peak again. Active alignment finds the power peak at that moment; later Δ is no longer 0 and the extra loss 4.343·(Δ/w)² returns. Production re-peaks every channel group, or rechecks coupling after attach. See {@picAlign}.',
      ),
      lessons: [lesson],
    },
  ],
}

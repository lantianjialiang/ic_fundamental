import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** HS-03 时钟与数据时序：Setup / Hold、采样点位置、时序裕量与窗口 */
export const HS_TIMING_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sampling-point',
      term: 'Sampling point',
      name: loc('采样点（采样沿）', 'Sampling point (sampling edge)'),
      def: loc(
        '接收端在一个位里真正读数据的时刻。它离数据沿越远，越不怕建立与保持的违例，但也不能太靠近下一个数据沿。见 {@hsTiming}。',
        'The instant the receiver actually reads a bit. The farther it is from the data edges the safer it is against setup and hold violations, but it must not come too close to the next data edge. See {@hsTiming}.',
      ),
      lessons: ['hsTiming'],
    },
    {
      id: 'setup-hold-window',
      term: 'Setup/Hold window',
      name: loc('建立/保持窗口（有效采样区）', 'Setup/hold window (valid sampling region)'),
      def: loc(
        '采样沿可以安全落在的那段时间：从前沿的 tSU 之后，到后沿的 tH 之前。窗口宽 = UI − tSU − tH − 抖动峰峰值。窗口一旦关闭，任何采样沿都会违例。见 {@hsTiming}。',
        'The span where the sampling edge can land safely: from tSU after the leading edge to tH before the trailing edge. Window width = UI − tSU − tH − jitter peak-to-peak. Once the window closes, no sampling edge is safe. See {@hsTiming}.',
      ),
      lessons: ['hsTiming'],
    },
    {
      id: 'timing-margin',
      term: 'Timing margin',
      name: loc('时序裕量', 'Timing margin'),
      def: loc(
        '采样沿离 Setup 边界与 Hold 边界的较小距离，单位 ps。裕量越大，温度、电压或抖动稍有变化也不容易违例；放在窗口中央时裕量最大。见 {@hsTiming}。',
        'The smaller of the distances from the sampling edge to the setup and hold boundaries, in ps. The larger the margin, the less a change in temperature, voltage or jitter can cause a violation; it is largest at the centre of the window. See {@hsTiming}.',
      ),
      lessons: ['hsTiming'],
    },
  ],
  extraLessons: {
    'setup-time': ['hsTiming'],
    'hold-time': ['hsTiming'],
    margin: ['hsTiming'],
    'unit-interval': ['hsTiming'],
  },
  faqs: [
    {
      id: 'hs-timing-why-centre',
      q: loc('采样沿为什么放在窗口中央，而不是紧贴 Setup 边界？', 'Why centre the sampling edge in the window instead of putting it right at the setup boundary?'),
      a: loc(
        '紧贴边界时裕量接近 0，温度、电源或抖动稍一变就可能落进违例区。中央两侧的裕量最均衡，最小裕量最大。见 {@hsTiming}。',
        'Right at the boundary the margin is close to zero, and a small change in temperature, supply or jitter can push the sample into the violation zone. The centre balances both margins and maximises the smaller one. See {@hsTiming}.',
      ),
      lessons: ['hsTiming'],
    },
    {
      id: 'hs-timing-jitter-peak',
      q: loc('边沿抖动为什么要按峰峰值而不是 rms 来缩小窗口？', 'Why shrink the window by the jitter peak-to-peak rather than the rms?'),
      a: loc(
        '窗口要对每一个数据沿都成立，最坏的是最晚的前沿和最早的后沿，二者之差是峰峰值。rms 只描述典型宽度。本站模型用固定种子抽一批沿，取它们的最大与最小值。见 {@hsTiming}。',
        'The window has to hold for every data edge; the worst cases are the latest leading edge and the earliest trailing edge, and their difference is the peak-to-peak value. The rms describes only a typical width. This site takes the maximum and minimum of a fixed-seed batch of edges. See {@hsTiming}.',
      ),
      lessons: ['hsTiming'],
    },
    {
      id: 'hs-timing-setup-or-hold',
      q: loc('怎么判断是 Setup 违例还是 Hold 违例？', 'How do you tell a setup violation from a hold violation?'),
      a: loc(
        '看采样沿在哪一侧：早于 Setup 边界（靠近前沿）是 Setup 违例，新数据还没稳定；晚于 Hold 边界（靠近后沿）是 Hold 违例，采样之后数据就变了。见 {@hsTiming}。',
        'Look at which side the sampling edge is on. Earlier than the setup boundary (close to the leading edge) is a setup violation: the new data has not settled. Later than the hold boundary (close to the trailing edge) is a hold violation: the data changes right after sampling. See {@hsTiming}.',
      ),
      lessons: ['hsTiming'],
    },
  ],
}

import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** HS-07 ATE 高速测试限制：测试通道带宽、夹具 / DIB 损耗、去嵌入（de-embed）与环回 */
export const HS_ATE_LIMIT_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'tester-channel-bandwidth',
      term: 'Tester channel bandwidth',
      name: loc('测试通道带宽', 'Tester channel bandwidth'),
      def: loc(
        'ATE 每一路通道的 −3 dB 带宽：信号幅度降到 1/√2 时的频率。带宽不够，边沿被拉慢，测得的眼比真实眼窄。本站按一阶低通估算上升时间 ≈ 350 ÷ BW。见 {@hsAteLimit}。',
        'The −3 dB bandwidth of one ATE channel: the frequency where the amplitude falls to 1/√2. Too little bandwidth slows the edges, so the measured eye is narrower than the real one. This site estimates rise time as ≈ 350 ÷ BW for a first-order low-pass. See {@hsAteLimit}.',
      ),
      lessons: ['hsAteLimit'],
    },
    {
      id: 'fixture-loss',
      term: 'Fixture / DIB loss',
      name: loc('夹具 / DIB 损耗', 'Fixture / DIB loss'),
      def: loc(
        '器件与 ATE 之间那段夹具（含负载板 DIB、连接器与走线）的插入损耗，常在奈奎斯特频率处给出，单位 dB。损耗越大，高频成分越弱，眼越窄。见 {@hsAteLimit}。',
        'The insertion loss of the fixture between the device and the ATE (including the load board / DIB, connectors and traces), usually given at the Nyquist frequency in dB. The more loss, the weaker the high-frequency content and the narrower the eye. See {@hsAteLimit}.',
      ),
      lessons: ['hsAteLimit'],
    },
    {
      id: 'de-embedding',
      term: 'De-embedding',
      name: loc('去嵌入（de-embed）', 'De-embedding'),
      def: loc(
        '用已知的夹具或通道模型，对测得的数据做逆补偿，把夹具的影响从结果里减掉。只在模型准确时有效；模型偏了，残留误差会留在眼图里。见 {@hsAteLimit}。',
        'Using a known model of the fixture or channel to apply an inverse compensation to the measured data, removing the fixture’s effect from the result. It works only when the model is accurate; a wrong model leaves residual error in the eye. See {@hsAteLimit}.',
      ),
      lessons: ['hsAteLimit'],
    },
    {
      id: 'serdes-loopback',
      term: 'SerDes loopback',
      name: loc('SerDes 环回（Loopback）', 'SerDes loopback'),
      def: loc(
        '让串行器件的发射端数据绕回它自己的接收端，在芯片内部完成判决，ATE 只读结果。它绕开了 ATE 通道与夹具的带宽，但测到的只是芯片内部的路径。见 {@hsAteLimit}。',
        'Routes the transmitter data of a serial device back to its own receiver so the decision is made inside the chip and the ATE only reads the result. It avoids the ATE channel and fixture bandwidth, but tests only the internal path. See {@hsAteLimit}.',
      ),
      lessons: ['hsAteLimit'],
    },
  ],
  extraLessons: {
    'bandwidth-3db': ['hsAteLimit'],
    'load-board': ['hsAteLimit'],
    'scan-chain': ['hsAteLimit'],
    bist: ['hsAteLimit'],
  },
  faqs: [
    {
      id: 'hs-ate-why-deembed',
      q: loc('为什么不直接在 ATE 上测眼，而要去嵌入？', 'Why not measure the eye directly on the ATE instead of de-embedding?'),
      a: loc(
        'ATE 通道与夹具一定在测量路径上，它们的带宽和损耗无法从测得的数据里分辨出来。去嵌入是用已知的模型把它们的影响从结果中减掉，前提是模型准确。见 {@hsAteLimit}。',
        'The ATE channel and fixture are always on the measurement path, and their bandwidth and loss cannot be told apart from the measured data alone. De-embedding subtracts their effect with a known model, which is valid only if the model is accurate. See {@hsAteLimit}.',
      ),
      lessons: ['hsAteLimit'],
    },
    {
      id: 'hs-ate-deembed-accuracy',
      q: loc('去嵌入一定能把夹具去干净吗？', 'Does de-embedding always remove the fixture cleanly?'),
      a: loc(
        '不一定。只有模型与真实夹具一致时才干净；模型带宽偏大，补偿不足，夹具的影响还在；模型带宽偏小，补偿过头，眼图的高频被峰化，眼可能看起来比真实眼还好。结果应与模型误差一起报告。见 {@hsAteLimit}。',
        'Not always. It is clean only when the model matches the real fixture. If the model bandwidth is too high, the compensation is too weak and fixture effect remains; if it is too low, the compensation overshoots, peaks the high frequencies, and the eye can look better than the real one. Report the result together with the model error. See {@hsAteLimit}.',
      ),
      lessons: ['hsAteLimit'],
    },
    {
      id: 'hs-ate-rate-limit',
      q: loc('测试路径的速率上限怎么估？', 'How do you estimate the rate limit of a test path?'),
      a: loc(
        '先算测得路径的合成上升时间：各段按 350 ÷ BW 估算，再按平方和开方合成。它占 UI 的比例越大，眼越难张开；用模型扫描速率，找到能通过 mask 的最高速率，就是这条路径的速率上限。这是经验做法，本站的 mask 与阈值都是示意值。见 {@hsAteLimit}。',
        'First compute the combined rise time of the measured path: each stage as 350 ÷ BW, combined by root-sum-square. The larger its share of the UI, the harder the eye is to open. Sweep the rate in the model and take the highest rate that passes the mask; that is the path’s rate limit. This is a practical method, and the mask and thresholds on this site are illustrative. See {@hsAteLimit}.',
      ),
      lessons: ['hsAteLimit'],
    },
  ],
}

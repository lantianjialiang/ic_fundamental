import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/**
 * HS-06 高速接口测试：浴盆曲线、串行回环为本课新词条；PRBS（HS-05 已定义）与 BER（RF 综合已定义）只追加课程引用。
 */
export const HS_INTERFACE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'bathtub-curve',
      term: 'Bathtub curve',
      name: loc('浴盆曲线', 'Bathtub curve'),
      def: loc(
        '横轴是采样相位，纵轴是 log10(BER)。采样点在眼中间时 BER 最低，靠近边沿时急剧升高，两侧像浴盆的边墙。扫一遍就能看出在某个 BER 下眼宽有多宽。见 {@hsInterface}。',
        'The x-axis is the sampling phase and the y-axis is log10(BER). BER is lowest in the middle of the eye and rises steeply near the edges, like the walls of a bathtub. One sweep shows how wide the eye is at a given BER. See {@hsInterface}.',
      ),
      lessons: ['hsInterface'],
    },
    {
      id: 'serial-loopback',
      term: 'Serial loopback',
      name: loc('串行回环（Loopback）', 'Serial loopback (Loopback)'),
      def: loc(
        '把发送端 Tx 的数据在芯片内部接回接收端 Rx，数据不经过外部引脚、夹具和 ATE 比较器。ATE 只需启动测试并读回错误计数，不必直接采样多 Gb/s 的引脚。代价是外部路径没有被测到，要另外去嵌入。见 {@hsInterface}。',
        'Tx data is looped back inside the chip to the Rx input, so it never leaves through the pins, fixture or ATE comparator. ATE only starts the test and reads back the error count, instead of sampling a multi-Gb/s pin directly. The cost is that the external path is not measured and must be de-embedded separately. See {@hsInterface}.',
      ),
      lessons: ['hsInterface'],
    },
  ],
  extraLessons: {
    prbs: ['hsInterface'],
    'bit-error-rate': ['hsInterface'],
  },
  faqs: [
    {
      id: 'hs-interface-zero-errors',
      q: loc('测了很多位都没错，能不能直接说 BER 是 1e-12？', 'No errors in many bits: can I say the BER is 1e-12?'),
      a: loc(
        '不能。0 错误在 95% 置信下只给出上限 3 ÷ N：测 4 万位，上限约 7.5×10^-5。要用 0 错误证明 1e-12，需要约 3×10^12 位，10 Gb/s 下每条通道约 300 秒。工程上通常测浴盆的中段，再用双狄拉克模型外推尾部，并写明是外推。见 {@hsInterface}。',
        'No. Zero errors gives only an upper bound of 3 ÷ N at 95% confidence: 40000 bits give about 7.5×10^-5. Proving 1e-12 with zero errors needs about 3×10^12 bits, roughly 300 s per lane at 10 Gb/s. In practice the middle of the bathtub is measured and the tails are extrapolated with a dual-Dirac model, labelled as extrapolation. See {@hsInterface}.',
      ),
      lessons: ['hsInterface'],
    },
    {
      id: 'hs-interface-why-loopback',
      q: loc('为什么 ATE 常用 Loopback 测高速发送端？', 'Why does ATE often use Loopback to test a high-speed transmitter?'),
      a: loc(
        'ATE 的比较器与夹具跟不上多 Gb/s 的边沿，直接采样引脚测不出可信的眼图。Loopback 让芯片自己的 PRBS 检测器计错，ATE 只读回计数，测到的是芯片本身。夹具和板级走线的损耗则要另外去嵌入。见 {@hsInterface}。',
        'ATE comparators and fixtures cannot follow multi-Gb/s edges, so sampling the pin directly cannot give a trustworthy eye. With Loopback the chip’s own PRBS checker counts the errors and ATE only reads the count back, so what is measured is the chip itself. Fixture and board-trace loss must still be de-embedded separately. See {@hsInterface}.',
      ),
      lessons: ['hsInterface'],
    },
    {
      id: 'hs-interface-prbs-order',
      q: loc('PRBS7 已经包含所有非全零的 7 位组合，为什么还要用 PRBS31？', 'PRBS7 already contains every non-zero 7-bit pattern. Why use PRBS31?'),
      a: loc(
        '“覆盖所有 7 位组合”不等于覆盖了长连。PRBS7 最长连续相同位只有 7 位，PRBS31 可以到 31 位。交流耦合链路的基线漂移只在长连之后出现，码型太短就测不到。见 {@hsInterface}。',
        'Covering every 7-bit combination does not mean covering long runs. The longest run of identical bits is 7 in PRBS7 but 31 in PRBS31. Baseline drift on an AC-coupled link appears only after a long run, so a short pattern cannot expose it. See {@hsInterface}.',
      ),
      lessons: ['hsInterface'],
    },
  ],
}

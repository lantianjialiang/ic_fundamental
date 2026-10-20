import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-14 综合：射频收发器的 Tx / Rx 测试、接收灵敏度与 BER */
export const RF_CAPSTONE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'rf-transceiver',
      term: 'RF transceiver',
      name: loc('射频收发器', 'RF transceiver'),
      def: loc(
        '同一颗芯片里既有发射链（Tx：上变频、功率放大），又有接收链（Rx：低噪声放大、下变频）。测试分两条线：Tx 看输出功率和 EVM，Rx 看增益和灵敏度。见 {@rfCapstone}。',
        'One chip holding both a transmit chain (Tx: up-conversion and power amplification) and a receive chain (Rx: low-noise amplification and down-conversion). Test follows two lines: Tx checks output power and EVM, Rx checks gain and sensitivity. See {@rfCapstone}.',
      ),
      lessons: ['rfCapstone'],
    },
    {
      id: 'receiver-sensitivity',
      term: 'Receiver sensitivity',
      name: loc('接收灵敏度', 'Receiver sensitivity'),
      def: loc(
        '在规定的 BER 下，接收机能正确解码的最小输入功率。它由底噪（1 MHz 带宽约 −114 dBm）、噪声系数 NF 和所需 SNR 决定：灵敏度 ≈ −114 dBm + NF + SNR。见 {@rfCapstone}。',
        'The smallest input power at which the receiver decodes correctly at a specified BER. It is set by the noise floor (about −114 dBm in 1 MHz), the noise figure NF and the required SNR: sensitivity ≈ −114 dBm + NF + SNR. See {@rfCapstone}.',
      ),
      lessons: ['rfCapstone'],
    },
    {
      id: 'bit-error-rate',
      term: 'BER',
      name: loc('误码率（BER）', 'Bit error rate (BER)'),
      def: loc(
        '误码数 ÷ 总比特数。测试时在一个功率点发送若干比特、数误码，得到估计值；解析上 QPSK 的 BER = Q(√(2·Eb/N0))，BER = 1e-3 约需 Eb/N0 ≈ 6.8 dB。见 {@rfCapstone}。',
        'Errors ÷ total bits. In a test you send a number of bits at one power point and count errors to get an estimate; analytically QPSK gives BER = Q(√(2·Eb/N0)), and BER = 1e-3 needs about 6.8 dB of Eb/N0. See {@rfCapstone}.',
      ),
      lessons: ['rfCapstone'],
    },
  ],
  extraLessons: {
    dut: ['rfCapstone'],
    datalog: ['rfCapstone'],
    bin: ['rfCapstone'],
    'test-flow': ['rfCapstone'],
    limit: ['rfCapstone'],
  },
  faqs: [
    {
      id: 'rf-tr-stop-on-fail',
      q: loc('前面的测试项失败了，为什么后面的项目不再测？', 'Why are the later tests skipped when an earlier test fails?'),
      a: loc(
        '因为后面的测量前提已经不成立：输出功率不在范围内，EVM 和灵敏度测出来也无法解读；同时省下测试时间。本页的顺序是 上电与校准 → Tx 功率 → Tx EVM → Rx 增益 → Rx 灵敏度，任何一项失败就停，并按这一项分到 Tx 失败或 Rx 失败。见 {@rfCapstone}。',
        'Because the premise of the later measurements no longer holds: once output power is out of range, EVM and sensitivity cannot be interpreted, and time is saved. Here the order is power-up & cal → Tx power → Tx EVM → Rx gain → Rx sensitivity; any failing step stops the flow and bins the device as Tx fail or Rx fail. See {@rfCapstone}.',
      ),
      lessons: ['rfCapstone'],
    },
    {
      id: 'rf-tr-few-errors',
      q: loc('只数到几个误码，BER 的估计可信吗？', 'Can a BER estimate from only a few counted errors be trusted?'),
      a: loc(
        '误码数少时，计数本身的统计波动很大：数到 10 个误码，真实值的 ±30% 很常见。要判定 BER 限值，需要让误码数足够多，或改用解析外推（Q 函数）。本页的 BER 测试用 20000 bit，误码数不超过 20 才判 Pass。见 {@rfCapstone}。',
        'With few counted errors the counting itself is very noisy: when 10 errors are counted, ±30% around the true value is common. To judge a BER limit, count enough errors, or extrapolate analytically with the Q function. The BER test here uses 20000 bits and passes only if there are at most 20 errors. See {@rfCapstone}.',
      ),
      lessons: ['rfCapstone'],
    },
    {
      id: 'rf-tr-test-point',
      q: loc('Rx 测试功率为什么不一定要设在规格线上？', 'Why does the Rx test power not always have to sit on the spec line?'),
      a: loc(
        '测试功率低于规格线，判定比规格更严，合格的器件会被误判为 Fail（过杀）；测试功率高于规格线，判定变松，不合格的器件会漏过（漏检）。本页的 Rx 测试功率旋钮可以看到这两种情况。见 {@rfCapstone}。',
        'A test power below the spec line is stricter than the spec, so good devices are wrongly failed (overkill); a test power above it is looser, so bad devices can slip through (escapes). The Rx test power knob on this page shows both cases. See {@rfCapstone}.',
      ),
      lessons: ['rfCapstone'],
    },
  ],
}

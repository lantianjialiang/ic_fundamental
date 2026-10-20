import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-03 测试系统与链路：信号源、分析仪、夹具与链路判定 */
export const RF_SYSTEM_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'signal-generator',
      term: 'SG',
      name: loc('信号源（SG）', 'Signal generator (SG)'),
      def: loc(
        '给 DUT 提供激励的仪器，输出频率与功率都可设定，单位 dBm。它位于链路起点；没有 SG，DUT 就没有激励，链路不能测。见 {@rfSystem}。',
        'The instrument that stimulates the DUT, with settable frequency and output power in dBm. It sits at the start of the link; without an SG the DUT has no stimulus and the link cannot be measured. See {@rfSystem}.',
      ),
      lessons: ['rfSystem'],
    },
    {
      id: 'signal-analyzer',
      term: 'SA',
      name: loc('分析仪（SA）', 'Signal analyzer (SA)'),
      def: loc(
        '读取 DUT 响应的仪器，显示功率或频谱。它位于链路终点，读数要扣除它与 DUT 之间的线缆损耗才是 DUT 的输出。见 {@rfSystem}。',
        'The instrument that reads the DUT response, showing power or spectrum. It sits at the end of the link; its reading must account for the cable loss between the DUT and the SA. See {@rfSystem}.',
      ),
      lessons: ['rfSystem'],
    },
    {
      id: 'rf-fixture',
      term: 'Fixture',
      name: loc('测试夹具', 'Test fixture'),
      def: loc(
        '把 DUT 接到仪器上的那一段电路板、连接器与走线。它也有损耗，必须算进 DUT 前段的功率预算，或用校准去掉。见 {@rfSystem}。',
        'The board, connectors and traces that connect the DUT to the instruments. It has loss too, which must be counted in the power budget before the DUT, or removed by calibration. See {@rfSystem}.',
      ),
      lessons: ['rfSystem'],
    },
  ],
  extraLessons: {
    dut: ['rfSystem'],
    'insertion-loss': ['rfSystem'],
  },
  faqs: [
    {
      id: 'rf-link-check-first',
      q: loc('为什么要先检查链路，再读功率？', 'Why check the link before reading power?'),
      a: loc(
        '连错的链路，比如缺 SG、缺 SA、缺 DUT 或接反，算出来的数不是任何器件的性能。规则先判连接，连接正确后再按损耗算功率。见 {@rfSystem}。',
        'A wrong link, such as a missing SG, missing SA, missing DUT or reversed instruments, gives a number that is not the performance of any device. Check the connection first, then compute the power from the losses. See {@rfSystem}.',
      ),
      lessons: ['rfSystem'],
    },
    {
      id: 'rf-cable-after-dut',
      q: loc('DUT 后面的线缆损耗要不要算进 DUT 的输入功率？', 'Should the cable after the DUT be included in the DUT input power?'),
      a: loc(
        '不要。DUT 输入功率只看 DUT 前面的各段。DUT 后面的线缆只改变分析仪读数；要得到 DUT 的输出功率，才需要把它扣掉。见 {@rfSystem}。',
        'No. The DUT input power depends only on the segments before the DUT. The cable after the DUT only changes the analyzer reading; it is removed only when computing the DUT output power. See {@rfSystem}.',
      ),
      lessons: ['rfSystem'],
    },
    {
      id: 'rf-fixture-vs-cable',
      q: loc('线缆和夹具的损耗都要扣，它们有什么不同？', 'Both cable and fixture losses are subtracted. How do they differ?'),
      a: loc(
        '在本课的模型里，二者都是固定的正数 dB，按链路顺序相减。真实夹具的损耗随频率变化，并且要靠校准才能准确测出，见 {@rfCal}。',
        'In this lesson’s model both are fixed positive dB values subtracted in link order. A real fixture loss changes with frequency and must be measured accurately through calibration. See {@rfCal}.',
      ),
      lessons: ['rfSystem'],
    },
  ],
}

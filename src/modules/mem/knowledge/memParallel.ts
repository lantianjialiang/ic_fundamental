import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-10 存储器并行测试：Site、失效存储器（Fail Memory）、通道上限与读出瓶颈 */
export const MEM_PARALLEL_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'mem-site',
      term: 'Site (memory)',
      name: loc('测试 Site（存储器并行）', 'Test site (memory parallel test)'),
      def: loc(
        'ATE 上同时测试的一颗器件及其专用的测试资源。存储器测试中，所有 Site 共享同一份 March 图形，但各自保存失效数据。Site 数 = floor(通道数 ÷ 每颗通道数)。见 {@memParallel}。',
        'One device under test and its dedicated test resources, tested at the same time as others on the ATE. In memory test, all sites share one March pattern but each keeps its own fail data. Sites = floor(channels ÷ channels per device). See {@memParallel}.',
      ),
      lessons: ['memParallel'],
    },
    {
      id: 'fail-memory',
      term: 'Fail memory',
      name: loc('失效存储器（Fail Memory）', 'Fail memory'),
      def: loc(
        'ATE 每个通道旁边用来记录失效地址与数据的存储器，深度有限。它的内容用来做修复分析。存满以后，超出的失效只能计数，不能再存地址。见 {@memParallel}。',
        'Memory beside each ATE channel that records failing addresses and data, with limited depth. Its contents feed repair analysis. Once full, further failures can only be counted, not stored with their addresses. See {@memParallel}.',
      ),
      lessons: ['memParallel'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'mem-par-channels-enough',
      q: loc('通道够用，就一定能测更多颗吗？', 'If there are enough channels, can more devices always be tested?'),
      a: loc(
        '不一定。通道只决定 Site 数的上限。失效多时，每个 Site 的失效记录都要读出，读出时间与 Site 数成正比，吞吐会先放缓。另外失效存储器存满后，修复分析也会缺信息。见 {@memParallel}。',
        'Not always. Channels only set the upper limit on sites. When there are many failures, each site’s fail records must be read out, and that time grows with the number of sites, so throughput flattens first. A full fail memory also leaves repair analysis without the data it needs. See {@memParallel}.',
      ),
      lessons: ['memParallel'],
    },
    {
      id: 'mem-par-fail-full',
      q: loc('失效存储器满了，还能继续测吗？', 'Can testing continue when the fail memory is full?'),
      a: loc(
        '可以继续跑完图形，但超出深度的失效只能计数，不能再存地址。对只要 PASS 或 FAIL 的测试，这已经足够；但要做修复分析，就需要完整的失效位图，通常要缩短测试或分批测试。见 {@memParallel}。',
        'The pattern can run to the end, but failures beyond the depth can only be counted, not stored with their addresses. A pass or fail answer is enough for that, but repair analysis needs the full fail bitmap, so the test is usually shortened or split into batches. See {@memParallel}.',
      ),
      lessons: ['memParallel'],
    },
    {
      id: 'mem-par-capacity',
      q: loc('容量变大以后，并行还划算吗？', 'Is parallel test still worth it when capacity grows?'),
      a: loc(
        '仍然划算，但要重新算。容量变大，图形时间按比例变长，每颗测得慢，吞吐随之下降；同时固定的索引时间占比变小，失效读出的比例也会变。哪一项成为瓶颈，要用当前的容量、失效数和 Site 数一起算。见 {@memParallel}。',
        'Still worth it, but recalculate. A larger capacity makes the pattern proportionally longer, so each device is slower and throughput falls; the fixed indexing time becomes a smaller share, and the readout share changes too. Which factor limits throughput must be worked out from capacity, failure count and site count together. See {@memParallel}.',
      ),
      lessons: ['memParallel'],
    },
  ],
}

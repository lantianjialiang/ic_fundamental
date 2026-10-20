import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-13 综合：三道关的测试流程、时序限值、保持等待与批次的 Bin 分布 */
export const MEM_CAPSTONE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'mem-capstone-flow',
      term: 'Memory test flow',
      name: loc('存储器测试流程（第一个 Fail 即停）', 'Memory test flow (stop at the first fail)'),
      def: loc(
        '按顺序执行的一串测试：时序检查、功能测试（March C−）、DRAM 保持测试。第一个 Fail 决定 Bin，后面的步骤不再执行。见 {@memCapstone}。',
        'A fixed sequence of tests: timing check, functional test (March C−), and for DRAM a retention test. The first fail sets the bin and the later steps are not run. See {@memCapstone}.',
      ),
      lessons: ['memCapstone'],
    },
    {
      id: 'mem-timing-limit',
      term: 'Timing limit',
      name: loc('时序限值（周期 − 建立余量）', 'Timing limit (period − setup margin)'),
      def: loc(
        '访问时间 tAcc 允许的最大值：测试周期减去建立余量。tAcc 超过限值，这颗器件在时序检查中判失败。见 {@memCapstone}。',
        'The largest access time tAcc allowed: the test period minus the setup margin. A tAcc above the limit fails the timing check. See {@memCapstone}.',
      ),
      lessons: ['memCapstone'],
    },
    {
      id: 'mem-retention-wait',
      term: 'Retention wait',
      name: loc('保持等待时间', 'Retention wait'),
      def: loc(
        'DRAM 保持测试中，写入 1 之后不访问单元、等待的时间。等待越长，越能抓到漏电的单元，但测试越慢。规格值是 64 ms。见 {@memCapstone}。',
        'In the DRAM retention test, the time a cell is left unaccessed after writing 1. A longer wait catches more leaky cells, but the test is slower. The spec value is 64 ms. See {@memCapstone}.',
      ),
      lessons: ['memCapstone'],
    },
  ],
  extraLessons: {
    bin: ['memCapstone'],
    yield: ['memCapstone'],
    'test-escape': ['memCapstone'],
    'dram-retention': ['memCapstone'],
  },
  faqs: [
    {
      id: 'mem-cap-why-timing-first',
      q: loc('为什么流程先测时序，而不是先测功能？', 'Why does the flow test timing before function?'),
      a: loc(
        '时序检查只要 16 次操作，而 March C− 要 640 次（64 个单元 × 10）；先测便宜的，时序不过就不必再花时间跑功能。Bin 也因此由时序决定。见 {@memCapstone}。',
        'The timing check takes 16 operations, while March C− takes 640 (64 cells × 10). Running the cheap test first means a timing fail skips the functional test, and the bin is set by timing. See {@memCapstone}.',
      ),
      lessons: ['memCapstone'],
    },
    {
      id: 'mem-cap-why-stop-first',
      q: loc('为什么第一个 Fail 就要停？', 'Why stop at the first fail?'),
      a: loc(
        'Bin 只取决于第一个 Fail；后面的步骤即使执行，也不会改变 Bin，却会增加测试时间。停下来能省时间，代价是看不到后面的失效信息。见 {@memCapstone}。',
        'The bin depends only on the first fail; running later steps would not change it and would add test time. Stopping saves time at the cost of not seeing later failure information. See {@memCapstone}.',
      ),
      lessons: ['memCapstone'],
    },
    {
      id: 'mem-cap-same-serial',
      q: loc('为什么同一个器件编号每次都得到同一颗器件？', 'Why does the same device number always give the same device?'),
      a: loc(
        '模型用器件编号做随机数种子（seededRandom），缺陷与访问时间都由它生成。这样换一组测试设置时，比较的是同一颗器件，结论的差别只来自设置。见 {@memCapstone}。',
        'The model seeds its random generator with the device number (seededRandom), and defects and access time come from it. Changing test settings then compares the same device, so any difference comes only from the settings. See {@memCapstone}.',
      ),
      lessons: ['memCapstone'],
    },
  ],
}

import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-05 March 测试：元素、地址序、MATS+ 与 March C− */
export const MEM_MARCH_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'march-element',
      term: 'March element',
      name: loc('March 元素', 'March element'),
      def: loc(
        '按一个地址顺序（升序 ⇑ 或降序 ⇓）扫过所有单元，并在每个单元上依次做一串读写的步骤。算法由若干元素依次执行组成。见 {@memMarch}。',
        'A step that sweeps all cells in one address order (ascending ⇑ or descending ⇓) and performs a string of reads and writes on each cell. A March algorithm is a sequence of these elements. See {@memMarch}.',
      ),
      lessons: ['memMarch'],
    },
    {
      id: 'mats-plus',
      term: 'MATS+',
      name: loc('MATS+ 算法', 'MATS+ algorithm'),
      def: loc(
        '一种短的 March 算法：⇕(w0); ⇑(r0,w1); ⇓(r1,w0)，每个单元 5 次操作。能抓住固定型故障、地址故障和 TF↑，但漏掉 TF↓。见 {@memMarch}。',
        'A short March algorithm: ⇕(w0); ⇑(r0,w1); ⇓(r1,w0), 5 operations per cell. It catches stuck-at, address and TF↑ faults but misses TF↓. See {@memMarch}.',
      ),
      lessons: ['memMarch'],
    },
    {
      id: 'march-c-minus',
      term: 'March C−',
      name: loc('March C− 算法', 'March C− algorithm'),
      def: loc(
        '常用的 March 算法：⇕(w0); ⇑(r0,w1); ⇑(r1,w0); ⇓(r0,w1); ⇓(r1,w0); ⇕(r0)，每个单元 10 次操作。两个方向都读回写入的值，能抓住本站预设的全部故障。见 {@memMarch}。',
        'A common March algorithm: ⇕(w0); ⇑(r0,w1); ⇑(r1,w0); ⇓(r0,w1); ⇓(r1,w0); ⇕(r0), 10 operations per cell. It reads back written values in both directions and catches every preset fault on this site. See {@memMarch}.',
      ),
      lessons: ['memMarch'],
    },
    {
      id: 'address-order',
      term: 'Address order',
      name: loc('地址序（升序 / 降序）', 'Address order (ascending / descending)'),
      def: loc(
        'March 元素扫描地址的方向：升序从 0 到 N−1，降序从 N−1 到 0，⇕ 表示两者都可以（实际按升序执行）。耦合故障的侵害单元在受害单元的哪一侧，会影响它何时被触发。见 {@memMarch}。',
        'The direction in which a March element scans addresses: ascending runs 0 to N−1, descending runs N−1 to 0, and ⇕ means either (run ascending in practice). Whether the aggressor lies above or below the victim decides when the coupling is triggered. See {@memMarch}.',
      ),
      lessons: ['memMarch'],
    },
  ],
  extraLessons: {
    march: ['memMarch'],
    'transition-fault': ['memMarch'],
    'coupling-fault': ['memMarch'],
    'stuck-at': ['memMarch'],
  },
  faqs: [
    {
      id: 'mem-march-read-back',
      q: loc('为什么 March 要在写之后再读，而不是只写不读？', 'Why does March read after writing instead of only writing?'),
      a: loc(
        '只写不读的测试看不到单元里实际存了什么。跳变、耦合这类故障，只有在写入之后再读回，错误才会进入比较。MATS+ 的最后一个元素以写结束、之后没有读，所以漏掉 TF↓。见 {@memMarch}。',
        'A write-only test never sees what the cell actually stores. Transition and coupling faults enter a comparison only when the value is read back after the write. MATS+ ends with a write and never reads again, which is why it misses TF↓. See {@memMarch}.',
      ),
      lessons: ['memMarch'],
    },
    {
      id: 'mem-march-ops-cost',
      q: loc('March C− 比 MATS+ 多做的操作，换来了什么？', 'What does March C− gain for the extra operations over MATS+?'),
      a: loc(
        'MATS+ 每单元 5 次，March C− 每单元 10 次，时间约为两倍。换来的是两个方向都有读回：本页预设的全部故障都能抓住，而 MATS+ 漏掉 TF↓。时间随单元数线性增长，所以算法的选择要按故障类型和测试时间一起取舍。见 {@memMarch}。',
        'MATS+ does 5 operations per cell and March C− does 10, roughly twice the time. In return both directions are read back: every preset fault here is caught, while MATS+ misses TF↓. Time grows linearly with the cell count, so the choice trades fault types against test time. See {@memMarch}.',
      ),
      lessons: ['memMarch'],
    },
    {
      id: 'mem-march-order-matters',
      q: loc('为什么耦合故障要同时用升序和降序？', 'Why are both ascending and descending orders needed for coupling faults?'),
      a: loc(
        '耦合故障的侵害单元可能在受害单元的前面，也可能在后面。侵害单元的翻转与受害单元的读写之间的先后关系，取决于地址序；只用一种方向，就只覆盖了一类位置。升序与降序一起使用，两类位置都能覆盖。见 {@memMarch}。',
        'The aggressor of a coupling fault can sit before or after its victim. Whether an aggressor flip falls between the victim’s writes and reads depends on the address order, so one direction covers only one kind of position. Ascending and descending together cover both. See {@memMarch}.',
      ),
      lessons: ['memMarch'],
    },
  ],
}

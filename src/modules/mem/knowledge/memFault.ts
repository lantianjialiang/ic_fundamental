import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/**
 * MEM-03 存储器故障模型。
 * stuck-at、transition-fault、march、fault-model 已在别处定义，这里只追加课程引用（extraLessons）。
 */
export const MEM_FAULT_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'coupling-fault',
      term: 'Coupling fault',
      name: loc('耦合故障（Coupling）', 'Coupling fault'),
      def: loc(
        '一个单元（侵害单元）的跳变改变另一个单元（受害单元）的内容。CFin 是翻转，CFid 是强制为某个值。失效出现在受害单元上。见 {@memFault}。',
        'A transition in one cell (the aggressor) changes the content of another cell (the victim). CFin inverts the victim; CFid forces it to a value. The failure shows up on the victim. See {@memFault}.',
      ),
      lessons: ['memFault'],
    },
    {
      id: 'address-fault',
      term: 'Address fault',
      name: loc('地址故障（Address）', 'Address fault'),
      def: loc(
        '地址译码本身出错：有的地址不访问任何单元（写入丢失、读出固定），或者两个地址访问同一个单元（别名）。它不是某个单元坏了，而是地址到单元的对应错了。见 {@memFault}。',
        'The address decoding itself is wrong: an address may access no cell (writes lost, reads fixed), or two addresses may access the same cell (alias). It is not one bad cell but a wrong address-to-cell mapping. See {@memFault}.',
      ),
      lessons: ['memFault'],
    },
    {
      id: 'aggressor-victim',
      term: 'Aggressor / Victim',
      name: loc('侵害单元与受害单元', 'Aggressor and victim cells'),
      def: loc(
        '耦合故障里的一对单元：侵害单元是引起干扰的一方，受害单元是被改变内容的一方。测试时要按受害单元读出的结果判断，不能只看侵害单元。见 {@memFault}。',
        'The two cells in a coupling fault: the aggressor causes the disturbance, and the victim is the cell whose content changes. Testing judges by what the victim reads, not by the aggressor. See {@memFault}.',
      ),
      lessons: ['memFault'],
    },
  ],
  extraLessons: {
    'stuck-at': ['memFault'],
    'transition-fault': ['memFault'],
    march: ['memFault'],
    'fault-model': ['memFault'],
  },
  faqs: [
    {
      id: 'mem-fail-at-victim',
      q: loc('耦合故障的失效地址为什么是受害单元，而不是侵害单元？', 'Why is the failing address of a coupling fault the victim rather than the aggressor?'),
      a: loc(
        '耦合改变的是受害单元的内容，只有读受害单元时才会和期望比较。侵害单元自己的内容没有被改，读它是对的。所以排查时要顺着失效地址找到受害单元，再回头看哪个单元的跳变能干扰它。见 {@memFault}。',
        'Coupling changes the victim’s content, which is compared only when the victim is read. The aggressor’s own content is unchanged, so its reads are correct. When debugging, start from the failing address to find the victim, then look for which cell’s transition could disturb it. See {@memFault}.',
      ),
      lessons: ['memFault'],
    },
    {
      id: 'mem-march-vs-mats',
      q: loc('既然 MATS+ 更短，为什么还要用 March C−？', 'MATS+ is shorter, so why use March C−?'),
      a: loc(
        'MATS+ 的写 0 之后不再读回，因此抓不住 TF↓。March C− 多了几个元素，在 1→0 的写之后还会读 0，覆盖了跳变和耦合故障。代价是测试时间更长，每个单元 10 次操作，而 MATS+ 是 5 次。见 {@memFault} 与 {@memMarch}。',
        'MATS+ never reads back a 0 written after a 1, so it misses TF↓. March C− adds elements that read 0 again after a 1→0 write, covering transition and coupling faults. The cost is longer test time: 10 operations per cell instead of 5 for MATS+. See {@memFault} and {@memMarch}.',
      ),
      lessons: ['memFault', 'memMarch'],
    },
  ],
}

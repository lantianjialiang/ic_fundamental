import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-02 存储器读写流程：控制线、写周期、读访问时间 */
export const MEM_RW_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'memory-control-signals',
      term: 'CS# / WE# / OE#',
      name: loc('片选、写使能、输出使能（CS# / WE# / OE#）', 'Chip select, write enable, output enable (CS# / WE# / OE#)'),
      def: loc(
        'CS# 是片选，低有效，决定芯片是否被选中；WE# 为低时做写操作；OE# 为低时允许读出数据到总线。三者配合决定一拍里发生什么。见 {@memRw}。',
        'CS# is chip select, active low, and decides whether the chip is selected; WE# low means a write; OE# low lets read data reach the bus. Together they decide what happens in each cycle. See {@memRw}.',
      ),
      lessons: ['memRw'],
    },
    {
      id: 'write-cycle',
      term: 'Write cycle',
      name: loc('写周期', 'Write cycle'),
      def: loc(
        '一次写操作在总线上的完整过程：送地址，WE# 拉低并让数据有效，WE# 上升沿锁存，最后释放总线。数据必须在 WE# 上升沿前后保持稳定。见 {@memRw}。',
        'The full bus sequence of one write: send the address, drive WE# low with valid data, latch on the WE# rising edge, then release the bus. Data must hold steady around the WE# rising edge. See {@memRw}.',
      ),
      lessons: ['memRw'],
    },
    {
      id: 'read-access-time',
      term: 'Access time',
      name: loc('访问时间', 'Access time'),
      def: loc(
        '从地址或读使能有效，到读出数据在总线上稳定之间的时间。读数据要等这段时间过去才能采样。本课用一拍过渡区表示，真实器件以纳秒计。见 {@memRw}。',
        'The time from the address or read enable becoming valid until read data is stable on the bus. Read data must be sampled after this time has passed. This lesson shows it as one transition slot; real devices quote it in nanoseconds. See {@memRw}.',
      ),
      lessons: ['memRw'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'mem-write-latch-edge',
      q: loc('写数据为什么要在 WE# 上升沿前后保持稳定？', 'Why must write data be stable around the WE# rising edge?'),
      a: loc(
        '存储器在 WE# 上升沿锁存 DATA。上升沿前后数据若变化，锁进去的就可能不是要写的值。所以写时序图里 DATA 要先有效、WE# 上升沿时仍保持一小段时间，之后才释放。见 {@memRw}。',
        'The memory latches DATA on the WE# rising edge. If the data changes around that edge, the stored value may not be the intended one. So in the write timing, DATA must become valid first, hold through the rising edge for a short time, and only then be released. See {@memRw}.',
      ),
      lessons: ['memRw'],
    },
    {
      id: 'mem-read-after-oe',
      q: loc('读的时候，CS# 拉低后数据就该有了，为什么控制器还要等？', 'On a read, data should appear once CS# goes low, so why does the controller wait?'),
      a: loc(
        '读出的数据由存储器驱动，需要先有 OE# 拉低，再经过访问时间才稳定。控制器如果在这之前采样，拿到的是过渡态或旧值。这就是图中读操作先有一拍过渡区、再有一拍数据有效的原因。见 {@memRw}。',
        'Read data is driven by the memory. OE# must go low, and then the access time must pass before the data is stable. If the controller samples earlier, it gets a transition or an old value. That is why the read diagram has a transition slot before the valid-data slot. See {@memRw}.',
      ),
      lessons: ['memRw'],
    },
  ],
}

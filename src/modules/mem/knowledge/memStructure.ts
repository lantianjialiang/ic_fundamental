import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-01 存储器结构：Cell、Row / Column、Bank、地址映射 */
export const MEM_STRUCTURE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'memory-cell',
      term: 'Memory cell',
      name: loc('存储单元（Cell）', 'Memory cell'),
      def: loc(
        '存 1 位数据的最小单元。阵列里每个 Cell 有自己的行和列位置，读写时由地址译码选中它。见 {@memStructure}。',
        'The smallest unit that stores one bit. Each cell has its own row and column position in the array, and address decoding selects it for a read or write. See {@memStructure}.',
      ),
      lessons: ['memStructure'],
    },
    {
      id: 'memory-bank',
      term: 'Bank',
      name: loc('Bank（存储体）', 'Bank'),
      def: loc(
        '一块独立的存储阵列，有自己的译码与读出电路，通常由地址的高位选择。不同 Bank 之间的单元不在同一阵列里，物理上相距较远。见 {@memStructure}。',
        'An independent storage array with its own decoding and sense circuits, usually selected by the high address bits. Cells in different banks are not in the same array and are physically far apart. See {@memStructure}.',
      ),
      lessons: ['memStructure'],
    },
    {
      id: 'word-line-bit-line',
      term: 'Word line / Bit line',
      name: loc('字线（行）与位线（列）', 'Word line (row) and bit line (column)'),
      def: loc(
        '同一行的单元共用一条字线，由它选通；同一列的单元共用一条位线，读写数据沿位线进出。本课的 Row 与 Column 就是这两个方向。见 {@memStructure}。',
        'Cells in the same row share a word line that selects them; cells in the same column share a bit line that carries data in and out. The row and column in this lesson are these two directions. See {@memStructure}.',
      ),
      lessons: ['memStructure'],
    },
    {
      id: 'address-mapping',
      term: 'Address mapping',
      name: loc('地址映射', 'Address mapping'),
      def: loc(
        '逻辑地址到物理行、列（或单元）的换算。线性映射里连续地址同行；交错映射把地址位互换，连续地址排到同一列。映射决定哪些地址在物理上挨着。见 {@memStructure}。',
        'The conversion from a logical address to a physical row, column or cell. Under linear mapping consecutive addresses share a row; interleaved mapping swaps address fields so they share a column. The mapping decides which addresses are physically adjacent. See {@memStructure}.',
      ),
      lessons: ['memStructure'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'mem-adjacent-address',
      q: loc('地址相邻，就是物理上挨着吗？', 'Are adjacent addresses physically next to each other?'),
      a: loc(
        '不一定。地址相邻只说明编号连续；物理位置由地址映射决定。线性映射下第 7 与第 8 号地址隔着一行的跳变，交错映射下它们也相隔 8 格。耦合故障通常发生在物理相邻的单元之间，所以测试图形要按物理位置设计。见 {@memStructure}。',
        'Not necessarily. Adjacent addresses only mean consecutive numbers; the physical position comes from the address mapping. Under linear mapping addresses 7 and 8 sit on either side of a row break, and under interleaved mapping they are also 8 cells apart. Coupling usually happens between physically adjacent cells, so test patterns must follow the physical layout. See {@memStructure}.',
      ),
      lessons: ['memStructure', 'memFault'],
    },
    {
      id: 'mem-why-interleave',
      q: loc('为什么要用交错映射？', 'Why use interleaved mapping?'),
      a: loc(
        '交错映射改变的是地址到物理位置的对应，让连续地址分散到不同的行。本课只用它演示地址位互换的效果；真实器件用交错把连续访问分散到不同 Bank，从而减少等待，但译码和版图都更复杂。见 {@memStructure}。',
        'Interleaved mapping changes which physical position each address lands on, spreading consecutive addresses across rows. This lesson uses it only to show the effect of swapping address bits. Real devices interleave across banks to spread consecutive accesses and reduce waiting, but their decoding and layout are much more complex. See {@memStructure}.',
      ),
      lessons: ['memStructure'],
    },
  ],
}

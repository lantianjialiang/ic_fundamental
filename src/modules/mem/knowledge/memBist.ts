import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-09 BIST、冗余修复与 ECC：冗余行列、修复分配、ECC 纠一检二 */
export const MEM_BIST_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'redundancy-line',
      term: 'Redundancy row / column',
      name: loc('冗余行 / 冗余列', 'Redundancy row / column'),
      def: loc(
        '存储阵列里多出来的备用行或备用列。发现某一行或某一列有失效位时，可以把它整条替换掉，改用备用的那一条。数量有限（本课是 2 行 + 2 列），所以替换要有选择。见 {@memBist}。',
        'Spare rows or columns built into the array. When a row or column has a failing bit, the whole line can be swapped for a spare. The number is limited (2 rows + 2 columns in this lesson), so the choice matters. See {@memBist}.',
      ),
      lessons: ['memBist'],
    },
    {
      id: 'repair-allocation',
      term: 'Repair allocation',
      name: loc('修复分配', 'Repair allocation'),
      def: loc(
        '根据 BIST 查出的失效位位置，决定用哪几条备用行、列去替换。常用贪心法：每次选失效位最多的行或列，直到备用用完或没有失效位。贪心不保证最优。见 {@memBist}。',
        'Deciding which spare rows and columns replace which failing lines, based on the positions of the failing bits from BIST. A common method is greedy: pick the row or column with the most failures each time, until the spares run out or no failures remain. Greedy is not guaranteed optimal. See {@memBist}.',
      ),
      lessons: ['memBist'],
    },
    {
      id: 'ecc-sec-ded',
      term: 'ECC (SEC-DED)',
      name: loc('ECC（纠 1 检 2）', 'ECC (SEC-DED)'),
      def: loc(
        '错误校验与纠正码，常见形式是 SEC-DED：每个字附加校验位，能纠正 1 位错误，能检测 2 位错误但不能纠正。2 位以上错误可能被误判，不能保证处理。见 {@memBist}。',
        'Error-correcting code. The usual form, SEC-DED, adds check bits to each word: it corrects 1 bit error and detects 2 bit errors without correcting them. Three or more bit errors cannot be reliably handled. See {@memBist}.',
      ),
      lessons: ['memBist'],
    },
  ],
  extraLessons: {
    bist: ['memBist'],
    march: ['memBist'],
  },
  faqs: [
    {
      id: 'mem-bist-ecc-or-repair',
      q: loc('有了 ECC，还需要冗余修复吗？', 'With ECC, is redundancy repair still needed?'),
      a: loc(
        '需要，两者管的不是同一类问题。冗余修复替换的是整条坏行或坏列（例如一整列开路），ECC 只能在字里纠正单个位错误，同一个字坏 2 位以上它就无能为力。只有 ECC、没有冗余时，一条坏行会把整颗器件判 FAIL。见 {@memBist}。',
        'Yes, because they handle different problems. Redundancy repair replaces a whole bad row or column (for example an open that affects a full column). ECC only corrects a single bit inside a word, and it cannot handle two or more bad bits in the same word. With ECC but no spares, one bad row would still fail the whole device. See {@memBist}.',
      ),
      lessons: ['memBist'],
    },
    {
      id: 'mem-bist-greedy-optimal',
      q: loc('贪心分配一定能用最少的备用找到修复方案吗？', 'Does greedy allocation always find the repair with the fewest spares?'),
      a: loc(
        '不一定。贪心每一步只看当前失效最多的行或列，可能占掉之后更需要的备用资源。要找到最优方案需要穷举组合，代价更高。本课用贪心，是因为它简单、每一步都能讲清楚，实际的修复工具也常用它或它的变体。见 {@memBist}。',
        'Not always. Greedy looks only at the line with the most failures right now, so it can use up a spare that a later step needed. Finding the optimum requires searching combinations, which costs much more. This lesson uses greedy because each step is easy to explain. See {@memBist}.',
      ),
      lessons: ['memBist'],
    },
    {
      id: 'mem-bist-why-not-ate',
      q: loc('BIST 能把 ATE 的存储器测试全部替代掉吗？', 'Can BIST replace all memory testing on the ATE?'),
      a: loc(
        '不能。BIST 在芯片内产生图形、比较结果，省下了 ATE 逐拍送向量的通道和存储；但电源与参数测试仍要 ATE 来做，修复的熔丝编程也要外部完成，而且失效位图要读出来，才能做修复分配。见 {@memBist}。',
        'No. BIST generates patterns and compares results inside the chip, which saves the ATE from sending vectors cycle by cycle; but supply and parametric tests still need the ATE, fuse programming for repair is done externally, and the fail bitmap must be read out before repair allocation can happen. See {@memBist}.',
      ),
      lessons: ['memBist'],
    },
  ],
}

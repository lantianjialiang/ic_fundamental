import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'
import { minLinesOf, SPARE_COLS, SPARE_ROWS } from '../memBinModel'

/** 3×3 全部失效需要的最少备份线数（由模型算出，文字里不手写） */
const BLOCK3_CELLS: Array<[number, number]> = []
for (let dr = 0; dr < 3; dr += 1) {
  for (let dc = 0; dc < 3; dc += 1) {
    BLOCK3_CELLS.push([dr, dc])
  }
}
const BLOCK3_MIN = minLinesOf(BLOCK3_CELLS)

/** MEM-12 失效位图与 Bin：Fail Bit Map、Fail Address、失效分类、备份行 / 列 */
export const MEM_BIN_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'mem-fail-bitmap',
      term: 'Fail Bit Map',
      name: loc('失效位图', 'Fail bit map'),
      def: loc(
        '把测试中每一个失效位按行、列摊在一张表上：红格是失效、灰格是通过。它把“错了几位”变成“错在哪里”，形状决定失效类型。见 {@memBin}。',
        'Every failing bit from the test, laid out by row and column: red cells failed, grey cells passed. It turns “how many bits” into “where”, and the shape decides the failure class. See {@memBin}.',
      ),
      lessons: ['memBin'],
    },
    {
      id: 'mem-fail-address',
      term: 'Fail Address',
      name: loc('失效地址', 'Fail address'),
      def: loc(
        '读回值与期望值不一致的那次访问所在的地址。它只给出一个位置，看不出形状；整行、簇、随机可能在地址上难以分辨。见 {@memBin}。',
        'The address of an access whose read-back differs from the expected value. It gives one location and no shape; a full row, a cluster and random failures can be hard to tell apart by address alone. See {@memBin}.',
      ),
      lessons: ['memBin'],
    },
    {
      id: 'mem-fail-class',
      term: 'Failure Class',
      name: loc('失效分类', 'Failure class'),
      def: loc(
        '按位图形状把失效归类：单点、整行、整列、簇、随机。本站的分类规则是：整行 / 整列看同一行（列）的失效是否占一半以上且其它行（列）几乎没有；簇看连通块是否占大部分；其它为随机。见 {@memBin}。',
        'Grouping failures by bitmap shape: single bit, full row, full column, cluster or random. This site’s rules: full row or column when one line holds at least half the fails and the rest hold almost none; cluster when a connected block holds most fails; otherwise random. See {@memBin}.',
      ),
      lessons: ['memBin'],
    },
    {
      id: 'mem-spare-line',
      term: 'Spare Row / Column',
      name: loc('备份行 / 备份列', 'Spare row / spare column'),
      def: loc(
        '芯片里预留的多余的行线或列线。失效位落在它们覆盖的范围内，就用备份替换；备份数量有限，所以能修的失效形状有限。见 {@memBin}。',
        'Extra row or column lines built into the chip. Failing bits covered by a spare are replaced by it; the number of spares is limited, so only certain failure shapes can be repaired. See {@memBin}.',
      ),
      lessons: ['memBin'],
    },
  ],
  extraLessons: {
    bin: ['memBin'],
    'failure-analysis': ['memBin'],
  },
  faqs: [
    {
      id: 'mem-bin-same-count',
      q: loc('失效位数一样多，为什么 Bin 不一样？', 'Why do two maps with the same fail count land in different bins?'),
      a: loc(
        'Bin 看的是形状，不是数量。16 个坏位排成一行，是整行，Bin 3；16 个坏位分散在各处，是随机，Bin 6。同样是 16 个，原因和修法完全不同：整行只要一条备份行，随机分布的坏点往往要的线超过备份数。见 {@memBin}。',
        'The bin follows the shape, not the count. Sixteen bad bits in one row is a full row, bin 3; sixteen scattered across the map is random, bin 6. Same count, different cause and repair: a full row needs one spare row, while scattered bits often need more lines than there are spares. See {@memBin}.',
      ),
      lessons: ['memBin'],
    },
    {
      id: 'mem-bin-means-repair',
      q: loc('分到某个 Bin 就能修好吗？', 'Does a bin number mean the part can be repaired?'),
      a: loc(
        `不一定。Bin 说明失效的形状，修不修得了要看备份：例如一个 3×3 的全失效块至少需要 ${BLOCK3_MIN} 条线，而本站只有 ${SPARE_ROWS} 行 + ${SPARE_COLS} 列备份，所以修不了。判 Bin 和判能否修是两步。见 {@memBin}。`,
        `Not necessarily. The bin names the shape; whether it can be fixed depends on the spares. For example a fully failing 3×3 block needs at least ${BLOCK3_MIN} lines, while this site has ${SPARE_ROWS} spare rows + ${SPARE_COLS} spare columns, so it cannot be fixed. Binning and repairability are two separate steps. See {@memBin}.`,
      ),
      lessons: ['memBin'],
    },
    {
      id: 'mem-bin-row-col',
      q: loc('整行和整列为什么要分开判？', 'Why judge full rows and full columns separately?'),
      a: loc(
        '它们对应不同的备份资源（备份行、备份列），常见的根因也不同：整行多见于一条字线（行线）出问题，整列多见于一条位线（列线）出问题。分开判，才能在失效分析时往不同的电路方向查。见 {@memBin}。',
        'They use different spares (spare rows and spare columns) and usually have different causes: a full row often points to one word line (row line), a full column to one bit line (column line). Judging them separately tells failure analysis which circuit to look at. See {@memBin}.',
      ),
      lessons: ['memBin'],
    },
  ],
}

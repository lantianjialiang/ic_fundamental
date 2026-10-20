import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-04 Pattern 与数据背景：棋盘格、Walking、数据背景与覆盖、耗时的权衡 */
export const MEM_PATTERN_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'checkerboard-pattern',
      term: 'Checkerboard',
      name: loc('棋盘格 Pattern', 'Checkerboard pattern'),
      def: loc(
        '相邻单元写入相反的数据（按地址奇偶交替 0 与 1），再整体取反写一遍，两个背景各读回一次。相邻单元之间的耦合会被激活，但偶数或奇数地址只经历单向跳变，有盲区。见 {@memPattern}。',
        'Neighbouring cells hold opposite data (0 and 1 alternating by address parity), then the whole array is inverted and read back again, so each background is checked once. Coupling between neighbours is activated, but even or odd addresses see only one-way transitions, so there are blind spots. See {@memPattern}.',
      ),
      lessons: ['memPattern'],
    },
    {
      id: 'walking-pattern',
      term: 'Walking 1 / Walking 0',
      name: loc('Walking 1 / Walking 0', 'Walking 1 / Walking 0'),
      def: loc(
        '背景为 0（或 1），每一轮只把一个单元写成相反的值，然后读回全部单元，轮到的单元依次“走”过整个阵列。每个单元都会经历跳变，覆盖最广，但每单元操作次数随单元数线性增长，总访问数随单元数平方增长。见 {@memPattern}。',
        'The background is 0 (or 1). Each round writes one cell to the opposite value and reads back all cells, so the single cell “walks” across the array. Every cell sees transitions, giving the widest coverage, but operations per cell grow linearly with the cell count and total accesses with its square. See {@memPattern}.',
      ),
      lessons: ['memPattern'],
    },
    {
      id: 'data-background',
      term: 'Data background',
      name: loc('数据背景', 'Data background'),
      def: loc(
        '测试前先写进阵列的那一组数据。背景决定了哪些单元在哪些时刻发生跳变、相邻单元之间是什么关系，因此决定了哪些故障能被激活。同一套读写顺序，换一个背景，覆盖就可能不同。见 {@memPattern}。',
        'The data written into the array before the read-back check. The background sets which cells transition and when, and how neighbours relate, so it decides which faults get activated. The same read/write order with a different background can give different coverage. See {@memPattern}.',
      ),
      lessons: ['memPattern'],
    },
  ],
  extraLessons: {
    pattern: ['memPattern'],
    'fault-coverage': ['memPattern'],
    'stuck-at': ['memPattern'],
  },
  faqs: [
    {
      id: 'mem-pattern-all0-enough',
      q: loc('全 0 和全 1 各跑一遍，不就够了吗？', 'Isn’t running all 0 and all 1 enough?'),
      a: loc(
        '不够。全 0 和全 1 都只写一种值，不会产生 1→0 与 0→1 两个方向的跳变：TF↓ 这类只在 1→0 时暴露的故障，以及下降沿耦合 CFin↓，两遍都漏掉。要抓跳变与耦合，背景里必须有两个方向的变化，见 {@memPattern} 的覆盖表。',
        'No. All 0 and all 1 each write a single value and never produce both 1→0 and 0→1 transitions, so TF↓, which shows only on a 1→0 change, and falling-edge coupling CFin↓ are missed by both. Catching transitions and couplings needs changes in both directions in the background. See the coverage table in {@memPattern}.',
      ),
      lessons: ['memPattern'],
    },
    {
      id: 'mem-pattern-walk-cost',
      q: loc('Walking 覆盖最广，为什么生产测试不全用它？', 'Walking has the widest coverage, so why not use it everywhere?'),
      a: loc(
        'Walking 的总访问数随单元数平方增长：每轮都要读写全部单元，共 N 轮。单元一多，时间就不可接受。实际测试用的是 {@memMarch} 里的 March 算法：每单元只有 5 到 10 次操作，总时间随单元数线性增长，靠元素的方向和读写组合来覆盖跳变与耦合。',
        'Walking’s total accesses grow with the square of the cell count, since it has N rounds that each read and write all N cells. Beyond a small array the time is unacceptable. Production tests use March algorithms from {@memMarch}: 5 to 10 operations per cell, total time linear in the cell count, with coverage coming from the directions and read/write mix of each element.',
      ),
      lessons: ['memPattern', 'memMarch'],
    },
    {
      id: 'mem-pattern-checkerboard-blind',
      q: loc('棋盘格为什么会漏掉以偶数地址为侵害单元的下降沿耦合？', 'Why does the checkerboard miss falling-edge coupling whose aggressor is an even address?'),
      a: loc(
        '棋盘格的两遍背景是奇偶反相的。偶数地址第一遍写 0、第二遍写 1，只发生 0→1，从不 1→0，所以它不会产生下降沿，以它为侵害单元的 CFin↓ 无从激活。奇数地址则两个方向都有，所以以奇数为侵害单元的下降沿耦合能被抓到。见 {@memPattern}。',
        'The two checkerboard backgrounds are inverted by parity. An even address writes 0 in the first pass and 1 in the second, so it only transitions 0→1 and never falls; a CFin↓ with an even aggressor therefore never gets activated. Odd addresses transition in both directions, so falling-edge coupling from an odd aggressor can be caught. See {@memPattern}.',
      ),
      lessons: ['memPattern'],
    },
  ],
}

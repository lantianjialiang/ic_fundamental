import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { ARRAY_SIZE, PRESET_FAULTS, type PresetFault } from './faultSet'
import {
  type CoverageRow,
  PATTERN_OPTIONS,
  type PatternId,
  coverageMatrix,
  opsPerCell,
  runPattern,
} from './patternModel'

/** 覆盖矩阵在模块加载时算一次：输入固定，结果确定 */
export const COVERAGE: CoverageRow[] = coverageMatrix()

const TOTAL = PRESET_FAULTS.length

function presetById(id: string): PresetFault {
  const found = PRESET_FAULTS.find((item) => item.id === id)
  if (found === undefined) {
    throw new Error(`unknown preset fault: ${id}`)
  }
  return found
}

function patternLabel(id: PatternId): LText {
  const found = PATTERN_OPTIONS.find((item) => item.id === id)
  return found === undefined ? PATTERN_OPTIONS[0].label : found.label
}

const en = (text: LText): string => text.en ?? text.zh
const SEP = loc('、', ', ')

/** 把短名拼成一句：中文用顿号，英文用逗号 */
function listOf(items: LText[]): LText {
  return loc(items.map((item) => item.zh).join(SEP.zh), items.map((item) => en(item)).join(SEP.en ?? ', '))
}

export const S = {
  kickerNow: loc('这一次 Pattern', 'This pattern'),
  introTitle: loc('Pattern：先写背景，再读回校验', 'Pattern: write a background, then read it back'),
  coreTitle: loc('拨一拨：选一个 Pattern，看它覆盖什么、花多少时间', 'Try it: pick a pattern and see what it covers and what it costs'),
  coreNote: loc(
    '每个预设故障单独注入到 8 单元的教学阵列里跑一遍：读回值与期望不一致就记为检出，表格里的地址是第一次失效的读出地址。',
    'Each preset fault is injected alone into an 8-cell teaching array: a read that differs from its expected value counts as a detection, and the address in the table is the first failing read.',
  ),
  patLabel: loc('数据背景 / Pattern', 'Data background / pattern'),
  rCov: loc('覆盖（检出 / 8）', 'Coverage (detected / 8)'),
  rAcc: loc('访问次数', 'Accesses'),
  rPerCell: loc('每单元操作次数', 'Operations per cell'),
  rCost: loc('耗时相对全 0', 'Cost relative to All 0'),
  rMissed: loc('漏检的故障数', 'Missed faults'),
  hit: loc('检出', 'Hit'),
  miss: loc('漏检', 'Miss'),
  addr: loc('地址', 'addr'),
  faultCol: loc('预设故障', 'Preset fault'),
  tableAria: loc('预设故障在五种 Pattern 下的检出与漏检表', 'Table of hits and misses for the preset faults under the five patterns'),
  figAria: loc(
    '五种 Pattern 的覆盖（检出数）与耗时（每单元操作次数）条形图',
    'Bar chart of the five patterns: coverage (faults detected) and cost (operations per cell)',
  ),
  figCap: loc(
    '蓝条是检出的预设故障数（满格 8），金条是每单元操作次数。Walking 覆盖最广，代价也最大；棋盘格便宜，但有盲区。',
    'Blue bars are detected preset faults (full scale 8); gold bars are operations per cell. Walking covers the most but costs the most; the checkerboard is cheap but has blind spots.',
  ),
  covLegend: loc('覆盖：检出数', 'Coverage: detected'),
  costLegend: loc('耗时：每单元操作', 'Cost: operations per cell'),
  next: loc('下一课：March 测试', 'Next: March Test'),
  asideLater: loc(
    '这里的 8 单元阵列和预设故障是教学用的；真实测试还要考虑地址与数据的物理位置、读写时序和温度，见后面的 March 与时序课。',
    'The 8-cell array and preset faults here are for teaching only; real tests also depend on physical layout, read/write timing and temperature, covered in the March and timing lessons.',
  ),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc('选全 0，找出它只能抓到的那一类故障（SAF1）', 'Pick All 0 and find the one fault class it can catch (SAF1)'),
  task2: loc('选棋盘格，找出它漏掉的两个故障（TF↓ 与 CFin↓）', 'Pick Checkerboard and find the two faults it misses (TF↓ and CFin↓)'),
  task3: loc('选 Walking 1，记下它每单元的操作次数，与棋盘格比较', 'Pick Walking 1, note its operations per cell, and compare with the checkerboard'),
  task4: loc('选 Walking 0，确认它检出全部 8 个预设故障', 'Pick Walking 0 and confirm it detects all 8 preset faults'),
  none: loc('无', 'none'),
}

export const INTRO = [
  loc(
    '{@memFault} 讲过：一个故障要被检出，必须先被激活（单元处于会暴露它的状态），再把差别读到输出上。Pattern 就是这种“激活 + 读回”的访问序列：先把数据背景写进阵列，再逐个单元读回校验。背景选什么、按什么顺序写，决定哪些故障会被激活。',
    'The {@memFault} lesson showed that a fault is caught only if it is first activated (the cell is put into a state that exposes it) and the difference then reaches a read. A pattern is that “activate and read back” access sequence: it writes a data background into the array and then reads each cell back. Which background you choose, and in what order you write, decides which faults get activated.',
  ),
  loc(
    '这一课比较五种 Pattern：全 0、全 1、棋盘格、Walking 1 与 Walking 0。它们都在同一个 8 单元阵列上跑一遍，表格列出每个预设故障是检出还是漏检；耗时用“每单元操作次数”衡量，即访问次数除以单元数。',
    'This lesson compares five patterns: all 0, all 1, checkerboard, Walking 1 and Walking 0. Each runs on the same 8-cell array; the table lists whether every preset fault is detected or missed, and cost is measured as operations per cell, the number of accesses divided by the number of cells.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '全 0 和全 1 各跑一遍，就覆盖了固定故障与跳变故障。全 0 只写 0、全 1 只写 1，两者都不产生 1→0 的跳变，所以 TF↓ 与下降沿耦合 CFin↓ 两遍都漏掉。',
    'Running all 0 and all 1 covers the stuck-at and transition faults. Both only write one value, so neither produces a 1→0 transition; TF↓ and falling-edge coupling CFin↓ are missed by both.',
  ),
  loc(
    '棋盘格相邻单元反相，所以它覆盖了所有耦合故障。它的盲区是偶数地址：这些单元只经历 0→1，从不下降，以偶数地址为侵害单元的 CFin↓ 就不会被激活。',
    'The checkerboard inverts neighbouring cells, so it covers every coupling fault. Its blind spot is even addresses: they only rise 0→1 and never fall, so a CFin↓ whose aggressor is an even address is never activated.',
  ),
  loc(
    'Walking 比棋盘格慢好几倍，没必要用。它的耗时是每单元 16 次，是棋盘格的 4 倍；但它是本页覆盖最广的 Pattern。省时间的代价是漏掉故障，不是“同样的结果更快”。',
    'Walking is several times slower than the checkerboard, so it is not worth using. It costs 16 operations per cell, four times the checkerboard, but it is the widest-covering pattern here. Saving time means missing faults, not getting the same result faster.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Pattern = 数据背景 + 读回校验。背景决定能激活哪些故障：全 0 与全 1 只激活单向跳变；棋盘格用反相背景覆盖相邻耦合，但偶数地址有盲区；Walking 每轮只放一个不同的值，覆盖最广，每单元操作次数也最多。选 Pattern 就是在覆盖率与测试时间之间做权衡。',
  'Pattern = data background + read-back check. The background decides which faults get activated: all 0 and all 1 only activate one-way transitions; the checkerboard covers neighbouring coupling with inverted backgrounds but has blind spots at even addresses; Walking puts one different value per round, giving the widest coverage at the highest operations per cell. Choosing a pattern trades coverage against test time.',
)

/** 每种 Pattern 的“为什么”：文字只写机制，数字与名单由页面的覆盖表给出 */
export const REASON: Record<PatternId, LText> = {
  all0: loc(
    '全 0 只写 0、只读 0，单元从来没有跳变，阵列里也从来没有 1。只有“卡在 1”的 SAF1 能让读出偏离期望；悬空的地址读出 0，与期望的 0 恰好相同，所以地址故障也看不出来。',
    'All 0 only writes and reads 0, so no cell ever transitions and the array never holds a 1. Only SAF1, a cell stuck at 1, makes a read differ from the expected 0; a floating address reads 0, which matches the expected 0, so address faults go unseen too.',
  ),
  all1: loc(
    '全 1 只会产生 0→1 的跳变，所以 1→0 才会暴露的 TF↓ 和 CFin↓ 没有机会被激活。它能抓到卡在 0 的 SAF0、不能升高的 TF↑，以及悬空的地址，因为这些都会让读出的 1 变成 0。',
    'All 1 only produces 0→1 transitions, so TF↓ and CFin↓, which show only on a 1→0 change, are never activated. It does catch SAF0 (stuck at 0), TF↑ (cannot rise) and floating addresses, because each turns the expected 1 into a read of 0.',
  ),
  checker: loc(
    '棋盘格让相邻单元反相，两遍背景覆盖了大多数跳变与耦合。但偶数地址在第一遍写 0、第二遍写 1，只经历 0→1，从不 1→0，所以 TF↓（单元 6）和侵害单元为偶数的 CFin↓ 都没有机会被激活。',
    'The checkerboard inverts neighbouring cells, and its two backgrounds cover most transitions and couplings. But even addresses write 0 then 1, so they only rise 0→1 and never fall 1→0; TF↓ on cell 6 and CFin↓ with an even aggressor are never activated.',
  ),
  walk1: loc(
    '每一轮只有一个单元是 1，轮到之后它又被写回 0，所以除最后一个单元外，每个单元都会经历一次 1→0，TF↓ 与 CFin↓ 都能被激活并读出。它的盲区是：CFid↑ 把受害单元强制为 0，而此刻受害单元本来就是 0，强制值与期望相同，看不出来。',
    'Each round has only one cell at 1, and that cell is written back to 0 in the next round, so every cell except the last falls 1→0 once; TF↓ and CFin↓ are activated and read out. Its blind spot is CFid↑: it forces the victim to 0, but the victim is already 0 in that round, so the forced value matches the expected one and goes unseen.',
  ),
  walk0: loc(
    '背景是 1，每一轮只有一个 0。绝大多数单元在相邻两轮之间既经历 0→1，也经历 1→0；受害单元的背景是 1，CFid↑ 把它强制成 0 就能被读出。本页预设故障里它全部检出，代价是每单元 16 次操作，是棋盘格的 4 倍。',
    'The background is 1 and each round has a single 0. Most cells both rise 0→1 and fall 1→0 between neighbouring rounds; the victim’s background is 1, so CFid↑ forcing it to 0 becomes visible. In this page’s preset faults it catches every one, at 16 operations per cell, four times the checkerboard.',
  ),
}

/** 一个 Pattern 的覆盖结论：检出的与漏检的故障，加上它的机制说明 */
export function verdictOf(pattern: PatternId, rows: CoverageRow[]): { title: LText; text: LText } {
  const hit = rows.filter((row) => row.cells[pattern].detected).map((row) => row.fault.short)
  const miss = rows.filter((row) => !row.cells[pattern].detected).map((row) => row.fault.short)
  const label = patternLabel(pattern)
  const hitText = hit.length > 0 ? listOf(hit) : S.none
  const missText = miss.length > 0 ? listOf(miss) : S.none
  return {
    title: loc(
      `${label.zh}：检出 ${hit.length} / ${TOTAL}`,
      `${en(label)}: ${hit.length} / ${TOTAL} detected`,
    ),
    text: loc(
      `检出：${hitText.zh}。漏检：${missText.zh}。${REASON[pattern].zh}`,
      `Detected: ${en(hitText)}. Missed: ${en(missText)}. ${en(REASON[pattern])}`,
    ),
  }
}

/** 四张任务卡：完成与否由当前选择的 Pattern 算出，重置后自动还原 */
export function taskItems(pattern: PatternId, rows: CoverageRow[]): TaskItem[] {
  const walk0Hits = rows.filter((row) => row.cells.walk0.detected).length
  return [
    { id: 'all0', text: S.task1, done: pattern === 'all0' },
    { id: 'checker', text: S.task2, done: pattern === 'checker' },
    { id: 'walk1', text: S.task3, done: pattern === 'walk1' },
    { id: 'walk0', text: S.task4, done: pattern === 'walk0' && walk0Hits === TOTAL },
  ]
}

/** 小测题中的数字全部由模型算出 */
const OPS_ALL0 = opsPerCell('all0', ARRAY_SIZE)
const OPS_CHECKER = opsPerCell('checker', ARRAY_SIZE)
const OPS_WALK1 = opsPerCell('walk1', ARRAY_SIZE)
const CFIN_WALK1_FAILS = runPattern('walk1', presetById('cfin-fall').fault).failAddrs

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('全 0 Pattern 在 8 单元阵列上，每个单元要做几次操作？', 'How many operations does All 0 perform on each cell of the 8-cell array?'),
    options: [
      { id: 'a', text: loc('1 次', '1 operation') },
      { id: 'b', text: loc(`${OPS_ALL0} 次`, `${OPS_ALL0} operations`) },
      { id: 'c', text: loc('8 次', '8 operations') },
    ],
    answer: 'b',
    explain: loc(
      `全 0 先写一遍 0，再读回一遍，每个单元 2 次操作：访问次数 ${OPS_ALL0 * ARRAY_SIZE} ÷ 单元数 ${ARRAY_SIZE} = ${OPS_ALL0}。`,
      `All 0 writes 0 once and reads back once, so 2 operations per cell: ${OPS_ALL0 * ARRAY_SIZE} accesses ÷ ${ARRAY_SIZE} cells = ${OPS_ALL0}.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('棋盘格（8 单元）一共有多少次访问？', 'How many accesses does the checkerboard make in total on 8 cells?'),
    options: [
      { id: 'a', text: loc('16 次', '16 accesses') },
      { id: 'b', text: loc(`${OPS_CHECKER * ARRAY_SIZE} 次`, `${OPS_CHECKER * ARRAY_SIZE} accesses`) },
      { id: 'c', text: loc('64 次', '64 accesses') },
    ],
    answer: 'b',
    explain: loc(
      `棋盘格有两个背景（奇偶反相），每个背景写一遍、读一遍，共 4 遍，每遍 ${ARRAY_SIZE} 次：4 × ${ARRAY_SIZE} = ${OPS_CHECKER * ARRAY_SIZE}。`,
      `The checkerboard has two backgrounds (odd and even inverted); each is written once and read once, four passes of ${ARRAY_SIZE} accesses: 4 × ${ARRAY_SIZE} = ${OPS_CHECKER * ARRAY_SIZE}.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('Walking 1 的耗时是棋盘格的几倍？', 'How many times the checkerboard cost is Walking 1?'),
    options: [
      { id: 'a', text: loc(`${OPS_WALK1 / OPS_CHECKER / 2} 倍`, `${OPS_WALK1 / OPS_CHECKER / 2} ×`) },
      { id: 'b', text: loc(`${OPS_WALK1 / OPS_CHECKER} 倍`, `${OPS_WALK1 / OPS_CHECKER} ×`) },
      { id: 'c', text: loc(`${OPS_WALK1 / OPS_CHECKER * 4} 倍`, `${OPS_WALK1 / OPS_CHECKER * 4} ×`) },
    ],
    answer: 'b',
    explain: loc(
      `Walking 每单元 ${OPS_WALK1} 次，棋盘格每单元 ${OPS_CHECKER} 次，比值 ${OPS_WALK1} ÷ ${OPS_CHECKER} = ${OPS_WALK1 / OPS_CHECKER}。Walking 有 N 轮，每轮都写、读全部 N 个单元，总访问数随 N² 增长，所以单元越多，它的代价拉得越开。`,
      `Walking takes ${OPS_WALK1} operations per cell and the checkerboard ${OPS_CHECKER}, a ratio of ${OPS_WALK1} ÷ ${OPS_CHECKER} = ${OPS_WALK1 / OPS_CHECKER}. Walking has N rounds, each writing and reading all N cells, so total accesses grow with N²; the cost gap widens as the array grows.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('下面哪一个 Pattern 能检出 CFin↓（侵害 4 → 受害 2，下降沿翻转）？', 'Which pattern detects CFin↓ (aggressor 4 → victim 2, falling edge inverts)?'),
    options: [
      { id: 'a', text: loc('全 0', 'All 0') },
      { id: 'b', text: loc('棋盘格', 'Checkerboard') },
      { id: 'c', text: loc('Walking 1', 'Walking 1') },
    ],
    answer: 'c',
    explain: loc(
      `侵害单元 4 是偶数，棋盘格里它只会 0→1，从不下降，CFin↓ 不被激活；全 0 从头到尾没有跳变。Walking 1 轮到 4 之后把它写回 0，产生下降沿，把受害单元 2 翻成 1，读出时在地址 ${CFIN_WALK1_FAILS.join(',')} 失效。`,
      `Aggressor 4 is even, so in the checkerboard it only rises 0→1 and never falls, and CFin↓ is never activated; all 0 has no transitions at all. Walking 1 writes 4 back to 0 after its round, producing a falling edge that flips victim 2 to 1, and the read fails at address ${CFIN_WALK1_FAILS.join(',')}.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('TF↓（单元 6 不能 1→0）能被哪一个 Pattern 检出？', 'Which pattern detects TF↓ (cell 6 cannot fall 1→0)?'),
    options: [
      { id: 'a', text: loc('Walking 1', 'Walking 1') },
      { id: 'b', text: loc('全 0', 'All 0') },
      { id: 'c', text: loc('全 1', 'All 1') },
    ],
    answer: 'a',
    explain: loc(
      '全 0 和全 1 都只写一种值，不产生 1→0 的跳变，TF↓ 不会被激活。Walking 1 中把单元 6 写成 1 的那一轮之后，下一轮（单元 7 变成 1）把单元 6 写回 0 时，TF↓ 阻止跳变，单元 6 仍是 1，读出时失效。',
      'All 0 and all 1 each write one value and never produce a 1→0 change, so TF↓ is never activated. Walking 1 sets cell 6 to 1 in its round; in the next round (cell 7 becomes the 1), writing 0 back to cell 6 is blocked by TF↓, so cell 6 stays at 1 and its read fails.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('以下哪一种故障只有全 1 能抓到、全 0 抓不到？', 'Which fault does All 1 catch but All 0 misses?'),
    options: [
      { id: 'a', text: loc('SAF1（卡在 1）', 'SAF1 (stuck at 1)') },
      { id: 'b', text: loc('SAF0（卡在 0）', 'SAF0 (stuck at 0)') },
      { id: 'c', text: loc('TF↓（不能 1→0）', 'TF↓ (cannot fall 1→0)') },
    ],
    answer: 'b',
    explain: loc(
      '全 0 写入的 0 与卡在 0 的单元完全一致，读出不出错；全 1 写入 1，卡在 0 的单元读出 0，与期望不符。SAF1 则相反：全 0 能抓到。TF↓ 两种全背景都抓不到。',
      'All 0 writes 0, which matches a cell stuck at 0, so the read is correct; all 1 writes 1, and a cell stuck at 0 reads 0, which fails. SAF1 is the reverse: all 0 catches it. Neither uniform background catches TF↓.',
    ),
  },
]

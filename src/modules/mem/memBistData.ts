import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  allocateRepair,
  type BistResult,
  type BistState,
  type Cell,
  ECC_IDS,
  type EccId,
  type RepairPlan,
  SPARE_COLS,
  SPARE_ROWS,
  type SampleId,
} from './memBistModel'

export const SAMPLE_OPTIONS: Array<{ id: SampleId; label: LText }> = [
  { id: 'single', label: loc('A 单点', 'A single bit') },
  { id: 'column', label: loc('B 整列', 'B one column') },
  { id: 'scatter', label: loc('C 散点', 'C scattered') },
  { id: 'double', label: loc('D 同字双位', 'D two bits in one word') },
]

export const ECC_OPTIONS: Array<{ id: EccId; label: LText }> = [
  { id: ECC_IDS[0], label: loc('关闭', 'Off') },
  { id: ECC_IDS[1], label: loc('开启（SEC-DED）', 'On (SEC-DED)') },
]

export const S = {
  kickerNow: loc('这一颗器件', 'This device'),
  introTitle: loc('BIST、冗余修复与 ECC：先找坏位，再想办法救', 'BIST, redundancy repair and ECC: find the bad bits, then rescue them'),
  coreTitle: loc('样品与修复：先找、再修，最后交给 ECC', 'Sample and repair: find, repair, then hand the rest to ECC'),
  coreNote: loc(
    '阵列 16 行 × 8 列，一行是一个 8 位的字。BIST 跑 March C−，记下每个失效位；2 条备用行 + 2 条备用列按贪心规则分配，替换后再跑一遍；残留的错误按字交给 ECC 判定。',
    'The array is 16 rows × 8 columns and each row is one 8-bit word. BIST runs March C− and logs every failing bit; 2 spare rows and 2 spare columns are allocated greedily and the test runs again; leftover errors are judged per word by ECC.',
  ),
  sampleLabel: loc('样品', 'Sample'),
  eccLabel: loc('ECC（每字 8 位）', 'ECC (8-bit word)'),
  rRaw: loc('BIST 查出的失效位（修复前）', 'Failing bits found by BIST (before repair)'),
  rPlan: loc('备用用量（行 / 列）', 'Spares used (rows / cols)'),
  rResidual: loc('修复后仍失效的位', 'Bits still failing after repair'),
  rEcc: loc('按字判定：纠正 / 不可纠正', 'Per word: corrected / uncorrectable'),
  rVerdict: loc('判定', 'Verdict'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  stepsTitle: loc('修复步骤（贪心）', 'Repair steps (greedy)'),
  noRepair: loc('BIST 没有查出失效位，不需要修复。', 'BIST found no failing bits, so no repair is needed.'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的 BIST 还要做字线、位线的开路短路测试，熔丝或 eFuse 的编程，以及上电后的在线修复；这里只练 March 找位、冗余分配、残留判定三步。',
    'Real BIST also covers word-line and bit-line opens and shorts, fuse or eFuse programming, and in-field repair; here we only practise the three steps: find with March, allocate spares, judge the leftovers.',
  ),
  next: loc('下一课：存储器并行测试', 'Next: Parallel Memory Test'),
  task1: loc('样品 A 或 B：只靠冗余行列修复（ECC 关闭）就能 PASS。', 'Sample A or B: repair with spare rows and columns alone (ECC off) to get PASS.'),
  task2: loc('样品 C：先看 ECC 关闭时的 FAIL，再打开 ECC 看到 PASS。', 'Sample C: see FAIL with ECC off, then turn ECC on and see PASS.'),
  task3: loc('样品 D：开启 ECC 仍然 FAIL，说清同一个字里两位错误为什么不能纠正。', 'Sample D: keep ECC on and still see FAIL; explain why two errors in one word cannot be corrected.'),
}

export const FIG = {
  pairAria: loc(
    '左边是修复前的失效图，右边是修复与 ECC 之后的阵列，两图的行列一一对应',
    'Left: the fail map before repair; right: the array after repair and ECC. Rows and columns line up one to one',
  ),
  rawAria: loc(
    'BIST 失效图：16 行 8 列的阵列，红色方块是 March C− 查出的失效位',
    'BIST fail map: a 16-row by 8-column array; red squares are the failing bits found by March C−',
  ),
  afterAria: loc(
    '修复与 ECC 之后的阵列：绿色是被备用行列替换的失效位，蓝色是 ECC 纠正的残留位，红色是仍判不通过的残留位',
    'Array after repair and ECC: green marks failing bits replaced by spare rows or columns, blue marks residual bits corrected by ECC, red marks residual bits still failing',
  ),
  rawTitle: loc('BIST 失效图（修复前）', 'BIST fail map (before repair)'),
  afterTitle: loc('修复 + ECC 之后', 'After repair + ECC'),
  cap: loc(
    '每个小方块是一个存储单元，一行是一个 8 位的字。行号在左、列号在上，从 0 开始。绿色表示该位所在的行或列已被备用替换，蓝色是 ECC 能纠正的残留位，红色是判不通过的残留位。',
    'Each small square is one memory cell and each row is one 8-bit word. Row numbers are on the left and column numbers on top, counted from 0. Green means its row or column was replaced by a spare; blue is a residual bit ECC can correct; red is a residual bit that still fails.',
  ),
}

export const INTRO = [
  loc(
    '{@memMarch} 讲的是怎样用算法找出失效单元。真正的存储器测试里，这件事要在芯片内部完成：Memory BIST 自己产生 March 序列、比较读回的数据，只把失效地址或失效位图送出来。',
    'The {@memMarch} lesson showed how an algorithm finds failing cells. In production the work runs inside the chip: memory BIST generates the March sequence itself, compares the read data, and only sends out the fail addresses or the fail bitmap.',
  ),
  loc(
    '找到失效位还不够，要么用备用的行或列替换它（冗余修复），要么让 ECC 纠正它。这一课用一颗虚构的 16 × 8 阵列，把这三步串起来，并说清每一步能救什么、救不了什么。',
    'Finding a bad bit is not enough: either a spare row or column replaces it (redundancy repair), or ECC corrects it. This lesson chains the three steps on a made-up 16 × 8 array and shows what each one can rescue and what it cannot.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '有冗余行列就能修好任何坏位。冗余只有 2 行 2 列，而且每次替换的是整行或整列；坏位分散在不同的行和列上时，备用很快就用完。',
    'Spare rows and columns can fix any bad bit. There are only 2 spare rows and 2 spare columns, each replacing a whole line; scattered bits in different rows and columns use them up quickly.',
  ),
  loc(
    'ECC 能纠正所有错误。SEC-DED 只能纠正 1 位、检测 2 位；同一个字里的 2 位错误它只能报出来，无法纠正。',
    'ECC corrects every error. SEC-DED corrects 1 bit and detects 2; two errors in the same word can only be reported, not corrected.',
  ),
  loc(
    'BIST 只要给出 PASS 或 FAIL 就够了。修复需要知道坏在哪一行、哪一列，所以 BIST 要把失效地址留下来，形成失效位图。',
    'BIST only needs to report PASS or FAIL. Repair must know which row and column is bad, so BIST keeps the fail addresses and builds a fail bitmap.',
  ),
]

export const TAKEAWAY: LText = loc(
  'March 找出失效位 → 贪心分配 2 行 + 2 列替换 → 修复后再跑一遍看残留 → 残留位按字判定：1 位可以纠正，2 位只能检测。修复处理的是有限的硬缺陷，ECC 兜底的是残留的单个位错误。',
  'March finds the failing bits → greedy allocation of 2 rows + 2 columns → run again to see what remains → judge the leftovers per word: 1 bit can be corrected, 2 bits can only be detected. Repair handles a limited number of hard defects; ECC covers the single-bit errors that remain.',
)

/** 小测题里的数字由模型算出：贪心分配第一步的选择 */
const QUIZ_BITS: Cell[] = [
  { row: 3, col: 0 },
  { row: 3, col: 4 },
  { row: 3, col: 7 },
  { row: 1, col: 5 },
  { row: 6, col: 5 },
]
const QUIZ_PLAN: RepairPlan = allocateRepair(QUIZ_BITS, SPARE_ROWS, SPARE_COLS)
const QUIZ_FIRST = QUIZ_PLAN.steps[0]
const QUIZ_ROW3 = QUIZ_BITS.filter((bit) => bit.row === 3).length
const QUIZ_COL5 = QUIZ_BITS.filter((bit) => bit.col === 5).length
const QUIZ_FIRST_TEXT: LText =
  QUIZ_FIRST.line === 'row' ? loc(`行 ${QUIZ_FIRST.index}`, `row ${QUIZ_FIRST.index}`) : loc(`列 ${QUIZ_FIRST.index}`, `column ${QUIZ_FIRST.index}`)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('BIST 在存储器测试中的主要作用是什么？', 'What is the main role of BIST in memory test?'),
    options: [
      { id: 'a', text: loc('芯片内部自己产生测试图形并比较结果，ATE 只读回判定和失效信息', 'The chip generates the test pattern and compares results itself; the ATE only reads back the verdict and fail information') },
      { id: 'b', text: loc('替代 ATE 的电源与参数测试', 'Replace the ATE supply and parametric tests') },
      { id: 'c', text: loc('让芯片不再需要冗余或 ECC', 'Remove the need for redundancy or ECC') },
    ],
    answer: 'a',
    explain: loc(
      'BIST 把 March 这类图形的产生与比较放在芯片内部，ATE 不必逐拍送向量。它不测电源和参数，也不能取代修复。',
      'BIST moves the generation and comparison of March-type patterns inside the chip, so the ATE does not have to send vectors cycle by cycle. It does not test supplies or parameters, and it does not replace repair.',
    ),
  },
  {
    id: 'q2',
    prompt: loc(
      '阵列上查出 5 个失效位：(行 3, 列 0)、(行 3, 列 4)、(行 3, 列 7)、(行 1, 列 5)、(行 6, 列 5)。贪心分配的第一步应该选哪一条？',
      'Five failing bits are found: (row 3, col 0), (row 3, col 4), (row 3, col 7), (row 1, col 5), (row 6, col 5). Which line should greedy allocation pick first?',
    ),
    options: [
      { id: 'a', text: loc(`列 5（失效 ${QUIZ_COL5} 位）`, `Column 5 (${QUIZ_COL5} fails)`) },
      { id: 'b', text: loc(`行 3（失效 ${QUIZ_ROW3} 位）`, `Row 3 (${QUIZ_ROW3} fails)`) },
      { id: 'c', text: loc('行 1（失效 1 位）', 'Row 1 (1 fail)') },
    ],
    answer: 'b',
    explain: loc(
      `第一步选的是${QUIZ_FIRST_TEXT.zh}，共 ${QUIZ_FIRST.count} 位失效。行 3 上有 ${QUIZ_ROW3} 位，替换它一步就能消掉 3 个失效位；列 5 只有 ${QUIZ_COL5} 位。贪心每次选失效最多的那一条线。`,
      `The first pick is ${QUIZ_FIRST_TEXT.en ?? QUIZ_FIRST_TEXT.zh} with ${QUIZ_FIRST.count} fails. Row 3 holds ${QUIZ_ROW3} bits, so replacing it clears 3 failing bits in one step; column 5 holds only ${QUIZ_COL5}. Greedy always picks the line with the most failures.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('ECC（SEC-DED）遇到同一个字里的 2 位错误，会怎样？', 'What does SEC-DED ECC do when one word has 2 bit errors?'),
    options: [
      { id: 'a', text: loc('纠正这 2 位，判 PASS', 'Correct both bits and judge PASS') },
      { id: 'b', text: loc('检测到错误，但不能纠正，判 FAIL', 'Detect the error but cannot correct it, so judge FAIL') },
      { id: 'c', text: loc('静默给出正确数据，不报错', 'Silently return correct data with no error flag') },
    ],
    answer: 'b',
    explain: loc(
      'SEC-DED 能检测 2 位错误，但 2 位错误的位置有多种可能，纠正时无法判断该翻转哪两位，所以只能报错。',
      'SEC-DED detects 2-bit errors, but several bit pairs could explain the syndrome, so it cannot tell which two bits to flip. It can only flag the error.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('一个字在修复后只剩 1 位错误，ECC 开启时这颗器件的判定是？', 'After repair one word has only 1 bit error. What is the verdict with ECC on?'),
    options: [
      { id: 'a', text: loc('ECC 纠正后判 PASS', 'ECC corrects it and the verdict is PASS') },
      { id: 'b', text: loc('判 FAIL，因为 ECC 不能处理任何错误', 'FAIL, because ECC cannot handle any error') },
      { id: 'c', text: loc('必须再换一条备用行才能 PASS', 'A further spare row must be used to get PASS') },
    ],
    answer: 'a',
    explain: loc(
      '1 位错误可以纠正，纠正后读出的数据与写入一致，所以判 PASS。这个单元本身仍然是坏的，只是 ECC 替它兜住了。',
      'A 1-bit error can be corrected, so the data read back matches what was written and the verdict is PASS. The cell is still bad; ECC is covering for it.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('为什么 BIST 要把失效地址（失效位图）送出来，而不只是 PASS 或 FAIL？', 'Why does BIST send out fail addresses (a fail bitmap) instead of just PASS or FAIL?'),
    options: [
      { id: 'a', text: loc('为了让 ATE 能多测一会儿', 'So the ATE can keep testing for longer') },
      { id: 'b', text: loc('PASS 或 FAIL 本身不能用来判定', 'PASS or FAIL alone cannot be used to judge the device') },
      { id: 'c', text: loc('修复分配需要知道失效在哪一行、哪一列', 'Spare allocation needs to know which row and column each failure is in') },
    ],
    answer: 'c',
    explain: loc(
      '备用行和备用列要按失效位的位置来选。只有 PASS 或 FAIL，无法决定替换哪一行、哪一列。',
      'Spare rows and columns are chosen by where the failing bits are. A bare PASS or FAIL cannot say which row or column to replace.',
    ),
  },
]

/** 把若干段双语文字用同一个分隔符连起来；分隔符本身也是双语的 */
function joinText(parts: LText[], sep: LText): LText {
  return {
    zh: parts.map((p) => p.zh).join(sep.zh),
    en: parts.map((p) => p.en ?? p.zh).join(sep.en ?? sep.zh),
  }
}

function repairText(plan: RepairPlan): LText {
  const parts: LText[] = [
    ...plan.rows.map((r) => loc(`第 ${r} 行`, `row ${r}`)),
    ...plan.cols.map((c) => loc(`第 ${c} 列`, `column ${c}`)),
  ]
  return joinText(parts, loc('、', ', '))
}

function cellsText(cells: Cell[]): LText {
  const parts = cells.map((c) => loc(`第 ${c.row} 行第 ${c.col} 列`, `row ${c.row}, column ${c.col}`))
  return joinText(parts, loc('、', '; '))
}

/**
 * 右侧说明栏：结论与原因写在同一段（text），note 是补充提示（没有时为 null）。
 * 注意 zh / en 必须分别取：repairText / cellsText 返回的是 LText，这里只取它的 zh 或 en 拼进模板。
 */
export function verdictOf(r: BistResult): { title: LText; text: LText; note: LText | null } {
  const repaired = repairText(r.plan)
  if (r.residual.length === 0) {
    const note = r.ecc
      ? loc('ECC 已开启，但没有需要纠正的位，结果与关闭时相同。', 'ECC is on but there is nothing left to correct, so the result matches ECC off.')
      : null
    return {
      title: S.pass,
      text: loc(
        `BIST 查出 ${r.raw.length} 位失效，替换${repaired.zh}后再跑 March C−，已经没有残留，判 PASS。失效位都落在被替换的行或列上，所以修复就够了。`,
        `BIST found ${r.raw.length} failing bits. After replacing ${repaired.en}, March C− runs again with nothing left, so the verdict is PASS. Every failing bit sat on a replaced row or column, so repair alone is enough.`,
      ),
      note,
    }
  }
  if (!r.ecc) {
    const single = r.words.find((w) => w.bits === 1)
    return {
      title: S.fail,
      text: loc(
        `修复后仍残留 ${r.residual.length} 位（${cellsText(r.residual).zh}）。没有 ECC，任何一个残留位都会让器件判 FAIL。`,
        `After repair ${r.residual.length} bit(s) remain (${cellsText(r.residual).en}). Without ECC, any leftover bit makes the device FAIL.`,
      ),
      note: single
        ? loc(`打开 ECC 后，只有 1 位错误的字（例如第 ${single.row} 行）可以被纠正。`, `With ECC on, words with one bit error (for example row ${single.row}) can be corrected.`)
        : null,
    }
  }
  if (r.wordsBad > 0) {
    const bad = r.words.find((w) => w.bits >= 2) ?? r.words[0]
    return {
      title: S.fail,
      text: loc(
        `第 ${bad.row} 行残留 ${bad.bits} 位错误。ECC（SEC-DED）只能纠正 1 位、检测 2 位，2 位及以上不能纠正，所以判 FAIL。备用行 ${r.plan.rows.length}/${SPARE_ROWS}、备用列 ${r.plan.cols.length}/${SPARE_COLS} 已经全部用完，剩下的失效只能靠 ECC，而 ECC 救不了这一个字。`,
        `Row ${bad.row} still has ${bad.bits} bit errors. SEC-DED corrects 1 bit and detects 2; 2 or more bits cannot be corrected, so the verdict is FAIL. The spare rows (${r.plan.rows.length}/${SPARE_ROWS}) and spare columns (${r.plan.cols.length}/${SPARE_COLS}) are all used up, and ECC cannot rescue this word.`,
      ),
      note: null,
    }
  }
  return {
    title: S.pass,
    text: loc(
      `修复后残留 ${r.residual.length} 位，分别位于${cellsText(r.residual).zh}，每个字都只有 1 位错误。ECC 把它们纠正了，判 PASS；关闭 ECC 时，同样的残留位会让器件判 FAIL。`,
      `After repair ${r.residual.length} bit(s) remain, at ${cellsText(r.residual).en}. Each word has only one bit error, so ECC corrects them and the verdict is PASS. With ECC off, the same leftovers make the device FAIL.`,
    ),
    note: null,
  }
}

/** 三张任务卡：完成与否由当前样品与 ECC 设置以及判定算出，重置后自动还原 */
export function taskItems(state: BistState, r: BistResult): TaskItem[] {
  return [
    { id: 'repair', text: S.task1, done: (state.sample === 'single' || state.sample === 'column') && state.ecc === 'off' && r.pass },
    { id: 'ecc', text: S.task2, done: state.sample === 'scatter' && state.ecc === 'on' && r.pass },
    { id: 'double', text: S.task3, done: state.sample === 'double' && state.ecc === 'on' && !r.pass },
  ]
}

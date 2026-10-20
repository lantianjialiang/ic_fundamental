import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import {
  analyse,
  type Analysis,
  type BinState,
  BIN_OF,
  type BitMap,
  coverable,
  CLUSTER_SHARE,
  DEFAULT_SEED,
  type FailClass,
  genMap,
  GRID,
  LINE_MIN,
  MIN_LINES_CAP,
  minLinesOf,
  NO_GUESS,
  OTHER_MAX,
  type Guess,
  type MapKind,
  repairableMap,
  SPARE_COLS,
  SPARE_ROWS,
} from './memBinModel'

/** 文字表（学生可见）；每条都是中英文成对 */
export const S = {
  kicker: loc('这一张图', 'This map'),
  introTitle: loc('从 Pass / Fail 到失效位图', 'From Pass / Fail to the fail bit map'),
  coreTitle: loc('看图判类型，再分 Bin', 'Read the map, name the failure, then bin it'),
  coreNote: loc(
    '下图是 16×16 的 Fail Bit Map，红色格子是失效位。先做一个判断，再看规则算出的类型、Bin 号与备份修复结论。',
    'The figure is a 16×16 fail bit map; red cells failed. Make a call first, then see the class, bin and repair verdict the rules compute.',
  ),
  kindLabel: loc('预设的图（点选）', 'Preset map (pick one)'),
  guessLabel: loc('你的判断（先选再看结论）', 'Your call (pick first, then see the verdict)'),
  reroll: loc('换一张（同类，种子 + 1）', 'New map (same kind, seed + 1)'),
  rN: loc('失效数 N', 'Fail count N'),
  rRow: loc('同一行最多', 'Most fails in one row'),
  rCol: loc('同一列最多', 'Most fails in one column'),
  rBlock: loc('最大连通块占比', 'Largest connected block share'),
  rRepair: loc(`${SPARE_ROWS} 行 + ${SPARE_COLS} 列备份能修吗`, `Repairable with ${SPARE_ROWS} rows + ${SPARE_COLS} cols?`),
  rClass: loc('失效类型', 'Failure class'),
  rBin: loc('Bin 号', 'Bin number'),
  hidden: loc('猜完后显示', 'Shown after your call'),
  yes: loc('能', 'Yes'),
  no: loc('不能', 'No'),
  waitTitle: loc('先做判断', 'Make your call first'),
  waitText: loc(
    '在上面选一种失效类型，就能看到规则的判定。判断前不给答案，这样才能练出看图的眼睛。',
    'Pick a failure class above to see the rules’ verdict. The answer stays hidden until you call it, so you practise reading the map.',
  ),
  right: loc('判对了', 'Correct'),
  wrong: loc('判错了', 'Not quite'),
  asideLater: loc(
    '真实的失效分析还要结合测试步骤、地址重复出现的规律和工艺信息；这里只练形状判断、Bin 号和备份修复三件事。',
    'Real failure analysis also uses the test step, repeated addresses and process data; here we only practise the shape judgement, the bin and the spare-based repair.',
  ),
  next: loc('下一课：综合：存储器测试', 'Next: Capstone: Memory Test'),
  task1: loc('依次判对“单点”和“整行”两张图。', 'Judge the “single bit” and “full row” maps correctly.'),
  task2: loc('依次判对“整列”和“簇”两张图。', 'Judge the “full column” and “cluster” maps correctly.'),
  task3: loc(
    `判对“随机”图，并说明它 ${SPARE_ROWS} 行 + ${SPARE_COLS} 列修不了。`,
    `Judge the “random” map correctly and explain why ${SPARE_ROWS} rows + ${SPARE_COLS} cols cannot repair it.`,
  ),
  task4: loc('换一张新图（种子 + 1），判对新图的类型。', 'Switch to a new map (seed + 1) and judge its class correctly.'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
}

export const FIG = {
  mapAria: loc('16×16 失效位图：红色为失效位，灰色为通过位', '16×16 fail bit map: red cells failed, grey cells passed'),
  mapCap: loc(
    '行号从上到下为 0–15，列号从左到右为 0–15。判断时看形状：是一行、一列、连成一块，还是散落在各处。',
    'Rows 0–15 run top to bottom and columns 0–15 left to right. Judge the shape: one row, one column, one connected block, or scattered all over.',
  ),
}

export const INTRO: LText[] = [
  loc(
    '{@memBist} 讲了 BIST 怎样在芯片里找出失效位，并用备份行、备份列把它们修掉。这一课站在测试结束的地方：拿到一张 Fail Bit Map，要看出它是哪种失效，分到哪个 Bin。',
    'The {@memBist} lesson covered how BIST finds failing bits inside the chip and repairs them with spare rows and columns. This lesson starts where test ends: given a fail bit map, read the kind of failure and pick its bin.',
  ),
  loc(
    'Pass / Fail 只是结论；Fail Address 告诉你哪个地址出错；Fail Bit Map 把所有出错的位摊在一张表上。同样是“失效 12 位”，可能是 12 个分散的坏点，也可能是一整条字线断了，修复方式完全不同。',
    'Pass / Fail is only the verdict; the fail address says which address failed; the fail bit map lays every failing bit out on one grid. “12 fails” could be 12 scattered bad bits or one broken word line, and the repairs differ completely.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '失效位越多，越难修。修复看的是形状：16 个坏位整齐排成一行，只需要 1 条备份行；4 个分散的坏位，可能要 4 条备份。',
    'More failing bits means harder to repair. Repair depends on shape: 16 bad bits in one row need one spare row; 4 scattered bad bits may need 4 spares.',
  ),
  loc(
    '分到 Bin 就等于能修好。Bin 号说明失效的类型；能不能修，还要看备份行、备份列够不够。',
    'A bin means the part can be repaired. The bin names the failure type; whether it can be repaired also depends on the spare rows and columns.',
  ),
  loc(
    '只看一个失效地址就够了。一个地址只有一个位置，分不出整行、簇和随机的区别。',
    'One failing address is enough. An address is one location and cannot tell a full row, a cluster and a random pattern apart.',
  ),
]

export const TAKEAWAY: LText = loc(
  'Fail Bit Map 的形状决定失效类型：单点、整行、整列、簇、随机；类型对应 Bin 号；备份行与备份列的数量决定能不能修。分类规则写在代码里，由规则算出，不靠眼睛猜。',
  'The shape of a fail bit map sets its failure class: single bit, full row, full column, cluster or random. The class sets the bin; the number of spare rows and columns decides whether it can be repaired. The rules are in code and computed, not guessed by eye.',
)

/** 类型名（页面与判定文字共用） */
export const CLASS_NAME: Record<FailClass, LText> = {
  pass: loc('无失效', 'No fail'),
  single: loc('单点', 'Single bit'),
  row: loc('整行', 'Full row'),
  column: loc('整列', 'Full column'),
  cluster: loc('簇', 'Cluster'),
  random: loc('随机', 'Random'),
}

export const MAP_OPTIONS: Array<{ id: MapKind; label: LText }> = [
  { id: 'single', label: CLASS_NAME.single },
  { id: 'row', label: CLASS_NAME.row },
  { id: 'column', label: CLASS_NAME.column },
  { id: 'cluster', label: CLASS_NAME.cluster },
  { id: 'random', label: CLASS_NAME.random },
]

/** 判断用的选项：与预设图同类，但初始不选中（判题选项不预选） */
export const GUESS_OPTIONS: Array<{ id: Guess; label: LText }> = MAP_OPTIONS

/** 把两段文字拼起来（中文直接连，英文加空格） */
function cat(...parts: LText[]): LText {
  return {
    zh: parts.map((p) => p.zh).join(''),
    en: parts.map((p) => p.en ?? p.zh).join(' '),
  }
}

/** 同一条件、不同语言的类型名：模板字符串里要用的字符串 */
function names(cls: FailClass): { zh: string; en: string } {
  const text = CLASS_NAME[cls]
  return { zh: text.zh, en: text.en ?? text.zh }
}

/** 判定依据：每一类都用同一套数字说明 */
export function reasonOf(a: Analysis): LText {
  if (a.cls === 'pass') {
    return loc('没有失效位，器件通过。', 'No failing bit, so the device passes.')
  }
  if (a.cls === 'single') {
    return loc('只有 1 个失效位，一条备份行或一条备份列就能覆盖它。', 'Only one failing bit: one spare row or one spare column covers it.')
  }
  if (a.cls === 'row') {
    return loc(
      `第 ${a.maxRowIdx} 行有 ${a.maxRow} 个失效（≥ ${LINE_MIN}），其它行一共只有 ${a.n - a.maxRow} 个（≤ ${OTHER_MAX}）。整行失效常见于一条字线（行线）出了问题。`,
      `Row ${a.maxRowIdx} has ${a.maxRow} fails (≥ ${LINE_MIN}) and the other rows have only ${a.n - a.maxRow} in total (≤ ${OTHER_MAX}). A full-row failure is typical of one word line (row line) going bad.`,
    )
  }
  if (a.cls === 'column') {
    return loc(
      `第 ${a.maxColIdx} 列有 ${a.maxCol} 个失效（≥ ${LINE_MIN}），其它列一共只有 ${a.n - a.maxCol} 个（≤ ${OTHER_MAX}）。整列失效常见于一条位线（列线）出了问题。`,
      `Column ${a.maxColIdx} has ${a.maxCol} fails (≥ ${LINE_MIN}) and the other columns have only ${a.n - a.maxCol} in total (≤ ${OTHER_MAX}). A full-column failure is typical of one bit line (column line) going bad.`,
    )
  }
  const pct = a.n > 0 ? Math.round((a.largest / a.n) * 100) : 0
  if (a.cls === 'cluster') {
    return loc(
      `最大连通块有 ${a.largest} 个失效，占全部的 ${pct}%（≥ ${Math.round(CLUSTER_SHARE * 100)}%），外接框 ${a.largestSide} 格见方：失效集中在一小块区域，多半是局部缺陷。`,
      `The largest connected block has ${a.largest} fails, ${pct}% of all (≥ ${Math.round(CLUSTER_SHARE * 100)}%), in a ${a.largestSide}-cell square box: the failures sit in one small area, usually a local defect.`,
    )
  }
  return loc(
    `失效 ${a.n} 个，分布在 ${a.rowsUsed} 行、${a.colsUsed} 列上，既没有整行整列，也连不成块，判为随机。`,
    `${a.n} fails spread over ${a.rowsUsed} rows and ${a.colsUsed} columns, with no full row, no full column and no block, so it is random.`,
  )
}

/** 备份结论：能不能修，至少要几条备份线 */
export function repairLine(a: Analysis): LText {
  if (a.repairable) {
    return loc(
      `备份：${SPARE_ROWS} 行 + ${SPARE_COLS} 列够用，覆盖全部失效至少需要 ${a.minLines} 条线。`,
      `Spares: ${SPARE_ROWS} rows + ${SPARE_COLS} cols are enough; covering every fail needs at least ${a.minLines} lines.`,
    )
  }
  if (a.minLines === null) {
    return loc(
      `备份不够：${SPARE_ROWS} 行 + ${SPARE_COLS} 列覆盖不了，至少需要超过 ${MIN_LINES_CAP} 条。`,
      `Not enough spares: ${SPARE_ROWS} rows + ${SPARE_COLS} cols cannot cover it; at least more than ${MIN_LINES_CAP} lines are needed.`,
    )
  }
  return loc(
    `备份不够：${SPARE_ROWS} 行 + ${SPARE_COLS} 列覆盖不了，至少需要 ${a.minLines} 条。`,
    `Not enough spares: ${SPARE_ROWS} rows + ${SPARE_COLS} cols cannot cover it; at least ${a.minLines} lines are needed.`,
  )
}

/** 读数：同一行 / 列的最多失效数 */
export function lineValue(count: number, idx: number, axis: 'row' | 'col'): LText {
  if (axis === 'row') {
    return loc(`${count} 个（第 ${idx} 行）`, `${count} (row ${idx})`)
  }
  return loc(`${count} 个（第 ${idx} 列）`, `${count} (col ${idx})`)
}

/** 右侧结论：猜之前只给提示；猜完给判定、原因与备份结论 */
export function verdictOf(state: BinState, a: Analysis): { title: LText; text: LText } {
  if (state.guess === NO_GUESS) {
    return { title: S.waitTitle, text: S.waitText }
  }
  const real = names(a.cls)
  const said = names(state.guess)
  if (state.guess === a.cls) {
    return {
      title: S.right,
      text: cat(
        loc(`判对了：这是“${real.zh}”，分到 Bin ${a.bin}。`, `Correct: this is “${real.en}”, so bin ${a.bin}.`),
        reasonOf(a),
        repairLine(a),
      ),
    }
  }
  return {
    title: S.wrong,
    text: cat(
      loc(`你判成“${said.zh}”，实际是“${real.zh}”，分到 Bin ${a.bin}。`, `You called it “${said.en}”; it is “${real.en}”, so bin ${a.bin}.`),
      reasonOf(a),
      repairLine(a),
    ),
  }
}

/** 任务卡：完成情况由 solved（判对过的类型）和当前图实时算出 */
export function taskItems(state: BinState, a: Analysis): TaskItem[] {
  const has = (kind: MapKind) => state.solved.includes(kind)
  return [
    { id: 'pair-single-row', text: S.task1, done: has('single') && has('row') },
    { id: 'pair-column-cluster', text: S.task2, done: has('column') && has('cluster') },
    { id: 'random-no-repair', text: S.task3, done: has('random') && !repairableMap(genMap('random', DEFAULT_SEED)) },
    { id: 'reroll', text: S.task4, done: state.seed !== DEFAULT_SEED && state.guess === a.cls },
  ]
}

/** 小测用的几张图：数字全部由模型算出 */
const BLOCK3: Array<[number, number]> = []
for (let dr = 0; dr < 3; dr += 1) {
  for (let dc = 0; dc < 3; dc += 1) {
    BLOCK3.push([dr, dc])
  }
}
const BLOCK2: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]
const SINGLE_CELL: Array<[number, number]> = [[0, 0]]
const BLOCK3_MIN = minLinesOf(BLOCK3)
const BLOCK3_REPAIR = coverable(BLOCK3, SPARE_ROWS, SPARE_COLS)
const BLOCK3_FIT: LText = BLOCK3_REPAIR ? loc('够用', 'are enough') : loc('不够用', 'are not enough')
const SINGLE_MIN = minLinesOf(SINGLE_CELL)
const BLOCK2_MIN = minLinesOf(BLOCK2)

/** 例图：第 4 行 9 个失效、其它三处各 1 个，彼此分开 */
function exampleMap(): BitMap {
  const fails = new Uint8Array(GRID * GRID)
  for (let col = 0; col < 9; col += 1) {
    fails[4 * GRID + col] = 1
  }
  const scattered: Array<[number, number]> = [
    [9, 12],
    [12, 3],
    [14, 14],
  ]
  for (const [row, col] of scattered) {
    fails[row * GRID + col] = 1
  }
  return { kind: 'random', seed: 0, fails }
}
const EX = analyse(exampleMap())

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      `在 ${GRID}×${GRID} 的图里，有一整行的 ${GRID} 个位都失效，其它行没有失效。它属于哪一类？`,
      `In a ${GRID}×${GRID} map one whole row of ${GRID} bits fails and no other row fails. Which class is it?`,
    ),
    options: [
      { id: 'a', text: CLASS_NAME.single },
      { id: 'b', text: CLASS_NAME.row },
      { id: 'c', text: CLASS_NAME.cluster },
    ],
    answer: 'b',
    explain: loc(
      `同一行有 ${GRID} 个失效（≥ ${LINE_MIN}），其它行 0 个（≤ ${OTHER_MAX}），所以判为整行，Bin ${BIN_OF.row}。`,
      `That row has ${GRID} fails (≥ ${LINE_MIN}) and the other rows have 0 (≤ ${OTHER_MAX}), so it is a full row: bin ${BIN_OF.row}.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('“失效地址”（Fail Address）指的是什么？', 'What does the fail address mean?'),
    options: [
      { id: 'a', text: loc('测试程序开始执行的地址', 'The address where the test program starts') },
      { id: 'b', text: loc('备份行的编号', 'The number of a spare row') },
      { id: 'c', text: loc('读出值与期望不符的那次访问的地址', 'The address of an access whose read-back differs from the expected value') },
    ],
    answer: 'c',
    explain: loc(
      'Fail Address 是读回值与期望值不同的那次访问所在的地址。它只告诉你哪里错了，看不出失效的形状；要看形状，得把所有失效位摊成 Fail Bit Map。',
      'The fail address is the address of an access whose read-back differs from the expected value. It says where something went wrong but not the shape; for the shape you lay every failing bit out as a fail bit map.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      `一个 3×3 的簇，9 个位全部失效。用 ${SPARE_ROWS} 条备份行 + ${SPARE_COLS} 条备份列能修好吗？`,
      `A 3×3 cluster has all 9 bits failing. Can ${SPARE_ROWS} spare rows + ${SPARE_COLS} spare columns repair it?`,
    ),
    options: [
      { id: 'a', text: loc(`不能，至少需要 ${BLOCK3_MIN} 条线`, `No, at least ${BLOCK3_MIN} lines are needed`) },
      { id: 'b', text: loc('能，行和列各用一半', 'Yes, half rows and half columns') },
      { id: 'c', text: loc('能，因为 9 个位只占一小块', 'Yes, because 9 bits only take up a small area') },
    ],
    answer: 'a',
    explain: loc(
      `覆盖这 9 个位至少需要 ${BLOCK3_MIN} 条线，${SPARE_ROWS} 行 + ${SPARE_COLS} 列${BLOCK3_FIT.zh}。无论 ${SPARE_ROWS} 行和 ${SPARE_COLS} 列怎么选，总有一个失效位落在没有被选中的行与列的交点上，没有被覆盖。`,
      `Covering these 9 bits needs at least ${BLOCK3_MIN} lines, so ${SPARE_ROWS} rows + ${SPARE_COLS} columns ${BLOCK3_FIT.en ?? BLOCK3_FIT.zh}. However the ${SPARE_ROWS} rows and ${SPARE_COLS} columns are chosen, one failing bit remains at the crossing of an unchosen row and an unchosen column.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('下面哪一种失效需要的备份线最少？', 'Which failure needs the fewest spare lines?'),
    options: [
      { id: 'a', text: loc('随机分布的失效位', 'Randomly scattered fail bits') },
      { id: 'b', text: loc('2×2 的簇', 'A 2×2 cluster') },
      { id: 'c', text: loc('单点', 'A single bit') },
    ],
    answer: 'c',
    explain: loc(
      `单点需要 ${SINGLE_MIN} 条线（行或列都行）；2×2 的簇需要 ${BLOCK2_MIN} 条（两条备份行）；随机分布的失效位往往需要更多，甚至超过 ${MIN_LINES_CAP} 条。`,
      `A single bit needs ${SINGLE_MIN} line (a row or a column); a 2×2 cluster needs ${BLOCK2_MIN} (two spare rows); randomly scattered fails usually need more, sometimes more than ${MIN_LINES_CAP}.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('关于 Bin 号，下面哪句话对？', 'Which statement about bin numbers is correct?'),
    options: [
      { id: 'a', text: loc('Bin 号只由失效数决定', 'The bin number is set by the fail count alone') },
      { id: 'b', text: loc('Bin 号反映失效的形状；能否修复还要看备份数量', 'The bin number reflects the failure shape; repairability also depends on the number of spares') },
      { id: 'c', text: loc('Bin 1 表示有失效但一定能修', 'Bin 1 means it has fails but is always repairable') },
    ],
    answer: 'b',
    explain: loc(
      `本课按形状给 Bin 号：单点 Bin ${BIN_OF.single}，整行 Bin ${BIN_OF.row}，整列 Bin ${BIN_OF.column}，簇 Bin ${BIN_OF.cluster}，随机 Bin ${BIN_OF.random}；Bin 1 只表示无失效。失效数只是形状的一个侧面，能否修复由备份资源决定。`,
      `In this lesson the bin follows the shape: single bit ${BIN_OF.single}, full row ${BIN_OF.row}, full column ${BIN_OF.column}, cluster ${BIN_OF.cluster}, random ${BIN_OF.random}; bin 1 means no fail. The fail count is only one side of the shape, and repairability depends on the spares.`,
    ),
  },
  {
    id: 'q6',
    prompt: loc(
      `一张图的第 ${EX.maxRowIdx} 行有 ${EX.maxRow} 个失效，其它行一共 ${EX.n - EX.maxRow} 个（彼此分开）。它是整行吗？`,
      `Row ${EX.maxRowIdx} has ${EX.maxRow} fails and the other rows have ${EX.n - EX.maxRow} in total, all separate. Is it a full row?`,
    ),
    options: [
      { id: 'a', text: loc(`是整行，${EX.maxRow} 个已经超过一半`, `Yes, ${EX.maxRow} fails is already more than half`) },
      { id: 'b', text: loc('不是整行，其它行的失效超出了容忍值', 'No, the fails on other rows exceed the tolerance') },
      { id: 'c', text: loc(`不是整行，因为 ${EX.maxRow} 个不够 ${GRID} 个`, `No, because ${EX.maxRow} is less than ${GRID}`) },
    ],
    answer: 'b',
    explain: loc(
      `其它行一共 ${EX.n - EX.maxRow} 个失效，超过了容忍值 ${OTHER_MAX}，所以不判整行。它们彼此分开、连不成块，最终判为“${names(EX.cls).zh}”，Bin ${EX.bin}。`,
      `The other rows hold ${EX.n - EX.maxRow} fails in total, above the tolerance of ${OTHER_MAX}, so it is not a full row. They are separate and form no block, so the verdict is “${names(EX.cls).en}”, bin ${EX.bin}.`,
    ),
  },
]
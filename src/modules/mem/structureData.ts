import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { MAPPINGS, analyseStructure, decode, type Mapping, type StructureAnalysis, type StructureState } from './structureModel'

const MAP_LABEL: Record<Mapping, LText> = {
  linear: loc('线性', 'Linear'),
  interleaved: loc('交错', 'Interleaved'),
}

/** 映射选项，显示顺序同 MAPPINGS */
export const MAP_OPTIONS = MAPPINGS.map((id) => ({ id, label: MAP_LABEL[id] }))

export const S = {
  kicker: loc('这一次地址', 'This address'),
  introTitle: loc('存储器里面是什么', 'What is inside a memory'),
  coreTitle: loc('拨一拨：地址怎样落到行和列', 'Try it: how an address lands on a row and column'),
  coreNote: loc(
    '每个 Cell 存 1 位。Cell 排成行（Row，同一条字线）和列（Column，同一条位线），一整块阵列叫一个 Bank，地址的最高位选 Bank。下图是 2 个 Bank，每个 8 行 × 8 列，共 128 个单元。',
    'Each cell stores one bit. Cells sit in rows (one word line each) and columns (one bit line each); a whole array is a bank, and the top address bit picks the bank. The figure shows 2 banks of 8 rows × 8 columns, 128 cells in all.',
  ),
  addrLabel: loc('地址 addr（0–127）', 'Address addr (0–127)'),
  mapLabel: loc('地址映射', 'Address mapping'),
  mapNote: loc(
    '线性：addr = row·8 + col，连续地址排成一行。交错：行、列两段地址位互换（a2–a0 作行，a5–a3 作列），连续地址排成一列。这是教学用的位交换，真实器件的译码更复杂。',
    'Linear: addr = row·8 + col, so consecutive addresses fill one row. Interleaved: the row and column address fields swap bits (a2–a0 become the row, a5–a3 the column), so consecutive addresses fill one column. This bit swap is a teaching simplification; real decoders are more complex.',
  ),
  rBank: loc('Bank 号', 'Bank'),
  rRow: loc('行 row', 'Row'),
  rCol: loc('列 col', 'Column'),
  rIndex: loc('物理单元编号', 'Physical cell index'),
  rNext: loc('addr+1 的物理距离（格）', 'Physical distance to addr+1 (cells)'),
  none: loc('无', 'None'),
  crossBank: loc('跨 Bank', 'Across banks'),
  verdictTitle: loc('地址 → Bank / 行 / 列', 'Address → bank / row / column'),
  asideLater: loc(
    '真实存储器还有列多路复用、冗余行列和地址加扰，这里只保留 Bank、行、列三层，用来看清“地址相邻”和“物理相邻”的区别。',
    'Real memories add column multiplexing, redundant rows and columns, and address scrambling. Here we keep only bank, row and column to see the difference between adjacent addresses and adjacent cells.',
  ),
  next: loc('下一课：存储器读写流程', 'Next: Memory Read and Write Flow'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc('地址设为 9，线性映射下读出它在第几行、第几列（行 1、列 1）。', 'Set the address to 9 with linear mapping and read its row and column (row 1, column 1).'),
  task2: loc('切到交错映射，地址设为 0，看地址 0 与 1 为什么在同一列。', 'Switch to interleaved mapping, set the address to 0, and see why addresses 0 and 1 share a column.'),
  task3: loc('地址设为 63，看 addr+1（64）为什么落在另一个 Bank。', 'Set the address to 63 and see why addr+1 (64) lands in another bank.'),
  task4: loc('找一个 addr+1 的物理距离大于 1 的地址（例如 7），看它与下一个地址隔了几格。', 'Find an address whose addr+1 is more than 1 cell away (for example 7) and count the cells between them.'),
}

export const FIG = {
  aria: loc(
    '存储器阵列：两个 Bank，每个 8 行 × 8 列单元；标出当前地址的行和列，以及相邻地址的位置',
    'Memory array: two banks of 8 rows × 8 columns; the current address row and column are marked, along with the position of its neighbour',
  ),
  cap: loc(
    '方块里的数字是该物理单元对应的地址。金色是当前地址；蓝色虚线框是 addr+1；高亮的行和列是当前地址所在的行与列。下方是 7 位地址的各位，颜色表示它属于 Bank、行还是列。',
    'The number in each square is the address that maps to that cell. Gold is the current address; the blue dashed box is addr+1; the highlighted row and column are those of the current address. Below are the seven address bits, coloured by whether they select the bank, a row or a column.',
  ),
  bank: loc('Bank', 'Bank'),
  row: loc('行 row', 'Row'),
  col: loc('列 col', 'Column'),
}

export const INTRO = [
  loc(
    '{@vector} 讲过向量存储器：ATE 把每一拍的向量放在自己的内存里。这一课换到被测器件那一边，看存储器本身是什么样子。前置：{@vector}。',
    'Lesson {@vector} covered the vector memory inside the ATE, which stores each cycle of vectors. This lesson turns to the device under test and asks what a memory itself looks like. Prerequisite: {@vector}.',
  ),
  loc(
    'Cell 是最小的存储单元，存 1 位。Cell 排成行（Row）和列（Column），整块阵列叫一个 Bank。地址是一串位：有的位选 Bank，有的位选行，有的位选列。',
    'A cell is the smallest storage unit and holds one bit. Cells are arranged in rows and columns, and a whole array is a bank. The address is a string of bits: some select the bank, some the row, and some the column.',
  ),
  loc(
    '地址怎样映射到行和列，决定了“地址相邻”在硅片上是不是挨着。这一课用 2 个 Bank、每个 8×8 的小阵列，把这件事拨给你看。',
    'How an address maps to rows and columns decides whether “adjacent addresses” are next to each other on the silicon. This lesson uses two banks of 8×8 cells so you can see it directly.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '地址挨着，物理上就挨着。第 7 与第 8 号地址在两种映射下都相隔 8 格：线性时从第 0 行第 7 列跳到第 1 行第 0 列；交错时从第 7 行第 0 列跳到第 0 行第 1 列。',
    'Adjacent addresses are adjacent cells. Addresses 7 and 8 are 8 cells apart under both mappings: linear jumps from row 0 column 7 to row 1 column 0; interleaved jumps from row 7 column 0 to row 0 column 1.',
  ),
  loc(
    'Bank 和行是一回事。Bank 是独立的阵列块，由地址的最高位选择；行只是同一个阵列里的一条字线。',
    'A bank and a row are the same thing. A bank is an independent array block selected by the top address bit; a row is just one word line inside one array.',
  ),
  loc(
    '映射只是换个编号，对测试没有影响。映射决定哪些地址在物理上挨着；耦合（串扰）通常发生在物理相邻的单元之间，所以测试图形要按物理位置设计（见 {@memFault}）。',
    'The mapping is just renumbering and does not affect the test. The mapping decides which addresses are physically next to each other; coupling (crosstalk) usually happens between physically adjacent cells, so test patterns must follow the physical layout (see {@memFault}).',
  ),
]

export const TAKEAWAY: LText = loc(
  '地址先译码成 Bank、行、列；一个单元的（行，列）就是它的物理位置。线性映射里连续地址排成一行，交错映射里排成一列。“地址相邻”和“物理相邻”是两回事，映射决定它们是否一致。',
  'An address decodes into bank, row and column; a cell’s (row, column) is its physical position. Linear mapping puts consecutive addresses in one row, interleaved in one column. Adjacent addresses and adjacent cells are different things, and the mapping decides whether they match.',
)

/** 右侧说明栏：根据当前地址给结论；结论后紧跟原因 */
export function verdictOf(state: StructureState, a: StructureAnalysis): { title: LText; text: LText } {
  const bits = state.addr.toString(2).padStart(7, '0')
  const mapName = {
    linear: { zh: '线性', en: 'linear' },
    interleaved: { zh: '交错', en: 'interleaved' },
  }[state.mapping]
  const head = {
    zh: `${mapName.zh}映射下，地址 ${state.addr}（二进制 ${bits}）落在 Bank ${a.cell.bank}、第 ${a.cell.row} 行、第 ${a.cell.col} 列，物理单元编号 ${a.index}。`,
    en: `Under ${mapName.en} mapping, address ${state.addr} (binary ${bits}) sits in bank ${a.cell.bank}, row ${a.cell.row}, column ${a.cell.col}, physical cell ${a.index}. `,
  }
  let tail: { zh: string; en: string }
  if (a.nextAddr === null || a.next === null) {
    tail = { zh: '这是最后一个地址，没有相邻地址。', en: 'This is the last address, so it has no neighbour.' }
  } else if (a.dist === null) {
    tail = {
      zh: `地址 ${a.nextAddr} 在 Bank ${a.next.bank}，和它不在同一个阵列里，物理上相距很远。`,
      en: `Address ${a.nextAddr} is in bank ${a.next.bank}, a different array, so it is physically far away.`,
    }
  } else if (a.dist === 1) {
    tail = {
      zh: `地址 ${a.nextAddr} 的单元和它物理上紧挨着（相差 1 格）。`,
      en: `Address ${a.nextAddr} is physically right next to it (1 cell apart).`,
    }
  } else {
    tail = {
      zh: `地址 ${a.nextAddr} 的单元和它物理上相隔 ${a.dist} 格（行差 ${a.rowStep}，列差 ${a.colStep}），并不挨着。`,
      en: `Address ${a.nextAddr} is ${a.dist} cells away physically (${a.rowStep} rows, ${a.colStep} columns), so the two are not neighbours.`,
    }
  }
  const reason = {
    zh: '原因：物理位置由映射决定，而耦合（串扰）通常发生在物理相邻的单元之间，所以测试图形要按物理位置设计。',
    en: 'Why it matters: the mapping sets the physical position, and coupling (crosstalk) usually happens between physically adjacent cells, so test patterns must be designed by physical position.',
  }
  return {
    title: S.verdictTitle,
    text: loc(head.zh + tail.zh + reason.zh, head.en + tail.en + reason.en),
  }
}

/** 四张任务卡：完成与否由当前地址、映射和相邻关系算出 */
export function taskItems(state: StructureState, a: StructureAnalysis): TaskItem[] {
  return [
    { id: 'linear9', text: S.task1, done: state.mapping === 'linear' && state.addr === 9 },
    { id: 'interleaved0', text: S.task2, done: state.mapping === 'interleaved' && state.addr === 0 },
    { id: 'bank63', text: S.task3, done: state.addr === 63 },
    { id: 'far', text: S.task4, done: a.dist !== null && a.dist > 1 },
  ]
}

/** 小测题干中的数字由模型算出，与页面换算保持一致 */
const Q1_CELL = decode(74, 'linear')
const Q2_NEXT = analyseStructure({ addr: 9, mapping: 'linear' })
const Q3_ZERO = decode(0, 'interleaved')
const Q3_ONE = decode(1, 'interleaved')

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('地址 74（二进制 1001010）在线性映射下落在哪里？', 'Where does address 74 (binary 1001010) land under linear mapping?'),
    options: [
      { id: 'a', text: loc('Bank 0、第 9 行、第 2 列', 'Bank 0, row 9, column 2') },
      { id: 'b', text: loc(`Bank ${Q1_CELL.bank}、第 ${Q1_CELL.row} 行、第 ${Q1_CELL.col} 列`, `Bank ${Q1_CELL.bank}, row ${Q1_CELL.row}, column ${Q1_CELL.col}`) },
      { id: 'c', text: loc('Bank 1、第 2 行、第 1 列', 'Bank 1, row 2, column 1') },
    ],
    answer: 'b',
    explain: loc(
      `74 = 64 + 10。a6 = 1 选 Bank 1；a5–a3 = 001 是第 ${Q1_CELL.row} 行；a2–a0 = 010 是第 ${Q1_CELL.col} 列。`,
      `74 = 64 + 10. a6 = 1 selects bank 1; a5–a3 = 001 gives row ${Q1_CELL.row}; a2–a0 = 010 gives column ${Q1_CELL.col}.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('线性映射下，地址 9 与地址 10 在物理上是什么关系？', 'Under linear mapping, what is the physical relation between addresses 9 and 10?'),
    options: [
      { id: 'a', text: loc('同一行、相邻列，相隔 1 格', 'Same row, adjacent columns, 1 cell apart') },
      { id: 'b', text: loc('相隔 8 格，中间隔着一整行', '8 cells apart, with a whole row between them') },
      { id: 'c', text: loc('分属两个 Bank', 'In two different banks') },
    ],
    answer: 'a',
    explain: loc(
      `9 是第 1 行第 1 列，10 是第 1 行第 2 列，同一行、相邻列，物理距离 = ${Q2_NEXT.dist ?? 0} 格。这正是线性映射的好处：地址连续就是物理连续（在一行之内）。`,
      `9 is row 1 column 1 and 10 is row 1 column 2: same row, adjacent columns, physical distance ${Q2_NEXT.dist ?? 0} cell. That is the benefit of linear mapping: consecutive addresses are consecutive cells within a row.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('交错映射下，地址 0 与地址 1 在物理上是什么关系？', 'Under interleaved mapping, what is the physical relation between addresses 0 and 1?'),
    options: [
      { id: 'a', text: loc('同一行、相邻列', 'Same row, adjacent columns') },
      { id: 'b', text: loc('同一列、相邻行', 'Same column, adjacent rows') },
      { id: 'c', text: loc('分属两个 Bank', 'In two different banks') },
    ],
    answer: 'b',
    explain: loc(
      `交错映射里行取地址的低 3 位：地址 0 是第 ${Q3_ZERO.row} 行第 ${Q3_ZERO.col} 列，地址 1 是第 ${Q3_ONE.row} 行第 ${Q3_ONE.col} 列。只有行变了，所以是同一列、相邻行。`,
      `Under interleaved mapping the row comes from the low 3 bits: address 0 is row ${Q3_ZERO.row} column ${Q3_ZERO.col}, address 1 is row ${Q3_ONE.row} column ${Q3_ONE.col}. Only the row changes, so they share a column and sit in adjacent rows.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('下面哪一项对 Bank 的描述最准确？', 'Which description of a bank is most accurate?'),
    options: [
      { id: 'a', text: loc('一块独立的阵列，由地址的最高位选择', 'An independent array block, selected by the top address bit') },
      { id: 'b', text: loc('同一阵列里的一整行', 'One whole row within the same array') },
      { id: 'c', text: loc('只是地址映射的另一个名字', 'Just another name for the address mapping') },
    ],
    answer: 'a',
    explain: loc(
      '图中 a6 决定 Bank；Bank 内部再由其余地址位译码成行和列。Bank 是多个阵列块，行只是一个阵列里的一条字线，两者层级不同。',
      'In the figure a6 selects the bank; inside the bank the other address bits decode into row and column. A bank is one of several array blocks, while a row is one word line in one array; they are at different levels.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('交错映射在本课里的教学目的是什么？', 'What is the teaching purpose of interleaved mapping in this lesson?'),
    options: [
      { id: 'a', text: loc('让连续地址在物理上更靠近，减少串扰', 'Bring consecutive addresses physically closer to reduce crosstalk') },
      { id: 'b', text: loc('把地址数量减半，节省引脚', 'Halve the address count to save pins') },
      { id: 'c', text: loc('让连续地址落到不同的行，演示地址位互换', 'Spread consecutive addresses across rows to demonstrate address bit swapping') },
    ],
    answer: 'c',
    explain: loc(
      '交错把连续地址分散到不同的行，本课用它演示“地址位互换会改变物理位置”。真实器件也会用类似的交错把连续访问分散到不同 Bank，但译码细节要复杂得多。',
      'Interleaving spreads consecutive addresses across rows; this lesson uses it to show that swapping address bits changes physical position. Real devices also interleave across banks with similar goals, but their decoding is much more involved.',
    ),
  },
]

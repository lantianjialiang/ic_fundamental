import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { V_MIN_RATIO, chargeRatio, type DramAnalysis, type DramState } from './memDramModel'

const pct = (ratio: number) => `${(ratio * 100).toFixed(0)}%`

export const S = {
  kickerNow: loc('这一次阵列', 'This array'),
  introTitle: loc('DRAM：一个电容存一位，会慢慢漏电', 'DRAM: one capacitor per bit, and it slowly leaks'),
  cmdTitle: loc('一次读写的命令序列（简化）', 'One read or write as a command sequence (simplified)'),
  cmdNote: loc('示意顺序，省略了 tRCD、tRAS、tRP、tRFC 等时序参数。', 'Shows the order only; timing parameters such as tRCD, tRAS, tRP and tRFC are left out.'),
  coreTitle: loc('拨一拨：刷新间隔 tREF 与失效单元', 'Try it: refresh interval tREF and failing cells'),
  coreNote: loc(
    '每个红色方块是一个保持时间短于 tREF 的单元：它在下一次刷新前已经漏到门限以下，读出会错。教学模型按最坏情况计算，即所有单元都存 1。',
    'Each red square is a cell whose retention time is shorter than tREF: it leaks below the threshold before the next refresh, so its read is wrong. The model uses the worst case, where every cell stores a 1.',
  ),
  trefLabel: loc('刷新间隔 tREF (ms)', 'Refresh interval tREF (ms)'),
  batchBtn: loc('换一批单元（重新采样）', 'Another batch of cells (resample)'),
  rTref: loc('刷新间隔 tREF', 'Refresh interval tREF'),
  rFails: loc('失效单元数（共 2048）', 'Failing cells (of 2048)'),
  rWeak: loc('最弱单元保持时间', 'Weakest cell retention'),
  rVerdict: loc('判定（阵列）', 'Verdict (array)'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  asideLater: loc(
    '真实的 DRAM 还要处理行锤击（row hammer）、温度对保持时间的影响、冗余行替换，以及 ECC；这里只练刷新、保持时间与读后回写。',
    'Real DRAM also deals with row hammer, temperature effects on retention, redundant-row replacement and ECC; here we only practise refresh, retention and write-back after a read.',
  ),
  next: loc('下一课：DDR / LPDDR 读写训练', 'Next: DDR / LPDDR Read-Write Training'),
  cmdAct: loc(
    'ACT（激活）：给出行地址。这一行的所有单元同时把电荷送到位线，感应放大器把它放大成满幅的 0 或 1，并把整行锁存住。',
    'ACT (Activate): give a row address. Every cell in that row shares its charge onto its bit line at once; the sense amplifiers amplify each one to a full 0 or 1 and latch the whole row.',
  ),
  cmdRw: loc(
    'RD / WR（读 / 写）：在已经打开的行里选列。读是从感应放大器取数；写是改写感应放大器里的值，再由它写回单元。',
    'RD / WR (read / write): pick a column in the open row. A read takes data from the sense amplifiers; a write changes the value in the sense amplifiers, which then writes it back into the cell.',
  ),
  cmdPre: loc(
    'PRE（预充电）：关闭当前行，把位线恢复到中间电平，为下一次 ACT 做准备。',
    'PRE (Precharge): close the current row and bring the bit lines back to the middle level, ready for the next ACT.',
  ),
  cmdRef: loc(
    'REF（刷新）：控制器按 tREF 周期发出。芯片内部用行计数器逐行做 ACT → PRE，把每一行的电荷补回满值。',
    'REF (Refresh): the controller issues it every tREF period. Inside the chip a row counter steps through the rows doing ACT then PRE, restoring each row to full charge.',
  ),
  task1: loc('把 tREF 增到 128 ms 以上，直到阵列里出现红色失效单元。', 'Raise tREF to 128 ms or more until red failing cells appear in the array.'),
  task2: loc('把失效数调到 50 个以上（看右侧柱状图对应的 tREF）。', 'Push the failing count to 50 or more (the bar chart shows which tREF does this).'),
  task3: loc('换一批单元，比较失效位置变了，但失效数的大致趋势不变。', 'Switch to another batch: the failing positions change, but the overall trend stays similar.'),
  task4: loc('把 tREF 降到 8 ms，确认失效数为 0；想想刷新更频繁要付出什么代价。', 'Lower tREF to 8 ms and confirm there are no failures; think about what more frequent refresh costs.'),
}

export const FIG = {
  arrayAria: loc('DRAM 阵列：2048 个单元，失效单元标红', 'DRAM array: 2048 cells, failing cells in red'),
  arrayCap: loc(
    '每个方块是一个单元（32 行 × 64 列）。红色 = 保持时间短于 tREF 的失效单元；金框 = 本批最弱的单元。',
    'Each square is one cell (32 rows × 64 columns). Red = failing, retention shorter than tREF; gold outline = the weakest cell in this batch.',
  ),
  decayAria: loc('电荷随时间衰减曲线：最弱单元与典型单元', 'Charge decay over time: weakest cell and typical cell'),
  decayCap: loc(
    '红线是最弱单元，蓝线是典型单元，纵轴是电荷占初始值的比例 V / V0，按 V = V0 · exp(−t / τ) 衰减。虚线是感应放大器门限 V0 / 2，竖线是 tREF；曲线在竖线处低于虚线的单元就失效。',
    'Red is the weakest cell, blue is a typical cell; the vertical axis is charge as a fraction of the start, V / V0, decaying as V = V0 · exp(−t / τ). The dashed line is the sense threshold V0 / 2 and the vertical line is tREF; a cell whose curve is below the dashed line at tREF fails.',
  ),
  thresholdLabel: loc('门限 V0/2', 'Threshold V0/2'),
  sweepAria: loc('柱状图：同一批单元在不同 tREF 下的失效数', 'Bar chart: failing cells for the same batch at different tREF'),
  sweepCap: loc(
    '同一批单元在 8 到 512 ms 的几个 tREF 下的失效数。tREF 增大，保持时间短于它的单元只会变多，所以柱子单调上升。金色柱是最接近当前 tREF 的一根。',
    'Failing cells for the same batch at several tREF values from 8 to 512 ms. As tREF grows, more cells have retention shorter than it, so the bars rise. The gold bar is the one closest to the current tREF.',
  ),
  axisTref: loc('tREF (ms)', 'tREF (ms)'),
}

export const INTRO: LText[] = [
  loc(
    '{@memRw} 讲过读写流程。DRAM 的一个单元只有一个晶体管和一个电容（1T1C），电容上有没有电荷代表 0 或 1。电容会慢慢漏电，所以 DRAM 必须定期刷新；SRAM 用触发器锁存数据，不需要刷新。',
    'The {@memRw} lesson covered read and write flow. A DRAM cell is one transistor and one capacitor (1T1C): charge on the capacitor, or its absence, stores a 0 or a 1. The capacitor leaks slowly, so DRAM must be refreshed regularly; SRAM holds its data in a latch and needs no refresh.',
  ),
  loc(
    '这一课要说清四个动作：Activate 把整行读入感应放大器；读出是破坏性的，必须回写；Precharge 关闭这一行；Refresh 把每一行的电荷补回满值。刷新间隔 tREF 能拉多长，取决于单元的保持时间（retention）。',
    'Four actions matter here: Activate loads a whole row into the sense amplifiers; a read is destructive and must be written back; Precharge closes the row; Refresh restores each row’s charge. How long tREF can be depends on the retention time of each cell.',
  ),
  loc(
    '为什么读是破坏性的：单元的电荷要经过位线，与位线的寄生电容分享，分享后单元电压被拉到中间值附近。感应放大器把它推回满幅，并写回单元。读后回写不是可选项。',
    'Why a read is destructive: the cell’s charge flows onto the bit line and shares with its parasitic capacitance, which pulls the cell voltage toward the middle. The sense amplifier drives it back to full swing and writes it back into the cell. Write-back after a read is not optional.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '读 DRAM 不会改变数据，读完不用管它。读出时电荷会分到位线上，单元被拉到中间电压；如果感应放大器不把值写回，数据就丢了。',
    'Reading DRAM does not change the data, so nothing needs doing afterwards. A read moves charge onto the bit line and drags the cell to a middle voltage; unless the sense amplifier writes the value back, the data is lost.',
  ),
  loc(
    '刷新间隔越长越省事，所以越长越好。tREF 超过某些单元的保持时间，这些单元就会失效；tREF 越长，失效越多。刷新功耗和失效要折中。',
    'A longer refresh interval is always better, since refresh is then less work. Once tREF exceeds some cells’ retention time, those cells fail, and the longer tREF is, the more fail. Refresh power and failures have to be traded off.',
  ),
  loc(
    '所有单元的保持时间都一样，测一个就够了。同一批单元的保持时间分布很宽，最弱的几个单元决定了 tREF 的上限，测典型单元会漏掉它们。',
    'All cells hold their charge equally long, so testing one is enough. Retention spreads widely across a batch; the weakest few set the upper limit of tREF, and a typical cell would miss them.',
  ),
]

export const TAKEAWAY: LText = loc(
  '一个单元是一个电容，电荷随时间指数衰减；Activate 把整行读入感应放大器，读出是破坏性的，必须回写；Precharge 关行并把位线复位；Refresh 周期性地逐行补电荷。tREF 大于最弱单元的保持时间，就会有单元失效。',
  'A cell is a capacitor whose charge decays exponentially; Activate loads a row into the sense amplifiers, a read is destructive and must be written back; Precharge closes the row and resets the bit lines; Refresh periodically restores charge row by row. Once tREF exceeds the weakest cell’s retention time, cells fail.',
)

/** 小测题干中的数字由模型算出：保持时间 Q5_RET 的单元，经过 Q5_TREF 后的电荷比例 */
const Q5_RET = 100
const Q5_TREF = 128

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('一个 DRAM 单元存一位数据，主要靠哪个元件保存？', 'Which element mainly holds one bit in a DRAM cell?'),
    options: [
      { id: 'a', text: loc('晶体管的栅极', 'The transistor gate') },
      { id: 'b', text: loc('电容', 'The capacitor') },
      { id: 'c', text: loc('触发器', 'A flip-flop') },
    ],
    answer: 'b',
    explain: loc(
      '1T1C：数据是电容上有没有电荷。晶体管只是开关，负责把电容接到位线上。触发器是 SRAM 的做法，不会漏电，也就不需要刷新。',
      '1T1C: the data is whether the capacitor holds charge. The transistor is just a switch that connects the capacitor to the bit line. A flip-flop is how SRAM stores data; it does not leak, so it needs no refresh.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('Activate（ACT）命令会把什么读入感应放大器？', 'What does the Activate (ACT) command load into the sense amplifiers?'),
    options: [
      { id: 'a', text: loc('单个单元的数据', 'The data of a single cell') },
      { id: 'b', text: loc('整个阵列的数据', 'The data of the whole array') },
      { id: 'c', text: loc('一整行的数据', 'The data of one whole row') },
    ],
    answer: 'c',
    explain: loc(
      '同一行的单元共用一条字线；ACT 打开这条字线，整行的电荷同时经过各自的位线进入感应放大器。所以一次 ACT 之后，同一行的列访问都很快。',
      'Cells in one row share a word line; ACT turns that word line on, so the charge of the whole row enters the sense amplifiers at once through each bit line. After one ACT, column accesses within that row are fast.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('为什么 DRAM 读出之后必须把数据写回单元？', 'Why must DRAM write data back into the cell after a read?'),
    options: [
      { id: 'a', text: loc('读出是破坏性的：电荷被分到位线上，单元电压被拉到中间值，必须把放大后的值写回', 'The read is destructive: charge moves onto the bit line and the cell voltage is pulled to the middle, so the amplified value must be written back') },
      { id: 'b', text: loc('写回是为了让刷新更快', 'Write-back makes refresh faster') },
      { id: 'c', text: loc('写回用来校验读数是否正确', 'Write-back is used to check whether the read was correct') },
    ],
    answer: 'a',
    explain: loc(
      '单元和位线分享电荷后，单元本身的电压已经不是原来的满幅值。感应放大器把它推回满幅并写回，这一步是读出的一部分；不写回，下一次读就会读到错误的值。',
      'After the cell shares charge with the bit line, its own voltage is no longer full. The sense amplifier drives it back to full and writes it back; this is part of the read. Without write-back, the next read would see the wrong value.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('刷新间隔 tREF 从 64 ms 增大到 256 ms，保持时间短于 tREF 的失效单元数会怎样？', 'When tREF grows from 64 ms to 256 ms, how does the number of cells with retention shorter than tREF change?'),
    options: [
      { id: 'a', text: loc('减少', 'It falls') },
      { id: 'b', text: loc('不变', 'It stays the same') },
      { id: 'c', text: loc('增加', 'It rises') },
    ],
    answer: 'c',
    explain: loc(
      '单元失效的条件是保持时间小于 tREF。tREF 越大，满足这个条件的单元越多，失效数只会增加。省刷新功耗和失效增多之间要折中。',
      'A cell fails when its retention time is less than tREF. The larger tREF is, the more cells meet that condition, so the failing count can only rise. Refresh power saved must be weighed against the extra failures.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      `保持时间为 ${Q5_RET} ms 的单元，在 tREF = ${Q5_TREF} ms 时，电荷大约还剩初始值的多少？`,
      `A cell with retention time ${Q5_RET} ms: at tREF = ${Q5_TREF} ms, about what fraction of its starting charge is left?`,
    ),
    options: [
      { id: 'a', text: loc(`约 ${pct(chargeRatio(Q5_TREF / 2, Q5_RET))}`, `About ${pct(chargeRatio(Q5_TREF / 2, Q5_RET))}`) },
      { id: 'b', text: loc(`约 ${pct(chargeRatio(Q5_TREF, Q5_RET))}`, `About ${pct(chargeRatio(Q5_TREF, Q5_RET))}`) },
      { id: 'c', text: loc(`约 ${pct(V_MIN_RATIO)}`, `About ${pct(V_MIN_RATIO)}`) },
    ],
    answer: 'b',
    explain: loc(
      `V / V0 = exp(−t / τ)，τ = t_ret / ln 2，所以 V / V0 = 2^(−t / t_ret) = 2^(−${Q5_TREF}/${Q5_RET}) ≈ ${pct(chargeRatio(Q5_TREF, Q5_RET))}。它低于门限 ${pct(V_MIN_RATIO)}，因此在刷新前已经读错。`,
      `V / V0 = exp(−t / τ) with τ = t_ret / ln 2, so V / V0 = 2^(−t / t_ret) = 2^(−${Q5_TREF}/${Q5_RET}) ≈ ${pct(chargeRatio(Q5_TREF, Q5_RET))}. That is below the ${pct(V_MIN_RATIO)} threshold, so the cell reads wrong before the refresh.`,
    ),
  },
]

/** 右侧说明栏：根据阵列结果给结论和原因 */
export function verdictOf(state: DramState, a: DramAnalysis): { title: LText; text: LText } {
  const tRef = state.tRef.toFixed(0)
  const weak = a.weakestMs.toFixed(0)
  if (a.pass) {
    return {
      title: S.pass,
      text: loc(
        `阵列中没有单元的保持时间短于 ${tRef} ms。最弱的单元保持 ${weak} ms，仍长于 tREF，所以它在下一次刷新前还在门限之上。`,
        `No cell has a retention time shorter than ${tRef} ms. The weakest cell holds for ${weak} ms, longer than tREF, so it stays above the threshold until the next refresh.`,
      ),
    }
  }
  return {
    title: S.fail,
    text: loc(
      `${a.fails} 个单元的保持时间短于 ${tRef} ms（最弱的是 ${weak} ms）。它们在下一次刷新前已经漏到 V0 / 2 以下，读出会判错。tREF 越长，这类单元越多。`,
      `${a.fails} cells have a retention time shorter than ${tRef} ms (the weakest is ${weak} ms). They leak below V0 / 2 before the next refresh, so their reads come out wrong. The longer tREF is, the more such cells there are.`,
    ),
  }
}

/** 任务卡：完成与否由当前设置与阵列结果算出 */
export function taskItems(state: DramState, a: DramAnalysis): TaskItem[] {
  return [
    { id: 'fail128', text: S.task1, done: state.tRef >= 128 && a.fails > 0 },
    { id: 'fail50', text: S.task2, done: a.fails >= 50 },
    { id: 'batch', text: S.task3, done: state.batch > 0 && state.tRef >= 128 },
    { id: 'low', text: S.task4, done: state.tRef <= 8 && a.fails === 0 },
  ]
}
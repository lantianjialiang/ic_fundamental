import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type Access } from './core/array'
import { VALUES, readbackOf, type Level, type RwState, type Slot } from './rwModel'

/** 写入数据选项，顺序同 VALUES */
export const VALUE_OPTIONS = VALUES.map((value) => ({ id: String(value), label: loc(String(value), String(value)) }))

export const S = {
  kicker: loc('这一次访问', 'This access'),
  introTitle: loc('一次读写，就是一组按顺序变化的信号', 'A read or write is a sequence of signal changes'),
  coreTitle: loc('单步：写一次，再读两次', 'Single-step: one write, then two reads'),
  coreNote: loc(
    '下面的序列是“写 addr、读 addr、读 addr+1”。每次访问拆成 4 个时隙，每按一次“单步”推进一个时隙。图中的 CS#、WE#、OE# 低电平有效。',
    'The sequence below is “write addr, read addr, read addr+1”. Each access is split into 4 slots, and each Step advances one slot. CS#, WE# and OE# are active low in the figure.',
  ),
  addrLabel: loc('地址 addr（0–63）', 'Address addr (0–63)'),
  valueLabel: loc('写入的数据', 'Data to write'),
  stepBtn: loc('单步', 'Step'),
  restartBtn: loc('从头', 'Restart'),
  seqTitle: loc('访问序列', 'Access sequence'),
  simpNote: loc(
    '教学简化：真实器件的写、读时序还有建立、保持、访问时间等参数。这里只保留先后顺序：写时数据在 WE# 低期间有效，读时数据在 OE# 拉低并经过访问时间后出现。',
    'Teaching simplification: real devices also have setup, hold and access-time parameters. Only the order is kept here: on a write, data is valid while WE# is low; on a read, data appears after OE# goes low and the access time has passed.',
  ),
  rStep: loc('已执行时隙', 'Slots executed'),
  rOp: loc('当前操作', 'Current operation'),
  rCtl: loc('CS# / WE# / OE#', 'CS# / WE# / OE#'),
  rAddr: loc('地址 ADDR', 'Address ADDR'),
  rData: loc('数据 DATA', 'Data DATA'),
  rResult: loc('读出判定', 'Read check'),
  opWrite: loc('写', 'Write'),
  opRead: loc('读', 'Read'),
  none: loc('—', '—'),
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  idleTitle: loc('第 0 步：还没开始', 'Step 0: not started yet'),
  idleText: loc(
    '所有控制线处于空闲：CS#、WE#、OE# 都是高，芯片不被选中，数据线高阻。点“单步”开始第一个时隙。',
    'All control lines are idle: CS#, WE# and OE# are high, the chip is not selected, and the data bus is high-impedance. Press “Step” to run the first slot.',
  ),
  asideLater: loc(
    '真实器件还要看时序裕量（建立、保持、访问时间），以及读写之间的恢复时间；那是后面 {@memTiming} 的内容。',
    'Real devices also check timing margins (setup, hold, access time) and recovery between operations; that is covered in {@memTiming}.',
  ),
  next: loc('下一课：存储器故障模型', 'Next: Memory Fault Models'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc('单步走到第 3 步，看清 WE# 上升沿把数据锁进 Cell。', 'Step to slot 3 and see the WE# rising edge latch the data into the cell.'),
  task2: loc('单步走到第 7 步：OE# 拉低并经过访问时间后，读出的数据才稳定。', 'Step to slot 7: the read data is only stable after OE# goes low and the access time passes.'),
  task3: loc('走完三次访问（第 12 步），确认未写过的 addr+1 读出 0。', 'Finish all three accesses (slot 12) and confirm that the never-written addr+1 reads 0.'),
  task4: loc('把写入数据改成 0，再完整走一遍，看读回的值是否跟着变。', 'Change the data to write to 0, run it all the way through, and check that the read-back follows.'),
}

export const FIG = {
  aria: loc(
    '一次写和两次读的时序图：CS#、WE#、OE#、地址与数据线，已执行部分高亮，当前时隙用竖线标出',
    'Timing diagram for one write and two reads: CS#, WE#, OE#, address and data lines; executed slots are highlighted and the current slot is marked',
  ),
  cap: loc(
    '每组四个时隙是一次访问，上方数字是时隙号。写：WE# 低期间 DATA 有效，WE# 上升沿锁存。读：OE# 拉低后 DATA 经过一段过渡（访问时间）才稳定，控制器在稳定时采样。灰色部分尚未执行。',
    'Each group of four slots is one access; the numbers above are slot numbers. Write: DATA is valid while WE# is low and is latched on its rising edge. Read: after OE# goes low, DATA passes a transition (access time) before it is stable, and the controller samples it then. Faded parts have not run yet.',
  ),
  ctlHigh: loc('高', 'H'),
  ctlLow: loc('低', 'L'),
}

export const INTRO = [
  loc(
    '存储器只有几组线：地址 ADDR、数据 DATA，以及控制线 CS#（片选）、WE#（写使能）、OE#（输出使能）。一次读或写，就是这几组线按顺序变化的一组电平。前置：{@memStructure}。',
    'A memory has only a few groups of lines: the address ADDR, the data DATA, and the control lines CS# (chip select), WE# (write enable) and OE# (output enable). A read or write is a set of level changes on these lines in order. Prerequisite: {@memStructure}.',
  ),
  loc(
    '测试机（{@vector}）最终做的事也落在这些线上：先送地址，再拉控制线，最后在正确的时刻采样数据线。读懂这张时序图，就能看出一条向量是怎样变成存储器动作的。',
    'What the tester ({@vector}) does ultimately lands on these same lines: send the address, drive the control lines, then sample the data lines at the right moment. Reading this timing diagram shows how one vector becomes a memory action.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '读写只看地址和数据，控制线随便拉。CS# 决定芯片是否被选中，WE# 决定写还是读，OE# 决定读时是否输出；它们的先后顺序决定了哪一拍数据有效。',
    'Only the address and data matter; the control lines can be driven loosely. CS# decides whether the chip is selected, WE# decides write or read, and OE# decides whether it drives the output on a read; their order decides which slot the data is valid in.',
  ),
  loc(
    '地址一送出，数据就有。读数据要在 OE# 拉低并经过访问时间之后才稳定，所以控制器必须等数据有效的那一拍才采样，而不是地址送出的那一拍。',
    'Data is there as soon as the address is sent. Read data only becomes stable after OE# goes low and the access time passes, so the controller must sample in the data-valid slot, not in the address slot.',
  ),
  loc(
    '写是在 WE# 低期间完成的，数据什么时候进 Cell 都无所谓。真正锁存的是 WE# 的上升沿，所以数据要在 WE# 上升沿前后保持稳定；只在拉低的那一刻有效还不够。',
    'A write is not finished just because WE# goes low; the data is latched on the WE# rising edge, so it must hold steady around that edge. Being valid only at the moment WE# falls is not enough.',
  ),
]

export const TAKEAWAY: LText = loc(
  '一次读写是一组按顺序变化的信号：先送地址，再拉控制线。写时数据在 WE# 低期间有效，WE# 上升沿锁存；读时 OE# 拉低后数据经过访问时间才稳定，控制器在数据有效时采样。',
  'A read or write is a sequence of signal changes: send the address, then drive the control lines. On a write, data is valid while WE# is low and is latched on its rising edge; on a read, data settles after OE# goes low and the access time, and the controller samples it while valid.',
)

const WRITE_TITLE: LText[] = [
  loc('地址建立', 'Address setup'),
  loc('写选通', 'Write strobe'),
  loc('写锁存（WE# 上升沿）', 'Write latch (WE# rising edge)'),
  loc('释放总线', 'Release bus'),
]

const READ_TITLE: LText[] = [
  loc('地址建立', 'Address setup'),
  loc('读选通（访问时间）', 'Read strobe (access time)'),
  loc('数据有效，采样', 'Data valid, sample'),
  loc('释放总线', 'Release bus'),
]

/** 写操作每个时隙的说明 */
function writeText(phase: number, value: 0 | 1): LText {
  if (phase === 0) {
    return loc('地址送到 ADDR 线上并稳定。CS# 和 WE# 仍为高，芯片还不动作。', 'The address is placed on ADDR and settles. CS# and WE# are still high, so the chip does not act yet.')
  }
  if (phase === 1) {
    return loc(
      `CS# 与 WE# 拉低，DATA 线上是要写入的 ${value}。WE# 为低时，DATA 必须已经稳定。`,
      `CS# and WE# go low, and DATA carries the value ${value} to be written. While WE# is low, DATA must already be stable.`,
    )
  }
  if (phase === 2) {
    return loc(
      'WE# 拉回高（上升沿）时，芯片把 DATA 锁进这个 Cell。上升沿前后，DATA 还要保持一小段时间。',
      'When WE# returns high (rising edge), the chip latches DATA into the cell. DATA must hold for a short time around that edge.',
    )
  }
  return loc('CS# 拉回高，DATA 线释放成高阻，写操作结束。', 'CS# returns high and DATA is released to high impedance; the write is done.')
}

/** 读操作每个时隙的说明；actual 为读出值，expected 为期望值 */
function readText(phase: number, actual: Level | null, expected: 0 | 1): LText {
  if (phase === 0) {
    return loc('地址送出。CS#、OE# 仍为高，芯片不输出数据。', 'The address is sent. CS# and OE# are still high, so the chip drives no data.')
  }
  if (phase === 1) {
    return loc(
      'CS# 与 OE# 拉低，芯片开始读阵列。数据要经过一段访问时间才稳定，图中用过渡区表示（教学简化）。',
      'CS# and OE# go low and the chip starts reading the array. The data needs an access time to settle; the transition band shows this (teaching simplification).',
    )
  }
  if (phase === 2) {
    const got = actual ?? 0
    const match = got === expected
    return match
      ? loc(`DATA 已稳定，读出 ${got}，期望 ${expected}，一致，PASS。`, `DATA is stable and reads ${got}; expected ${expected}; they match, PASS.`)
      : loc(`DATA 已稳定，读出 ${got}，期望 ${expected}，不一致，FAIL。`, `DATA is stable and reads ${got}; expected ${expected}; they differ, FAIL.`)
  }
  return loc('CS# 与 OE# 拉回高，DATA 回到高阻，读操作结束。', 'CS# and OE# return high and DATA goes back to high impedance; the read is done.')
}

/** 第 n 步（1 起）的说明栏；step = 0 时显示开始前的说明 */
export function verdictOf(state: RwState, seq: Access[], slots: Slot[]): { title: LText; text: LText } {
  if (state.step <= 0) {
    return { title: S.idleTitle, text: S.idleText }
  }
  const slot = slots[state.step - 1]
  const acc = seq[slot.access]
  const phaseTitle = acc.write ? WRITE_TITLE[slot.phase] : READ_TITLE[slot.phase]
  const title = {
    zh: `第 ${state.step} 步 · ${phaseTitle.zh}`,
    en: `Step ${state.step} · ${phaseTitle.en ?? phaseTitle.zh}`,
  }
  const text = acc.write ? writeText(slot.phase, acc.value) : readText(slot.phase, readbackOf(slots, slot.access), acc.value)
  return { title: loc(title.zh, title.en), text }
}

/** DATA 线上的文字：高阻、写入、访问中或读出 */
export function dataTextOf(slot: Slot | null): LText {
  if (slot === null) {
    return S.none
  }
  const data = slot.data
  if (data.kind === 'z') {
    return loc('高阻（未驱动）', 'High-Z (undriven)')
  }
  if (data.kind === 'busy') {
    return loc('访问中…', 'Access in progress…')
  }
  if (data.kind === 'drive') {
    return loc(`写入 ${data.value}`, `Driving ${data.value}`)
  }
  return loc(`读出 ${data.value}`, `Read out ${data.value}`)
}

/** 访问序列中每一次访问的说明：写、读、读未写过的地址 */
export function accessText(acc: Access, index: number): LText {
  if (acc.write) {
    return loc(`写：把 ${acc.value} 写入地址 ${acc.addr}`, `Write: store ${acc.value} at address ${acc.addr}`)
  }
  if (index === 2) {
    return loc(`读：读地址 ${acc.addr}（从未写过），期望 ${acc.value}`, `Read: address ${acc.addr} (never written), expect ${acc.value}`)
  }
  return loc(`读：读地址 ${acc.addr}，期望 ${acc.value}`, `Read: address ${acc.addr}, expect ${acc.value}`)
}

/** 时序图上方的访问标签（短） */
export function accessTag(acc: Access, index: number): LText {
  const n = index + 1
  if (acc.write) {
    return loc(`写 #${n} · A=${acc.addr} ← ${acc.value}`, `Write #${n} · A=${acc.addr} ← ${acc.value}`)
  }
  return loc(`读 #${n} · A=${acc.addr} = ${acc.value}?`, `Read #${n} · A=${acc.addr} = ${acc.value}?`)
}

/** 读判定：当前时隙已采样时显示 PASS / FAIL；否则显示 — */
export function resultOf(seq: Access[], slots: Slot[], step: number): { text: LText; state?: 'pass' | 'fail' } {
  if (step <= 0) {
    return { text: S.none }
  }
  const slot = slots[step - 1]
  const acc = seq[slot.access]
  if (acc.write || slot.phase < 2) {
    return { text: S.none }
  }
  const actual = readbackOf(slots, slot.access)
  const ok = actual === acc.value
  return { text: ok ? S.pass : S.fail, state: ok ? 'pass' : 'fail' }
}

/** 任务卡：完成与否由当前步数和写入值算出 */
export function taskItems(state: RwState, total: number): TaskItem[] {
  return [
    { id: 'latch', text: S.task1, done: state.step >= 3 },
    { id: 'readValid', text: S.task2, done: state.step >= 7 },
    { id: 'finish', text: S.task3, done: state.step >= total },
    { id: 'zero', text: S.task4, done: state.value === 0 && state.step >= total },
  ]
}

/** 小测：题干中的数字由模型给出（访问序列里的 addr+1 未写过，读出为 0） */
export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('写操作时，数据是在什么时候被锁进 Cell 的？', 'On a write, when is the data latched into the cell?'),
    options: [
      { id: 'a', text: loc('CS# 刚拉低的时候', 'The moment CS# goes low') },
      { id: 'b', text: loc('WE# 拉回高（上升沿）的时候', 'When WE# returns high (rising edge)') },
      { id: 'c', text: loc('地址变化的时候', 'When the address changes') },
    ],
    answer: 'b',
    explain: loc(
      '写数据在 WE# 低期间有效，WE# 上升沿锁存。所以数据要在上升沿前后保持稳定，只在拉低那一刻有效是不够的。',
      'Write data is valid while WE# is low and is latched on the WE# rising edge. So it must hold steady around that edge; being valid only at the moment WE# falls is not enough.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('读操作中，DATA 线什么时候才有有效的读出值？', 'On a read, when does the DATA line carry a valid value?'),
    options: [
      { id: 'a', text: loc('CS# 一拉低就立即有效', 'Immediately when CS# goes low') },
      { id: 'b', text: loc('地址送出的那一刻就有效', 'As soon as the address is sent') },
      { id: 'c', text: loc('OE# 拉低并经过访问时间之后', 'After OE# goes low and the access time has passed') },
    ],
    answer: 'c',
    explain: loc(
      '读数据由存储器驱动，要先有 OE# 拉低，再经过访问时间才稳定。图中的过渡区就表示这段等待（教学简化）。',
      'Read data is driven by the memory: OE# must go low, and then the access time must pass before the data is stable. The transition band in the figure shows this wait (teaching simplification).',
    ),
  },
  {
    id: 'q3',
    prompt: loc('CS# 为高（未选中）时，地址线和 WE# 的变化会怎样？', 'With CS# high (not selected), what happens to address and WE# changes?'),
    options: [
      { id: 'a', text: loc('芯片不动作，这些变化不起作用', 'The chip does not act, so these changes have no effect') },
      { id: 'b', text: loc('立即写入，因为 WE# 低', 'Write immediately, because WE# is low') },
      { id: 'c', text: loc('立即读出，因为地址已变', 'Read out immediately, because the address changed') },
    ],
    answer: 'a',
    explain: loc(
      'CS# 是片选：高电平时芯片被取消选中，忽略地址与 WE#、OE# 的变化。这也是为什么片选要单独做成一根线。',
      'CS# is chip select: while high the chip is deselected and ignores changes on the address, WE# and OE#. That is why chip select is a separate line.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('下面哪一种情况会导致写入失败？', 'Which situation would cause a write to fail?'),
    options: [
      { id: 'a', text: loc('地址在 CS# 拉低前已经稳定', 'The address is stable before CS# goes low') },
      { id: 'b', text: loc('WE# 为低期间，DATA 还没稳定或被提前改掉', 'While WE# is low, DATA is not yet stable or changes too early') },
      { id: 'c', text: loc('写完后 CS# 拉高，DATA 释放为高阻', 'After the write, CS# goes high and DATA is released to high impedance') },
    ],
    answer: 'b',
    explain: loc(
      '写入时存储器在 WE# 上升沿锁存 DATA。如果 WE# 低期间数据不稳定，或者数据在锁存前后被改掉，锁进去的就不是要写的值。',
      'The memory latches DATA on the WE# rising edge. If the data is unstable during the low period, or changes around the latch edge, the stored value is not the one intended.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('本课的序列是“写 1 到地址 5，读地址 5，再读地址 6”。第三次读出的值是多少？', 'The sequence is “write 1 to address 5, read address 5, then read address 6”. What does the third read return?'),
    options: [
      { id: 'a', text: loc('1，因为地址相邻会互相影响', '1, because adjacent addresses affect each other') },
      { id: 'b', text: loc('随机值，因为没写过', 'A random value, because it was never written') },
      { id: 'c', text: loc('0，地址 6 从未被写过，初始为 0', '0, because address 6 was never written and starts at 0') },
    ],
    answer: 'c',
    explain: loc(
      '运行模型从全 0 开始，地址 6 没有被任何写操作改动，所以读回 0。真实器件上未初始化的单元值并不确定，这里按教学模型假设为 0；地址相邻并不会让数据互相复制。',
      'The model starts with all cells at 0, and no write touches address 6, so it reads 0. On a real device an uninitialised cell is not defined, but the teaching model assumes 0; adjacent addresses do not copy data to each other.',
    ),
  },
]
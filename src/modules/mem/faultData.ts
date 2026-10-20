import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type RunResult } from './core/array'
import { MARCH_C_MINUS } from './core/march'
import { FAULT_KINDS, elementIndexOf, type FaultKind, type FaultState, type Injection } from './faultModel'

/** 故障类型的短标签（分段按钮与读数用） */
export const KIND_LABEL: Record<FaultKind, LText> = {
  SAF0: loc('SAF0', 'SAF0'),
  SAF1: loc('SAF1', 'SAF1'),
  TFU: loc('TF↑', 'TF↑'),
  TFD: loc('TF↓', 'TF↓'),
  CFIN: loc('CFin', 'CFin'),
  CFID: loc('CFid', 'CFid'),
  AFNA: loc('AF 不访问', 'AF no-access'),
  AFAL: loc('AF 别名', 'AF alias'),
}

/** 故障类型选项，顺序同 FAULT_KINDS；默认取 [0] */
export const KIND_OPTIONS = FAULT_KINDS.map((id) => ({ id, label: KIND_LABEL[id] }))

/** March C− 的记法，例如 ⇕(w0); ⇑(r0,w1); …（符号本身与语言无关） */
export const MARCH_TEXT = MARCH_C_MINUS.elements
  .map((el) => `${el.order === 'up' ? '⇑' : el.order === 'down' ? '⇓' : '⇕'}(${el.ops.join(',')})`)
  .join('; ')

/** 故障的全名，用于说明栏“是哪一类故障” */
const KIND_NAME: Record<FaultKind, LText> = {
  SAF0: loc('这是固定故障 SAF0（固定为 0）。', 'This is a stuck-at fault, SAF0 (stuck at 0).'),
  SAF1: loc('这是固定故障 SAF1（固定为 1）。', 'This is a stuck-at fault, SAF1 (stuck at 1).'),
  TFU: loc('这是跳变故障 TF↑（0→1 失败）。', 'This is a transition fault, TF↑ (0→1 fails).'),
  TFD: loc('这是跳变故障 TF↓（1→0 失败）。', 'This is a transition fault, TF↓ (1→0 fails).'),
  CFIN: loc('这是耦合故障 CFin（侵害单元翻转受害单元）。', 'This is a coupling fault, CFin (aggressor inverts victim).'),
  CFID: loc('这是耦合故障 CFid（侵害单元强制受害单元）。', 'This is a coupling fault, CFid (aggressor forces victim).'),
  AFNA: loc('这是地址故障（地址不访问任何单元）。', 'This is an address fault (the address accesses no cell).'),
  AFAL: loc('这是地址故障（别名：两个地址访问同一单元）。', 'This is an address fault (alias: two addresses share one cell).'),
}

export const S = {
  kicker: loc('这一次注入', 'This injection'),
  introTitle: loc('故障模型：把缺陷抽象成可以仿真的几类', 'Fault models: abstracting defects into simulatable classes'),
  coreTitle: loc('拨一拨：注入一个故障，跑一遍 March C−', 'Try it: inject one fault and run March C−'),
  coreNote: loc(
    '阵列是 64 个单元，8 行 × 8 列，逻辑地址就是物理位置。选一种故障和单元，然后按 March C− 把整个阵列读写一遍。只要有一次读出与期望不符，就判 FAIL。',
    'The array has 64 cells in 8 rows × 8 columns, and the logical address is the physical position. Choose a fault and a cell, then run March C− over the whole array. If any read differs from its expected value, the result is FAIL.',
  ),
  kindLabel: loc('故障类型', 'Fault type'),
  algLabel: loc('测试算法 March C−：', 'Test algorithm March C−: '),
  cellLabel: loc('注入单元 / 侵害单元 / 地址', 'Cell / aggressor / address'),
  victimLabel: loc('受害单元 / 别名目标', 'Victim / alias target'),
  rKind: loc('故障类型', 'Fault type'),
  rPos: loc('注入位置', 'Injection site'),
  rResult: loc('测试结果', 'Test result'),
  rFails: loc('失效地址数', 'Failing addresses'),
  rList: loc('失效地址', 'Failing addresses (list)'),
  rFirst: loc('首次失效', 'First failure'),
  none: loc('—', '—'),
  fail: loc('FAIL：故障被检出', 'FAIL: fault detected'),
  pass: loc('PASS：未检出', 'PASS: not detected'),
  passText: loc(
    'March C− 的每一次读出都与期望一致，这次注入没有被检出。',
    'Every read of March C− matches its expected value, so this injection is not detected.',
  ),
  ruleNote: loc(
    '判定规则：至少一次读出与期望不符，就判 FAIL，这颗器件被检出。',
    'Rule: if at least one read differs from its expected value, the result is FAIL and the device is caught.',
  ),
  adjustedNote: loc(
    '受害单元与侵害单元相同，没有意义，已自动改为下一个单元。',
    'The victim and aggressor were the same cell, which makes no sense, so the victim was moved to the next cell.',
  ),
  asideLater: loc(
    '这里的故障是理想化的单元级模型；真实器件的缺陷更复杂。怎样用数据背景和图形覆盖这些故障，见 {@memPattern}；March 的记法与 MATS+ 的对比见 {@memMarch}。',
    'The faults here are idealised cell-level models; real defects are messier. How data backgrounds and patterns cover these faults is in {@memPattern}; the March notation and the MATS+ comparison are in {@memMarch}.',
  ),
  next: loc('下一课：Pattern 与数据背景', 'Next: Patterns and Data Backgrounds'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  task1: loc('注入 SAF0 或 SAF1，March C− 报 FAIL，并在图上找到异常单元（红色）。', 'Inject SAF0 or SAF1, get FAIL from March C−, and find the failing cell (red) on the array.'),
  task2: loc('注入 TF↓，看它在哪一次读出时才暴露。', 'Inject TF↓ and see at which read it finally shows up.'),
  task3: loc('注入 CFin 或 CFid，确认失效地址是受害单元（蓝框），不是侵害单元。', 'Inject CFin or CFid and confirm the failing address is the victim (blue box), not the aggressor.'),
  task4: loc('注入 AF 别名，确认失效的是地址 a 本身，而不是别名目标 t。', 'Inject an AF alias and confirm that the failing address is address a itself, not the alias target t.'),
}

export const FIG = {
  aria: loc(
    '64 单元阵列：标出注入单元、受害单元或别名目标，以及失效的地址',
    '64-cell array: the injected cell, the victim or alias target, and the failing addresses are marked',
  ),
  cap: loc(
    '方块里的数字是逻辑地址（也是物理位置）。红色：读出与期望不符的失效地址；金框：注入单元；蓝色虚线框：受害单元或别名目标；虚线箭头：从侵害单元指向受害单元，或从地址指向别名目标。',
    'The number in each square is the logical address, which is also the physical position. Red: failing addresses whose read differed from the expected value; gold: the injected cell; blue dashed box: the victim or alias target; dashed arrow: from aggressor to victim, or from address to alias target.',
  ),
}

export const INTRO = [
  loc(
    '{@memRw} 的读写只告诉你“读出的值对不对”。故障模型把物理缺陷抽象成几类：固定（Stuck-at）、跳变（Transition）、耦合（Coupling）和地址（Address）。{@vector} 里的故障模型在存储器里分得更细。前置：{@memRw}、{@vector}。',
    'The reads and writes in {@memRw} only tell you whether a value is right. Fault models abstract physical defects into a few classes: stuck-at, transition, coupling and address. The fault model in {@vector} is split more finely for memories. Prerequisites: {@memRw}, {@vector}.',
  ),
  loc(
    '这一课在一个 64 单元的阵列里注入一个故障，然后用 March C− 把整个阵列读写一遍。注入的故障是什么，决定了失效会出现在哪个地址上。',
    'This lesson injects one fault into a 64-cell array and runs March C− over the whole array. Which fault is injected decides which address the failure shows up at.',
  ),
]

export const MISCONCEPTIONS: LText[] = [
  loc(
    '失效的地址就是故障所在的地址。耦合故障的失效出现在受害单元上：侵害单元本身的内容没有被改，读它总是对的。',
    'The failing address is the faulty cell’s address. A coupling fault shows up on the victim: the aggressor’s own content is not changed, so reading it is always correct.',
  ),
  loc(
    '只写一遍、读一遍，就能抓住所有故障。跳变故障只在特定方向的跳变时暴露，耦合故障要求侵害与受害单元的先后访问关系，所以需要 March 这类多遍、双方向的序列。',
    'One write and one read finds every fault. A transition fault only shows on a transition in one direction, and a coupling fault depends on the order in which aggressor and victim are accessed; that needs a multi-pass, two-direction sequence such as March.',
  ),
  loc(
    '地址故障只是“坏了一个地址”。别名会让两个地址访问同一个单元：写一个地址，另一个地址读出的内容也变了。',
    'An address fault is just “one bad address”. An alias makes two addresses access the same cell: writing one changes what the other reads.',
  ),
]

export const TAKEAWAY: LText = loc(
  '固定故障与地址故障在任何写读序列里都会留下痕迹；跳变故障要在特定方向的跳变上才暴露；耦合故障的失效出现在受害单元上。March C− 用双方向的读写序列把它们都抓出来，只要有一次读出与期望不符，就判 FAIL。',
  'Stuck-at and address faults leave a trace in almost any read-write sequence; a transition fault shows only on a transition in its direction; a coupling fault fails on the victim. March C− uses a two-direction read-write sequence to catch them all, and any single mismatched read gives FAIL.',
)

/** 把若干段文字拼成一段（中文直接相连，英文用空格连接） */
function cat(...parts: LText[]): LText {
  return loc(
    parts.map((part) => part.zh).join(''),
    parts.map((part) => part.en ?? part.zh).join(' '),
  )
}

/** 注入的故障在阵列上造成什么结果（一句话） */
export function mechanismOf(state: FaultState, inj: Injection): LText {
  const c = state.cell
  const v = inj.victim ?? c
  switch (state.kind) {
    case 'SAF0':
      return loc(`单元 ${c} 被钉在 0：写 1 无效，读回的仍是 0。`, `Cell ${c} is stuck at 0: writing 1 has no effect, so it still reads 0.`)
    case 'SAF1':
      return loc(`单元 ${c} 被钉在 1：写 0 无效，读回的仍是 1。`, `Cell ${c} is stuck at 1: writing 0 has no effect, so it still reads 1.`)
    case 'TFU':
      return loc(`单元 ${c} 不能从 0 变到 1：写 1 失败，它仍是 0。`, `Cell ${c} cannot go from 0 to 1: the write of 1 fails and it stays 0.`)
    case 'TFD':
      return loc(`单元 ${c} 不能从 1 变到 0：写 0 失败，它仍是 1。`, `Cell ${c} cannot go from 1 to 0: the write of 0 fails and it stays 1.`)
    case 'CFIN':
      return loc(
        `侵害单元 ${c} 的 0→1 跳变会翻转受害单元 ${v}；失效出现在受害单元 ${v} 上。`,
        `A 0→1 transition on aggressor ${c} inverts victim ${v}; the failure shows up on victim ${v}.`,
      )
    case 'CFID':
      return loc(
        `侵害单元 ${c} 的 0→1 跳变会把受害单元 ${v} 强制为 1；失效出现在受害单元 ${v} 上。`,
        `A 0→1 transition on aggressor ${c} forces victim ${v} to 1; the failure shows up on victim ${v}.`,
      )
    case 'AFNA':
      return loc(`地址 ${c} 不访问任何单元：写入丢失，读出固定为 0。`, `Address ${c} accesses no cell: writes are lost and reads return 0.`)
    case 'AFAL':
      return loc(
        `地址 ${c} 实际访问单元 ${v}：写 ${c} 的结果落在 ${v} 上，读 ${c} 得到的是 ${v} 的内容。`,
        `Address ${c} actually accesses cell ${v}: writes to ${c} land in ${v}, and reads of ${c} return the content of ${v}.`,
      )
  }
}

/** March 元素的显示名，例如 “第 3 个元素 ⇓(r1,w0)” */
export function elementName(index: number): LText {
  const el = MARCH_C_MINUS.elements[index]
  const sym = el.order === 'up' ? '⇑' : el.order === 'down' ? '⇓' : '⇕'
  const text = `${sym}(${el.ops.join(',')})`
  return loc(`第 ${index + 1} 个元素 ${text}`, `Element ${index + 1} ${text}`)
}

/** 右侧说明栏：结论 + 故障类别 + 首次失效的位置，最后给判定规则 */
export function verdictOf(state: FaultState, inj: Injection, result: RunResult): { title: LText; text: LText; note: LText | null } {
  const note = inj.adjusted ? S.adjustedNote : null
  const first = result.log.find((entry) => !entry.pass)
  if (first === undefined) {
    return { title: S.pass, text: S.passText, note }
  }
  const at = elementName(elementIndexOf(first.step))
  const firstText = loc(
    `第一次失效在${at.zh}：读地址 ${first.addr}，期望 ${first.expected}，实际 ${first.actual}。`,
    `The first failure is in ${at.en ?? at.zh}: reading address ${first.addr}, expected ${first.expected}, actual ${first.actual}.`,
  )
  return {
    title: S.fail,
    text: cat(KIND_NAME[state.kind], mechanismOf(state, inj), firstText, S.ruleNote),
    note,
  }
}

/** 四张任务卡：完成与否由注入的故障和测试结果算出 */
export function taskItems(state: FaultState, inj: Injection, result: RunResult): TaskItem[] {
  const failed = !result.pass
  const victim = inj.victim
  return [
    { id: 'saf', text: S.task1, done: (state.kind === 'SAF0' || state.kind === 'SAF1') && failed },
    { id: 'tfd', text: S.task2, done: state.kind === 'TFD' && failed },
    {
      id: 'victim',
      text: S.task3,
      done: (state.kind === 'CFIN' || state.kind === 'CFID') && victim !== null && result.failAddrs.includes(victim),
    },
    { id: 'alias', text: S.task4, done: state.kind === 'AFAL' && failed && result.failAddrs.includes(state.cell) },
  ]
}

/** 小测：题目都是概念题，选项的顺序与答案互相独立 */
export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('SAF1（固定故障）指的是什么？', 'What does SAF1 (stuck-at 1) mean?'),
    options: [
      { id: 'a', text: loc('单元只能从 0 变到 1，不能从 1 变到 0', 'The cell can go from 0 to 1 but not from 1 to 0') },
      { id: 'b', text: loc('写入的是 0，读出的却是 1，因为地址映射错了', 'A 0 is written but a 1 is read, because the address mapping is wrong') },
      { id: 'c', text: loc('单元被钉在 1：写 0 无效，读出始终是 1', 'The cell is stuck at 1: writing 0 has no effect and reads always return 1') },
    ],
    answer: 'c',
    explain: loc(
      'SAF1 的固定值是 1。写 0 被忽略，所以读出的始终是 1；期望是 0 的读操作就会失效。',
      'SAF1 is fixed at 1. A write of 0 is ignored, so reads always return 1, and any read that expects 0 fails.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('TF↓（跳变故障）表示什么？March C− 的 ⇑(r1,w0) 为什么要先读 1、再写 0？', 'What does TF↓ (transition fault) mean, and why does March C−’s ⇑(r1,w0) read a 1 before writing 0?'),
    options: [
      { id: 'a', text: loc('单元不能从 0 变到 1', 'The cell cannot go from 0 to 1') },
      { id: 'b', text: loc('单元不能从 1 变到 0；只有先让它是 1，再写 0，才能暴露', 'The cell cannot go from 1 to 0; it shows only if the cell is first 1 and then written with 0') },
      { id: 'c', text: loc('单元读出时会自动翻转', 'The cell flips automatically when it is read') },
    ],
    answer: 'b',
    explain: loc(
      'TF↓ 要求单元从 1 变到 0 才会失败。March C− 的元素 ⇑(r1,w0) 正是先读 1（确认它是 1）再写 0，之后的读就能发现写 0 没成功。',
      'TF↓ fails only on a 1→0 transition. March C−’s element ⇑(r1,w0) reads a 1 first and then writes 0, so a later read exposes that the 0 never landed.',
    ),
  },
  {
    id: 'q3',
    prompt: loc('CFid（耦合故障）中，侵害单元的跳变把受害单元强制为 1。失效应该在哪个地址上看到？', 'In CFid, an aggressor transition forces the victim to 1. At which address should the failure be seen?'),
    options: [
      { id: 'a', text: loc('受害单元', 'The victim cell') },
      { id: 'b', text: loc('侵害单元', 'The aggressor cell') },
      { id: 'c', text: loc('两者都不会失效', 'Neither will fail') },
    ],
    answer: 'a',
    explain: loc(
      '耦合改变的是受害单元的内容，只有读受害单元时才会和期望比较。侵害单元没有被改，读它总是对的，所以失效地址是受害单元。',
      'Coupling changes the victim’s content, which is compared only when the victim is read. The aggressor is not changed, so its reads are correct; the failing address is the victim.',
    ),
  },
  {
    id: 'q4',
    prompt: loc('AF 别名（地址 a 访问单元 t）时，写地址 a 会发生什么？', 'With an AF alias (address a accesses cell t), what happens when address a is written?'),
    options: [
      { id: 'a', text: loc('只有地址 a 的单元被改变', 'Only the cell of address a changes') },
      { id: 'b', text: loc('写入实际落在 t 上，读 a 也得到 t 的内容', 'The write actually lands in t, and reading a also returns the content of t') },
      { id: 'c', text: loc('写入被丢弃，读出固定为 0', 'The write is discarded and reads return 0') },
    ],
    answer: 'b',
    explain: loc(
      '别名意味着地址 a 没有自己的单元，它的访问都落到 t 上。所以写 a 改变了 t，读 a 得到的也是 t 的内容；这和“地址不访问任何单元”（写入丢失）不同。',
      'An alias means address a has no cell of its own; its accesses land on t. So writing a changes t, and reading a returns t’s content. This differs from “no cell accessed”, where writes are lost.',
    ),
  },
  {
    id: 'q5',
    prompt: loc('下面哪一种故障，MATS+ 查不出，而 March C− 能查出？', 'Which fault does MATS+ miss but March C− catches?'),
    options: [
      { id: 'a', text: loc('TF↓（1→0 失败）', 'TF↓ (1→0 fails)') },
      { id: 'b', text: loc('SAF0（固定为 0）', 'SAF0 (stuck at 0)') },
      { id: 'c', text: loc('AF 不访问（地址不访问单元）', 'AF no-access (address accesses no cell)') },
    ],
    answer: 'a',
    explain: loc(
      'MATS+ 只在 ⇓(r1,w0) 里做一次 1→0 的写，之后没有再读，所以查不出 TF↓。March C− 在 ⇑(r1,w0) 之后还有 ⇓(r0,w1) 去读 0，能暴露它。SAF0 与 AF 不访问在 MATS+ 里本来就能被读到。',
      'MATS+ does one 1→0 write in ⇓(r1,w0) and never reads back afterwards, so TF↓ escapes. March C− reads 0 again in ⇓(r0,w1) after ⇑(r1,w0), which exposes it. SAF0 and AF no-access are already caught by MATS+.',
    ),
  },
]

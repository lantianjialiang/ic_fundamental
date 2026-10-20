import { loc, type LText } from '../../i18n/locale'
import { type QuizQuestion } from '../../lab/QuizList'
import { type TaskItem } from '../../lab/TaskList'
import { type RunResult } from './core/array'
import { MARCH_C_MINUS, MATS_PLUS, type MarchAlgorithm, type MarchElement, type MarchOp, opsPerCell } from './core/march'
import { ARRAY_SIZE, PRESET_FAULTS } from './faultSet'
import {
  ALGORITHMS,
  type AlgId,
  type CoverageRow,
  type FaultChoice,
  type MarchStep,
  coverageRows,
  firstFailIndex,
  marchSteps,
  runChoice,
} from './marchModel'

/** 覆盖表在模块加载时算一次：输入固定，结果确定 */
export const COVERAGE: CoverageRow[] = coverageRows(ARRAY_SIZE)

const SYMBOL: Record<MarchElement['order'], string> = { up: '⇑', down: '⇓', any: '⇕' }

/** 元素的记法，例如 ⇑(r0,w1) */
export function elementText(el: MarchElement): string {
  return `${SYMBOL[el.order]}(${el.ops.join(',')})`
}

/** 整个算法的记法，例如 ⇕(w0); ⇑(r0,w1)，用于小测题与说明 */
export function algorithmText(alg: MarchAlgorithm): string {
  return alg.elements.map((el) => elementText(el)).join('; ')
}

export const OP_TEXT: Record<MarchOp, LText> = {
  r0: loc('读，期望 0', 'read, expect 0'),
  r1: loc('读，期望 1', 'read, expect 1'),
  w0: loc('写 0', 'write 0'),
  w1: loc('写 1', 'write 1'),
}

const en = (text: LText): string => text.en ?? text.zh

function presetShort(id: string): LText {
  const found = PRESET_FAULTS.find((item) => item.id === id)
  return found === undefined ? loc('故障', 'fault') : found.short
}

function algLabel(id: AlgId): LText {
  const found = ALGORITHMS.find((item) => item.id === id)
  return found === undefined ? ALGORITHMS[0].label : found.label
}

function algOf(id: AlgId): MarchAlgorithm {
  const found = ALGORITHMS.find((item) => item.id === id)
  return found === undefined ? ALGORITHMS[0].alg : found.alg
}

export const INTRO: LText[] = [
  loc(
    'March 测试是一组按固定次序执行的“元素”。每个元素按地址升序或降序扫过所有单元，对每个单元做一串读和写；读出时把实际值与期望值比较，不一致就记为失效。',
    'A March test is a fixed sequence of “elements”. Each element sweeps every cell in ascending or descending address order and performs a short string of reads and writes on each cell. A read compares the actual value with the expected one; a mismatch is a failure.',
  ),
  loc(
    '一个跳变故障只有在跳变之后再读回，才可能被看见。所以算法要在写 0 之后读 0，在写 1 之后读 1，两个方向都覆盖到；这就是 March 算法的核心，它决定能否抓住 TF 与耦合故障。',
    'A transition fault can only be seen if the cell is read back after the transition. So the algorithm must read 0 after writing 0 and read 1 after writing 1, in both directions; this is the core of a March algorithm and decides whether TF and coupling faults can be caught.',
  ),
  loc(
    'MATS+ 每单元 5 次操作，March C− 每单元 10 次操作。下面的页面让你选一种算法和一个故障，逐步执行，看读出在哪一步、哪个单元失效。',
    'MATS+ does 5 operations per cell and March C− does 10. Below you pick an algorithm and a fault, step through the run, and see which read fails at which step and cell.',
  ),
]

export const S = {
  kickerNow: loc('这一次 March 测试', 'This March test'),
  introTitle: loc('March：一组元素按地址顺序扫一遍', 'March: a sequence of elements that sweep the addresses'),
  coreTitle: loc('拨一拨：选算法和故障，逐步执行', 'Try it: pick an algorithm and a fault, then step through'),
  coreNote: loc(
    '每一步是对一个地址做一次读或写。读出时比较期望与实际，不一致就失效。阵列 8 个单元，最多注入一个故障。',
    'Each step reads or writes one address. A read compares the actual value with the expected one; a mismatch is a failure. The array has 8 cells and at most one fault is injected.',
  ),
  algLabel: loc('算法', 'Algorithm'),
  faultLabel: loc('注入的故障', 'Injected fault'),
  stepOne: loc('单步', 'Step'),
  stepAll: loc('运行全部', 'Run all'),
  stepReset: loc('重置', 'Reset'),
  progress: loc('已执行', 'Executed'),
  elementsTitle: loc('元素（当前元素高亮）', 'Elements (current one highlighted)'),
  opHelp: loc(
    'r0 = 读，期望 0；w1 = 写 1。⇑ 升序、⇓ 降序、⇕ 任意（按升序执行）。',
    'r0 = read expecting 0; w1 = write 1. ⇑ ascending, ⇓ descending, ⇕ either (run ascending).',
  ),
  curTitle: loc('当前操作', 'Current operation'),
  rElement: loc('元素', 'Element'),
  rAddr: loc('地址', 'Address'),
  rOp: loc('操作', 'Operation'),
  rExpect: loc('期望', 'Expected'),
  rActual: loc('实际', 'Actual'),
  rResult: loc('比较结果', 'Comparison'),
  notStarted: loc('尚未执行', 'Not started'),
  writeOp: loc('写入', 'Write'),
  readOp: loc('读出', 'Read'),
  match: loc('一致', 'Match'),
  mismatch: loc('不一致', 'Mismatch'),
  noCompare: loc('写操作，不比较', 'Write, no compare'),
  logTitle: loc('逐步日志', 'Step log'),
  logCols: [loc('步', 'Step'), loc('元素', 'Elem'), loc('地址', 'Addr'), loc('操作', 'Op'), loc('期望', 'Exp'), loc('实际', 'Act'), loc('结果', 'Result')],
  logNote: loc('已执行的步骤显示结果，未执行的步骤变暗。', 'Executed steps show their result; steps not yet run are dimmed.'),
  covTitle: loc('覆盖范围：每个预设故障被哪种算法抓到', 'Coverage: which algorithm catches each preset fault'),
  covNote: loc(
    '“第 k 步”是第一次读出失效的步号，地址是失效的单元。全部由模型逐步运行得到。',
    'The step number is the first failing read and the address is the failing cell; everything is produced by running the model step by step.',
  ),
  covAria: loc('两种算法对预设故障的检出表', 'Table of which algorithm detects which preset fault'),
  covFault: loc('预设故障', 'Preset fault'),
  hit: loc('检出', 'Hit'),
  miss: loc('漏检', 'Miss'),
  hitAt: (step: number, addr: number) => loc(`检出：第 ${step} 步，地址 ${addr}`, `Hit: step ${step}, address ${addr}`),
  quizTitle: loc('复习题', 'Review questions'),
  quizNote: loc('选完立刻出对错和解释。', 'Pick an answer to see right or wrong with an explanation.'),
  misTitle: loc('常见误区', 'Common misconceptions'),
  takeawayTitle: loc('带走这几句', 'Key takeaways'),
  asideLater: loc(
    '真实的 March 测试还要考虑地址序的物理布局、读写时序和多次重复（用来抓间歇性故障）；这里只看算法本身的覆盖。',
    'Real March tests also consider the physical layout of addresses, read/write timing and repeated runs (for intermittent faults); here we look only at the algorithm’s coverage.',
  ),
  next: loc('下一课：存储器时序测试', 'Next: Memory Timing Test'),
  clean: loc(
    '干净阵列上每一次读出都与期望一致，所以测试通过。通过只说明没有读错，不说明没有故障：要知道算法能不能抓故障，必须注入故障再跑一遍。',
    'On a clean array every read matches its expected value, so the test passes. A pass only means no read went wrong, not that the array is fault-free; to know whether the algorithm can catch a fault, inject one and run again.',
  ),
  missText: loc(
    '这一故障没有被读出：它的效果出现在一次写之后，而算法在那之后没有再读这个单元，所以整次测试 PASS。',
    'The fault never shows on a read: its effect appears after a write, and the algorithm does not read that cell again afterwards, so the whole test passes.',
  ),
  task1: loc('无故障下跑完 March C−，每一次读出都一致', 'With no fault, run March C− to the end and see every read match'),
  task2: loc('注入 TF↓，用 MATS+ 跑完，确认它 PASS（漏检）', 'Inject TF↓, run MATS+ to the end, and confirm it passes (missed)'),
  task3: loc('同一个 TF↓ 换成 March C−，单步到第一次失效', 'Same TF↓ with March C−: step to the first mismatch'),
  task4: loc('注入 SAF0，两种算法都 FAIL，并比较它们第一次失效的步号', 'Inject SAF0; both algorithms fail. Compare the step of their first failure'),
}

/** 每个故障为什么会被（或不会被）读出：文字只写机制 */
export const FAULT_REASON: Record<string, LText> = {
  saf0: loc(
    'SAF0 单元被钉成 0：写 1 无效，随后读出的 0 与期望的 1 不符。只要算法在写 1 之后读这个单元，就会暴露。',
    'SAF0 is stuck at 0: a write of 1 has no effect, so a later read of 0 mismatches the expected 1. Any algorithm that reads the cell after writing 1 exposes it.',
  ),
  saf1: loc(
    'SAF1 单元被钉成 1：写 0 无效，随后读出的 1 与期望的 0 不符。只要算法在写 0 之后读这个单元，就会暴露。',
    'SAF1 is stuck at 1: a write of 0 has no effect, so a later read of 1 mismatches the expected 0. Any algorithm that reads the cell after writing 0 exposes it.',
  ),
  'tf-up': loc(
    'TF↑ 的 0→1 跳变被阻止：写 1 后单元仍是 0，之后读 1 时不一致。',
    'TF↑ blocks the 0→1 transition: after writing 1 the cell still holds 0, so a later read of 1 mismatches.',
  ),
  'tf-down': loc(
    'TF↓ 的 1→0 跳变被阻止：写 0 后单元仍是 1。要抓到它，必须在一次写 0 之后再读出 0，这正是 March C− 的 ⇓(r0,w1) 做的事。MATS+ 最后一次写 0 之后没有读，残留的 1 没有机会被看见。',
    'TF↓ blocks the 1→0 transition: after writing 0 the cell still holds 1. To catch it, the algorithm must read 0 after a write of 0, which is what the ⇓(r0,w1) element of March C− does. MATS+ ends with a write of 0 and never reads again, so the leftover 1 is never seen.',
  ),
  'cfin-fall': loc(
    'CFin↓：侵害单元 4 的下降沿把受害单元 2 翻转。若受害单元在翻转之后又被同一元素写过，错误会被覆盖；只有翻转之后再被读出，才会失效。',
    'CFin↓: the falling edge of aggressor 4 inverts victim 2. If the same element writes victim 2 again after the flip, the error is overwritten; it shows only if victim 2 is read after the flip.',
  ),
  'cfid-rise': loc(
    'CFid↑：侵害单元 4 的上升沿把受害单元 2 强制为 0。只有受害单元此时的期望是 1 才会失效，所以算法要先把 2 写成 1，随后再读出。',
    'CFid↑: the rising edge of aggressor 4 forces victim 2 to 0. The read fails only when the victim is expected to hold 1, so the algorithm must write 1 to cell 2 and read it afterwards.',
  ),
  'af-noaccess': loc(
    '地址 4 不访问任何单元：写入丢失，读出 0。任何期望 1 的读都会失效。',
    'Address 4 accesses no cell: writes are lost and reads return 0, so any read expecting 1 fails.',
  ),
  'af-alias': loc(
    '地址 1 实际访问单元 0：地址 1 的写会覆盖单元 0，单元 1 写不进去，第一次读就会暴露。',
    'Address 1 actually accesses cell 0: writes to address 1 overwrite cell 0, and cell 1 cannot be written; the first read exposes it.',
  ),
}

/** 右侧说明栏：结论 + 原因。失效处给出步号、元素、地址、读出值与期望值 */
export function verdictOf(
  algId: AlgId,
  choice: FaultChoice,
  result: RunResult,
  steps: MarchStep[],
): { title: LText; text: LText } {
  const label = algLabel(algId)
  if (choice.fault === null) {
    return {
      title: loc(`${label.zh}：干净阵列 PASS`, `${en(label)}: clean array PASS`),
      text: S.clean,
    }
  }
  const idx = firstFailIndex(result.log)
  if (idx < 0) {
    return {
      title: loc(`${label.zh}：PASS（漏检）`, `${en(label)}: PASS (missed)`),
      text: loc(
        `${presetShort(choice.id).zh} 没有被检出。${S.missText.zh}`,
        `${en(presetShort(choice.id))} was not detected. ${en(S.missText)}`,
      ),
    }
  }
  const entry = result.log[idx]
  const step = steps[idx]
  const elem = step.element + 1
  const expectText = entry.expected === null ? '—' : String(entry.expected)
  const actualText = entry.actual === null ? '—' : String(entry.actual)
  const reason = FAULT_REASON[choice.id]
  return {
    title: loc(`${label.zh}：FAIL（检出）`, `${en(label)}: FAIL (detected)`),
    text: loc(
      `第 ${idx + 1} 步（元素 ${elem}，地址 ${step.addr}）读出 ${actualText}，期望 ${expectText}，不一致，判 FAIL。${reason.zh}`,
      `Step ${idx + 1} (element ${elem}, address ${step.addr}) reads ${actualText} while ${expectText} is expected, a mismatch, so FAIL. ${en(reason)}`,
    ),
  }
}

function coverageFor(presetId: string, alg: AlgId): boolean {
  const row = COVERAGE.find((item) => item.preset.id === presetId)
  return row !== undefined && row.cells[alg].detected
}

/** 四张任务卡：完成与否由当前设置、步数与运行结果算出 */
export function taskItems(state: { alg: AlgId; fault: string; step: number }, count: number, result: RunResult): TaskItem[] {
  const idx = firstFailIndex(result.log)
  const reachedFail = idx >= 0 && state.step > idx
  return [
    {
      id: 'clean',
      text: S.task1,
      done: state.fault === 'none' && state.alg === 'marchC' && state.step === count && result.pass,
    },
    {
      id: 'tf-mats',
      text: S.task2,
      done: state.fault === 'tf-down' && state.alg === 'mats' && state.step === count && result.pass,
    },
    {
      id: 'tf-c',
      text: S.task3,
      done: state.fault === 'tf-down' && state.alg === 'marchC' && reachedFail,
    },
    {
      id: 'saf0',
      text: S.task4,
      done: state.fault === 'saf0' && coverageFor('saf0', 'mats') && coverageFor('saf0', 'marchC'),
    },
  ]
}

/* 小测题的数字与结论全部由模型算出 */
const MATS = algOf('mats')
const MARCH_C = algOf('marchC')
const OPS_MATS = opsPerCell(MATS_PLUS)
const OPS_MARCH_C = opsPerCell(MARCH_C_MINUS)

function presetFault(id: string): FaultChoice {
  const found = PRESET_FAULTS.find((item) => item.id === id)
  return { id, label: found === undefined ? loc(id, id) : found.name, fault: found === undefined ? null : found.fault }
}

const TF_DOWN_CHOICE = presetFault('tf-down')
const MATS_TF = runChoice(MATS, TF_DOWN_CHOICE)
const MARCH_TF = runChoice(MARCH_C, TF_DOWN_CHOICE)
const MARCH_TF_STEPS = marchSteps(MARCH_C, ARRAY_SIZE)
const MARCH_TF_IDX = firstFailIndex(MARCH_TF.log)
const MARCH_TF_ELEMENT = MARCH_TF_STEPS[MARCH_TF_IDX].element
const MATS_TF_IDX = firstFailIndex(MATS_TF.log)
const MATS_TF_RESULT: LText = MATS_TF.pass
  ? loc('所有读出都一致，PASS。', 'every read matches, so PASS.')
  : loc(`第 ${MATS_TF_IDX + 1} 步失效。`, `failure at step ${MATS_TF_IDX + 1}.`)

function elementAt(alg: MarchAlgorithm, index: number): MarchElement {
  const found = alg.elements[index]
  return found === undefined ? alg.elements[0] : found
}

/** Q6 的三个候选；答案由覆盖表算出（MATS+ 漏检、March C− 检出的那一个） */
const Q6_OPTION_IDS = ['a', 'b', 'c'] as const
const Q6_CHOICES = [presetFault('saf1'), presetFault('tf-down'), presetFault('af-noaccess')]
const Q6_INDEX = Math.max(
  0,
  Q6_CHOICES.findIndex((choice) => {
    const row = COVERAGE.find((item) => item.preset.id === choice.id)
    return row !== undefined && !row.cells.mats.detected && row.cells.marchC.detected
  }),
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('MATS+ 每个单元要做几次操作？', 'How many operations does MATS+ perform on each cell?'),
    options: [
      { id: 'a', text: loc(`${OPS_MARCH_C} 次`, `${OPS_MARCH_C} operations`) },
      { id: 'b', text: loc(`${OPS_MATS} 次`, `${OPS_MATS} operations`) },
      { id: 'c', text: loc(`${OPS_MATS - 1} 次`, `${OPS_MATS - 1} operations`) },
    ],
    answer: 'b',
    explain: loc(
      `MATS+ 是 ${algorithmText(MATS_PLUS)}，每个单元的操作数 = 1 + 2 + 2 = ${OPS_MATS}。`,
      `MATS+ is ${algorithmText(MATS_PLUS)}, so operations per cell = 1 + 2 + 2 = ${OPS_MATS}.`,
    ),
  },
  {
    id: 'q2',
    prompt: loc('用 March C− 测一个 1024 单元的阵列，总共要做多少次操作？', 'How many operations does March C− need in total for a 1024-cell array?'),
    options: [
      { id: 'a', text: loc(`${OPS_MARCH_C * 1024} 次`, `${OPS_MARCH_C * 1024} operations`) },
      { id: 'b', text: loc(`${OPS_MATS * 1024} 次`, `${OPS_MATS * 1024} operations`) },
      { id: 'c', text: loc('1024 次', '1024 operations') },
    ],
    answer: 'a',
    explain: loc(
      `March C− 每个单元 ${OPS_MARCH_C} 次操作，总数 = ${OPS_MARCH_C} × 1024 = ${OPS_MARCH_C * 1024}。时间随单元数线性增长。`,
      `March C− has ${OPS_MARCH_C} operations per cell, so the total is ${OPS_MARCH_C} × 1024 = ${OPS_MARCH_C * 1024}. Time grows linearly with the cell count.`,
    ),
  },
  {
    id: 'q3',
    prompt: loc('MATS+ 在注入 TF↓（单元 6）的阵列上跑完，结论是什么？', 'What does MATS+ conclude after running to the end with TF↓ on cell 6?'),
    options: [
      { id: 'a', text: loc('FAIL（检出）', 'FAIL (detected)') },
      { id: 'b', text: loc('PASS（漏检）', 'PASS (missed)') },
      { id: 'c', text: loc('FAIL，失效在最后一步', 'FAIL, failing at the last step') },
    ],
    answer: MATS_TF.pass ? 'b' : 'a',
    explain: loc(
      `模型运行结果：${MATS_TF_RESULT.zh}MATS+ 最后一个元素 ⇓(r1,w0) 把单元 6 写成 0，但之后不再读，TF↓ 残留的 1 没有机会被看见。`,
      `Model result: ${en(MATS_TF_RESULT)} The last MATS+ element ⇓(r1,w0) writes 0 to cell 6 but never reads again, so the leftover 1 caused by TF↓ is never seen.`,
    ),
  },
  {
    id: 'q4',
    prompt: loc('March C− 在 TF↓ 下第一次失效发生在哪一个元素？', 'In which element does March C− first fail with TF↓?'),
    options: [
      {
        id: 'a',
        text: loc(elementText(elementAt(MARCH_C, MARCH_TF_ELEMENT - 1)), elementText(elementAt(MARCH_C, MARCH_TF_ELEMENT - 1))),
      },
      {
        id: 'b',
        text: loc(elementText(elementAt(MARCH_C, MARCH_TF_ELEMENT)), elementText(elementAt(MARCH_C, MARCH_TF_ELEMENT))),
      },
      {
        id: 'c',
        text: loc(elementText(elementAt(MARCH_C, MARCH_TF_ELEMENT + 1)), elementText(elementAt(MARCH_C, MARCH_TF_ELEMENT + 1))),
      },
    ],
    answer: 'b',
    explain: loc(
      `模型给出第 ${MARCH_TF_IDX + 1} 步失效，位于第 ${MARCH_TF_ELEMENT + 1} 个元素 ${elementText(elementAt(MARCH_C, MARCH_TF_ELEMENT))}，地址 ${MARCH_TF_STEPS[MARCH_TF_IDX].addr}：前面 ⇑(r1,w0) 的写 0 被阻止，这里读到 1，期望 0。`,
      `The model fails at step ${MARCH_TF_IDX + 1}, in element ${MARCH_TF_ELEMENT + 1} ${elementText(elementAt(MARCH_C, MARCH_TF_ELEMENT))} at address ${MARCH_TF_STEPS[MARCH_TF_IDX].addr}: the earlier ⇑(r1,w0) write of 0 was blocked, so this read returns 1 while 0 is expected.`,
    ),
  },
  {
    id: 'q5',
    prompt: loc('MATS+ 为什么漏掉 TF↓？', 'Why does MATS+ miss TF↓?'),
    options: [
      { id: 'a', text: loc('它不做写操作', 'It performs no writes') },
      {
        id: 'b',
        text: loc('它的最后一次写 0 之后没有读回，残留的 1 没有机会被读出', 'Its last write of 0 is never read back, so the leftover 1 is never read'),
      },
      { id: 'c', text: loc('TF↓ 只在升序时出现', 'TF↓ appears only in ascending order') },
    ],
    answer: 'b',
    explain: loc(
      'TF↓ 让写 0 无效、单元保持 1。MATS+ 的最后一个元素 ⇓(r1,w0) 写 0 之后就结束了，之后没有任何一次读，所以错误无法出现在比较中。',
      'TF↓ makes a write of 0 ineffective, leaving the cell at 1. The last MATS+ element ⇓(r1,w0) ends with a write of 0 and nothing reads afterwards, so the error never reaches a comparison.',
    ),
  },
  {
    id: 'q6',
    prompt: loc('下面哪一个故障 MATS+ 漏检、March C− 检出？', 'Which fault does MATS+ miss but March C− catch?'),
    options: Q6_CHOICES.map((choice, index) => ({
      id: Q6_OPTION_IDS[index],
      text: choice.label,
    })),
    answer: Q6_OPTION_IDS[Q6_INDEX],
    explain: loc(
      `覆盖表由模型运行得到：这三个候选中，MATS+ 漏检、March C− 检出的是“${Q6_CHOICES[Q6_INDEX].label.zh}”。`,
      `The model’s coverage table shows that, of these three, the one MATS+ misses and March C− catches is “${en(Q6_CHOICES[Q6_INDEX].label)}”.`,
    ),
  },
]

/** 常见误区：文字只写机制，数字由模型或公式给出 */
export const MISCONCEPTIONS: LText[] = [
  loc(
    '算法越长越好，所以一律用 March C−。MATS+ 每单元 5 次，能抓到固定、地址与 TF↑；代价只有 March C− 的一半，要按故障类型和测试时间取舍。',
    'Longer is better, so always use March C−. MATS+ takes 5 operations per cell and catches stuck-at, address and TF↑ faults; it costs half as much as March C−, and the choice depends on fault types and test time.',
  ),
  loc(
    '干净阵列 PASS，就说明算法没有漏掉东西。PASS 只说明没有读错；注入 TF↓ 后 MATS+ 同样 PASS，那是漏检，不是通过。',
    'If the clean array passes, the algorithm misses nothing. A pass only means no read went wrong; with TF↓ injected, MATS+ also passes, and that is a miss, not a good part.',
  ),
  loc(
    '测试时间与单元数无关，所以 March C− 总是固定时间。它每单元 10 次操作，总时间 = 10 × 单元数，单元越多越慢。',
    'Test time does not depend on the cell count, so March C− always takes a fixed time. It makes 10 operations per cell, so the total is 10 × cell count and grows with the array.',
  ),
]

export const TAKEAWAY: LText = loc(
  'March 算法 = 若干元素，每个元素按地址方向对所有单元做一组读写。覆盖范围取决于跳变与耦合之后能不能被读回：MATS+（5n）抓到固定、地址与 TF↑，但漏掉 TF↓；March C−（10n）在两个方向都有读回，本页的预设故障全部抓到。代价是每单元操作次数翻倍。',
  'A March algorithm is a sequence of elements, each doing a group of reads and writes on every cell in an address direction. Coverage depends on whether transitions and couplings are read back afterwards: MATS+ (5n) catches stuck-at, address and TF↑ but misses TF↓; March C− (10n) reads back in both directions and catches every preset fault here, at twice the operations per cell.',
)

/** 元素的说明：算法的“一个元素”是什么 */
export const ELEMENT_NOTE = loc(
  '一个元素按地址顺序（或逆序）对每个单元做完一组操作，再进入下一个元素。',
  'An element runs its group of operations on each cell in address order (or reverse), then the next element starts.',
)

import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const SPECS: Array<{ name: string; limit: LText }> = [
  { name: 'VDD', limit: loc('3.3 V', '3.3 V') },
  { name: 'VIH / VIL', limit: loc('≥ 2.0 V / ≤ 0.8 V', '≥ 2.0 V / ≤ 0.8 V') },
  { name: 'VOH / VOL', limit: loc('≥ 2.4 V @ 8 mA / ≤ 0.4 V', '≥ 2.4 V @ 8 mA / ≤ 0.4 V') },
  { name: 'IDD', limit: loc('< 20 mA', '< 20 mA') },
  { name: 'tpd', limit: loc('< 8 ns', '< 8 ns') },
  { name: 'fMAX', limit: loc('100 MHz', '100 MHz') },
]

export const OPS = [
  { id: 0, name: 'ADD', code: '000' },
  { id: 1, name: 'AND', code: '001' },
  { id: 2, name: 'OR', code: '010' },
  { id: 3, name: 'XOR', code: '011' },
  { id: 4, name: 'SHL', code: '100' },
  { id: 5, name: 'SHR', code: '101' },
] as const

export type AluOut = { y: number; carry: number }

export function alu(a: number, b: number, op: number): AluOut {
  const A = a & 0xf
  const B = b & 0xf
  const sh = B & 3
  if (op === 0) {
    const s = A + B
    return { y: s & 0xf, carry: s >> 4 }
  }
  if (op === 1) return { y: A & B, carry: 0 }
  if (op === 2) return { y: A | B, carry: 0 }
  if (op === 3) return { y: A ^ B, carry: 0 }
  if (op === 4) {
    if (sh === 0) return { y: A, carry: 0 }
    return { y: (A << sh) & 0xf, carry: (A >> (4 - sh)) & 1 }
  }
  if (op === 5) {
    if (sh === 0) return { y: A, carry: 0 }
    return { y: A >> sh, carry: (A >> (sh - 1)) & 1 }
  }
  return { y: 0, carry: 0 }
}

export type FaultId = 'none' | 'op' | 'stuck' | 'strobe' | 'shift'

export const FAULTS: Array<{ id: FaultId; title: LText }> = [
  { id: 'none', title: loc('无注入', 'No fault') },
  { id: 'op', title: loc('ADD 做成了 AND', 'ADD behaves as AND') },
  { id: 'stuck', title: loc('Y[0] 粘 0', 'Y[0] stuck-at-0') },
  { id: 'strobe', title: loc('Strobe 过早，采到上一拍', 'Strobe too early: reads previous cycle') },
  { id: 'shift', title: loc('移位方向反了', 'Shift direction reversed') },
]

/** 芯片本身的输出（不含 Strobe 时序问题） */
export function aluWithFault(a: number, b: number, op: number, fault: FaultId): AluOut {
  const good = alu(a, b, op)
  if (fault === 'op' && op === 0) return alu(a, b, 1)
  if (fault === 'stuck') return { y: good.y & 0xe, carry: good.carry }
  if (fault === 'shift' && (op === 4 || op === 5)) return alu(a, b, op === 4 ? 5 : 4)
  return good
}

export type ItemId =
  | 'power'
  | 'dc'
  | 'add'
  | 'and'
  | 'or'
  | 'xor'
  | 'shl'
  | 'shr'
  | 'carry'
  | 'shiftCarry'
  | 'timing'

export const ITEMS: Array<{ id: ItemId; title: LText }> = [
  { id: 'power', title: loc('供电 / IDD', 'Power / IDD') },
  { id: 'dc', title: loc('DC：VIH 或 VOH@IOH', 'DC: VIH or VOH@IOH') },
  { id: 'add', title: loc('Functional：ADD', 'Functional: ADD') },
  { id: 'and', title: loc('Functional：AND', 'Functional: AND') },
  { id: 'or', title: loc('Functional：OR', 'Functional: OR') },
  { id: 'xor', title: loc('Functional：XOR', 'Functional: XOR') },
  { id: 'shl', title: loc('Functional：SHL', 'Functional: SHL') },
  { id: 'shr', title: loc('Functional：SHR', 'Functional: SHR') },
  { id: 'carry', title: loc('ADD 进位（0xF+0x1）', 'ADD carry (0xF+0x1)') },
  { id: 'shiftCarry', title: loc('移位移出位进 Carry', 'Shifted-out bit to Carry') },
  { id: 'timing', title: loc('Timing / tpd / fMAX', 'Timing / tpd / fMAX') },
]

export type VecId = 'add1' | 'addc' | 'and1' | 'or1' | 'xor1' | 'shl1' | 'shlc' | 'shr1' | 'shrc'

type Tag = 'add' | 'and' | 'or' | 'xor' | 'shl' | 'shr' | 'carry' | 'shift-carry'

export type BankVec = {
  id: VecId
  op: number
  a: number
  b: number
  tags: Tag[]
}

export const BANK: BankVec[] = [
  { id: 'add1', op: 0, a: 0x3, b: 0x1, tags: ['add'] },
  { id: 'addc', op: 0, a: 0xf, b: 0x1, tags: ['add', 'carry'] },
  { id: 'and1', op: 1, a: 0xc, b: 0xa, tags: ['and'] },
  { id: 'or1', op: 2, a: 0x1, b: 0x2, tags: ['or'] },
  { id: 'xor1', op: 3, a: 0x5, b: 0x3, tags: ['xor'] },
  { id: 'shl1', op: 4, a: 0x3, b: 0x1, tags: ['shl'] },
  { id: 'shlc', op: 4, a: 0x8, b: 0x1, tags: ['shl', 'shift-carry'] },
  { id: 'shr1', op: 5, a: 0x8, b: 0x1, tags: ['shr'] },
  { id: 'shrc', op: 5, a: 0x1, b: 0x1, tags: ['shr', 'shift-carry'] },
]

const TAG_NAME: Record<Tag, LText> = {
  add: loc('ADD', 'ADD'),
  and: loc('AND', 'AND'),
  or: loc('OR', 'OR'),
  xor: loc('XOR', 'XOR'),
  shl: loc('SHL', 'SHL'),
  shr: loc('SHR', 'SHR'),
  carry: loc('ADD 进位', 'ADD carry'),
  'shift-carry': loc('移出位', 'shifted-out bit'),
}

export const TPD = 8

/** 七步向导。ref 一句话点明这一步用的是前面哪一课。 */
export const STEPS: Array<{ id: number; title: LText; ref: LText; text: LText }> = [
  {
    id: 1,
    title: loc('读 Datasheet', 'Read the datasheet'),
    ref: loc('对应 {@spec}：每个数字后面都要有一个测试项去证明。', 'From {@spec}: every number needs a test that proves it.'),
    text: loc('先看这几行规格。后面每一步都要能指回这里。', 'Read these specs first. Every later step must trace back here.'),
  },
  {
    id: 2,
    title: loc('列出 Test Items', 'List the test items'),
    ref: loc('对应 {@program}：测试程序就是一串按顺序执行的测试项。', 'From {@program}: a test program is an ordered list of tests.'),
    text: loc('全部勾上才算完整。移位和进位最容易漏。', 'Select every one. Shift and carry are the easiest to miss.'),
  },
  {
    id: 3,
    title: loc('设计 Test Vector', 'Design test vectors'),
    ref: loc('对应 {@vector}：每行向量 = 输入 + 期望输出。', 'From {@vector}: each vector row = inputs + expected outputs.'),
    text: loc('六种 OP 各至少一条；ADD 要有进位；移位要有移出位。', 'At least one row per OP; ADD must carry; shifts must shift a bit out.'),
  },
  {
    id: 4,
    title: loc('设计 Timing', 'Set the timing'),
    ref: loc('对应 {@timing}：Strobe 必须落在输出稳定之后、周期结束之前。', 'From {@timing}: the strobe must fall after the output settles and before the cycle ends.'),
    text: loc('拖动 Period / Drive / Strobe，图和数字一起变。', 'Drag Period / Drive / Strobe; the waveform follows.'),
  },
  {
    id: 5,
    title: loc('设计 DC', 'Set a DC test'),
    ref: loc('对应 {@dc}：用 PMU 加一个量、测另一个量，再和规格比。', 'From {@dc}: the PMU forces one quantity, measures another, compares to the spec.'),
    text: loc('选一项，并能说清 Force 什么、Measure 什么。', 'Pick one and be able to say what is forced and what is measured.'),
  },
  {
    id: 6,
    title: loc('运行 Functional', 'Run the functional test'),
    ref: loc('对应 {@func}：每一拍 Drive 输入，到 Strobe 时刻比较输出。', 'From {@func}: each cycle drives inputs and compares outputs at the strobe.'),
    text: loc('一拍一拍看：输入、期望、实际、Pass/Fail。用的是第 3 步的向量和第 4 步的 Timing。', 'Step cycle by cycle: inputs, expected, actual, pass/fail. Uses the vectors from step 3 and the timing from step 4.'),
  },
  {
    id: 7,
    title: loc('注入故障并定位', 'Inject a fault and locate it'),
    ref: loc('对应 {@program}：排错从失败行的规律开始。', 'From {@program}: debugging starts from the pattern of failing rows.'),
    text: loc('选一种故障，向量立刻重跑。只看红行的规律选根因。', 'Pick a fault; the vectors rerun at once. Choose the root cause from the failing rows only.'),
  },
]

export const DC_CHOICES: Array<{ id: string; title: LText; how: LText }> = [
  {
    id: 'vih',
    title: loc('测 VIH：输入给 2.0 V，功能仍按 1 判', 'VIH: drive inputs at 2.0 V; function must still read 1'),
    how: loc(
      'Force：输入高电平只给 2.0 V（VIH 下限）。Measure：功能向量是否仍全 Pass。这是用功能结果来判一个 DC 门限。',
      'Force: input high level at only 2.0 V (VIH min). Measure: do the functional vectors still all pass? A DC threshold judged by functional results.',
    ),
  },
  {
    id: 'voh',
    title: loc('测 VOH@IOH：输出为 1 时拉 8 mA，电压 ≥ 2.4 V', 'VOH@IOH: output high, load 8 mA, voltage ≥ 2.4 V'),
    how: loc(
      'Force：先用向量把 Y 置 1，PMU 从该脚拉 8 mA（IOH）。Measure：脚上电压，≥ 2.4 V 才 Pass。',
      'Force: a vector sets Y high, then the PMU draws 8 mA (IOH) out of the pin. Measure: pin voltage; pass if ≥ 2.4 V.',
    ),
  },
]

export function hex4(n: number): string {
  return `0x${(n & 0xf).toString(16).toUpperCase()}`
}

export type RunRow = {
  row: BankVec
  exp: AluOut
  got: AluOut
  pass: boolean
  /** 这一拍采到的是上一拍的旧值 */
  stale: boolean
}

/**
 * 按向量顺序逐拍执行。Strobe 早于输出稳定时，Tester 采到的是上一拍留下的输出；
 * 第一拍之前输出按复位值 0 处理。
 */
export function runVectors(selected: VecId[], fault: FaultId, early: boolean): RunRow[] {
  const rows = BANK.filter((row) => selected.includes(row.id))
  const stale = early || fault === 'strobe'
  let prev: AluOut = { y: 0, carry: 0 }
  return rows.map((row) => {
    const exp = alu(row.a, row.b, row.op)
    const real = aluWithFault(row.a, row.b, row.op, fault)
    const got = stale ? prev : real
    prev = real
    return { row, exp, got, stale, pass: got.y === exp.y && got.carry === exp.carry }
  })
}

export const TAKEAWAY = loc(
  '闭环：规格 → 测试项 → 向量 → Timing / DC → 逐拍运行 → 注入故障，从失败行的规律找根因。',
  'The loop: specs → test items → vectors → timing / DC → run cycle by cycle → inject a fault and find the cause from the failing rows.',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么 ADD 必须包含 0xF + 0x1？', 'Why must ADD include 0xF + 0x1?'),
    options: [
      { id: 'pretty', text: loc('数字好看', 'The numbers look nice') },
      { id: 'carry', text: loc('只有溢出才能测到 Carry：Y 回到 0，Carry = 1', 'Only an overflow exercises Carry: Y wraps to 0, Carry = 1') },
      { id: 'scan', text: loc('这是扫描链长度', 'It is the scan chain length') },
      { id: 'vdd', text: loc('这样才能供电', 'It is needed to power the chip') },
    ],
    answer: 'carry',
    explain: loc('3+1 只覆盖加法本身，不碰 Carry。进位位必须有一条向量去激活它。', '3+1 never touches Carry. The carry bit needs a vector that activates it.'),
  },
  {
    id: 'q2',
    prompt: loc('漏测 SHL / SHR 为什么不行？', 'Why is skipping SHL / SHR not acceptable?'),
    options: [
      { id: 'ok', text: loc('OP 表有六种操作，移位还会把移出位送进 Carry，不测就是漏项', 'The OP table has six operations and shifts drive Carry; skipping them leaves gaps') },
      { id: 'same', text: loc('移位就是 ADD', 'A shift is the same as ADD') },
      { id: 'dc', text: loc('移位属于开短路测试', 'Shifts belong to opens/shorts') },
      { id: 'opt', text: loc('可选，不影响交货', 'Optional; it does not affect shipment') },
    ],
    answer: 'ok',
    explain: loc('规格书里的每个功能都要有向量覆盖。“移位方向反了”这种故障只有移位向量能抓到。', 'Every function in the datasheet needs vector coverage. A reversed shift is caught only by shift vectors.'),
  },
  {
    id: 'q3',
    prompt: loc('Strobe 早于 Drive + tpd 时，好芯片的运行结果会怎样？', 'If the strobe comes before Drive + tpd, what happens on a good chip?'),
    options: [
      { id: 'pass', text: loc('仍然全 Pass', 'Still all pass') },
      { id: 'fail', text: loc('会 Fail：每一拍采到的是上一拍的旧输出', 'It fails: each cycle reads the previous cycle\'s output') },
      { id: 'latch', text: loc('一定 Latch-up', 'It always latches up') },
      { id: 'bin', text: loc('只改 Bin 颜色', 'Only the bin color changes') },
    ],
    answer: 'fail',
    explain: loc('输出还没变完就去比较，采到的是上一拍留下的值。新旧值碰巧相同的行才会 Pass。', 'Comparing before the output settles reads the old value. Only rows whose old and new values happen to match will pass.'),
  },
  {
    id: 'q4',
    prompt: loc('只有 ADD 的两行 Fail，其它 OP 全 Pass，最可能的根因是？', 'Only the two ADD rows fail; every other OP passes. Most likely cause?'),
    options: [
      { id: 'op', text: loc('ADD 这条运算路径坏了（例如被做成 AND）', 'The ADD path is broken (e.g. it behaves as AND)') },
      { id: 'y0', text: loc('Y[0] 粘 0', 'Y[0] stuck-at-0') },
      { id: 'vdd', text: loc('电源没接', 'No power') },
      { id: 'strobe', text: loc('Strobe 太早', 'Strobe too early') },
    ],
    answer: 'op',
    explain: loc('粘死位和时序问题会跨 OP 出现；只在一种 OP 上失败，说明问题在那条运算路径。', 'Stuck bits and timing errors show up across OPs. Failures on one OP only point to that operation path.'),
  },
]

/** 列举分隔符 */
const SEP = { zh: loc('、', ', ').zh, en: ', ' }

export function judgeItems(selected: ItemId[]): { ok: boolean; text: LText } {
  const miss = ITEMS.filter((item) => !selected.includes(item.id))
  if (miss.length === 0) {
    return {
      ok: true,
      text: loc('项目单完整：供电、DC、六种 OP、进位、移出位、Timing 都在。', 'Complete: power, DC, six OPs, carry, shifted-out bit and timing are all there.'),
    }
  }
  const zh = miss.map((item) => item.title.zh).join(SEP.zh)
  const en = miss.map((item) => item.title.en ?? item.title.zh).join(SEP.en)
  return { ok: false, text: loc(`还漏：${zh}。`, `Still missing: ${en}.`) }
}

export function judgeVectors(selected: VecId[]): { ok: boolean; text: LText } {
  const rows = BANK.filter((row) => selected.includes(row.id))
  const has = (tag: Tag) => rows.some((row) => row.tags.includes(tag))
  const need: Tag[] = ['add', 'and', 'or', 'xor', 'shl', 'shr', 'carry', 'shift-carry']
  const miss = need.filter((tag) => !has(tag))
  if (miss.length === 0) {
    return { ok: true, text: loc('覆盖了六种 OP、ADD 进位和移出位。', 'Covers all six OPs, ADD carry and the shifted-out bit.') }
  }
  const zh = miss.map((tag) => TAG_NAME[tag].zh).join(SEP.zh)
  const en = miss.map((tag) => TAG_NAME[tag].en ?? TAG_NAME[tag].zh).join(SEP.en)
  return { ok: false, text: loc(`还缺：${zh}。`, `Still missing: ${en}.`) }
}

export type TimingVerdict = 'ok' | 'early' | 'late'

export function judgeTiming(period: number, strobe: number, drive = 0): { ok: boolean; kind: TimingVerdict; text: LText } {
  const settle = drive + TPD
  if (strobe < settle) {
    return {
      ok: false,
      kind: 'early',
      text: loc(
        `Strobe ${strobe} ns 早于 Drive + tpd = ${settle} ns：采到上一拍的旧值，好芯片也会 Fail。`,
        `Strobe ${strobe} ns is before Drive + tpd = ${settle} ns: it reads the previous value, so even a good chip fails.`,
      ),
    }
  }
  if (strobe >= period) {
    return {
      ok: false,
      kind: 'late',
      text: loc('Strobe 不能落在周期之外。加长 Period 或把 Strobe 往前拉。', 'The strobe must stay inside the cycle. Lengthen the period or move the strobe earlier.'),
    }
  }
  return {
    ok: true,
    kind: 'ok',
    text: loc(
      `窗口成立：Drive ${drive} → 稳定 ${settle} → Strobe ${strobe} → Period ${period} ns。`,
      `Window OK: Drive ${drive} → settled ${settle} → Strobe ${strobe} → Period ${period} ns.`,
    ),
  }
}

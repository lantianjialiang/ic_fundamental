import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const SPECS: Array<{ name: string; limit: LText }> = [
  { name: 'VDD', limit: loc('3.3 V') },
  { name: 'VIH / VIL', limit: loc('≥ 2.0 V / ≤ 0.8 V') },
  { name: 'VOH / VOL', limit: loc('≥ 2.4 V @ 8 mA / ≤ 0.4 V') },
  { name: 'IDD', limit: loc('< 20 mA') },
  { name: 'tpd', limit: loc('< 8 ns') },
  { name: 'fMAX', limit: loc('100 MHz') },
]

export const OPS = [
  { id: 0, name: 'ADD', code: '000' },
  { id: 1, name: 'AND', code: '001' },
  { id: 2, name: 'OR', code: '010' },
  { id: 3, name: 'XOR', code: '011' },
  { id: 4, name: 'SHL', code: '100' },
  { id: 5, name: 'SHR', code: '101' },
] as const

export function alu(a: number, b: number, op: number): { y: number; carry: number } {
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
  { id: 'none', title: loc('无注入') },
  { id: 'op', title: loc('ADD 做成了 AND') },
  { id: 'stuck', title: loc('Y[0] 粘 0') },
  { id: 'strobe', title: loc('Strobe 过早，采到旧 0') },
  { id: 'shift', title: loc('移位方向反了') },
]

export function aluWithFault(a: number, b: number, op: number, fault: FaultId): { y: number; carry: number } {
  const good = alu(a, b, op)
  if (fault === 'op' && op === 0) return alu(a, b, 1)
  if (fault === 'stuck') return { y: good.y & 0xe, carry: good.carry }
  if (fault === 'shift' && (op === 4 || op === 5)) return alu(a, b, op === 4 ? 5 : 4)
  if (fault === 'strobe') return { y: 0, carry: 0 }
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

export const ITEMS: Array<{ id: ItemId; title: LText; required: boolean }> = [
  { id: 'power', title: loc('供电 / IDD'), required: true },
  { id: 'dc', title: loc('DC：VIH 或 VOH@IOH'), required: true },
  { id: 'add', title: loc('Functional：ADD'), required: true },
  { id: 'and', title: loc('Functional：AND'), required: true },
  { id: 'or', title: loc('Functional：OR'), required: true },
  { id: 'xor', title: loc('Functional：XOR'), required: true },
  { id: 'shl', title: loc('Functional：SHL'), required: true },
  { id: 'shr', title: loc('Functional：SHR'), required: true },
  { id: 'carry', title: loc('ADD 进位（0xF+0x1）'), required: true },
  { id: 'shiftCarry', title: loc('移位移出位进 Carry'), required: true },
  { id: 'timing', title: loc('Timing / tpd / fMAX'), required: true },
]

export type VecId = 'add1' | 'addc' | 'and1' | 'or1' | 'xor1' | 'shl1' | 'shlc' | 'shr1' | 'shrc'

export type BankVec = {
  id: VecId
  op: number
  a: number
  b: number
  tags: string[]
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

export const TPD = 8

export const STEPS: Array<{ id: number; title: LText; text: LText }> = [
  { id: 1, title: loc('读 Datasheet'), text: loc('点规格。后面每一步都要能指回这里。') },
  { id: 2, title: loc('列出 Test Items'), text: loc('漏测移位或进位要判错：那是这颗 ALU 的教学要点。') },
  { id: 3, title: loc('设计 Test Vector'), text: loc('六种 OP 各至少一条；ADD 含进位；移位含移出位。') },
  { id: 4, title: loc('设计 Timing'), text: loc('Period、Drive、Strobe。Strobe 必须晚于 tpd。') },
  { id: 5, title: loc('设计 DC'), text: loc('VIH 或 VOH@IOH 做一项即可，条件要写清。') },
  { id: 6, title: loc('运行 Functional'), text: loc('看哪一条 vector Fail。') },
  { id: 7, title: loc('注入 Fault'), text: loc('某 OP 错、某 bit 粘 0、Strobe 过早、移位方向反了。') },
  { id: 8, title: loc('分析根因'), text: loc('对照失败向量选原因。') },
]

export const DC_CHOICES: Array<{ id: string; title: LText }> = [
  { id: 'vih', title: loc('测 VIH：输入赶到 2.0 V，看功能仍按 1') },
  { id: 'voh', title: loc('测 VOH@IOH：输出为 1 时拉 8 mA，电压 ≥ 2.4 V') },
]

export function hex4(n: number): string {
  return `0x${(n & 0xf).toString(16).toUpperCase()}`
}

export const TAKEAWAY = loc(
  '闭环是：规格 → 项目 → 向量 → Timing / DC → 跑起来 → 注入故障 → 对失败向量说话。不必手写某家 API。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么 ADD 必须包含 0xF + 0x1？'),
    options: [
      { id: 'pretty', text: loc('数字好看') },
      { id: 'carry', text: loc('只有溢出才能测到 Carry，Y 回 0') },
      { id: 'scan', text: loc('这是扫描链长度') },
      { id: 'vdd', text: loc('这样才能供电') },
    ],
    answer: 'carry',
    explain: loc('3+1 只覆盖加法本身。进位是独立的教学要点。'),
  },
  {
    id: 'q2',
    prompt: loc('漏测 SHL / SHR 为什么不行？'),
    options: [
      { id: 'ok', text: loc('OP 表有六种操作，移位还带着移出位，不测就是漏项') },
      { id: 'same', text: loc('移位就是 ADD') },
      { id: 'dc', text: loc('移位属于 Continuity') },
      { id: 'opt', text: loc('可选，不影响交货') },
    ],
    answer: 'ok',
    explain: loc('综合项目要求六种 OP 闭环。漏移位等于没测完整功能。'),
  },
  {
    id: 'q3',
    prompt: loc('Strobe 早于 tpd 时，运行结果会怎样？'),
    options: [
      { id: 'pass', text: loc('仍然全 Pass') },
      { id: 'fail', text: loc('好的 ALU 也会 Fail，像采到旧值') },
      { id: 'latch', text: loc('一定 Latch-up') },
      { id: 'bin', text: loc('只改 Bin 颜色') },
    ],
    answer: 'fail',
    explain: loc('回扣 Timing 课。注入 “Strobe 过早” 就是在演这一条。'),
  },
  {
    id: 'q4',
    prompt: loc('综合项目结束时要交什么作业？'),
    options: [
      { id: 'file', text: loc('导出 Tester 源码和 PDF') },
      { id: 'none', text: loc('不用交。每步当场判对错并解释') },
      { id: 'chip', text: loc('交一颗真芯片') },
      { id: 'api', text: loc('默写某家 API') },
    ],
    answer: 'none',
    explain: loc('软件提供向导。意图对了就过关。'),
  },
]

export function judgeItems(selected: ItemId[]): { ok: boolean; text: LText } {
  const miss = ITEMS.filter((item) => item.required && !selected.includes(item.id))
  if (miss.length === 0) {
    return { ok: true, text: loc('项目单完整：供电、DC、六种 OP、进位、移出位、Timing 都在。') }
  }
  const names = miss.map((item) => item.title.zh).join('、')
  return {
    ok: false,
    text: loc(`还漏：${names}。移位和进位是这颗 ALU 必须测的，不是可选项。`),
  }
}

export function judgeVectors(selected: VecId[]): { ok: boolean; text: LText } {
  const rows = BANK.filter((row) => selected.includes(row.id))
  const has = (tag: string) => rows.some((row) => row.tags.includes(tag))
  const need = ['add', 'and', 'or', 'xor', 'shl', 'shr', 'carry', 'shift-carry']
  const miss = need.filter((tag) => !has(tag))
  if (miss.length === 0) {
    return { ok: true, text: loc('向量覆盖了六种 OP、ADD 进位和移位移出。') }
  }
  return { ok: false, text: loc(`还缺：${miss.join('、')}。`) }
}

export function judgeTiming(period: number, strobe: number): { ok: boolean; text: LText } {
  if (strobe < TPD) {
    return { ok: false, text: loc('Strobe 早于 tpd，好芯片也会 Fail。往后拖。') }
  }
  if (strobe >= period) {
    return { ok: false, text: loc('Strobe 落到下一拍去了。Period 要长过采样点。') }
  }
  return { ok: true, text: loc('窗口成立：Drive 在拍首，Strobe 在 tpd 之后、Period 之前。') }
}

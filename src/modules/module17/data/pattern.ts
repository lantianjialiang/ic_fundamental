import { loc, type LText } from '../../../i18n/locale'
import { BANK, OPS, alu, hex4, type BankVec } from '../../module15/data/content'

export type StuckId = 'none' | 'add_and' | 'y0_0' | 'y0_1' | 'y3_1' | 'c0' | 'a0_1'

export function bin4(n: number): string {
  return (n & 0xf).toString(2).padStart(4, '0')
}

export const STUCKS: Array<{ id: StuckId; title: LText; hint: LText }> = [
  {
    id: 'none',
    title: loc('无故障', 'No fault'),
    hint: loc('好电路，勾过的向量应全 Pass。', 'A good circuit: every selected vector should pass.'),
  },
  {
    id: 'add_and',
    title: loc('ADD 做成了 AND', 'ADD behaves as AND'),
    hint: loc(
      'OP=ADD 时按 AND 算。例：A=0011 B=0001，期望 Y=0100，实测 Y=0001。其它 OP 不受影响。',
      'When OP=ADD it computes AND. E.g. A=0011 B=0001: expected Y=0100, actual Y=0001. Other OPs are unaffected.',
    ),
  },
  {
    id: 'y0_0',
    title: loc('Y[0] stuck-at-0', 'Y[0] stuck-at-0'),
    hint: loc('最右一位永远是 0。期望 …1 的行会 Fail，例：期望 0011，实测 0010。', 'The rightmost bit is always 0. Rows expecting …1 fail, e.g. expected 0011, actual 0010.'),
  },
  {
    id: 'y0_1',
    title: loc('Y[0] stuck-at-1', 'Y[0] stuck-at-1'),
    hint: loc('最右一位永远是 1。期望 …0 的行会 Fail，例：期望 0100，实测 0101。', 'The rightmost bit is always 1. Rows expecting …0 fail, e.g. expected 0100, actual 0101.'),
  },
  {
    id: 'y3_1',
    title: loc('Y[3] stuck-at-1', 'Y[3] stuck-at-1'),
    hint: loc('最左一位永远是 1。例：期望 0000，实测 1000。', 'The leftmost bit is always 1. E.g. expected 0000, actual 1000.'),
  },
  {
    id: 'c0',
    title: loc('Carry stuck-at-0', 'Carry stuck-at-0'),
    hint: loc('进位粘 0。1111+0001 期望 Y=0000 C=1，实测 C=0；Y 四位仍然对。', 'Carry stuck at 0. 1111+0001 expects Y=0000 C=1 but reads C=0; the four Y bits are still right.'),
  },
  {
    id: 'a0_1',
    title: loc('A[0] stuck-at-1', 'A[0] stuck-at-1'),
    hint: loc(
      '输入 A 最右一位粘 1：A=0010 进芯片后变成 0011。故障在输入，但只能从输出 Y 看出来。',
      'Input A\'s rightmost bit is stuck at 1: A=0010 enters the chip as 0011. The fault is on an input but is only visible at output Y.',
    ),
  },
]

export function applyStuck(a: number, b: number, op: number, stuck: StuckId): { y: number; carry: number } {
  if (stuck === 'add_and' && op === 0) return alu(a, b, 1)
  const A = stuck === 'a0_1' ? a | 1 : a
  const good = alu(A, b, op)
  if (stuck === 'y0_0') return { y: good.y & 0xe, carry: good.carry }
  if (stuck === 'y0_1') return { y: good.y | 0x1, carry: good.carry }
  if (stuck === 'y3_1') return { y: good.y | 0x8, carry: good.carry }
  if (stuck === 'c0') return { y: good.y, carry: 0 }
  return good
}

export function runBank(selected: string[], stuck: StuckId) {
  return BANK.filter((row) => selected.includes(row.id)).map((row) => {
    const exp = alu(row.a, row.b, row.op)
    const got = applyStuck(row.a, row.b, row.op, stuck)
    return {
      row,
      exp,
      got,
      pass: got.y === exp.y && got.carry === exp.carry,
      label: `${OPS[row.op].name} A=${bin4(row.a)} B=${bin4(row.b)}`,
    }
  })
}

export { BANK, OPS, alu, hex4 }
export type { BankVec }

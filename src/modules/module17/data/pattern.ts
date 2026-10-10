import { loc, type LText } from '../../../i18n/locale'
import { BANK, OPS, alu, hex4, type BankVec } from '../../module15/data/content'

export type StuckId = 'none' | 'add_and' | 'y0_0' | 'y0_1' | 'y3_1' | 'c0' | 'a0_1'

export function bin4(n: number): string {
  return (n & 0xf).toString(2).padStart(4, '0')
}

export const STUCKS: Array<{ id: StuckId; title: LText; hint: LText }> = [
  {
    id: 'none',
    title: loc('无故障'),
    hint: loc('好电路。Y 写成四位二进制 Y[3]Y[2]Y[1]Y[0]，最右边是 Y[0]。勾过的向量应全 Pass。'),
  },
  {
    id: 'add_and',
    title: loc('ADD 做成了 AND'),
    hint: loc('OP=ADD 时按 AND 算。例：A=0011 B=0001，期望 Y=0100 C=0（加法），实测 Y=0001 C=0（按位与）。其它 OP 不受影响。'),
  },
  {
    id: 'y0_0',
    title: loc('Y[0] stuck-at-0'),
    hint: loc('Y 最右边那位永远是 0。期望 …1 的会 Fail。例：期望 0011，实测 0010（只有 Y[0] 被掐掉）。'),
  },
  {
    id: 'y0_1',
    title: loc('Y[0] stuck-at-1'),
    hint: loc('Y 最右边那位永远是 1。期望 …0 的会 Fail。例：期望 0100，实测 0101（Y[0] 被拉高）。'),
  },
  {
    id: 'y3_1',
    title: loc('Y[3] stuck-at-1'),
    hint: loc('Y 最左边那位永远是 1。例：期望 0000，实测 1000（只有 Y[3] 被拉高）。'),
  },
  {
    id: 'c0',
    title: loc('Carry stuck-at-0'),
    hint: loc('进位这一位粘 0。1111+0001 期望 Y=0000 C=1，实测 C=0。Y 的四位可以是对的。'),
  },
  {
    id: 'a0_1',
    title: loc('A[0] stuck-at-1'),
    hint: loc('输入 A 最右边粘 1。A=0010 变成 0011 再运算。例：ADD A=0010 B=0001 期望 Y=0011，实测按 A=0011 得到 Y=0100。'),
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

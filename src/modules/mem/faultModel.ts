/**
 * 存储器故障注入模型（MEM-03）。纯函数，不含界面文字。
 * 阵列：单 Bank，64 个单元，逻辑地址即物理单元（不做映射），单元编号 = row·8 + col。
 * 故障由 core/array.ts 的 Fault 描述，运行时用 runAccesses 逐次读写仿真；
 * 测试序列是 March C−（core/march.ts），展开后每次读都和期望值比较。
 * 判定：只要有一次读出与期望不符，就判 FAIL（故障被检出）。
 */
import { type Fault, type RunResult, runAccesses } from './core/array'
import { MARCH_C_MINUS, expandMarch } from './core/march'

/** 阵列为 8 列；单元编号 = row·8 + col，共 8 × 8 = 64 个单元 */
export const COLS = 8
export const SIZE = COLS * COLS

export type FaultKind = 'SAF0' | 'SAF1' | 'TFU' | 'TFD' | 'CFIN' | 'CFID' | 'AFNA' | 'AFAL'

/** 故障类型选项，显示顺序即数组顺序；默认取 [0] */
export const FAULT_KINDS: FaultKind[] = ['SAF0', 'SAF1', 'TFU', 'TFD', 'CFIN', 'CFID', 'AFNA', 'AFAL']

/** 需要两个单元（侵害 / 受害，或地址 / 别名目标）的故障 */
export const TWO_CELL: FaultKind[] = ['CFIN', 'CFID', 'AFAL']

export type FaultState = {
  kind: FaultKind
  /** 注入单元：固定故障的单元；耦合的侵害单元；地址故障的地址 */
  cell: number
  /** 受害单元（耦合）或别名目标（AF_ALIAS）；单单元故障时不用 */
  victim: number
}

export const DEFAULT_FAULT: FaultState = { kind: FAULT_KINDS[0], cell: 18, victim: 19 }

export type Injection = {
  faults: Fault[]
  /** 受害单元 / 别名目标；单单元故障时为 null */
  victim: number | null
  /** 受害单元与侵害单元相同，已自动改为下一个单元 */
  adjusted: boolean
}

/** 把界面上的选择变成 Fault 列表。耦合与别名要求两个不同的单元，相同时改用下一个单元 */
export function injectionOf(state: FaultState): Injection {
  const two = TWO_CELL.includes(state.kind)
  const adjusted = two && state.victim === state.cell
  const victim = adjusted ? (state.cell + 1) % SIZE : state.victim
  const c = state.cell
  switch (state.kind) {
    case 'SAF0':
      return { faults: [{ kind: 'SAF', cell: c, value: 0 }], victim: null, adjusted: false }
    case 'SAF1':
      return { faults: [{ kind: 'SAF', cell: c, value: 1 }], victim: null, adjusted: false }
    case 'TFU':
      return { faults: [{ kind: 'TF', cell: c, rising: true }], victim: null, adjusted: false }
    case 'TFD':
      return { faults: [{ kind: 'TF', cell: c, rising: false }], victim: null, adjusted: false }
    case 'CFIN':
      return { faults: [{ kind: 'CFIN', aggressor: c, victim, rising: true }], victim, adjusted }
    case 'CFID':
      return { faults: [{ kind: 'CFID', aggressor: c, victim, rising: true, value: 1 }], victim, adjusted }
    case 'AFNA':
      return { faults: [{ kind: 'AF_NOACCESS', addr: c }], victim: null, adjusted: false }
    case 'AFAL':
      return { faults: [{ kind: 'AF_ALIAS', addr: c, target: victim }], victim, adjusted }
  }
}

/** 用 March C− 跑一遍整个阵列 */
export function runInjection(inj: Injection): RunResult {
  return runAccesses(expandMarch(MARCH_C_MINUS, SIZE), SIZE, inj.faults)
}

/** 第 step 次操作（从 0 起）属于 March C− 的第几个元素（从 0 起） */
export function elementIndexOf(step: number): number {
  let remaining = step
  for (let i = 0; i < MARCH_C_MINUS.elements.length; i += 1) {
    const count = MARCH_C_MINUS.elements[i].ops.length * SIZE
    if (remaining < count) {
      return i
    }
    remaining -= count
  }
  return MARCH_C_MINUS.elements.length - 1
}

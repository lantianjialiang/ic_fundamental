/**
 * 存储器地址译码模型（MEM-01）。纯函数，不含界面文字。
 * 阵列：2 个 Bank，每个 Bank 是 8 行 × 8 列的单元阵列，共 128 个单元，地址 7 位 a6…a0。
 * a6 选 Bank；a5–a3 与 a2–a0 各是一段 3 位地址。
 * - 线性映射：a5–a3 为行，a2–a0 为列：addr = bank·64 + row·8 + col。
 * - 交错映射：两段地址位互换，a2–a0 为行，a5–a3 为列：addr = bank·64 + col·8 + row。
 * 单元编号：Bank 内为 row·C + col（C = 8）；全局为 bank·64 + row·8 + col。
 * 线性映射下全局单元编号就是地址；交错映射下二者不同，相邻地址的物理位置随之改变。
 */

export const BANKS = 2
export const ROWS = 8
export const COLS = 8
export const PER_BANK = ROWS * COLS
export const SIZE = BANKS * PER_BANK

export type Mapping = 'linear' | 'interleaved'

/** 映射选项，显示顺序即数组顺序；默认取 [0] */
export const MAPPINGS: Mapping[] = ['linear', 'interleaved']

export type StructureState = {
  addr: number
  mapping: Mapping
}

export const DEFAULT_STRUCTURE: StructureState = { addr: 0, mapping: MAPPINGS[0] }

export type Cell = { bank: number; row: number; col: number }

/** 地址 → Cell（Bank、行、列） */
export function decode(addr: number, mapping: Mapping): Cell {
  const bank = (addr >> 6) & 1
  const high = (addr >> 3) & 7
  const low = addr & 7
  if (mapping === 'linear') {
    return { bank, row: high, col: low }
  }
  return { bank, row: low, col: high }
}

/** Cell → 地址，是 decode 的逆运算 */
export function encode(cell: Cell, mapping: Mapping): number {
  const inBank = mapping === 'linear' ? cell.row * COLS + cell.col : cell.col * COLS + cell.row
  return cell.bank * PER_BANK + inBank
}

/** 全局物理单元编号：bank·64 + row·8 + col */
export function cellIndex(cell: Cell): number {
  return cell.bank * PER_BANK + cell.row * COLS + cell.col
}

export type Field = 'bank' | 'row' | 'col'

/** 第 bit 位（0 为最低位）属于哪一个字段 */
export function fieldOfBit(bit: number, mapping: Mapping): Field {
  if (bit === 6) {
    return 'bank'
  }
  if (bit >= 3) {
    return mapping === 'linear' ? 'row' : 'col'
  }
  return mapping === 'linear' ? 'col' : 'row'
}

export type StructureAnalysis = {
  cell: Cell
  /** 全局物理单元编号 */
  index: number
  /** 相邻地址 addr+1；已是最后一个地址时为 null */
  nextAddr: number | null
  /** addr+1 所在的 Cell；没有相邻地址时为 null */
  next: Cell | null
  /** 同一 Bank 时：行差、列差与曼哈顿距离（单元数）；跨 Bank 或没有相邻地址时为 null */
  rowStep: number | null
  colStep: number | null
  dist: number | null
}

export function analyseStructure(state: StructureState): StructureAnalysis {
  const cell = decode(state.addr, state.mapping)
  const index = cellIndex(cell)
  if (state.addr + 1 >= SIZE) {
    return { cell, index, nextAddr: null, next: null, rowStep: null, colStep: null, dist: null }
  }
  const nextAddr = state.addr + 1
  const next = decode(nextAddr, state.mapping)
  if (next.bank !== cell.bank) {
    return { cell, index, nextAddr, next, rowStep: null, colStep: null, dist: null }
  }
  const rowStep = Math.abs(next.row - cell.row)
  const colStep = Math.abs(next.col - cell.col)
  return { cell, index, nextAddr, next, rowStep, colStep, dist: rowStep + colStep }
}

/**
 * BIST、冗余修复与 ECC 的教学模型（MEM-09，纯函数）。
 *
 * 阵列：16 行 × 8 列 = 128 个单元。一行就是一个 8 位的字（N = 8）。
 * 逻辑地址 = 行 × 8 + 列，物理位置与逻辑地址一一对应（教学简化，不建模地址扰乱）。
 *
 * BIST：对阵列跑 March C−（runMarch），把 failAddrs 换算成（行，列），得到失效位图。
 * 冗余：2 条备用行 + 2 条备用列，用 allocateRepair 贪心分配。
 * 修复后的模型：被替换的行或列上的所有故障去掉（备用单元是好的），再跑一遍 March C−，得到残留失效位。
 * ECC（SEC-DED，教学简化）：每字 8 位，1 位错误可纠正，2 位错误可检测、不能纠正；
 * 3 位及以上一律记为不可纠正（真实器件中可能被误纠正或漏检，这里不展开）。ECC 校验位本身的失效不建模。
 */
import { type Fault } from './core/array'
import { MARCH_C_MINUS, runMarch } from './core/march'

export const ROWS = 16
export const COLS = 8
export const CELLS = ROWS * COLS
export const SPARE_ROWS = 2
export const SPARE_COLS = 2

/** 失效位在阵列中的位置 */
export type Cell = { row: number; col: number }

/** 样品：A 单点、B 整列、C 散点（修复后残留 1 位）、D 同字双位（修复后残留 2 位） */
export const SAMPLE_IDS = ['single', 'column', 'scatter', 'double'] as const
export type SampleId = (typeof SAMPLE_IDS)[number]

/** ECC 开关：显示顺序即数组顺序，默认取 [0] */
export const ECC_IDS = ['off', 'on'] as const
export type EccId = (typeof ECC_IDS)[number]

export type BistState = { sample: SampleId; ecc: EccId }

export const DEFAULT_BIST: BistState = { sample: SAMPLE_IDS[0], ecc: ECC_IDS[0] }

const at = (row: number, col: number): number => row * COLS + col
const saf = (row: number, col: number, value: 0 | 1): Fault => ({ kind: 'SAF', cell: at(row, col), value })

/**
 * 四个样品的物理故障（只用固定故障 SAF，每个坏单元都会被 March C− 读出来）。
 * - single：一个单点，一条备用行就能替换。
 * - column：第 5 列的 3 个单元同时坏，替换整列即可。
 * - scatter：贪心分配后，只剩第 6 行第 5 列 1 位残留，ECC 可以纠正。
 * - double：贪心分配后，第 14 行剩下 2 位错误，ECC 只能检测。
 */
export const SAMPLE_FAULTS: Record<SampleId, Fault[]> = {
  single: [saf(4, 3, 1)],
  column: [saf(2, 5, 0), saf(7, 5, 0), saf(11, 5, 0)],
  scatter: [saf(3, 1, 1), saf(3, 6, 0), saf(12, 0, 1), saf(12, 7, 0), saf(9, 4, 1), saf(14, 2, 0), saf(6, 5, 1)],
  double: [
    saf(3, 1, 1),
    saf(3, 6, 0),
    saf(9, 4, 1),
    saf(9, 5, 0),
    saf(14, 2, 0),
    saf(14, 3, 1),
    saf(0, 0, 1),
    saf(5, 0, 0),
    saf(10, 0, 1),
    saf(1, 7, 0),
    saf(8, 7, 1),
  ],
}

/** 把逻辑地址（= 物理单元号）换算成（行，列） */
export function toCell(addr: number): Cell {
  return { row: Math.floor(addr / COLS), col: addr % COLS }
}

export type RepairStep = { line: 'row' | 'col'; index: number; count: number }

export type RepairPlan = {
  /** 每一步的选择，按执行顺序 */
  steps: RepairStep[]
  /** 被替换的行号（按选择顺序） */
  rows: number[]
  /** 被替换的列号（按选择顺序） */
  cols: number[]
}

/** 统计某个方向上每一行（或列）的失效位数，返回失效最多的那一条；数量相同时取编号小的 */
function bestLine(bits: Cell[], key: 'row' | 'col'): { index: number; count: number } | null {
  const counts = new Map<number, number>()
  for (const bit of bits) {
    const index = key === 'row' ? bit.row : bit.col
    counts.set(index, (counts.get(index) ?? 0) + 1)
  }
  let best: { index: number; count: number } | null = null
  for (const [index, count] of counts) {
    if (best === null || count > best.count || (count === best.count && index < best.index)) {
      best = { index, count }
    }
  }
  return best
}

/**
 * 贪心修复分配：
 * 1. 在还有备用的方向（行 / 列）里，各找一条失效位最多的线；
 * 2. 两者中取失效数更多的那一条（数量相同时选行），替换它，并把它上面的失效位从待修列表中去掉；
 * 3. 重复，直到没有失效位或备用全部用完。
 * 贪心不保证最优：一步选择可能占用了之后更需要的备用资源。
 */
export function allocateRepair(bits: Cell[], spareRows: number, spareCols: number): RepairPlan {
  let left = bits.slice()
  let rowsLeft = spareRows
  let colsLeft = spareCols
  const steps: RepairStep[] = []
  const rows: number[] = []
  const cols: number[] = []

  while (left.length > 0) {
    const rowBest = rowsLeft > 0 ? bestLine(left, 'row') : null
    const colBest = colsLeft > 0 ? bestLine(left, 'col') : null
    let pick: RepairStep | null = null
    if (rowBest !== null && (colBest === null || rowBest.count >= colBest.count)) {
      pick = { line: 'row', index: rowBest.index, count: rowBest.count }
    } else if (colBest !== null) {
      pick = { line: 'col', index: colBest.index, count: colBest.count }
    }
    if (pick === null) {
      break
    }
    steps.push(pick)
    const picked = pick
    if (picked.line === 'row') {
      rows.push(picked.index)
      rowsLeft -= 1
      left = left.filter((bit) => bit.row !== picked.index)
    } else {
      cols.push(picked.index)
      colsLeft -= 1
      left = left.filter((bit) => bit.col !== picked.index)
    }
  }
  return { steps, rows, cols }
}

/** 一个故障涉及的物理单元：SAF / TF 是一个；耦合是侵害单元和受害单元；地址故障是地址对应的单元 */
function cellsOf(f: Fault): number[] {
  if (f.kind === 'SAF' || f.kind === 'TF') {
    return [f.cell]
  }
  if (f.kind === 'CFIN' || f.kind === 'CFID') {
    return [f.aggressor, f.victim]
  }
  if (f.kind === 'AF_NOACCESS') {
    return [f.addr]
  }
  return [f.addr, f.target]
}

/** 修复模型：故障只要涉及被替换的行或列，就视为被备用单元取代而消失 */
function touchesRepaired(f: Fault, rows: number[], cols: number[]): boolean {
  return cellsOf(f).some((addr) => {
    const cell = toCell(addr)
    return rows.includes(cell.row) || cols.includes(cell.col)
  })
}

/** 跑一遍 March C−，返回失效位（去重、按出现顺序） */
export function bistScan(faults: Fault[]): Cell[] {
  return runMarch(MARCH_C_MINUS, CELLS, faults).failAddrs.map(toCell)
}

export type WordFail = { row: number; bits: number }

export type BistResult = {
  ecc: boolean
  /** BIST 第一次查出的失效位（修复前） */
  raw: Cell[]
  plan: RepairPlan
  /** 修复后再跑 March C− 仍失效的位 */
  residual: Cell[]
  /** 残留位按字（行）统计，按行号排序 */
  words: WordFail[]
  /** ECC 纠正的字数（ECC 关闭时为 0） */
  wordsFixed: number
  /** 判不通过的字数：ECC 关闭时即所有有残留的字；ECC 开启时为 2 位及以上的字 */
  wordsBad: number
  pass: boolean
}

/** 整个流程：BIST → 贪心修复 → 修复后重跑 → 按字做 ECC 判定 */
export function analyseBist(state: BistState): BistResult {
  const faults = SAMPLE_FAULTS[state.sample]
  const raw = bistScan(faults)
  const plan = allocateRepair(raw, SPARE_ROWS, SPARE_COLS)
  const kept = faults.filter((f) => !touchesRepaired(f, plan.rows, plan.cols))
  const residual = bistScan(kept)

  const perRow = new Map<number, number>()
  for (const bit of residual) {
    perRow.set(bit.row, (perRow.get(bit.row) ?? 0) + 1)
  }
  const words: WordFail[] = [...perRow]
    .map(([row, bits]) => ({ row, bits }))
    .sort((a, b) => a.row - b.row)

  const ecc = state.ecc === 'on'
  const wordsFixed = ecc ? words.filter((w) => w.bits === 1).length : 0
  const wordsBad = ecc ? words.filter((w) => w.bits >= 2).length : words.length
  return { ecc, raw, plan, residual, words, wordsFixed, wordsBad, pass: wordsBad === 0 }
}

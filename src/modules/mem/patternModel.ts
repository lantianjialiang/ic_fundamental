/**
 * MEM-04 Pattern 与数据背景（纯函数）。
 * 一个 Pattern 就是一段 Access[]：先把“背景”写进阵列，再逐个读回校验。
 * 背景 = 写一遍 + 读一遍（2N 次访问）；棋盘格要两个背景（相邻单元反相），共 4N 次；
 * Walking 1 / 0 每一轮只让一个单元与背景不同，并读回全部单元，共 N 轮，即 2N² 次。
 * 耗时用“每单元操作次数” = Access 数量 ÷ 单元数 来衡量。
 */
import { loc, type LText } from '../../i18n/locale'
import { type Access, type Fault, type RunResult, runAccesses } from './core/array'
import { ARRAY_SIZE, PRESET_FAULTS, type PresetFault } from './faultSet'

export const PATTERN_IDS = ['all0', 'all1', 'checker', 'walk1', 'walk0'] as const
export type PatternId = (typeof PATTERN_IDS)[number]

/** 选项顺序即显示顺序；默认取 [0] */
export const PATTERN_OPTIONS: Array<{ id: PatternId; label: LText }> = [
  { id: 'all0', label: loc('全 0', 'All 0') },
  { id: 'all1', label: loc('全 1', 'All 1') },
  { id: 'checker', label: loc('棋盘格', 'Checkerboard') },
  { id: 'walk1', label: loc('Walking 1', 'Walking 1') },
  { id: 'walk0', label: loc('Walking 0', 'Walking 0') },
]

export type PatternState = { pattern: PatternId }

export const DEFAULT_PATTERN: PatternState = { pattern: PATTERN_OPTIONS[0].id }

/** 写一遍（write = true）或读一遍（write = false），地址从 0 升到 size − 1 */
function pass(size: number, write: boolean, valueOf: (addr: number) => 0 | 1): Access[] {
  const out: Access[] = []
  for (let addr = 0; addr < size; addr += 1) {
    out.push({ addr, write, value: valueOf(addr) })
  }
  return out
}

/** 一个背景：先写一遍，再读回校验一遍 */
function background(size: number, valueOf: (addr: number) => 0 | 1): Access[] {
  return [...pass(size, true, valueOf), ...pass(size, false, valueOf)]
}

/** Walking：第 i 轮把单元 i 写成与背景相反的值，然后读回全部单元，共 size 轮 */
function walking(size: number, bg: 0 | 1): Access[] {
  const walker: 0 | 1 = bg === 0 ? 1 : 0
  const out: Access[] = []
  for (let round = 0; round < size; round += 1) {
    const valueOf = (addr: number): 0 | 1 => (addr === round ? walker : bg)
    out.push(...pass(size, true, valueOf), ...pass(size, false, valueOf))
  }
  return out
}

/** 生成 Pattern 的访问序列 */
export function patternAccesses(id: PatternId, size: number): Access[] {
  if (id === 'all0') {
    return background(size, () => 0)
  }
  if (id === 'all1') {
    return background(size, () => 1)
  }
  if (id === 'checker') {
    return [
      ...background(size, (addr) => (addr % 2 === 0 ? 0 : 1)),
      ...background(size, (addr) => (addr % 2 === 0 ? 1 : 0)),
    ]
  }
  if (id === 'walk1') {
    return walking(size, 0)
  }
  return walking(size, 1)
}

/** 每单元操作次数：耗时的代理指标 */
export function opsPerCell(id: PatternId, size: number = ARRAY_SIZE): number {
  return patternAccesses(id, size).length / size
}

/** 在预设阵列上用某个 Pattern 检测单个故障 */
export function runPattern(id: PatternId, fault: Fault, size: number = ARRAY_SIZE): RunResult {
  return runAccesses(patternAccesses(id, size), size, [fault])
}

export type CoverageCell = { detected: boolean; failAddrs: number[] }

export type CoverageRow = { fault: PresetFault; cells: Record<PatternId, CoverageCell> }

/** 覆盖矩阵：行是预设故障，列是 Pattern */
export function coverageMatrix(): CoverageRow[] {
  return PRESET_FAULTS.map((preset) => {
    const cells = {} as Record<PatternId, CoverageCell>
    for (const id of PATTERN_IDS) {
      const result = runPattern(id, preset.fault)
      cells[id] = { detected: !result.pass, failAddrs: result.failAddrs }
    }
    return { fault: preset, cells }
  })
}

/** 某个 Pattern 检出的预设故障个数 */
export function detectedCount(id: PatternId): number {
  return coverageMatrix().filter((row) => row.cells[id].detected).length
}

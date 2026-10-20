/**
 * MEM-05 March 测试（纯函数）。
 * 算法用 core/march.ts 的 MATS_PLUS / MARCH_C_MINUS，展开用 expandMarch，执行用 runAccesses。
 * 这里只补充“第 k 步属于哪个元素、哪个地址”：marchSteps 的展开顺序与 expandMarch 完全一致
 * （元素按顺序，元素内地址在外、操作在内），每一步都与 expandMarch 的 Access 对齐。
 */
import { loc, type LText } from '../../i18n/locale'
import { type Fault, type LogEntry, type RunResult, runAccesses } from './core/array'
import { MARCH_C_MINUS, MATS_PLUS, type MarchAlgorithm, type MarchElement, type MarchOp, expandMarch } from './core/march'
import { ARRAY_SIZE, PRESET_FAULTS, type PresetFault } from './faultSet'

export type AlgId = 'mats' | 'marchC'

/** 选项顺序即显示顺序；默认取 [0]（MATS+） */
export const ALGORITHMS: Array<{ id: AlgId; alg: MarchAlgorithm; label: LText }> = [
  { id: 'mats', alg: MATS_PLUS, label: loc('MATS+', 'MATS+') },
  { id: 'marchC', alg: MARCH_C_MINUS, label: loc('March C−', 'March C−') },
]

export type FaultChoice = { id: string; label: LText; fault: Fault | null }

/** 注入故障的选项：第一个是干净阵列，默认不注入 */
export const FAULT_CHOICES: FaultChoice[] = [
  { id: 'none', label: loc('无故障（干净阵列）', 'No fault (clean array)'), fault: null },
  ...PRESET_FAULTS.map((preset: PresetFault) => ({ id: preset.id, label: preset.name, fault: preset.fault })),
]

export type MarchState = { alg: AlgId; fault: string; step: number }

export const DEFAULT_MARCH: MarchState = { alg: ALGORITHMS[0].id, fault: FAULT_CHOICES[0].id, step: 0 }

export type MarchStep = { element: number; addr: number; op: MarchOp; write: boolean; value: 0 | 1 }

export function algOf(id: AlgId): MarchAlgorithm {
  const found = ALGORITHMS.find((item) => item.id === id)
  return found === undefined ? ALGORITHMS[0].alg : found.alg
}

export function faultOf(id: string): FaultChoice {
  const found = FAULT_CHOICES.find((item) => item.id === id)
  return found === undefined ? FAULT_CHOICES[0] : found
}

/**
 * 把算法展开成“每一步属于哪个元素、哪个地址、哪个操作”。
 * 与 expandMarch 的顺序完全相同：元素按顺序；元素内地址在外、操作在内；down 地址从大到小。
 */
export function marchSteps(alg: MarchAlgorithm, size: number = ARRAY_SIZE): MarchStep[] {
  const accesses = expandMarch(alg, size)
  const steps: MarchStep[] = []
  let k = 0
  alg.elements.forEach((el: MarchElement, element: number) => {
    const perAddr = el.ops.length
    for (let j = 0; j < size * perAddr; j += 1) {
      const addrIdx = Math.floor(j / perAddr)
      const addr = el.order === 'down' ? size - 1 - addrIdx : addrIdx
      const op = el.ops[j % perAddr]
      const access = accesses[k]
      steps.push({ element, addr, op, write: access.write, value: access.value })
      k += 1
    }
  })
  return steps
}

/** 对一个算法与一个故障选项跑完整的测试，返回逐步日志 */
export function runChoice(alg: MarchAlgorithm, choice: FaultChoice, size: number = ARRAY_SIZE): RunResult {
  const accesses = expandMarch(alg, size)
  return runAccesses(accesses, size, choice.fault === null ? [] : [choice.fault])
}

/** 第一次失效的日志下标；没有失效返回 −1 */
export function firstFailIndex(log: LogEntry[]): number {
  return log.findIndex((entry) => !entry.pass)
}

export type CoverageEntry = { detected: boolean; step: number; addr: number }

export type CoverageRow = { preset: PresetFault; cells: Record<AlgId, CoverageEntry> }

/** 覆盖表：每个预设故障、每种算法的检出结果与第一次失效的步号、地址 */
export function coverageRows(size: number = ARRAY_SIZE): CoverageRow[] {
  return PRESET_FAULTS.map((preset) => {
    const cells = {} as Record<AlgId, CoverageEntry>
    for (const item of ALGORITHMS) {
      const result = runChoice(item.alg, { id: preset.id, label: preset.name, fault: preset.fault }, size)
      const idx = firstFailIndex(result.log)
      cells[item.id] = {
        detected: idx >= 0,
        step: idx,
        addr: idx >= 0 ? result.log[idx].addr : -1,
      }
    }
    return { preset, cells }
  })
}

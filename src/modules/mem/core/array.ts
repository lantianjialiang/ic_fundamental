/**
 * 存储器行为模型（教学用，纯函数）：一维单元阵列 + 地址译码 + 故障注入。
 * 所有故障按“物理单元编号”描述；地址故障（AF）把逻辑地址映射到别的单元或映射为空。
 * 初始状态：全部单元为 0。
 */

export type Fault =
  /** 固定故障：单元恒为 value，写入无效 */
  | { kind: 'SAF'; cell: number; value: 0 | 1 }
  /** 跳变故障：rising = true 时单元不能 0→1；false 时不能 1→0 */
  | { kind: 'TF'; cell: number; rising: boolean }
  /** 耦合（反转）：侵害单元发生指定方向跳变时，受害单元取反 */
  | { kind: 'CFIN'; aggressor: number; victim: number; rising: boolean }
  /** 耦合（强制）：侵害单元发生指定方向跳变时，受害单元被置为 value */
  | { kind: 'CFID'; aggressor: number; victim: number; rising: boolean; value: 0 | 1 }
  /** 地址不访问任何单元：写入丢失，读出 0 */
  | { kind: 'AF_NOACCESS'; addr: number }
  /** 地址 addr 实际访问单元 target（多个地址指向同一单元） */
  | { kind: 'AF_ALIAS'; addr: number; target: number }

/** 一次访问：write = false 时 value 为期望读出值 */
export type Access = { addr: number; write: boolean; value: 0 | 1 }

export type LogEntry = {
  step: number
  addr: number
  write: boolean
  /** 读操作的期望值；写操作为 null */
  expected: 0 | 1 | null
  /** 读操作的实际值；地址映射为空时为 0；写操作为 null */
  actual: 0 | 1 | null
  pass: boolean
}

export type RunResult = {
  log: LogEntry[]
  /** 出现失效的逻辑地址（去重，按出现顺序） */
  failAddrs: number[]
  pass: boolean
}

/** 逻辑地址 → 物理单元；返回 −1 表示不访问任何单元 */
function resolve(addr: number, faults: Fault[]): number {
  for (const f of faults) {
    if (f.kind === 'AF_NOACCESS' && f.addr === addr) {
      return -1
    }
    if (f.kind === 'AF_ALIAS' && f.addr === addr) {
      return f.target
    }
  }
  return addr
}

/**
 * 按顺序执行访问序列，返回每次操作的日志与失效地址。
 * size 为单元数（逻辑地址范围 0 … size−1）。
 */
export function runAccesses(accesses: Access[], size: number, faults: Fault[]): RunResult {
  const cells = new Uint8Array(size)
  const stuck = (cell: number): 0 | 1 | undefined => {
    for (const f of faults) {
      if (f.kind === 'SAF' && f.cell === cell) {
        return f.value
      }
    }
    return undefined
  }
  const enforceStuck = () => {
    for (const f of faults) {
      if (f.kind === 'SAF') {
        cells[f.cell] = f.value
      }
    }
  }

  const log: LogEntry[] = []
  const failAddrs: number[] = []
  enforceStuck()

  accesses.forEach((acc, step) => {
    const cell = resolve(acc.addr, faults)
    if (acc.write) {
      if (cell >= 0) {
        const old = cells[cell]
        const sv = stuck(cell)
        let next: 0 | 1 = acc.value
        if (sv !== undefined) {
          next = sv
        } else {
          for (const f of faults) {
            if (f.kind === 'TF' && f.cell === cell) {
              if (f.rising && old === 0 && acc.value === 1) {
                next = 0
              }
              if (!f.rising && old === 1 && acc.value === 0) {
                next = 1
              }
            }
          }
        }
        cells[cell] = next
        if (next !== old) {
          const rising = next === 1
          for (const f of faults) {
            if (f.kind === 'CFIN' && f.aggressor === cell && f.rising === rising) {
              cells[f.victim] = cells[f.victim] ^ 1
            }
            if (f.kind === 'CFID' && f.aggressor === cell && f.rising === rising) {
              cells[f.victim] = f.value
            }
          }
        }
        enforceStuck()
      }
      log.push({ step, addr: acc.addr, write: true, expected: null, actual: null, pass: true })
    } else {
      const actual: 0 | 1 = cell >= 0 ? (cells[cell] as 0 | 1) : 0
      const pass = actual === acc.value
      if (!pass && !failAddrs.includes(acc.addr)) {
        failAddrs.push(acc.addr)
      }
      log.push({ step, addr: acc.addr, write: false, expected: acc.value, actual, pass })
    }
  })

  return { log, failAddrs, pass: failAddrs.length === 0 }
}

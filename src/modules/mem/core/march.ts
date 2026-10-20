/**
 * March 算法：元素 = 地址方向 + 操作序列。
 * 记法：⇑ 升序（up）、⇓ 降序（down）、⇕ 任意（any，按升序执行）。
 * MATS+   : ⇕(w0); ⇑(r0,w1); ⇓(r1,w0)                                  每单元 5 次操作
 * March C−: ⇕(w0); ⇑(r0,w1); ⇑(r1,w0); ⇓(r0,w1); ⇓(r1,w0); ⇕(r0)     每单元 10 次操作
 */
import { type Access, type Fault, type RunResult, runAccesses } from './array'

export type MarchOp = 'r0' | 'r1' | 'w0' | 'w1'

export type MarchElement = { order: 'up' | 'down' | 'any'; ops: MarchOp[] }

export type MarchAlgorithm = { name: string; elements: MarchElement[] }

export const MATS_PLUS: MarchAlgorithm = {
  name: 'MATS+',
  elements: [
    { order: 'any', ops: ['w0'] },
    { order: 'up', ops: ['r0', 'w1'] },
    { order: 'down', ops: ['r1', 'w0'] },
  ],
}

export const MARCH_C_MINUS: MarchAlgorithm = {
  name: 'March C-',
  elements: [
    { order: 'any', ops: ['w0'] },
    { order: 'up', ops: ['r0', 'w1'] },
    { order: 'up', ops: ['r1', 'w0'] },
    { order: 'down', ops: ['r0', 'w1'] },
    { order: 'down', ops: ['r1', 'w0'] },
    { order: 'any', ops: ['r0'] },
  ],
}

/** 每个单元上的操作次数（用于算测试时间：总操作数 = 该值 × 单元数） */
export function opsPerCell(alg: MarchAlgorithm): number {
  return alg.elements.reduce((sum, el) => sum + el.ops.length, 0)
}

/** 把算法展开成扁平的访问序列：每个元素按方向遍历所有地址，元素内的操作依次执行 */
export function expandMarch(alg: MarchAlgorithm, size: number): Access[] {
  const out: Access[] = []
  for (const el of alg.elements) {
    const addrs: number[] = []
    for (let a = 0; a < size; a += 1) {
      addrs.push(el.order === 'down' ? size - 1 - a : a)
    }
    for (const addr of addrs) {
      for (const op of el.ops) {
        const write = op[0] === 'w'
        const value = op[1] === '1' ? 1 : 0
        out.push({ addr, write, value })
      }
    }
  }
  return out
}

export function runMarch(alg: MarchAlgorithm, size: number, faults: Fault[]): RunResult {
  return runAccesses(expandMarch(alg, size), size, faults)
}

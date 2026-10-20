/**
 * 存储器读写时序模型（MEM-02）。纯函数，不含界面文字。
 * 访问序列固定为三次：写 addr ← value；读 addr（期望 value）；读 addr+1（从未写过，期望 0）。
 * 行为由 core/array.ts 的 runAccesses 给出（读出值来自阵列，不是手填的）。
 *
 * 每次访问拆成 4 个时隙（教学简化，只保留先后顺序，不画 tAS、tWP、tDH、tAA 等时间参数）：
 *   写：① 送地址  ② CS#、WE# 拉低，DATA 有效  ③ WE# 拉回高（上升沿锁存），DATA 仍保持  ④ CS# 拉高，DATA 高阻
 *   读：① 送地址  ② CS#、OE# 拉低，DATA 进入过渡（访问时间）  ③ DATA 稳定，控制器采样  ④ CS#、OE# 拉高，DATA 高阻
 * 高电平为 1，低电平为 0（低有效信号 CS#、WE#、OE# 在有效时为 0）。
 */
import { type Access, runAccesses } from './core/array'

/** 阵列单元数（逻辑地址 0–63） */
export const SIZE = 64
/** 每次访问的时隙数 */
export const SLOTS = 4
/** 写入数据选项，显示顺序即数组顺序；默认取 [0] */
export const VALUES: Array<0 | 1> = [1, 0]

export type RwState = {
  addr: number
  value: 0 | 1
  /** 已执行的时隙数：0 表示还没开始 */
  step: number
}

export const DEFAULT_RW: RwState = { addr: 5, value: VALUES[0], step: 0 }

/** 访问序列：写 addr，读 addr，读 addr+1（未写过） */
export function sequenceOf(addr: number, value: 0 | 1): Access[] {
  return [
    { addr, write: true, value },
    { addr, write: false, value },
    { addr: (addr + 1) % SIZE, write: false, value: 0 },
  ]
}

export type Level = 0 | 1

/** 数据总线的状态 */
export type DataBus =
  /** 高阻：没有驱动 */
  | { kind: 'z' }
  /** 控制器驱动写数据 */
  | { kind: 'drive'; value: Level }
  /** 存储器在访问中（过渡区） */
  | { kind: 'busy' }
  /** 存储器输出读出值 */
  | { kind: 'out'; value: Level }

export type Slot = {
  /** 第几次访问，从 0 起 */
  access: number
  /** 访问内的时隙，0–3 */
  phase: number
  cs: Level
  we: Level
  oe: Level
  addr: number
  data: DataBus
}

/** 把访问序列展开成时隙序列；读出值由 runAccesses 给出 */
export function buildSlots(seq: Access[]): Slot[] {
  const { log } = runAccesses(seq, SIZE, [])
  const slots: Slot[] = []
  seq.forEach((acc, index) => {
    if (acc.write) {
      slots.push({ access: index, phase: 0, cs: 1, we: 1, oe: 1, addr: acc.addr, data: { kind: 'z' } })
      slots.push({ access: index, phase: 1, cs: 0, we: 0, oe: 1, addr: acc.addr, data: { kind: 'drive', value: acc.value } })
      slots.push({ access: index, phase: 2, cs: 0, we: 1, oe: 1, addr: acc.addr, data: { kind: 'drive', value: acc.value } })
      slots.push({ access: index, phase: 3, cs: 1, we: 1, oe: 1, addr: acc.addr, data: { kind: 'z' } })
      return
    }
    const actual: Level = log[index].actual === 1 ? 1 : 0
    slots.push({ access: index, phase: 0, cs: 1, we: 1, oe: 1, addr: acc.addr, data: { kind: 'z' } })
    slots.push({ access: index, phase: 1, cs: 0, we: 1, oe: 0, addr: acc.addr, data: { kind: 'busy' } })
    slots.push({ access: index, phase: 2, cs: 0, we: 1, oe: 0, addr: acc.addr, data: { kind: 'out', value: actual } })
    slots.push({ access: index, phase: 3, cs: 1, we: 1, oe: 1, addr: acc.addr, data: { kind: 'z' } })
  })
  return slots
}

/** 读操作在 phase 2（数据稳定、控制器采样）时的读出值；访问尚未到这一拍时返回 null */
export function readbackOf(slots: Slot[], access: number): Level | null {
  const slot = slots.find((item) => item.access === access && item.phase === 2)
  if (slot === undefined) {
    return null
  }
  const data = slot.data
  return data.kind === 'out' ? data.value : null
}

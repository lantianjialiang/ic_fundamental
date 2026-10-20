/**
 * PRBS 码型生成器（Fibonacci LFSR）。
 * 生成多项式 x^n + x^k + 1（本原多项式）：
 *   PRBS7  = x^7  + x^6  + 1，周期 2^7  − 1 = 127
 *   PRBS15 = x^15 + x^14 + 1，周期 2^15 − 1 = 32767
 *   PRBS31 = x^31 + x^28 + 1，周期 2^31 − 1
 * 状态寄存器 s 的第 j 位保存 a_{t−1−j}，新位 a_t = a_{t−n} ⊕ a_{t−k}。
 */

export type PrbsOrder = 7 | 15 | 31

/** 反馈抽头 k（第二个抽头），第一个抽头固定为 n */
const SECOND_TAP: Record<PrbsOrder, number> = { 7: 6, 15: 14, 31: 28 }

export function prbsPeriod(order: PrbsOrder): number {
  return 2 ** order - 1
}

/** 产生 count 个比特；seed 为 0 时自动改为全 1（全 0 状态会停在 0） */
export function prbsBits(order: PrbsOrder, count: number, seed = 1): Uint8Array {
  const n = order
  const k = SECOND_TAP[order]
  const mask = 2 ** n - 1
  let state = seed & mask
  if (state === 0) {
    state = mask
  }
  const out = new Uint8Array(count)
  for (let i = 0; i < count; i += 1) {
    const bit = ((state >>> (n - 1)) ^ (state >>> (k - 1))) & 1
    out[i] = bit
    state = ((state << 1) | bit) & mask
  }
  return out
}

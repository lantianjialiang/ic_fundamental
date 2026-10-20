/**
 * 带种子的随机数（mulberry32）与标准正态采样（Box–Muller）。
 * 同一个种子每次得到的序列完全一样，所以页面上的「重新采样」只要换一个种子，结果可以复现。
 */

export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 标准正态分布 N(0, 1)。u 取 (0, 1]，避免 log(0)。 */
export function gaussian(random: () => number): number {
  let u = random()
  while (u <= 0) {
    u = random()
  }
  const v = random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

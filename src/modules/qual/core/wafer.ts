/**
 * 教学用晶圆模型（REL-07 / REL-08 共用）。
 * 每颗 die 有坐标、参数值，以及是否带潜在缺陷（latent）。潜在缺陷的参数向外偏移，
 * 但仍在规格内，所以普通的规格判定抓不住它。
 */

export type Die = {
  id: number
  col: number
  row: number
  /** 参数测量值（如 Iq，单位任意，教学用） */
  param: number
  /** 是否带潜在缺陷（参数偏移，规格内） */
  latent: boolean
  /** 是否硬失效（功能或开短路，规格外，教学用） */
  hardFail: boolean
}

export type WaferMap = {
  /** 直径方向的 die 数（网格边长） */
  diameterDie: number
  /** 只包含圆内的 die，id 即数组下标 */
  dies: Die[]
}

export type WaferParams = {
  diameterDie: number
  seed: number
  /** 潜在缺陷占全部 die 的比例（0–1） */
  latentRate: number
  /** 落在空间簇内的潜在缺陷比例（0–1） */
  clusterProb: number
  /** 硬失效比例（0–1），与潜在缺陷互不重叠 */
  hardRate?: number
  /** 正常参数均值 */
  paramMean: number
  /** 正常参数标准差 */
  paramSigma: number
  /** 潜在缺陷的参数偏移，以 paramSigma 为单位（例如 3 表示 +3σ） */
  latentShiftSigma: number
}

/** 可复现的伪随机数（mulberry32），同 seed 同结果 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Box–Muller 标准正态 */
export function gaussian(rand: () => number): number {
  let u = 0
  while (u === 0) {
    u = rand()
  }
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** 圆形晶圆中的 die 坐标：返回所有在圆内的 (col,row) */
export function insideCells(diameterDie: number): Array<{ col: number; row: number }> {
  const c = (diameterDie - 1) / 2
  const r = diameterDie / 2
  const cells: Array<{ col: number; row: number }> = []
  for (let row = 0; row < diameterDie; row += 1) {
    for (let col = 0; col < diameterDie; col += 1) {
      const dx = col - c
      const dy = row - c
      if (dx * dx + dy * dy <= r * r) {
        cells.push({ col, row })
      }
    }
  }
  return cells
}

/** 生成一片晶圆。潜在缺陷数 = round(latentRate × die 数)，其中 clusterProb 的比例落在两个簇中心附近 */
export function makeWafer(p: WaferParams): WaferMap {
  const rand = mulberry32(p.seed)
  const cells = insideCells(p.diameterDie)
  const n = cells.length
  const c = (p.diameterDie - 1) / 2
  const centers = [
    { col: c - p.diameterDie * 0.22, row: c - p.diameterDie * 0.18 },
    { col: c + p.diameterDie * 0.2, row: c + p.diameterDie * 0.24 },
  ]
  const radius = Math.max(2, p.diameterDie * 0.12)
  const nearCluster = cells.map((cell) => centers.some((ce) => Math.hypot(cell.col - ce.col, cell.row - ce.row) <= radius))
  const clusterIdx = cells.map((_, i) => i).filter((i) => nearCluster[i])
  const otherIdx = cells.map((_, i) => i).filter((i) => !nearCluster[i])

  const nLatent = Math.round(p.latentRate * n)
  const nClustered = Math.min(clusterIdx.length, Math.round(nLatent * p.clusterProb))
  const latent = new Set<number>()
  const pick = (pool: number[], k: number) => {
    const copy = [...pool]
    for (let i = 0; i < k && copy.length > 0; i += 1) {
      const j = Math.floor(rand() * copy.length)
      latent.add(copy[j])
      copy.splice(j, 1)
    }
  }
  pick(clusterIdx, nClustered)
  pick(otherIdx, nLatent - nClustered)

  const nHard = Math.round((p.hardRate ?? 0) * n)
  const hard = new Set<number>()
  const freeIdx = cells.map((_, i) => i).filter((i) => !latent.has(i))
  for (let i = 0; i < nHard && freeIdx.length > 0; i += 1) {
    const j = Math.floor(rand() * freeIdx.length)
    hard.add(freeIdx[j])
    freeIdx.splice(j, 1)
  }

  const dies: Die[] = cells.map((cell, i) => {
    const base = p.paramMean + p.paramSigma * gaussian(rand)
    const shifted = latent.has(i) ? base + p.latentShiftSigma * p.paramSigma : base
    return { id: i, col: cell.col, row: cell.row, param: shifted, latent: latent.has(i), hardFail: hard.has(i) }
  })
  return { diameterDie: p.diameterDie, dies }
}

/** 按 (col,row) 找 die 的 id；圆外返回 -1 */
export function dieAt(map: WaferMap, col: number, row: number): number {
  const hit = map.dies.find((d) => d.col === col && d.row === row)
  return hit ? hit.id : -1
}

/**
 * 失效位图（MEM-12）的教学模型：16×16 Fail Bit Map 的生成、失效分类、Bin 与备份修复判定。
 * 纯函数，不访问 DOM。图由 (kind, seed) 决定：seededRandom(seed) 按固定顺序取随机数，同一参数每次得到同一张图。
 *
 * 分类规则（代码直接算，页面、说明文字与小测都引用这里的常量）：
 *   N = 失效数；maxRow / maxCol = 同一行 / 同一列上的最多失效数
 *   1) N = 0 → 无失效（Pass）；N = 1 → 单点
 *   2) maxRow ≥ LINE_MIN 且其余失效 N − maxRow ≤ OTHER_MAX → 整行；整列同理
 *   3) 最大 8 邻接连通块占全部失效的比例 ≥ CLUSTER_SHARE，N ≥ 3，外接框较长边 ≤ CLUSTER_MAX_SIDE → 簇
 *   4) 其它 → 随机
 *
 * 修复：备份 SPARE_ROWS 行 + SPARE_COLS 列，能否覆盖全部失效由 coverable 精确搜索（枚举备份行的组合，剩下的失效列数不超过备份列数即可）。
 * Bin 号是教学取值：每一类一个 Bin，修复能力由备份数量决定，与 Bin 号无关。
 */
import { seededRandom } from '../ana/core/rng'

export const GRID = 16
/** 同一行（列）上失效数达到半行（半列）才可能是整行（整列） */
export const LINE_MIN = GRID / 2
/** 整行 / 整列判定时，其它行（列）允许出现的失效数上限 */
export const OTHER_MAX = 2
/** 簇：最大连通块占全部失效的比例下限；外接框较长边上限（格） */
export const CLUSTER_SHARE = 0.7
export const CLUSTER_MAX_SIDE = 6
/** 教学取值的备份资源 */
export const SPARE_ROWS = 2
export const SPARE_COLS = 2
/** 搜索最少备份线条数的上限；超过上限时显示为“超过上限” */
export const MIN_LINES_CAP = 6
/** 预设图的种子；换一张图时种子 + 1 */
export const DEFAULT_SEED = 7

export type FailClass = 'pass' | 'single' | 'row' | 'column' | 'cluster' | 'random'
export type MapKind = Exclude<FailClass, 'pass'>
export const MAP_KINDS: MapKind[] = ['single', 'row', 'column', 'cluster', 'random']
/** 判题的“未选择”状态：判题选项不预选 */
export const NO_GUESS = 'none' as const
export type Guess = MapKind | typeof NO_GUESS

/** 教学取值：Pass 为 Bin 1，每类失效一个 Bin 号 */
export const BIN_OF: Record<FailClass, number> = {
  pass: 1,
  single: 2,
  row: 3,
  column: 4,
  cluster: 5,
  random: 6,
}

/** fails[row * GRID + col] = 1 表示该位失效 */
export type BitMap = { kind: MapKind; seed: number; fails: Uint8Array }

export type Analysis = {
  n: number
  rowCounts: number[]
  colCounts: number[]
  maxRow: number
  maxRowIdx: number
  maxCol: number
  maxColIdx: number
  /** 出现失效的行数、列数 */
  rowsUsed: number
  colsUsed: number
  /** 最大连通块的失效数与外接框较长边（格） */
  largest: number
  largestSide: number
  cls: FailClass
  bin: number
  /** SPARE_ROWS 行 + SPARE_COLS 列能否覆盖全部失效 */
  repairable: boolean
  /** 覆盖全部失效至少需要的备份线条数；超过 MIN_LINES_CAP 时为 null */
  minLines: number | null
}

export type BinState = {
  kind: MapKind
  seed: number
  guess: Guess
  /** 已经判对过的图类型（用于任务卡） */
  solved: MapKind[]
}

export const DEFAULT_BIN: BinState = { kind: MAP_KINDS[0], seed: DEFAULT_SEED, guess: NO_GUESS, solved: [] }

const pick = (rng: () => number, n: number): number => Math.floor(rng() * n)

/** 生成一张预设类型的失效位图；随机数的取用顺序固定，保证可复现 */
export function genMap(kind: MapKind, seed: number): BitMap {
  const rng = seededRandom(seed)
  const fails = new Uint8Array(GRID * GRID)
  const put = (row: number, col: number) => {
    fails[row * GRID + col] = 1
  }
  if (kind === 'single') {
    put(pick(rng, GRID), pick(rng, GRID))
  } else if (kind === 'row') {
    const row = pick(rng, GRID)
    for (let col = 0; col < GRID; col += 1) {
      put(row, col)
    }
  } else if (kind === 'column') {
    const col = pick(rng, GRID)
    for (let row = 0; row < GRID; row += 1) {
      put(row, col)
    }
  } else if (kind === 'cluster') {
    const side = 3 + pick(rng, 2)
    const top = pick(rng, GRID - side + 1)
    const left = pick(rng, GRID - side + 1)
    // 只有四个角可能缺失：去掉角不会断开 8 邻接连通性，整块仍是一个簇
    for (let dr = 0; dr < side; dr += 1) {
      for (let dc = 0; dc < side; dc += 1) {
        const isCorner = (dr === 0 || dr === side - 1) && (dc === 0 || dc === side - 1)
        if (!isCorner || rng() < 0.5) {
          put(top + dr, left + dc)
        }
      }
    }
  } else {
    const target = 14 + pick(rng, 9)
    let count = 0
    while (count < target) {
      const idx = pick(rng, GRID * GRID)
      if (fails[idx] === 0) {
        fails[idx] = 1
        count += 1
      }
    }
  }
  return { kind, seed, fails }
}

function argMax(xs: number[]): number {
  let best = 0
  for (let i = 1; i < xs.length; i += 1) {
    if (xs[i] > xs[best]) {
      best = i
    }
  }
  return best
}

/** 最大 8 邻接连通块：返回块内失效数与外接框较长边 */
function largestBlock(fails: Uint8Array): { size: number; side: number } {
  const seen = new Uint8Array(GRID * GRID)
  let size = 0
  let side = 0
  for (let start = 0; start < GRID * GRID; start += 1) {
    if (fails[start] === 1 && seen[start] === 0) {
      const stack: number[] = [start]
      seen[start] = 1
      let count = 0
      let minR = GRID
      let maxR = -1
      let minC = GRID
      let maxC = -1
      while (stack.length > 0) {
        const cur = stack.pop()
        if (cur === undefined) {
          break
        }
        count += 1
        const r = Math.floor(cur / GRID)
        const c = cur % GRID
        minR = Math.min(minR, r)
        maxR = Math.max(maxR, r)
        minC = Math.min(minC, c)
        maxC = Math.max(maxC, c)
        for (let dr = -1; dr <= 1; dr += 1) {
          for (let dc = -1; dc <= 1; dc += 1) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID) {
              const idx = nr * GRID + nc
              if (fails[idx] === 1 && seen[idx] === 0) {
                seen[idx] = 1
                stack.push(idx)
              }
            }
          }
        }
      }
      if (count > size) {
        size = count
        side = Math.max(maxR - minR + 1, maxC - minC + 1)
      }
    }
  }
  return { size, side }
}

/** 分类规则见文件头；顺序就是判定的先后 */
export function classify(n: number, maxRow: number, maxCol: number, largest: number, largestSide: number): FailClass {
  if (n === 0) {
    return 'pass'
  }
  if (n === 1) {
    return 'single'
  }
  if (maxRow >= LINE_MIN && n - maxRow <= OTHER_MAX) {
    return 'row'
  }
  if (maxCol >= LINE_MIN && n - maxCol <= OTHER_MAX) {
    return 'column'
  }
  if (n >= 3 && largest >= CLUSTER_SHARE * n && largestSide <= CLUSTER_MAX_SIDE) {
    return 'cluster'
  }
  return 'random'
}

/**
 * 能否用最多 rowBudget 条备份行 + colBudget 条备份列覆盖所有失效。
 * 枚举备份行的子集（深度优先，最多 rowBudget 行）；未被选中的行上的失效，所在列数不超过 colBudget 即可。
 */
export function coverable(cells: Array<[number, number]>, rowBudget: number, colBudget: number): boolean {
  const chosen: number[] = []
  const search = (start: number): boolean => {
    const cols = new Set<number>()
    for (const [row, col] of cells) {
      if (!chosen.includes(row)) {
        cols.add(col)
      }
    }
    if (cols.size <= colBudget) {
      return true
    }
    if (chosen.length === rowBudget) {
      return false
    }
    for (let row = start; row < GRID; row += 1) {
      chosen.push(row)
      if (search(row + 1)) {
        return true
      }
      chosen.pop()
    }
    return false
  }
  return search(0)
}

/** 覆盖全部失效至少需要几条备份线（行 + 列），按总数从小到大试；超过上限返回 null */
export function minLinesOf(cells: Array<[number, number]>): number | null {
  for (let total = 0; total <= MIN_LINES_CAP; total += 1) {
    for (let rows = 0; rows <= total; rows += 1) {
      if (coverable(cells, rows, total - rows)) {
        return total
      }
    }
  }
  return null
}

export function analyse(map: BitMap): Analysis {
  const { fails } = map
  const rowCounts = new Array<number>(GRID).fill(0)
  const colCounts = new Array<number>(GRID).fill(0)
  const cells: Array<[number, number]> = []
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      if (fails[row * GRID + col] === 1) {
        rowCounts[row] += 1
        colCounts[col] += 1
        cells.push([row, col])
      }
    }
  }
  const n = cells.length
  const maxRowIdx = argMax(rowCounts)
  const maxColIdx = argMax(colCounts)
  const maxRow = rowCounts[maxRowIdx]
  const maxCol = colCounts[maxColIdx]
  const block = largestBlock(fails)
  const cls = classify(n, maxRow, maxCol, block.size, block.side)
  return {
    n,
    rowCounts,
    colCounts,
    maxRow,
    maxRowIdx,
    maxCol,
    maxColIdx,
    rowsUsed: rowCounts.filter((x) => x > 0).length,
    colsUsed: colCounts.filter((x) => x > 0).length,
    largest: block.size,
    largestSide: block.side,
    cls,
    bin: BIN_OF[cls],
    repairable: coverable(cells, SPARE_ROWS, SPARE_COLS),
    minLines: minLinesOf(cells),
  }
}

/** 只判断能否用固定备份修复（比 analyse 便宜），用于任务卡 */
export function repairableMap(map: BitMap): boolean {
  const cells: Array<[number, number]> = []
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      if (map.fails[row * GRID + col] === 1) {
        cells.push([row, col])
      }
    }
  }
  return coverable(cells, SPARE_ROWS, SPARE_COLS)
}

/**
 * 光纤主动对准的教学模型。读数是 dBm（越大越好）。
 * 噪声是位置的确定性哈希，同一组参数每次轨迹相同。
 */

export type CouplingMap = {
  read: (x: number, y: number) => number
  /** 无噪声时的峰值读数（dBm） */
  peakDb: number
  x0: number
  y0: number
  wUm: number
}

export type AlignResult = {
  x: number
  y: number
  moves: number
  timeS: number
  /** 峰值读数 − 停在该点的读数（dB）。0 表示停在峰值上；噪声可能让它略小于 0 */
  lossDb: number
}

export function couplingMap(p: {
  x0: number
  y0: number
  wUm: number
  peakDb: number
  noiseDb: number
  seed?: number
}): CouplingMap {
  const seed = p.seed ?? 1
  const read = (x: number, y: number) => {
    const excess = 4.343 * (((x - p.x0) / p.wUm) ** 2 + ((y - p.y0) / p.wUm) ** 2)
    const noise = p.noiseDb === 0 ? 0 : p.noiseDb * (hash01(x, y, seed) * 2 - 1)
    return p.peakDb - excess + noise
  }
  return { read, peakDb: p.peakDb, x0: p.x0, y0: p.y0, wUm: p.wUm }
}

/** 停点相对真峰值的附加损耗（不含读数噪声），dB */
export function excessLossDb(map: CouplingMap, x: number, y: number): number {
  const dist = Math.hypot(x - map.x0, y - map.y0)
  return 4.343 * (dist / map.wUm) ** 2
}

function hash01(x: number, y: number, seed: number): number {
  const ix = Math.round(x * 1000)
  const iy = Math.round(y * 1000)
  let h = (Math.imul(seed, 374761393) + Math.imul(ix, 668265263) + Math.imul(iy, 2147483647)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function finish(map: CouplingMap, x: number, y: number, moves: number, moveTimeS: number): AlignResult {
  return { x, y, moves, timeS: moves * moveTimeS, lossDb: map.peakDb - map.read(x, y) }
}

/** 栅格扫描：覆盖 ±range，步长 step，取读数最大的点 */
export function alignRaster(
  map: CouplingMap,
  o: { range: number; step: number; moveTimeS: number },
): AlignResult {
  const n = Math.max(0, Math.floor(o.range / o.step + 1e-9))
  let best = -Infinity
  let bx = 0
  let by = 0
  let moves = 0
  for (let iy = -n; iy <= n; iy += 1) {
    for (let ix = -n; ix <= n; ix += 1) {
      const x = ix * o.step
      const y = iy * o.step
      const reading = map.read(x, y)
      moves += 1
      if (reading > best) {
        best = reading
        bx = x
        by = y
      }
    }
  }
  return finish(map, bx, by, moves, o.moveTimeS)
}

/**
 * 方螺旋：从原点向外。连续两圈都没有更好的读数就停，
 * 所以峰在搜索范围中部时，步数少于铺满的栅格。
 */
export function alignSpiral(
  map: CouplingMap,
  o: { range: number; step: number; moveTimeS: number },
): AlignResult {
  const dirs: Array<[number, number]> = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ]
  let x = 0
  let y = 0
  let best = map.read(0, 0)
  let bx = 0
  let by = 0
  let moves = 1
  let dir = 0
  let leg = 1
  let legLeft = 1
  let legsAtLen = 0
  let ring = 0
  let lastImprove = 0
  const maxMoves = Math.ceil((2 * o.range) / o.step + 1) ** 2 + 4
  while (moves < maxMoves) {
    const nx = x + dirs[dir][0] * o.step
    const ny = y + dirs[dir][1] * o.step
    if (Math.abs(nx) > o.range + 1e-6 || Math.abs(ny) > o.range + 1e-6) break
    x = nx
    y = ny
    const reading = map.read(x, y)
    moves += 1
    if (reading > best) {
      best = reading
      bx = x
      by = y
      lastImprove = ring
    }
    legLeft -= 1
    if (legLeft === 0) {
      dir = (dir + 1) % 4
      legsAtLen += 1
      if (legsAtLen === 2) {
        legsAtLen = 0
        leg += 1
        ring += 1
        if (ring >= 2 && ring - lastImprove >= 2) break
      }
      legLeft = leg
    }
  }
  return finish(map, bx, by, moves, o.moveTimeS)
}

/**
 * 爬山：从起点沿四邻域走，走不动就把步长减半。
 * 读数噪声大时会停在假峰上。
 */
export function alignHillClimb(
  map: CouplingMap,
  o: { startX: number; startY: number; step0: number; moveTimeS: number },
): AlignResult {
  let x = o.startX
  let y = o.startY
  let step = o.step0
  let best = map.read(x, y)
  let moves = 1
  const minStep = o.step0 / 32
  while (step >= minStep - 1e-12 && moves < 800) {
    const cands: Array<[number, number]> = [
      [x + step, y],
      [x - step, y],
      [x, y + step],
      [x, y - step],
    ]
    let improved = false
    for (const [cx, cy] of cands) {
      const reading = map.read(cx, cy)
      moves += 1
      if (reading > best + 1e-6) {
        best = reading
        x = cx
        y = cy
        improved = true
        break
      }
    }
    if (!improved) step /= 2
  }
  return finish(map, x, y, moves, o.moveTimeS)
}

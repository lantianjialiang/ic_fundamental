import { gcLossDb } from './core/photonics'
import {
  alignHillClimb,
  alignRaster,
  alignSpiral,
  couplingMap,
  excessLossDb,
  type CouplingMap,
} from './core/align'

/** 光纤主动对准（PIC-06）。峰不在原点，方便看出三种搜索的差别。 */

export const ALG_IDS = ['raster', 'spiral', 'hill'] as const
export type AlgId = (typeof ALG_IDS)[number]

export const DELTA_IDS = ['off', 'on'] as const
export type DeltaId = (typeof DELTA_IDS)[number]

export const PEAK_X = 2
export const PEAK_Y = 1
export const ALIGN_SEED = 7
export const HEAT_N = 25

export type AlignState = {
  wUm: number
  l0Db: number
  noiseDb: number
  rangeUm: number
  stepUm: number
  moveS: number
  alg: AlgId
  deltaW: DeltaId
}

export const DEFAULT_ALIGN: AlignState = {
  wUm: 4,
  l0Db: 3,
  noiseDb: 0.4,
  rangeUm: 6,
  stepUm: 1,
  moveS: 0.2,
  alg: ALG_IDS[0],
  deltaW: DELTA_IDS[0],
}

export type AlignOne = {
  id: AlgId
  moves: number
  timeS: number
  x: number
  y: number
  excessDb: number
  distUm: number
  path: Array<{ x: number; y: number }>
}

export type AlignAnalysis = {
  mapPeakDb: number
  /** gcLossDb(w, w, 0)，教学值 4.343 dB */
  deltaWExtraDb: number
  runs: Record<AlgId, AlignOne>
  heatX: number[]
  heatY: number[]
  heatDb: number[][]
}

function hillStart(rangeUm: number) {
  return { startX: -rangeUm, startY: -rangeUm }
}

function traceRaster(rangeUm: number, step: number) {
  const n = Math.max(0, Math.floor(rangeUm / step + 1e-9))
  const path: Array<{ x: number; y: number }> = []
  for (let iy = -n; iy <= n; iy += 1) {
    for (let ix = -n; ix <= n; ix += 1) path.push({ x: ix * step, y: iy * step })
  }
  return path
}

function traceSpiral(map: CouplingMap, rangeUm: number, step: number) {
  const dirs: Array<[number, number]> = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ]
  let x = 0
  let y = 0
  let best = map.read(0, 0)
  const path = [{ x, y }]
  let moves = 1
  let dir = 0
  let leg = 1
  let legLeft = 1
  let legsAtLen = 0
  let ring = 0
  let lastImprove = 0
  const maxMoves = Math.ceil((2 * rangeUm) / step + 1) ** 2 + 4
  while (moves < maxMoves) {
    const nx = x + dirs[dir][0] * step
    const ny = y + dirs[dir][1] * step
    if (Math.abs(nx) > rangeUm + 1e-6 || Math.abs(ny) > rangeUm + 1e-6) break
    x = nx
    y = ny
    const reading = map.read(x, y)
    moves += 1
    path.push({ x, y })
    if (reading > best) {
      best = reading
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
  return path
}

function traceHill(map: CouplingMap, startX: number, startY: number, step0: number) {
  let x = startX
  let y = startY
  let step = step0
  let best = map.read(x, y)
  const path = [{ x, y }]
  let moves = 1
  const minStep = step0 / 32
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
      path.push({ x: cx, y: cy })
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
  return path
}

function finish(id: AlgId, map: CouplingMap, x: number, y: number, moves: number, timeS: number, path: Array<{ x: number; y: number }>): AlignOne {
  return {
    id,
    moves,
    timeS,
    x,
    y,
    excessDb: excessLossDb(map, x, y),
    distUm: Math.hypot(x - map.x0, y - map.y0),
    path,
  }
}

export function analyseAlign(state: AlignState): AlignAnalysis {
  const map = couplingMap({
    x0: PEAK_X,
    y0: PEAK_Y,
    wUm: state.wUm,
    peakDb: -state.l0Db,
    noiseDb: state.noiseDb,
    seed: ALIGN_SEED,
  })
  const move = { range: state.rangeUm, step: state.stepUm, moveTimeS: state.moveS }
  const raster = alignRaster(map, move)
  const spiral = alignSpiral(map, move)
  const start = hillStart(state.rangeUm)
  const hill = alignHillClimb(map, { ...start, step0: state.stepUm, moveTimeS: state.moveS })
  const heatX: number[] = []
  const heatY: number[] = []
  const n = HEAT_N
  for (let i = 0; i < n; i += 1) {
    heatX.push(-state.rangeUm + (2 * state.rangeUm * i) / (n - 1))
    heatY.push(-state.rangeUm + (2 * state.rangeUm * i) / (n - 1))
  }
  const heatDb = heatY.map((y) => heatX.map((x) => map.read(x, y)))
  return {
    mapPeakDb: map.peakDb,
    deltaWExtraDb: gcLossDb(state.wUm, state.wUm, 0),
    runs: {
      raster: finish('raster', map, raster.x, raster.y, raster.moves, raster.timeS, traceRaster(state.rangeUm, state.stepUm)),
      spiral: finish('spiral', map, spiral.x, spiral.y, spiral.moves, spiral.timeS, traceSpiral(map, state.rangeUm, state.stepUm)),
      hill: finish('hill', map, hill.x, hill.y, hill.moves, hill.timeS, traceHill(map, start.startX, start.startY, state.stepUm)),
    },
    heatX,
    heatY,
    heatDb,
  }
}

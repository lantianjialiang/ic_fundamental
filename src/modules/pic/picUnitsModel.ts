import { lambdaToTHz, linkBudgetDbm, mw } from './core/photonics'

export const LOSS_IDS = ['gcIn', 'wg', 'mod', 'gcOut'] as const
export type LossId = (typeof LOSS_IDS)[number]

export const NODE_IDS = ['laser', 'gcIn', 'wg', 'mod', 'gcOut'] as const
export type NodeId = (typeof NODE_IDS)[number]

export const MW3_IDS = ['off', 'on'] as const
export type Mw3Id = (typeof MW3_IDS)[number]

export type UnitsState = {
  laserDbm: number
  gcInDb: number
  lengthCm: number
  lossDbPerCm: number
  modDb: number
  gcOutDb: number
  lambdaNm: number
  mw3: Mw3Id
  lossPick: LossId
}

export const DEFAULT_UNITS: UnitsState = {
  laserDbm: 0,
  gcInDb: 3,
  lengthCm: 1,
  lossDbPerCm: 2.5,
  modDb: 4,
  gcOutDb: 3,
  lambdaNm: 1310,
  mw3: MW3_IDS[0],
  lossPick: LOSS_IDS[0],
}

export type UnitsNode = { id: NodeId; dbm: number; mw: number }

export type UnitsAnalysis = {
  parts: Record<LossId, number>
  total: number
  arrival: number
  freqTHz: number
  best: LossId
  nodes: UnitsNode[]
  mw3: number
  task1: boolean
  task2: boolean
  task3: boolean
  task4: boolean
}

export function fmtDbm(value: number): string {
  return value.toFixed(2)
}

export function fmtMw(value: number): string {
  if (value >= 10) return value.toFixed(2)
  if (value >= 0.01) return value.toFixed(3)
  return value.toExponential(2)
}

export function analyseUnits(state: UnitsState): UnitsAnalysis {
  const wgDb = state.lengthCm * state.lossDbPerCm
  const parts: Record<LossId, number> = {
    gcIn: state.gcInDb,
    wg: wgDb,
    mod: state.modDb,
    gcOut: state.gcOutDb,
  }
  const losses = LOSS_IDS.map((id) => parts[id])
  const prefixes: number[][] = [[], [parts.gcIn], [parts.gcIn, parts.wg], [parts.gcIn, parts.wg, parts.mod], losses]
  const nodes: UnitsNode[] = NODE_IDS.map((id, index) => {
    const dbm = linkBudgetDbm(state.laserDbm, prefixes[index])
    return { id, dbm, mw: mw(dbm) }
  })
  const arrival = nodes[nodes.length - 1].dbm
  const total = losses.reduce((sum, loss) => sum + loss, 0)
  let best: LossId = LOSS_IDS[0]
  for (const id of LOSS_IDS) if (parts[id] > parts[best]) best = id
  const freqTHz = lambdaToTHz(state.lambdaNm)
  const mw3 = mw(-3)
  const target = linkBudgetDbm(10, [3, 0.5 * 2.5, 4, 3])
  const task2 =
    Math.abs(state.laserDbm - 10) < 0.01 &&
    Math.abs(state.gcInDb - 3) < 0.01 &&
    Math.abs(state.lengthCm - 0.5) < 0.011 &&
    Math.abs(state.lossDbPerCm - 2.5) < 0.01 &&
    Math.abs(state.modDb - 4) < 0.01 &&
    Math.abs(state.gcOutDb - 3) < 0.01 &&
    Math.abs(arrival - target) < 0.02
  return {
    parts,
    total,
    arrival,
    freqTHz,
    best,
    nodes,
    mw3,
    task1: Math.abs(freqTHz - 193.4) <= 0.1,
    task2,
    task3: state.mw3 === 'on' && Math.abs(mw3 - 0.501) < 0.01,
    task4: parts[state.lossPick] === parts[best],
  }
}
